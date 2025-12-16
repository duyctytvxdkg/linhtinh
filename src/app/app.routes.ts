import { SocialInsurranceComponent } from './features/socialinsurrance.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoanComponent } from './features/loan.component';
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
    component: LoanComponent
  },
  {
    path: 'licham',
    component: LunarCalendarComponent
  },
  {
    path: 'luonghuu',
    component: SocialInsurranceComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
