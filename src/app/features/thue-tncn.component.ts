import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../shared/mobile-header.component';
import { InfoModalComponent } from '../shared/info-modal.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyInputDirective } from './currency-input.directive';
import { TaxParamsService, TaxParams } from './tax-params.service';
import { Subscription } from 'rxjs';

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
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MobileHeaderComponent,
    InfoModalComponent,
  ],
})
export class ThueTncnComponent implements OnInit, OnDestroy {
  thueForm!: FormGroup;
  netToGrossForm!: FormGroup;

  // Tham số từ CSV
  taxParams: TaxParams | null = null;
  paramsLastUpdate: Date | null = null;
  
  // Modal states
  isInfoModalOpen = false;
  
  private subscriptions: Subscription[] = [];

  // Hằng số định mức 2026 (sẽ được thay thế bằng CSV)
  readonly TY_LE_BHXH = 0.105; // 10.5% (BHXH + BHYT + BHTN)
  readonly LUONG_BHXH_TOI_DA = 46800000; // Mức lương tối đa đóng BHXH 2026

  // Biến kết quả cho tính GROSS → NET
  tienBaoHiem = 0;
  giamTruPhuThuoc = 0;
  thuNhapTinhThue = 0;
  thueChiTiet: any[] = [];
  thuePhaiNop = 0;
  luongNet = 0;

  // Biến kết quả cho tính NET → GROSS
  grossFromNet = 0;
  bhxhFromNet = 0;
  thueFromNet = 0;
  netToGrossDetails: any[] = [];

  constructor(
    private fb: FormBuilder,
    private taxParamsService: TaxParamsService
  ) {}

  ngOnInit() {
    this.loadTaxParams();

    // Form tính GROSS → NET
    this.thueForm = this.fb.group({
      grossSalary: [60000000],
      dependents: [2],
      insuranceSalary: [null], // Để null, sẽ dùng grossSalary nếu không nhập
    });

    // Form tính NET → GROSS
    this.netToGrossForm = this.fb.group({
      netSalary: [45000000],
      dependents: [2],
      insuranceSalary: [null],
    });

    // Lắng nghe thay đổi
    this.thueForm.valueChanges.subscribe(() => {
      this.calculateGrossToNet();
    });

    this.netToGrossForm.valueChanges.subscribe(() => {
      this.calculateNetToGross();
    });

    // Tính lần đầu
    this.calculateGrossToNet();
    this.calculateNetToGross();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Modal methods
  openInfoModal() {
    this.isInfoModalOpen = true;
  }

  closeInfoModal() {
    this.isInfoModalOpen = false;
  }

  private loadTaxParams(): void {
    const paramsSub = this.taxParamsService.getParams().subscribe(params => {
      this.taxParams = params;
      if (params) {
        // Tính lại khi có tham số mới
        this.calculateGrossToNet();
        this.calculateNetToGross();
      }
    });

    const updateSub = this.taxParamsService.getLastUpdate().subscribe(date => {
      this.paramsLastUpdate = date;
    });

    this.subscriptions.push(paramsSub, updateSub);
  }

  // Getter cho các tham số từ CSV
  private get GIAM_TRU_BAN_THAN(): number {
    return this.taxParams?.personalDeduction || 11000000;
  }

  private get GIAM_TRU_PHU_THUOC(): number {
    return this.taxParams?.dependentDeduction || 4400000;
  }

  private get TAX_TIERS(): any[] {
    if (!this.taxParams?.tiers) {
      // Fallback nếu chưa load được CSV
      return [
        { limit: 5000000, rate: 5, range: 'Đến 5 triệu' },
        { limit: 10000000, rate: 10, range: 'Trên 5tr - 10tr' },
        { limit: 18000000, rate: 15, range: 'Trên 10tr - 18tr' },
        { limit: 32000000, rate: 20, range: 'Trên 18tr - 32tr' },
        { limit: 52000000, rate: 25, range: 'Trên 32tr - 52tr' },
        { limit: 80000000, rate: 30, range: 'Trên 52tr - 80tr' },
        { limit: Infinity, rate: 35, range: 'Trên 80 triệu' },
      ];
    }

    return this.taxParams.tiers.map(tier => ({
      limit: tier.max === 999999999 ? Infinity : tier.max,
      rate: tier.rate * 100, // Convert từ 0.05 thành 5
      range: this.getTierRangeText(tier)
    }));
  }

  private getTierRangeText(tier: any): string {
    const formatMillion = (amount: number) => {
      if (amount === 0) return '0';
      if (amount >= 1000000) return `${amount / 1000000}tr`;
      return amount.toLocaleString();
    };

    if (tier.max === 999999999) {
      return `Trên ${formatMillion(tier.min)}`;
    }
    if (tier.min === 0) {
      return `Đến ${formatMillion(tier.max)}`;
    }
    return `Trên ${formatMillion(tier.min)} - ${formatMillion(tier.max)}`;
  }

  // Tính từ GROSS → NET (sử dụng tham số từ CSV)
  calculateGrossToNet() {
    const formVal = this.thueForm.getRawValue();
    const gross = this.parseNumber(formVal.grossSalary);
    const dependents = formVal.dependents || 0;
    const insuranceBase = this.parseNumber(formVal.insuranceSalary) || gross;

    // 1. Bảo hiểm (cập nhật mức tối đa 2026)
    const validBhSalary = Math.min(insuranceBase, this.LUONG_BHXH_TOI_DA);
    this.tienBaoHiem = validBhSalary * this.TY_LE_BHXH;

    // 2. Giảm trừ
    this.giamTruPhuThuoc = dependents * this.GIAM_TRU_PHU_THUOC;

    // 3. Thu nhập tính thuế
    const tntt = gross - this.tienBaoHiem - this.GIAM_TRU_BAN_THAN - this.giamTruPhuThuoc;
    this.thuNhapTinhThue = tntt > 0 ? tntt : 0;

    // 4. Tính thuế lũy tiến (sử dụng tham số từ CSV)
    const taxBrackets = this.TAX_TIERS;

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

      return { ...b, tax: tax, amount: amountAtThisLevel };
    });

    this.thuePhaiNop = totalTax;
    this.luongNet = gross - this.tienBaoHiem - this.thuePhaiNop;
  }

  // Tính từ NET → GROSS (logic mới)
  calculateNetToGross() {
    const formVal = this.netToGrossForm.getRawValue();
    const targetNet = this.parseNumber(formVal.netSalary);
    const dependents = formVal.dependents || 0;
    const customInsuranceBase = this.parseNumber(formVal.insuranceSalary);

    if (targetNet <= 0) {
      this.grossFromNet = 0;
      this.bhxhFromNet = 0;
      this.thueFromNet = 0;
      this.netToGrossDetails = [];
      return;
    }

    // Sử dụng binary search để tìm GROSS
    let low = targetNet;
    let high = targetNet * 3; // Ước tính GROSS tối đa
    let bestGross = 0;
    let iterations = 0;
    const maxIterations = 50;

    while (low <= high && iterations < maxIterations) {
      const midGross = Math.floor((low + high) / 2);
      const result = this.calculateNetFromGross(midGross, dependents, customInsuranceBase);
      
      if (Math.abs(result.net - targetNet) < 1000) { // Sai số dưới 1000 VND
        bestGross = midGross;
        break;
      }
      
      if (result.net < targetNet) {
        low = midGross + 1;
      } else {
        high = midGross - 1;
        bestGross = midGross;
      }
      
      iterations++;
    }

    // Tính chi tiết cho GROSS tìm được
    const finalResult = this.calculateNetFromGross(bestGross, dependents, customInsuranceBase);
    this.grossFromNet = bestGross;
    this.bhxhFromNet = finalResult.bhxh;
    this.thueFromNet = finalResult.tax;
    this.netToGrossDetails = finalResult.taxDetails;
  }

  // Helper function: tính NET từ GROSS cho thuật toán binary search (sử dụng tham số từ CSV)
  private calculateNetFromGross(gross: number, dependents: number, customInsuranceBase?: number): any {
    const insuranceBase = customInsuranceBase || gross;
    const validBhSalary = Math.min(insuranceBase, this.LUONG_BHXH_TOI_DA);
    const bhxh = validBhSalary * this.TY_LE_BHXH;
    
    const giamTruPT = dependents * this.GIAM_TRU_PHU_THUOC;
    const tntt = Math.max(0, gross - bhxh - this.GIAM_TRU_BAN_THAN - giamTruPT);
    
    // Tính thuế (sử dụng tham số từ CSV)
    const taxBrackets = this.TAX_TIERS;

    let remaining = tntt;
    let prevLimit = 0;
    let totalTax = 0;
    const taxDetails: any[] = [];

    for (const bracket of taxBrackets) {
      const currentLevelCap = bracket.limit - prevLimit;
      const amountAtThisLevel = Math.max(0, Math.min(remaining, currentLevelCap));
      const tax = amountAtThisLevel * (bracket.rate / 100);

      remaining -= amountAtThisLevel;
      prevLimit = bracket.limit;
      totalTax += tax;

      taxDetails.push({ 
        ...bracket, 
        tax: tax, 
        amount: amountAtThisLevel 
      });
    }

    const net = gross - bhxh - totalTax;
    
    return {
      net,
      bhxh,
      tax: totalTax,
      taxDetails,
      taxableIncome: tntt
    };
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

  formatTaxTiers(): string {
    if (!this.taxParams?.tiers) return '5%, 10%, 15%, 20%, 25%, 30%, 35%';
    return this.taxParams.tiers.map(t => (t.rate * 100) + '%').join(', ');
  }

  // Hàm copy kết quả từ tab này sang tab kia
  copyGrossToNetTab() {
    this.netToGrossForm.patchValue({
      netSalary: this.luongNet,
      dependents: this.thueForm.get('dependents')?.value,
      insuranceSalary: this.thueForm.get('insuranceSalary')?.value
    });
  }

  copyNetToGrossTab() {
    this.thueForm.patchValue({
      grossSalary: this.grossFromNet,
      dependents: this.netToGrossForm.get('dependents')?.value,
      insuranceSalary: this.netToGrossForm.get('insuranceSalary')?.value
    });
  }
}
