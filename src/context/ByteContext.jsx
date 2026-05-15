import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const ByteContext = createContext(null)

export const byteMessages = {
  app_open_morning: ["Good morning! Let's build something today 🚀", "Rise and code! ⚡", "New day, new XP 💪"],
  app_open_night:   ["Late night grind 🌙", "The best code is written at night 🖤", "Still here? Respect 🫡"],
  app_open_return:  ["Welcome back!", "Miss me? 😏", "You're back! Let's go ⚡"],

  duel_start:    ["Let's get it 😤", "Show them what you've got!", "Time to cook 🔥"],
  duel_win:      ["LET'S GOOO! 🏆", "THAT'S WHAT I'M TALKING ABOUT!", "Unstoppable! ⚡"],
  duel_lose:     ["Next time... 💪", "We move 😤", "They got lucky. GG."],
  duel_close_win:["That was CLOSE! Heart still racing 💓", "Scraped through! 😅"],
  timer_warning: ["30 seconds left! GO GO GO!", "Hurry up! ⏱️", "Almost out of time!"],

  xp_earned:  ["+XP! Keep going 📈", "Stacking up! 💰", "Every XP counts ⚡"],
  level_up:   ["LEVEL UP! You're unstoppable 🚀", "NEW LEVEL UNLOCKED 🎮", "Getting stronger! 💪"],

  quest_complete: ["QUEST DONE! ⚡", "Checked off! 🎯", "One step closer 📈"],
  all_quests_done:["ALL QUESTS COMPLETE! Legend 🏆", "FULL CLEAR! Insane 🔥"],

  streak_3:   ["🔥 3 DAY STREAK! You're on fire!", "3 days straight! Don't stop now!"],
  streak_7:   ["7 DAYS! One full week of grinding 🔥🔥", "WEEK STREAK! Absolute unit 💪"],
  streak_lost:["Streak lost 😢 But we start again today!", "It's okay... new streak starts NOW"],

  collab_sent:   ["Collab request sent! 🤝", "Making connections! 🌐"],
  project_posted:["Project live! 🚀 Let's get some teammates!", "SHIPPED! 🎉"],
  achievement:   ["ACHIEVEMENT UNLOCKED! 🏆", "Badge earned! You're the real deal 💎"],

  vote_cast:   ["Your vote matters! +5 XP 🗳️", "Judge well! ⚖️"],
  voting_done: ["All judged! Campus appreciates you 🙏"],

  idle_random: [
    "Psst... there's a duel waiting for you 👀",
    "Your rival just earned XP... just saying 😏",
    "The leaderboard won't climb itself 📈",
    "Today's feed is 🔥 Have you checked it?",
    "3 students are looking for a teammate right now 👥",
    "Your streak is at risk after midnight 🔥",
  ],
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function ByteProvider({ children }) {
  const [mood, setMood]           = useState('idle')
  const [message, setMessage]     = useState('')
  const [showBubble, setShowBubble] = useState(false)
  const moodRef       = useRef('idle')
  const bubbleTimer   = useRef(null)
  const idleTimer     = useRef(null)

  useEffect(() => { moodRef.current = mood }, [mood])

  const triggerByte = useCallback((moodName, messageKey) => {
    const msgs = byteMessages[messageKey] || []
    const msg  = msgs.length ? pickRandom(msgs) : ''

    if (bubbleTimer.current) {
      clearTimeout(bubbleTimer.current)
      bubbleTimer.current = null
    }

    setMood(moodName)

    if (msg) {
      setMessage(msg)
      setShowBubble(true)
      bubbleTimer.current = setTimeout(() => {
        setShowBubble(false)
        setTimeout(() => setMood('idle'), 500)
        bubbleTimer.current = null
      }, 2500)
    } else {
      bubbleTimer.current = setTimeout(() => {
        setMood('idle')
        bubbleTimer.current = null
      }, 2000)
    }
  }, [])

  // Idle random messages every 45 seconds
  useEffect(() => {
    idleTimer.current = setInterval(() => {
      if (moodRef.current === 'idle') {
        triggerByte('thinking', 'idle_random')
      }
    }, 45000)
    return () => clearInterval(idleTimer.current)
  }, [triggerByte])

  // Sleep after 30s inactivity; wake on interaction
  useEffect(() => {
    let sleepTimer = setTimeout(() => setMood('sleeping'), 30000)

    const resetTimer = () => {
      clearTimeout(sleepTimer)
      if (moodRef.current === 'sleeping') {
        triggerByte('excited', 'app_open_return')
      }
      sleepTimer = setTimeout(() => setMood('sleeping'), 30000)
    }

    window.addEventListener('mousemove', resetTimer, { passive: true })
    window.addEventListener('keypress',  resetTimer, { passive: true })
    window.addEventListener('touchstart',resetTimer, { passive: true })

    return () => {
      clearTimeout(sleepTimer)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keypress',  resetTimer)
      window.removeEventListener('touchstart',resetTimer)
    }
  }, [triggerByte])

  return (
    <ByteContext.Provider value={{ mood, message, showBubble, triggerByte }}>
      {children}
    </ByteContext.Provider>
  )
}

export const useByte = () => {
  const ctx = useContext(ByteContext)
  if (!ctx) throw new Error('useByte must be used within ByteProvider')
  return ctx
}
