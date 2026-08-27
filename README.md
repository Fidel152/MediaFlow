# 📱 MediaFlow - Application Android Professionnelle de Téléchargement Multimédia

Application mobile Android moderne, ergonomique et conforme pour l'analyse et le téléchargement de flux vidéo et audio autorisés.

---

## 🏗️ 1. Architecture du Projet

```text
mediaflow/
│
├── frontend / src /
│   ├── components/       # Header, BottomNav, DownloadForm, DownloadCard, HistoryItem, PlayerModal
│   ├── pages/            # Home (Accueil), Downloads (En cours), History (Historique), Settings (Paramètres)
│   ├── styles/           # CSS Classique modulaire (global, home, downloads, history, settings, modal)
│   ├── services/         # API REST client, Storage, Native Bridge (Capacitor/Web Share/Haptics)
│   ├── types/            # Types TypeScript & Interfaces de données
│   └── App.tsx           # Shell applicatif mobile
│
├── backend /
│   ├── src/
│   │   ├── controllers/  # analyzeController, downloadController, historyController, licenseController
│   │   ├── routes/       # API REST endpoints (/api/analyze, /api/download, /api/history, /api/license)
│   │   ├── services/     # sourceManager, directMediaAdapter, openMediaAdapter, downloadManager
│   │   ├── middleware/   # validation des URLs, rate limiter anti-abus
│   │   └── database/     # db.ts (adaptateur DB) & schema.sql (PostgreSQL)
│   └── server.ts         # Serveur Express & API backend
│
├── android /
│   └── app /
│       ├── src/main/AndroidManifest.xml  # Permissions Scoped Storage & Intent filters
│       └── build.gradle                  # Configuration Gradle & Target SDK 34
│
├── capacitor.config.json # Configuration Capacitor (appId: com.mediaflow.app)
└── package.json
```

---

## 🚀 2. Démarrage et Test Local

### Démarrer le serveur et l'interface Web / Mobile :
```bash
npm run dev
```
L'application s'ouvre sur `http://localhost:3000`.

---

## 🗄️ 3. Configuration PostgreSQL

Le schéma de base de données complet est préparé dans `backend/database/schema.sql`.

### Tables incluses :
* `users` : Utilisateurs et appareils Android
* `licenses` : Gestion des clés de licence (Free / Pro / Enterprise)
* `downloads` : Historique et métadonnées des fichiers téléchargés
* `settings` : Préférences synchronisées

### Initialisation avec PostgreSQL :
1. Créez votre base de données :
   ```sql
   CREATE DATABASE mediaflow;
   ```
2. Exécutez le script de schéma :
   ```bash
   psql -d mediaflow -f backend/database/schema.sql
   ```
3. Définissez la variable dans votre `.env` :
   ```env
   DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/mediaflow"
   ```

---

## 📱 4. Génération de l'APK Android (Capacitor & Android Studio)

### Étape 1 : Compiler le frontend Web
```bash
npm run build
```

### Étape 2 : Initialiser la plateforme Android avec Capacitor
```bash
npx cap add android
npx cap sync
```

### Étape 3 : Ouvrir dans Android Studio
```bash
npx cap open android
```

### Étape 4 : Compiler l'APK dans Android Studio
1. **Mode Débogage (Test direct sur téléphone ou émulateur) :**
   * Dans Android Studio : Menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   * Le fichier généré se trouvera dans : `android/app/build/outputs/apk/debug/app-debug.apk`.

2. **Mode Release (Production prête pour diffusion) :**
   * Menu **Build** > **Generate Signed Bundle / APK...**
   * Sélectionnez **APK**.
   * Créez ou sélectionnez votre clé de signature (Keystore).
   * Choisissez la variante `release` et validez.
   * L'APK final signé sera prêt : `app-release.apk`.

---

## ⚖️ 5. Conformité Légale & Sécurité

* **Aucun contournement de DRM :** L'application respecte les mécanismes de sécurité et traite exclusivement les contenus dont la diffusion et l'enregistrement sont autorisés par les ayants droit (licences libres, domaine public, archives ouvertes et flux directs autorisés).
* **Scoped Storage Android :** Respecte les recommandations de confidentialité Android 13/14/15 avec les permissions multimédias granulaires (`READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`).
