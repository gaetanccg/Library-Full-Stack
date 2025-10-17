# Guide d'intégration - Frontend Dashboard + API Bibliothèque

Ce document explique comment connecter le dashboard React avec votre API de gestion de bibliothèque.

## Architecture

```
┌─────────────────────┐         HTTP/REST          ┌──────────────────────┐
│   Frontend React    │  ◄──────────────────────►  │   API Backend        │
│   (Dashboard)       │    JWT Authentication      │   (Node.js/Express)  │
│   Port: 5173        │                            │   Port: 3000         │
└─────────────────────┘                            └──────────────────────┘
```

## Prérequis

### Frontend (Dashboard React)
- Node.js 18+
- npm ou yarn
- Le projet actuel avec toutes les dépendances installées

### Backend (API)
- Votre API doit être démarrée sur `http://localhost:3000`
- MongoDB doit être connecté et fonctionnel
- Les variables d'environnement de l'API doivent être configurées

## Installation et Configuration

### 1. Cloner et installer le Frontend

Le frontend est déjà configuré dans ce projet. Si ce n'est pas déjà fait :

```bash
# Installer les dépendances
npm install
```

### 2. Configuration de l'environnement

Le fichier `.env` à la racine du projet contient la configuration :

```env
VITE_API_URL=http://localhost:3000
```

**Important** : Cette variable pointe vers votre API backend. Si votre API tourne sur un autre port ou domaine, modifiez cette valeur.

### 3. Démarrer l'API Backend

Dans le répertoire de votre API, démarrez le serveur :

```bash
# Mode développement
npm run dev

# Ou mode production
npm start
```

Vérifiez que l'API est accessible sur `http://localhost:3000`

### 4. Démarrer le Frontend

Dans le répertoire du dashboard (ce projet) :

```bash
npm run dev
```

Le dashboard sera accessible sur `http://localhost:5173`

## Configuration CORS sur l'API

Pour que le frontend puisse communiquer avec l'API, vous devez configurer CORS dans votre API.

Dans le fichier `src/app.js` de votre API, ajoutez ou modifiez la configuration CORS :

```javascript
const cors = require('cors');

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL du frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Si vous voulez autoriser tous les domaines en développement :

```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Flux d'authentification

### 1. Inscription / Connexion

```
Frontend                    API
   |                         |
   |─── POST /api/auth/login ───►
   |    { email, password }  |
   |                         |
   |◄── 200 OK + JWT Tokens ──|
   |    { accessToken,       |
   |      refreshToken,      |
   |      user }             |
   |                         |
   |─── Stocke dans         |
   |    localStorage        |
```

Les tokens sont stockés dans le `localStorage` du navigateur :
- `accessToken` : Token d'accès (expire après 24h)
- `refreshToken` : Token de rafraîchissement (expire après 7 jours)

### 2. Requêtes authentifiées

Toutes les requêtes protégées incluent le header :

```
Authorization: Bearer <accessToken>
```

Le service API (`src/services/api.ts`) gère cela automatiquement.

### 3. Gestion de l'expiration

Si le token expire (401), l'utilisateur est automatiquement déconnecté et redirigé vers la page de login.

## Structure du Frontend

```
src/
├── components/           # Composants réutilisables
│   ├── Layout.tsx       # Layout principal avec navigation
│   └── ProtectedRoute.tsx # Protection des routes
├── contexts/            # Contextes React
│   └── AuthContext.tsx  # Gestion de l'authentification
├── pages/               # Pages de l'application
│   ├── Login.tsx       # Page de connexion
│   ├── Register.tsx    # Page d'inscription
│   ├── Dashboard.tsx   # Tableau de bord
│   ├── Books.tsx       # Gestion des livres
│   ├── MyLoans.tsx     # Mes emprunts
│   ├── Profile.tsx     # Profil utilisateur
│   └── Statistics.tsx  # Statistiques (admin/biblio)
├── services/            # Services API
│   └── api.ts          # Client HTTP avec gestion des tokens
├── types/               # Types TypeScript
│   └── index.ts        # Définitions des types
└── App.tsx             # Composant racine avec routing
```

## Endpoints utilisés par le Frontend

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion

### Livres
- `GET /api/books` - Liste des livres
- `GET /api/books/search?query=...` - Recherche
- `GET /api/books/:id` - Détail d'un livre
- `POST /api/books` - Créer un livre (biblio/admin)
- `PUT /api/books/:id` - Modifier un livre (biblio/admin)
- `DELETE /api/books/:id` - Supprimer un livre (admin)

### Emprunts
- `GET /api/loans/my` - Mes emprunts actifs
- `GET /api/loans/history` - Mon historique
- `POST /api/loans` - Emprunter un livre
- `PATCH /api/loans/:id/renew` - Renouveler un emprunt
- `PATCH /api/loans/:id/return` - Retourner un livre

### Utilisateur
- `GET /api/users/profile` - Mon profil
- `PUT /api/users/profile` - Modifier mon profil
- `POST /api/users/pay-fine` - Payer une amende

### Statistiques (bibliothécaire/admin)
- `GET /api/stats/dashboard` - Stats générales
- `GET /api/stats/top-borrowed` - Top livres empruntés
- `GET /api/stats/category` - Stats par catégorie
- `GET /api/stats/loan-evolution` - Évolution des emprunts

## Gestion des rôles

Le frontend adapte l'interface selon le rôle de l'utilisateur :

### Étudiant / Professeur
- Voir le catalogue de livres
- Emprunter / retourner / renouveler des livres
- Voir ses emprunts et son historique
- Gérer son profil

### Bibliothécaire
- Toutes les fonctionnalités étudiant/professeur
- Ajouter / modifier des livres
- Voir tous les emprunts
- Accéder aux statistiques

### Admin
- Toutes les fonctionnalités
- Supprimer des livres
- Gérer les utilisateurs

## Tester la connexion

### Test manuel

1. Démarrez l'API : `npm run dev` (dans le dossier API)
2. Démarrez le frontend : `npm run dev` (dans ce dossier)
3. Ouvrez `http://localhost:5173`
4. Créez un compte ou connectez-vous
5. Explorez les différentes pages

### Test avec un compte existant

Si vous avez déjà créé des comptes dans Postman, utilisez les mêmes identifiants dans le dashboard.

### Créer un compte admin (via MongoDB)

Si vous avez besoin d'un compte admin pour tester toutes les fonctionnalités :

```bash
# Connectez-vous à MongoDB et exécutez :
db.users.updateOne(
  { email: "votre@email.com" },
  { $set: { role: "admin" } }
)
```

Ou créez un compte via l'API avec Postman en spécifiant `"role": "bibliothécaire"` ou demandez à un admin existant de modifier votre rôle.

## Déploiement en Production

### Frontend

1. Modifiez `.env` pour pointer vers l'API de production :
```env
VITE_API_URL=https://votre-api-production.com
```

2. Buildez le projet :
```bash
npm run build
```

3. Déployez le contenu du dossier `dist/` sur votre hébergement (Vercel, Netlify, etc.)

### Backend

Assurez-vous que votre API est déployée et configure CORS pour accepter l'origine de votre frontend en production :

```javascript
app.use(cors({
  origin: 'https://votre-frontend-production.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Dépannage

### Problème : CORS Error

**Symptôme** : Messages d'erreur dans la console du navigateur concernant CORS

**Solution** :
1. Vérifiez que CORS est configuré dans votre API
2. Vérifiez que l'origine correspond à l'URL du frontend
3. Redémarrez l'API après avoir modifié la configuration CORS

### Problème : 401 Unauthorized

**Symptôme** : Déconnexion automatique ou erreurs 401

**Solution** :
1. Vérifiez que le JWT_SECRET est identique entre les démarrages de l'API
2. Supprimez les tokens dans le localStorage et reconnectez-vous
3. Vérifiez que les tokens n'ont pas expiré

### Problème : Cannot connect to API

**Symptôme** : Erreurs de connexion réseau

**Solution** :
1. Vérifiez que l'API tourne sur le bon port (3000)
2. Vérifiez `VITE_API_URL` dans le fichier `.env`
3. Testez l'API directement : `curl http://localhost:3000/api/books`

### Problème : Page blanche après login

**Symptôme** : La page reste blanche après connexion

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Vérifiez que tous les endpoints de l'API fonctionnent
4. Supprimez le cache du navigateur

## Support et Maintenance

### Logs du Frontend

Les erreurs sont affichées dans la console du navigateur (F12 > Console)

### Logs de l'API

Vérifiez les logs de votre serveur Node.js pour les erreurs côté backend

### Variables d'environnement

**Frontend (.env)** :
- `VITE_API_URL` : URL de l'API backend

**Backend (.env de votre API)** :
- `MONGO_URI` : Connection string MongoDB
- `PORT` : Port du serveur (3000)
- `JWT_SECRET` : Secret pour les access tokens
- `JWT_REFRESH_SECRET` : Secret pour les refresh tokens

## Fonctionnalités implémentées

- ✅ Authentification JWT complète
- ✅ Gestion des livres (CRUD)
- ✅ Système d'emprunts
- ✅ Renouvellement des emprunts
- ✅ Historique des emprunts
- ✅ Profil utilisateur modifiable
- ✅ Paiement des amendes
- ✅ Statistiques avancées (admin/biblio)
- ✅ Recherche de livres
- ✅ Responsive design
- ✅ Gestion des rôles et permissions
- ✅ Routing côté client
- ✅ Protection des routes

## Améliorations possibles

- [ ] Refresh token automatique avant expiration
- [ ] Mode hors ligne avec cache
- [ ] Notifications en temps réel
- [ ] Pagination côté serveur
- [ ] Filtres avancés de recherche
- [ ] Export de données (CSV, PDF)
- [ ] Gestion des auteurs dans l'interface
- [ ] Upload d'images de couverture
- [ ] Mode sombre
- [ ] Multi-langue (i18n)

## Contact

Pour toute question ou problème, consultez :
- La documentation de l'API (README.md de l'API)
- La console du navigateur pour les erreurs frontend
- Les logs du serveur pour les erreurs backend
