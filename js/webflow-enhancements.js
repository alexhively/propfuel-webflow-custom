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

      /* Platform tabs */
      '.pf-tab{padding:12px 28px;border-radius:100px;font-size:15px;font-weight:600;font-family:DM Sans,sans-serif;' +
        'border:1.5px solid #E3DDD2;background:transparent;color:#2F2F2F;cursor:pointer;' +
        'transition:background .3s ease,border-color .3s ease,color .3s ease;position:relative;overflow:hidden}' +
      '.pf-tab:hover{border-color:#F47C2C;color:#F47C2C}' +
      '.pf-tab.active{border-color:#2F2F2F;color:#2F2F2F;background:transparent}' +
      '.pf-tab.active::after{content:"";position:absolute;inset:0;background:linear-gradient(to right,#F47C2C,#FBC02D);' +
        'border-radius:100px;animation:pfTabFill 8s linear forwards;z-index:-1}' +
      '@keyframes pfTabFill{from{transform:scaleX(0);transform-origin:left}to{transform:scaleX(1);transform-origin:left}}' +

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
      img.src = 'https://propfuel-hero-v2-deploy.vercel.app/logo.png';
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
        cols: [
          { heading: 'Solutions', links: [
            { title: 'The Insights Engine', desc: 'Turn fragmented data into clear member signals', href: '/platform/insights' },
            { title: 'The Automation Engine', desc: 'Build smart workflows that run themselves', href: '/platform/automation' },
            { title: 'The Engagement Engine', desc: 'One question, every channel, real answers', href: '/platform/website' },
            { title: 'Membership AI', desc: 'AI agents that know your members by name', href: '/membership-ai' }
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

    // Remove duplicate logos-bar children (keep only the one with pf-logos-label class)
    document.querySelectorAll('.pf-logos-bar').forEach(function(bar) {
      var children = bar.children;
      var kept = false;
      for (var i = children.length - 1; i >= 0; i--) {
        if (children[i].classList.contains('pf-logos-label')) {
          kept = true;
        } else if (children[i].tagName === 'P' && !children[i].className) {
          children[i].remove();
        }
      }
    });

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
        html += '<button class="pf-tab' + (i === 0 ? ' active' : '') + '" data-tab="' + i + '">' + t.label + '</button>';
      });
      html += '</div><div class="pf-tab-panels">';
      tabs.forEach(function(t, i) {
        html += '<div class="pf-tab-panel" data-panel="' + i + '" style="display:' + (i === 0 ? 'grid' : 'none') + ';grid-template-columns:1fr 1fr;gap:64px;align-items:start">';
        html += '<div>';
        html += '<h3 style="font-size:36px;font-weight:700;color:#2F2F2F;line-height:1.15;letter-spacing:-0.02em;margin-bottom:20px">' + t.title + '</h3>';
        html += '<p style="font-size:17px;color:#6E6E6E;line-height:1.65;margin-bottom:32px">' + t.desc + '</p>';
        html += '<ul style="list-style:none;padding:0;margin:0 0 36px">';
        t.features.forEach(function(f) {
          html += '<li style="font-size:15px;font-weight:500;color:#2F2F2F;display:flex;align-items:flex-start;gap:10px;line-height:1.4;margin-bottom:12px"><span style="width:6px;height:6px;min-width:6px;border-radius:50%;background:#F9A825;margin-top:7px"></span>' + f + '</li>';
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
        currentTab = idx;
        tabBtns.forEach(function(b, i) { b.classList.toggle('active', i === idx); });
        panels.forEach(function(p, i) { p.style.display = i === idx ? 'grid' : 'none'; });
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

    // Fix use case cards — inject missing content
    var ucCards = document.querySelectorAll('.pf-usecase-card');
    var ucData = [
      { type: 'Win-Back', num: '80%', label: 'of lapsed members re-engaged within 90 days', org: 'AAP' },
      { type: 'Renewals', num: '$320K', label: 'recovered revenue from at-risk members', org: 'ASAE' },
      { type: 'Data Intelligence', num: '42K', label: 'member insights captured in one quarter', org: 'ISTE', dark: true },
      { type: 'Onboarding', num: '3x', label: 'new member engagement in the first 60 days', org: 'NACUBO' },
      { type: 'Events', num: '45%', label: 'attendee engagement rate at annual conference', org: 'NAPNAP' },
      { type: 'Acquisition', num: '2.4x', label: 'conversion rate on non-member prospects', org: 'INCOSE', dark: true }
    ];
    ucCards.forEach(function(card, i) {
      var data = ucData[i];
      if (!data) return;

      // Find or create the bottom outcome div
      var outcome = card.querySelectorAll('div')[1]; // second child div
      if (!outcome) {
        outcome = document.createElement('div');
        card.appendChild(outcome);
      }

      // Inject content if stat number is empty
      var numEl = card.querySelector('.pf-usecase-num');
      if (!numEl || !numEl.textContent.trim()) {
        outcome.innerHTML = '<div class="pf-usecase-num">' + data.num + '</div>' +
          '<p class="pf-usecase-label">' + data.label + '</p>' +
          '<p class="pf-usecase-org">' + data.org + '</p>';
      }

      // Dark cards
      if (data.dark) {
        card.style.backgroundColor = '#1A1713';
        card.style.borderColor = 'rgba(255,255,255,0.08)';
        card.querySelector('.pf-usecase-type').style.color = '#F9A825';
        var labelEl = card.querySelector('.pf-usecase-label');
        if (labelEl) labelEl.style.color = '#8C8479';
        var orgEl = card.querySelector('.pf-usecase-org');
        if (orgEl) orgEl.style.color = 'rgba(255,255,255,0.3)';
      }
    });
  }

  // ─────────────────────────────────────────
  // 6. DEMO FORM INJECTION
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
    fixNav();
    fixHomepage();
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
