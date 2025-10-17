# API de Gestion de Bibliothèque

Une API REST pour la gestion d'une bibliothèque construite avec Node.js, Express et MongoDB.

## Démarrage du projet

### Prérequis

- Node.js (version 14 ou supérieure)
- MongoDB (base de données hébergée sur MongoDB Atlas)

### Installation

```bash
# Installer les dépendances
npm install
```

### Configuration

Les variables d'environnement sont déjà configurées dans le fichier `.env` :

```env
MONGO_URI=mongodb+srv://...
PORT=3000
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
```

### Démarrage du serveur

```bash
# Démarrer le serveur
npm start

# Ou en mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

Accès au swagger sur : `http://localhost:3000/api-docs`

## Structure du projet

```
/
├── server.js              # Point d'entrée de l'application
├── index.js               # Fichier d'index alternatif
├── package.json           # Dépendances et scripts
├── .env                   # Variables d'environnement
├── .gitignore            # Fichiers ignorés par Git
└── src/
    ├── app.js             # Configuration Express (middlewares, routes)
    ├── config/
    │   └── db.js          # Configuration et connexion MongoDB
    ├── models/
    │   ├── User.js        # Modèle utilisateur
    │   ├── Book.js        # Modèle livre
    │   └── Loan.js        # Modèle emprunt
    ├── controllers/
    │   ├── authController.js    # Logique authentification
    │   ├── userController.js    # Logique utilisateurs
    │   ├── bookController.js    # Logique livres
    │   ├── loanController.js    # Logique emprunts
    │   └── statsController.js   # Logique statistiques
    ├── middlewares/
    │   ├── auth.js              # Authentification JWT et autorisation
    │   ├── validation.js        # Validation des données (express-validator)
    │   ├── errorHandler.js      # Gestion centralisée des erreurs
    │   └── rateLimiter.js       # Limitation du nombre de requêtes
    ├── routes/
    │   ├── authRoutes.js        # Routes authentification
    │   ├── userRoutes.js        # Routes utilisateurs
    │   ├── bookRoutes.js        # Routes livres
    │   ├── loanRoutes.js        # Routes emprunts
    │   └── statsRoutes.js       # Routes statistiques
    ├── services/
    │   └── statsService.js      # Services pour les statistiques
    └── utils/
        └── jwt.js               # Utilitaires JWT (génération tokens)
```

### Description des dossiers

- **config/** : Configuration de la base de données MongoDB
- **models/** : Modèles Mongoose avec schémas, validations et méthodes
- **controllers/** : Logique métier pour traiter les requêtes
- **middlewares/** : Middlewares pour l'authentification, validation, erreurs
- **routes/** : Définition des endpoints de l'API
- **services/** : Services réutilisables (statistiques, calculs)
- **utils/** : Fonctions utilitaires (JWT, helpers)

## Détail des routes

### 1. Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/api/auth/register` | Inscription d'un nouvel utilisateur | Non |
| POST | `/api/auth/login` | Connexion (retourne access + refresh token) | Non |
| POST | `/api/auth/refresh` | Rafraîchir le token d'accès | Non |
| POST | `/api/auth/logout` | Déconnexion | Oui |

### 2. Utilisateurs (`/api/users`)

| Méthode | Endpoint | Description | Auth requise | Rôle requis |
|---------|----------|-------------|--------------|-------------|
| GET | `/api/users/profile` | Voir mon profil | Oui | Tous |
| PUT | `/api/users/profile` | Modifier mon profil | Oui | Tous |
| POST | `/api/users/pay-fine` | Payer une amende | Oui | Tous |
| GET | `/api/users` | Liste de tous les utilisateurs | Oui | Bibliothécaire, Admin |
| GET | `/api/users/:id` | Détails d'un utilisateur | Oui | Bibliothécaire, Admin |
| PATCH | `/api/users/:id/status` | Modifier le statut d'un utilisateur | Oui | Bibliothécaire, Admin |

### 3. Livres (`/api/books`)

| Méthode | Endpoint | Description | Auth requise | Rôle requis |
|---------|----------|-------------|--------------|-------------|
| GET | `/api/books` | Liste paginée des livres | Non | - |
| GET | `/api/books/search?query=...` | Recherche textuelle sur titre/résumé | Non | - |
| GET | `/api/books/category/:category` | Livres par catégorie | Non | - |
| GET | `/api/books/:id` | Détails d'un livre | Non | - |
| POST | `/api/books` | Créer un nouveau livre | Oui | Bibliothécaire, Admin |
| PUT | `/api/books/:id` | Modifier un livre (complet) | Oui | Bibliothécaire, Admin |
| PATCH | `/api/books/:id` | Modification partielle d'un livre | Oui | Bibliothécaire, Admin |
| DELETE | `/api/books/:id` | Supprimer un livre (soft delete) | Oui | Admin |

### 4. Emprunts (`/api/loans`)

| Méthode | Endpoint | Description | Auth requise | Rôle requis |
|---------|----------|-------------|--------------|-------------|
| POST | `/api/loans` | Emprunter un livre | Oui | Tous |
| GET | `/api/loans/my` | Mes emprunts actifs | Oui | Tous |
| GET | `/api/loans/history` | Mon historique d'emprunts | Oui | Tous |
| PATCH | `/api/loans/:id/return` | Retourner un livre | Oui | Tous |
| PATCH | `/api/loans/:id/renew` | Renouveler un emprunt | Oui | Tous |
| GET | `/api/loans/overdue` | Liste des emprunts en retard | Oui | Bibliothécaire, Admin |
| GET | `/api/loans` | Liste de tous les emprunts | Oui | Bibliothécaire, Admin |

### 5. Statistiques (`/api/stats`)

Toutes les routes de statistiques nécessitent une authentification et le rôle Bibliothécaire ou Admin.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/stats/dashboard` | Statistiques générales du tableau de bord |
| GET | `/api/stats/top-borrowed` | Top des livres les plus empruntés |
| GET | `/api/stats/category` | Statistiques par catégorie de livres |
| GET | `/api/stats/overdue-users` | Utilisateurs avec des emprunts en retard |
| GET | `/api/stats/loan-evolution` | Évolution des emprunts dans le temps |
| GET | `/api/stats/average-duration` | Durée moyenne d'emprunt par catégorie |
| GET | `/api/stats/popular-authors` | Auteurs les plus populaires |

## Guide de test avec Postman

### Étape 1 : Configuration initiale

1. Ouvrez Postman
2. Créez une nouvelle collection "Library Management API"
3. URL de base : `http://localhost:3000`

### Étape 2 : Créer un utilisateur et se connecter

#### 2.1 Inscription

**Requête :**
- Méthode : `POST`
- URL : `http://localhost:3000/api/auth/register`
- Headers :
  ```
  Content-Type: application/json
  ```
- Body (raw JSON) :
  ```json
  {
    "firstName": "Marie",
    "lastName": "Dupont",
    "email": "marie.dupont@example.com",
    "password": "password123",
    "role": "étudiant"
  }
  ```

**Réponse attendue :** 201 Created

#### 2.2 Connexion

**Requête :**
- Méthode : `POST`
- URL : `http://localhost:3000/api/auth/login`
- Headers :
  ```
  Content-Type: application/json
  ```
- Body (raw JSON) :
  ```json
  {
    "email": "marie.dupont@example.com",
    "password": "password123"
  }
  ```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "Marie",
      "lastName": "Dupont",
      "email": "marie.dupont@example.com",
      "role": "étudiant"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**IMPORTANT :** Copiez le `accessToken` pour les requêtes suivantes.

### Étape 3 : Configurer l'authentification

Pour toutes les requêtes authentifiées, ajoutez le header :

**Option A - Onglet Headers :**
```
Authorization: Bearer <votre_accessToken>
```

**Option B - Onglet Authorization :**
1. Type : `Bearer Token`
2. Token : Collez votre accessToken

### Étape 4 : Créer un administrateur (pour tester les livres)

Répétez l'inscription avec ce body :
```json
{
  "firstName": "Admin",
  "lastName": "Bibliotheque",
  "email": "admin@library.com",
  "password": "admin123",
  "role": "admin"
}
```

Connectez-vous et copiez le token admin.

### Étape 5 : Créer un livre

**Requête :**
- Méthode : `POST`
- URL : `http://localhost:3000/api/books`
- Headers :
  ```
  Content-Type: application/json
  Authorization: Bearer <token_admin>
  ```
- Body (raw JSON) :
  ```json
  {
    "isbn": "978-2-1234-5680-3",
    "title": "JavaScript pour les nuls",
    "authors": ["Douglas Crockford", "John Resig"],
    "categories": ["Informatique"],
    "totalCopies": 5,
    "availableCopies": 5,
    "publisher": "Éditions Tech",
    "pages": 350,
    "language": "Français",
    "summary": "Un guide complet pour apprendre JavaScript"
  }
  ```

**Réponse attendue :** 201 Created avec les détails du livre et son `_id`.

**Note :** Copiez l'`_id` du livre créé.

### Étape 6 : Rechercher des livres (sans authentification)

#### 6.1 Liste paginée
- Méthode : `GET`
- URL : `http://localhost:3000/api/books?page=1&limit=10`

#### 6.2 Recherche textuelle
- Méthode : `GET`
- URL : `http://localhost:3000/api/books/search?query=javascript`

#### 6.3 Livres disponibles uniquement
- Méthode : `GET`
- URL : `http://localhost:3000/api/books?available=true`

#### 6.4 Par catégorie
- Méthode : `GET`
- URL : `http://localhost:3000/api/books/category/Informatique`

### Étape 7 : Emprunter un livre (utilisateur)

**Requête :**
- Méthode : `POST`
- URL : `http://localhost:3000/api/loans`
- Headers :
  ```
  Content-Type: application/json
  Authorization: Bearer <token_utilisateur>
  ```
- Body (raw JSON) :
  ```json
  {
    "bookId": "<id_du_livre_créé>"
  }
  ```

**Réponse attendue :** 201 Created avec les détails de l'emprunt et son `_id`.

**Note :** Copiez l'`_id` de l'emprunt.

### Étape 8 : Voir mes emprunts actifs

**Requête :**
- Méthode : `GET`
- URL : `http://localhost:3000/api/loans/my`
- Headers :
  ```
  Authorization: Bearer <token_utilisateur>
  ```

### Étape 9 : Renouveler un emprunt

**Requête :**
- Méthode : `PATCH`
- URL : `http://localhost:3000/api/loans/<id_emprunt>/renew`
- Headers :
  ```
  Authorization: Bearer <token_utilisateur>
  ```

### Étape 10 : Retourner un livre

**Requête :**
- Méthode : `PATCH`
- URL : `http://localhost:3000/api/loans/<id_emprunt>/return`
- Headers :
  ```
  Authorization: Bearer <token_utilisateur>
  ```

### Étape 11 : Voir mon profil

**Requête :**
- Méthode : `GET`
- URL : `http://localhost:3000/api/users/profile`
- Headers :
  ```
  Authorization: Bearer <token_utilisateur>
  ```

### Étape 12 : Modifier mon profil

**Requête :**
- Méthode : `PUT`
- URL : `http://localhost:3000/api/users/profile`
- Headers :
  ```
  Content-Type: application/json
  Authorization: Bearer <token_utilisateur>
  ```
- Body (raw JSON) :
  ```json
  {
    "firstName": "Marie-Claire",
    "lastName": "Dupont",
    "phone": "+33612345678",
    "address": {
      "street": "10 rue de la Paix",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France"
    }
  }
  ```

### Étape 13 : Statistiques (Admin/Bibliothécaire)

#### 13.1 Dashboard général
- Méthode : `GET`
- URL : `http://localhost:3000/api/stats/dashboard`
- Headers : `Authorization: Bearer <token_admin>`

#### 13.2 Top 10 livres empruntés
- Méthode : `GET`
- URL : `http://localhost:3000/api/stats/top-borrowed?limit=10&days=30`
- Headers : `Authorization: Bearer <token_admin>`

#### 13.3 Évolution des emprunts
- Méthode : `GET`
- URL : `http://localhost:3000/api/stats/loan-evolution?months=12`
- Headers : `Authorization: Bearer <token_admin>`

#### 13.4 Statistiques par catégorie
- Méthode : `GET`
- URL : `http://localhost:3000/api/stats/category`
- Headers : `Authorization: Bearer <token_admin>`

#### 13.5 Utilisateurs en retard
- Méthode : `GET`
- URL : `http://localhost:3000/api/stats/overdue-users`
- Headers : `Authorization: Bearer <token_admin>`

#### 13.6 Auteurs populaires
- Méthode : `GET`
- URL : `http://localhost:3000/api/stats/popular-authors`
- Headers : `Authorization: Bearer <token_admin>`

### Conseils Postman avancés

#### Variables d'environnement

Créez un environnement "Library API Local" avec ces variables :
- `base_url` : `http://localhost:3000`
- `access_token` : Votre token (mis à jour après login)
- `book_id` : ID d'un livre de test
- `loan_id` : ID d'un emprunt de test

Utilisez-les dans vos requêtes : `{{base_url}}/api/books/{{book_id}}`

#### Script de test pour auto-sauvegarder le token

Dans l'onglet **Tests** de votre requête de login, ajoutez :

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.data.accessToken);
}
```

Le token sera automatiquement sauvegardé dans vos variables d'environnement.

## Règles métier

### Emprunts
- **Durée d'emprunt :** 14 jours
- **Nombre maximum d'emprunts simultanés :** 5
- **Nombre maximum de renouvellements :** 2
- **Amende :** 0,50€ par jour de retard

### Rôles disponibles
- **étudiant** : Peut emprunter et consulter les livres
- **professeur** : Mêmes droits que l'étudiant
- **bibliothécaire** : Peut gérer les livres et voir les statistiques
- **admin** : Tous les droits, peut supprimer des livres

### Restrictions
- Les utilisateurs avec amendes impayées ne peuvent pas emprunter
- Les comptes suspendus ne peuvent pas se connecter
- Seuls les bibliothécaires et admins peuvent créer/modifier des livres

## Catégories de livres disponibles

- Roman
- Science
- Informatique
- Histoire
- Philosophie
- Art
- Biographie
- Poésie
- Théâtre
- Jeunesse
- Bande Dessinée
- Sciences Humaines
- Droit
- Économie
- Autre

## Format des réponses

### Succès
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

### Erreur
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

## Codes de statut HTTP

- `200` : Succès
- `201` : Créé avec succès
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Accès refusé (rôle insuffisant)
- `404` : Ressource non trouvée
- `429` : Trop de requêtes (rate limit)
- `500` : Erreur serveur

## Rate Limiting

- **Authentification :** 5 tentatives / 15 minutes
- **API générale :** 100 requêtes / 15 minutes

## Sécurité

- Mots de passe hashés avec bcrypt
- Protection avec Helmet (CSRF, XSS, etc.)
- Validation stricte des données avec express-validator
- Tokens JWT avec expiration
- Rate limiting sur toutes les routes sensibles

## Technologies utilisées

- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **JWT** : Authentification par tokens
- **bcryptjs** : Hachage des mots de passe
- **express-validator** : Validation des données
- **helmet** : Sécurité HTTP
- **morgan** : Logs des requêtes HTTP

## Licence

ISC
