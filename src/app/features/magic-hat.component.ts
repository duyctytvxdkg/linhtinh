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
    const totalWeight = this.decreaseMode
      ? activePrizes.reduce((sum, p) => sum + p.remaining, 0)
      : activePrizes.reduce((sum, p) => sum + p.quantity, 0);
    
    let currentAngle = 0;
    
    activePrizes.forEach(prize => {
      const weight = this.decreaseMode ? prize.remaining : prize.quantity;
      const angleSize = (weight / totalWeight) * 360;
      
      this.wheelSegments.push({
        prize,
        startAngle: currentAngle,
        endAngle: currentAngle + angleSize,
        color: prize.color
      });
      
      currentAngle += angleSize;
    });
    
    this.drawWheel();
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
    
    this.wheelSegments.forEach(segment => {
      const startAngle = (segment.startAngle * Math.PI) / 180;
      const endAngle = (segment.endAngle * Math.PI) / 180;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.save();
      const midAngle = (startAngle + endAngle) / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      
      ctx.font = '24px Arial';
      ctx.fillText(segment.prize.emoji, radius * 0.7, -10);
      
      ctx.font = 'bold 14px Arial';
      ctx.fillText(segment.prize.name, radius * 0.7, 10);
      
      ctx.restore();
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
    
    const weightedPrizes: Prize[] = [];
    activePrizes.forEach(prize => {
      const weight = this.decreaseMode ? prize.remaining : prize.quantity;
      for (let i = 0; i < weight; i++) {
        weightedPrizes.push(prize);
      }
    });
    
    const targetPrize = weightedPrizes[Math.floor(Math.random() * weightedPrizes.length)];
    const targetSegment = this.wheelSegments.find(s => s.prize === targetPrize);
    
    if (!targetSegment) return;
    
    const segmentMidAngle = (targetSegment.startAngle + targetSegment.endAngle) / 2;
    const targetAngle = 360 - segmentMidAngle + 90;
    const spinRotations = 5 + Math.random() * 3;
    const totalRotation = spinRotations * 360 + targetAngle;
    
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = this.currentRotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.currentRotation = startRotation + totalRotation * easeOut;
      this.drawWheel();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.finalizeSpin(targetPrize);
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
