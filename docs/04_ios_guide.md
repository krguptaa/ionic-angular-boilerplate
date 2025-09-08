# iOS Development Guide

**Estimated time: 25-30 minutes**

## Overview

This guide covers setting up, building, and deploying the Ionic application as a native iOS app using Capacitor. iOS development requires macOS and Xcode.

## 📋 Prerequisites Checklist

Before starting iOS development:

- [ ] **macOS**: Version 10.15 (Catalina) or later
- [ ] **Xcode**: Version 14.0 or later
- [ ] **Ionic Frontend**: Complete [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
- [ ] **Apple Developer Account**: Paid developer account ($99/year)
- [ ] **Command Line Tools**: Xcode command line tools installed

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| macOS | 10.15 | 12.0+ |
| RAM | 8GB | 16GB |
| Disk Space | 15GB | 25GB |
| Xcode | 14.0 | 15.0+ |

## 🛠️ Step-by-Step iOS Setup

### Step 1: Install Xcode

**For Absolute Beginners**: Xcode is Apple's integrated development environment (IDE) for creating iOS, macOS, watchOS, and tvOS apps.

1. Open the **App Store** on your Mac
2. Search for "Xcode"
3. Click **Get** and wait for download/installation
4. Launch Xcode and accept the license agreement

**Alternative**: Download from [developer.apple.com](https://developer.apple.com/download/)

### Step 2: Install Command Line Tools

```bash
# Install Xcode command line tools
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept
```

**Verification**:
```bash
xcodebuild -version    # Should show Xcode version
xcode-select -p        # Should show /Applications/Xcode.app/Contents/Developer
```

### Step 3: Install iOS Simulator (Optional)

Xcode includes iOS Simulator by default. To verify:

```bash
# List available simulators
xcrun simctl list devices

# Open Simulator app
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
```

## 📱 Adding iOS Platform

### Step 1: Add iOS to Capacitor

```bash
# Navigate to project directory
cd ionic-project

# Add iOS platform (macOS only)
npx cap add ios

# Sync web assets to native project
npx cap sync ios
```

### Step 2: Configure iOS Project

The iOS project is created in the `ios/` folder. Key files to review:

```
ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift      # App lifecycle management
│   │   ├── Assets.xcassets/       # Icons, splash screens, colors
│   │   ├── Info.plist             # App configuration and permissions
│   │   └── capacitor.config.json  # Capacitor configuration
│   └── Podfile                    # CocoaPods dependencies
├── IonicProject.xcodeproj         # Xcode project file
└── IonicProject.xcworkspace       # Xcode workspace (with CocoaPods)
```

## 🔧 iOS Configuration

### Step 1: Update Info.plist

**File**: `ios/App/App/Info.plist`

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
        <true/>  <!-- For development only -->
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

    <!-- iPad Support -->
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>

</dict>
</plist>
```

### Step 2: Configure App Icons and Launch Screens

**File**: `ios/App/App/Assets.xcassets/`

Required icon sizes for App Store:
- **iPhone Notification**: 20x20, 40x40, 60x60
- **iPhone Settings**: 29x29, 58x58, 87x87
- **iPhone Spotlight**: 40x40, 80x80, 120x120
- **iPhone App**: 60x60, 120x120, 180x180
- **iPad App**: 76x76, 152x152, 167x167
- **App Store**: 1024x1024

### Step 3: Update Capacitor Configuration

**File**: `ios/App/App/capacitor.config.json`

```json
{
  "appId": "com.yourcompany.yourapp",
  "appName": "Ionic App",
  "webDir": "www",
  "bundledWebRuntime": false,
  "ios": {
    "contentInset": "automatic",
    "scheme": "ionic"
  }
}
```

## 🚀 Building and Running

### Development Build

```bash
# Build web assets
ng build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Run on Simulator

```bash
# Run on iOS Simulator
npx cap run ios

# Run on specific simulator
npx cap run ios --target="iPhone 14"
```

### Run on Device

1. **Connect iOS Device** via USB
2. **Trust Developer** on device (Settings > General > Device Management)
3. **Run on Device**:
```bash
npx cap run ios --target="<device-udid>"
```

## 📦 Production Build

### Step 1: Configure Code Signing

1. **Open in Xcode**:
```bash
npx cap open ios
```

2. **Select Team**:
   - Go to project settings
   - Select your Apple Developer account
   - Choose appropriate provisioning profile

3. **Update Bundle Identifier**:
   - Ensure it matches your App Store Connect app

### Step 2: Archive Build

```bash
# Clean and build
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select "Any iOS Device" as target
# 2. Go to Product > Archive
# 3. Wait for archive to complete
```

### Step 3: Export IPA

1. **In Xcode Organizer**:
   - Select the archive
   - Click "Distribute App"
   - Choose "App Store Connect" or "Ad Hoc"
   - Follow the export wizard

2. **Alternative CLI Method**:
```bash
# Build for App Store
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS -archivePath build/App.xcarchive archive

# Export IPA
xcodebuild -exportArchive -archivePath build/App.xcarchive -exportOptionsPlist exportOptions.plist -exportPath build/
```

## 🏪 App Store Deployment

### Step 1: Create App Store Connect App

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **"My Apps"**
3. Click **"+"** to create new app
4. Fill in app information:
   - **Platform**: iOS
   - **Name**: Your app name
   - **Primary Language**: English
   - **Bundle ID**: Must match Xcode project
   - **SKU**: Unique identifier

### Step 2: Upload Build

```bash
# Using Xcode (recommended)
# 1. Open Xcode Organizer (Window > Organizer)
# 2. Select your archive
# 3. Click "Distribute App"
# 4. Choose "App Store Connect"
# 5. Follow upload process

# Using Transporter app (alternative)
# 1. Download Transporter from App Store
# 2. Drag IPA file to Transporter
# 3. Click Deliver
```

### Step 3: Configure App Store Listing

1. **App Information**:
   - Description (up to 4000 characters)
   - Keywords (100 characters max)
   - Support URL and Marketing URL

2. **Screenshots** (Required):
   - iPhone 6.5" display: 1284x2778, 2778x1284
   - iPhone 5.5" display: 1242x2208, 2208x1242
   - iPad Pro: 2048x2732, 2732x2048

3. **App Review Information**:
   - Contact information
   - Demo account credentials (if needed)
   - Notes for reviewers

### Step 4: Submit for Review

1. **Pricing and Availability**:
   - Set price tier
   - Choose availability by country

2. **Submit**:
   - Review all information
   - Submit for Apple review
   - Wait 24-48 hours for review to begin

## 🔧 Common iOS Issues

### Issue 1: Code Signing Errors
**Problem**: "Code signing failed" or "No signing certificate found"
**Fix**:
```bash
# Check certificates in Keychain Access
# Or recreate provisioning profile in Apple Developer Console

# Clean and rebuild
npx cap sync ios
npx cap open ios
# Then Product > Clean Build Folder
```

### Issue 2: CocoaPods Installation Issues
**Problem**: Pod install fails
**Fix**:
```bash
# Navigate to iOS directory
cd ios/App

# Clean CocoaPods
rm -rf Pods Podfile.lock

# Reinstall
pod install

# Alternative: Update CocoaPods
sudo gem install cocoapods
```

### Issue 3: Simulator Not Available
**Problem**: No simulators shown in Xcode
**Fix**:
```bash
# In Xcode: Xcode > Settings > Platforms
# Download iOS Simulator

# Or via command line
xcodebuild -downloadPlatform iOS
```

### Issue 4: Device Not Recognized
**Problem**: iOS device not showing in Xcode
**Fix**:
```bash
# Check device connection
system_profiler SPUSBDataType

# Trust computer on device
# Settings > General > Reset > Reset Location & Privacy

# Restart Xcode and device
```

### Issue 5: App Crashes on Launch
**Problem**: App crashes immediately on iOS device
**Fix**:
```bash
# Check device logs in Xcode
# Window > Devices and Simulators > Select device > View Device Logs

# Common causes:
# - Missing app permissions
# - Incorrect bundle identifier
# - Code signing issues
```

## 📋 iOS Development Checklist

- [ ] Xcode 14+ installed and configured
- [ ] Command line tools installed
- [ ] Apple Developer account active
- [ ] iOS platform added to Capacitor
- [ ] Info.plist configured with proper permissions
- [ ] App icons and launch screens added
- [ ] Code signing certificates configured
- [ ] Debug build working on simulator/device
- [ ] Archive build generated successfully
- [ ] App Store Connect app created
- [ ] TestFlight beta testing configured (optional)

## 🎯 Success Criteria

✅ **Setup Complete**: iOS development environment fully configured
✅ **Build Success**: Debug and archive builds complete without errors
✅ **Device Testing**: App runs correctly on iOS device/simulator
✅ **Native Features**: Capacitor plugins working (camera, geolocation, etc.)
✅ **Performance**: App loads within 3 seconds on target devices
✅ **Compatibility**: Works on iOS 12.0+ (arm64 architecture)

## 📱 iOS-Specific Features

### Device Integration
- **Camera**: Photo capture with editing capabilities
- **Photos**: Full access to photo library
- **Location**: Precise GPS and location services
- **Push Notifications**: Apple Push Notification Service (APNS)
- **Biometrics**: Face ID and Touch ID support
- **Haptic Feedback**: Taptic engine integration

### Platform Optimizations
- **iOS Design Language**: Native iOS UI components and animations
- **Dark Mode**: Automatic dark mode support
- **Dynamic Type**: Text scaling for accessibility
- **Split View**: iPad multitasking support
- **Siri Integration**: Siri shortcuts and intents

## 🔄 Next Steps

After completing iOS setup:

1. **Test on Multiple Devices**: Test on different iOS versions and device sizes
2. **Optimize Performance**: Use Xcode Instruments to identify bottlenecks
3. **Configure CI/CD**: Set up automated builds with Xcode Cloud or CI services
4. **Monitor Analytics**: Integrate crash reporting and analytics
5. **Prepare Updates**: Plan for App Store updates and maintenance

## 📞 Support Resources

- **Apple Developer Docs**: [developer.apple.com/documentation](https://developer.apple.com/documentation)
- **Xcode Help**: Xcode > Help > Xcode Help
- **Capacitor iOS Guide**: [capacitorjs.com/docs/ios](https://capacitorjs.com/docs/ios)
- **Ionic iOS Guide**: [ionicframework.com/docs/developing/ios](https://ionicframework.com/docs/developing/ios)
- **App Store Connect**: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)