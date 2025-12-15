import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

interface AmortizationItem {
  period: number;
  startingBalance: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

function currencyFormat(value: number): string {
  const roundedValue = Math.round(value);
  if (!roundedValue || isNaN(roundedValue) || roundedValue < 0) return '0';
  return roundedValue.toLocaleString('vi-VN');
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loan.component.html',
})
export class LoanComponent implements OnInit {
  form!: FormGroup;

  displayedColumns = [
    'period',
    'startingBalance',
    'interestPaid',
    'principalPaid',
    'endingBalance',
  ];

  monthlyPayment = 0;
  totalInterest = 0;
  totalPayment = 0;
  amortizationSchedule: AmortizationItem[] = [];

  currencyFormat = currencyFormat;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      principal: [500_000_000, [Validators.required, Validators.min(1)]],
      annualRate: [7.5, [Validators.required, Validators.min(0)]],
      termMonths: [120, [Validators.required, Validators.min(1)]],
    });

    // ✅ TÍNH NGAY KHI LOAD
    this.calculate();

    // 🔥 Tự động tính lại khi form thay đổi
    this.form.valueChanges.subscribe(() => {
      if (this.form.valid) {
        this.calculate();
      } else {
        this.resetResult();
      }
    });

    // Tính lần đầu
    this.calculate();
  }

  private calculate(): void {
    const { principal, annualRate, termMonths } = this.form.value;

    const P = principal;
    const R = annualRate / 100 / 12;
    const N = termMonths;

    if (R === 0) {
      this.monthlyPayment = Math.round(P / N);
    } else {
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      this.monthlyPayment = Math.round(emi);
    }

    this.totalPayment = this.monthlyPayment * N;
    this.totalInterest = Math.max(0, this.totalPayment - P);

    this.buildSchedule(P, R, N);
  }

  private buildSchedule(P: number, R: number, N: number): void {
    const schedule: AmortizationItem[] = [];
    let balance = P;

    for (let i = 1; i <= N; i++) {
      const startingBalance = balance;
      const interestPaid = startingBalance * R;
      let principalPaid = this.monthlyPayment - interestPaid;
      let endingBalance = startingBalance - principalPaid;

      if (i === N || endingBalance < 1) {
        principalPaid = startingBalance;
        endingBalance = 0;
      }

      schedule.push({
        period: i,
        startingBalance,
        interestPaid,
        principalPaid,
        endingBalance,
      });

      balance = endingBalance;
      if (balance <= 0) break;
    }

    this.amortizationSchedule = schedule;
  }

  private resetResult(): void {
    this.monthlyPayment = 0;
    this.totalInterest = 0;
    this.totalPayment = 0;
    this.amortizationSchedule = [];
  }
}
