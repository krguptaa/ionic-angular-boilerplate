# Testing and Quality Assurance Guide

**Estimated time: 15 minutes**

## Overview

This guide covers the testing framework, code quality tools, and best practices for maintaining high-quality code in the Ionic Angular application.

## 📋 Prerequisites Checklist

Before implementing testing and quality assurance:

- [ ] **Project Setup**: Complete [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
- [ ] **Development Environment**: Running development server
- [ ] **Node.js**: Version 18+ with npm
- [ ] **Git**: Version control system configured
- [ ] **Code Editor**: VS Code with Angular extensions

### Testing Types

| Test Type | Purpose | Framework | Speed |
|-----------|---------|-----------|-------|
| **Unit Tests** | Test individual functions/components | Jasmine + Karma | Fast |
| **Integration Tests** | Test component interactions | Jasmine + Karma | Medium |
| **E2E Tests** | Test complete user workflows | Cypress/WebDriver | Slow |
| **Performance Tests** | Test application performance | Lighthouse | Variable |

## 🛠️ Testing Framework Setup

### Karma Configuration

**File**: `karma.conf.js`

```javascript
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution order
        // random: false
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    restartOnFileChange: true
  });
};
```

### Angular Testing Configuration

**File**: `src/test.ts`

```typescript
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    <T>(id: string): T;
    keys(): string[];
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().forEach(context);
```

## 🧪 Writing Unit Tests

### Component Testing

**File**: `src/app/pages/login/login.page.spec.ts`

```typescript
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LoginPage } from './login.page';
import { AuthService } from '../../services/auth.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login method', () => {
    spyOn(authService, 'login');
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.onLogin();
    expect(authService.login).toHaveBeenCalled();
  });

  it('should show error for invalid form', () => {
    component.loginForm.setValue({
      email: 'invalid-email',
      password: ''
    });
    expect(component.loginForm.valid).toBeFalsy();
  });
});
```

### Service Testing

**File**: `src/app/services/auth.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Storage } from '@ionic/storage-angular';

import { AuthService } from './auth.service';
import { APP_CONSTANTS } from '../constants';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageMock: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('Storage', ['get', 'set', 'remove']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Storage, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storageMock = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user', () => {
    const mockResponse = {
      user: { id: 1, email: 'test@example.com' },
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token'
    };

    service.login({ email: 'test@example.com', password: 'password' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${APP_CONSTANTS.API_BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle login error', () => {
    service.login({ email: 'test@example.com', password: 'wrong' }).subscribe(
      () => fail('should have failed'),
      error => expect(error.status).toBe(401)
    );

    const req = httpMock.expectOne(`${APP_CONSTANTS.API_BASE_URL}/auth/login`);
    req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
  });
});
```

### HTTP Interceptor Testing

**File**: `src/app/core/interceptors/auth.interceptor.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../../services/auth.service';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getAccessToken', 'isLoggedIn']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add authorization header when user is logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getAccessToken.and.returnValue(Promise.resolve('mock-token'));

    const httpClient = TestBed.inject(HttpClient);
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
  });

  it('should not add authorization header when user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);

    const httpClient = TestBed.inject(HttpClient);
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBeNull();
  });
});
```

## 🔍 Code Quality Tools

### ESLint Configuration

**File**: `.eslintrc.json`

```json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "@typescript-eslint/recommended",
        "@angular-eslint/recommended",
        "@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app",
            "style": "kebab-case"
          }
        ],
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "no-console": "warn"
      }
    },
    {
      "files": ["*.html"],
      "extends": ["@angular-eslint/template/recommended"],
      "rules": {}
    }
  ]
}
```

### Prettier Configuration

**File**: `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Package.json Scripts

**File**: `package.json`

```json
{
  "scripts": {
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless",
    "test:coverage": "ng test --code-coverage --watch=false --browsers=ChromeHeadless",
    "lint": "ng lint",
    "lint:fix": "ng lint --fix",
    "format": "prettier --write \"src/**/*.{ts,html,scss,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss,json}\"",
    "quality": "npm run lint && npm run format:check && npm run test:ci"
  }
}
```

## 🚀 Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:ci

# Run tests with coverage
npm run test:coverage

# Run specific test file
ng test --include='**/login.page.spec.ts'
```

### Code Quality Checks

```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check

# Run all quality checks
npm run quality
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
# Open coverage/index.html in browser
```

## 🧪 End-to-End Testing

### Cypress Setup

**File**: `cypress.config.ts`

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts'
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.cy.ts'
  }
});
```

### E2E Test Example

**File**: `cypress/e2e/auth.cy.ts`

```typescript
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should login successfully', () => {
    cy.get('ion-input[placeholder="Email"]').type('test@example.com');
    cy.get('ion-input[placeholder="Password"]').type('password123');
    cy.get('ion-button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('ion-input[placeholder="Email"]').type('invalid@example.com');
    cy.get('ion-input[placeholder="Password"]').type('wrongpassword');
    cy.get('ion-button[type="submit"]').click();

    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.contains('Create Account').click();
    cy.url().should('include', '/auth/register');
  });
});
```

### Component Testing with Cypress

**File**: `src/app/components/login-form/login-form.cy.ts`

```typescript
import { mount } from 'cypress/angular';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  it('should emit login event', () => {
    mount(LoginFormComponent);

    cy.get('ion-input[placeholder="Email"]').type('test@example.com');
    cy.get('ion-input[placeholder="Password"]').type('password123');
    cy.get('ion-button').click();

    // Assert login event was emitted
    cy.get('@loginSpy').should('have.been.calledWith', {
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

## 📊 Test Coverage

### Coverage Configuration

**File**: `karma.conf.js` (coverage configuration)

```javascript
coverageReporter: {
  dir: require('path').join(__dirname, './coverage'),
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' },
    { type: 'lcov' }
  ],
  check: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
}
```

### Coverage Goals

| Metric | Target | Description |
|--------|--------|-------------|
| **Statements** | 80% | Executable statements covered |
| **Branches** | 75% | Conditional branches covered |
| **Functions** | 80% | Functions called during tests |
| **Lines** | 80% | Lines of code executed |

## 🔧 Continuous Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
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

    - name: Lint
      run: npm run lint

    - name: Format check
      run: npm run format:check

    - name: Unit tests
      run: npm run test:ci

    - name: Build
      run: npm run build:prod

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## 📋 Testing Checklist

- [ ] Unit tests written for all components and services
- [ ] Test coverage meets minimum requirements (80%)
- [ ] E2E tests cover critical user journeys
- [ ] Linting rules configured and passing
- [ ] Code formatting consistent across project
- [ ] CI/CD pipeline includes automated testing
- [ ] Test data and mocks properly configured
- [ ] Error scenarios and edge cases covered
- [ ] Performance tests included where applicable

## 🎯 Success Criteria

✅ **Test Coverage**: Minimum 80% code coverage achieved
✅ **Quality Gates**: All linting and formatting rules pass
✅ **CI/CD**: Automated testing integrated into deployment pipeline
✅ **Documentation**: Tests serve as living documentation
✅ **Reliability**: Tests catch regressions and bugs
✅ **Performance**: Tests run efficiently in CI environment

## 🔧 Common Testing Issues

### Issue 1: Async Test Timeouts
**Problem**: Tests fail due to async operations timing out
**Fix**:
```typescript
it('should handle async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});

// Or use fakeAsync
it('should handle async operation', fakeAsync(() => {
  service.asyncMethod();
  tick();
  expect(component.data).toBeDefined();
}));
```

### Issue 2: Component Test Setup Issues
**Problem**: Component tests fail due to missing dependencies
**Fix**:
```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    declarations: [ComponentUnderTest],
    imports: [IonicModule.forRoot(), HttpClientTestingModule],
    providers: [MockService]
  }).compileComponents();
});
```

### Issue 3: Mock Data Issues
**Problem**: Tests fail due to inconsistent mock data
**Fix**:
```typescript
// Create consistent mock data
const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User'
};

// Use in multiple tests
const mockResponse = { data: mockUser, success: true };
```

### Issue 4: Flaky Tests
**Problem**: Tests pass/fail inconsistently
**Fix**:
- Avoid timing-dependent tests
- Use proper async/await patterns
- Mock external dependencies
- Clean up after each test

### Issue 5: Coverage Gaps
**Problem**: Low test coverage in certain areas
**Fix**:
- Identify uncovered code with coverage reports
- Write targeted tests for uncovered functions
- Use Istanbul ignore comments for generated code
- Focus on critical business logic coverage

## 📊 Performance Testing

### Lighthouse CI

**File**: `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "ng serve --port=4200",
      "startServerReadyPattern": "Angular Live Development Server is listening",
      "url": ["http://localhost:4200"]
    },
    "assert": {
      "assertions": {
        "categories:performance": "error",
        "categories:accessibility": "error",
        "categories:best-practices": "error",
        "categories:seo": "error",
        "categories:pwa": "error"
      }
    }
  }
}
```

### Performance Budget

**File**: `angular.json`

```json
{
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
  ]
}
```

## 🔄 Next Steps

After implementing testing and quality assurance:

1. **Write More Tests**: Expand test coverage for new features
2. **Automate Testing**: Set up comprehensive CI/CD pipelines
3. **Performance Monitoring**: Implement continuous performance testing
4. **Code Review**: Use tests as part of code review process
5. **Documentation**: Keep tests updated as documentation
6. **Quality Metrics**: Track and improve code quality over time

## 📞 Support Resources

- **Angular Testing**: [angular.io/guide/testing](https://angular.io/guide/testing)
- **Jasmine Documentation**: [jasmine.github.io](https://jasmine.github.io)
- **Cypress Documentation**: [docs.cypress.io](https://docs.cypress.io)
- **ESLint Rules**: [eslint.org/docs/rules](https://eslint.org/docs/rules)
- **Prettier Options**: [prettier.io/docs/en/options.html](https://prettier.io/docs/en/options.html)