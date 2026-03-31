/* ============================================
   PropFuel Webflow Enhancements
   External script loaded via <script> tag
   Handles: textures, animations, FAQ, nav scroll
   ============================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─────────────────────────────────────────
  // 0. INJECT TEXTURE-DEPENDENT CSS
  //    (Only matters after JS generates textures)
  // ─────────────────────────────────────────
  function injectDynamicCSS() {
    var css = '' +
      /* Card/feature texture overlays */
      '.pf-card,.pf-demo-form-card,.pf-feature-visual{position:relative;overflow:hidden}' +
      '.pf-card::before,.pf-demo-form-card::before,.pf-feature-visual::before{' +
        'content:"";position:absolute;inset:0;background-image:var(--card-texture);' +
        'background-size:512px 512px;mix-blend-mode:multiply;opacity:0.35;' +
        'pointer-events:none;border-radius:inherit;z-index:0}' +
      '.pf-card>*,.pf-demo-form-card>*,.pf-feature-visual>*{position:relative;z-index:1}' +

      /* Dark section textures */
      '.pf-stats-section,.pf-cta-section,.pf-footer,.pf-section-dark,.pf-value-section{' +
        'background-image:var(--dark-texture)!important;background-size:512px 512px!important}' +

      /* FAQ / warm section textures */
      '.pf-faq-section,.pf-transition-section-dark{' +
        'background-image:var(--faq-texture)!important;background-size:512px 512px!important}' +

      /* Demo form styles */
      '.pf-form-group{margin-bottom:12px}' +
      '.pf-form-label{display:block;font-size:13px;font-weight:600;color:#2F2F2F;margin-bottom:6px}' +
      '.pf-form-input{width:100%;padding:12px 16px;border:1.5px solid #E3DDD2;border-radius:8px;' +
        'font-size:15px;font-family:DM Sans,sans-serif;color:#2F2F2F;background:#fff;' +
        'transition:border-color .2s ease,box-shadow .2s ease;box-sizing:border-box}' +
      '.pf-form-input:focus{outline:none;border-color:#F47C2C;box-shadow:0 0 0 3px rgba(244,124,44,.12)}' +
      '.pf-form-input::placeholder{color:#BDBDBD}' +
      '.pf-form-textarea{min-height:80px;resize:vertical}' +
      '.pf-form-submit{width:100%;padding:16px;border:none;border-radius:100px;' +
        'background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;font-size:15px;' +
        'font-weight:600;font-family:DM Sans,sans-serif;cursor:pointer;margin-top:8px;' +
        'box-shadow:0 4px 16px rgba(240,90,40,.2);transition:box-shadow .3s ease}' +
      '.pf-form-submit:hover{box-shadow:0 4px 20px rgba(251,192,45,.3)}' +
      '.pf-form-submit:disabled{opacity:.7;cursor:default}' +

      /* Fix Webflow default link colors */
      'a,a:visited,a:link{color:inherit;text-decoration:none}' +
      'html{color:#2F2F2F}' +

      /* Fix nav button */
      '.pf-btn-nav{background-image:linear-gradient(to right,#F47C2C,#FBC02D)!important;' +
        'background-color:#FBC02D!important;border:none!important;border-color:transparent!important;color:#fff!important}' +
      '.pf-btn-nav:hover{background-image:none!important;background-color:#FBC02D!important;' +
        'color:#1A1714!important;border:1.5px solid #1A1714!important}' +
      '.pf-btn-nav:focus{outline:2px solid #F47C2C;outline-offset:2px}' +

      /* Footer link colors */
      '.pf-footer a,.pf-footer-link{color:#8C8479!important}' +
      '.pf-footer-link:hover{color:#F47C2C!important}' +

      '';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────
  // 1. TEXTURE GENERATION
  // ─────────────────────────────────────────
  function generateTexture(w, h, opts) {
    opts = opts || {};
    var noiseRange   = opts.noiseRange  || 8;
    var blueBias     = opts.blueBias    != null ? opts.blueBias : -2;
    var blotchCount  = opts.blotchCount || 400;
    var blotchRMin   = opts.blotchRMin  || 10;
    var blotchRMax   = opts.blotchRMax  || 70;
    var blotchAlpha  = opts.blotchAlpha || 0.015;
    var baseR        = opts.baseR       || 244;
    var baseG        = opts.baseG       || 241;
    var baseB        = opts.baseB       || 234;
    var blotchColors = opts.blotchColors || null;

    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');

    ctx.fillStyle = 'rgb(' + baseR + ',' + baseG + ',' + baseB + ')';
    ctx.fillRect(0, 0, w, h);

    var img = ctx.getImageData(0, 0, w, h);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() - 0.5) * 2 * noiseRange;
      d[i]     += n;
      d[i + 1] += n;
      d[i + 2] += n + blueBias;
    }
    ctx.putImageData(img, 0, 0);

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

    var pageTex = generateTexture(512, 512);
    var cardTex = generateTexture(512, 512, {
      noiseRange: 6, blotchCount: 80, blotchRMin: 5, blotchRMax: 30, blotchAlpha: 0.01
    });
    var darkTex = generateTexture(512, 512, {
      noiseRange: 7, blueBias: 1, blotchCount: 200, blotchRMin: 8, blotchRMax: 50,
      blotchAlpha: 0.012, baseR: 26, baseG: 23, baseB: 19,
      blotchColors: ['rgba(20,17,13,0.012)', 'rgba(35,30,24,0.012)']
    });
    var faqTex = generateTexture(512, 512, {
      noiseRange: 8, blueBias: -2, blotchCount: 400, blotchRMin: 10, blotchRMax: 70,
      blotchAlpha: 0.015, baseR: 235, baseG: 230, baseB: 218
    });

    document.body.style.backgroundImage = 'url(' + pageTex + ')';
    document.body.style.backgroundSize = '512px 512px';

    var root = document.documentElement;
    root.style.setProperty('--card-texture', 'url(' + cardTex + ')');
    root.style.setProperty('--dark-texture', 'url(' + darkTex + ')');
    root.style.setProperty('--faq-texture', 'url(' + faqTex + ')');
  }

  // ─────────────────────────────────────────
  // 2. SCROLL ANIMATIONS
  // ─────────────────────────────────────────
  function initScrollAnimations() {
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

    // Collect elements to animate
    var fadeEls = [];
    document.querySelectorAll(selectors).forEach(function (el) {
      if (el.closest('.pf-nav-bar') || el.closest('.pf-footer')) return;
      fadeEls.push(el);
    });

    if (prefersReducedMotion || fadeEls.length === 0) {
      fadeEls.forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Step 1: Hide all elements immediately (no transition yet)
    fadeEls.forEach(function (el) {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
    });

    // Step 2: Force reflow so the hidden state is painted
    void document.body.offsetHeight;

    // Step 3: Enable transitions, then observe
    requestAnimationFrame(function () {
      fadeEls.forEach(function (el) {
        el.style.transition = 'opacity 0.7s cubic-bezier(0.33, 0, 0.2, 1), transform 0.7s cubic-bezier(0.33, 0, 0.2, 1)';
      });

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger animations for elements entering at the same time
            var delay = 0;
            var rect = entry.target.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
              // Already in viewport on load — stagger based on position
              delay = Math.max(0, rect.top / window.innerHeight) * 0.4;
            }
            var target = entry.target;
            setTimeout(function () {
              target.style.opacity = '1';
              target.style.transform = 'translateY(0)';
            }, delay * 1000);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });

      fadeEls.forEach(function (el) {
        observer.observe(el);
      });
    });
  }

  // ─────────────────────────────────────────
  // 3. FAQ ACCORDION
  // ─────────────────────────────────────────
  function initFaqAccordion() {
    document.querySelectorAll('.pf-faq-question').forEach(function (question) {
      question.addEventListener('click', function () {
        var item = this.closest('.pf-faq-item');
        if (!item) return;

        document.querySelectorAll('.pf-faq-item.open').forEach(function (openItem) {
          if (openItem !== item) openItem.classList.remove('open');
        });

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
          nav.classList.toggle('scrolled', window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ─────────────────────────────────────────
  // 5. DEMO FORM INJECTION
  // ─────────────────────────────────────────
  function initDemoForm() {
    var card = document.querySelector('.pf-demo-form-card');
    if (!card) return;

    // Check if form already exists
    if (card.querySelector('form')) return;

    var formHTML = '' +
      '<form id="demoForm" style="margin-top:24px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
          '<div class="pf-form-group">' +
            '<label class="pf-form-label">First Name</label>' +
            '<input type="text" name="firstName" placeholder="Jane" required class="pf-form-input">' +
          '</div>' +
          '<div class="pf-form-group">' +
            '<label class="pf-form-label">Last Name</label>' +
            '<input type="text" name="lastName" placeholder="Smith" required class="pf-form-input">' +
          '</div>' +
        '</div>' +
        '<div class="pf-form-group">' +
          '<label class="pf-form-label">Work Email</label>' +
          '<input type="email" name="email" placeholder="jane@yourorg.com" required class="pf-form-input">' +
        '</div>' +
        '<div class="pf-form-group">' +
          '<label class="pf-form-label">Organization Name</label>' +
          '<input type="text" name="organization" placeholder="Your association or organization" required class="pf-form-input">' +
        '</div>' +
        '<div class="pf-form-group">' +
          '<label class="pf-form-label">Job Title</label>' +
          '<input type="text" name="jobTitle" placeholder="Your job title" required class="pf-form-input">' +
        '</div>' +
        '<div class="pf-form-group">' +
          '<label class="pf-form-label">How did you hear about PropFuel? <span style="font-weight:400;color:#BDBDBD">(optional)</span></label>' +
          '<textarea name="referralSource" placeholder="Tell us how you found us..." class="pf-form-input pf-form-textarea"></textarea>' +
        '</div>' +
        '<button type="submit" class="pf-form-submit">Request Your Demo</button>' +
        '<p style="font-size:12px;color:#6E6E6E;text-align:center;margin-top:12px">We\u2019ll reach out within one business day.</p>' +
      '</form>';

    card.insertAdjacentHTML('beforeend', formHTML);

    // Handle submit
    var form = document.getElementById('demoForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = form.querySelector('.pf-form-submit');
        btn.textContent = 'Thank you! We\u2019ll be in touch.';
        btn.style.background = '#7D9B4E';
        btn.disabled = true;
      });
    }
  }

  // ─────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────
  function init() {
    injectDynamicCSS();
    applyTextures();
    initScrollAnimations();
    initFaqAccordion();
    initNavScroll();
    initDemoForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
