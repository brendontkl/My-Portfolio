/* ═══════════════════════════════════════════════
   0xBREN PORTFOLIO — main.js
   ═══════════════════════════════════════════════ */

// ── 1. Matrix Rain Canvas ─────────────────────
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = '01アイウエオカキクケコサシスセソBRENDON!@#$%^&*<>{}[]CVE';
  const fontSize = 13;
  let cols = Math.floor(canvas.width / fontSize);
  let drops = Array(cols).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(5, 5, 8, 0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = i % 5 === 0 ? '#00ff88' : 'rgba(0,255,136,0.5)';
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
      ctx.fillText(char, i * fontSize, y * fontSize);
      if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
    cols = Math.floor(canvas.width / fontSize);
    while (drops.length < cols) drops.push(Math.floor(Math.random() * -50));
  }
  setInterval(draw, 55);
})();


// ── 2. Custom Cursor ──────────────────────────
(function initCursor() {
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
  document.querySelectorAll('a, button, .cve-card, .post-card, .tool-card').forEach(el => {
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


// ── 3. Nav Scroll Effect ──────────────────────
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
})();


// ── 4. Dynamic Years of Experience ───────────
// Started: May 1, 2022 — increments each anniversary automatically
function calcYOE() {
  const start = new Date('2022-05-01');
  const now   = new Date();
  const ms    = now - start;
  return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
}


// ── 5. Live CVE Count from GitHub API ────────
async function fetchCVECount() {
  try {
    const res  = await fetch('https://api.github.com/repos/brendontkl/My-CVEs/contents');
    if (!res.ok) return 1; // fallback
    const data = await res.json();
    // Count only CVE-XXXX-XXXXX named folders/files
    return data.filter(item => /^CVE-\d{4}-\d+/i.test(item.name)).length || 1;
  } catch {
    return 1; // fallback if rate-limited or offline
  }
}


// ── 6. Animate counter from 0 to target ──────
function animateCounter(el, target, duration = 1600) {
  if (!el) return;
  const step = duration / Math.max(target, 1);
  let current = 0;
  const timer = setInterval(() => {
    current++;
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, step);
}


// ── 7. Typewriter Effect ──────────────────────
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    '$ Web & Infrastructure VAPT specialist',
    '$ Active Directory attacks & red teaming',
    '$ Kiosk & Thick Client pentesting',
    '$ CVE-2024-40125 — CRITICAL 9.8 discovered',
    '$ Govt, MNCs & SMEs across Singapore & SEA',
    '$ Breaking systems so they don\'t break you.',
  ];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 2400); return; }
    } else {
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 40 : 68);
  }
  setTimeout(tick, 900);
})();


// ── 8. Scroll Reveal ──────────────────────────
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = +(entry.target.dataset.revealDelay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.cve-card, .post-card, .tool-card').forEach((el, i) => {
    el.dataset.revealDelay = i % 4;
  });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


// ── 9. Hero animate-in ────────────────────────
(function initHeroAnims() {
  document.querySelectorAll('.animate-in').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0) * 0.18;
    el.style.animationDelay = delay + 's';
    setTimeout(() => el.classList.add('visible'), delay * 1000 + 100);
  });
})();


// ── 10. Initialise stats on page load ─────────
(async function initStats() {
  const yoe     = calcYOE();
  const cveCount = await fetchCVECount();

  // Update hero stat counters
  const yoeEl = document.getElementById('yoe-counter');
  const cveEl = document.getElementById('cve-counter');

  // Wait briefly for hero to render, then animate
  setTimeout(() => {
    animateCounter(yoeEl, yoe, 1400);
    animateCounter(cveEl, cveCount, 1200);
  }, 600);

  // Animate generic data-target counters (e.g. "3 Sectors")
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    setTimeout(() => animateCounter(el, +el.dataset.target, 1200), 700);
  });

  // Update "4 years" text in About section dynamically
  const aboutYoe = document.getElementById('about-yoe');
  if (aboutYoe) aboutYoe.textContent = yoe;

  // Update live CVE badge
  const liveEl = document.getElementById('cve-live-count');
  if (liveEl) liveEl.textContent = cveCount;
})();


// ── 11. CVE Filter ────────────────────────────
(function initCVEFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.cve-card');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.severity === filter;
        card.style.opacity      = show ? '1' : '0.15';
        card.style.transform    = show ? '' : 'scale(0.96)';
        card.style.pointerEvents = show ? '' : 'none';
      });
    });
  });
})();


// ── 12. PGP Copy ─────────────────────────────
function copyPGP() {
  const pgpText = document.querySelector('.pgp-content')?.textContent || '';
  navigator.clipboard.writeText(pgpText.trim()).then(() => {
    const btn = document.querySelector('.pgp-copy');
    if (!btn) return;
    btn.textContent = '✓ Copied!';
    btn.style.color = '#00ff88';
    setTimeout(() => { btn.textContent = 'Copy Key'; btn.style.color = ''; }, 2000);
  });
}


// ── 13. Terminal line animation ───────────────
(function initTerminalLines() {
  const lines = document.querySelectorAll('.terminal-body .terminal-line');
  lines.forEach((line, i) => {
    line.style.opacity   = '0';
    line.style.transform = 'translateX(-8px)';
    setTimeout(() => {
      line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      line.style.opacity    = '1';
      line.style.transform  = 'translateX(0)';
    }, 400 + i * 180);
  });
})();


// ── 14. Active nav highlight on scroll ────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--green)' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
})();
