# Items Service Implementation Guide

## Overview

This guide explains the implementation of the optimized Items API service for Lost, Found, and Share items.

## Architecture

### Layer Structure

```
┌─────────────────────────┐
│    Frontend/Pages       │  (React Components)
├─────────────────────────┤
│    API Routes Layer     │  (Next.js API Routes)
├─────────────────────────┤
│    Service Layer        │  (Business Logic)
├─────────────────────────┤
│    Database Layer       │  (Supabase)
└─────────────────────────┘
```

### Key Principles

1. **Separation of Concerns**: Business logic in services, routes handle HTTP
2. **DRY (Don't Repeat Yourself)**: Reusable service functions
3. **Type Safety**: Full TypeScript typing throughout
4. **Optimization**: Minimal database queries with smart filtering
5. **Security**: Authentication checked in routes, authorization in services

---

## File Structure

```
campus-connect/
├── types/
│   └── items.types.ts                 # All item-related TypeScript types
├── services/
│   ├── lost-items.services.ts         # Lost items business logic
│   ├── found-items.services.ts        # Found items business logic
│   └── share-items.services.ts        # Share items business logic
├── app/api/items/
│   ├── lost/
│   │   ├── route.ts                   # GET, POST /api/items/lost
│   │   └── [id]/route.ts              # GET, PUT, DELETE, PATCH /api/items/lost/[id]
│   ├── found/
│   │   ├── route.ts                   # GET, POST /api/items/found
│   │   └── [id]/route.ts              # GET, PUT, DELETE, PATCH /api/items/found/[id]
│   └── share/
│       ├── route.ts                   # GET, POST /api/items/share
│       └── [id]/route.ts              # GET, PUT, DELETE, PATCH /api/items/share/[id]
├── docs/
│   ├── API/
│   │   └── items-api.md              # API documentation
│   └── Guides/
│       └── items-implementation.md    # This file
├── supabase-functions.sql             # Database functions and indexes
└── supabase-setup.sql                 # Initial database setup
```

---

## Service Layer Design

### Service Functions Pattern

Each service class (LostItemsService, FoundItemsService, ShareItemsService) provides:

#### 1. **CRUD Operations**

- `createItem(userId, itemData)` - Create new item
- `getItemById(itemId)` - Get single item
- `updateItem(itemId, userId, updates)` - Update item
- `deleteItem(itemId, userId)` - Delete item

#### 2. **Query Operations**

- `getItems(filters)` - Get items with advanced filtering
- `searchItems(query, filters)` - Text search
- `getUserItems(userId, filters)` - Get user's items

#### 3. **Statistics**

- `getStatistics(userId?)` - Get aggregate statistics

#### 4. **Status Management**

- `markAsResolved(itemId, userId)` - Change status to resolved
- `incrementViews(itemId)` - Increment view count

### Service Benefits

✅ **Reusability**: Use same service from multiple routes or pages
✅ **Testability**: Easy to unit test business logic
✅ **Maintainability**: Changes in one place affect all consumers
✅ **Type Safety**: Full TypeScript support
✅ **Error Handling**: Consistent error handling

---

## API Routes Design

### Route Structure

Each item type has two route files:

1. **Collection Route** (`route.ts`)

   - `GET` - List items with filtering
   - `POST` - Create new item

2. **Individual Route** (`[id]/route.ts`)
   - `GET` - Get single item
   - `PUT` - Update entire item
   - `PATCH` - Partial update (e.g., resolve)
   - `DELETE` - Delete item

### Authentication Flow

```typescript
// GET routes - Public (no auth)
export async function GET(req: NextRequest) {
  // No authentication check
  const result = await Service.getItems(filters);
  return NextResponse.json(result);
}

// POST routes - Authenticated
export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  // Check authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Create item
  const item = await Service.createItem(user.id, data);
  return NextResponse.json(item);
}

// PUT/DELETE - Authenticated + Ownership Check
export async function PUT(req: NextRequest) {
  // Authentication check (same as POST)

  // Service handles ownership verification
  const item = await Service.updateItem(itemId, user.id, updates);
  return NextResponse.json(item);
}
```

---

## Filtering & Optimization

### Filter Options

The `ItemFilterOptions` interface provides powerful filtering:

```typescript
interface ItemFilterOptions {
  category?: ItemCategory | "all";
  status?: ItemStatus;
  search?: string; // Full-text search
  tags?: string[]; // Array overlap search
  location?: string; // Partial match
  dateFrom?: string; // Date range
  dateTo?: string;
  userId?: string; // User's items
  sort?: SortOption; // Sorting
  limit?: number; // Pagination
  offset?: number;
}
```

### Query Building

Services use Supabase's query builder to construct efficient queries:

```typescript
static async getItems(filters: ItemFilterOptions) {
  let query = supabase
    .from("lost_items")
    .select("*, profiles:user_id(*)", { count: "exact" });

  // Apply filters conditionally
  if (status) query = query.eq("status", status);
  if (category && category !== "all") query = query.eq("category", category);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  if (tags?.length) query = query.overlaps("tags", tags);
  if (location) query = query.ilike("location", `%${location}%`);
  if (dateFrom) query = query.gte("date_lost", dateFrom);
  if (dateTo) query = query.lte("date_lost", dateTo);
  if (userId) query = query.eq("user_id", userId);

  // Apply sorting
  switch (sort) {
    case "oldest": query = query.order("created_at", { ascending: true }); break;
    case "most-viewed": query = query.order("views", { ascending: false }); break;
    // ...
  }

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  return { items: data, total: count, hasMore: offset + limit < count };
}
```

### Performance Benefits

1. **Single Query**: All filters applied in one database query
2. **Indexed Fields**: Database indexes on category, status, location, etc.
3. **Count Optimization**: Get total count without fetching all records
4. **Range Queries**: Efficient pagination with `range()`
5. **Join Optimization**: Profile data fetched in same query

---

## Type Safety

### Type Definitions

```typescript
// Database types from Supabase
export type LostItem = Database["public"]["Tables"]["lost_items"]["Row"];
export type LostItemInsert =
  Database["public"]["Tables"]["lost_items"]["Insert"];
export type LostItemUpdate =
  Database["public"]["Tables"]["lost_items"]["Update"];

// Extended types with relations
export interface LostItemWithProfile extends LostItem {
  profiles?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
  };
}

// Request types
export interface CreateLostItemRequest {
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  dateLost: string;
  contactInfo: string;
  imageUrl?: string | null;
  tags?: string[];
}

// Response types
export interface ItemsResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

### Type Usage

```typescript
// Service function with types
static async createItem(
  userId: string,
  itemData: Omit<LostItemInsert, "id" | "user_id" | "created_at">
): Promise<LostItem> {
  // Implementation
}

// API route with types
export async function POST(req: NextRequest) {
  const body: CreateLostItemRequest = await req.json();
  // TypeScript ensures body has correct shape
}
```

---

## Error Handling

### Service Layer Errors

Services throw descriptive errors:

```typescript
static async updateItem(itemId: string, userId: string, updates: LostItemUpdate) {
  const { data: existingItem } = await supabase
    .from("lost_items")
    .select("user_id")
    .eq("id", itemId)
    .single();

  if (!existingItem) {
    throw new Error("Item not found");
  }

  if (existingItem.user_id !== userId) {
    throw new Error("Unauthorized: You can only update your own items");
  }

  // Update...
}
```

### API Route Error Handling

Routes catch and format errors:

```typescript
try {
  const item = await Service.updateItem(id, user.id, updates);
  return NextResponse.json({ success: true, data: item });
} catch (error) {
  if (error.message.includes("Unauthorized")) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 403 }
    );
  }
  if (error.message.includes("not found")) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 404 }
    );
  }
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
```

---

## Database Optimization

### Indexes

```sql
-- Category filter
CREATE INDEX idx_lost_items_category ON lost_items(category);

-- Status filter
CREATE INDEX idx_lost_items_status ON lost_items(status);

-- Full-text search on location
CREATE INDEX idx_lost_items_location ON lost_items
  USING gin(to_tsvector('english', location));

-- Sorting by date
CREATE INDEX idx_lost_items_created_at ON lost_items(created_at DESC);

-- User's items
CREATE INDEX idx_lost_items_user_id ON lost_items(user_id);

-- Tag search
CREATE INDEX idx_lost_items_tags ON lost_items USING gin(tags);
```

### Database Functions

```sql
-- Atomic view increment (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_lost_item_views(item_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lost_items
  SET views = COALESCE(views, 0) + 1
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Frontend Integration

### Using the API

```typescript
import { useAxios } from "@/hooks/use-axios";
import { ItemsResponse, LostItemWithProfile } from "@/types/items.types";

// Get items
const { data, loading, error } = useAxios<ItemsResponse<LostItemWithProfile>>({
  method: "GET",
  url: "/api/items/lost",
  params: {
    category: selectedCategory,
    search: searchQuery,
    limit: 20,
    offset: page * 20,
  },
});

// Create item
const { execute: createItem } = useAxios({
  method: "POST",
  url: "/api/items/lost",
});

const handleSubmit = async (formData) => {
  const result = await createItem({ data: formData });
  if (result.success) {
    // Success handling
  }
};
```

### Public vs Authenticated Views

```typescript
const LostItemsPage = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Everyone can view */}
      <ItemsList items={items} />

      {/* Only authenticated users see this */}
      {user && <button onClick={showCreateModal}>Report Lost Item</button>}
    </>
  );
};
```

---

## Testing

### Service Testing

```typescript
describe("LostItemsService", () => {
  it("should create item with correct user_id", async () => {
    const item = await LostItemsService.createItem("user-123", {
      title: "Test Item",
      // ...
    });

    expect(item.user_id).toBe("user-123");
    expect(item.status).toBe("active");
  });

  it("should throw error when non-owner tries to update", async () => {
    await expect(
      LostItemsService.updateItem("item-1", "wrong-user", { title: "New" })
    ).rejects.toThrow("Unauthorized");
  });
});
```

### API Testing

```typescript
describe("POST /api/items/lost", () => {
  it("should require authentication", async () => {
    const res = await fetch("/api/items/lost", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });

    expect(res.status).toBe(401);
  });

  it("should validate required fields", async () => {
    const res = await authenticatedFetch("/api/items/lost", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }), // Missing fields
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });
});
```

---

## Best Practices

### 1. Always Use Services

❌ **Don't** write database queries in API routes
✅ **Do** use service functions

```typescript
// Bad
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data } = await supabase.from("lost_items").insert(...);
}

// Good
export async function POST(req: NextRequest) {
  const item = await LostItemsService.createItem(userId, data);
}
```

### 2. Type Everything

❌ **Don't** use `any`
✅ **Do** use proper types

```typescript
// Bad
const body: any = await req.json();

// Good
const body: CreateLostItemRequest = await req.json();
```

### 3. Handle Errors Gracefully

❌ **Don't** expose internal errors
✅ **Do** provide meaningful error messages

```typescript
// Bad
catch (error) {
  return NextResponse.json({ error: error }, { status: 500 });
}

// Good
catch (error) {
  console.error("Create item error:", error);
  return NextResponse.json({
    success: false,
    error: error instanceof Error ? error.message : "Internal server error"
  }, { status: 500 });
}
```

### 4. Validate Input

❌ **Don't** trust client input
✅ **Do** validate required fields

```typescript
const { title, description, category } = body;

if (!title || !description || !category) {
  return NextResponse.json(
    {
      success: false,
      error: "Missing required fields",
      required: ["title", "description", "category"],
    },
    { status: 400 }
  );
}
```

---

## Common Patterns

### Pagination

```typescript
const [page, setPage] = useState(0);
const limit = 20;

const { data } = useAxios({
  url: "/api/items/lost",
  params: {
    limit,
    offset: page * limit,
  },
});

const loadMore = () => {
  if (data?.hasMore) {
    setPage((p) => p + 1);
  }
};
```

### Search with Debounce

```typescript
const [searchQuery, setSearchQuery] = useState("");
const debouncedSearch = useDebounce(searchQuery, 500);

const { data } = useAxios({
  url: "/api/items/lost",
  params: {
    search: debouncedSearch,
  },
});
```

### Filter Combination

```typescript
const filters = {
  category: selectedCategory,
  status: "active",
  search: searchQuery,
  tags: selectedTags,
  location: selectedLocation,
  sort: sortOption,
};

const { data } = useAxios({
  url: "/api/items/lost",
  params: filters,
});
```

---

## Troubleshooting

### Issue: Items not showing

- Check `status` filter (default is "active")
- Verify database has items with `status='active'`
- Check pagination offset

### Issue: Authentication errors

- Verify Supabase session is valid
- Check token is passed in Authorization header
- Ensure `createServerClient()` is working

### Issue: Slow queries

- Run `EXPLAIN ANALYZE` on slow queries
- Verify indexes exist (check `supabase-functions.sql`)
- Consider adding composite indexes for common filter combinations

### Issue: Permission denied

- Services verify ownership before updates/deletes
- Ensure `user_id` matches the authenticated user
- Check `user.id` is correctly passed to service functions

---

## Summary

This implementation provides:

✅ **Optimized Performance**: Minimal queries with proper indexing
✅ **Type Safety**: Full TypeScript coverage
✅ **Security**: Authentication and authorization at appropriate layers
✅ **Maintainability**: Clear separation of concerns
✅ **Scalability**: Efficient pagination and filtering
✅ **Developer Experience**: Consistent patterns and good documentation
✅ **Public Viewing**: Anyone can browse items
✅ **Protected Actions**: Only authenticated users can create/modify items

The architecture allows for easy extension and maintenance while providing excellent performance and security.
