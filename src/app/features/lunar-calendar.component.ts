import { Component } from '@angular/core';

@Component({
  selector: 'app-lunar-calendar',
  standalone: true,
  template: `
    <div class="bg-white/70 p-6 rounded-xl shadow-lg text-gray-800">
      <h2 class="text-2xl font-bold mb-4">Lịch Âm</h2>
      <p>Chức năng lịch âm sẽ được tích hợp ở đây.</p>
    </div>
  `
})
export class LunarCalendarComponent {}
