import { Injectable } from '@angular/core';
import {
  PushNotifications,
  PushNotificationSchema,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

import { NotificationData } from '../models';
import { ToastService } from './toast.service';
import { PlatformUtils } from '../utilities';

export interface PushNotificationOptions {
  title: string;
  body: string;
  id?: string;
  sound?: boolean;
  silent?: boolean;
  data?: any;
  schedule?: {
    at?: Date;
    every?: 'year' | 'month' | 'two-weeks' | 'week' | 'day' | 'hour' | 'minute';
    count?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  private notificationSubject = new BehaviorSubject<NotificationData | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  private isRegistered = false;
  private notifications: NotificationData[] = [];

  constructor(
    private platform: Platform,
    private toastService: ToastService,
    private platformUtils: PlatformUtils
  ) {}

  /**
   * Check if push notifications are supported
   */
  async isPushAvailable(): Promise<boolean> {
    try {
      if (!Capacitor.isPluginAvailable('PushNotifications')) {
        return false;
      }

      // For web, check if service workers and push messaging are supported
      if (this.platformUtils.isWeb()) {
        return 'serviceWorker' in navigator && 'PushManager' in window;
      }

      return true;
    } catch (error) {
      console.error('Error checking push notification availability:', error);
      return false;
    }
  }

  /**
   * Request push notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!(await this.isPushAvailable())) {
        console.warn('Push notifications are not available on this platform');
        return false;
      }

      const permissionStatus = await PushNotifications.requestPermissions();

      if (permissionStatus.receive === 'granted') {
        return true;
      } else {
        console.warn('Push notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting push permissions:', error);
      return false;
    }
  }

  /**
   * Register for push notifications
   */
  async register(): Promise<boolean> {
    try {
      if (!(await this.isPushAvailable())) {
        this.toastService.showWarning('Push notifications are not supported on this device');
        return false;
      }

      if (!(await this.requestPermissions())) {
        this.toastService.showError('Push notification permissions are required');
        return false;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Set up event listeners
      this.setupEventListeners();

      this.isRegistered = true;
      this.toastService.showSuccess('Push notifications enabled');
      return true;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      this.toastService.showError('Failed to enable push notifications');
      return false;
    }
  }

  /**
   * Unregister from push notifications
   */
  async unregister(): Promise<void> {
    try {
      if (this.isRegistered) {
        await PushNotifications.unregister();
        this.isRegistered = false;
        this.tokenSubject.next(null);
        this.toastService.showInfo('Push notifications disabled');
      }
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  }

  /**
   * Set up push notification event listeners
   */
  private setupEventListeners(): void {
    // Registration successful
    PushNotifications.addListener('registration', (token: PushNotificationToken) => {
      console.log('Push notification registration successful, token:', token.value);
      this.tokenSubject.next(token.value);
    });

    // Registration failed
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push notification registration failed:', error);
      this.toastService.showError('Failed to register for push notifications');
    });

    // Push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);

      const notificationData: NotificationData = {
        id: notification.id || Date.now().toString(),
        title: notification.title || 'Notification',
        body: notification.body || '',
        data: notification.data,
        timestamp: new Date(),
        read: false
      };

      this.notifications.unshift(notificationData);
      this.notificationSubject.next(notificationData);

      // Show toast notification
      this.toastService.showInfo(notification.body || 'New notification received');
    });

    // Push notification action performed
    PushNotifications.addListener('pushNotificationActionPerformed', (action: PushNotificationActionPerformed) => {
      console.log('Push notification action performed:', action);

      const notification = action.notification;
      const actionId = action.actionId;

      // Handle the action
      this.handleNotificationAction(notification, actionId);
    });
  }

  /**
   * Handle notification action
   */
  private handleNotificationAction(notification: PushNotificationSchema, actionId: string): void {
    console.log('Handling notification action:', actionId, notification);

    // You can implement custom action handling here
    // For example, navigate to specific pages, perform actions, etc.

    switch (actionId) {
      case 'view':
        // Navigate to relevant page
        console.log('View action triggered');
        break;
      case 'dismiss':
        // Mark as read
        console.log('Dismiss action triggered');
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  }

  /**
   * Get push notification token
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Get all notifications
   */
  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notifications = [];
  }

  /**
   * Remove specific notification
   */
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  /**
   * Send local notification (for testing or scheduled notifications)
   */
  async scheduleLocalNotification(options: PushNotificationOptions): Promise<string | null> {
    try {
      if (!this.platformUtils.isNative()) {
        console.warn('Local notifications are only available on native platforms');
        return null;
      }

      const notificationId = options.id || Date.now().toString();

      // Note: Capacitor PushNotifications doesn't have a direct schedule method
      // You would need to use a different plugin like @capacitor/local-notifications
      // This is a placeholder for the concept

      console.log('Local notification scheduled:', options);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      // Implementation would depend on the local notifications plugin used
      console.log('Canceling scheduled notification:', notificationId);
    } catch (error) {
      console.error('Error canceling scheduled notification:', error);
    }
  }

  /**
   * Check notification permissions status
   */
  async checkPermissions(): Promise<{
    granted: boolean;
    denied: boolean;
    prompted: boolean;
  }> {
    try {
      const permissionStatus = await PushNotifications.checkPermissions();

      return {
        granted: permissionStatus.receive === 'granted',
        denied: permissionStatus.receive === 'denied',
        prompted: permissionStatus.receive === 'prompt'
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        granted: false,
        denied: false,
        prompted: false
      };
    }
  }

  /**
   * Get notification settings
   */
  getNotificationSettings(): {
    isRegistered: boolean;
    hasToken: boolean;
    unreadCount: number;
    totalCount: number;
  } {
    return {
      isRegistered: this.isRegistered,
      hasToken: !!this.tokenSubject.value,
      unreadCount: this.getUnreadCount(),
      totalCount: this.notifications.length
    };
  }

  /**
   * Create notification payload for server
   */
  createNotificationPayload(options: PushNotificationOptions): any {
    return {
      to: this.getToken(),
      title: options.title,
      body: options.body,
      data: options.data || {},
      sound: options.sound !== false,
      badge: this.getUnreadCount() + 1
    };
  }

  /**
   * Handle notification data from server
   */
  handleServerNotification(data: any): void {
    const notification: NotificationData = {
      id: data.id || Date.now().toString(),
      title: data.title || 'Notification',
      body: data.body || '',
      data: data.data || {},
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      read: false
    };

    this.notifications.unshift(notification);
    this.notificationSubject.next(notification);

    // Show toast
    this.toastService.showInfo(notification.body);
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    try {
      await this.unregister();
      this.notifications = [];
      this.notificationSubject.next(null);
      this.tokenSubject.next(null);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}