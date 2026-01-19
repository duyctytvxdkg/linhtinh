import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../shared/mobile-header.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { UtilityPriceService, ElectricityTier, WaterTier } from './utility-price.service';
import { Subscription } from 'rxjs';

interface BillResult {
  totalAmount: number;
  breakdown: Array<{
    tier: number;
    usage: number;
    price: number;
    amount: number;
    description: string;
  }>;
}

@Component({
  selector: 'app-utility-calculator',
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
    MatDividerModule
  ,
    MobileHeaderComponent
  ],
  templateUrl: './utility-calculator.component.html',
  styleUrls: ['./utility-calculator.component.scss']
})
export class UtilityCalculatorComponent implements OnInit, OnDestroy {
  electricityForm!: FormGroup;
  waterForm!: FormGroup;
  
  electricityResult: BillResult = { totalAmount: 0, breakdown: [] };
  waterResult: BillResult = { totalAmount: 0, breakdown: [] };
  
  electricityTiers: ElectricityTier[] = [];
  waterTiers: WaterTier[] = [];
  electricityLastUpdate: Date | null = null;
  waterLastUpdate: Date | null = null;
  
  private subscriptions: Subscription[] = [];

  // Make Math available in template
  Math = Math;

  // Loại khách hàng nước
  waterCategories = [
    { code: 'household', name: 'Sinh hoạt (Hộ gia đình)', icon: '🏠' },
    { code: 'business', name: 'Kinh doanh (Dịch vụ)', icon: '🏢' },
    { code: 'production', name: 'Sản xuất (Công nghiệp)', icon: '🏭' }
  ];

  // Mức sử dụng thông thường
  commonUsageLevels = {
    electricity: [
      { label: 'Tiết kiệm (1-2 người)', kwh: 80, description: 'Đèn LED, tivi, tủ lạnh nhỏ' },
      { label: 'Trung bình (3-4 người)', kwh: 150, description: 'Điều hòa 4-6h/ngày, máy giặt' },
      { label: 'Cao (4-5 người)', kwh: 250, description: 'Điều hòa 8-10h/ngày, nhiều thiết bị' },
      { label: 'Rất cao (>5 người)', kwh: 400, description: 'Điều hòa cả ngày, thiết bị công suất lớn' }
    ],
    water: [
      { label: 'Tiết kiệm (1-2 người)', m3: 8, description: 'Sử dụng tiết kiệm, không tắm bồn' },
      { label: 'Trung bình (3-4 người)', m3: 15, description: 'Sử dụng bình thường, tắm vòi sen' },
      { label: 'Cao (4-5 người)', m3: 25, description: 'Sử dụng nhiều, tắm bồn thỉnh thoảng' },
      { label: 'Rất cao (>5 người)', m3: 35, description: 'Sử dụng nhiều, tắm bồn thường xuyên' }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private utilityPriceService: UtilityPriceService
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadUtilityData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForms() {
    this.electricityForm = this.fb.group({
      kwhUsed: [150, [Validators.required, Validators.min(0)]]
    });

    this.waterForm = this.fb.group({
      m3Used: [15, [Validators.required, Validators.min(0)]],
      category: ['household', Validators.required]
    });

    // Listen to form changes
    this.electricityForm.valueChanges.subscribe(() => this.calculateElectricity());
    this.waterForm.valueChanges.subscribe(() => this.calculateWater());
  }

  private loadUtilityData() {
    // Subscribe to electricity data
    const electricitySub = this.utilityPriceService.getElectricityTiers().subscribe(tiers => {
      this.electricityTiers = tiers;
      if (tiers.length > 0) {
        this.calculateElectricity();
      }
    });

    // Subscribe to water data
    const waterSub = this.utilityPriceService.getWaterTiers().subscribe(tiers => {
      this.waterTiers = tiers;
      if (tiers.length > 0) {
        this.calculateWater();
      }
    });

    // Subscribe to last update dates
    const electricityUpdateSub = this.utilityPriceService.getElectricityLastUpdate().subscribe(date => {
      this.electricityLastUpdate = date;
    });

    const waterUpdateSub = this.utilityPriceService.getWaterLastUpdate().subscribe(date => {
      this.waterLastUpdate = date;
    });

    this.subscriptions.push(electricitySub, waterSub, electricityUpdateSub, waterUpdateSub);
  }

  calculateElectricity() {
    if (this.electricityTiers.length === 0) {
      this.electricityResult = { totalAmount: 0, breakdown: [] };
      return;
    }

    const kwhUsed = this.parseNumber(this.electricityForm.get('kwhUsed')?.value);
    if (kwhUsed <= 0) {
      this.electricityResult = { totalAmount: 0, breakdown: [] };
      return;
    }

    const result = this.utilityPriceService.calculateElectricityBill(kwhUsed);
    
    // Tính thuế GTGT 8% cho tiền điện
    const subtotal = result.totalAmount;
    const vatAmount = subtotal * 0.08; // 8% VAT
    const totalWithVat = subtotal + vatAmount;
    
    this.electricityResult = {
      totalAmount: totalWithVat,
      breakdown: result.breakdown.map(item => ({
        tier: item.tier,
        usage: item.kwh,
        price: item.price,
        amount: item.amount,
        description: item.description
      }))
    };

    // Thêm thông tin VAT vào breakdown
    this.electricityResult.breakdown.push({
      tier: 0,
      usage: 0,
      price: 0,
      amount: vatAmount,
      description: 'Thuế GTGT (8%)'
    });
  }

  calculateWater() {
    if (this.waterTiers.length === 0) {
      this.waterResult = { totalAmount: 0, breakdown: [] };
      return;
    }

    const m3Used = this.parseNumber(this.waterForm.get('m3Used')?.value);
    const category = this.waterForm.get('category')?.value as 'household' | 'business' | 'production';
    
    if (m3Used <= 0) {
      this.waterResult = { totalAmount: 0, breakdown: [] };
      return;
    }

    const result = this.utilityPriceService.calculateWaterBill(m3Used, category);
    this.waterResult = {
      totalAmount: result.totalAmount,
      breakdown: result.breakdown.map(item => ({
        tier: item.tier,
        usage: item.m3,
        price: item.price,
        amount: item.amount,
        description: item.description
      }))
    };
  }

  refreshData() {
    this.utilityPriceService.refreshUtilityData();
  }

  getLastUpdateText(date: Date | null): string {
    if (!date) return 'Chưa xác định';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
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

  formatNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  // Quick preset methods
  setElectricityPreset(kwh: number) {
    this.electricityForm.patchValue({ kwhUsed: kwh });
  }

  setWaterPreset(m3: number) {
    this.waterForm.patchValue({ m3Used: m3 });
  }

  // Get tier color for visualization
  getTierColor(tier: number): string {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[(tier - 1) % colors.length] || '#6b7280';
  }

  // Calculate total usage for display
  getTotalElectricityUsage(): number {
    return this.electricityResult.breakdown
      .filter(item => item.tier > 0) // Exclude VAT line
      .reduce((sum, item) => sum + item.usage, 0);
  }

  getTotalWaterUsage(): number {
    return this.waterResult.breakdown.reduce((sum, item) => sum + item.usage, 0);
  }

  // Get electricity subtotal (before VAT)
  getElectricitySubtotal(): number {
    return this.electricityResult.breakdown
      .filter(item => item.tier > 0) // Exclude VAT line
      .reduce((sum, item) => sum + item.amount, 0);
  }

  // Get electricity VAT amount
  getElectricityVAT(): number {
    const vatItem = this.electricityResult.breakdown.find(item => item.tier === 0);
    return vatItem ? vatItem.amount : 0;
  }

  // Get current water category name
  getCurrentWaterCategoryName(): string {
    const categoryCode = this.waterForm.get('category')?.value;
    const category = this.waterCategories.find(c => c.code === categoryCode);
    return category?.name || '';
  }

  // Filter water tiers by category
  getWaterTiersByCategory(categoryCode: string): WaterTier[] {
    return this.waterTiers.filter(t => t.category === categoryCode);
  }

  // Calculate average price per unit
  getAverageElectricityPrice(): number {
    if (this.electricityResult.totalAmount === 0) return 0;
    const totalKwh = this.electricityResult.breakdown.reduce((sum, item) => sum + item.usage, 0);
    return totalKwh > 0 ? this.electricityResult.totalAmount / totalKwh : 0;
  }

  getAverageWaterPrice(): number {
    if (this.waterResult.totalAmount === 0) return 0;
    const totalM3 = this.waterResult.breakdown.reduce((sum, item) => sum + item.usage, 0);
    return totalM3 > 0 ? this.waterResult.totalAmount / totalM3 : 0;
  }

  // Get monthly comparison
  getMonthlyComparison(currentAmount: number, type: 'electricity' | 'water'): { status: string; difference: number; percentage: number } {
    // Giả sử mức trung bình
    const averageAmounts = {
      electricity: 300000, // 300k VND
      water: 150000 // 150k VND
    };

    const average = averageAmounts[type];
    const difference = currentAmount - average;
    const percentage = average > 0 ? (difference / average) * 100 : 0;

    let status = 'normal';
    if (percentage > 20) status = 'high';
    else if (percentage < -20) status = 'low';

    return { status, difference, percentage };
  }
}