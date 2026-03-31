/* ============================================
   PropFuel Webflow Enhancements
   External script loaded via <script> tag
   ============================================ */

(function () {
  'use strict';

  // --- Reduced Motion Check ---
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─────────────────────────────────────────
  // 1. TEXTURE GENERATION
  // ─────────────────────────────────────────
  function generateTexture(w, h, opts) {
    opts = opts || {};
    var noiseRange  = opts.noiseRange  || 8;
    var blueBias    = opts.blueBias    != null ? opts.blueBias : -2;
    var blotchCount = opts.blotchCount || 400;
    var blotchRMin  = opts.blotchRMin  || 10;
    var blotchRMax  = opts.blotchRMax  || 70;
    var blotchAlpha = opts.blotchAlpha || 0.015;
    var baseR       = opts.baseR       || 244;
    var baseG       = opts.baseG       || 241;
    var baseB       = opts.baseB       || 234;
    var blotchColors = opts.blotchColors || null;

    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');

    // Base fill
    ctx.fillStyle = 'rgb(' + baseR + ',' + baseG + ',' + baseB + ')';
    ctx.fillRect(0, 0, w, h);

    // Grain noise
    var img = ctx.getImageData(0, 0, w, h);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() - 0.5) * 2 * noiseRange;
      d[i]     += n;
      d[i + 1] += n;
      d[i + 2] += n + blueBias;
    }
    ctx.putImageData(img, 0, 0);

    // Tonal blotches
    var colors = blotchColors || [
      'rgba(235,228,215,' + blotchAlpha + ')',
      'rgba(250,246,238,' + blotchAlpha + ')'
    ];
    for (var j = 0; j < blotchCount; j++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * w,
        Math.random() * h,
        blotchRMin + Math.random() * (blotchRMax - blotchRMin),
        0, Math.PI * 2
      );
      ctx.fillStyle = colors[j % 2];
      ctx.fill();
    }

    return c.toDataURL('image/png');
  }

  function applyTextures() {
    if (prefersReducedMotion) return;

    // Page texture (T1 Standard)
    var pageTex = generateTexture(512, 512);

    // Card texture (lighter T1)
    var cardTex = generateTexture(512, 512, {
      noiseRange: 6,
      blotchCount: 80,
      blotchRMin: 5,
      blotchRMax: 30,
      blotchAlpha: 0.01
    });

    // Dark section texture
    var darkTex = generateTexture(512, 512, {
      noiseRange: 7,
      blueBias: 1,
      blotchCount: 200,
      blotchRMin: 8,
      blotchRMax: 50,
      blotchAlpha: 0.012,
      baseR: 26,
      baseG: 23,
      baseB: 19,
      blotchColors: ['rgba(20,17,13,0.012)', 'rgba(35,30,24,0.012)']
    });

    // FAQ / warm section texture
    var faqTex = generateTexture(512, 512, {
      noiseRange: 8,
      blueBias: -2,
      blotchCount: 400,
      blotchRMin: 10,
      blotchRMax: 70,
      blotchAlpha: 0.015,
      baseR: 235,
      baseG: 230,
      baseB: 218
    });

    // Apply page background
    document.body.style.backgroundImage = 'url(' + pageTex + ')';
    document.body.style.backgroundSize = '512px 512px';

    // Set CSS custom properties for pseudo-element textures
    var root = document.documentElement;
    root.style.setProperty('--card-texture', 'url(' + cardTex + ')');
    root.style.setProperty('--dark-texture', 'url(' + darkTex + ')');
    root.style.setProperty('--faq-texture', 'url(' + faqTex + ')');
  }

  // ─────────────────────────────────────────
  // 2. SCROLL ANIMATIONS (Fade-Up)
  // ─────────────────────────────────────────
  function initScrollAnimations() {
    // Auto-apply fade-up to all major sections
    var selectors = [
      'section',
      '[class*="pf-section"]',
      '[class*="pf-hero"]',
      '[class*="pf-stats"]',
      '[class*="pf-faq-section"]',
      '[class*="pf-cta"]',
      '[class*="pf-testimonials-section"]',
      '[class*="pf-value"]',
      '[class*="pf-transition"]',
      '[class*="pf-problem"]',
      '[class*="pf-page-hero"]',
      '[class*="pf-demo"]'
    ].join(',');

    var elements = document.querySelectorAll(selectors);
    elements.forEach(function (el) {
      // Don't animate nav or footer
      if (el.closest('.pf-nav-bar') || el.closest('.pf-footer')) return;
      el.classList.add('fade-up');
    });

    if (prefersReducedMotion) {
      // Instant reveal for reduced motion
      document.querySelectorAll('.fade-up').forEach(function (el) {
        el.classList.add('visible');
        el.style.transition = 'none';
      });
      return;
    }

    // Intersection Observer
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // One-shot
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ─────────────────────────────────────────
  // 3. FAQ ACCORDION
  // ─────────────────────────────────────────
  function initFaqAccordion() {
    var questions = document.querySelectorAll('.pf-faq-question');
    questions.forEach(function (question) {
      question.addEventListener('click', function () {
        var item = this.closest('.pf-faq-item');
        if (!item) return;

        // Close all other open items
        document.querySelectorAll('.pf-faq-item.open').forEach(function (openItem) {
          if (openItem !== item) openItem.classList.remove('open');
        });

        // Toggle current item
        item.classList.toggle('open');
      });
    });
  }

  // ─────────────────────────────────────────
  // 4. NAV SCROLL DETECTION
  // ─────────────────────────────────────────
  function initNavScroll() {
    var nav = document.querySelector('.pf-nav-bar');
    if (!nav) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 10) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ─────────────────────────────────────────
  // INITIALIZE EVERYTHING
  // ─────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    applyTextures();
    initScrollAnimations();
    initFaqAccordion();
    initNavScroll();
  }

})();
