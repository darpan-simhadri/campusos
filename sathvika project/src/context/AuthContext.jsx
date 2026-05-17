import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) setProfile(snap.data())
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
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

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
