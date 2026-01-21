# CircleHub JnU - Complete Directory Structure

## 📁 Project Root Overview

```
campus-connect/
├── app/                        # Next.js App Router - Pages and API routes
├── components/                 # Reusable React components
├── config/                     # Application configuration files
├── contexts/                   # React Context providers
├── docs/                       # Project documentation
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries and configurations
├── middleware/                 # API middleware functions
├── models/                     # Mongoose database models
├── public/                     # Static assets
├── scripts/                    # Utility scripts
├── services/                   # Business logic services
├── types/                      # TypeScript type definitions
├── utils/                      # Utility functions
├── .env.local                  # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
├── components.json             # shadcn/ui configuration
├── eslint.config.mjs           # ESLint configuration
├── global.d.ts                 # Global TypeScript declarations
├── instrumentation.ts          # Next.js instrumentation
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies
├── postcss.config.mjs          # PostCSS configuration
├── proxy.ts                    # Proxy configuration
├── README.md                   # Project README
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 📂 Detailed Directory Structure

### `/app` - Next.js App Router

Contains all pages and API routes using Next.js 16 App Router.

```
app/
├── globals.css                 # Global CSS styles
├── layout.tsx                  # Root layout component
├── layout-content.tsx          # Layout content wrapper
├── page.tsx                    # Home page
│
├── admin/                      # Admin panel pages
│   ├── page.tsx               # Admin dashboard
│   ├── users/
│   │   └── page.tsx           # User management
│   ├── items/
│   │   ├── lost/
│   │   │   └── page.tsx       # Lost items management
│   │   ├── found/
│   │   │   └── page.tsx       # Found items management
│   │   └── share/
│   │       └── page.tsx       # Share items management
│   ├── claims/
│   │   └── page.tsx           # Claims management
│   ├── reports/
│   │   └── page.tsx           # Reports management
│   └── logs/
│       └── page.tsx           # Audit logs
│
├── api/                        # API Routes
│   ├── auth/                  # Authentication endpoints
│   │   ├── login/
│   │   │   └── route.ts       # POST /api/auth/login
│   │   ├── register/
│   │   │   └── route.ts       # POST /api/auth/register
│   │   ├── refresh/
│   │   │   └── route.ts       # POST /api/auth/refresh
│   │   └── me/
│   │       └── route.ts       # GET /api/auth/me
│   │
│   ├── items/                 # Items endpoints
│   │   ├── lost/
│   │   │   ├── route.ts       # GET, POST /api/items/lost
│   │   │   └── [id]/
│   │   │       └── route.ts   # GET, PUT, DELETE /api/items/lost/:id
│   │   ├── found/
│   │   │   ├── route.ts       # GET, POST /api/items/found
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts   # GET, PUT, DELETE /api/items/found/:id
│   │   │   │   └── claims/
│   │   │   │       └── route.ts # GET, POST /api/items/found/:id/claims
│   │   └── share/
│   │       ├── route.ts       # GET, POST /api/items/share
│   │       └── [id]/
│   │           └── route.ts   # GET, PUT, DELETE /api/items/share/:id
│   │
│   ├── claims/                # Claims endpoints
│   │   ├── route.ts           # GET /api/claims (user's claims)
│   │   └── [id]/
│   │       └── route.ts       # GET, PUT /api/claims/:id
│   │
│   ├── user/                  # User management endpoints
│   │   ├── profile/
│   │   │   └── route.ts       # GET, PUT /api/user/profile
│   │   ├── password/
│   │   │   └── route.ts       # PUT /api/user/password
│   │   └── delete/
│   │       └── route.ts       # DELETE /api/user/delete
│   │
│   ├── admin/                 # Admin endpoints
│   │   ├── dashboard/
│   │   │   └── route.ts       # GET /api/admin/dashboard
│   │   ├── users/
│   │   │   ├── route.ts       # GET /api/admin/users
│   │   │   ├── [id]/
│   │   │   │   └── route.ts   # GET, PUT, DELETE /api/admin/users/:id
│   │   │   └── role/
│   │   │       └── route.ts   # PUT /api/admin/users/role
│   │   ├── items/
│   │   │   ├── lost/
│   │   │   │   ├── route.ts   # GET /api/admin/items/lost
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET, PUT, DELETE /api/admin/items/lost/:id
│   │   │   ├── found/
│   │   │   │   ├── route.ts   # GET /api/admin/items/found
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET, PUT, DELETE /api/admin/items/found/:id
│   │   │   └── share/
│   │   │       ├── route.ts   # GET /api/admin/items/share
│   │   │       └── [id]/
│   │   │           └── route.ts # GET, PUT, DELETE /api/admin/items/share/:id
│   │   ├── claims/
│   │   │   ├── route.ts       # GET /api/admin/claims
│   │   │   └── [id]/
│   │   │       └── route.ts   # GET, PUT /api/admin/claims/:id
│   │   ├── reports/
│   │   │   ├── route.ts       # POST /api/admin/reports (create)
│   │   │   └── list/
│   │   │       └── route.ts   # GET /api/admin/reports/list
│   │   └── logs/
│   │       └── route.ts       # GET /api/admin/logs
│   │
│   └── home/
│       └── route.ts           # GET /api/home (homepage data)
│
├── auth/                       # Authentication pages
│   ├── login/
│   │   └── page.tsx           # Login page
│   └── register/
│       └── page.tsx           # Registration page
│
├── claims/
│   └── page.tsx               # User claims page
│
├── found/
│   └── page.tsx               # Found items page
│
├── lost/
│   └── page.tsx               # Lost items page
│
├── my-items/
│   └── page.tsx               # My items dashboard
│
├── profile/
│   └── page.tsx               # User profile page
│
├── register/
│   └── page.tsx               # Registration page (duplicate?)
│
├── settings/
│   └── page.tsx               # Settings page
│
└── share/
    └── page.tsx               # Share items page
```

---

### `/components` - React Components

Reusable UI components organized by feature and type.

```
components/
├── ui/                         # Base UI components (shadcn/ui)
│   ├── button.tsx             # Button component
│   ├── card.tsx               # Card component
│   ├── dialog.tsx             # Dialog/Modal component
│   ├── dropdown-menu.tsx      # Dropdown menu
│   ├── input.tsx              # Input component
│   ├── label.tsx              # Label component
│   ├── select.tsx             # Select dropdown
│   ├── textarea.tsx           # Textarea component
│   ├── popover.tsx            # Popover component
│   ├── calendar.tsx           # Calendar component
│   └── ...                    # Other UI primitives
│
├── lost-items/                 # Lost items components
│   ├── LostItemCard.tsx       # Lost item display card
│   ├── LostItemForm.tsx       # Lost item creation form
│   ├── LostItemsList.tsx      # Lost items list view
│   └── LostItemFilters.tsx    # Lost items filters
│
├── found-items/                # Found items components
│   ├── FoundItemCard.tsx      # Found item display card
│   ├── FoundItemForm.tsx      # Found item creation form
│   ├── FoundItemsList.tsx     # Found items list view
│   ├── FoundItemFilters.tsx   # Found items filters
│   └── ClaimDialog.tsx        # Claim item dialog
│
├── share-items/                # Share items components
│   ├── ShareItemCard.tsx      # Share item display card
│   ├── ShareItemForm.tsx      # Share item creation form
│   ├── ShareItemsList.tsx     # Share items list view
│   └── ShareItemFilters.tsx   # Share items filters
│
├── my-items/                   # My items components
│   ├── MyItemsStats.tsx       # Statistics cards
│   ├── MyLostItems.tsx        # User's lost items
│   ├── MyFoundItems.tsx       # User's found items
│   └── MyShareItems.tsx       # User's share items
│
├── examples/                   # Example components (for reference)
│
├── AuthWarningModal.tsx        # Authentication warning modal
├── DashboardSidebar.tsx        # Admin dashboard sidebar
├── Footer.tsx                  # Footer component
├── Navigation.tsx              # Main navigation bar
└── Providers.tsx               # Context providers wrapper
```

---

### `/config` - Configuration Files

Application configuration and constants.

```
config/
├── env.ts                      # Environment variables validation
└── routes.config.ts            # Route configuration and constants
```

---

### `/contexts` - React Contexts

State management using React Context API.

```
contexts/
├── auth-context.tsx            # Authentication state
├── data-context.tsx            # Application data state
├── admin-context.tsx           # Admin panel state
└── ThemeContext.tsx            # Theme (dark/light mode) state
```

---

### `/docs` - Documentation

Project documentation organized by category.

```
docs/
├── README.md                   # Documentation index
│
├── Architecture/               # Architecture documentation
│   ├── PROJECT_ARCHITECTURE.md
│   ├── TECHNOLOGY_STACK.md
│   ├── DATABASE_MODELS.md
│   └── DIRECTORY_STRUCTURE.md (this file)
│
├── API/                        # API documentation
│   ├── API_OVERVIEW.md
│   ├── AUTHENTICATION_API.md
│   ├── ITEMS_API.md
│   ├── CLAIMS_API.md
│   ├── USER_API.md
│   └── ADMIN_API.md
│
├── Features/                   # Feature documentation
│   ├── LOST_ITEMS_PAGE.md
│   ├── FOUND_ITEMS_PAGE.md
│   ├── SHARE_ITEMS_PAGE.md
│   ├── MY_ITEMS_PAGE.md
│   ├── CLAIMS_PAGE.md
│   ├── ADMIN_PANEL.md
│   └── AUTHENTICATION.md
│
├── Implementation/             # Implementation guides
│   ├── AUTH_IMPLEMENTATION.md
│   ├── ITEM_STATUS_WORKFLOW.md
│   ├── RBAC.md
│   ├── SERVICE_LAYER.md
│   └── CONTEXT_ARCHITECTURE.md
│
├── Guides/                     # User guides
│   ├── GETTING_STARTED.md
│   ├── USER_GUIDE.md
│   ├── ADMIN_GUIDE.md
│   └── CONTRIBUTING.md
│
├── Development/                # Development docs
│   ├── ENVIRONMENT_SETUP.md
│   ├── CODE_STYLE.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
│
└── [Legacy files]             # Old documentation files
    ├── ADMIN_*.md
    ├── AUTH_*.md
    └── ...
```

---

### `/hooks` - Custom React Hooks

Reusable React hooks for common functionality.

```
hooks/
└── use-axios.ts                # Authenticated API calls hook
```

**Purpose**: Provides a custom hook for making authenticated HTTP requests using axios, automatically including JWT tokens.

---

### `/lib` - Libraries and Utilities

Core libraries and utility functions.

```
lib/
├── api-client.ts               # API client configuration
├── auth.ts                     # Authentication utilities
├── bangladesh-timezone.ts      # Timezone utilities
├── init-models.ts              # Initialize database models
├── mongodb.ts                  # MongoDB connection
├── utils.ts                    # General utility functions
│
└── mock-data/                  # Mock data for development
    ├── lost-items.json
    ├── found-items.json
    └── share-items.json
```

---

### `/middleware` - API Middleware

Middleware functions for API routes.

```
middleware/
├── with-auth.ts                # JWT authentication middleware
├── with-admin-auth.ts          # Admin authentication middleware
└── with-role-auth.ts           # Role-based access middleware
```

**Purpose**: 
- Verify JWT tokens
- Check user roles
- Protect routes from unauthorized access

---

### `/models` - Database Models

Mongoose models defining database schema.

```
models/
├── users.m.ts                  # User model
├── lost-items.m.ts             # Lost items model
├── found-items.m.ts            # Found items model
├── share-items.m.ts            # Share items model
├── found-item-claims.m.ts      # Found item claims model
├── reports.m.ts                # Reports model
└── audit-logs.m.ts             # Audit logs model
```

---

### `/public` - Static Assets

Public static files served directly.

```
public/
├── site.webmanifest            # Web app manifest
│
├── banner/                     # Banner images
│   └── ...
│
└── logo/                       # Logo files
    └── ...
```

---

### `/scripts` - Utility Scripts

Helper scripts for development and maintenance.

```
scripts/
├── register-models.ts          # Register all Mongoose models
├── verify-models.ts            # Verify model registration
└── seed-database-comprehensive.ts  # Seed database with sample data
```

**Usage**:
```bash
npm run register-models    # Register models
npm run verify-models      # Verify models
npm run seed              # Seed database
```

---

### `/services` - Business Logic Services

Service layer containing business logic.

```
services/
├── admin.services.ts           # Admin operations service
├── auth.services.ts            # Authentication service
├── items.services.ts           # Items CRUD service
├── claims.services.ts          # Claims management service
└── user.services.ts            # User management service
```

**Purpose**:
- Separate business logic from route handlers
- Reusable functions across different routes
- Complex data processing and validation

---

### `/types` - TypeScript Types

TypeScript type definitions and interfaces.

```
types/
├── user.types.ts               # User-related types
├── item.types.ts               # Item-related types
├── claim.types.ts              # Claim-related types
├── api.types.ts                # API request/response types
└── common.types.ts             # Common shared types
```

---

### `/utils` - Utility Functions

Helper functions and utilities.

```
utils/
├── date.utils.ts               # Date formatting utilities
├── validation.utils.ts         # Input validation
├── image.utils.ts              # Image processing
└── string.utils.ts             # String manipulation
```

---

## 🗂️ File Naming Conventions

### Files
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **API Routes**: `route.ts` (Next.js convention)
- **Components**: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `date-utils.ts`)
- **Models**: `kebab-case.m.ts` (e.g., `lost-items.m.ts`)
- **Services**: `kebab-case.services.ts` (e.g., `admin.services.ts`)
- **Middleware**: `with-kebab-case.ts` (e.g., `with-auth.ts`)
- **Types**: `kebab-case.types.ts` (e.g., `user.types.ts`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-axios.ts`)
- **Contexts**: `kebab-case-context.tsx` (e.g., `auth-context.tsx`)

### Directories
- `kebab-case` for all directories (e.g., `lost-items/`, `my-items/`)

---

## 📦 Configuration Files

| File | Purpose |
|------|---------|
| `components.json` | shadcn/ui component configuration |
| `eslint.config.mjs` | ESLint linting rules |
| `global.d.ts` | Global TypeScript type declarations |
| `instrumentation.ts` | Next.js instrumentation for monitoring |
| `next-env.d.ts` | Next.js TypeScript declarations |
| `next.config.ts` | Next.js configuration (images, redirects, etc.) |
| `package.json` | Dependencies and scripts |
| `postcss.config.mjs` | PostCSS configuration |
| `proxy.ts` | Proxy configuration for API calls |
| `tailwind.config.js` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript compiler configuration |

---

## 🔍 Finding Files

### By Feature

**Lost Items**:
- Page: `app/lost/page.tsx`
- API: `app/api/items/lost/`
- Components: `components/lost-items/`
- Model: `models/lost-items.m.ts`

**Found Items**:
- Page: `app/found/page.tsx`
- API: `app/api/items/found/`
- Components: `components/found-items/`
- Model: `models/found-items.m.ts`

**Share Items**:
- Page: `app/share/page.tsx`
- API: `app/api/items/share/`
- Components: `components/share-items/`
- Model: `models/share-items.m.ts`

**Authentication**:
- Pages: `app/auth/`
- API: `app/api/auth/`
- Context: `contexts/auth-context.tsx`
- Middleware: `middleware/with-auth.ts`
- Service: `services/auth.services.ts`

**Admin Panel**:
- Pages: `app/admin/`
- API: `app/api/admin/`
- Context: `contexts/admin-context.tsx`
- Middleware: `middleware/with-admin-auth.ts`
- Service: `services/admin.services.ts`

---

**Last Updated**: January 2026
