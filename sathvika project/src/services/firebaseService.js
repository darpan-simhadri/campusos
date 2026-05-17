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

export const saveOpportunity = (oppId, uid) =>
  updateDoc(doc(db, 'opportunities', oppId), { savedBy: arrayUnion(uid) })

// ─── Achievements ─────────────────────────────────────────────────────────────

export const createAchievement = (data) => addDocument('achievements', data)

export const subscribeToAchievements = (callback) => {
  const q = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const likeAchievement = (achId, uid) =>
  updateDoc(doc(db, 'achievements', achId), { likes: arrayUnion(uid) })

// ─── Projects ─────────────────────────────────────────────────────────────────

export const createProject = (data) => addDocument('projects', data)

export const subscribeToProjects = (callback) => {
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const likeProject = (projId, uid) =>
  updateDoc(doc(db, 'projects', projId), { likes: arrayUnion(uid) })

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

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAllUsersAdmin = async () => {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const suspendUser = (uid) =>
  updateDoc(doc(db, 'users', uid), { suspended: true })

export const unsuspendUser = (uid) =>
  updateDoc(doc(db, 'users', uid), { suspended: false })
