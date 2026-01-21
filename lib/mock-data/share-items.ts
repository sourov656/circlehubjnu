export interface ShareItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: "new" | "like-new" | "good" | "fair";
  offerType: "free" | "sale";
  price?: number;
  location: string;
  datePosted: string;
  contactInfo: string;
  imageUrl?: string;
  tags?: string[];
  status: "available" | "reserved" | "shared";
  sharedBy: {
    name: string;
    avatar?: string;
    studentId?: string;
  };
}

export const CATEGORIES = [
  "electronics",
  "books",
  "clothing",
  "furniture",
  "sports",
  "accessories",
  "stationery",
  "other",
];

export const CONDITIONS = ["new", "like-new", "good", "fair"];

export const LOCATIONS = [
  "Hostel Area",
  "Campus Gate",
  "Library",
  "Cafeteria",
  "Administrative Block",
  "Sports Complex",
  "Classroom Building",
  "Other",
];

export const mockShareItems: ShareItem[] = [
  {
    id: "1",
    title: "Programming Books Set",
    description:
      "Sharing a collection of programming books including Java, Python, and Data Structures. Great for CSE students.",
    category: "books",
    condition: "good",
    offerType: "sale",
    price: 1500,
    location: "Hostel Area",
    datePosted: "2024-11-10",
    contactInfo: "mahbub.hassan@student.jnu.ac.bd | +880-1777-789012",
    imageUrl: "https://placehold.co/600x400?text=Programming+Books+Set",
    tags: ["Java", "Python", "Data Structures", "CSE"],
    status: "available",
    sharedBy: {
      name: "Mahbub Hassan",
      avatar: "https://placehold.co/40x40?text=MH",
      studentId: "JNU2019012",
    },
  },
  {
    id: "2",
    title: "Scientific Calculator",
    description:
      "Casio scientific calculator, barely used. Perfect for math and engineering courses.",
    category: "electronics",
    condition: "like-new",
    offerType: "sale",
    price: 800,
    location: "Campus Gate",
    datePosted: "2024-11-09",
    contactInfo: "nasir.uddin@student.jnu.ac.bd | +880-1788-890123",
    imageUrl: "https://placehold.co/600x400?text=Scientific+Calculator",
    tags: ["Casio", "scientific", "math", "engineering"],
    status: "available",
    sharedBy: {
      name: "Nasir Uddin",
      avatar: "https://placehold.co/40x40?text=NU",
      studentId: "JNU2020034",
    },
  },
  {
    id: "3",
    title: "Study Table & Chair",
    description:
      "Wooden study table with matching chair. Good condition, perfect for hostel room.",
    category: "furniture",
    condition: "good",
    offerType: "sale",
    price: 3500,
    location: "Hostel Area",
    datePosted: "2024-11-08",
    contactInfo: "ruma.akter@student.jnu.ac.bd | +880-1799-901234",
    imageUrl: "https://placehold.co/600x400?text=Study+Table+Chair",
    tags: ["wooden", "hostel", "study", "furniture"],
    status: "available",
    sharedBy: {
      name: "Ruma Akter",
      avatar: "https://placehold.co/40x40?text=RA",
      studentId: "JNU2018067",
    },
  },
  {
    id: "4",
    title: "Cricket Equipment Set",
    description:
      "Complete cricket set including bat, ball, pads, and gloves. Free for sports club members.",
    category: "sports",
    condition: "good",
    offerType: "free",
    location: "Sports Complex",
    datePosted: "2024-11-07",
    contactInfo: "karim.molla@student.jnu.ac.bd | +880-1800-012345",
    imageUrl: "https://placehold.co/600x400?text=Cricket+Equipment+Set",
    tags: ["cricket", "sports", "free", "club"],
    status: "available",
    sharedBy: {
      name: "Karim Molla",
      avatar: "https://placehold.co/40x40?text=KM",
      studentId: "JNU2021098",
    },
  },
];

export const filterByCategory = (
  items: ShareItem[],
  category: string
): ShareItem[] => {
  if (!category || category === "all") return items;
  return items.filter((item) => item.category === category);
};

export const filterByCondition = (
  items: ShareItem[],
  condition: string
): ShareItem[] => {
  if (!condition || condition === "all") return items;
  return items.filter((item) => item.condition === condition);
};

export const filterByPriceRange = (
  items: ShareItem[],
  minPrice: number,
  maxPrice: number
): ShareItem[] => {
  return items.filter((item) => {
    const price = item.price || 0;
    return price >= minPrice && price <= maxPrice;
  });
};

export const filterByLocation = (
  items: ShareItem[],
  location: string
): ShareItem[] => {
  if (!location || location === "all") return items;
  return items.filter((item) => item.location === location);
};

export const searchItems = (
  items: ShareItem[],
  searchTerm: string
): ShareItem[] => {
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

export const sortItems = (items: ShareItem[], sortBy: string): ShareItem[] => {
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
    case "price-asc":
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
};
