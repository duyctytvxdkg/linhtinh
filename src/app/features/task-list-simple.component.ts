import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../shared/mobile-header.component';

@Component({
  selector: 'app-task-list-simple',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent],
  template: `
    <app-mobile-header title="Quản lý công việc"></app-mobile-header>
    <div style="padding: 20px;">
      <h2>🚧 Tính năng đang phát triển</h2>
      <p>Task List sẽ sớm có mặt trong phiên bản tiếp theo!</p>
    </div>
  `
})
export class TaskListSimpleComponent {
}