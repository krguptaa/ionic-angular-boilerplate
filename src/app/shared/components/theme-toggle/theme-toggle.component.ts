import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService, ThemeType } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-button
      fill="clear"
      size="default"
      [attr.aria-label]="'Toggle theme'"
      (click)="toggleTheme()"
      class="theme-toggle-button"
    >
      <ion-icon
        [name]="currentIcon"
        slot="icon-only"
        class="theme-icon"
      ></ion-icon>
    </ion-button>
  `,
  styles: [`
    .theme-toggle-button {
      --padding-start: var(--spacing-sm);
      --padding-end: var(--spacing-sm);
      --color: var(--theme-text-primary);
      border-radius: var(--border-radius-lg);
      transition: all 0.2s ease-in-out;
    }

    .theme-toggle-button:hover {
      background-color: var(--theme-bg-secondary);
    }

    .theme-icon {
      font-size: 1.25rem;
      transition: transform 0.2s ease-in-out;
    }

    .theme-toggle-button:active .theme-icon {
      transform: scale(0.95);
    }
  `]
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentIcon = 'sunny';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.updateIcon(theme);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private updateIcon(theme: ThemeType): void {
    switch (theme) {
      case 'light':
        this.currentIcon = 'sunny';
        break;
      case 'dark':
        this.currentIcon = 'moon';
        break;
      default:
        this.currentIcon = 'sunny';
    }
  }
}