import { Injectable, Injector } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppGuard implements CanActivate {

  constructor(
    private injector: Injector,
    private router: Router
  ) {}

  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // Check if user is authenticated
    if (this.authService.isLoggedIn()) {
      // User is logged in, redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false; // Prevent activation of root route
    } else {
      // User is not logged in, redirect to login
      this.router.navigate(['/auth/login']);
      return false; // Prevent activation of root route
    }
  }
}