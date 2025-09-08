import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { AuthGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    canActivate: [AuthGuard]
  }
];