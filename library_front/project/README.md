# 📚 Système de Gestion de Bibliothèque

Application web moderne de gestion de bibliothèque développée avec React, TypeScript et Vite.

## 🚀 Démarrage du projet

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Accès à l'API backend (doit être configurée et en cours d'exécution)

### Installation

1. Cloner le projet
```bash
git clone <votre-repo>
cd project
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet avec :
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_supabase
```

4. Lancer le serveur de développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build de production
```bash
npm run build
```

## 🔐 Connexion et Inscription

### Première utilisation

1. **Inscription** : Accédez à `/register`
    - Renseignez vos informations (nom, prénom, email, mot de passe)
    - Sélectionnez votre rôle (Étudiant, Professeur, Bibliothécaire, Admin)
    - Cliquez sur "S'inscrire"

2. **Connexion** : Accédez à `/login`
    - Entrez votre email et mot de passe
    - Cliquez sur "Se connecter"

### Rôles et Permissions

- **Étudiant** : Consultation des livres, emprunts personnels
- **Professeur** : Consultation des livres, emprunts personnels
- **Bibliothécaire** : Gestion complète des livres et emprunts
- **Admin** : Accès total incluant la gestion des utilisateurs

## 📱 Pages de l'application

### 🏠 Dashboard (`/`)
**Accessible à** : Tous les utilisateurs connectés

Tableau de bord principal affichant :
- Statistiques générales (nombre de livres, utilisateurs, emprunts actifs)
- Vue d'ensemble de l'activité de la bibliothèque
- Accès rapide aux différentes sections

**Fonctionnalités** :
- Cartes de statistiques avec icônes
- Affichage des métriques importantes (amendes totales, emprunts en retard)

---

### 📖 Livres (`/books`)
**Accessible à** : Tous les utilisateurs connectés

Catalogue complet des livres de la bibliothèque.

**Fonctionnalités** :
- Recherche par titre, auteur, ISBN ou catégorie
- Visualisation des détails de chaque livre
- Indication de disponibilité
- **Admin/Bibliothécaire uniquement** :
    - Ajout de nouveaux livres
    - Modification des informations
    - Suppression de livres

**Informations affichées** :
- Couverture du livre
- Titre et auteurs
- ISBN et éditeur
- Nombre d'exemplaires (total/disponibles)
- Catégories

---

### 📋 Emprunts (`/loans`)
**Accessible à** : Bibliothécaires et Admins uniquement

Gestion complète des emprunts de la bibliothèque.

**Fonctionnalités** :
- Liste de tous les emprunts (en cours, retournés, en retard)
- Recherche par emprunteur, livre ou statut
- Filtrage par statut
- Traiter les retours de livres
- Renouveler un emprunt
- Gérer les amendes

**Indicateurs visuels** :
- 🟢 Vert : Emprunts en cours dans les délais
- 🟡 Orange : Emprunts retournés
- 🔴 Rouge : Emprunts en retard

---

### 📚 Mes Emprunts (`/my-loans`)
**Accessible à** : Tous les utilisateurs connectés

Vue personnelle des emprunts de l'utilisateur connecté.

**Fonctionnalités** :
- Consultation de l'historique d'emprunts
- Détails des emprunts en cours
- Date de retour prévue
- Montant des amendes éventuelles
- Possibilité de renouveler un emprunt (si éligible)

---

### 👥 Utilisateurs (`/users`)
**Accessible à** : Admins uniquement

Gestion des comptes utilisateurs de la bibliothèque.

**Fonctionnalités** :
- Liste de tous les utilisateurs
- Recherche par nom, email ou rôle
- Consultation des détails utilisateur
- **Actions administratives** :
    - Suspendre un compte
    - Réactiver un compte
- Visualisation des statistiques d'emprunt par utilisateur

**Informations affichées** :
- Nom complet et email
- Rôle et statut du compte
- Nombre d'emprunts actifs
- Amendes en cours

---

### 📊 Statistiques (`/statistics`)
**Accessible à** : Bibliothécaires et Admins

Analyse détaillée de l'activité de la bibliothèque.

**Sections** :

1. **Top 10 Livres Empruntés**
    - Classement des livres les plus populaires
    - Nombre d'emprunts par livre

2. **Statistiques par Catégorie**
    - Répartition des livres par catégorie
    - Taux d'emprunt par catégorie
    - Nombre de livres disponibles vs empruntés

3. **Évolution des Emprunts (6 derniers mois)**
    - Graphique en barres de l'évolution mensuelle
    - Total des emprunts sur la période
    - Nombre d'emprunts actifs
    - Emprunts en retard

---

### 👤 Profil (`/profile`)
**Accessible à** : Tous les utilisateurs connectés

Gestion du profil personnel.

**Fonctionnalités** :
- Consultation des informations personnelles
- Modification de l'email et du mot de passe
- Visualisation du statut du compte
- Statistiques personnelles :
    - Emprunts actifs
    - Total d'emprunts
    - Amendes en cours

---

## 🎨 Caractéristiques techniques

- **Framework** : React 18 avec TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **Icônes** : Lucide React
- **Routage** : React Router (configuration personnalisée)
- **État** : React Context API pour l'authentification
- **API Client** : Fetch avec wrapper personnalisé

## 🔒 Sécurité

- Routes protégées par authentification
- Gestion des tokens JWT
- Vérification des rôles côté client
- Sessions persistantes avec localStorage

## 📝 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Vérifier le code avec ESLint
npm run typecheck    # Vérifier les types TypeScript
```

## 🤝 Contribution

Pour contribuer au projet :
1. Créer une branche depuis `main`
2. Effectuer vos modifications
3. Tester l'application
4. Créer une Pull Request

## 📄 License

Ce projet est développé dans un cadre éducatif.
