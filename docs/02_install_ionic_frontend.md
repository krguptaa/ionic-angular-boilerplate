# Installing Ionic Frontend & CodeIgniter 4 Backend

**Estimated time: 25-30 minutes**

## Overview

This guide covers the complete installation and setup of both the Ionic 8 + Angular frontend and CodeIgniter 4 backend development environments. By the end of this guide, you'll have a fully functional full-stack development environment ready for building and testing the complete application.

## 📋 Prerequisites Checklist

Before starting, ensure your system meets these requirements:

- [ ] **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- [ ] **RAM**: Minimum 8GB (16GB recommended)
- [ ] **Disk Space**: 5GB free space
- [ ] **Internet Connection**: Stable broadband connection

### Required Software Versions

| Software | Minimum Version | Recommended | Purpose |
|----------|----------------|-------------|---------|
| Node.js | 18.0.0 | 20.x LTS | JavaScript runtime |
| npm | 8.0.0 | 10.x | Package manager |
| Angular CLI | 17.0.0 | 17.x | Angular development tools |
| Ionic CLI | 7.0.0 | 7.x | Ionic development tools |
| Git | 2.20.0 | Latest | Version control |
| PHP | 8.1+ | 8.2+ | CodeIgniter 4 backend |
| Composer | 2.0+ | Latest | PHP dependency manager |
| MySQL/MariaDB | 5.7+ | 8.0+ | Database (optional) |

## 🛠️ Step-by-Step Installation

### Step 1: Install Node.js and npm

**For Absolute Beginners**: Node.js is the engine that runs JavaScript outside of web browsers. npm is Node's package manager, like an app store for JavaScript tools.

#### Windows
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (recommended for most users)
3. Run the installer and follow the setup wizard
4. Restart your terminal/command prompt

#### macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
# Visit https://nodejs.org/ and download the LTS version
```

#### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verification**:
```bash
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x
```

### Step 2: Install Angular CLI

**What it does**: Angular CLI provides commands to create, build, and manage Angular projects.

```bash
npm install -g @angular/cli@17

# Verification
ng version
```

**Expected Output**:
```
Angular CLI: 17.x.x
Node: 20.x.x
Package Manager: npm 10.x.x
```

### Step 3: Install Ionic CLI

**What it does**: Ionic CLI provides commands to create, build, and manage Ionic projects.

```bash
npm install -g @ionic/cli@7

# Verification
ionic --version
```

**Expected Output**:
```
7.x.x
```

### Step 4: Install Git

**What it does**: Git is version control software to track changes in your code.

#### Windows
1. Download from [git-scm.com](https://git-scm.com/)
2. Run the installer with default settings

#### macOS
```bash
# Using Homebrew
brew install git

# Or install Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
sudo apt install git
```

**Verification**:
```bash
git --version    # Should show 2.x.x
```

### Step 6: Install PHP and Composer (Backend)

**For Absolute Beginners**: PHP is a server-side scripting language. Composer is PHP's package manager, similar to npm for JavaScript.

#### Windows
1. **Install PHP**:
   - Download from [windows.php.net](https://windows.php.net/download/)
   - Choose the latest PHP 8.2+ thread-safe version
   - Extract to `C:\php`
   - Add `C:\php` to your system PATH

2. **Install Composer**:
   ```bash
   # Download and run Composer installer
   # Visit: https://getcomposer.org/download/
   ```

#### macOS
```bash
# Install PHP using Homebrew
brew install php@8.2

# Install Composer
brew install composer

# Verify installations
php --version     # Should show PHP 8.2.x
composer --version # Should show Composer version
```

#### Linux (Ubuntu/Debian)
```bash
# Add PHP repository
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update

# Install PHP 8.2 and extensions
sudo apt install php8.2 php8.2-cli php8.2-common php8.2-mysql php8.2-xml php8.2-curl php8.2-gd php8.2-mbstring php8.2-zip

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verify installations
php --version
composer --version
```

### Step 7: Install CodeIgniter 4 Backend

```bash
# Create backend directory (outside frontend)
cd ..
mkdir backend
cd backend

# Create new CodeIgniter 4 project
composer create-project codeigniter4/appstarter .

# Install dependencies
composer install

# Set up environment file
cp env .env

# Generate application key
php spark key:generate

# Set proper permissions (Linux/macOS)
chmod -R 755 writable/
chmod -R 755 public/
```

### Step 8: Configure Database (Optional)

**For Absolute Beginners**: A database stores your application's data. MySQL is a popular choice.

#### Install MySQL/MariaDB

**Windows**:
- Download from [dev.mysql.com](https://dev.mysql.com/downloads/mysql/)
- Run installer with default settings

**macOS**:
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Linux (Ubuntu)**:
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### Configure Database Connection

**File**: `backend/.env`
```bash
# Database Configuration
database.default.hostname = localhost
database.default.database = your_database_name
database.default.username = your_username
database.default.password = your_password
database.default.DBDriver = MySQLi
database.default.DBPrefix =

# Application Configuration
app.baseURL = 'http://localhost:8080'
CI_ENVIRONMENT = development
```

### Step 5: Clone and Setup the Project

```bash
# Clone the repository
git clone <repository-url> ionic-project
cd ionic-project

# Install project dependencies
npm install

# Verify installation
npm list --depth=0
```

## 🔧 Platform-Specific Setup

### For Android Development

#### Install Java Development Kit (JDK)
```bash
# Windows/macOS: Download from https://adoptium.net/
# Linux:
sudo apt install openjdk-11-jdk
```

#### Install Android Studio
1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Install with default settings
3. Open Android Studio and install SDK components

#### Configure Environment Variables (Windows)
```cmd
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools"
```

#### Configure Environment Variables (macOS/Linux)
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

### For iOS Development (macOS Only)

#### Install Xcode
1. Open App Store
2. Search for "Xcode"
3. Install Xcode 14.0 or later

#### Install Command Line Tools
```bash
xcode-select --install
```

#### Accept Xcode License
```bash
sudo xcodebuild -license accept
```

## 🚀 Running the Full-Stack Application

### Step 1: Start CodeIgniter 4 Backend

**Terminal 1 - Backend Server**
```bash
# Navigate to backend directory
cd ../backend

# Start CodeIgniter development server
php spark serve

# Server will be available at: http://localhost:8080
```

**Expected Output**:
```
CodeIgniter v4.x.x application started on http://localhost:8080
```

### Step 2: Start Ionic Frontend

**Terminal 2 - Frontend Server**
```bash
# Navigate to frontend directory
cd ../frontend

# Start development server with proxy
ng serve

# Or with specific port
ng serve --port 4200

# With live reload disabled
ng serve --live-reload=false
```

**Expected Output**:
```
Angular Live Development Server is listening on localhost:4200
```

### Step 3: Verify Full-Stack Setup

1. **Frontend**: Open http://localhost:4200 in browser
2. **Backend API**: Open http://localhost:8080 in browser
3. **API Test**: Frontend should communicate with backend via proxy

### Development with Proxy (Automatic API Routing)

The proxy configuration in `proxy.conf.json` automatically routes API calls:
- `/api/*` → `http://localhost:8080/api/*`
- `/auth/*` → `http://localhost:8080/auth/*`
- `/simulator/*` → `http://localhost:8080/simulator/*`

**No manual configuration needed** - just run both servers!

## 🔍 Verification Steps

### 1. Check All Installations
```bash
# Frontend tools
node --version      # Should show v18.x.x or higher
npm --version       # Should show 8.x.x or higher
ng version         # Should show Angular CLI 17.x.x
ionic --version    # Should show 7.x.x
git --version      # Should show 2.x.x

# Backend tools
php --version      # Should show PHP 8.1.x or higher
composer --version # Should show Composer 2.x.x
```

### 2. Test Full-Stack Application

**Terminal 1 - Start Backend:**
```bash
cd ../backend
php spark serve
# Should show: CodeIgniter application started on http://localhost:8080
```

**Terminal 2 - Start Frontend:**
```bash
cd ../frontend
ng serve
# Should show: Angular Live Development Server is listening on localhost:4200
```

**Verification:**
- Frontend: Open http://localhost:4200 in browser
- Backend API: Open http://localhost:8080 in browser
- API Communication: Frontend should successfully call backend APIs

### 3. Test Build Processes

**Frontend Build:**
```bash
cd ../frontend
ng build --configuration=production
ls -la www/  # Should contain built files
```

**Backend (Optional):**
```bash
cd ../backend
php spark routes  # Should list available routes
```

## 📱 Testing Platform Integration

### Capacitor Setup
```bash
# Add platforms
npx cap add android
npx cap add ios

# Sync changes
npx cap sync
```

### Android Testing
```bash
# Open in Android Studio
npx cap open android
```

### iOS Testing (macOS only)
```bash
# Open in Xcode
npx cap open ios
```

## 🐛 Common Installation Issues

### Issue 1: Permission Errors
**Problem**: `npm install` fails with permission errors
**Solution**:
```bash
# Windows
npm install --unsafe-perm=true

# macOS/Linux
sudo npm install -g npm
```

### Issue 2: Angular CLI Not Recognized
**Problem**: `ng` command not found
**Solution**:
```bash
# Reinstall Angular CLI
npm uninstall -g @angular/cli
npm cache clean --force
npm install -g @angular/cli@17
```

### Issue 3: Port Already in Use
**Problem**: Port 4200 already occupied
**Solution**:
```bash
# Use different port
ng serve --port 4201

# Or find and kill process using port 4200
# Windows: netstat -ano | findstr :4200
# macOS/Linux: lsof -ti:4200 | xargs kill -9
```

### Issue 4: Node Version Conflicts
**Problem**: Wrong Node.js version
**Solution**:
```bash
# Use nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## 📋 Post-Installation Checklist

- [ ] Node.js 18+ installed and working
- [ ] npm 8+ installed and working
- [ ] Angular CLI 17+ installed globally
- [ ] Ionic CLI 7+ installed globally
- [ ] Git installed and configured
- [ ] Project cloned successfully
- [ ] Dependencies installed (`npm install` completed)
- [ ] Development server starts without errors (`ng serve`)
- [ ] Application loads in browser (http://localhost:4200)
- [ ] Build process works (`ng build --configuration=production`)

## 🔧 Environment Configuration

### Development Environment
The project comes pre-configured with:
- **Local**: `src/environments/environment.ts`
- **UAT**: `src/environments/environment.uat.ts`
- **Production**: `src/environments/environment.prod.ts`

### Proxy Configuration
- **File**: `proxy.conf.json`
- **Purpose**: Handle CORS for local API calls
- **Auto-configured**: Works automatically with `ng serve`

## 📞 Next Steps

After completing this installation:

1. **For Android Development**: Follow [03_android_guide.md](03_android_guide.md)
2. **For iOS Development**: Follow [04_ios_guide.md](04_ios_guide.md)
3. **For PWA Development**: Follow [05_pwa_guide.md](05_pwa_guide.md)
4. **For General Development**: Review [07_build.md](07_build.md)

## 🎯 Success Criteria

✅ **Installation Complete**: All prerequisites installed successfully
✅ **Project Setup**: Repository cloned and dependencies installed
✅ **Development Server**: `ng serve` starts without errors
✅ **Browser Access**: Application loads at http://localhost:4200
✅ **Build Process**: `ng build` completes successfully
✅ **Platform Ready**: Capacitor platforms can be added

## Troubleshooting

### Can't Install Globally?
**Problem**: Permission denied when installing global packages
**Fix**: Use sudo (Linux/macOS) or run terminal as administrator (Windows)

### Slow npm Install?
**Problem**: npm install takes too long
**Fix**: Use faster registry or yarn:
```bash
npm config set registry https://registry.npmjs.org/
# Or switch to yarn
npm install -g yarn
yarn install
```

### Build Errors?
**Problem**: ng build fails
**Fix**: Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port Issues?
**Problem**: Default port 4200 not available
**Fix**: Use custom port:
```bash
ng serve --port 4201 --host 0.0.0.0
```

## 📋 Complete Post-Installation Checklist

### Frontend Setup
- [ ] Node.js 18+ installed and working
- [ ] npm 8+ installed and working
- [ ] Angular CLI 17+ installed globally
- [ ] Ionic CLI 7+ installed globally
- [ ] Git installed and configured
- [ ] Frontend project cloned successfully
- [ ] Frontend dependencies installed (`npm install` completed)
- [ ] Frontend development server starts without errors (`ng serve`)
- [ ] Frontend application loads in browser (http://localhost:4200)
- [ ] Frontend build process works (`ng build --configuration=production`)

### Backend Setup
- [ ] PHP 8.1+ installed and working
- [ ] Composer 2.0+ installed and working
- [ ] CodeIgniter 4 project created
- [ ] Backend dependencies installed (`composer install`)
- [ ] Backend environment configured (`.env` file)
- [ ] Backend development server starts without errors (`php spark serve`)
- [ ] Backend API accessible at http://localhost:8080
- [ ] Database configured (optional)

### Full-Stack Integration
- [ ] Proxy configuration working (frontend calls backend APIs)
- [ ] CORS properly configured for local development
- [ ] JWT authentication flow working
- [ ] Frontend-backend communication established
- [ ] Both servers can run simultaneously
- [ ] API endpoints responding correctly

## 🎯 Success Criteria

✅ **Frontend**: Ionic app runs at http://localhost:4200
✅ **Backend**: CodeIgniter API runs at http://localhost:8080
✅ **Integration**: Frontend successfully communicates with backend
✅ **Build**: Both frontend and backend build successfully
✅ **Database**: Database connection working (if configured)
✅ **Authentication**: JWT authentication working end-to-end