export interface LostItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  dateLost: string;
  datePosted: string;
  contactInfo: string;
  imageUrl?: string;
  tags?: string[];
  status: "active" | "found" | "closed";
  views?: number;
  reportedBy: {
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

export const mockLostItems: LostItem[] = [
  {
    id: "1",
    title: "Black iPhone 14 Pro",
    description:
      "Lost my black iPhone 14 Pro near the library. Has a blue case with student ID holder.",
    category: "electronics",
    location: "Library",
    dateLost: "2024-11-10",
    datePosted: "2024-11-11",
    contactInfo: "john.doe@student.jnu.ac.bd | +880-1711-123456",
    imageUrl: "https://placehold.co/600x400?text=Black+iPhone+14+Pro",
    tags: ["iPhone", "blue case", "student ID"],
    status: "active",
    reportedBy: {
      name: "John Doe",
      avatar: "https://placehold.co/40x40?text=JD",
      studentId: "JNU2021001",
    },
  },
  {
    id: "2",
    title: "Blue Laptop Bag",
    description:
      "Lost my blue laptop bag containing important documents and charger.",
    category: "bags",
    location: "Cafeteria",
    dateLost: "2024-11-09",
    datePosted: "2024-11-10",
    contactInfo: "jane.smith@student.jnu.ac.bd | +880-1722-234567",
    imageUrl: "https://placehold.co/600x400?text=Blue+Laptop+Bag",
    tags: ["documents", "charger"],
    status: "active",
    reportedBy: {
      name: "Jane Smith",
      avatar: "https://placehold.co/40x40?text=JS",
      studentId: "JNU2021002",
    },
  },
  {
    id: "3",
    title: "Gold Watch",
    description:
      "Lost my grandfather's gold watch in the auditorium during the morning lecture.",
    category: "accessories",
    location: "Auditorium",
    dateLost: "2024-11-08",
    datePosted: "2024-11-09",
    contactInfo: "ahmed.khan@student.jnu.ac.bd | +880-1733-345678",
    imageUrl: "https://placehold.co/600x400?text=Gold+Watch",
    tags: ["gold", "vintage", "sentimental"],
    status: "active",
    reportedBy: {
      name: "Ahmed Khan",
      avatar: "https://placehold.co/40x40?text=AK",
      studentId: "JNU2020015",
    },
  },
];

export const filterByCategory = (
  items: LostItem[],
  category: string
): LostItem[] => {
  if (!category || category === "all") return items;
  return items.filter((item) => item.category === category);
};

export const filterByLocation = (
  items: LostItem[],
  location: string
): LostItem[] => {
  if (!location || location === "all") return items;
  return items.filter((item) => item.location === location);
};

export const filterByDateRange = (
  items: LostItem[],
  startDate: string,
  endDate: string
): LostItem[] => {
  if (!startDate && !endDate) return items;

  return items.filter((item) => {
    const itemDate = new Date(item.dateLost);
    const start = startDate ? new Date(startDate) : new Date("1900-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    return itemDate >= start && itemDate <= end;
  });
};

export const searchItems = (
  items: LostItem[],
  searchTerm: string
): LostItem[] => {
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

export const sortItems = (items: LostItem[], sortBy: string): LostItem[] => {
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
