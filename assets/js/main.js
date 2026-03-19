/* ============================================================
   IHS – Innovator HuzSam  |  Main JavaScript
   ============================================================ */

/* ---------- 0. Theme Initialization (runs immediately) ---------- */
(function() {
  const saved = localStorage.getItem('ihs-theme');
  const explicitPreference = localStorage.getItem('ihs-theme-explicit') === '1';

  if (explicitPreference && (saved === 'dark' || saved === 'light')) {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('ihs-theme', 'dark');
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
    localStorage.setItem('ihs-theme-explicit', '1');
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
  const WHATSAPP_NUMBER = '923217975367';

  const countryDropdowns = document.querySelectorAll('.country-dropdown');
  const countryCodeFallback = [
    { name: 'Pakistan', code: '+92', iso2: 'pk' },
    { name: 'India', code: '+91', iso2: 'in' },
    { name: 'Bangladesh', code: '+880', iso2: 'bd' },
    { name: 'United Kingdom', code: '+44', iso2: 'gb' },
    { name: 'United States', code: '+1', iso2: 'us' },
    { name: 'Canada', code: '+1', iso2: 'ca' },
    { name: 'United Arab Emirates', code: '+971', iso2: 'ae' },
    { name: 'Saudi Arabia', code: '+966', iso2: 'sa' },
    { name: 'Qatar', code: '+974', iso2: 'qa' },
    { name: 'Kuwait', code: '+965', iso2: 'kw' },
    { name: 'Australia', code: '+61', iso2: 'au' },
    { name: 'Germany', code: '+49', iso2: 'de' }
  ];

  const getFlagSources = (iso2 = '') => {
    const iso = (iso2 || '').toLowerCase();
    const isoUpper = iso.toUpperCase();
    if (!iso) return [];
    return [
      `https://flagcdn.com/w20/${iso}.png`,
      `https://flagsapi.com/${isoUpper}/flat/32.png`,
      `https://purecatamphetamine.github.io/country-flag-icons/3x2/${isoUpper}.svg`
    ];
  };

  const applyFlagWithFallback = (img, iso2, countryName = 'Country') => {
    if (!img) return;
    const sources = getFlagSources(iso2);
    if (!sources.length) return;

    let sourceIndex = 0;
    img.alt = `${countryName} flag`;
    img.loading = 'eager';
    img.decoding = 'async';

    img.onerror = () => {
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        img.src = sources[sourceIndex];
      }
    };

    img.src = sources[0];
  };

  const renderCountryCodeOptions = (items) => {
    if (!countryDropdowns.length) return;

    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));

    const closeAllCountryDropdowns = () => {
      countryDropdowns.forEach((dropdown) => {
        dropdown.classList.remove('open');
        dropdown.querySelector('.country-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        dropdown.querySelector('.country-dropdown-menu')?.setAttribute('aria-hidden', 'true');
      });
    };

    countryDropdowns.forEach((dropdown) => {
      const preferredCode = dropdown.dataset.defaultCode || '+92';
      const hiddenField = dropdown.querySelector('.country-code-value');
      const toggle = dropdown.querySelector('.country-dropdown-toggle');
      const menu = dropdown.querySelector('.country-dropdown-menu');
      const searchInput = dropdown.querySelector('.country-dropdown-search');
      const optionsContainer = dropdown.querySelector('.country-dropdown-options');
      const selectedFlag = toggle?.querySelector('.country-flag-icon');
      const selectedLabel = toggle?.querySelector('.country-dropdown-label');

      if (!hiddenField || !toggle || !menu || !searchInput || !optionsContainer || !selectedFlag || !selectedLabel) return;

      const priorValue = hiddenField.value || preferredCode;
      const hasPrior = sortedItems.some((item) => item.code === priorValue);
      const activeCode = hasPrior
        ? priorValue
        : (sortedItems.some((item) => item.code === preferredCode) ? preferredCode : (sortedItems[0]?.code || ''));

      hiddenField.value = activeCode;

      const buildOptions = (filter = '') => {
        const q = filter.trim().toLowerCase();
        const filtered = q
          ? sortedItems.filter((item) => `${item.name} ${item.code}`.toLowerCase().includes(q))
          : sortedItems;

        optionsContainer.innerHTML = filtered.map((item) => {
          const isActive = item.code === hiddenField.value ? ' is-active' : '';
          const sources = getFlagSources(item.iso2);
          const primary = sources[0] || '';
          const fallbackOne = sources[1] || '';
          const fallbackTwo = sources[2] || '';
          return `
            <button type="button" class="country-dropdown-option${isActive}" data-code="${item.code}" data-name="${item.name}" data-iso2="${item.iso2}">
              <img src="${primary}" alt="${item.name} flag" class="country-flag-icon" data-fallback-one="${fallbackOne}" data-fallback-two="${fallbackTwo}" onerror="if(this.dataset.fallbackOne){this.src=this.dataset.fallbackOne;this.dataset.fallbackOne='';return;} if(this.dataset.fallbackTwo){this.src=this.dataset.fallbackTwo;this.dataset.fallbackTwo='';return;}" loading="eager" decoding="async" />
              <span>${item.name} (${item.code})</span>
            </button>
          `;
        }).join('');
      };

      const syncSelected = () => {
        const selected = sortedItems.find((item) => item.code === hiddenField.value) || sortedItems[0];
        if (!selected) return;
        hiddenField.value = selected.code;
        applyFlagWithFallback(selectedFlag, selected.iso2, selected.name);
        selectedLabel.textContent = `${selected.name} (${selected.code})`;
      };

      buildOptions();
      syncSelected();

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = dropdown.classList.contains('open');
        closeAllCountryDropdowns();
        if (!isOpen) {
          dropdown.classList.add('open');
          toggle.setAttribute('aria-expanded', 'true');
          menu.setAttribute('aria-hidden', 'false');
          searchInput.focus();
        }
      });

      searchInput.addEventListener('input', () => {
        buildOptions(searchInput.value);
      });

      optionsContainer.addEventListener('click', (event) => {
        const option = event.target.closest('.country-dropdown-option');
        if (!option) return;

        hiddenField.value = option.dataset.code || hiddenField.value;
        syncSelected();
        buildOptions(searchInput.value);
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
      });
    });

    document.addEventListener('click', (event) => {
      const targetDropdown = event.target.closest('.country-dropdown');
      if (!targetDropdown) closeAllCountryDropdowns();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAllCountryDropdowns();
    });
  };

  const getAllCountryCodes = async () => {
    if (!countryDropdowns.length) return;

    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2', {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error(`Country API failed: ${response.status}`);

      const countries = await response.json();
      const map = new Map();

      countries.forEach((country) => {
        const root = country?.idd?.root;
        const suffixes = Array.isArray(country?.idd?.suffixes) ? country.idd.suffixes : [];
        const name = country?.name?.common;
        const iso2 = country?.cca2 ? country.cca2.toLowerCase() : '';

        if (!root || !suffixes.length || !name || !iso2) return;

        suffixes.forEach((suffix) => {
          const code = `${root}${suffix}`;
          const key = `${name}-${code}`;
          if (!map.has(key)) {
            map.set(key, {
              name,
              code,
              iso2
            });
          }
        });
      });

      const allCountryCodes = Array.from(map.values());
      if (!allCountryCodes.length) throw new Error('No country code data available');

      renderCountryCodeOptions(allCountryCodes);
    } catch (error) {
      renderCountryCodeOptions(countryCodeFallback);
    }
  };

  getAllCountryCodes();

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const required = form.querySelectorAll('[required]');
      const emailFields = form.querySelectorAll('input[type="email"]');

      required.forEach(field => {
        clearError(field);
        if (!field.value.trim()) {
          showError(field, 'This field is required.');
          valid = false;
        }
      });

      emailFields.forEach(field => {
        const value = field.value.trim();
        if (!value) {
          clearError(field);
          return;
        }
        if (!isEmail(value)) {
          showError(field, 'Please enter a valid email address.');
          valid = false;
        }
      });

      if (!valid) {
        // scroll to first error
        const firstErr = form.querySelector('.form-error');
        firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const formTitle =
        form.querySelector('h3')?.textContent.trim() ||
        form.closest('section')?.querySelector('.section-title')?.textContent.trim() ||
        'Website Inquiry';

      const fields = Array.from(form.querySelectorAll('input, select, textarea'))
        .filter((field) => {
          if (field.disabled) return false;
          if (field.tagName === 'INPUT' && ['hidden', 'submit', 'button', 'reset', 'file'].includes(field.type)) return false;
          if (field.type === 'radio' && !field.checked) return false;
          return true;
        })
        .map((field) => {
          if (field.classList.contains('phone-number-input')) {
            const countryCode = field.closest('.phone-input-group')?.querySelector('.country-code-value')?.value?.trim() || '';
            const phoneNumber = field.value.trim();
            if (!phoneNumber) return null;

            const groupLabel = field.closest('.form-group')?.querySelector('label')?.textContent.trim() || 'Phone / WhatsApp';
            const fullPhone = `${countryCode} ${phoneNumber}`.trim();
            return { label: groupLabel, value: fullPhone };
          }

          const groupLabel = field.closest('.form-group')?.querySelector('label')?.textContent.trim();
          const byForLabel = field.id
            ? form.querySelector(`label[for="${field.id}"]`)?.textContent.trim()
            : '';
          const label = byForLabel || groupLabel || field.name || field.id || 'Field';

          let value = '';
          if (field.tagName === 'SELECT') {
            const selected = field.options[field.selectedIndex];
            value = selected ? selected.textContent.trim() : '';
            if (!field.value) value = '';
          } else if (field.type === 'checkbox') {
            value = field.checked ? 'Yes' : 'No';
          } else {
            value = field.value.trim();
          }

          return { label, value };
        })
        .filter((entry) => entry && entry.value);

      const messageLines = [
        'Hello Innovator HuzSam,',
        '',
        `New inquiry from website form: ${formTitle}`,
        '',
        'Submitted details:'
      ];

      fields.forEach((entry) => {
        messageLines.push(`- ${entry.label}: ${entry.value}`);
      });

      messageLines.push('', 'Please get back to me. Thank you.');

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageLines.join('\n'))}`;
      window.location.href = whatsappUrl;
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
      { text: 'Around The Globe' },
      { text: 'Africa' },
      { text: 'Asia' },
      { text: 'Europe' },
      { text: 'America' }
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
        : entry.flagSrc
          ? `<span class="hero-location-icon" style="--d:${iconDelay}ms"><img src="${entry.flagSrc}" alt="${escapeHtml(entry.flagAlt || '')}" loading="eager" decoding="async" /></span>`
          : '';

      heroLocationText.setAttribute('aria-label', entry.text);
      heroLocationText.innerHTML = letters.join('') + iconMarkup;
    };

    let locationIndex = 0;

    renderLocationWord(locations[locationIndex]);

    setInterval(() => {
      locationIndex = (locationIndex + 1) % locations.length;
      renderLocationWord(locations[locationIndex]);
    }, 1800);
  }

  /* ---------- 11. Home Hero Image Slider ---------- */
  const heroSlides = Array.from(document.querySelectorAll('.hero-slider .hero-slide'));
  if (heroSlides.length > 1) {
    let activeSlideIndex = Math.max(0, heroSlides.findIndex((slide) => slide.classList.contains('active')));
    let isSliding = false;

    const setActiveSlide = (nextIndex) => {
      if (isSliding || nextIndex === activeSlideIndex) return;

      const currentSlide = heroSlides[activeSlideIndex];
      const nextSlide = heroSlides[nextIndex];
      isSliding = true;

      currentSlide.classList.remove('is-entering');
      nextSlide.classList.remove('is-leaving');

      currentSlide.classList.add('is-leaving');
      nextSlide.classList.add('is-entering');

      setTimeout(() => {
        currentSlide.classList.remove('active', 'is-leaving');
        nextSlide.classList.remove('is-entering');
        nextSlide.classList.add('active');
        activeSlideIndex = nextIndex;
        isSliding = false;
      }, 950);
    };

    setInterval(() => {
      const nextIndex = (activeSlideIndex + 1) % heroSlides.length;
      setActiveSlide(nextIndex);
    }, 3400);
  }

  /* ---------- 12. Home WhatsApp Quick Options ---------- */
  const whatsappFloat = document.querySelector('.whatsapp-float');

  if (whatsappFloat) {
    const popup = document.createElement('div');
    popup.className = 'whatsapp-popup';
    popup.setAttribute('aria-hidden', 'true');
    popup.innerHTML = `
      <button class="whatsapp-popup-close" type="button" aria-label="Close WhatsApp options">&times;</button>
      <p class="whatsapp-popup-title">How can we help you?</p>
      <div class="whatsapp-popup-options">
        <a class="whatsapp-option" href="https://wa.me/923217975367?text=${encodeURIComponent('Hello, I want to learn more about training programs.')}">Want to learn more about training programs</a>
        <a class="whatsapp-option" href="https://wa.me/923217975367?text=${encodeURIComponent('Hello, I want to book a trial class.')}">Want to book a trial class</a>
      </div>
    `;

    document.body.appendChild(popup);

    const closePopup = () => {
      popup.classList.remove('open');
      popup.setAttribute('aria-hidden', 'true');
    };

    const openPopup = () => {
      popup.classList.add('open');
      popup.setAttribute('aria-hidden', 'false');
    };

    whatsappFloat.addEventListener('click', (event) => {
      event.preventDefault();
      if (popup.classList.contains('open')) {
        closePopup();
      } else {
        openPopup();
      }
    });

    popup.addEventListener('click', (event) => {
      const closeButton = event.target.closest('.whatsapp-popup-close');
      if (closeButton) {
        event.preventDefault();
        closePopup();
        return;
      }

      const option = event.target.closest('.whatsapp-option');
      if (!option) return;
      event.preventDefault();
      closePopup();
      window.open(option.href, '_blank', 'noopener');
    });

    document.addEventListener('click', (event) => {
      if (!popup.classList.contains('open')) return;
      if (popup.contains(event.target) || whatsappFloat.contains(event.target)) return;
      closePopup();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePopup();
    });
  }

  /* ---------- 13. Terms TOC Active Link ---------- */
  const legalTocLinks = Array.from(document.querySelectorAll('.legal-toc a[href^="#"]'));
  if (legalTocLinks.length) {
    const sections = legalTocLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const setActiveTocLink = (id) => {
      legalTocLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', isActive);
      });
    };

    const getActiveSectionId = () => {
      const markerOffset = 160;
      const positions = sections.map((section) => ({
        id: section.id,
        top: section.getBoundingClientRect().top
      }));

      const passed = positions.filter((item) => item.top - markerOffset <= 0);
      if (passed.length) {
        return passed[passed.length - 1].id;
      }

      return positions[0]?.id;
    };

    const updateActiveByScroll = () => {
      const activeId = getActiveSectionId();
      if (activeId) setActiveTocLink(activeId);
    };

    legalTocLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        const target = href ? document.querySelector(href) : null;
        if (!target) return;

        event.preventDefault();
        const targetId = href.replace('#', '');
        setActiveTocLink(targetId);

        const top = target.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    let scrollTicking = false;
    const handleScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateActiveByScroll();
        scrollTicking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveByScroll();
  }
});
