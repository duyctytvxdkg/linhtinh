import { Component } from '@angular/core';

@Component({
  selector: 'app-tide',
  standalone: true,
  template: `
    <div class="bg-white/70 p-6 rounded-xl shadow-lg text-gray-800">
      <h2 class="text-2xl font-bold mb-4">Thủy Triều</h2>
      <p>Thông tin thủy triều sẽ được hiển thị tại đây.</p>
    </div>
  `
})
export class TideComponent {}
