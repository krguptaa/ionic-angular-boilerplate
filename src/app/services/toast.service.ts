import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

export interface ToastOptions {
  message: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'light' | 'dark';
  icon?: string;
  buttons?: any[];
  cssClass?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async showSuccess(message: string, duration = 3000): Promise<void> {
    await this.show({
      message,
      duration,
      color: 'success',
      icon: 'checkmark-circle',
      position: 'bottom'
    });
  }

  async showError(message: string, duration = 4000): Promise<void> {
    await this.show({
      message,
      duration,
      color: 'danger',
      icon: 'close-circle',
      position: 'bottom'
    });
  }

  async showWarning(message: string, duration = 3500): Promise<void> {
    await this.show({
      message,
      duration,
      color: 'warning',
      icon: 'warning',
      position: 'bottom'
    });
  }

  async showInfo(message: string, duration = 3000): Promise<void> {
    await this.show({
      message,
      duration,
      color: 'primary',
      icon: 'information-circle',
      position: 'bottom'
    });
  }

  async show(options: ToastOptions): Promise<void> {
    const defaultOptions: Partial<ToastOptions> = {
      duration: 3000,
      position: 'bottom',
      cssClass: 'custom-toast'
    };

    const toastOptions = { ...defaultOptions, ...options };

    const toast = await this.toastController.create({
      message: toastOptions.message,
      duration: toastOptions.duration,
      position: toastOptions.position,
      color: toastOptions.color,
      icon: toastOptions.icon,
      buttons: toastOptions.buttons,
      cssClass: toastOptions.cssClass
    });

    await toast.present();
  }

  async showWithAction(
    message: string,
    actionText: string,
    actionHandler: () => void,
    duration = 5000
  ): Promise<void> {
    await this.show({
      message,
      duration,
      position: 'bottom',
      buttons: [
        {
          text: actionText,
          handler: () => {
            actionHandler();
            return true;
          }
        },
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
  }

  async showLoading(message = 'Loading...', duration?: number): Promise<HTMLIonToastElement> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      cssClass: 'loading-toast'
    });

    await toast.present();
    return toast;
  }

  async dismissAll(): Promise<void> {
    await this.toastController.dismiss();
  }
}