# Ionic 8 + Angular Project Documentation

## Welcome

Welcome to the comprehensive documentation for our Ionic 8 + Angular application. This documentation is designed to help developers of all levels understand, install, configure, build, and deploy the application across multiple platforms.

## 🚀 Quick Start

**Estimated time: 30 minutes**

1. **Read the Project Overview** - [01_project_overview.md](01_project_overview.md)
2. **Install Prerequisites** - [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
3. **Choose Your Platform**:
   - 📱 **Android**: [03_android_guide.md](03_android_guide.md)
   - 🍎 **iOS**: [04_ios_guide.md](04_ios_guide.md)
   - 🌐 **PWA/Web**: [05_pwa_guide.md](05_pwa_guide.md)

## 📋 What This Documentation Covers

### Core Setup
- ✅ Complete installation guide with prerequisites
- ✅ Environment configuration (Local, UAT, Production)
- ✅ Proxy setup for local development
- ✅ Build configurations for different environments

### Platform-Specific Guides
- ✅ Android app development and deployment
- ✅ iOS app development and deployment
- ✅ Progressive Web App (PWA) configuration
- ✅ Native Capacitor plugins integration

### Development Workflow
- ✅ Code modules and service definitions
- ✅ Testing and quality assurance setup
- ✅ Build and deployment strategies
- ✅ Troubleshooting common issues

## 🏗️ Project Architecture

```
Frontend (Ionic 8 + Angular)
├── Capacitor (Native Mobile)
├── PWA Support
├── Multiple Environments
│   ├── Local (Development)
│   ├── UAT (Testing)
│   └── Production
└── API Integration
```

## 📱 Supported Platforms

| Platform | Status | Target |
|----------|--------|--------|
| Android | ✅ Supported | API 21+ (Android 5.0+) |
| iOS | ✅ Supported | iOS 12.0+ |
| PWA/Web | ✅ Supported | Modern browsers |
| Desktop | ✅ Supported | Via PWA |

## 🛠️ Technology Stack

- **Framework**: Ionic 8 + Angular 20
- **Build Tool**: Angular CLI
- **Native Runtime**: Capacitor 7
- **Styling**: SCSS with Ionic Design System
- **State Management**: RxJS + Services
- **HTTP Client**: Angular HttpClient with Interceptors
- **Authentication**: JWT with automatic token refresh

## 📚 Documentation Structure

See [SUMMARY.md](SUMMARY.md) for a complete table of contents and file descriptions.

## 🔧 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ and npm
- [ ] Angular CLI 20+
- [ ] Ionic CLI 7+
- [ ] For Android: Android Studio + JDK 11+
- [ ] For iOS: Xcode 14+ + macOS
- [ ] Git for version control

## 🚀 Getting Started

### For New Developers
1. Follow [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
2. Set up your development environment
3. Run `npm install` to install dependencies
4. Start development with `ng serve`

### For Platform-Specific Development
Choose your target platform and follow the corresponding guide:
- **Android**: Complete Android setup and run `npx cap run android`
- **iOS**: Complete iOS setup and run `npx cap run ios`
- **PWA**: Configure PWA settings and build for production

## 🔄 Development Workflow

1. **Local Development**: Use `ng serve` with proxy configuration
2. **Testing**: Run unit tests with `ng test` and E2E with appropriate tools
3. **Building**: Use `ng build --configuration=<environment>`
4. **Native Builds**: Use Capacitor commands for mobile platforms
5. **Deployment**: Follow platform-specific deployment guides

## 🐛 Need Help?

- Check [12_troubleshooting.md](12_troubleshooting.md) for common issues
- Review [11_testing_and_quality.md](11_testing_and_quality.md) for debugging tips
- See [10_proxy.md](10_proxy.md) for local development setup

## 📞 Support

- **Documentation**: This `/docs` folder contains all guides
- **Issues**: Check existing issues or create new ones
- **Discussions**: Use project discussions for questions

## 📈 Version Information

- **Current Version**: 1.0.0
- **Ionic Version**: 8.x
- **Angular Version**: 20.x
- **Capacitor Version**: 7.x
- **Node.js Required**: 18.0+

---

**Happy Coding! 🎉**

*This documentation is maintained by the development team and is updated with each release.*