import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type AlertType = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';
export type AlertPosition = 'top' | 'bottom' | 'middle';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div
      class="alert-container"
      [class]="getAlertClasses()"
      [class.dismissible]="dismissible"
      [class.auto-dismiss]="autoDismiss"
      [class.show]="show"
      [class.hide]="!show"
    >
      <div class="alert-content">
        <ion-icon
          *ngIf="icon"
          [name]="icon"
          class="alert-icon"
          [attr.aria-label]="type + ' icon'"
        ></ion-icon>

        <div class="alert-text">
          <div class="alert-title" *ngIf="title">{{ title }}</div>
          <div class="alert-message" [innerHTML]="message"></div>
        </div>

        <ion-button
          *ngIf="dismissible"
          fill="clear"
          size="small"
          class="alert-close"
          (click)="dismiss()"
          [attr.aria-label]="'Close alert'"
        >
          <ion-icon name="close" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <div class="alert-actions" *ngIf="actions && actions.length > 0">
        <ion-button
          *ngFor="let action of actions"
          [fill]="action.fill || 'clear'"
          [color]="action.color || 'primary'"
          size="small"
          (click)="handleAction(action)"
        >
          {{ action.text }}
        </ion-button>
      </div>
    </div>
  `,
  styles: [`
    .alert-container {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      border-radius: var(--border-radius-md);
      border-left: 4px solid;
      transition: all 0.3s ease-in-out;
      opacity: 0;
      transform: translateY(-10px);
      animation: slideIn 0.3s ease-out forwards;
    }

    .alert-container.show {
      opacity: 1;
      transform: translateY(0);
    }

    .alert-container.hide {
      opacity: 0;
      transform: translateY(-10px);
    }

    .alert-container.success {
      background-color: rgba(45, 211, 111, 0.1);
      border-left-color: var(--ion-color-success);
      color: var(--ion-color-success-contrast);
    }

    .alert-container.warning {
      background-color: rgba(255, 196, 9, 0.1);
      border-left-color: var(--ion-color-warning);
      color: var(--ion-color-warning-contrast);
    }

    .alert-container.danger {
      background-color: rgba(235, 68, 90, 0.1);
      border-left-color: var(--ion-color-danger);
      color: var(--ion-color-danger-contrast);
    }

    .alert-container.info {
      background-color: rgba(45, 211, 111, 0.1);
      border-left-color: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .alert-container.primary {
      background-color: rgba(56, 128, 255, 0.1);
      border-left-color: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .alert-container.secondary {
      background-color: rgba(63, 194, 255, 0.1);
      border-left-color: var(--ion-color-secondary);
      color: var(--ion-color-secondary-contrast);
    }

    .alert-content {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    .alert-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .alert-text {
      flex: 1;
      min-width: 0;
    }

    .alert-title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-base);
      margin-bottom: var(--spacing-xs);
    }

    .alert-message {
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
    }

    .alert-close {
      flex-shrink: 0;
      --color: inherit;
      --padding-start: var(--spacing-xs);
      --padding-end: var(--spacing-xs);
    }

    .alert-actions {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
      padding-top: var(--spacing-sm);
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .alert-actions ion-button {
      --border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
    }

    .auto-dismiss {
      position: relative;
    }

    .auto-dismiss::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background-color: currentColor;
      animation: countdown linear forwards;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes countdown {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    /* Dark theme adjustments */
    :host-context([data-theme="dark"]) .alert-actions {
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    /* Responsive design */
    @media (max-width: 576px) {
      .alert-container {
        padding: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
      }

      .alert-content {
        gap: var(--spacing-xs);
      }

      .alert-actions {
        flex-direction: column;
      }

      .alert-actions ion-button {
        width: 100%;
      }
    }
  `]
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() type: AlertType = 'info';
  @Input() title?: string;
  @Input() message = '';
  @Input() icon?: string;
  @Input() dismissible = true;
  @Input() autoDismiss = false;
  @Input() autoDismissDelay = 5000;
  @Input() show = true;
  @Input() position: AlertPosition = 'top';
  @Input() actions?: Array<{
    text: string;
    action: string;
    fill?: 'clear' | 'outline' | 'solid';
    color?: string;
  }>;

  @Output() dismissed = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<string>();

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

  handleAction(action: { text: string; action: string }): void {
    this.actionClicked.emit(action.action);
  }

  private startAutoDismiss(): void {
    timer(this.autoDismissDelay)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dismiss();
      });
  }

  private getDefaultIcon(): string {
    switch (this.type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'danger': return 'close-circle';
      case 'info': return 'information-circle';
      case 'primary': return 'information-circle';
      case 'secondary': return 'help-circle';
      default: return 'information-circle';
    }
  }

  getAlertClasses(): string {
    return `alert-${this.type} alert-${this.position}`;
  }
}