# Frontend and PWA Deployment Guide

**Estimated time: 15-20 minutes**

## Overview

This guide covers deployment strategies for the Ionic Angular application as a Progressive Web App (PWA) and traditional web application. It includes various hosting options, CI/CD integration, and performance optimization techniques.

## 📋 Prerequisites Checklist

Before deploying the application:

- [ ] **Build Complete**: Production build generated successfully
- [ ] **Domain Ready**: Domain name and DNS configured
- [ ] **SSL Certificate**: HTTPS certificate obtained (required for PWA)
- [ ] **Hosting Account**: Hosting provider account set up
- [ ] **Environment Config**: Production environment variables configured
- [ ] **CDN Setup**: Content Delivery Network configured (optional)

### Deployment Types

| Type | Use Case | Requirements | Complexity |
|------|----------|--------------|------------|
| **Static Hosting** | Simple web apps, PWAs | Web server, HTTPS | Low |
| **Cloud Hosting** | Scalable applications | Cloud account, CI/CD | Medium |
| **Serverless** | API-integrated apps | Cloud functions, CDN | High |
| **Hybrid** | Complex applications | Multiple services | High |

## 🌐 Static Hosting Deployment

### Firebase Hosting

**Best for**: Quick deployment, automatic SSL, global CDN

#### Setup Firebase
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init hosting
```

#### Configure Firebase Hosting

**File**: `firebase.json`
```json
{
  "hosting": {
    "public": "www",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(png|jpg|jpeg|gif|svg|ico|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### Deploy to Firebase
```bash
# Build production version
ng build --configuration=production

# Deploy to Firebase
firebase deploy

# Or deploy specific site
firebase deploy --only hosting
```

### Vercel

**Best for**: Git-integrated deployment, preview deployments

#### Setup Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

#### Configure Vercel

**File**: `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "www"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify

**Best for**: Form handling, function integration, team collaboration

#### Setup Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Or deploy manually
netlify deploy --prod --dir=www
```

#### Configure Netlify

**File**: `netlify.toml`
```toml
[build]
  publish = "www"
  command = "ng build --configuration=production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

## 🖥️ Traditional Web Server Deployment

### Nginx Configuration

**Best for**: High-performance, custom server configuration

#### Build and Prepare Files
```bash
# Build production version
ng build --configuration=production

# Copy files to web server
scp -r www/* user@server:/var/www/html/
```

#### Nginx Configuration

**File**: `/etc/nginx/sites-available/ionic-app`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'" always;

    # Root directory
    root /var/www/html;
    index index.html;

    # Handle Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Security: Don't serve dotfiles
    location ~ /\. {
        deny all;
    }

    # Logs
    access_log /var/log/nginx/ionic-app_access.log;
    error_log /var/log/nginx/ionic-app_error.log;
}
```

#### Enable Site and SSL
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ionic-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Get SSL certificate (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Apache Configuration

**Best for**: Shared hosting, .htaccess support

#### Apache Configuration

**File**: `/etc/apache2/sites-available/ionic-app.conf`

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Handle Angular routing
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]

    # Security headers
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"

    # Cache headers
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>

    ErrorLog ${APACHE_LOG_DIR}/ionic-app_error.log
    CustomLog ${APACHE_LOG_DIR}/ionic-app_access.log combined
</VirtualHost>
```

#### Enable Site
```bash
# Enable site
sudo a2ensite ionic-app

# Enable rewrite module
sudo a2enmod rewrite

# Restart Apache
sudo systemctl restart apache2
```

## ☁️ Cloud Platform Deployment

### AWS S3 + CloudFront

**Best for**: Scalable, cost-effective static hosting

#### Setup S3 Bucket
```bash
# Install AWS CLI
pip install awscli

# Configure AWS
aws configure

# Create S3 bucket
aws s3 mb s3://your-app-bucket

# Enable static website hosting
aws s3 website s3://your-app-bucket --index-document index.html --error-document index.html
```

#### Deploy to S3
```bash
# Build application
ng build --configuration=production

# Sync to S3
aws s3 sync www/ s3://your-app-bucket --delete --cache-control max-age=31536000,public

# Set cache policies for different file types
aws s3 cp www/index.html s3://your-app-bucket/index.html --cache-control max-age=0,no-cache,no-store,must-revalidate
```

#### CloudFront Distribution
```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Google Cloud Storage

**Best for**: Google ecosystem integration

```bash
# Install Google Cloud SDK
# Download from https://cloud.google.com/sdk

# Authenticate
gcloud auth login

# Create bucket
gsutil mb gs://your-app-bucket

# Deploy
gsutil -m cp -r www/* gs://your-app-bucket

# Make public
gsutil iam ch allUsers:objectViewer gs://your-app-bucket
```

## 🔄 CI/CD Integration

### GitHub Actions

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build:prod

    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: your-project-id
```

### Vercel Git Integration

**File**: `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "www"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "github": {
    "silent": true
  }
}
```

## 📊 Performance Optimization

### CDN Integration

#### Cloudflare Configuration
```bash
# Install Wrangler CLI
npm install -g wrangler

# Configure Cloudflare
wrangler auth login

# Deploy
wrangler publish
```

### Service Worker Optimization

**File**: `ngsw-config.json`

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

## 🔒 Security Best Practices

### HTTPS Enforcement

```nginx
# Nginx HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Content Security Policy

```nginx
# Nginx CSP header
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### Security Headers

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 📋 Deployment Checklist

- [ ] Production build completed successfully
- [ ] Environment variables configured for production
- [ ] HTTPS certificate installed and configured
- [ ] Domain DNS configured correctly
- [ ] CDN configured for global distribution
- [ ] Service worker configured for offline support
- [ ] Security headers implemented
- [ ] Monitoring and error tracking set up
- [ ] Backup and rollback procedures documented
- [ ] Performance monitoring configured

## 🎯 Success Criteria

✅ **Deployment Complete**: Application accessible at production URL
✅ **HTTPS Enabled**: SSL certificate properly configured
✅ **Performance**: Lighthouse score > 90
✅ **PWA Ready**: Service worker active, installable
✅ **Security**: Security headers implemented
✅ **Monitoring**: Error tracking and analytics configured
✅ **Scalability**: CDN and caching properly configured

## 🔧 Common Deployment Issues

### Issue 1: Routing Problems
**Problem**: Angular routes return 404 on refresh
**Fix**: Configure server to serve `index.html` for all routes
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Issue 2: Service Worker Not Working
**Problem**: PWA features not working in production
**Fix**:
- Ensure HTTPS is enabled
- Check service worker registration
- Verify ngsw-config.json is correct
- Clear browser cache and service worker

### Issue 3: CORS Issues
**Problem**: API calls failing in production
**Fix**:
- Update API base URL in production environment
- Configure CORS headers on backend
- Check for mixed content (HTTP/HTTPS) issues

### Issue 4: Caching Problems
**Problem**: Old version served after deployment
**Fix**:
- Implement cache busting with file hashing
- Set appropriate cache headers
- Clear CDN cache if using CDN
- Update service worker version

### Issue 5: SSL Certificate Issues
**Problem**: HTTPS not working properly
**Fix**:
- Verify certificate installation
- Check certificate validity dates
- Ensure certificate matches domain
- Configure HSTS headers

## 📊 Monitoring and Analytics

### Performance Monitoring

```javascript
// Add to main.ts or app.component.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Error Tracking

```typescript
// Install error tracking
npm install @sentry/angular @sentry/tracing

// Configure in app.module.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "your-dsn-here",
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  tracesSampleRate: 1.0,
});
```

## 🔄 Next Steps

After successful deployment:

1. **Monitor Performance**: Set up monitoring and alerting
2. **User Testing**: Conduct user acceptance testing
3. **SEO Optimization**: Implement meta tags and structured data
4. **Analytics**: Configure conversion tracking
5. **Maintenance**: Plan for updates and security patches
6. **Scaling**: Monitor usage and scale infrastructure as needed

## 📞 Support Resources

- **Firebase Hosting**: [firebase.google.com/docs/hosting](https://firebase.google.com/docs/hosting)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **AWS S3**: [docs.aws.amazon.com/s3](https://docs.aws.amazon.com/s3)
- **Nginx Config**: [nginx.org/en/docs](https://nginx.org/en/docs)