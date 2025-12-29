import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button'; // Thêm để dùng mat-raised-button
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
    MatButtonModule
  ],
})
export class ThueTncnComponent implements OnInit {
  thueForm!: FormGroup;

  // Hằng số định mức
  readonly GIAM_TRU_BAN_THAN = 15000000;
  readonly GIAM_TRU_PHU_THUOC = 5500000;
  readonly TY_LE_BHXH = 0.105;

  // Các biến chứa kết quả (Thay cho Getter)
  tienBaoHiem = 0;
  giamTruPhuThuoc = 0;
  thuNhapTinhThue = 0;
  thueChiTiet: any[] = [];
  thuePhaiNop = 0;
  luongNet = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.thueForm = this.fb.group({
      grossSalary: [60000000],
      dependents: [2],
      insuranceSalary: [30690000],
    });

    // Lắng nghe thay đổi của form để tính toán - TRÁNH TREO MÁY
    this.thueForm.valueChanges.subscribe(() => {
      this.calculateAll();
    });

    // Tính lần đầu tiên
    this.calculateAll();
  }

  calculateAll() {
    const formVal = this.thueForm.getRawValue();
    const gross = this.parseNumber(formVal.grossSalary);
    const dependents = formVal.dependents || 0;
    const insuranceBase = this.parseNumber(formVal.insuranceSalary) || gross;

    // 1. Bảo hiểm
    const validBhSalary = Math.min(insuranceBase, 46800000);
    this.tienBaoHiem = validBhSalary * this.TY_LE_BHXH;

    // 2. Giảm trừ
    this.giamTruPhuThuoc = dependents * this.GIAM_TRU_PHU_THUOC;

    // 3. Thu nhập tính thuế
    const tntt = gross - this.tienBaoHiem - this.GIAM_TRU_BAN_THAN - this.giamTruPhuThuoc;
    this.thuNhapTinhThue = tntt > 0 ? tntt : 0;

    // 4. Tính thuế lũy tiến (Logic chuẩn, không gây loop)
    const taxBrackets = [
      { limit: 5000000, rate: 5, range: 'Đến 5tr' },
      { limit: 10000000, rate: 10, range: 'Trên 5tr - 10tr' },
      { limit: 18000000, rate: 15, range: 'Trên 10tr - 18tr' },
      { limit: 32000000, rate: 20, range: 'Trên 18tr - 32tr' },
      { limit: Infinity, rate: 25, range: 'Trên 32tr' },
    ];

    let remaining = this.thuNhapTinhThue;
    let prevLimit = 0;
    let totalTax = 0;

    this.thueChiTiet = taxBrackets.map((b) => {
      const currentLevelCap = b.limit - prevLimit;
      const amountAtThisLevel = Math.max(0, Math.min(remaining, currentLevelCap));
      const tax = amountAtThisLevel * (b.rate / 100);

      remaining -= amountAtThisLevel;
      prevLimit = b.limit;
      totalTax += tax;

      return { ...b, tax: tax };
    });

    this.thuePhaiNop = totalTax;
    this.luongNet = gross - this.tienBaoHiem - this.thuePhaiNop;
  }

  formatCurrency(val: any): string {
    return new Intl.NumberFormat('vi-VN').format(Math.round(val || 0));
  }

  private parseNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') {
      const cleanVal = val.replace(/[^0-9]/g, '');
      return cleanVal ? parseInt(cleanVal, 10) : 0;
    }
    return Number(val);
  }
}
