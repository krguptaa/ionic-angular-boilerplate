import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HeaderComponent {
  @Input() appTitle: string = 'Boilerplate';
  @Input() showNotifications: boolean = true;
  @Input() showUserMenu: boolean = true;
  @Input() notificationCount: number = 0;
  @Input() userAvatar?: string;

  @Output() notificationClick = new EventEmitter<void>();
  @Output() userMenuClick = new EventEmitter<void>();

  constructor() { }

  onNotificationClick() {
    this.notificationClick.emit();
  }

  onUserMenuClick() {
    this.userMenuClick.emit();
  }
}