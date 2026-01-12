import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout, map, retry } from 'rxjs/operators';

export interface ApiResponse {
  rates: { [key: string]: number };
  base: string;
  date: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  
  // Danh sách các API miễn phí
  private readonly APIs = {
    // API 1: ExchangeRate-API (miễn phí, không cần key)
    exchangeRateApi: {
      url: 'https://api.exchangerate-api.com/v4/latest/USD',
      timeout: 8000,
      retries: 2
    },
    
    // API 2: Fixer.io (cần API key, 100 requests/month miễn phí)
    fixer: {
      url: 'https://api.fixer.io/latest',
      apiKey: 'YOUR_FIXER_API_KEY', // Thay bằng key thật
      timeout: 8000,
      retries: 1
    },
    
    // API 3: CurrencyAPI (cần API key, 300 requests/month miễn phí)
    currencyApi: {
      url: 'https://api.currencyapi.com/v3/latest',
      apiKey: 'YOUR_CURRENCY_API_KEY', // Thay bằng key thật
      timeout: 8000,
      retries: 1
    },
    
    // API 4: ExchangeRates-API (miễn phí, không cần key)
    exchangeRatesApi: {
      url: 'https://api.exchangerate.host/latest',
      timeout: 8000,
      retries: 1
    }
  };

  constructor(private http: HttpClient) {}

  /**
   * Lấy tỷ giá từ API với fallback system
   */
  getExchangeRates(): Observable<ApiResponse> {
    console.log('🌐 Starting exchange rate fetch with fallback system...');
    
    // Thử API 1: ExchangeRate-API (không cần key)
    return this.fetchFromExchangeRateApi()
      .pipe(
        catchError((error) => {
          console.warn('❌ ExchangeRate-API failed:', error.message);
          // Fallback to API 4: ExchangeRates-API
          return this.fetchFromExchangeRatesApi();
        }),
        catchError((error) => {
          console.warn('❌ ExchangeRates-API failed:', error.message);
          // Fallback to Fixer API if configured
          return this.fetchFromFixerApi();
        }),
        catchError((error) => {
          console.warn('❌ Fixer API failed:', error.message);
          // Fallback to CurrencyAPI if configured
          return this.fetchFromCurrencyApi();
        }),
        catchError((error) => {
          console.warn('❌ All APIs failed:', error.message);
          // Final fallback to simulated data
          return this.getSimulatedRates();
        })
      );
  }

  /**
   * API 1: ExchangeRate-API (miễn phí, không cần key)
   */
  private fetchFromExchangeRateApi(): Observable<ApiResponse> {
    const url = this.APIs.exchangeRateApi.url;
    console.log('📡 Trying ExchangeRate-API...');
    
    return this.http.get<any>(url).pipe(
      timeout(this.APIs.exchangeRateApi.timeout),
      retry(this.APIs.exchangeRateApi.retries),
      map(response => {
        if (response && response.rates) {
          console.log('✅ ExchangeRate-API success');
          return {
            rates: response.rates,
            base: response.base || 'USD',
            date: response.date || new Date().toISOString(),
            success: true
          };
        }
        throw new Error('Invalid response format');
      })
    );
  }

  /**
   * API 4: ExchangeRates-API (miễn phí, không cần key)
   */
  private fetchFromExchangeRatesApi(): Observable<ApiResponse> {
    const url = `${this.APIs.exchangeRatesApi.url}?base=USD&symbols=VND,EUR,JPY,GBP,AUD,CAD,CNY,KRW,THB,SGD`;
    console.log('📡 Trying ExchangeRates-API...');
    
    return this.http.get<any>(url).pipe(
      timeout(this.APIs.exchangeRatesApi.timeout),
      retry(this.APIs.exchangeRatesApi.retries),
      map(response => {
        if (response && response.rates) {
          console.log('✅ ExchangeRates-API success');
          return {
            rates: response.rates,
            base: response.base || 'USD',
            date: response.date || new Date().toISOString(),
            success: true
          };
        }
        throw new Error('Invalid response format');
      })
    );
  }

  /**
   * API 2: Fixer.io (cần API key)
   */
  private fetchFromFixerApi(): Observable<ApiResponse> {
    const apiKey = this.APIs.fixer.apiKey;
    if (apiKey === 'YOUR_FIXER_API_KEY') {
      throw new Error('Fixer API key not configured');
    }
    
    const url = `${this.APIs.fixer.url}?access_key=${apiKey}&base=USD&symbols=VND,EUR,JPY,GBP,AUD,CAD,CNY,KRW,THB,SGD`;
    console.log('📡 Trying Fixer.io API...');
    
    return this.http.get<any>(url).pipe(
      timeout(this.APIs.fixer.timeout),
      retry(this.APIs.fixer.retries),
      map(response => {
        if (response && response.success && response.rates) {
          console.log('✅ Fixer.io API success');
          return {
            rates: response.rates,
            base: response.base || 'USD',
            date: response.date || new Date().toISOString(),
            success: true
          };
        }
        throw new Error('Fixer API error: ' + (response.error?.info || 'Unknown error'));
      })
    );
  }

  /**
   * API 3: CurrencyAPI (cần API key)
   */
  private fetchFromCurrencyApi(): Observable<ApiResponse> {
    const apiKey = this.APIs.currencyApi.apiKey;
    if (apiKey === 'YOUR_CURRENCY_API_KEY') {
      throw new Error('CurrencyAPI key not configured');
    }
    
    const url = `${this.APIs.currencyApi.url}?apikey=${apiKey}&base_currency=USD&currencies=VND,EUR,JPY,GBP,AUD,CAD,CNY,KRW,THB,SGD`;
    console.log('📡 Trying CurrencyAPI...');
    
    return this.http.get<any>(url).pipe(
      timeout(this.APIs.currencyApi.timeout),
      retry(this.APIs.currencyApi.retries),
      map(response => {
        if (response && response.data) {
          console.log('✅ CurrencyAPI success');
          // Convert CurrencyAPI format to standard format
          const rates: { [key: string]: number } = {};
          Object.keys(response.data).forEach(currency => {
            rates[currency] = response.data[currency].value;
          });
          
          return {
            rates: rates,
            base: 'USD',
            date: new Date().toISOString(),
            success: true
          };
        }
        throw new Error('CurrencyAPI error');
      })
    );
  }

  /**
   * Dữ liệu mô phỏng khi tất cả API đều fail
   */
  private getSimulatedRates(): Observable<ApiResponse> {
    console.log('🔄 All APIs failed, using simulated data...');
    
    // Tỷ giá mô phỏng dựa trên tỷ giá thực tế (cập nhật định kỳ)
    const simulatedRates = {
      VND: 24350 + (Math.random() - 0.5) * 100, // ±50 VND variation
      EUR: 0.92 + (Math.random() - 0.5) * 0.02,
      JPY: 149 + (Math.random() - 0.5) * 2,
      GBP: 0.79 + (Math.random() - 0.5) * 0.01,
      AUD: 1.58 + (Math.random() - 0.5) * 0.03,
      CAD: 1.36 + (Math.random() - 0.5) * 0.02,
      CNY: 7.24 + (Math.random() - 0.5) * 0.1,
      KRW: 1415 + (Math.random() - 0.5) * 20,
      THB: 34.1 + (Math.random() - 0.5) * 0.5,
      SGD: 1.34 + (Math.random() - 0.5) * 0.02
    };

    return of({
      rates: simulatedRates,
      base: 'USD',
      date: new Date().toISOString(),
      success: false // Đánh dấu là dữ liệu mô phỏng
    });
  }

  /**
   * Lấy tỷ giá từ Ngân hàng Nhà nước Việt Nam (SBV)
   * API này miễn phí và chính thức từ chính phủ
   */
  getVietnamBankRates(): Observable<any> {
    // API của Ngân hàng Nhà nước (nếu có)
    const sbvUrl = 'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx?b=10';
    
    return this.http.get(sbvUrl, { responseType: 'text' }).pipe(
      timeout(10000),
      map(xmlData => {
        // Parse XML data from Vietnamese banks
        console.log('🏦 Vietnam bank rates fetched');
        return this.parseVietnamBankXML(xmlData);
      }),
      catchError(error => {
        console.warn('❌ Vietnam bank API failed:', error);
        return throwError(() => error);
      })
    );
  }

  private parseVietnamBankXML(xmlData: string): any {
    // Parse XML từ ngân hàng Việt Nam
    // Implementation sẽ phụ thuộc vào format XML cụ thể
    console.log('Parsing Vietnam bank XML data:', xmlData.substring(0, 100));
    return {};
  }

  /**
   * Kiểm tra trạng thái các API
   */
  checkApiStatus(): Observable<{ [key: string]: boolean }> {
    const statusChecks = {
      exchangeRateApi: this.http.get(this.APIs.exchangeRateApi.url).pipe(
        timeout(5000),
        map(() => true),
        catchError(() => of(false))
      ),
      exchangeRatesApi: this.http.get(this.APIs.exchangeRatesApi.url).pipe(
        timeout(5000),
        map(() => true),
        catchError(() => of(false))
      )
    };

    return new Observable(observer => {
      const results: { [key: string]: boolean } = {};
      let completed = 0;
      const total = Object.keys(statusChecks).length;

      Object.entries(statusChecks).forEach(([name, check]) => {
        check.subscribe({
          next: (status) => {
            results[name] = status;
            completed++;
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          },
          error: () => {
            results[name] = false;
            completed++;
            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }
}