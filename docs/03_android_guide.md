# Android Development Guide

**Estimated time: 20-25 minutes**

## Overview

This guide covers setting up, building, and deploying the Ionic application as a native Android app. The process involves Capacitor to bridge the web app to native Android functionality.

## 📋 Prerequisites Checklist

Before starting Android development:

- [ ] **Ionic Frontend**: Complete [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
- [ ] **Java JDK**: Version 11 or 17 installed
- [ ] **Android Studio**: Latest stable version installed
- [ ] **Android SDK**: API 33+ (Android 13) installed
- [ ] **Environment Variables**: ANDROID_HOME configured

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8GB | 16GB |
| Disk Space | 10GB | 20GB |
| OS | Windows 10/11 | Windows 11 |
| JDK | 11 | 17 |

## 🛠️ Step-by-Step Android Setup

### Step 1: Install Java Development Kit (JDK)

**For Absolute Beginners**: JDK is required to compile Android apps. It provides the Java runtime and development tools.

#### Windows
1. Visit [adoptium.net](https://adoptium.net/)
2. Download **Temurin 17 (LTS)** for Windows
3. Run installer with default settings
4. Verify installation:
```cmd
java -version
javac -version
```

#### macOS
```bash
# Using Homebrew
brew install openjdk@17

# Add to PATH in ~/.zshrc or ~/.bashrc
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

**Verification**:
```bash
java -version     # Should show Java 17.x.x
javac -version    # Should show javac 17.x.x
```

### Step 2: Install Android Studio

**What it does**: Android Studio is the official IDE for Android development, providing the Android SDK and build tools.

1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Run the installer
3. Select **"Standard"** installation type
4. Wait for components to download and install

### Step 3: Configure Android SDK

1. Open Android Studio
2. Go to **File > Settings > Appearance & Behavior > System Settings > Android SDK**
3. Install the following:
   - [x] Android 13.0 (API 33) or later
   - [x] Android SDK Build-Tools 33.0+
   - [x] Android SDK Platform-Tools
   - [x] Android Emulator
   - [x] Google Play services

### Step 4: Configure Environment Variables

#### Windows
```cmd
# Open Command Prompt as Administrator
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin"

# Restart Command Prompt and verify
echo %ANDROID_HOME%
```

#### macOS/Linux
```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# OR
export ANDROID_HOME=$HOME/Android/Sdk          # Linux

export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload shell
source ~/.bashrc  # or ~/.zshrc
```

**Verification**:
```bash
echo $ANDROID_HOME
adb version        # Should show Android Debug Bridge version
```

## 📱 Adding Android Platform

### Step 1: Add Android to Capacitor

```bash
# Navigate to project directory
cd ionic-project

# Add Android platform
npx cap add android

# Sync web assets to native project
npx cap sync android
```

### Step 2: Configure Android Project

The Android project is created in the `android/` folder. Key files to review:

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml    # App permissions and configuration
│   │       ├── res/                   # Icons, splash screens, strings
│   │       └── assets/                # Web assets (copied from www/)
│   └── build.gradle                   # Build configuration
├── gradle.properties                  # Gradle settings
└── settings.gradle                    # Project settings
```

## 🔧 Android Configuration

### Step 1: Update AndroidManifest.xml

**File**: `android/app/src/main/AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Network permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Camera permissions (if using camera plugin) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

    <!-- Location permissions (if using geolocation) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Push notification permissions -->
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">  <!-- For HTTP in development -->

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

### Step 2: Update Build Configuration

**File**: `android/app/build.gradle`

```gradle
android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.yourcompany.yourapp"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 3: Configure App Icons and Splash Screens

**File**: `android/app/src/main/res/`

Place the following icon sizes:
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

## 🚀 Building and Running

### Development Build

```bash
# Build web assets
ng build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Run on Device/Emulator

```bash
# Run on connected device
npx cap run android

# Run on specific device
npx cap run android --target=<device-id>
```

### Debug Build

```bash
# Build debug APK
npx cap build android

# Or open in Android Studio for debugging
npx cap open android
```

## 📦 Production Build

### Step 1: Generate Signed APK/AAB

1. **Create Keystore**:
```bash
# Generate keystore
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

2. **Update Build Configuration**:
**File**: `android/app/build.gradle`

```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'store_password'
            keyAlias 'alias_name'
            keyPassword 'key_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **Build Release APK**:
```bash
# Build release APK
npx cap build android --prod

# Build Android App Bundle (AAB) - recommended for Play Store
./gradlew bundleRelease
```

## 🏪 Google Play Store Deployment

### Step 1: Prepare Release Build

```bash
# Clean previous builds
./gradlew clean

# Build release bundle
./gradlew bundleRelease

# Find the bundle at: android/app/build/outputs/bundle/release/app-release.aab
```

### Step 2: Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console/)
2. Create new app or update existing
3. Upload the AAB file
4. Fill in store listing information:
   - App name and description
   - Screenshots (required sizes)
   - Feature graphic
   - Privacy policy URL
   - Contact information

### Step 3: Configure Pricing and Distribution

1. Set pricing (free or paid)
2. Choose countries for distribution
3. Set content rating
4. Add testing instructions for reviewers

### Step 4: Publish

1. **Internal Testing**: Test with internal team
2. **Closed Testing**: Test with limited users
3. **Open Testing**: Beta testing with broader audience
4. **Production**: Full release to Play Store

## 🔧 Common Android Issues

### Issue 1: Gradle Build Errors
**Problem**: Build fails with Gradle errors
**Fix**:
```bash
# Clear Gradle cache
./gradlew clean
rm -rf ~/.gradle/caches/

# Update Gradle wrapper
./gradlew wrapper --gradle-version=8.0
```

### Issue 2: SDK Not Found
**Problem**: "SDK location not found"
**Fix**:
```bash
# Verify ANDROID_HOME
echo $ANDROID_HOME

# Reinstall SDK components in Android Studio
# File > Settings > Appearance & Behavior > System Settings > Android SDK
```

### Issue 3: Device Not Recognized
**Problem**: Device not showing in `adb devices`
**Fix**:
```bash
# Enable USB debugging on device
# Settings > Developer Options > USB Debugging

# Restart adb server
adb kill-server
adb start-server

# Check devices
adb devices
```

### Issue 4: App Crashes on Launch
**Problem**: App crashes immediately after launch
**Fix**:
```bash
# Check device logs
adb logcat

# Common issues:
# - Missing permissions in AndroidManifest.xml
# - Incorrect package name
# - Proguard obfuscation issues
```

### Issue 5: White Screen on App Launch
**Problem**: App shows white screen instead of content
**Fix**:
```bash
# Check web console logs
# Chrome DevTools > Remote Devices > Inspect

# Common causes:
# - CORS issues in production
# - Incorrect API URLs
# - Missing web assets in APK
```

## 📋 Android Development Checklist

- [ ] JDK 11/17 installed and configured
- [ ] Android Studio installed with SDK components
- [ ] ANDROID_HOME environment variable set
- [ ] Android platform added to Capacitor
- [ ] AndroidManifest.xml configured with proper permissions
- [ ] App icons and splash screens added
- [ ] Debug build working on emulator/device
- [ ] Release build generated successfully
- [ ] App tested on multiple Android versions
- [ ] Play Store listing prepared (for production)

## 🎯 Success Criteria

✅ **Setup Complete**: Android development environment fully configured
✅ **Build Success**: Debug and release builds complete without errors
✅ **Device Testing**: App runs correctly on Android device/emulator
✅ **Native Features**: Capacitor plugins working (camera, geolocation, etc.)
✅ **Performance**: App loads within 3 seconds on target devices
✅ **Compatibility**: Works on Android 5.0+ (API 21+)

## 📱 Android-Specific Features

### Device Integration
- **Camera**: Photo capture and gallery access
- **Geolocation**: GPS location services
- **Push Notifications**: Firebase Cloud Messaging
- **Biometric Authentication**: Fingerprint/Face unlock
- **File System**: Local file storage and access

### Platform Optimizations
- **Material Design**: Native Android UI components
- **Dark Mode**: System theme integration
- **Gesture Navigation**: Support for Android gestures
- **Split Screen**: Multi-window support

## 🔄 Next Steps

After completing Android setup:

1. **Test on Multiple Devices**: Test on different Android versions and screen sizes
2. **Optimize Performance**: Use Android Profiler to identify bottlenecks
3. **Configure CI/CD**: Set up automated builds and deployments
4. **Monitor Analytics**: Integrate crash reporting and analytics
5. **Prepare Updates**: Plan for app store updates and maintenance

## 📞 Support Resources

- **Android Developer Docs**: [developer.android.com](https://developer.android.com)
- **Capacitor Android Guide**: [capacitorjs.com/docs/android](https://capacitorjs.com/docs/android)
- **Ionic Android Guide**: [ionicframework.com/docs/developing/android](https://ionicframework.com/docs/developing/android)
- **Google Play Console**: [play.google.com/console](https://play.google.com/console)