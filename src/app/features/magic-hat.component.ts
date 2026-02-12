import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MobileHeaderComponent } from '../shared/mobile-header.component';
import { InfoModalComponent } from '../shared/info-modal.component';

interface Prize {
  name: string;
  quantity: number;
  remaining: number;
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
    MobileHeaderComponent,
    InfoModalComponent,
  ],
})
export class MagicHatComponent {
  prizes: Prize[] = [
    { name: '', quantity: 0, remaining: 0, color: '#ef4444' },
    { name: '', quantity: 0, remaining: 0, color: '#f59e0b' },
    { name: '', quantity: 0, remaining: 0, color: '#10b981' },
    { name: '', quantity: 0, remaining: 0, color: '#3b82f6' },
    { name: '', quantity: 0, remaining: 0, color: '#8b5cf6' },
  ];

  isInitialized = false;
  isSpinning = false;
  currentResult: Prize | null = null;
  history: { prize: Prize; timestamp: Date }[] = [];
  isInfoModalOpen = false;

  // Predefined colors for prizes
  readonly colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  initializeHat(): void {
    // Validate input
    const validPrizes = this.prizes.filter(p => p.name.trim() && p.quantity > 0);
    
    if (validPrizes.length === 0) {
      alert('Vui lòng nhập ít nhất 1 loại giải thưởng!');
      return;
    }

    // Reset remaining quantities
    this.prizes.forEach(p => {
      p.remaining = p.quantity;
    });

    this.isInitialized = true;
    this.currentResult = null;
    this.history = [];
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
  }

  spin(): void {
    if (this.isSpinning) return;

    // Check if there are any prizes left
    const availablePrizes = this.prizes.filter(p => p.remaining > 0);
    if (availablePrizes.length === 0) {
      alert('Đã hết giải thưởng! 🎉');
      return;
    }

    this.isSpinning = true;
    this.currentResult = null;

    // Create weighted array based on remaining quantities
    const weightedPrizes: Prize[] = [];
    availablePrizes.forEach(prize => {
      for (let i = 0; i < prize.remaining; i++) {
        weightedPrizes.push(prize);
      }
    });

    // Simulate spinning animation
    let spinCount = 0;
    const maxSpins = 20;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * weightedPrizes.length);
      this.currentResult = weightedPrizes[randomIndex];
      spinCount++;

      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        this.finalizeSpin();
      }
    }, 100);
  }

  private finalizeSpin(): void {
    if (this.currentResult) {
      // Decrease remaining quantity
      this.currentResult.remaining--;

      // Add to history
      this.history.unshift({
        prize: { ...this.currentResult },
        timestamp: new Date(),
      });

      // Keep only last 10 results
      if (this.history.length > 10) {
        this.history.pop();
      }
    }

    this.isSpinning = false;
  }

  getTotalPrizes(): number {
    return this.prizes.reduce((sum, p) => sum + p.quantity, 0);
  }

  getRemainingTotal(): number {
    return this.prizes.reduce((sum, p) => sum + p.remaining, 0);
  }

  getProgressPercentage(prize: Prize): number {
    if (prize.quantity === 0) return 0;
    return (prize.remaining / prize.quantity) * 100;
  }

  openInfoModal(): void {
    this.isInfoModalOpen = true;
  }

  closeInfoModal(): void {
    this.isInfoModalOpen = false;
  }
}
