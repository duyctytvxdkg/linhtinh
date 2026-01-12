import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ShippingPriceData {
  provider: string;
  providerName: string;
  logo: string;
  baseFee: number;
  distanceFeePerZone: number;
  weightFreeLimit: number;
  weightFeePerKg: number;
  expressMultiplier: number;
  insuranceRate: number;
  codMinFee: number;
  codRate: number;
  standardTimeZone1: string;
  standardTimeZone2: string;
  standardTimeZone3: string;
  expressTimeZone1: string;
  expressTimeZone2: string;
  expressTimeZone3: string;
  features: string[];
  discount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShippingPriceService {
  private priceDataSubject = new BehaviorSubject<ShippingPriceData[]>([]);
  private lastUpdateSubject = new BehaviorSubject<Date | null>(null);
  
  public priceData$ = this.priceDataSubject.asObservable();
  public lastUpdate$ = this.lastUpdateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPriceData();
  }

  private loadPriceData() {
    console.log('📦 Loading shipping price data from CSV...');
    
    this.http.get('assets/giaship.csv', { 
      responseType: 'text',
      observe: 'response' // Để lấy headers
    }).pipe(
      map(response => {
        // Lấy thông tin Last-Modified từ headers (nếu có)
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified) {
          this.lastUpdateSubject.next(new Date(lastModified));
        } else {
          // Fallback: sử dụng ngày hiện tại
          this.lastUpdateSubject.next(new Date());
        }

        const csvText = response.body || '';
        return this.parseCSV(csvText);
      }),
      catchError(error => {
        console.error('❌ Failed to load shipping price data:', error);
        // Fallback to default data
        this.lastUpdateSubject.next(new Date('2025-01-12')); // Ngày tạo mặc định
        return of(this.getDefaultPriceData());
      })
    ).subscribe(data => {
      this.priceDataSubject.next(data);
      console.log('✅ Shipping price data loaded:', data.length, 'providers');
    });
  }

  private parseCSV(csvText: string): ShippingPriceData[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      const data: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        
        switch (header.trim()) {
          case 'baseFee':
          case 'distanceFeePerZone':
          case 'weightFreeLimit':
          case 'weightFeePerKg':
          case 'codMinFee':
            data[header.trim()] = parseInt(value) || 0;
            break;
          case 'expressMultiplier':
          case 'insuranceRate':
          case 'codRate':
          case 'discount':
            data[header.trim()] = parseFloat(value) || 0;
            break;
          case 'features':
            data[header.trim()] = value ? value.split('|') : [];
            break;
          default:
            data[header.trim()] = value;
        }
      });
      
      return data as ShippingPriceData;
    });
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  private getDefaultPriceData(): ShippingPriceData[] {
    return [
      {
        provider: 'grab',
        providerName: 'Grab Express',
        logo: '🚗',
        baseFee: 15000,
        distanceFeePerZone: 8000,
        weightFreeLimit: 2,
        weightFeePerKg: 5000,
        expressMultiplier: 1.5,
        insuranceRate: 0.005,
        codMinFee: 5000,
        codRate: 0.01,
        standardTimeZone1: '2-4 giờ',
        standardTimeZone2: '3-5 giờ',
        standardTimeZone3: '4-6 giờ',
        expressTimeZone1: '1-2 giờ',
        expressTimeZone2: '2-3 giờ',
        expressTimeZone3: '3-4 giờ',
        features: ['Giao nhanh trong ngày', 'Theo dõi realtime', 'Hỗ trợ 24/7'],
        discount: 0
      },
      {
        provider: 'shopee',
        providerName: 'Shopee Express',
        logo: '🛒',
        baseFee: 12000,
        distanceFeePerZone: 6000,
        weightFreeLimit: 1,
        weightFeePerKg: 3000,
        expressMultiplier: 1.3,
        insuranceRate: 0.003,
        codMinFee: 3000,
        codRate: 0.008,
        standardTimeZone1: '3-5 ngày',
        standardTimeZone2: '4-6 ngày',
        standardTimeZone3: '5-7 ngày',
        expressTimeZone1: '1-2 ngày',
        expressTimeZone2: '2-3 ngày',
        expressTimeZone3: '3-4 ngày',
        features: ['Miễn phí đổi trả', 'Tích hợp Shopee Mall', 'Ưu đãi seller'],
        discount: 0.1
      },
      {
        provider: 'lazada',
        providerName: 'Lazada Express',
        logo: '🛍️',
        baseFee: 13000,
        distanceFeePerZone: 6500,
        weightFreeLimit: 1,
        weightFeePerKg: 3500,
        expressMultiplier: 1.4,
        insuranceRate: 0.004,
        codMinFee: 4000,
        codRate: 0.009,
        standardTimeZone1: '3-6 ngày',
        standardTimeZone2: '4-7 ngày',
        standardTimeZone3: '5-8 ngày',
        expressTimeZone1: '1-3 ngày',
        expressTimeZone2: '2-4 ngày',
        expressTimeZone3: '3-5 ngày',
        features: ['Bảo hành mở rộng', 'Hỗ trợ đa ngôn ngữ', 'Lazada Wallet'],
        discount: 0
      },
      {
        provider: 'ghn',
        providerName: 'Giao Hàng Nhanh',
        logo: '📦',
        baseFee: 16000,
        distanceFeePerZone: 7000,
        weightFreeLimit: 0.5,
        weightFeePerKg: 4000,
        expressMultiplier: 1.6,
        insuranceRate: 0.006,
        codMinFee: 6000,
        codRate: 0.012,
        standardTimeZone1: '2-4 ngày',
        standardTimeZone2: '3-5 ngày',
        standardTimeZone3: '4-6 ngày',
        expressTimeZone1: '1 ngày',
        expressTimeZone2: '1-2 ngày',
        expressTimeZone3: '2-3 ngày',
        features: ['Mạng lưới rộng', 'API tích hợp', 'Báo cáo chi tiết'],
        discount: 0
      },
      {
        provider: 'viettelpost',
        providerName: 'Viettel Post',
        logo: '📮',
        baseFee: 14000,
        distanceFeePerZone: 5500,
        weightFreeLimit: 1,
        weightFeePerKg: 2500,
        expressMultiplier: 1.8,
        insuranceRate: 0.004,
        codMinFee: 5000,
        codRate: 0.01,
        standardTimeZone1: '3-5 ngày',
        standardTimeZone2: '4-6 ngày',
        standardTimeZone3: '5-7 ngày',
        expressTimeZone1: '1-2 ngày',
        expressTimeZone2: '2-3 ngày',
        expressTimeZone3: '3-4 ngày',
        features: ['Uy tín nhà nước', 'Phủ sóng toàn quốc', 'Giá ổn định'],
        discount: 0
      },
      {
        provider: 'jt',
        providerName: 'J&T Express',
        logo: '⚡',
        baseFee: 11000,
        distanceFeePerZone: 5000,
        weightFreeLimit: 1,
        weightFeePerKg: 2800,
        expressMultiplier: 1.4,
        insuranceRate: 0.003,
        codMinFee: 3500,
        codRate: 0.007,
        standardTimeZone1: '2-4 ngày',
        standardTimeZone2: '3-5 ngày',
        standardTimeZone3: '4-6 ngày',
        expressTimeZone1: '1-2 ngày',
        expressTimeZone2: '2-3 ngày',
        expressTimeZone3: '3-4 ngày',
        features: ['Giá cạnh tranh', 'Giao hàng nhanh', 'Hỗ trợ tốt'],
        discount: 0
      }
    ];
  }

  // Public methods
  getPriceData(): Observable<ShippingPriceData[]> {
    return this.priceData$;
  }

  getLastUpdate(): Observable<Date | null> {
    return this.lastUpdate$;
  }

  refreshPriceData() {
    this.loadPriceData();
  }

  // Helper method to get provider data by code
  getProviderData(providerCode: string): Observable<ShippingPriceData | undefined> {
    return this.priceData$.pipe(
      map(data => data.find(p => p.provider === providerCode))
    );
  }
}