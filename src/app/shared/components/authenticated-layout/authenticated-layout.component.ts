import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-authenticated-layout',
  templateUrl: './authenticated-layout.component.html',
  styleUrls: ['./authenticated-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AuthenticatedLayoutComponent {

  constructor(
    private router: Router,
    private menuController: MenuController
  ) { }

  logout() {
    // TODO: Implement logout logic
    this.menuController.close();
    this.router.navigate(['/auth/login']);
  }
}