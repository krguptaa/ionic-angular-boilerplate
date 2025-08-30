import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type ToastType = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';
export type ToastPosition = 'top' | 'bottom' | 'middle';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div
      class="toast-container"
      [class]="getToastClasses()"
      [class.show]="show"
      [class.hide]="!show"
      [style.transform]="getTransform()"
    >
      <div class="toast-content">
        <ion-icon
          *ngIf="icon"
          [name]="icon"
          class="toast-icon"
          [attr.aria-label]="type + ' icon'"
        ></ion-icon>

        <div class="toast-text">
          <div class="toast-title" *ngIf="title">{{ title }}</div>
          <div class="toast-message">{{ message }}</div>
        </div>

        <ion-button
          *ngIf="dismissible"
          fill="clear"
          size="small"
          class="toast-close"
          (click)="dismiss()"
          [attr.aria-label]="'Close toast'"
        >
          <ion-icon name="close" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <div class="toast-progress" *ngIf="autoDismiss && show">
        <div
          class="toast-progress-bar"
          [style.animation-duration]="duration + 'ms'"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      min-width: 300px;
      max-width: 500px;
      margin: var(--spacing-sm);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-xl);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease-in-out;
    }

    .toast-container.show {
      opacity: 1;
      pointer-events: auto;
    }

    .toast-container.hide {
      opacity: 0;
      pointer-events: none;
    }

    .toast-container.top {
      top: var(--spacing-lg);
    }

    .toast-container.bottom {
      bottom: var(--spacing-lg);
    }

    .toast-container.middle {
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .toast-container.success {
      background-color: var(--ion-color-success);
      color: var(--ion-color-success-contrast);
    }

    .toast-container.warning {
      background-color: var(--ion-color-warning);
      color: var(--ion-color-warning-contrast);
    }

    .toast-container.danger {
      background-color: var(--ion-color-danger);
      color: var(--ion-color-danger-contrast);
    }

    .toast-container.info {
      background-color: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .toast-container.primary {
      background-color: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .toast-container.secondary {
      background-color: var(--ion-color-secondary);
      color: var(--ion-color-secondary-contrast);
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
    }

    .toast-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .toast-text {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-xs);
    }

    .toast-message {
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
    }

    .toast-close {
      flex-shrink: 0;
      --color: currentColor;
      --padding-start: var(--spacing-xs);
      --padding-end: var(--spacing-xs);
      opacity: 0.8;
    }

    .toast-close:hover {
      opacity: 1;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
      overflow: hidden;
    }

    .toast-progress-bar {
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      animation: progress linear forwards;
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    /* Slide animations */
    .toast-container.top.show {
      animation: slideDown 0.3s ease-out forwards;
    }

    .toast-container.bottom.show {
      animation: slideUp 0.3s ease-out forwards;
    }

    .toast-container.top.hide,
    .toast-container.bottom.hide {
      animation: slideOut 0.3s ease-in forwards;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
      }
    }

    /* Responsive design */
    @media (max-width: 576px) {
      .toast-container {
        left: var(--spacing-sm);
        right: var(--spacing-sm);
        transform: none;
        min-width: auto;
        max-width: none;
        width: calc(100vw - 2 * var(--spacing-sm));
      }

      .toast-container.top.show,
      .toast-container.bottom.show {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }

    /* Dark theme adjustments */
    :host-context([data-theme="dark"]) .toast-progress {
      background-color: rgba(0, 0, 0, 0.3);
    }

    :host-context([data-theme="dark"]) .toast-progress-bar {
      background-color: rgba(255, 255, 255, 0.6);
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() type: ToastType = 'info';
  @Input() title?: string;
  @Input() message = '';
  @Input() icon?: string;
  @Input() dismissible = true;
  @Input() autoDismiss = true;
  @Input() duration = 4000;
  @Input() position: ToastPosition = 'top';
  @Input() show = true;

  @Output() dismissed = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.autoDismiss && this.show) {
      this.startAutoDismiss();
    }

    // Set default icon based on type
    if (!this.icon) {
      this.icon = this.getDefaultIcon();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(): void {
    this.show = false;
    this.dismissed.emit();
  }

  private startAutoDismiss(): void {
    timer(this.duration)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dismiss();
      });
  }

  private getDefaultIcon(): string {
    switch (this.type) {
      case 'success': return 'checkmark-circle-outline';
      case 'warning': return 'warning-outline';
      case 'danger': return 'close-circle-outline';
      case 'info': return 'information-circle-outline';
      case 'primary': return 'information-circle-outline';
      case 'secondary': return 'help-circle-outline';
      default: return 'information-circle-outline';
    }
  }

  getTransform(): string {
    if (!this.show) return 'translateX(-50%) translateY(-10px)';

    switch (this.position) {
      case 'top':
        return 'translateX(-50%) translateY(0)';
      case 'bottom':
        return 'translateX(-50%) translateY(0)';
      case 'middle':
        return 'translate(-50%, -50%)';
      default:
        return 'translateX(-50%) translateY(0)';
    }
  }

  getToastClasses(): string {
    return `toast-${this.type} toast-${this.position}`;
  }
}