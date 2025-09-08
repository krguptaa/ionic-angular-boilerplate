# Build Guide

**Estimated time: 10 minutes**

## Overview

This guide covers the build configurations and processes for different environments (Local, UAT, Production) and platforms (Web, Android, iOS). The project uses Angular CLI for web builds and Capacitor for native mobile builds.

## 📋 Prerequisites Checklist

Before building the application:

- [ ] **Dependencies**: All npm packages installed (`npm install`)
- [ ] **Environment**: Node.js and npm properly configured
- [ ] **Platform SDKs**: Android Studio (Android) or Xcode (iOS) installed
- [ ] **Certificates**: Code signing certificates configured (production)
- [ ] **Environment Files**: All environment configurations set up

### Build Types

| Build Type | Purpose | Environment | Optimization |
|------------|---------|-------------|--------------|
| **Development** | Local development and testing | `environment.ts` | None |
| **Local** | Local production-like build | `environment.ts` | Basic |
| **UAT** | User Acceptance Testing | `environment.uat.ts` | Full |
| **Production** | Live deployment | `environment.prod.ts` | Maximum |

## 🏗️ Angular CLI Build Configurations

### Development Build

**Purpose**: Fast builds for development with hot reload and debugging features.

```bash
# Basic development build
ng build

# Development build with specific configuration
ng build --configuration=development

# Development server with live reload
ng serve --configuration=development

# Development server with custom options
ng serve --configuration=development --port=4201 --host=0.0.0.0
```

**Features**:
- Source maps enabled for debugging
- No code minification
- No tree shaking
- Fast build times
- Hot module replacement

### Local Build

**Purpose**: Production-like build for local testing with optimizations enabled.

```bash
# Local build
ng build --configuration=local

# Local build with verbose output
ng build --configuration=local --verbose

# Local build with custom output directory
ng build --configuration=local --output-path=dist/local
```

### UAT Build

**Purpose**: Optimized build for User Acceptance Testing environment.

```bash
# UAT build
ng build --configuration=uat

# UAT build with production optimizations
ng build --configuration=uat --prod

# UAT build with bundle analyzer
ng build --configuration=uat --stats-json && npx webpack-bundle-analyzer dist/uat/stats.json
```

### Production Build

**Purpose**: Fully optimized build for production deployment.

```bash
# Production build
ng build --configuration=production

# Production build with custom base href
ng build --configuration=production --base-href=/my-app/

# Production build with custom deploy URL
ng build --configuration=production --deploy-url=/my-app/assets/
```

## 📱 Capacitor Build Process

### Android Build Process

#### Development Build
```bash
# Build web assets
ng build --configuration=development

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build debug APK in Android Studio
# Build > Build Bundle(s)/APK(s) > Build APK(s)
```

#### Release Build
```bash
# Build optimized web assets
ng build --configuration=production

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build release APK/AAB in Android Studio
# Build > Generate Signed Bundle/APK
```

#### Command Line Release Build
```bash
# Build and sync
ng build --configuration=production
npx cap sync android

# Build release APK
./gradlew assembleRelease

# Build Android App Bundle (recommended)
./gradlew bundleRelease
```

### iOS Build Process

#### Development Build
```bash
# Build web assets
ng build --configuration=development

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build and run in Xcode
# Product > Run (⌘R)
```

#### Release Build
```bash
# Build optimized web assets
ng build --configuration=production

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Archive for App Store
# Product > Archive
```

#### Command Line Release Build
```bash
# Build and sync
ng build --configuration=production
npx cap sync ios

# Build for device
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS build

# Archive for App Store
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS -archivePath build/App.xcarchive archive
```

## 🔧 Build Configuration Files

### angular.json Build Configurations

**File**: `angular.json`

```json
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "configurations": {
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            },
            "local": {
              "buildOptimizer": false,
              "optimization": true,
              "vendorChunk": false,
              "extractLicenses": true,
              "sourceMap": false,
              "namedChunks": false
            },
            "uat": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                }
              ],
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.uat.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true
            },
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "6kb",
                  "maximumError": "10kb"
                }
              ],
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "serviceWorker": true,
              "ngswConfigPath": "ngsw-config.json"
            }
          }
        }
      }
    }
  }
}
```

### Environment Files

#### Development Environment
**File**: `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  corsBypass: true
};
```

#### UAT Environment
**File**: `src/environments/environment.uat.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://uat1.demo.com'
};
```

#### Production Environment
**File**: `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://app.demo.com'
};
```

## 📊 Build Optimization Techniques

### Bundle Analysis

```bash
# Install bundle analyzer
npm install -g webpack-bundle-analyzer

# Build with stats
ng build --configuration=production --stats-json

# Analyze bundle
npx webpack-bundle-analyzer dist/production/stats.json
```

### Code Splitting

```typescript
// Lazy load modules
const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  }
];
```

### Tree Shaking

```typescript
// Only import what you need
import { map, filter } from 'rxjs/operators';

// Instead of
import { Observable } from 'rxjs';
```

### Asset Optimization

```json
// angular.json
{
  "assets": [
    {
      "glob": "**/*",
      "input": "src/assets",
      "output": "assets"
    }
  ],
  "optimization": true,
  "outputHashing": "all"
}
```

## 🚀 Build Scripts

### Package.json Build Scripts

**File**: `package.json`

```json
{
  "scripts": {
    "build": "ng build",
    "build:dev": "ng build --configuration=development",
    "build:local": "ng build --configuration=local",
    "build:uat": "ng build --configuration=uat",
    "build:prod": "ng build --configuration=production",
    "build:android": "ng build --configuration=production && npx cap sync android",
    "build:ios": "ng build --configuration=production && npx cap sync ios",
    "build:all": "npm run build:prod && npm run build:android && npm run build:ios"
  }
}
```

### Custom Build Scripts

```bash
# Build with version info
npm run build:prod -- --output-hashing=all

# Build with custom environment
ng build --configuration=production --aot --build-optimizer

# Build with progress indicator
ng build --configuration=production --progress

# Build with verbose logging
ng build --configuration=production --verbose
```

## 🔍 Build Verification

### Web Build Verification

```bash
# Check build output
ls -la dist/production/

# Serve build locally
npx http-server dist/production -p 8080

# Test service worker
# Open browser dev tools > Application > Service Workers
```

### Android Build Verification

```bash
# Check APK/AAB size
ls -lh android/app/build/outputs/apk/release/
ls -lh android/app/build/outputs/bundle/release/

# Install and test APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Check for native crashes
adb logcat | grep -i error
```

### iOS Build Verification

```bash
# Check app size
ls -lh ios/App/build/Release-iphoneos/

# Test on simulator
xcrun simctl install booted ios/App/build/Release-iphoneos/App.app
xcrun simctl launch booted com.yourcompany.yourapp
```

## 📋 Build Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Environment files configured correctly
- [ ] Build configurations set up in `angular.json`
- [ ] Code signing certificates configured (production)
- [ ] Bundle size within limits (< 5MB initial, < 10KB per component style)
- [ ] Source maps disabled for production
- [ ] Service worker enabled for PWA
- [ ] Tree shaking and minification enabled
- [ ] Output hashing enabled for cache busting
- [ ] Build tested on target platforms

## 🎯 Success Criteria

✅ **Build Completes**: All build configurations execute without errors
✅ **Bundle Size**: Within specified budget limits
✅ **Performance**: Lighthouse score > 90 for production builds
✅ **Compatibility**: Works on target browsers and devices
✅ **Optimization**: Code splitting, tree shaking, and minification applied
✅ **Caching**: Proper cache headers and service worker configured

## 🔧 Common Build Issues

### Issue 1: Build Fails with Memory Error
**Problem**: JavaScript heap out of memory
**Fix**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" ng build --configuration=production

# Or add to package.json scripts
"build:prod": "NODE_OPTIONS=--max-old-space-size=4096 ng build --configuration=production"
```

### Issue 2: Bundle Size Too Large
**Problem**: Initial bundle exceeds budget limits
**Fix**:
```bash
# Analyze bundle
ng build --configuration=production --stats-json
npx webpack-bundle-analyzer dist/production/stats.json

# Implement lazy loading
# Remove unused imports
# Use tree shaking
```

### Issue 3: Environment Variables Not Working
**Problem**: Wrong environment file loaded
**Fix**:
```bash
# Check file replacements in angular.json
# Verify environment file exists
# Check for typos in environment variable names
```

### Issue 4: Capacitor Sync Fails
**Problem**: Native project sync fails
**Fix**:
```bash
# Clean and resync
npx cap clean
npx cap sync

# Update Capacitor
npm install @capacitor/cli@latest @capacitor/core@latest
npx cap migrate
```

### Issue 5: iOS Build Fails with Code Signing
**Problem**: Code signing certificate issues
**Fix**:
```bash
# Check certificates in Keychain Access
# Verify bundle identifier matches
# Regenerate provisioning profiles
# Clean build folder in Xcode
```

## 📊 Build Performance Monitoring

### Bundle Size Tracking

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to package.json
"analyze": "ng build --configuration=production --stats-json && npx webpack-bundle-analyzer dist/production/stats.json"
```

### Build Time Optimization

```bash
# Use build cache
ng build --configuration=production --cache

# Parallel processing
ng build --configuration=production --max-workers=4

# Skip tests for faster builds
ng build --configuration=production --skip-tests
```

## 🔄 Next Steps

After successful builds:

1. **Test Extensively**: Test builds on target devices and browsers
2. **Performance Audit**: Use Lighthouse to measure and improve scores
3. **Security Scan**: Check for vulnerabilities in dependencies
4. **Deploy**: Follow deployment guides for your chosen platform
5. **Monitor**: Set up error tracking and performance monitoring

## 📞 Support Resources

- **Angular Build Guide**: [angular.io/guide/build](https://angular.io/guide/build)
- **Capacitor Build Guide**: [capacitorjs.com/docs/basics/building-your-app](https://capacitorjs.com/docs/basics/building-your-app)
- **Bundle Analysis**: [webpack.js.org/guides/code-splitting](https://webpack.js.org/guides/code-splitting)
- **Performance Budgets**: [web.dev/performance-budgets](https://web.dev/performance-budgets)