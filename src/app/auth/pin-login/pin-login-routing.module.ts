import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PinLoginPage } from './pin-login.page';

const routes: Routes = [
  {
    path: '',
    component: PinLoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PinLoginPageRoutingModule {}
