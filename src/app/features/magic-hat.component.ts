import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MobileHeaderComponent } from '../shared/mobile-header.component';
import { InfoModalComponent } from '../shared/info-modal.component';

interface Prize {
  name: string;
  quantity: number;
  remaining: number;
  color: string;
  emoji: string;
}

interface WheelSegment {
  prize: Prize;
  startAngle: number;
  endAngle: number;
  color: string;
}

@Component({
  selector: 'app-magic-hat',
  templateUrl: './magic-hat.component.html',
  styleUrls: ['./magic-hat.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MobileHeaderComponent,
    InfoModalComponent,
  ],
})
export class MagicHatComponent implements AfterViewInit {
  @ViewChild('wheelCanvas', { static: false }) wheelCanvas!: ElementRef<HTMLCanvasElement>;

  prizes: Prize[] = [
    { name: '', quantity: 0, remaining: 0, color: '#ef4444', emoji: '🎁' },
    { name: '', quantity: 0, remaining: 0, color: '#f59e0b', emoji: '🏆' },
    { name: '', quantity: 0, remaining: 0, color: '#10b981', emoji: '💎' },
    { name: '', quantity: 0, remaining: 0, color: '#3b82f6', emoji: '⭐' },
    { name: '', quantity: 0, remaining: 0, color: '#8b5cf6', emoji: '🎉' },
  ];

  isInitialized = false;
  isSpinning = false;
  currentResult: Prize | null = null;
  history: { prize: Prize; timestamp: Date }[] = [];
  isInfoModalOpen = false;
  decreaseMode = true;
  
  wheelSegments: WheelSegment[] = [];
  currentRotation = 0;
  
  readonly colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  readonly emojis = ['🎁', '🏆', '💎', '⭐', '🎉'];

  ngAfterViewInit(): void {
    if (this.isInitialized) {
      setTimeout(() => this.buildWheel(), 100);
    }
  }

  initializeHat(): void {
    const validPrizes = this.prizes.filter(p => p.name.trim() && p.quantity > 0);
    
    if (validPrizes.length === 0) {
      alert('Vui lòng nhập ít nhất 1 loại giải thưởng!');
      return;
    }

    this.prizes.forEach(p => {
      p.remaining = p.quantity;
    });

    this.isInitialized = true;
    this.currentResult = null;
    this.history = [];
    this.currentRotation = 0;
    
    setTimeout(() => this.buildWheel(), 100);
  }

  buildWheel(): void {
    const activePrizes = this.decreaseMode 
      ? this.prizes.filter(p => p.remaining > 0 && p.name.trim())
      : this.prizes.filter(p => p.name.trim());
    
    if (activePrizes.length === 0) return;

    this.wheelSegments = [];
    
    // Tạo mảng phân bố đều các giải
    const distributedPrizes = this.distributeEvenly(activePrizes);
    const totalSegments = distributedPrizes.length;
    const anglePerSegment = 360 / totalSegments;
    
    let currentAngle = 0;
    
    distributedPrizes.forEach(prize => {
      this.wheelSegments.push({
        prize,
        startAngle: currentAngle,
        endAngle: currentAngle + anglePerSegment,
        color: prize.color
      });
      
      currentAngle += anglePerSegment;
    });
    
    this.drawWheel();
  }

  /**
   * Phân bố đều các giải theo tỷ lệ
   * Ví dụ: G3=18, G2=12, G1=6 → tỷ lệ 3:2:1 → pattern [G3,G3,G3,G2,G2,G1] lặp lại
   */
  private distributeEvenly(prizes: Prize[]): Prize[] {
    const result: Prize[] = [];
    
    // Lấy số lượng của từng giải
    const quantities = prizes.map(p => this.decreaseMode ? p.remaining : p.quantity);
    const totalQuantity = quantities.reduce((sum, q) => sum + q, 0);
    
    if (totalQuantity === 0) return result;
    
    // Tìm ước chung lớn nhất để tính tỷ lệ
    const gcd = this.findGCD(quantities);
    const ratios = quantities.map(q => q / gcd);
    
    // Tạo pattern lặp lại dựa trên tỷ lệ
    const pattern: Prize[] = [];
    prizes.forEach((prize, index) => {
      for (let i = 0; i < ratios[index]; i++) {
        pattern.push(prize);
      }
    });
    
    // Lặp pattern cho đến khi đủ số lượng
    const remaining = [...quantities];
    let cycleCount = 0;
    
    while (remaining.some(q => q > 0)) {
      // Duyệt qua pattern
      for (let i = 0; i < pattern.length; i++) {
        const prize = pattern[i];
        const prizeIndex = prizes.indexOf(prize);
        
        if (remaining[prizeIndex] > 0) {
          result.push(prize);
          remaining[prizeIndex]--;
        }
        
        // Nếu đã đủ số lượng thì dừng
        if (remaining.every(q => q === 0)) break;
      }
      
      cycleCount++;
      // Tránh vòng lặp vô hạn
      if (cycleCount > 1000) break;
    }
    
    console.log('Distribution result:', result.map(p => p.name));
    console.log('Total segments:', result.length);
    
    return result;
  }

  /**
   * Tìm ước chung lớn nhất của mảng số
   */
  private findGCD(numbers: number[]): number {
    const gcdTwo = (a: number, b: number): number => {
      return b === 0 ? a : gcdTwo(b, a % b);
    };
    
    return numbers.reduce((acc, num) => gcdTwo(acc, num));
  }

  drawWheel(): void {
    const canvas = this.wheelCanvas?.nativeElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((this.currentRotation * Math.PI) / 180);
    
    this.wheelSegments.forEach((segment, index) => {
      const startAngle = (segment.startAngle * Math.PI) / 180;
      const endAngle = (segment.endAngle * Math.PI) / 180;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw text only if segment is large enough
      const angleSize = segment.endAngle - segment.startAngle;
      if (angleSize > 8) { // Only draw text if segment > 8 degrees
        ctx.save();
        const midAngle = (startAngle + endAngle) / 2;
        ctx.rotate(midAngle);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        
        // Draw emoji
        if (angleSize > 15) {
          ctx.font = 'bold 20px Arial';
          ctx.fillText(segment.prize.emoji, radius * 0.7, -5);
        }
        
        // Draw name only if segment is large enough
        if (angleSize > 25) {
          ctx.font = 'bold 12px Arial';
          const name = segment.prize.name.length > 10 
            ? segment.prize.name.substring(0, 8) + '...' 
            : segment.prize.name;
          ctx.fillText(name, radius * 0.7, 10);
        }
        
        ctx.restore();
      }
    });
    
    ctx.restore();
  }

  spin(): void {
    if (this.isSpinning) return;

    const activePrizes = this.decreaseMode 
      ? this.prizes.filter(p => p.remaining > 0)
      : this.prizes.filter(p => p.name.trim());
      
    if (activePrizes.length === 0) {
      alert('Đã hết giải thưởng! 🎉');
      return;
    }

    this.isSpinning = true;
    
    // Random chọn một segment từ wheel
    const randomSegmentIndex = Math.floor(Math.random() * this.wheelSegments.length);
    const targetSegment = this.wheelSegments[randomSegmentIndex];
    
    console.log('Total segments:', this.wheelSegments.length);
    console.log('Random segment index:', randomSegmentIndex);
    console.log('Target segment:', targetSegment);
    console.log('Target prize:', targetSegment.prize.name);
    
    if (!targetSegment) return;
    
    // Calculate target angle (arrow points at top, so we need to rotate to align segment center with top)
    const segmentMidAngle = (targetSegment.startAngle + targetSegment.endAngle) / 2;
    const targetAngle = 360 - segmentMidAngle + 90; // Adjust for arrow at top
    const spinRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const totalRotation = spinRotations * 360 + targetAngle;
    
    console.log('Segment mid angle:', segmentMidAngle);
    console.log('Target angle:', targetAngle);
    console.log('Total rotation:', totalRotation);
    
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    const startRotation = this.currentRotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.currentRotation = startRotation + totalRotation * easeOut;
      this.drawWheel();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.finalizeSpin(targetSegment.prize);
      }
    };
    
    animate();
  }

  private finalizeSpin(prize: Prize): void {
    this.currentResult = prize;
    
    if (this.decreaseMode) {
      prize.remaining--;
      setTimeout(() => this.buildWheel(), 500);
    }
    
    this.history.unshift({
      prize: { ...prize },
      timestamp: new Date(),
    });
    
    if (this.history.length > 10) {
      this.history.pop();
    }
    
    this.isSpinning = false;
  }

  reset(): void {
    this.prizes.forEach(p => {
      p.name = '';
      p.quantity = 0;
      p.remaining = 0;
    });
    this.isInitialized = false;
    this.currentResult = null;
    this.history = [];
    this.currentRotation = 0;
  }

  getTotalPrizes(): number {
    return this.prizes.reduce((sum, p) => sum + p.quantity, 0);
  }

  getRemainingTotal(): number {
    return this.prizes.reduce((sum, p) => sum + p.remaining, 0);
  }

  openInfoModal(): void {
    this.isInfoModalOpen = true;
  }

  closeInfoModal(): void {
    this.isInfoModalOpen = false;
  }
}
