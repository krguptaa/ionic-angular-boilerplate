import { Routes } from '@angular/router';
import { AppGuard } from './guards/app.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.routes').then(m => m.routes)
    // Temporarily remove AuthGuard to test circular dependency
    // canActivate: [AuthGuard] // Protect dashboard route
  },
  {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.routes').then(m => m.routes)
    // canActivate: [AuthGuard] // Protect settings route
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.routes)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/auth/login'
  },
];