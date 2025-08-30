import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.boilerplate',
  appName: 'Ionic Boilerplate',
  webDir: 'www',
  plugins: {
    Camera: {
      allowEditing: true,
      saveToGallery: true,
      quality: 85
    },
    Geolocation: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Filesystem: {
      directory: 'DATA'
    }
  }
};

export default config;
