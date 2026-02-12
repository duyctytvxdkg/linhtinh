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
    
    // Bắt đầu từ góc -90° để segment đầu tiên ở 12 giờ (mũi tên)
    // Điều này đồng bộ giữa logic và rendering
    let currentAngle = -90;
    
    distributedPrizes.forEach(prize => {
      let startAngle = currentAngle;
      let endAngle = currentAngle + anglePerSegment;
      
      // Normalize về [0, 360)
      while (startAngle < 0) startAngle += 360;
      while (endAngle < 0) endAngle += 360;
      while (startAngle >= 360) startAngle -= 360;
      while (endAngle >= 360) endAngle -= 360;
      
      this.wheelSegments.push({
        prize,
        startAngle,
        endAngle,
        color: prize.color
      });
      
      currentAngle += anglePerSegment;
    });
    
    console.log('Wheel segments built:', this.wheelSegments.length);
    console.log('First segment:', this.wheelSegments[0]);
    console.log('Angle per segment:', anglePerSegment);
    console.log('All segments:', this.wheelSegments.map((s, i) => `${i}: ${s.startAngle}-${s.endAngle} ${s.prize.name} ${s.color}`));
    
    this.drawWheel();
  }

  /**
   * Phân bổ đều các giải theo tỷ lệ - Pattern lặp lại
   * Ví dụ: 6A, 12B, 18C (tỷ lệ 1:2:3) → pattern: C-C-C-B-B-A lặp lại 6 lần
   */
  private distributeEvenly(prizes: Prize[]): Prize[] {
    const result: Prize[] = [];
    
    // Tính GCD để tìm pattern nhỏ nhất
    const quantities = prizes.map(p => this.decreaseMode ? p.remaining : p.quantity);
    const gcd = this.findGCD(quantities);
    
    // Tạo pattern cơ bản dựa trên tỷ lệ
    const pattern: Prize[] = [];
    prizes.forEach(prize => {
      const quantity = this.decreaseMode ? prize.remaining : prize.quantity;
      const ratio = quantity / gcd;
      for (let i = 0; i < ratio; i++) {
        pattern.push(prize);
      }
    });
    
    // Shuffle pattern để phân tán đều hơn (không bị nhóm theo từng loại)
    for (let i = pattern.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
    }
    
    // Lặp lại pattern cho đến khi đủ số lượng
    for (let i = 0; i < gcd; i++) {
      result.push(...pattern);
    }
    
    console.log('Distribution result:', result.map(p => p.name));
    console.log('Total segments:', result.length);
    console.log('Pattern length:', pattern.length);
    console.log('Repeat times:', gcd);
    
    // Count each prize
    const counts: { [key: string]: number } = {};
    result.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    console.log('Prize counts:', counts);
    
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
    
    // Rotate the entire wheel based on currentRotation
    ctx.rotate((this.currentRotation * Math.PI) / 180);
    
    // KHÔNG cần offset -90° nữa vì segments đã được build với offset
    
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
      // Handle wrap-around case
      const actualAngleSize = angleSize < 0 ? angleSize + 360 : angleSize;
      
      if (actualAngleSize > 8) {
        ctx.save();
        let midAngle = (startAngle + endAngle) / 2;
        // Handle wrap-around
        if (endAngle < startAngle) {
          midAngle = ((segment.startAngle + segment.endAngle + 360) / 2 * Math.PI) / 180;
        }
        
        ctx.rotate(midAngle);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        
        // Draw emoji
        if (actualAngleSize > 15) {
          ctx.font = 'bold 20px Arial';
          ctx.fillText(segment.prize.emoji, radius * 0.7, -5);
        }
        
        // Draw name only if segment is large enough
        if (actualAngleSize > 25) {
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
    
    // Reset wheel về 0° ngay lập tức khi bấm Play
    this.currentRotation = 0;
    
    // Chỉ rebuild wheel khi ở chế độ giảm trừ
    // Chế độ không giảm trừ: giữ nguyên segments, chỉ vẽ lại
    if (this.decreaseMode) {
      this.buildWheel();
    } else {
      this.drawWheel();
    }
    
    // Đợi 0.5s để user thấy wheel đã reset, sau đó mới quay
    setTimeout(() => {
      this.startSpin();
    }, 500);
  }

  private startSpin(): void {
    // Random chọn một segment từ wheel
    const randomSegmentIndex = Math.floor(Math.random() * this.wheelSegments.length);
    const targetSegment = this.wheelSegments[randomSegmentIndex];
    
    console.log('Total segments:', this.wheelSegments.length);
    console.log('Random segment index:', randomSegmentIndex);
    console.log('Target segment:', targetSegment);
    console.log('Target prize:', targetSegment.prize.name);
    
    if (!targetSegment) {
      this.isSpinning = false;
      return;
    }
    
    // Tính góc giữa của segment
    let segmentMidAngle = (targetSegment.startAngle + targetSegment.endAngle) / 2;
    
    // Handle wrap-around case
    if (targetSegment.endAngle < targetSegment.startAngle) {
      segmentMidAngle = ((targetSegment.startAngle + targetSegment.endAngle + 360) / 2);
      if (segmentMidAngle >= 360) segmentMidAngle -= 360;
    }
    
    // QUAN TRỌNG: Mũi tên ở 12 giờ = 270° trong canvas coordinate (không phải 90°!)
    // Canvas: 0°=phải, 90°=dưới, 180°=trái, 270°=trên
    const arrowAngle = 270;
    
    // Canvas rotate counter-clockwise: khi rotate +X, segment ở góc A xuất hiện ở A + X
    // Để segment ở góc segmentMidAngle xuất hiện tại arrow (270°):
    // segmentMidAngle + rotation = 270 (mod 360)
    // => rotation = 270 - segmentMidAngle
    let targetAngle = arrowAngle - segmentMidAngle;
    
    // Normalize về [0, 360)
    while (targetAngle < 0) targetAngle += 360;
    while (targetAngle >= 360) targetAngle -= 360;
    
    const spinRotations = 5 + Math.random() * 3; // 5-8 vòng
    const totalRotation = spinRotations * 360 + targetAngle;
    
    console.log('Segment mid angle:', segmentMidAngle);
    console.log('Arrow angle:', arrowAngle);
    console.log('Target angle:', targetAngle);
    console.log('Total rotation:', totalRotation);
    
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = 0;
    
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
    // DEBUG: Tính toán segment thực tế mà mũi tên đang chỉ
    const finalRotation = this.currentRotation % 360;
    const arrowAngle = 270; // Mũi tên ở 12 giờ = 270° trong canvas coordinate
    
    // Canvas rotate counter-clockwise: khi rotate +X, segment ở góc A xuất hiện ở A + X
    // Mũi tên cố định ở 270°, segment tại arrow có góc gốc là: 270 - rotation
    let relativeAngle = (arrowAngle - finalRotation) % 360;
    
    // Normalize về [0, 360)
    while (relativeAngle < 0) relativeAngle += 360;
    while (relativeAngle >= 360) relativeAngle -= 360;
    
    // Tìm segment mà mũi tên đang chỉ vào
    const actualSegment = this.wheelSegments.find(seg => {
      // Handle wrap-around case (segment crosses 0°)
      if (seg.endAngle < seg.startAngle) {
        return relativeAngle >= seg.startAngle || relativeAngle < seg.endAngle;
      }
      return relativeAngle >= seg.startAngle && relativeAngle < seg.endAngle;
    });
    
    console.log('=== FINALIZE SPIN DEBUG ===');
    console.log('Final rotation:', finalRotation);
    console.log('Arrow angle:', arrowAngle);
    console.log('Relative angle (segment angle at arrow):', relativeAngle);
    console.log('Expected prize:', prize.name, prize.color);
    console.log('Actual segment at arrow:', actualSegment);
    console.log('Actual prize:', actualSegment?.prize.name, actualSegment?.prize.color);
    console.log('Match:', actualSegment?.prize === prize ? '✅ CORRECT' : '❌ WRONG');
    
    // Sử dụng actual segment thay vì prize được truyền vào
    const actualPrize = actualSegment ? actualSegment.prize : prize;
    
    // Delay nhỏ để đảm bảo animation hoàn tất trước khi hiển thị result
    setTimeout(() => {
      this.currentResult = actualPrize;
      console.log('Result displayed:', this.currentResult.name, this.currentResult.color);
      
      // Giảm số lượng nhưng KHÔNG rebuild wheel ngay
      // Wheel sẽ được rebuild khi bấm Play lần tiếp theo
      if (this.decreaseMode) {
        actualPrize.remaining--;
        console.log('Remaining after win:', actualPrize.name, actualPrize.remaining);
      }
      
      this.history.unshift({
        prize: { ...actualPrize },
        timestamp: new Date(),
      });
      
      if (this.history.length > 10) {
        this.history.pop();
      }
      
      this.isSpinning = false;
    }, 100);
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
