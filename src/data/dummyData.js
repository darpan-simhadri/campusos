export const dummyUsers = [
  {
    id: "U001",
    fullName: "Aryan Sharma",
    registrationNumber: "23BCE1001",
    email: "aryan@example.com",
    branch: "Computer Science and Engineering",
    section: "A",
    role: "student",
    status: "active",
    skills: ["React", "Node.js"],
    reportsCount: 0,
    joinedAt: "2023-08-15"
  },
  {
    id: "U002",
    fullName: "Neha Reddy",
    registrationNumber: "23BCE1042",
    email: "neha@example.com",
    branch: "Artificial Intelligence & Machine Learning",
    section: "B",
    role: "moderator",
    status: "active",
    skills: ["Python", "TensorFlow"],
    reportsCount: 0,
    joinedAt: "2023-08-16"
  },
  {
    id: "U003",
    fullName: "Karan Verma",
    registrationNumber: "23BCE1105",
    email: "karan@example.com",
    branch: "CSE (Data Science)",
    section: "C",
    role: "student",
    status: "suspended",
    skills: ["SQL", "PowerBI"],
    reportsCount: 3,
    joinedAt: "2023-08-20"
  },
  {
    id: "U004",
    fullName: "Priya Patel",
    registrationNumber: "23BCE1200",
    email: "priya@example.com",
    branch: "CSE (Full Stack)",
    section: "A",
    role: "student",
    status: "active",
    skills: ["Next.js", "Tailwind"],
    reportsCount: 0,
    joinedAt: "2023-09-01"
  },
  {
    id: "U005",
    fullName: "Rohan Iyer",
    registrationNumber: "23BCE1333",
    email: "rohan@example.com",
    branch: "Artificial Intelligence & Agentic AI",
    section: "D",
    role: "student",
    status: "active",
    skills: ["LangChain", "OpenAI"],
    reportsCount: 1,
    joinedAt: "2023-09-10"
  }
];

export const dummyReports = [
  {
    id: "R001",
    reportedBy: "U001",
    reportedUser: "U003",
    reason: "Inappropriate language in Problem Pool",
    contentSnippet: "This assignment is stupid and you are all...",
    status: "pending",
    date: "2023-10-12"
  },
  {
    id: "R002",
    reportedBy: "U002",
    reportedUser: "U005",
    reason: "Fake achievement claim",
    contentSnippet: "Claimed 1st place in Smart India Hackathon without proof.",
    status: "reviewed",
    date: "2023-10-14"
  },
  {
    id: "R003",
    reportedBy: "U004",
    reportedUser: "U003",
    reason: "Spamming SOS board",
    contentSnippet: "HELP HELP HELP HELP (posted 5 times)",
    status: "pending",
    date: "2023-10-15"
  },
  {
    id: "R004",
    reportedBy: "U001",
    reportedUser: "U003",
    reason: "Harassment in Direct Messages",
    contentSnippet: "Check attached screenshot.",
    status: "resolved",
    date: "2023-10-16"
  },
  {
    id: "R005",
    reportedBy: "U005",
    reportedUser: "U001",
    reason: "Irrelevant Opportunity Posting",
    contentSnippet: "Posted a referral link for a crypto scam.",
    status: "pending",
    date: "2023-10-18"
  }
];

export const dummyOpportunities = [
  {
    id: "O001",
    title: "Google STEP Internship 2024",
    type: "internship",
    postedBy: "admin",
    deadline: "2023-11-30",
    status: "active",
    applicationsCount: 142
  },
  {
    id: "O002",
    title: "Campus Hackathon: CodeFest 3.0",
    type: "hackathon",
    postedBy: "moderator",
    deadline: "2023-10-25",
    status: "active",
    applicationsCount: 85
  },
  {
    id: "O003",
    title: "TCS Digital On-Campus Drive",
    type: "placements",
    postedBy: "admin",
    deadline: "2023-10-20",
    status: "expired",
    applicationsCount: 320
  },
  {
    id: "O004",
    title: "Intro to Quantum Computing Seminar",
    type: "seminars",
    postedBy: "admin",
    deadline: "2023-11-05",
    status: "active",
    applicationsCount: 45
  },
  {
    id: "O005",
    title: "Microsoft Learn Student Ambassador",
    type: "internship",
    postedBy: "moderator",
    deadline: "2023-12-01",
    status: "active",
    applicationsCount: 67
  }
];

export const dummyChallenges = [
  {
    id: "C001",
    title: "Build a Custom React Renderer",
    difficulty: "Extreme",
    status: "active",
    solvers: 0,
    reputationPoints: 500
  },
  {
    id: "C002",
    title: "Optimize API latency under 10ms",
    difficulty: "Hard",
    status: "active",
    solvers: 2,
    reputationPoints: 300
  },
  {
    id: "C003",
    title: "Implement a Red-Black Tree in C",
    difficulty: "Medium",
    status: "solved",
    solvers: 15,
    reputationPoints: 100
  },
  {
    id: "C004",
    title: "Design a Campus Navigation App UX",
    difficulty: "Hard",
    status: "active",
    solvers: 1,
    reputationPoints: 250
  },
  {
    id: "C005",
    title: "Fine-tune Ollama for College Syllabus",
    difficulty: "Extreme",
    status: "active",
    solvers: 0,
    reputationPoints: 1000
  }
];

export const dummyAnalytics = {
  totalUsers: 1420,
  activeUsersToday: 845,
  totalMessages: 12450,
  aiQueries: 3200,
  topSkills: ["React", "Python", "Figma", "Node.js", "C++"],
  reportsPending: 3,
  opportunitiesActive: 12
};
