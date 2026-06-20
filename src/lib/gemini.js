import { blobToBase64 } from './image.js'

// Direct call to the Google Gemini API from the browser.
// The API key comes from Settings (stored locally on the device).
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

// Sends a generateContent request to Gemini and returns the already-parsed JSON.
// Centralizes error handling: throws an Error whose message is a code
// (NO_API_KEY, BAD_API_KEY, BAD_MODEL, RATE_LIMIT, NETWORK, EMPTY, PARSE, ...).
async function generateContent({ apiKey, model, body }) {
  if (!apiKey) throw new Error('NO_API_KEY')

  const url = `${ENDPOINT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('NETWORK')
  }

  if (!res.ok) {
    let detail = ''
    try {
      const err = await res.json()
      detail = err?.error?.message || ''
    } catch {
      /* ignore */
    }
    if (res.status === 400 && /api[\s_-]?key/i.test(detail)) throw new Error('BAD_API_KEY')
    if (res.status === 401 || res.status === 403) throw new Error('BAD_API_KEY')
    if (res.status === 404) throw new Error('BAD_MODEL')
    if (res.status === 429) throw new Error('RATE_LIMIT')
    throw new Error('API_ERROR:' + (detail || res.status))
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('EMPTY')

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('PARSE')
  }
}

// Analyzes a photo of a receipt/invoice and returns the extracted information.
// Returns an object: { shop, date, amount, currency, vatRate, vatAmount,
// category, paymentMethod, note }.
export async function extractReceipt({
  imageBlob,
  apiKey,
  model,
  categories,
  defaultCurrency,
}) {
  if (!apiKey) throw new Error('NO_API_KEY')

  const base64 = await blobToBase64(imageBlob)
  const categoryList = categories && categories.length ? categories : ['Other']

  const prompt = [
    'You are an assistant that reads cash receipts and invoices.',
    'Analyze the image and extract the expense information.',
    'Important rules:',
    '- amount: the TOTAL paid (tax included), as a number with a decimal point (e.g. 12.90).',
    `- currency: ISO 4217 code (e.g. EUR, USD, CHF, GBP). If not visible, use ${defaultCurrency || 'EUR'}.`,
    '- vatRate: the main VAT percentage as a number (e.g. 20, 10, 5.5). If unknown, 0.',
    '- vatAmount: the VAT amount in the currency, as a number. If unknown, 0.',
    '- shop: the merchant name. If unreadable, empty string.',
    '- date: the expense date in YYYY-MM-DD format. If missing, empty string.',
    `- category: choose STRICTLY the most relevant one from this list: ${categoryList.join(', ')}.`,
    "- paymentMethod: 'Card', 'Cash' or 'Other' if visible, otherwise empty string.",
    "- note: short description (e.g. 'Lunch', 'Fuel fill-up'), otherwise empty string.",
    'Do not guess unreadable information: leave an empty value or 0.',
  ].join('\n')

  const schema = {
    type: 'object',
    properties: {
      shop: { type: 'string' },
      date: { type: 'string' },
      amount: { type: 'number' },
      currency: { type: 'string' },
      vatRate: { type: 'number' },
      vatAmount: { type: 'number' },
      category: { type: 'string', enum: categoryList },
      paymentMethod: { type: 'string' },
      note: { type: 'string' },
    },
    required: ['shop', 'amount', 'currency', 'category'],
  }

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64 } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0,
    },
  }

  return generateContent({ apiKey, model, body })
}

// Analyzes the current state of the expenses (summary provided as text) and
// returns a small, fun observation along with a joke.
// Returns an object: { analysis, joke }.
export async function analyzeSpending({ summary, apiKey, model }) {
  if (!apiKey) throw new Error('NO_API_KEY')

  const prompt = [
    "You are a kind, playful accountant who comments on the user's spending.",
    'Here is a summary of the expenses recorded in their app:',
    summary || 'No expenses yet.',
    '',
    'Reply in English with:',
    '- analysis: a short, fun observation (1 to 2 sentences) about the current state of the spending.',
    '- joke: a light, friendly little joke related to these expenses or to saving money.',
    'Stay positive, never preachy, and keep a light tone.',
  ].join('\n')

  const schema = {
    type: 'object',
    properties: {
      analysis: { type: 'string' },
      joke: { type: 'string' },
    },
    required: ['analysis', 'joke'],
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 1,
    },
  }

  return generateContent({ apiKey, model, body })
}

// Translates a technical error code into a human-readable message for the user.
export function geminiErrorMessage(error) {
  const code = (error && error.message) || ''
  if (code === 'NO_API_KEY')
    return 'No API key. Add your Google key in Settings to enable automatic analysis.'
  if (code === 'BAD_API_KEY')
    return 'Invalid or rejected API key. Check your key in Settings.'
  if (code === 'BAD_MODEL')
    return 'Model not found. Check the model name in Settings (e.g. gemini-3.1-flash-lite).'
  if (code === 'RATE_LIMIT')
    return 'Too many requests right now. Try again in a few moments.'
  if (code === 'NETWORK')
    return 'No internet connection. Check your connection and try again.'
  if (code === 'EMPTY' || code === 'PARSE')
    return "The AI couldn't read this receipt. You can enter the details manually."
  return 'An error occurred during analysis. You can enter the details manually.'
}
