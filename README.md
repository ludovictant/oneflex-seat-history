# OneFlex — Historique d'Occupation d'une Place (Seat History)

Un snippet JavaScript léger et sans installation à exécuter dans la console DevTools de votre navigateur pour retrouver l'historique d'occupation d'une place sur **OneFlex** sur 1, 2, 3 ou 6 mois (par exemple, pour retrouver le propriétaire d'un objet oublié comme un chargeur).

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![DevTools](https://img.shields.io/badge/Console-DevTools-4285F4?logo=googlechrome&logoColor=white)

---

## 🎯 Pourquoi ce projet ?

Dans les espaces de flex office gérés par **OneFlex**, l'interface standard permet de naviguer dans les réservations jour par jour, mais ne propose pas de vue chronologique inversée pour savoir qui s'est assis à une place donnée au cours des dernières semaines ou des derniers mois.

Ce script résout ce problème en interrogeant l'API GraphQL native de OneFlex (`/api/gql`) directement depuis votre session active du navigateur.

---

## ✨ Fonctionnalités

- **Interface flottante moderne** : panneau ergonomique injecté directement par-dessus la page OneFlex.
- **Détection automatique** :
  - Détecte l'espace courant (nom et identifiant) depuis l'URL.
  - Récupère la liste ordonnée des places (`Place 1`, `Place 2`...).
  - Présélectionne automatiquement la `Place 13` si présente.
- **Période d'analyse paramétrable** :
  - 1 mois (~30 jours)
  - 2 mois (~60 jours)
  - 3 mois (~90 jours)
  - 6 mois (~180 jours)
- **Filtres intelligents** :
  - Exclusion des week-ends (jours ouvrés uniquement : Lundi à Vendredi).
  - Masquage des jours où la place était vide.
  - Masquage de vos propres réservations (nom configurable).
- **Export & Restitution** :
  - Tableau récapitulatif avec date, jour, créneau (Matin / Après-midi / Journée) et occupant.
  - Bouton **📋 Copier les noms** (copie la liste dédoublonnée des occupants dans le presse-papier).
  - Bouton **💾 Exporter CSV** pour télécharger l'historique complet.
  - Sortie miroir interactive dans la console du navigateur via `console.table()`.
- **Rapide et respectueux du serveur** : requêtes exécutées par petits lots concurrents avec pause intermédiaire. Bouton `⏹ Arrêter` disponible à tout moment.

---

## 🚀 Utilisation (en 3 étapes)

1. **Ouvrez OneFlex** sur la page de détails de l'espace souhaité dans votre navigateur :
   ```text
   https://oneflex.myworldline.com/spaces/<uuid>/details
   ```
2. Ouvrez les **Outils de développement** :
   - Appuyez sur **F12** (ou `Ctrl + Shift + I` sous Windows/Linux, `Cmd + Option + I` sous macOS).
   - Cliquez sur l'onglet **Console**.
3. **Collez le contenu** du fichier [`oneflex_seat_history_snippet.js`](oneflex_seat_history_snippet.js) et appuyez sur **Entrée**.

Le panneau apparaît aussitôt en haut à droite. Choisissez la place, la période, puis cliquez sur **▶ Lancer la recherche**.

---

## 🔒 Confidentialité & Sécurité

- **Aucune dépendance externe** : le script s'exécute localement à 100% dans votre navigateur.
- **Aucune transmission de données à des tiers** : les requêtes sont envoyées exclusivement à l'API interne de votre instance OneFlex.
- **Réutilisation de la session active** : le script utilise vos cookies de session SSO déjà établis (`credentials: 'include'`), sans jamais manipuler ni exposer de mot de passe.

---

## 📄 Licence

Projet distribué sous licence MIT.
