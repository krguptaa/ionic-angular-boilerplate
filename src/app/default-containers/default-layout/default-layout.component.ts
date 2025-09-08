import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MENU_ITEMS, MenuItem } from '../../constants/menu.constants';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class DefaultLayoutComponent implements OnInit {
  @Input() showFooter: boolean = true;

  menuItems: MenuItem[] = MENU_ITEMS;
  expandedItems: { [key: string]: boolean } = {};

  constructor() { }

  ngOnInit() {
    // Initialize any default expanded items if needed
  }

  toggleSubmenu(itemId: string) {
    this.expandedItems[itemId] = !this.expandedItems[itemId];
  }
}