import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CurrencyInputDirective } from './currency-input.directive';

interface TaxResult {
  taxAmount: number;
  totalAmount: number;
  details: { [key: string]: number | boolean };
  breakdown: string[];
}

interface PropertyType {
  code: string;
  name: string;
  landUseTaxRate: number; // %/năm
  transferTaxRate: number; // %
  registrationFeeRate: number; // %
}

@Component({
  selector: 'app-real-estate-tax',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    CurrencyInputDirective
  ],
  templateUrl: './real-estate-tax.component.html',
  styleUrls: ['./real-estate-tax.component.scss']
})
export class RealEstateTaxComponent implements OnInit {
  landUseTaxForm!: FormGroup;
  transferTaxForm!: FormGroup;
  registrationFeeForm!: FormGroup;

  landUseTaxResult: TaxResult = { taxAmount: 0, totalAmount: 0, details: {}, breakdown: [] };
  transferTaxResult: TaxResult = { taxAmount: 0, totalAmount: 0, details: {}, breakdown: [] };
  registrationFeeResult: TaxResult = { taxAmount: 0, totalAmount: 0, details: {}, breakdown: [] };

  // Loại bất động sản và thuế suất
  propertyTypes: PropertyType[] = [
    { code: 'residential', name: 'Nhà ở', landUseTaxRate: 0.03, transferTaxRate: 2.0, registrationFeeRate: 0.5 },
    { code: 'commercial', name: 'Thương mại', landUseTaxRate: 0.07, transferTaxRate: 2.0, registrationFeeRate: 0.5 },
    { code: 'industrial', name: 'Công nghiệp', landUseTaxRate: 0.05, transferTaxRate: 2.0, registrationFeeRate: 0.5 },
    { code: 'agricultural', name: 'Nông nghiệp', landUseTaxRate: 0.01, transferTaxRate: 2.0, registrationFeeRate: 0.5 },
    { code: 'office', name: 'Văn phòng', landUseTaxRate: 0.08, transferTaxRate: 2.0, registrationFeeRate: 0.5 },
    { code: 'warehouse', name: 'Kho bãi', landUseTaxRate: 0.04, transferTaxRate: 2.0, registrationFeeRate: 0.5 }
  ];

  // Khu vực và hệ số điều chỉnh
  locationTypes = [
    { code: 'urban_1', name: 'Đô thị loại 1 (HN, HCM)', coefficient: 1.5 },
    { code: 'urban_2', name: 'Đô thị loại 2', coefficient: 1.3 },
    { code: 'urban_3', name: 'Đô thị loại 3', coefficient: 1.1 },
    { code: 'rural', name: 'Nông thôn', coefficient: 1.0 },
    { code: 'remote', name: 'Vùng sâu vùng xa', coefficient: 0.8 }
  ];

  // Mục đích sử dụng đất
  landUsePurposes = [
    { code: 'residential', name: 'Đất ở', exemptionArea: 200 }, // m2 miễn thuế
    { code: 'commercial', name: 'Đất thương mại', exemptionArea: 0 },
    { code: 'industrial', name: 'Đất công nghiệp', exemptionArea: 0 },
    { code: 'agricultural', name: 'Đất nông nghiệp', exemptionArea: 1000 },
    { code: 'office', name: 'Đất văn phòng', exemptionArea: 0 }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForms();
  }

  private initForms() {
    // Form thuế sử dụng đất
    this.landUseTaxForm = this.fb.group({
      landArea: [200, [Validators.required, Validators.min(1)]],
      landPrice: [50000000, [Validators.required, Validators.min(1000)]],
      propertyType: ['residential', Validators.required],
      location: ['urban_3', Validators.required],
      landUsePurpose: ['residential', Validators.required],
      ownershipYears: [1, [Validators.required, Validators.min(1)]]
    });

    // Form thuế chuyển nhượng
    this.transferTaxForm = this.fb.group({
      salePrice: [3000000000, [Validators.required, Validators.min(1000)]],
      originalPrice: [2000000000, [Validators.required, Validators.min(1000)]],
      propertyType: ['residential', Validators.required],
      ownershipYears: [3, [Validators.required, Validators.min(1)]],
      improvementCosts: [100000000, Validators.min(0)],
      sellingCosts: [50000000, Validators.min(0)]
    });

    // Form lệ phí trước bạ
    this.registrationFeeForm = this.fb.group({
      propertyValue: [2500000000, [Validators.required, Validators.min(1000)]],
      propertyType: ['residential', Validators.required],
      transactionType: ['purchase', Validators.required],
      isFirstTime: [true]
    });

    // Listen to form changes
    this.landUseTaxForm.valueChanges.subscribe(() => this.calculateLandUseTax());
    this.transferTaxForm.valueChanges.subscribe(() => this.calculateTransferTax());
    this.registrationFeeForm.valueChanges.subscribe(() => this.calculateRegistrationFee());

    // Initial calculations
    this.calculateLandUseTax();
    this.calculateTransferTax();
    this.calculateRegistrationFee();
  }

  calculateLandUseTax() {
    const formValue = this.landUseTaxForm.getRawValue();
    const landArea = this.parseNumber(formValue.landArea);
    const landPrice = this.parseNumber(formValue.landPrice);
    const propertyType = this.propertyTypes.find(p => p.code === formValue.propertyType);
    const location = this.locationTypes.find(l => l.code === formValue.location);
    const landUsePurpose = this.landUsePurposes.find(p => p.code === formValue.landUsePurpose);
    const ownershipYears = this.parseNumber(formValue.ownershipYears);

    if (!propertyType || !location || !landUsePurpose || landArea <= 0 || landPrice <= 0) {
      this.landUseTaxResult = { taxAmount: 0, totalAmount: 0, details: {}, breakdown: [] };
      return;
    }

    // Tính diện tích chịu thuế (trừ diện tích miễn thuế)
    const taxableArea = Math.max(0, landArea - landUsePurpose.exemptionArea);
    
    // Giá trị đất chịu thuế
    const taxableValue = (taxableArea / landArea) * landPrice;
    
    // Thuế suất cơ bản
    const baseTaxRate = propertyType.landUseTaxRate / 100;
    
    // Hệ số điều chỉnh theo khu vực
    const locationCoefficient = location.coefficient;
    
    // Thuế suất thực tế
    const actualTaxRate = baseTaxRate * locationCoefficient;
    
    // Thuế sử dụng đất hàng năm
    const annualTax = taxableValue * actualTaxRate;
    
    // Tổng thuế theo số năm
    const totalTax = annualTax * ownershipYears;

    this.landUseTaxResult = {
      taxAmount: totalTax,
      totalAmount: landPrice + totalTax,
      details: {
        landArea: landArea,
        taxableArea: taxableArea,
        exemptArea: landUsePurpose.exemptionArea,
        landPrice: landPrice,
        taxableValue: taxableValue,
        baseTaxRate: baseTaxRate * 100,
        locationCoefficient: locationCoefficient,
        actualTaxRate: actualTaxRate * 100,
        annualTax: annualTax,
        ownershipYears: ownershipYears
      },
      breakdown: [
        `Diện tích đất: ${this.formatNumber(landArea)} m²`,
        `Diện tích miễn thuế: ${this.formatNumber(landUsePurpose.exemptionArea)} m²`,
        `Diện tích chịu thuế: ${this.formatNumber(taxableArea)} m²`,
        `Giá đất: ${this.formatCurrency(landPrice)} VND`,
        `Giá trị chịu thuế: ${this.formatCurrency(taxableValue)} VND`,
        `Thuế suất cơ bản: ${(baseTaxRate * 100).toFixed(2)}%`,
        `Hệ số khu vực: ${locationCoefficient}`,
        `Thuế suất thực tế: ${(actualTaxRate * 100).toFixed(2)}%`,
        `Thuế hàng năm: ${this.formatCurrency(annualTax)} VND`,
        `Số năm: ${ownershipYears} năm`,
        `Tổng thuế: ${this.formatCurrency(totalTax)} VND`
      ]
    };
  }

  calculateTransferTax() {
    const formValue = this.transferTaxForm.getRawValue();
    const salePrice = this.parseNumber(formValue.salePrice);
    const originalPrice = this.parseNumber(formValue.originalPrice);
    const ownershipYears = this.parseNumber(formValue.ownershipYears);
    const improvementCosts = this.parseNumber(formValue.improvementCosts);
    const sellingCosts = this.parseNumber(formValue.sellingCosts);

    if (salePrice <= 0 || originalPrice <= 0) {
      this.transferTaxResult = { taxAmount: 0, totalAmount: 0, details: {}, breakdown: [] };
      return;
    }

    // Lợi nhuận từ chuyển nhượng
    const capitalGain = salePrice - originalPrice - improvementCosts - sellingCosts;
    
    // Thuế suất dựa trên thời gian nắm giữ
    let taxRate = 0.20; // 20% mặc định
    
    if (ownershipYears >= 5) {
      taxRate = 0.10; // 10% nếu nắm giữ >= 5 năm
    } else if (ownershipYears >= 2) {
      taxRate = 0.15; // 15% nếu nắm giữ >= 2 năm
    }

    // Miễn thuế nếu là nhà ở duy nhất và nắm giữ >= 2 năm
    const isResidential = formValue.propertyType === 'residential';
    const isExempt = isResidential && ownershipYears >= 2 && capitalGain <= 0;

    const taxAmount = isExempt ? 0 : Math.max(0, capitalGain * taxRate);
    const netProceeds = salePrice - taxAmount - sellingCosts;

    this.transferTaxResult = {
      taxAmount: taxAmount,
      totalAmount: netProceeds,
      details: {
        salePrice: salePrice,
        originalPrice: originalPrice,
        improvementCosts: improvementCosts,
        sellingCosts: sellingCosts,
        capitalGain: capitalGain,
        taxRate: taxRate * 100,
        ownershipYears: ownershipYears,
        isExempt: isExempt
      },
      breakdown: [
        `Giá bán: ${this.formatCurrency(salePrice)} VND`,
        `Giá mua ban đầu: ${this.formatCurrency(originalPrice)} VND`,
        `Chi phí cải tạo: ${this.formatCurrency(improvementCosts)} VND`,
        `Chi phí bán: ${this.formatCurrency(sellingCosts)} VND`,
        `Lợi nhuận: ${this.formatCurrency(capitalGain)} VND`,
        `Thời gian nắm giữ: ${ownershipYears} năm`,
        `Thuế suất: ${(taxRate * 100).toFixed(1)}%`,
        isExempt ? `✅ Được miễn thuế (nhà ở >= 2 năm)` : `Thuế phải nộp: ${this.formatCurrency(taxAmount)} VND`,
        `Số tiền thực nhận: ${this.formatCurrency(netProceeds)} VND`
      ]
    };
  }

  calculateRegistrationFee() {
    const formValue = this.registrationFeeForm.getRawValue();
    const propertyValue = this.parseNumber(formValue.propertyValue);
    const propertyType = this.propertyTypes.find(p => p.code === formValue.propertyType);
    const isFirstTime = formValue.isFirstTime;
    const transactionType = formValue.transactionType;

    if (!propertyType || propertyValue <= 0) {
      this.registrationFeeResult = { taxAmount: 0, totalAmount: 0, details: {}, breakdown: [] };
      return;
    }

    // Lệ phí trước bạ cơ bản
    let baseFeeRate = propertyType.registrationFeeRate / 100;
    
    // Giảm 50% cho lần đầu mua nhà ở
    if (propertyType.code === 'residential' && isFirstTime && transactionType === 'purchase') {
      baseFeeRate = baseFeeRate * 0.5;
    }

    // Lệ phí trước bạ
    const registrationFee = propertyValue * baseFeeRate;
    
    // Các khoản phí khác
    const documentFee = 100000; // Phí thẩm định hồ sơ
    const certificateFee = 500000; // Phí cấp giấy chứng nhận
    const notaryFee = propertyValue * 0.001; // 0.1% công chứng
    
    const totalFees = registrationFee + documentFee + certificateFee + notaryFee;
    const totalAmount = propertyValue + totalFees;

    this.registrationFeeResult = {
      taxAmount: totalFees,
      totalAmount: totalAmount,
      details: {
        propertyValue: propertyValue,
        baseFeeRate: baseFeeRate * 100,
        registrationFee: registrationFee,
        documentFee: documentFee,
        certificateFee: certificateFee,
        notaryFee: notaryFee,
        isFirstTime: isFirstTime,
        discount: isFirstTime && propertyType.code === 'residential' ? 50 : 0
      },
      breakdown: [
        `Giá trị BDS: ${this.formatCurrency(propertyValue)} VND`,
        `Thuế suất lệ phí: ${(baseFeeRate * 100).toFixed(2)}%`,
        isFirstTime && propertyType.code === 'residential' ? `✅ Giảm 50% cho lần đầu mua nhà ở` : '',
        `Lệ phí trước bạ: ${this.formatCurrency(registrationFee)} VND`,
        `Phí thẩm định hồ sơ: ${this.formatCurrency(documentFee)} VND`,
        `Phí cấp giấy CN: ${this.formatCurrency(certificateFee)} VND`,
        `Phí công chứng: ${this.formatCurrency(notaryFee)} VND`,
        `Tổng các khoản phí: ${this.formatCurrency(totalFees)} VND`,
        `Tổng chi phí: ${this.formatCurrency(totalAmount)} VND`
      ].filter(item => item !== '')
    };
  }

  private parseNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') {
      const cleanVal = val.replace(/[^0-9.]/g, '');
      return cleanVal ? parseFloat(cleanVal) : 0;
    }
    return Number(val);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(Math.round(value));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  getDetailNumber(details: { [key: string]: number | boolean }, key: string): number {
    const value = details[key];
    return typeof value === 'number' ? value : 0;
  }

  // Quick preset buttons
  setLandPreset(preset: string) {
    const presets: { [key: string]: any } = {
      'small_house': { landArea: 100, landPrice: 2000000000, propertyType: 'residential', location: 'urban_3' },
      'medium_house': { landArea: 200, landPrice: 4000000000, propertyType: 'residential', location: 'urban_2' },
      'large_house': { landArea: 500, landPrice: 8000000000, propertyType: 'residential', location: 'urban_1' },
      'commercial': { landArea: 300, landPrice: 10000000000, propertyType: 'commercial', location: 'urban_1' }
    };

    if (presets[preset]) {
      this.landUseTaxForm.patchValue(presets[preset]);
    }
  }

  setTransferPreset(preset: string) {
    const presets: { [key: string]: any } = {
      'profit': { salePrice: 3000000000, originalPrice: 2000000000, ownershipYears: 3, improvementCosts: 100000000 },
      'loss': { salePrice: 1800000000, originalPrice: 2000000000, ownershipYears: 2, improvementCosts: 50000000 },
      'long_term': { salePrice: 4000000000, originalPrice: 2500000000, ownershipYears: 6, improvementCosts: 200000000 }
    };

    if (presets[preset]) {
      this.transferTaxForm.patchValue(presets[preset]);
    }
  }
}