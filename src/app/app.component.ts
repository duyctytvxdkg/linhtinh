import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LoanCalculatorComponent } from './features/loan-calculator.component';
import { LunarCalendarComponent } from './features/lunar-calendar.component';
import { TideComponent } from './features/tide.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, LoanCalculatorComponent, LunarCalendarComponent, TideComponent, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  // --- ICONS ---
  ICON_HOME = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  ICON_CALCULATOR = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="8" y1="18" y2="18"/><line x1="16" x2="16" y1="18" y2="18"/></svg>`;
  ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>`;
  ICON_WAVES = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 20s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/><path d="M2 12s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/><path d="M2 4s2-2 4-2 4 2 6 2 4-2 6-2 4 2 6 2"/></svg>`;

  // --- State ---
  path = signal<string>(window.location.hash.substring(1) || 'home');
  isMenuOpen = signal(false);
  currentYear = computed(() => new Date().getFullYear());

  private hashListener!: () => void;

  constructor() {}

  // Chọn menu
  setPath(route: string) {
    this.path.set(route);
    window.location.hash = route;
  }

  // Class của menu
  getNavLinkClass(linkPath: string): string {
    const active = 'sidebar-btn sidebar-btn-active';
    const inactive = 'sidebar-btn sidebar-btn-inactive';

    return this.path() === linkPath ? active : inactive;
  }

  // Lắng nghe thay đổi hash
  ngOnInit(): void {
    this.hashListener = () => {
      this.path.set(window.location.hash.substring(1) || 'home');
    };
    window.addEventListener('hashchange', this.hashListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('hashchange', this.hashListener);
  }
}
