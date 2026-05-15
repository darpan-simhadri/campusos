import { MOCK_CLAUDE_OUTPUTS } from '../data/duelContent'

function mockDelay(ms = 2200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomMock() {
  return MOCK_CLAUDE_OUTPUTS[Math.floor(Math.random() * MOCK_CLAUDE_OUTPUTS.length)]
}

export async function runPrompt(userPrompt, { signal } = {}) {
  const key = import.meta.env.VITE_ANTHROPIC_KEY

  if (!key) {
    await mockDelay()
    return randomMock()
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    await mockDelay(800)
    return randomMock()
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? randomMock()
}
