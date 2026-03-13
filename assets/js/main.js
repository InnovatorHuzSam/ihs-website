/* ============================================================
   IHS – Innovator HuzSam  |  Main JavaScript
   ============================================================ */

/* ---------- 0. Theme Initialization (runs immediately) ---------- */
(function() {
  const saved = localStorage.getItem('ihs-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1. Mobile Navigation ---------- */
  const hamburger  = document.querySelector('.hamburger');
  const nav        = document.querySelector('.nav');
  const overlay    = document.querySelector('.nav-overlay');
  const navLinks   = document.querySelectorAll('.nav a');

  function openNav() {
    hamburger?.classList.add('active');
    nav?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    hamburger?.classList.remove('active');
    nav?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
    // close all open dropdowns
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
  }

  hamburger?.addEventListener('click', () => {
    nav?.classList.contains('open') ? closeNav() : openNav();
  });

  overlay?.addEventListener('click', closeNav);
  navLinks.forEach(link => link.addEventListener('click', closeNav));

  /* ---------- 1b. Dropdown Menus ---------- */
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      // Only use click toggling on mobile; desktop uses CSS :hover
      if (window.innerWidth > 992) return;
      e.preventDefault();
      const dropdown = toggle.closest('.nav-dropdown');
      const isOpen = dropdown.classList.contains('open');

      // Close other dropdowns
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });

      dropdown.classList.toggle('open', !isOpen);
    });
  });

  /* ---------- 1c. Theme Toggle ---------- */
  const themeToggle = document.querySelector('.theme-toggle');
  themeToggle?.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ihs-theme', next);
  });

  /* ---------- 2. Sticky Header ---------- */
  const header = document.querySelector('.header');
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();                // run once on load

  /* ---------- 3. Back-to-Top Button ---------- */
  const btt = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btt?.classList.add('visible');
    } else {
      btt?.classList.remove('visible');
    }
  }, { passive: true });

  btt?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 4. FAQ Accordion ---------- */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isActive = item.classList.contains('active');

      // close all
      item.closest('.accordion')?.querySelectorAll('.accordion-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.accordion-body').style.maxHeight = null;
      });

      // open clicked (if it wasn't already open)
      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---------- 5. Simple Form Validation ---------- */
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      let valid = true;
      const required = form.querySelectorAll('[required]');

      required.forEach(field => {
        clearError(field);
        if (!field.value.trim()) {
          showError(field, 'This field is required.');
          valid = false;
        } else if (field.type === 'email' && !isEmail(field.value)) {
          showError(field, 'Please enter a valid email address.');
          valid = false;
        }
      });

      if (!valid) {
        e.preventDefault();
        // scroll to first error
        const firstErr = form.querySelector('.form-error');
        firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  function showError(field, msg) {
    field.classList.add('form-error-field');
    field.style.borderColor = '#EF4444';
    const err = document.createElement('span');
    err.className = 'form-error';
    err.style.cssText = 'color:#EF4444;font-size:.82rem;margin-top:.2rem;display:block;';
    err.textContent = msg;
    field.parentElement.appendChild(err);
  }

  function clearError(field) {
    field.classList.remove('form-error-field');
    field.style.borderColor = '';
    const err = field.parentElement.querySelector('.form-error');
    err?.remove();
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /* ---------- 6. Active Nav Link ---------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------- 7. AOS Initialization ---------- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: 'mobile'     // disable on phones for perf
    });
  }

  /* ---------- 8. Simple Counter Animation ---------- */
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length) {
    const observerOpts = { threshold: 0.5 };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, observerOpts);

    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 2000;
    const start    = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);   // ease-out cubic
      el.textContent = Math.floor(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ---------- 9. Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- 10. Hero Rotating Location Text ---------- */
  const heroLocationText = document.getElementById('heroLocationText');
  if (heroLocationText) {
    const locations = [
      { text: 'Gulf Countries', flagSrc: 'https://flagcdn.com/w40/ae.png', flagAlt: 'UAE flag' },
      { text: 'Pakistan', flagSrc: 'https://flagcdn.com/w40/pk.png', flagAlt: 'Pakistan flag' },
      { text: 'Bangladesh', flagSrc: 'https://flagcdn.com/w40/bd.png', flagAlt: 'Bangladesh flag' },
      { text: 'India', flagSrc: 'https://flagcdn.com/w40/in.png', flagAlt: 'India flag' },
      { text: 'Srilanka', flagSrc: 'https://flagcdn.com/w40/lk.png', flagAlt: 'Sri Lanka flag' },
      { text: 'Around the Globe', iconType: 'globe' }
    ];

    const escapeHtml = (value) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const renderLocationWord = (entry) => {
      const letters = Array.from(entry.text).map((character, index) => {
        const content = character === ' ' ? '&nbsp;' : escapeHtml(character);
        return `<span class="hero-letter" style="--d:${index * 26}ms">${content}</span>`;
      });

      const iconDelay = entry.text.length * 26 + 40;
      const iconMarkup = entry.iconType === 'globe'
        ? `<span class="hero-location-icon" style="--d:${iconDelay}ms"><i class="fa-solid fa-globe" aria-hidden="true"></i></span>`
        : `<span class="hero-location-icon" style="--d:${iconDelay}ms"><img src="${entry.flagSrc || ''}" alt="${escapeHtml(entry.flagAlt || '')}" loading="eager" decoding="async" /></span>`;

      heroLocationText.setAttribute('aria-label', entry.text);
      heroLocationText.innerHTML = letters.join('') + iconMarkup;
    };

    let locationIndex = locations.findIndex((entry) => entry.text === 'Around the Globe');
    if (locationIndex < 0) locationIndex = 0;

    renderLocationWord(locations[locationIndex]);

    setInterval(() => {
      locationIndex = (locationIndex + 1) % locations.length;
      renderLocationWord(locations[locationIndex]);
    }, 1800);
  }
});
