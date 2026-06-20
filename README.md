# 📸 Spend Manager

Une petite application mobile (simulée dans le navigateur) pour gérer tes notes
de frais : tu prends en photo un ticket de caisse ou une facture, l'IA **Gemini**
lit automatiquement les informations (montant, TVA, magasin, date, catégorie…),
tu vérifies, et c'est enregistré sur ton appareil.

> Projet d'apprentissage pour découvrir comment brancher une IA dans une vraie app.

---

## 🚀 Démarrer l'application

Dans un terminal, à la racine du projet :

```bash
npm install   # à faire une seule fois
npm run dev
```

Puis ouvre l'adresse affichée, par exemple **http://localhost:5173**.

- Sur **ordinateur** : l'app s'affiche dans une colonne au format mobile.
- Sur **iPhone** (même réseau Wi-Fi que l'ordinateur) : ouvre l'adresse
  **Network** affichée dans le terminal (ex : `http://192.168.1.28:5173`).
  Tu pourras alors prendre de vraies photos avec l'appareil photo.

---

## 🔑 Activer l'IA (clé API Google)

L'analyse des tickets utilise le modèle **gemini-3.1-flash-lite** de Google
(rapide et économique, il lit les images).

1. Va sur **https://aistudio.google.com/apikey** et crée une clé API gratuite.
2. Dans l'app, ouvre l'onglet **Réglages** ⚙️ et colle ta clé.
3. C'est prêt ! Touche le bouton **+** pour scanner un ticket.

Sans clé, l'app fonctionne quand même : tu saisis les dépenses à la main.

> ⚠️ **Important** : ta clé API est stockée **uniquement sur ton appareil**
> (dans le navigateur). Ne publie pas cette application en ligne avec ta clé,
> sinon elle serait visible et utilisable par n'importe qui.

---

## 🧭 Ce que tu peux faire

- **Dépenses** : la liste de tes dépenses, regroupées par mois, avec le total
  par devise.
- **+ (bouton central)** : ajouter une dépense en prenant une photo (l'IA
  remplit le formulaire) ou en saisissant à la main.
- **Résumé** 📊 : totaux par devise, par catégorie et par mois + **export CSV**
  pour envoyer à la comptabilité.
- **Réglages** ⚙️ : clé API, modèle IA, devise par défaut, gestion des
  catégories, effacement des données.

Toutes les données (dépenses **et** photos) sont stockées localement sur ton
appareil grâce à IndexedDB. Rien n'est envoyé sur un serveur, à part l'image
envoyée à Google au moment de l'analyse d'un ticket.

---

## 🛠️ Technologies

- **Vite** + **React** (interface)
- **Tailwind CSS** (style)
- **IndexedDB** via `idb` (stockage local des dépenses et des images)
- **API Google Gemini** (lecture des tickets)

## 📦 Construire la version finale

```bash
npm run build     # génère le dossier dist/
npm run preview   # prévisualise la version construite
```
