// Generates a unique identifier. Uses crypto.randomUUID when possible,
// with a fallback for insecure contexts (e.g. http on a local IP).
export function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch {
      /* fallback below */
    }
  }
  return (
    'id-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  )
}
