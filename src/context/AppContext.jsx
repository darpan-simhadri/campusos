import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { INITIAL_VOTING_QUEUE, AI_NEWS, MOCK_OPPONENTS } from '../data/duelContent'

const today = () => new Date().toISOString().slice(0, 10)

// XP thresholds per level: [0,100,250,500,900,1400,2000,2750,3600,4500,6000]
const LEVEL_XP = [0, 100, 250, 500, 900, 1400, 2000, 2750, 3600, 4500, 6000]
const DIVISION_XP = { Open: 0, 'Div3': 500, 'Div2': 1500, 'Div1': 3000 }

function computeLevel(xp) {
  let lvl = 1
  for (let i = 1; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) lvl = i + 1
    else break
  }
  return lvl
}

function computeDivision(xp) {
  if (xp >= 3000) return 'Div1'
  if (xp >= 1500) return 'Div2'
  if (xp >= 500)  return 'Div3'
  return 'Open'
}

const MOCK_TICKER = [
  { id: 1, text: '⚡ Arjun won a Prompt Wars duel · 2m ago' },
  { id: 2, text: '🏗️ Karthik completed the Profile Card build · 5m ago' },
  { id: 3, text: '🤝 Neural Nomads squad formed · 12m ago' },
  { id: 4, text: '📰 Priya decoded today\'s ArXiv paper · 18m ago' },
  { id: 5, text: '🗳️ 47 votes cast in the last hour · ongoing' },
]

const defaultState = {
  ticker:          MOCK_TICKER,
  votingQueue:     INITIAL_VOTING_QUEUE,
  votesGiven:      [],        // duel IDs the user has voted on
  duelHistory:     [],
  sprintScores:    [],
  heatmap:         {},
  unlockedAchievements: [],
  notifications:   [],
  aiNews:          AI_NEWS,
  pendingCelebrations: [], // level-up, division-up events to show as overlays
}

function loadState() {
  try {
    const saved = localStorage.getItem('campusOS_v3')
    if (saved) return { ...defaultState, ...JSON.parse(saved) }
  } catch {}
  return defaultState
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TICKER': {
      const item = { id: Date.now(), text: action.payload }
      return { ...state, ticker: [item, ...state.ticker].slice(0, 20) }
    }
    case 'ADD_DUEL_RESULT': {
      const r = { ...action.payload, date: today(), id: Date.now() }
      return { ...state, duelHistory: [r, ...state.duelHistory].slice(0, 50) }
    }
    case 'ADD_SPRINT_SCORE': {
      const s = { ...action.payload, date: today(), id: Date.now() }
      const updated = [...state.sprintScores, s].sort((a, b) => b.score - a.score).slice(0, 20)
      return { ...state, sprintScores: updated }
    }
    case 'TRACK_ACTIVITY': {
      const key = today()
      return { ...state, heatmap: { ...state.heatmap, [key]: (state.heatmap[key] || 0) + 1 } }
    }
    case 'UNLOCK_ACHIEVEMENT': {
      if (state.unlockedAchievements.includes(action.payload)) return state
      return { ...state, unlockedAchievements: [...state.unlockedAchievements, action.payload] }
    }
    case 'ADD_NOTIFICATION': {
      const n = { id: Date.now(), read: false, ...action.payload }
      return { ...state, notifications: [n, ...state.notifications].slice(0, 30) }
    }
    case 'MARK_NOTIFS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }
    case 'ADD_TO_VOTING_QUEUE': {
      const exists = state.votingQueue.some(v => v.id === action.payload.id)
      if (exists) return state
      return { ...state, votingQueue: [action.payload, ...state.votingQueue].slice(0, 10) }
    }
    case 'CAST_VOTE': {
      return {
        ...state,
        votesGiven: [...state.votesGiven, action.payload.duelId],
        votingQueue: state.votingQueue.filter(v => v.id !== action.payload.duelId),
      }
    }
    case 'ADD_CELEBRATION': {
      return { ...state, pendingCelebrations: [...state.pendingCelebrations, action.payload] }
    }
    case 'POP_CELEBRATION': {
      return { ...state, pendingCelebrations: state.pendingCelebrations.slice(1) }
    }
    default: return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  // Persist (skip ticker — it's ephemeral)
  useEffect(() => {
    const { ticker, pendingCelebrations, ...persist } = state
    try { localStorage.setItem('campusOS_v3', JSON.stringify(persist)) } catch {}
  }, [state])

  const addTickerItem     = useCallback((text) => dispatch({ type: 'ADD_TICKER', payload: text }), [])
  const addDuelResult     = useCallback((r)    => dispatch({ type: 'ADD_DUEL_RESULT', payload: r }), [])
  const addSprintScore    = useCallback((s)    => dispatch({ type: 'ADD_SPRINT_SCORE', payload: s }), [])
  const trackActivity     = useCallback(()     => dispatch({ type: 'TRACK_ACTIVITY' }), [])
  const unlockAchievement = useCallback((id)   => dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: id }), [])
  const addNotification   = useCallback((n)    => dispatch({ type: 'ADD_NOTIFICATION', payload: n }), [])
  const markNotifsRead    = useCallback(()     => dispatch({ type: 'MARK_NOTIFS_READ' }), [])
  const addToVotingQueue  = useCallback((d)    => dispatch({ type: 'ADD_TO_VOTING_QUEUE', payload: d }), [])
  const castVote          = useCallback((duelId, winner) => dispatch({ type: 'CAST_VOTE', payload: { duelId, winner } }), [])
  const popCelebration    = useCallback(()     => dispatch({ type: 'POP_CELEBRATION' }), [])

  // ── The Ripple Effect ─────────────────────────────────────────────────────
  const ripple = useCallback(async ({
    action,          // string key e.g. 'duel_won', 'sprint_done'
    xpAmount = 0,
    userName = 'You',
    duelResult = null,   // { type, challenge, playerA, playerB, outputA, outputB } — adds to voting queue
    tickerText = null,
    feedPost = null,     // passed back to caller for Firebase write
    firebaseUpdateFn = null, // async fn(newXP, newPies) → writes to Firebase
    profile = null,
    updateProfile = null,
  }) => {
    // 1. Track activity (heatmap)
    trackActivity()

    // 2. Ticker
    if (tickerText) addTickerItem(tickerText)

    // 3. XP — handled externally via Firebase, we just check for level/division changes
    if (profile && xpAmount > 0) {
      const oldXP  = profile.xp || 0
      const newXP  = oldXP + xpAmount
      const oldDiv = computeDivision(oldXP)
      const newDiv = computeDivision(newXP)
      const oldLvl = computeLevel(oldXP)
      const newLvl = computeLevel(newXP)

      if (newLvl > oldLvl) {
        dispatch({ type: 'ADD_CELEBRATION', payload: { type: 'level_up', level: newLvl } })
        addNotification({ message: `🎉 Level up! You're now Level ${newLvl}!`, link: '/dashboard' })
        addTickerItem(`⬡ ${userName} reached Level ${newLvl}!`)
      }
      if (newDiv !== oldDiv) {
        dispatch({ type: 'ADD_CELEBRATION', payload: { type: 'division_up', division: newDiv } })
        addNotification({ message: `🏆 Promoted to ${newDiv}! New challenges unlocked.`, link: '/compete' })
        addTickerItem(`🏆 ${userName} promoted to ${newDiv}!`)
      }
    }

    // 4. Notifications by action
    const notifMap = {
      duel_won:   { message: `⚔️ You won a duel! +${xpAmount} XP`, link: '/arena' },
      sprint_done:{ message: `⚡ Sprint done! +${xpAmount} XP earned`, link: '/arena' },
      voted:      { message: '🗳️ Thanks for judging! +5 XP', link: '/arena' },
      paper_decoded: { message: '📰 Paper decoded! Quest complete.', link: '/feed' },
    }
    if (notifMap[action]) addNotification(notifMap[action])

    // 5. Voting queue — if a duel was completed, add it for others to vote on
    if (duelResult) {
      addToVotingQueue({ ...duelResult, id: `vq_${Date.now()}`, timestamp: Date.now() })
    }

    // 6. Duel history
    if (duelResult) addDuelResult({ action, xp: xpAmount, ...duelResult })
  }, [trackActivity, addTickerItem, addNotification, addToVotingQueue, addDuelResult])

  const getRandomOpponent = useCallback(() => {
    return MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)]
  }, [])

  return (
    <AppContext.Provider value={{
      ...state,
      addTickerItem, addDuelResult, addSprintScore, trackActivity,
      unlockAchievement, addNotification, markNotifsRead,
      addToVotingQueue, castVote, popCelebration,
      ripple, getRandomOpponent,
      unreadNotifications: state.notifications.filter(n => !n.read).length,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
