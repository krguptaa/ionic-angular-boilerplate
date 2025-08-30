import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type BadgeType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark';
export type BadgeSize = 'small' | 'default' | 'large';
export type BadgeShape = 'square' | 'round' | 'circle';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <span class="badge" [class]="getBadgeClasses()">
      <ion-icon *ngIf="icon" [name]="icon" class="badge-icon"></ion-icon>
      <span class="badge-text" *ngIf="text || count !== null">
        {{ count !== null ? (count | number) : text }}
      </span>
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      line-height: 1;
      white-space: nowrap;
      border-radius: var(--border-radius-full);
      padding: 0.25rem 0.5rem;
      min-width: 1.25rem;
      height: 1.25rem;
      transition: all 0.2s ease-in-out;
    }

    /* Badge Types */
    .badge.primary {
      background-color: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .badge.secondary {
      background-color: var(--ion-color-secondary);
      color: var(--ion-color-secondary-contrast);
    }

    .badge.success {
      background-color: var(--ion-color-success);
      color: var(--ion-color-success-contrast);
    }

    .badge.warning {
      background-color: var(--ion-color-warning);
      color: var(--ion-color-warning-contrast);
    }

    .badge.danger {
      background-color: var(--ion-color-danger);
      color: var(--ion-color-danger-contrast);
    }

    .badge.info {
      background-color: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .badge.light {
      background-color: var(--ion-color-light);
      color: var(--ion-color-light-contrast);
    }

    .badge.dark {
      background-color: var(--ion-color-dark);
      color: var(--ion-color-dark-contrast);
    }

    /* Badge Sizes */
    .badge.small {
      font-size: 0.625rem;
      padding: 0.125rem 0.25rem;
      min-width: 1rem;
      height: 1rem;
    }

    .badge.large {
      font-size: var(--font-size-sm);
      padding: 0.375rem 0.75rem;
      min-width: 1.5rem;
      height: 1.5rem;
    }

    /* Badge Shapes */
    .badge.square {
      border-radius: var(--border-radius-sm);
    }

    .badge.circle {
      border-radius: var(--border-radius-full);
    }

    /* Special States */
    .badge.outlined {
      background-color: transparent;
      border: 1px solid currentColor;
    }

    .badge.outlined.primary {
      color: var(--ion-color-primary);
      border-color: var(--ion-color-primary);
    }

    .badge.outlined.secondary {
      color: var(--ion-color-secondary);
      border-color: var(--ion-color-secondary);
    }

    .badge.outlined.success {
      color: var(--ion-color-success);
      border-color: var(--ion-color-success);
    }

    .badge.outlined.warning {
      color: var(--ion-color-warning);
      border-color: var(--ion-color-warning);
    }

    .badge.outlined.danger {
      color: var(--ion-color-danger);
      border-color: var(--ion-color-danger);
    }

    .badge.pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
      }
      70% {
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
      }
    }

    .badge.dot {
      padding: 0;
      min-width: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
    }

    .badge.dot .badge-text {
      display: none;
    }

    /* Position variants */
    .badge.top-right {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      z-index: 1;
    }

    .badge.top-left {
      position: absolute;
      top: -0.5rem;
      left: -0.5rem;
      z-index: 1;
    }

    .badge.bottom-right {
      position: absolute;
      bottom: -0.5rem;
      right: -0.5rem;
      z-index: 1;
    }

    .badge.bottom-left {
      position: absolute;
      bottom: -0.5rem;
      left: -0.5rem;
      z-index: 1;
    }

    /* Icon styles */
    .badge-icon {
      font-size: 0.75em;
    }

    .badge.small .badge-icon {
      font-size: 0.6em;
    }

    .badge.large .badge-icon {
      font-size: 0.8em;
    }

    /* Text styles */
    .badge-text {
      font-variant-numeric: tabular-nums;
    }

    /* Hover effects */
    .badge.clickable {
      cursor: pointer;
    }

    .badge.clickable:hover {
      transform: scale(1.05);
    }

    .badge.clickable:active {
      transform: scale(0.95);
    }

    /* Dark theme adjustments */
    :host-context([data-theme="dark"]) .badge.outlined {
      border-color: rgba(255, 255, 255, 0.3);
    }

    /* Responsive design */
    @media (max-width: 576px) {
      .badge {
        font-size: 0.625rem;
        padding: 0.125rem 0.25rem;
        min-width: 1rem;
        height: 1rem;
      }

      .badge.large {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        min-width: 1.25rem;
        height: 1.25rem;
      }
    }
  `]
})
export class BadgeComponent {
  @Input() type: BadgeType = 'primary';
  @Input() size: BadgeSize = 'default';
  @Input() shape: BadgeShape = 'round';
  @Input() text?: string;
  @Input() count: number | null = null;
  @Input() icon?: string;
  @Input() outlined = false;
  @Input() pulse = false;
  @Input() dot = false;
  @Input() position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  @Input() clickable = false;

  @HostBinding('class') get hostClasses() {
    let classes = `badge-${this.type} badge-${this.size} badge-${this.shape}`;
    if (this.outlined) classes += ' outlined';
    if (this.pulse) classes += ' pulse';
    if (this.dot) classes += ' dot';
    if (this.position) classes += ` ${this.position}`;
    if (this.clickable) classes += ' clickable';
    return classes;
  }

  getBadgeClasses(): string {
    let classes = `${this.type} ${this.size} ${this.shape}`;
    if (this.outlined) classes += ' outlined';
    if (this.pulse) classes += ' pulse';
    if (this.dot) classes += ' dot';
    if (this.position) classes += ` ${this.position}`;
    if (this.clickable) classes += ' clickable';
    return classes;
  }
}