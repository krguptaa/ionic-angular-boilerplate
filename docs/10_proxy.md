# Proxy Configuration Guide

**Estimated time: 10 minutes**

## Overview

This guide explains the proxy configuration setup for local development, enabling seamless communication between the Ionic frontend and Laravel backend while bypassing CORS restrictions.

## 📋 Prerequisites Checklist

Before configuring the proxy:

- [ ] **Ionic Frontend**: Complete [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
- [ ] **Laravel Backend**: Backend server running on configured port
- [ ] **Environment Files**: Environment configurations set up
- [ ] **Development Server**: Understanding of Angular development workflow

### Proxy Concepts

| Concept | Description | Purpose |
|---------|-------------|---------|
| **Proxy Server** | Intermediary server forwarding requests | Bypass CORS restrictions |
| **CORS Bypass** | Cross-Origin Resource Sharing workaround | Enable local API calls |
| **Path Mapping** | URL path translation | Match backend API structure |
| **Environment Specific** | Different configs per environment | Flexible development setup |

## 🛠️ Proxy Configuration Setup

### Current Proxy Configuration

**File**: `proxy.conf.json`

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

### Angular Configuration

**File**: `angular.json` (serve configuration)

```json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "proxyConfig": "proxy.conf.json"
    },
    "configurations": {
      "development": {
        "buildTarget": "app:build:development"
      }
    }
  }
}
```

## 🔧 How the Proxy Works

### Request Flow

```
Frontend Request → Angular Dev Server → Proxy → Backend API
      ↓                    ↓              ↓          ↓
   /api/users     →    localhost:4200  →  localhost:8000/api/users
```

### Configuration Parameters

| Parameter | Description | Example | Purpose |
|-----------|-------------|---------|---------|
| **target** | Backend server URL | `"http://localhost:8000"` | Where to forward requests |
| **secure** | Use HTTPS | `false` | For local HTTP development |
| **changeOrigin** | Change host header | `true` | Prevent CORS issues |
| **logLevel** | Logging verbosity | `"debug"` | Debug proxy activity |
| **pathRewrite** | URL path modification | `{"^/api": ""}` | Remove path prefixes |

## 🎯 Backend Path Support

### Multiple Path Configurations

The proxy supports different backend path structures used by team members:

#### Backend Path: `/simulator-services`
```json
"/simulator-services/*": {
  "target": "http://localhost:8000",
  "secure": false,
  "changeOrigin": true,
  "logLevel": "debug"
}
```

#### Backend Path: `/simulator`
```json
"/simulator/*": {
  "target": "http://localhost:8000",
  "secure": false,
  "changeOrigin": true,
  "logLevel": "debug"
}
```
## 👥 Team Member Customization

### Developer A (Default Setup)
```json
{
  "/simulator-services/*": {
    "target": "http://localhost:8000"
  }
}
```

### Developer B (Different Port)
```json
{
  "/simulator-services/*": {
    "target": "http://localhost:3000"
  }
}
```

### Developer C (Using 127.0.0.1)
```json
{
  "/simulator-services/*": {
    "target": "http://127.0.0.1:8000"
  }
}
```

### Developer D (Different Backend)
```json
{
  "/simulator/*": {
    "target": "http://localhost:8080"
  }
}
```

## 🚀 Using the Proxy

### Starting Development Server

```bash
# Start with proxy (automatic)
ng serve

# Start with specific configuration
ng serve --configuration=development

# Start on different port
ng serve --port=4201
```

### Testing Proxy Configuration

```bash
# Check if proxy is working
curl http://localhost:4200/simulator-services/api/test

# Should proxy to: http://localhost:8000/simulator-services/api/test
```

### Debugging Proxy Issues

```bash
# Enable verbose logging
ng serve --verbose

# Check browser network tab
# Look for requests going to localhost:4200 but proxied to localhost:8000
```

## 🔧 Advanced Proxy Configuration

### Path Rewriting

If your backend expects different paths than your frontend:

```json
{
  "/api/*": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": "/backend-api"
    }
  }
}
```

This rewrites `/api/users` to `/backend-api/users` on the backend.

### Multiple Backend Services

For microservices architecture:

```json
{
  "/api/auth/*": {
    "target": "http://localhost:8001",
    "secure": false,
    "changeOrigin": true
  },
  "/api/data/*": {
    "target": "http://localhost:8002",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Custom Headers

Add custom headers to proxied requests:

```json
{
  "/api/*": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "headers": {
      "X-API-Key": "your-api-key",
      "X-Environment": "development"
    }
  }
}
```

## 🔒 Security Considerations

### Development vs Production

**Development (HTTP):**
```json
{
  "target": "http://localhost:8000",
  "secure": false
}
```

**Production (HTTPS):**
```json
{
  "target": "https://api.yourdomain.com",
  "secure": true,
  "changeOrigin": true
}
```

### Environment-Specific Configuration

Create different proxy configs for different environments:

**File**: `proxy.conf.dev.json`
```json
{
  "/api/*": {
    "target": "http://localhost:8000",
    "secure": false
  }
}
```

**File**: `proxy.conf.prod.json`
```json
{
  "/api/*": {
    "target": "https://api.production.com",
    "secure": true
  }
}
```

## 📊 Environment Integration

### Environment Files

**File**: `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  corsBypass: true
};
```

**File**: `src/environments/environment.uat.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://uat1.demo.com'
};
```

**File**: `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://app.demo.com'
};
```

### Dynamic API URLs

**File**: `src/app/constants/index.ts`
```typescript
import { environment } from '../../environments/environment';

export const APP_CONSTANTS = {
  API_BASE_URL: environment.apiUrl,
  // ... other constants
};
```

## 🔍 Troubleshooting Proxy Issues

### Issue 1: CORS Errors Still Occurring
**Problem**: Browser still shows CORS errors
**Fix**:
```json
{
  "target": "http://localhost:8000",
  "secure": false,
  "changeOrigin": true,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  }
}
```

### Issue 2: Proxy Not Working
**Problem**: Requests not being proxied
**Fix**:
- Check if `proxy.conf.json` is referenced in `angular.json`
- Verify target server is running
- Check browser network tab for actual request URLs
- Ensure path patterns match your API calls

### Issue 3: Backend Not Receiving Requests
**Problem**: Backend server not receiving proxied requests
**Fix**:
- Verify target URL and port are correct
- Check if backend allows connections from Angular dev server
- Ensure backend CORS settings allow the proxy origin
- Test direct backend access: `curl http://localhost:8000/api/test`

### Issue 4: Authentication Issues
**Problem**: Auth tokens not being sent to backend
**Fix**:
- Check if auth interceptor is working
- Verify token storage and retrieval
- Ensure backend accepts Bearer token format
- Test API calls directly with curl including auth headers

### Issue 5: WebSocket Proxy Issues
**Problem**: WebSocket connections not working through proxy
**Fix**:
```json
{
  "/socket.io/*": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "ws": true
  }
}
```

## 📋 Proxy Configuration Checklist

- [ ] Proxy configuration file exists and is valid JSON
- [ ] Angular.json references the proxy config file
- [ ] Target backend server is running and accessible
- [ ] Path patterns match frontend API calls
- [ ] CORS headers properly configured
- [ ] Authentication tokens are being forwarded
- [ ] Environment-specific configurations set up
- [ ] Team members can customize their local setup

## 🎯 Success Criteria

✅ **Proxy Active**: Development server uses proxy configuration
✅ **CORS Bypassed**: No CORS errors in browser console
✅ **API Communication**: Frontend successfully communicates with backend
✅ **Authentication**: JWT tokens properly forwarded to backend
✅ **Team Flexibility**: Multiple developers can customize their setup
✅ **Environment Aware**: Different configurations for different environments

## 🔧 Common Proxy Scenarios

### Scenario 1: Single Backend Service
```json
{
  "/api/*": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Scenario 2: Multiple Microservices
```json
{
  "/api/auth/*": {
    "target": "http://localhost:8001",
    "secure": false,
    "changeOrigin": true
  },
  "/api/data/*": {
    "target": "http://localhost:8002",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Scenario 3: External API Proxy
```json
{
  "/api/external/*": {
    "target": "https://api.external-service.com",
    "secure": true,
    "changeOrigin": true,
    "headers": {
      "Authorization": "Bearer YOUR_API_KEY"
    }
  }
}
```

## 📚 Key Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Proxy Target** | Backend server URL | `http://localhost:8000` |
| **Path Pattern** | URL pattern to match | `/api/*` |
| **Path Rewrite** | Modify request path | `{"^/api": "/v1/api"}` |
| **Change Origin** | Modify host header | `true` for CORS bypass |
| **Secure** | Use HTTPS | `false` for local dev |

## 🔄 Next Steps

After setting up the proxy:

1. **Test API Integration**: Verify all API calls work through proxy
2. **Configure Authentication**: Ensure JWT tokens are properly handled
3. **Set Up Team Workflows**: Document customization for team members
4. **Monitor Performance**: Check proxy doesn't impact development speed
5. **Plan Production**: Consider production proxy/server configuration
6. **Document Changes**: Update team documentation with proxy setup

## 📞 Support Resources

- **Angular Proxy Config**: [angular.io/guide/build#proxying-to-a-backend-server](https://angular.io/guide/build#proxying-to-a-backend-server)
- **CORS Documentation**: [developer.mozilla.org/en-US/docs/Web/HTTP/CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- **Proxy Troubleshooting**: [angular.io/guide/build#proxying-to-a-backend-server](https://angular.io/guide/build#proxying-to-a-backend-server)
- **Development Server**: [angular.io/guide/devtools](https://angular.io/guide/devtools)