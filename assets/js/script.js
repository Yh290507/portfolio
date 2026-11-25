$(function () {
  const $sections = $('main section[id]');
  const $navLinks = $('.nav-pill-link');
  const $mobileMenu = $('#mobile-menu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('js-motion');

  // Introduction courte, passable et jouée une fois par onglet.
  const introScreen = document.getElementById('intro-screen');
  const skipIntro = document.getElementById('skip-intro');
  let introTimer = 0;
  function playHeroEntrance() {
    if (reduceMotion) return;
    document.querySelector('#accueil .hero-copy')?.classList.add('is-visible', 'hero-arrive-left');
    document.querySelector('#accueil .architecture-sheet')?.classList.add('is-visible', 'hero-arrive-right');
    const heroTitle = document.querySelector('#accueil h1');
    heroTitle?.classList.add('hero-title-arrive');
    heroTitle?.addEventListener('animationend', () => heroTitle.classList.remove('hero-title-arrive'), { once: true });
  }
  function dismissIntro() {
    if (!introScreen?.classList.contains('is-active')) return;
    window.clearTimeout(introTimer);
    introScreen.classList.add('is-leaving');
    document.body.classList.remove('intro-playing');
    introScreen.setAttribute('aria-hidden', 'true');
    try { sessionStorage.setItem('portfolio-intro-seen', '1'); } catch {}
    window.setTimeout(() => {
      introScreen.classList.remove('is-active', 'is-leaving');
      document.documentElement.classList.remove('intro-pending');
      playHeroEntrance();
    }, reduceMotion ? 0 : 850);
    document.querySelector('#accueil h1')?.focus({ preventScroll: true });
  }
  let introAlreadySeen = true;
  try { introAlreadySeen = sessionStorage.getItem('portfolio-intro-seen') === '1'; } catch {}
  if (introScreen && !introAlreadySeen && !reduceMotion) {
    introScreen.classList.add('is-active');
    introScreen.setAttribute('aria-hidden', 'false');
    document.body.classList.add('intro-playing');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    skipIntro?.focus({ preventScroll: true });
    introTimer = window.setTimeout(dismissIntro, 2300);
  } else if (introScreen) {
    introScreen.remove();
    document.documentElement.classList.remove('intro-pending');
    playHeroEntrance();
  }
  skipIntro?.addEventListener('click', dismissIntro);

  // Révèle progressivement les sections, cartes et éléments de compétence.
  const revealTargets = new Set();
  document.querySelectorAll('main > section').forEach(section => {
    Array.from(section.children).forEach(child => revealTargets.add(child));
  });
  document.querySelectorAll('.reveal, .projet-card-container, .service-card, #cv .case-card, #cv .tech-group, .resume-copy, .resume-document, .tech-panel, #show-contact-form').forEach(element => {
    if (!element.closest('#contact-form-panel')) revealTargets.add(element);
  });
  const revealElements = Array.from(revealTargets).filter(element => !element.matches('#contact-form-panel'));
  const revealVariants = ['reveal--rise', 'reveal--soft', 'reveal--slide', 'reveal--scale'];
  revealElements.forEach((element, index) => {
    element.classList.add('reveal');
    element.classList.add(revealVariants[index % revealVariants.length]);
    element.style.setProperty('--reveal-delay', `${Math.min((index % 4) * 65, 195)}ms`);
  });
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('is-visible'));
  }

  const contactSection = document.getElementById('contact');
  if ('IntersectionObserver' in window && contactSection) {
    const contactObserver = new IntersectionObserver(([entry]) => {
      contactSection.classList.toggle('contact-in-view', entry.isIntersecting);
    }, { threshold: 0.45 });
    contactObserver.observe(contactSection);
  }

  // Sur mobile, un appui met temporairement les technologies en pause.
  document.querySelectorAll('.tech-marquee').forEach(marquee => {
    let resumeTimer = 0;
    marquee.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      window.clearTimeout(resumeTimer);
      marquee.classList.add('is-paused');
    });
    marquee.addEventListener('pointerup', event => {
      if (event.pointerType !== 'touch') return;
      resumeTimer = window.setTimeout(() => marquee.classList.remove('is-paused'), 2400);
    });
    marquee.addEventListener('pointercancel', () => marquee.classList.remove('is-paused'));
    marquee.addEventListener('pointerleave', () => {
      if (marquee.classList.contains('is-paused')) {
        window.clearTimeout(resumeTimer);
        marquee.classList.remove('is-paused');
      }
    });
  });

  // Une loupe textuelle colore les lettres proches du curseur, sans changer leur contenu.
  const textLensEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion;
  function prepareTextLens(root = document.body) {
    if (!textLensEnabled || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!node.nodeValue.trim() || !parent || parent.closest('script, style, svg, canvas, input, textarea, select, option, code, pre, [aria-hidden="true"], .cursor-halo, .text-glyph, .text-lens-group')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      const textGroup = document.createElement('span');
      textGroup.className = 'text-lens-group';
      Array.from(node.nodeValue).forEach(character => {
        const glyph = document.createElement('span');
        glyph.className = 'text-glyph';
        glyph.textContent = character;
        textGroup.appendChild(glyph);
      });
      const fragment = document.createDocumentFragment();
      fragment.appendChild(textGroup);
      node.replaceWith(fragment);
    });
  }
  prepareTextLens();

  const cursorHalo = document.querySelector('.cursor-halo');
  const cursorTrail = document.querySelector('.cursor-light-trail');
  const ambientScene = document.getElementById('ambient-scene');
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
        cursorTrail?.style.setProperty('--cursor-x', `${event.clientX}px`);
        cursorTrail?.style.setProperty('--cursor-y', `${event.clientY}px`);
        ambientScene?.style.setProperty('--reveal-x', `${event.clientX}px`);
        ambientScene?.style.setProperty('--reveal-y', `${event.clientY}px`);
        cursorHalo.classList.add('is-visible');
        cursorTrail?.classList.add('is-visible');
        updateTextLens(event.clientX, event.clientY);
      });
    }, { passive: true });
    document.addEventListener('pointerover', event => {
      if (event.target.closest('a, button, .tech-item, .architecture-sheet, .service-card')) cursorHalo.classList.add('is-active');
    });
    document.addEventListener('pointerout', event => {
      if (event.target.closest('a, button, .tech-item, .architecture-sheet, .service-card')) cursorHalo.classList.remove('is-active');
    });
    window.addEventListener('pointerout', event => {
      if (!event.relatedTarget) {
        clearTextLens();
        cursorHalo.classList.remove('is-visible', 'is-active');
        cursorTrail?.classList.remove('is-visible');
        ambientScene?.style.removeProperty('--reveal-x');
        ambientScene?.style.removeProperty('--reveal-y');
      }
    });
    window.addEventListener('blur', clearTextLens);
  }

  // Inclinaison légère des cartes, uniquement à la souris.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.tilt-card, .service-card, .architecture-sheet').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        const tiltStrength = card.matches('.architecture-sheet') ? 2.6 : card.matches('.service-card') ? 3 : 2;
        card.style.setProperty('--card-rotate-x', `${(-y * tiltStrength).toFixed(2)}deg`);
        card.style.setProperty('--card-rotate-y', `${(x * tiltStrength).toFixed(2)}deg`);
        card.style.setProperty('--pointer-x', `${(x + 0.5) * 100}%`);
        card.style.setProperty('--pointer-y', `${(y + 0.5) * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--card-rotate-x');
        card.style.removeProperty('--card-rotate-y');
        card.style.removeProperty('--pointer-x');
        card.style.removeProperty('--pointer-y');
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

  // Les liens Projets/CV partagent un alignement précis sous la navigation fixe.
  $('a[href="#projets"], a[href="#resume"]').on('click', function (event) {
    const target = document.getElementById(this.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    const headerBottom = document.querySelector('body > header')?.getBoundingClientRect().bottom ?? 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerBottom - 16;
    if (window.location.hash !== this.hash) window.history.pushState({}, '', this.hash);
    window.scrollTo({ top: Math.max(0, targetTop), behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  $(document).on('click', function (event) {
    if (!event.target.closest('#mobile-menu, #burger-btn') && $mobileMenu.hasClass('is-open')) {
      $mobileMenu.removeClass('is-open').attr('aria-hidden', 'true');
      $('#burger-btn').attr('aria-expanded', 'false').attr('aria-label', 'Ouvrir le menu');
    }
  });

  // Le filtre transforme la carte choisie et rejoue l’entrée des cartes restaurées.
  const projectsGrid = document.getElementById('projects-grid');
  let projectFilterTimer = 0;
  let activeProjectFilter = 'all';
  $('.filter-btn').on('click', function () {
    const filter = $(this).data('filter');
    if (filter === activeProjectFilter) return;
    activeProjectFilter = filter;
    $('.filter-btn').removeClass('active-filter').attr('aria-pressed', 'false');
    $(this).addClass('active-filter').attr('aria-pressed', 'true');

    window.clearTimeout(projectFilterTimer);
    const cards = Array.from(document.querySelectorAll('.projet-card-container'));
    if (filter === 'all') {
      projectsGrid?.classList.add('is-restoring');
      cards.forEach((card, index) => {
        card.style.display = '';
        card.style.removeProperty('--filter-delay');
        card.classList.remove('is-filtering-out', 'is-featured');
        card.classList.add('is-restoring-card');
        card.setAttribute('aria-hidden', 'false');
        card.removeAttribute('inert');
        card.style.setProperty('--restore-delay', `${index * 65}ms`);
      });
      projectFilterTimer = window.setTimeout(() => {
        projectsGrid?.classList.remove('is-restoring');
        cards.forEach(card => {
          card.classList.remove('is-restoring-card');
          card.style.removeProperty('--restore-delay');
        });
      }, reduceMotion ? 0 : 600);
      return;
    }

    projectsGrid?.classList.remove('is-restoring');
    cards.forEach(card => {
      card.style.display = '';
      card.classList.remove('is-restoring-card', 'is-filtering-out', 'is-featured');
      card.removeAttribute('inert');
      const matches = card.dataset.categorie === filter;
      card.setAttribute('aria-hidden', String(!matches));
      if (matches) {
        card.classList.add('is-featured');
      } else {
        card.setAttribute('inert', '');
        card.style.setProperty('--filter-delay', `${cards.indexOf(card) * 35}ms`);
        card.classList.add('is-filtering-out');
      }
    });
    projectFilterTimer = window.setTimeout(() => {
      cards.filter(card => card.dataset.categorie !== filter).forEach(card => {
        card.style.display = 'none';
        card.style.removeProperty('--filter-delay');
      });
    }, reduceMotion ? 0 : 300);
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
      subtitle: 'Python · Selenium · extraction de données',
      badge: 'Web scraping',
      desc: 'Projet Python d’extraction et de parsing de pages produits. Les données récupérées sont nettoyées puis exportées dans des formats structurés.',
      tree: ['scraper.py         → Navigation et extraction via Selenium', 'parser.py          → Lecture des pages', 'data_cleaner.py    → Nettoyage des valeurs', 'output/            → Exports CSV, JSON et Excel'],
      points: ['Navigation automatisée avec Selenium.', 'Nettoyage et normalisation des valeurs.', 'Exports CSV, JSON et Excel.'],
      repoUrl: 'https://github.com/Yh290507/YH_amazon_scraper'
    }
  };

  const projectModal = document.getElementById('project-modal');
  let modalTrigger = null;
  let modalCloseTimer = 0;
  $('.open-modal-btn').on('click', function () {
    const data = projectDetails[$(this).data('project')];
    if (!data) return;

    modalTrigger = this;
    window.clearTimeout(modalCloseTimer);
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
    projectModal?.setAttribute('aria-hidden', 'false');
    $('#project-modal').removeClass('hidden').addClass('flex');
    $('body').addClass('overflow-hidden');
    requestAnimationFrame(() => projectModal?.classList.add('is-open'));
    $('#close-modal-btn').trigger('focus');
  });

  function closeModal() {
    if (!projectModal || projectModal.classList.contains('hidden')) return;
    projectModal.classList.remove('is-open');
    projectModal.setAttribute('aria-hidden', 'true');
    $('body').removeClass('overflow-hidden');
    modalTrigger?.focus({ preventScroll: true });
    modalCloseTimer = window.setTimeout(() => {
      projectModal.classList.add('hidden');
      projectModal.classList.remove('flex');
    }, reduceMotion ? 0 : 320);
  }
  $('#close-modal-btn, #close-modal-footer, #modal-backdrop-close').on('click', closeModal);
  $(document).on('keydown', function (event) {
    if (introScreen?.classList.contains('is-active')) {
      if (event.key === 'Escape') dismissIntro();
      if (event.key === 'Tab') {
        event.preventDefault();
        skipIntro?.focus();
      }
      return;
    }
    if (event.key === 'Escape' && projectModal && !projectModal.classList.contains('hidden')) {
      closeModal();
    }
    if (event.key === 'Escape') {
      $mobileMenu.removeClass('is-open').attr('aria-hidden', 'true');
      $('#burger-btn').attr('aria-expanded', 'false').attr('aria-label', 'Ouvrir le menu');
    }

    if (event.key === 'Tab' && projectModal && !projectModal.classList.contains('hidden')) {
      const focusable = projectModal.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  // Le formulaire s’ouvre et se replie depuis la section Contact.
  let contactFormCloseTimer = 0;
  function setContactFormOpen(open, focusField = false) {
    const panel = document.getElementById('contact-form-panel');
    const trigger = document.getElementById('show-contact-form');
    if (!panel || !trigger) return;
    window.clearTimeout(contactFormCloseTimer);
    trigger.setAttribute('aria-expanded', String(open));
    trigger.classList.toggle('is-complete', open);
    trigger.querySelector('.contact-button-label').textContent = open ? 'Masquer le formulaire' : 'Remplir le formulaire de contact';
    panel.setAttribute('aria-hidden', String(!open));
    if (open) {
      panel.hidden = false;
      prepareTextLens(panel);
      requestAnimationFrame(() => panel.classList.add('is-open'));
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      if (focusField) window.setTimeout(() => document.getElementById('name')?.focus({ preventScroll: true }), reduceMotion ? 0 : 300);
    } else {
      panel.classList.remove('is-open');
      trigger.focus({ preventScroll: true });
      contactFormCloseTimer = window.setTimeout(() => { panel.hidden = true; }, reduceMotion ? 0 : 420);
    }
  }
  $('#show-contact-form').on('click', function () {
    const open = $(this).attr('aria-expanded') !== 'true';
    setContactFormOpen(open, open);
  });
  $('#hide-contact-form').on('click', () => setContactFormOpen(false));

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
