// Export expenses to CSV (comma separator + UTF-8 BOM, opens cleanly in Excel).
// Triggers a download in the browser.

function esc(value) {
  const s = value == null ? '' : String(value)
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function num(value) {
  if (value == null || value === '') return ''
  return String(value)
}

export function exportExpensesCSV(expenses) {
  const headers = [
    'Date',
    'Store',
    'Category',
    'Amount',
    'Currency',
    'VAT %',
    'VAT amount',
    'Payment method',
    'Note',
  ]

  const rows = expenses.map((e) => [
    e.date || '',
    e.shop || '',
    e.category || '',
    num((Number(e.amount) || 0).toFixed(2)),
    e.currency || '',
    num(e.vatRate),
    num(e.vatAmount != null && e.vatAmount !== '' ? Number(e.vatAmount).toFixed(2) : ''),
    e.paymentMethod || '',
    e.note || '',
  ])

  const sep = ','
  const lines = [headers, ...rows].map((r) => r.map(esc).join(sep))
  const BOM = '﻿'
  const csv = BOM + lines.join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
