export const BRANCH_OPTIONS = [
  'Artificial Intelligence & Agentic AI',
  'Artificial Intelligence & Data Engineering',
  'Artificial Intelligence & Machine Learning',
  'Computer Science and Engineering',
  'CSE (AIML)',
  'CSE (Data Science)',
  'CSE (Full Stack)',
  'CSE (Generative AI)',
  'CSE (Quantum Engineering)',
]

export const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E']

export const SKILL_CATEGORIES = [
  'React', 'Node.js', 'Python', 'Machine Learning', 'Data Science',
  'Java', 'C++', 'DSA', 'Web Development', 'AI/ML', 'DevOps',
  'Cloud', 'Blockchain', 'Cybersecurity', 'UI/UX', 'Flutter',
  'Android', 'iOS', 'Quantum Computing', 'Generative AI',
]

export const OPPORTUNITY_TYPES = [
  'Hackathon', 'Workshop', 'Internship', 'Campus Event',
  'Placement', 'Seminar', 'Competition', 'Research',
]

export const CHALLENGE_TYPES = ['Coding', 'Research', 'Design', 'Startup', 'AI']

export const KNOWLEDGE_CATEGORIES = [
  'DBMS', 'React', 'DSA', 'OS', 'AI', 'Placement Prep',
  'Networks', 'Machine Learning', 'System Design',
]

export const REPUTATION_LEVELS = [
  { label: 'Beginner',      min: 0,    max: 100,      color: 'text-gray-400', bg: 'bg-gray-100' },
  { label: 'Contributor',   min: 100,  max: 300,      color: 'text-gray-600', bg: 'bg-gray-200' },
  { label: 'Collaborator',  min: 300,  max: 700,      color: 'text-gray-700', bg: 'bg-gray-200' },
  { label: 'Innovator',     min: 700,  max: 1500,     color: 'text-gray-800', bg: 'bg-gray-300' },
  { label: 'Campus Legend', min: 1500, max: Infinity,  color: 'text-gray-900', bg: 'bg-gray-900' },
]

export const BADGES = [
  { id: 'top_helper', label: 'Top Helper', icon: '🤝', color: 'text-emerald-400' },
  { id: 'challenge_solver', label: 'Challenge Solver', icon: '⚡', color: 'text-yellow-400' },
  { id: 'ai_explorer', label: 'AI Explorer', icon: '🤖', color: 'text-blue-400' },
  { id: 'community_builder', label: 'Community Builder', icon: '🏗️', color: 'text-purple-400' },
  { id: 'startup_thinker', label: 'Startup Thinker', icon: '🚀', color: 'text-red-400' },
  { id: 'hackathon_winner', label: 'Hackathon Winner', icon: '🏆', color: 'text-amber-400' },
]

export const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434'
export const OLLAMA_MODEL = 'llama3'

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/skills', label: 'Skill Directory', icon: 'Users' },
  { path: '/skill-exchange', label: 'Peer Skill Exchange', icon: 'ArrowRightLeft' },
  { path: '/problem-pool', label: 'Problem Pool', icon: 'HelpCircle' },
  { path: '/study-groups', label: 'Study Groups', icon: 'BookOpen' },
  { path: '/messages', label: 'Messages', icon: 'MessageSquare' },
  { path: '/opportunities', label: 'Opportunities', icon: 'Briefcase' },
  { path: '/achievements', label: 'Achievement Wall', icon: 'Trophy' },
  { path: '/projects', label: 'Project Showcase', icon: 'Code2' },
  { path: '/internships', label: 'Internship Reviews', icon: 'Building2' },
  { path: '/project-archive', label: 'Class Archive', icon: 'Archive' },
  { path: '/campus-github', label: 'Campus GitHub', icon: 'Github' },
  { path: '/build-in-public', label: 'Build in Public', icon: 'Rocket' },
  { path: '/ideas', label: 'Startup Ideas', icon: 'Lightbulb' },
  { path: '/challenges', label: 'Challenges', icon: 'Zap' },
  { path: '/knowledge-base', label: 'Knowledge Base', icon: 'BookMarked' },
  { path: '/sos-board', label: 'SOS Board', icon: 'AlertCircle' },
  { path: '/ai-buddy', label: 'AI Study Buddy', icon: 'Bot' },
  { path: '/polls', label: 'Polls', icon: 'BarChart2' },
  { path: '/lost-found', label: 'Lost & Found', icon: 'Search' },
]
