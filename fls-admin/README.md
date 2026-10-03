# FLS School — Panneau d'Administration (React)

Interface d'administration moderne, réactive et en français pour la gestion scolaire de **First Line School (FLS)**.

---

## 🚀 Technologies

- **Framework** : React 18 + Vite + TypeScript (mode strict)
- **Styling** : Tailwind CSS v3.4 + shadcn/ui (style `default`, base `slate`, variables CSS actives)
- **Routage** : React Router v6 (`createBrowserRouter`)
- **Gestion d'état serveur** : `@tanstack/react-query` v5
- **Client HTTP** : Axios avec intercepteur d'authentification Bearer et gestion centralisée des erreurs
- **Formulaires & Validation** : React Hook Form + Zod + `@hookform/resolvers`
- **Graphiques** : Recharts (`AreaChart` d'évolution, `PieChart` donut de répartition)
- **Icônes** : Lucide React
- **Dates** : `date-fns` avec la locale française (`fr`)
- **Notifications** : Sonner toasts
- **Typographie** : Plus Jakarta Sans (`@fontsource-variable/plus-jakarta-sans`)

---

## 📦 Installation & Démarrage

### 1. Prérequis
- Node.js 18+ et npm
- Backend NestJS démarré sur `http://localhost:3000` (avec MongoDB)

### 2. Configuration environnement
Créer le fichier `.env` à la racine de `fls-admin/` :
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Installation des dépendances
```bash
npm install
```

### 4. Lancer en développement
```bash
npm run dev
```
L'application démarre par défaut sur `http://localhost:5173`.

### 5. Vérification du code (Build & Lint)
```bash
# Vérification TypeScript stricte et build de production Vite
npm run build

# Vérification ESLint (0 erreur, 0 avertissement toléré)
npm run lint
```

---

## 🔑 Authentification
- Compte administrateur unique : `admin@fls.school` / `ChangeMe123!` (défini par défaut dans le backend).
- Stockage du jeton JWT dans `localStorage` sous la clé `fls_token`.
- En cas d'expiration de session (401), l'utilisateur est automatiquement redirigé vers `/login`.

---

## 📋 Fonctionnalités du Panneau

1. **Tableau de bord (`/`)** :
   - Salutation avec date et horloge dynamique (rafraîchie toutes les 30s).
   - 4 cartes de statistiques cliquables (Élèves avec indicateur de nouveaux inscrits ce mois, Niveaux, Matières, Professeurs).
   - Graphique d'évolution des effectifs (`AreaChart` Recharts avec sélecteur d'année et tooltip personnalisé).
   - Répartition des élèves par niveau (`PieChart` donut avec décompte central et légende détaillée).
   - Raccourcis d'actions rapides (`?new=1`).
   - Tables des derniers élèves inscrits, des prochains cours programmés et des dernières activités traduites en français.

2. **Niveaux & Classes (`/niveaux`)** :
   - Gestion des cycles d'enseignement (Primaire, Collège, Lycée...) ordonnés par position.
   - Gestion des classes associées avec affichage des compteurs d'élèves.
   - Règles d'intégrité référentielle affichées en cas de conflit (409).

3. **Matières (`/matieres`)** :
   - Liste paginée avec recherche debounce et filtre par niveau / classe.
   - Formulaire d'ajout / modification avec sélection groupée par niveau.

4. **Professeurs (`/profs`, `/profs/:id`)** :
   - Répertoire des enseignants avec filtres (recherche, statut actif/inactif).
   - Fiche professeur détaillée avec historique des groupes pris en charge.

5. **Élèves (`/eleves`, `/eleves/:id`)** :
   - Fichier des élèves avec filtres synchronisés dans l'URL (recherche, niveau, classe, statut).
   - Fiche élève complète avec 3 onglets :
     - **Groupes** : groupes d'études actifs avec bouton d'inscription (`EnrollStudentDialog`).
     - **Présences** : résumé global (taux d'absence, séances suivies) et historique détaillé.
     - **Paiements** : total versé et historique complet des règlements avec ajout rapide (`PaymentFormDialog`).

6. **Groupes (`/groupes`, `/groupes/:id`)** :
   - Groupes d'études par matière et professeur avec filtre de niveau/classe.
   - Fiche groupe détaillée :
     - Onglet **Élèves** : effectif inscrit, retrait d'un élève, ajout groupé d'élèves via `AddStudentsDialog`.
     - Onglet **Séances** : séances du groupe avec bouton de planification rapide.

7. **Séances & Feuille d'Appel (`/seances`, `/seances/:id`)** :
   - Planification de séances (régulières ou d'essai gratuit) avec validation des créneaux horaires.
   - Filtre par plage de dates (par défaut la semaine en cours, bouton de réinitialisation rapide), groupe et type.
   - **Feuille d'appel interactive** (`/seances/:id`) :
     - Compteurs en temps réel (Présents / Absents).
     - Boutons d'action "Tout marquer présent" et "Tout marquer absent".
     - Boutons segmentés (Présent / Absent) pour chaque élève.
     - Détection des modifications avec indicateur visuel et alerte de fermeture de page (`beforeunload`).
     - Enregistrement atomique de l'appel via `PUT /absences/sessions/:id`.

8. **Paiements (`/paiements`)** :
   - Historique global des paiements avec recherche d'élèves asynchrone (`AsyncCombobox`) et filtre par dates.
   - Format monétaire algérien conforme : `12 500,00 DA`.

9. **Paramètres (`/parametres`) & 404** :
   - Fiche profil administrateur en lecture seule.
   - Changement sécurisé du mot de passe avec masquage/affichage par œil et validation Zod.
   - Déconnexion complète.
   - Page 404 soignée avec redirection vers le tableau de bord.

10. **Recherche Globale & Notifications** :
    - Raccourci clavier `/` pour ouvrir la recherche rapide (Élèves, Professeurs, Groupes).
    - Cloche de notifications avec badge rouge des nouvelles activités et popover de suivi.
