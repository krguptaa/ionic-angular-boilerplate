import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule, PreloadAllModules } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { importProvidersFrom } from '@angular/core';
import { ErrorHandler } from '@angular/core';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { GlobalErrorHandler } from './app/services/error-handler.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    importProvidersFrom(HttpClientModule, IonicModule.forRoot(), IonicStorageModule.forRoot()),
    importProvidersFrom(RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }))
  ]
}).catch(err => console.error(err));
