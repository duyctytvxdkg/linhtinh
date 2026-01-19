import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CurrencyInputDirective } from './currency-input.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MobileHeaderComponent } from '../shared/mobile-header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTable } from '@angular/material/table';
import { AfterViewInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BhxhParamsService, BhxhParams } from './bhxh-params.service';
import { Subscription } from 'rxjs';

// Hệ số điều chỉnh tiền lương BHXH (áp dụng năm 2025)
const ADJUSTMENT_FACTORS: Record<number, number> = {
  // Trước 1995 dùng riêng 5.63
  1995: 4.78,
  1996: 4.51,
  1997: 4.37,
  1998: 4.06,
  1999: 3.89,
  2000: 3.95,
  2001: 3.97,
  2002: 3.82,
  2003: 3.7,
  2004: 3.43,
  2005: 3.17,
  2006: 2.95,
  2007: 2.72,
  2008: 2.21,
  2009: 2.07,
  2010: 1.9,
  2011: 1.6,
  2012: 1.47,
  2013: 1.37,
  2014: 1.32,
  2015: 1.31,
  2016: 1.28,
  2017: 1.23,
  2018: 1.19,
  2019: 1.16,
  2020: 1.12,
  2021: 1.1,
  2022: 1.07,
  2023: 1.04,
  2024: 1.0,
  2025: 1.0,
};

@Component({
  selector: 'app-social-insurrnace',
  templateUrl: './socialinsurrance.component.html',
  styleUrls: ['./socialinsurrance.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    CurrencyInputDirective,
    MatRadioModule,
    MatTabsModule,
    MatSelectModule,
    MatButtonModule,
    MobileHeaderComponent,
  ],
})
export class SocialInsurranceComponent implements AfterViewInit, OnInit, OnDestroy {
  bhxhParams: BhxhParams | null = null;
  paramsLastUpdate: Date | null = null;
  private subscriptions: Subscription[] = [];

  dataSource: AbstractControl[] = [];

  displayedColumns = ['from', 'to', 'salary', 'action'];

  form: FormGroup;
  unemploymentForm: FormGroup;
  result: any;
  unemploymentResult: any;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private bhxhParamsService: BhxhParamsService
  ) {
    this.form = this.fb.group({
      gender: ['male', Validators.required],
      periods: this.fb.array([]),
    });

    this.unemploymentForm = this.fb.group({
      monthsContributed: [24, [Validators.required, Validators.min(1)]],
      averageSalary: [15000000, [Validators.required, Validators.min(1)]],
      reasonForLeaving: ['involuntary', Validators.required]
    });

    this.addRow(); // ✅ 1 dòng mặc định
  }

  resetForm(): void {
    this.form.reset({ gender: 'male' });
    this.periods.clear();
    this.addRow();
    this.result = null;
  }

  ngOnInit(): void {
    this.loadBhxhParams();
    
    // Listen to unemployment form changes
    this.unemploymentForm.valueChanges.subscribe(() => {
      if (this.bhxhParams) {
        this.calculateUnemployment();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadBhxhParams(): void {
    const paramsSub = this.bhxhParamsService.getParams().subscribe(params => {
      this.bhxhParams = params;
      if (params) {
        // Tính lại khi có tham số mới
        this.calculate();
        this.calculateUnemployment();
      }
    });

    const updateSub = this.bhxhParamsService.getLastUpdate().subscribe(date => {
      this.paramsLastUpdate = date;
    });

    this.subscriptions.push(paramsSub, updateSub);
  }

  ngAfterViewInit(): void {
    this.loadCSVFromAssets();
  }

  private loadCSVFromAssets(): void {
    this.http
      .get('assets/defaultvalue/bhxh-sample.csv', { responseType: 'text' })
      .subscribe((text) => {
        this.parseCSV(text);
      });
  }

  private parseCSV(text: string): void {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    this.periods.clear();

    for (let i = 1; i < lines.length; i++) {
      const [from, to, salary] = lines[i].split(',');

      this.periods.push(
        this.fb.group({
          from: [from, Validators.required],
          to: [to, Validators.required],
          salary: [Number(salary), Validators.required],
        })
      );
    }

    this.dataSource = [...this.periods.controls];
  }

  get periods(): FormArray {
    return this.form.get('periods') as FormArray;
  }

  addRow(): void {
    this.periods.push(
      this.fb.group({
        from: ['', Validators.required],
        to: ['', Validators.required],
        salary: [null, Validators.required],
      })
    );

    this.dataSource = [...this.periods.controls];
  }

  removeRow(index: number): void {
    this.periods.removeAt(index);
    this.dataSource = [...this.periods.controls];
  }

  calculate(): void {
    if (!this.bhxhParams) {
      console.error('BHXH parameters not loaded');
      return;
    }

    const gender = this.form.value.gender;
    const periods = this.form.value.periods;

    let totalMonths = 0;
    let totalAdjustedSalary = 0;

    periods.forEach((p: any) => {
      if (!p.from || !p.to || !p.salary) return;

      const from = new Date(p.from);
      const to = new Date(p.to);

      // Tính số tháng đóng
      const months =
        (to.getFullYear() - from.getFullYear()) * 12 +
        (to.getMonth() - from.getMonth()) +
        1;

      if (months <= 0) return;

      totalMonths += months;

      // Lấy hệ số trượt giá theo năm bắt đầu
      const fromYear = from.getFullYear();
      const factor =
        ADJUSTMENT_FACTORS[fromYear] ?? (fromYear < 1995 ? 5.63 : 1);

      // Lương đã điều chỉnh
      totalAdjustedSalary += months * p.salary * factor;
    });

    const totalYears = +(totalMonths / 12).toFixed(2);

    // ❌ Chưa đủ điều kiện (sử dụng tham số từ CSV)
    if (totalYears < this.bhxhParams.minContributionYears) {
      this.result = {
        totalYears,
        eligible: false,
        minYears: this.bhxhParams.minContributionYears
      };
      return;
    }

    // ✅ Bình quân lương đã điều chỉnh
    const avgSalary = totalAdjustedSalary / totalMonths;

    // % hưởng theo giới tính (sử dụng tham số từ CSV)
    const baseYears = gender === 'male' ? 20 : 15;

    // Tỷ lệ thay thế cơ bản từ CSV (45% -> replacementRate)
    let rate = this.bhxhParams.replacementRate * 100 + Math.max(0, totalYears - baseYears) * (this.bhxhParams.yearlyIncreaseRate * 100);
    rate = Math.min(rate, 75);

    // Lương hưu
    const pension = (avgSalary * rate) / 100;

    this.result = {
      totalYears,
      avgSalary: Math.round(avgSalary),
      rate,
      pension: Math.round(pension),
      eligible: true,
      retirementAge: gender === 'male' ? this.bhxhParams.retirementAgeM : this.bhxhParams.retirementAgeF
    };
  }

  calculateUnemployment(): void {
    if (!this.bhxhParams) {
      console.error('BHXH parameters not loaded');
      return;
    }

    const formVal = this.unemploymentForm.getRawValue();
    const monthsContributed = formVal.monthsContributed;
    const averageSalary = formVal.averageSalary;
    const reasonForLeaving = formVal.reasonForLeaving;

    // Kiểm tra điều kiện tối thiểu
    if (monthsContributed < this.bhxhParams.unemploymentMinMonths) {
      this.unemploymentResult = {
        eligible: false,
        minMonths: this.bhxhParams.unemploymentMinMonths,
        monthsContributed
      };
      return;
    }

    // Tính số tháng được hưởng dựa trên số tháng đóng (theo quy định thực tế)
    let monthsEligible = 0;
    if (monthsContributed >= 12 && monthsContributed < 36) {
      monthsEligible = 3;
    } else if (monthsContributed >= 36 && monthsContributed < 72) {
      monthsEligible = 6;
    } else if (monthsContributed >= 72 && monthsContributed < 144) {
      monthsEligible = 9;
    } else if (monthsContributed >= 144) {
      monthsEligible = 12;
    }

    // Giới hạn tối đa
    monthsEligible = Math.min(monthsEligible, this.bhxhParams.unemploymentMaxMonths);

    // Tỷ lệ hưởng cố định 60% theo quy định
    const benefitRate = this.bhxhParams.unemploymentRate; // 60%

    // Tính trợ cấp hàng tháng
    let monthlyBenefit = averageSalary * benefitRate;

    // Áp dụng giới hạn tối thiểu và tối đa
    monthlyBenefit = Math.max(monthlyBenefit, this.bhxhParams.unemploymentMinBenefit);
    monthlyBenefit = Math.min(monthlyBenefit, this.bhxhParams.unemploymentMaxBenefit);

    // Điều chỉnh theo lý do thôi việc (không có trong quy định chính thức, có thể bỏ)
    let adjustmentFactor = 1.0;
    if (reasonForLeaving === 'voluntary') {
      adjustmentFactor = 0.8; // Giảm 20% nếu tự ý nghỉ việc (tùy chọn)
    }

    monthlyBenefit *= adjustmentFactor;

    // Tổng số tiền được nhận
    const totalBenefit = monthlyBenefit * monthsEligible;

    this.unemploymentResult = {
      eligible: true,
      monthsContributed,
      monthsEligible,
      benefitRate: benefitRate * 100,
      monthlyBenefit: Math.round(monthlyBenefit),
      totalBenefit: Math.round(totalBenefit),
      reasonForLeaving,
      adjustmentFactor,
      averageSalary
    };
  }

  exportCSV(): void {
    const rows = this.periods.value;

    if (!rows.length) return;

    const header = ['from', 'to', 'salary'];
    const csv = [
      header.join(','),
      ...rows.map((r: any) => `${r.from},${r.to},${r.salary}`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'bhxh-periods.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  importCSV(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      this.periods.clear();

      for (let i = 1; i < lines.length; i++) {
        const [from, to, salary] = lines[i].split(',');

        this.periods.push(
          this.fb.group({
            from: [from, Validators.required],
            to: [to, Validators.required],
            salary: [Number(salary), Validators.required],
          })
        );
      }

      this.dataSource = [...this.periods.controls];
    };

    reader.readAsText(input.files[0]);
    input.value = '';
  }

  formatCurrency(val: any): string {
    return new Intl.NumberFormat('vi-VN').format(Math.round(val || 0));
  }
}
