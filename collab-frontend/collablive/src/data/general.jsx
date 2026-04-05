export const ProjectStatus = {
  Ongoing: 1,
  Completed: 2,
  Archived: 3,
  Cancelled: 4,
  Paused: 5,
  NotStarted: 6,
  InReview: 7
};
export const ProjectCategory = {
  INFORMATION_TECHNOLOGY: 1,
  HEALTHCARE: 2,
  EDUCATION: 3,
  FINANCE: 4,
  MANUFACTURING: 5,
  CONSTRUCTION: 6,
  RETAIL: 7,
  TRANSPORTATION: 8,
  ENERGY: 9,
  TELECOMMUNICATIONS: 10,
  AGRICULTURE: 11,
  GOVERNMENT: 12,
  ENTERTAINMENT: 13,
  HOSPITALITY: 14,
  REAL_ESTATE: 15,
  LEGAL: 16,
  NON_PROFIT: 17,
  OTHER: 18
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
  13: { label: "Sales Manager", color: "bg-green-500 text-green-800" },
};

export const STATUS_MAP = {
  1: {
    label: "Active",
    color: "bg-green-100 text-green-800"
  },
  2: {
    label: "Inactive",
    color: "bg-gray-100 text-gray-800"
  },
  3: {
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

export const projectTeam = [
  {
    id: 1,
    name: "Team 1",
    people: [
      {
        id: 1,
        name: "Niraj",
        email: "niraj@gmail.com",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b372?w=32&h=32&fit=crop&crop=face",
        isTeamLeader: true,
        role: "Frontend Developer"
      },
      {
        id: 2,
        name: "Sagar",
        email: "sagar@gmail.com",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
        isTeamLeader: true,
        role: "Backend Developer"
      }
    ],
    project: {
      projectName: "Project 1",
      projectId: 1
    },
    sprint: {
      sprintId: 1,
      sprintName: "Sprint 1",
      duration: "2 weeks",
      description: "Initial development phase focusing on core features and basic UI implementation. Setting up project infrastructure and development environment."
    }
  },
  {
    id: 2,
    name: "Team 2",
    people: [
      {
        id: 3,
        name: "Anjali",
        email: "anjali@gmail.com",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=32&h=32&fit=crop&crop=face",
        isTeamLeader: true,
        role: "Project Manager"
      },
      {
        id: 4,
        name: "Rahul",
        email: "rahul@gmail.com",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
        isTeamLeader: false,
        role: "QA Engineer"
      }
    ],
    project: {
      projectName: "Project 2",
      projectId: 2
    },
    sprint: {
      sprintId: 2,
      sprintName: "Sprint Alpha",
      duration: "3 weeks",
      description: "Alpha release preparation with comprehensive testing, bug fixes, and performance optimization. Integration of all core modules."
    }
  },
  {
    id: 3,
    name: "Team 3",
    people: [
      {
        id: 5,
        name: "Priya",
        email: "priya@gmail.com",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
        isTeamLeader: true,
        role: "UI/UX Designer"
      },
      {
        id: 6,
        name: "Amit",
        email: "amit@gmail.com",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=32&h=32&fit=crop&crop=face",
        isTeamLeader: false,
        role: "Mobile Developer"
      },
      {
        id: 7,
        name: "Meena",
        email: "meena@gmail.com",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=32&h=32&fit=crop&crop=face",
        isTeamLeader: false,
        role: "Business Analyst"
      }
    ],
    project: {
      projectName: "Project 3",
      projectId: 3
    },
    sprint: {
      sprintId: 3,
      sprintName: "Final Sprint",
      duration: "1 week",
      description: "Final polishing, documentation, and deployment preparation. User acceptance testing and production readiness checks."
    }
  }
];



export const departments = [
  {
    id: 1,
    name: "Engineering",
    tagline: "Building the future 🚀",
    backgroundColor: "bg-blue-500/60", // subtle tint
    members: [
      {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        role: "Frontend Developer",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        id: 2,
        name: "Bob",
        email: "bob@example.com",
        role: "Backend Developer",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        id: 3,
        name: "Clara",
        email: "clara@example.com",
        role: "QA Engineer",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      },
    ],
  },
  {
    id: 2,
    name: "Design",
    tagline: "Shaping experiences 🎨",
    backgroundColor: "bg-pink-500/60",
    members: [
      {
        id: 4,
        name: "David",
        email: "david@example.com",
        role: "UI Designer",
        avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      },
      {
        id: 5,
        name: "Emma",
        email: "emma@example.com",
        role: "UX Researcher",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      },
    ],
  },
  {
    id: 3,
    name: "Marketing",
    tagline: "Spreading the word 📢",
    backgroundColor: "bg-green-400/60",
    members: [
      {
        id: 6,
        name: "Frank",
        email: "frank@example.com",
        role: "SEO Specialist",
        avatar: "https://randomuser.me/api/portraits/men/85.jpg",
      },
      {
        id: 7,
        name: "Grace",
        email: "grace@example.com",
        role: "Content Writer",
        avatar: "https://randomuser.me/api/portraits/women/20.jpg",
      },
      {
        id: 8,
        name: "Henry",
        email: "henry@example.com",
        role: "Social Media Manager",
        avatar: "https://randomuser.me/api/portraits/men/23.jpg",
      },
    ],
  },
  {
    id: 4,
    name: "HR",
    tagline: "Caring for our people 💙",
    backgroundColor: "bg-purple-500/60",
    members: [
      {
        id: 9,
        name: "Isabella",
        email: "isabella@example.com",
        role: "HR Manager",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      },
      {
        id: 10,
        name: "Jack",
        email: "jack@example.com",
        role: "Recruiter",
        avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      },
    ],
  },
];



export const projectWithName=[
  {
    "id":1,
    "projectName":"Project 1"
  },
  {
    "id":2,
    "projectName":"Project 2"
  },
  {
    "id":3,
    "projectName":"Project 3"
  }
]


export const teamWithName=[
  {
    "id":1,
    "teamName":"Alpha"
  },
  {
    "id":2,
    "teamName":"Beta"
  },
  {
    "id":3,
    "teamName":"gamma"
  }
]


export const globalSprint = [{
  sprintId: "SPR-101",
  name: "Sprint Alpha",
  goal: "Complete core authentication module and integrate with OAuth providers for seamless login.",
  tagline: "The foundation of user security",
  status: "In Progress",
  assignedTo: [
    { name: "Alice", img: "https://i.pravatar.cc/40?img=1" },
    { name: "Bob", img: "https://i.pravatar.cc/40?img=2" },
  ],
  tickets: 14,
  estimation: "Sep 10, 2025 - Sep 24, 2025",
  overdue: false,
  tags: ["Backend", "Priority-High"],
},
{
  sprintId: "SPR-102",
  name: "Sprint Beta",
  goal: "Build dashboard analytics with charts, metrics, and filters for decision-making.",
  tagline: "Smarter insights, better decisions",
  status: "Pending",
  assignedTo: [
    { name: "Charlie", img: "https://i.pravatar.cc/40?img=3" },
    { name: "Dana", img: "https://i.pravatar.cc/40?img=4" },
  ],
  tickets: 10,
  estimation: "Sep 25, 2025 - Oct 5, 2025",
  overdue: false,
  tags: ["Frontend", "Analytics"],
},
{
  sprintId: "SPR-103",
  name: "Sprint Gamma",
  goal: "Optimize database queries and improve response time by caching frequently accessed records.",
  tagline: "",
  status: "Completed",
  assignedTo: [
    { name: "Eve", img: "https://i.pravatar.cc/40?img=5" },
    { name: "Frank", img: "https://i.pravatar.cc/40?img=6" },
  ],
  tickets: 7,
  estimation: "Aug 20, 2025 - Sep 1, 2025",
  overdue: true,
  tags: ["Database", "Performance"],
},

]

export const UserStatus = {
  Active: "1",
  InActive: "2",
  Pending: "3",
};

export const RoleEnum = {
  Owner: "1",
  Admin: "2",
  Manager: "3",
  Member: "4",
  Viewer: "5",
};

export const Department = {
  Technical: "1",
  Sales: "2",
  Marketing: "3",
  HumanResources: "4",
  Finance: "5",
  Operations: "6",
  CustomerSupport: "7",
  Legal: "8",
  ResearchAndDevelopment: "9",
  IT: "10",
  Administration: "11",
};

export const WorkspacePosition = {
  Admin: "1",
  CEO: "2",
  CTO: "3",
  ProductManager: "4",
  ProjectManager: "5",
  Developer: "6",
  Tester: "7",
  Designer: "8",
  BusinessAnalyst: "9",
  DevOps: "10",
  Support: "11",
  Guest: "12",
  SalesManager: "13",
};


export const DepartmentPositions = {
  [Department.Technical]: [
    WorkspacePosition.CTO,
    WorkspacePosition.Developer,
    WorkspacePosition.Tester,
    WorkspacePosition.DevOps,
  ],
  [Department.Sales]: [
    WorkspacePosition.SalesManager,
  ],
  [Department.Marketing]: [
    WorkspacePosition.BusinessAnalyst,
    WorkspacePosition.Designer,
  ],
  [Department.HumanResources]: [
    WorkspacePosition.Admin,
  ],
  [Department.Finance]: [
    WorkspacePosition.Admin,
  ],
  [Department.Operations]: [
    WorkspacePosition.ProjectManager,
  ],
  [Department.CustomerSupport]: [
    WorkspacePosition.Support,
  ],
  [Department.IT]: [
    WorkspacePosition.CTO,
    WorkspacePosition.DevOps,
    WorkspacePosition.Developer,
  ],
  [Department.ResearchAndDevelopment]: [
    WorkspacePosition.ProductManager,
    WorkspacePosition.Developer,
  ],
  [Department.Administration]: [
    WorkspacePosition.Admin,
  ],
};

export const WorkspacePositionLabels = {
  [WorkspacePosition.Admin]: "Admin",
  [WorkspacePosition.CEO]: "CEO",
  [WorkspacePosition.CTO]: "CTO",
  [WorkspacePosition.ProductManager]: "Product Manager",
  [WorkspacePosition.ProjectManager]: "Project Manager",
  [WorkspacePosition.Developer]: "Developer",
  [WorkspacePosition.Tester]: "Tester",
  [WorkspacePosition.Designer]: "Designer",
  [WorkspacePosition.BusinessAnalyst]: "Business Analyst",
  [WorkspacePosition.DevOps]: "DevOps",
  [WorkspacePosition.Support]: "Support",
  [WorkspacePosition.Guest]: "Guest",
  [WorkspacePosition.SalesManager]: "Sales Manager",
};




// const [tasks, setTasks] = useState([//   {
  //     id: 1,
  //     name: 'Employee Details page',
  //     description: 'Create a page where there is information about employees',
  //     type: 'Dashboard',
  //     priority: 'Medium',
  //     status: 'todo',
  //     assignees: ['AL', 'DT'],
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     timeline: { start: 'Thu 13', end: 'Fri 14' },
  //     project: 'HR System',
  //     tags:["Management","UI"],  
  //     sprint: 'Sprint 1',
  //     comments: 3,
  //     attachments: 2
  //   },
  //   {
  //     id: 2,
  //     name: 'Darkmode version',
  //     description: 'Darkmode version for all screens',
  //     type: 'Mobile app',
  //     priority: 'Low',
  //     status: 'todo',
  //     assignees: ['AL', 'DT'],
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     timeline: { start: 'Tue 11', end: 'Wed 12' },
  //     project: 'Mobile App',
  //     tags:["Management","UI"],  
  //     sprint: 'Sprint 1',
  //     comments: 2,
  //     attachments: 1
  //   },
  //   {
  //     id: 3,
  //     name: 'Super Admin Role',
  //     description: 'Create super admin functionality with advanced permissions',
  //     type: 'Dashboard',
  //     priority: 'Medium',
  //     status: 'todo',
  //     assignees: ['AL', 'DT'],
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     timeline: { start: 'Sun 16', end: 'Mon 17' },
  //     tags:["Management","UI"],  
  //     project: 'Admin Panel',
  //     sprint: 'Sprint 2',
  //     comments: 1,
  //     attachments: 0
  //   },
  //   {
  //     id: 4,
  //     name: 'Super Admin Role Implementation',
  //     description: 'Implementation of admin role features',
  //     type: 'Dashboard',
  //     priority: 'High',
  //     status: 'progress',
  //     assignees: ['DT'],
  //     tags:["Management","UI"],  
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     project: 'Admin Panel',
  //     sprint: 'Sprint 1',
  //     comments: 5,
  //     attachments: 3
  //   },
  //   {
  //     id: 5,
  //     name: 'Settings page',
  //     description: 'User settings and preferences page',
  //     type: 'Mobile app',
  //     priority: 'Medium',
  //     status: 'progress',
  //     tags:["Management","UI"],  

  //     assignees: ['AL', 'DT'],
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     project: 'Mobile App',
  //     sprint: 'Sprint 1',
  //     comments: 2,
  //     attachments: 1
  //   },
  //   {
  //     id: 6,
  //     name: 'KPI and Employee Statistics',
  //     description: 'Create a design that displays KPIs and employee statistics',
  //     type: 'Dashboard',
  //     priority: 'Low',
  //     status: 'progress',
  //     assignees: ['DT'],
  //     tags:["Management","UI"],  

  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     timeline: { start: 'Thu 13', end: 'Sat 15' },
  //     project: 'Analytics',
  //     sprint: 'Sprint 2',
  //     comments: 4,
  //     attachments: 2
  //   },
  //   {
  //     id: 7,
  //     name: 'Customer Role Management',
  //     description: 'Implement customer role permissions',
  //     type: 'Dashboard',
  //     priority: 'Medium',
  //     status: 'review',
  //     assignees: ['AL'],
  //     tags:["Management","UI"],  
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     project: 'Admin Panel',
  //     sprint: 'Sprint 1',
  //     comments: 2,
  //     attachments: 1
  //   },
  //   {
  //     id: 8,
  //     name: 'Design system & Style guide',
  //     description: 'Create comprehensive design system',
  //     type: 'Design',
  //     priority: 'High',
  //     status: 'review',
  //     assignees: ['DT', 'AL'],
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     project: 'Design System',
  //     tags:["Management","UI"],  
  //     sprint: 'Sprint 2',
  //     comments: 8,
  //     attachments: 5
  //   },
  //   {
  //     id: 9,
  //     name: 'Mobile App Optimization',
  //     description: 'Performance optimization for mobile app',
  //     type: 'Mobile app',
  //     priority: 'High',
  //     status: 'completed',
  //     assignees: ['DT'],
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     project: 'Mobile App',
  //     tags:["Management","UI"],  
  //     sprint: 'Sprint 1',
  //     comments: 6,
  //     attachments: 3
  //   },
  //   {
  //     id: 10,
  //     name: 'User Authentication System',
  //     description: 'Complete authentication flow implementation',
  //     type: 'Dashboard',
  //     priority: 'High',
  //     status: 'completed',
  //     assignees: ['AL', 'DT'],
  //     tags:["Management","UI"],  
  //     estimation: 'Feb 14, 2024 - Feb 1, 2024',
  //     project: 'Auth System',
  //     sprint: 'Sprint 1',
  //     comments: 10,
  //     attachments: 4
  //   }
  // ]);


 export const mapTicketDetail = (apiTicket) => {
  if (!apiTicket) return null;

  return {
    ...apiTicket,
    tags: typeof apiTicket.tags === "string"
      ? apiTicket.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],

    comments: Array.isArray(apiTicket.comments)
      ? apiTicket.comments.map((comment) => ({
          ...comment,
          id: comment.id,
          text: comment.commentText ?? "",
          authorName: comment.authorName ?? "Unknown",
          authorAvatarUrl: comment.authorAvatarUrl ?? null,
          createdAt: comment.createdAt ?? null,
          createdAtInString: comment.createdAtInString ?? "",
          attachments: comment.attachments ?? [],
          media: comment.media ?? null,
          isCurrentUser: Boolean(comment.isCurrentUser),
        }))
      : [],
  };
};