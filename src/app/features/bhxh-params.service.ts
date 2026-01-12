import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface BhxhParams {
  employeeRate: number;
  employerRate: number;
  unemploymentEmployeeRate: number;
  unemploymentEmployerRate: number;
  healthInsuranceRate: number;
  healthInsuranceEmployerRate: number;
  accidentInsuranceRate: number;
  minSalary: number;
  maxSalary: number;
  retirementAgeM: number;
  retirementAgeF: number;
  minContributionYears: number;
  replacementRate: number;
  yearlyIncreaseRate: number;
  // Unemployment insurance parameters
  unemploymentMinMonths: number;
  unemploymentMaxMonths: number;
  unemploymentRate: number;
  unemploymentMinBenefit: number;
  unemploymentMaxBenefit: number;
}

@Injectable({
  providedIn: 'root'
})
export class BhxhParamsService {
  private paramsSubject = new BehaviorSubject<BhxhParams | null>(null);
  private lastUpdateSubject = new BehaviorSubject<Date | null>(null);
  
  public params$ = this.paramsSubject.asObservable();
  public lastUpdate$ = this.lastUpdateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadParams();
  }

  private loadParams() {
    console.log('👥 Loading BHXH parameters from CSV...');
    
    this.http.get('assets/bhxh.csv', { 
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
        console.error('❌ Failed to load BHXH parameters:', error);
        this.lastUpdateSubject.next(new Date('2025-01-12'));
        return of(this.getDefaultParams());
      })
    ).subscribe(params => {
      this.paramsSubject.next(params);
      console.log('✅ BHXH parameters loaded');
    });
  }

  private parseParamsCsv(csvText: string): BhxhParams {
    const lines = csvText.trim().split('\n');
    const params: any = {};
    
    lines.slice(1).forEach(line => {
      const [parameter, value, description] = this.parseCSVLine(line);
      if (parameter && value) {
        const numValue = parseFloat(value);
        params[parameter.trim()] = isNaN(numValue) ? value.trim() : numValue;
      }
    });
    
    return params as BhxhParams;
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

  private getDefaultParams(): BhxhParams {
    return {
      employeeRate: 0.08,
      employerRate: 0.175,
      unemploymentEmployeeRate: 0.01,
      unemploymentEmployerRate: 0.01,
      healthInsuranceRate: 0.015,
      healthInsuranceEmployerRate: 0.03,
      accidentInsuranceRate: 0.005,
      minSalary: 1800000,
      maxSalary: 46800000,
      retirementAgeM: 62,
      retirementAgeF: 60,
      minContributionYears: 20,
      replacementRate: 0.45,
      yearlyIncreaseRate: 0.02,
      // Unemployment insurance defaults
      unemploymentMinMonths: 12,
      unemploymentMaxMonths: 12,
      unemploymentRate: 0.60,
      unemploymentMinBenefit: 1800000,
      unemploymentMaxBenefit: 9000000
    };
  }

  getParams(): Observable<BhxhParams | null> {
    return this.params$;
  }

  getLastUpdate(): Observable<Date | null> {
    return this.lastUpdate$;
  }

  refreshParams() {
    this.loadParams();
  }
}