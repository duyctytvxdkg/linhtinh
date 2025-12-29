import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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
import { MatRadioModule } from '@angular/material/radio';
import { MatTable } from '@angular/material/table';
import { AfterViewInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  ],
})
export class SocialInsurranceComponent implements AfterViewInit {
  dataSource: AbstractControl[] = [];

  displayedColumns = ['from', 'to', 'salary', 'action'];

  form: FormGroup;
  result: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      gender: ['male', Validators.required],
      periods: this.fb.array([]),
    });

    this.addRow(); // ✅ 1 dòng mặc định
  }

  resetForm(): void {
    this.form.reset({ gender: 'male' });
    this.periods.clear();
    this.addRow();
    this.result = null;
  }

  ngAfterViewInit(): void {
    this.loadCSVFromAssets();
  }

  private loadCSVFromAssets(): void {
    this.http
      .get('assets/defaultvalue/bhxh.csv', { responseType: 'text' })
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

    // ❌ Chưa đủ điều kiện
    if (totalYears < 20) {
      this.result = {
        totalYears,
        eligible: false,
      };
      return;
    }

    // ✅ Bình quân lương đã điều chỉnh
    const avgSalary = totalAdjustedSalary / totalMonths;

    // % hưởng theo giới tính
    const baseYears = gender === 'male' ? 20 : 15;

    let rate = 45 + Math.max(0, totalYears - baseYears) * 2;
    rate = Math.min(rate, 75);

    // Lương hưu
    const pension = (avgSalary * rate) / 100;

    this.result = {
      totalYears,
      avgSalary: Math.round(avgSalary),
      rate,
      pension: Math.round(pension),
      eligible: true,
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
}
