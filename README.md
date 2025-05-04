# 🗳️ Élections BDE - ULC-ICAM

Une application web simple et sécurisée permettant aux étudiants de l'ULC-ICAM de voter en ligne pour élire leur Bureau des Étudiants (BDE).

## 🎯 Objectif

Faciliter l’organisation des élections étudiantes tout en assurant :
- une authentification sécurisée via Google (emails ICAM uniquement),
- un vote unique par étudiant,
- une interface intuitive pour tous les utilisateurs,
- une centralisation automatique des résultats dans une Google Sheet.

## ✨ Fonctionnalités

- **Authentification Google OAuth** (via Google Identity Services).
- **Vérification d’email ICAM** : seuls les domaines `ulc-icam.com` et `icam.fr` sont acceptés.
- **Formulaire de vote clair** : choix d’un candidat ou vote blanc.
- **Validation client** : empêche soumission sans authentification ou sélection.
- **Envoi des données via Webhook n8n** vers une **Google Sheet** connectée.
- **Détection de double vote** (côté backend via Google Sheet).
- **Affichage conditionnel** :
  - Confirmation après un vote réussi.
  - Message d’erreur si l’étudiant a déjà voté.
- **Loader circulaire** pendant la soumission pour améliorer l’expérience utilisateur.

## 📤 Données enregistrées

À chaque soumission, les données suivantes sont envoyées à la Google Sheet :
- Prénom et nom (récupérés via Google)
- Email étudiant
- ID Google
- Candidat choisi
- Date et heure du vote

> ✅ Les données sont gérées via un workflow automatisé dans [n8n](https://n8n.io), qui connecte le webhook au Google Sheet sans base de données intermédiaire.

## 🔐 Règles de vote

- Un seul vote autorisé par adresse e-mail ICAM.
- Aucun changement possible après soumission.
- Tentative de double vote bloquée côté backend.

## 🛠️ Technologies utilisées

- HTML / CSS / JavaScript (Vanilla)
- Google Identity Services (OAuth 2.0)
- Webhook + Google Sheets via n8n

## 🧪 Améliorations futures

- Intégration d’un tableau d'administration (résultats en temps réel).
- Export CSV / PDF sécurisé des résultats.
- Horodatage et journalisation détaillée côté backend.

## 🤝 Contribution

Les pull requests sont les bienvenues pour améliorer la sécurité, l’accessibilité ou étendre les fonctionnalités (ex : anonymisation, comptage en direct, audit de votes).

---
