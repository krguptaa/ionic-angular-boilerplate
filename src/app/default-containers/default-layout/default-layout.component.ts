import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, MenuComponent]
})
export class DefaultLayoutComponent implements OnInit {
  @Input() showFooter: boolean = true;

  constructor() { }

  ngOnInit() {
    // Initialize any default expanded items if needed
  }
}