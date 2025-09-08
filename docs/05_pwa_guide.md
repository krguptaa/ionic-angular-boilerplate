# Progressive Web App (PWA) Guide

**Estimated time: 15-20 minutes**

## Overview

This guide covers configuring, building, and deploying the Ionic application as a Progressive Web App (PWA). PWAs provide native app-like experiences in web browsers with offline support, push notifications, and installability.

## 📋 Prerequisites Checklist

Before starting PWA development:

- [ ] **Ionic Frontend**: Complete [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
- [ ] **HTTPS Support**: Required for production PWA features
- [ ] **Modern Browser**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] **Web Server**: Nginx, Apache, or static hosting service

### Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Installable | ✅ 62+ | ✅ 76+ | ✅ 12.1+ | ✅ 79+ |
| Background Sync | ✅ 49+ | ❌ | ❌ | ✅ 79+ |
| Push Notifications | ✅ 42+ | ✅ 44+ | ✅ 16+ | ✅ 79+ |
| Web App Manifest | ✅ 38+ | ✅ 44+ | ✅ 11.1+ | ✅ 79+ |

## 🛠️ PWA Configuration

### Step 1: Update angular.json for PWA

**File**: `angular.json`

The project should already have PWA support configured. Verify the build configuration:

```json
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "options": {
            "serviceWorker": true,
            "ngswConfigPath": "ngsw-config.json"
          }
        }
      }
    }
  }
}
```

### Step 2: Configure Web App Manifest

**File**: `src/manifest.json`

```json
{
  "name": "Ionic App",
  "short_name": "IonicApp",
  "description": "A modern web application built with Ionic",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3880ff",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "en-US",
  "icons": [
    {
      "src": "assets/icon/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icon/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icon/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icon/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      **src**: "assets/icon/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icon/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icon/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icon/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["business", "productivity"],
  "screenshots": [
    {
      "src": "assets/screenshots/screenshot1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "label": "App Homepage"
    }
  ]
}
```

### Step 3: Configure Service Worker

**File**: `ngsw-config.json`

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.json",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-performance",
      "urls": ["/api/**"],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 100,
        "maxAge": "1h"
      }
    },
    {
      "name": "api-freshness",
      "urls": ["/api/user/**"],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 50,
        "maxAge": "1d",
        "timeout": "10s"
      }
    }
  ]
}
```

### Step 4: Update index.html

**File**: `src/index.html`

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>Ionic App</title>

  <base href="/" />

  <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="msapplication-tap-highlight" content="no" />

  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#3880ff" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Ionic App" />

  <!-- Favicon and Icons -->
  <link rel="icon" type="image/png" sizes="32x32" href="assets/icon/favicon.png" />
  <link rel="apple-touch-icon" href="assets/icon/icon-192x192.png" />
  <link rel="manifest" href="manifest.json" />

  <!-- Preload critical resources -->
  <link rel="preload" href="assets/fonts/roboto-regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

</head>

<body>
  <app-root></app-root>
</body>

</html>
```

## 🚀 Building for PWA

### Development Build

```bash
# Start development server with PWA support
ng serve --configuration=development

# Build for development
ng build --configuration=development
```

### Production Build

```bash
# Build optimized PWA
ng build --configuration=production

# The build output will be in 'www/' directory
# Service worker and web app manifest are automatically included
```

### Testing PWA Features

```bash
# Test service worker
ng build --configuration=production
npx http-server www -p 8080 -c-1

# Open in browser and check:
# - Application > Service Workers (Chrome DevTools)
# - Application > Manifest
# - Lighthouse > PWA audit
```

## 📱 PWA Features Implementation

### Step 1: Add Install Prompt

**File**: `src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  private deferredPrompt: any;

  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.setupPWAInstall();
    });
  }

  private setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      // Show install button
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      // Hide install button
      this.hideInstallButton();
      // Clear the deferredPrompt
      this.deferredPrompt = null;
    });
  }

  async installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
    }
  }

  private showInstallButton() {
    // Show your custom install button
    console.log('PWA install prompt available');
  }

  private hideInstallButton() {
    // Hide your custom install button
    console.log('PWA installed');
  }
}
```

### Step 2: Add Push Notifications

**File**: `src/app/services/push-notification.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  readonly VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY";

  constructor(
    private swPush: SwPush,
    private http: HttpClient
  ) {}

  subscribeToNotifications() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      // Send subscription to backend
      this.sendSubscriptionToServer(sub);
    })
    .catch(err => console.error('Could not subscribe to notifications', err));
  }

  private sendSubscriptionToServer(subscription: PushSubscription) {
    // Send subscription to your backend
    return this.http.post('/api/push-subscription', subscription).subscribe();
  }

  listenForMessages() {
    this.swPush.messages.subscribe(message => {
      console.log('Push message received', message);
      // Handle incoming push messages
    });
  }
}
```

## 🌐 Deployment Options

### Static Hosting Services

#### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=www
```

### Traditional Web Servers

#### Nginx Configuration

**File**: `/etc/nginx/sites-available/ionic-app`

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/ionic-app/www;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Apache Configuration

**File**: `/etc/apache2/sites-available/ionic-app.conf`

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/ionic-app/www

    <Directory /var/www/ionic-app/www>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Handle Angular routing
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]

    # Security headers
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"

    # Cache headers
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>

    ErrorLog ${APACHE_LOG_DIR}/ionic-app_error.log
    CustomLog ${APACHE_LOG_DIR}/ionic-app_access.log combined
</VirtualHost>
```

## 🔧 PWA Testing and Validation

### Lighthouse Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:4200 --output html --output-path ./lighthouse-report.html
```

### Manual Testing Checklist

- [ ] **Installable**: App shows install prompt in browser
- [ ] **Offline**: App works without internet connection
- [ ] **Fast**: App loads within 3 seconds
- [ ] **Responsive**: Works on all screen sizes
- [ ] **HTTPS**: Served over secure connection (required for PWA features)

### Browser Developer Tools

1. **Chrome DevTools**:
   - Application > Manifest
   - Application > Service Workers
   - Lighthouse > PWA audit

2. **Firefox Developer Tools**:
   - Application > Manifest
   - Application > Service Workers

## 📋 PWA Development Checklist

- [ ] Web app manifest configured with proper icons
- [ ] Service worker configured for caching
- [ ] HTTPS enabled for production
- [ ] Install prompt implemented
- [ ] Offline functionality tested
- [ ] Push notifications configured (optional)
- [ ] Lighthouse PWA score > 90
- [ ] Responsive design verified
- [ ] Cross-browser compatibility tested

## 🎯 Success Criteria

✅ **PWA Ready**: Passes all Lighthouse PWA audits
✅ **Installable**: Shows install prompt in supported browsers
✅ **Offline Capable**: Core functionality works offline
✅ **Fast Loading**: Loads within 3 seconds on 3G
✅ **Responsive**: Works on mobile, tablet, and desktop
✅ **Secure**: Served over HTTPS in production

## 🔧 Common PWA Issues

### Issue 1: Service Worker Not Registering
**Problem**: Service worker fails to register
**Fix**:
```javascript
// Check in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service workers:', registrations);
});
```

### Issue 2: App Not Installable
**Problem**: Install prompt doesn't appear
**Fix**:
- Ensure HTTPS is enabled
- Check web app manifest validity
- Verify service worker is registered
- Test on supported browser versions

### Issue 3: Offline Not Working
**Problem**: App doesn't work offline
**Fix**:
- Check service worker is active
- Verify ngsw-config.json is correct
- Test cache storage in DevTools
- Ensure critical routes are cached

### Issue 4: Push Notifications Not Working
**Problem**: Push notifications fail
**Fix**:
- Verify VAPID keys are correct
- Check service worker push event handler
- Ensure user granted notification permission
- Test with backend push service

## 📱 PWA-Specific Features

### Advanced Caching Strategies
- **Cache First**: For static assets
- **Network First**: For dynamic content
- **Stale While Revalidate**: For frequently updated data
- **Background Sync**: For offline actions

### Performance Optimizations
- **Code Splitting**: Load only required code
- **Lazy Loading**: Load modules on demand
- **Image Optimization**: Automatic image compression
- **Bundle Analysis**: Identify large dependencies

## 🔄 Next Steps

After completing PWA setup:

1. **Performance Testing**: Use Lighthouse to measure and improve scores
2. **SEO Optimization**: Add meta tags and structured data
3. **Analytics Integration**: Add tracking for user behavior
4. **A/B Testing**: Test different PWA features
5. **Progressive Enhancement**: Add advanced features for capable browsers

## 📞 Support Resources

- **PWA Documentation**: [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps)
- **Lighthouse**: [developers.google.com/web/tools/lighthouse](https://developers.google.com/web/tools/lighthouse)
- **Service Workers**: [developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- **Web App Manifest**: [developer.mozilla.org/en-US/docs/Web/Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)