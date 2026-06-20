import { useRef, useState, useEffect } from 'react'
import { Camera, PencilLine, X, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import { compressImage } from '../lib/image.js'
import { extractReceipt, geminiErrorMessage } from '../lib/gemini.js'
import { todayISO } from '../lib/format.js'
import { genId } from '../lib/id.js'
import { useDragToClose } from '../lib/useDragToClose.js'

export default function AddExpenseScreen({ onClose, onGoSettings }) {
  const { settings, addExpense } = useApp()
  const fileInputRef = useRef(null)
  const { dragHandleProps, isDragging, sheetStyle } = useDragToClose(onClose)

  const [step, setStep] = useState('choose') // choose | analyzing | form
  const [imageBlob, setImageBlob] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [initial, setInitial] = useState(null)
  const [aiError, setAiError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Releases the preview URL when the screen closes
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  function emptyInitial() {
    return {
      shop: '',
      date: todayISO(),
      amount: '',
      currency: settings.defaultCurrency || 'EUR',
      vatRate: '',
      vatAmount: '',
      category: settings.categories[0] || 'Other',
      paymentMethod: '',
      note: '',
    }
  }

  function mapResult(r) {
    return {
      shop: r.shop || '',
      date: r.date || todayISO(),
      amount: r.amount != null ? r.amount : '',
      currency: (r.currency || settings.defaultCurrency || 'EUR').toUpperCase(),
      vatRate: r.vatRate ? r.vatRate : '',
      vatAmount: r.vatAmount ? r.vatAmount : '',
      category: r.category || settings.categories[0] || 'Other',
      paymentMethod: r.paymentMethod || '',
      note: r.note || '',
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allows re-selecting the same file
    if (!file) return
    setSaveError(null)

    let blob
    try {
      blob = await compressImage(file)
    } catch {
      blob = file
    }
    const url = URL.createObjectURL(blob)
    setImageBlob(blob)
    setImageUrl(url)

    // No API key: go straight to manual entry
    if (!settings.apiKey) {
      setAiError(geminiErrorMessage(new Error('NO_API_KEY')))
      setInitial(emptyInitial())
      setStep('form')
      return
    }

    setStep('analyzing')
    try {
      const result = await extractReceipt({
        imageBlob: blob,
        apiKey: settings.apiKey,
        model: settings.model,
        categories: settings.categories,
        defaultCurrency: settings.defaultCurrency,
      })
      setInitial(mapResult(result))
      setAiError(null)
    } catch (err) {
      setInitial(emptyInitial())
      setAiError(geminiErrorMessage(err))
    }
    setStep('form')
  }

  function startManual() {
    setImageBlob(null)
    setImageUrl(null)
    setAiError(null)
    setSaveError(null)
    setInitial(emptyInitial())
    setStep('form')
  }

  async function handleSubmit(values) {
    if (saving) return

    setSaveError(null)
    setSaving(true)

    const imageId = imageBlob ? genId() : null
    const expense = {
      id: genId(),
      ...values,
      imageId,
      createdAt: Date.now(),
    }

    try {
      await addExpense(expense, imageBlob)
      onClose()
    } catch {
      setSaveError(
        "Couldn't save this expense. Check the available space on your device, then try again."
      )
      setSaving(false)
    }
  }

  const title =
    step === 'form'
      ? 'Review the expense'
      : step === 'analyzing'
        ? 'Analyzing'
        : 'New expense'

  return (
    <div
      className="absolute inset-0 z-30 flex items-end justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-expense-title"
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
            <div className="w-10" />
            <h2
              id="add-expense-title"
              className="min-w-0 max-w-[calc(100%-5rem)] truncate text-center text-[17px] font-semibold text-gray-950 dark:text-gray-50"
            >
              {title}
            </h2>
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        <div
          className="min-w-0 overflow-y-auto overflow-x-hidden no-scrollbar px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        >
          {/* Step 1: choose */}
          {step === 'choose' && (
            <div className="min-w-0 flex flex-col gap-3 pb-1 pt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex min-h-44 w-full min-w-0 flex-col items-center justify-center gap-3 rounded-3xl bg-indigo-600 px-6 py-8 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.985] transition"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/16 ring-1 ring-white/18">
                  <Camera size={32} strokeWidth={2.2} />
                </span>
                <span className="text-[19px] font-semibold">Take a photo</span>
                <span className="-mt-1 text-center text-sm leading-5 text-indigo-100">
                  Scan a receipt or invoice
                </span>
              </button>

              <button
                type="button"
                onClick={startManual}
                className="flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 font-semibold text-gray-700 shadow-sm active:scale-[0.985] transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <PencilLine size={20} />
                Enter manually
              </button>

              {!settings.apiKey && (
                <button
                  type="button"
                  onClick={onGoSettings}
                  className="w-full min-w-0 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 active:scale-[0.985] transition dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  Add your API key in Settings so the AI fills in the form
                  automatically.
                </button>
              )}
            </div>
          )}

          {/* Step 2: analysis */}
          {step === 'analyzing' && (
            <div className="min-w-0 flex min-h-[360px] flex-col items-center justify-center px-5 pb-8 text-center">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Receipt"
                  className="mb-6 max-h-48 rounded-2xl bg-white object-contain shadow-md"
                />
              )}
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Loader2 className="animate-spin" size={22} />
                <Sparkles size={20} />
              </div>
              <p className="mt-3 font-semibold text-gray-800 dark:text-gray-100">
                The AI is reading your receipt…
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detecting the amount, VAT, store…
              </p>
            </div>
          )}

          {/* Step 3: verification form */}
          {step === 'form' && initial && (
            <div className="min-w-0 max-w-full pt-3">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Receipt"
                  className="mb-4 max-h-52 w-full rounded-2xl bg-white object-contain shadow-sm"
                />
              )}

              {aiError && (
                <div className="mb-4 flex min-w-0 gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
                  <AlertCircle className="shrink-0 text-amber-500 dark:text-amber-400" size={18} />
                  <p className="min-w-0 break-words text-sm text-amber-800 dark:text-amber-200">{aiError}</p>
                </div>
              )}

              {!aiError && imageUrl && (
                <div className="mb-4 flex min-w-0 gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 dark:border-indigo-900 dark:bg-indigo-950/40">
                  <Sparkles className="shrink-0 text-indigo-500 dark:text-indigo-400" size={18} />
                  <p className="min-w-0 break-words text-sm text-indigo-800 dark:text-indigo-200">
                    Information detected by the AI. Check and correct it if
                    needed before saving.
                  </p>
                </div>
              )}

              {saveError && (
                <div className="mb-4 flex min-w-0 gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900 dark:bg-red-950/30">
                  <AlertCircle className="shrink-0 text-red-500 dark:text-red-400" size={18} />
                  <p className="min-w-0 break-words text-sm text-red-800 dark:text-red-200">{saveError}</p>
                </div>
              )}

              <ExpenseForm
                initial={initial}
                categories={settings.categories}
                onSubmit={handleSubmit}
                isSubmitting={saving}
                submitLabel={saving ? 'Saving...' : 'Save'}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
