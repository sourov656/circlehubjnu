# Lost Items Page - Feature Documentation

## 📋 Overview

The Lost Items page allows users to report items they have lost and browse items reported by other users. This is a core feature of CircleHub JnU that helps the community recover lost belongings.

**Route**: `/lost`  
**API Endpoint**: `/api/items/lost`  
**Component**: `app/lost/page.tsx`

---

## ✨ Features

### 1. Browse Lost Items
- View all reported lost items
- Card-based layout with images
- Pagination support
- Real-time status indicators

### 2. Advanced Filtering
- **Category Filter**: Electronics, Books, Accessories, Documents, etc.
- **Status Filter**: Active, Found, Closed
- **Date Range**: Filter by date lost
- **Location Filter**: Filter by campus location
- **Search**: Text search across title and description

### 3. Report Lost Item
- **Form Fields**:
  - Title (required)
  - Description (required)
  - Category (required)
  - Date Lost (required)
  - Location Last Seen (required)
  - Images (multiple upload)
  - Contact Information
  - Reward (optional)
  - Tags
  
### 4. My Lost Items
- View your own posted items
- Edit item details
- Update status (active/found/closed)
- Delete items
- View statistics

### 5. Item Details
- Full description and images
- Contact information
- Location map (planned)
- Share functionality
- Report inappropriate content

---

## 🎨 User Interface

### Page Layout

```
┌─────────────────────────────────────────┐
│         Navigation Bar                   │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────┐    │
│  │   Lost Items Header             │    │
│  │   + Report Lost Item Button     │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │   Filters & Search Bar          │    │
│  │   [Category] [Status] [Date]    │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ Item │  │ Item │  │ Item │         │
│  │ Card │  │ Card │  │ Card │         │
│  └──────┘  └──────┘  └──────┘         │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ Item │  │ Item │  │ Item │         │
│  │ Card │  │ Card │  │ Card │         │
│  └──────┘  └──────┘  └──────┘         │
│                                          │
│         [Pagination Controls]            │
│                                          │
├─────────────────────────────────────────┤
│         Footer                           │
└─────────────────────────────────────────┘
```

### Item Card Components

Each item card displays:
- **Image**: Thumbnail or placeholder
- **Title**: Item name
- **Category Badge**: Color-coded category
- **Status Badge**: Active/Found/Closed
- **Date Lost**: When the item was lost
- **Location**: Where it was last seen
- **Description**: Brief excerpt
- **User Info**: Posted by (name & avatar)
- **Action Buttons**: View Details, Contact

---

## 🔧 Technical Implementation

### File Structure

```
app/lost/
└── page.tsx                    # Main page component

components/lost-items/
├── LostItemCard.tsx           # Individual item card
├── LostItemForm.tsx           # Report lost item form
├── LostItemsList.tsx          # Items list container
├── LostItemFilters.tsx        # Filter controls
└── LostItemDetails.tsx        # Item detail modal

services/
└── lost-items.services.ts     # Lost items business logic

models/
└── lost-items.m.ts            # Mongoose model
```

### Key Components

#### 1. Lost Items List (`LostItemsList.tsx`)

```typescript
export function LostItemsList() {
  const [filters, setFilters] = useState<ItemFilters>({
    category: undefined,
    status: 'active',
    search: '',
    page: 1,
    limit: 12
  });

  const { data, loading, error } = useAxios('/api/items/lost', {
    params: filters
  });

  return (
    <div>
      <LostItemFilters filters={filters} onChange={setFilters} />
      
      {loading && <LoadingSpinner />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.items.map(item => (
          <LostItemCard key={item._id} item={item} />
        ))}
      </div>
      
      <Pagination data={data?.pagination} />
    </div>
  );
}
```

#### 2. Lost Item Form (`LostItemForm.tsx`)

```typescript
export function LostItemForm({ onSuccess }: LostItemFormProps) {
  const [formData, setFormData] = useState<CreateLostItemRequest>({
    title: '',
    description: '',
    category: '',
    location: '',
    dateLost: new Date(),
    images: [],
    contactInfo: '',
    reward: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/items/lost', formData, {
        withCredentials: true
      });
      
      toast.success('Lost item reported successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to report item');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### 3. Item Card (`LostItemCard.tsx`)

```typescript
export function LostItemCard({ item }: LostItemCardProps) {
  return (
    <Card>
      <CardHeader>
        <img src={item.images[0] || '/placeholder.png'} alt={item.title} />
        <Badge>{item.category}</Badge>
        <StatusBadge status={item.status} />
      </CardHeader>
      
      <CardContent>
        <h3>{item.title}</h3>
        <p>{item.description.slice(0, 100)}...</p>
        
        <div className="meta">
          <span>📅 {formatDate(item.dateLost)}</span>
          <span>📍 {item.location}</span>
        </div>
        
        <div className="user-info">
          <Avatar src={item.userId.avatar} />
          <span>{item.userId.name}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={() => openDetails(item._id)}>
          View Details
        </Button>
        <Button variant="outline" onClick={() => contact(item.userId)}>
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 🔄 Data Flow

### Viewing Lost Items

```
1. User visits /lost
   ↓
2. Component loads with default filters
   ↓
3. GET /api/items/lost?status=active&page=1&limit=12
   ↓
4. Service fetches from database
   ↓
5. Return paginated items
   ↓
6. Render items in grid layout
```

### Reporting Lost Item

```
1. User clicks "Report Lost Item"
   ↓
2. Modal opens with form
   ↓
3. User fills form and uploads images
   ↓
4. Images uploaded to Cloudinary
   ↓
5. POST /api/items/lost (with auth)
   ↓
6. Service validates and creates item
   ↓
7. Save to database
   ↓
8. Return created item
   ↓
9. Show success message
   ↓
10. Refresh items list
```

### Filtering Items

```
1. User changes filter (e.g., category = "Electronics")
   ↓
2. Update filter state
   ↓
3. GET /api/items/lost?category=Electronics&status=active
   ↓
4. Service applies filters in query
   ↓
5. Return filtered items
   ↓
6. Update UI with filtered results
```

---

## 🗃️ Database Schema

**Model**: `LostItem`  
**Collection**: `lost_items`

```typescript
interface LostItem {
  _id: ObjectId;
  userId: ObjectId;  // Reference to User
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  dateLost: Date;
  images: string[];
  contactInfo?: string;
  reward?: string;
  tags?: string[];
  status: 'active' | 'found' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `userId` - For querying user's items
- `category` - For category filtering
- `status` - For status filtering
- `createdAt` - For sorting by date
- Text index on `title` and `description` - For search

---

## 🔐 Permissions

### Public Actions
- ✅ View all lost items
- ✅ View item details
- ✅ Search and filter items

### Authenticated User Actions
- ✅ Report lost item
- ✅ Edit own items
- ✅ Update status of own items
- ✅ Delete own items
- ✅ Contact item posters

### Admin Actions
- ✅ Edit any item
- ✅ Delete any item
- ✅ Update status of any item
- ✅ View all items (including closed)

---

## 📱 Responsive Design

### Desktop (≥1024px)
- 3 columns grid layout
- Full filters sidebar
- Large item cards with full details

### Tablet (768px - 1023px)
- 2 columns grid layout
- Collapsible filters
- Medium-sized cards

### Mobile (<768px)
- Single column layout
- Bottom sheet filters
- Compact cards
- Optimized images

---

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Alt text for all images
- Focus indicators
- Color contrast compliance (WCAG AA)

---

## 🚀 Performance Optimizations

### Image Optimization
- Cloudinary CDN for fast delivery
- Lazy loading for images
- Responsive images (srcset)
- Thumbnail generation

### Data Loading
- Pagination (12 items per page)
- Efficient database queries with indexes
- Debounced search input
- Optimistic UI updates

### Caching
- Browser caching for static assets
- API response caching (planned)
- Image CDN caching

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Can view lost items without login
- [ ] Can report item with login
- [ ] Can filter by category
- [ ] Can filter by status
- [ ] Can search items
- [ ] Can view item details
- [ ] Can edit own items
- [ ] Can delete own items
- [ ] Can update item status
- [ ] Images upload correctly
- [ ] Pagination works
- [ ] Form validation works

### Edge Cases
- [ ] Handle no items found
- [ ] Handle network errors
- [ ] Handle large images
- [ ] Handle missing images
- [ ] Handle invalid dates
- [ ] Handle long descriptions

### Security
- [ ] Can't edit others' items
- [ ] Can't delete others' items
- [ ] XSS protection in user input
- [ ] Image upload validation
- [ ] Rate limiting (planned)

---

## 🐛 Common Issues & Solutions

### Issue: Images not uploading
**Solution**: Check Cloudinary configuration in `.env.local`

### Issue: Items not showing
**Solution**: Check MongoDB connection and model registration

### Issue: Can't edit item
**Solution**: Verify user ownership and authentication

### Issue: Filters not working
**Solution**: Check query parameter formatting and service implementation

---

## 🔮 Future Enhancements

- [ ] Real-time updates with WebSocket
- [ ] Map integration for location
- [ ] Advanced image recognition
- [ ] Email notifications for matching items
- [ ] Export to PDF
- [ ] Social media sharing
- [ ] QR code generation
- [ ] Analytics dashboard

---

## 🔗 Related Documentation

- [API Documentation - Lost Items](../API/ITEMS_API.md#lost-items)
- [Database Models](../Architecture/DATABASE_MODELS.md)
- [Item Status Workflow](../Implementation/ITEM_STATUS_WORKFLOW.md)

---

**Last Updated**: January 2026
