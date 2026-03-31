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

      /* Primary button text always white (not hover) */
      '.pf-btn-primary{color:#fff!important;transition:color .35s ease,border-color .35s ease,box-shadow .35s ease!important}' +
      '.pf-btn-primary:hover{color:#1A1714!important;transition:color .35s ease,border-color .35s ease,box-shadow .35s ease!important}' +

      /* Secondary button gentler transitions */
      '.pf-btn-secondary{transition:border-color .25s ease,box-shadow .25s ease,color .25s ease!important}' +

      /* Nav link display fix */
      '.pf-nav-link{display:inline-flex!important;align-items:center!important;gap:4px}' +
      '.pf-chevron{flex-shrink:0}' +
      '.pf-dropdown{position:relative}' +

      /* Dropdown menus */
      '.pf-dropdown-menu{position:fixed;top:72px;left:50%;transform:translateX(-50%);' +
        'background:rgb(246,242,232);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);' +
        'border:1px solid #E3DDD2;border-radius:20px;padding:32px 40px;' +
        'box-shadow:0 12px 48px rgba(120,110,95,.15);display:none;min-width:560px;z-index:200}' +
      '.pf-dropdown-menu::before{content:"";position:absolute;top:-16px;left:0;right:0;height:16px}' +
      '.pf-dropdown-menu.open{display:block;animation:pfDropIn .25s ease-out forwards}' +
      '.pf-dropdown-narrow{min-width:320px!important}' +
      '.pf-dropdown-narrow .pf-dd-cols{display:flex;flex-direction:column}' +
      '@keyframes pfDropIn{from{opacity:0;transform:translateX(-50%) translateY(-6px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}' +
      '.pf-dd-overview{display:block;padding:12px 16px;margin:-16px -20px 16px;border-radius:12px;' +
        'border-bottom:1px solid #E3DDD2;text-decoration:none;color:#2F2F2F;font-size:14px;transition:background .15s ease}' +
      '.pf-dd-overview:hover{background:rgba(0,0,0,.04)}' +
      '.pf-dd-overview strong{color:#F47C2C;margin-right:4px}' +
      '.pf-dd-cols{display:grid;grid-template-columns:1fr 1fr;gap:48px}' +
      '.pf-dd-heading{font-size:11px;font-weight:700;color:#F9A825;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}' +
      '.pf-dd-link{display:block;text-decoration:none;padding:10px 12px;margin:0 -12px;border-radius:10px;transition:background .15s ease}' +
      '.pf-dd-link:hover{background:rgba(0,0,0,.04)}' +
      '.pf-dd-title{display:block;font-size:14px;font-weight:600;color:#2F2F2F;line-height:1.3}' +
      '.pf-dd-link:hover .pf-dd-title{color:#F47C2C}' +
      '.pf-dd-desc{display:block;font-size:12px;font-weight:400;color:#6E6E6E;line-height:1.4;margin-top:2px}' +

      /* Membership AI — global blue steel text class */
      '.ai-text{color:#4A7FA5!important}' +
      '.ai-gradient-text{background:linear-gradient(to top,#1F3A51,#4A7FA5 45%,#35607E);' +
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}' +

      /* Membership AI dropdown tab */
      '.pf-dd-ai{display:flex;align-items:center;gap:12px;padding:12px 16px;margin:-8px -20px 16px;' +
        'border-radius:12px;background:rgba(74,127,165,.08);border:1px solid rgba(74,127,165,.12);' +
        'text-decoration:none;transition:background .15s ease}' +
      '.pf-dd-ai:hover{background:rgba(74,127,165,.15)}' +
      '.pf-dd-ai-icon{font-size:18px;background:linear-gradient(to top,#1F3A51,#4A7FA5 45%,#35607E);' +
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}' +
      '.pf-dd-ai-title{display:block;font-size:14px;font-weight:700;color:#4A7FA5}' +
      '.pf-dd-ai-desc{display:block;font-size:12px;color:#6E6E6E;margin-top:1px}' +

      /* Platform tabs */
      '.pf-tab{padding:12px 28px;border-radius:100px;font-size:15px;font-weight:600;font-family:DM Sans,sans-serif;' +
        'border:1.5px solid #E3DDD2;background:transparent;color:#2F2F2F;cursor:pointer;' +
        'transition:background .3s ease,border-color .3s ease,color .3s ease;position:relative;overflow:hidden}' +
      '.pf-tab:hover{border-color:#F47C2C;color:#F47C2C}' +
      '.pf-tab.active{border-color:#2F2F2F;color:#2F2F2F;background:transparent}' +
      '.pf-tab.active::after{content:"";position:absolute;inset:0;background:linear-gradient(to right,#F47C2C,#FBC02D);' +
        'border-radius:100px;animation:pfTabFill 8s linear forwards;z-index:-1}' +
      '@keyframes pfTabFill{from{transform:scaleX(0);transform-origin:left}to{transform:scaleX(1);transform-origin:left}}' +

      /* Membership AI tab — blue steel variant */
      '.pf-tab-ai{border-color:rgba(74,127,165,.3);color:#4A7FA5}' +
      '.pf-tab-ai:hover{border-color:#4A7FA5;color:#35607E}' +
      '.pf-tab-ai.active{border-color:#4A7FA5;color:#1F3A51}' +
      '.pf-tab-ai.active::after{background:linear-gradient(to right,#35607E,#4A7FA5,#D0DFEA)!important}' +

      /* Mockup UI cards */
      '.mu-card{background:#FFFBF2;border-radius:14px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);' +
        'font-family:DM Sans,sans-serif;text-align:left;width:100%;margin-bottom:16px}' +
      '.mu-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}' +
      '.mu-t{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6E6E6E}' +
      '.mu-pill{font-size:10px;font-weight:700;padding:4px 10px;border-radius:100px;display:inline-block}' +
      '.mu-g{background:#E8F5E9;color:#2E7D32}.mu-r{background:#FFEBEE;color:#C62828}' +
      '.mu-o{background:linear-gradient(135deg,#F47C2C,#FBC02D);color:#fff}' +
      '.mu-name{font-size:16px;font-weight:800;color:#2F2F2F}' +
      '.mu-sub{font-size:11px;color:#8C8479;margin-top:2px}' +
      '.mu-score{font-size:28px;font-weight:900;background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent}' +
      '.mu-div{height:1px;background:#E7E2D8;margin:12px 0}' +
      '.mu-tags{display:flex;gap:6px;flex-wrap:wrap}' +
      '.mu-tag{font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;background:#F4F1EA;color:#2F2F2F}' +
      '.mu-bar-row{display:flex;align-items:center;gap:10px}' +
      '.mu-bar-l{font-size:11px;color:#6E6E6E;width:56px;flex-shrink:0}' +
      '.mu-bar{flex:1;height:6px;background:#E7E2D8;border-radius:3px;overflow:hidden}' +
      '.mu-bar-f{height:100%;border-radius:3px;background:linear-gradient(90deg,#F47C2C,#FBC02D)}' +
      '.mu-bar-v{font-size:11px;font-weight:700;color:#2F2F2F;width:32px;text-align:right}' +
      '.mu-step-n{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);' +
        'color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}' +
      '.mu-btn{display:inline-flex;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;border:none}' +
      '.mu-btn-p{background:linear-gradient(135deg,#F47C2C,#FBC02D);color:#fff}' +
      '.mu-btn-o{background:transparent;border:1.5px solid #E7E2D8;color:#2F2F2F}' +
      '.mu-resp{padding:8px 14px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid #E7E2D8;background:#FFFBF2;color:#2F2F2F}' +
      '.mu-resp.sel{border-color:#F47C2C;background:linear-gradient(135deg,#F47C2C,#FBC02D);color:#fff}' +
      '.mu-bubble{background:#F4F1EA;border-radius:12px;padding:14px 16px;font-size:13px;line-height:1.5;color:#2F2F2F}' +

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

      /* Value section background video */
      '.vbg-video{position:absolute;top:50%;left:50%;min-width:100%;min-height:100%;width:auto;height:auto;' +
        'transform:translate(-50%,-50%);object-fit:cover;z-index:0}' +
      '.vbg-overlay{position:absolute;inset:0;background:rgba(26,23,19,.55);z-index:1}' +

      /* Logo carousel */
      '.lc-label{font-size:13px;font-weight:600;color:#8C8479;letter-spacing:.06em;text-transform:uppercase;text-align:center;margin-bottom:32px}' +
      '.lc-carousel{position:relative;overflow:hidden;max-width:960px;margin:0 auto;' +
        '-webkit-mask-image:linear-gradient(to right,transparent 0%,black 10%,black 90%,transparent 100%);' +
        'mask-image:linear-gradient(to right,transparent 0%,black 10%,black 90%,transparent 100%)}' +
      '.lc-track{display:flex;align-items:center;gap:64px;width:max-content;animation:scrollLogos 60s linear infinite}' +
      '@keyframes scrollLogos{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}' +
      '.lc-item{flex-shrink:0;height:36px;opacity:.6;filter:grayscale(100%)}' +
      '.lc-item img{height:100%;width:auto;display:block}' +

      /* Use case grid — asymmetric layout matching original */
      '.uc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1200px;margin:0 auto}' +
      '.uc-card{background:#FFFBF2;border-radius:20px;padding:36px 32px;display:flex;flex-direction:column;' +
        'justify-content:space-between;min-height:240px;position:relative;overflow:hidden;text-decoration:none;' +
        'transition:transform .3s ease,box-shadow .3s ease;border:1px solid rgba(0,0,0,.04)}' +
      '.uc-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.08)}' +

      /* Featured card — orange gradient, spans 2 columns */
      '.uc-featured{grid-column:span 2;background:linear-gradient(135deg,#F47C2C,#F9A825,#FBC02D);border:none}' +
      '.uc-featured .uc-type,.uc-featured .uc-num,.uc-featured .uc-label,.uc-featured .uc-org{color:#fff}' +
      '.uc-featured .uc-type{color:rgba(255,255,255,.85)}' +

      /* Dark card */
      '.uc-dark{background:#1A1713;border-color:rgba(255,255,255,.08)}' +
      '.uc-dark .uc-type{color:rgba(255,255,255,.6)}' +
      '.uc-dark .uc-num{color:#FBC02D}' +
      '.uc-dark .uc-label{color:rgba(255,255,255,.7)}' +
      '.uc-dark .uc-org{color:rgba(255,255,255,.5)}' +

      /* Wide card — spans 2 columns */
      '.uc-wide{grid-column:span 2}' +

      /* Typography */
      '.uc-type{display:block;font-size:22px;font-weight:800;letter-spacing:-.02em;color:#2F2F2F;margin-bottom:12px}' +
      '.uc-outcome{margin-top:auto}' +
      '.uc-num{font-size:clamp(40px,5vw,56px);font-weight:900;color:#2F2F2F;letter-spacing:-.03em;line-height:1}' +
      '.uc-label{font-size:16px;font-weight:500;color:#8C8479;margin-top:8px;line-height:1.4}' +
      '.uc-org{font-size:13px;font-weight:600;color:#8C8479;margin-top:16px;opacity:.7}' +

      /* Mobile: single column */
      '@media(max-width:900px){.uc-grid{grid-template-columns:1fr}.uc-featured,.uc-wide{grid-column:span 1}}' +

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
      // Add + icon if not present
      if (!question.querySelector('.pf-faq-icon')) {
        question.style.cssText = 'display:flex!important;justify-content:space-between;align-items:center;cursor:pointer;padding:0;margin:0;border:none;background:none;width:100%;text-align:left;font-family:DM Sans,sans-serif';
        var icon = document.createElement('span');
        icon.className = 'pf-faq-icon';
        icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
        icon.style.cssText = 'flex-shrink:0;transition:transform .3s ease;color:#2F2F2F';
        question.appendChild(icon);
      }

      // Force hide the answer
      var answer = question.parentElement ? question.parentElement.querySelector('.pf-faq-answer') : null;
      if (answer) {
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
        answer.style.paddingTop = '0';
        answer.style.paddingBottom = '0';
        answer.style.transition = 'max-height 0.4s ease, padding-top 0.4s ease, padding-bottom 0.4s ease';
      }

      question.addEventListener('click', function () {
        var item = this.closest('.pf-faq-item');
        if (!item) return;

        // Close all other items
        document.querySelectorAll('.pf-faq-item.open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('open');
            var a = openItem.querySelector('.pf-faq-answer');
            if (a) { a.style.maxHeight = '0'; a.style.paddingTop = '0'; a.style.paddingBottom = '0'; }
            var ic = openItem.querySelector('.pf-faq-icon');
            if (ic) ic.style.transform = 'rotate(0deg)';
          }
        });

        // Toggle current
        var isOpen = item.classList.toggle('open');
        var ans = item.querySelector('.pf-faq-answer');
        var ico = item.querySelector('.pf-faq-icon');
        if (ans) {
          if (isOpen) {
            ans.style.maxHeight = ans.scrollHeight + 40 + 'px';
            ans.style.paddingTop = '12px';
            ans.style.paddingBottom = '24px';
          } else {
            ans.style.maxHeight = '0';
            ans.style.paddingTop = '0';
            ans.style.paddingBottom = '0';
          }
        }
        if (ico) ico.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
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
  // 5. NAV FIXES
  // ─────────────────────────────────────────
  function fixNav() {
    // Fix nav link text and add chevrons
    var navLinks = document.querySelectorAll('.pf-nav-links .pf-nav-link');
    var linkMap = {
      'Platform': { text: 'Platform', chevron: true },
      'Use Cases': { text: 'Use Cases', chevron: true },
      'Customers': { text: 'Client Success', chevron: true },
      'Resources': { text: 'Resources', chevron: true }
    };
    navLinks.forEach(function(link) {
      var text = link.textContent.trim();
      var config = linkMap[text];
      if (config) {
        if (config.text !== text) link.childNodes[0].textContent = config.text;
        if (config.chevron && !link.querySelector('.pf-chevron')) {
          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('class', 'pf-chevron');
          svg.setAttribute('width', '12');
          svg.setAttribute('height', '12');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
          svg.setAttribute('stroke-width', '2.5');
          svg.setAttribute('stroke-linecap', 'round');
          svg.setAttribute('stroke-linejoin', 'round');
          svg.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
          svg.style.cssText = 'margin-left:4px;vertical-align:middle';
          link.appendChild(svg);
        }
      }
    });

    // Add logo icon
    var logoLink = document.querySelector('.pf-nav-logo');
    if (logoLink && !logoLink.querySelector('img')) {
      var img = document.createElement('img');
      img.src = 'https://cdn.prod.website-files.com/69ca88e6c52b04fb85f74a02/69cc30a4a0dc86d4b55ee8a1_logo.png';
      img.alt = 'PropFuel';
      img.style.cssText = 'height:40px;width:auto';
      logoLink.insertBefore(img, logoLink.firstChild);
    }

    // Fix CTA button text
    var navBtn = document.querySelector('.pf-btn-nav');
    if (navBtn && navBtn.textContent.trim() === 'Get a Demo') {
      navBtn.textContent = 'Get Started';
    }

    // Center nav links within the pill
    var navLinksContainer = document.querySelector('.pf-nav-links');
    if (navLinksContainer) {
      navLinksContainer.style.position = 'absolute';
      navLinksContainer.style.left = '50%';
      navLinksContainer.style.transform = 'translateX(-50%)';
    }

    // Inject dropdown menus
    var dropdowns = {
      'Platform': {
        overview: { title: 'Platform Overview', desc: 'See how Ask, Capture, and Act work together', href: '/platform/overview' },
        ai: { title: 'Membership AI', desc: 'AI agents that know your members by name', href: '/membership-ai' },
        cols: [
          { heading: 'Solutions', links: [
            { title: 'The Insights Engine', desc: 'Turn fragmented data into clear member signals', href: '/platform/insights' },
            { title: 'The Automation Engine', desc: 'Build smart workflows that run themselves', href: '/platform/automation' },
            { title: 'The Engagement Engine', desc: 'One question, every channel, real answers', href: '/platform/website' }
          ]},
          { heading: 'Tools', links: [
            { title: 'Email', desc: 'Conversational emails that get replies', href: '/platform/email' },
            { title: 'Website', desc: 'Personalized on-site engagement', href: '/platform/website' },
            { title: 'SMS', desc: 'Event-day texts that drive action', href: '/platform/sms' },
            { title: 'Integrations', desc: 'Two-way sync with your AMS', href: '/integrations' }
          ]}
        ]
      },
      'Use Cases': {
        cols: [
          { links: [
            { title: 'Onboarding', desc: 'Guide new members from day one', href: '/use-cases/onboarding' },
            { title: 'Renewals', desc: 'Retain members before they lapse', href: '/use-cases/renewals' },
            { title: 'Win-Back', desc: 'Re-engage lapsed and dormant members', href: '/use-cases/win-back' },
            { title: 'Acquisition', desc: 'Convert prospects into engaged members', href: '/use-cases/acquisition' }
          ]},
          { links: [
            { title: 'Events', desc: 'Drive registration, attendance & follow-up', href: '/use-cases/events' },
            { title: 'Certifications', desc: 'Keep members on track to completion', href: '/use-cases/certifications' },
            { title: 'Data Intelligence', desc: 'Write insights back to your AMS', href: '/use-cases/data-intelligence' }
          ]}
        ]
      },
      'Client Success': {
        narrow: true,
        cols: [{ links: [
          { title: 'ROI & Results', desc: 'Hard numbers across the platform', href: '/client-success/roi-results' },
          { title: 'Case Studies', desc: 'Real results from real associations', href: '/client-success/case-studies' },
          { title: 'Testimonials', desc: 'What members and staff say', href: '/client-success/testimonials' },
          { title: 'Customer Wall', desc: 'Organizations that trust PropFuel', href: '/client-success/customers' },
          { title: 'Implementation', desc: 'What getting started looks like', href: '/client-success/implementation' }
        ]}]
      },
      'Resources': {
        narrow: true,
        cols: [{ links: [
          { title: 'Blog', desc: 'Insights on member engagement', href: '/resources/blog' },
          { title: 'Webinars', desc: 'On-demand sessions & recordings', href: '/resources/webinars' },
          { title: 'Guides & Playbooks', desc: 'Deep-dive strategy content', href: '/resources/guides' },
          { title: 'Help Center', desc: 'Documentation & support', href: '/resources/help-center' },
          { title: 'Newsletter', desc: 'Stay in the loop', href: '/resources/newsletter' },
          { title: 'API Docs', desc: 'For technical teams', href: '/resources/api-docs' }
        ]}]
      }
    };

    navLinks.forEach(function(link) {
      var text = link.childNodes[0].textContent.trim();
      var dd = dropdowns[text];
      if (!dd) return;

      // Wrap link in a dropdown container
      var wrapper = document.createElement('div');
      wrapper.className = 'pf-dropdown';
      wrapper.style.position = 'relative';
      link.parentNode.insertBefore(wrapper, link);
      wrapper.appendChild(link);

      // Build menu HTML
      var menuClass = dd.narrow ? 'pf-dropdown-menu pf-dropdown-narrow' : 'pf-dropdown-menu';
      var html = '';
      if (dd.overview) {
        html += '<a href="' + dd.overview.href + '" class="pf-dd-overview"><strong>' + dd.overview.title + '</strong> ' + dd.overview.desc + '</a>';
      }
      if (dd.ai) {
        html += '<a href="' + dd.ai.href + '" class="pf-dd-ai">' +
          '<span class="pf-dd-ai-icon">&#x2726;</span>' +
          '<span><span class="pf-dd-ai-title">' + dd.ai.title + '</span>' +
          '<span class="pf-dd-ai-desc">' + dd.ai.desc + '</span></span></a>';
      }
      html += '<div class="pf-dd-cols">';
      dd.cols.forEach(function(col) {
        html += '<div class="pf-dd-col">';
        if (col.heading) html += '<div class="pf-dd-heading">' + col.heading + '</div>';
        col.links.forEach(function(l) {
          html += '<a href="' + l.href + '" class="pf-dd-link"><span class="pf-dd-title">' + l.title + '</span><span class="pf-dd-desc">' + l.desc + '</span></a>';
        });
        html += '</div>';
      });
      html += '</div>';

      var menu = document.createElement('div');
      menu.className = menuClass;
      menu.innerHTML = html;
      wrapper.appendChild(menu);

      // Hover handlers
      var closeTimer;
      wrapper.addEventListener('mouseenter', function() {
        clearTimeout(closeTimer);
        document.querySelectorAll('.pf-dropdown-menu.open').forEach(function(m) { m.classList.remove('open'); });
        menu.classList.add('open');
      });
      wrapper.addEventListener('mouseleave', function() {
        closeTimer = setTimeout(function() { menu.classList.remove('open'); }, 150);
      });
      menu.addEventListener('mouseenter', function() { clearTimeout(closeTimer); });
      menu.addEventListener('mouseleave', function() {
        closeTimer = setTimeout(function() { menu.classList.remove('open'); }, 150);
      });
    });
  }

  // ─────────────────────────────────────────
  // 6. HOMEPAGE FIXES
  // ─────────────────────────────────────────
  function fixHomepage() {
    // Fix empty stat numbers
    var statNums = document.querySelectorAll('.pf-stat-number');
    var statValues = ['8.68%', '$100M+', '72%'];
    statNums.forEach(function(el, i) {
      if (statValues[i] && (!el.textContent.trim() || el.textContent.includes('This is some text'))) {
        el.textContent = statValues[i];
      }
    });

    // Remove duplicate testimonial slides (keep first 6)
    var slides = document.querySelectorAll('.pf-testimonial-slide');
    if (slides.length > 6) {
      for (var i = 6; i < slides.length; i++) {
        slides[i].remove();
      }
    }

    // Testimonial carousel — show one at a time, rotate every 5s
    var allSlides = document.querySelectorAll('.pf-testimonial-slide');
    if (allSlides.length > 1) {
      var currentSlide = 0;
      allSlides.forEach(function(s, idx) {
        s.style.display = idx === 0 ? 'block' : 'none';
        s.style.transition = 'opacity 0.5s ease';
      });

      setInterval(function() {
        allSlides[currentSlide].style.opacity = '0';
        setTimeout(function() {
          allSlides[currentSlide].style.display = 'none';
          currentSlide = (currentSlide + 1) % allSlides.length;
          allSlides[currentSlide].style.display = 'block';
          allSlides[currentSlide].style.opacity = '0';
          requestAnimationFrame(function() {
            allSlides[currentSlide].style.opacity = '1';
          });
        }, 500);
      }, 5000);
    }

    // Replace logos bar with seamless scrolling carousel (hide duplicates)
    var allLogosBars = document.querySelectorAll('.pf-logos-bar');
    allLogosBars.forEach(function(bar, i) {
      if (i > 0) bar.style.display = 'none';
    });
    var logosBar = allLogosBars[0];
    if (logosBar) {
      var CDN = 'https://cdn.prod.website-files.com/69ca88e6c52b04fb85f74a02/';
      var logos = [
        { file: '69cc2ec91996f9fc1d17b050_aap-logo-gray.png', alt: 'AAP logo' },
        { file: '69cc2ec9e8c12bfd5ac2cd3a_ama-logo-gray.png', alt: 'AMA logo' },
        { file: '69cc2ec9695544dee4c0a5a3_asae-logo-1.png', alt: 'ASAE logo' },
        { file: '69cc2ec903ab16cf4dfe539c_veccs-logo-gray.png', alt: 'VECCS logo' },
        { file: '69cc2ec9de89e83990645b42_ena-logo-gray.png', alt: 'ENA logo' },
        { file: '69cc2ec9d2629b72dca2d2aa_iste-logo-gray.png', alt: 'ISTE logo' },
        { file: '69cc2ec913ab5ecbc5870b0f_nacubo-logo-gray.png', alt: 'NACUBO logo' },
        { file: '69cc2ec916f144921e029b5f_msta-logo-gray.png', alt: 'MSTA logo' },
        { file: '69cc2ec98ce8c8924a3c65b8_napnap-logo-gray.png', alt: 'NAPNAP logo' },
        { file: '69cc2ec913ab5ecbc5870aec_arn-logo-gray.png', alt: 'ARN logo' },
        { file: '69cc2ec9dbe5f7f452d9b238_incose-logo-gray.png', alt: 'INCOSE logo' },
        { file: '69cc2ec9ca59245bdfddf07a_aamft-logo-gray.png', alt: 'AAMFT logo' },
        { file: '69cc2ed4a99bddfdfb26d454_felinevma-logo-gray.png', alt: 'Feline VMA logo' },
        { file: '69cc2ec9229856cda8d1f8fb_phira-logo-gray.png', alt: 'PIHRA logo' },
        { file: '69cc2ec9c9aa2c836b0992ed_ins-logo-gray.png', alt: 'INS logo' },
        { file: '69cc2ec9d80e66a091b47006_ohi-logo-gray.png', alt: 'OHI logo' },
        { file: '69cc2ec9e95c2de127c47b73_acce-logo-gray.png', alt: 'ACCE logo' },
        { file: '69cc2ec990d8cadaf14ffd59_aao-logo-gray.png', alt: 'AAO logo' },
        { file: '69cc2ec99b35324118c2221d_fia-logo-gray.png', alt: 'FIA logo' },
        { file: '69cc2ec9ad470b944f4a9b95_iaslc-logo-gray.png', alt: 'IASLC logo' },
        { file: '69cc2ec94b9f3133c79f1cd2_oscpa-logo-gray.png', alt: 'OSCPA logo' },
        { file: '69cc2ec952669b880de6eab8_logo-aps-no-tagline-1.png', alt: 'APS logo' }
      ];
      var items = logos.map(function(l) {
        return '<span class="lc-item"><img loading="lazy" src="' + CDN + l.file + '" alt="' + l.alt + '"></span>';
      }).join('');
      // Duplicate for seamless loop
      var trackHTML = items + items;

      logosBar.innerHTML =
        '<p class="lc-label">Trusted by 300+ associations</p>' +
        '<div class="lc-carousel"><div class="lc-track">' + trackHTML + '</div></div>';
    }

    // Inject background video into value section
    var valueSection = document.querySelector('.pf-value-section');
    if (valueSection && !valueSection.querySelector('.vbg-video')) {
      valueSection.style.position = 'relative';
      valueSection.style.overflow = 'hidden';
      valueSection.style.borderRadius = '24px';
      valueSection.style.margin = '0 32px';

      // Video element
      var video = document.createElement('video');
      video.className = 'vbg-video';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.innerHTML = '<source src="https://res.cloudinary.com/dkfp95u2n/video/upload/q_auto,f_auto/v1774989702/problem-vid_z6t2v8.mp4" type="video/mp4">';
      valueSection.insertBefore(video, valueSection.firstChild);

      // Dark overlay
      var overlay = document.createElement('div');
      overlay.className = 'vbg-overlay';
      valueSection.insertBefore(overlay, video.nextSibling);

      // Ensure inner content is above video
      Array.from(valueSection.children).forEach(function(child) {
        if (!child.classList.contains('vbg-video') && !child.classList.contains('vbg-overlay')) {
          child.style.position = 'relative';
          child.style.zIndex = '2';
        }
      });
    }

    // Fix transition heading — split into 3 lines, third line orange
    var transHeading = document.querySelector('.pf-transition-heading');
    if (transHeading && transHeading.textContent.indexOf('AMS') !== -1) {
      transHeading.innerHTML =
        'You have an AMS to store data.<br>' +
        'You have an email tool to send messages.<br>' +
        '<span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">But you still need better member data<br>and engagement, right?</span>';
    }

    // Add logo + loop SVG to Welcome to PropFuel section
    var welcomeHeading = document.querySelector('.pf-transition-welcome');
    if (welcomeHeading) {
      var parent = welcomeHeading.parentElement;
      // Add logo above heading
      if (!parent.querySelector('.pf-welcome-logo')) {
        var logo = document.createElement('img');
        logo.className = 'pf-welcome-logo';
        logo.src = 'https://cdn.prod.website-files.com/69ca88e6c52b04fb85f74a02/69cc30a4a0dc86d4b55ee8a1_logo.png';
        logo.alt = 'PropFuel';
        logo.style.cssText = 'height:80px;width:auto;margin:0 auto 20px;display:block';
        parent.insertBefore(logo, welcomeHeading);
      }

      // Add loop SVG after description
      var desc = parent.querySelector('.pf-transition-desc');
      if (desc && !parent.querySelector('.pf-loop-graphic')) {
        var loopDiv = document.createElement('div');
        loopDiv.className = 'pf-loop-graphic';
        loopDiv.style.cssText = 'max-width:580px;margin:0 auto';
        loopDiv.innerHTML = '<svg viewBox="-10 -10 680 680" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto" role="img" aria-label="The Loop: Ask, Capture, Act">' +
          '<defs><linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F47C2C"/><stop offset="50%" stop-color="#F9A825"/><stop offset="100%" stop-color="#FBC02D"/></linearGradient></defs>' +
          '<circle cx="330" cy="330" r="260" fill="none" stroke="#E7E2D8" stroke-width="2.5"/>' +
          '<circle cx="330" cy="330" r="260" fill="none" stroke="url(#loopGrad)" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="544 1090" id="pfLoopArc"/>' +
          '<g opacity="0.35"><polygon points="520,108 530,102 523,115" fill="#F9A825"/><polygon points="140,552 130,558 136,546" fill="#F9A825"/><polygon points="140,108 130,102 136,115" fill="#F9A825"/></g>' +
          '<g><circle cx="330" cy="70" r="70" fill="url(#loopGrad)"/><circle cx="330" cy="70" r="70" fill="none" stroke="url(#loopGrad)" stroke-width="2.5"/><text x="330" y="62" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="28" font-weight="800" fill="#fff">Ask</text><text x="330" y="84" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">One question</text></g>' +
          '<g><circle cx="555" cy="460" r="70" fill="url(#loopGrad)"/><circle cx="555" cy="460" r="70" fill="none" stroke="url(#loopGrad)" stroke-width="2.5"/><text x="555" y="452" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="28" font-weight="800" fill="#fff">Capture</text><text x="555" y="474" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">Every response</text></g>' +
          '<g><circle cx="105" cy="460" r="70" fill="url(#loopGrad)"/><circle cx="105" cy="460" r="70" fill="none" stroke="url(#loopGrad)" stroke-width="2.5"/><text x="105" y="452" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="28" font-weight="800" fill="#fff">Act</text><text x="105" y="474" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">On data</text></g>' +
          '<foreignObject x="140" y="230" width="380" height="200"><div xmlns="http://www.w3.org/1999/xhtml" id="pfLoopQ" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-family:DM Sans,sans-serif;font-size:26px;font-weight:900;font-style:italic;color:#2F2F2F;line-height:1.3;letter-spacing:-0.02em;padding:0 10px">What\u2019s most important to you this year?</div></foreignObject>' +
          '</svg>';
        desc.insertAdjacentElement('afterend', loopDiv);

        // Animate arc + rotate questions
        var questions = [
          "What\u2019s most important to you this year?",
          "Are you interested in professional development?",
          "What would make your membership more valuable?",
          "Is there anything we can do to help you join?",
          "How satisfied are you with your experience?",
          "What events are you planning to attend?"
        ];
        var qIdx = 0;
        var arc = document.getElementById('pfLoopArc');
        var qEl = document.getElementById('pfLoopQ');
        if (arc && qEl && !prefersReducedMotion) {
          var startTime = performance.now();
          function animateLoop(now) {
            var elapsed = (now - startTime) % 6000;
            var offset = -(elapsed / 6000) * 1634;
            arc.setAttribute('stroke-dashoffset', offset);
            var newIdx = Math.floor(((now - startTime) % (6000 * questions.length)) / 6000);
            if (newIdx !== qIdx) {
              qIdx = newIdx;
              qEl.style.opacity = '0';
              setTimeout(function() {
                qEl.textContent = questions[qIdx % questions.length];
                qEl.style.opacity = '1';
              }, 200);
            }
            requestAnimationFrame(animateLoop);
          }
          qEl.style.transition = 'opacity 0.3s ease';
          requestAnimationFrame(animateLoop);
        }
      }
    }

    // Replace static platform card grid with tabbed carousel
    var platformSection = document.querySelector('.pf-platform-section');
    var platformGrid = platformSection ? platformSection.querySelector('.pf-platform-grid') : null;
    if (platformGrid) {
      var tabs = [
        { id: 'insights', label: 'Insights', title: 'More signal. Less noise.', desc: 'The Insights Engine interprets member behavior and surfaces who wants what, who\u2019s at risk, and who\u2019s ready for more \u2014 so you stop guessing and start acting.', features: ['Real-time member signals and engagement scoring','At-risk member identification before they lapse','AI-powered insight agent that learns over time','Clear, actionable dashboards \u2014 not data dumps'], link: '/platform/insights', mockup: '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Member Signal</span><span class="mu-pill mu-g">Healthy</span></div><div style="display:flex;justify-content:space-between;margin-top:10px"><div><div class="mu-name">Sarah Chen</div><div class="mu-sub">Director of Programs, ACME Assoc.</div></div><div style="text-align:right"><div class="mu-score">87</div><div class="mu-sub">Engagement Score</div></div></div><div class="mu-div"></div><div class="mu-tags"><span class="mu-tag">Certification</span><span class="mu-tag">Events</span><span class="mu-tag">Advocacy</span><span class="mu-tag">Mentorship</span></div></div><div class="mu-card"><div class="mu-hdr"><span class="mu-t">At-Risk Members</span><span class="mu-pill mu-r">12 flagged</span></div><div style="margin-top:10px"><div class="mu-bar-row"><span class="mu-bar-l">J. Rivera</span><div class="mu-bar"><div class="mu-bar-f" style="width:23%"></div></div><span class="mu-bar-v">23</span></div><div class="mu-bar-row" style="margin-top:8px"><span class="mu-bar-l">M. Patel</span><div class="mu-bar"><div class="mu-bar-f" style="width:31%"></div></div><span class="mu-bar-v">31</span></div><div class="mu-bar-row" style="margin-top:8px"><span class="mu-bar-l">K. Olsen</span><div class="mu-bar"><div class="mu-bar-f" style="width:18%"></div></div><span class="mu-bar-v">18</span></div></div></div>' },
        { id: 'automation', label: 'Automation', title: 'More personalization. Less busy work.', desc: 'The Automation Engine builds campaigns from scratch \u2014 segments, messaging, workflows \u2014 using 70+ blueprints. You just approve and launch.', features: ['70+ campaign blueprints ready to deploy','AI-generated messaging tailored to each segment','Conditional logic and drip sequences','One-click campaign builder \u2014 no technical skills needed'], link: '/platform/automation', mockup: '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Campaign Blueprint</span><span class="mu-pill mu-o">Ready to Launch</span></div><div style="margin-top:12px"><div class="mu-name">Renewal Win-Back \u2014 90 Day</div><div class="mu-sub">Targets 847 lapsed members \u00b7 3-step drip</div></div><div class="mu-div"></div><div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#2F2F2F"><div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">1</span> Segment</div><span style="color:#D6D0C4">\u2192</span><div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">2</span> Message</div><span style="color:#D6D0C4">\u2192</span><div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">3</span> Follow-up</div></div><div style="margin-top:16px;display:flex;gap:8px"><span class="mu-btn mu-btn-p">1-Click Deploy</span><span class="mu-btn mu-btn-o">Customize</span></div></div>' },
        { id: 'engagement', label: 'Engagement', title: 'More engagement. Less silence.', desc: 'The Engagement Engine turns one-way communications into two-way exchanges. Single-click responses across email, website, and SMS.', features: ['Single-click email responses members actually use','Website targeting \u2014 pop-ups, banners, inline content','SMS engagement with opt-in management','AMS integration with automatic data write-back'], link: '/platform/website', mockup: '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Live Response</span><span class="mu-pill mu-o">Collecting</span></div><div style="margin-top:12px;font-size:15px;font-weight:700;color:#2F2F2F">What\u2019s most important to you this year?</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><span class="mu-resp sel">Professional Development</span><span class="mu-resp">Networking</span><span class="mu-resp">Certification</span><span class="mu-resp">Advocacy</span></div><div class="mu-div"></div><div style="display:flex;gap:16px"><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;color:#2F2F2F">1,847</div><div class="mu-sub">Responses</div></div><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent">45%</div><div class="mu-sub">Engagement Rate</div></div><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;color:#2F2F2F">3</div><div class="mu-sub">Channels</div></div></div></div>' },
        { id: 'ai', label: 'Membership AI', title: 'Intelligence that connects everything.', desc: 'Membership AI is the layer across all three engines \u2014 it listens, interprets, recommends, and builds. Every interaction makes the next one smarter.', features: ['Insight Agent \u2014 surfaces what matters from your data','Initiative Agent \u2014 recommends what to do next','Recommendation Agent \u2014 personalizes every touchpoint','Learns continuously \u2014 the more you use it, the better it gets'], link: '/membership-ai', mockup: '<div class="mu-card"><div style="font-size:12px;font-weight:700;color:#2F2F2F;margin-bottom:8px">\u2728 Insight Agent</div><div class="mu-bubble"><strong>12 members</strong> showing lapse signals this week. Engagement scores dropped below 30.</div><div style="margin-top:12px;font-size:12px;font-weight:700;color:#2F2F2F;margin-bottom:8px">\ud83c\udfaf Initiative Agent</div><div class="mu-bubble">Recommended: Launch a <strong>win-back campaign</strong> for Q2 non-renewals. 80% success rate.</div><div style="margin-top:14px;display:flex;gap:8px"><span class="mu-btn mu-btn-p">Apply Recommendation</span><span class="mu-btn mu-btn-o">View Details</span></div></div>' }
      ];

      // Build tabbed UI
      var html = '<div class="pf-tabs" style="display:flex;gap:12px;margin-bottom:64px;flex-wrap:wrap">';
      tabs.forEach(function(t, i) {
        var isAI = t.id === 'ai';
        var tabCls = 'pf-tab' + (i === 0 ? ' active' : '') + (isAI ? ' pf-tab-ai' : '');
        html += '<button class="' + tabCls + '" data-tab="' + i + '">' + t.label + '</button>';
      });
      html += '</div><div class="pf-tab-panels">';
      tabs.forEach(function(t, i) {
        var isAI = t.id === 'ai';
        var dotColor = isAI ? '#4A7FA5' : '#F9A825';
        var titleStyle = isAI
          ? 'font-size:36px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;margin-bottom:20px;background:linear-gradient(to top,#1F3A51,#4A7FA5 45%,#35607E);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text'
          : 'font-size:36px;font-weight:700;color:#2F2F2F;line-height:1.15;letter-spacing:-0.02em;margin-bottom:20px';
        html += '<div class="pf-tab-panel" data-panel="' + i + '" style="display:' + (i === 0 ? 'grid' : 'none') + ';grid-template-columns:1fr 1fr;gap:64px;align-items:start">';
        html += '<div>';
        html += '<h3 style="' + titleStyle + '">' + t.title + '</h3>';
        html += '<p style="font-size:17px;color:#6E6E6E;line-height:1.65;margin-bottom:32px">' + t.desc + '</p>';
        html += '<ul style="list-style:none;padding:0;margin:0 0 36px">';
        t.features.forEach(function(f) {
          html += '<li style="font-size:15px;font-weight:500;color:#2F2F2F;display:flex;align-items:flex-start;gap:10px;line-height:1.4;margin-bottom:12px"><span style="width:6px;height:6px;min-width:6px;border-radius:50%;background:' + dotColor + ';margin-top:7px"></span>' + f + '</li>';
        });
        html += '</ul>';
        html += '<a href="' + t.link + '" style="display:inline-flex;align-items:center;gap:8px;background:#1A1714;border-radius:100px;padding:14px 28px;font-size:14px;font-weight:600;letter-spacing:0.03em;color:#F4F1EA;text-decoration:none;box-shadow:0 4px 16px rgba(0,0,0,0.15)">Learn More \u2192</a>';
        html += '</div>';
        html += '<div class="mu-ui" style="background:#EBE6DA;border-radius:20px;padding:28px;min-height:420px">' + t.mockup + '</div>';
        html += '</div>';
      });
      html += '</div>';

      platformGrid.outerHTML = html;

      // Tab switching + auto-rotation
      var tabBtns = platformSection.querySelectorAll('.pf-tab');
      var panels = platformSection.querySelectorAll('.pf-tab-panel');
      var currentTab = 0;
      var tabTimer = null;

      function activateTab(idx) {
        var prev = currentTab;
        currentTab = idx;
        tabBtns.forEach(function(b, i) { b.classList.toggle('active', i === idx); });

        // Animate: fade out current, then fade in new
        if (panels[prev] && prev !== idx) {
          panels[prev].style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          panels[prev].style.opacity = '0';
          panels[prev].style.transform = 'translateX(-30px)';
          setTimeout(function() {
            panels[prev].style.display = 'none';
            panels[idx].style.display = 'grid';
            panels[idx].style.opacity = '0';
            panels[idx].style.transform = 'translateX(30px)';
            // Force reflow
            void panels[idx].offsetHeight;
            panels[idx].style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            panels[idx].style.opacity = '1';
            panels[idx].style.transform = 'translateX(0)';
          }, 400);
        } else {
          panels.forEach(function(p, i) { p.style.display = i === idx ? 'grid' : 'none'; });
        }
      }

      function startRotation() {
        clearInterval(tabTimer);
        tabTimer = setInterval(function() { activateTab((currentTab + 1) % tabs.length); }, 8000);
      }

      tabBtns.forEach(function(btn, i) {
        btn.addEventListener('click', function() { activateTab(i); startRotation(); });
      });
      startRotation();
    }

    // Add arrows to primary CTA buttons that say "Get Started"
    document.querySelectorAll('.pf-btn-primary').forEach(function(btn) {
      if (btn.textContent.trim() === 'Get Started' && !btn.querySelector('svg')) {
        btn.insertAdjacentHTML('beforeend', ' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-left:4px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>');
      }
    });

    // Add logo image to footer brand section
    var footerBrand = document.querySelector('.pf-footer-brand');
    if (footerBrand && !footerBrand.querySelector('img')) {
      var logo = document.createElement('img');
      logo.src = 'https://cdn.prod.website-files.com/69ca88e6c52b04fb85f74a02/69cc30a4a0dc86d4b55ee8a1_logo.png';
      logo.alt = 'PropFuel';
      logo.style.cssText = 'height:48px;width:auto;display:block;margin-bottom:16px';
      footerBrand.insertBefore(logo, footerBrand.firstChild);
    }

    // Fix any "This is some text inside of a div block." placeholders
    document.querySelectorAll('div, p, span').forEach(function(el) {
      if (el.textContent.trim() === 'This is some text inside of a div block.') {
        el.textContent = '';
      }
    });

    // Add testimonial dots
    var section = document.querySelector('.pf-testimonials-section');
    if (section && allSlides.length > 1) {
      var dotsDiv = document.createElement('div');
      dotsDiv.style.cssText = 'display:flex;justify-content:center;gap:8px;margin-top:32px';
      for (var d = 0; d < allSlides.length; d++) {
        var dot = document.createElement('button');
        dot.style.cssText = 'width:10px;height:10px;border-radius:50%;border:none;cursor:pointer;padding:0;' +
          'background:' + (d === 0 ? '#F47C2C' : '#E3DDD2') + ';transition:background .2s ease';
        dot.dataset.slide = d;
        dotsDiv.appendChild(dot);
      }
      section.appendChild(dotsDiv);

      // Update dots when slides change
      var origInterval = setInterval(function() {
        var dots = dotsDiv.querySelectorAll('button');
        dots.forEach(function(dot, idx) {
          dot.style.background = (allSlides[idx] && allSlides[idx].style.display !== 'none') ? '#F47C2C' : '#E3DDD2';
        });
      }, 500);
    }

    // Replace use case grid with proper asymmetric layout matching original
    var ucSection = document.querySelector('.pf-usecases-section, [class*="usecases-section"], [class*="use-cases"]');
    if (!ucSection) {
      // Try finding by heading text
      document.querySelectorAll('h2').forEach(function(h) {
        if (h.textContent.trim().match(/Real outcomes/i) && !ucSection) {
          ucSection = h.closest('section') || h.parentElement;
        }
      });
    }

    if (ucSection) {
      // Find the grid container (the div holding the cards)
      var ucGrid = ucSection.querySelector('[class*="usecase-grid"], [class*="usecases-grid"]');
      if (!ucGrid) {
        var cards = ucSection.querySelectorAll('.pf-usecase-card');
        if (cards.length) ucGrid = cards[0].parentElement;
      }

      if (ucGrid) {
        var ucData = [
          { type: 'Win-Back', num: '80%', label: 'of lapsed members re-engaged within 90 days', org: 'AAP \u2014 American Academy of Pediatrics', style: 'featured', href: '/use-cases/win-back' },
          { type: 'Renewals', num: '$320K', label: 'recovered revenue from at-risk members', org: 'ASAE', href: '/use-cases/renewals' },
          { type: 'Data Intelligence', num: '42K', label: 'member insights captured in one quarter', org: 'ISTE', style: 'dark', href: '/use-cases/data-intelligence' },
          { type: 'Onboarding', num: '3x', label: 'new member engagement in the first 60 days', org: 'NACUBO', href: '/use-cases/onboarding' },
          { type: 'Events', num: '45%', label: 'attendee engagement rate at annual conference', org: 'NAPNAP', href: '/use-cases/events' },
          { type: 'Acquisition', num: '2.4x', label: 'conversion rate on non-member prospects', org: 'INCOSE', href: '/use-cases/acquisition' },
          { type: 'Data Enrichment', num: '4,500+', label: 'member profiles updated instantly', org: 'INS', style: 'dark-wide', href: '/use-cases/data-intelligence' }
        ];

        // Build the grid HTML
        var gridHTML = '<div class="uc-grid">';
        ucData.forEach(function(d) {
          var cls = 'uc-card';
          if (d.style === 'featured') cls += ' uc-featured';
          else if (d.style === 'dark') cls += ' uc-dark';
          else if (d.style === 'dark-wide') cls += ' uc-dark uc-wide';

          gridHTML += '<a href="' + d.href + '" class="' + cls + ' fade-up">' +
            '<div class="uc-type">' + d.type + '</div>' +
            '<div class="uc-outcome">' +
              '<div class="uc-num">' + d.num + '</div>' +
              '<div class="uc-label">' + d.label + '</div>' +
              '<div class="uc-org">' + d.org + '</div>' +
            '</div>' +
          '</a>';
        });
        gridHTML += '</div>';

        // Add CTA button
        gridHTML += '<div style="text-align:center;margin-top:48px" class="fade-up">' +
          '<a href="/client-success/case-studies" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font-size:16px;font-weight:700;border-radius:100px;text-decoration:none;background:linear-gradient(135deg,#F47C2C,#FBC02D);color:#fff;border:none;transition:transform .2s ease,box-shadow .2s ease">' +
            'View All Case Studies' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
          '</a></div>';

        ucGrid.outerHTML = gridHTML;
      }
    }
  }

  // ─────────────────────────────────────────
  // 6. DEMO FORM INJECTION
  // ─────────────────────────────────────────
  function initDemoForm() {
    var card = document.querySelector('.pf-demo-form-card');
    if (!card) return;

    // Check if HubSpot form already loaded
    if (card.querySelector('.hbspt-form, iframe[src*="hsforms"]')) return;

    // Create container for HubSpot form
    var container = document.createElement('div');
    container.id = 'hs-demo-form';
    container.style.marginTop = '24px';
    card.appendChild(container);

    // Load HubSpot script then create form
    var script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/embed/v2.js';
    script.charset = 'utf-8';
    script.onload = function() {
      if (window.hbspt) {
        hbspt.forms.create({
          portalId: '21158441',
          formId: 'f8009d2f-d93b-40b1-a669-d6c112abe6a5',
          region: 'na1',
          target: '#hs-demo-form'
        });
      }
    };
    document.head.appendChild(script);
  }

  // ─────────────────────────────────────────
  // 7. MEMBERSHIP AI PAGE — BLUE STEEL PALETTE
  // ─────────────────────────────────────────
  function applyMembershipAIPalette() {
    var path = window.location.pathname;
    if (path.indexOf('membership-ai') === -1) return;

    // AI gradient text fill helper
    var aiGradientText = 'background:linear-gradient(to top,#1F3A51,#4A7FA5 45%,#35607E);' +
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text';

    // Hero label pill — blue steel instead of amber
    var heroLabel = document.querySelector('.pf-page-hero-label, [class*="hero-label"]');
    if (heroLabel) {
      heroLabel.style.background = 'rgba(74,127,165,0.08)';
      heroLabel.style.borderColor = 'rgba(74,127,165,0.35)';
      heroLabel.style.color = '#4A7FA5';
    }

    // Section labels — blue steel uppercase labels
    document.querySelectorAll('.pf-section-label, [class*="section-label"]').forEach(function(label) {
      var text = label.textContent.toLowerCase();
      if (text.indexOf('membership') !== -1 || text.indexOf('ai') !== -1 || text.indexOf('signal') !== -1 || text.indexOf('agent') !== -1 || text.indexOf('intelligence') !== -1) {
        label.style.color = '#4A7FA5';
      }
    });

    // Feature/agent card accent bars — blue steel
    document.querySelectorAll('[class*="agent-card-accent"], [class*="card-accent"]').forEach(function(el) {
      el.style.background = 'linear-gradient(to bottom,#35607E,#4A7FA5,#D0DFEA)';
    });

    // Bullet dots on feature lists — blue steel
    document.querySelectorAll('[class*="feature"] li::before, [class*="bullet"]').forEach(function(el) {
      el.style.background = '#4A7FA5';
    });

    // Stat numbers — AI gradient text
    document.querySelectorAll('.pf-stat-number, [class*="stat-num"]').forEach(function(el) {
      el.style.cssText = aiGradientText;
    });

    // Any orange gradient text on this page → AI gradient
    document.querySelectorAll('h1, h2, h3').forEach(function(el) {
      var cs = window.getComputedStyle(el);
      // Check if element has gradient text fill
      if (cs.webkitTextFillColor === 'transparent' || cs.backgroundClip === 'text') {
        el.style.cssText += ';' + aiGradientText;
      }
    });

    // AI badge/chip styling for any "AI" tags
    document.querySelectorAll('[class*="pill"], [class*="badge"], [class*="chip"]').forEach(function(el) {
      var text = el.textContent.toLowerCase();
      if (text.indexOf('ai') !== -1 || text.indexOf('signal') !== -1 || text.indexOf('membership') !== -1) {
        el.style.background = 'rgba(74,127,165,0.08)';
        el.style.borderColor = 'rgba(74,127,165,0.12)';
        el.style.color = '#4A7FA5';
      }
    });

    // CTA section on Membership AI page — keep brand gradient buttons (per brand guide)
    // but ensure section decorative elements use AI palette
    document.querySelectorAll('.pf-section-dark [class*="label"], .pf-stats-section [class*="label"]').forEach(function(el) {
      var text = el.textContent.toLowerCase();
      if (text.indexOf('membership') !== -1 || text.indexOf('ai') !== -1) {
        el.style.color = '#D0DFEA';
      }
    });
  }

  // ─────────────────────────────────────────
  // 8. PLATFORM OVERVIEW PAGE FIXES
  // ─────────────────────────────────────────
  function fixPlatformOverview() {
    if (window.location.pathname.indexOf('platform/overview') === -1) return;

    // --- 1. Hide the Webflow "Platform" orange label (pf-transition-label) ---
    document.querySelectorAll('.pf-transition-label').forEach(function(el) {
      if (el.textContent.trim().toLowerCase() === 'platform') {
        el.style.display = 'none';
      }
    });

    // --- 2. Fix hero heading using exact Webflow class ---
    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) {
      var parent = heroHeading.parentElement;

      // Add "The Platform" pill label above heading if not present
      if (!parent.querySelector('.pf-hero-label-injected')) {
        var label = document.createElement('p');
        label.className = 'pf-hero-label-injected fade-up';
        label.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;' +
          'background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;' +
          'font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;' +
          'box-shadow:0 2px 8px rgba(120,110,95,0.06)';
        label.textContent = 'The Platform';
        parent.insertBefore(label, heroHeading);
      }

      // Fix headline text + gradient on "Membership"
      heroHeading.innerHTML = 'Know and Grow<br>Your <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Membership</span>';
    }

    // --- 3. Fix subtitle text using exact Webflow class ---
    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) {
      heroSub.textContent = 'The membership insights and engagement platform that helps associations understand what members want\u00a0\u2014\u00a0and act on it.';
    }

    // --- 4. Inject hero buttons (Webflow has NO buttons in the hero) ---
    if (heroHeading) {
      var heroParent = heroHeading.parentElement;
      if (!heroParent.querySelector('.pf-hero-btns-injected')) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'pf-hero-btns-injected fade-up';
        btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';
        btnWrap.innerHTML =
          '<a href="/demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">' +
            'Get a Demo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '<a href="#engines" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">' +
            'Explore the Engines</a>';
        // Insert after subtitle
        var sub = heroParent.querySelector('.pf-page-hero-sub');
        if (sub) {
          sub.parentNode.insertBefore(btnWrap, sub.nextSibling);
        } else {
          heroParent.appendChild(btnWrap);
        }
      }
    }

    // ═══════════════════════════════════════
    // SECTION 2: ENGINE MOCKUP GRAPHICS
    // Inject UI mockups into .pf-feature-visual containers
    // ═══════════════════════════════════════

    // Find all feature visual containers on the page
    var visuals = document.querySelectorAll('.pf-feature-visual');

    // Engine 01: Insights — Super Contact Profile + At-Risk + Trends
    var insightsMockup =
      '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Super Contact Profile</span><span class="mu-pill mu-g">Healthy</span></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">' +
        '<div><div class="mu-name">Sarah Chen</div><div class="mu-sub">Director of Programs, ACME Assoc.</div></div>' +
        '<div style="text-align:right"><div class="mu-score">87</div><div class="mu-sub">Engagement Score</div></div></div>' +
      '<div class="mu-div"></div>' +
      '<div class="mu-tags"><span class="mu-tag">Certification</span><span class="mu-tag">Events</span><span class="mu-tag">Advocacy</span><span class="mu-tag">Mentorship</span></div></div>' +
      '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">At-Risk Members</span><span class="mu-pill mu-r">12 flagged</span></div>' +
        '<div style="margin-top:10px">' +
          '<div class="mu-bar-row"><span class="mu-bar-l">J. Rivera</span><div class="mu-bar"><div class="mu-bar-f" style="width:23%"></div></div><span class="mu-bar-v">23</span></div>' +
          '<div class="mu-bar-row" style="margin-top:8px"><span class="mu-bar-l">M. Patel</span><div class="mu-bar"><div class="mu-bar-f" style="width:31%"></div></div><span class="mu-bar-v">31</span></div>' +
          '<div class="mu-bar-row" style="margin-top:8px"><span class="mu-bar-l">K. Olsen</span><div class="mu-bar"><div class="mu-bar-f" style="width:18%"></div></div><span class="mu-bar-v">18</span></div>' +
        '</div></div>' +
      '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Engagement Trends</span><span class="mu-pill" style="background:#E3F2FD;color:#1565C0">This Month</span></div>' +
        '<div style="margin-top:8px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0"><span style="font-size:13px;font-weight:600;color:#2F2F2F">Response Rate</span><span style="font-size:13px;font-weight:700;color:#2E7D32">+12%</span></div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0"><span style="font-size:13px;font-weight:600;color:#2F2F2F">New Responses</span><span style="font-size:13px;font-weight:700;color:#2E7D32">+847</span></div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0"><span style="font-size:13px;font-weight:600;color:#2F2F2F">At-Risk Members</span><span style="font-size:13px;font-weight:700;color:#C62828">-3</span></div>' +
        '</div></div>';

    // Engine 02: Automation — Campaign Blueprint + Conditional Workflow + Active Campaigns
    var automationMockup =
      '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Campaign Blueprint</span><span class="mu-pill mu-o">Ready to Launch</span></div>' +
        '<div style="margin-top:12px"><div class="mu-name">Renewal Win-Back \u2014 90 Day</div><div class="mu-sub">Targets 847 lapsed members \u00b7 3-step drip sequence</div></div>' +
        '<div class="mu-div"></div>' +
        '<div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#2F2F2F">' +
          '<div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">1</span> Segment</div>' +
          '<span style="color:#D6D0C4">\u2192</span>' +
          '<div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">2</span> Message</div>' +
          '<span style="color:#D6D0C4">\u2192</span>' +
          '<div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">3</span> Follow-up</div></div>' +
        '<div style="margin-top:16px;display:flex;gap:8px"><span class="mu-btn mu-btn-p">1-Click Deploy</span><span class="mu-btn mu-btn-o">Customize</span></div></div>' +
      '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Conditional Workflow</span><span class="mu-pill mu-g">Running</span></div>' +
        '<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">' +
          '<div style="display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D)"></div><span style="font-size:12px;font-weight:600;color:#2F2F2F">Question: What matters most?</span></div>' +
          '<div style="margin-left:3px;border-left:2px solid #E7E2D8;padding-left:16px;display:flex;flex-direction:column;gap:6px">' +
            '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:#E8F5E9;color:#2E7D32">If "Networking"</span><span style="font-size:11px;color:#8C8479">\u2192 Event invite sequence</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:#E3F2FD;color:#1565C0">If "Certification"</span><span style="font-size:11px;color:#8C8479">\u2192 CE credit pathway</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:#FFF3E0;color:#E65100">If "Advocacy"</span><span style="font-size:11px;color:#8C8479">\u2192 PAC engagement drip</span></div>' +
          '</div></div></div>' +
      '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Active Campaigns</span><span class="mu-pill mu-g">3 running</span></div>' +
        '<div style="margin-top:10px">' +
          '<div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff">\u26A1</div><div><div style="font-size:13px;font-weight:600;color:#2F2F2F">New Member Onboarding</div><div class="mu-sub">234 members \u00b7 Step 2 of 4 \u00b7 67% completion</div></div></div>' +
          '<div style="display:flex;align-items:center;gap:10px;margin-top:10px"><div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#F9A825,#FBC02D);display:flex;align-items:center;justify-content:center;font-size:12px;color:#E65100">\u23F1</div><div><div style="font-size:13px;font-weight:600;color:#2F2F2F">Event Follow-Up \u2014 Annual Conference</div><div class="mu-sub">1,203 attendees \u00b7 82% engaged</div></div></div>' +
        '</div></div>';

    // Engine 03: Engagement — Live Response + SMS dark card + Channel Breakdown
    var engagementMockup =
      '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Live Response</span><span class="mu-pill mu-o">Collecting</span></div>' +
        '<div style="margin-top:12px;font-size:15px;font-weight:700;color:#2F2F2F;line-height:1.4">What\u2019s most important to you this year?</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><span class="mu-resp sel">Professional Development</span><span class="mu-resp">Networking</span><span class="mu-resp">Certification</span><span class="mu-resp">Advocacy</span></div>' +
        '<div class="mu-div"></div>' +
        '<div style="display:flex;gap:16px"><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;color:#2F2F2F">1,847</div><div class="mu-sub">Responses</div></div><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent">45%</div><div class="mu-sub">Engagement Rate</div></div><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;color:#2F2F2F">3</div><div class="mu-sub">Channels</div></div></div></div>' +
      '<div class="mu-card" style="background:linear-gradient(135deg,#2F2F2F,#1A1713);border:1px solid rgba(255,255,255,0.08)">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><div style="width:28px;height:28px;border-radius:6px;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><div><div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.06em">SMS</div><div style="font-size:13px;font-weight:600;color:#EDE8DF">Your Association</div></div></div>' +
        '<div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:12px;font-size:13px;color:#EDE8DF;line-height:1.5">Hi Marcus! Quick question: Are you planning to attend the Annual Conference in April? Reply <strong style="color:#FBC02D">YES</strong>, <strong style="color:#FBC02D">NO</strong>, or <strong style="color:#FBC02D">MAYBE</strong>.</div>' +
        '<div style="margin-top:8px;display:flex;gap:6px"><div style="padding:6px 14px;border-radius:6px;font-size:11px;font-weight:700;background:#FBC02D;color:#1A1713">YES</div><div style="padding:6px 14px;border-radius:6px;font-size:11px;font-weight:600;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.5)">NO</div><div style="padding:6px 14px;border-radius:6px;font-size:11px;font-weight:600;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.5)">MAYBE</div></div></div>' +
      '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Channel Breakdown</span></div>' +
        '<div style="margin-top:10px">' +
          '<div class="mu-bar-row"><span class="mu-bar-l">Email</span><div class="mu-bar"><div class="mu-bar-f" style="width:62%"></div></div><span class="mu-bar-v">62%</span></div>' +
          '<div class="mu-bar-row" style="margin-top:8px"><span class="mu-bar-l">Website</span><div class="mu-bar"><div class="mu-bar-f" style="width:28%"></div></div><span class="mu-bar-v">28%</span></div>' +
          '<div class="mu-bar-row" style="margin-top:8px"><span class="mu-bar-l">SMS</span><div class="mu-bar"><div class="mu-bar-f" style="width:10%"></div></div><span class="mu-bar-v">10%</span></div>' +
        '</div></div>';

    // Map mockups to visuals by index (order on page: insights=0, automation=1, engagement=2)
    var mockups = [insightsMockup, automationMockup, engagementMockup];
    visuals.forEach(function(v, i) {
      if (mockups[i] && !v.querySelector('.mu-card')) {
        v.innerHTML = mockups[i];
        v.style.background = '#EBE6DA';
        v.style.borderRadius = '20px';
        v.style.padding = '28px';
      }
    });

    // ═══════════════════════════════════════
    // SECTION 3: ENGINE LABELS, TEXT, BULLETS, CTAs
    // Fix all engine content to match Vercel source exactly
    // ═══════════════════════════════════════
    var engineData = [
      {
        num: 'Engine 01',
        title: 'The Insights Engine',
        tagline: 'More Signal, Less Noise',
        desc: 'The Insights Engine interprets member behavior and surfaces who wants what, who is at risk, and who is ready for more\u00a0\u2014\u00a0so you stop guessing and start acting.',
        bullets: [
          'Super Contact Profiles: unified view of every member',
          'AI-powered response analysis and sentiment detection',
          'Engagement scoring and trend tracking',
          'At-risk member identification before they lapse'
        ],
        cta: { text: 'Explore the Insights Engine', href: '/platform/insights' }
      },
      {
        num: 'Engine 02',
        title: 'The Automation Engine',
        tagline: 'More Personalization, Less Busy Work',
        desc: 'The Automation Engine builds campaigns from scratch\u00a0\u2014\u00a0segments, messaging, workflows\u00a0\u2014\u00a0using 70+ blueprints. You just approve and launch.',
        bullets: [
          'Campaign builder with conditional branching based on responses',
          '70+ Blueprint library of proven campaign templates',
          'Real-time alerts when members respond with urgency',
          'AMS write-back: responses flow directly into your system of record'
        ],
        cta: { text: 'Explore the Automation Engine', href: '/platform/automation' }
      },
      {
        num: 'Engine 03',
        title: 'The Engagement Engine',
        tagline: 'More Engagement, Less Silence',
        desc: 'The Engagement Engine turns one-way communications into two-way exchanges. Single-click responses across email, website, and SMS. Near-zero friction for members.',
        bullets: [
          'Three channels unified: Email, Website, and SMS',
          'One question at a time\u00a0\u2014\u00a0not surveys, not newsletters',
          'Members respond with one tap or click',
          'White-labeled to your association\u2019s brand'
        ],
        cta: { text: 'Explore the Engagement Engine', href: '/platform/website' }
      }
    ];

    // Find each engine's feature title and fix its section
    var featureTitles = document.querySelectorAll('.pf-feature-title');
    featureTitles.forEach(function(titleEl) {
      var txt = titleEl.textContent.trim();
      var eng = null;
      engineData.forEach(function(e) {
        if (txt.toLowerCase().indexOf(e.title.toLowerCase().replace('the ', '')) !== -1) eng = e;
      });
      if (!eng) return;

      var section = titleEl.closest('[class*="feature"]') || titleEl.parentElement;

      // Add engine number label above title
      if (!section.querySelector('.eng-num-label')) {
        var numLabel = document.createElement('p');
        numLabel.className = 'eng-num-label';
        numLabel.style.cssText = 'font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:8px';
        numLabel.textContent = eng.num;
        titleEl.parentNode.insertBefore(numLabel, titleEl);
      }

      // Add tagline below title
      if (!section.querySelector('.eng-tagline')) {
        var tagline = document.createElement('p');
        tagline.className = 'eng-tagline';
        tagline.style.cssText = 'font-size:18px;font-weight:600;color:#F47C2C;margin-top:4px;margin-bottom:16px';
        tagline.textContent = eng.tagline;
        titleEl.parentNode.insertBefore(tagline, titleEl.nextSibling);
      }

      // Fix description
      var descEl = section.querySelector('.pf-feature-desc');
      if (descEl) descEl.textContent = eng.desc;

      // Fix bullet items
      var bullets = section.querySelectorAll('.pf-feature-list-item');
      bullets.forEach(function(b, i) {
        if (eng.bullets[i]) b.textContent = '\u2022 ' + eng.bullets[i];
      });

      // Fix CTA link: "Learn More" → "Explore the X Engine →"
      var ctaLink = section.querySelector('.pf-btn-primary');
      if (ctaLink && ctaLink.textContent.trim() === 'Learn More') {
        ctaLink.textContent = '';
        ctaLink.href = eng.cta.href;
        ctaLink.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:#1A1714;border-radius:100px;' +
          'padding:12px 24px;font-size:14px;font-weight:600;letter-spacing:0.02em;color:#F4F1EA;text-decoration:none;' +
          'border:none;box-shadow:0 4px 16px rgba(0,0,0,0.1);transition:box-shadow .3s ease';
        ctaLink.innerHTML = eng.cta.text + ' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      }
    });

    // ═══════════════════════════════════════
    // SECTION 4: MEMBERSHIP AI — fix CTA link style
    // ═══════════════════════════════════════
    var aiTitle = null;
    featureTitles.forEach(function(t) { if (t.textContent.trim() === 'Membership AI') aiTitle = t; });
    if (aiTitle) {
      var aiSection = aiTitle.closest('[class*="feature"]') || aiTitle.parentElement;
      var aiCta = aiSection ? aiSection.querySelector('.pf-btn-primary') : null;
      if (aiCta && aiCta.textContent.trim() === 'Learn More') {
        aiCta.href = '/membership-ai';
        aiCta.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:#1A1714;border-radius:100px;' +
          'padding:12px 24px;font-size:14px;font-weight:600;letter-spacing:0.02em;color:#F4F1EA;text-decoration:none;' +
          'border:none;box-shadow:0 4px 16px rgba(0,0,0,0.1);transition:box-shadow .3s ease';
        aiCta.innerHTML = 'Explore Membership AI <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      }
    }

    // ═══════════════════════════════════════
    // SECTION 8: CTA — fix heading + gradient text
    // ═══════════════════════════════════════
    var ctaHeading = document.querySelector('.pf-cta-heading');
    if (ctaHeading) {
      ctaHeading.innerHTML = 'Ready to Make Membership<br><span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Meaningful?</span>';
    }
    var ctaSub = document.querySelector('.pf-cta-sub');
    if (ctaSub) {
      ctaSub.textContent = 'See how PropFuel helps associations understand what members want and act on it\u00a0\u2014\u00a0all in one platform.';
    }

    // ═══════════════════════════════════════
    // SECTION 7: STATS — gradient text on numbers
    // ═══════════════════════════════════════
    document.querySelectorAll('.pf-stat-number').forEach(function(el) {
      if (el.closest('[class*="platform"]') || window.location.pathname.indexOf('platform') !== -1) {
        el.style.cssText = 'font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;' +
          'background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text';
      }
    });

  }

  // ─────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────
  function init() {
    injectDynamicCSS();
    applyTextures();
    fixNav();
    fixHomepage();
    fixPlatformOverview();
    initScrollAnimations();
    initFaqAccordion();
    initNavScroll();
    initDemoForm();
    applyMembershipAIPalette();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
