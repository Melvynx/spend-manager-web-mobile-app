import { useMemo, useState } from 'react'
import { Download, Sparkles, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { categoryMeta, categoryColor } from '../lib/categories.js'
import { formatMoney, formatMonth, monthKey } from '../lib/format.js'
import { exportExpensesCSV } from '../lib/csv.js'
import { analyzeSpending, geminiErrorMessage } from '../lib/gemini.js'
import { genId } from '../lib/id.js'
import DonutChart from '../components/DonutChart.jsx'

// Short date + time to timestamp an AI analysis (e.g. "Jun 20, 2:30 PM").
function formatTimestamp(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function SummaryScreen({ onGoSettings }) {
  const { expenses, settings, analyses, addAnalysis, removeAnalysis } = useApp()
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)

  const { currencies, byCategory, byMonth } = useMemo(() => {
    const currencyTotals = {}
    const catTotals = {} // { currency: { category: total } }
    const monthTotals = {} // { monthKey: { currency: total } }

    for (const e of expenses) {
      const c = e.currency || 'EUR'
      const amt = Number(e.amount) || 0

      currencyTotals[c] = (currencyTotals[c] || 0) + amt

      catTotals[c] = catTotals[c] || {}
      catTotals[c][e.category] = (catTotals[c][e.category] || 0) + amt

      const mk = monthKey(e.date)
      monthTotals[mk] = monthTotals[mk] || {}
      monthTotals[mk][c] = (monthTotals[mk][c] || 0) + amt
    }

    const currencies = Object.keys(currencyTotals).sort()

    const byCategory = currencies.map((c) => {
      const total = currencyTotals[c]
      const rows = Object.entries(catTotals[c])
        .map(([category, value]) => ({
          category,
          value,
          share: total > 0 ? value / total : 0,
        }))
        .sort((a, b) => b.value - a.value)
      return { currency: c, total, rows }
    })

    const byMonth = Object.keys(monthTotals)
      .sort((a, b) => (a < b ? 1 : -1))
      .map((mk) => ({ month: mk, totals: monthTotals[mk] }))

    return { currencies, byCategory, byMonth }
  }, [expenses])

  const empty = expenses.length === 0
  const latestAnalysis = analyses[0] || null

  // Builds a text summary of the expenses to send to Gemini.
  function buildSummaryText() {
    const lines = [`Number of expenses: ${expenses.length}`]
    for (const { currency, total, rows } of byCategory) {
      lines.push(`Total ${currency}: ${formatMoney(total, currency)}`)
      for (const { category, value, share } of rows) {
        lines.push(
          `  - ${category}: ${formatMoney(value, currency)} (${Math.round(share * 100)}%)`
        )
      }
    }
    if (byMonth.length) {
      lines.push('By month:')
      for (const { month, totals } of byMonth) {
        const parts = Object.entries(totals).map(([c, v]) => formatMoney(v, c))
        lines.push(`  - ${formatMonth(month)}: ${parts.join(', ')}`)
      }
    }
    return lines.join('\n')
  }

  async function handleAnalyze() {
    if (aiLoading) return
    if (!settings.apiKey) {
      setAiError(geminiErrorMessage(new Error('NO_API_KEY')))
      return
    }
    setAiError(null)
    setAiLoading(true)
    try {
      const result = await analyzeSpending({
        summary: buildSummaryText(),
        apiKey: settings.apiKey,
        model: settings.model,
      })
      await addAnalysis({
        id: genId(),
        analysis: result.analysis || '',
        joke: result.joke || '',
        expenseCount: expenses.length,
        createdAt: Date.now(),
      })
    } catch (err) {
      setAiError(geminiErrorMessage(err))
    }
    setAiLoading(false)
  }

  return (
    <div className="min-h-full overflow-x-hidden">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Summary</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your totals by currency, category and month.
        </p>
      </header>

      {empty ? (
        <p className="text-center text-gray-400 mt-16 px-6 dark:text-gray-500">
          Add expenses to see your summary appear.
        </p>
      ) : (
        <div className="px-4 pb-8 space-y-6">
          {/* Totals by currency */}
          <section className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
            {byCategory.map(({ currency, total }) => (
              <div
                key={currency}
                className="min-w-0 bg-white rounded-2xl p-4 shadow-sm dark:bg-gray-900"
              >
                <p className="text-xs text-gray-400 dark:text-gray-500">Total {currency}</p>
                <p className="break-words text-xl font-bold leading-tight text-gray-900 dark:text-gray-50">
                  {formatMoney(total, currency)}
                </p>
              </div>
            ))}
          </section>

          {/* AI analysis: observation + joke generated by Gemini */}
          <section className="min-w-0 bg-white rounded-2xl p-4 shadow-sm dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">AI analysis</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">
              Gemini comments on the state of your spending and slips in a little
              joke.
            </p>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 font-semibold text-white shadow-sm active:scale-[0.98] transition disabled:opacity-60 disabled:active:scale-100"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {latestAnalysis ? 'Run a new analysis' : 'Analyze my spending'}
                </>
              )}
            </button>

            {aiError && (
              <div className="mt-3 flex min-w-0 gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
                <AlertCircle className="shrink-0 text-amber-500 dark:text-amber-400" size={18} />
                <div className="min-w-0">
                  <p className="break-words text-sm text-amber-800 dark:text-amber-200">{aiError}</p>
                  {!settings.apiKey && onGoSettings && (
                    <button
                      type="button"
                      onClick={onGoSettings}
                      className="mt-1 text-sm font-semibold text-amber-900 underline dark:text-amber-300"
                    >
                      Open Settings
                    </button>
                  )}
                </div>
              </div>
            )}

            {latestAnalysis && (
              <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 dark:border-indigo-900 dark:bg-indigo-950/40">
                {latestAnalysis.analysis && (
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                    {latestAnalysis.analysis}
                  </p>
                )}
                {latestAnalysis.joke && (
                  <p className="mt-2 flex gap-2 text-sm leading-relaxed text-indigo-900 dark:text-indigo-200">
                    <span aria-hidden="true">😄</span>
                    <span className="min-w-0 break-words italic">
                      {latestAnalysis.joke}
                    </span>
                  </p>
                )}
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {formatTimestamp(latestAnalysis.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAnalysis(latestAnalysis.id)}
                    className="flex items-center gap-1 text-[11px] text-gray-400 active:text-red-600 transition dark:text-gray-500"
                    aria-label="Delete this analysis"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            )}

            {analyses.length > 1 && (
              <details className="mt-3">
                <summary className="cursor-pointer list-none text-sm font-medium text-indigo-600 select-none dark:text-indigo-400">
                  Previous analyses ({analyses.length - 1})
                </summary>
                <ul className="mt-2 space-y-2">
                  {analyses.slice(1).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                          {formatTimestamp(a.createdAt)}
                        </p>
                        <p className="min-w-0 break-words text-sm italic text-gray-600 dark:text-gray-300">
                          {a.joke || a.analysis}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAnalysis(a.id)}
                        className="shrink-0 text-gray-400 active:text-red-600 transition dark:text-gray-500"
                        aria-label="Delete this analysis"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>

          {/* By category (per currency) */}
          {byCategory.map(({ currency, total, rows }) => (
            <section key={currency} className="min-w-0 bg-white rounded-2xl p-4 shadow-sm dark:bg-gray-900">
              <h3 className="font-semibold text-gray-800 mb-4 dark:text-gray-100">
                By category
                {currencies.length > 1 && (
                  <span className="text-gray-400 font-normal dark:text-gray-500"> · {currency}</span>
                )}
              </h3>

              {/* Donut chart */}
              <div className="flex justify-center mb-5">
                <DonutChart
                  data={rows.map((r) => ({
                    key: r.category,
                    value: r.value,
                    color: categoryColor(r.category),
                  }))}
                >
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Total
                  </span>
                  <span className="mt-0.5 text-lg font-bold leading-tight text-gray-900 tabular-nums break-words dark:text-gray-50">
                    {formatMoney(total, currency)}
                  </span>
                  <span className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                    {rows.length} categor{rows.length > 1 ? 'ies' : 'y'}
                  </span>
                </DonutChart>
              </div>

              {/* Detailed legend */}
              <div className="space-y-3">
                {rows.map(({ category, value, share }) => {
                  const meta = categoryMeta(category)
                  const color = categoryColor(category)
                  return (
                    <div key={category}>
                      <div className="flex items-start justify-between gap-3 text-sm mb-1.5">
                        <span className="min-w-0 flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
                          <span
                            className="shrink-0 h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="shrink-0">{meta.emoji}</span>
                          <span className="min-w-0 truncate">{category}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-semibold text-gray-900 tabular-nums dark:text-gray-50">
                            {formatMoney(value, currency)}
                          </span>
                          <span className="block text-xs text-gray-400 tabular-nums dark:text-gray-500">
                            {Math.round(share * 100)}%
                          </span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden dark:bg-gray-800">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(share * 100, 3)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

          {/* By month */}
          <section className="min-w-0 bg-white rounded-2xl p-4 shadow-sm dark:bg-gray-900">
            <h3 className="font-semibold text-gray-800 mb-3 dark:text-gray-100">By month</h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {byMonth.map(({ month, totals }) => (
                <div
                  key={month}
                  className="flex items-start justify-between gap-3 py-2.5"
                >
                  <span className="min-w-0 text-sm text-gray-600 dark:text-gray-300">
                    {formatMonth(month)}
                  </span>
                  <div className="min-w-0 flex flex-wrap gap-x-3 justify-end">
                    {Object.entries(totals).map(([c, v]) => (
                      <span key={c} className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                        {formatMoney(v, c)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => exportExpensesCSV(expenses)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-semibold text-white shadow-sm active:scale-[0.98] transition"
          >
            <Download size={20} />
            Export to CSV ({expenses.length})
          </button>
        </div>
      )}
    </div>
  )
}
