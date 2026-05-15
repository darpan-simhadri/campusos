import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser)
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            const data = snap.data()
            // Auto-update streak on login
            const today = todayStr()
            const lastLogin = data.lastLoginDate || ''
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
            let newStreak = data.streak || 0
            if (lastLogin !== today) {
              newStreak = lastLogin === yesterday ? newStreak + 1 : 1
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                streak: newStreak,
                lastLoginDate: today,
              })
            }
            setProfile({ ...data, streak: newStreak })
          } else {
            // Admin or manually created account with no Firestore doc
            setProfile({ role: 'admin', fullName: firebaseUser.email, onboardingComplete: true })
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error('Auth load error:', err)
        if (firebaseUser) {
          setUser(firebaseUser)
          setProfile({ role: 'admin', fullName: firebaseUser.email, onboardingComplete: true })
        }
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  const register = async ({ fullName, registrationNumber, email, password, branch, section, phoneNumber }) => {
    const regSnap = await getDoc(doc(db, 'registrationNumbers', registrationNumber))
    if (regSnap.exists()) throw new Error('Registration number already in use.')

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const uid = cred.user.uid

    const userData = {
      uid,
      fullName,
      registrationNumber,
      email,
      branch,
      section,
      phoneNumber: phoneNumber || '',
      role: 'student',
      skills: [],
      achievements: [],
      profileImage: '',
      bio: '',
      githubLink: '',
      collaborationAvailable: true,
      reputation: 0,
      badges: [],
      studyInterests: [],
      onboardingComplete: false,
      // Game fields
      pies: 100,
      xp: 0,
      streak: 0,
      level: 1,
      lastLoginDate: todayStr(),
      notifications: [],
      friends: [],
      following: [],
      followers: [],
      storeItems: [],
      questsCompletedDate: '',
      questsDone: [],
      createdAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'users', uid), userData)
    await setDoc(doc(db, 'registrationNumbers', registrationNumber), { uid, email })
    setProfile(userData)
    return cred
  }

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (snap.exists()) setProfile(snap.data())
    return cred
  }

  const logout = () => signOut(auth)

  const refreshProfile = async () => {
    if (!user) return
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) setProfile(snap.data())
  }

  const updateProfile = async (data) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), data)
    setProfile(p => ({ ...p, ...data }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '2px solid #2a2a2a', borderTopColor: '#C8F135' }} />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
