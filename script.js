/* ============================================================
   GLOBE Management — script.js
   ============================================================ */

const EASE = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

// ── Custom cursor ────────────────────────────────────────────
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

if (cursor && cursorTrail) {
  let mx = -100, my = -100;
  let tx = -100, ty = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function trailLoop() {
    tx += (mx - tx) * 0.1;
    ty += (my - ty) * 0.1;
    cursorTrail.style.left = tx + 'px';
    cursorTrail.style.top  = ty + 'px';
    requestAnimationFrame(trailLoop);
  })();

  // hover state on interactive elements
  const hoverEls = document.querySelectorAll(
    'a, button, .artist-card, .service-row, .pillar, .stat-item, .other-card'
  );
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorTrail.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorTrail.style.opacity = '1';
  });
}

// ── Magnetic buttons ─────────────────────────────────────────
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect   = el.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) * 0.28;
    const dy     = (e.clientY - cy) * 0.28;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

// ── Hero word reveal (wrap inner spans) ──────────────────────
document.querySelectorAll('[data-hero-word]').forEach(word => {
  const text = word.textContent;
  word.textContent = '';
  const inner = document.createElement('span');
  inner.className = 'hero-word-inner';
  inner.textContent = text;
  word.appendChild(inner);
});

// ── Navbar scroll state ──────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile nav toggle ────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    const [s0, s1, s2] = navToggle.querySelectorAll('span');
    if (open) {
      s0.style.transform = 'translateY(6.5px) rotate(45deg)';
      s1.style.opacity   = '0';
      s2.style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      [s0, s1, s2].forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });
}

// ── Scroll reveal ─────────────────────────────────────────────
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.07, rootMargin: '-30px' });

  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

// ── Count-up numbers ─────────────────────────────────────────
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();

  (function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = EASE(progress);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  })(start);
}

if ('IntersectionObserver' in window) {
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target.querySelector('[data-count]');
      if (el) countUp(el);
      statIO.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stat-item').forEach(el => statIO.observe(el));
}

// ── Section title char reveal ────────────────────────────────
if ('IntersectionObserver' in window) {
  const titleIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      el.innerHTML = '';

      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.style.cssText = `
          display: inline-block;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.025}s,
                      transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.025}s;
        `;
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
        requestAnimationFrame(() => {
          span.style.opacity   = '1';
          span.style.transform = 'translateY(0)';
        });
      });

      titleIO.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.split-title').forEach(el => titleIO.observe(el));
}

// ── Ticker ───────────────────────────────────────────────────
// CSS handles the loop animation — just ensure it's running

// ── Parallax on hero bg orbits ───────────────────────────────
const orbits = document.querySelectorAll('.orbit');
if (orbits.length) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbits.forEach((o, i) => {
      const speed = (i + 1) * 0.04;
      o.style.transform = `translate(-50%, calc(-50% + ${y * speed}px))`;
    });
  }, { passive: true });
}

// ── Scroll-linked progress line on navbar ────────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed; top: ${getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72px'};
  left: 0; height: 1px; width: 0%;
  background: rgba(255,255,255,0.25);
  z-index: 901; transition: width 0.1s linear; pointer-events: none;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrolled  = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrolled / maxScroll * 100) + '%';
}, { passive: true });

// ── Artist data ──────────────────────────────────────────────
const ARTISTS = {
  tim: {
    name: 'Tim Titze',
    role: 'DJ',
    tags: ['House', 'Afro House'],
    bio: 'Tim Titze is an Istanbul-based DJ and creative professional who has been actively involved in Turkey\'s nightlife scene for years. Known for his versatile music selection and ability to adapt to different audiences and event concepts, Tim delivers performances shaped around the energy of each crowd. While his sound is mainly influenced by house and afro house, he is comfortable performing across multiple genres depending on the atmosphere and style of the event.',
    identity: 'Energetic stage presence, strong crowd-reading ability, and a genuine versatility across genres define Tim\'s approach. He doesn\'t follow a single formula — he builds memorable experiences tailored to the room, the brand, and the moment.',
    highlights: [
      'Performed at Swissotel The Bosphorus and 29 Ulus',
      'Brand collaborations with P&G Türkiye, Clear, and Johnnie Walker',
      'Long-term collaboration with Doğuş Çabakçor in talent and brand management',
      'Based in Istanbul, actively expanding his career internationally',
    ],
    email: 'timtitze@globehouse.co',
    cta: 'Contact Tim',
  },
  vector: {
    name: 'Vector',
    role: 'DJ',
    tags: ['Afro / Amapiano', 'Hip-Hop / R&B'],
    bio: 'Vector is an Istanbul-based DJ whose career has been shaped through high-energy performances, strong crowd control, and a deep connection between music and movement. Active since 2018, he has built his reputation across dance events, club nights, fashion-driven performances, and large-scale entertainment projects throughout Turkey. Coming from a dance background, his sets are driven by rhythm, timing, and physical energy — allowing him to create immersive atmospheres that feel both dynamic and intentional.',
    identity: 'His approach moves fluidly between hip-hop, R&B, Afro, Amapiano, soul, and funk — blending groove-focused selections with versatile transitions that adapt naturally to different audiences and environments. Whether in clubs, dance-focused spaces, or alongside live performers, he maintains momentum while building a strong emotional connection with the crowd. Beyond the decks, his deep roots in Turkey\'s dance community — through workshops, dance schools, and performance organizations — give his sets a distinct balance of precision, movement, and raw energy.',
    highlights: [
      'Brand collaborations with Nike, Red Bull, Sneaks Up, and Galatasaray Sports Club',
      'Shared stages with Anıl Piyancı and performed within fashion and cultural events including projects connected to Sabit Akkaya',
      'Extensive work with dance schools, workshops, and performance organizations across Turkey',
      'Aiming to expand internationally through music, dance, and content-driven creative projects',
    ],
    email: 'vector@globehouse.co',
    cta: 'Contact Vector',
  },
  feyza: {
    name: 'Feyza Bayrakçı',
    role: 'DJ',
    tags: ['Bounce', 'Afro House', 'R&B'],
    bio: 'Coming from a dance-focused background, Feyza approaches music, movement, styling, and visual language as parts of the same creative world. This perspective allows her performances to evolve beyond conventional DJ sets, shaping a recognizable artistic identity that feels both dynamic and intentional.',
    identity: 'Feyza has performed at major festivals, university events, and large-scale nightlife projects across Turkey, while also appearing on international stages as part of her expanding global presence. Her involvement in brand collaborations and culture-driven projects has strengthened her connection with contemporary youth culture, positioning her among the emerging names of Turkey\'s new generation electronic and open-format scene.',
    highlights: [
      'Performances at major festivals, university events, and large-scale nightlife projects across Turkey',
      'International stage appearances as part of an expanding global presence',
      'Brand collaborations and culture-driven projects bridging music and contemporary youth culture',
      'Recognized among the emerging names of Turkey\'s new generation electronic and open-format scene',
    ],
    email: 'feyzabayrakci@globehouse.co',
    cta: 'Contact Feyza',
  },
  kaan: {
    name: 'Kaan Ata',
    role: 'DJ',
    tags: ['Commercial', 'Afro House'],
    bio: 'Kaan Ata is an Istanbul-based DJ active in nightlife, fashion, and private event scenes. Combining commercial, Turkish, and afro house sounds, he builds energetic sets that naturally adapt to the vibe of each crowd and venue.',
    identity: 'Known for his strong crowd connection and versatile music selection, Kaan brings a modern and atmosphere-driven approach to every performance. From intimate private gatherings to large festival stages, his sets move naturally between energy levels while keeping the room engaged from start to finish.',
    highlights: [
      'Performed at Çırağan Palace, Bodrum events, and festival stages',
      'A familiar name at launch events, designer showcases, and fashion and cosmetic brand gatherings',
      'Active across nightlife, fashion, and private event scenes throughout Turkey',
      'Growing presence within Istanbul\'s creative event culture',
    ],
    email: 'kaanata@globehouse.co',
    cta: 'Contact Kaan',
  },
};

// ── Modal ────────────────────────────────────────────────────
const overlay      = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

function openModal(key) {
  const a = ARTISTS[key];
  if (!a || !overlay) return;

  modalContent.innerHTML = `
    <div class="modal-artist-role">${a.role}</div>
    <div class="modal-artist-name">${a.name}</div>

    <div class="modal-section-label">Biography</div>
    <p class="modal-bio">${a.bio}</p>

    <div class="modal-divider"></div>

    <div class="modal-section-label">Sound Identity</div>
    <p class="modal-bio">${a.identity}</p>

    <div class="modal-divider"></div>

    <div class="modal-section-label">Highlights</div>
    <ul class="modal-highlights">
      ${a.highlights.map(h => `<li>${h}</li>`).join('')}
    </ul>

    <div class="modal-contact">
      <div class="modal-section-label">Book / Contact</div>
      <a href="mailto:${a.email}" class="modal-email-primary">${a.email}</a>
      <a href="mailto:info@globehouse.co" class="modal-email-secondary">
        General: info@globehouse.co
      </a>
      <div class="modal-actions">
        <a href="mailto:${a.email}" class="btn btn-primary">${a.cta}</a>
        <a href="mailto:info@globehouse.co" class="btn btn-ghost">General Inquiry</a>
      </div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (overlay) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── Contact form ─────────────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent          = 'Message Received';
    btn.style.background     = '#1a1a1a';
    btn.style.color          = '#666';
    btn.style.letterSpacing  = '0.18em';
    form.reset();

    setTimeout(() => {
      btn.textContent         = orig;
      btn.disabled            = false;
      btn.style.background    = '';
      btn.style.color         = '';
      btn.style.letterSpacing = '';
    }, 3500);
  }, 1200);
}

// ── Active nav link on scroll ─────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

if (sections.length && navAnchors.length) {
  const activeIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => activeIO.observe(s));
}
