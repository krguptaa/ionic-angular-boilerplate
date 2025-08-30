import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type CardType = 'default' | 'elevated' | 'outlined' | 'filled';
export type CardSize = 'small' | 'default' | 'large';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-card
      class="custom-card"
      [class]="getCardClasses()"
      [button]="clickable"
      (click)="onCardClick($event)"
    >
      <ion-card-header *ngIf="header || title || subtitle">
        <div class="card-header-content">
          <div class="card-header-text">
            <ion-card-title *ngIf="title">{{ title }}</ion-card-title>
            <ion-card-subtitle *ngIf="subtitle">{{ subtitle }}</ion-card-subtitle>
          </div>
          <div class="card-header-actions" *ngIf="headerActions">
            <ng-content select="[slot=header-actions]"></ng-content>
          </div>
        </div>
      </ion-card-header>

      <ng-content select="[slot=header]"></ng-content>

      <ion-card-content [class]="contentClass">
        <ng-content></ng-content>
      </ion-card-content>

      <ng-content select="[slot=content]"></ng-content>

      <div class="card-footer" *ngIf="footer || showFooter">
        <div class="card-footer-content">
          <ng-content select="[slot=footer]"></ng-content>
          <div class="card-footer-actions" *ngIf="footerActions">
            <ng-content select="[slot=footer-actions]"></ng-content>
          </div>
        </div>
      </div>
    </ion-card>
  `,
  styles: [`
    .custom-card {
      --background: var(--theme-bg-primary);
      --color: var(--theme-text-primary);
      margin: 0;
      border-radius: var(--border-radius-lg);
      transition: all 0.3s ease-in-out;
      overflow: hidden;
    }

    .custom-card.clickable {
      cursor: pointer;
    }

    .custom-card.clickable:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    .custom-card.clickable:active {
      transform: translateY(0);
    }

    /* Card Types */
    .custom-card.default {
      --box-shadow: var(--shadow-md);
      border: 1px solid var(--theme-border);
    }

    .custom-card.elevated {
      --box-shadow: var(--shadow-lg);
      border: none;
    }

    .custom-card.outlined {
      --box-shadow: none;
      border: 2px solid var(--theme-border);
      --background: transparent;
    }

    .custom-card.filled {
      --box-shadow: none;
      border: none;
      --background: var(--theme-bg-secondary);
    }

    /* Card Sizes */
    .custom-card.small {
      --padding: var(--spacing-sm);
    }

    .custom-card.small ion-card-header {
      padding-bottom: var(--spacing-xs);
    }

    .custom-card.small ion-card-content {
      padding-top: 0;
      padding-bottom: var(--spacing-sm);
    }

    .custom-card.large {
      --padding: var(--spacing-xl);
    }

    .custom-card.large ion-card-header {
      padding-bottom: var(--spacing-lg);
    }

    .custom-card.large ion-card-content {
      padding-top: 0;
      padding-bottom: var(--spacing-xl);
    }

    /* Header Styles */
    .card-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .card-header-text {
      flex: 1;
      min-width: 0;
    }

    .card-header-actions {
      flex-shrink: 0;
      margin-left: var(--spacing-md);
    }

    /* Content Styles */
    .content-compact {
      padding-top: var(--spacing-sm) !important;
      padding-bottom: var(--spacing-sm) !important;
    }

    .content-spacious {
      padding-top: var(--spacing-lg) !important;
      padding-bottom: var(--spacing-lg) !important;
    }

    /* Footer Styles */
    .card-footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--theme-border-light);
    }

    .card-footer-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    /* Loading State */
    .custom-card.loading {
      opacity: 0.7;
      pointer-events: none;
    }

    .custom-card.loading::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* Dark theme adjustments */
    :host-context([data-theme="dark"]) .card-footer-content {
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    /* Responsive design */
    @media (max-width: 576px) {
      .card-header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }

      .card-header-actions {
        margin-left: 0;
        align-self: flex-end;
      }

      .card-footer-content {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }

      .card-footer-actions {
        width: 100%;
      }

      .card-footer-actions ion-button {
        flex: 1;
      }
    }
  `]
})
export class CardComponent {
  @Input() type: CardType = 'default';
  @Input() size: CardSize = 'default';
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() header?: boolean;
  @Input() footer?: boolean;
  @Input() showFooter = false;
  @Input() clickable = false;
  @Input() loading = false;
  @Input() headerActions = false;
  @Input() footerActions = false;
  @Input() contentSpacing: 'compact' | 'default' | 'spacious' = 'default';

  @Output() cardClick = new EventEmitter<Event>();

  @HostBinding('class') get hostClasses() {
    return `card-${this.type} card-${this.size}`;
  }

  get contentClass(): string {
    switch (this.contentSpacing) {
      case 'compact': return 'content-compact';
      case 'spacious': return 'content-spacious';
      default: return '';
    }
  }

  getCardClasses(): string {
    let classes = `${this.type} ${this.size}`;
    if (this.clickable) classes += ' clickable';
    if (this.loading) classes += ' loading';
    return classes;
  }

  onCardClick(event: Event): void {
    if (this.clickable && !this.loading) {
      this.cardClick.emit(event);
    }
  }
}