import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ElectricityTier {
  tier: number;
  minKwh: number;
  maxKwh: number;
  pricePerKwh: number;
  description: string;
}

export interface WaterTier {
  tier: number;
  minM3: number;
  maxM3: number;
  pricePerM3: number;
  description: string;
  category: 'household' | 'business' | 'production';
}

@Injectable({
  providedIn: 'root'
})
export class UtilityPriceService {
  private electricityTiersSubject = new BehaviorSubject<ElectricityTier[]>([]);
  private waterTiersSubject = new BehaviorSubject<WaterTier[]>([]);
  private electricityLastUpdateSubject = new BehaviorSubject<Date | null>(null);
  private waterLastUpdateSubject = new BehaviorSubject<Date | null>(null);
  
  public electricityTiers$ = this.electricityTiersSubject.asObservable();
  public waterTiers$ = this.waterTiersSubject.asObservable();
  public electricityLastUpdate$ = this.electricityLastUpdateSubject.asObservable();
  public waterLastUpdate$ = this.waterLastUpdateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUtilityData();
  }

  private loadUtilityData() {
    console.log('⚡ Loading utility price data from CSV files...');
    
    const electricityRequest = this.http.get('assets/tiendien.csv', { 
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified) {
          this.electricityLastUpdateSubject.next(new Date(lastModified));
        } else {
          this.electricityLastUpdateSubject.next(new Date());
        }
        return this.parseElectricityCsv(response.body || '');
      }),
      catchError(error => {
        console.error('❌ Failed to load electricity data:', error);
        this.electricityLastUpdateSubject.next(new Date('2025-01-12'));
        return of(this.getDefaultElectricityTiers());
      })
    );

    const waterRequest = this.http.get('assets/tiennuoc.csv', { 
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified) {
          this.waterLastUpdateSubject.next(new Date(lastModified));
        } else {
          this.waterLastUpdateSubject.next(new Date());
        }
        return this.parseWaterCsv(response.body || '');
      }),
      catchError(error => {
        console.error('❌ Failed to load water data:', error);
        this.waterLastUpdateSubject.next(new Date('2025-01-12'));
        return of(this.getDefaultWaterTiers());
      })
    );

    forkJoin([electricityRequest, waterRequest]).subscribe(([electricityData, waterData]) => {
      this.electricityTiersSubject.next(electricityData);
      this.waterTiersSubject.next(waterData);
      console.log('✅ Utility data loaded:', electricityData.length, 'electricity tiers,', waterData.length, 'water tiers');
    });
  }

  private parseElectricityCsv(csvText: string): ElectricityTier[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      return {
        tier: parseInt(values[0]) || 0,
        minKwh: parseInt(values[1]) || 0,
        maxKwh: parseInt(values[2]) || 0,
        pricePerKwh: parseInt(values[3]) || 0,
        description: values[4]?.trim() || ''
      };
    });
  }

  private parseWaterCsv(csvText: string): WaterTier[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      return {
        tier: parseInt(values[0]) || 0,
        minM3: parseInt(values[1]) || 0,
        maxM3: parseInt(values[2]) || 0,
        pricePerM3: parseInt(values[3]) || 0,
        description: values[4]?.trim() || '',
        category: (values[5]?.trim() as 'household' | 'business' | 'production') || 'household'
      };
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

  private getDefaultElectricityTiers(): ElectricityTier[] {
    return [
      { tier: 1, minKwh: 0, maxKwh: 50, pricePerKwh: 1728, description: 'Bậc 1 (0-50 kWh)' },
      { tier: 2, minKwh: 51, maxKwh: 100, pricePerKwh: 1786, description: 'Bậc 2 (51-100 kWh)' },
      { tier: 3, minKwh: 101, maxKwh: 200, pricePerKwh: 2074, description: 'Bậc 3 (101-200 kWh)' },
      { tier: 4, minKwh: 201, maxKwh: 300, pricePerKwh: 2612, description: 'Bậc 4 (201-300 kWh)' },
      { tier: 5, minKwh: 301, maxKwh: 400, pricePerKwh: 2919, description: 'Bậc 5 (301-400 kWh)' },
      { tier: 6, minKwh: 401, maxKwh: 999999, pricePerKwh: 3015, description: 'Bậc 6 (trên 400 kWh)' }
    ];
  }

  private getDefaultWaterTiers(): WaterTier[] {
    return [
      { tier: 1, minM3: 0, maxM3: 10, pricePerM3: 5973, description: 'Bậc 1 (0-10 m³)', category: 'household' },
      { tier: 2, minM3: 11, maxM3: 20, pricePerM3: 7052, description: 'Bậc 2 (11-20 m³)', category: 'household' },
      { tier: 3, minM3: 21, maxM3: 30, pricePerM3: 8669, description: 'Bậc 3 (21-30 m³)', category: 'household' },
      { tier: 4, minM3: 31, maxM3: 999999, pricePerM3: 15929, description: 'Bậc 4 (trên 30 m³)', category: 'household' },
      { tier: 1, minM3: 0, maxM3: 20, pricePerM3: 9955, description: 'Bậc 1 (0-20 m³)', category: 'business' },
      { tier: 2, minM3: 21, maxM3: 50, pricePerM3: 12947, description: 'Bậc 2 (21-50 m³)', category: 'business' },
      { tier: 3, minM3: 51, maxM3: 999999, pricePerM3: 15929, description: 'Bậc 3 (trên 50 m³)', category: 'business' },
      { tier: 1, minM3: 0, maxM3: 999999, pricePerM3: 22068, description: 'Giá cố định', category: 'production' }
    ];
  }

  // Public methods
  getElectricityTiers(): Observable<ElectricityTier[]> {
    return this.electricityTiers$;
  }

  getWaterTiers(): Observable<WaterTier[]> {
    return this.waterTiers$;
  }

  getElectricityLastUpdate(): Observable<Date | null> {
    return this.electricityLastUpdate$;
  }

  getWaterLastUpdate(): Observable<Date | null> {
    return this.waterLastUpdate$;
  }

  refreshUtilityData() {
    this.loadUtilityData();
  }

  // Helper methods for calculations
  calculateElectricityBill(kwhUsed: number): { totalAmount: number; breakdown: Array<{tier: number; kwh: number; price: number; amount: number; description: string}> } {
    const tiers = this.electricityTiersSubject.value;
    const breakdown: Array<{tier: number; kwh: number; price: number; amount: number; description: string}> = [];
    let remainingKwh = kwhUsed;
    let totalAmount = 0;

    for (const tier of tiers) {
      if (remainingKwh <= 0) break;

      const tierCapacity = tier.maxKwh - tier.minKwh + 1;
      const kwhForThisTier = Math.min(remainingKwh, tierCapacity);
      const amountForThisTier = kwhForThisTier * tier.pricePerKwh;

      if (kwhForThisTier > 0) {
        breakdown.push({
          tier: tier.tier,
          kwh: kwhForThisTier,
          price: tier.pricePerKwh,
          amount: amountForThisTier,
          description: tier.description
        });

        totalAmount += amountForThisTier;
        remainingKwh -= kwhForThisTier;
      }
    }

    return { totalAmount, breakdown };
  }

  calculateWaterBill(m3Used: number, category: 'household' | 'business' | 'production'): { totalAmount: number; breakdown: Array<{tier: number; m3: number; price: number; amount: number; description: string}> } {
    const allTiers = this.waterTiersSubject.value;
    const tiers = allTiers.filter(t => t.category === category);
    const breakdown: Array<{tier: number; m3: number; price: number; amount: number; description: string}> = [];
    let remainingM3 = m3Used;
    let totalAmount = 0;

    for (const tier of tiers) {
      if (remainingM3 <= 0) break;

      const tierCapacity = tier.maxM3 - tier.minM3 + 1;
      const m3ForThisTier = Math.min(remainingM3, tierCapacity);
      const amountForThisTier = m3ForThisTier * tier.pricePerM3;

      if (m3ForThisTier > 0) {
        breakdown.push({
          tier: tier.tier,
          m3: m3ForThisTier,
          price: tier.pricePerM3,
          amount: amountForThisTier,
          description: tier.description
        });

        totalAmount += amountForThisTier;
        remainingM3 -= m3ForThisTier;
      }
    }

    return { totalAmount, breakdown };
  }
}