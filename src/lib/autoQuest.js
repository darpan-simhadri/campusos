// Auto-quest completion helper.
// Called from user actions (send message, post, follow) to auto-tick the matching daily quest.

import { completeQuest, getQuestProgress, DAILY_QUESTS } from '../services/firebaseService'

export async function autoCompleteQuest(uid, action, updateProfile) {
  if (!uid) return
  const quest = DAILY_QUESTS.find(q => q.action === action)
  if (!quest) return

  const { questsDone, questsCompletedDate } = await getQuestProgress(uid)
  const today = new Date().toISOString().slice(0, 10)
  const done  = questsCompletedDate === today ? questsDone : []
  if (done.includes(quest.id)) return

  const result = await completeQuest(uid, quest.id, quest.xp)
  if (result && updateProfile) {
    updateProfile({ xp: result.newXP, pies: result.newPies })
  }
  return quest
}
