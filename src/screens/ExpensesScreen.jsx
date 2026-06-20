import { useMemo } from 'react'
import { KeyRound, ScanLine } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import ExpenseCard from '../components/ExpenseCard.jsx'
import { formatMoney, formatMonth, monthKey } from '../lib/format.js'

export default function ExpensesScreen({ onOpen, onGoSettings }) {
  const { expenses, settings, loading } = useApp()

  const totalsByCurrency = useMemo(() => {
    const map = {}
    for (const e of expenses) {
      const c = e.currency || 'EUR'
      map[c] = (map[c] || 0) + (Number(e.amount) || 0)
    }
    return Object.entries(map)
  }, [expenses])

  const groups = useMemo(() => {
    const map = new Map()
    for (const e of expenses) {
      const key = monthKey(e.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(e)
    }
    return Array.from(map.entries())
  }, [expenses])

  return (
    <div className="min-h-full overflow-x-hidden">
      {/* En-tête */}
      <header className="px-5 pt-6 pb-4 bg-gradient-to-b from-indigo-600 to-indigo-500 text-white rounded-b-3xl">
        <p className="text-indigo-100 text-sm">Mes dépenses</p>
        <h1 className="text-2xl font-bold">Spend Manager</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {totalsByCurrency.length === 0 ? (
            <span className="text-indigo-100 text-sm">Aucune dépense enregistrée</span>
          ) : (
            totalsByCurrency.map(([currency, total]) => (
              <div
                key={currency}
                className="min-w-0 max-w-full bg-white/15 backdrop-blur rounded-2xl px-4 py-2"
              >
                <p className="text-[11px] text-indigo-100">Total {currency}</p>
                <p className="break-words text-lg font-bold leading-tight">{formatMoney(total, currency)}</p>
              </div>
            ))
          )}
        </div>
      </header>

      {/* Bannière clé API manquante */}
      {!settings.apiKey && (
        <button
          type="button"
          onClick={onGoSettings}
          className="mx-4 mt-4 w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] min-w-0 flex items-center gap-3 overflow-hidden bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-left dark:bg-amber-950/30 dark:border-amber-900"
        >
          <KeyRound className="text-amber-500 shrink-0 dark:text-amber-400" size={20} />
          <span className="min-w-0 break-words text-sm text-amber-800 dark:text-amber-200">
            Ajoute ta clé API Google dans les Réglages pour activer l'analyse
            automatique des tickets.
          </span>
        </button>
      )}

      {/* Liste */}
      <div className="px-4 py-4 pb-8">
        {loading ? (
          <p className="text-center text-gray-400 mt-10 dark:text-gray-500">Chargement…</p>
        ) : expenses.length === 0 ? (
          <div className="text-center mt-12 px-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center dark:bg-indigo-950/50">
              <ScanLine className="text-indigo-500 dark:text-indigo-400" size={30} />
            </div>
            <h2 className="mt-4 font-semibold text-gray-800 dark:text-gray-100">
              Aucune dépense pour l'instant
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Touche le bouton{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Ajouter</span> en
              bas pour scanner ton premier ticket.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(([key, items]) => (
              <section key={key}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 px-1 dark:text-gray-500">
                  {formatMonth(key)}
                </h3>
                <div className="space-y-2.5">
                  {items.map((e) => (
                    <ExpenseCard
                      key={e.id}
                      expense={e}
                      onClick={() => onOpen(e.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
