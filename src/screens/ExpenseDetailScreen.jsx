import { useMemo, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import { categoryMeta } from '../lib/categories.js'
import { formatMoney, formatDate } from '../lib/format.js'
import { useDragToClose } from '../lib/useDragToClose.js'
import { useImageUrl } from '../lib/useImageUrl.js'

function Row({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="min-w-0 break-words text-right text-sm font-medium text-gray-900 dark:text-gray-50">{value}</span>
    </div>
  )
}

export default function ExpenseDetailScreen({ id, onClose }) {
  const { expenses, settings, updateExpense, removeExpense } = useApp()
  const expense = useMemo(() => expenses.find((e) => e.id === id), [expenses, id])
  const imageUrl = useImageUrl(expense?.imageId)
  const { dragHandleProps, isDragging, sheetStyle } = useDragToClose(onClose)
  const [editing, setEditing] = useState(false)

  // The expense may have been deleted
  if (!expense) {
    return (
      <div
        className="absolute inset-0 z-30 flex items-end justify-center overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute inset-0 bg-gray-950/20 backdrop-blur-[10px] animate-fade-in dark:bg-black/50"
          aria-label="Close"
        />
        <section
          className={`relative z-10 w-full min-w-0 max-w-full rounded-t-3xl bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 text-center shadow-[0_-8px_24px_rgba(15,23,42,0.14)] animate-sheet-up dark:bg-gray-900 ${
            isDragging ? 'select-none' : ''
          }`}
          style={sheetStyle}
        >
          <div
            {...dragHandleProps}
            className="mx-auto mb-5 flex h-6 w-24 cursor-grab touch-none items-center justify-center rounded-full active:cursor-grabbing active:scale-95 transition"
          >
            <span className="h-1.5 w-11 rounded-full bg-gray-300/90 dark:bg-gray-600" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-gray-50">Expense not found</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-2xl bg-indigo-600 py-3 font-semibold text-white active:scale-[0.985] transition"
          >
            Close
          </button>
        </section>
      </div>
    )
  }

  const meta = categoryMeta(expense.category)

  function handleSave(values) {
    updateExpense({ ...expense, ...values })
    setEditing(false)
  }

  function handleDelete() {
    const ok = window.confirm('Delete this expense? This action cannot be undone.')
    if (ok) {
      removeExpense(expense.id)
      onClose()
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-end justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-detail-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/20 backdrop-blur-[10px] animate-fade-in dark:bg-black/50"
        aria-label="Close"
      />

      <section
        className={`relative z-10 flex max-h-[88dvh] w-full min-w-0 max-w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.14)] animate-sheet-up dark:bg-gray-900 ${
          isDragging ? 'select-none' : ''
        }`}
        style={sheetStyle}
      >
        <div className="shrink-0 px-4 pb-3 pt-3">
          <div
            {...dragHandleProps}
            className="mx-auto mb-2 flex h-6 w-24 cursor-grab touch-none items-center justify-center rounded-full active:cursor-grabbing active:scale-95 transition"
          >
            <span className="h-1.5 w-11 rounded-full bg-gray-300/90 dark:bg-gray-600" />
          </div>
          <div className="flex h-11 items-center justify-between">
            <div className="w-16 min-w-0">
              {editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="h-10 rounded-full px-1 text-[15px] font-semibold text-indigo-600 active:scale-95 transition dark:text-indigo-400"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-indigo-600 active:scale-95 transition dark:bg-gray-800 dark:text-indigo-400"
                  aria-label="Edit"
                >
                  <Pencil size={18} />
                </button>
              )}
            </div>

            <h2
              id="expense-detail-title"
              className="min-w-0 max-w-[calc(100%-8rem)] truncate text-center text-[17px] font-semibold text-gray-950 dark:text-gray-50"
            >
              {editing ? 'Edit' : 'Details'}
            </h2>

            <div className="flex w-16 min-w-0 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 active:scale-95 transition dark:bg-gray-800 dark:text-gray-400"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div
          className="min-w-0 overflow-y-auto overflow-x-hidden no-scrollbar px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3"
        >
          {editing ? (
            <ExpenseForm
              initial={expense}
              categories={settings.categories}
              onSubmit={handleSave}
              submitLabel="Save changes"
            />
          ) : (
            <>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Receipt"
                  className="mb-4 max-h-72 w-full rounded-2xl bg-white object-contain shadow-sm"
                />
              )}

              <div className="mb-4 text-center">
                <span
                  className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-sm ${meta.color}`}
                >
                  <span className="shrink-0">{meta.emoji}</span>
                  <span className="min-w-0 truncate">{expense.category}</span>
                </span>
                <p className="mt-3 break-words text-3xl font-bold leading-tight text-gray-900 dark:text-gray-50">
                  {formatMoney(expense.amount, expense.currency)}
                </p>
                <p className="break-words text-gray-500 dark:text-gray-400">{expense.shop || 'Unnamed'}</p>
              </div>

              <div className="rounded-2xl bg-white px-4 shadow-sm divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                <Row label="Date" value={formatDate(expense.date)} />
                <Row label="Store" value={expense.shop} />
                <Row label="Category" value={expense.category} />
                <Row
                  label="Amount"
                  value={formatMoney(expense.amount, expense.currency)}
                />
                <Row label="Currency" value={expense.currency} />
                <Row
                  label="VAT"
                  value={expense.vatRate ? `${expense.vatRate}%` : null}
                />
                <Row
                  label="VAT amount"
                  value={
                    expense.vatAmount
                      ? formatMoney(expense.vatAmount, expense.currency)
                      : null
                  }
                />
                <Row label="Payment" value={expense.paymentMethod} />
                <Row label="Note" value={expense.note} />
              </div>

              <button
                type="button"
                onClick={handleDelete}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 font-semibold text-red-600 active:scale-[0.98] transition dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
              >
                <Trash2 size={18} />
                Delete expense
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
