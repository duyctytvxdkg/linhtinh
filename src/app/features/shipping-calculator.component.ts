import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CurrencyInputDirective } from './currency-input.directive';
import { ShippingPriceService, ShippingPriceData } from './shipping-price.service';
import { Subscription } from 'rxjs';

interface ShippingResult {
  provider: string;
  providerName: string;
  logo: string;
  standardFee: number;
  expressFee: number;
  standardTime: string;
  expressTime: string;
  features: string[];
  discount?: number;
  finalStandardFee: number;
  finalExpressFee: number;
}

interface Province {
  code: string;
  name: string;
  zone: number; // 1: Nội thành, 2: Ngoại thành, 3: Tỉnh lẻ
}

interface WeightTier {
  min: number;
  max: number;
  name: string;
}

@Component({
  selector: 'app-shipping-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatCheckboxModule,
    CurrencyInputDirective
  ],
  templateUrl: './shipping-calculator.component.html',
  styleUrls: ['./shipping-calculator.component.scss']
})
export class ShippingCalculatorComponent implements OnInit, OnDestroy {
  shippingForm!: FormGroup;
  shippingResults: ShippingResult[] = [];
  priceData: ShippingPriceData[] = [];
  lastUpdate: Date | null = null;
  
  private subscriptions: Subscription[] = [];

  // Danh sách tỉnh thành
  provinces: Province[] = [
    // Nội thành (Zone 1)
    { code: 'HCM', name: 'TP. Hồ Chí Minh', zone: 1 },
    { code: 'HN', name: 'Hà Nội', zone: 1 },
    { code: 'DN', name: 'Đà Nẵng', zone: 1 },
    
    // Ngoại thành (Zone 2)
    { code: 'BD', name: 'Bình Dương', zone: 2 },
    { code: 'DN_DONG', name: 'Đồng Nai', zone: 2 },
    { code: 'BR_VT', name: 'Bà Rịa - Vũng Tàu', zone: 2 },
    { code: 'HY', name: 'Hưng Yên', zone: 2 },
    { code: 'HD', name: 'Hải Dương', zone: 2 },
    { code: 'HP', name: 'Hải Phòng', zone: 2 },
    
    // Tỉnh lẻ (Zone 3)
    { code: 'CT', name: 'Cần Thơ', zone: 3 },
    { code: 'NT', name: 'Nha Trang', zone: 3 },
    { code: 'DL', name: 'Đà Lạt', zone: 3 },
    { code: 'QN', name: 'Quảng Nam', zone: 3 },
    { code: 'TH', name: 'Thanh Hóa', zone: 3 },
    { code: 'NA', name: 'Nghệ An', zone: 3 },
    { code: 'AG', name: 'An Giang', zone: 3 },
    { code: 'KG', name: 'Kiên Giang', zone: 3 },
    { code: 'BT', name: 'Bến Tre', zone: 3 },
    { code: 'TV', name: 'Trà Vinh', zone: 3 }
  ];

  // Phân loại trọng lượng
  weightTiers: WeightTier[] = [
    { min: 0, max: 0.5, name: 'Dưới 500g' },
    { min: 0.5, max: 1, name: '500g - 1kg' },
    { min: 1, max: 2, name: '1kg - 2kg' },
    { min: 2, max: 5, name: '2kg - 5kg' },
    { min: 5, max: 10, name: '5kg - 10kg' },
    { min: 10, max: 20, name: '10kg - 20kg' },
    { min: 20, max: 50, name: 'Trên 20kg' }
  ];

  // Loại hàng hóa
  itemTypes = [
    { code: 'normal', name: 'Hàng thường', multiplier: 1.0 },
    { code: 'fragile', name: 'Hàng dễ vỡ', multiplier: 1.2 },
    { code: 'liquid', name: 'Chất lỏng', multiplier: 1.3 },
    { code: 'electronics', name: 'Điện tử', multiplier: 1.1 },
    { code: 'food', name: 'Thực phẩm', multiplier: 1.15 },
    { code: 'documents', name: 'Giấy tờ', multiplier: 0.9 }
  ];

  constructor(
    private fb: FormBuilder,
    private shippingPriceService: ShippingPriceService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadPriceData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadPriceData() {
    // Subscribe to price data
    const priceDataSub = this.shippingPriceService.getPriceData().subscribe(data => {
      this.priceData = data;
      if (data.length > 0) {
        this.calculateShipping();
      }
    });

    // Subscribe to last update date
    const lastUpdateSub = this.shippingPriceService.getLastUpdate().subscribe(date => {
      this.lastUpdate = date;
    });

    this.subscriptions.push(priceDataSub, lastUpdateSub);
  }

  private initForm() {
    this.shippingForm = this.fb.group({
      fromProvince: ['HCM', Validators.required],
      toProvince: ['HN', Validators.required],
      weight: [1, [Validators.required, Validators.min(0.1)]],
      itemValue: [500000, [Validators.required, Validators.min(1000)]],
      itemType: ['normal', Validators.required],
      isInsured: [false],
      isCOD: [false],
      codAmount: [0, Validators.min(0)]
    });

    // Listen to form changes
    this.shippingForm.valueChanges.subscribe(() => {
      this.calculateShipping();
    });

    // Enable/disable COD amount based on COD checkbox
    this.shippingForm.get('isCOD')?.valueChanges.subscribe(isCOD => {
      const codAmountControl = this.shippingForm.get('codAmount');
      if (isCOD) {
        codAmountControl?.enable();
        codAmountControl?.setValidators([Validators.required, Validators.min(1000)]);
      } else {
        codAmountControl?.disable();
        codAmountControl?.setValue(0);
        codAmountControl?.clearValidators();
      }
      codAmountControl?.updateValueAndValidity();
    });
  }

  calculateShipping() {
    if (this.priceData.length === 0) {
      this.shippingResults = [];
      return;
    }

    const formValue = this.shippingForm.getRawValue();
    const weight = this.parseNumber(formValue.weight);
    const itemValue = this.parseNumber(formValue.itemValue);
    const codAmount = this.parseNumber(formValue.codAmount);
    
    const fromZone = this.provinces.find(p => p.code === formValue.fromProvince)?.zone || 1;
    const toZone = this.provinces.find(p => p.code === formValue.toProvince)?.zone || 1;
    const itemType = this.itemTypes.find(t => t.code === formValue.itemType);
    
    if (weight <= 0 || !itemType) {
      this.shippingResults = [];
      return;
    }

    // Tính khoảng cách zone (ảnh hưởng đến giá)
    const zoneDistance = Math.abs(fromZone - toZone) + 1;
    const typeMultiplier = itemType.multiplier;

    this.shippingResults = this.priceData.map(providerData => 
      this.calculateProviderFee(
        providerData, 
        weight, 
        zoneDistance, 
        typeMultiplier, 
        itemValue, 
        formValue.isInsured, 
        formValue.isCOD, 
        codAmount,
        toZone
      )
    );

    // Sắp xếp theo giá thấp nhất
    this.shippingResults.sort((a, b) => a.finalStandardFee - b.finalStandardFee);
  }

  private calculateProviderFee(
    providerData: ShippingPriceData,
    weight: number,
    zoneDistance: number,
    typeMultiplier: number,
    itemValue: number,
    isInsured: boolean,
    isCOD: boolean,
    codAmount: number,
    toZone: number
  ): ShippingResult {
    // Tính phí cơ bản từ CSV data
    const baseFee = providerData.baseFee;
    const distanceFee = zoneDistance * providerData.distanceFeePerZone;
    const weightFee = weight > providerData.weightFreeLimit ? 
      (weight - providerData.weightFreeLimit) * providerData.weightFeePerKg : 0;
    
    let standardFee = (baseFee + distanceFee + weightFee) * typeMultiplier;
    let expressFee = standardFee * providerData.expressMultiplier;

    // Phí bảo hiểm
    if (isInsured) {
      const insuranceFee = itemValue * providerData.insuranceRate;
      standardFee += insuranceFee;
      expressFee += insuranceFee;
    }

    // Phí COD
    if (isCOD) {
      const codFee = Math.max(providerData.codMinFee, codAmount * providerData.codRate);
      standardFee += codFee;
      expressFee += codFee;
    }

    // Áp dụng discount nếu có
    const discount = standardFee * providerData.discount;
    const finalStandardFee = standardFee - discount;
    const finalExpressFee = expressFee - discount;

    // Chọn thời gian giao hàng theo zone
    let standardTime = providerData.standardTimeZone1;
    let expressTime = providerData.expressTimeZone1;
    
    if (toZone === 2) {
      standardTime = providerData.standardTimeZone2;
      expressTime = providerData.expressTimeZone2;
    } else if (toZone === 3) {
      standardTime = providerData.standardTimeZone3;
      expressTime = providerData.expressTimeZone3;
    }

    return {
      provider: providerData.provider,
      providerName: providerData.providerName,
      logo: providerData.logo,
      standardFee: standardFee,
      expressFee: expressFee,
      standardTime: standardTime,
      expressTime: expressTime,
      features: providerData.features,
      discount: discount > 0 ? discount : undefined,
      finalStandardFee: finalStandardFee,
      finalExpressFee: finalExpressFee
    };
  }

  refreshPriceData() {
    this.shippingPriceService.refreshPriceData();
  }

  getLastUpdateText(): string {
    if (!this.lastUpdate) return 'Chưa xác định';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần trước`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng trước`;
    }
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

  getBestDeal(): ShippingResult | null {
    if (this.shippingResults.length === 0) return null;
    return this.shippingResults[0]; // Already sorted by price
  }

  getWorstDeal(): ShippingResult | null {
    if (this.shippingResults.length === 0) return null;
    return this.shippingResults[this.shippingResults.length - 1];
  }

  getSavings(): number {
    const best = this.getBestDeal();
    const worst = this.getWorstDeal();
    if (!best || !worst) return 0;
    return worst.finalStandardFee - best.finalStandardFee;
  }

  // Quick preset buttons
  setQuickPreset(preset: string) {
    const presets: { [key: string]: any } = {
      'local_light': { fromProvince: 'HCM', toProvince: 'BD', weight: 0.5, itemValue: 200000, itemType: 'normal' },
      'local_heavy': { fromProvince: 'HCM', toProvince: 'BD', weight: 5, itemValue: 1000000, itemType: 'electronics' },
      'national_light': { fromProvince: 'HCM', toProvince: 'HN', weight: 1, itemValue: 500000, itemType: 'normal' },
      'national_heavy': { fromProvince: 'HCM', toProvince: 'CT', weight: 10, itemValue: 2000000, itemType: 'fragile' },
      'documents': { fromProvince: 'HN', toProvince: 'DN', weight: 0.2, itemValue: 50000, itemType: 'documents' },
      'food': { fromProvince: 'HCM', toProvince: 'HN', weight: 2, itemValue: 300000, itemType: 'food' }
    };

    if (presets[preset]) {
      this.shippingForm.patchValue(presets[preset]);
    }
  }
}