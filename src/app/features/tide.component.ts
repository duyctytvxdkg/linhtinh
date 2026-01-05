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
  tideTableHtml: SafeHtml = ''; // Sử dụng SafeHtml để tránh sanitization warning
  monthlyTableHtml: SafeHtml = ''; // Thêm bảng tháng riêng biệt
  
  // Location management
  currentLocation: 'coralBank' | 'cuaTieu' = 'coralBank'; // Default to HCM
  locations = environment.tideLocations;
  
  private chartInstance: Chart | null = null;

  // Dữ liệu mặc định (dựa trên cau-ca.com)
  tideEvents: TideData[] = [];

  chartData: number[] = [];
  chartLabels: string[] = [];

  constructor(private tideService: TideService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    console.log('🚀 Tide component initialized');
    // Tự động load dữ liệu khi vào trang (default: Coral Bank)
    this.loadDataForCurrentLocation();
    
    // Log thông tin về proxy configuration
    console.log('🔧 Proxy should be configured for /api/tide/* -> https://cau-ca.com');
  }

  // Phương thức để chuyển đổi location
  switchLocation(locationKey: 'coralBank' | 'cuaTieu') {
    if (this.currentLocation !== locationKey) {
      console.log(`🔄 Switching location from ${this.currentLocation} to ${locationKey}`);
      this.currentLocation = locationKey;
      
      // Clear previous data
      this.tideTableHtml = '';
      this.monthlyTableHtml = '';
      this.tideEvents = [];
      this.chartData = [];
      this.chartLabels = [];
      
      // Load data for new location
      this.loadDataForCurrentLocation();
    }
  }

  // Phương thức để load dữ liệu cho location hiện tại
  private loadDataForCurrentLocation() {
    const location = this.locations[this.currentLocation];
    console.log(`📍 Loading data for ${location.name} (${location.lat}, ${location.lng})`);
    this.loadRealData();
  }

  // Phương thức để load dữ liệu mô phỏng (fallback)
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

  // Phương thức để load dữ liệu thực từ các API chuẩn
  private loadRealData() {
    console.log('�  Loading real tide data from standard APIs...');
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
        
        // Thông báo rõ ràng về vấn đề API
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
    
    // Load dữ liệu tháng song song
    this.loadMonthlyDataInBackground();
  }

  // Phương thức để load dữ liệu tháng trong background
  private loadMonthlyDataInBackground() {
    console.log(`📅 Loading monthly tide data in background for ${this.locations[this.currentLocation].name}...`);
    
    this.tideService.getMonthlyTideData(this.currentLocation).subscribe({
      next: (data: any) => {
        console.log('📥 Received monthly data in background:', data);
        
        try {
          if (data.monthlyData && data.monthlyData.length > 0) {
            // Chỉ lưu HTML của bảng tháng
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
        // Không hiển thị lỗi cho user vì đây là background loading
      }
    });
  }

  // Phương thức để refresh dữ liệu
  refreshData() {
    console.log('🔄 Refreshing tide data...');
    this.loadRealData(); // Mặc định thử load dữ liệu thực trước và load monthly data
  }

  private processTideApiData(data: { extremes?: TideExtreme[], heights?: TideHeight[], tableHtml?: string }) {
    if (data.extremes && data.extremes.length > 0) {
      this.processExtremesData(data.extremes);
    }

    if (data.heights && data.heights.length > 0) {
      this.generateChartData(data.heights);
      this.updateCurrentWaterLevel(data.heights);
    }
    
    // Lưu HTML của bảng nếu có (với sanitization)
    if (data.tableHtml) {
      this.tideTableHtml = this.sanitizer.bypassSecurityTrustHtml(data.tableHtml);
    }
    
    // Update chart after processing data
    this.updateChart();
    
    console.log(`📊 Processed tide data: ${data.extremes?.length || 0} extremes, ${data.heights?.length || 0} heights, table: ${!!data.tableHtml}`);
  }

  private generateHeightsFromExtremes(extremes: any[]): TideHeight[] {
    // Tạo dữ liệu heights từ extremes để vẽ biểu đồ
    const heights: TideHeight[] = [];
    
    if (extremes.length < 2) return heights;
    
    const sortedExtremes = extremes.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Tạo dữ liệu cho cả ngày (00:00 - 24:00)
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(0, 0, 0, 0); // 00:00 hôm nay
    
    const intervalMinutes = 15;
    
    // Tạo dữ liệu cho 24 giờ
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
    // Lọc và sắp xếp theo thời gian, lấy tất cả điểm trong ngày hiện tại
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0); // Bắt đầu ngày
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999); // Kết thúc ngày
    
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
      // Update data
      this.chartInstance.data.labels = this.chartLabels;
      this.chartInstance.data.datasets[0].data = this.chartData;
      
      // Recalculate Y-axis range
      const maxValue = Math.max(...this.chartData);
      const minValue = Math.min(...this.chartData);
      const range = maxValue - minValue;
      const padding = range * 0.1;
      
      const yAxisMax = Math.ceil((maxValue + padding) * 10) / 10;
      const yAxisMin = Math.max(0, Math.floor((minValue - padding) * 10) / 10);
      
      // Update Y-axis
      this.chartInstance.options.scales!['y']!.min = yAxisMin;
      this.chartInstance.options.scales!['y']!.max = yAxisMax;
      
      // Refresh chart
      this.chartInstance.update();
    } else {
      // Create new chart if doesn't exist
      setTimeout(() => this.initChart(), 100);
    }
  }

  private generateChartData(heights: TideHeight[]) {
    if (!heights || heights.length === 0) {
      console.warn('❌ No heights data to generate chart');
      return;
    }

    // Sắp xếp dữ liệu theo thời gian
    const sortedHeights = heights.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Tạo labels và data cho 24h của ngày hiện tại (mỗi 2h một điểm)
    const chartPoints: number[] = [];
    const labels: string[] = [];
    
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0); // Bắt đầu từ 00:00 của ngày hiện tại
    
    // Tạo 13 điểm từ 00:00 đến 24:00 (mỗi 2h)
    for (let hour = 0; hour <= 24; hour += 2) {
      const targetTime = new Date(startOfDay.getTime() + hour * 60 * 60 * 1000);
      
      // Tìm điểm dữ liệu gần nhất với thời gian mục tiêu
      const closestHeight = this.findClosestHeight(sortedHeights, targetTime);
      chartPoints.push(closestHeight);
      
      const timeLabel = hour === 24 ? '24:00' : `${hour.toString().padStart(2, '0')}:00`;
      labels.push(timeLabel);
    }
    
    this.chartData = chartPoints;
    this.chartLabels = labels;
    
    console.log(`📊 Generated chart data for full 24h: ${this.chartData.length} points, range: ${Math.min(...this.chartData).toFixed(1)}m - ${Math.max(...this.chartData).toFixed(1)}m`);
    console.log('📊 Chart covers full day from 00:00 to 24:00');
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
    
    // Xác định trạng thái triều (lên/xuống)
    const futureTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 phút sau
    const futureHeight = this.findClosestHeight(heights, futureTime);
    
    this.tideStatus = futureHeight > currentHeight ? 'Đang lên' : 'Đang xuống';
  }

  initChart() {
    if (!this.tideChartCanvas) return;
    
    // Destroy existing chart if exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    const ctx = this.tideChartCanvas.nativeElement.getContext('2d');

    // Tạo gradient cho sóng nước
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 123, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    // Tính toán min/max từ dữ liệu thực tế
    const maxValue = Math.max(...this.chartData);
    const minValue = Math.min(...this.chartData);
    const range = maxValue - minValue;
    const padding = range * 0.1; // 10% padding
    
    // Đảm bảo không có giá trị âm trên chart
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
          tension: 0.4, // Tạo độ cong cho sóng
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
              stepSize: 0.5 // Bước nhảy 0.5m
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

  // Phương thức để xóa cache và reload dữ liệu (for debugging)
  clearCacheAndReload() {
    const location = this.locations[this.currentLocation];
    console.log(`🗑️ Clearing cache for ${location.name} and reloading...`);
    
    // Clear cache for current location
    this.tideService.clearMonthlyCache(this.currentLocation);
    
    // Clear current data
    this.monthlyTableHtml = '';
    
    // Reload monthly data
    this.loadMonthlyDataInBackground();
  }

  // Phương thức để kiểm tra thông tin cache (for debugging)
  checkCacheInfo() {
    const cacheInfo = this.tideService.getCacheInfo(this.currentLocation);
    const allCacheInfo = this.tideService.getAllCacheInfo();
    
    console.log('📊 Current location cache info:', cacheInfo);
    console.log('📊 All locations cache info:', allCacheInfo);
    
    return { current: cacheInfo, all: allCacheInfo };
  }

  // Phương thức để xóa tất cả cache (for debugging)
  clearAllCaches() {
    console.log('🗑️ Clearing all location caches...');
    this.tideService.clearAllLocationCaches();
    
    // Clear current UI data
    this.monthlyTableHtml = '';
    this.tideTableHtml = '';
    this.tideEvents = [];
    
    // Reload data for current location
    this.loadDataForCurrentLocation();
  }
}