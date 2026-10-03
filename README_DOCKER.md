# FLS School - Déploiement Docker (Guide Utilisateur & Ami)

Ce guide explique comment lancer et tester l'ensemble de l'application **FLS School** (Base de données MongoDB, Backend NestJS et Frontend React) dans des conteneurs Docker.

---

## 🚀 Méthode 1 : Lancement avec Docker Compose (Recommandé)

Si vous partagez le dossier du projet (ou archive `.zip` / dépôt Git) :

### Prérequis
- [Docker](https://docs.docker.com/get-docker/) et **Docker Compose** installés sur votre machine.

💡 **Astuce** : Pour générer automatiquement l'archive zip légère à envoyer, lancez simplement :
```bash
./package-project.sh 1
```
Cela produit directement le fichier `fls-school-docker.zip` (~480 Ko) prêt à être envoyé par email, Telegram ou WhatsApp !

### Étapes de démarrage (pour vous ou votre ami)

1. Ouvrez un terminal dans la racine du projet (`tm_school`) :
   ```bash
   cd tm_school
   ```

2. Construisez et lancez les conteneurs :
   ```bash
   docker compose up --build -d
   ```

3. Accédez à l'application dans votre navigateur :
   - **Frontend (Application Web)** : [http://localhost:5173](http://localhost:5173)
   - **Swagger API (Documentation)** : [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### Identifiants de connexion par défaut
- **Administrateur** :
  - **Email** : `admin@fls.school`
  - **Mot de passe** : `ChangeMe123!`
- **Espace Parent** :
  - Accessible sur [http://localhost:5173/parent](http://localhost:5173/parent)
  - L'administrateur crée les identifiants d'un élève depuis sa fiche ou la liste des élèves (bouton **Accès Parent**). Le mot de passe aléatoire est visible et copiable à tout moment par l'administrateur.
  - Le parent accède à :
    1. **L'emploi du temps** (selon les horaires configurés sur les groupes d'étude).
    2. **L'assiduité / Historique des présences et absences** (avec mention spéciale pour les séances d'essai gratuites).
    3. **L'historique des paiements**.

> **Note :** La base de données est automatiquement pré-remplie au premier démarrage grâce à `SEED_ON_STARTUP=true` (administrateur, niveaux, classes, matières, professeurs, groupes, élèves et séances de test).

---

## 📦 Méthode 2 : Exporter et envoyer les images Docker (Archive `.tar`)

Si vous souhaitez envoyer à votre ami un seul fichier contenant directement toutes les images Docker prêtes à l'emploi (sans qu'il ait besoin de compiler ou de télécharger Node/npm) :

### 1. Sur votre machine (Création de l'archive)
1. Construisez d'abord les images :
   ```bash
   docker compose build
   docker pull mongo:7
   ```
2. Exportez les images dans un fichier archive :
   ```bash
   docker save fls-frontend:latest fls-backend:latest mongo:7 -o fls-school-images.tar
   ```
3. Envoyez à votre ami :
   - Le fichier `fls-school-images.tar`
   - Le fichier `docker-compose.yml`

### 2. Sur la machine de votre ami
1. Chargez les images dans Docker :
   ```bash
   docker load -i fls-school-images.tar
   ```
2. Démarrez l'application :
   ```bash
   docker compose up -d
   ```
3. Ouvrez [http://localhost:5173](http://localhost:5173).

---

## 🛠️ Commandes utiles

### Voir les logs des conteneurs
```bash
# Tous les logs en temps réel
docker compose logs -f

# Logs du backend uniquement
docker compose logs -f backend

# Logs du frontend uniquement
docker compose logs -f frontend
```

### Réinitialiser / Recharger les données de test (Seed)
```bash
# Recharger les données sans supprimer la base
docker compose exec backend npm run db:seed

# Réinitialiser complètement la base de données avec les données initiales
docker compose exec backend npm run db:reset
```

### Arrêter les conteneurs
```bash
# Arrêter les conteneurs (conserve les données dans le volume)
docker compose down

# Arrêter les conteneurs et supprimer toutes les données de la base
docker compose down -v
```
