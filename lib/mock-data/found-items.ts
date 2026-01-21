export interface FoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  dateFound: string;
  datePosted: string;
  contactInfo: string;
  imageUrl?: string;
  tags?: string[];
  status: "available" | "claimed" | "returned";
  views?: number;
  foundBy: {
    name: string;
    avatar?: string;
    studentId?: string;
  };
}

export const CATEGORIES = [
  "electronics",
  "accessories",
  "clothing",
  "books",
  "documents",
  "keys",
  "bags",
  "other",
];

export const LOCATIONS = [
  "Library",
  "Cafeteria",
  "Auditorium",
  "Computer Lab",
  "Classroom Building",
  "Hostel Area",
  "Sports Complex",
  "Administrative Block",
  "Parking Area",
  "Garden/Campus Grounds",
  "Other",
];

export const mockFoundItems: FoundItem[] = [
  {
    id: "1",
    title: "Red Water Bottle",
    description:
      "Found a red water bottle with JnU sticker near the library entrance.",
    category: "other",
    location: "Library",
    dateFound: "2024-11-12",
    datePosted: "2024-11-12",
    contactInfo: "sara.islam@student.jnu.ac.bd | +880-1744-456789",
    imageUrl: "https://placehold.co/600x400?text=Red+Water+Bottle",
    tags: ["JnU sticker", "red", "sports"],
    status: "available",
    foundBy: {
      name: "Sara Islam",
      avatar: "https://placehold.co/40x40?text=SI",
      studentId: "JNU2022003",
    },
  },
  {
    id: "2",
    title: "Black Wallet",
    description:
      "Found a black leather wallet in the cafeteria. Contains student ID and some cash.",
    category: "accessories",
    location: "Cafeteria",
    dateFound: "2024-11-11",
    datePosted: "2024-11-11",
    contactInfo: "rahman.ali@student.jnu.ac.bd | +880-1755-567890",
    imageUrl: "https://placehold.co/600x400?text=Black+Wallet",
    tags: ["leather", "student ID", "cash"],
    status: "available",
    foundBy: {
      name: "Rahman Ali",
      avatar: "https://placehold.co/40x40?text=RA",
      studentId: "JNU2021045",
    },
  },
  {
    id: "3",
    title: "USB Flash Drive",
    description:
      "Found a 32GB USB flash drive in Computer Lab 2. Has some project files.",
    category: "electronics",
    location: "Computer Lab",
    dateFound: "2024-11-10",
    datePosted: "2024-11-11",
    contactInfo: "fatima.begum@student.jnu.ac.bd | +880-1766-678901",
    imageUrl: "https://placehold.co/600x400?text=USB+Flash+Drive",
    tags: ["32GB", "project files", "SanDisk"],
    status: "available",
    foundBy: {
      name: "Fatima Begum",
      avatar: "https://placehold.co/40x40?text=FB",
      studentId: "JNU2020089",
    },
  },
];

export const filterByCategory = (
  items: FoundItem[],
  category: string
): FoundItem[] => {
  if (!category || category === "all") return items;
  return items.filter((item) => item.category === category);
};

export const filterByLocation = (
  items: FoundItem[],
  location: string
): FoundItem[] => {
  if (!location || location === "all") return items;
  return items.filter((item) => item.location === location);
};

export const filterByDateRange = (
  items: FoundItem[],
  startDate: string,
  endDate: string
): FoundItem[] => {
  if (!startDate && !endDate) return items;

  return items.filter((item) => {
    const itemDate = new Date(item.dateFound);
    const start = startDate ? new Date(startDate) : new Date("1900-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    return itemDate >= start && itemDate <= end;
  });
};

export const searchItems = (
  items: FoundItem[],
  searchTerm: string
): FoundItem[] => {
  if (!searchTerm.trim()) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
      item.location.toLowerCase().includes(term)
  );
};

export const sortItems = (items: FoundItem[], sortBy: string): FoundItem[] => {
  const sorted = [...items];

  switch (sortBy) {
    case "date-desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
      );
    case "date-asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime()
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
};
