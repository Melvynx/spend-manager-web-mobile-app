import { useState } from 'react'
import {
  Eye,
  EyeOff,
  AlertTriangle,
  Plus,
  X,
  Trash2,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { categoryMeta } from '../lib/categories.js'

const inputClass =
  'w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40'
const labelClass =
  'block text-[13px] font-medium text-gray-500 mb-1 break-words dark:text-gray-400'

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
]

export default function SettingsScreen() {
  const { settings, updateSettings, clearAllData, expenses } = useApp()
  const [showKey, setShowKey] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  function addCategory() {
    const name = newCategory.trim()
    if (!name) return
    if (settings.categories.includes(name)) {
      setNewCategory('')
      return
    }
    updateSettings({ categories: [...settings.categories, name] })
    setNewCategory('')
  }

  function removeCategory(name) {
    updateSettings({
      categories: settings.categories.filter((c) => c !== name),
    })
  }

  function handleClearAll() {
    const ok = window.confirm(
      `Supprimer définitivement les ${expenses.length} dépense(s) et leurs photos ? Cette action est irréversible.`
    )
    if (ok) clearAllData()
  }

  return (
    <div className="min-h-full overflow-x-hidden">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Réglages
        </h1>
      </header>

      <div className="px-4 pb-8 space-y-5">
        {/* Avertissement sécurité */}
        <div className="min-w-0 flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 dark:bg-amber-950/30 dark:border-amber-900">
          <AlertTriangle
            className="text-amber-500 shrink-0 dark:text-amber-400"
            size={20}
          />
          <p className="min-w-0 break-words text-sm text-amber-800 dark:text-amber-200">
            Ta clé API est stockée uniquement sur cet appareil. Ne publie pas
            cette application en ligne avec ta clé : elle serait visible par
            tout le monde.
          </p>
        </div>

        {/* Apparence */}
        <section className="min-w-0 bg-white rounded-2xl p-4 shadow-sm dark:bg-gray-900">
          <h3 className="font-semibold text-gray-800 mb-3 dark:text-gray-100">
            Apparence
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = settings.theme === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateSettings({ theme: value })}
                  aria-pressed={active}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-[13px] font-medium transition active:scale-95 ${
                    active
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              )
            })}
          </div>

          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            « Système » suit le réglage clair / sombre de ton téléphone.
          </p>
        </section>

        {/* Intelligence artificielle */}
        <section className="min-w-0 bg-white rounded-2xl p-4 shadow-sm space-y-4 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            Intelligence artificielle
          </h3>

          <div>
            <label className={labelClass}>Clé API Google (Gemini)</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className={inputClass + ' pr-11'}
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="Colle ta clé ici"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500"
                aria-label={showKey ? 'Masquer la clé' : 'Afficher la clé'}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-flex max-w-full min-w-0 items-center gap-1 text-xs text-indigo-600 font-medium dark:text-indigo-400"
            >
              <span className="min-w-0 break-words">
                Obtenir une clé gratuite sur Google AI Studio
              </span>
              <ExternalLink className="shrink-0" size={12} />
            </a>
          </div>

          <div>
            <label className={labelClass}>Modèle</label>
            <input
              className={inputClass}
              value={settings.model}
              onChange={(e) => updateSettings({ model: e.target.value })}
              placeholder="gemini-3.1-flash-lite"
              spellCheck={false}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Par défaut : gemini-3.1-flash-lite (rapide, économique, lit les
              images). Tu peux mettre un autre modèle Gemini ici.
            </p>
          </div>

          <div>
            <label className={labelClass}>Devise par défaut</label>
            <input
              className={inputClass}
              value={settings.defaultCurrency}
              onChange={(e) =>
                updateSettings({
                  defaultCurrency: e.target.value.toUpperCase(),
                })
              }
              placeholder="EUR"
              spellCheck={false}
            />
          </div>
        </section>

        {/* Catégories */}
        <section className="min-w-0 bg-white rounded-2xl p-4 shadow-sm dark:bg-gray-900">
          <h3 className="font-semibold text-gray-800 mb-3 dark:text-gray-100">
            Catégories
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            {settings.categories.map((c) => (
              <span
                key={c}
                className={`inline-flex max-w-full min-w-0 items-center gap-1 text-sm px-2.5 py-1 rounded-full ${categoryMeta(c).color}`}
              >
                <span className="shrink-0">{categoryMeta(c).emoji}</span>
                <span className="min-w-0 truncate">{c}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(c)}
                  aria-label={`Supprimer ${c}`}
                  className="ml-0.5 shrink-0 opacity-60 hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {settings.categories.length === 0 && (
              <span className="text-sm text-gray-400 dark:text-gray-500">
                Aucune catégorie
              </span>
            )}
          </div>

          <div className="min-w-0 flex gap-2">
            <input
              className={inputClass}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCategory()
                }
              }}
              placeholder="Nouvelle catégorie"
            />
            <button
              type="button"
              onClick={addCategory}
              className="shrink-0 rounded-xl bg-indigo-600 px-4 text-white active:scale-95 transition"
              aria-label="Ajouter la catégorie"
            >
              <Plus size={20} />
            </button>
          </div>
        </section>

        {/* Données */}
        <section className="min-w-0 bg-white rounded-2xl p-4 shadow-sm dark:bg-gray-900">
          <h3 className="font-semibold text-gray-800 mb-1 dark:text-gray-100">
            Données
          </h3>
          <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">
            {expenses.length} dépense(s) stockée(s) sur cet appareil.
          </p>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={expenses.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 font-semibold text-red-600 disabled:opacity-40 active:scale-[0.98] transition dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
          >
            <Trash2 size={18} />
            Effacer toutes les données
          </button>
        </section>

        <p className="text-center text-xs text-gray-400 pt-2 dark:text-gray-500">
          Spend Manager · Données stockées localement
        </p>
      </div>
    </div>
  )
}
