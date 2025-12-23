import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { CurrencyInputDirective } from './currency-input.directive';

@Component({
  selector: 'app-thue-tncn',
  templateUrl: './thue-tncn.component.html',
  styleUrls: ['./thue-tncn.component.scss'],
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
export class ThueTncnComponent implements OnInit {
  thueForm!: FormGroup;

  // Các hằng số định mức dự kiến 2026 (Ví dụ minh họa)
  readonly GIAM_TRU_BAN_THAN = 15000000; // Tăng lên 15tr
  readonly GIAM_TRU_PHU_THUOC = 5500000; // Tăng lên 5.5tr
  readonly TY_LE_BHXH = 0.105; // 8% BHXH + 1.5% BHYT + 1% BHTN

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.thueForm = this.fb.group({
      grossSalary: [20000000],
      dependents: [0],
      insuranceSalary: [null],
    });
  }

  get tienBaoHiem(): number {
    const gross = this.parseNumber(this.thueForm.value.grossSalary);
    const bhSalary =
      this.parseNumber(this.thueForm.value.insuranceSalary) || gross;
    // Mức lương đóng BH tối đa thường là 20 lần lương cơ sở (Giả định lương cơ sở 2.34tr -> Max 46.8tr)
    const validBhSalary = Math.min(bhSalary, 46800000);
    return validBhSalary * this.TY_LE_BHXH;
  }

  get giamTruPhuThuoc(): number {
    return (this.thueForm.value.dependents || 0) * this.GIAM_TRU_PHU_THUOC;
  }

  get thuNhapTinhThue(): number {
    const gross = this.parseNumber(this.thueForm.value.grossSalary);
    const val =
      gross - this.tienBaoHiem - this.GIAM_TRU_BAN_THAN - this.giamTruPhuThuoc;
    return val > 0 ? val : 0;
  }

  get thueChiTiet() {
    const tntt = this.thuNhapTinhThue;
    // Biểu thuế lũy tiến từng phần dự kiến 2026 (Rút gọn còn 5 bậc)
    const taxBrackets = [
      { limit: 5000000, rate: 5, range: 'Đến 5tr' },
      { limit: 10000000, rate: 10, range: 'Trên 5tr - 10tr' },
      { limit: 18000000, rate: 15, range: 'Trên 10tr - 18tr' },
      { limit: 32000000, rate: 20, range: 'Trên 18tr - 32tr' },
      { limit: Infinity, rate: 25, range: 'Trên 32tr' },
    ];

    let remaining = tntt;
    let prevLimit = 0;

    return taxBrackets.map((b) => {
      const currentLevelCap = b.limit - prevLimit;
      const amountAtThisLevel = Math.max(
        0,
        Math.min(remaining, currentLevelCap)
      );
      const tax = amountAtThisLevel * (b.rate / 100);
      remaining -= amountAtThisLevel;
      prevLimit = b.limit;
      return { ...b, amount: amountAtThisLevel, tax: tax };
    });
  }

  get thuePhaiNop(): number {
    return this.thueChiTiet.reduce((sum, item) => sum + item.tax, 0);
  }

  get luongNet(): number {
    const gross = this.parseNumber(this.thueForm.value.grossSalary);
    return gross - this.tienBaoHiem - this.thuePhaiNop;
  }

  formatCurrency(val: any): string {
    return new Intl.NumberFormat('vi-VN').format(Math.round(val || 0));
  }

  private parseNumber(val: any): number {
    if (typeof val === 'string') return Number(val.replace(/[^0-9]/g, ''));
    return Number(val);
  }
}
