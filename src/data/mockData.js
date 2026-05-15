export const currentUser = {
  name: 'SATHVIKA R',
  username: '@sathvikar',
  pies: 115,
  streak: 0,
  xp: 0,
  level: 1,
  avatar: null,
  avatarColor: '#C8F135',
  daysConsistent: 0,
}

export const specializations = ['CSE', 'AIML', 'Agentic AI', 'Gen AI', 'AIDA', 'AIDS', 'Quantum']

export const specColors = {
  'CSE':        '#00D4C8',
  'AIML':       '#C8F135',
  'Agentic AI': '#E040FB',
  'Gen AI':     '#FF6B00',
  'AIDA':       '#4CAF50',
  'AIDS':       '#FF4444',
  'Quantum':    '#8B5CF6',
}

export const onlineFriends = [
  { id: 1, name: 'YOU',         isCurrentUser: true,  hasLive: true },
  { id: 2, name: 'MATHLETE8',   username: 'mathlete8',    avatarColor: '#666',    isOnline: true },
  { id: 3, name: 'PAYALTAGA',   username: 'payaltagare',  avatarLetter: 'P', avatarColor: '#E040FB', isOnline: true },
  { id: 4, name: 'VIGHNUU',     username: 'vighnuu',      avatarLetter: 'V', avatarColor: '#E040FB', isOnline: true },
  { id: 5, name: 'ONLYWITHS',   username: 'onlywithsid',  avatarLetter: 'O', avatarColor: '#888',    isOnline: true },
  { id: 6, name: 'SHARADKU',    username: 'sharadkumar',  avatarLetter: 'S', avatarColor: '#D4A0A0', isOnline: true },
  { id: 7, name: 'ANALYST_A',   username: 'analyst_a',    avatarLetter: 'a', avatarColor: '#E040FB', isOnline: true },
]

export const duelCategories = [
  { id: 'collab', label: 'COLLAB', icon: '⚙️', color: '#C8F135', rating: 1099 },
  { id: 'build',  label: 'BUILD',  icon: '🔧', color: '#00D4C8', rating: 997  },
  { id: 'design', label: 'DESIGN', icon: '🎨', color: '#4CAF50', rating: 981  },
  { id: 'debug',  label: 'DEBUG',  icon: '🐛', color: '#E040FB', rating: 1000 },
]

export const featuredChallenges = [
  {
    id: 1,
    category: 'COLLAB', categoryColor: '#C8F135',
    title: 'SPRINT\nCOLLAB',
    subtitle: 'FIND A TEAMMATE IN UNDER 1 MINUTE',
    hasLive: true, emoji: '🤝',
  },
  {
    id: 2,
    category: 'DESIGN', categoryColor: '#4CAF50',
    title: 'CROSS-SPEC\nDUELS',
    subtitle: 'OUTBUILD YOUR RIVAL, FILL THE BOARD.',
    hasLive: true, emoji: '⚔️',
  },
  {
    id: 3,
    category: 'BUILD',  categoryColor: '#00D4C8',
    title: 'MIND SNAP\nCHALLENGE',
    subtitle: 'WHO CAN SHIP FASTER?',
    emoji: '🚀',
  },
]

export const dailyChallenges = {
  completed: 0,
  total: 6,
  timeLeft: '08:37',
  challenges: [
    { id: 1, icon: '🔗', label: 'Spec Match'    },
    { id: 2, icon: '📦', label: 'Project Post'  },
    { id: 3, icon: '🤝', label: 'Teammate Find' },
    { id: 4, icon: '🔍', label: 'Review PR'     },
    { id: 5, icon: '📣', label: 'Daily Standup' },
    { id: 6, icon: '🔥', label: 'Streak'        },
  ],
}

export const questDetails = [
  { id: 1, icon: '🔗', label: 'SPEC MATCH',    desc: 'Match with 1 student from a different spec',   xp: 50  },
  { id: 2, icon: '📦', label: 'PROJECT POST',  desc: 'Post a project update in Build in Public',      xp: 40  },
  { id: 3, icon: '🤝', label: 'TEAMMATE FIND', desc: 'Send a collab request to someone new',          xp: 30  },
  { id: 4, icon: '🔍', label: 'REVIEW PR',     desc: "Leave feedback on a peer's code",               xp: 60  },
  { id: 5, icon: '📣', label: 'DAILY STANDUP', desc: 'Post your daily standup update',                xp: 20  },
  { id: 6, icon: '🔥', label: 'STREAK',        desc: 'Complete at least 3 quests today',              xp: 100 },
]

export const divisions = [
  { id: 'open', label: 'OPEN\nDIVISION',  locked: false, tier: 'open', icon: '🏟️' },
  { id: 'div3', label: 'DIV3\nDIVISION',  locked: false, tier: 'div3', icon: '🏅' },
  { id: 'div1', label: 'DIV1\nDIVISION',  locked: true,  tier: 'div1', icon: '🥇' },
  { id: 'div2', label: 'DIV2\nDIVISION',  locked: true,  tier: 'div2', icon: '🥈' },
]

export const leaderboardWinners = [
  { rank: 1, name: 'ARJUN MEHTA',   username: '@arjunm',      score: 12, time: '00:25.536', spec: 'AIML'   },
  { rank: 2, name: 'PRIYA SHARMA',  username: '@priyasharma', score: 12, time: '00:27.696', spec: 'CSE'    },
  { rank: 3, name: 'KARTHIK RAO',   username: '@karthikrao',  score: 12, time: '00:27.888', spec: 'Gen AI' },
]

export const feedPosts = [
  {
    id: 1,
    author: 'CampusOS',
    authorVerified: true,
    time: '2 mins ago',
    type: 'leaderboard',
    title: 'DAILY COLLAB WINNERS',
    subtitle: 'MATCH: CSE vs AIML',
    winners: leaderboardWinners,
  },
  {
    id: 2,
    author: 'CampusOS',
    authorVerified: true,
    time: '1 hour ago',
    type: 'announcement',
    content: '🚀 New feature dropped: Build in Public feed is now live! Share your progress, get feedback, and collab with peers.',
  },
]

export const storeItems = [
  {
    id: 1,
    name: 'SQUAD SHIELD',
    icon: '🛡️', iconColor: '#00BCD4',
    desc: 'Protect your squad rank if you miss a day. Equip up to 2 at once.',
    status: '0/2 EQUIPPED',
    price: 200,
  },
  {
    id: 2,
    name: '2X XP BOOSTER',
    icon: '🚀', iconColor: '#C8F135',
    desc: 'You have a 2x XP Booster available.',
    price: 50,
    owned: true,
  },
  {
    id: 3,
    name: 'STREAK FREEZE',
    icon: '❄️', iconColor: '#00D4C8',
    desc: 'Save your streak for one missed day. One-time use.',
    price: 100,
  },
]
