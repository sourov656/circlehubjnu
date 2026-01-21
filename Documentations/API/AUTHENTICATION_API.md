# Authentication API Documentation

## 📋 Overview

The Authentication API handles user registration, login, token management, and user session verification. It uses JWT (JSON Web Tokens) for authentication with both access and refresh tokens.

## 🔑 Endpoints

### 1. Register User

Register a new user account.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "studentId": "2021001",
  "department": "CSE",
  "batch": "2021",
  "phone": "+8801712345678"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ Yes | User's full name |
| email | string | ✅ Yes | Valid email address |
| password | string | ✅ Yes | Strong password (min 6 characters) |
| studentId | string | ✅ Yes | Student ID number |
| department | string | ✅ Yes | Department name |
| batch | string | ✅ Yes | Batch year |
| phone | string | ❌ No | Phone number |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "studentId": "2021001",
    "department": "CSE",
    "batch": "2021",
    "role": "user",
    "isVerified": false,
    "createdAt": "2026-01-17T10:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "success": false,
  "message": "Validation Error",
  "error": "Email is required"
}
```

**409 Conflict** - User Already Exists
```json
{
  "success": false,
  "message": "User already exists",
  "error": "A user with this email already exists"
}
```

#### Example Usage

```typescript
// Using axios
const response = await axios.post('/api/auth/register', {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'SecurePassword123!',
  studentId: '2021001',
  department: 'CSE',
  batch: '2021'
});

console.log(response.data.user);
```

```bash
# Using cURL
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "studentId": "2021001",
    "department": "CSE",
    "batch": "2021"
  }'
```

---

### 2. Login User

Authenticate a user and get access tokens.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | User's email |
| password | string | ✅ Yes | User's password |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "studentId": "2021001",
    "department": "CSE",
    "batch": "2021",
    "role": "user",
    "avatar": "https://cloudinary.com/..."
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note**: Tokens are also set as httpOnly cookies:
- `accessToken` - expires in 15 minutes
- `refreshToken` - expires in 7 days

#### Error Responses

**400 Bad Request** - Missing Credentials
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**401 Unauthorized** - Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Email or password is incorrect"
}
```

#### Example Usage

```typescript
// Using axios with credentials
const response = await axios.post('/api/auth/login', {
  email: 'john.doe@example.com',
  password: 'SecurePassword123!'
}, {
  withCredentials: true  // Important: enables cookie storage
});

// Store user data in context/state
const user = response.data.user;
```

```bash
# Using cURL
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### 3. Refresh Token

Get a new access token using the refresh token.

**Endpoint**: `POST /api/auth/refresh`

**Authentication**: Refresh token required (from cookie)

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note**: If `refreshToken` is not in body, it will be read from the cookie.

#### Success Response (200 OK)

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

**401 Unauthorized** - Invalid/Expired Token
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

#### Example Usage

```typescript
// Automatic refresh when access token expires
const refreshAccessToken = async () => {
  try {
    const response = await axios.post('/api/auth/refresh', {}, {
      withCredentials: true
    });
    
    return response.data.accessToken;
  } catch (error) {
    // Redirect to login if refresh fails
    window.location.href = '/auth/login';
  }
};
```

---

### 4. Get Current User

Get the currently authenticated user's information.

**Endpoint**: `GET /api/auth/me`

**Authentication**: Required (Access token)

#### Request Headers

```
Cookie: accessToken=<your_jwt_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "user": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "studentId": "2021001",
    "department": "CSE",
    "batch": "2021",
    "role": "user",
    "avatar": "https://cloudinary.com/...",
    "phone": "+8801712345678",
    "bio": "Computer Science student",
    "isVerified": true,
    "createdAt": "2026-01-17T10:00:00.000Z",
    "stats": {
      "lostItemsCount": 2,
      "foundItemsCount": 3,
      "sharedItemsCount": 1
    }
  }
}
```

#### Error Responses

**401 Unauthorized** - No Token
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "No access token provided"
}
```

**401 Unauthorized** - Invalid Token
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

#### Example Usage

```typescript
// Using axios with credentials
const response = await axios.get('/api/auth/me', {
  withCredentials: true
});

const currentUser = response.data.user;
```

```typescript
// Using useAxios hook
import { useAxios } from '@/hooks/use-axios';

function ProfileComponent() {
  const { data, loading, error } = useAxios('/api/auth/me');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Welcome, {data.user.name}!</div>;
}
```

---

## 🔐 Authentication Flow

### Complete Login Flow

```
1. User submits credentials
   ↓
2. POST /api/auth/login
   ↓
3. Server validates credentials
   ↓
4. Generate JWT tokens:
   - Access Token (15 min)
   - Refresh Token (7 days)
   ↓
5. Set tokens in httpOnly cookies
   ↓
6. Return user data
   ↓
7. Store user in context/state
   ↓
8. Redirect to dashboard
```

### Token Refresh Flow

```
1. Access token expires (after 15 min)
   ↓
2. API request fails with 401
   ↓
3. Automatically call POST /api/auth/refresh
   ↓
4. If refresh token valid:
   - Get new access token
   - Retry original request
   ↓
5. If refresh token invalid:
   - Clear auth state
   - Redirect to login
```

---

## 🔒 Security Features

### Password Security
- Passwords are hashed using bcrypt (10 rounds)
- Minimum 6 characters required
- Never returned in API responses

### Token Security
- JWT tokens with secure signatures
- Short-lived access tokens (15 minutes)
- httpOnly cookies prevent XSS attacks
- Secure flag in production (HTTPS only)

### Session Security
- Refresh token rotation
- Automatic token expiry
- Secure cookie storage

---

## 💡 Best Practices

### 1. Always Use withCredentials

```typescript
// Correct ✅
axios.get('/api/auth/me', { withCredentials: true });

// Wrong ❌
axios.get('/api/auth/me');  // Cookies won't be sent
```

### 2. Handle Token Expiry

```typescript
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await axios.post('/api/auth/refresh', {}, {
          withCredentials: true
        });
        // Retry original request
        return axios(error.config);
      } catch {
        // Redirect to login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 3. Store User in Context

```typescript
// AuthContext.tsx
const [user, setUser] = useState(null);

const login = async (credentials) => {
  const response = await axios.post('/api/auth/login', credentials, {
    withCredentials: true
  });
  setUser(response.data.user);
};

const logout = () => {
  setUser(null);
  // Clear cookies by calling logout endpoint or just redirect
  window.location.href = '/auth/login';
};
```

### 4. Protect Routes

```typescript
// Client-side protection
if (!user) {
  return <Navigate to="/auth/login" />;
}
```

---

## 🧪 Testing

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "studentId": "2021999",
    "department": "CSE",
    "batch": "2021"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

---

## 🔗 Related Documentation

- [API Overview](./API_OVERVIEW.md)
- [User API](./USER_API.md)
- [Authentication Implementation](../Implementation/AUTH_IMPLEMENTATION.md)
- [Role-Based Access Control](../Implementation/RBAC.md)

---

**Last Updated**: January 2026
