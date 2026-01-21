# CircleHub JnU - Complete Feature Overview

## 📋 Overview

This document provides a comprehensive overview of all features in CircleHub JnU, including their implementation details, file locations, and how they work together.

---

## 🎯 Core Features

### 1. Lost Items Management

**Purpose**: Report and browse lost items to help community members recover their belongings.

**Location**: 
- **Page**: `app/lost/page.tsx`
- **API**: `app/api/items/lost/`
- **Components**: `components/lost-items/`
- **Service**: `services/lost-items.services.ts`
- **Model**: `models/lost-items.m.ts`

**Key Features**:
- ✅ Browse all reported lost items
- ✅ Report new lost items with images
- ✅ Advanced filtering (category, status, date, location)
- ✅ Search functionality
- ✅ Edit/delete own items
- ✅ Status management (active, found, closed)
- ✅ Reward system
- ✅ Contact information display

**API Endpoints**:
- `GET /api/items/lost` - Get all lost items with filters
- `POST /api/items/lost` - Create new lost item (auth required)
- `GET /api/items/lost/:id` - Get single lost item
- `PUT /api/items/lost/:id` - Update lost item (owner/admin)
- `DELETE /api/items/lost/:id` - Delete lost item (owner/admin)

**Detailed Documentation**: [Lost Items Page](./LOST_ITEMS_PAGE.md)

---

### 2. Found Items Management

**Purpose**: Post found items and help owners claim their belongings through a verification system.

**Location**:
- **Page**: `app/found/page.tsx`
- **API**: `app/api/items/found/`
- **Components**: `components/found-items/`
- **Service**: `services/found-items.services.ts`
- **Model**: `models/found-items.m.ts`

**Key Features**:
- ✅ Browse all found items
- ✅ Post found items with images
- ✅ Claim system for potential owners
- ✅ Verification process
- ✅ Status tracking (available, claimed, returned)
- ✅ Contact verification
- ✅ Multiple claims handling

**Claim Workflow**:
1. User posts found item
2. Potential owners submit claims with proof
3. Finder reviews claims
4. Finder approves/rejects claims
5. Item marked as returned when claimed

**API Endpoints**:
- `GET /api/items/found` - Get all found items
- `POST /api/items/found` - Create found item (auth required)
- `GET /api/items/found/:id` - Get single found item
- `PUT /api/items/found/:id` - Update found item (owner/admin)
- `DELETE /api/items/found/:id` - Delete found item (owner/admin)
- `GET /api/items/found/:id/claims` - Get all claims for found item (owner)
- `POST /api/items/found/:id/claims` - Create claim (auth required)

**Detailed Documentation**: [Found Items Page](./FOUND_ITEMS_PAGE.md)

---

### 3. Share Items (Item Sharing)

**Purpose**: Share items you no longer need with other students (free/paid).

**Location**:
- **Page**: `app/share/page.tsx`
- **API**: `app/api/items/share/`
- **Components**: `components/share-items/`
- **Service**: `services/share-items.services.ts`
- **Model**: `models/share-items.m.ts`

**Key Features**:
- ✅ Browse available items
- ✅ Post items to share
- ✅ Condition tracking (new, like-new, good, fair)
- ✅ Pricing (free or paid)
- ✅ Availability status
- ✅ Category-based filtering
- ✅ Direct contact with owner

**Item Conditions**:
- **New**: Brand new, never used
- **Like New**: Barely used, excellent condition
- **Good**: Used but well-maintained
- **Fair**: Shows signs of use

**API Endpoints**:
- `GET /api/items/share` - Get all share items
- `POST /api/items/share` - Create share item (auth required)
- `GET /api/items/share/:id` - Get single share item
- `PUT /api/items/share/:id` - Update share item (owner/admin)
- `DELETE /api/items/share/:id` - Delete share item (owner/admin)

**Detailed Documentation**: [Share Items Page](./SHARE_ITEMS_PAGE.md)

---

### 4. My Items Dashboard

**Purpose**: Centralized dashboard to manage all your posted items across categories.

**Location**:
- **Page**: `app/my-items/page.tsx`
- **Components**: `components/my-items/`

**Key Features**:
- ✅ View all your items in one place
- ✅ Statistics overview (total items per category)
- ✅ Quick status updates
- ✅ Edit/delete functionality
- ✅ Filter by item type (lost, found, share)
- ✅ Recent activity tracking

**Dashboard Sections**:
1. **Statistics Cards**
   - Total lost items
   - Total found items
   - Total share items
   - Active/closed counts

2. **My Lost Items**
   - All your reported lost items
   - Quick status change
   - Edit/delete actions

3. **My Found Items**
   - All items you found
   - View claims
   - Manage claims

4. **My Share Items**
   - All items you're sharing
   - Update availability
   - Edit/remove items

**API Integration**:
- Uses `userId` parameter with existing endpoints
- `GET /api/items/lost?userId=:id`
- `GET /api/items/found?userId=:id`
- `GET /api/items/share?userId=:id`
- `GET /api/items/lost?action=statistics&userId=:id`

**Detailed Documentation**: [My Items Page](./MY_ITEMS_PAGE.md)

---

### 5. Claims Management

**Purpose**: View and manage claims you've made on found items.

**Location**:
- **Page**: `app/claims/page.tsx`
- **API**: `app/api/claims/`
- **Components**: `components/claims/` (if exists)
- **Service**: `services/found-item-claims.services.ts`
- **Model**: `models/found-item-claims.m.ts`

**Key Features**:
- ✅ View all your claims
- ✅ Track claim status
- ✅ Submit proof of ownership
- ✅ Receive notifications on status changes
- ✅ Contact finder

**Claim Statuses**:
- **Pending**: Waiting for review
- **Approved**: Claim accepted, contact finder
- **Rejected**: Claim denied
- **Completed**: Item returned

**API Endpoints**:
- `GET /api/claims` - Get all user's claims
- `GET /api/claims/:id` - Get single claim
- `PUT /api/claims/:id` - Update claim (admin/finder)

**Detailed Documentation**: [Claims Page](./CLAIMS_PAGE.md)

---

### 6. User Authentication

**Purpose**: Secure user registration, login, and session management.

**Location**:
- **Pages**: `app/auth/login/page.tsx`, `app/auth/register/page.tsx`
- **API**: `app/api/auth/`
- **Context**: `contexts/auth-context.tsx`
- **Service**: `services/auth.services.ts`
- **Model**: `models/users.m.ts`

**Key Features**:
- ✅ Email/password registration
- ✅ Secure login with JWT
- ✅ Password hashing (bcrypt)
- ✅ Access & refresh tokens
- ✅ httpOnly cookie storage
- ✅ Automatic token refresh
- ✅ Session persistence
- ✅ University email validation

**Authentication Flow**:
1. User registers with university credentials
2. Password hashed and stored
3. Login generates JWT tokens
4. Tokens stored in httpOnly cookies
5. Tokens automatically included in requests
6. Access token refreshes when expired

**API Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

**Detailed Documentation**: [Authentication System](./AUTHENTICATION.md)

---

### 7. User Profile & Settings

**Purpose**: Manage user profile information and account settings.

**Location**:
- **Page**: `app/profile/page.tsx`, `app/settings/page.tsx`
- **API**: `app/api/user/`
- **Context**: `contexts/auth-context.tsx`

**Key Features**:
- ✅ View profile information
- ✅ Edit profile (name, bio, phone, avatar)
- ✅ Change password
- ✅ Update contact information
- ✅ View account statistics
- ✅ Delete account

**Profile Information**:
- Name
- Email (read-only)
- Student ID
- Department & Batch
- Phone number
- Bio
- Avatar image
- Account creation date

**API Endpoints**:
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password
- `DELETE /api/user/delete` - Delete account

---

### 8. Admin Panel

**Purpose**: Comprehensive administration interface for managing users, items, claims, and system health.

**Location**:
- **Pages**: `app/admin/`
- **API**: `app/api/admin/`
- **Context**: `contexts/admin-context.tsx`
- **Service**: `services/admin.services.ts`
- **Middleware**: `middleware/with-admin-auth.ts`

**Key Features**:

#### Dashboard (`/admin`)
- ✅ System statistics overview
- ✅ User metrics
- ✅ Item statistics (lost, found, share)
- ✅ Recent activity
- ✅ Charts and graphs

#### User Management (`/admin/users`)
- ✅ View all users
- ✅ Search users
- ✅ Edit user details
- ✅ Change user roles (user ↔ admin)
- ✅ Suspend/delete users
- ✅ View user activity

#### Items Management
- **Lost Items** (`/admin/items/lost`)
- **Found Items** (`/admin/items/found`)
- **Share Items** (`/admin/items/share`)
  - ✅ View all items
  - ✅ Edit any item
  - ✅ Delete inappropriate items
  - ✅ Change item status
  - ✅ View item details

#### Claims Management (`/admin/claims`)
- ✅ View all claims
- ✅ Review pending claims
- ✅ Approve/reject claims
- ✅ Track claim history

#### Reports Management (`/admin/reports`)
- ✅ View reported content
- ✅ Take action on reports
- ✅ Ban/warn users
- ✅ Remove content

#### Audit Logs (`/admin/logs`)
- ✅ View all system activities
- ✅ Filter by user/action
- ✅ Export logs
- ✅ Track admin actions

**Access Control**:
- Only users with `role: 'admin'` can access
- Protected by `with-admin-auth` middleware
- Automatic redirect for non-admin users

**API Endpoints**:
- Dashboard: `GET /api/admin/dashboard`
- Users: `GET /api/admin/users`, `PUT /api/admin/users/:id`, etc.
- Items: `GET /api/admin/items/{type}`, `PUT /api/admin/items/{type}/:id`
- Claims: `GET /api/admin/claims`, `PUT /api/admin/claims/:id`
- Reports: `GET /api/admin/reports/list`, `POST /api/admin/reports`
- Logs: `GET /api/admin/logs`

**Detailed Documentation**: [Admin Panel](./ADMIN_PANEL.md)

---

### 9. Home Page

**Purpose**: Landing page with recent items and quick access to main features.

**Location**:
- **Page**: `app/page.tsx`
- **API**: `app/api/home/route.ts`

**Key Features**:
- ✅ Hero section with call-to-action
- ✅ Recent lost items
- ✅ Recent found items
- ✅ Recent share items
- ✅ Statistics overview
- ✅ Quick navigation buttons

**API Endpoint**:
- `GET /api/home` - Get homepage data (recent items)

---

## 🔧 Common Components

### Navigation Bar
**Location**: `components/Navigation.tsx`
- Logo and branding
- Main navigation links
- User menu (when authenticated)
- Theme toggle
- Notifications (planned)

### Footer
**Location**: `components/Footer.tsx`
- Links to pages
- Contact information
- Social media
- Copyright notice

### UI Components
**Location**: `components/ui/`
- Button, Card, Dialog, Input, Select, etc.
- Based on Radix UI primitives
- Styled with Tailwind CSS

---

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- httpOnly cookies
- Password hashing with bcrypt
- Secure token management

### Data Protection
- Input validation
- XSS protection
- CSRF protection
- SQL injection prevention (Mongoose)
- File upload validation

### API Security
- Middleware-based route protection
- Resource ownership verification
- Rate limiting (planned)
- Error handling without sensitive data exposure

---

## 📊 Data Models

### User Model
```typescript
{
  name, email, password, studentId, department, batch,
  phone, bio, avatar, role, isVerified, createdAt
}
```

### Lost Item Model
```typescript
{
  userId, title, description, category, location, dateLost,
  images, contactInfo, reward, tags, status, createdAt
}
```

### Found Item Model
```typescript
{
  userId, title, description, category, location, dateFound,
  images, contactInfo, status, claimsCount, createdAt
}
```

### Share Item Model
```typescript
{
  userId, title, description, category, condition, price,
  images, contactInfo, availability, status, createdAt
}
```

### Claim Model
```typescript
{
  foundItemId, claimantId, description, proofImages,
  contactInfo, status, reviewedBy, reviewedAt, createdAt
}
```

**Detailed Documentation**: [Database Models](../Architecture/DATABASE_MODELS.md)

---

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray shades

### Typography
- **Font**: System font stack
- **Headings**: Bold, larger sizes
- **Body**: Regular weight, readable size

### Spacing
- Consistent padding and margins
- Grid-based layout
- Responsive breakpoints

---

## 🌐 State Management

### Auth Context
**Location**: `contexts/auth-context.tsx`
- Current user state
- Login/logout functions
- Authentication status
- User profile data

### Data Context
**Location**: `contexts/data-context.tsx`
- Items data caching
- Global loading states
- Error handling

### Admin Context
**Location**: `contexts/admin-context.tsx`
- Admin dashboard data
- User management state
- Item management state

### Theme Context
**Location**: `contexts/ThemeContext.tsx`
- Dark/light mode toggle
- Theme preferences

---

## 🛠️ Development Tools

### Custom Hooks
- `useAxios` - Authenticated API requests
- Located in `hooks/use-axios.ts`

### Utilities
- Date formatting (`lib/bangladesh-timezone.ts`)
- API client (`lib/api-client.ts`)
- General utilities (`lib/utils.ts`)

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

---

## 📱 Responsive Design

All features are fully responsive:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout
- **Mobile**: Mobile-first, touch-friendly

---

## ♿ Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

---

## 🚀 Performance

- Server-side rendering (SSR)
- Image optimization
- Code splitting
- Lazy loading
- Database indexing
- CDN for images (Cloudinary)

---

## 🔗 Quick Navigation

| Feature | User Route | Admin Route | API Endpoint |
|---------|-----------|-------------|--------------|
| Lost Items | `/lost` | `/admin/items/lost` | `/api/items/lost` |
| Found Items | `/found` | `/admin/items/found` | `/api/items/found` |
| Share Items | `/share` | `/admin/items/share` | `/api/items/share` |
| My Items | `/my-items` | - | Multiple endpoints |
| Claims | `/claims` | `/admin/claims` | `/api/claims` |
| Profile | `/profile` | - | `/api/user/profile` |
| Dashboard | - | `/admin` | `/api/admin/dashboard` |
| Users | - | `/admin/users` | `/api/admin/users` |

---

## 📖 Related Documentation

- [Project Architecture](../Architecture/PROJECT_ARCHITECTURE.md)
- [Directory Structure](../Architecture/DIRECTORY_STRUCTURE.md)
- [API Overview](../API/API_OVERVIEW.md)
- [Getting Started](../Guides/GETTING_STARTED.md)

---

**Last Updated**: January 2026
