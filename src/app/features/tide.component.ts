import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-tide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tide.component.html',
  styleUrls: ['./tide.component.scss']
})
export class TideComponent implements OnInit {
  @ViewChild('tideChart') tideChartCanvas!: ElementRef;

  today = new Date();
  currentWaterLevel = 1.2; // m
  tideStatus = 'Đang lên';

  // Dữ liệu giả lập các mốc đỉnh/chân triều tại TP.HCM
  tideEvents = [
    { time: '04:30', level: 0.5, type: 'low', label: 'Nước ròng' },
    { time: '11:15', level: 1.6, type: 'high', label: 'Nước lớn' },
    { time: '17:45', level: 0.3, type: 'low', label: 'Nước ròng' },
    { time: '23:50', level: 1.4, type: 'high', label: 'Nước lớn' }
  ];

  ngOnInit() {
    setTimeout(() => this.initChart(), 0);
  }

  initChart() {
    const ctx = this.tideChartCanvas.nativeElement.getContext('2d');

    // Tạo gradient cho sóng nước
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 123, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
        datasets: [{
          label: 'Mực nước (m)',
          data: [1.2, 0.8, 0.5, 0.6, 1.0, 1.4, 1.6, 1.3, 0.8, 0.4, 0.6, 1.1, 1.4], // Data mô phỏng hình sin
          borderColor: '#007bff',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4, // Tạo độ cong cho sóng
          pointBackgroundColor: '#fff',
          pointBorderColor: '#007bff',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 2.0,
            ticks: { callback: (value) => value + 'm' }
          }
        }
      }
    });
  }
}
