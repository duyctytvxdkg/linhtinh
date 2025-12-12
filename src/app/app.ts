import { ChangeDetectionStrategy, Component, signal, computed, OnInit, effect, OnDestroy } from '@angular/core';

// --- FUNCTIONS & ICONS ---

/**
 * Hàm định dạng số sang tiền tệ VND
 * Sử dụng định dạng quốc tế (ngăn cách hàng nghìn bằng dấu ',') và không có số lẻ.
 * @param amount - Số tiền cần định dạng
 * @returns Chuỗi định dạng VND (ví dụ: "1,000,000,000 VND")
 */
const formatVND = (amount: number | null): string => {
    if (amount === null || isNaN(amount)) return 'N/A';
    // Sử dụng locale 'en-US' để có dấu ',' làm dấu phân cách hàng nghìn
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(amount)) + ' VND';
};

// SVG Icons (Thay thế cho thư viện react-icons/lu)
const ICON_HOME = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const ICON_CALCULATOR = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="8" y1="18" y2="18"/><line x1="16" x2="16" y1="18" y2="18"/><line x1="12" x2="12" y1="18" y2="18"/><line x1="12" x2="12" y1="10" y2="10"/><line x1="8" x2="8" y1="14" y2="14"/><line x1="16" x2="16" y1="14" y2="14"/><line x1="12" x2="12" y1="14" y2="14"/></svg>`;
const ICON_MENU = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="18" y2="18"/></svg>`;

// --- NEW ICONS ---
const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>`;
const ICON_WAVES = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/><path d="M2 12s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/><path d="M2 4s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/></svg>`;


// --- INTERFACES ---
interface LoanSummary {
    monthlyPayment: number;
    totalAmountPaid: number;
    totalInterest: number;
}

interface LoanScheduleItem {
    period: number;
    startingBalance: number;
    principalPayment: number;
    interestPayment: number;
    endingBalance: number;
}


// --- LOAN CALCULATOR COMPONENT LOGIC ---

/**
 * Đây là logic tính toán lãi vay. Được đóng gói trong một class để dễ quản lý.
 */
class LoanCalculatorLogic {
    // Inputs (Signals)
    principal = signal(1000000000);
    annualRate = signal(12);
    years = signal(35);
    error = signal('');

    // Outputs (Signals)
    summary = signal<LoanSummary | null>(null);
    schedule = signal<LoanScheduleItem[]>([]);

    constructor() {
        // Tự động tính toán lại mỗi khi inputs thay đổi (reactive effect)
        effect(() => {
            this.calculatePayment();
        }, { allowSignalWrites: true });
    }

    /**
     * Hàm xử lý việc thay đổi input (đảm bảo input là số hợp lệ)
     */
    handleInputChange(setter: (value: number) => void, event: Event) {
        const input = event.target as HTMLInputElement;
        const value = parseFloat(input.value) || 0;
        setter(value);
    }

    /**
     * Logic tính toán khoản vay và lịch trả nợ
     */
    calculatePayment(): void {
        const p = this.principal();
        const r = this.annualRate();
        const y = this.years();

        this.error.set('');
        
        // 1. Validation
        if (p <= 0) {
            this.error.set("Vui lòng nhập Số tiền vay gốc hợp lệ (> 0).");
            this.summary.set(null);
            this.schedule.set([]);
            return;
        }
        if (r <= 0 || r > 100) {
            this.error.set("Vui lòng nhập Lãi suất hàng năm hợp lệ (trong khoảng 0-100%).");
            this.summary.set(null);
            this.schedule.set([]);
            return;
        }
        if (y <= 0 || y > 100) {
            this.error.set("Vui lòng nhập Thời hạn vay hợp lệ (từ 1 đến 100 năm).");
            this.summary.set(null);
            this.schedule.set([]);
            return;
        }

        // 2. Tính toán PMT
        const monthlyRate = (r / 100) / 12; 
        const totalPayments = y * 12; 
        
        let monthlyPayment: number;
        if (monthlyRate === 0) {
            monthlyPayment = p / totalPayments;
        } else {
            const numerator = monthlyRate * Math.pow(1 + monthlyRate, totalPayments);
            const denominator = Math.pow(1 + monthlyRate, totalPayments) - 1;
            monthlyPayment = p * (numerator / denominator);
        }

        const totalAmountPaid = monthlyPayment * totalPayments;
        const totalInterest = totalAmountPaid - p;
        
        this.summary.set({ monthlyPayment, totalAmountPaid, totalInterest });

        // 3. Tạo lịch trả góp chi tiết
        let balance = p;
        const newSchedule: LoanScheduleItem[] = [];
        
        for (let i = 1; i <= totalPayments; i++) {
            const startingBalance = balance;
            const interestPayment = startingBalance * monthlyRate;
            let principalPayment = monthlyPayment - interestPayment;
            
            // Điều chỉnh cho kỳ cuối cùng
            if (i === totalPayments) {
                principalPayment = startingBalance;
            } else if (startingBalance < principalPayment) {
                 principalPayment = startingBalance;
            }
            
            const endingBalance = startingBalance - principalPayment;
            balance = Math.max(0, endingBalance);

            newSchedule.push({
                period: i,
                startingBalance: startingBalance,
                principalPayment: principalPayment,
                interestPayment: interestPayment,
                endingBalance: balance,
            });
            
            if (balance <= 0) {
                 break;
            }
        }
        
        this.schedule.set(newSchedule);
    }
}

// --- ANGULAR APP COMPONENT ---

@Component({
    selector: 'app-root',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
            <!-- Header / Menu Bar -->
            <header class="bg-indigo-800 shadow-md sticky top-0 z-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo / Tên App -->
                        <div class="flex-shrink-0">
                            <span class="text-2xl font-bold text-white tracking-wide">
                                CÔNG CỤ NHỎ
                            </span>
                        </div>

                        <!-- Desktop Navigation -->
                        <nav class="hidden md:flex space-x-4">
                            <a href="#home" (click)="setPath('home')"
                               [class]="getNavLinkClass('home')">
                                <span [innerHTML]="ICON_HOME" class="w-5 h-5 mr-2"></span>
                                Trang Chủ
                            </a>
                            <a href="#calculator" (click)="setPath('calculator')"
                               [class]="getNavLinkClass('calculator')">
                                <span [innerHTML]="ICON_CALCULATOR" class="w-5 h-5 mr-2"></span>
                                Tính Lãi Vay
                            </a>
                            <a href="#lunar" (click)="setPath('lunar')"
                               [class]="getNavLinkClass('lunar')">
                                <span [innerHTML]="ICON_MOON" class="w-5 h-5 mr-2"></span>
                                Lịch âm
                            </a>
                            <a href="#tide" (click)="setPath('tide')"
                               [class]="getNavLinkClass('tide')">
                                <span [innerHTML]="ICON_WAVES" class="w-5 h-5 mr-2"></span>
                                Thủy triều
                            </a>
                        </nav>

                        <!-- Mobile Menu Button -->
                        <button class="md:hidden p-2 rounded-md text-indigo-200 hover:bg-indigo-700"
                                (click)="isMenuOpen.set(!isMenuOpen())">
                            <span [innerHTML]="ICON_MENU" class="w-6 h-6"></span>
                        </button>
                    </div>
                </div>

                <!-- Mobile Menu -->
                @if (isMenuOpen()) {
                    <div class="md:hidden px-4 pt-2 pb-3 space-y-2">
                        <a href="#home" (click)="setPath('home')"
                           [class]="getNavLinkClass('home', true)">
                            <span [innerHTML]="ICON_HOME" class="w-5 h-5 mr-2"></span>
                            Trang Chủ
                        </a>
                        <a href="#calculator" (click)="setPath('calculator')"
                           [class]="getNavLinkClass('calculator', true)">
                            <span [innerHTML]="ICON_CALCULATOR" class="w-5 h-5 mr-2"></span>
                            Tính Lãi Vay
                        </a>
                        <a href="#lunar" (click)="setPath('lunar')"
                           [class]="getNavLinkClass('lunar', true)">
                            <span [innerHTML]="ICON_MOON" class="w-5 h-5 mr-2"></span>
                            Lịch âm
                        </a>
                        <a href="#tide" (click)="setPath('tide')"
                           [class]="getNavLinkClass('tide', true)">
                            <span [innerHTML]="ICON_WAVES" class="w-5 h-5 mr-2"></span>
                            Thủy triều
                        </a>
                    </div>
                }
            </header>

            <!-- Main Content -->
            <main class="flex-grow p-4">
                @switch (path()) {
                    @case ('calculator') {
                        <!-- Loan Calculator Page -->
                        <div class="max-w-7xl mx-auto p-4 md:p-8">
                            <h2 class="text-3xl font-bold text-indigo-700 mb-6 border-b pb-2">Tính Toán Lãi Vay Trả Góp</h2>

                            <!-- Input Form -->
                            <div class="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div class="space-y-1">
                                    <label for="principal" class="block text-sm font-medium text-gray-700">Số tiền vay gốc (VND)</label>
                                    <input type="number" id="principal" [value]="calculator.principal()" (change)="calculator.handleInputChange(calculator.principal.set, $event)"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div class="space-y-1">
                                    <label for="rate" class="block text-sm font-medium text-gray-700">Lãi suất hàng năm (%)</label>
                                    <input type="number" id="rate" [value]="calculator.annualRate()" (change)="calculator.handleInputChange(calculator.annualRate.set, $event)" min="0.1" step="0.1"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div class="space-y-1">
                                    <label for="years" class="block text-sm font-medium text-gray-700">Thời hạn vay (Năm)</label>
                                    <input type="number" id="years" [value]="calculator.years()" (change)="calculator.handleInputChange(calculator.years.set, $event)" min="1"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <button (click)="calculator.calculatePayment()" [disabled]="!!calculator.error()"
                                        class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Tính Toán
                                </button>
                            </div>

                            @if (calculator.error()) {
                                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6">
                                    <strong class="font-bold">Lỗi: </strong>
                                    <span class="block sm:inline">{{ calculator.error() }}</span>
                                </div>
                            }
                            
                            <!-- Summary Results -->
                            @if (calculator.summary() && !calculator.error()) {
                                <div id="results" class="mt-6 border-t pt-6">
                                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Kết Quả Tóm Tắt</h3>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        <!-- Monthly Payment -->
                                        <div class="p-4 bg-indigo-100 rounded-xl shadow-inner">
                                            <span class="text-sm font-medium text-gray-700 block">Trả hàng tháng ước tính:</span>
                                            <span class="text-2xl font-extrabold text-indigo-800">{{ formatVND(calculator.summary()!.monthlyPayment) }}</span>
                                        </div>
                                        <!-- Total Payments -->
                                        <div class="p-4 bg-gray-100 rounded-xl shadow-inner">
                                            <span class="text-sm font-medium text-gray-600 block">Tổng số tiền đã trả:</span>
                                            <span class="text-xl font-semibold text-gray-800">{{ formatVND(calculator.summary()!.totalAmountPaid) }}</span>
                                        </div>
                                        <!-- Total Interest Paid -->
                                        <div class="p-4 bg-red-100 rounded-xl shadow-inner">
                                            <span class="text-sm font-medium text-gray-600 block">Tổng tiền lãi phải trả:</span>
                                            <span class="text-xl font-semibold text-red-800">{{ formatVND(calculator.summary()!.totalInterest) }}</span>
                                        </div>
                                    </div>
                                </div>
                            }

                            <!-- Amortization Schedule -->
                            @if (calculator.schedule().length > 0 && !calculator.error()) {
                                <div id="scheduleContainer" class="mt-8 pt-4 border-t border-gray-200">
                                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Chi Tiết Trả Góp Hàng Tháng ({{ calculator.schedule().length }} Kỳ)</h3>
                                    <div class="overflow-x-auto overflow-y-auto max-h-[400px] rounded-xl shadow-lg border"> 
                                        <table class="min-w-full divide-y divide-gray-200">
                                            <thead class="bg-indigo-600 text-white sticky top-0 z-10">
                                                <tr>
                                                    <th class="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider w-16">Kỳ</th>
                                                    <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Vốn Gốc Đầu Kỳ</th>
                                                    <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Trả Gốc</th>
                                                    <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Trả Lãi</th>
                                                    <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Dư Cuối Kỳ</th>
                                                </tr>
                                            </thead>
                                            <tbody class="bg-white divide-y divide-gray-200 text-sm">
                                                @for (item of calculator.schedule(); track item.period) {
                                                    <tr class="hover:bg-gray-50 transition duration-100">
                                                        <td class="px-3 py-2 whitespace-nowrap text-center text-gray-700">{{ item.period }}</td>
                                                        <td class="px-3 py-2 whitespace-nowrap text-right text-gray-900">{{ formatVND(item.startingBalance) }}</td>
                                                        <td class="px-3 py-2 whitespace-nowrap text-right text-green-700">{{ formatVND(item.principalPayment) }}</td>
                                                        <td class="px-3 py-2 whitespace-nowrap text-right text-red-700">{{ formatVND(item.interestPayment) }}</td>
                                                        <td class="px-3 py-2 whitespace-nowrap text-right text-gray-700 font-semibold">{{ formatVND(item.endingBalance) }}</td>
                                                    </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            }
                        </div>
                    }
                    @case ('lunar') {
                        <!-- Lịch âm Page Placeholder -->
                        <div class="max-w-4xl mx-auto p-4 md:p-8 text-center">
                            <div class="bg-white shadow-xl rounded-2xl p-10 mt-10 border-t-4 border-indigo-600">
                                <span [innerHTML]="ICON_MOON" class="mx-auto text-6xl text-indigo-500 mb-6 w-16 h-16"></span>
                                <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Lịch Âm (Đang Phát Triển)</h2>
                                <p class="text-lg text-gray-600 mb-6">
                                    Đây là nơi hiển thị lịch âm, thông tin ngày giờ âm lịch và các sự kiện liên quan.
                                </p>
                                <p class="text-md text-gray-700">
                                    Vui lòng thêm logic và giao diện hiển thị lịch âm vào đây.
                                </p>
                            </div>
                        </div>
                    }
                    @case ('tide') {
                        <!-- Thủy triều Page Placeholder -->
                        <div class="max-w-4xl mx-auto p-4 md:p-8 text-center">
                            <div class="bg-white shadow-xl rounded-2xl p-10 mt-10 border-t-4 border-indigo-600">
                                <span [innerHTML]="ICON_WAVES" class="mx-auto text-6xl text-indigo-500 mb-6 w-16 h-16"></span>
                                <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Dự Báo Thủy Triều (Đang Phát Triển)</h2>
                                <p class="text-lg text-gray-600 mb-6">
                                    Công cụ này sẽ cung cấp thông tin về giờ nước lên/xuống cho các khu vực ven biển.
                                </p>
                                <p class="text-md text-gray-700">
                                    Vui lòng thêm logic gọi API và hiển thị dữ liệu thủy triều vào đây.
                                </p>
                            </div>
                        </div>
                    }
                    @case ('home') {
                        <!-- Home Page -->
                        <div class="max-w-4xl mx-auto p-4 md:p-8 text-center">
                            <div class="bg-white shadow-xl rounded-2xl p-10 mt-10 border-t-4 border-indigo-600">
                                <span [innerHTML]="ICON_HOME" class="mx-auto text-6xl text-indigo-500 mb-6 w-16 h-16"></span>
                                <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Chào Mừng Đến Với Kho Tools</h2>
                                <p class="text-lg text-gray-600 mb-6">
                                    Đây là trang web tổng hợp các công cụ tính toán và tiện ích nhỏ.
                                </p>
                                <p class="text-md text-gray-700">
                                    Sử dụng thanh điều hướng phía trên để truy cập các công cụ: Tính Lãi Vay, Lịch âm, Thủy triều.
                                </p>
                                <div class="mt-8 space-x-4">
                                    <a href="#calculator" (click)="setPath('calculator')" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150">
                                        <span [innerHTML]="ICON_CALCULATOR" class="mr-2 h-5 w-5"></span>
                                        Tính Lãi Vay
                                    </a>
                                    <a href="#lunar" (click)="setPath('lunar')" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150">
                                        <span [innerHTML]="ICON_MOON" class="mr-2 h-5 w-5"></span>
                                        Lịch âm
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                    @default {
                        <!-- 404/Default Page -->
                        <div class="text-center p-10">
                            <h1 class="text-6xl font-bold text-gray-800">404</h1>
                            <p class="text-xl text-gray-600">Không tìm thấy trang.</p>
                        </div>
                    }
                }
            </main>

            <!-- Footer (Optional) -->
            <footer class="bg-gray-200 text-gray-600 text-center p-4 text-sm mt-8">
                &copy; {{ currentYear() }} Công Cụ Nhỏ. Được xây dựng để tối ưu hóa.
            </footer>
        </div>
    `,
})
export class App implements OnInit, OnDestroy {
    // --- Properties ---
    path = signal<string>(window.location.hash.substring(1) || 'home');
    isMenuOpen = signal(false);
    calculator = new LoanCalculatorLogic();
    currentYear = computed(() => new Date().getFullYear());
    
    // Icon accessors (for use in template)
    ICON_HOME = ICON_HOME;
    ICON_CALCULATOR = ICON_CALCULATOR;
    ICON_MENU = ICON_MENU;
    ICON_MOON = ICON_MOON;
    ICON_WAVES = ICON_WAVES;
    
    // Định nghĩa biến để lưu trữ listener
    private hashChangeListener: () => void;

    // --- Lifecycle and Initialization ---

    constructor() {
        // Gán hàm formatVND cho template sử dụng
        (this as any).formatVND = formatVND; 

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
    }

    ngOnDestroy(): void {
        // Hủy đăng ký listener khi component bị hủy
        window.removeEventListener('hashchange', this.hashChangeListener);
    }

    // --- Methods ---

    setPath(newPath: string): void {
        this.path.set(newPath);
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
