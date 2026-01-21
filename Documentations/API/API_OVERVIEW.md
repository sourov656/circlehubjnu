# CircleHub JnU - API Overview

## 📋 Table of Contents
- [API Structure](#api-structure)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [All Endpoints](#all-endpoints)

---

## API Structure

CircleHub JnU uses RESTful API principles with Next.js API Routes. All API endpoints are located under `/api` path.

### API Categories

| Category | Base Path | Description |
|----------|-----------|-------------|
| Authentication | `/api/auth` | Login, register, token management |
| Items | `/api/items` | Lost, found, and share items CRUD |
| Claims | `/api/claims` | Item claims management |
| User | `/api/user` | User profile and settings |
| Admin | `/api/admin` | Admin panel operations |
| Home | `/api/home` | Homepage data |

---

## Authentication

Most API endpoints require authentication using JWT (JSON Web Tokens).

### Token Types

1. **Access Token**
   - Short-lived (15 minutes)
   - Used for API requests
   - Stored in httpOnly cookie

2. **Refresh Token**
   - Long-lived (7 days)
   - Used to get new access tokens
   - Stored in httpOnly cookie

### Authentication Header

For endpoints requiring authentication, include the JWT token:

```http
Cookie: accessToken=<your_jwt_token>
```

Or in axios:
```javascript
axios.get('/api/items/lost', {
  withCredentials: true  // Automatically includes cookies
});
```

---

## Base URL

**Development**: `http://localhost:3000`
**Production**: `https://your-domain.com`

All API endpoints are prefixed with `/api`

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasMore": true
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

### Common Error Messages

```json
// Authentication Error
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}

// Validation Error
{
  "success": false,
  "message": "Validation Error",
  "error": "Title is required"
}

// Not Found Error
{
  "success": false,
  "message": "Not Found",
  "error": "Item not found"
}

// Permission Error
{
  "success": false,
  "message": "Forbidden",
  "error": "You don't have permission to perform this action"
}
```

---

## All Endpoints

### 🔐 Authentication API

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | ❌ No | Register new user |
| POST | `/api/auth/login` | ❌ No | Login user |
| POST | `/api/auth/refresh` | ✅ Yes (Refresh Token) | Refresh access token |
| GET | `/api/auth/me` | ✅ Yes | Get current user info |

[View detailed documentation →](./AUTHENTICATION_API.md)

---

### 📦 Items API

#### Lost Items

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/items/lost` | ❌ No | Get all lost items |
| POST | `/api/items/lost` | ✅ Yes | Create lost item |
| GET | `/api/items/lost/:id` | ❌ No | Get single lost item |
| PUT | `/api/items/lost/:id` | ✅ Yes (Owner) | Update lost item |
| DELETE | `/api/items/lost/:id` | ✅ Yes (Owner) | Delete lost item |

#### Found Items

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/items/found` | ❌ No | Get all found items |
| POST | `/api/items/found` | ✅ Yes | Create found item |
| GET | `/api/items/found/:id` | ❌ No | Get single found item |
| PUT | `/api/items/found/:id` | ✅ Yes (Owner) | Update found item |
| DELETE | `/api/items/found/:id` | ✅ Yes (Owner) | Delete found item |

#### Share Items

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/items/share` | ❌ No | Get all share items |
| POST | `/api/items/share` | ✅ Yes | Create share item |
| GET | `/api/items/share/:id` | ❌ No | Get single share item |
| PUT | `/api/items/share/:id` | ✅ Yes (Owner) | Update share item |
| DELETE | `/api/items/share/:id` | ✅ Yes (Owner) | Delete share item |

[View detailed documentation →](./ITEMS_API.md)

---

### 🎯 Claims API

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/items/found/:id/claims` | ✅ Yes (Owner) | Get claims for found item |
| POST | `/api/items/found/:id/claims` | ✅ Yes | Create claim for found item |
| GET | `/api/claims` | ✅ Yes | Get user's claims |
| GET | `/api/claims/:id` | ✅ Yes | Get single claim |
| PUT | `/api/claims/:id` | ✅ Yes (Owner/Admin) | Update claim status |

[View detailed documentation →](./CLAIMS_API.md)

---

### 👤 User API

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/user/profile` | ✅ Yes | Get user profile |
| PUT | `/api/user/profile` | ✅ Yes | Update user profile |
| PUT | `/api/user/password` | ✅ Yes | Change password |
| DELETE | `/api/user/delete` | ✅ Yes | Delete account |

[View detailed documentation →](./USER_API.md)

---

### 🛡️ Admin API

#### Dashboard

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/admin/dashboard` | ✅ Admin | Get dashboard statistics |

#### Users Management

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/admin/users` | ✅ Admin | Get all users |
| GET | `/api/admin/users/:id` | ✅ Admin | Get single user |
| PUT | `/api/admin/users/:id` | ✅ Admin | Update user |
| DELETE | `/api/admin/users/:id` | ✅ Admin | Delete user |
| PUT | `/api/admin/users/role` | ✅ Admin | Change user role |

#### Items Management

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/admin/items/lost` | ✅ Admin | Get all lost items |
| GET | `/api/admin/items/lost/:id` | ✅ Admin | Get single lost item |
| PUT | `/api/admin/items/lost/:id` | ✅ Admin | Update lost item |
| DELETE | `/api/admin/items/lost/:id` | ✅ Admin | Delete lost item |
| GET | `/api/admin/items/found` | ✅ Admin | Get all found items |
| GET | `/api/admin/items/found/:id` | ✅ Admin | Get single found item |
| PUT | `/api/admin/items/found/:id` | ✅ Admin | Update found item |
| DELETE | `/api/admin/items/found/:id` | ✅ Admin | Delete found item |
| GET | `/api/admin/items/share` | ✅ Admin | Get all share items |
| GET | `/api/admin/items/share/:id` | ✅ Admin | Get single share item |
| PUT | `/api/admin/items/share/:id` | ✅ Admin | Update share item |
| DELETE | `/api/admin/items/share/:id` | ✅ Admin | Delete share item |

#### Claims Management

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/admin/claims` | ✅ Admin | Get all claims |
| GET | `/api/admin/claims/:id` | ✅ Admin | Get single claim |
| PUT | `/api/admin/claims/:id` | ✅ Admin | Update claim |

#### Reports & Logs

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/admin/reports` | ✅ Admin | Create report |
| GET | `/api/admin/reports/list` | ✅ Admin | Get all reports |
| GET | `/api/admin/logs` | ✅ Admin | Get audit logs |

[View detailed documentation →](./ADMIN_API.md)

---

### 🏠 Home API

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/home` | ❌ No | Get homepage data (recent items) |

---

## Query Parameters

### Common Query Parameters

Most GET endpoints support these query parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10) | `?limit=20` |
| `sort` | string | Sort field | `?sort=-createdAt` |
| `search` | string | Search query | `?search=laptop` |
| `category` | string | Filter by category | `?category=Electronics` |
| `status` | string | Filter by status | `?status=active` |

### Sorting

Use `-` prefix for descending order:
- `?sort=createdAt` - Ascending (oldest first)
- `?sort=-createdAt` - Descending (newest first)

### Examples

```
# Get page 2 with 20 items per page
GET /api/items/lost?page=2&limit=20

# Search for laptop in Electronics category
GET /api/items/lost?search=laptop&category=Electronics

# Get active items sorted by newest first
GET /api/items/lost?status=active&sort=-createdAt

# Combine multiple filters
GET /api/items/lost?category=Electronics&status=active&sort=-createdAt&page=1&limit=10
```

---

## Rate Limiting

> ⚠️ Rate limiting is planned but not yet implemented

Planned limits:
- **Authenticated requests**: 100 requests per 15 minutes
- **Unauthenticated requests**: 50 requests per 15 minutes

---

## CORS

CORS is configured to allow requests from:
- Development: `http://localhost:3000`
- Production: Your deployed domain

Credentials (cookies) are allowed for authentication.

---

## API Versioning

Currently on version 1 (implicit). Future versions may use `/api/v2` prefix.

---

## Testing APIs

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get lost items with authentication
curl http://localhost:3000/api/items/lost \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### Using Postman

1. Import the collection (if provided)
2. Set up environment variables
3. Use cookie authentication

### Using JavaScript/TypeScript

```typescript
// Using axios
const response = await axios.get('/api/items/lost', {
  withCredentials: true,
  params: {
    page: 1,
    limit: 10,
    category: 'Electronics'
  }
});

// Using fetch
const response = await fetch('/api/items/lost?page=1&limit=10', {
  credentials: 'include'
});
const data = await response.json();
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const response = await axios.get('/api/items/lost');
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error(error.response.data.message);
  } else {
    // Network or other error
    console.error('Network error');
  }
}
```

### 2. Use TypeScript Types

```typescript
interface LostItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  // ... other fields
}

const response = await axios.get<ApiResponse<LostItem[]>>('/api/items/lost');
const items = response.data.data;
```

### 3. Implement Proper Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchItems = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get('/api/items/lost');
    // Handle success
  } catch (err) {
    setError('Failed to fetch items');
  } finally {
    setLoading(false);
  }
};
```

### 4. Use the useAxios Hook

```typescript
import { useAxios } from '@/hooks/use-axios';

const { data, loading, error } = useAxios<LostItem[]>('/api/items/lost', {
  method: 'GET',
  params: { page: 1, limit: 10 }
});
```

---

## Next Steps

- [Authentication API Documentation](./AUTHENTICATION_API.md)
- [Items API Documentation](./ITEMS_API.md)
- [Claims API Documentation](./CLAIMS_API.md)
- [User API Documentation](./USER_API.md)
- [Admin API Documentation](./ADMIN_API.md)

---

**Last Updated**: January 2026
