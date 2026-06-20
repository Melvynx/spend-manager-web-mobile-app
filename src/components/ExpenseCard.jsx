import { categoryMeta } from '../lib/categories.js'
import { formatMoney, formatDate } from '../lib/format.js'
import { useImageUrl } from '../lib/useImageUrl.js'

export default function ExpenseCard({ expense, onClick }) {
  const meta = categoryMeta(expense.category)
  const imageUrl = useImageUrl(expense.imageId)

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-w-0 max-w-full overflow-hidden flex items-center gap-3 bg-white rounded-2xl p-3 text-left shadow-sm active:scale-[0.99] transition dark:bg-gray-900"
    >
      <div className="shrink-0 h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">{meta.emoji}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 truncate dark:text-gray-50">
          {expense.shop || 'Unnamed'}
        </p>
        <div className="min-w-0 flex items-center gap-2 mt-0.5">
          <span
            className={`max-w-[70%] truncate text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}
          >
            {expense.category}
          </span>
          <span className="min-w-0 text-xs text-gray-400 truncate dark:text-gray-500">
            {formatDate(expense.date)}
          </span>
        </div>
      </div>

      <div className="min-w-0 max-w-[48%] shrink-0 text-right">
        <p className="break-words text-sm font-bold leading-tight text-gray-900 min-[360px]:text-base dark:text-gray-50">
          {formatMoney(expense.amount, expense.currency)}
        </p>
        {expense.vatRate ? (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">VAT {expense.vatRate}%</p>
        ) : null}
      </div>
    </button>
  )
}
