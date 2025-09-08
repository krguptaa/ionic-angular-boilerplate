# Ionic 8 + Angular + CodeIgniter 4 Mobile App

A modern, full-stack mobile application built with Ionic 8 frontend, Angular 17, and CodeIgniter 4 backend. Supports Android, iOS, and Progressive Web App (PWA) deployment with JWT authentication, offline capabilities, and native device features.

## 📋 Prerequisites

Before you begin, ensure your system meets these requirements:

### System Requirements
- **Operating System**: Windows 10/11, macOS 12+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: 10GB free space
- **Internet**: Stable broadband connection

### Required Software Versions

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.0.0+ | JavaScript runtime |
| **npm** | 8.0.0+ | Package manager |
| **Angular CLI** | 17.0.0+ | Angular development tools |
| **Ionic CLI** | 7.0.0+ | Ionic development tools |
| **PHP** | 8.1+ | CodeIgniter 4 backend |
| **Composer** | 2.0+ | PHP dependency manager |
| **Java JDK** | 11+ (Android only) | Android development |
| **Android Studio** | 2022+ (Android only) | Android IDE and SDK |
| **Xcode** | 14+ (macOS only) | iOS development |

## 🚀 Quick Start - Local Development (Web/PWA)

### Step 1: Install Prerequisites

#### Install Node.js and npm
```bash
# Download and install from https://nodejs.org/
# Or using package manager:

# Windows (using Chocolatey)
choco install nodejs

# macOS (using Homebrew)
brew install node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify installation:**
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
```

#### Install Angular CLI
```bash
npm install -g @angular/cli@17
ng version         # Should show Angular CLI 17.x.x
```

#### Install Ionic CLI
```bash
npm install -g @ionic/cli@7
ionic --version    # Should show 7.x.x
```

### Step 2: Clone and Setup Project

```bash
# Clone the repository
git clone <your-repository-url> ionic-app
cd ionic-app

# Install project dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Configure Environment

#### Local Development Environment
**File:** `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',  // Your Laravel backend URL
  corsBypass: true
};
```

#### UAT Environment
**File:** `src/environments/environment.uat.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://uat1.demo.com'  // Your UAT backend URL
};
```

#### Production Environment
**File:** `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://app.demo.com'  // Your production backend URL
};
```

### Step 4: Configure Proxy (for Local Development)

**File:** `proxy.conf.json`
```json
{
  "/simulator-services/*": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/simulator/*": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Step 5: Run Local Development Server

```bash
# Start development server with proxy
ng serve

# Or use Ionic CLI
ionic serve

# Access the app at: http://localhost:4200
```

### Step 6: Run Tests (Optional)

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📱 Android Setup and Development

### Step 1: Install Java Development Kit (JDK)

```bash
# Download from https://adoptium.net/
# Or using package manager:

# Windows/macOS: Download and install JDK 11 or 17
# Linux:
sudo apt update
sudo apt install openjdk-11-jdk
```

**Verify installation:**
```bash
java -version     # Should show Java 11 or 17
javac -version    # Should show javac 11.x.x or 17.x.x
```

### Step 2: Install Android Studio

1. **Download Android Studio**
   - Visit: https://developer.android.com/studio
   - Download the latest stable version

2. **Install Android Studio**
   - Run the installer
   - Select "Standard" installation
   - Wait for SDK components to download

3. **Configure Android SDK**
   - Open Android Studio
   - Go to **File > Settings > Appearance & Behavior > System Settings > Android SDK**
   - Install:
     - Android 13.0 (API 33) or later
     - Android SDK Build-Tools 33.0+
     - Android SDK Platform-Tools
     - Android Emulator
     - Google Play services

### Step 3: Configure Environment Variables

#### Windows
```cmd
# Open Command Prompt as Administrator
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin"

# Restart Command Prompt and verify
echo %ANDROID_HOME%
adb version
```

#### macOS/Linux
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# OR
export ANDROID_HOME=$HOME/Android/Sdk          # Linux

export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload shell
source ~/.bashrc
```

### Step 4: Add Android Platform to Project

```bash
# Navigate to project directory
cd ionic-app

# Add Android platform
npx cap add android

# Sync web assets to Android project
npx cap sync android
```

### Step 5: Configure Android Permissions

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Network permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Camera permissions -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <!-- Location permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Push notification permissions -->
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <!-- Main Activity -->
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale"
            android:label="@string/title_activity_main"
            android:launchMode="singleTask"
            android:name=".MainActivity"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### Step 6: Build Android APK

```bash
# Build web assets for production
ng build --configuration=production

# Sync to Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 7: Run on Android Device/Emulator

#### Using Android Studio
1. Open Android Studio (from `npx cap open android`)
2. Select device/emulator from toolbar
3. Click **Run** button (green play icon)

#### Using Command Line
```bash
# Run on connected device
npx cap run android

# Run on specific device
npx cap run android --target=<device-id>

# List available devices
adb devices
```

### Step 8: Generate Production APK

```bash
# Build release APK
npx cap build android

# In Android Studio:
# Build > Build Bundle(s)/APK(s) > Build APK(s)
# Find APK at: android/app/build/outputs/apk/release/
```

## 🍎 iOS Setup and Development (macOS Only)

### Step 1: Install Xcode

1. **Open App Store** on your Mac
2. **Search for "Xcode"**
3. **Click Get** and wait for download/installation
4. **Launch Xcode** and accept license agreement

**Alternative:** Download from [developer.apple.com](https://developer.apple.com/download/)

### Step 2: Install Command Line Tools

```bash
# Install Xcode command line tools
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept
```

**Verify installation:**
```bash
xcodebuild -version    # Should show Xcode 14.x.x
xcode-select -p        # Should show /Applications/Xcode.app/Contents/Developer
```

### Step 3: Install CocoaPods (Dependency Manager)

```bash
# Install CocoaPods
sudo gem install cocoapods

# Verify installation
pod --version
```

### Step 4: Set Up Apple Developer Account

1. **Visit:** https://developer.apple.com/
2. **Sign up** for Apple Developer Program ($99/year)
3. **Create App ID** and **Provisioning Profiles**
4. **Generate Certificates** for code signing

### Step 5: Add iOS Platform to Project

```bash
# Navigate to project directory
cd ionic-app

# Add iOS platform
npx cap add ios

# Sync web assets to iOS project
npx cap sync ios
```

### Step 6: Configure iOS Permissions

**File:** `ios/App/App/Info.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Basic App Information -->
    <key>CFBundleDisplayName</key>
    <string>Ionic App</string>
    <key>CFBundleIdentifier</key>
    <string>com.yourcompany.yourapp</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>

    <!-- iOS Version Requirements -->
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
    </array>

    <!-- Network Permissions -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <key>NSAllowsLocalNetworking</key>
        <true/>
    </dict>

    <!-- Camera Permissions -->
    <key>NSCameraUsageDescription</key>
    <string>This app needs camera access to take photos</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>This app needs photo library access to select images</string>

    <!-- Location Permissions -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>This app needs location access for location-based features</string>
    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>This app needs background location access</string>

    <!-- Push Notification Permissions -->
    <key>UIBackgroundModes</key>
    <array>
        <string>remote-notification</string>
    </array>

    <!-- Orientation Support -->
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>
```

### Step 7: Configure Code Signing

1. **Open in Xcode:**
   ```bash
   npx cap open ios
   ```

2. **Select Development Team:**
   - In Xcode, select your project
   - Go to **Signing & Capabilities**
   - Select your Apple Developer account
   - Choose appropriate provisioning profile

3. **Update Bundle Identifier:**
   - Ensure it matches your App Store Connect app

### Step 8: Build iOS App

```bash
# Build web assets for production
ng build --configuration=production

# Sync to iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Step 9: Run on iOS Device/Simulator

#### Using Xcode
1. Open Xcode (from `npx cap open ios`)
2. Select device/simulator from toolbar
3. Click **Run** button (play icon)

#### Using Command Line
```bash
# Run on connected device
npx cap run ios

# Run on specific simulator
npx cap run ios --target="iPhone 14"

# List available simulators
xcrun simctl list devices
```

### Step 10: Generate Production IPA

```bash
# Build for release
npx cap build ios

# In Xcode:
# 1. Select "Any iOS Device" as target
# 2. Go to Product > Archive
# 3. Wait for archive to complete
# 4. Export IPA for App Store submission
```

## 🌐 PWA Setup and Deployment

### Step 1: Configure PWA Manifest

**File:** `src/manifest.json`

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
      "src": "assets/icon/icon-192x192.png",
      "sizes": "192x192",
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

### Step 2: Configure Service Worker

**File:** `ngsw-config.json`

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
    }
  ]
}
```

### Step 3: Update index.html for PWA

**File:** `src/index.html`

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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
</head>

<body>
  <app-root></app-root>
</body>

</html>
```

### Step 4: Build for PWA

```bash
# Build for production with PWA support
ng build --configuration=production

# The build output will be in 'www/' directory
# Service worker and web app manifest are automatically included
```

### Step 5: Test PWA Locally

```bash
# Install http-server globally
npm install -g http-server

# Serve the built app
http-server www -p 8080 -c-1

# Open browser to http://localhost:8080
# Use Chrome DevTools > Lighthouse to test PWA features
```

### Step 6: Deploy PWA

#### Option 1: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
firebase deploy
```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 3: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=www
```

## 🔧 Environment Configuration

### Switching Between Environments

```bash
# Development (default)
ng serve

# UAT environment
ng serve --configuration=uat

# Production build
ng build --configuration=production
```

### Environment Files

- **`environment.ts`** - Local development
- **`environment.uat.ts`** - User Acceptance Testing
- **`environment.prod.ts`** - Production

## 🧪 Testing

### Run Unit Tests
```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:ci

# Run with coverage
npm run test:coverage
```

### Run E2E Tests
```bash
# Install Cypress (if not included)
npm install cypress --save-dev

# Run E2E tests
npx cypress run
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Run all quality checks
npm run quality
```

## 📦 Build Commands

### Web/PWA Builds
```bash
# Development build
ng build

# Production build
ng build --configuration=production

# UAT build
ng build --configuration=uat
```

### Native Builds
```bash
# Android build
ng build --configuration=production
npx cap sync android
npx cap open android

# iOS build
ng build --configuration=production
npx cap sync ios
npx cap open ios
```

## 🚀 Deployment

### Web/PWA Deployment
```bash
# Build for production
ng build --configuration=production

# Deploy to your hosting service
# Options: Firebase, Vercel, Netlify, AWS S3, etc.
```

### Android Deployment
```bash
# Build and sync
ng build --configuration=production
npx cap sync android

# Generate signed APK/AAB in Android Studio
# Upload to Google Play Store
```

### iOS Deployment
```bash
# Build and sync
ng build --configuration=production
npx cap sync ios

# Archive in Xcode
# Upload to App Store Connect
```

## 📋 Quick Setup Checklist

### For All Platforms
- [ ] Node.js 18+ installed
- [ ] Angular CLI 17+ installed
- [ ] Ionic CLI 7+ installed
- [ ] Project cloned and dependencies installed
- [ ] Environment files configured
- [ ] Development server runs without errors

### For Android Development
- [ ] Java JDK 11+ installed
- [ ] Android Studio installed
- [ ] Android SDK configured
- [ ] Environment variables set
- [ ] Android platform added
- [ ] Permissions configured

### For iOS Development
- [ ] Xcode 14+ installed
- [ ] Command line tools installed
- [ ] Apple Developer account
- [ ] CocoaPods installed
- [ ] iOS platform added
- [ ] Code signing configured

### For PWA Development
- [ ] Web app manifest configured
- [ ] Service worker enabled
- [ ] HTTPS enabled for production
- [ ] Icons and splash screens added

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

2. **Platform Sync Issues**
   ```bash
   # Clean and resync
   npx cap clean
   npx cap sync
   ```

3. **Environment Issues**
   ```bash
   # Check environment files
   cat src/environments/environment.ts
   ```

4. **Port Conflicts**
   ```bash
   # Use different port
   ng serve --port=4201
   ```

## 📚 Documentation

- **Complete Documentation**: See `/docs` folder
- **Ionic Documentation**: https://ionicframework.com/docs
- **Angular Documentation**: https://angular.io/docs
- **Capacitor Documentation**: https://capacitorjs.com/docs

## 📞 Support

- **Documentation**: Check `/docs` folder first
- **Issues**: Create GitHub issue with detailed information
- **Community**: Ionic Discord or Stack Overflow

---

## 🎯 Success Criteria

✅ **Local Development**: App runs at http://localhost:4200
✅ **Android**: APK generated and runs on device/emulator
✅ **iOS**: IPA generated and runs on device/simulator
✅ **PWA**: Lighthouse PWA score > 90
✅ **Build**: All platforms build successfully
✅ **Tests**: Unit tests pass with good coverage

**Ready to start developing! 🚀**