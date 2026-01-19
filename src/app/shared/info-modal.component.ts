import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="info-modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="info-modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button mat-icon-button (click)="closeModal()" class="close-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        
        <div class="modal-footer">
          <button mat-raised-button color="primary" (click)="closeModal()">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    
    .info-modal-content {
      background: white;
      border-radius: 16px;
      max-width: 90vw;
      max-height: 80vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: modalSlideIn 0.3s ease-out;
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    
    .close-btn {
      color: #64748b;
      
      &:hover {
        background: #f1f5f9;
        color: #1e293b;
      }
    }
    
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      -webkit-overflow-scrolling: touch;
    }
    
    .modal-footer {
      padding: 16px 24px 20px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
    }
    
    @media (max-width: 480px) {
      .info-modal-content {
        max-width: 95vw;
        max-height: 85vh;
      }
      
      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: 16px;
        padding-right: 16px;
      }
    }
  `]
})
export class InfoModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Thông tin';
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}