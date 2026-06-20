import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { DEFAULT_CATEGORIES, migrateCategoryName } from '../lib/categories.js'
import * as db from '../lib/db.js'

const AppContext = createContext(null)

const SETTINGS_KEY = 'spend-manager-settings'
const DEFAULT_MODEL = 'gemini-3.1-flash-lite'
const THEMES = ['light', 'dark', 'system']

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        apiKey: parsed.apiKey || '',
        model: parsed.model || DEFAULT_MODEL,
        defaultCurrency: parsed.defaultCurrency || 'EUR',
        theme: THEMES.includes(parsed.theme) ? parsed.theme : 'system',
        categories:
          Array.isArray(parsed.categories) && parsed.categories.length
            ? [...new Set(parsed.categories.map(migrateCategoryName))]
            : DEFAULT_CATEGORIES,
      }
    }
  } catch {
    /* ignore */
  }
  return {
    apiKey: '',
    model: DEFAULT_MODEL,
    defaultCurrency: 'EUR',
    theme: 'system',
    categories: DEFAULT_CATEGORIES,
  }
}

export function AppProvider({ children }) {
  const [expenses, setExpenses] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [settings, setSettings] = useState(loadSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.getAllExpenses().then((list) => {
      // One-time migration: rewrite legacy French category names to English so
      // expenses saved before the translation show a known English category.
      const migrated = list.map((e) => {
        const category = migrateCategoryName(e.category)
        if (category === e.category) return e
        const updated = { ...e, category }
        db.saveExpense(updated).catch(() => {})
        return updated
      })
      setExpenses(migrated)
      setLoading(false)
    })
    db.getAllAnalyses().then(setAnalyses)
  }, [])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Applies the light/dark theme on <html> (`.dark` class). In "system"
  // mode, we follow the OS preference and react to its changes.
  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const dark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && mql.matches)
      root.classList.toggle('dark', dark)
    }

    apply()
    if (settings.theme === 'system') {
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [settings.theme])

  const refresh = useCallback(async () => {
    setExpenses(await db.getAllExpenses())
  }, [])

  const refreshAnalyses = useCallback(async () => {
    setAnalyses(await db.getAllAnalyses())
  }, [])

  const addExpense = useCallback(
    async (expense, imageBlob) => {
      let expenseToSave = expense

      if (imageBlob && expense.imageId) {
        try {
          await db.saveImage(expense.imageId, imageBlob)
        } catch {
          expenseToSave = { ...expense, imageId: null }
        }
      }

      await db.saveExpense(expenseToSave)
      await refresh()
    },
    [refresh]
  )

  const updateExpense = useCallback(
    async (expense) => {
      await db.saveExpense(expense)
      await refresh()
    },
    [refresh]
  )

  const removeExpense = useCallback(
    async (id) => {
      await db.deleteExpense(id)
      await refresh()
    },
    [refresh]
  )

  const addAnalysis = useCallback(
    async (analysis) => {
      await db.saveAnalysis(analysis)
      await refreshAnalyses()
    },
    [refreshAnalyses]
  )

  const removeAnalysis = useCallback(
    async (id) => {
      await db.deleteAnalysis(id)
      await refreshAnalyses()
    },
    [refreshAnalyses]
  )

  const updateSettings = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const clearAllData = useCallback(async () => {
    await db.clearAll()
    await refresh()
    await refreshAnalyses()
  }, [refresh, refreshAnalyses])

  const value = {
    expenses,
    analyses,
    settings,
    loading,
    addExpense,
    updateExpense,
    removeExpense,
    addAnalysis,
    removeAnalysis,
    updateSettings,
    clearAllData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
