import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Components
import { CustomButtonComponent } from './components/custom-button/custom-button.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { CustomModalComponent } from './components/custom-modal/custom-modal.component';
import { AlertComponent } from './components/alert/alert.component';
import { ToastComponent } from './components/toast/toast.component';
import { CardComponent } from './components/card/card.component';
import { BadgeComponent } from './components/badge/badge.component';

// Services
import { ThemeService } from '../services/theme.service';
import { ToastService } from '../services/toast.service';

@NgModule({
  declarations: [CustomInputComponent, CustomModalComponent],
  imports: [
    CommonModule,
    IonicModule,
    CustomButtonComponent,
    LoadingSpinnerComponent,
    ThemeToggleComponent,
    AlertComponent,
    ToastComponent,
    CardComponent,
    BadgeComponent
  ],
  exports: [
    CustomButtonComponent,
    LoadingSpinnerComponent,
    ThemeToggleComponent,
    CustomInputComponent,
    CustomModalComponent,
    AlertComponent,
    ToastComponent,
    CardComponent,
    BadgeComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    ThemeService,
    ToastService
  ]
})
export class SharedModule { }