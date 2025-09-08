# Troubleshooting Guide

**Estimated time: 10 minutes**

## Overview

This guide provides solutions to common issues encountered during development, building, and deployment of the Ionic Angular application.

## 🔍 General Debugging Steps

### 1. Check Development Environment

```bash
# Verify Node.js and npm versions
node --version
npm --version

# Check Angular CLI version
ng version

# Verify project dependencies
npm list --depth=0

# Check if ports are available
netstat -ano | findstr :4200  # Windows
lsof -i :4200                 # macOS/Linux
```

### 2. Clear Cache and Reinstall

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Clear Angular cache
rm -rf .angular/cache
```

### 3. Check Browser Console

1. Open Developer Tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed requests
4. Check Application tab for service worker issues

## 🚀 Development Server Issues

### Issue 1: Port 4200 Already in Use

**Symptoms**: `ng serve` fails with "Port 4200 is already in use"

**Solutions**:

```bash
# Use different port
ng serve --port=4201

# Find and kill process using port 4200
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4200 | xargs kill -9

# Or use a port finder
ng serve --port=0  # Auto-assigns available port
```

### Issue 2: Development Server Won't Start

**Symptoms**: `ng serve` hangs or exits immediately

**Solutions**:

```bash
# Check for syntax errors
ng build --configuration=development

# Clear Angular cache
rm -rf .angular/cache

# Check for missing dependencies
npm install

# Try with verbose logging
ng serve --verbose
```

### Issue 3: Hot Reload Not Working

**Symptoms**: Changes not reflected in browser automatically

**Solutions**:

```bash
# Disable and re-enable hot reload
ng serve --live-reload=true

# Clear browser cache
# Chrome: Ctrl+Shift+R (Windows/Linux), Cmd+Shift+R (macOS)

# Check file watching
ng serve --poll=1000  # For network drives
```

## 🔌 API and Backend Issues

### Issue 1: CORS Errors

**Symptoms**: Browser console shows CORS-related errors

**Solutions**:

```bash
# For development: Ensure proxy is configured
# Check proxy.conf.json exists and is referenced in angular.json

# For production: Configure backend CORS headers
# Backend should include:
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Issue 2: API Calls Failing

**Symptoms**: HTTP requests return 404, 500, or network errors

**Solutions**:

```bash
# Check backend server is running
curl http://localhost:8000/api/health

# Verify API endpoints match
# Check environment.apiUrl in environment files

# Test with direct curl
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/test

# Check network connectivity
ping localhost
```

### Issue 3: Authentication Issues

**Symptoms**: Login fails or user sessions don't persist

**Solutions**:

```bash
# Check JWT token storage
# Open browser DevTools > Application > Local Storage

# Verify token expiration
# Check if token is valid format

# Test API with token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/user

# Clear stored tokens
localStorage.clear()
sessionStorage.clear()
```

## 📱 Platform-Specific Issues

### Android Issues

#### Issue 1: Build Fails with Gradle Errors

**Solutions**:

```bash
# Clean Gradle cache
cd android
./gradlew clean
rm -rf ~/.gradle/caches/

# Update Gradle wrapper
./gradlew wrapper --gradle-version=8.0

# Check Android SDK
echo $ANDROID_HOME
ls $ANDROID_HOME/platform-tools/
```

#### Issue 2: Device Not Recognized

**Solutions**:

```bash
# Enable USB debugging on device
# Settings > Developer Options > USB Debugging

# Check device connection
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Try different USB cable/port
```

#### Issue 3: App Crashes on Launch

**Solutions**:

```bash
# Check device logs
adb logcat | grep -i error

# Check AndroidManifest.xml permissions
# Verify all required permissions are declared

# Test on emulator first
npx cap run android --target=Nexus_5X_API_29
```

### iOS Issues

#### Issue 1: Code Signing Errors

**Solutions**:

```bash
# Check certificates in Keychain Access
# Verify bundle identifier matches App ID

# Clean and rebuild
npx cap sync ios
rm -rf ios/App/Pods ios/App/Podfile.lock
cd ios/App && pod install

# Check provisioning profiles
# Xcode > Preferences > Accounts > Download Manual Profiles
```

#### Issue 2: CocoaPods Installation Issues

**Solutions**:

```bash
# Update CocoaPods
sudo gem install cocoapods

# Clean and reinstall
cd ios/App
rm -rf Pods Podfile.lock
pod install

# Use bundle exec if using bundler
bundle exec pod install
```

#### Issue 3: Simulator Issues

**Solutions**:

```bash
# Reset simulator
xcrun simctl erase all

# List available simulators
xcrun simctl list devices

# Create new simulator
xcrun simctl create "iPhone 14" com.apple.CoreSimulator.SimDeviceType.iPhone-14
```

## 🌐 PWA Issues

### Issue 1: Service Worker Not Registering

**Symptoms**: PWA features not working, no offline support

**Solutions**:

```bash
# Check if service worker is generated
ls www/ngsw-worker.js

# Verify ngsw-config.json exists
cat ngsw-config.json

# Check browser console for registration errors
# Open DevTools > Application > Service Workers

# Clear service worker
# DevTools > Application > Storage > Clear Storage
```

### Issue 2: App Not Installable

**Symptoms**: Install prompt doesn't appear

**Solutions**:

```bash
# Verify manifest.json
cat www/manifest.json

# Check HTTPS (required for PWA)
# Ensure all resources are served over HTTPS

# Test with Lighthouse
npx lighthouse http://localhost:4200 --output html

# Check manifest validity
# https://manifest-validator.appspot.com/
```

### Issue 3: Offline Not Working

**Symptoms**: App doesn't work without internet

**Solutions**:

```bash
# Check service worker cache
# DevTools > Application > Storage > Cache Storage

# Verify ngsw-config.json caching rules
# Test cache-first vs network-first strategies

# Check for runtime caching issues
# DevTools > Application > Service Workers > Inspect
```

## 🏗️ Build Issues

### Issue 1: Build Fails with Memory Errors

**Symptoms**: "JavaScript heap out of memory"

**Solutions**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" ng build --configuration=production

# Or add to package.json scripts
"build:prod": "NODE_OPTIONS=--max-old-space-size=4096 ng build --configuration=production"

# Use build cache
ng build --configuration=production --cache
```

### Issue 2: Bundle Size Too Large

**Symptoms**: Build exceeds size limits

**Solutions**:

```bash
# Analyze bundle
ng build --configuration=production --stats-json
npx webpack-bundle-analyzer dist/production/stats.json

# Enable tree shaking
ng build --configuration=production --optimization=true

# Implement lazy loading
# Use dynamic imports for feature modules
```

### Issue 3: Environment Variables Not Working

**Symptoms**: Wrong API URLs or configuration in production

**Solutions**:

```bash
# Check file replacements in angular.json
# Verify environment files exist and are correct

# Test with different configurations
ng build --configuration=uat
ng build --configuration=production

# Check build output
cat dist/production/main.js | grep "apiUrl"
```

## 🔧 Capacitor Issues

### Issue 1: Plugin Not Working

**Symptoms**: Native features fail on device

**Solutions**:

```bash
# Re-sync plugins
npx cap sync

# Check plugin installation
npx cap ls

# Verify platform-specific configuration
# Android: AndroidManifest.xml
# iOS: Info.plist

# Test on different devices
npx cap run android --target=<device-id>
```

### Issue 2: Sync Fails

**Symptoms**: `npx cap sync` fails

**Solutions**:

```bash
# Clean and resync
npx cap clean
npx cap sync

# Check Capacitor versions
npx cap --version
npm list @capacitor/core @capacitor/cli

# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest
npx cap migrate
```

## 🧪 Testing Issues

### Issue 1: Tests Failing

**Symptoms**: Unit tests or E2E tests fail

**Solutions**:

```bash
# Run tests with verbose output
ng test --verbose

# Check for async issues
# Use fakeAsync/tick for testing

# Update test dependencies
npm install --save-dev @types/jasmine

# Check test configuration
cat karma.conf.js
```

### Issue 2: Coverage Reports Empty

**Symptoms**: No coverage data generated

**Solutions**:

```bash
# Run with coverage
ng test --code-coverage --watch=false

# Check coverage configuration in karma.conf.js
# Verify Istanbul is properly configured

# Check file paths
ls coverage/index.html
```

## 🌍 Deployment Issues

### Issue 1: Routing Issues in Production

**Symptoms**: Angular routes return 404 after refresh

**Solutions**:

```nginx
# Nginx configuration
location / {
    try_files $uri $uri/ /index.html;
}
```

```apache
# Apache .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Issue 2: HTTPS Mixed Content Errors

**Symptoms**: Some resources load over HTTP on HTTPS site

**Solutions**:

```bash
# Update all resource URLs to HTTPS
# Check environment files for HTTP URLs
# Update API base URLs to HTTPS
# Use protocol-relative URLs where possible
```

### Issue 3: Service Worker Cache Issues

**Symptoms**: Old cached version served after deployment

**Solutions**:

```bash
# Update service worker version
# Modify ngsw-config.json to force cache invalidation

# Clear browser cache
# Hard refresh: Ctrl+Shift+R

# Update cache headers
# Set appropriate Cache-Control headers
```

## 📊 Performance Issues

### Issue 1: Slow Initial Load

**Symptoms**: App takes too long to load

**Solutions**:

```bash
# Enable gzip compression
# Implement code splitting
# Optimize bundle size
# Use lazy loading
# Enable service worker caching

# Check with Lighthouse
npx lighthouse http://localhost:4200
```

### Issue 2: Memory Leaks

**Symptoms**: App performance degrades over time

**Solutions**:

```bash
# Check for subscription leaks
# Use takeUntil pattern with destroy$
# Unsubscribe in ngOnDestroy
# Avoid circular references

# Use Chrome DevTools Memory tab
# Take heap snapshots to identify leaks
```

## 🔍 Advanced Debugging

### Chrome DevTools Tips

1. **Network Tab**: Check failed requests and response times
2. **Console Tab**: Look for JavaScript errors and warnings
3. **Application Tab**: Inspect storage, cache, and service workers
4. **Performance Tab**: Analyze runtime performance
5. **Memory Tab**: Check for memory leaks

### Remote Debugging

```bash
# Android Chrome remote debugging
# Open chrome://inspect/#devices

# iOS Safari remote debugging
# Safari > Develop > [Device Name] > [App Name]
```

### Logging and Monitoring

```typescript
// Add comprehensive logging
private logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

## 📞 Getting Help

### Quick Checklist

- [ ] Check browser console for errors
- [ ] Verify all dependencies are installed
- [ ] Test with different browsers/devices
- [ ] Check network connectivity
- [ ] Clear cache and try again
- [ ] Check version compatibility
- [ ] Review recent changes for breaking changes

### When to Ask for Help

- Issue persists after trying all solutions
- Error messages are unclear or cryptic
- Problem affects multiple team members
- Issue is blocking development progress
- Need architectural or design guidance

### Support Resources

- **Project Issues**: Check existing GitHub issues
- **Team Chat**: Ask in development team chat
- **Documentation**: Review all guides in `/docs` folder
- **External Resources**: Check official documentation links

---

**Remember**: Most issues have simple solutions. Start with basic troubleshooting steps before diving into complex fixes.