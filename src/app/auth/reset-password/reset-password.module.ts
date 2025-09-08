import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResetPasswordPageRoutingModule } from './reset-password-routing.module';

import { ResetPasswordPage } from './reset-password.page';
import { AuthLayoutComponent } from '../../auth-containers/auth-layout/auth-layout.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetPasswordPageRoutingModule,
    AuthLayoutComponent,
    ResetPasswordPage
  ]
})
export class ResetPasswordPageModule {}
