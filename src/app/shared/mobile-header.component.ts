import { Component, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mobile-header">
      <button class="back-btn" (click)="goBack()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      
      <div class="header-content">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="header-actions">
        <slot></slot>
      </div>
    </div>
  `,
  styles: [`
    .mobile-header {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
      min-height: 60px;
    }
    
    .back-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 12px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: 15px;
      
      &:hover, &:active {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0.95);
      }
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
    
    .header-content {
      flex: 1;
      min-width: 0;
    }
    
    .page-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .page-subtitle {
      font-size: 0.85rem;
      opacity: 0.9;
      margin: 2px 0 0 0;
      line-height: 1.2;
    }
    
    .header-actions {
      margin-left: 10px;
    }
    
    /* Safe area for notched phones */
    @supports (padding-top: env(safe-area-inset-top)) {
      .mobile-header {
        padding-top: calc(15px + env(safe-area-inset-top));
      }
    }
  `]
})
export class MobileHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}