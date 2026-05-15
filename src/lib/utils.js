export function cn(...inputs) {
  return inputs
    .flat(Infinity)
    .filter(v => typeof v === 'string' && v.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
