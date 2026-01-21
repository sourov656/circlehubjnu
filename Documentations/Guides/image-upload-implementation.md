# Image Upload Implementation for Lost Items

## Overview

This document describes the complete image upload flow for lost items, from frontend to backend to cloud storage.

## Flow Diagram

```
User selects image → Frontend validates → Convert to base64 →
Send to API → Upload to Cloudinary → Get URL → Save to Database
```

## Components

### 1. Frontend Form (ReportLostItemForm.tsx)

**Location:** `components/lost-items/ReportLostItemForm.tsx`

**Features:**

- File input for image selection
- Image preview before upload
- File validation (type and size)
- Base64 conversion
- Visual feedback

**Validation Rules:**

- File type: Only images (image/\*)
- Max size: 5MB
- Supported formats: PNG, JPG, JPEG

**Key Functions:**

```typescript
handleImageUpload(e: React.ChangeEvent<HTMLInputElement>)
// Validates file and creates preview

removeImage()
// Clears selected image

handleSubmit()
// Converts image to base64 and submits
```

### 2. API Route (route.ts)

**Location:** `app/api/items/lost/route.ts`

**Process:**

1. Receives request with `imageBase64` field
2. Validates required fields
3. Uploads image to Cloudinary if provided
4. Saves item with image URL to database
5. Returns response

**Request Body:**

```typescript
{
  title: string;
  description: string;
  category: string;
  location: string;
  dateLost: string;
  contactInfo: string;
  imageBase64?: string;  // Base64 encoded image
  tags?: string[];
}
```

**Response:**

```typescript
{
  success: boolean;
  message?: string;
  data?: LostItem;
  error?: string;
}
```

### 3. Cloudinary Service (clodinary.services.ts)

**Location:** `services/clodinary.services.ts`

**Function:** `uploadDocumentFromBase64()`

```typescript
uploadDocumentFromBase64(
  base64Data: string,    // Base64 string with data:... prefix
  folder?: string,       // Cloudinary folder (e.g., "lost-items")
  fileName?: string      // Original filename
): Promise<string>       // Returns secure URL
```

**Configuration:**

- Folder: `lost-items`
- Resource type: Auto (supports images and PDFs)
- Quality: Auto
- Format: Auto
- Public ID: Generated with timestamp

### 4. Lost Items Service (lost-items.services.ts)

**Location:** `services/lost-items.services.ts`

**Function:** `createItem()`

```typescript
createItem(
  userId: string,
  itemData: {
    ...
    image_url: string | null,  // Cloudinary URL
    ...
  }
): Promise<LostItem>
```

## Database Schema

```sql
lost_items table:
  - image_url (text, nullable) -- Stores Cloudinary URL
```

## Usage Example

### Frontend (Lost Page)

```typescript
const handleReportSubmit = async (formData) => {
  const response = await axios.post("/api/items/lost", {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    location: formData.location,
    dateLost: formData.dateLost,
    contactInfo: formData.contactInfo,
    imageBase64: formData.imageBase64, // Base64 string
    tags: formData.tags,
  });
};
```

### API Route

```typescript
// Handle image upload
let imageUrl: string | null = null;
if (body.imageBase64) {
  imageUrl = await uploadDocumentFromBase64(
    body.imageBase64,
    "lost-items",
    `lost_${Date.now()}`
  );
}

// Save to database
const item = await LostItemsService.createItem(user.id, {
  ...otherFields,
  image_url: imageUrl,
});
```

## Error Handling

### Frontend Validation Errors

- Invalid file type → "Please select a valid image file"
- File too large → "Image size should be less than 5MB"

### API Errors

- Image upload fails → 500 "Failed to upload image. Please try again."
- Missing required fields → 400 with list of required fields
- Authentication required → 401 "Authentication required"
- Database error → 500 with error message

## Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Benefits of This Implementation

1. **Smooth User Experience**

   - Instant preview of selected image
   - Clear validation feedback
   - Loading states during upload

2. **Efficient Data Transfer**

   - Base64 encoding allows single API call
   - No need for separate file upload endpoint

3. **Cloud Storage**

   - Images stored on Cloudinary CDN
   - Fast delivery worldwide
   - Automatic optimization

4. **Scalability**
   - No local storage required
   - Handles large files efficiently
   - Easy to implement for other item types

## Future Enhancements

1. **Multiple Images**

   - Allow uploading multiple images per item
   - Image gallery/carousel in detail view

2. **Image Editing**

   - Crop/rotate before upload
   - Add annotations/markers

3. **Compression**

   - Client-side image compression
   - Reduce upload time and bandwidth

4. **Progressive Upload**
   - Show upload progress
   - Cancel ongoing uploads

## Related Files

- Frontend Form: `components/lost-items/ReportLostItemForm.tsx`
- API Route: `app/api/items/lost/route.ts`
- Service: `services/lost-items.services.ts`
- Cloudinary Service: `services/clodinary.services.ts`
- Types: `types/items.types.ts`
- Lost Page: `app/lost/page.tsx`
- Item Card: `components/lost-items/ItemCard.tsx`
