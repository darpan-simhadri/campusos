import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
  increment, setDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'

// ─── Generic Helpers ─────────────────────────────────────────────────────────

export const addDocument = (col, data) =>
  addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() })

export const updateDocument = (col, id, data) =>
  updateDoc(doc(db, col, id), data)

export const deleteDocument = (col, id) =>
  deleteDoc(doc(db, col, id))

export const getDocument = async (col, id) => {
  const snap = await getDoc(doc(db, col, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const updateUserProfile = (uid, data) =>
  updateDoc(doc(db, 'users', uid), data)

export const getAllUsers = async (filters = {}) => {
  let q = collection(db, 'users')
  const constraints = []
  if (filters.branch) constraints.push(where('branch', '==', filters.branch))
  if (filters.section) constraints.push(where('section', '==', filters.section))
  if (filters.collaborationAvailable) constraints.push(where('collaborationAvailable', '==', true))
  const snap = await getDocs(constraints.length ? query(q, ...constraints) : q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── Posts / Problem Pool ──────────────────────────────────────────────────────

export const createPost = (data) => addDocument('posts', data)

export const subscribeToposts = (callback, filters = {}) => {
  const constraints = [orderBy('createdAt', 'desc'), limit(50)]
  if (filters.tags) constraints.unshift(where('tags', 'array-contains', filters.tags))
  const q = query(collection(db, 'posts'), ...constraints)
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const upvotePost = (postId, uid) =>
  updateDoc(doc(db, 'posts', postId), { upvotes: arrayUnion(uid) })

export const removeUpvote = (postId, uid) =>
  updateDoc(doc(db, 'posts', postId), { upvotes: arrayRemove(uid) })

export const markSolved = (postId) =>
  updateDoc(doc(db, 'posts', postId), { solved: true })

// ─── Comments ─────────────────────────────────────────────────────────────────

export const addComment = (postId, data) =>
  addDocument(`posts/${postId}/comments`, data)

export const subscribeToComments = (postId, callback) => {
  const q = query(
    collection(db, `posts/${postId}/comments`),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const getChatId = (uid1, uid2) =>
  [uid1, uid2].sort().join('_')

export const sendMessage = (chatId, data) =>
  addDocument(`messages/${chatId}/chats`, data)

export const subscribeToMessages = (chatId, callback) => {
  const q = query(
    collection(db, `messages/${chatId}/chats`),
    orderBy('createdAt', 'asc'),
    limit(100)
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const subscribeToConversations = (uid, callback) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const createOrGetConversation = async (uid1, uid2) => {
  const chatId = getChatId(uid1, uid2)
  const ref = doc(db, 'conversations', chatId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [uid1, uid2],
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
    })
  }
  return chatId
}

// ─── Study Groups ─────────────────────────────────────────────────────────────

export const createStudyGroup = (data) => addDocument('studyGroups', data)

export const subscribeToStudyGroups = (callback) => {
  const q = query(collection(db, 'studyGroups'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const joinStudyGroup = (groupId, uid) =>
  updateDoc(doc(db, 'studyGroups', groupId), { members: arrayUnion(uid) })

export const leaveStudyGroup = (groupId, uid) =>
  updateDoc(doc(db, 'studyGroups', groupId), { members: arrayRemove(uid) })

// ─── Opportunities ────────────────────────────────────────────────────────────

export const createOpportunity = (data) => addDocument('opportunities', data)

export const subscribeToOpportunities = (callback, filters = {}) => {
  const constraints = [orderBy('createdAt', 'desc')]
  if (filters.type) constraints.unshift(where('type', '==', filters.type))
  const q = query(collection(db, 'opportunities'), ...constraints)
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const saveOpportunity = (oppId, uid, isSaved) =>
  updateDoc(doc(db, 'opportunities', oppId), { savedBy: isSaved ? arrayRemove(uid) : arrayUnion(uid) })

// ─── Achievements ─────────────────────────────────────────────────────────────

export const createAchievement = (data) => addDocument('achievements', data)

export const subscribeToAchievements = (callback) => {
  const q = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const likeAchievement = (achId, uid, hasLiked) =>
  updateDoc(doc(db, 'achievements', achId), { likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid) })

// ─── Projects ─────────────────────────────────────────────────────────────────

export const createProject = (data) => addDocument('projects', data)

export const subscribeToProjects = (callback) => {
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const likeProject = (projId, uid, hasLiked) =>
  updateDoc(doc(db, 'projects', projId), { likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid) })

// ─── Polls ────────────────────────────────────────────────────────────────────

export const createPoll = (data) => addDocument('polls', data)

export const subscribeToPolls = (callback) => {
  const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const votePoll = async (pollId, optionIndex, uid) => {
  const pollRef = doc(db, 'polls', pollId)
  const snap = await getDoc(pollRef)
  if (!snap.exists()) return
  const data = snap.data()
  const options = [...data.options]

  options.forEach((opt, i) => {
    if (opt.voters?.includes(uid)) {
      options[i] = { ...opt, votes: opt.votes - 1, voters: opt.voters.filter(v => v !== uid) }
    }
  })
  options[optionIndex] = {
    ...options[optionIndex],
    votes: (options[optionIndex].votes || 0) + 1,
    voters: [...(options[optionIndex].voters || []), uid],
  }
  await updateDoc(pollRef, { options })
}

// ─── Lost & Found ─────────────────────────────────────────────────────────────

export const createLostItem = (data) => addDocument('lostFound', data)

export const subscribeToLostFound = (callback) => {
  const q = query(collection(db, 'lostFound'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const markItemFound = (itemId) =>
  updateDoc(doc(db, 'lostFound', itemId), { status: 'found' })

// ─── Challenges ───────────────────────────────────────────────────────────────

export const createChallenge = (data) => addDocument('challenges', data)

export const subscribeToChallenges = (callback) => {
  const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const subscribeToNotifications = (uid, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const markNotificationRead = (notifId) =>
  updateDoc(doc(db, 'notifications', notifId), { read: true })

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportContent = (data) => addDocument('reports', data)

// ─── SOS Board ────────────────────────────────────────────────────────────────
export const createSOSPost = (data) => addDocument('sosPosts', data)

export const subscribeToSOSPosts = (callback) => {
  const q = query(collection(db, 'sosPosts'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const claimSOSPost = (postId, helperId, helperName) =>
  updateDoc(doc(db, 'sosPosts', postId), { helperId, helperName, status: 'claimed' })

export const resolveSOSPost = (postId) =>
  updateDoc(doc(db, 'sosPosts', postId), { resolved: true, status: 'resolved' })

// ─── Peer Skill Exchange ──────────────────────────────────────────────────────
export const createSkillExchange = (data) => addDocument('skillExchanges', data)

export const subscribeToSkillExchanges = (callback) => {
  const q = query(collection(db, 'skillExchanges'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── Idea Validation ────────────────────────────────────────────────────────────
export const createIdea = (data) => addDocument('ideas', data)

export const subscribeToIdeas = (callback) => {
  const q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const upvoteIdea = (ideaId, uid) =>
  updateDoc(doc(db, 'ideas', ideaId), { upvotes: arrayUnion(uid) })

export const removeIdeaUpvote = (ideaId, uid) =>
  updateDoc(doc(db, 'ideas', ideaId), { upvotes: arrayRemove(uid) })

export const updateIdeaAIAnalysis = (ideaId, analysis) =>
  updateDoc(doc(db, 'ideas', ideaId), { aiAnalysis: analysis })

// ─── Build in Public ──────────────────────────────────────────────────────────
export const createBuildUpdate = (data) => addDocument('buildUpdates', data)

export const subscribeToBuildUpdates = (callback) => {
  const q = query(collection(db, 'buildUpdates'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── Permanent Knowledge Base ───────────────────────────────────────────────────
export const createKnowledgeResource = (data) => addDocument('knowledgeBase', data)

export const subscribeToKnowledgeBase = (callback, category = null) => {
  const constraints = [orderBy('createdAt', 'desc')]
  if (category) constraints.unshift(where('category', '==', category))
  const q = query(collection(db, 'knowledgeBase'), ...constraints)
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── Class Project Resurrection ───────────────────────────────────────────────
export const createArchivedProject = (data) => addDocument('projectArchive', data)

export const subscribeToArchivedProjects = (callback, course = null) => {
  const constraints = [orderBy('createdAt', 'desc')]
  if (course) constraints.unshift(where('course', '==', course))
  const q = query(collection(db, 'projectArchive'), ...constraints)
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── College's GitHub ─────────────────────────────────────────────────────────
export const createRepository = (data) => addDocument('repositories', data)

export const subscribeToRepositories = (callback) => {
  const q = query(collection(db, 'repositories'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── Internship Reality Check ───────────────────────────────────────────────────
export const createInternshipReview = (data) => addDocument('internshipReviews', data)

export const subscribeToInternshipReviews = (callback, company = null) => {
  const constraints = [orderBy('createdAt', 'desc')]
  if (company) constraints.unshift(where('company', '==', company))
  const q = query(collection(db, 'internshipReviews'), ...constraints)
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAllUsersAdmin = async () => {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const suspendUser = (uid) =>
  updateDoc(doc(db, 'users', uid), { suspended: true })

export const unsuspendUser = (uid) =>
  updateDoc(doc(db, 'users', uid), { suspended: false })

export const seedDummyData = async () => {
  // ── 20 realistic students ──────────────────────────────────────────────────
  const dummyUsers = [
    { id: 'dummy_u01', fullName: 'Arjun Sharma', email: 'arjun@example.com', registrationNumber: 'REG2024001', branch: 'Computer Science and Engineering', section: 'A', role: 'student', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'], bio: 'Full stack dev. Love building scalable web apps.', reputation: 450, collaborationAvailable: true, githubLink: 'github.com/arjun-sharma' },
    { id: 'dummy_u02', fullName: 'Priya Patel', email: 'priya@example.com', registrationNumber: 'REG2024002', branch: 'Artificial Intelligence & Machine Learning', section: 'B', role: 'student', skills: ['Python', 'TensorFlow', 'Machine Learning', 'Data Science'], bio: 'ML researcher working on computer vision systems.', reputation: 820, collaborationAvailable: true, githubLink: 'github.com/priya-ml' },
    { id: 'dummy_u03', fullName: 'Rohit Kumar', email: 'rohit@example.com', registrationNumber: 'REG2024003', branch: 'CSE (AIML)', section: 'C', role: 'student', skills: ['DSA', 'C++', 'Java', 'Competitive Programming'], bio: 'Competitive programmer | 5* CodeChef | Knight Codeforces', reputation: 1200, collaborationAvailable: false, githubLink: 'github.com/rohit-cp' },
    { id: 'dummy_u04', fullName: 'Ananya Singh', email: 'ananya@example.com', registrationNumber: 'REG2024004', branch: 'Artificial Intelligence & Data Engineering', section: 'A', role: 'moderator', skills: ['SQL', 'Power BI', 'Python', 'Apache Spark'], bio: 'Data engineer passionate about building pipelines at scale.', reputation: 680, collaborationAvailable: true, githubLink: 'github.com/ananya-data' },
    { id: 'dummy_u05', fullName: 'Vikram Reddy', email: 'vikram@example.com', registrationNumber: 'REG2024005', branch: 'CSE (Full Stack)', section: 'D', role: 'student', skills: ['React', 'Vue.js', 'Express', 'PostgreSQL', 'Docker'], bio: 'Building things that matter. Open source contributor.', reputation: 560, collaborationAvailable: true, githubLink: 'github.com/vikram-dev' },
    { id: 'dummy_u06', fullName: 'Shreya Nair', email: 'shreya@example.com', registrationNumber: 'REG2024006', branch: 'Artificial Intelligence & Agentic AI', section: 'B', role: 'student', skills: ['LangChain', 'Python', 'AutoGPT', 'RAG', 'Vector Databases'], bio: 'Building autonomous AI agents for the education sector.', reputation: 720, collaborationAvailable: true, githubLink: 'github.com/shreya-agents' },
    { id: 'dummy_u07', fullName: 'Aditya Verma', email: 'aditya@example.com', registrationNumber: 'REG2024007', branch: 'CSE (Generative AI)', section: 'C', role: 'student', skills: ['Stable Diffusion', 'Python', 'Generative AI', 'PyTorch'], bio: 'Generative AI artist and researcher. Creating the future.', reputation: 390, collaborationAvailable: false, githubLink: 'github.com/adi-genai' },
    { id: 'dummy_u08', fullName: 'Neha Gupta', email: 'neha@example.com', registrationNumber: 'REG2024008', branch: 'CSE (Data Science)', section: 'E', role: 'student', skills: ['Pandas', 'Scikit-learn', 'R', 'Tableau', 'Machine Learning'], bio: 'Data storyteller. Making data beautiful and meaningful.', reputation: 510, collaborationAvailable: true, githubLink: 'github.com/neha-ds' },
    { id: 'dummy_u09', fullName: 'Karthik Iyer', email: 'karthik@example.com', registrationNumber: 'REG2024009', branch: 'Computer Science and Engineering', section: 'A', role: 'student', skills: ['C++', 'DSA', 'System Design', 'Go', 'Rust'], bio: 'Systems programmer. Love low-level performance engineering.', reputation: 1580, collaborationAvailable: false, githubLink: 'github.com/karthik-sys' },
    { id: 'dummy_u10', fullName: 'Divya Krishnan', email: 'divya@example.com', registrationNumber: 'REG2024010', branch: 'CSE (Quantum Engineering)', section: 'B', role: 'student', skills: ['Qiskit', 'Python', 'Quantum Computing', 'Linear Algebra'], bio: 'Quantum computing enthusiast exploring the quantum realm.', reputation: 340, collaborationAvailable: true, githubLink: 'github.com/divya-quantum' },
    { id: 'dummy_u11', fullName: 'Rahul Bansal', email: 'rahul@example.com', registrationNumber: 'REG2024011', branch: 'CSE (Full Stack)', section: 'D', role: 'student', skills: ['Next.js', 'TypeScript', 'Docker', 'Kubernetes', 'React'], bio: 'DevOps meets Full Stack. Cloud-native applications.', reputation: 670, collaborationAvailable: true, githubLink: 'github.com/rahul-cloud' },
    { id: 'dummy_u12', fullName: 'Ishaan Malhotra', email: 'ishaan@example.com', registrationNumber: 'REG2024012', branch: 'Artificial Intelligence & Machine Learning', section: 'C', role: 'student', skills: ['Computer Vision', 'OpenCV', 'PyTorch', 'Python', 'YOLO'], bio: 'Teaching machines to see. Computer vision researcher.', reputation: 880, collaborationAvailable: true, githubLink: 'github.com/ishaan-cv' },
    { id: 'dummy_u13', fullName: 'Meera Joshi', email: 'meera@example.com', registrationNumber: 'REG2024013', branch: 'CSE (AIML)', section: 'E', role: 'student', skills: ['NLP', 'BERT', 'Transformers', 'Python', 'Hugging Face'], bio: 'NLP researcher. Making machines understand human language.', reputation: 760, collaborationAvailable: false, githubLink: 'github.com/meera-nlp' },
    { id: 'dummy_u14', fullName: 'Saurabh Rao', email: 'saurabh@example.com', registrationNumber: 'REG2024014', branch: 'Computer Science and Engineering', section: 'B', role: 'student', skills: ['Rust', 'Systems Programming', 'Linux', 'C', 'WebAssembly'], bio: 'Open source Rust contributor. Systems at heart.', reputation: 920, collaborationAvailable: true, githubLink: 'github.com/saurabh-rust' },
    { id: 'dummy_u15', fullName: 'Tanvi Agarwal', email: 'tanvi@example.com', registrationNumber: 'REG2024015', branch: 'CSE (Data Science)', section: 'A', role: 'student', skills: ['Tableau', 'Apache Spark', 'Hadoop', 'SQL', 'Python'], bio: 'Big data enthusiast. Turning petabytes into insights.', reputation: 430, collaborationAvailable: true, githubLink: 'github.com/tanvi-bigdata' },
    { id: 'dummy_u16', fullName: 'Dev Bhatia', email: 'dev@example.com', registrationNumber: 'REG2024016', branch: 'Artificial Intelligence & Agentic AI', section: 'D', role: 'student', skills: ['RAG', 'Vector Databases', 'FastAPI', 'Python', 'LangChain'], bio: 'Building production RAG systems for enterprise AI.', reputation: 610, collaborationAvailable: true, githubLink: 'github.com/dev-rag' },
    { id: 'dummy_u17', fullName: 'Sneha Mehta', email: 'sneha@example.com', registrationNumber: 'REG2024017', branch: 'CSE (Generative AI)', section: 'B', role: 'student', skills: ['LoRA Fine-tuning', 'Python', 'Diffusion Models', 'ComfyUI'], bio: 'Fine-tuning LLMs and diffusion models for creative AI art.', reputation: 280, collaborationAvailable: false, githubLink: 'github.com/sneha-genai' },
    { id: 'dummy_u18', fullName: 'Aryan Saxena', email: 'aryan@example.com', registrationNumber: 'REG2024018', branch: 'CSE (Quantum Engineering)', section: 'C', role: 'student', skills: ['Quantum Algorithms', 'Cirq', 'Python', 'Linear Algebra', 'Qiskit'], bio: 'Working on quantum error correction and Grover\'s algorithm.', reputation: 390, collaborationAvailable: true, githubLink: 'github.com/aryan-quantum' },
    { id: 'dummy_u19', fullName: 'Pooja Chandra', email: 'pooja@example.com', registrationNumber: 'REG2024019', branch: 'Computer Science and Engineering', section: 'E', role: 'student', skills: ['Android', 'Kotlin', 'Firebase', 'Jetpack Compose', 'Flutter'], bio: 'Android developer building campus productivity tools.', reputation: 520, collaborationAvailable: true, githubLink: 'github.com/pooja-android' },
    { id: 'dummy_u20', fullName: 'Nikhil Tiwari', email: 'nikhil@example.com', registrationNumber: 'REG2024020', branch: 'CSE (Full Stack)', section: 'A', role: 'student', skills: ['GraphQL', 'Redis', 'Microservices', 'Node.js', 'React'], bio: 'Architect-level thinking for campus-scale distributed systems.', reputation: 730, collaborationAvailable: true, githubLink: 'github.com/nikhil-arch' },
  ]

  for (const u of dummyUsers) {
    const { id, ...data } = u
    await setDoc(doc(db, 'users', id), {
      uid: id,
      collaborationHistory: [],
      profileImage: '',
      createdAt: serverTimestamp(),
      ...data,
    })
  }

  // ── Problem Pool (15 posts) ────────────────────────────────────────────────
  const posts = [
    { title: 'Why does useEffect run twice in React 18 strict mode?', description: 'My API call is firing twice on mount. I added console.log and it runs twice. Is this a bug or expected behavior?', tags: ['React', 'Hooks'], authorName: 'Arjun Sharma', authorId: 'dummy_u01', anonymous: false, solved: true, upvotes: ['dummy_u02', 'dummy_u03', 'dummy_u05'] },
    { title: 'Difference between B-Tree and B+ Tree in DBMS?', description: 'I get confused every time this comes up in exams. Can someone explain with a real use case?', tags: ['DBMS', 'Indexes'], authorName: 'Anonymous', authorId: 'dummy_u08', anonymous: true, solved: true, upvotes: ['dummy_u01', 'dummy_u04', 'dummy_u09', 'dummy_u13'] },
    { title: 'How to implement LRU Cache in O(1) time?', description: 'I know the concept uses HashMap + Doubly Linked List but the implementation is confusing me. Especially the node deletion part.', tags: ['DSA', 'Algorithms'], authorName: 'Rohit Kumar', authorId: 'dummy_u03', anonymous: false, solved: false, upvotes: ['dummy_u09', 'dummy_u14', 'dummy_u20'] },
    { title: 'Transformer architecture explained simply?', description: 'Reading the "Attention Is All You Need" paper and completely lost at multi-head attention. Can someone break it down like I\'m in 2nd year?', tags: ['AI/ML', 'Deep Learning'], authorName: 'Anonymous', authorId: 'dummy_u07', anonymous: true, solved: false, upvotes: ['dummy_u02', 'dummy_u06', 'dummy_u12', 'dummy_u13'] },
    { title: 'Firebase Firestore vs Realtime Database — which to use?', description: 'Building CampusOS-like project. Should I use Firestore or Realtime Database for live messaging? What are the cost differences?', tags: ['Firebase', 'Backend'], authorName: 'Pooja Chandra', authorId: 'dummy_u19', anonymous: false, solved: true, upvotes: ['dummy_u01', 'dummy_u05', 'dummy_u11'] },
    { title: 'How does Dijkstra fail with negative weights?', description: 'My professor said Dijkstra doesn\'t work with negative edges but couldn\'t explain why clearly. Need a visual explanation.', tags: ['DSA', 'Graph Algorithms'], authorName: 'Rohit Kumar', authorId: 'dummy_u03', anonymous: false, solved: true, upvotes: ['dummy_u09', 'dummy_u20'] },
    { title: 'What is RAG and when should you use it over fine-tuning?', description: 'I keep seeing RAG mentioned everywhere. Is it just fancy document retrieval? When is fine-tuning better?', tags: ['AI/ML', 'LLMs'], authorName: 'Anonymous', authorId: 'dummy_u16', anonymous: true, solved: false, upvotes: ['dummy_u02', 'dummy_u06', 'dummy_u07', 'dummy_u12'] },
    { title: 'ACID properties — real world examples for each?', description: 'I know the definitions but interviews keep asking for real-world examples. Especially Isolation levels.', tags: ['DBMS', 'Transactions'], authorName: 'Tanvi Agarwal', authorId: 'dummy_u15', anonymous: false, solved: true, upvotes: ['dummy_u04', 'dummy_u08'] },
    { title: 'CSS Flexbox vs Grid — when to use which?', description: 'I always end up using flex for everything. Is there a mental model for deciding when Grid is better?', tags: ['React', 'CSS'], authorName: 'Vikram Reddy', authorId: 'dummy_u05', anonymous: false, solved: false, upvotes: ['dummy_u01', 'dummy_u11', 'dummy_u19'] },
    { title: 'How does Kubernetes handle pod failures automatically?', description: 'My professor mentioned self-healing but I don\'t understand the reconciliation loop. How does K8s know a pod is unhealthy?', tags: ['DevOps', 'Cloud'], authorName: 'Rahul Bansal', authorId: 'dummy_u11', anonymous: false, solved: false, upvotes: ['dummy_u05', 'dummy_u14'] },
    { title: 'Best approach for system design of URL shortener?', description: 'Got this in a mock interview. I went with MySQL but interviewer seemed unsatisfied. What are the standard components?', tags: ['System Design', 'Backend'], authorName: 'Anonymous', authorId: 'dummy_u20', anonymous: true, solved: true, upvotes: ['dummy_u03', 'dummy_u09', 'dummy_u14', 'dummy_u20'] },
    { title: 'Quantum superposition — how to explain to non-CS people?', description: 'Presenting at a college fest and need to explain quantum computing concepts to non-technical audience.', tags: ['Quantum Computing'], authorName: 'Divya Krishnan', authorId: 'dummy_u10', anonymous: false, solved: false, upvotes: ['dummy_u18'] },
    { title: 'Docker vs VM — performance differences explained?', description: 'I understand containers share the kernel but how much faster are they really? Any benchmarks or intuition?', tags: ['DevOps'], authorName: 'Nikhil Tiwari', authorId: 'dummy_u20', anonymous: false, solved: true, upvotes: ['dummy_u05', 'dummy_u11', 'dummy_u14'] },
    { title: 'How to crack FAANG interviews with DSA in 3 months?', description: 'Placement season starting. I have solid fundamentals but need a structured 90-day roadmap for DSA + system design.', tags: ['Placement Prep', 'DSA'], authorName: 'Anonymous', authorId: 'dummy_u08', anonymous: true, solved: false, upvotes: ['dummy_u01', 'dummy_u03', 'dummy_u05', 'dummy_u09', 'dummy_u15'] },
    { title: 'What is the difference between process and thread?', description: 'OS exam tomorrow. Need crisp difference with context switching overhead comparison.', tags: ['OS', 'Processes'], authorName: 'Sneha Mehta', authorId: 'dummy_u17', anonymous: false, solved: true, upvotes: ['dummy_u03', 'dummy_u09'] },
  ]
  for (const p of posts) await addDocument('posts', p)

  // ── Study Groups (8) ──────────────────────────────────────────────────────
  const studyGroups = [
    { name: 'DSA Crack Team', subject: 'Data Structures & Algorithms', description: 'Daily 1-hour LeetCode sessions. We do 2 problems per day and discuss optimal solutions.', schedule: 'Mon, Wed, Fri — 8:00 PM', location: 'Library 3rd Floor', section: 'A', maxMembers: 8, members: ['dummy_u01', 'dummy_u03', 'dummy_u09', 'dummy_u20'], createdBy: 'dummy_u03', creatorName: 'Rohit Kumar' },
    { name: 'ML Study Circle', subject: 'Machine Learning', description: 'Weekly paper reading and implementation. Currently going through Andrej Karpathy\'s courses.', schedule: 'Sat — 10:00 AM', location: 'AI Lab', section: 'B', maxMembers: 10, members: ['dummy_u02', 'dummy_u06', 'dummy_u07', 'dummy_u12', 'dummy_u13'], createdBy: 'dummy_u02', creatorName: 'Priya Patel' },
    { name: 'DBMS Exam Warriors', subject: 'Database Management Systems', description: 'Focused exam prep. Solving previous year papers and practising SQL queries together.', schedule: 'Tue, Thu — 6:00 PM', location: 'Lab 204', section: 'C', maxMembers: 6, members: ['dummy_u04', 'dummy_u08', 'dummy_u15'], createdBy: 'dummy_u04', creatorName: 'Ananya Singh' },
    { name: 'Full Stack Builders', subject: 'Web Development', description: 'Building real projects together. Current project: a campus timetable app. Join to contribute!', schedule: 'Sun — 2:00 PM', location: 'Coding Club Room', section: 'D', maxMembers: 12, members: ['dummy_u01', 'dummy_u05', 'dummy_u11', 'dummy_u19', 'dummy_u20'], createdBy: 'dummy_u05', creatorName: 'Vikram Reddy' },
    { name: 'OS Concepts Deep Dive', subject: 'Operating Systems', description: 'Covering process scheduling, memory management, and file systems from scratch with diagrams.', schedule: 'Wed — 5:00 PM', location: 'Seminar Hall B', section: 'E', maxMembers: 8, members: ['dummy_u09', 'dummy_u14', 'dummy_u17'], createdBy: 'dummy_u09', creatorName: 'Karthik Iyer' },
    { name: 'GenAI Explorers', subject: 'Generative AI & LLMs', description: 'Experimenting with open-source LLMs, fine-tuning, and building AI demos every week.', schedule: 'Sat — 3:00 PM', location: 'AI Lab 2', section: 'B', maxMembers: 10, members: ['dummy_u06', 'dummy_u07', 'dummy_u16', 'dummy_u17'], createdBy: 'dummy_u06', creatorName: 'Shreya Nair' },
    { name: 'Placement Prep Squad', subject: 'Placement Preparation', description: 'Mock interviews, resume reviews, and system design practice. 3 months to placements!', schedule: 'Daily — 9:00 PM', location: 'Google Meet', section: 'A', maxMembers: 15, members: ['dummy_u01', 'dummy_u03', 'dummy_u05', 'dummy_u08', 'dummy_u09', 'dummy_u11', 'dummy_u14', 'dummy_u20'], createdBy: 'dummy_u01', creatorName: 'Arjun Sharma' },
    { name: 'Quantum Computing Basics', subject: 'Quantum Computing', description: 'Starting from linear algebra and quantum gates. Perfect for beginners in quantum.', schedule: 'Fri — 4:00 PM', location: 'Physics Lab', section: 'C', maxMembers: 6, members: ['dummy_u10', 'dummy_u18'], createdBy: 'dummy_u10', creatorName: 'Divya Krishnan' },
  ]
  for (const sg of studyGroups) await addDocument('studyGroups', sg)

  // ── Opportunities (12) ────────────────────────────────────────────────────
  const opportunities = [
    { title: 'Smart India Hackathon 2026', type: 'Hackathon', description: 'Govt. of India\'s premier hackathon. 36-hour challenge solving real national problems. Team of 6.', organization: 'Ministry of Education', deadline: '2026-06-15', stipend: '₹1,00,000 prize', applyLink: 'sih.gov.in', pinned: true, savedBy: [] },
    { title: 'Google Summer of Code 2026', type: 'Internship', description: 'Contribute to open-source projects and get paid. 3-month remote internship with top orgs like Apache, CERN.', organization: 'Google', deadline: '2026-03-30', stipend: '$3,000–$6,600', applyLink: 'summerofcode.withgoogle.com', pinned: true, savedBy: [] },
    { title: 'Microsoft Research Internship', type: 'Internship', description: 'Research internship in AI, systems, or HCI. Work alongside researchers publishing at top venues.', organization: 'Microsoft Research India', deadline: '2026-04-01', stipend: '₹1,20,000/mo', applyLink: 'microsoft.com/research/careers', pinned: false, savedBy: [] },
    { title: 'React Advanced Conference — CFP', type: 'Competition', description: 'Submit a talk proposal about your React project or research. Selected speakers get full sponsorship.', organization: 'React Advanced London', deadline: '2026-05-20', stipend: 'Free ticket + travel', applyLink: 'reactadvanced.com', pinned: false, savedBy: [] },
    { title: 'DevFest Campus Workshop — AI Tools', type: 'Workshop', description: 'Google Developer Student Clubs presents a full-day workshop on Gemini API, LangChain, and building AI agents.', organization: 'GDSC CampusOS', deadline: '2026-05-18', stipend: 'Free', applyLink: 'gdsc.community', pinned: false, savedBy: [] },
    { title: 'Goldman Sachs Off-Campus Drive', type: 'Placement', description: 'Full-time SWE role for 2026 graduates. 3 rounds: online assessment, technical, and HR.', organization: 'Goldman Sachs', deadline: '2026-05-25', stipend: '₹20 LPA', applyLink: 'goldmansachs.com/careers', pinned: false, savedBy: [] },
    { title: 'IEEE Hackathon — Quantum Challenge', type: 'Hackathon', description: 'Build a quantum circuit that solves a classical optimization problem. Qiskit and Cirq supported.', organization: 'IEEE Student Branch', deadline: '2026-06-01', stipend: '₹50,000 prize', applyLink: 'ieee.org/hackathon', pinned: false, savedBy: [] },
    { title: 'Data Science Bootcamp — Free', type: 'Workshop', description: 'Hands-on 5-day intensive on pandas, scikit-learn, and building end-to-end ML pipelines.', organization: 'Analytics Vidhya', deadline: '2026-05-22', stipend: 'Free Certificate', applyLink: 'analyticsvidhya.com', pinned: false, savedBy: [] },
    { title: 'Flipkart Grid 6.0', type: 'Competition', description: 'Engineering challenge by Flipkart. Solve e-commerce scale problems. Qualifies for PPO opportunity.', organization: 'Flipkart', deadline: '2026-06-10', stipend: 'PPO + ₹50,000', applyLink: 'flipkartgrid.com', pinned: false, savedBy: [] },
    { title: 'Research Paper Presentation — ICML 2026', type: 'Seminar', description: 'Present your ML research at the student symposium. Mentorship from senior researchers provided.', organization: 'International Conference on Machine Learning', deadline: '2026-05-30', stipend: 'Travel grant', applyLink: 'icml.cc', pinned: false, savedBy: [] },
    { title: 'Amazon SDE Internship 2026', type: 'Internship', description: 'Summer internship at Amazon. Work on AWS, Alexa, or Prime Video teams. Conversion rate is 80%.', organization: 'Amazon India', deadline: '2026-04-15', stipend: '₹1,00,000/mo', applyLink: 'amazon.jobs', pinned: false, savedBy: [] },
    { title: 'Freshers Cultural Fest — Tech Quiz', type: 'Campus Event', description: 'Annual campus tech quiz. Topics: coding trivia, tech history, current AI trends. Team of 3.', organization: 'Student Council', deadline: '2026-05-16', stipend: 'Prizes + Certificates', applyLink: '', pinned: false, savedBy: [] },
  ]
  for (const o of opportunities) await addDocument('opportunities', o)

  // ── Achievements (12) ─────────────────────────────────────────────────────
  const achievements = [
    { title: 'Won 1st Place at Smart India Hackathon 2025', type: 'Hackathon', description: 'Our team of 6 built an AI-powered crop disease detection system and won the Agriculture track at SIH 2025. Competed against 500+ teams.', authorName: 'Arjun Sharma', authorId: 'dummy_u01', verified: true, likes: ['dummy_u02', 'dummy_u03', 'dummy_u04', 'dummy_u05'] },
    { title: 'Selected for Google Summer of Code 2025', type: 'Internship', description: 'Got selected to work with TensorFlow organization for GSoC 2025. Contributed to the TF.js backend optimization project.', authorName: 'Priya Patel', authorId: 'dummy_u02', verified: true, likes: ['dummy_u01', 'dummy_u06', 'dummy_u07', 'dummy_u12'] },
    { title: 'Solved 500+ LeetCode problems', type: 'Certification', description: 'Finally crossed the 500 mark on LeetCode with 150 hard problems. Knight badge achieved! Sharing my roadmap.', authorName: 'Rohit Kumar', authorId: 'dummy_u03', verified: false, likes: ['dummy_u01', 'dummy_u09', 'dummy_u14', 'dummy_u20'] },
    { title: 'Published research paper on RAG systems at NeurIPS workshop', type: 'Research', description: 'Our paper "Adaptive Retrieval for Educational QA Systems" was accepted at the NeurIPS 2025 Education AI workshop.', authorName: 'Shreya Nair', authorId: 'dummy_u06', verified: true, likes: ['dummy_u02', 'dummy_u07', 'dummy_u13', 'dummy_u16'] },
    { title: 'AWS Certified Solutions Architect — Professional', type: 'Certification', description: 'Cleared the SAP-C02 exam on first attempt. 6 months of prep with hands-on labs. Sharing free resources I used.', authorName: 'Rahul Bansal', authorId: 'dummy_u11', verified: true, likes: ['dummy_u05', 'dummy_u14', 'dummy_u20'] },
    { title: 'Microsoft AI Challenge — Top 50 Globally', type: 'Competition', description: 'Our agentic AI system for campus navigation ranked Top 50 out of 3000 global entries in the Microsoft AI Challenge.', authorName: 'Dev Bhatia', authorId: 'dummy_u16', verified: true, likes: ['dummy_u06', 'dummy_u07', 'dummy_u12'] },
    { title: 'Selected as GitHub Campus Expert', type: 'Award', description: 'Accepted into the GitHub Campus Expert program. Will be running open-source workshops and representing GitHub on campus.', authorName: 'Vikram Reddy', authorId: 'dummy_u05', verified: true, likes: ['dummy_u01', 'dummy_u11', 'dummy_u19'] },
    { title: 'Kaggle Master — Top 0.5% globally', type: 'Competition', description: 'Achieved Kaggle Master rank with 3 gold medals. Specialization in computer vision and tabular competitions.', authorName: 'Ishaan Malhotra', authorId: 'dummy_u12', verified: true, likes: ['dummy_u02', 'dummy_u04', 'dummy_u08'] },
    { title: 'Built Android app with 10,000+ downloads on Play Store', type: 'Projects', description: 'My campus attendance tracker app crossed 10k downloads! Built with Kotlin and Jetpack Compose. It\'s free and open-source.', authorName: 'Pooja Chandra', authorId: 'dummy_u19', verified: false, likes: ['dummy_u01', 'dummy_u05', 'dummy_u11', 'dummy_u20'] },
    { title: 'Open source contributor — merged PR in Rust stdlib', type: 'Projects', description: 'Got a performance improvement PR merged into the Rust standard library. Small change but huge learning experience.', authorName: 'Saurabh Rao', authorId: 'dummy_u14', verified: true, likes: ['dummy_u09', 'dummy_u11', 'dummy_u20'] },
    { title: 'Runner-up at HackMIT 2025', type: 'Hackathon', description: 'Built a quantum-classical hybrid optimization tool and won runner-up at HackMIT. 600 participants, 48-hour build.', authorName: 'Divya Krishnan', authorId: 'dummy_u10', verified: true, likes: ['dummy_u07', 'dummy_u18'] },
    { title: 'Flipkart Grid 5.0 — National Finals', type: 'Competition', description: 'Made it to the top 20 teams nationally in Flipkart Grid 5.0. Computer vision problem for warehouse automation.', authorName: 'Neha Gupta', authorId: 'dummy_u08', verified: false, likes: ['dummy_u04', 'dummy_u15'] },
  ]
  for (const a of achievements) await addDocument('achievements', a)

  // ── Projects (10) ─────────────────────────────────────────────────────────
  const projects = [
    { title: 'CampusRoute — AI Campus Navigation', description: 'Agentic AI system for navigating campus using LangChain and campus map data. Uses RAG to answer location queries.', techStack: ['Python', 'LangChain', 'FastAPI', 'React'], githubLink: 'github.com/dev-rag/campus-route', demoLink: 'campus-route.vercel.app', authorName: 'Dev Bhatia', authorId: 'dummy_u16', likes: ['dummy_u01', 'dummy_u06', 'dummy_u12'] },
    { title: 'QuantumViz — Quantum Circuit Visualizer', description: 'Interactive web app to visualize quantum circuits and understand gate operations. Built for non-physicists.', techStack: ['React', 'Python', 'Qiskit', 'D3.js'], githubLink: 'github.com/divya-quantum/quantumviz', demoLink: 'quantumviz.vercel.app', authorName: 'Divya Krishnan', authorId: 'dummy_u10', likes: ['dummy_u18'] },
    { title: 'AttendEase — Smart Attendance Tracker', description: 'Android app that auto-detects BLE beacons near classrooms and marks attendance. 10k+ downloads on Play Store.', techStack: ['Kotlin', 'Firebase', 'Jetpack Compose', 'BLE'], githubLink: 'github.com/pooja-android/attendease', demoLink: 'play.google.com/attendease', authorName: 'Pooja Chandra', authorId: 'dummy_u19', likes: ['dummy_u01', 'dummy_u05', 'dummy_u11', 'dummy_u19', 'dummy_u20'] },
    { title: 'RustHTTP — HTTP/2 Server from Scratch', description: 'Fully compliant HTTP/2 server written in Rust with no external dependencies. Educational project with detailed docs.', techStack: ['Rust', 'WebSockets', 'TLS'], githubLink: 'github.com/saurabh-rust/rust-http2', demoLink: '', authorName: 'Saurabh Rao', authorId: 'dummy_u14', likes: ['dummy_u09', 'dummy_u11', 'dummy_u20'] },
    { title: 'NotesMind — AI-Powered Study Notes', description: 'Upload lecture PDFs and get auto-generated summaries, flashcards, and quizzes using local Ollama LLM.', techStack: ['React', 'Python', 'Ollama', 'FastAPI', 'PostgreSQL'], githubLink: 'github.com/shreya-agents/notesmind', demoLink: 'notesmind.app', authorName: 'Shreya Nair', authorId: 'dummy_u06', likes: ['dummy_u01', 'dummy_u02', 'dummy_u08', 'dummy_u13', 'dummy_u15'] },
    { title: 'CropAI — Disease Detection System', description: 'CNN-based crop disease classifier that identifies 38 plant diseases from leaf images. Won SIH 2025 Agriculture track.', techStack: ['Python', 'PyTorch', 'React', 'FastAPI', 'Docker'], githubLink: 'github.com/arjun-sharma/crop-ai', demoLink: 'cropai.live', authorName: 'Arjun Sharma', authorId: 'dummy_u01', likes: ['dummy_u02', 'dummy_u04', 'dummy_u12', 'dummy_u16'] },
    { title: 'Persona — AI Resume Builder', description: 'Feed your GitHub profile and achievements to get an ATS-optimized resume generated by a local LLM. No data leaves your machine.', techStack: ['React', 'Electron', 'Ollama', 'TypeScript'], githubLink: 'github.com/vikram-dev/persona', demoLink: 'persona.app', authorName: 'Vikram Reddy', authorId: 'dummy_u05', likes: ['dummy_u01', 'dummy_u08', 'dummy_u11'] },
    { title: 'DataFlow — Visual Data Pipeline Builder', description: 'Drag-and-drop tool to build Spark data pipelines visually. Generates PySpark code automatically.', techStack: ['React', 'Apache Spark', 'Python', 'Neo4j'], githubLink: 'github.com/tanvi-bigdata/dataflow', demoLink: 'dataflow-app.io', authorName: 'Tanvi Agarwal', authorId: 'dummy_u15', likes: ['dummy_u04', 'dummy_u08'] },
    { title: 'FaceForensics++ — Deepfake Detector', description: 'Real-time deepfake video detection using EfficientNet. Achieves 94% accuracy on FaceForensics++ benchmark.', techStack: ['Python', 'OpenCV', 'PyTorch', 'FastAPI'], githubLink: 'github.com/ishaan-cv/deepfake-detector', demoLink: '', authorName: 'Ishaan Malhotra', authorId: 'dummy_u12', likes: ['dummy_u02', 'dummy_u06', 'dummy_u07'] },
    { title: 'GraphOS — Distributed Graph Database', description: 'Lightweight distributed graph database supporting Cypher query language. Academic project exploring Raft consensus.', techStack: ['Go', 'Raft', 'gRPC', 'React'], githubLink: 'github.com/nikhil-arch/graphos', demoLink: '', authorName: 'Nikhil Tiwari', authorId: 'dummy_u20', likes: ['dummy_u09', 'dummy_u14'] },
  ]
  for (const p of projects) await addDocument('projects', p)

  // ── Polls (6) ─────────────────────────────────────────────────────────────
  const polls = [
    { question: 'Which language do you use most for DSA?', options: [{ text: 'C++', votes: 34, voters: [] }, { text: 'Java', votes: 18, voters: [] }, { text: 'Python', votes: 22, voters: [] }, { text: 'JavaScript', votes: 6, voters: [] }], authorName: 'Rohit Kumar', authorId: 'dummy_u03' },
    { question: 'Preferred AI assistant for coding?', options: [{ text: 'GitHub Copilot', votes: 28, voters: [] }, { text: 'Cursor AI', votes: 35, voters: [] }, { text: 'ChatGPT', votes: 19, voters: [] }, { text: 'Local Ollama', votes: 12, voters: [] }], authorName: 'Shreya Nair', authorId: 'dummy_u06' },
    { question: 'What time is ideal for study group sessions?', options: [{ text: 'Morning 6-8 AM', votes: 8, voters: [] }, { text: 'Afternoon 2-4 PM', votes: 15, voters: [] }, { text: 'Evening 6-8 PM', votes: 41, voters: [] }, { text: 'Night 9-11 PM', votes: 29, voters: [] }], authorName: 'Arjun Sharma', authorId: 'dummy_u01' },
    { question: 'Best framework for a college mini-project?', options: [{ text: 'React + Node.js', votes: 45, voters: [] }, { text: 'Next.js', votes: 23, voters: [] }, { text: 'Django + React', votes: 17, voters: [] }, { text: 'Flutter', votes: 9, voters: [] }], authorName: 'Vikram Reddy', authorId: 'dummy_u05' },
    { question: 'Should hackathon projects be open-sourced after the event?', options: [{ text: 'Always — free knowledge', votes: 52, voters: [] }, { text: 'Only if we win', votes: 14, voters: [] }, { text: 'No — protect IP', votes: 7, voters: [] }], authorName: 'Dev Bhatia', authorId: 'dummy_u16' },
    { question: 'Biggest struggle in final year projects?', options: [{ text: 'Choosing the topic', votes: 19, voters: [] }, { text: 'Writing documentation', votes: 38, voters: [] }, { text: 'Building the demo', votes: 24, voters: [] }, { text: 'Getting faculty approval', votes: 31, voters: [] }], authorName: 'Neha Gupta', authorId: 'dummy_u08' },
  ]
  for (const p of polls) await addDocument('polls', p)

  // ── Lost & Found (8) ──────────────────────────────────────────────────────
  const lostFound = [
    { title: 'Lost — Blue HP Laptop Charger', description: 'Left my 65W HP USB-C charger in Lab 301 on Monday around 4 PM. Has a small scratch on the brick. Please return!', type: 'lost', location: 'Lab 301 / Computer Labs', contactInfo: 'WhatsApp: 9876543210', authorName: 'Arjun Sharma', authorId: 'dummy_u01', status: 'active' },
    { title: 'Found — Red Casio Scientific Calculator', description: 'Found a Casio FX-991ES PLUS near the canteen benches. Name "Priya" written inside the cover. Please claim.', type: 'found', location: 'Main Canteen Area', contactInfo: 'DM on CampusOS', authorName: 'Vikram Reddy', authorId: 'dummy_u05', status: 'active' },
    { title: 'Lost — Python Programming Textbook', description: '"Python Crash Course" by Eric Matthes. Has my notes inside. Left it in Reading Room 2 last Thursday.', type: 'lost', location: 'Reading Room 2 / Library', contactInfo: 'ananya@example.com', authorName: 'Ananya Singh', authorId: 'dummy_u04', status: 'resolved' },
    { title: 'Found — Black Wallet near Lecture Hall C', description: 'Found a black leather wallet with some cash and cards near LH-C entrance. No ID inside. Contact to claim.', type: 'found', location: 'Lecture Hall Complex C', contactInfo: 'DM Nikhil on CampusOS', authorName: 'Nikhil Tiwari', authorId: 'dummy_u20', status: 'active' },
    { title: 'Lost — Noise Cancelling Earbuds (Sony WF-1000XM4)', description: 'Left my Sony earbuds in the left pocket of the black sofa in the placement prep room. Please return urgently.', type: 'lost', location: 'Placement Prep Room / Training Block', contactInfo: 'karthik@example.com', authorName: 'Karthik Iyer', authorId: 'dummy_u09', status: 'active' },
    { title: 'Found — College ID Card', description: 'Found a college ID card for "Meera Joshi" near the basketball court. Please collect from security desk.', type: 'found', location: 'Sports Complex / Basketball Court', contactInfo: 'Deposited at Security Desk', authorName: 'Saurabh Rao', authorId: 'dummy_u14', status: 'resolved' },
    { title: 'Lost — USB Drive with Final Year Project', description: '32GB SanDisk black USB drive. Has my ENTIRE final year project on it. Reward offered. Possibly in or near Lab 205.', type: 'lost', location: 'Lab 205 / Project Lab', contactInfo: 'pooja@example.com | URGENT', authorName: 'Pooja Chandra', authorId: 'dummy_u19', status: 'active' },
    { title: 'Found — Prescription Glasses in Canteen', description: 'Found a pair of glasses in a blue case near the water dispenser in the main canteen. Please claim quickly.', type: 'found', location: 'Main Canteen', contactInfo: 'DM Neha on CampusOS', authorName: 'Neha Gupta', authorId: 'dummy_u08', status: 'active' },
  ]
  for (const item of lostFound) await addDocument('lostFound', item)

  // ── Challenges (12) ───────────────────────────────────────────────────────
  const challenges = [
    { title: 'Implement a Bloom Filter in Python', description: 'Build a space-efficient probabilistic data structure with configurable false positive rates. Must pass all provided test cases.', type: 'Coding', difficulty: 'Medium', rewardPoints: 60, attempts: ['dummy_u03', 'dummy_u09', 'dummy_u01', 'dummy_u05'], solvedBy: ['dummy_u03', 'dummy_u09'], authorName: 'Karthik Iyer', authorId: 'dummy_u09' },
    { title: 'Build a Mini Linux Shell in C', description: 'Implement a shell that supports pipes, redirection, background processes, and basic built-in commands (cd, ls, exit).', type: 'Coding', difficulty: 'Hard', rewardPoints: 150, attempts: ['dummy_u14', 'dummy_u09'], solvedBy: ['dummy_u14'], authorName: 'Saurabh Rao', authorId: 'dummy_u14' },
    { title: 'Design Twitter\'s Feed Algorithm', description: 'System design challenge. Design a scalable feed ranking system for 500M users. Justify every architectural decision.', type: 'Design', difficulty: 'Hard', rewardPoints: 120, attempts: ['dummy_u09', 'dummy_u20', 'dummy_u01', 'dummy_u11'], solvedBy: ['dummy_u09', 'dummy_u20'], authorName: 'Nikhil Tiwari', authorId: 'dummy_u20' },
    { title: 'Fine-tune a Tiny LLM for Campus QA', description: 'Using Ollama + LoRA, fine-tune a small LLM (Phi-3 or Mistral) to answer campus-specific questions using synthetic data you generate.', type: 'AI', difficulty: 'Hard', rewardPoints: 200, attempts: ['dummy_u06', 'dummy_u02'], solvedBy: ['dummy_u06'], authorName: 'Shreya Nair', authorId: 'dummy_u06' },
    { title: 'Implement Raft Consensus Algorithm', description: 'Build a simplified Raft leader election and log replication system. Must handle network partition scenarios.', type: 'Coding', difficulty: 'Hard', rewardPoints: 180, attempts: ['dummy_u14', 'dummy_u20'], solvedBy: [], authorName: 'Saurabh Rao', authorId: 'dummy_u14' },
    { title: 'Solve the N-Queens Problem with Backtracking', description: 'Solve N-Queens for N=1 to 15. Must use backtracking with pruning. Visualize the solutions using ASCII art.', type: 'Coding', difficulty: 'Medium', rewardPoints: 40, attempts: ['dummy_u01', 'dummy_u03', 'dummy_u05', 'dummy_u09', 'dummy_u20', 'dummy_u14'], solvedBy: ['dummy_u01', 'dummy_u03', 'dummy_u05', 'dummy_u09', 'dummy_u20'] },
    { title: 'Build a Real-Time Collaborative Code Editor', description: 'Implement a Google Docs-like collaborative text editor using CRDTs (Conflict-free Replicated Data Types). Support 3+ simultaneous users.', type: 'Coding', difficulty: 'Hard', rewardPoints: 170, attempts: ['dummy_u11', 'dummy_u05'], solvedBy: ['dummy_u11'], authorName: 'Rahul Bansal', authorId: 'dummy_u11' },
    { title: 'Create a Quantum Teleportation Demo', description: 'Using Qiskit, simulate quantum teleportation of a qubit state. Explain each gate operation in comments.', type: 'AI', difficulty: 'Medium', rewardPoints: 90, attempts: ['dummy_u10', 'dummy_u18', 'dummy_u07'], solvedBy: ['dummy_u10', 'dummy_u18'], authorName: 'Divya Krishnan', authorId: 'dummy_u10' },
    { title: 'Identify the Startup Opportunity in Agriculture AI', description: 'Research + startup challenge. Identify a specific unmet need in Indian agriculture using AI. Build a one-page business proposal.', type: 'Startup', difficulty: 'Easy', rewardPoints: 30, attempts: ['dummy_u16', 'dummy_u01', 'dummy_u08', 'dummy_u05'], solvedBy: ['dummy_u16', 'dummy_u01', 'dummy_u08'], authorName: 'Dev Bhatia', authorId: 'dummy_u16' },
    { title: 'Optimize a Slow Database Query', description: 'Given a slow PostgreSQL query on a 10M-row dataset, use EXPLAIN ANALYZE to identify bottlenecks and optimize it to under 10ms.', type: 'Coding', difficulty: 'Medium', rewardPoints: 70, attempts: ['dummy_u04', 'dummy_u15', 'dummy_u08'], solvedBy: ['dummy_u04', 'dummy_u15'], authorName: 'Ananya Singh', authorId: 'dummy_u04' },
    { title: 'Train a GAN from Scratch', description: 'Train a vanilla GAN to generate handwritten digits on MNIST. Target FID score under 50. Share training curves and generated samples.', type: 'AI', difficulty: 'Hard', rewardPoints: 140, attempts: ['dummy_u02', 'dummy_u07', 'dummy_u12', 'dummy_u06'], solvedBy: ['dummy_u02', 'dummy_u07', 'dummy_u12'], authorName: 'Ishaan Malhotra', authorId: 'dummy_u12' },
    { title: 'Build a 2-Pass Assembler in Python', description: 'Implement a two-pass assembler for a simple hypothetical instruction set. Must generate symbol table and object code.', type: 'Coding', difficulty: 'Easy', rewardPoints: 25, attempts: ['dummy_u03', 'dummy_u09', 'dummy_u14', 'dummy_u20', 'dummy_u01'], solvedBy: ['dummy_u03', 'dummy_u09', 'dummy_u14', 'dummy_u20'], authorName: 'Karthik Iyer', authorId: 'dummy_u09' },
  ]
  for (const c of challenges) await addDocument('challenges', c)

  // ── SOS Board (8) ─────────────────────────────────────────────────────────
  const sosPosts = [
    { title: 'Segfault in C++ — submission in 30 mins!', description: 'My program crashes at line 47 with SIGSEGV when input > 1000. I\'ve been debugging for 2 hours. Pointer issue I think. Code on pastebin.', authorName: 'Rohit Kumar', authorId: 'dummy_u03', resolved: false, status: 'claimed', helperId: 'dummy_u09', helperName: 'Karthik Iyer', urgent: true },
    { title: 'Firebase permission denied error — demo in 1 hour', description: 'Getting "FirebaseError: Missing or insufficient permissions" on Firestore read. Rules look correct. Admin in console works fine.', authorName: 'Pooja Chandra', authorId: 'dummy_u19', resolved: true, status: 'resolved', helperId: 'dummy_u01', helperName: 'Arjun Sharma', urgent: true },
    { title: 'Ollama model not loading — out of memory?', description: 'Running llama3 on my 8GB RAM laptop and it keeps crashing. Task manager shows 100% memory usage. Any smaller model suggestions?', authorName: 'Sneha Mehta', authorId: 'dummy_u17', resolved: false, status: 'active', urgent: false },
    { title: 'Git merge conflict destroying my project files', description: 'Merged main into my feature branch and now 3 files have conflicts I don\'t understand. Afraid to touch anything.', authorName: 'Tanvi Agarwal', authorId: 'dummy_u15', resolved: true, status: 'resolved', helperId: 'dummy_u05', helperName: 'Vikram Reddy', urgent: true },
    { title: 'Docker container networking not working', description: 'Two containers can\'t ping each other even though they\'re on the same Docker network. Works on host but not between containers.', authorName: 'Rahul Bansal', authorId: 'dummy_u11', resolved: false, status: 'claimed', helperId: 'dummy_u14', helperName: 'Saurabh Rao', urgent: false },
    { title: 'ML model accuracy stuck at 52% — overfitting?', description: 'Validation accuracy is 52% but training is 98%. Tried dropout and L2 reg but nothing helps. Using ResNet-50 on a 500-image dataset.', authorName: 'Neha Gupta', authorId: 'dummy_u08', resolved: false, status: 'active', urgent: false },
    { title: 'SQL query returns wrong results with JOINs', description: 'My LEFT JOIN query doubles the row count when joining orders and order_items tables. Something about duplicate keys but can\'t figure it out.', authorName: 'Ananya Singh', authorId: 'dummy_u04', resolved: true, status: 'resolved', helperId: 'dummy_u09', helperName: 'Karthik Iyer', urgent: false },
    { title: 'React app white screen after deployment to Vercel', description: 'Works perfectly on localhost but blank white screen on Vercel. Console shows no errors. Environment variables are set correctly.', authorName: 'Vikram Reddy', authorId: 'dummy_u05', resolved: false, status: 'active', urgent: true },
  ]
  for (const s of sosPosts) await addDocument('sosPosts', s)

  // ── Skill Exchanges (8) ───────────────────────────────────────────────────
  const skillExchanges = [
    { offerSkills: ['React', 'Next.js', 'TypeScript'], wantedSkills: ['Machine Learning', 'Scikit-learn'], description: 'I can teach you React from basics to advanced (hooks, context, performance). Looking for someone to teach me ML fundamentals and scikit-learn.', authorName: 'Arjun Sharma', authorId: 'dummy_u01' },
    { offerSkills: ['Python', 'TensorFlow', 'PyTorch'], wantedSkills: ['System Design', 'HLD'], description: 'Happy to teach PyTorch, CNNs, and ML pipelines. In return, I want to learn system design for interviews — HLD, LLD, databases at scale.', authorName: 'Priya Patel', authorId: 'dummy_u02' },
    { offerSkills: ['DSA', 'C++', 'Competitive Programming'], wantedSkills: ['React', 'Node.js'], description: 'Knight on Codeforces here. Can teach DP, graphs, trees, segment trees. Want to learn basic web dev — React and a simple backend.', authorName: 'Rohit Kumar', authorId: 'dummy_u03' },
    { offerSkills: ['SQL', 'Apache Spark', 'Data Engineering'], wantedSkills: ['LangChain', 'RAG'], description: 'Can teach advanced SQL, query optimization, and building data pipelines with Apache Spark. Want to learn RAG and agentic AI frameworks.', authorName: 'Ananya Singh', authorId: 'dummy_u04' },
    { offerSkills: ['Docker', 'Kubernetes', 'CI/CD'], wantedSkills: ['Computer Vision', 'OpenCV'], description: 'I set up CI/CD and K8s clusters for our college projects. Want to learn OpenCV and basic computer vision to add to my stack.', authorName: 'Rahul Bansal', authorId: 'dummy_u11' },
    { offerSkills: ['LangChain', 'Vector Databases', 'FastAPI'], wantedSkills: ['Flutter', 'React Native'], description: 'Can help you build production RAG pipelines, LangChain agents, and Pinecone integrations. Looking to learn Flutter or React Native.', authorName: 'Dev Bhatia', authorId: 'dummy_u16' },
    { offerSkills: ['Kotlin', 'Android', 'Jetpack Compose'], wantedSkills: ['Machine Learning', 'TensorFlow Lite'], description: 'Have 2 published Android apps. Can teach Jetpack Compose, Firebase integration, and architecture patterns. Want to add on-device ML skills.', authorName: 'Pooja Chandra', authorId: 'dummy_u19' },
    { offerSkills: ['Qiskit', 'Quantum Algorithms', 'Quantum Gates'], wantedSkills: ['React', 'Full Stack Development'], description: 'Can explain quantum gates, Grover\'s algorithm, and VQE from scratch. Very niche but cool! Want to learn full-stack to visualize my quantum work.', authorName: 'Divya Krishnan', authorId: 'dummy_u10' },
  ]
  for (const se of skillExchanges) await addDocument('skillExchanges', se)

  // ── Startup Ideas (8) ─────────────────────────────────────────────────────
  const ideas = [
    { title: 'AI-Powered Personalized Study Planner', description: 'An app that analyzes your syllabus, past exam patterns, and available time to generate a dynamic study schedule. Adjusts daily based on actual progress. Solves the "I don\'t know what to study" problem every student has.', authorName: 'Priya Patel', authorId: 'dummy_u02', upvotes: ['dummy_u01', 'dummy_u03', 'dummy_u06', 'dummy_u08', 'dummy_u15'], tags: ['AI', 'EdTech', 'Productivity'], aiAnalysis: '' },
    { title: 'Peer-to-Peer Textbook Rental Marketplace', description: 'Students list textbooks they no longer need. Others can rent them per semester at 20% of purchase price. Reduces textbook costs by 80%. Blockchain-verified rental agreements.', authorName: 'Tanvi Agarwal', authorId: 'dummy_u15', upvotes: ['dummy_u04', 'dummy_u08', 'dummy_u19'], tags: ['Marketplace', 'FinTech'], aiAnalysis: '' },
    { title: 'Campus Mental Health Anonymous Support App', description: 'Fully anonymous peer support network for college students. AI pre-screens messages and routes serious cases to trained student counselors. Fills the gap between WhatsApp venting and formal therapy.', authorName: 'Anonymous', authorId: 'dummy_u13', upvotes: ['dummy_u01', 'dummy_u05', 'dummy_u08', 'dummy_u11', 'dummy_u15', 'dummy_u19'], tags: ['HealthTech', 'AI', 'Social Impact'], aiAnalysis: '' },
    { title: 'Quantum Computing SaaS for Optimization Problems', description: 'Cloud platform where logistics and supply chain companies can submit optimization problems to be solved on quantum hardware via IBM Q API. Pay-per-solve pricing. Massive untapped market.', authorName: 'Divya Krishnan', authorId: 'dummy_u10', upvotes: ['dummy_u07', 'dummy_u18'], tags: ['Quantum', 'SaaS', 'B2B'], aiAnalysis: '' },
    { title: 'Agentic AI for College Admissions Consulting', description: 'AI agent that acts as a personal college counselor — tracks application deadlines, reviews essays, suggests schools based on profile, and automates common application tasks. $2B+ TAM globally.', authorName: 'Shreya Nair', authorId: 'dummy_u06', upvotes: ['dummy_u01', 'dummy_u02', 'dummy_u07', 'dummy_u16'], tags: ['Agentic AI', 'EdTech', 'SaaS'], aiAnalysis: '' },
    { title: 'Open-Source AI Debugging Tool for Beginners', description: 'A VS Code extension that uses a local LLM (via Ollama) to explain error messages in plain English and suggest fixes. Free, private, no API keys needed. Perfect for CS freshers.', authorName: 'Arjun Sharma', authorId: 'dummy_u01', upvotes: ['dummy_u03', 'dummy_u05', 'dummy_u09', 'dummy_u11', 'dummy_u14', 'dummy_u20'], tags: ['Developer Tools', 'AI', 'Open Source'], aiAnalysis: '' },
    { title: 'Deepfake Detection API for Indian Media', description: 'B2B API for Indian news platforms and social media companies to verify video authenticity. Indian political deepfakes are a growing problem. Government regulation incoming, creating huge demand.', authorName: 'Ishaan Malhotra', authorId: 'dummy_u12', upvotes: ['dummy_u02', 'dummy_u06', 'dummy_u16'], tags: ['AI', 'Media Tech', 'Social Impact'], aiAnalysis: '' },
    { title: 'Smart Canteen Ordering System', description: 'Mobile app to pre-order canteen food, see real-time queue length, pay digitally, and get notified when ready. Eliminates 20-minute lunch queues. Already have interest from our canteen vendor.', authorName: 'Vikram Reddy', authorId: 'dummy_u05', upvotes: ['dummy_u01', 'dummy_u03', 'dummy_u04', 'dummy_u08', 'dummy_u11', 'dummy_u15', 'dummy_u19', 'dummy_u20'], tags: ['Campus', 'FoodTech', 'Mobile'], aiAnalysis: '' },
  ]
  for (const idea of ideas) await addDocument('ideas', idea)

  // ── Build in Public (8) ───────────────────────────────────────────────────
  const buildUpdates = [
    { title: 'Day 1 — Started building NotesMind', description: 'Decided to build an AI study notes tool after struggling with 200-page PDFs during exams. Stack: React + FastAPI + Ollama. Setting up the monorepo structure today. Expect daily updates!', authorName: 'Shreya Nair', authorId: 'dummy_u06', likes: ['dummy_u01', 'dummy_u02', 'dummy_u08'], tags: ['React', 'AI', 'FastAPI'], projectLink: 'github.com/shreya-agents/notesmind' },
    { title: 'Shipped: PDF parsing with PyMuPDF', description: 'After 3 failed attempts with pdfplumber and pypdf2, PyMuPDF wins. 10x faster, handles scanned PDFs too. Here\'s the extraction pipeline code snippet. The chunking strategy was the real challenge.', authorName: 'Shreya Nair', authorId: 'dummy_u06', likes: ['dummy_u02', 'dummy_u06', 'dummy_u13', 'dummy_u16'], tags: ['Python', 'PyMuPDF', 'Backend'], projectLink: 'github.com/shreya-agents/notesmind' },
    { title: 'CropAI — First model at 67% accuracy', description: 'First CNN baseline is at 67% on the test set. Architecture: ResNet18 pre-trained on ImageNet. Next: data augmentation and class imbalance handling. Real-world noisy images are brutal.', authorName: 'Arjun Sharma', authorId: 'dummy_u01', likes: ['dummy_u02', 'dummy_u12'], tags: ['PyTorch', 'CNN', 'Agriculture'], projectLink: 'github.com/arjun-sharma/crop-ai' },
    { title: 'CropAI — 94% accuracy after augmentation!', description: 'Huge jump from 67% to 94%! The secret: aggressive augmentation (random crops, color jitter, gaussian noise) + class-weighted loss for rare disease categories. SIH submission ready!', authorName: 'Arjun Sharma', authorId: 'dummy_u01', likes: ['dummy_u02', 'dummy_u04', 'dummy_u08', 'dummy_u12', 'dummy_u16'], tags: ['PyTorch', 'Data Augmentation', 'Win'], projectLink: 'github.com/arjun-sharma/crop-ai' },
    { title: 'AttendEase — BLE beacon detection working!', description: 'Finally got Bluetooth Low Energy scanning working on Android 12+. The permissions model changed massively in Android 12. Key insight: you need BLUETOOTH_SCAN and BLUETOOTH_CONNECT separately now.', authorName: 'Pooja Chandra', authorId: 'dummy_u19', likes: ['dummy_u01', 'dummy_u05', 'dummy_u11'], tags: ['Android', 'Kotlin', 'BLE'], projectLink: 'github.com/pooja-android/attendease' },
    { title: 'RustHTTP — HTTP/1.1 parsing complete', description: 'The HTTP request parser is done and handles all edge cases (chunked encoding, multipart, malformed requests). Rust\'s type system caught 3 bugs at compile time that would\'ve been runtime bugs in C. Loving it.', authorName: 'Saurabh Rao', authorId: 'dummy_u14', likes: ['dummy_u09', 'dummy_u20'], tags: ['Rust', 'HTTP', 'Systems'], projectLink: 'github.com/saurabh-rust/rust-http2' },
    { title: 'DataFlow — Drag-and-drop pipeline builder MVP', description: 'The core UI is done! You can drag nodes representing Spark transformations and connect them. The code generator produces valid PySpark. Early testers say it saves 2 hours per pipeline.', authorName: 'Tanvi Agarwal', authorId: 'dummy_u15', likes: ['dummy_u04', 'dummy_u08', 'dummy_u15'], tags: ['React', 'Apache Spark', 'UI/UX'], projectLink: 'github.com/tanvi-bigdata/dataflow' },
    { title: 'QuantumViz — Gate animations implemented', description: 'Added smooth animations for qubit state transitions through gates. Used D3.js for the Bloch sphere visualization. The hardest part: representing complex amplitudes visually for non-physicists.', authorName: 'Divya Krishnan', authorId: 'dummy_u10', likes: ['dummy_u18'], tags: ['React', 'D3.js', 'Quantum'], projectLink: 'github.com/divya-quantum/quantumviz' },
  ]
  for (const b of buildUpdates) await addDocument('buildUpdates', b)

  // ── Knowledge Base (10) ───────────────────────────────────────────────────
  const knowledgeBase = [
    { title: 'Complete SQL Cheatsheet for Interviews', description: 'All SQL concepts from SELECT to window functions, CTEs, and query optimization. Includes tricky interview questions with answers.', content: '# SQL Interview Cheatsheet\n\n## Window Functions\n```sql\nSELECT name, salary,\n  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) as rank\nFROM employees;\n```\n\n## CTEs\n```sql\nWITH cte AS (\n  SELECT * FROM orders WHERE year = 2024\n)\nSELECT * FROM cte WHERE amount > 1000;\n```', category: 'DBMS', tags: ['SQL', 'Interviews', 'Cheatsheet'], authorName: 'Ananya Singh', authorId: 'dummy_u04', upvotes: ['dummy_u01', 'dummy_u03', 'dummy_u08', 'dummy_u15'] },
    { title: 'React Performance Optimization — Complete Guide', description: 'From useMemo to code splitting, React.memo, and profiling. Practical patterns that actually matter in production.', content: '# React Performance Guide\n\n## When to use useMemo\nOnly when computation is truly expensive. The memo itself has a cost.\n\n```jsx\n// Before: recalculates on every render\nconst sortedList = list.sort()\n\n// After: only when list changes\nconst sortedList = useMemo(() => list.sort(), [list])\n```\n\n## React.memo\nWraps components to prevent re-renders when props haven\'t changed.', category: 'React', tags: ['Performance', 'Hooks', 'Production'], authorName: 'Arjun Sharma', authorId: 'dummy_u01', upvotes: ['dummy_u05', 'dummy_u11', 'dummy_u19', 'dummy_u20'] },
    { title: 'Dynamic Programming Patterns — 7 Templates', description: 'Master DP with 7 reusable patterns: 1D DP, 2D DP, Interval DP, Tree DP, Bitmask DP, Digit DP, and Probability DP.', content: '# DP Patterns\n\n## 1D DP Template\n```python\n# Fibonacci-style\ndp = [0] * (n + 1)\ndp[0], dp[1] = 0, 1\nfor i in range(2, n + 1):\n    dp[i] = dp[i-1] + dp[i-2]\n```\n\n## 2D DP Template\n```python\n# Grid path problems\ndp = [[0] * cols for _ in range(rows)]\nfor i in range(rows):\n    for j in range(cols):\n        dp[i][j] = dp[i-1][j] + dp[i][j-1]\n```', category: 'DSA', tags: ['DP', 'LeetCode', 'Patterns'], authorName: 'Rohit Kumar', authorId: 'dummy_u03', upvotes: ['dummy_u01', 'dummy_u09', 'dummy_u14', 'dummy_u20'] },
    { title: 'OS Concepts Flashcards — Page Replacement Algorithms', description: 'FIFO, LRU, Optimal, Clock algorithms explained with examples and Belady\'s anomaly. Perfect for exams.', content: '# Page Replacement Algorithms\n\n## LRU (Least Recently Used)\nReplace the page that hasn\'t been used for the longest time.\n\n**Implementation**: Use a doubly linked list + hashmap for O(1) operations.\n\n## Optimal Algorithm\nReplace the page that won\'t be used for the longest time in future. Not practical (requires future knowledge) but gives best possible hit rate — used as benchmark.\n\n## Belady\'s Anomaly\nWith FIFO, increasing frames can **increase** page faults. LRU and Optimal do not suffer from this.', category: 'OS', tags: ['Memory Management', 'Exam Prep', 'Page Replacement'], authorName: 'Karthik Iyer', authorId: 'dummy_u09', upvotes: ['dummy_u03', 'dummy_u14', 'dummy_u17'] },
    { title: 'Transformer Architecture Explained from First Principles', description: 'Multi-head attention, positional encoding, and why transformers beat RNNs — explained with code and intuition.', content: '# Transformer Architecture\n\n## Self-Attention Intuition\nFor each word, compute how much attention to pay to every other word.\n\n```python\n# Simplified attention\ndef attention(Q, K, V):\n    scores = Q @ K.T / sqrt(d_k)\n    weights = softmax(scores)\n    return weights @ V\n```\n\n## Why Multi-Head?\nDifferent heads learn different relationship types: syntax, semantics, co-reference.', category: 'AI', tags: ['Transformers', 'NLP', 'Deep Learning'], authorName: 'Meera Joshi', authorId: 'dummy_u13', upvotes: ['dummy_u02', 'dummy_u06', 'dummy_u07', 'dummy_u12'] },
    { title: 'Placement Prep Roadmap — 3 Month Plan', description: 'Week-by-week DSA + system design plan for cracking FAANG and top Indian product companies. With resource links.', content: '# 3-Month Placement Plan\n\n## Month 1 — DSA Fundamentals\n- Week 1-2: Arrays, Strings, Hashing\n- Week 3-4: Two Pointers, Sliding Window, Recursion\n\n## Month 2 — Advanced DSA\n- Week 5-6: Trees, Graphs, BFS/DFS\n- Week 7-8: DP, Backtracking, Heaps\n\n## Month 3 — System Design + Practice\n- Week 9-10: HLD patterns, Database design\n- Week 11-12: Mock interviews, contest practice', category: 'Placement Prep', tags: ['DSA', 'Roadmap', 'FAANG'], authorName: 'Rohit Kumar', authorId: 'dummy_u03', upvotes: ['dummy_u01', 'dummy_u05', 'dummy_u08', 'dummy_u15', 'dummy_u20'] },
    { title: 'RAG Architecture — Production Implementation Guide', description: 'How to build Retrieval-Augmented Generation systems that actually work: chunking strategies, embedding models, reranking.', content: '# Production RAG Guide\n\n## Chunking Strategy\nBad chunking kills RAG performance more than model choice.\n\n```python\n# Recursive character chunking (recommended)\nfrom langchain.text_splitter import RecursiveCharacterTextSplitter\n\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=512,\n    chunk_overlap=50,\n    separators=["\\n\\n", "\\n", " "]\n)\n```\n\n## Reranking\nAlways add a cross-encoder reranker after initial retrieval.', category: 'AI', tags: ['RAG', 'LangChain', 'Production'], authorName: 'Dev Bhatia', authorId: 'dummy_u16', upvotes: ['dummy_u02', 'dummy_u06', 'dummy_u13'] },
    { title: 'Computer Networks — OSI Model Deep Dive', description: 'All 7 layers explained with real protocols, common interview questions, and packet flow diagrams.', content: '# OSI Model\n\n| Layer | Name | Protocols | PDU |\n|-------|------|-----------|-----|\n| 7 | Application | HTTP, FTP, SMTP | Data |\n| 4 | Transport | TCP, UDP | Segment |\n| 3 | Network | IP, ICMP | Packet |\n| 2 | Data Link | Ethernet, WiFi | Frame |\n| 1 | Physical | Cable, Fiber | Bits |\n\n## TCP vs UDP\n- **TCP**: Reliable, ordered, slower. Use for file transfer, HTTP.\n- **UDP**: Fast, no guarantee. Use for video, gaming, DNS.', category: 'Networks', tags: ['OSI', 'TCP', 'Interview Prep'], authorName: 'Nikhil Tiwari', authorId: 'dummy_u20', upvotes: ['dummy_u03', 'dummy_u09', 'dummy_u14'] },
    { title: 'Docker & Kubernetes — Zero to Production', description: 'Containerize your app, push to registry, deploy on K8s with auto-scaling. Complete working example included.', content: '# Docker to K8s\n\n## Dockerfile Best Practices\n```dockerfile\n# Multi-stage build\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json .\nRUN npm ci --only=production\n\nFROM node:18-alpine\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY . .\nCMD ["node", "index.js"]\n```\n\n## K8s Deployment\n```yaml\napiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: myapp\n```', category: 'DSA', tags: ['Docker', 'Kubernetes', 'DevOps'], authorName: 'Rahul Bansal', authorId: 'dummy_u11', upvotes: ['dummy_u05', 'dummy_u14', 'dummy_u20'] },
    { title: 'System Design — URL Shortener Complete Walkthrough', description: 'HLD + LLD for designing bit.ly. Covers database choice, encoding strategy, caching, analytics, and scaling to 100M users.', content: '# URL Shortener Design\n\n## Requirements\n- 100M URLs shortened/day\n- 10B redirects/day\n- URL expiry support\n\n## Core Design\n1. **Encoding**: Base62 encoding of auto-increment ID\n2. **Database**: Cassandra for writes, Redis for hot URLs\n3. **CDN**: Route redirects through edge for low latency\n\n## Short URL Generation\n```python\nimport base64\ndef encode(id: int) -> str:\n    chars = "0-9A-Za-z"\n    result = []\n    while id:\n        result.append(chars[id % 62])\n        id //= 62\n    return "".join(reversed(result))\n```', category: 'Placement Prep', tags: ['System Design', 'HLD', 'Scalability'], authorName: 'Karthik Iyer', authorId: 'dummy_u09', upvotes: ['dummy_u01', 'dummy_u03', 'dummy_u05', 'dummy_u11', 'dummy_u14', 'dummy_u20'] },
  ]
  for (const kb of knowledgeBase) await addDocument('knowledgeBase', kb)

  // ── Project Archive (8) ───────────────────────────────────────────────────
  const projectArchive = [
    { title: 'Hotel Booking System — DBMS Lab', course: 'DBMS Lab', description: 'Full-featured hotel booking with normalized schema up to 3NF, stored procedures, triggers, and a Node.js REST API. Won best project in batch.', techStack: ['MySQL', 'Node.js', 'Express', 'React'], repoLink: 'github.com/campusos/dbms-hotel-2024', grade: 'A+', batch: '2024', authorName: 'Ananya Singh', authorId: 'dummy_u04' },
    { title: 'Multi-Threaded Web Server — OS Lab', course: 'OS Lab', description: 'HTTP/1.1 web server in C supporting concurrent connections via thread pool. Benchmarked against nginx. Learned mutex, semaphores, and process scheduling hands-on.', techStack: ['C', 'POSIX Threads', 'Socket Programming'], repoLink: 'github.com/campusos/os-webserver-2024', grade: 'A', batch: '2024', authorName: 'Karthik Iyer', authorId: 'dummy_u09' },
    { title: 'Mini Compiler for C Subset — Compiler Design', course: 'Compiler Design', description: 'Lexer + parser + semantic analyzer + code generator for a subset of C. Outputs MIPS assembly. Our parser handles operator precedence correctly with a proper grammar.', techStack: ['Python', 'PLY Lexer', 'MIPS'], repoLink: 'github.com/campusos/mini-compiler-2023', grade: 'A+', batch: '2023', authorName: 'Saurabh Rao', authorId: 'dummy_u14' },
    { title: 'E-Commerce Platform — Full Stack Lab', course: 'Web Technologies Lab', description: 'React frontend, Node.js backend, PostgreSQL. Includes auth, product catalog, cart, payments simulation, and admin dashboard. Deployed on Vercel + Supabase.', techStack: ['React', 'Node.js', 'PostgreSQL', 'Vercel'], repoLink: 'github.com/campusos/ecom-fullstack-2024', grade: 'A', batch: '2024', authorName: 'Vikram Reddy', authorId: 'dummy_u05' },
    { title: 'CNN Image Classifier — ML Lab', course: 'Machine Learning Lab', description: 'Built from scratch (no Keras). Forward + backward propagation, batch norm, dropout in pure NumPy. Achieved 89% on CIFAR-10 without framework magic.', techStack: ['Python', 'NumPy', 'Matplotlib'], repoLink: 'github.com/campusos/cnn-scratch-2024', grade: 'A+', batch: '2024', authorName: 'Ishaan Malhotra', authorId: 'dummy_u12' },
    { title: 'Peer-to-Peer File Sharing — CN Lab', course: 'Computer Networks Lab', description: 'BitTorrent-inspired P2P file sharing using UDP. Implements tracker, seeder, leecher architecture. Tested with files up to 2GB. Handles churn (nodes leaving mid-transfer).', techStack: ['Python', 'UDP Sockets', 'Multi-threading'], repoLink: 'github.com/campusos/p2p-fileshare-2023', grade: 'A', batch: '2023', authorName: 'Nikhil Tiwari', authorId: 'dummy_u20' },
    { title: 'Data Warehouse for Student Analytics — DW Lab', course: 'Data Warehousing Lab', description: 'Built a star schema data warehouse for tracking student performance trends across semesters. Includes ETL pipeline and Tableau dashboard.', techStack: ['PostgreSQL', 'Python', 'Tableau', 'Apache Airflow'], repoLink: 'github.com/campusos/student-dw-2024', grade: 'A', batch: '2024', authorName: 'Tanvi Agarwal', authorId: 'dummy_u15' },
    { title: 'Android Expense Tracker — Mobile Dev Lab', course: 'Mobile Application Development', description: 'Full-featured expense tracker with category analysis, monthly budgets, and offline-first sync using Room DB and Firebase. Clean MVVM architecture.', techStack: ['Kotlin', 'Android', 'Room DB', 'Firebase'], repoLink: 'github.com/campusos/expense-tracker-android-2024', grade: 'A+', batch: '2024', authorName: 'Pooja Chandra', authorId: 'dummy_u19' },
  ]
  for (const pa of projectArchive) await addDocument('projectArchive', pa)

  // ── Campus Repositories (8) ───────────────────────────────────────────────
  const repositories = [
    { title: 'CampusOS UI Component Library', description: 'Reusable React components built for campus applications — cards, modals, badges, skeletons. Tailwind-based. Dark mode first.', techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook'], repoLink: 'github.com/campusos/ui-components', stars: 47, forks: 12, authorName: 'Arjun Sharma', authorId: 'dummy_u01' },
    { title: 'PyTorch Training Pipeline Template', description: 'Production-grade ML training template with experiment tracking, checkpointing, mixed precision, and W&B integration. Used in 5+ campus projects.', techStack: ['Python', 'PyTorch', 'Weights & Biases', 'Docker'], repoLink: 'github.com/campusos/pytorch-template', stars: 89, forks: 31, authorName: 'Priya Patel', authorId: 'dummy_u02' },
    { title: 'DSA Visualizer', description: 'Interactive visualizations for 30+ algorithms: sorting, graph traversal, DP, trees. Helps understand algorithm mechanics visually.', techStack: ['React', 'D3.js', 'TypeScript'], repoLink: 'github.com/campusos/dsa-visualizer', stars: 124, forks: 43, authorName: 'Rohit Kumar', authorId: 'dummy_u03' },
    { title: 'Campus Event Bot — Discord + WhatsApp', description: 'Automated bot that scrapes campus notice board and posts updates to Discord and WhatsApp groups. Saves checking the notice board manually.', techStack: ['Python', 'Discord.py', 'BeautifulSoup', 'WhatsApp API'], repoLink: 'github.com/campusos/campus-event-bot', stars: 34, forks: 8, authorName: 'Vikram Reddy', authorId: 'dummy_u05' },
    { title: 'Ollama Chat UI — Open Source', description: 'Beautiful chat interface for Ollama (local LLMs). Features: conversation history, model switching, markdown, code highlighting. Works offline.', techStack: ['React', 'TypeScript', 'Ollama', 'Tailwind CSS'], repoLink: 'github.com/campusos/ollama-chat-ui', stars: 203, forks: 67, authorName: 'Shreya Nair', authorId: 'dummy_u06' },
    { title: 'Rust HTTP Benchmarking Tool', description: 'CLI tool to benchmark HTTP endpoints with concurrency, latency percentiles, and flamegraph generation. Faster than wrk for our use cases.', techStack: ['Rust', 'Tokio', 'CLI'], repoLink: 'github.com/campusos/rust-bench', stars: 28, forks: 5, authorName: 'Saurabh Rao', authorId: 'dummy_u14' },
    { title: 'K8s Campus Lab Setup Scripts', description: 'One-command setup for a local Kubernetes cluster for learning. Includes sample microservices, monitoring (Prometheus + Grafana), and lab exercises.', techStack: ['Kubernetes', 'Helm', 'Docker', 'Shell'], repoLink: 'github.com/campusos/k8s-lab-setup', stars: 56, forks: 19, authorName: 'Rahul Bansal', authorId: 'dummy_u11' },
    { title: 'Quantum Circuit Simulator', description: 'Pure Python quantum circuit simulator without Qiskit. Supports up to 20 qubits, all standard gates, and measurement simulation. Good for learning quantum from scratch.', techStack: ['Python', 'NumPy', 'Matplotlib'], repoLink: 'github.com/campusos/quantum-sim', stars: 41, forks: 14, authorName: 'Divya Krishnan', authorId: 'dummy_u10' },
  ]
  for (const repo of repositories) await addDocument('repositories', repo)

  // ── Internship Reviews (8) ────────────────────────────────────────────────
  const internshipReviews = [
    { company: 'Google', role: 'Software Engineering Intern (L3)', stipend: '₹2,80,000/mo', rating: 5, review: 'Best internship experience possible. Amazing mentorship, cutting-edge tech (worked on Google Search infrastructure), and incredible learning. My host was a Staff SWE who reviewed every PR personally. Converted to full-time.', interviewProcess: '3 rounds: online assessment (DSA) → 2 tech rounds (LeetCode hard, system design). Leetcode 250+ is minimum prep.', isAnonymous: false, authorName: 'Karthik Iyer', authorId: 'dummy_u09', tags: ['Dream Company', 'Excellent Mentorship', 'Highly Technical', 'High Return Offer'] },
    { company: 'Microsoft', role: 'AI Research Intern', stipend: '₹1,80,000/mo', rating: 4, review: 'Research internship on LLM evaluation benchmarks. Published a workshop paper. Microsoft Research India team is world-class. Minor con: bureaucratic processes for accessing compute resources.', interviewProcess: '2 rounds: project portfolio review + research discussion. No LeetCode — they care about your projects and ideas.', isAnonymous: false, authorName: 'Priya Patel', authorId: 'dummy_u02', tags: ['Research', 'Publications', 'AI/ML', 'Great Mentorship'] },
    { company: 'Flipkart', role: 'SDE Intern', stipend: '₹80,000/mo', rating: 4, review: 'Worked on the supply chain optimization team. Real impact — my feature went to 5M users. Hectic pace, expect 10-12 hour days during sprint end. Great learning and excellent PPO process.', interviewProcess: '2 technical rounds (DSA heavy, Flipkart-style system design). They love distributed systems questions.', isAnonymous: true, authorName: 'Anonymous', authorId: 'dummy_u20', tags: ['High Impact', 'Fast-Paced', 'Good PPO Rate', 'Startup Culture'] },
    { company: 'Razorpay', role: 'Backend Engineering Intern', stipend: '₹60,000/mo', rating: 5, review: 'Incredible experience. I was treated like a full-time engineer from day 1. Shipped a payments reconciliation microservice in Go. Team is brilliant and super collaborative. Strong PPO offer.', interviewProcess: '1 DSA round + 1 system design focused on distributed systems and payments. Emphasis on first principles thinking.', isAnonymous: false, authorName: 'Nikhil Tiwari', authorId: 'dummy_u20', tags: ['FinTech', 'High Responsibility', 'Go', 'Excellent Culture'] },
    { company: 'Ola Electric', role: 'ML Infrastructure Intern', stipend: '₹50,000/mo', rating: 3, review: 'Interesting work on battery analytics ML pipeline. Managers were helpful. Con: startup chaos — project pivoted mid-internship and half my work got scrapped. Mixed bag overall.', interviewProcess: '2 rounds: ML fundamentals + coding. They asked about MLOps tools, model monitoring, and feature stores.', isAnonymous: true, authorName: 'Anonymous', authorId: 'dummy_u08', tags: ['Startup', 'ML Infrastructure', 'Unpredictable', 'EV Industry'] },
    { company: 'DRDO', role: 'AI Research Trainee', stipend: '₹15,000/mo', rating: 3, review: 'Unique experience working on a defense NLP project. The research problem was fascinating. Bureaucratic culture made things slow, and compensation is low. But the security clearance and defense AI exposure is unlike anything else.', interviewProcess: 'Academic interview + security clearance process. Focus on research background, not LeetCode.', isAnonymous: true, authorName: 'Anonymous', authorId: 'dummy_u13', tags: ['Research', 'Government', 'NLP', 'Unique Experience', 'Low Stipend'] },
    { company: 'Zepto', role: 'Full Stack Intern', stipend: '₹45,000/mo', rating: 4, review: 'Fast-moving quick commerce startup. Worked on the dark store inventory system using React and Go. Things move insanely fast — I deployed to production in my first week. Great learning, real ownership.', interviewProcess: '1 technical round (React + Node fundamentals, 1 DSA problem). Culture fit interview. Very startup-style, no formal process.', isAnonymous: false, authorName: 'Vikram Reddy', authorId: 'dummy_u05', tags: ['Quick Commerce', 'Fast-Paced', 'Real Ownership', 'Startup'] },
    { company: 'Atlassian', role: 'Software Engineer Intern', stipend: '₹1,50,000/mo', rating: 5, review: 'Remote internship from Bangalore. Worked on Jira Cloud performance improvements — reduced page load by 40%. Incredible work-life balance, amazing culture. Every engineer I met was brilliant and humble.', interviewProcess: '2 rounds online (LeetCode medium), 1 behavioral round. Atlassian values values-fit heavily — know their values.', isAnonymous: false, authorName: 'Rahul Bansal', authorId: 'dummy_u11', tags: ['Remote', 'Work-Life Balance', 'High Stipend', 'Great Culture'] },
  ]
  for (const ir of internshipReviews) await addDocument('internshipReviews', ir)

  // ── Reports (5) ───────────────────────────────────────────────────────────
  const reports = [
    { type: 'Spam', contentType: 'post', reason: 'This question appears to be copied verbatim from StackOverflow without attribution or context.', reporterName: 'Rohit Kumar', reporterId: 'dummy_u03', priority: 'low' },
    { type: 'Fake Achievement', contentType: 'achievement', reason: 'This internship claim at Google seems suspicious — no one from our batch received a Google offer this cycle. Please verify.', reporterName: 'Anonymous', reporterId: 'dummy_u09', priority: 'high' },
    { type: 'Harassment', contentType: 'message', reason: 'Received inappropriate and threatening messages from this user after declining their collaboration request.', reporterName: 'Anonymous', reporterId: 'dummy_u08', priority: 'high' },
    { type: 'Misinformation', contentType: 'knowledge-base', reason: 'The OS cheatsheet has incorrect information about Banker\'s Algorithm — the resource allocation matrix example is wrong.', reporterName: 'Karthik Iyer', reporterId: 'dummy_u09', priority: 'medium' },
    { type: 'Spam', contentType: 'opportunity', reason: 'This "internship opportunity" appears to be a phishing link. The company name doesn\'t match any known org.', reporterName: 'Ananya Singh', reporterId: 'dummy_u04', priority: 'high' },
  ]
  for (const r of reports) await addDocument('reports', r)
}

// ─── Game Mechanics: XP / Pies / Level ────────────────────────────────────────

export const XP_PER_LEVEL = 500

export const awardXP = async (uid, amount) => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return
  const data = snap.data()
  const newXP = (data.xp || 0) + amount
  const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
  await updateDoc(doc(db, 'users', uid), { xp: newXP, level: newLevel })
  return newXP
}

export const awardPies = (uid, amount) =>
  updateDoc(doc(db, 'users', uid), { pies: increment(amount) })

export const spendPies = async (uid, amount) => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return false
  const pies = snap.data().pies || 0
  if (pies < amount) return false
  await updateDoc(doc(db, 'users', uid), { pies: increment(-amount) })
  return true
}

// ─── Quest System ────────────────────────────────────────────────────────────

export const DAILY_QUESTS = [
  { id: 'q1', icon: '🔗', label: 'SPEC MATCH',    desc: 'Connect with 1 student from a different spec', xp: 50,  action: 'connect'  },
  { id: 'q2', icon: '📦', label: 'PROJECT POST',  desc: 'Post an update in Build in Public',            xp: 40,  action: 'post'     },
  { id: 'q3', icon: '🤝', label: 'TEAMMATE FIND', desc: 'Send a collab request to someone new',         xp: 30,  action: 'collab'   },
  { id: 'q4', icon: '📣', label: 'DAILY STANDUP', desc: 'Post your daily standup update',               xp: 20,  action: 'standup'  },
  { id: 'q5', icon: '💬', label: 'SEND MESSAGE',  desc: 'Send a message to a classmate',                xp: 25,  action: 'message'  },
  { id: 'q6', icon: '🔥', label: 'STREAK KEEP',   desc: 'Complete at least 3 quests today',             xp: 100, action: 'streak'   },
]

export const getTodayStr = () => new Date().toISOString().slice(0, 10)

export const getQuestProgress = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return { questsDone: [], questsCompletedDate: '' }
  const data = snap.data()
  const today = getTodayStr()
  if (data.questsCompletedDate !== today) {
    return { questsDone: [], questsCompletedDate: today }
  }
  return { questsDone: data.questsDone || [], questsCompletedDate: data.questsCompletedDate }
}

export const completeQuest = async (uid, questId, xpAmount) => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return
  const data = snap.data()
  const today = getTodayStr()
  const alreadyDone = data.questsCompletedDate === today ? (data.questsDone || []) : []
  if (alreadyDone.includes(questId)) return

  const newDone = [...alreadyDone, questId]
  const newXP = (data.xp || 0) + xpAmount
  const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
  const newPies = (data.pies || 0) + Math.floor(xpAmount / 10)

  await updateDoc(doc(db, 'users', uid), {
    questsDone: newDone,
    questsCompletedDate: today,
    xp: newXP,
    level: newLevel,
    pies: newPies,
  })
  return { newDone, newXP, newPies }
}

export const undoQuest = async (uid, questId, xpAmount) => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return
  const data = snap.data()
  const today = getTodayStr()
  if (data.questsCompletedDate !== today) return
  const alreadyDone = data.questsDone || []
  if (!alreadyDone.includes(questId)) return

  const newDone = alreadyDone.filter(id => id !== questId)
  const newXP = Math.max(0, (data.xp || 0) - xpAmount)
  const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
  const newPies = Math.max(0, (data.pies || 0) - Math.floor(xpAmount / 10))

  await updateDoc(doc(db, 'users', uid), {
    questsDone: newDone,
    xp: newXP,
    level: newLevel,
    pies: newPies,
  })
}

// ─── Feed Posts ───────────────────────────────────────────────────────────────

export const createFeedPost = (data) => addDocument('feedPosts', data)

export const subscribeToFeed = (callback) => {
  const q = query(collection(db, 'feedPosts'), orderBy('createdAt', 'desc'), limit(30))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const celebratePost = (postId, uid) =>
  updateDoc(doc(db, 'feedPosts', postId), { celebrations: arrayUnion(uid) })

export const uncelebratePost = (postId, uid) =>
  updateDoc(doc(db, 'feedPosts', postId), { celebrations: arrayRemove(uid) })

// ─── Store / Inventory ────────────────────────────────────────────────────────

export const STORE_CATALOG = [
  { id: 'squad_shield',  name: 'SQUAD SHIELD',   icon: '🛡️', desc: 'Protect your squad rank if you miss a day. Equip up to 2.', price: 200, maxOwn: 2 },
  { id: 'xp_booster',   name: '2X XP BOOSTER',  icon: '🚀', desc: 'Double XP on all quests for 24 hours.', price: 50,  maxOwn: 5 },
  { id: 'streak_freeze', name: 'STREAK FREEZE',  icon: '❄️', desc: 'Save your streak for one missed day.', price: 100, maxOwn: 3 },
  { id: 'name_badge',   name: 'CUSTOM BADGE',   icon: '🏷️', desc: 'Show a custom colored badge on your profile.', price: 300, maxOwn: 1 },
]

export const purchaseStoreItem = async (uid, itemId) => {
  const item = STORE_CATALOG.find(i => i.id === itemId)
  if (!item) return { success: false, reason: 'Item not found' }

  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return { success: false, reason: 'User not found' }
  const data = snap.data()

  const pies = data.pies || 0
  if (pies < item.price) return { success: false, reason: 'Not enough Pies' }

  const inv = data.storeItems || []
  const owned = inv.filter(i => i === itemId).length
  if (owned >= item.maxOwn) return { success: false, reason: 'Already at max quantity' }

  await updateDoc(doc(db, 'users', uid), {
    pies: increment(-item.price),
    storeItems: arrayUnion(itemId),
  })
  return { success: true }
}

// ─── Friends / Follow ─────────────────────────────────────────────────────────

export const followUser = async (myUid, theirUid) => {
  await updateDoc(doc(db, 'users', myUid),    { following: arrayUnion(theirUid) })
  await updateDoc(doc(db, 'users', theirUid), { followers: arrayUnion(myUid)   })
  await createNotification(theirUid, {
    type: 'follow',
    message: 'started following you',
    fromUid: myUid,
  })
}

export const unfollowUser = async (myUid, theirUid) => {
  await updateDoc(doc(db, 'users', myUid),    { following: arrayRemove(theirUid) })
  await updateDoc(doc(db, 'users', theirUid), { followers: arrayRemove(myUid)   })
}

export const subscribeToFollowing = (uid, callback) => {
  return onSnapshot(doc(db, 'users', uid), snap => {
    if (snap.exists()) callback(snap.data().following || [])
  })
}

// ─── Notifications (create helper) ────────────────────────────────────────────

export const createNotification = (uid, { type, message, fromUid, link }) =>
  addDoc(collection(db, 'notifications'), {
    userId: uid,
    type,
    message,
    fromUid: fromUid || null,
    link: link || null,
    read: false,
    createdAt: serverTimestamp(),
  })

export const markAllNotificationsRead = async (uid) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', uid),
    where('read', '==', false)
  )
  const snap = await getDocs(q)
  const batch = snap.docs.map(d => updateDoc(d.ref, { read: true }))
  await Promise.all(batch)
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const subscribeToLeaderboard = (callback, limitCount = 50) => {
  const q = query(
    collection(db, 'users'),
    orderBy('xp', 'desc'),
    limit(limitCount)
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() })))
  )
}

// ─── Campus Events ────────────────────────────────────────────────────────────

export const createEvent = (data) => addDocument('events', data)

export const subscribeToEvents = (callback) => {
  const q = query(collection(db, 'events'), orderBy('eventDate', 'asc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const rsvpEvent = (eventId, uid) =>
  updateDoc(doc(db, 'events', eventId), { rsvps: arrayUnion(uid) })

export const unrsvpEvent = (eventId, uid) =>
  updateDoc(doc(db, 'events', eventId), { rsvps: arrayRemove(uid) })

// ─── Online Presence ──────────────────────────────────────────────────────────

export const setOnline = (uid) =>
  updateDoc(doc(db, 'users', uid), { isOnline: true, lastSeen: serverTimestamp() }).catch(() => {})

export const setOffline = (uid) =>
  updateDoc(doc(db, 'users', uid), { isOnline: false, lastSeen: serverTimestamp() }).catch(() => {})
