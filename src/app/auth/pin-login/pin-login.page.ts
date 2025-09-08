import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthLayoutComponent } from '../../auth-containers/auth-layout/auth-layout.component';

@Component({
  selector: 'app-pin-login',
  templateUrl: './pin-login.page.html',
  styleUrls: ['./pin-login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AuthLayoutComponent]
})
export class PinLoginPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
