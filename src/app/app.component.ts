import { LoanComponent } from './features/loan.component';
import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { LunarCalendarComponent } from './features/lunar-calendar.component';
import { TideComponent } from './features/tide.component';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, LoanComponent, LunarCalendarComponent, TideComponent, RouterOutlet, RouterLink, RouterLinkActive],
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
  private currentRoute = '/';

  constructor(
    private router: Router
  ) {
    console.log('🚀 Ionic App Initialized');
  }

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

    // Track current route for back button handling
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      console.log('📍 Current route:', this.currentRoute);
    });

    // Initialize Android back button handling
    this.initializeBackButtonHandling();
  }

  ngOnDestroy(): void {
    window.removeEventListener('hashchange', this.hashListener);
  }

  // Initialize Android hardware back button handling
  private async initializeBackButtonHandling(): Promise<void> {
    try {
      // Only handle back button on mobile platforms (specifically Android)
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        console.log('🔙 Initializing Android back button handling');
        
        App.addListener('backButton', (data: { canGoBack: boolean }) => {
          console.log('🔙 Back button pressed, canGoBack:', data.canGoBack, 'currentRoute:', this.currentRoute);
          
          // If we're on the home page, exit the app
          if (this.currentRoute === '/' || this.currentRoute === '') {
            console.log('🏠 On home page, exiting app');
            App.exitApp();
          } else {
            // Navigate back to home page
            console.log('🏠 Navigating back to home');
            this.router.navigate(['/']);
          }
        });
      } else {
        console.log('🌐 Running in browser or iOS, back button handling not needed');
      }
    } catch (error) {
      console.error('❌ Error initializing back button handling:', error);
    }
  }
}
