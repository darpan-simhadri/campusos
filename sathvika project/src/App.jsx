import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MainLayout } from './layouts/MainLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import SkillDirectory from './pages/SkillDirectory'
import ProblemPool from './pages/ProblemPool'
import Messages from './pages/Messages'
import StudyGroups from './pages/StudyGroups'
import Opportunities from './pages/Opportunities'
import AchievementWall from './pages/AchievementWall'
import ProjectShowcase from './pages/ProjectShowcase'
import Challenges from './pages/Challenges'
import AIStudyBuddy from './pages/AIStudyBuddy'
import Polls from './pages/Polls'
import LostFound from './pages/LostFound'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function OnboardingRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (profile?.onboardingComplete) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, profile } = useAuth()
  if (user) {
    if (!profile?.onboardingComplete) return <Navigate to="/onboarding" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/skills" element={<SkillDirectory />} />
        <Route path="/problem-pool" element={<ProblemPool />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/study-groups" element={<StudyGroups />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/achievements" element={<AchievementWall />} />
        <Route path="/projects" element={<ProjectShowcase />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/ai-buddy" element={<AIStudyBuddy />} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/CampusOS/">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
