# CircleHub JnU - Project Architecture

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Application Layers](#application-layers)
- [Data Flow](#data-flow)
- [Directory Structure](#directory-structure)
- [Key Design Patterns](#key-design-patterns)
- [Security Architecture](#security-architecture)

---

## Overview

CircleHub JnU is a full-stack web application built with Next.js 16 using the App Router architecture. The application follows a layered architecture pattern with clear separation of concerns.

### Architecture Style
- **Type**: Monolithic Full-Stack Application
- **Pattern**: Layered Architecture (MVC-inspired)
- **Framework**: Next.js 16 with App Router
- **Rendering**: Server-Side Rendering (SSR) + Client Components
- **API**: RESTful API using Next.js API Routes

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js Frontend (React 19)                 │  │
│  │  • Pages & Layouts                                    │  │
│  │  • Client Components                                  │  │
│  │  • Context Providers (State Management)              │  │
│  │  • UI Components (Radix UI)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes Layer                         │  │
│  │  • Authentication endpoints (/api/auth/*)            │  │
│  │  • Items endpoints (/api/items/*)                    │  │
│  │  • User endpoints (/api/user/*)                      │  │
│  │  • Admin endpoints (/api/admin/*)                    │  │
│  │  • Claims endpoints (/api/claims/*)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                         │  │
│  │  • with-auth: JWT authentication                     │  │
│  │  • with-admin-auth: Admin verification               │  │
│  │  • with-role-auth: Role-based access control         │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer                           │  │
│  │  • admin.services.ts: Admin operations               │  │
│  │  • auth.services.ts: Authentication logic            │  │
│  │  • items.services.ts: Item CRUD operations           │  │
│  │  • claims.services.ts: Claims management             │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Models Layer (Mongoose ODM)              │  │
│  │  • users.m.ts                                        │  │
│  │  • lost-items.m.ts                                   │  │
│  │  • found-items.m.ts                                  │  │
│  │  • share-items.m.ts                                  │  │
│  │  • found-item-claims.m.ts                            │  │
│  │  • reports.m.ts                                      │  │
│  │  • audit-logs.m.ts                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ MongoDB Protocol
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  • Users Collection                                         │
│  • Lost Items Collection                                    │
│  • Found Items Collection                                   │
│  • Share Items Collection                                   │
│  • Claims Collection                                        │
│  • Reports Collection                                       │
│  • Audit Logs Collection                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  • Cloudinary: Image storage and CDN                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Application Layers

### 1. Presentation Layer (Frontend)

**Location**: `/app`, `/components`

**Responsibilities**:
- Render UI components
- Handle user interactions
- Manage client-side state
- Display data from APIs
- Form validation and submission

**Key Technologies**:
- React 19.2.0
- Next.js 16 App Router
- Tailwind CSS 4
- Radix UI Components
- Lucide React Icons

**Components Organization**:
```
components/
├── ui/                    # Base UI components (shadcn/ui style)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   └── ...
├── lost-items/            # Lost items specific components
├── found-items/           # Found items specific components
├── share-items/           # Share items specific components
├── my-items/              # My items page components
└── Navigation.tsx         # Main navigation component
```

### 2. Routing Layer

**Location**: `/app`

**Responsibilities**:
- Define application routes
- Handle page rendering
- Manage layouts
- Server-side data fetching

**Route Structure**:
```
app/
├── page.tsx               # Home page (/)
├── layout.tsx             # Root layout
├── lost/
│   └── page.tsx          # Lost items page (/lost)
├── found/
│   └── page.tsx          # Found items page (/found)
├── share/
│   └── page.tsx          # Share items page (/share)
├── my-items/
│   └── page.tsx          # My items dashboard (/my-items)
├── claims/
│   └── page.tsx          # Claims page (/claims)
├── profile/
│   └── page.tsx          # User profile (/profile)
├── settings/
│   └── page.tsx          # Settings page (/settings)
├── admin/                 # Admin panel routes
└── auth/                  # Authentication routes
```

### 3. API Layer

**Location**: `/app/api`

**Responsibilities**:
- Handle HTTP requests
- Route requests to services
- Apply middleware
- Return JSON responses
- Handle errors

**API Structure**:
```
api/
├── auth/                  # Authentication APIs
│   ├── login/
│   ├── register/
│   ├── refresh/
│   └── me/
├── items/                 # Items APIs
│   ├── lost/
│   ├── found/
│   └── share/
├── user/                  # User management APIs
│   ├── profile/
│   ├── password/
│   └── delete/
├── claims/                # Claims management APIs
├── admin/                 # Admin panel APIs
│   ├── dashboard/
│   ├── users/
│   ├── items/
│   └── reports/
└── home/                  # Home page data API
```

### 4. Middleware Layer

**Location**: `/middleware`

**Responsibilities**:
- Authentication verification
- Authorization checks
- Role-based access control
- Request validation

**Middleware Components**:
- `with-auth.ts`: JWT token verification
- `with-admin-auth.ts`: Admin role verification
- `with-role-auth.ts`: Generic role-based access control

### 5. Service Layer

**Location**: `/services`

**Responsibilities**:
- Business logic implementation
- Data processing
- External API calls
- Complex operations

**Service Files**:
- `admin.services.ts`: Admin operations (users, items, reports)
- `auth.services.ts`: Authentication logic
- `items.services.ts`: Item CRUD operations
- `claims.services.ts`: Claims processing
- `user.services.ts`: User management

### 6. Data Access Layer

**Location**: `/models`

**Responsibilities**:
- Database schema definitions
- Data validation
- Relationships between collections
- Database queries

**Model Files**:
- `users.m.ts`: User schema
- `lost-items.m.ts`: Lost items schema
- `found-items.m.ts`: Found items schema
- `share-items.m.ts`: Share items schema
- `found-item-claims.m.ts`: Claims schema
- `reports.m.ts`: Reports schema
- `audit-logs.m.ts`: Audit logs schema

---

## Data Flow

### Example: Creating a Lost Item

```
1. User fills form → Lost Items Page (/lost)
                          ↓
2. Form submission → useAxios hook (with auth token)
                          ↓
3. POST request → /api/items/lost
                          ↓
4. Middleware → with-auth.ts (verify JWT)
                          ↓
5. API Route → route.ts (validate input)
                          ↓
6. Service Layer → items.services.ts (business logic)
                          ↓
7. Model Layer → lost-items.m.ts (save to DB)
                          ↓
8. MongoDB → Save document
                          ↓
9. Response → Return created item
                          ↓
10. Frontend → Update UI, show success message
```

### Authentication Flow

```
1. User enters credentials → Login Page
                          ↓
2. POST /api/auth/login
                          ↓
3. Verify credentials → auth.services.ts
                          ↓
4. Generate JWT tokens (access + refresh)
                          ↓
5. Store tokens → httpOnly cookies
                          ↓
6. Redirect to dashboard
                          ↓
7. Subsequent requests include token
                          ↓
8. Middleware verifies token
                          ↓
9. Access granted/denied
```

---

## Key Design Patterns

### 1. Repository Pattern
Models act as repositories for database operations:
```typescript
// Model handles all database operations
const user = await User.findById(userId);
await user.save();
```

### 2. Service Pattern
Business logic is separated into service files:
```typescript
// Service contains business logic
export class AdminService {
  async getAllUsers(filters) {
    // Complex business logic
    return users;
  }
}
```

### 3. Middleware Pattern
Cross-cutting concerns handled by middleware:
```typescript
// Middleware wraps route handlers
export const withAuth = (handler) => {
  return async (req) => {
    // Verify authentication
    return handler(req);
  };
};
```

### 4. Context Provider Pattern
Global state management using React Context:
```typescript
// Context provides state to components
<AuthProvider>
  <DataProvider>
    <App />
  </DataProvider>
</AuthProvider>
```

### 5. Custom Hooks Pattern
Reusable logic in custom hooks:
```typescript
// useAxios hook for authenticated API calls
const { data, loading, error } = useAxios('/api/items');
```

---

## Security Architecture

### Authentication
- **JWT-based authentication**
- Access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry)
- httpOnly cookies for token storage
- Secure password hashing with bcrypt

### Authorization
- Role-based access control (Admin, User)
- Middleware-based route protection
- Resource ownership verification

### Data Security
- Input validation on all endpoints
- SQL injection prevention (using Mongoose)
- XSS protection
- CSRF protection

### API Security
- Rate limiting (planned)
- Request validation
- Error handling (no sensitive data exposure)

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Next.js 16, TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI |
| State Management | React Context API |
| Backend | Next.js API Routes |
| Database | MongoDB with Mongoose |
| Authentication | JWT with bcrypt |
| Image Storage | Cloudinary |
| Deployment | Vercel (recommended) |

---

## Performance Considerations

### Frontend
- Server-side rendering for initial load
- Client-side navigation after hydration
- Image optimization with Next.js Image
- Code splitting by route

### Backend
- Efficient database queries
- Pagination for large datasets
- Connection pooling for MongoDB
- Caching strategies (planned)

### Database
- Proper indexing on frequently queried fields
- Efficient schema design
- Population for related data

---

## Scalability Considerations

### Current Architecture
- Monolithic application
- Single database instance
- Serverless deployment ready

### Future Enhancements
- Microservices architecture (if needed)
- Database replication
- Caching layer (Redis)
- CDN for static assets
- Load balancing

---

**Last Updated**: January 2026
