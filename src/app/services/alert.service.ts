import { Injectable } from '@angular/core';
import { AlertController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Observable, from, BehaviorSubject } from 'rxjs';

export interface AlertOptions {
  header?: string;
  subHeader?: string;
  message?: string;
  buttons?: any[];
  inputs?: any[];
  backdropDismiss?: boolean;
  cssClass?: string;
}

export interface ConfirmOptions extends AlertOptions {
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export interface ModalOptions {
  component: any;
  componentProps?: { [key: string]: any };
  presentingElement?: HTMLElement;
  showBackdrop?: boolean;
  backdropDismiss?: boolean;
  cssClass?: string;
  animated?: boolean;
  swipeToClose?: boolean;
}

export interface LoadingOptions {
  message?: string;
  duration?: number;
  spinner?: 'bubbles' | 'circles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small';
  cssClass?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  // Alert Methods
  async showAlert(options: AlertOptions): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header: options.header,
      subHeader: options.subHeader,
      message: options.message,
      buttons: options.buttons || ['OK'],
      inputs: options.inputs,
      backdropDismiss: options.backdropDismiss !== false,
      cssClass: options.cssClass
    });

    await alert.present();
    return alert;
  }

  // Confirmation Dialog
  confirm(options: ConfirmOptions): Observable<boolean> {
    return from(this.showConfirmDialog(options));
  }

  private async showConfirmDialog(options: ConfirmOptions): Promise<boolean> {
    const typeClasses = {
      primary: 'alert-primary',
      secondary: 'alert-secondary',
      success: 'alert-success',
      warning: 'alert-warning',
      danger: 'alert-danger'
    };

    const alert = await this.alertController.create({
      header: options.header,
      subHeader: options.subHeader,
      message: options.message,
      buttons: [
        {
          text: options.cancelText || 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: options.confirmText || 'Confirm',
          role: 'confirm',
          cssClass: 'alert-button-confirm'
        }
      ],
      backdropDismiss: options.backdropDismiss !== false,
      cssClass: `${options.cssClass || ''} ${typeClasses[options.type || 'primary']}`.trim()
    });

    await alert.present();

    const result = await alert.onDidDismiss();
    return result.role === 'confirm';
  }

  // Success Alert
  async showSuccess(message: string, header = 'Success'): Promise<void> {
    await this.showAlert({
      header,
      message,
      cssClass: 'alert-success',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-success'
        }
      ]
    });
  }

  // Error Alert
  async showError(message: string, header = 'Error'): Promise<void> {
    await this.showAlert({
      header,
      message,
      cssClass: 'alert-error',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-error'
        }
      ]
    });
  }

  // Warning Alert
  async showWarning(message: string, header = 'Warning'): Promise<void> {
    await this.showAlert({
      header,
      message,
      cssClass: 'alert-warning',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-warning'
        }
      ]
    });
  }

  // Info Alert
  async showInfo(message: string, header = 'Information'): Promise<void> {
    await this.showAlert({
      header,
      message,
      cssClass: 'alert-info',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-info'
        }
      ]
    });
  }

  // Modal Methods
  async showModal(options: ModalOptions): Promise<HTMLIonModalElement> {
    const modal = await this.modalController.create({
      component: options.component,
      componentProps: options.componentProps,
      presentingElement: options.presentingElement,
      showBackdrop: options.showBackdrop !== false,
      backdropDismiss: options.backdropDismiss !== false,
      cssClass: options.cssClass,
      animated: options.animated !== false
    });

    await modal.present();
    return modal;
  }

  async dismissModal(data?: any): Promise<void> {
    await this.modalController.dismiss(data);
  }

  // Loading Methods
  async showLoading(options: LoadingOptions = {}): Promise<HTMLIonLoadingElement> {
    this.loadingSubject.next(true);

    const loading = await this.loadingController.create({
      message: options.message || 'Loading...',
      duration: options.duration,
      spinner: options.spinner || 'crescent',
      cssClass: options.cssClass
    });

    await loading.present();

    // Auto-dismiss loading when duration is set
    if (options.duration) {
      setTimeout(() => {
        this.loadingSubject.next(false);
      }, options.duration);
    }

    return loading;
  }

  async hideLoading(): Promise<void> {
    this.loadingSubject.next(false);
    await this.loadingController.dismiss();
  }

  // Toast Methods (convenience methods)
  async showToast(message: string, options: any = {}): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: options.duration || 3000,
      position: options.position || 'bottom',
      color: options.color,
      icon: options.icon,
      buttons: options.buttons,
      cssClass: options.cssClass
    });

    await toast.present();
  }

  // Specialized Alerts
  async showDeleteConfirmation(itemName: string): Promise<boolean> {
    return this.showConfirmDialog({
      header: 'Delete Confirmation',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  async showLogoutConfirmation(): Promise<boolean> {
    return this.showConfirmDialog({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      type: 'warning'
    });
  }

  async showNetworkError(): Promise<void> {
    await this.showError(
      'Network connection failed. Please check your internet connection and try again.',
      'Connection Error'
    );
  }

  async showSessionExpired(): Promise<void> {
    await this.showWarning(
      'Your session has expired. Please login again.',
      'Session Expired'
    );
  }

  // Input Prompts
  async showInputPrompt(options: {
    header: string;
    message?: string;
    placeholder?: string;
    value?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    required?: boolean;
  }): Promise<string | null> {
    const alert = await this.alertController.create({
      header: options.header,
      message: options.message,
      inputs: [
        {
          name: 'value',
          type: options.type || 'text',
          placeholder: options.placeholder,
          value: options.value
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (data) => {
            if (options.required && !data.value?.trim()) {
              return false; // Keep alert open
            }
            return data.value;
          }
        }
      ]
    });

    await alert.present();

    const result = await alert.onDidDismiss();
    if (result.role === 'cancel') {
      return null;
    }

    return result.data?.values?.value || null;
  }

  // Selection Dialog
  async showSelection(options: {
    header: string;
    message?: string;
    options: Array<{ text: string; value: any; checked?: boolean }>;
    multiSelect?: boolean;
  }): Promise<any> {
    const inputs: any[] = options.options.map(option => ({
      name: options.multiSelect ? `option_${option.value}` : 'selected',
      type: (options.multiSelect ? 'checkbox' : 'radio') as 'checkbox' | 'radio',
      label: option.text,
      value: option.value,
      checked: option.checked
    }));

    const alert = await this.alertController.create({
      header: options.header,
      message: options.message,
      inputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (data) => {
            if (options.multiSelect) {
              const selected = Object.keys(data).filter(key => data[key]);
              return selected.map(key => key.replace('option_', ''));
            }
            return data.selected;
          }
        }
      ]
    });

    await alert.present();

    const result = await alert.onDidDismiss();
    if (result.role === 'cancel') {
      return null;
    }

    return result.data?.values || null;
  }

  // Utility Methods
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Dismiss all overlays
  async dismissAll(): Promise<void> {
    await Promise.all([
      this.alertController.dismiss(),
      this.modalController.dismiss(),
      this.loadingController.dismiss(),
      this.toastController.dismiss()
    ]);
  }
}