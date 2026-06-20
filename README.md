# 📸 Spend Manager

A small mobile app (simulated in the browser) to manage your expense
reports: take a photo of a receipt or invoice, the **Gemini** AI
automatically reads the details (amount, VAT, store, date, category…),
you review them, and it's saved on your device.

> A learning project to discover how to plug an AI into a real app.

---

## 🚀 Run the app

In a terminal, at the project root:

```bash
npm install   # only once
npm run dev
```

Then open the address shown, for example **http://localhost:5173**.

- On **desktop**: the app appears in a mobile-format column.
- On **iPhone** (same Wi-Fi network as the computer): open the
  **Network** address shown in the terminal (e.g. `http://192.168.1.28:5173`).
  You'll then be able to take real photos with the camera.

---

## 🔑 Enable the AI (Google API key)

Receipt analysis uses Google's **gemini-3.1-flash-lite** model
(fast and affordable, it reads images).

1. Go to **https://aistudio.google.com/apikey** and create a free API key.
2. In the app, open the **Settings** ⚙️ tab and paste your key.
3. You're all set! Tap the **+** button to scan a receipt.

Without a key, the app still works: you enter expenses manually.

> ⚠️ **Important**: your API key is stored **only on your device**
> (in the browser). Don't publish this app online with your key,
> otherwise it would be visible and usable by anyone.

---

## 🧭 What you can do

- **Expenses**: the list of your expenses, grouped by month, with the total
  per currency.
- **+ (center button)**: add an expense by taking a photo (the AI
  fills in the form) or by entering it manually.
- **Summary** 📊: totals by currency, by category and by month + **CSV export**
  to send to accounting.
- **Settings** ⚙️: API key, AI model, default currency, category
  management, data wipe.

All data (expenses **and** photos) is stored locally on your
device via IndexedDB. Nothing is sent to a server, except the image
sent to Google when analyzing a receipt.

---

## 🛠️ Technologies

- **Vite** + **React** (interface)
- **Tailwind CSS** (styling)
- **IndexedDB** via `idb` (local storage of expenses and images)
- **Google Gemini API** (receipt reading)

## 📦 Build the final version

```bash
npm run build     # generates the dist/ folder
npm run preview   # previews the built version
```
