import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../shared/mobile-header.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CurrencyInputDirective } from './currency-input.directive';
import { ExchangeRateService, ApiResponse } from './exchange-rate.service';

interface ExchangeRate {
  code: string;
  name: string;
  nameVi: string;
  flag: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdate: Date;
}

interface CurrencyPair {
  from: string;
  to: string;
  amount: number;
  result: number;
}

@Component({
  selector: 'app-exchange-rate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    CurrencyInputDirective
  ,
    MobileHeaderComponent
  ],
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.scss']
})
export class ExchangeRateComponent implements OnInit, OnDestroy {
  exchangeForm!: FormGroup;
  
  isLoading = false;
  lastUpdate = new Date();
  errorMessage = '';
  isUsingRealData = false; // Đánh dấu có đang dùng dữ liệu thật không
  
  private updateSubscription?: Subscription;
  private readonly UPDATE_INTERVAL = 60000; // 60 seconds (tiết kiệm API calls)

  // Danh sách tiền tệ phổ biến
  currencies: ExchangeRate[] = [
    { code: 'USD', name: 'US Dollar', nameVi: 'Đô la Mỹ', flag: '🇺🇸', rate: 24350, change: 50, changePercent: 0.21, lastUpdate: new Date() },
    { code: 'EUR', name: 'Euro', nameVi: 'Euro', flag: '🇪🇺', rate: 26420, change: -30, changePercent: -0.11, lastUpdate: new Date() },
    { code: 'JPY', name: 'Japanese Yen', nameVi: 'Yên Nhật', flag: '🇯🇵', rate: 163.5, change: 2.1, changePercent: 1.30, lastUpdate: new Date() },
    { code: 'GBP', name: 'British Pound', nameVi: 'Bảng Anh', flag: '🇬🇧', rate: 30850, change: 120, changePercent: 0.39, lastUpdate: new Date() },
    { code: 'AUD', name: 'Australian Dollar', nameVi: 'Đô la Úc', flag: '🇦🇺', rate: 15420, change: 85, changePercent: 0.55, lastUpdate: new Date() },
    { code: 'CAD', name: 'Canadian Dollar', nameVi: 'Đô la Canada', flag: '🇨🇦', rate: 17890, change: -25, changePercent: -0.14, lastUpdate: new Date() },
    { code: 'CNY', name: 'Chinese Yuan', nameVi: 'Nhân dân tệ', flag: '🇨🇳', rate: 3365, change: -15, changePercent: -0.44, lastUpdate: new Date() },
    { code: 'KRW', name: 'South Korean Won', nameVi: 'Won Hàn Quốc', flag: '🇰🇷', rate: 17.2, change: 0.3, changePercent: 1.77, lastUpdate: new Date() },
    { code: 'THB', name: 'Thai Baht', nameVi: 'Baht Thái', flag: '🇹🇭', rate: 715, change: -5, changePercent: -0.69, lastUpdate: new Date() },
    { code: 'SGD', name: 'Singapore Dollar', nameVi: 'Đô la Singapore', flag: '🇸🇬', rate: 18150, change: 25, changePercent: 0.14, lastUpdate: new Date() }
  ];

  // Conversion result
  conversionResult: CurrencyPair = {
    from: 'USD',
    to: 'VND',
    amount: 1000,
    result: 24350000
  };

  constructor(
    private fb: FormBuilder, 
    private exchangeRateService: ExchangeRateService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadExchangeRates();
    this.startAutoUpdate();
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private initForm() {
    this.exchangeForm = this.fb.group({
      fromCurrency: ['USD'],
      toCurrency: ['VND'],
      amount: [1000]
    });

    // Listen to form changes
    this.exchangeForm.valueChanges.subscribe(() => {
      this.calculateConversion();
    });
  }

  private startAutoUpdate() {
    this.updateSubscription = interval(this.UPDATE_INTERVAL)
      .pipe(
        switchMap(() => this.exchangeRateService.getExchangeRates()),
        catchError(error => {
          console.error('Auto update failed:', error);
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) {
          this.updateRatesFromApi(data);
        }
      });
  }

  loadExchangeRates() {
    this.isLoading = true;
    this.errorMessage = '';

    this.exchangeRateService.getExchangeRates().subscribe({
      next: (data: ApiResponse) => {
        this.updateRatesFromApi(data);
        this.isLoading = false;
        
        if (data.success) {
          this.isUsingRealData = true;
          this.errorMessage = '✅ Dữ liệu tỷ giá thực từ API quốc tế';
          console.log('✅ Real exchange rates loaded successfully');
        } else {
          this.isUsingRealData = false;
          this.errorMessage = '🔄 API không khả dụng. Sử dụng dữ liệu mô phỏng chính xác.';
          console.log('⚠️ Using simulated exchange rates');
        }
      },
      error: (error) => {
        console.error('❌ Failed to load exchange rates:', error);
        this.errorMessage = '❌ Không thể tải tỷ giá. Kiểm tra kết nối mạng.';
        this.isUsingRealData = false;
        this.generateSimulatedRates();
        this.isLoading = false;
      }
    });
  }



  private updateRatesFromApi(data: any) {
    if (data && data.rates) {
      const vndRate = data.rates.VND || 24350;
      
      // Cập nhật tỷ giá dựa trên USD base
      this.currencies.forEach(currency => {
        const oldRate = currency.rate;
        
        switch (currency.code) {
          case 'USD':
            currency.rate = vndRate;
            break;
          case 'EUR':
            currency.rate = vndRate / (data.rates.EUR || 0.92);
            break;
          case 'JPY':
            currency.rate = vndRate / (data.rates.JPY || 149);
            break;
          case 'GBP':
            currency.rate = vndRate / (data.rates.GBP || 0.79);
            break;
          case 'AUD':
            currency.rate = vndRate / (data.rates.AUD || 1.58);
            break;
          case 'CAD':
            currency.rate = vndRate / (data.rates.CAD || 1.36);
            break;
          case 'CNY':
            currency.rate = vndRate / (data.rates.CNY || 7.24);
            break;
          case 'KRW':
            currency.rate = vndRate / (data.rates.KRW || 1415);
            break;
          case 'THB':
            currency.rate = vndRate / (data.rates.THB || 34.1);
            break;
          case 'SGD':
            currency.rate = vndRate / (data.rates.SGD || 1.34);
            break;
        }
        
        // Tính thay đổi
        currency.change = currency.rate - oldRate;
        currency.changePercent = oldRate > 0 ? (currency.change / oldRate) * 100 : 0;
        currency.lastUpdate = new Date();
      });
      
      this.lastUpdate = new Date();
      this.calculateConversion();
    }
  }

  private generateSimulatedRates() {
    // Tạo dữ liệu mô phỏng với biến động nhỏ
    this.currencies.forEach(currency => {
      const oldRate = currency.rate;
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      currency.rate = oldRate * (1 + variation);
      currency.change = currency.rate - oldRate;
      currency.changePercent = (currency.change / oldRate) * 100;
      currency.lastUpdate = new Date();
    });
    
    this.lastUpdate = new Date();
    this.calculateConversion();
  }

  calculateConversion() {
    const formValue = this.exchangeForm.getRawValue();
    const amount = this.parseNumber(formValue.amount);
    const fromCurrency = formValue.fromCurrency;
    const toCurrency = formValue.toCurrency;

    if (amount <= 0) {
      this.conversionResult.result = 0;
      return;
    }

    let result = 0;

    if (fromCurrency === 'VND' && toCurrency !== 'VND') {
      // VND to foreign currency
      const targetCurrency = this.currencies.find(c => c.code === toCurrency);
      if (targetCurrency) {
        result = amount / targetCurrency.rate;
      }
    } else if (fromCurrency !== 'VND' && toCurrency === 'VND') {
      // Foreign currency to VND
      const sourceCurrency = this.currencies.find(c => c.code === fromCurrency);
      if (sourceCurrency) {
        result = amount * sourceCurrency.rate;
      }
    } else if (fromCurrency !== 'VND' && toCurrency !== 'VND') {
      // Foreign to foreign via VND
      const sourceCurrency = this.currencies.find(c => c.code === fromCurrency);
      const targetCurrency = this.currencies.find(c => c.code === toCurrency);
      if (sourceCurrency && targetCurrency) {
        const vndAmount = amount * sourceCurrency.rate;
        result = vndAmount / targetCurrency.rate;
      }
    } else {
      // VND to VND
      result = amount;
    }

    this.conversionResult = {
      from: fromCurrency,
      to: toCurrency,
      amount: amount,
      result: Math.round(result * 100) / 100
    };
  }

  swapCurrencies() {
    const fromCurrency = this.exchangeForm.get('fromCurrency')?.value;
    const toCurrency = this.exchangeForm.get('toCurrency')?.value;
    
    this.exchangeForm.patchValue({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency
    });
  }

  refreshRates() {
    this.loadExchangeRates();
  }

  formatCurrency(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  formatChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${this.formatCurrency(change, 2)}`;
  }

  formatChangePercent(changePercent: number): string {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  }

  getChangeClass(change: number): string {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  }

  private parseNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') {
      const cleanVal = val.replace(/[^0-9.]/g, '');
      return cleanVal ? parseFloat(cleanVal) : 0;
    }
    return Number(val);
  }

  getTimeSinceUpdate(): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - this.lastUpdate.getTime()) / 1000);
    
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    return `${Math.floor(diff / 3600)} giờ trước`;
  }
}