// Base item types from MongoDB models

export interface LostItem {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date_lost: string;
  image_url?: string;
  status: "pending" | "active" | "found" | "closed" | "rejected";
  tags?: string[];
  reward_amount?: number | null;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface FoundItem {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date_found: string;
  image_url?: string;
  status: "pending" | "available" | "claimed" | "returned" | "rejected";
  tags?: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ShareItem {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: "new" | "like-new" | "good" | "fair";
  offer_type: "free" | "sale";
  price?: number | null;
  location: string;
  image_url?: string | null;
  tags?: string[];
  status: "pending" | "available" | "reserved" | "shared" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Profile {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  university?: string;
  student_id?: string;
  role: "admin" | "student";
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// Insert types (omit auto-generated fields)
export type LostItemInsert = Omit<
  LostItem,
  "_id" | "created_at" | "updated_at" | "views"
>;
export type FoundItemInsert = Omit<
  FoundItem,
  "_id" | "created_at" | "updated_at" | "views"
>;
export type ShareItemInsert = Omit<
  ShareItem,
  "_id" | "created_at" | "updated_at"
>;
export type ProfileInsert = Omit<Profile, "_id" | "created_at" | "updated_at">;

// Update types (all fields optional except _id)
export type LostItemUpdate = Partial<
  Omit<LostItem, "_id" | "created_at" | "updated_at">
>;
export type FoundItemUpdate = Partial<
  Omit<FoundItem, "_id" | "created_at" | "updated_at">
>;
export type ShareItemUpdate = Partial<
  Omit<ShareItem, "_id" | "created_at" | "updated_at">
>;
export type ProfileUpdate = Partial<
  Omit<Profile, "_id" | "created_at" | "updated_at">
>;

// Claim types
export interface FoundItemClaim {
  id: string;
  found_item_id: string;
  claimer_id: string;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  contact_info: {
    phone?: string;
    email?: string;
    preferredContact?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface FoundItemClaimWithProfile extends FoundItemClaim {
  claimer_profile: UserProfile;
  found_item?: FoundItem;
}

export interface CreateClaimRequest {
  found_item_id: string;
  message?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    preferredContact?: string;
  };
}

export interface UpdateClaimRequest {
  status?: "pending" | "approved" | "rejected";
  message?: string;
}

// User profile info for contact
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

// Item status
export type ItemStatus = "active" | "resolved" | "archived";

// Item categories
export const ITEM_CATEGORIES = [
  "electronics",
  "clothing",
  "accessories",
  "documents",
  "books",
  "keys",
  "bags",
  "sports",
  "jewelry",
  "others",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

// Sort options
export const SORT_OPTIONS = [
  "newest",
  "oldest",
  "most-viewed",
  "recently-updated",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

// Filter options for GET requests
export interface ItemFilterOptions {
  category?: ItemCategory | "all";
  status?: ItemStatus;
  search?: string;
  tags?: string[];
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  sort?: SortOption;
  limit?: number;
  offset?: number;
}

// User profile info for contact
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

// Lost item with profile
export interface LostItemWithProfile extends LostItem {
  profile: UserProfile;
}

// Found item with profile
export interface FoundItemWithProfile extends FoundItem {
  profile: UserProfile;
}

// Share item with profile
export interface ShareItemWithProfile extends ShareItem {
  profile: UserProfile | null;
}

// API Response types
export interface ItemsResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SingleItemResponse<T> {
  item: T;
}

// Create/Update request types
export interface CreateLostItemRequest {
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  dateLost: string;
  imageUrl?: string | null;
  imageBase64?: string; // Base64 encoded image data
  tags?: string[];
  rewardAmount?: number;
}

export interface UpdateLostItemRequest {
  title?: string;
  description?: string;
  category?: ItemCategory;
  location?: string;
  dateLost?: string;
  imageUrl?: string | null;
  tags?: string[];
  status?: ItemStatus;
  rewardAmount?: number;
}

export interface CreateFoundItemRequest {
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  dateFound: string;
  imageUrl?: string | null;
  imageBase64?: string; // Base64 encoded image data
  tags?: string[];
}

export interface UpdateFoundItemRequest {
  title?: string;
  description?: string;
  category?: ItemCategory;
  location?: string;
  dateFound?: string;
  imageUrl?: string | null;
  tags?: string[];
  status?: ItemStatus;
}

export interface CreateShareItemRequest {
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  offerType: "free" | "exchange" | "rent" | "sale";
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  price?: number | null;
  imageUrl?: string | null;
  imageBase64?: string; // Base64 encoded image data
  tags?: string[];
}

export interface UpdateShareItemRequest {
  title?: string;
  description?: string;
  category?: ItemCategory;
  location?: string;
  offerType?: "free" | "exchange" | "rent";
  condition?: "new" | "like-new" | "good" | "fair" | "poor";
  price?: number | null;
  imageUrl?: string | null;
  tags?: string[];
  status?: ItemStatus;
}

// Statistics types
export interface ItemStatistics {
  totalItems: number;
  activeItems: number;
  resolvedItems: number;
  itemsByCategory: Record<ItemCategory, number>;
  recentItems: number;
}

// Home Stats types
export interface HomeStats {
  items_recovered: number;
  active_users: number;
  items_shared: number;
  success_rate: number;
}

export interface RecentActivityItem {
  id: string;
  type: "lost" | "found" | "share";
  title: string;
  location: string;
  time: string;
  created_at: Date | string;
}

export interface HomeData {
  stats: HomeStats;
  recent_activity: RecentActivityItem[];
}

// Error response
export interface ErrorResponse {
  error: string;
  details?: unknown;
}
