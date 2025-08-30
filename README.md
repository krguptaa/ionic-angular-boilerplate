# Ionic 8 + Angular Boilerplate

A comprehensive, production-ready Ionic 8 + Angular boilerplate with authentication, theming, platform-specific features, and modern development practices.

![Ionic](https://img.shields.io/badge/Ionic-8.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-20.0.0-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-blue.svg)
![Capacitor](https://img.shields.io/badge/Capacitor-7.0.0-green.svg)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Secure storage for sensitive data
- Route guards with role-based access control
- Automatic token refresh and session management
- Password reset and account recovery

### 🎨 Theming & UI
- Comprehensive theme system with light/dark/auto modes
- Responsive design with breakpoints
- Reusable UI components (buttons, inputs, modals, alerts, toasts)
- Customizable color schemes and typography
- Platform-specific styling

### 📱 Platform Support
- **Web/PWA**: Full PWA support with service worker and offline capabilities
- **Android**: Native Android app with full device integration
- **iOS**: Native iOS app with platform-specific features
- Cross-platform camera, location, and push notification support

### 🔧 Core Services
- **API Service**: Generic HTTP client with interceptors and error handling
- **State Management**: Angular Signals-based reactive state management
- **Platform Service**: Device detection and platform-specific features
- **Network Monitoring**: Real-time connectivity status and offline support

### 📦 Additional Features
- Form validation utilities
- Date/time formatting helpers
- File upload and management
- Push notifications with background handling
- Biometric authentication support
- Haptic feedback and device vibration
- Clipboard and sharing capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Ionic CLI: `npm install -g @ionic/cli`
- Angular CLI: `npm install -g @angular/cli`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/krguptaa/ionic-angular-boilerplate.git
   cd ionic-boilerplate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp src/environments/environment.ts src/environments/environment.prod.ts
   # Edit environment files with your API endpoints
   ```

4. **Run the development server**:
   ```bash
   npm start
   ```

## 📋 Project Structure

```
src/
├── app/
│   ├── auth/                    # Authentication module
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   └── auth-routing.module.ts
│   ├── guards/                 # Route guards
│   │   └── auth.guard.ts       # Authentication guard
│   ├── home/                   # Home page
│   ├── interceptors/           # HTTP interceptors
│   │   └── auth.interceptor.ts # JWT token interceptor
│   ├── models/                 # TypeScript interfaces
│   ├── services/               # Application services
│   │   ├── api.service.ts      # Generic API service
│   │   ├── auth.service.ts     # Authentication service
│   │   ├── camera.service.ts   # Camera functionality
│   │   ├── location.service.ts # Geolocation service
│   │   ├── platform.service.ts # Platform utilities
│   │   ├── push-notifications.service.ts # Push notifications
│   │   └── state/              # State management
│   │       ├── base-state.service.ts
│   │       ├── user-state.service.ts
│   │       ├── app-state.service.ts
│   │       └── network-state.service.ts
│   ├── shared/                 # Shared components and modules
│   │   ├── components/         # Reusable UI components
│   │   │   ├── alert/          # Alert component
│   │   │   ├── toast/          # Toast notifications
│   │   │   ├── card/           # Card component
│   │   │   ├── badge/          # Badge component
│   │   │   ├── custom-button/  # Enhanced button
│   │   │   ├── custom-input/   # Enhanced input
│   │   │   ├── custom-modal/   # Enhanced modal
│   │   │   └── loading-spinner/ # Loading spinner
│   │   └── shared.module.ts    # Shared module
│   ├── utilities/              # Utility classes
│   │   ├── date.utils.ts       # Date formatting
│   │   ├── validation.utils.ts # Form validation
│   │   ├── platform.utils.ts   # Platform detection
│   │   └── index.ts            # Utility exports
│   ├── constants/              # Application constants
│   ├── theme/                  # Theme configuration
│   │   └── variables.scss      # SCSS variables
│   └── environments/           # Environment configurations
├── assets/                     # Static assets
├── android/                    # Android platform files
├── ios/                        # iOS platform files
└── resources/                  # Icon and splash screen sources
```

## 🏗️ Architecture

### State Management
The application uses Angular Signals for reactive state management:

```typescript
// User state example
export class UserStateService extends BaseStateService<UserState> {
  public readonly isLoggedIn = computed(() => this.state().isAuthenticated);
  public readonly currentUser = computed(() => this.state().currentUser);

  setUser(user: User, token: string) {
    this.updateState({
      currentUser: user,
      isAuthenticated: true,
      session: { token, refreshToken: null, expiresAt: null }
    });
  }
}
```

### Service Layer
Clean separation of concerns with dedicated services:

```typescript
// API Service with error handling
@Injectable({ providedIn: 'root' })
export class ApiService {
  get<T>(endpoint: string, options?: ApiOptions): Observable<T> {
    return this.request<T>('GET', endpoint, null, options);
  }

  post<T>(endpoint: string, data: any, options?: ApiOptions): Observable<T> {
    return this.request<T>('POST', endpoint, data, options);
  }
}
```

### Component Architecture
Reusable, platform-aware components:

```typescript
@Component({
  selector: 'app-custom-button',
  template: `
    <ion-button [class.loading]="loading" (click)="onClick($event)">
      <ion-spinner *ngIf="loading"></ion-spinner>
      <ng-content></ng-content>
    </ion-button>
  `
})
export class CustomButtonComponent {
  @Input() loading = false;
  @Output() buttonClick = new EventEmitter<Event>();
}
```

## 📱 Platform-Specific Setup

### Android Setup

1. **Add Android platform**:
   ```bash
   npx cap add android
   ```

2. **Configure permissions** in `android/app/src/main/AndroidManifest.xml`

3. **Build and run**:
   ```bash
   npx cap run android
   ```

### iOS Setup

1. **Add iOS platform**:
   ```bash
   npx cap add ios
   ```

2. **Configure permissions** in `ios/App/App/Info.plist`

3. **Build and run**:
   ```bash
   npx cap run ios
   ```

### PWA Setup

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Serve with HTTPS** for full PWA functionality

3. **Register service worker** (automatically configured)

## 🎨 Theming

### Theme Configuration
The application supports multiple theme modes:

```scss
// Light theme (default)
:root {
  --theme-bg-primary: #ffffff;
  --theme-text-primary: #000000;
  --theme-primary: #3880ff;
}

// Dark theme
[data-theme="dark"] {
  --theme-bg-primary: #1e1e1e;
  --theme-text-primary: #ffffff;
  --theme-primary: #4c8dff;
}
```

### Theme Service
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  setTheme(theme: 'light' | 'dark' | 'auto') {
    // Implementation
  }

  toggleTheme() {
    // Implementation
  }
}
```

## 🔐 Authentication Flow

### Login Process
```typescript
// Login component
async onLogin(credentials: LoginRequest) {
  try {
    const response = await this.authService.login(credentials).toPromise();
    this.userState.setUser(response.user, response.accessToken);
    this.router.navigate(['/home']);
  } catch (error) {
    this.toastService.showError('Login failed');
  }
}
```

### Route Protection
```typescript
// Route guard
canActivate(route: ActivatedRouteSnapshot): boolean {
  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/auth/login']);
    return false;
  }
  return true;
}
```

## 📡 API Integration

### Base API Configuration
```typescript
// API Service
export const APP_CONSTANTS = {
  API_BASE_URL: 'https://api.example.com',
  TIMEOUTS: {
    HTTP_REQUEST: 30000,
    CACHE_EXPIRY: 3600000
  }
};
```

### HTTP Interceptor
```typescript
// Auth Interceptor
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // Add JWT token to requests
  const token = await this.authService.getAccessToken();
  if (token) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(request);
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run e2e
```

### Linting
```bash
npm run lint
```

## 📦 Build & Deployment

### Development
```bash
npm start          # Development server
npm run watch      # Watch mode
```

### Production Build
```bash
npm run build      # Web build
npx cap build      # Native builds
```

### Deployment
```bash
# Web deployment
npm run build --prod
# Deploy to hosting service

# Android deployment
npx cap build android
# Sign and upload to Play Store

# iOS deployment
npx cap build ios
# Archive and upload to App Store
```

## 🔧 Configuration

### Environment Variables
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://api-dev.example.com',
  enableDebug: true,
  firebaseConfig: { /* ... */ }
};
```

### Capacitor Configuration
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.yourcompany.boilerplate',
  appName: 'Ionic Boilerplate',
  webDir: 'www',
  plugins: {
    Camera: { allowEditing: true },
    Geolocation: { enableHighAccuracy: true },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] }
  }
};
```

## 📚 Documentation

- [Ionic Documentation](https://ionicframework.com/docs)
- [Angular Documentation](https://angular.io/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Icons & Splash Screens Guide](./ICONS_SPLASH_README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ionic Framework team
- Angular team
- Capacitor team
- All contributors and the open-source community

## 📞 Support

For support, email support@yourcompany.com or join our Slack channel.

---

**Happy coding! 🚀**

Built with ❤️ using Ionic 8 + Angular