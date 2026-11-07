# Pourquoi faire ?

Lors d'un déménagement au sein de mon entreprise, j'ai découvert un chargeur de téléphone branché sous mon bureau. Sans savoir à qui c'est. On est en flex office. j'ai voulus avoir qui avait occupé la même chose depuis plusieurs semaines pour savoir à qui envoyer un mail. D'où ce petit bout de javascript à copier-coller dans la console de son navigateur web.

Un snippet JavaScript léger et sans installation à exécuter dans la console DevTools de votre navigateur pour retrouver l'historique d'occupation d'une place sur **OneFlex** sur 1, 2, 3 ou 6 mois (par exemple, pour retrouver le propriétaire d'un objet oublié comme un chargeur).

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![DevTools](https://img.shields.io/badge/Console-DevTools-4285F4?logo=googlechrome&logoColor=white)

---

## Blabla
Dans les espaces de flex office gérés par **OneFlex**, l'interface standard permet de naviguer dans les réservations jour par jour, mais ne propose pas de vue chronologique inversée pour savoir qui s'est assis à une place donnée au cours des dernières semaines ou des derniers mois.

Ce script résout ce problème en interrogeant l'API GraphQL native de OneFlex (`/api/gql`) directement depuis la session active du navigateur.

---

## Fonctionnalités
- **Détection automatique** :
  - Détecte l'espace courant (nom et identifiant) depuis l'URL.
  - Récupère la liste ordonnée des places (`Place 1`, `Place 2`...).
- **Popin injectée dans la page web** pour pouvoir choisir quelques options:
  - **Période d'analyse paramétrable** :1/2/3/6 mois 
  - **Quelques filtres ** :
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

## Mode d'emploi
1. **Ouvrir OneFlex** sur la page de détails de l'espace souhaité dans votre navigateur :
   ```text
   https://oneflex.myworldline.com/spaces/<uuid>/details
   ```
2. Ouvrir les **Outils de développement** :
   - Appuyer sur **F12** (ou `Ctrl + Shift + I` sous Windows/Linux, `Cmd + Option + I` sous macOS).
   - Cliquer sur l'onglet **Console**.
3. **Collez le contenu** du fichier [`oneflex_seat_history_snippet.js`](oneflex_seat_history_snippet.js) et appuyer sur **Entrée**.
   - il peut avoir un warninf disant de faire gaffe quand on copie-colle du code.
   - faites votre choix de faire confiance ou pas, c'est votre navigateur, vos données, pas les miennes ;-)
Le panneau apparaît aussitôt en haut à droite. Choisissez la place, la période, puis cliquez sur **▶ Lancer la recherche**.

---

##  Confidentialité des données
- **Pas de dépendance externe** : le script s'exécute localement à 100% dans votre navigateur.
- **Pas de transmission de données à des tiers** : les requêtes sont envoyées exclusivement à l'API interne de votre instance OneFlex.
- **Réutilisation de la session active** : le script utilise les cookies de session SSO déjà établis (`credentials: 'include'`), sans jamais manipuler ni exposer de mot de passe.

---

## Licence
Projet distribué sous licence MIT.
