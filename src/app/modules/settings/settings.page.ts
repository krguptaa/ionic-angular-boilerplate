import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { PushNotificationsService } from '../../services/push-notifications.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SettingsPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isDarkMode = false;
  currentThemeLabel = 'Light Mode';
  pushNotificationsEnabled = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private pushNotificationsService: PushNotificationsService,
    private toastService: ToastService,
    private router: Router,
    private menuController: MenuController
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDarkMode = theme === 'dark';
        this.currentThemeLabel = this.themeService.getThemeLabel();
      });

    // Initialize push notifications status
    this.pushNotificationsEnabled = this.pushNotificationsService.getNotificationSettings().isRegistered;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  async togglePushNotifications() {
    if (this.pushNotificationsEnabled) {
      await this.pushNotificationsService.unregister();
      this.pushNotificationsEnabled = false;
    } else {
      const success = await this.pushNotificationsService.register();
      this.pushNotificationsEnabled = success;
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.menuController.close();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
