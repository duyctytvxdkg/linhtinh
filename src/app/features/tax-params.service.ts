import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface TaxTier {
  min: number;
  max: number;
  rate: number;
}

export interface TaxParams {
  personalDeduction: number;
  dependentDeduction: number;
  insuranceDeduction: number;
  tiers: TaxTier[];
}

@Injectable({
  providedIn: 'root'
})
export class TaxParamsService {
  private paramsSubject = new BehaviorSubject<TaxParams | null>(null);
  private lastUpdateSubject = new BehaviorSubject<Date | null>(null);
  
  public params$ = this.paramsSubject.asObservable();
  public lastUpdate$ = this.lastUpdateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadParams();
  }

  private loadParams() {
    console.log('💰 Loading Tax parameters from CSV...');
    
    this.http.get('assets/thuetncn.csv', { 
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified) {
          this.lastUpdateSubject.next(new Date(lastModified));
        } else {
          this.lastUpdateSubject.next(new Date());
        }
        return this.parseParamsCsv(response.body || '');
      }),
      catchError(error => {
        console.error('❌ Failed to load Tax parameters:', error);
        this.lastUpdateSubject.next(new Date('2025-01-12'));
        return of(this.getDefaultParams());
      })
    ).subscribe(params => {
      this.paramsSubject.next(params);
      console.log('✅ Tax parameters loaded');
    });
  }

  private parseParamsCsv(csvText: string): TaxParams {
    const lines = csvText.trim().split('\n');
    const rawParams: any = {};
    
    lines.slice(1).forEach(line => {
      const [parameter, value, description] = this.parseCSVLine(line);
      if (parameter && value) {
        const numValue = parseFloat(value);
        rawParams[parameter.trim()] = isNaN(numValue) ? value.trim() : numValue;
      }
    });
    
    // Build tax tiers
    const tiers: TaxTier[] = [];
    for (let i = 1; i <= 7; i++) {
      const min = rawParams[`tier${i}Min`];
      const max = rawParams[`tier${i}Max`];
      const rate = rawParams[`tier${i}Rate`];
      
      if (min !== undefined && max !== undefined && rate !== undefined) {
        tiers.push({ min, max, rate });
      }
    }
    
    return {
      personalDeduction: rawParams.personalDeduction || 11000000,
      dependentDeduction: rawParams.dependentDeduction || 4400000,
      insuranceDeduction: rawParams.insuranceDeduction || 10500000,
      tiers: tiers
    };
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

  private getDefaultParams(): TaxParams {
    return {
      personalDeduction: 11000000,
      dependentDeduction: 4400000,
      insuranceDeduction: 10500000,
      tiers: [
        { min: 0, max: 5000000, rate: 0.05 },
        { min: 5000001, max: 10000000, rate: 0.10 },
        { min: 10000001, max: 18000000, rate: 0.15 },
        { min: 18000001, max: 32000000, rate: 0.20 },
        { min: 32000001, max: 52000000, rate: 0.25 },
        { min: 52000001, max: 80000000, rate: 0.30 },
        { min: 80000001, max: 999999999, rate: 0.35 }
      ]
    };
  }

  getParams(): Observable<TaxParams | null> {
    return this.params$;
  }

  getLastUpdate(): Observable<Date | null> {
    return this.lastUpdate$;
  }

  refreshParams() {
    this.loadParams();
  }
}