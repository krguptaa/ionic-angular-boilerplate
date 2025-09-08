import { Injectable, Injector } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private injector: Injector,
    private router: Router
  ) {}

  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // If user is already authenticated, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // User is not authenticated, allow access to auth pages
    return true;
  }
}