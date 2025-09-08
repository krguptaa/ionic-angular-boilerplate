import { Routes } from '@angular/router';
import { SettingsPage } from './settings.page';
import { AuthGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
    canActivate: [AuthGuard]
  }
];