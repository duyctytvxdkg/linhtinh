import { SocialInsurranceComponent } from './features/socialinsurrance.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoanComponent } from './features/loan.component';
import { LunarCalendarComponent } from './features/lunar-calendar.component';
import { TideComponent } from './features/tide.component';
import { ThueTncnComponent } from './features/thue-tncn.component';
import { ExchangeRateComponent } from './features/exchange-rate.component';
import { RealEstateTaxComponent } from './features/real-estate-tax.component';
import { ShippingCalculatorComponent } from './features/shipping-calculator.component';
import { UtilityCalculatorComponent } from './features/utility-calculator.component';
import { MagicHatComponent } from './features/magic-hat.component';
import { TaskListComponent } from './features/task-list.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'tinhlai',
    component: LoanComponent,
  },
  {
    path: 'licham',
    component: LunarCalendarComponent,
  },
  {
    path: 'luonghuu',
    component: SocialInsurranceComponent,
  },
  {
    path: 'thuetncn',
    component: ThueTncnComponent,
  },
  {
    path: 'tide',
    component: TideComponent,
  },
  {
    path: 'tygia',
    component: ExchangeRateComponent,
  },
  {
    path: 'thuebds',
    component: RealEstateTaxComponent,
  },
  {
    path: 'ship',
    component: ShippingCalculatorComponent,
  },
  {
    path: 'diennuoc',
    component: UtilityCalculatorComponent,
  },
  {
    path: 'non',
    component: MagicHatComponent,
  },
  {
    path: 'task',
    component: TaskListComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
