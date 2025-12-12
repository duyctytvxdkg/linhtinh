import { ChangeDetectionStrategy, Component, computed, signal, OnInit, OnDestroy } from '@angular/core';

// --- Types for Loan Calculator ---

interface LoanSummary {
    monthlyPayment: number;
    totalAmountPaid: number;
    totalInterest: number;
}

interface AmortizationItem {
    period: number;
    startingBalance: number;
    principalPayment: number;
    interestPayment: number;
    endingBalance: number;
}

// --- Utility Functions ---

/**
 * Định dạng số tiền thành chuỗi VND với dấu phân cách hàng nghìn.
 */
const formatVND = (amount: number | null): string => {
    if (amount === null || isNaN(amount) || amount === Infinity) return 'N/A';
    // Sử dụng locale 'vi-VN' để có dấu '.' làm dấu phân cách hàng nghìn (hoặc 'en-US' nếu muốn dấu phẩy)
    // Dùng 'en-US' để có dấu phẩy cho dễ đọc với cấu trúc Tailwind
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(amount)) + ' VND';
};

// --- Loan Calculator Logic Class (Đảm bảo tính độc lập) ---
class LoanCalculatorLogic {
    principal = signal(100000000);
    annualRate = signal(10.5);
    years = signal(5);
    summary = signal<LoanSummary | null>(null);
    schedule = signal<AmortizationItem[]>([]);
    error = signal<string | null>(null);

    handleInputChange(setter: (value: number) => void, event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const value = parseFloat(inputElement.value);

        if (isNaN(value) || value < 0) {
             // Để Angular tự xử lý validation input type="number"
        } else {
            setter(value);
        }
        this.summary.set(null);
        this.schedule.set([]);
        this.error.set(null);
    }

    calculatePayment() {
        const P = this.principal();
        const R = this.annualRate();
        const T = this.years();

        this.error.set(null);
        this.summary.set(null);
        this.schedule.set([]);

        if (P <= 0 || R <= 0 || T <= 0) {
            this.error.set("Vui lòng nhập giá trị hợp lệ (lớn hơn 0) cho tất cả các trường.");
            return;
        }

        // Lãi suất hàng tháng (thập phân)
        const monthlyRate = (R / 100) / 12;
        // Tổng số kỳ thanh toán (tháng)
        const N = T * 12;

        // Công thức trả góp cố định hàng tháng (PITI)
        const monthlyPayment = P * monthlyRate / (1 - Math.pow(1 + monthlyRate, -N));

        if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
             this.error.set("Tính toán thất bại. Vui lòng kiểm tra lại đầu vào.");
             return;
        }

        const calculatedSchedule: AmortizationItem[] = [];
        let balance = P;
        let totalInterest = 0;

        for (let i = 1; i <= N; i++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;

            balance -= principalPayment;
            totalInterest += interestPayment;

            // Đảm bảo số dư cuối kỳ không âm (làm tròn số dư cuối kỳ về 0 nếu gần 0)
            let endingBalance = Math.max(0, balance);
            if (endingBalance < 1) endingBalance = 0;

            calculatedSchedule.push({
                period: i,
                startingBalance: Math.round(P - (monthlyPayment * (i-1) - totalInterest + interestPayment)),
                principalPayment: Math.round(principalPayment),
                interestPayment: Math.round(interestPayment),
                endingBalance: Math.round(endingBalance)
            });

            if (endingBalance === 0) break;
        }

        const totalAmountPaid = monthlyPayment * calculatedSchedule.length;
        const calculatedTotalInterest = totalAmountPaid - P;

        this.summary.set({
            monthlyPayment: Math.round(monthlyPayment),
            totalAmountPaid: Math.round(totalAmountPaid),
            totalInterest: Math.round(calculatedTotalInterest)
        });

        this.schedule.set(calculatedSchedule);
    }
}


// SVG Icons (Sử dụng inline SVG)
const ICON_HOME = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const ICON_CALCULATOR = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="8" y1="18" y2="18"/><line x1="16" x2="16" y1="18" y2="18"/><line x1="12" x2="12" y1="18" y2="18"/><line x1="12" x2="12" y1="10" y2="10"/><line x1="8" x2="8" y1="14" y2="14"/><line x1="16" x2="16" y1="14" y2="14"/><line x1="12" x2="12" y1="14" y2="14"/></svg>`;
const ICON_MENU = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="18" y2="18"/><path d="M4 18h16"></path></svg>`;
const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>`;
const ICON_WAVES = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/><path d="M2 12s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/><path d="M2 4s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/></svg>`;


@Component({
    selector: 'app-root',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app.component.html',
    imports: [],
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'multi-tool-app';
    path = signal<string>(window.location.hash.substring(1) || 'home');
    isMenuOpen = signal(false);
    calculator = new LoanCalculatorLogic();
    currentYear = computed(() => new Date().getFullYear());

    // Icons
    ICON_HOME = ICON_HOME;
    ICON_CALCULATOR = ICON_CALCULATOR;
    ICON_MENU = ICON_MENU;
    ICON_MOON = ICON_MOON;
    ICON_WAVES = ICON_WAVES;

    // Make utility function available in the template
    formatVND = formatVND;

    // Định nghĩa biến để lưu trữ listener
    private hashChangeListener: () => void;

    constructor() {
        // Khởi tạo listener cho sự kiện hashchange
        this.hashChangeListener = () => {
            const newPath = window.location.hash.substring(1) || 'home';
            this.path.set(newPath);
            this.isMenuOpen.set(false); // Đóng menu sau khi điều hướng
        };
    }

    ngOnInit(): void {
        // Đăng ký listener khi component được khởi tạo
        window.addEventListener('hashchange', this.hashChangeListener);

        // Cập nhật path ban đầu dựa trên hash sau khi khởi tạo
        this.path.set(window.location.hash.substring(1) || 'home');
    }

    ngOnDestroy(): void {
        // Hủy đăng ký listener khi component bị hủy
        window.removeEventListener('hashchange', this.hashChangeListener);
    }

    // --- Methods ---

    setPath(newPath: string): void {
        // Cập nhật hash trong URL và signal
        window.location.hash = '#' + newPath;
        // setPath sẽ được kích hoạt bởi hashchange listener sau khi hash được cập nhật,
        // nhưng chúng ta vẫn có thể set thủ công để đảm bảo phản hồi nhanh
        this.path.set(newPath);
        this.isMenuOpen.set(false); // Đóng menu mobile
    }

    /**
     * Trả về chuỗi class Tailwind cho NavLink dựa trên trạng thái active
     */
    getNavLinkClass(linkPath: string, isMobile: boolean = false): string {
        const base = 'flex items-center px-4 py-2 rounded-lg transition duration-150 text-sm font-medium';
        const active = 'bg-indigo-700 text-white shadow-lg';
        const inactive = 'text-indigo-200 hover:bg-indigo-600 hover:text-white';
        const mobileBase = isMobile ? 'w-full' : '';

        return `${base} ${mobileBase} ${this.path() === linkPath ? active : inactive}`;
    }
}
