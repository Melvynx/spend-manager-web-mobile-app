import { useState } from 'react'
import { categoryMeta } from '../lib/categories.js'

const COMMON_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'JPY']
const PAYMENT_METHODS = ['Card', 'Cash', 'Other']

const inputClass =
  'w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40'
const labelClass =
  'block text-[13px] font-medium text-gray-500 mb-1 break-words dark:text-gray-400'

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

// `initial` uses the keys of an expense: shop, date, amount, currency,
// vatRate, vatAmount, category, paymentMethod, note.
export default function ExpenseForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
}) {
  const [shop, setShop] = useState(initial.shop || '')
  const [date, setDate] = useState(initial.date || '')
  const [amount, setAmount] = useState(
    initial.amount != null ? String(initial.amount) : ''
  )
  const [currency, setCurrency] = useState(initial.currency || 'EUR')
  const [category, setCategory] = useState(
    initial.category || categories[0] || 'Other'
  )
  const [vatRate, setVatRate] = useState(
    initial.vatRate != null && initial.vatRate !== '' ? String(initial.vatRate) : ''
  )
  const [vatAmount, setVatAmount] = useState(
    initial.vatAmount != null && initial.vatAmount !== ''
      ? String(initial.vatAmount)
      : ''
  )
  const [paymentMethod, setPaymentMethod] = useState(initial.paymentMethod || '')
  const [note, setNote] = useState(initial.note || '')
  const [error, setError] = useState('')

  // The category detected by the AI may no longer be in the list: add it.
  const categoryOptions = categories.includes(category)
    ? categories
    : [category, ...categories]

  function handleSubmit(e) {
    e.preventDefault()
    if (isSubmitting) return

    const amountNum = parseFloat(String(amount).replace(',', '.'))
    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid amount (greater than 0).')
      return
    }
    onSubmit({
      shop: shop.trim(),
      date,
      amount: amountNum,
      currency: (currency || 'EUR').trim().toUpperCase(),
      vatRate: vatRate === '' ? null : parseFloat(String(vatRate).replace(',', '.')),
      vatAmount:
        vatAmount === '' ? null : parseFloat(String(vatAmount).replace(',', '.')),
      category,
      paymentMethod,
      note: note.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 max-w-full flex flex-col gap-4">
      <Field label="Store / merchant">
        <input
          className={inputClass}
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          placeholder="e.g. Paul's Bakery"
        />
      </Field>

      <Field label="Expense date">
        <input
          type="date"
          className={inputClass}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        <Field label="Amount (incl. tax)">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Currency">
          <input
            className={inputClass}
            value={currency}
            list="currency-list"
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="EUR"
          />
          <datalist id="currency-list">
            {COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Category">
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {categoryMeta(c).emoji} {c}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        <Field label="VAT (%)">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            className={inputClass}
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            placeholder="20"
          />
        </Field>
        <Field label="VAT amount">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className={inputClass}
            value={vatAmount}
            onChange={(e) => setVatAmount(e.target.value)}
            placeholder="0.00"
          />
        </Field>
      </div>

      <Field label="Payment method">
        <select
          className={inputClass}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">— Not specified —</option>
          {PAYMENT_METHODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Note (optional)">
        <textarea
          className={inputClass + ' resize-none'}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Client lunch"
        />
      </Field>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 break-words dark:text-red-300 dark:bg-red-950/40">{error}</p>
      )}

      <div className="flex flex-col gap-3 pt-1 min-[360px]:flex-row">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={`min-w-0 flex-1 rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-600 active:scale-[0.98] transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 ${
              isSubmitting ? 'opacity-60' : ''
            }`}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={`min-w-0 flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-sm active:scale-[0.98] transition ${
            isSubmitting ? 'opacity-70' : ''
          }`}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
