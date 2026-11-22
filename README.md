# Portfolio de Jean-Horeb Sihouli

Portfolio personnel de Jean-Horeb Sihouli, étudiant en Licence 2 informatique à l’Institut Ivoirien de Technologie (IIT), à Grand-Bassam, en Côte d’Ivoire. Le site présente son parcours, ses projets de développement, ses compétences techniques et son CV.

## Contenu du site

- **Accueil** — présentation, recherche de stage et schéma 3D de l’architecture logicielle de BiblioIIT.
- **Navigation** — menu vers les rubriques du portfolio, adapté aux écrans mobiles.
- **Projets** — comparateur de prix, application de bibliothèque BiblioIIT et Amazon Web Scraper, avec accès aux dépôts GitHub.
- **Parcours** — formation à l’IIT, langages et outils utilisés dans les cours et projets.
- **CV** — aperçu de la page A4 sans barre d’outils, ouverture du PDF complet dans un nouvel onglet et téléchargement.
- **Contact** — coordonnées et formulaire qui prépare un courriel dans l’application de messagerie du visiteur. Le formulaire n’envoie pas de données à un serveur.

## Projets présentés

- **Comparateur de prix multi-enseignes** — application Python pour comparer les offres de plusieurs commerces à Abidjan et exporter les résultats.
- **BiblioIIT** — application de gestion de bibliothèque, organisée autour des services, des règles métier et d’une base SQLite.
- **Amazon Web Scraper** — projet Python d’extraction, de préparation et d’export de données produit.

## Technologies et outils

Les icônes de technologies sont fournies par [Devicon](https://devicon.dev/).

- **Langages et web :** Python, C, Java, JavaScript, SQL, HTML5 et CSS3.
- **Données et outils :** SQL Server, SQLite, Tailwind CSS, Git, GitHub et Visual Studio Code.
- **Méthodes :** MVC, Service-Repository et tests avec Pytest.

Le site est réalisé en HTML, CSS et JavaScript. Tailwind CSS est chargé depuis son CDN et jQuery gère certaines interactions. Une trame animée en canvas, les révélations au défilement et la loupe de texte sont réalisées en JavaScript et CSS. Les effets respectent le réglage de réduction des animations du navigateur. Le portfolio est statique et peut être hébergé sur GitHub Pages.

## Structure du dépôt

```text
.
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── custom.css
    ├── docs/
    │   ├── cv.pdf
    │   └── cv-preview.png
    └── js/
        └── main.js
```

## Lancer le portfolio en local

Ouvrez `index.html` dans un navigateur. Pour charger les ressources et prévisualiser le PDF dans des conditions proches d’un site hébergé, lancez un serveur local, par exemple avec l’extension **Live Server** de Visual Studio Code.

Pour actualiser le CV, remplacez `assets/docs/cv.pdf` en conservant ce nom de fichier, puis régénérez `assets/docs/cv-preview.png` pour synchroniser l’aperçu A4 affiché sur le site. Avec Poppler, la commande suivante produit cette image :

```bash
pdftoppm -f 1 -l 1 -singlefile -png -r 144 assets/docs/cv.pdf assets/docs/cv-preview
```

## Publier sur GitHub Pages

### Envoyer les changements d’un dépôt déjà relié à GitHub

Depuis le dossier du projet, vérifiez le dépôt distant, puis envoyez vos modifications :

```bash
git status
git add .
git commit -m "Mettre à jour le portfolio"
git push origin main
```

Si `git status` indique qu’il n’y a rien à valider, aucun nouveau commit n’est nécessaire. Si GitHub demande une authentification, connectez-vous avec GitHub CLI ou configurez une clé SSH.

### Publier le projet pour la première fois

1. Créez un dépôt sur GitHub. Pour obtenir l’adresse `https://<utilisateur>.github.io`, nommez-le `<utilisateur>.github.io`. Pour un dépôt nommé autrement, l’adresse contiendra aussi le nom du dépôt. Pour cette méthode, créez le dépôt sans ajouter de README, de licence ou de `.gitignore` depuis GitHub.
2. Dans le terminal, placez-vous à la racine du projet, là où se trouve `index.html`. Initialisez Git uniquement si ce dossier n’est pas déjà un dépôt, puis ajoutez le dépôt distant :

   ```bash
   git init -b main
   git add .
   git commit -m "Créer le portfolio personnel"
   git remote add origin https://github.com/<utilisateur>/<nom-du-depot>.git
   git push -u origin main
   ```

   Si Git est déjà initialisé, ne relancez pas `git init`. Vérifiez le remote avec `git remote -v`. S’il n’existe pas encore, ajoutez-le avec `git remote add origin https://github.com/<utilisateur>/<nom-du-depot>.git`. Si un remote `origin` pointe vers la mauvaise adresse, corrigez-le avec `git remote set-url origin https://github.com/<utilisateur>/<nom-du-depot>.git`. Ensuite, envoyez la branche avec `git push -u origin main`.

### Activer et vérifier GitHub Pages

1. Dans le dépôt GitHub, ouvrez **Settings → Pages**.
2. Dans **Build and deployment**, choisissez **Deploy from a branch**.
3. Sélectionnez la branche `main` et le dossier `/ (root)`, puis enregistrez. Le fichier `index.html` doit rester à la racine du dépôt.
4. Attendez la fin du déploiement dans l’onglet **Actions** ou dans **Settings → Pages**, puis ouvrez le lien publié. Vérifiez les rubriques, les liens, le CV et l’affichage sur ordinateur et téléphone.

Pour ce dépôt, l’adresse GitHub Pages est généralement `https://yh290507.github.io/portfolio/` une fois Pages activé. Après chaque mise à jour, répétez `git add .`, `git commit -m "Votre message"` et `git push origin main` ; Pages republiera la branche.

## Contact

**Jean-Horeb Sihouli**

- E-mail : [yogne.sihouli@iit.ci](mailto:yogne.sihouli@iit.ci)
- GitHub : [github.com/Yh290507](https://github.com/Yh290507)
- Localisation : Abidjan / Grand-Bassam, Côte d’Ivoire
