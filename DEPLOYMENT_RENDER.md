# Guide de Déploiement : Render & MongoDB Atlas

Ce guide vous accompagne pas à pas pour déployer l'application **FLS School** en production gratuitement :
- **Base de données** : MongoDB Atlas (Cluster gratuit M0)
- **Backend API (NestJS)** : Render (Web Service gratuit)
- **Frontend Web (React/Vite)** : Render (Static Site gratuit)

---

## Étape 1 : Créer la base de données sur MongoDB Atlas

1. **Créer un compte ou se connecter** sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Créer un nouveau Cluster :**
   - Cliquez sur **Create a deployment** ou **Build a Database**.
   - Choisissez l'option **M0 Free** (Gratuit à vie, 512 Mo de stockage).
   - Choisissez un fournisseur et une région proche (ex : AWS / Francfort ou Paris).
   - Donnez un nom au cluster (ex : `fls-cluster`) puis cliquez sur **Create**.
3. **Créer un utilisateur pour la base de données (Security > Quickstart) :**
   - **Username** : `fls_admin` (ou votre choix).
   - **Password** : Choisissez un mot de passe sécurisé (ex : `MonSuperMotDePasse2026!`). Notez-le bien !
   - Cliquez sur **Create Database User**.
4. **Autoriser les connexions réseau (Network Access) :**
   - Dans le menu de gauche, cliquez sur **Network Access**.
   - Cliquez sur **Add IP Address**.
   - Cliquez sur **Allow Access from Anywhere** (`0.0.0.0/0`) — *Indispensable pour que les serveurs cloud de Render puissent se connecter*.
   - Cliquez sur **Confirm**.
5. **Récupérer la chaîne de connexion (Connection String) :**
   - Dans **Database**, cliquez sur le bouton **Connect** de votre cluster.
   - Choisissez **Drivers** (Node.js).
   - Copiez l'URL de connexion qui ressemble à ceci :
     ```text
     mongodb+srv://fls_admin:<password>@fls-cluster.xxxxxx.mongodb.net/?retryWrites=true&w=majority&appName=fls-cluster
     ```
   - Remplacez `<password>` par votre mot de passe réel et ajoutez le nom de la base de données `fls_school` avant le `?` :
     ```text
     mongodb+srv://fls_admin:MonSuperMotDePasse2026!@fls-cluster.xxxxxx.mongodb.net/fls_school?retryWrites=true&w=majority
     ```
   *(Gardez cette URL sous la main pour l'étape suivante).*

---

## Étape 2 : Déploiement sur Render (render.com)

Vous avez deux méthodes au choix :

### Méthode A : Déploiement automatique via Blueprint (Recommandé - 1 Clic)

Grâce au fichier `render.yaml` déjà inclus à la racine de votre dépôt GitHub :

1. Connectez-vous sur [Render.com](https://dashboard.render.com/).
2. Cliquez sur le bouton **New +** en haut à droite et choisissez **Blueprint**.
3. Sélectionnez votre dépôt GitHub `mhmdMnwr/fls_school`.
4. Render détecte automatiquement `render.yaml` et prépare les deux services :
   - `fls-school-backend` (Web Service)
   - `fls-school-frontend` (Static Site)
5. Dans les variables demandées à l'écran :
   - **MONGODB_URI** : Collez l'URL MongoDB Atlas obtenue à l'Étape 1.
   - **VITE_API_URL** : Laissez temporairement vide ou entrez l'URL prévisionnelle du backend (ex : `https://fls-school-backend.onrender.com/api`).
6. Cliquez sur **Apply**.
7. Une fois le backend déployé, notez son URL publique (ex : `https://fls-school-backend.onrender.com`).
   - Allez dans le service frontend `fls-school-frontend` > **Environment** > définissez `VITE_API_URL` avec `https://fls-school-backend.onrender.com/api` et sauvegardez (un redéploiement automatique se lance).

---

### Méthode B : Déploiement manuel service par service

Si vous préférez créer les services manuellement dans l'interface de Render :

#### 1. Backend API (Web Service)
1. Sur Render, cliquez sur **New +** > **Web Service**.
2. Sélectionnez votre dépôt `mhmdMnwr/fls_school`.
3. Configurez les champs suivants :
   - **Name** : `fls-school-backend`
   - **Root Directory** : `fls-backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install --legacy-peer-deps && npm run build`
   - **Start Command** : `npm run start:prod`
   - **Plan** : `Free`
4. Ajoutez les variables d'environnement dans la section **Environment Variables** :
   - `MONGODB_URI` : votre URL MongoDB Atlas
   - `NODE_VERSION` : `22`
   - `JWT_SECRET` : une chaîne aléatoire sécurisée (ex : `fls-secret-prod-2026-key`)
   - `JWT_EXPIRES_IN` : `7d`
   - `ADMIN_EMAIL` : `admin@fls.school` (ou votre email)
   - `ADMIN_PASSWORD` : `ChangeMe123!` (ou votre mot de passe)
   - `CORS_ORIGIN` : `*`
5. Cliquez sur **Deploy Web Service**.
6. Une fois le déploiement terminé, copiez l'URL de votre backend (ex : `https://fls-backend-xxxx.onrender.com`).
   Vous pouvez vérifier qu'il répond en ouvrant : `https://fls-backend-xxxx.onrender.com/api/public/info`

---

#### 2. Frontend (Static Site)
1. Sur Render, cliquez sur **New +** > **Static Site**.
2. Sélectionnez le même dépôt `mhmdMnwr/fls_school`.
3. Configurez les champs :
   - **Name** : `fls-school-frontend`
   - **Root Directory** : `fls-admin`
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
4. Ajoutez la variable d'environnement :
   - `VITE_API_URL` : `https://fls-backend-xxxx.onrender.com/api` *(l'URL de votre backend avec `/api` à la fin)*
5. Dans l'onglet **Redirects / Rewrites** :
   - Le fichier `public/_redirects` inclus dans le code gère déjà automatiquement les redirections SPA (`/*` -> `/index.html` 200). Vous pouvez aussi ajouter manuellement une règle de Rewrite :
     - **Type** : `Rewrite`
     - **Source** : `/*`
     - **Destination** : `/index.html`
6. Cliquez sur **Create Static Site**.

---

## Étape 3 : Premier Démarrage & Initialisation

1. Dès le premier démarrage du backend sur Render, le hook automatique initialise le compte administrateur par défaut dans MongoDB Atlas :
   - **Email** : `admin@fls.school`
   - **Mot de passe** : `ChangeMe123!` (ou celui défini dans vos variables).
2. Ouvrez l'URL de votre frontend :
   - Page d'accueil publique : `https://fls-school-frontend.onrender.com`
   - Connexion administrateur : `https://fls-school-frontend.onrender.com/login`
   - Espace parents : `https://fls-school-frontend.onrender.com/parent`
3. Connectez-vous avec vos identifiants admin et configurez vos classes, matières, professeurs et paramètres du site !
