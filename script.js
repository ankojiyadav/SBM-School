/* Sri Bhuwaneshwari Matric School — interactions */
(function () {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---- Nav: blur border on scroll, mobile toggle ---- */
  const nav = $('.nav');
  const toggle = $('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .reveal-scale, .stagger').forEach(el => io.observe(el));

  /* ---- Count-up numbers ---- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const isTimer = el.dataset.timer !== undefined;
      const end = parseFloat(isTimer ? el.dataset.timer : el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const fmt = v => isTimer
        ? String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0')
        : v + suffix;
      countIO.unobserve(el);
      if (reduce) { el.textContent = fmt(end); return; }
      const dur = 1600, t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count], [data-timer]').forEach(el => countIO.observe(el));

  /* ---- Word-by-word statement ---- */
  const statement = $('.statement');
  if (statement) {
    const hl = (statement.dataset.highlight || '').split(',').map(s => s.trim().toLowerCase());
    const words = statement.textContent.trim().split(/\s+/);
    statement.innerHTML = words.map(w => {
      const clean = w.replace(/[^\w]/g, '').toLowerCase();
      return `<span class="w${hl.includes(clean) ? ' hl' : ''}">${w}</span>`;
    }).join(' ');
  }
  const wordEls = statement ? $$('.w', statement) : [];

  /* ---- Scroll-driven effects ---- */
  const progress = $('.progress');
  const heroMedia = $('.hero-media');
  const record = $('.record-track');
  const recordBg = $('.record-bg');
  const recordContent = $('.record-content');
  const journey = $('.journey');
  const stops = journey ? $$('.journey-stops li', journey) : [];
  const field = $('.hero-field');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 8);

    if (progress) {
      const max = document.documentElement.scrollHeight - vh;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
    if (journey) {
      const r = journey.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (vh * 0.5)));
      journey.style.setProperty('--p', p.toFixed(4));
      stops.forEach((li, i) => li.classList.toggle('on', p >= i / (stops.length - 1) - 0.001));
    }
    if (reduce) { ticking = false; return; }
    if (field && y < 1200) field.style.setProperty('--sy', y.toFixed(0));

    if (heroMedia) {
      const r = heroMedia.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / vh));
      heroMedia.style.transform = `scale(${0.9 + 0.1 * p})`;
      heroMedia.style.borderRadius = `${28 - 10 * p}px`;
    }

    if (statement) {
      const r = statement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.floor(p * wordEls.length);
      wordEls.forEach((w, i) => w.classList.toggle('on', i < n));
    }

    if (record && recordBg) {
      const r = record.getBoundingClientRect();
      const total = r.height - vh;
      const p = Math.min(1, Math.max(0, -r.top / total));
      recordBg.style.opacity = Math.min(1, p * 2.2);
      recordBg.style.transform = `scale(${1.15 - 0.15 * p})`;
      if (recordContent) {
        const fade = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
        recordContent.style.transform = `translateY(${(0.5 - p) * 60}px)`;
        recordContent.style.opacity = Math.max(0, fade);
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---- Active nav link ---- */
  const links = $$('.nav-links a[href^="#"]');
  if (links.length) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const secIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const a = map.get(e.target.id);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) secIO.observe(s); });
  }

  /* ---- Horizontal scrollers ---- */
  $$('[data-scroll-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.scrollTarget);
      const card = el.firstElementChild;
      const step = card ? card.getBoundingClientRect().width + 20 : 400;
      el.scrollBy({ left: step * Number(btn.dataset.dir), behavior: 'smooth' });
    });
  });

  /* ---- Lightbox ---- */
  const lb = $('.lightbox');
  if (lb) {
    const lbImg = $('img', lb);
    const close = () => lb.classList.remove('open');
    document.addEventListener('click', e => {
      const fig = e.target.closest('[data-zoom]');
      if (fig) {
        const img = $('img', fig);
        lbImg.src = img.src; lbImg.alt = img.alt;
        lb.classList.add('open');
      } else if (e.target === lb || e.target.closest('.lightbox .circle-btn')) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---- FAQ accordion ---- */
  $$('.faq-q').forEach(q => q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', open);
  }));

  /* ---- Forms (no backend yet: show confirmation) ---- */
  $$('form[data-demo]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    f.classList.add('sent');
    const done = f.nextElementSibling;
    if (done) done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }));

  /* ---- Hero field: floating formulas & letters with parallax ---- */
  if (field) {
    const syms = [
      ['π', 6, 18, 56, .9], ['a² + b² = c²', 11, 64, 22, .5], ['∑', 17, 40, 42, .7], ['அ', 7, 84, 50, 1],
      ['√x', 23, 13, 26, .4], ['÷', 3, 47, 30, .5], ['E = mc²', 79, 15, 24, .6], ['∞', 90, 35, 58, 1],
      ['H₂O', 84, 60, 26, .5], ['△', 93, 80, 40, .8], ['Aa', 75, 86, 30, .6], ['½', 96, 11, 28, .4]
    ];
    field.innerHTML = syms.map(([t, l, top, s, d], i) =>
      `<span class="sym${top > 22 && top < 78 ? ' mid' : ''}" style="left:${l}%;top:${top}%;--s:${s}px;--d:${d};animation-delay:${(0.3 + i * 0.09).toFixed(2)}s"><i>${t}</i></span>`
    ).join('');
    if (!reduce && window.matchMedia('(pointer: fine)').matches) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      const step = () => {
        cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
        field.style.setProperty('--mx', cx.toFixed(4));
        field.style.setProperty('--my', cy.toFixed(4));
        raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(step) : null;
      };
      window.addEventListener('mousemove', e => {
        tx = e.clientX / window.innerWidth * 2 - 1;
        ty = e.clientY / window.innerHeight * 2 - 1;
        if (!raf) raf = requestAnimationFrame(step);
      }, { passive: true });
    }
  }

  /* ---- Rotating headline words ---- */
  const rot = $('.rotator');
  if (rot && !reduce) {
    const words = rot.dataset.words.split('|');
    const inner = rot.firstElementChild;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      rot.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        inner.textContent = words[i];
        rot.classList.remove('out');
        rot.classList.add('pre');
        void rot.offsetWidth;
        rot.classList.remove('pre');
      }, 560);
    }, 3200);
  }

  /* ---- Cursor spotlight on achievement cards ---- */
  $$('.ach').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--x', (e.clientX - r.left) + 'px');
    c.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }));

  /* ---- Gentle 3D tilt on feature tiles ---- */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    $$('.tile, .person, .program').forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        t.classList.add('tilting');
        t.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-6px)`;
      });
      t.addEventListener('pointerleave', () => { t.classList.remove('tilting'); t.style.transform = ''; });
    });
  }

  /* ---- Footer year ---- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
