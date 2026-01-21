# Admin API Documentation

## Overview

This document provides comprehensive API documentation for the Campus Connect Admin Panel. All admin endpoints require authentication with a valid admin role.

## Base URL

```
/api/admin
```

## Authentication

All admin API endpoints require Bearer token authentication with an admin role.

### Headers

```
Authorization: Bearer <access_token>
```

### Admin Roles

- **super_admin**: Full access to all features
- **moderator**: Content moderation and user management
- **support_staff**: View-only access

### Permissions

Permissions are automatically assigned based on role:

- `users.view`, `users.edit`, `users.delete`, `users.ban`
- `items.view`, `items.edit`, `items.delete`, `items.approve`
- `claims.view`, `claims.manage`
- `reports.view`, `reports.manage`
- `analytics.view`
- `logs.view`, `logs.export`
- `admins.manage` (super_admin only)
- `settings.edit` (super_admin only)

---

## API Endpoints

### Authentication

#### Verify Admin Authentication

```http
GET /api/admin/auth/verify
```

**Response:**

```json
{
  "success": true,
  "message": "Admin authenticated",
  "data": {
    "admin_id": "string",
    "user_id": "string",
    "role": "super_admin | moderator | support_staff",
    "permissions": ["string"],
    "last_login": "date"
  }
}
```

---

### Dashboard

#### Get Dashboard Statistics

```http
GET /api/admin/dashboard
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "total_users": 0,
    "active_users": 0,
    "total_items": 0,
    "total_lost_items": 0,
    "total_found_items": 0,
    "total_share_items": 0,
    "active_claims": 0,
    "pending_reports": 0,
    "today_registrations": 0
  }
}
```

---

### User Management

#### Get All Users

```http
GET /api/admin/users?page=1&limit=20&search=&role=&verified=&is_banned=&is_active=
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name, email, phone, or student_id
- `role` (string): Filter by role (admin/student)
- `verified` (boolean): Filter by verification status
- `is_banned` (boolean): Filter by ban status
- `is_active` (boolean): Filter by active status

**Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [],
    "total": 0,
    "page": 1,
    "total_pages": 0
  }
}
```

#### Get User by ID

```http
GET /api/admin/users/:id
```

**Response:**

```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "data": {
    "_id": "string",
    "email": "string",
    "name": "string",
    "statistics": {
      "lost_items_count": 0,
      "found_items_count": 0,
      "share_items_count": 0,
      "claims_count": 0
    }
  }
}
```

#### Update User

```http
PATCH /api/admin/users/:id
```

**Required Permission:** `users.edit`

**Request Body:**

```json
{
  "name": "string",
  "phone": "string",
  "verified": true,
  "university": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    /* updated user object */
  }
}
```

#### Delete User (Soft Delete)

```http
DELETE /api/admin/users/:id
```

**Required Permission:** `users.delete`

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    /* user object with is_active: false */
  }
}
```

#### Ban User

```http
POST /api/admin/users/:id/ban
```

**Required Permission:** `users.ban`

**Request Body:**

```json
{
  "reason": "string (required)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User banned successfully",
  "data": {
    /* user object */
  }
}
```

#### Unban User

```http
POST /api/admin/users/:id/unban
```

**Required Permission:** `users.ban`

**Response:**

```json
{
  "success": true,
  "message": "User unbanned successfully",
  "data": {
    /* user object */
  }
}
```

---

### Item Management

#### Get All Items

```http
GET /api/admin/items?type=lost|found|share&page=1&limit=20&status=&category=&search=&date_from=&date_to=
```

**Required Permission:** `items.view`

**Query Parameters:**

- `type` (string, required): Item type (lost, found, share)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status
- `category` (string): Filter by category
- `search` (string): Search in title and description
- `date_from` (string): Filter from date (ISO format)
- `date_to` (string): Filter to date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "total_pages": 0
  }
}
```

#### Approve Item

```http
POST /api/admin/items/:id/approve
```

**Required Permission:** `items.approve`

**Request Body:**

```json
{
  "type": "lost | found | share"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item approved successfully",
  "data": {
    /* item object */
  }
}
```

#### Reject Item

```http
POST /api/admin/items/:id/reject
```

**Required Permission:** `items.approve`

**Request Body:**

```json
{
  "type": "lost | found | share",
  "reason": "string (required)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item rejected successfully",
  "data": {
    /* item object */
  }
}
```

#### Delete Item

```http
DELETE /api/admin/items/:id?type=lost|found|share
```

**Required Permission:** `items.delete`

**Query Parameters:**

- `type` (string, required): Item type (lost, found, share)

**Response:**

```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

### Claims Management

#### Get All Claims

```http
GET /api/admin/claims?page=1&limit=20&status=&verification_status=
```

**Required Permission:** `claims.view`

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status
- `verification_status` (string): Filter by verification status

**Response:**

```json
{
  "success": true,
  "message": "Claims retrieved successfully",
  "data": {
    "claims": [],
    "total": 0,
    "page": 1,
    "total_pages": 0
  }
}
```

#### Approve Claim

```http
POST /api/admin/claims/:id/approve
```

**Required Permission:** `claims.manage`

**Response:**

```json
{
  "success": true,
  "message": "Claim approved successfully",
  "data": {
    /* claim object */
  }
}
```

#### Reject Claim

```http
POST /api/admin/claims/:id/reject
```

**Required Permission:** `claims.manage`

**Request Body:**

```json
{
  "reason": "string (required)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Claim rejected successfully",
  "data": {
    /* claim object */
  }
}
```

---

### Reports Management

#### Get All Reports

```http
GET /api/admin/reports?page=1&limit=20&status=&priority=&reported_type=
```

**Required Permission:** `reports.view`

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status (new, under_review, resolved, dismissed)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `reported_type` (string): Filter by type (item, user, claim)

**Response:**

```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {
    "reports": [],
    "total": 0,
    "page": 1,
    "total_pages": 0
  }
}
```

#### Update Report

```http
PATCH /api/admin/reports/:id
```

**Required Permission:** `reports.manage`

**Request Body (one of the following):**

Update status:

```json
{
  "status": "new | under_review | resolved | dismissed",
  "resolution": "string (optional)"
}
```

Assign to admin:

```json
{
  "assigned_to": "admin_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    /* report object */
  }
}
```

---

### Analytics

#### Get Analytics

```http
GET /api/admin/analytics?type=users|items|claims
```

**Required Permission:** `analytics.view`

**Query Parameters:**

- `type` (string, required): Analytics type (users, items, claims)

**Response for users:**

```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "user_growth": [],
    "user_by_role": [],
    "most_active_users": []
  }
}
```

**Response for items:**

```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "lost_items_trend": [],
    "found_items_trend": [],
    "share_items_trend": [],
    "category_distribution": []
  }
}
```

**Response for claims:**

```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "claims_by_status": [],
    "claims_trend": [],
    "success_rate": "0.00"
  }
}
```

---

### Audit Logs

#### Get Audit Logs

```http
GET /api/admin/logs?page=1&limit=50&admin_id=&action=&target_type=&date_from=&date_to=
```

**Required Permission:** `logs.view`

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `admin_id` (string): Filter by admin ID
- `action` (string): Filter by action
- `target_type` (string): Filter by target type
- `date_from` (string): Filter from date (ISO format)
- `date_to` (string): Filter to date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "logs": [],
    "total": 0,
    "page": 1,
    "total_pages": 0
  }
}
```

#### Export Audit Logs

```http
GET /api/admin/logs/export?format=json|csv&admin_id=&date_from=&date_to=
```

**Required Permission:** `logs.export`

**Query Parameters:**

- `format` (string): Export format (json or csv, default: json)
- `admin_id` (string): Filter by admin ID
- `date_from` (string): Filter from date (ISO format)
- `date_to` (string): Filter to date (ISO format)

**Response (JSON):**

```json
{
  "success": true,
  "message": "Audit logs exported successfully",
  "data": []
}
```

**Response (CSV):** CSV file download

---

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No authorization token provided"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "User is not an admin"
}
```

or

```json
{
  "success": false,
  "message": "Permission denied. Required: users.edit"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to fetch users"
}
```

---

## Rate Limiting

- Standard endpoints: 100 requests per minute
- Export endpoints: 10 requests per minute
- Authentication endpoints: 20 requests per minute

---

## Best Practices

1. **Always check permissions** before making requests
2. **Use pagination** for list endpoints to avoid large data transfers
3. **Filter data** to get only what you need
4. **Export logs periodically** for compliance
5. **Handle errors gracefully** in your frontend
6. **Refresh tokens** before they expire
7. **Log all sensitive operations** (automatically handled by the API)

---

## Security Considerations

1. **HTTPS Only**: All admin API calls should be made over HTTPS
2. **Token Storage**: Store access tokens securely (httpOnly cookies recommended)
3. **Session Management**: Implement 30-minute inactivity timeout
4. **Audit Trail**: All admin actions are automatically logged
5. **IP Whitelisting**: Consider implementing IP whitelisting for admin access
6. **Two-Factor Authentication**: Recommended for super_admin accounts

---

## Testing

Use the following test credentials (development only):

```
Email: admin@example.com
Password: Admin@123
Role: super_admin
```

---

## Support

For API support or questions:

- Email: support@campusconnect.com
- Documentation: https://docs.campusconnect.com
- GitHub: https://github.com/campusconnect/admin-panel

---

## Changelog

### Version 1.0.0 (Initial Release)

- Admin authentication and authorization
- User management (view, edit, ban/unban, delete)
- Item management (approve, reject, delete)
- Claims management (approve, reject)
- Reports management (view, update, assign)
- Analytics (users, items, claims)
- Audit logs (view, export)
- Dashboard statistics

---

## Future Enhancements

- Real-time notifications for admin actions
- Bulk operations (ban multiple users, delete multiple items)
- Advanced search and filtering
- Custom report generation
- Admin roles and permissions customization
- Two-factor authentication
- API webhooks for integrations
- GraphQL support
