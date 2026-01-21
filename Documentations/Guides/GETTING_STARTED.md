# Getting Started with CircleHub JnU

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [First Steps](#first-steps)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.0 or higher | JavaScript runtime |
| **npm** | 9.0 or higher | Package manager |
| **MongoDB** | 6.0 or higher | Database |
| **Git** | Latest | Version control |

### External Services

You'll need accounts for:
- **MongoDB Atlas** (or local MongoDB installation)
- **Cloudinary** (for image storage)

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be 9.0.0 or higher

# Check MongoDB (if running locally)
mongod --version

# Check Git
git --version
```

---

## Installation

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/ahsanulhoqueabir/circlehub.git

# Or using SSH
git clone git@github.com:ahsanulhoqueabir/circlehub.git

# Navigate to project directory
cd circlehub
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16
- React 19
- MongoDB/Mongoose
- Authentication libraries
- UI components
- And more...

**Installation Time**: ~2-5 minutes depending on your internet connection

---

## Environment Configuration

### 1. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local

# Or create manually
touch .env.local
```

### 2. Configure Environment Variables

Open `.env.local` and add the following:

```env
# ================================
# MongoDB Configuration
# ================================
MONGODB_URI=your_mongodb_connection_string
# Example: mongodb://localhost:27017/circlehub
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/circlehub

# ================================
# JWT Configuration
# ================================
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
# Generate a secure random string (32+ characters)
# Example: openssl rand -base64 32

JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# ================================
# Cloudinary Configuration
# ================================
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ================================
# App Configuration
# ================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Change to your production URL when deploying

# ================================
# Optional: Email Configuration (Future)
# ================================
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
```

### 3. Get MongoDB Connection String

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `myFirstDatabase` with `circlehub`

**Example**:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/circlehub?retryWrites=true&w=majority
```

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use local connection string:
```
mongodb://localhost:27017/circlehub
```

### 4. Get Cloudinary Credentials

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret
5. Add to `.env.local`

### 5. Generate JWT Secret

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use as `JWT_SECRET`.

---

## Database Setup

### 1. Verify MongoDB Connection

The application will automatically connect to MongoDB on startup. You'll see a message in the console:

```
✓ MongoDB connected successfully
```

### 2. Initialize Database (Optional)

The database collections will be created automatically when you first use each feature. However, you can seed the database with sample data:

```bash
# Seed database with sample data
npm run seed
```

This will create:
- Sample users
- Sample lost items
- Sample found items
- Sample share items

### 3. Verify Models (Optional)

```bash
# Verify all Mongoose models are registered correctly
npm run verify-models
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

**You should see**:
```
✓ Ready on http://localhost:3000
✓ MongoDB connected successfully
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Other Commands

```bash
# Run linter
npm run lint

# Register models (if needed)
npm run register-models
```

---

## First Steps

### 1. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### 2. Create an Account

1. Click "Register" or "Get Started"
2. Fill in the registration form:
   - Name
   - Email
   - Password (min 6 characters)
   - Student ID
   - Department
   - Batch
3. Click "Register"

### 3. Login

1. After registration, you'll be redirected to login
2. Enter your email and password
3. Click "Login"

### 4. Explore Features

Once logged in, you can:
- **Report Lost Items** → Go to `/lost` and click "Report Lost Item"
- **Post Found Items** → Go to `/found` and click "Post Found Item"
- **Share Items** → Go to `/share` and click "Share Item"
- **View My Items** → Go to `/my-items` to see all your posts
- **Update Profile** → Go to `/profile` to edit your information

### 5. Create Admin Account (Optional)

To access admin features:

1. First create a regular account
2. Manually update the user in MongoDB:

```javascript
// Using MongoDB Compass or mongo shell
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

3. Logout and login again
4. Access admin panel at `/admin`

---

## Project Structure Overview

```
campus-connect/
├── app/                   # Next.js pages and API routes
│   ├── api/              # API endpoints
│   ├── auth/             # Authentication pages
│   ├── lost/             # Lost items page
│   ├── found/            # Found items page
│   ├── share/            # Share items page
│   └── admin/            # Admin panel
├── components/           # React components
├── contexts/             # React Context providers
├── docs/                 # Documentation
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configuration
├── middleware/           # API middleware
├── models/               # Database models
├── services/             # Business logic
├── types/                # TypeScript types
└── public/               # Static files
```

**For detailed structure**: See [Directory Structure](../Architecture/DIRECTORY_STRUCTURE.md)

---

## Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Error

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
- ✅ Check if MongoDB is running (local)
- ✅ Verify `MONGODB_URI` in `.env.local`
- ✅ Check network/firewall settings
- ✅ Ensure MongoDB Atlas IP whitelist includes your IP

```bash
# Test MongoDB connection
mongosh "your_connection_string"
```

#### 2. Environment Variables Not Loading

**Error**: Variables are `undefined`

**Solutions**:
- ✅ File must be named `.env.local` (not `.env`)
- ✅ Restart development server after changes
- ✅ Check for typos in variable names
- ✅ Don't use quotes unless necessary

```bash
# Restart server
# Stop with Ctrl+C, then:
npm run dev
```

#### 3. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Option 1: Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill

# Option 2: Use different port
PORT=3001 npm run dev
```

#### 4. Images Not Uploading

**Error**: Cloudinary upload fails

**Solutions**:
- ✅ Verify Cloudinary credentials in `.env.local`
- ✅ Check Cloudinary account is active
- ✅ Ensure image size is under limit (10MB)
- ✅ Check file format (jpg, png, webp)

#### 5. Authentication Issues

**Error**: "Unauthorized" or "Invalid token"

**Solutions**:
- ✅ Clear browser cookies
- ✅ Logout and login again
- ✅ Verify `JWT_SECRET` is set
- ✅ Check token expiry settings

```javascript
// Clear cookies in browser console
document.cookie.split(";").forEach(function(c) {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

#### 6. Module Not Found Errors

**Error**: `Cannot find module 'xyz'`

**Solutions**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Or
npm ci  # Clean install
```

#### 7. TypeScript Errors

**Error**: Type errors in development

**Solutions**:
- ✅ Restart VS Code/editor
- ✅ Check `tsconfig.json`
- ✅ Run type check: `npx tsc --noEmit`

#### 8. Build Errors

**Error**: Build fails with various errors

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## Development Tips

### Hot Reload

Next.js supports hot reload. Changes to files will automatically reflect in the browser.

### Browser DevTools

Use browser console to:
- Check API responses
- Debug JavaScript errors
- Inspect network requests

### VS Code Extensions (Recommended)

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier**
- **MongoDB for VS Code**

### Debugging

```typescript
// Add console logs in API routes
console.log('Request body:', req.body);

// Check MongoDB queries
console.log('Query result:', await Model.find());

// Use debugger
debugger;  // Browser will pause here
```

---

## Next Steps

### For Users
1. ✅ Read [User Guide](../Guides/USER_GUIDE.md)
2. ✅ Explore all features
3. ✅ Report any issues

### For Developers
1. ✅ Read [Project Architecture](../Architecture/PROJECT_ARCHITECTURE.md)
2. ✅ Review [Code Style Guide](../Development/CODE_STYLE.md)
3. ✅ Check [API Documentation](../API/API_OVERVIEW.md)
4. ✅ Start contributing!

### For Admins
1. ✅ Create admin account
2. ✅ Read [Admin Guide](../Guides/ADMIN_GUIDE.md)
3. ✅ Access admin panel at `/admin`

---

## Getting Help

### Documentation
- Browse complete documentation in [`docs/`](../README.md)
- Check [API Documentation](../API/API_OVERVIEW.md)
- Read [Feature Documentation](../Features/COMPLETE_FEATURE_OVERVIEW.md)

### Common Questions
- Setup issues? Check [Troubleshooting](#troubleshooting)
- API questions? See [API Overview](../API/API_OVERVIEW.md)
- Feature questions? Check [Features](../Features/COMPLETE_FEATURE_OVERVIEW.md)

### Community
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Pull Requests: Contribute code

---

## Success Checklist

Before you start developing, ensure:

- [ ] Node.js and npm installed
- [ ] MongoDB running and connected
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Development server running
- [ ] Can access http://localhost:3000
- [ ] Can register and login
- [ ] Can create lost/found/share items
- [ ] Images upload successfully

---

**Congratulations! You're now ready to use CircleHub JnU! 🎉**

For more information, check out:
- [Complete Feature Overview](../Features/COMPLETE_FEATURE_OVERVIEW.md)
- [API Documentation](../API/API_OVERVIEW.md)
- [Project Architecture](../Architecture/PROJECT_ARCHITECTURE.md)

---

**Last Updated**: January 2026
