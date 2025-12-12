import { effect, signal } from '@angular/core';

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


export  class LoanCalculatorLogic {
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
