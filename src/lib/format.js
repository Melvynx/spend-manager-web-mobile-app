// Formatting for money, dates and months (in English).

export function formatMoney(amount, currency) {
  const value = Number(amount) || 0
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency || ''}`.trim()
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date'
  const d = new Date(dateStr + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function monthKey(dateStr) {
  if (!dateStr) return 'unknown'
  return dateStr.slice(0, 7) // YYYY-MM
}

export function formatMonth(key) {
  if (key === 'unknown') return 'No date'
  const [y, m] = key.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function todayISO() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}
