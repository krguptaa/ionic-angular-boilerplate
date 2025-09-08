# Capacitor Plugins Guide

**Estimated time: 10-15 minutes**

## Overview

This guide covers the configuration and usage of Capacitor plugins for native device features. Capacitor provides a bridge between web code and native device APIs, enabling access to camera, geolocation, push notifications, and other device capabilities.

## 📋 Prerequisites Checklist

Before working with Capacitor plugins:

- [ ] **Ionic Frontend**: Complete [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
- [ ] **Platform Setup**: Complete Android [03_android_guide.md](03_android_guide.md) or iOS [04_ios_guide.md](04_ios_guide.md)
- [ ] **Capacitor CLI**: Version 5.x installed
- [ ] **Platform SDKs**: Android Studio or Xcode configured

### Plugin Categories

| Category | Description | Common Plugins |
|----------|-------------|----------------|
| **Device** | Device information and capabilities | Device, Network |
| **Media** | Camera, photos, audio/video | Camera, Media |
| **Location** | GPS and geolocation services | Geolocation |
| **Notifications** | Push notifications and local alerts | Push Notifications, Local Notifications |
| **Storage** | Local data persistence | Storage, Filesystem |
| **Sensors** | Device sensors and hardware | Motion, Haptics |
| **Social** | Social media and sharing | Share, Browser |

## 🛠️ Core Capacitor Setup

### Step 1: Verify Capacitor Installation

```bash
# Check Capacitor version
npx cap --version

# Check installed plugins
npx cap ls
```

### Step 2: Update Capacitor Configuration

**File**: `capacitor.config.json`

```json
{
  "appId": "com.yourcompany.yourapp",
  "appName": "Ionic App",
  "webDir": "www",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 3000,
      "launchAutoHide": true,
      "backgroundColor": "#ffffff",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": true,
      "androidSpinnerStyle": "large",
      "iosSpinnerStyle": "small",
      "spinnerColor": "#999999",
      "splashFullScreen": true,
      "splashImmersive": true
    }
  }
}
```

## 📷 Camera Plugin

### Installation and Setup

```bash
# Install camera plugin
npm install @capacitor/camera

# Sync to native projects
npx cap sync
```

### Usage in Angular Service

**File**: `src/app/services/camera.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() {}

  async takePhoto(): Promise<Photo> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
        allowEditing: true,
        saveToGallery: false
      });

      return photo;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  async selectFromGallery(): Promise<Photo> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 90
      });

      return photo;
    } catch (error) {
      console.error('Error selecting photo:', error);
      throw error;
    }
  }

  async convertPhotoToBase64(photo: Photo): Promise<string> {
    if (Capacitor.getPlatform() === 'web') {
      // Web platform - photo.webPath contains the blob URL
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob);
    } else {
      // Mobile platforms - photo.path contains the file path
      const response = await fetch(photo.path!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob);
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }
}
```

### Usage in Component

**File**: `src/app/pages/photo/photo.page.ts`

```typescript
import { Component } from '@angular/core';
import { CameraService } from '../../services/camera.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.page.html',
  styleUrls: ['./photo.page.scss'],
})
export class PhotoPage {
  photoUrl: string | undefined;

  constructor(
    private cameraService: CameraService,
    private toastService: ToastService
  ) {}

  async takePhoto() {
    try {
      const photo = await this.cameraService.takePhoto();
      this.photoUrl = photo.webPath;
      this.toastService.showSuccess('Photo captured successfully');
    } catch (error) {
      this.toastService.showError('Failed to capture photo');
    }
  }

  async selectPhoto() {
    try {
      const photo = await this.cameraService.selectFromGallery();
      this.photoUrl = photo.webPath;
      this.toastService.showSuccess('Photo selected successfully');
    } catch (error) {
      this.toastService.showError('Failed to select photo');
    }
  }
}
```

## 📍 Geolocation Plugin

### Installation and Setup

```bash
# Install geolocation plugin
npm install @capacitor/geolocation

# Sync to native projects
npx cap sync
```

### Usage in Angular Service

**File**: `src/app/services/location.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentPosition = new BehaviorSubject<Position | null>(null);
  public currentPosition$ = this.currentPosition.asObservable();

  constructor() {}

  async getCurrentPosition(): Promise<Position> {
    try {
      // Check permissions first
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          throw new Error('Location permission denied');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });

      this.currentPosition.next(position);
      return position;
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  watchPosition(): Observable<Position> {
    return new Observable(observer => {
      const watchId = Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000
      }, (position, error) => {
        if (error) {
          observer.error(error);
        } else if (position) {
          this.currentPosition.next(position);
          observer.next(position);
        }
      });

      // Return cleanup function
      return () => {
        Geolocation.clearWatch({ id: watchId });
      };
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

## 🔔 Push Notifications Plugin

### Installation and Setup

```bash
# Install push notifications plugin
npm install @capacitor/push-notifications

# Sync to native projects
npx cap sync
```

### Android Configuration

**File**: `android/app/src/main/AndroidManifest.xml`

```xml
<!-- Add inside <application> tag -->
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="default" />

<!-- Add inside <application> tag for custom notification icon -->
<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_notification" />
```

### iOS Configuration

**File**: `ios/App/App/Info.plist`

```xml
<!-- Add these keys -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>

<key>NSUserNotificationsUsageDescription</key>
<string>This app uses notifications to keep you updated</string>
```

### Usage in Angular Service

**File**: `src/app/services/push-notifications.service.ts`

```typescript
import { Injectable } from '@angular/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed
} from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  constructor(
    private platform: Platform,
    private http: HttpClient
  ) {}

  async initialize() {
    if (!this.platform.is('capacitor')) {
      console.log('Push notifications not available on web');
      return;
    }

    // Request permissions
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      await PushNotifications.register();
    }

    // Registration event
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      this.sendTokenToServer(token.value);
    });

    // Registration error event
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Push notification received event
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        this.handleNotification(notification);
      }
    );

    // Push notification action performed event
    PushNotifications.addListener('pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(action));
        this.handleAction(action);
      }
    );
  }

  private async sendTokenToServer(token: string) {
    try {
      await this.http.post('/api/push-token', { token, platform: this.platform.platforms() }).toPromise();
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  private handleNotification(notification: PushNotificationSchema) {
    // Handle incoming notification
    console.log('Notification received:', notification);

    // You can show local notification or update UI here
    // For example, update badge count, show toast, etc.
  }

  private handleAction(action: ActionPerformed) {
    // Handle user interaction with notification
    console.log('Action performed:', action);

    // Navigate to specific page based on action
    // For example, navigate to chat page if it's a message notification
  }

  async getDeliveredNotifications() {
    const notifications = await PushNotifications.getDeliveredNotifications();
    return notifications.notifications;
  }

  async removeDeliveredNotifications(notifications: PushNotificationSchema[]) {
    await PushNotifications.removeDeliveredNotifications({ notifications });
  }

  async removeAllDeliveredNotifications() {
    await PushNotifications.removeAllDeliveredNotifications();
  }
}
```

## 💾 Storage Plugin

### Installation and Setup

```bash
# Install storage plugin
npm install @capacitor/storage

# Sync to native projects
npx cap sync
```

### Usage in Angular Service

**File**: `src/app/services/storage.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {}

  async set(key: string, value: any): Promise<void> {
    try {
      await Storage.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  async get(key: string): Promise<any> {
    try {
      const { value } = await Storage.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await Storage.remove({ key });
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await Storage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const { keys } = await Storage.keys();
      return keys;
    } catch (error) {
      console.error('Error getting keys:', error);
      throw error;
    }
  }

  // Convenience methods for common data types
  async setString(key: string, value: string): Promise<void> {
    await Storage.set({ key, value });
  }

  async getString(key: string): Promise<string | null> {
    const { value } = await Storage.get({ key });
    return value;
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.set(key, value);
  }

  async getBoolean(key: string): Promise<boolean | null> {
    const value = await this.get(key);
    return typeof value === 'boolean' ? value : null;
  }

  async setNumber(key: string, value: number): Promise<void> {
    await this.set(key, value);
  }

  async getNumber(key: string): Promise<number | null> {
    const value = await this.get(key);
    return typeof value === 'number' ? value : null;
  }
}
```

## 🔌 Additional Useful Plugins

### Device Information

```bash
npm install @capacitor/device
npx cap sync
```

```typescript
import { Device } from '@capacitor/device';

const deviceInfo = await Device.getInfo();
console.log(deviceInfo);
// { platform: 'ios', model: 'iPhone', operatingSystem: 'ios', ... }
```

### Network Status

```bash
npm install @capacitor/network
npx cap sync
```

```typescript
import { Network } from '@capacitor/network';

const status = await Network.getStatus();
console.log(status);
// { connected: true, connectionType: 'wifi' }

Network.addListener('networkStatusChange', (status) => {
  console.log('Network status changed', status);
});
```

### Haptics (Vibration)

```bash
npm install @capacitor/haptics
npx cap sync
```

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Light impact
await Haptics.impact({ style: ImpactStyle.Light });

// Notification feedback
await Haptics.notification();

// Vibrate for custom duration
await Haptics.vibrate({ duration: 1000 });
```

### Share

```bash
npm install @capacitor/share
npx cap sync
```

```typescript
import { Share } from '@capacitor/share';

await Share.share({
  title: 'Check out this app!',
  text: 'I found this amazing app',
  url: 'https://myapp.com',
  dialogTitle: 'Share with friends'
});
```

## 🔧 Plugin Development Workflow

### Step 1: Install Plugin

```bash
npm install @capacitor/plugin-name
```

### Step 2: Sync to Native Projects

```bash
npx cap sync
```

### Step 3: Configure Permissions

Update platform-specific configuration files:
- **Android**: `AndroidManifest.xml`
- **iOS**: `Info.plist`

### Step 4: Implement in Angular Service

Create a service to encapsulate plugin usage and handle platform differences.

### Step 5: Handle Platform Differences

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  // iOS-specific code
} else if (Capacitor.getPlatform() === 'android') {
  // Android-specific code
} else {
  // Web fallback
}
```

### Step 6: Test on Devices

```bash
# Test on Android
npx cap run android

# Test on iOS
npx cap run ios
```

## 📋 Capacitor Plugins Checklist

- [ ] Core plugins installed (Camera, Geolocation, Storage)
- [ ] Platform-specific permissions configured
- [ ] Error handling implemented for all plugins
- [ ] Platform differences handled appropriately
- [ ] Web fallbacks provided where necessary
- [ ] Plugin usage tested on target devices
- [ ] Memory leaks prevented (unregister listeners)
- [ ] User permissions requested appropriately

## 🎯 Success Criteria

✅ **Plugins Installed**: All required plugins installed and synced
✅ **Permissions Configured**: Platform-specific permissions set up
✅ **Error Handling**: Comprehensive error handling for all plugins
✅ **Platform Compatibility**: Works on Android, iOS, and web
✅ **Performance**: Plugins don't impact app performance
✅ **User Experience**: Smooth integration with native features

## 🔧 Common Plugin Issues

### Issue 1: Plugin Not Working
**Problem**: Plugin methods return undefined or fail
**Fix**:
```bash
# Re-sync plugins
npx cap sync

# Clean and rebuild
npx cap clean
npx cap sync
```

### Issue 2: Permissions Denied
**Problem**: Plugin fails due to missing permissions
**Fix**:
- Check platform configuration files
- Request permissions at runtime
- Update app store listings with permission explanations

### Issue 3: Web Platform Issues
**Problem**: Plugin works on mobile but fails on web
**Fix**:
- Implement web-specific fallbacks
- Check Capacitor.isNativePlatform()
- Use feature detection

### Issue 4: Memory Leaks
**Problem**: App performance degrades over time
**Fix**:
- Remove event listeners when components unmount
- Clear plugin resources in ngOnDestroy
- Use takeUntil pattern with RxJS

## 📱 Plugin-Specific Considerations

### Android
- **Gradle Dependencies**: Check build.gradle for conflicts
- **ProGuard Rules**: Add rules to prevent code obfuscation
- **AndroidManifest**: Verify all permissions are declared

### iOS
- **CocoaPods**: Ensure pods are installed correctly
- **Info.plist**: Check all usage descriptions
- **Capabilities**: Enable required app capabilities

### Web
- **HTTPS Required**: Some features require secure context
- **Browser Support**: Check caniuse.com for compatibility
- **Fallbacks**: Provide graceful degradation

## 🔄 Next Steps

After setting up Capacitor plugins:

1. **Test Extensively**: Test all plugins on target devices
2. **Handle Edge Cases**: Implement error handling for network issues
3. **Optimize Performance**: Monitor plugin impact on app startup
4. **Update Documentation**: Document custom plugin usage
5. **Version Management**: Keep plugins updated with latest versions

## 📞 Support Resources

- **Capacitor Plugins**: [capacitorjs.com/docs/plugins](https://capacitorjs.com/docs/plugins)
- **Ionic Native**: [ionicframework.com/docs/native](https://ionicframework.com/docs/native)
- **Plugin Development**: [capacitorjs.com/docs/plugins/creating-plugins](https://capacitorjs.com/docs/plugins/creating-plugins)
- **Community Plugins**: [github.com/capacitor-community](https://github.com/capacitor-community)