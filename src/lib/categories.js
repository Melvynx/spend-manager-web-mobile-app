// Default category list (editable in Settings).
export const DEFAULT_CATEGORIES = [
  'Meals',
  'Transport',
  'Lodging',
  'Fuel',
  'Supplies',
  'Telecom',
  'Equipment',
  'Other',
]

// Emoji + display color for each known category.
// `hex` is the solid color used by charts (donut, bars).
const CATEGORY_META = {
  Meals: { emoji: '🍽️', color: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300', hex: '#f97316' },
  Transport: { emoji: '🚆', color: 'bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300', hex: '#3b82f6' },
  Lodging: { emoji: '🏨', color: 'bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300', hex: '#a855f7' },
  Fuel: { emoji: '⛽', color: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300', hex: '#ef4444' },
  Supplies: { emoji: '✏️', color: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300', hex: '#f59e0b' },
  Telecom: { emoji: '📱', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300', hex: '#06b6d4' },
  Equipment: { emoji: '🛠️', color: 'bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300', hex: '#64748b' },
  Other: { emoji: '🧾', color: 'bg-gray-100 text-gray-700 dark:bg-gray-400/15 dark:text-gray-300', hex: '#6b7280' },
}

// Fallback palette for custom categories (assigned in a stable way).
const FALLBACK_COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#84cc16',
  '#f43f5e', '#8b5cf6', '#0ea5e9', '#22c55e',
]

const DEFAULT_META = { emoji: '🏷️', color: 'bg-gray-100 text-gray-700 dark:bg-gray-400/15 dark:text-gray-300' }

export function categoryMeta(category) {
  return CATEGORY_META[category] || DEFAULT_META
}

// Stable solid color (hex) for a category, charts included.
export function categoryColor(category) {
  const known = CATEGORY_META[category]
  if (known) return known.hex
  let hash = 0
  for (let i = 0; i < String(category).length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}
