import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoanCalculatorComponent } from './features/loan-calculator.component';
import { LunarCalendarComponent } from './features/lunar-calendar.component';
import { TideComponent } from './features/tide.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'tinhlai',
    component: LoanCalculatorComponent
  },
  {
    path: 'licham',
    component: LunarCalendarComponent
  },
  {
    path: 'thuytrieu',
    component: TideComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
