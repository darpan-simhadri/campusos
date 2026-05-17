import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider } from './context/AppContext'
import { ByteProvider } from './context/ByteContext'
import { MainLayout } from './layouts/MainLayout'

// Auth pages
import Login     from './pages/Login'
import Register  from './pages/Register'
import Onboarding from './pages/Onboarding'

// Matiks-style main pages (bottom nav)
import Arena   from './pages/Arena'
import Compete from './pages/Compete'
import Quests  from './pages/Quests'
import Feed    from './pages/Feed'
import More    from './pages/More'

// Feature pages (accessible from More)
import Store            from './pages/Store'
import Friends          from './pages/Friends'
import Dashboard        from './pages/Dashboard'
import SkillDirectory   from './pages/SkillDirectory'
import ProblemPool      from './pages/ProblemPool'
import Messages         from './pages/Messages'
import StudyGroups      from './pages/StudyGroups'
import Opportunities    from './pages/Opportunities'
import AchievementWall  from './pages/AchievementWall'
import ProjectShowcase  from './pages/ProjectShowcase'
import Challenges       from './pages/Challenges'
import AIStudyBuddy     from './pages/AIStudyBuddy'
import Polls            from './pages/Polls'
import LostFound        from './pages/LostFound'
import Profile          from './pages/Profile'
import Admin            from './pages/Admin'
import SOSBoard         from './pages/SOSBoard'
import PeerSkillExchange from './pages/PeerSkillExchange'
import IdeaValidation   from './pages/IdeaValidation'
import BuildInPublic    from './pages/BuildInPublic'
import KnowledgeBase    from './pages/KnowledgeBase'
import ProjectArchive   from './pages/ProjectArchive'
import CampusGitHub     from './pages/CampusGitHub'
import InternshipReviews from './pages/InternshipReviews'
import Leaderboard from './pages/Leaderboard'
import Events from './pages/Events'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
      <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '2px solid #2a2a2a', borderTopColor: '#C8F135' }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function OnboardingRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (profile?.onboardingComplete) return <Navigate to="/arena" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, profile } = useAuth()
  if (user) {
    if (!profile?.onboardingComplete) return <Navigate to="/onboarding" replace />
    return <Navigate to="/arena" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Navigate to="/arena" replace />} />

      {/* Public auth pages */}
      <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"   element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

      {/* All authenticated pages share the mobile-first MainLayout */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        {/* Bottom nav tabs */}
        <Route path="/arena"   element={<Arena />} />
        <Route path="/compete" element={<Compete />} />
        <Route path="/quests"  element={<Quests />} />
        <Route path="/feed"    element={<Feed />} />
        <Route path="/more"    element={<More />} />

        {/* Utility pages */}
        <Route path="/store"   element={<Store />} />
        <Route path="/friends" element={<Friends />} />

        {/* Feature pages (accessible from More) */}
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/skills"           element={<SkillDirectory />} />
        <Route path="/problem-pool"     element={<ProblemPool />} />
        <Route path="/messages"         element={<Messages />} />
        <Route path="/study-groups"     element={<StudyGroups />} />
        <Route path="/opportunities"    element={<Opportunities />} />
        <Route path="/achievements"     element={<AchievementWall />} />
        <Route path="/projects"         element={<ProjectShowcase />} />
        <Route path="/challenges"       element={<Challenges />} />
        <Route path="/ai-buddy"         element={<AIStudyBuddy />} />
        <Route path="/polls"            element={<Polls />} />
        <Route path="/lost-found"       element={<LostFound />} />
        <Route path="/profile/:id"      element={<Profile />} />
        <Route path="/admin"            element={<Admin />} />
        <Route path="/sos-board"        element={<SOSBoard />} />
        <Route path="/skill-exchange"   element={<PeerSkillExchange />} />
        <Route path="/ideas"            element={<IdeaValidation />} />
        <Route path="/build-in-public"  element={<BuildInPublic />} />
        <Route path="/knowledge-base"   element={<KnowledgeBase />} />
        <Route path="/project-archive"  element={<ProjectArchive />} />
        <Route path="/campus-github"    element={<CampusGitHub />} />
        <Route path="/internships"      element={<InternshipReviews />} />
        <Route path="/leaderboard"      element={<Leaderboard />} />
        <Route path="/events"           element={<Events />} />
      </Route>

      <Route path="*" element={<Navigate to="/arena" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/CampusOS/">
      <ThemeProvider>
        <AppProvider>
          <AuthProvider>
            <ByteProvider>
              <AppRoutes />
            </ByteProvider>
          </AuthProvider>
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
