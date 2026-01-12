import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import { TideService, TideExtreme, TideHeight } from './tide.service';
import { environment } from '../../environments/environment';

Chart.register(...registerables);

interface TideData {
  time: string;
  level: number;
  type: 'high' | 'low';
  label: string;
}

@Component({
  selector: 'app-tide',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './tide.component.html',
  styleUrls: ['./tide.component.scss']
})
export class TideComponent implements OnInit, OnDestroy {
  @ViewChild('tideChart') tideChartCanvas!: ElementRef;

  today = new Date();
  currentWaterLevel = 1.2; // m
  tideStatus = 'Đang lên';
  isLoading = false;
  errorMessage = '';
  tideTableHtml: SafeHtml = '';
  monthlyTableHtml: SafeHtml = '';
  
  // Location management
  currentLocation: 'coralBank' | 'cuaTieu' = 'coralBank';
  locations = environment.tideLocations;
  
  private chartInstance: Chart | null = null;

  tideEvents: TideData[] = [];
  chartData: number[] = [];
  chartLabels: string[] = [];

  constructor(private tideService: TideService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    console.log('🚀 Tide component initialized');
    this.loadDataForCurrentLocation();
    console.log('🔧 Proxy should be configured for /api/tide/* -> https://cau-ca.com');
  }

  switchLocation(locationKey: 'coralBank' | 'cuaTieu') {
    if (this.currentLocation !== locationKey) {
      console.log(`🔄 Switching location from ${this.currentLocation} to ${locationKey}`);
      this.currentLocation = locationKey;
      
      this.tideTableHtml = '';
      this.monthlyTableHtml = '';
      this.tideEvents = [];
      this.chartData = [];
      this.chartLabels = [];
      
      this.loadDataForCurrentLocation();
    }
  }

  private loadDataForCurrentLocation() {
    const location = this.locations[this.currentLocation];
    console.log(`📍 Loading data for ${location.name} (${location.lat}, ${location.lng})`);
    this.loadRealData();
  }

  private loadSimulatedData(): void {
    console.log('🔄 Loading simulated tide data...');
    
    try {
      const simulatedData = this.tideService.generateSimulatedTideData();
      const simulatedTableHtml = this.tideService.generateSimulatedTideTable();
      
      this.processTideApiData({
        ...simulatedData,
        tableHtml: simulatedTableHtml
      });
      
      this.errorMessage = '🔄 Sử dụng dữ liệu mô phỏng chính xác cho TP.HCM';
      setTimeout(() => this.initChart(), 100);
      
    } catch (error) {
      console.error('❌ Error loading simulated data:', error);
      this.errorMessage = '❌ Lỗi tải dữ liệu mô phỏng';
    }
  }

  private loadRealData() {
    console.log('📡 Loading real tide data from standard APIs...');
    this.isLoading = true;
    this.errorMessage = '';
    
    this.tideService.getTideDataFromWorldTides(this.currentLocation).subscribe({
      next: (data: any) => {
        console.log('📥 Received API data:', data);
        
        try {
          if (data.extremes && data.extremes.length > 0) {
            this.processTideApiData(data);
            this.errorMessage = '✅ Dữ liệu thủy triều TP.HCM được tải thành công';
          } else {
            throw new Error('No tide data found');
          }
        } catch (error) {
          console.warn('❌ Real API data parsing failed, falling back to simulated data');
          this.errorMessage = '⚠️ Không thể parse dữ liệu từ API. Sử dụng dữ liệu mô phỏng chính xác.';
          this.loadSimulatedData();
        }
        
        this.isLoading = false;
        setTimeout(() => this.initChart(), 100);
      },
      error: (error) => {
        console.error('❌ Failed to fetch real API data:', error);
        
        if (error.message && error.message.includes('demo')) {
          this.errorMessage = '⚠️ Cần API key WorldTides để lấy dữ liệu thực. Sử dụng dữ liệu mô phỏng chính xác cho TP.HCM.';
        } else if (error.status === 429) {
          this.errorMessage = '⚠️ Đã vượt quá giới hạn API miễn phí. Sử dụng dữ liệu mô phỏng chính xác.';
        } else {
          this.errorMessage = '⚠️ Không thể kết nối đến WorldTides API. Sử dụng dữ liệu mô phỏng chính xác cho TP.HCM.';
        }
        
        this.loadSimulatedData();
        this.isLoading = false;
      }
    });
    
    this.loadMonthlyDataInBackground();
  }

  private loadMonthlyDataInBackground() {
    console.log(`📅 Loading monthly tide data in background for ${this.locations[this.currentLocation].name}...`);
    
    this.tideService.getMonthlyTideData(this.currentLocation).subscribe({
      next: (data: any) => {
        console.log('📥 Received monthly data in background:', data);
        
        try {
          if (data.monthlyData && data.monthlyData.length > 0) {
            if (data.tableHtml) {
              this.monthlyTableHtml = this.sanitizer.bypassSecurityTrustHtml(data.tableHtml);
              console.log('✅ Dữ liệu thủy triều tháng được tải thành công (background)');
            }
          }
        } catch (error) {
          console.warn('❌ Monthly data parsing failed (background)');
        }
      },
      error: (error: any) => {
        console.error('❌ Failed to fetch monthly data (background):', error);
      }
    });
  }

  refreshData() {
    console.log('🔄 Refreshing tide data...');
    this.loadRealData();
  }

  // Phương thức để xử lý click event trên bảng tháng
  onMonthlyTableClick(event: Event) {
    const target = event.target as HTMLElement;
    
    let dayCell: HTMLElement | null = null;
    
    if (target.tagName === 'TD') {
      const row = target.parentElement as HTMLTableRowElement;
      if (row && row.cells.length > 0) {
        dayCell = row.cells[0];
      }
    } else if (target.tagName === 'TR') {
      const row = target as HTMLTableRowElement;
      if (row.cells.length > 0) {
        dayCell = row.cells[0];
      }
    } else {
      const td = target.closest('td');
      if (td) {
        const row = td.parentElement as HTMLTableRowElement;
        if (row && row.cells.length > 0) {
          dayCell = row.cells[0];
        }
      }
    }
    
    if (dayCell && dayCell.textContent) {
      const dayText = dayCell.textContent.trim();
      const dayMatch = dayText.match(/^(\d+)/);
      
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        
        if (day >= 1 && day <= 31) {
          console.log(`📅 Extracted day ${day} from cell text: "${dayText}"`);
          this.onDayClickInMonthlyTable(day);
        } else {
          console.warn(`⚠️ Invalid day extracted: ${day} from "${dayText}"`);
        }
      } else {
        console.warn(`⚠️ Could not extract day from cell text: "${dayText}"`);
      }
    }
  }

  // Phương thức để xử lý click vào ngày trong bảng tháng
  onDayClickInMonthlyTable(day: number) {
    console.log(`📅 Clicked on day ${day} in monthly table`);
    
    const selectedDate = new Date(this.today.getFullYear(), this.today.getMonth(), day);
    this.today = selectedDate;
    this.loadDataForSelectedDay(selectedDate);
  }

  // Phương thức để load dữ liệu cho ngày được chọn
  private loadDataForSelectedDay(selectedDate: Date) {
    console.log(`🔄 Loading tide data for selected day: ${selectedDate.toLocaleDateString('vi-VN')}`);
    this.isLoading = true;
    this.errorMessage = '';
    
    this.tideService.getTideDataFromWorldTides(this.currentLocation).subscribe({
      next: (data: any) => {
        console.log('📥 Received data for selected day:', data);
        
        try {
          if (data.extremes && data.extremes.length > 0) {
            const filteredExtremes = data.extremes.filter((extreme: any) => {
              const extremeDate = new Date(extreme.timestamp);
              return extremeDate.toDateString() === selectedDate.toDateString();
            });
            
            const filteredData = {
              ...data,
              extremes: filteredExtremes
            };
            
            this.processTideApiData(filteredData);
            this.errorMessage = `✅ Dữ liệu thủy triều cho ngày ${selectedDate.toLocaleDateString('vi-VN')} được tải thành công`;
          } else {
            this.loadSimulatedDataForDay(selectedDate);
          }
        } catch (error) {
          console.warn('❌ Failed to process selected day data, using simulated data');
          this.loadSimulatedDataForDay(selectedDate);
        }
        
        this.isLoading = false;
        setTimeout(() => this.initChart(), 100);
      },
      error: (error) => {
        console.error('❌ Failed to fetch data for selected day:', error);
        this.loadSimulatedDataForDay(selectedDate);
        this.isLoading = false;
      }
    });
  }

  // Phương thức để tạo dữ liệu mô phỏng cho ngày cụ thể
  private loadSimulatedDataForDay(selectedDate: Date) {
    console.log(`🔄 Loading simulated data for ${selectedDate.toLocaleDateString('vi-VN')}`);
    
    try {
      const simulatedExtremes = this.generateSimulatedDataForSpecificDay(selectedDate);
      const simulatedHeights: TideHeight[] = [];
      const simulatedTableHtml = this.generateTableForSpecificDay(simulatedExtremes, selectedDate);
      
      this.processTideApiData({
        extremes: simulatedExtremes,
        heights: simulatedHeights,
        tableHtml: simulatedTableHtml
      });
      
      this.errorMessage = `🔄 Sử dụng dữ liệu mô phỏng cho ngày ${selectedDate.toLocaleDateString('vi-VN')}`;
      setTimeout(() => this.initChart(), 100);
      
    } catch (error) {
      console.error('❌ Error loading simulated data for selected day:', error);
      this.errorMessage = `❌ Lỗi tải dữ liệu cho ngày ${selectedDate.toLocaleDateString('vi-VN')}`;
    }
  }

  // Phương thức để tạo dữ liệu mô phỏng cho ngày cụ thể
  private generateSimulatedDataForSpecificDay(date: Date): TideExtreme[] {
    const extremes: TideExtreme[] = [];
    
    const dayOfMonth = date.getDate();
    const moonPhase = Math.sin((dayOfMonth / 30) * 2 * Math.PI);
    const timeOffset = (dayOfMonth - 1) * 50;
    
    const baseHigh = 4.2 + moonPhase * 0.4;
    const baseLow = 0.6 - moonPhase * 0.3;
    
    const defaultSchedule = [
      { baseHour: 2, baseMinute: 5, height: baseHigh, type: 'high' },
      { baseHour: 8, baseMinute: 15, height: baseLow, type: 'low' },
      { baseHour: 14, baseMinute: 25, height: baseHigh - 0.2, type: 'high' },
      { baseHour: 20, baseMinute: 35, height: baseLow + 0.4, type: 'low' }
    ];
    
    for (const schedule of defaultSchedule) {
      const totalMinutes = schedule.baseHour * 60 + schedule.baseMinute + timeOffset;
      const finalHour = Math.floor(totalMinutes / 60) % 24;
      const finalMinute = totalMinutes % 60;
      
      const time = new Date(date);
      time.setHours(finalHour, finalMinute, 0, 0);
      
      extremes.push({
        timestamp: time.toISOString(),
        height: Math.round(schedule.height * 10) / 10,
        type: schedule.type as 'high' | 'low'
      });
    }
    
    return extremes;
  }

  // Phương thức để tạo bảng HTML cho ngày cụ thể
  private generateTableForSpecificDay(extremes: TideExtreme[], date: Date): string {
    const location = this.locations[this.currentLocation];
    
    let tableHtml = `
      <table class="tide-table" id="tabla_mareas">
        <thead>
          <tr style="background: #4a90e2; color: white;">
            <th colspan="5">THỦY TRIỀU - ${location.name} - ${date.toLocaleDateString('vi-VN')}</th>
          </tr>
          <tr style="background: #4a90e2; color: white;">
            <th>NGÀY</th>
            <th>THỜI GIAN</th>
            <th>MỰC NƯỚC (m)</th>
            <th>LOẠI TRIỀU</th>
            <th>TRẠNG THÁI</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    for (const extreme of extremes) {
      const extremeDate = new Date(extreme.timestamp);
      
      tableHtml += `
        <tr style="background-color: #e3f2fd !important; font-weight: 600 !important;">
          <td>${extremeDate.getDate()}/${extremeDate.getMonth() + 1}</td>
          <td>${extremeDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
          <td style="color: ${extreme.type === 'high' ? '#28a745' : '#dc3545'}; font-weight: 600;">${extreme.height.toFixed(1)}m</td>
          <td>${extreme.type === 'high' ? '🔼 Nước lớn' : '🔽 Nước ròng'}</td>
          <td>📍 Ngày được chọn</td>
        </tr>
      `;
    }

    tableHtml += `</tbody></table>`;
    return tableHtml;
  }
  private processTideApiData(data: { extremes?: TideExtreme[], heights?: TideHeight[], tableHtml?: string }) {
    if (data.extremes && data.extremes.length > 0) {
      this.processExtremesData(data.extremes);
    }

    if (data.heights && data.heights.length > 0) {
      this.generateChartData(data.heights);
      this.updateCurrentWaterLevel(data.heights);
    }
    
    if (data.tableHtml) {
      this.tideTableHtml = this.sanitizer.bypassSecurityTrustHtml(data.tableHtml);
    }
    
    this.updateChart();
    
    console.log(`📊 Processed tide data: ${data.extremes?.length || 0} extremes, ${data.heights?.length || 0} heights, table: ${!!data.tableHtml}`);
  }

  private generateHeightsFromExtremes(extremes: any[]): TideHeight[] {
    const heights: TideHeight[] = [];
    
    if (extremes.length < 2) return heights;
    
    const sortedExtremes = extremes.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(0, 0, 0, 0);
    
    const intervalMinutes = 15;
    
    for (let minute = 0; minute <= 24 * 60; minute += intervalMinutes) {
      const currentTime = new Date(startTime.getTime() + minute * 60 * 1000);
      const height = this.interpolateHeightAtTime(currentTime, sortedExtremes);
      
      heights.push({
        timestamp: currentTime.toISOString(),
        height: Math.round(height * 100) / 100
      });
    }
    
    return heights;
  }

  private interpolateHeightAtTime(targetTime: Date, extremes: any[]): number {
    if (extremes.length === 0) return 2.0;
    if (extremes.length === 1) return extremes[0].height;
    
    let before = extremes[0];
    let after = extremes[1];
    
    const targetTimestamp = targetTime.getTime();
    
    for (let i = 0; i < extremes.length - 1; i++) {
      const currentTimestamp = new Date(extremes[i].timestamp).getTime();
      const nextTimestamp = new Date(extremes[i + 1].timestamp).getTime();
      
      if (targetTimestamp >= currentTimestamp && targetTimestamp <= nextTimestamp) {
        before = extremes[i];
        after = extremes[i + 1];
        break;
      }
    }
    
    const beforeTime = new Date(before.timestamp).getTime();
    const afterTime = new Date(after.timestamp).getTime();
    const duration = afterTime - beforeTime;
    const elapsed = targetTimestamp - beforeTime;
    
    if (duration <= 0) return before.height;
    
    const progress = Math.max(0, Math.min(1, elapsed / duration));
    const sineProgress = (1 - Math.cos(progress * Math.PI)) / 2;
    
    return before.height + (after.height - before.height) * sineProgress;
  }

  private processExtremesData(extremes: TideExtreme[]) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const filteredExtremes = extremes
      .filter(extreme => {
        const extremeTime = new Date(extreme.timestamp);
        return extremeTime >= startOfDay && extremeTime <= endOfDay;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    this.tideEvents = filteredExtremes.map(extreme => ({
      time: new Date(extreme.timestamp).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      level: Math.round(extreme.height * 100) / 100,
      type: extreme.type,
      label: extreme.type === 'high' ? 'Nước lớn' : 'Nước ròng'
    }));

    console.log(`📈 Processed ${this.tideEvents.length} tide events for day ${now.getDate()}`);
  }

  private updateChart() {
    if (this.chartInstance) {
      this.chartInstance.data.labels = this.chartLabels;
      this.chartInstance.data.datasets[0].data = this.chartData;
      
      const maxValue = Math.max(...this.chartData);
      const minValue = Math.min(...this.chartData);
      const range = maxValue - minValue;
      const padding = range * 0.1;
      
      const yAxisMax = Math.ceil((maxValue + padding) * 10) / 10;
      const yAxisMin = Math.max(0, Math.floor((minValue - padding) * 10) / 10);
      
      this.chartInstance.options.scales!['y']!.min = yAxisMin;
      this.chartInstance.options.scales!['y']!.max = yAxisMax;
      
      this.chartInstance.update();
    } else {
      setTimeout(() => this.initChart(), 100);
    }
  }

  private generateChartData(heights: TideHeight[]) {
    if (!heights || heights.length === 0) {
      console.warn('❌ No heights data to generate chart');
      return;
    }

    const sortedHeights = heights.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const chartPoints: number[] = [];
    const labels: string[] = [];
    
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    for (let hour = 0; hour <= 24; hour += 2) {
      const targetTime = new Date(startOfDay.getTime() + hour * 60 * 60 * 1000);
      
      const closestHeight = this.findClosestHeight(sortedHeights, targetTime);
      chartPoints.push(closestHeight);
      
      const timeLabel = hour === 24 ? '24:00' : `${hour.toString().padStart(2, '0')}:00`;
      labels.push(timeLabel);
    }
    
    this.chartData = chartPoints;
    this.chartLabels = labels;
    
    console.log(`📊 Generated chart data for full 24h: ${this.chartData.length} points, range: ${Math.min(...this.chartData).toFixed(1)}m - ${Math.max(...this.chartData).toFixed(1)}m`);
  }

  private findClosestHeight(heights: TideHeight[], targetTime: Date): number {
    let closest = heights[0];
    let minDiff = Math.abs(new Date(heights[0].timestamp).getTime() - targetTime.getTime());
    
    for (const height of heights) {
      const diff = Math.abs(new Date(height.timestamp).getTime() - targetTime.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = height;
      }
    }
    
    return Math.round(closest.height * 100) / 100;
  }

  private updateCurrentWaterLevel(heights: TideHeight[]) {
    const now = new Date();
    const currentHeight = this.findClosestHeight(heights, now);
    this.currentWaterLevel = currentHeight;
    
    const futureTime = new Date(now.getTime() + 30 * 60 * 1000);
    const futureHeight = this.findClosestHeight(heights, futureTime);
    
    this.tideStatus = futureHeight > currentHeight ? 'Đang lên' : 'Đang xuống';
  }

  initChart() {
    if (!this.tideChartCanvas) return;
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    const ctx = this.tideChartCanvas.nativeElement.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 123, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    const maxValue = Math.max(...this.chartData);
    const minValue = Math.min(...this.chartData);
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    const yAxisMax = Math.ceil((maxValue + padding) * 10) / 10;
    const yAxisMin = Math.max(0, Math.floor((minValue - padding) * 10) / 10);

    console.log('📊 Chart Y-axis range:', { 
      min: yAxisMin, 
      max: yAxisMax, 
      dataRange: `${minValue.toFixed(1)}m - ${maxValue.toFixed(1)}m`,
      note: 'Adjusted to prevent negative values'
    });

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: [{
          label: 'Mực nước (m)',
          data: this.chartData,
          borderColor: '#007bff',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#007bff',
          pointRadius: 4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Mực nước: ${context.parsed.y}m`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: yAxisMin,
            max: yAxisMax,
            ticks: { 
              callback: (value) => value + 'm',
              stepSize: 0.5
            },
            grid: {
              color: 'rgba(0, 123, 255, 0.1)'
            },
            title: {
              display: true,
              text: 'Mực nước (m)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 123, 255, 0.1)'
            },
            title: {
              display: true,
              text: 'Thời gian (24h)'
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  clearCacheAndReload() {
    const location = this.locations[this.currentLocation];
    console.log(`🗑️ Clearing cache for ${location.name} and reloading...`);
    
    this.tideService.clearMonthlyCache(this.currentLocation);
    this.monthlyTableHtml = '';
    this.loadMonthlyDataInBackground();
  }

  checkCacheInfo() {
    const cacheInfo = this.tideService.getCacheInfo(this.currentLocation);
    const allCacheInfo = this.tideService.getAllCacheInfo();
    
    console.log('📊 Current location cache info:', cacheInfo);
    console.log('📊 All locations cache info:', allCacheInfo);
    
    return { current: cacheInfo, all: allCacheInfo };
  }

  clearAllCaches() {
    console.log('🗑️ Clearing all location caches...');
    this.tideService.clearAllLocationCaches();
    
    this.monthlyTableHtml = '';
    this.tideTableHtml = '';
    this.tideEvents = [];
    
    this.loadDataForCurrentLocation();
  }
}