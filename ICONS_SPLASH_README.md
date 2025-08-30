# App Icons and Splash Screens Setup

This guide explains how to set up app icons and splash screens for the Ionic Boilerplate project across all platforms (Android, iOS, PWA).

## 📱 Icon Requirements

### Source Files
- **App Icon**: Create a 1024x1024 PNG file at `resources/icon.png`
- **Splash Screen**: Create a 2732x2732 PNG file at `resources/splash.png`

### Generated Icon Sizes

#### Web/PWA Icons
| Size | File Name | Purpose |
|------|-----------|---------|
| 72x72 | `icon-72x72.png` | Android home screen |
| 96x96 | `icon-96x96.png` | Web app |
| 128x128 | `icon-128x128.png` | Web app |
| 144x144 | `icon-144x144.png` | Android home screen |
| 152x152 | `icon-152x152.png` | iPad |
| 192x192 | `icon-192x192.png` | Android Chrome |
| 384x384 | `icon-384x384.png` | Web app |
| 512x512 | `icon-512x512.png` | Web app |

#### Android Icons
| Size | Density | Location |
|------|---------|----------|
| 36x36 | ldpi | `android/app/src/main/res/mipmap-ldpi/ic_launcher.png` |
| 48x48 | mdpi | `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` |
| 72x72 | hdpi | `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` |
| 96x96 | xhdpi | `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` |
| 144x144 | xxhdpi | `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` |
| 192x192 | xxxhdpi | `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` |

#### iOS Icons
| Size | File Name |
|------|-----------|
| 20x20 | `AppIcon-20x20@1x.png` |
| 40x40 | `AppIcon-20x20@2x.png` |
| 60x60 | `AppIcon-20x20@3x.png` |
| 29x29 | `AppIcon-29x29@1x.png` |
| 58x58 | `AppIcon-29x29@2x.png` |
| 87x87 | `AppIcon-29x29@3x.png` |
| 40x40 | `AppIcon-40x40@1x.png` |
| 80x80 | `AppIcon-40x40@2x.png` |
| 120x120 | `AppIcon-40x40@3x.png` |
| 76x76 | `AppIcon-76x76@1x.png` |
| 152x152 | `AppIcon-76x76@2x.png` |
| 167x167 | `AppIcon-83.5x83.5@2x.png` |
| 1024x1024 | `AppIcon-1024x1024@1x.png` |

## 🌊 Splash Screen Requirements

### Android Splash Screens
| Width | Height | Density |
|-------|--------|---------|
| 320 | 480 | port-ldpi |
| 480 | 800 | port-mdpi |
| 720 | 1280 | port-hdpi |
| 1080 | 1920 | port-xhdpi |
| 1440 | 2560 | port-xxhdpi |

### iOS Splash Screens
| Width | Height | File Name |
|-------|--------|-----------|
| 640 | 1136 | `Default-568h@2x~iphone.png` |
| 750 | 1334 | `Default-667h@2x~iphone.png` |
| 1242 | 2208 | `Default-736h@3x~iphone.png` |
| 1125 | 2436 | `Default-812h@3x~iphone.png` |
| 1170 | 2532 | `Default-896h@2x~iphone.png` |
| 1284 | 2778 | `Default-896h@3x~iphone.png` |
| 1536 | 2048 | `Default-Landscape~ipad.png` |
| 2048 | 1536 | `Default-Portrait~ipad.png` |

## 🛠️ Setup Instructions

### Method 1: Using Capacitor Assets (Recommended)

1. **Install Capacitor Assets CLI**:
   ```bash
   npm install -g @capacitor/assets
   ```

2. **Create source files**:
   - Place your 1024x1024 icon at `resources/icon.png`
   - Place your 2732x2732 splash at `resources/splash.png`

3. **Generate assets**:
   ```bash
   npx capacitor-assets generate
   ```

4. **Copy to platforms**:
   ```bash
   npx cap copy
   ```

### Method 2: Using Ionic CLI

1. **Install Ionic CLI**:
   ```bash
   npm install -g @ionic/cli
   ```

2. **Generate resources**:
   ```bash
   ionic cordova resources
   ```

### Method 3: Manual Generation

1. **Use online tools**:
   - [PWA Builder](https://www.pwabuilder.com/)
   - [App Icon Generator](https://appicon.co/)
   - [Splash Screen Generator](https://appsco.pe/)

2. **Manual resizing**:
   - Use image editing software (Photoshop, GIMP, etc.)
   - Follow the size specifications above
   - Maintain aspect ratios

## 📂 File Structure

```
resources/
├── icon.png              # 1024x1024 source icon
├── splash.png            # 2732x2732 source splash
└── icon-config.json      # Configuration file

android/app/src/main/res/
├── mipmap-ldpi/
│   └── ic_launcher.png   # 36x36
├── mipmap-mdpi/
│   └── ic_launcher.png   # 48x48
├── mipmap-hdpi/
│   └── ic_launcher.png   # 72x72
├── mipmap-xhdpi/
│   └── ic_launcher.png   # 96x96
├── mipmap-xxhdpi/
│   └── ic_launcher.png   # 144x144
└── mipmap-xxxhdpi/
    └── ic_launcher.png   # 192x192

ios/App/App/Assets.xcassets/
└── AppIcon.appiconset/
    ├── AppIcon-20x20@1x.png
    ├── AppIcon-20x20@2x.png
    └── ... (all iOS icon sizes)

src/assets/icon/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
└── ... (all web icon sizes)
```

## 🎨 Design Guidelines

### Icon Design
- Use a simple, recognizable design
- Ensure good contrast
- Avoid text in icons
- Test on different backgrounds
- Consider platform-specific guidelines:
  - [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
  - [iOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/icons-and-images/app-icon/)

### Splash Screen Design
- Keep it simple and clean
- Use brand colors
- Include app name or logo
- Ensure readability on all devices
- Consider safe areas for notched devices

## 🔧 Configuration Files

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.boilerplate',
  appName: 'Ionic Boilerplate',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    }
  }
};

export default config;
```

### manifest.json (PWA)
```json
{
  "name": "Ionic Boilerplate",
  "short_name": "Boilerplate",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3880ff",
  "icons": [
    {
      "src": "assets/icon/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 🚀 Build Commands

### Android
```bash
npx cap add android
npx cap copy android
npx cap open android
```

### iOS
```bash
npx cap add ios
npx cap copy ios
npx cap open ios
```

### Web/PWA
```bash
npm run build
# Assets will be copied automatically
```

## 🐛 Troubleshooting

### Common Issues

1. **Icons not updating**:
   - Clear app data/cache
   - Reinstall the app
   - Check file paths in configuration

2. **Splash screen not showing**:
   - Verify splash screen plugin configuration
   - Check splash screen dimensions
   - Ensure proper background color

3. **PWA icons not working**:
   - Verify manifest.json paths
   - Check browser developer tools
   - Ensure HTTPS for production

### Debug Commands

```bash
# Check Capacitor configuration
npx cap doctor

# List connected devices
npx cap run --list

# View logs
npx cap run android --livereload
```

## 📚 Additional Resources

- [Capacitor Icons & Splash Screens](https://capacitorjs.com/docs/guides/splash-screens-and-icons)
- [PWA Manifest Generator](https://manifest-gen.appspot.com/)
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [iOS Asset Catalogs](https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/)