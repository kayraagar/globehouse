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
    role: 'DJ / Producer',
    tags: ['Melodic House', 'Techno'],
    bio: 'Tim Titze occupies the space where melodic house meets driving techno. His sets are studies in patience and precision — deeply curated, narrative-driven, and calibrated to the room. He doesn\'t play to a genre; he builds an experience.',
    identity: 'Warm low-end frequencies, sharp evolving synthesis, and a restless sense of forward motion define Tim\'s sound — equally at home in an intimate basement or a festival main stage.',
    highlights: [
      'Performed across leading clubs in Istanbul, Berlin, and beyond',
      'Original productions gaining traction on international melodic labels',
      'Known for long-form sets built around a clear narrative arc',
      'Active collaborations with European artists in development',
    ],
    email: 'timtitze@globehouse.co',
    cta: 'Contact Tim',
  },
  vector: {
    name: 'Vector',
    role: 'DJ / Producer',
    tags: ['Techno', 'Industrial'],
    bio: 'Vector operates at the hard edge of the techno spectrum — precise, relentless, and uncompromising. Every set is a statement: darkness in music as pure energy, not aesthetic. Vector doesn\'t concede to the room; the room concedes to Vector.',
    identity: 'Raw textures, distorted percussion, and hypnotic structures with no crossover ambitions. The project exists as an argument for what techno should be when stripped of compromise.',
    highlights: [
      'Resident DJ at underground techno events across Istanbul',
      'Original tracks released on independent European techno imprints',
      'Known for technically exact mixing and sustained peak-hour intensity',
      'International profile built through selective, strategic bookings',
    ],
    email: 'vector@globehouse.co',
    cta: 'Contact Vector',
  },
  feyza: {
    name: 'Feyza Bayrakçı',
    role: 'DJ / Producer',
    tags: ['Afro House', 'Organic'],
    bio: 'Feyza Bayrakçı is one of the most singular voices in Turkey\'s underground scene. Her command of Afro House and organic sound creates a warmth and collective movement that is simultaneously global and deeply personal.',
    identity: 'Rooted in rhythm and texture, drawing from African musical heritage and contemporary global club culture. Feyza\'s sound doesn\'t follow the market — it creates its own territory.',
    highlights: [
      'Growing international bookings across Europe and the Middle East',
      'Productions blending organic percussion with contemporary club structure',
      'A following built entirely on substance, not algorithm',
      'Recognized as a key figure in Turkey\'s emerging Afro House movement',
    ],
    email: 'feyzabayrakci@globehouse.co',
    cta: 'Book Feyza',
  },
  kaan: {
    name: 'Kaan Ata',
    role: 'DJ / Producer',
    tags: ['Deep House', 'Progressive'],
    bio: 'Kaan Ata understands that a great night isn\'t built in the first hour. His deep house and progressive sets are characterized by emotional intelligence and architectural patience — tension built deliberately, release earned, not given.',
    identity: 'Lush harmonic movement, evolving basslines, and cinematic melodic development that never loses sight of the floor. Kaan\'s productions feel like they were made to be heard in the right place at the right time.',
    highlights: [
      'Bookings at premium venues and rooftop events across Istanbul',
      'Self-released EPs receiving support from established international DJs',
      'Known for immersive long-form programming that rewards attentive audiences',
      'Expanding booking activity across European territories',
    ],
    email: 'kaanata@globehouse.co',
    cta: 'Book Kaan',
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
