/* ── FIRMA · entrata hero ────────────────────────────────────────────
   Tutto con gsap.from(): senza GSAP l'hero è già visibile per CSS. ── */
window.bespokeHeroEntrance = function () {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-kicker', { y: 12, opacity: 0, duration: .55 })
    .from('#hero h1',     { y: 28, opacity: 0, duration: .9 }, '-=.3')
    .from('.hero-sub',    { y: 18, opacity: 0, duration: .65 }, '-=.55')
    .from('.hero-meta',   { y: 14, opacity: 0, duration: .55 }, '-=.4');
};

/* PLUMBING_V 2 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'ma-mi-gastronomia',                 // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [['12:00', '15:00']],
      2: [['12:00', '15:00']],
      3: [['12:00', '15:00'], ['18:30', '22:30']],
      4: [['12:00', '15:00'], ['18:30', '22:30']],
      5: [['12:00', '15:00'], ['18:30', '22:30']],
      6: [['18:30', '22:30']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'oggi',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana */
    EN: {
      'skip': 'Skip to content',
      'brand.aria': 'Ma Mi, back to top',
      'burger.aria': 'Open the menu',
      'nav.oggi': 'Today’s menu', 'nav.cena': 'The dinner carte',
      'nav.casa': 'Home cooking', 'nav.dove': 'Find us',
      'lang.aria': 'Passa all’italiano', 'lang.txt': 'IT',
      'nav.cta': 'Book',

      'hero.kicker': 'Trattoria & deli · Bovisa, Milan',
      'hero.h': 'Whatever<br>is on today.',
      'hero.sub': 'There is no fixed menu to show you, and that is the point: <strong>the home cooking changes</strong>. At lunch the day’s blackboard, in the evening a seasonal carte.',
      'hero.rating': 'from 204 Google reviews',
      'hero.cap': 'Via Candiani 122, with the day’s blackboard hanging outside.',

      'og.eyebrow': 'At lunch',
      'og.h': 'The day’s<br>blackboard.',
      'og.intro': 'At midday the menu is a board hung outside: pasta dishes that rotate, a single dish of the day, and the home cooking. It is lunch for the people who work and study in Bovisa. These were the dishes on the day of the photo.',
      'og.testa': 'Ma Mi · the day of the photo',
      'l1': 'Pumpkin and gorgonzola risotto', 'l2': 'Baked lasagne',
      'l3': 'Rigatoni with Neapolitan ragù', 'l4': 'Single dish of the day',
      'l5': 'Chili con carne', 'l6': 'Falafel', 'l7': 'Roast beef', 'l8': 'Curry',
      'og.nota': 'The blackboard changes every day. This is just a taste of the register.',
      'og.a1': 'Enlarge: the pasta with sardines', 'og.a2': 'Enlarge: the tiramisù',
      'og.cap1': 'The dish of the day, to take away too.',
      'og.cap2': 'The house tiramisù, with two spoons.',

      'ce.eyebrow': 'In the evening',
      'ce.h': 'A carte<br>that renews itself.',
      'ce.p1': 'In the evening the register changes: the carte is seasonal and rotates. It runs from <strong>pizzoccheri</strong> and <strong>ossobuco alla milanese</strong> to <strong>amatriciana with pecorino silano</strong>, with a <strong>vegan</strong> option and a <strong>gluten-free</strong> one almost always on it.',
      'ce.p2': 'And then there is the dish that says who they are: <strong>the family-tradition meatballs of zia Marisa</strong>. Home recipes, put on the carte with the name of the person who made them.',
      'ce.nota': 'Prices and dishes transcribed from their carte of 27 November 2025: they change, please confirm in the room.',

      'ca.eyebrow': 'Home cooking',
      'ca.h': 'From South to North,<br>and a lap of the world.',
      'ca.p1': 'In the same week you go from <strong>pasta with sardines alla palermitana</strong> to <strong>Valtellina pizzoccheri</strong>, then to <strong>curry</strong>, to <strong>chili</strong>, to chicken strips with coconut milk. It is the cooking of people who cook what they like, done well.',
      'ca.cit': '«A family feel and welcoming, <strong>the lady who served us has an infectious brightness</strong> and the cook is kind and great fun. All of it with excellent food.»',
      'ca.cit.c': 'Francesca Astuti, Google review',
      'ca.cta': 'Book a table',
      'ca.cap': 'Outside, on the yellow deck, when the sun is out.',

      'voci.eyebrow': 'Google reviews', 'voci.h': '4.7 out of 204.',
      'v1.p': '«A family feel and welcoming, the lady who served us has an infectious brightness and the cook is kind and great fun. All of it with excellent food!»',
      'v1.c': 'Francesca Astuti',
      'v2.p': '«I almost never order dessert, but the chicken strips with red lentils, cabbage in coconut milk and curry were so good that I imagined the dessert had to be amazing!»',
      'v2.c': 'Fabiola Pignatelli',
      'v3.p': '«Very good dishes, quick service at contained prices. Excellent cooking, lovely atmosphere. Recommended.»',
      'v3.c': 'From a Google review',

      'dove.eyebrow': 'Where we are', 'dove.h': 'Bovisa.',
      'dove.serv': 'Dine in · takeaway · home delivery',
      'dove.cta': 'Call to book',
      'dove.maptitle': 'Map: Ma Mi, Via Giuseppe Candiani 122, Milan',
      'd.lun': 'Monday', 'd.mar': 'Tuesday', 'd.mer': 'Wednesday', 'd.gio': 'Thursday',
      'd.ven': 'Friday', 'd.sab': 'Saturday', 'd.dom': 'Sunday',
      'o.lun': '12–3pm', 'o.mar': '12–3pm', 'o.sab': '6:30–10:30pm', 'd.chiuso': 'closed',

      'faq.h': 'Questions',
      'f1.q': 'Is the menu always the same?',
      'f1.a': 'No, it changes. At lunch there is the day’s blackboard, with dishes that rotate; in the evening the carte is seasonal and renews itself. That is why we don’t publish a fixed menu: the real one is today’s.',
      'f2.q': 'Can I get it to take away?',
      'f2.a': 'Yes: there is kerbside pickup and home delivery. At lunch many take a pasta dish in a tub and carry it off.',
      'f3.q': 'When are you open?',
      'f3.a': 'At lunch Monday to Friday, 12–3pm. In the evening Wednesday, Thursday, Friday and Saturday, 6:30–10:30pm. Closed Sunday.',
      'f4.q': 'Are there vegan or gluten-free dishes?',
      'f4.a': 'Often yes: the carte rotates vegan options (like the ratatouille with basmati rice) and gluten-free desserts (like the chocolate cake). They change with the menu, so ask when you come.',
      'f5.q': 'Where exactly are you?',
      'f5.a': 'Via Giuseppe Candiani 122, in Bovisa, a short walk from the Politecnico campus.',

      'foot.o1': 'Lunch: Mon–Fri 12–3pm',
      'foot.o2': 'Dinner: Wed–Sat 6:30–10:30pm',
      'foot.o3': 'Closed on Sunday',
      'foot.demo': 'Demonstration site built by',
      'ab.call': 'Book', 'ab.map': 'Find us',
      'lb.close': 'Close',
    },
  };
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  var heroEntrance = window.bespokeHeroEntrance || function () {};
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    heroEntrance();
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mainNav');
  if (burger && nav) {
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    var en = root.lang === 'en';
    var txt;
    if (st.open) {
      txt = (en ? 'Open now' : 'Aperto ora') + ' · ' + (en ? 'closes at ' : 'chiude alle ') + st.closesAt;
    } else if (st.opensToday) {
      txt = (en ? 'Closed · opens today at ' : 'Chiuso · apre oggi alle ') + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = (en ? 'Closed · opens ' + DAYS_EN[st.opensDay] + ' at ' : 'Chiuso · apre ' + DAYS_IT[st.opensDay] + ' alle ') + st.opensAt;
    } else {
      txt = en ? 'Closed' : 'Chiuso';
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    root.lang = lang === 'en' ? 'en' : 'it';
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = lang === 'en' && SITE.EN[key] !== undefined ? SITE.EN[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      setLang(root.lang === 'en' ? 'it' : 'en');
    });
  }
  try {
    if (localStorage.getItem(SITE.slug + '-lang') === 'en') setLang('en');
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */

  /* ══════════ FINE PLUMBING — sotto, il codice-firma ══════════ */

  var header = document.getElementById('header');
  if (header) {
    var headerScroll = function () { header.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', headerScroll, { passive: true });
    headerScroll();
  }

  /* FIRMA: le righe della lavagna del giorno si scrivono una dopo
     l'altra, come col gesso. Solo y/scaleY: senza GSAP la lavagna è
     già scritta e completa. */
  if (hasST && !reducedMotion) {
    var righe = document.querySelectorAll('.lav-lista li');
    if (righe.length) {
      gsap.from(righe, {
        y: 8, opacity: 0,
        duration: .32,
        ease: 'power2.out',
        stagger: .07,
        immediateRender: false,
        scrollTrigger: { trigger: '.lavagna', start: 'top 78%', once: true },
      });
    }
  }
})();
