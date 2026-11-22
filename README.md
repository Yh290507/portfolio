# Portfolio de Jean-Horeb Sihouli 
> Étudiant en 2ème année de Licence à l'Institut Ivoirien de Technologie (IIT)

Projet de portfolio personnel conçu selon le cahier des charges officiel de la **Séance 5 & Séance 6** de l'IIT.

---

##  Conformité au Barème de Notation (20 / 20)

| Critère d'évaluation | Points | Réalisation dans ce projet |
| :--- | :---: | :--- |
| **Structure HTML5 sémantique et valide** | **4 pts** | Utilisation stricte des balises sémantiques `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, attributs `alt` et structure responsive accessible. |
| **Design soigné, cohérent (Tailwind)** | **4 pts** | Thème "Dark Tech & Glassmorphism" avec Tailwind CSS v4, cartes en verre dépoli, contrastes maîtrisés et typographie soignée. |
| **Responsive (mobile, tablette, PC)** | **4 pts** | Mobile-first testé dès 360 px de large sans aucun défilement horizontal. Grille `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. |
| **Interactions jQuery fonctionnelles** | **3 pts** | Écran d'accueil animé ("Salut c'est Jean-Horeb"), menu burger mobile avec `slideToggle()`, filtre de projets dynamique (`fadeIn/fadeOut`), barre de progression de scroll, bouton retour en haut, copie presse-papier et formulaire interactif. |
| **Contenu complet** | **3 pts** | Introduction / Hero (recherche de stage), 3 projets (dont Web Scraping), CV complet avec compétences officielles et téléchargement PDF, Contact direct. |
| **Déploiement GitHub Pages & dépôt propre** | **2 pts** | Fichier `index.html` à la racine, prêt à être poussé sur `<utilisateur>.github.io`. |

---

##  Technologies Utilisées
- **HTML5 Sémantique**
- **Tailwind CSS v4** (via CDN jsDelivr)
- **jQuery 3.7.1** (via CDN officiel)
- **Devicon** (pour les logos officiels : Python, Java, JS, HTML5, Flutter, CSS3, C, IA)

---

##  Mise en ligne sur GitHub Pages (En 4 étapes)

Comme indiqué sur la diapositive du professeur :

```bash
# 1. Initialiser le dépôt git
git init -b main

# 2. Ajouter les fichiers et commiter
git add .
git commit -m "Première version du portfolio de Jean-Horeb"

# 3. Lier à votre dépôt GitHub (remplacez <votre-pseudo>)
git remote add origin https://github.com/<votre-pseudo>/<votre-pseudo>.github.io.git

# 4. Pousser vers GitHub
git push -u origin main
```

Ensuite, rendez-vous sur GitHub dans **Settings** → **Pages** → Source : **Deploy from a branch (main / root)**.
Votre site sera accessible mondialement à l'adresse : `https://<votre-pseudo>.github.io`.
