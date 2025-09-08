import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PinLoginPageRoutingModule } from './pin-login-routing.module';

import { PinLoginPage } from './pin-login.page';
import { AuthLayoutComponent } from '../../auth-containers/auth-layout/auth-layout.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PinLoginPageRoutingModule,
    AuthLayoutComponent,
    PinLoginPage
  ]
})
export class PinLoginPageModule {}
