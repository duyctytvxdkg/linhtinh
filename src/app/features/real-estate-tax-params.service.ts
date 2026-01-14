import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface PropertyTypeParams {
  landUseTaxRate: number;
  transferTaxRate: number;
  registrationFeeRate: number;
  exemptionArea: number;
}

export interface LocationParams {
  coefficient: number;
}

export interface RealEstateTaxParams {
  // Phí cố định
  documentFee: number;
  certificateFee: number;
  notaryFeeRate: number;
  firstTimeBuyerDiscount: number;
  
  // Thuế suất chuyển nhượng theo thời gian
  transferTaxRate1: number; // < 2 năm
  transferTaxRate2: number; // 2-5 năm
  transferTaxRate3: number; // >= 5 năm
  exemptionThreshold1: number; // 2 năm
  exemptionThreshold2: number; // 5 năm
  
  // Thuế suất theo loại BDS
  propertyTypes: {
    residential: PropertyTypeParams;
    commercial: PropertyTypeParams;
    industrial: PropertyTypeParams;
    agricultural: PropertyTypeParams;
    office: PropertyTypeParams;
    warehouse: PropertyTypeParams;
  };
  
  // Hệ số khu vực
  locationCoefficients: {
    urban_1: number;
    urban_2: number;
    urban_3: number;
    rural: number;
    remote: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RealEstateTaxParamsService {
  private paramsSubject = new BehaviorSubject<RealEstateTaxParams | null>(null);
  private lastUpdateSubject = new BehaviorSubject<Date | null>(null);
  
  public params$ = this.paramsSubject.asObservable();
  public lastUpdate$ = this.lastUpdateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadParams();
  }

  private loadParams() {
    console.log('🏠 Loading Real Estate Tax parameters from CSV...');
    
    this.http.get('assets/real-estate-tax.csv', { 
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
        console.error('❌ Failed to load Real Estate Tax parameters:', error);
        this.lastUpdateSubject.next(new Date('2025-01-12'));
        return of(this.getDefaultParams());
      })
    ).subscribe(params => {
      this.paramsSubject.next(params);
      console.log('✅ Real Estate Tax parameters loaded');
    });
  }

  private parseParamsCsv(csvText: string): RealEstateTaxParams {
    const lines = csvText.trim().split('\n');
    const rawParams: any = {};
    
    lines.slice(1).forEach(line => {
      const [parameter, value, description] = this.parseCSVLine(line);
      if (parameter && value) {
        const numValue = parseFloat(value);
        rawParams[parameter.trim()] = isNaN(numValue) ? value.trim() : numValue;
      }
    });
    
    return {
      // Phí cố định
      documentFee: rawParams.documentFee || 100000,
      certificateFee: rawParams.certificateFee || 500000,
      notaryFeeRate: rawParams.notaryFeeRate || 0.001,
      firstTimeBuyerDiscount: rawParams.firstTimeBuyerDiscount || 0.5,
      
      // Thuế suất chuyển nhượng
      transferTaxRate1: rawParams.transferTaxRate1 || 0.20,
      transferTaxRate2: rawParams.transferTaxRate2 || 0.15,
      transferTaxRate3: rawParams.transferTaxRate3 || 0.10,
      exemptionThreshold1: rawParams.exemptionThreshold1 || 2,
      exemptionThreshold2: rawParams.exemptionThreshold2 || 5,
      
      // Thuế suất theo loại BDS
      propertyTypes: {
        residential: {
          landUseTaxRate: rawParams.residentialLandUseTaxRate || 0.03,
          transferTaxRate: rawParams.residentialTransferTaxRate || 2.0,
          registrationFeeRate: rawParams.residentialRegistrationFeeRate || 0.5,
          exemptionArea: rawParams.residentialExemptionArea || 200
        },
        commercial: {
          landUseTaxRate: rawParams.commercialLandUseTaxRate || 0.07,
          transferTaxRate: rawParams.commercialTransferTaxRate || 2.0,
          registrationFeeRate: rawParams.commercialRegistrationFeeRate || 0.5,
          exemptionArea: rawParams.commercialExemptionArea || 0
        },
        industrial: {
          landUseTaxRate: rawParams.industrialLandUseTaxRate || 0.05,
          transferTaxRate: rawParams.industrialTransferTaxRate || 2.0,
          registrationFeeRate: rawParams.industrialRegistrationFeeRate || 0.5,
          exemptionArea: rawParams.industrialExemptionArea || 0
        },
        agricultural: {
          landUseTaxRate: rawParams.agriculturalLandUseTaxRate || 0.01,
          transferTaxRate: rawParams.agriculturalTransferTaxRate || 2.0,
          registrationFeeRate: rawParams.agriculturalRegistrationFeeRate || 0.5,
          exemptionArea: rawParams.agriculturalExemptionArea || 1000
        },
        office: {
          landUseTaxRate: rawParams.officeLandUseTaxRate || 0.08,
          transferTaxRate: rawParams.officeTransferTaxRate || 2.0,
          registrationFeeRate: rawParams.officeRegistrationFeeRate || 0.5,
          exemptionArea: rawParams.officeExemptionArea || 0
        },
        warehouse: {
          landUseTaxRate: rawParams.warehouseLandUseTaxRate || 0.04,
          transferTaxRate: rawParams.warehouseTransferTaxRate || 2.0,
          registrationFeeRate: rawParams.warehouseRegistrationFeeRate || 0.5,
          exemptionArea: rawParams.warehouseExemptionArea || 0
        }
      },
      
      // Hệ số khu vực
      locationCoefficients: {
        urban_1: rawParams.urban1Coefficient || 1.5,
        urban_2: rawParams.urban2Coefficient || 1.3,
        urban_3: rawParams.urban3Coefficient || 1.1,
        rural: rawParams.ruralCoefficient || 1.0,
        remote: rawParams.remoteCoefficient || 0.8
      }
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

  private getDefaultParams(): RealEstateTaxParams {
    return {
      documentFee: 100000,
      certificateFee: 500000,
      notaryFeeRate: 0.001,
      firstTimeBuyerDiscount: 0.5,
      transferTaxRate1: 0.20,
      transferTaxRate2: 0.15,
      transferTaxRate3: 0.10,
      exemptionThreshold1: 2,
      exemptionThreshold2: 5,
      propertyTypes: {
        residential: { landUseTaxRate: 0.03, transferTaxRate: 2.0, registrationFeeRate: 0.5, exemptionArea: 200 },
        commercial: { landUseTaxRate: 0.07, transferTaxRate: 2.0, registrationFeeRate: 0.5, exemptionArea: 0 },
        industrial: { landUseTaxRate: 0.05, transferTaxRate: 2.0, registrationFeeRate: 0.5, exemptionArea: 0 },
        agricultural: { landUseTaxRate: 0.01, transferTaxRate: 2.0, registrationFeeRate: 0.5, exemptionArea: 1000 },
        office: { landUseTaxRate: 0.08, transferTaxRate: 2.0, registrationFeeRate: 0.5, exemptionArea: 0 },
        warehouse: { landUseTaxRate: 0.04, transferTaxRate: 2.0, registrationFeeRate: 0.5, exemptionArea: 0 }
      },
      locationCoefficients: {
        urban_1: 1.5,
        urban_2: 1.3,
        urban_3: 1.1,
        rural: 1.0,
        remote: 0.8
      }
    };
  }

  getParams(): Observable<RealEstateTaxParams | null> {
    return this.params$;
  }

  getLastUpdate(): Observable<Date | null> {
    return this.lastUpdate$;
  }

  refreshParams() {
    this.loadParams();
  }
}