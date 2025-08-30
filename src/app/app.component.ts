import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private storage: Storage,
    private platform: Platform,
    private themeService: ThemeService
  ) {}

  async ngOnInit() {
    // Initialize storage when platform is ready
    await this.platform.ready();
    await this.storage.create();

    // Theme service will auto-initialize
  }
}
