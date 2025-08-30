import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuthentication(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuthentication(childRoute, state);
  }

  private checkAuthentication(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    // If user is already authenticated, allow access
    if (this.authService.isLoggedIn()) {
      return this.checkRoleAccess(route);
    }

    // Try to refresh token if available
    return this.tryTokenRefresh().pipe(
      switchMap(isValid => {
        if (isValid) {
          const roleCheck = this.checkRoleAccess(route);
          return roleCheck instanceof Observable ? roleCheck : of(roleCheck);
        } else {
          this.handleUnauthorizedAccess(state.url);
          return of(false);
        }
      }),
      catchError(() => {
        this.handleUnauthorizedAccess(state.url);
        return of(false);
      })
    );
  }

  private tryTokenRefresh(): Observable<boolean> {
    return new Observable(observer => {
      this.authService.refreshToken().then(token => {
        observer.next(!!token);
        observer.complete();
      }).catch(() => {
        observer.next(false);
        observer.complete();
      });
    });
  }

  private checkRoleAccess(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    // Check if route requires specific roles
    const requiredRoles = route.data?.['roles'] as string[];
    const requiredRole = route.data?.['role'] as string;

    if (requiredRoles || requiredRole) {
      const user = this.authService.getCurrentUser();

      if (!user) {
        this.toastService.showError('Authentication required');
        this.router.navigate(['/auth/login']);
        return false;
      }

      // Check single role requirement
      if (requiredRole && user.role !== requiredRole) {
        this.toastService.showError('Insufficient permissions');
        this.router.navigate(['/unauthorized']);
        return false;
      }

      // Check multiple roles requirement
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        this.toastService.showError('Insufficient permissions');
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }

  private handleUnauthorizedAccess(returnUrl: string): void {
    // Store the attempted URL for redirect after login
    sessionStorage.setItem('returnUrl', returnUrl);
    this.toastService.showWarning('Please login to continue');
    this.router.navigate(['/auth/login']);
  }
}