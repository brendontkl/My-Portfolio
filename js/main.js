/* ═══════════════════════════════════════════════
   0xBR3N — main.js (v2, mobile optimised)
   ═══════════════════════════════════════════════ */

const isMobile = window.innerWidth <= 768 ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* ── 1. Matrix Rain (throttled on mobile) ── */
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const chars = '01BRENDONCVE!@#$%<>{}ABCDEFアイウカキクサシス';
  // Mobile: sparser columns & slower tick
  const fontSize  = isMobile ? 16 : 13;
  const tickMs    = isMobile ? 100 : 55;
  const colSkip   = isMobile ? 2 : 1; // every 2nd column on mobile

  let cols  = Math.floor(canvas.width / (fontSize * colSkip));
  let drops = Array(cols).fill(1);

  function draw() {
    ctx.fillStyle = isMobile ? 'rgba(5,5,8,0.08)' : 'rgba(5,5,8,0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = i % 4 === 0 ? '#00ff88' : 'rgba(0,255,136,0.45)';
      ctx.fillText(char, i * fontSize * colSkip, y * fontSize);
      if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });

    // recalc cols on resize
    const newCols = Math.floor(canvas.width / (fontSize * colSkip));
    while (drops.length < newCols) drops.push(Math.floor(Math.random() * -50));
  }

  setInterval(draw, tickMs);
})();


/* ── 2. Custom Cursor (desktop only) ── */
(function initCursor() {
  if (isMobile) return;
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    setTimeout(() => {
      trail.style.left = mx + 'px';
      trail.style.top  = my + 'px';
    }, 80);
  });

  document.querySelectorAll('a, button, .cve-card, .post-card, .tool-card, .cert-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2)';
      trail.style.transform  = 'translate(-50%,-50%) scale(1.5)';
      trail.style.borderColor = 'rgba(0,255,136,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      trail.style.transform  = 'translate(-50%,-50%) scale(1)';
      trail.style.borderColor = 'rgba(0,255,136,0.5)';
    });
  });
})();


/* ── 3. Nav scroll + hamburger ── */
(function initNav() {
  const nav       = document.getElementById('nav');
  const burger    = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }
})();

function closeMobileNav() {
  const nav    = document.getElementById('mobile-nav');
  const burger = document.getElementById('nav-hamburger');
  if (nav)    { nav.classList.remove('open'); }
  if (burger) { burger.classList.remove('open'); }
  document.body.style.overflow = '';
}


/* ── 4. Typewriter ── */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    '$ Web & Infrastructure VAPT specialist',
    '$ Active Directory attacks & red teaming',
    '$ Kiosk & Thick Client pentesting',
    '$ CVE-2024-40125 — CRITICAL 9.8 discovered',
    '$ Govt, MNCs & SMEs across Singapore',
    '$ Breaking systems so they don\'t break you.',
  ];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 2200); return; }
    } else {
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 42 : 68);
  }
  setTimeout(tick, 1000);
})();


/* ── 5. Scroll reveal ── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, idx) => {
      if (!entry.isIntersecting) return;
      const delay = +(entry.target.dataset.revealDelay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay * 100);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.cve-card, .post-card, .tool-card, .cert-card').forEach((el, i) => {
    el.dataset.revealDelay = i % 5;
  });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();


/* ── 6. Hero animate-in ── */
(function initHeroAnims() {
  document.querySelectorAll('.animate-in').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0) * 0.16;
    setTimeout(() => el.classList.add('visible'), delay * 1000 + 80);
  });
})();


/* ── 7. Dynamic YOE + live CVE count ── */
function calcYOE() {
  const start = new Date('2022-05-01');
  return Math.floor((Date.now() - start) / (365.25 * 24 * 3600 * 1000));
}

async function fetchCVECount() {
  try {
    const r = await fetch('https://api.github.com/repos/brendontkl/My-CVEs/contents');
    if (!r.ok) return 1;
    const d = await r.json();
    return d.filter(x => /^CVE-\d{4}-\d+/i.test(x.name)).length || 1;
  } catch { return 1; }
}

function animCount(el, target, ms = 1400) {
  if (!el || !target) return;
  const step = ms / target;
  let cur = 0;
  const t = setInterval(() => {
    el.textContent = ++cur;
    if (cur >= target) clearInterval(t);
  }, step);
}

(async function initStats() {
  const yoe = calcYOE();
  const cve = await fetchCVECount();

  setTimeout(() => {
    animCount(document.getElementById('yoe-counter'), yoe);
    animCount(document.getElementById('cve-counter'), cve, 1000);
    document.querySelectorAll('.stat-num[data-target]').forEach(el =>
      animCount(el, +el.dataset.target, 1000)
    );
  }, 500);

  const aboutYoe = document.getElementById('about-yoe');
  if (aboutYoe) aboutYoe.textContent = yoe;

  const liveEl = document.getElementById('cve-live-count');
  if (liveEl) liveEl.textContent = cve;
})();


/* ── 8. CVE filter ── */
(function initCVEFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.cve-card');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const show = f === 'all' || c.dataset.severity === f;
        c.style.opacity      = show ? '1' : '0.15';
        c.style.transform    = show ? '' : 'scale(0.97)';
        c.style.pointerEvents = show ? '' : 'none';
      });
    });
  });
})();


/* ── 9. PGP copy ── */
function copyPGP() {
  const text = document.querySelector('.pgp-content')?.textContent?.trim() || '';
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.pgp-copy');
    if (!btn) return;
    btn.textContent = '✓ Copied!';
    btn.style.color = '#00ff88';
    setTimeout(() => { btn.textContent = 'Copy Key'; btn.style.color = ''; }, 2000);
  });
}


/* ── 10. Terminal line reveal ── */
(function initTerminal() {
  const lines = document.querySelectorAll('.terminal-body .terminal-line');
  lines.forEach((line, i) => {
    line.style.opacity   = '0';
    line.style.transform = 'translateX(-6px)';
    setTimeout(() => {
      line.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      line.style.opacity    = '1';
      line.style.transform  = 'translateX(0)';
    }, 600 + i * 160);
  });
})();


/* ── 11. Active nav highlight ── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.style.color = l.getAttribute('href') === `#${e.target.id}` ? 'var(--green)' : '';
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => obs.observe(s));
})();
