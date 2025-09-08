import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthLayoutComponent } from '../../auth-containers/auth-layout/auth-layout.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AuthLayoutComponent]
})
export class ResetPasswordPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
