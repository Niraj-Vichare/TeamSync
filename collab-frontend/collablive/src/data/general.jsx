export const ProjectStatus = {
  Ongoing: 0,
  Completed: 1,
  Archived: 2,
  Cancelled: 3,
  Paused: 4,
  NotStarted: 5,
  InReview: 6
};
export const ProjectCategory = {
  INFORMATION_TECHNOLOGY: 0,
  HEALTHCARE: 1,
  EDUCATION: 2,
  FINANCE: 3,
  MANUFACTURING: 4,
  CONSTRUCTION: 5,
  RETAIL: 6,
  TRANSPORTATION: 7,
  ENERGY: 8,
  TELECOMMUNICATIONS: 9,
  AGRICULTURE: 10,
  GOVERNMENT: 11,
  ENTERTAINMENT: 12,
  HOSPITALITY: 13,
  REAL_ESTATE: 14,
  LEGAL: 15,
  NON_PROFIT: 16,
  OTHER: 17
};


// constants.js
export const ROLE_MAP = {
  1: { label: "Admin", color: "bg-purple-600 text-purple-100" },
  2: { label: "CEO", color: "bg-red-600 text-red-100" },
  3: { label: "CTO", color: "bg-orange-600 text-orange-100" },
  4: { label: "Product Manager", color: "bg-blue-600 text-blue-100" },
  5: { label: "Project Manager", color: "bg-green-600 text-green-100" },
  6: { label: "Developer", color: "bg-yellow-500 text-yellow-100" },
  7: { label: "Tester", color: "bg-pink-500 text-pink-100" },
  8: { label: "Designer", color: "bg-indigo-500 text-indigo-100" },
  9: { label: "Business Analyst", color: "bg-cyan-500 text-cyan-100" },
  10: { label: "DevOps", color: "bg-gray-500 text-gray-800" },
  11: { label: "Support", color: "bg-teal-500 text-teal-800" },
  12: { label: "Guest", color: "bg-slate-500 text-slate-800" },
};

export const STATUS_MAP = {
  active: { 
    label: "Active", 
    color: "bg-green-100 text-green-800"
  },
  inactive: { 
    label: "Inactive", 
    color: "bg-gray-100 text-gray-800"
  },
  pending: { 
    label: "Accept Pending", 
    color: "bg-yellow-100 text-yellow-800"
  },
};

export const teamMembers = [
  {
    id: 1,
    name: "Anna Taylor",
    email: "annataylor@email.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b372?w=32&h=32&fit=crop&crop=face",
    department: "Legal",
    role: 6, // Developer
    status: "active",
    dateAdded: "08/08/2022 - 09:32 AM",
  },
  {
    id: 2,
    name: "Corina McCoy",
    email: "corinamccoy@email.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    department: "Legal",
    role: 5, // Project Manager
    status: "pending",
    dateAdded: "08/12/2022 - 10:09 AM",
  },
  {
    id: 3,
    name: "David Elson",
    email: "david.elson@email.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    department: "Legal",
    role: 6,
    status: "inactive",
    dateAdded: "08/13/2022 - 04:11 PM",
  },
  {
    id: 4,
    name: "Kathy Pacheco",
    email: "kathy1990@email.com",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face",
    department: "Design",
    role: 8, // Designer
    status: "active",
    dateAdded: "12/04/2022 - 03:30 PM",
  },
  {
    id: 5,
    name: "Iva Ryan",
    email: "ivaryan@email.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    department: "Design",
    role: 8,
    status: "active",
    dateAdded: "10/13/2022 - 02:47 PM",
  },
  {
    id: 6,
    name: "Rodger Struck",
    email: "rodgerthat@email.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
    department: "Development",
    role: 6,
    status: "pending",
    dateAdded: "10/13/2022 - 02:47 PM",
  },
  {
    id: 7,
    name: "Anna Taylor",
    email: "annataylor@email.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b372?w=32&h=32&fit=crop&crop=face",
    department: "Legal",
    role: 6,
    status: "active",
    dateAdded: "08/08/2022 - 09:32 AM",
  },
  {
    id: 8,
    name: "Corina McCoy",
    email: "corinamccoy@email.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    department: "Legal",
    role: 5,
    status: "pending",
    dateAdded: "08/12/2022 - 10:09 AM",
  },
  {
    id: 9,
    name: "David Elson",
    email: "david.elson@email.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    department: "Legal",
    role: 6,
    status: "inactive",
    dateAdded: "08/13/2022 - 04:11 PM",
  },
  {
    id: 10,
    name: "Kathy Pacheco",
    email: "kathy1990@email.com",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face",
    department: "Design",
    role: 8,
    status: "active",
    dateAdded: "12/04/2022 - 03:30 PM",
  },
  {
    id: 11,
    name: "Iva Ryan",
    email: "ivaryan@email.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    department: "Design",
    role: 8,
    status: "active",
    dateAdded: "10/13/2022 - 02:47 PM",
  },
  {
    id: 12,
    name: "Rodger Struck",
    email: "rodgerthat@email.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
    department: "Development",
    role: 6,
    status: "pending",
    dateAdded: "10/13/2022 - 02:47 PM",
  },
  {
    id: 13,
    name: "Sophie Lee",
    email: "sophie.lee@email.com",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
    department: "Marketing",
    role: 5,
    status: "active",
    dateAdded: "01/10/2023 - 09:00 AM",
  },
  {
    id: 14,
    name: "Brandon Cruz",
    email: "brandon.cruz@email.com",
    avatar:
      "https://images.unsplash.com/photo-1546456073-67fbf3c1d94b?w=32&h=32&fit=crop&crop=face",
    department: "Marketing",
    role: 6,
    status: "pending",
    dateAdded: "01/12/2023 - 11:15 AM",
  },
  {
    id: 15,
    name: "Lena Hall",
    email: "lenahall@email.com",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=32&h=32&fit=crop&crop=face",
    department: "Design",
    role: 8,
    status: "active",
    dateAdded: "02/02/2023 - 02:00 PM",
  },
  {
    id: 16,
    name: "Carlos Vega",
    email: "carlos.vega@email.com",
    avatar:
      "https://images.unsplash.com/photo-1502767089025-6572583495b0?w=32&h=32&fit=crop&crop=face",
    department: "Development",
    role: 6,
    status: "inactive",
    dateAdded: "02/05/2023 - 04:30 PM",
  },
  {
    id: 17,
    name: "Julia Park",
    email: "juliapark@email.com",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face",
    department: "HR",
    role: 5,
    status: "active",
    dateAdded: "03/01/2023 - 08:45 AM",
  },
  {
    id: 18,
    name: "Mark Chen",
    email: "mark.chen@email.com",
    avatar:
      "https://images.unsplash.com/photo-1519340333755-d6e0b0d7b3b2?w=32&h=32&fit=crop&crop=face",
    department: "HR",
    role: 6,
    status: "pending",
    dateAdded: "03/05/2023 - 09:30 AM",
  },
  {
    id: 19,
    name: "Alicia Nguyen",
    email: "alicia.nguyen@email.com",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=32&h=32&fit=crop&crop=face",
    department: "Legal",
    role: 5,
    status: "inactive",
    dateAdded: "03/10/2023 - 01:10 PM",
  },
  {
    id: 20,
    name: "Ethan Wright",
    email: "ethanwright@email.com",
    avatar:
      "https://images.unsplash.com/photo-1506898665062-cf77b7f1b6c2?w=32&h=32&fit=crop&crop=face",
    department: "Development",
    role: 6,
    status: "active",
    dateAdded: "04/01/2023 - 10:00 AM",
  },
  {
    id: 21,
    name: "Chloe Martin",
    email: "chloe.martin@email.com",
    avatar:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=32&h=32&fit=crop&crop=face",
    department: "Design",
    role: 8,
    status: "pending",
    dateAdded: "04/10/2023 - 12:20 PM",
  },
  {
    id: 22,
    name: "Lucas Green",
    email: "lucas.green@email.com",
    avatar:
      "https://images.unsplash.com/photo-1502767089025-6572583495b0?w=32&h=32&fit=crop&crop=face",
    department: "Development",
    role: 6,
    status: "active",
    dateAdded: "04/15/2023 - 02:30 PM",
  },
  {
    id: 23,
    name: "Nina Patel",
    email: "nina.patel@email.com",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
    department: "Marketing",
    role: 5,
    status: "active",
    dateAdded: "04/20/2023 - 09:15 AM",
  },
  {
    id: 24,
    name: "Jake Foster",
    email: "jake.foster@email.com",
    avatar:
      "https://images.unsplash.com/photo-1546456073-67fbf3c1d94b?w=32&h=32&fit=crop&crop=face",
    department: "Development",
    role: 6,
    status: "inactive",
    dateAdded: "05/01/2023 - 11:00 AM",
  },
];