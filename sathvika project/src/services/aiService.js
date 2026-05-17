import { OLLAMA_URL, OLLAMA_MODEL } from '../data/constants'

export async function* streamOllama(messages, model = OLLAMA_MODEL) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  })

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter(Boolean)
    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        if (json.message?.content) yield json.message.content
        if (json.done) return
      } catch {}
    }
  }
}

export async function askOllama(prompt, context = '', model = OLLAMA_MODEL) {
  const messages = []
  if (context) messages.push({ role: 'system', content: context })
  messages.push({ role: 'user', content: prompt })

  let result = ''
  for await (const chunk of streamOllama(messages, model)) {
    result += chunk
  }
  return result
}

export async function checkOllamaConnection() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

export async function getAvailableModels() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`)
    if (!res.ok) return []
    const data = await res.json()
    return data.models?.map(m => m.name) || []
  } catch {
    return []
  }
}
