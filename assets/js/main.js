/**
 * ==========================================================
 * PORTFOLIO DE JEAN-HOREB SIHOULI — MOTION & PARTICULES
 * Profil GitHub : Yh290507 | IIT Grand-Bassam
 * Sans aucun émoji — Double thème Sombre & Clair
 * ==========================================================
 */

$(document).ready(function() {
  
  // ----------------------------------------------------------
  // 1. GESTION DU THÈME SOMBRE (PAR DÉFAUT) & CLAIR
  // ----------------------------------------------------------
  const savedTheme = localStorage.getItem('portfolio_theme') || 'dark';

  function applyTheme(theme) {
    if (theme === 'light') {
      $('body').removeClass('dark-mode').addClass('light-mode');
      $('#theme-icon-sun').removeClass('hidden');
      $('#theme-icon-moon').addClass('hidden');
      localStorage.setItem('portfolio_theme', 'light');
    } else {
      $('body').removeClass('light-mode').addClass('dark-mode');
      $('#theme-icon-moon').removeClass('hidden');
      $('#theme-icon-sun').addClass('hidden');
      localStorage.setItem('portfolio_theme', 'dark');
    }
  }

  applyTheme(savedTheme);

  $('#theme-toggle-btn').on('click', function(e) {
    e.preventDefault();
    const current = $('body').hasClass('light-mode') ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });

  // ----------------------------------------------------------
  // 2. CANVAS DES PARTICULES ANIMÉES EN ARRIÈRE-PLAN
  // ----------------------------------------------------------
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    $(window).on('resize', function() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor(window.innerWidth / 22), 55);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1
      });
    }

    let mouse = { x: -1000, y: -1000 };
    $(window).on('mousemove', function(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      const isLight = $('body').hasClass('light-mode');

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interaction avec la souris
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x -= (dx / dist) * 1.5;
          p.y -= (dy / dist) * 1.5;
        }

        // Dessin du point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? 'rgba(79, 70, 229, 0.45)' : 'rgba(99, 102, 241, 0.65)';
        ctx.fill();

        // Lignes de connexion entre particules proches
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distance < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (1 - distance / 110) * (isLight ? 0.15 : 0.22);
            ctx.strokeStyle = isLight ? `rgba(100, 116, 139, ${alpha})` : `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ----------------------------------------------------------
  // 3. ANIMATION DU SPLASH SCREEN DE DÉPART
  // ----------------------------------------------------------
  $('#intro-bar').css('width', '100%');
  
  function dismissIntro() {
    $('#intro-screen').fadeOut(450, function() {
      $(this).remove();
    });
  }

  const introTimer = setTimeout(dismissIntro, 2000);
  $('#skip-intro').on('click', function(e) {
    e.preventDefault();
    clearTimeout(introTimer);
    dismissIntro();
  });

  // ----------------------------------------------------------
  // 4. MENU MOBILE BURGER
  // ----------------------------------------------------------
  $('#burger-btn').on('click', function() {
    $('#mobile-menu').slideToggle(220);
  });

  $('.mobile-link').on('click', function() {
    $('#mobile-menu').slideUp(200);
  });

  // ----------------------------------------------------------
  // 5. TYPEWRITER SANS AUCUN ÉMOJI
  // ----------------------------------------------------------
  const phrases = [
    "développeur de solutions logicielles.",
    "étudiant en Licence 2 à l'IIT Grand-Bassam.",
    "concepteur du système BiblioIIT.",
    "spécialiste de la Data & du Web Scraping.",
    "maîtrisant Python, SQL & le Génie Logiciel."
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const $typewriter = $('#typewriter-text');

  function typeLoop() {
    const currentPhrase = phrases[phraseIdx];
    
    if (isDeleting) {
      $typewriter.text(currentPhrase.substring(0, charIdx - 1));
      charIdx--;
    } else {
      $typewriter.text(currentPhrase.substring(0, charIdx + 1));
      charIdx++;
    }

    let speed = isDeleting ? 25 : 65;

    if (!isDeleting && charIdx === currentPhrase.length) {
      speed = 1900;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      speed = 350;
    }

    setTimeout(typeLoop, speed);
  }
  if ($typewriter.length) {
    typeLoop();
  }

  // ----------------------------------------------------------
  // 6. ANIMATION 3D TILT DES CARTES
  // ----------------------------------------------------------
  $('.tilt-card').each(function() {
    const $card = $(this);
    const $shine = $card.find('.tilt-shine');

    $card.on('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      $card.css('transform', `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`);
      $shine.css({
        'opacity': '1',
        'background': `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.25), transparent 60%)`
      });
    });

    $card.on('mouseleave', function() {
      $card.css('transform', 'rotateX(0deg) rotateY(0deg) scale(1)');
      $shine.css('opacity', '0');
    });
  });

  // ----------------------------------------------------------
  // 7. BARRE DE SCROLL & SCROLLSPY
  // ----------------------------------------------------------
  $(window).on('scroll', function() {
    const scrollTop = $(window).scrollTop();
    const docHeight = $(document).height() - $(window).height();
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    $('#scroll-progress').css('width', scrollPercent + '%');

    if (scrollTop > 350) {
      $('#back-to-top').removeClass('opacity-0 pointer-events-none').addClass('opacity-100 pointer-events-auto');
    } else {
      $('#back-to-top').addClass('opacity-0 pointer-events-none').removeClass('opacity-100 pointer-events-auto');
    }

    $('section').each(function() {
      const top = $(this).offset().top - 160;
      const bottom = top + $(this).outerHeight();
      const id = $(this).attr('id');

      if (scrollTop >= top && scrollTop < bottom) {
        $('.nav-pill-link').removeClass('active-link font-bold');
        $('.nav-pill-link[href="#' + id + '"]').addClass('active-link font-bold');
      }
    });
  });

  $('#back-to-top').on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 450);
  });

  // ----------------------------------------------------------
  // 8. FILTRES DES PROJETS (Tous, Scraping, Génie Logiciel)
  // ----------------------------------------------------------
  $('.filter-btn').on('click', function() {
    $('.filter-btn').removeClass('active-filter');
    $(this).addClass('active-filter');

    const filter = $(this).data('filter');

    if (filter === 'all') {
      $('.projet-card-container').fadeIn(300);
    } else {
      $('.projet-card-container').each(function() {
        if ($(this).data('categorie') === filter) {
          $(this).fadeIn(300);
        } else {
          $(this).fadeOut(180);
        }
      });
    }
  });

  // ----------------------------------------------------------
  // 9. MODALES DE DÉTAILS AVEC VRAIS REPOS GITHUB
  // ----------------------------------------------------------
  const projectDetails = {
    comparateur: {
      title: "Comparateur de Prix Multi-Enseignes — Abidjan",
      subtitle: "Optimisation Algorithmique & Data Analytics (Python MVC)",
      badge: "Python • Architecture MVC & Data",
      desc: "Application d'analyse comparative des offres de trois grandes enseignes à Abidjan (Marché Lagune, Baobab Shop, Comptoir Ivoire). Optimisation algorithmique avec indexation par dictionnaire en O(H + Q) pour un traitement instantané des catalogues, détection automatique des anomalies de prix (seuil 10%), et génération de rapports de synthèse exportables en Pandas, Excel, CSV et JSON.",
      tree: [
        "src/models/        -> Objets métier (Produit, Offre, Boutique)",
        "src/services/      -> Comparateur, panier optimal & benchmark O(H+Q)",
        "src/repositories/  -> Normalisation des sources CSV, JSON & Excel",
        "output/            -> comparatif.csv, synthese.csv, performance.json"
      ],
      points: [
        "Optimisation de complexité : passage d'une recherche naïve en O(H × Q) à O(H + Q).",
        "Gestion automatique des ruptures de stock et calcul du panier global optimal.",
        "Génération automatisée de rapports tabulaires et journalisation des écarts."
      ],
      repoUrl: "https://github.com/Yh290507/Analyse_comparative_Yh"
    },
    biblio: {
      title: "BiblioIIT — Système de Gestion de Bibliothèque Universitaire",
      subtitle: "Clean Architecture Service-Repository & Base relationnelle SQLite",
      badge: "Génie Logiciel • Clean Architecture & SQL",
      desc: "Système d'Information et de Gestion de Bibliothèque (SIGB) développé pour l'Institut Ivoirien de Technologie (IIT). Valorisation d'un fonds de référence de 5 ouvrages majeurs de littérature africaine, persistance relationnelle SQLite avec intégrité des données, et moteur strict de règles de gestion.",
      tree: [
        "console.py         -> Interface terminal interactive et ergonomique",
        "service.py         -> Couche contrôleur orchestrant les cas d'usage",
        "regles.py          -> Règles métier (quotas 3 livres, durée 14j, blocage retards)",
        "depot_sqlite.py    -> Persistance SQLite (biblio.db) avec intégrité référentielle",
        "tests/             -> Suite de 19 tests unitaires automatisés"
      ],
      points: [
        "Architecture en couches (Clean / Service-Repository) inspirée du patron MVC.",
        "Règles réelles : durée de prêt à 14 jours, blocage automatique des retards.",
        "19 tests unitaires automatisés garantissant la fiabilité complète du code."
      ],
      repoUrl: "https://github.com/Yh290507/yh_biblioIIT"
    },
    amazon: {
      title: "Amazon Web Scraper — Extraction de Données",
      subtitle: "Web Scraping, Parsing & Pipeline de Données Python",
      badge: "Web Scraping & Data Extraction",
      desc: "Robot d'extraction et de parsing de données développé en Python pour scraper automatiquement les catalogues de produits Amazon. Extraction ciblée des dénominations, des tarifs en temps réel, des évaluations utilisateurs et des caractéristiques techniques avec export propre vers CSV/JSON.",
      tree: [
        "scraper.py         -> Moteur principal d'extraction et requêtes HTTP",
        "parser.py          -> Extraction des balises HTML, sélecteurs CSS & Regex",
        "data_cleaner.py    -> Nettoyage, typage et normalisation des tarifs",
        "output/            -> Données extraites prêtes pour l'analyse (CSV, JSON)"
      ],
      points: [
        "Contournement des structures dynamiques et gestion des en-têtes User-Agent.",
        "Nettoyage rigoureux des chaînes textuelles, prix et devises.",
        "Pipeline automatisé d'export structuré pour exploitation Data Analytics."
      ],
      repoUrl: "https://github.com/Yh290507/YH_amazone_scraper"
    }
  };

  $('.open-modal-btn').on('click', function(e) {
    e.preventDefault();
    const pid = $(this).data('project');
    const data = projectDetails[pid];
    if (!data) return;

    $('#modal-title').text(data.title);
    $('#modal-subtitle').text(data.subtitle);
    $('#modal-badge').text(data.badge);
    $('#modal-desc').text(data.desc);
    
    let treeHtml = '';
    data.tree.forEach(line => {
      treeHtml += `<p class="font-mono text-[11px] text-muted">${line}</p>`;
    });
    $('#modal-tree').html(treeHtml);

    let pointsHtml = '';
    data.points.forEach(pt => {
      pointsHtml += `<li class="text-xs text-muted leading-relaxed">${pt}</li>`;
    });
    $('#modal-points').html(pointsHtml);

    $('#modal-repo-link').attr('href', data.repoUrl);

    $('#project-modal').removeClass('hidden').addClass('flex');
    $('body').addClass('overflow-hidden');
  });

  function closeModal() {
    $('#project-modal').addClass('hidden').removeClass('flex');
    $('body').removeClass('overflow-hidden');
  }

  $('#close-modal-btn, #modal-backdrop-close').on('click', closeModal);

  $(document).on('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  // ----------------------------------------------------------
  // 10. COPIE DE L'EMAIL
  // ----------------------------------------------------------
  $('#copy-email-btn').on('click', function() {
    const email = $('#my-email').text().trim();
    navigator.clipboard.writeText(email).then(() => {
      const $btn = $('#copy-email-btn');
      const orig = $btn.text();
      $btn.text('Copié !').addClass('bg-indigo-600 text-white');
      setTimeout(() => {
        $btn.text(orig).removeClass('bg-indigo-600 text-white');
      }, 2000);
    });
  });

  // ----------------------------------------------------------
  // 11. FORMULAIRE DE CONTACT
  // ----------------------------------------------------------
  $('#contact-form').on('submit', function(e) {
    e.preventDefault();
    $('#form-success').hide().slideDown(350);
    $(this)[0].reset();
    setTimeout(function() {
      $('#form-success').slideUp(400);
    }, 6000);
  });

});
