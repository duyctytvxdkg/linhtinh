import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
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

import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CurrencyInputDirective } from './currency-input.directive';
import { MatRadioModule } from '@angular/material/radio';

Chart.register(...registerables);

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
  return roundedValue.toLocaleString('en-EN');
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
    CurrencyInputDirective,
    MatRadioModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loan.component.html',
      styleUrls: ['./loan.component.scss'],
})
export class LoanComponent implements OnInit {
  form!: FormGroup;

  @ViewChild('paymentChart') chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  viewInitialized = false;
  chartVisible = false;

  pageSize = 12;
  currentPage = 0;

  fullSchedule: AmortizationItem[] = [];
  pagedSchedule: AmortizationItem[] = [];

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

  currencyFormat = currencyFormat;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.viewInitialized = true;

    // nếu đã có data trước đó thì render
    if (this.pagedSchedule?.length) {
      this.renderChart();
    }

    this.form = this.fb.group({
      principal: [100_000_000, [Validators.required, Validators.min(1)]],
      annualRate: [11.99, [Validators.required, Validators.min(0)]],
      termMonths: [48, [Validators.required, Validators.min(1)]],
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

    this.chartVisible = true;

    // ⬇️ QUAN TRỌNG: đợi Angular render DOM xong
    setTimeout(() => this.renderChart());
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

    this.fullSchedule = schedule;
    this.setPage(0); // luôn về trang đầu khi tính lại
  }

  setPage(page: number): void {
    if (page < 0) return;

    const maxPage = this.totalPages - 1;
    if (page > maxPage) return;

    this.currentPage = page;

    const start = page * this.pageSize;
    const end = start + this.pageSize;

    this.pagedSchedule = this.fullSchedule.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.fullSchedule.length / this.pageSize);
  }

  private resetResult(): void {
    this.monthlyPayment = 0;
    this.totalInterest = 0;
    this.totalPayment = 0;
    this.fullSchedule = [];
    this.pagedSchedule = [];
  }

  renderChart() {

  if (!this.chartRef) return;

  const ctx = this.chartRef.nativeElement.getContext('2d');
  if (!ctx) return;

  // 🔥 QUAN TRỌNG: destroy chart cũ
  if (this.chart) {
    this.chart.destroy();
  }

    const labels = this.fullSchedule.map((x) => `T${x.period}`);
    const principal = this.fullSchedule.map((x) => x.principalPaid);
    const interest = this.fullSchedule.map((x) => x.interestPaid);

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Gốc',
            data: principal,
            backgroundColor: '#3b82f6',
          },
          {
            label: 'Lãi',
            data: interest,
            backgroundColor: '#f59e0b',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => new Intl.NumberFormat('vi-VN').format(Number(v)),
            },
          },
        },
      },
    });
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.fullSchedule);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'PaymentSchedule');

    const excelBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, 'lich-thanh-toan.xlsx');
  }
}
