import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type SpinnerType = 'bubbles' | 'circles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small';
export type SpinnerSize = 'small' | 'default' | 'large';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="loading-container" [class]="containerClass">
      <ion-spinner
        [name]="type"
        [attr.aria-label]="ariaLabel"
        [class]="spinnerClass"
      ></ion-spinner>

      <div class="loading-text" *ngIf="text">
        {{ text }}
      </div>

      <div class="loading-overlay" *ngIf="overlay"></div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
    }

    .loading-container.inline {
      display: inline-flex;
      flex-direction: row;
      gap: var(--spacing-sm);
    }

    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    }

    .loading-container.overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 100;
    }

    .loading-text {
      color: var(--theme-text-secondary);
      font-size: var(--font-size-sm);
      text-align: center;
    }

    .spinner-small {
      width: 20px;
      height: 20px;
    }

    .spinner-large {
      width: 40px;
      height: 40px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: -1;
    }

    :host-context([data-theme="dark"]) .loading-overlay {
      background-color: rgba(30, 30, 30, 0.8);
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() type: SpinnerType = 'crescent';
  @Input() size: SpinnerSize = 'default';
  @Input() text?: string;
  @Input() overlay = false;
  @Input() fullscreen = false;
  @Input() inline = false;
  @Input() ariaLabel = 'Loading';

  get containerClass(): string {
    if (this.fullscreen) return 'fullscreen';
    if (this.overlay) return 'overlay';
    if (this.inline) return 'inline';
    return '';
  }

  get spinnerClass(): string {
    switch (this.size) {
      case 'small': return 'spinner-small';
      case 'large': return 'spinner-large';
      default: return '';
    }
  }
}