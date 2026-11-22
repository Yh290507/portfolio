$(function () {
  const $sections = $('main section[id]');
  const $navLinks = $('.nav-pill-link');
  const $mobileMenu = $('#mobile-menu');
  document.body.classList.add('js-motion');

  // Révèle les éléments à leur arrivée à l’écran, sans masquer le contenu si JS ne charge pas.
  const revealTargets = document.querySelectorAll('.reveal, .projet-card-container');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    revealTargets.forEach(element => {
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
  } else {
    revealTargets.forEach(element => element.classList.add('is-visible'));
  }

  // Constellations visibles en mouvement lent derrière le contenu.
  const constellationCanvas = document.getElementById('ambient-canvas');
  const constellationContext = constellationCanvas?.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let constellationPoints = [];
  let constellationWidth = 0;
  let constellationHeight = 0;
  let lastConstellationFrame = 0;
  let constellationAnimationStarted = false;

  function sizeConstellationCanvas() {
    if (!constellationCanvas || !constellationContext) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    constellationWidth = window.innerWidth;
    constellationHeight = window.innerHeight;
    constellationCanvas.width = Math.round(constellationWidth * pixelRatio);
    constellationCanvas.height = Math.round(constellationHeight * pixelRatio);
    constellationContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = Math.min(34, Math.max(14, Math.round(constellationWidth / 44)));
    constellationPoints = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * constellationWidth,
      y: Math.random() * constellationHeight,
      vx: (Math.random() < 0.5 ? -1 : 1) * (0.28 + Math.random() * 0.42),
      vy: (Math.random() < 0.5 ? -1 : 1) * (0.28 + Math.random() * 0.42),
      radius: index % 6 === 0 ? 2.4 : 1.55
    }));
    if (reduceMotion) {
      drawConstellations();
    } else if (!constellationAnimationStarted) {
      constellationAnimationStarted = true;
      requestAnimationFrame(drawConstellations);
    }
  }

  function drawConstellations(timestamp = 0) {
    if (!constellationContext) return;
    if (!reduceMotion && timestamp - lastConstellationFrame < 25) {
      requestAnimationFrame(drawConstellations);
      return;
    }
    lastConstellationFrame = timestamp;
    constellationContext.clearRect(0, 0, constellationWidth, constellationHeight);
    constellationPoints.forEach(point => {
      if (!reduceMotion) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > constellationWidth) point.vx *= -1;
        if (point.y < 0 || point.y > constellationHeight) point.vy *= -1;
        point.x = Math.max(0, Math.min(constellationWidth, point.x));
        point.y = Math.max(0, Math.min(constellationHeight, point.y));
      }
    });
    for (let i = 0; i < constellationPoints.length; i++) {
      const point = constellationPoints[i];
      for (let j = i + 1; j < constellationPoints.length; j++) {
        const next = constellationPoints[j];
        const distance = Math.hypot(point.x - next.x, point.y - next.y);
        if (distance > 176) continue;
        const opacity = (1 - distance / 176) * 0.27;
        constellationContext.beginPath();
        constellationContext.moveTo(point.x, point.y);
        constellationContext.lineTo(next.x, next.y);
        constellationContext.strokeStyle = `rgba(198, 225, 164, ${opacity})`;
        constellationContext.lineWidth = 0.9;
        constellationContext.stroke();
      }
      constellationContext.beginPath();
      constellationContext.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      constellationContext.fillStyle = 'rgba(215, 255, 121, 0.58)';
      constellationContext.fill();
    }
    if (!reduceMotion) requestAnimationFrame(drawConstellations);
  }

  sizeConstellationCanvas();
  window.addEventListener('resize', sizeConstellationCanvas, { passive: true });

  // Une loupe textuelle colore les lettres proches du curseur, sans changer leur contenu.
  const textLensEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion;
  function prepareTextLens(root = document.body) {
    if (!textLensEnabled || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!node.nodeValue.trim() || !parent || parent.closest('script, style, svg, canvas, input, textarea, select, option, code, pre, [aria-hidden="true"], .cursor-halo, .text-glyph')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      const parent = node.parentElement;
      const fragment = document.createDocumentFragment();
      Array.from(node.nodeValue).forEach(character => {
        const glyph = document.createElement('span');
        glyph.className = 'text-glyph';
        glyph.textContent = character;
        fragment.appendChild(glyph);
      });
      node.replaceWith(fragment);
      parent?.classList.add('text-lens-group');
    });
  }
  prepareTextLens();

  const cursorHalo = document.querySelector('.cursor-halo');
  let activeLensGroup = null;
  function clearTextLens() {
    activeLensGroup?.querySelectorAll(':scope > .text-glyph.is-lens-lit').forEach(glyph => glyph.classList.remove('is-lens-lit'));
    activeLensGroup = null;
    cursorHalo?.classList.remove('is-text');
  }
  function updateTextLens(x, y) {
    if (!textLensEnabled) return;
    const target = document.elementFromPoint(x, y)?.closest('.text-glyph');
    if (!target) {
      clearTextLens();
      return;
    }
    const group = target.parentElement;
    if (activeLensGroup !== group) clearTextLens();
    activeLensGroup = group;
    group.querySelectorAll(':scope > .text-glyph').forEach(glyph => {
      const bounds = glyph.getBoundingClientRect();
      const distance = Math.hypot(bounds.left + bounds.width / 2 - x, bounds.top + bounds.height / 2 - y);
      glyph.classList.toggle('is-lens-lit', distance < 68);
    });
    cursorHalo?.classList.add('is-text');
  }

  // Petit anneau de curseur sur ordinateur, désactivé pour le tactile.
  if (cursorHalo && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let cursorFrame = 0;
    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      if (cursorFrame) cancelAnimationFrame(cursorFrame);
      cursorFrame = requestAnimationFrame(() => {
        cursorHalo.style.setProperty('--cursor-x', `${event.clientX}px`);
        cursorHalo.style.setProperty('--cursor-y', `${event.clientY}px`);
        cursorHalo.classList.add('is-visible');
        updateTextLens(event.clientX, event.clientY);
      });
    }, { passive: true });
    document.addEventListener('pointerover', event => {
      if (event.target.closest('a, button, .tech-item, .architecture-sheet')) cursorHalo.classList.add('is-active');
    });
    document.addEventListener('pointerout', event => {
      if (event.target.closest('a, button, .tech-item, .architecture-sheet')) cursorHalo.classList.remove('is-active');
    });
    window.addEventListener('pointerout', event => {
      if (!event.relatedTarget) {
        clearTextLens();
        cursorHalo.classList.remove('is-visible', 'is-active');
      }
    });
    window.addEventListener('blur', clearTextLens);
  }

  // Inclinaison très légère des cartes projets, uniquement à la souris.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty('--card-rotate-x', `${(-y * 2).toFixed(2)}deg`);
        card.style.setProperty('--card-rotate-y', `${(x * 2).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--card-rotate-x');
        card.style.removeProperty('--card-rotate-y');
      });
    });
  }

  // Menu mobile accessible : état, focus et fermeture après navigation.
  $('#burger-btn').on('click', function () {
    const isOpen = $(this).attr('aria-expanded') === 'true';
    $(this).attr('aria-expanded', String(!isOpen));
    $(this).attr('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
    $mobileMenu.toggleClass('is-open', !isOpen).attr('aria-hidden', String(isOpen));
  });

  $('.mobile-link').on('click', function () {
    $mobileMenu.removeClass('is-open').attr('aria-hidden', 'true');
    $('#burger-btn').attr('aria-expanded', 'false').attr('aria-label', 'Ouvrir le menu');
  });

  $(document).on('click', function (event) {
    if (!event.target.closest('#mobile-menu, #burger-btn') && $mobileMenu.hasClass('is-open')) {
      $mobileMenu.removeClass('is-open').attr('aria-hidden', 'true');
      $('#burger-btn').attr('aria-expanded', 'false').attr('aria-label', 'Ouvrir le menu');
    }
  });

  // Filtre les projets en limitant le mouvement à une courte transition.
  $('.filter-btn').on('click', function () {
    const filter = $(this).data('filter');
    $('.filter-btn').removeClass('active-filter').attr('aria-pressed', 'false');
    $(this).addClass('active-filter').attr('aria-pressed', 'true');

    $('.projet-card-container').each(function () {
      const matches = filter === 'all' || $(this).data('categorie') === filter;
      $(this).stop(true, true)[matches ? 'fadeIn' : 'fadeOut'](150);
    });
  });

  // Détails des projets.
  const projectDetails = {
    comparateur: {
      title: 'Comparateur de Prix Multi-Enseignes — Abidjan',
      subtitle: 'Python · architecture MVC · analyse de données',
      badge: 'Data et algorithmique',
      desc: 'Application d’analyse comparative des offres de trois enseignes à Abidjan. Le projet indexe les catalogues pour comparer les offres, repérer les écarts de prix et produire des rapports.',
      tree: ['src/models/        → Objets métier', 'src/services/      → Comparaison et panier', 'src/repositories/  → Lecture CSV, JSON et Excel', 'output/            → Rapports exportés'],
      points: ['Comparaison des offres entre enseignes.', 'Détection des écarts de prix configurés dans le projet.', 'Exports tabulaires pour consultation et analyse.'],
      repoUrl: 'https://github.com/Yh290507/Analyse_comparative_Yh'
    },
    biblio: {
      title: 'BiblioIIT — Gestion de bibliothèque universitaire',
      subtitle: 'Python · services et dépôts · SQLite',
      badge: 'Génie logiciel et SQL',
      desc: 'Système de gestion de bibliothèque développé pour l’IIT. Le programme sépare les règles métier de l’accès aux données et utilise SQLite pour la persistance.',
      tree: ['console.py         → Interface terminal', 'service.py         → Cas d’usage', 'regles.py          → Règles métier', 'depot_sqlite.py    → Accès SQLite'],
      points: ['Architecture Service-Repository.', 'Règles de prêt et gestion des retards.', 'Le dépôt indique 19 tests unitaires.'],
      repoUrl: 'https://github.com/Yh290507/yh_biblioIIT'
    },
    amazon: {
      title: 'Amazon Web Scraper',
      subtitle: 'Python · extraction et préparation de données',
      badge: 'Web scraping',
      desc: 'Projet Python d’extraction et de parsing de pages produits. Les données récupérées sont nettoyées puis exportées dans des formats structurés.',
      tree: ['scraper.py         → Requêtes et extraction', 'parser.py          → Lecture des pages', 'data_cleaner.py    → Nettoyage des valeurs', 'output/            → Exports CSV et JSON'],
      points: ['Extraction des informations produit présentes dans la page.', 'Nettoyage et normalisation des valeurs.', 'Exports CSV et JSON.'],
      repoUrl: 'https://github.com/Yh290507/YH_amazone_scraper'
    }
  };

  $('.open-modal-btn').on('click', function () {
    const data = projectDetails[$(this).data('project')];
    if (!data) return;

    $('#modal-title').text(data.title);
    $('#modal-subtitle').text(data.subtitle);
    $('#modal-badge').text(data.badge);
    $('#modal-desc').text(data.desc);
    $('#modal-tree').empty();
    data.tree.forEach(line => $('<p>').addClass('font-mono text-[11px] text-muted').text(line).appendTo('#modal-tree'));
    $('#modal-points').empty();
    data.points.forEach(point => $('<li>').addClass('text-xs text-muted leading-relaxed').text(point).appendTo('#modal-points'));
    $('#modal-repo-link').attr('href', data.repoUrl);
    prepareTextLens(document.getElementById('project-modal'));
    $('#project-modal').removeClass('hidden').addClass('flex');
    $('body').addClass('overflow-hidden');
    $('#close-modal-btn').trigger('focus');
  });

  function closeModal() {
    $('#project-modal').addClass('hidden').removeClass('flex');
    $('body').removeClass('overflow-hidden');
  }
  $('#close-modal-btn, #close-modal-footer, #modal-backdrop-close').on('click', closeModal);
  $(document).on('keydown', function (event) {
    if (event.key === 'Escape') {
      closeModal();
      $mobileMenu.removeClass('is-open').attr('aria-hidden', 'true');
      $('#burger-btn').attr('aria-expanded', 'false').attr('aria-label', 'Ouvrir le menu');
    }
  });

  // Copie de l’adresse de contact.
  $('#copy-email-btn').on('click', async function () {
    const email = $('#my-email').text().trim();
    const $button = $(this);
    try {
      await navigator.clipboard.writeText(email);
      $button.text('Copié');
      prepareTextLens($button[0]);
    } catch {
      window.location.href = `mailto:${email}`;
    }
    window.setTimeout(() => {
      $button.text('Copier');
      prepareTextLens($button[0]);
    }, 1800);
  });

  // Prépare un courriel dans l’application de messagerie du visiteur.
  $('#contact-form').on('submit', function (event) {
    event.preventDefault();
    const name = $('#name').val().trim();
    const replyTo = $('#email').val().trim();
    const subject = $('#subject').val().trim() || `Message de ${name}`;
    const message = $('#message').val().trim();
    const body = `${message}\n\n— ${name}\n${replyTo}`;
    const mailto = `mailto:yogne.sihouli@iit.ci?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $('#form-success').stop(true, true).slideDown(180);
    window.location.href = mailto;
  });

  // Liens de navigation et bouton de retour en haut.
  $(window).on('scroll', function () {
    const scrollTop = $(window).scrollTop();
    $('#back-to-top').toggleClass('opacity-0 pointer-events-none', scrollTop < 450)
      .toggleClass('opacity-100 pointer-events-auto', scrollTop >= 450);

    let activeId = 'accueil';
    $sections.each(function () {
      if ($(this).offset().top <= scrollTop + 150) activeId = this.id;
    });
    $navLinks.removeClass('active-link');
    $navLinks.filter(`[href="#${activeId}"]`).addClass('active-link');

  });

  $('#back-to-top').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 260);
  });

  $(window).trigger('scroll');
});
