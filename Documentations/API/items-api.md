# Items API Documentation

## Overview

This document provides comprehensive documentation for the Lost, Found, and Share Items API endpoints. The API is designed with optimization in mind, using minimal routes with powerful filtering capabilities.

## Key Features

- **Public Viewing**: All GET endpoints are publicly accessible
- **Authenticated Actions**: POST, PUT, DELETE, and PATCH require authentication
- **Advanced Filtering**: Rich query parameters for precise data retrieval
- **Pagination**: Built-in pagination support
- **Statistics**: Aggregate data endpoints for analytics
- **Optimized Queries**: Efficient database queries with proper indexing

## Authentication

For endpoints requiring authentication, include the Supabase session token in the request:

```
Authorization: Bearer <supabase-session-token>
```

---

## Lost Items API

### 1. Get Lost Items

**Endpoint**: `GET /api/items/lost`

**Description**: Retrieve lost items with advanced filtering, sorting, and pagination.

**Access**: Public (no authentication required)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | Filter by category (electronics, clothing, accessories, documents, books, keys, bags, sports, jewelry, others) or "all" |
| `status` | string | "active" | Filter by status (active, resolved, archived) |
| `search` | string | - | Search in title, description, and location |
| `tags` | string | - | Comma-separated tags to filter by |
| `location` | string | - | Filter by location (partial match) |
| `dateFrom` | string | - | Filter items lost after this date (ISO format) |
| `dateTo` | string | - | Filter items lost before this date (ISO format) |
| `userId` | string | - | Filter by user ID |
| `sort` | string | "newest" | Sort order (newest, oldest, most-viewed, recently-updated) |
| `limit` | number | 20 | Number of items per page (max 100) |
| `offset` | number | 0 | Number of items to skip |
| `action` | string | - | Special action: "statistics" |

**Response**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Lost iPhone 13 Pro",
        "description": "Black iPhone 13 Pro lost near library",
        "category": "electronics",
        "location": "Main Library",
        "date_lost": "2026-01-01",
        "contact_info": "user@example.com",
        "image_url": "https://...",
        "status": "active",
        "tags": ["phone", "urgent"],
        "views": 45,
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z",
        "user_id": "uuid",
        "profiles": {
          "id": "uuid",
          "name": "John Doe",
          "email": "user@example.com",
          "avatar_url": "https://..."
        }
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

**Examples**:

```bash
# Get all active lost items
GET /api/items/lost

# Search for "phone" in electronics category
GET /api/items/lost?search=phone&category=electronics

# Get user's items sorted by most viewed
GET /api/items/lost?userId=abc-123&sort=most-viewed

# Get items lost in last 7 days
GET /api/items/lost?dateFrom=2025-12-27

# Filter by multiple tags
GET /api/items/lost?tags=urgent,phone

# Get statistics
GET /api/items/lost?action=statistics
```

### 2. Get Single Lost Item

**Endpoint**: `GET /api/items/lost/[id]`

**Description**: Retrieve a single lost item by ID. Automatically increments view count.

**Access**: Public

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Lost iPhone 13 Pro",
    "description": "Black iPhone 13 Pro lost near library",
    // ... other fields
    "profiles": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

### 3. Create Lost Item

**Endpoint**: `POST /api/items/lost`

**Description**: Report a new lost item.

**Access**: Authenticated users only

**Request Body**:

```json
{
  "title": "Lost iPhone 13 Pro",
  "description": "Black iPhone 13 Pro lost near library on Monday evening",
  "category": "electronics",
  "location": "Main Library",
  "dateLost": "2026-01-01",
  "contactInfo": "user@example.com or 555-1234",
  "imageUrl": "https://...",
  "tags": ["phone", "urgent"],
  "rewardAmount": 50
}
```

**Required Fields**: `title`, `description`, `category`, `location`, `dateLost`, `contactInfo`

**Response**:

```json
{
  "success": true,
  "message": "Lost item reported successfully",
  "data": {
    "id": "uuid",
    "title": "Lost iPhone 13 Pro"
    // ... other fields
  }
}
```

### 4. Update Lost Item

**Endpoint**: `PUT /api/items/lost/[id]`

**Description**: Update a lost item. Only the item owner can update.

**Access**: Authenticated users (owner only)

**Request Body** (all fields optional):

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "electronics",
  "location": "New location",
  "dateLost": "2026-01-02",
  "contactInfo": "new-contact@example.com",
  "imageUrl": "https://...",
  "tags": ["updated", "tags"],
  "status": "resolved"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Lost item updated successfully",
  "data": {
    // updated item
  }
}
```

### 5. Delete Lost Item

**Endpoint**: `DELETE /api/items/lost/[id]`

**Description**: Delete a lost item. Only the item owner can delete.

**Access**: Authenticated users (owner only)

**Response**:

```json
{
  "success": true,
  "message": "Lost item deleted successfully"
}
```

### 6. Mark as Resolved

**Endpoint**: `PATCH /api/items/lost/[id]`

**Description**: Mark a lost item as resolved.

**Access**: Authenticated users (owner only)

**Request Body**:

```json
{
  "action": "resolve"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Item marked as resolved",
  "data": {
    // updated item with status="resolved"
  }
}
```

### 7. Get Statistics

**Endpoint**: `GET /api/items/lost?action=statistics`

**Description**: Get aggregate statistics for lost items.

**Query Parameters**:

- `userId` (optional): Get statistics for a specific user

**Response**:

```json
{
  "success": true,
  "data": {
    "totalItems": 150,
    "activeItems": 120,
    "resolvedItems": 30,
    "itemsByCategory": {
      "electronics": 45,
      "clothing": 30,
      "accessories": 25,
      "documents": 20,
      "books": 15,
      "keys": 10,
      "bags": 3,
      "sports": 2,
      "jewelry": 0,
      "others": 0
    },
    "recentItems": 25
  }
}
```

---

## Found Items API

The Found Items API follows the same structure as Lost Items API with identical endpoints:

- `GET /api/items/found` - Get found items with filtering
- `GET /api/items/found/[id]` - Get single found item
- `POST /api/items/found` - Create found item (requires auth)
- `PUT /api/items/found/[id]` - Update found item (requires auth, owner only)
- `DELETE /api/items/found/[id]` - Delete found item (requires auth, owner only)
- `PATCH /api/items/found/[id]` - Mark as resolved (requires auth, owner only)
- `GET /api/items/found?action=statistics` - Get statistics

The request/response format is identical, with `date_lost` replaced by `date_found`.

---

## Share Items API

The Share Items API is similar to Lost/Found Items with additional filters:

### Additional Query Parameters for GET:

- `offerType`: Filter by offer type (free, exchange, rent)
- `condition`: Filter by item condition (new, like-new, good, fair, poor)

### Additional Fields in POST/PUT:

```json
{
  "title": "Share Textbook",
  "description": "Engineering Mathematics textbook",
  "category": "books",
  "location": "Engineering Building",
  "contactInfo": "user@example.com",
  "offerType": "free",
  "condition": "good",
  "price": null,
  "imageUrl": "https://...",
  "tags": ["textbook", "engineering"]
}
```

**Endpoints**:

- `GET /api/items/share` - Get share items
- `GET /api/items/share/[id]` - Get single share item
- `POST /api/items/share` - Create share item (requires auth)
- `PUT /api/items/share/[id]` - Update share item (requires auth, owner only)
- `DELETE /api/items/share/[id]` - Delete share item (requires auth, owner only)
- `GET /api/items/share?action=statistics` - Get statistics

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common Status Codes**:

- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required fields, validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (not the owner)
- `404` - Not Found
- `500` - Internal Server Error

---

## Usage Examples

### Frontend Implementation Example

```typescript
import { useAxios } from "@/hooks/use-axios";

// Get lost items with filtering
const { data, loading, error } = useAxios({
  method: "GET",
  url: "/api/items/lost",
  params: {
    category: "electronics",
    search: "phone",
    limit: 20,
    offset: 0,
  },
});

// Create a lost item (requires authentication)
const { execute } = useAxios({
  method: "POST",
  url: "/api/items/lost",
});

await execute({
  data: {
    title: "Lost iPhone",
    description: "Black iPhone 13 Pro",
    category: "electronics",
    location: "Library",
    dateLost: "2026-01-01",
    contactInfo: "user@example.com",
  },
});

// Update item
await axios.put(`/api/items/lost/${itemId}`, {
  status: "resolved",
});

// Delete item
await axios.delete(`/api/items/lost/${itemId}`);
```

---

## Database Schema

### Lost Items Table

```sql
lost_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date_lost DATE NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  tags TEXT[],
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Indexes

```sql
-- Performance optimization indexes
idx_lost_items_category (category)
idx_lost_items_status (status)
idx_lost_items_location (location text search)
idx_lost_items_created_at (created_at DESC)
idx_lost_items_user_id (user_id)
idx_lost_items_tags (tags GIN index)
```

---

## Best Practices

1. **Pagination**: Always use `limit` and `offset` for large datasets
2. **Search Optimization**: Use specific filters (category, location) before text search
3. **Caching**: Cache frequently accessed items and statistics on frontend
4. **Image Upload**: Upload images to Cloudinary before creating items
5. **Error Handling**: Always handle errors gracefully and provide user feedback
6. **Authentication**: Check authentication status before showing "Create" buttons
7. **Debouncing**: Debounce search inputs to reduce API calls

---

## Service Functions

All API routes use optimized service functions located in:

- `/services/lost-items.services.ts`
- `/services/found-items.services.ts`
- `/services/share-items.services.ts`

These services provide:

- Type-safe operations
- Ownership verification
- Optimized database queries
- Error handling
- Statistics calculation
- View count tracking

---

## Types

All TypeScript types are defined in `/types/items.types.ts`:

- `LostItem`, `FoundItem`, `ShareItem`
- `ItemFilterOptions`
- `ItemsResponse<T>`
- Request/Response types
- Category and status enums

---

## Security

1. **Authentication**: POST/PUT/DELETE/PATCH require valid Supabase session
2. **Authorization**: Users can only modify their own items
3. **Validation**: All required fields are validated
4. **SQL Injection**: Protected by Supabase parameterized queries
5. **Rate Limiting**: Implement rate limiting on production (recommended)

---

## Performance Optimization

1. **Database Indexes**: Proper indexes on frequently queried columns
2. **Query Optimization**: Select only needed fields
3. **Pagination**: Limit result sets to prevent memory issues
4. **Caching**: Statistics and popular items can be cached
5. **CDN**: Serve images through Cloudinary CDN
6. **Connection Pooling**: Supabase handles connection pooling

---

## Future Enhancements

- [ ] Real-time notifications using Supabase Realtime
- [ ] Image upload endpoint integrated with Cloudinary
- [ ] Advanced search with fuzzy matching
- [ ] Geolocation-based proximity search
- [ ] Email notifications for matches
- [ ] Item claiming workflow
- [ ] Report inappropriate content
- [ ] Admin moderation tools
