import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type ButtonType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'light' | 'dark';
export type ButtonSize = 'small' | 'default' | 'large';
export type ButtonShape = 'square' | 'round' | 'circle';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-button
      [color]="color"
      [fill]="fill"
      [size]="size"
      [disabled]="disabled || loading"
      [expand]="expand"
      [strong]="strong"
      [class.ion-button-custom]="true"
      [class.loading]="loading"
      [class.full-width]="fullWidth"
      [class.no-shadow]="noShadow"
      (click)="onClick($event)"
    >
      <ion-spinner
        *ngIf="loading"
        slot="start"
        name="crescent"
        [attr.aria-label]="'Loading'"
      ></ion-spinner>

      <ion-icon
        *ngIf="icon && !loading"
        [name]="icon"
        slot="start"
      ></ion-icon>

      <ng-content></ng-content>

      <ion-icon
        *ngIf="iconEnd && !loading"
        [name]="iconEnd"
        slot="end"
      ></ion-icon>
    </ion-button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .loading {
      pointer-events: none;
      opacity: 0.7;
    }

    .full-width {
      width: 100%;
    }

    .no-shadow {
      --box-shadow: none !important;
    }

    ion-button {
      --border-radius: var(--border-radius-lg);
      font-weight: var(--font-weight-medium);
      transition: all 0.2s ease-in-out;
    }

    ion-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

    ion-button:active:not(:disabled) {
      transform: translateY(0);
    }
  `]
})
export class CustomButtonComponent {
  @Input() type: ButtonType = 'primary';
  @Input() size: ButtonSize = 'default';
  @Input() shape: ButtonShape = 'square';
  @Input() fill: 'clear' | 'outline' | 'solid' | 'default' = 'solid';
  @Input() expand: 'block' | 'full' | undefined;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() strong = false;
  @Input() fullWidth = false;
  @Input() noShadow = false;
  @Input() icon?: string;
  @Input() iconEnd?: string;

  @Output() buttonClick = new EventEmitter<Event>();

  @HostBinding('class') get hostClasses() {
    return `button-${this.type} button-${this.size} button-${this.shape}`;
  }

  get color(): string {
    switch (this.type) {
      case 'primary': return 'primary';
      case 'secondary': return 'secondary';
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      case 'light': return 'light';
      case 'dark': return 'dark';
      default: return 'primary';
    }
  }

  get buttonSize(): 'small' | 'default' | 'large' {
    switch (this.size) {
      case 'small': return 'small';
      case 'large': return 'large';
      default: return 'default';
    }
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}