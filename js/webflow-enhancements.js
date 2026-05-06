/* ============================================
   PropFuel Webflow Enhancements
   External script loaded via <script> tag
   Handles: textures, animations, FAQ, nav scroll
   ============================================ */

(function () {
  'use strict';

  // Prevent double-execution if script is loaded more than once
  if (window.__pfEnhancementsLoaded) return;
  window.__pfEnhancementsLoaded = true;

  // Legacy URL redirect: /demo is the old slug, page has been renamed to /book-a-demo.
  // This script loads in <head> so the redirect fires before the 404 page paints.
  // Preserves query string + hash (e.g. UTM params, anchors).
  (function redirectLegacyPaths() {
    var p = window.location.pathname.replace(/\/$/, '') || '/';
    if (p === '/demo' || p === '/request-demo') {
      window.location.replace('/book-a-demo' + window.location.search + window.location.hash);
    }
  })();

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
      '.pf-stats-section,.pf-cta-section,.pf-footer,.pf-section-dark,.pf-value-section,' +
      '[class*="-problem-band"],[class*="-stats-band"],[class*="po-stats"]{' +
        'background-image:var(--dark-texture)!important;background-size:512px 512px!important}' +

      /* FAQ / warm / cream section textures — only for sections with explicit cream/warm backgrounds */
      '.pf-faq-section,.pf-transition-section-dark,.po-philosophy,.po-integrations,' +
      '.po-channels{' +
        'background-image:var(--faq-texture)!important;background-size:512px 512px!important}' +

      /* Primary button text always white (not hover) */
      '.pf-btn-primary{color:#fff!important;transition:color .35s ease,border-color .35s ease,box-shadow .35s ease!important}' +
      '.pf-btn-primary:hover{color:#1A1714!important;transition:color .35s ease,border-color .35s ease,box-shadow .35s ease!important}' +

      /* Secondary button gentler transitions */
      '.pf-btn-secondary{transition:border-color .25s ease,box-shadow .25s ease,color .25s ease!important}' +

      /* Nav link display fix — force container + items to stay visible above 768px, overriding Webflow native nav hide at 991px */
      '.pf-nav-links{display:flex!important;align-items:center!important}' +
      '.pf-nav-right{display:flex!important;align-items:center!important}' +
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

      /* Prevent horizontal page scroll from any decorative overflow (carousel marquees, video bg, etc.) */
      'html,body{overflow-x:hidden!important;max-width:100vw}' +
      /* Ensure logo carousel respects viewport width (overrides Webflow class default of 960px) */
      '.pf-logos-bar{width:100%!important;max-width:100%!important;box-sizing:border-box}' +
      /* Mobile-menu CTAs are hidden by default; only shown when .pf-nav-links.mobile-open */
      '.pf-mobile-ctas{display:none!important}' +
      /* Mobile nav panel (PF_MOBILE_PANEL_V1) — default hidden; shown only inside @media(max-width:1024px) */
      '.pf-mobile-panel{display:none!important}' +
      /* Webinar CMS cards: the colleague\'s template has nested grids (outer 508px×2, inner 240px×2)
         with only one w-dyn-list in the outer grid — so the right outer column sits empty.
         Flatten: outer grid single-column (list fills full width). Inner uses flex-wrap so an
         odd-count last row (17 cards = 1 orphan) centers itself instead of hugging the left. */
      '.webinar-card-grid:not(.w-dyn-items){grid-template-columns:1fr!important}' +
      '.webinar-card-grid.w-dyn-items{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:28px!important;grid-template-columns:none!important}' +
      '.webinar-card-grid.w-dyn-items > .w-dyn-item{flex:0 1 calc(50% - 14px);max-width:calc(50% - 14px)}' +
      '.webinar-card{width:100%!important;max-width:100%!important}' +
      /* Source thumbnails are ~3:1 (e.g. 1200×400); use contain + auto height so full image shows,
         no cropped text/faces, and a subtle background absorbs any letterbox gap from off-ratio images */
      '.webinar-card-thumb{width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:auto!important;background:#1A1713}' +
      '.webinar-card-thumb-img{width:100%!important;height:auto!important;object-fit:contain!important;display:block}' +

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

      /* CTA heading + sub: constrained, H1-aligned display treatment */
      '.pf-cta-heading{display:block!important;font-size:clamp(32px,3.6vw,52px)!important;line-height:1.1!important;letter-spacing:-0.02em!important;font-weight:800!important;max-width:680px!important;margin-left:auto!important;margin-right:auto!important;text-wrap:balance!important}' +
      '.pf-cta-heading br{display:block;content:"";margin:0}' +
      '.pf-cta-sub{max-width:620px!important;margin-left:auto!important;margin-right:auto!important;font-size:17px!important;line-height:1.6!important;text-wrap:pretty!important}' +
      // CTA sections are dark — force readable colors on heading + sub (Webflow dark templates often set charcoal text)
      '.pf-cta-section .pf-cta-heading,.pf-cta-section h1,.pf-cta-section h2{color:#EDE8DF!important}' +
      '.pf-cta-section .pf-cta-sub,.pf-cta-section p:not([class*="btn"]):not([class*="label"]){color:#8C8479!important}' +
      '.pf-cta-section{padding:80px 48px!important}' +

      /* Hero titles + subs: balanced wrapping so short headings never break as "5 words / 1 word" orphans; constrained width so they do not stretch edge-to-edge. */
      '.pf-page-hero-title,.pf-hero-title{max-width:900px!important;margin-left:auto!important;margin-right:auto!important;text-wrap:balance!important}' +
      '.pf-page-hero-sub,.pf-hero-sub{max-width:640px!important;margin-left:auto!important;margin-right:auto!important;text-wrap:pretty!important}' +

      /* Injected centerpiece H2s and problem/stats H2s: balance wrapping */
      '.pf-section h2,.cs-wrap h2,.tm-famewall h2,.tm-featured-quote p,.cs-aggregate h2{text-wrap:balance}' +

      /* Gradient-text glyph clip guard: any element using -webkit-background-clip:text + linear-gradient gets enough line-box height so heavy 900-weight glyphs do not get their tops/bottoms clipped. Applies site-wide so every case-study stat card is safe. */
      '[style*="-webkit-background-clip:text"][style*="linear-gradient"]{line-height:1.2!important;padding-top:4px!important;padding-bottom:4px!important}' +

      /* Mobile: single column (use-cases grid) */
      '@media(max-width:900px){.uc-grid{grid-template-columns:1fr}.uc-featured,.uc-wide{grid-column:span 1}}' +

      /* ── NAV MOBILE BREAKPOINT (≤1024px) ── */
      /* Nav needs more horizontal room than the rest of the layout: switch to hamburger + bottom-sheet dropdowns earlier so items do not squish/overlap in the 768–1024 window. */
      '@media(max-width:1024px){' +
        /* Dropdown: full width bottom sheet */
        '.pf-dropdown-menu{min-width:calc(100vw - 32px)!important;width:calc(100vw - 32px)!important;max-width:calc(100vw - 32px)!important;left:16px!important;right:16px!important;transform:none!important;border-radius:0 0 20px 20px!important;padding:24px!important;animation:none!important}' +
        '.pf-dropdown-menu.open{animation:none!important;transform:none!important}' +
        '.pf-dropdown-menu .pf-dd-cols{grid-template-columns:1fr!important;gap:24px!important}' +
        /* Nav: hide links + right-side CTAs (Log In, Get Started), show hamburger */
        '.pf-nav-links{display:none!important}' +
        '.pf-nav-right{display:none!important}' +
        '.pf-hamburger{display:flex!important}' +
        '.pf-nav-links.mobile-open{display:flex!important;flex-direction:column;position:fixed;top:84px;left:16px;right:16px;background:rgba(246,242,232,0.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);padding:24px;border-radius:20px;border:1px solid #E3DDD2;box-shadow:0 12px 48px rgba(120,110,95,0.15);z-index:199;gap:8px}' +
        '.pf-nav-links.mobile-open .pf-nav-link,.pf-nav-links.mobile-open .pf-dropdown{font-size:16px;padding:12px 0}' +
        /* Mobile menu bottom CTAs — layout when menu is open */
        '.pf-nav-links.mobile-open .pf-mobile-ctas{display:flex!important;flex-direction:column;gap:10px;margin-top:16px;padding-top:20px;border-top:1px solid rgba(227,221,210,0.8)}' +
        '.pf-mobile-login{display:block;text-align:center;padding:12px 20px;font:600 15px/1 "DM Sans",sans-serif;color:#2F2F2F;text-decoration:none;border:1.5px solid rgba(0,0,0,0.12);border-radius:100px}' +
        '.pf-mobile-started{display:block;text-align:center;padding:14px 24px;font:700 15px/1 "DM Sans",sans-serif;color:#fff!important;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D)!important;border-radius:100px;box-shadow:0 4px 14px rgba(240,90,40,0.25)}' +
        /* ── Mobile nav panel (PF_MOBILE_PANEL_V1) ── full-screen slide-in; desktop pill+dropdown code path unchanged */
        '.pf-mobile-panel{display:flex!important;position:fixed;inset:0;z-index:1000;background:#F6F2E8;flex-direction:column;transform:translateX(100%);transition:transform .2s ease-out;overflow-y:auto;-webkit-overflow-scrolling:touch;pointer-events:none}' +
        '.pf-mobile-panel.open{transform:translateX(0);pointer-events:auto}' +
        '.pf-mp-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(0,0,0,0.06);flex-shrink:0;min-height:68px;background:#F6F2E8}' +
        '.pf-mp-logo{display:flex;align-items:center;text-decoration:none}' +
        '.pf-mp-logo img{height:36px;width:auto;display:block}' +
        '.pf-mp-close{width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#2F2F2F;border-radius:50%;padding:0;-webkit-tap-highlight-color:transparent}' +
        '.pf-mp-close:active{background:rgba(0,0,0,0.06)}' +
        '.pf-mp-body{flex:1 1 auto;padding:4px 12px 12px;display:flex;flex-direction:column}' +
        '.pf-mp-acc{border-bottom:1px solid rgba(0,0,0,0.06)}' +
        '.pf-mp-acc-btn{width:100%;min-height:56px;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;padding:14px 12px;font:600 17px/1.2 "DM Sans",sans-serif;color:#2F2F2F;text-align:left;-webkit-tap-highlight-color:transparent}' +
        '.pf-mp-acc-btn:active{background:rgba(0,0,0,0.04)}' +
        '.pf-mp-acc-ico{transition:transform .2s ease-out;color:#8C8479;flex-shrink:0;margin-left:12px}' +
        '.pf-mp-acc.open .pf-mp-acc-btn{color:#F47C2C}' +
        '.pf-mp-acc.open .pf-mp-acc-ico{transform:rotate(180deg);color:#F47C2C}' +
        '.pf-mp-acc-body{max-height:0;overflow:hidden;transition:max-height .22s ease-out;padding:0 4px}' +
        '.pf-mp-acc.open .pf-mp-acc-body{max-height:1400px;padding:4px 4px 12px}' +
        '.pf-mp-subhead{font:700 11px/1 "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#F9A825;padding:16px 12px 6px}' +
        '.pf-mp-sublink{display:block;min-height:48px;padding:10px 12px;text-decoration:none;color:#2F2F2F;border-radius:10px;-webkit-tap-highlight-color:transparent}' +
        '.pf-mp-sublink:active{background:rgba(0,0,0,0.05)}' +
        '.pf-mp-sub-title{display:block;font:600 16px/1.3 "DM Sans",sans-serif;color:#2F2F2F}' +
        '.pf-mp-sub-desc{display:block;margin-top:2px;font:400 13px/1.4 "DM Sans",sans-serif;color:#6E6E6E}' +
        '.pf-mp-sublink-ai .pf-mp-sub-title{color:#4A7FA5}' +
        '.pf-mp-footer{padding:16px 20px 24px;border-top:1px solid rgba(0,0,0,0.08);display:flex;flex-direction:column;gap:10px;background:#F6F2E8;flex-shrink:0;position:sticky;bottom:0}' +
        '.pf-mp-cta-ghost{display:flex;align-items:center;justify-content:center;min-height:48px;padding:12px 20px;border:1.5px solid rgba(0,0,0,0.14);border-radius:100px;font:600 15px/1 "DM Sans",sans-serif;color:#2F2F2F!important;text-decoration:none;box-sizing:border-box}' +
        '.pf-mp-cta-primary{display:flex;align-items:center;justify-content:center;min-height:52px;padding:14px 24px;background:linear-gradient(to right,#F47C2C,#FBC02D);border-radius:100px;font:700 16px/1 "DM Sans",sans-serif;color:#fff!important;text-decoration:none;box-shadow:0 4px 14px rgba(240,90,40,0.25);box-sizing:border-box}' +
      '}' +

      /* ── TABLET BREAKPOINT (≤768px) ── */
      '@media(max-width:768px){' +
        /* Grid collapse: multi-col → fewer cols */
        '[style*="grid-template-columns:repeat(4"]{grid-template-columns:repeat(2,1fr)!important}' +
        '[style*="grid-template-columns:repeat(5"]{grid-template-columns:repeat(2,1fr)!important}' +
        '[style*="grid-template-columns:repeat(3"]{grid-template-columns:repeat(2,1fr)!important}' +
        '[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr!important}' +
        '[style*="grid-template-columns:2fr 1fr"]{grid-template-columns:1fr!important}' +
        '[style*="grid-template-columns:1fr 2fr"]{grid-template-columns:1fr!important}' +
        '[style*="grid-template-columns:1.2fr 1fr"]{grid-template-columns:1fr!important}' +
        /* Fixed-first-column 2-col grids (300px 1fr, 360px 1fr, 400px 1fr) that don't fit at 390. */
        '[style*="grid-template-columns:300px 1fr"]{grid-template-columns:1fr!important}' +
        '[style*="grid-template-columns:360px 1fr"]{grid-template-columns:1fr!important}' +
        '[style*="grid-template-columns:400px 1fr"]{grid-template-columns:1fr!important}' +
        /* Span overrides */
        '[style*="grid-column:span 2"]{grid-column:span 1!important}' +
        /* Section padding reduction */
        '[style*="padding:96px 48px"]{padding:64px 24px!important}' +
        '[style*="padding:120px 48px"]{padding:64px 24px!important}' +
        /* Gap reduction */
        '[style*="gap:64px"]{gap:32px!important}' +
        '[style*="gap:48px"]{gap:24px!important}' +
        /* Hero buttons stack */
        '.pf-hero-btns-injected{flex-direction:column!important;align-items:center!important;gap:12px!important}' +
        /* Tab pills: horizontal scroll */
        '.pf-tabs-row{overflow-x:auto!important;-webkit-overflow-scrolling:touch;flex-wrap:nowrap!important;padding-bottom:8px}' +
        '.pf-tab{white-space:nowrap;flex-shrink:0}' +
        /* Logo carousel gap */
        '.lc-track{gap:32px!important}' +
        /* Reset full-bleed dark sections so they don't overflow viewport */
        '.pf-fullbleed-dark{margin:0!important;width:100%!important;padding:64px 24px!important}' +
        /* Mockup containers */
        '.mu-card{font-size:12px}' +
        '[class*="-hero-mockup"]{max-width:100%!important;overflow:hidden}' +
        /* Platform tab panels: stack */
        '.pf-tab-panel{grid-template-columns:1fr!important}' +
        /* Platform section: desktop's 120px|48px padding (set by Webflow stylesheet, not inline) cramps bullets
           against the viewport edge; at ≤768px drop horizontal to 20px so tab-panel content fits. Mobile only. */
        '.pf-platform-section{padding:56px 20px!important}' +
        /* Testimonial carousel dots: 10×10 desktop dots are below the 44px tap-target minimum on mobile.
           Expand the hit area to 44×44 with transparent padding + background-clip:content-box so the visible
           dot stays 10×10, just centered inside a tappable ring. */
        '.pf-testimonials-section [data-slide]{width:44px!important;height:44px!important;padding:17px!important;box-sizing:border-box!important;background-clip:content-box!important;-webkit-background-clip:content-box!important}' +
        /* /book-a-demo hero: desktop padding-top of 48px puts the "Request a Demo" label behind the
           floating nav pill (which extends to ~84px on mobile). Push the section down on mobile only. */
        '.pf-demo-hero{padding-top:96px!important}' +
        /* Mockup-card status pills (.mu-pill): multi-word labels like "Ready to Launch" wrap to 2 lines
           inside the .mu-hdr flex row on narrow viewports. Force pills to single-line + allow the header
           to wrap so the pill drops below its label instead of breaking mid-word. Mobile only. */
        '.mu-pill{white-space:nowrap!important;flex-shrink:0!important}' +
        '.mu-hdr{flex-wrap:wrap!important;gap:8px!important}' +
        /* /platform/email "Send vs Listen" comparison table: desktop builds it as a 200px|1fr|1fr grid.
           On narrow viewports each 1fr column collapses to ~45px and the rightmost PropFuel column is
           cut off past the viewport. Stack to single column on mobile, hide the dark header bar, and
           insert "Traditional" / "PropFuel" labels via ::before on each row so the grouping stays clear. */
        '.em-comparison [style*="background:#2F2F2F"]{display:none!important}' +
        '.em-comparison [style*="grid-template-columns:200px 1fr 1fr"]{grid-template-columns:1fr!important;padding:16px 20px!important;gap:6px!important}' +
        '.em-comparison [style*="grid-template-columns:200px 1fr 1fr"]>div{text-align:left!important}' +
        '.em-comparison [style*="grid-template-columns:200px 1fr 1fr"]>div:first-child{font-size:15px!important;margin-bottom:4px!important}' +
        '.em-comparison [style*="grid-template-columns:200px 1fr 1fr"]>div:nth-child(2)::before{content:"Traditional";display:block;font:700 11px/1 "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8C8479;margin-bottom:4px}' +
        '.em-comparison [style*="grid-template-columns:200px 1fr 1fr"]>div:nth-child(3)::before{content:"PropFuel";display:block;font:700 11px/1 "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#F9A825;margin-bottom:4px}' +
        /* /platform/sms event-day timeline: the inner row has inline min-width:900px to render the
           horizontal gradient+markers layout, which forces horizontal scroll on narrow viewports.
           Stack vertically on mobile, hide the gradient bar + circle markers (decorative, only make
           sense when the steps are arranged horizontally along a line). */
        '.sms-timeline [style*="min-width:900px"]{min-width:0!important;flex-direction:column!important;gap:24px!important}' +
        '.sms-timeline [style*="min-width:900px"]>[style*="position:absolute"]{display:none!important}' +
        '.sms-timeline [style*="min-width:900px"]>div:not([style*="position:absolute"])>[style*="border:3px solid"]{display:none!important}' +
        '.sms-timeline [style*="min-width:900px"]>div:not([style*="position:absolute"]){padding:0!important;text-align:left!important}' +
        /* /platform/automation Renewal Campaign builder mockup: the inner 2-col row (200px Blueprints
           sidebar + flex:1 workflow) doesn\'t stack on mobile, pushing the workflow column off-viewport
           right. Stack it vertically and drop the 48px inline indent on the Positive/Neutral/Negative
           branch row so the 3 outcome cards fit in the content width. Header flex-wraps so Preview +
           Launch controls drop below the campaign title on narrow screens. */
        '.ae-campaign-builder [style*="min-height:260px"]{flex-direction:column!important}' +
        '.ae-campaign-builder [style*="width:200px"]{width:100%!important;border-right:none!important}' +
        '.ae-campaign-builder [style*="justify-content:space-between"]{flex-wrap:wrap!important;gap:8px!important}' +
        '.ae-campaign-builder [style*="padding-left:48px"]{padding-left:0!important;gap:6px!important}' +
        /* /platform/engagement .ee-channel-cards "Jane Doe — Unified Member Timeline" row: a flex row
           with avatar + flex:1 middle + fixed-width colored bars. The bars monopolized horizontal space
           and crushed the middle to 16px — so the title stacked ONE WORD PER LINE. Stack to column on
           mobile so each region gets full content width. */
        '.ee-channel-cards [style*="display:flex;align-items:center;gap:16px"]{flex-direction:column!important;align-items:flex-start!important;gap:8px!important}' +
        /* /resources/blog CMS grid: Webflow-native 3-col fixed-width grid (194px|208px|198px) overflows
           the 390px viewport. Collapse to single column so cards stack full-width on mobile. */
        '.blog-collection-wrapper .w-dyn-items{grid-template-columns:1fr!important;display:grid!important;gap:24px!important}' +
        '.blog-card,.blog-card-thumb,.blog-card-thumb-img{width:100%!important;max-width:100%!important}' +
        /* /blog-posts/* and /case-studies/* detail pages: .blog-article-grid is a 2-col (body +
           360px sidebar) grid; sidebar overflows the viewport right. Collapse to 1 col and force
           sidebar to 100% width on mobile. Also reduce the inline 48px horizontal padding on the
           grid so the article body isn't squeezed to ~215px on a 390 viewport. */
        '.blog-article-grid{grid-template-columns:1fr!important;gap:32px!important;padding-left:16px!important;padding-right:16px!important}' +
        '.blog-article-wrap{padding-left:0!important;padding-right:0!important}' +
        '.blog-sidebar,.blog-sidebar-card,.blog-sidebar-dark-card{width:100%!important;max-width:100%!important}' +
        /* /case-studies/* "More Client Stories" cards grid was rendering as three fixed-px columns
           (82px each), squishing each card so card titles wrap word-by-word and industry eyebrows
           truncate. Stack to single column. */
        '.cs-more-grid{grid-template-columns:1fr!important;gap:16px!important}' +
        '.cs-more-section{padding-left:16px!important;padding-right:16px!important}' +
        '.cs-card{width:100%!important;max-width:100%!important}' +
        /* /case-studies/* detail template: .cs-stats-row is a 3-col fixed-px grid (~160+129+121) that
           overflows the 390px viewport. Collapse to single column on mobile. */
        '.cs-stats-row{grid-template-columns:1fr!important;gap:16px!important}' +
        /* /videos/* embedly/YouTube player was rendering at its natural 440px on narrow viewports.
           The container .webinar-hero-grid is a 2-col (thumbnail + 440px video) grid; collapse to
           single column so the video wrapper gets full viewport width. */
        '.webinar-hero-grid{grid-template-columns:1fr!important}' +
        '.w-video,.embedly-embed{max-width:100%!important;width:100%!important}' +
        /* /membership-ai dashboard mockup: a 3-agent flex row (Insights/Recommendations/Initiative
           Builder) doesn\'t wrap, overflowing right by ~300px. Stack to column on mobile. */
        '.mai-dashboard [style*="display:flex;gap:16px;flex:1"]{flex-direction:column!important}' +
      '}' +

      /* ── MOBILE BREAKPOINT (≤480px) ── */
      '@media(max-width:480px){' +
        /* All multi-col grids → 1 col */
        '[style*="grid-template-columns:repeat("]{grid-template-columns:1fr!important}' +
        '[style*="grid-column:span 2"]{grid-column:span 1!important}' +
        '[style*="grid-column: span 2"]{grid-column:span 1!important}' +
        /* Tighter section padding */
        '[style*="padding:64px 24px"]{padding:48px 16px!important}' +
        '[style*="padding:96px 48px"]{padding:48px 16px!important}' +
        '[style*="padding:120px 48px"]{padding:48px 16px!important}' +
        /* Tighter gaps */
        '[style*="gap:32px"]{gap:16px!important}' +
        '[style*="gap:24px"]{gap:16px!important}' +
        /* Smaller card padding */
        '.pf-card{padding:24px 20px!important}' +
        /* Font size caps for large stats */
        '[style*="font-size:clamp(40px"]{font-size:clamp(32px,8vw,40px)!important}' +
        '[style*="font-size:72px"]{font-size:40px!important}' +
        '[style*="font-size:64px"]{font-size:36px!important}' +
        /* Hero title */
        '.pf-page-hero-title,.pf-hero-title{font-size:clamp(28px,7vw,40px)!important}' +
        '.pf-page-hero-sub,.pf-hero-sub{font-size:15px!important}' +
        /* CTA */
        '.pf-cta-heading{font-size:clamp(24px,6vw,32px)!important}' +
        '.pf-cta-buttons{flex-direction:column!important;align-items:center!important;gap:12px!important}' +
        /* Nav */
        '.pf-nav-inner{padding:0 8px 0 16px!important;height:60px!important}' +
        '.pf-nav-logo img{height:32px!important}' +
        '.pf-btn-primary.w-button{padding:14px 24px!important;font-size:14px!important}' +
        /* Dropdown: full width */
        '.pf-dropdown-menu{left:8px!important;right:8px!important;min-width:auto!important}' +
        /* Footer */
        '.pf-footer-top{grid-template-columns:1fr!important;gap:32px!important}' +
        /* Mockups: prevent overflow */
        '[class*="mockup"],[class*="visual"]{max-width:100%!important;overflow:hidden!important}' +
        /* Demo form: reclaim horizontal space so HubSpot iframe isn't cropped.
           Top padding bumped to 96 so the "Request a Demo" eyebrow label clears the floating nav pill. */
        '.pf-demo-hero{padding:96px 12px 48px!important}' +
        '.pf-demo-form-card{padding:24px 20px!important}' +
        '.hs-form-iframe{width:100%!important;min-width:0!important}' +
      '}' +

      '';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────
  // 0B. SEO META INJECTION
  // ─────────────────────────────────────────
  var SEO_DATA = {
    '/': { title: 'AI-Powered Member Engagement Platform | PropFuel', desc: 'PropFuel helps associations understand what members want and act on it. Turn broadcasts into two-way conversations that drive retention and revenue.', ogImage: '/og-images/index.png' },
    '/book-a-demo': { title: 'Request a Demo \u2014 See PropFuel in Action | PropFuel', desc: 'See PropFuel in action. Request a personalized demo and learn how 330+ associations use PropFuel to grow revenue, retain members, and deepen engagement.', ogImage: '/og-images/demo.png' },
    '/platform/overview': { title: 'AI Member Engagement Platform Overview | PropFuel', desc: "PropFuel's platform combines insights, automation, and engagement engines to help associations know and grow their membership through conversations.", ogImage: '/og-images/platform-overview.png' },
    '/platform/automation': { title: 'Marketing Automation Engine for Associations | PropFuel', desc: "PropFuel's Automation Engine builds smart campaigns with conditional branching, blueprint templates, and real-time AMS write-back for associations.", ogImage: '/og-images/platform-automation.png' },
    '/platform/email': { title: 'Email Engagement for Member Organizations | PropFuel', desc: "PropFuel's conversational email tool sends single-question check-ins that members respond to with one click \u2014 driving 40%+ response rates for associations.", ogImage: '/og-images/platform-email.png' },
    '/platform/sms': { title: 'SMS Member Engagement & Text Messaging | PropFuel', desc: "PropFuel's SMS engagement tool delivers timely text-based check-ins with 98% open rates \u2014 perfect for event-day engagement and time-sensitive member outreach.", ogImage: '/og-images/platform-sms.png' },
    '/platform/insights': { title: 'Data Intelligence Engine for Associations | PropFuel', desc: "PropFuel's Insights Engine turns member data into actionable intelligence with AI-powered response analysis, response analysis, and unified profiles.", ogImage: '/og-images/platform-insights.png' },
    '/platform/engagement': { title: 'Member Engagement Engine for Associations | PropFuel', desc: "PropFuel's Engagement Engine delivers one-question conversations via email, website, and SMS \u2014 getting real answers from members with a single tap.", ogImage: '/og-images/platform-engagement.png' },
    '/platform/website': { title: 'Website Personalization for Associations | PropFuel', desc: "PropFuel's website engagement widget asks targeted questions to site visitors, capturing intent and converting anonymous traffic into known member intelligence.", ogImage: '/og-images/platform-website.png' },
    '/integrations': { title: 'AMS & System Integrations for Associations | PropFuel', desc: 'PropFuel integrates with leading AMS platforms including iMIS, Nimble AMS, Fonteva, and Salesforce \u2014 with real-time two-way data sync and write-back.', ogImage: '/og-images/platform-integrations.png' },
    '/membership-ai': { title: 'Membership AI \u2014 Smart Member Intelligence | PropFuel', desc: "PropFuel's Membership AI uses intelligent agents to surface insights, recommend actions, and build engagement initiatives for association staff automatically.", ogImage: 'https://alexhively.github.io/propfuel-webflow-custom/og-images/platform-membership-ai.png' },
    '/use-cases/onboarding': { title: 'Automate New Member Onboarding Journeys | PropFuel', desc: "Turn new member silence into engagement. PropFuel's onboarding automation delivers personalized check-ins that drive 3x engagement in the first 60 days.", ogImage: '/og-images/use-cases-onboarding.png' },
    '/use-cases/renewals': { title: 'Membership Renewal Campaigns & Automation | PropFuel', desc: "Stop sending identical renewal reminders. PropFuel's renewal campaigns adapt to each member's response, recovering $320K+ in at-risk revenue.", ogImage: '/og-images/use-cases-renewals.png' },
    '/use-cases/win-back': { title: 'Win Back Lapsed Members with AI Campaigns | PropFuel', desc: "Re-engage lapsed members with conversations, not campaigns. PropFuel's win-back automation brings 80% back within 90 days.", ogImage: '/og-images/use-cases-win-back.png' },
    '/use-cases/acquisition': { title: 'Member Acquisition & Growth Strategies | PropFuel', desc: "Convert anonymous prospects into engaged members. PropFuel's acquisition tools deliver 2.4x conversion rates through targeted conversational outreach.", ogImage: '/og-images/use-cases-acquisition.png' },
    '/use-cases/events': { title: 'Event & Conference Engagement Automation | PropFuel', desc: 'Drive event registration, attendance, and follow-up with PropFuel. Capture real-time feedback and connect event data to member profiles automatically.', ogImage: '/og-images/use-cases-events.png' },
    '/use-cases/certifications': { title: 'Certification & Continuing Education | PropFuel', desc: 'Keep members on track to certification completion. PropFuel automates check-ins, surfaces obstacles, and prevents credential lapse with personalized outreach.', ogImage: '/og-images/use-cases-certifications.png' },
    '/use-cases/data-intelligence': { title: 'Member Data Intelligence & Insights | PropFuel', desc: 'Unify fragmented member data into actionable intelligence. PropFuel captures 42K+ insights per quarter by asking the right questions at the right time.', ogImage: '/og-images/use-cases-data-intelligence.png' },
    '/roi': { title: 'Proven ROI Results for Member Organizations | PropFuel', desc: "See PropFuel's proven ROI: $100M+ in client revenue growth, 8.68% average first-year growth, and 72% of declining organizations reversed course.", ogImage: '/og-images/client-success-roi-results.png' },
    '/client-success/case-studies': { title: 'Customer Case Studies & Success Stories | PropFuel', desc: 'Real results from real associations. Explore PropFuel case studies showing how organizations drive revenue, retain members, and deepen engagement.', ogImage: '/og-images/client-success-case-studies.png' },
    '/client-success/testimonials': { title: 'What Associations Say About PropFuel | Testimonials', desc: 'Hear from association leaders who transformed member engagement with PropFuel. Real testimonials from organizations seeing measurable results.', ogImage: '/og-images/client-success-testimonials.png' },
    '/client-success/customers': { title: 'Trusted by 330+ Associations Nationwide | PropFuel', desc: 'Trusted by 330+ associations across 40+ industries. See the organizations that rely on PropFuel for member insights, engagement, and measurable growth.', ogImage: '/og-images/client-success-customers.png' },
    '/client-success/implementation': { title: 'Seamless Implementation & Onboarding | PropFuel', desc: 'Get started with PropFuel in weeks, not months. Our proven implementation process includes dedicated success managers for association teams of any size.', ogImage: '/og-images/client-success-implementation.png' },
    '/resources/blog': { title: 'Blog \u2014 Member Engagement Tips & Insights | PropFuel', desc: 'Insights on member engagement, retention strategies, and association growth from the PropFuel team. Practical advice for membership professionals.', ogImage: '/og-images/resources-blog.png' },
    '/resources/webinars': { title: 'Webinars on Member Engagement Strategy | PropFuel', desc: 'Watch on-demand webinars and register for upcoming sessions on member engagement, retention strategies, and data-driven association management.', ogImage: '/og-images/resources-webinars.png' },
    '/resources/guides': { title: 'Guides & Reports for Association Leaders | PropFuel', desc: 'Download free guides, playbooks, and frameworks for association member engagement, renewal campaigns, onboarding strategies, and data intelligence.', ogImage: '/og-images/resources-guides.png' },
    '/resources/help-center': { title: 'Help Center \u2014 Support & Knowledge Base | PropFuel', desc: 'Get help with PropFuel. Browse our knowledge base, submit a support request, or schedule a call with our customer success team.', ogImage: '/og-images/resources-help.png' },
    '/resources/newsletter': { title: 'Newsletter \u2014 Association Industry Insights | PropFuel', desc: "Subscribe to PropFuel's newsletter for monthly insights on member engagement trends, association success stories, and product updates.", ogImage: '/og-images/resources-newsletter.png' },
    '/resources/api-docs': { title: 'API Documentation & Developer Resources | PropFuel', desc: 'PropFuel API documentation for developers. Build custom integrations, sync member data, trigger automated campaigns, and pull engagement insights.', ogImage: '/og-images/resources-api.png' },
    '/company/about': { title: 'About Us \u2014 Mission, Vision & Team | PropFuel', desc: 'PropFuel helps association staff make membership meaningful. Meet the team behind the membership insights and engagement platform for 330+ associations.', ogImage: '/og-images/company-about.png' },
    '/company/careers': { title: 'Careers \u2014 Join the PropFuel Team | PropFuel', desc: "Join the PropFuel team. We're building the future of membership engagement for associations. See open positions, benefits, and our company culture.", ogImage: '/og-images/company-careers.png' },
    '/company/contact': { title: 'Contact PropFuel \u2014 Sales, Support & More | PropFuel', desc: 'Get in touch with PropFuel. Contact our sales, support, or partnership teams to learn how 330+ associations use PropFuel for member engagement.', ogImage: '/og-images/company-contact.png' },
    '/company/partners': { title: 'Partner Program for AMS & Consulting Firms | PropFuel', desc: 'Partner with PropFuel to grow your business. Explore AMS, consulting, technology, and content partnership opportunities for the association space.', ogImage: '/og-images/company-partners.png' },
    '/legal/privacy': { title: 'Privacy Policy & Data Protection | PropFuel', desc: "Read PropFuel's privacy policy to understand how we collect, use, store, and protect your personal data when you use our membership engagement platform.", ogImage: '/og-images/legal-privacy.png' },
    '/legal/terms': { title: 'Terms of Service & Legal Information | PropFuel', desc: "Review PropFuel's terms of service. Understand the rules, usage rights, and responsibilities that govern your use of the PropFuel membership platform.", ogImage: '/og-images/legal-terms.png' }
  };

  var SITE_URL = 'https://propfuel-v2.webflow.io';
  // OG images live on Webflow's CDN — the user uploaded them to the PropFuel V2
  // asset library, so we reference them directly instead of routing through
  // GitHub Pages. Keys match the SEO_DATA ogImage filename (e.g. "company-about.png").
  var WF_OG_CDN = 'https://cdn.prod.website-files.com/69ca88e6c52b04fb85f74a02/';
  var WF_OG_MAP = {
    'index.png': '69ebb0b7cefcc8b8b7971817_Home.png',
    'demo.png': '69ebb0b7cd336f675b4a3165_demo.png',
    'platform-overview.png': '69ebb0b893f2f9e41e9287a3_platform-overview.png',
    'platform-insights.png': '69ebb0b8dd01ecb4a388d8f0_platform-insights.png',
    'platform-automation.png': '69ebb0b7b4e1e3e3c69484c7_platform-automation.png',
    'platform-engagement.png': '69ebb0b899ba29fe7ccecfd5_platform-engagement.png',
    'platform-email.png': '69ebb0b815d99adacb6473ee_platform-email.png',
    'platform-sms.png': '69ebb0b81c05c0474ef86355_platform-sms.png',
    'platform-website.png': '69ebb0b869a8d17afbfb9f7c_platform-website.png',
    'platform-integrations.png': '69ebb0b808aa0608d8bd8f09_platform-integrations.png',
    // 'platform-membership-ai.png' intentionally omitted — the new gradient OG image
    // is hosted on GitHub Pages (see /membership-ai entry in OG_DATA) so the full
    // HTTPS URL fall-through is used instead of the legacy Webflow CDN asset.
    'use-cases-onboarding.png': '69ebb0b808aa0608d8bd8f25_use-cases-onboarding.png',
    'use-cases-renewals.png': '69ebb0b8ea20b3efba5534b5_use-cases-renewals.png',
    'use-cases-win-back.png': '69ebb0b8308e9b8afc0577ae_use-cases-win-back.png',
    'use-cases-acquisition.png': '69ebb0b849485c8467f7b791_use-cases-acquisition.png',
    'use-cases-events.png': '69ebb0b89128f1732101b14e_use-cases-events.png',
    'use-cases-certifications.png': '69ebb0b84be1878d3fa8c288_use-cases-certifications.png',
    'use-cases-data-intelligence.png': '69ebb0b857b9c7c677f073dc_use-cases-data-intelligence.png',
    'client-success-case-studies.png': '69ebb0b962a9160dff7917bd_client-success-case-studies.png',
    'client-success-customers.png': '69ebb0b734d8c9e65d9852c6_client-success-customers.png',
    'client-success-roi-results.png': '69ebb0b7d8ec906b8f3bf9f4_client-success-roi-results.png',
    'client-success-testimonials.png': '69ebb0b76a5348bfd0b84f2a_client-success-testimonials.png',
    'client-success-implementation.png': '69ebb0b7d3c3da1ee4829eb5_client-success-implementation.png',
    'resources-blog.png': '69ebb0b8f158f4c588f3b615_resources-blog.png',
    'resources-webinars.png': '69ebb0b82807a2d37e1a27e8_resources-webinars.png',
    'resources-guides.png': '69ebb0b83dfd30c83a4fc0b5_resources-guides.png',
    'resources-help.png': '69ebb0b8cd637b9786c6eda3_resources-help.png',
    'resources-newsletter.png': '69ebb0b80b7e2520b7d44783_resources-newsletter.png',
    'resources-api.png': '69ebb0b82d3234c2f8cd5dcc_resources-api.png',
    'company-about.png': '69ebb0b73781f93611a606de_company-about.png',
    'company-careers.png': '69ebb0b7ceb75ccd7c205a41_company-careers.png',
    'company-contact.png': '69ebb0b7cf0de11a360aa3cc_company-contact.png',
    'company-partners.png': '69ebb0b7308e9b8afc0574a5_company-partners.png',
    'legal-privacy.png': '69ebb0b76c8e953dce3c8b30_legal-privacy.png',
    'legal-terms.png': '69ebb0b7838220a7461c3a5f_legal-terms.png'
  };

  function injectSEOMeta() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    var data = SEO_DATA[path];
    if (!data) return;

    function setMeta(attr, key, val) {
      var sel = 'meta[' + attr + '="' + key + '"]';
      var el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', val);
    }

    // Title
    if (data.title) document.title = data.title;

    // Description
    setMeta('name', 'description', data.desc);

    // Robots
    setMeta('name', 'robots', 'index, follow');

    // Open Graph — prefer the Webflow CDN URL for the uploaded asset
    var ogFilename = (data.ogImage || '').split('/').pop();
    var ogImageURL;
    if (WF_OG_MAP[ogFilename]) {
      ogImageURL = WF_OG_CDN + WF_OG_MAP[ogFilename];
    } else if (/^https?:\/\//.test(data.ogImage)) {
      ogImageURL = data.ogImage;
    } else {
      ogImageURL = SITE_URL + data.ogImage;
    }
    setMeta('property', 'og:title', data.title);
    setMeta('property', 'og:description', data.desc);
    setMeta('property', 'og:image', ogImageURL);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:url', SITE_URL + path);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'PropFuel');

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', data.title);
    setMeta('name', 'twitter:description', data.desc);
    setMeta('name', 'twitter:image', ogImageURL);

    // Canonical
    var canon = document.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = SITE_URL + path;
  }

  function injectSchemaMarkup() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    var data = SEO_DATA[path];
    if (!data) return;

    var schemas = [];

    // Organization (all pages)
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'PropFuel',
      'url': SITE_URL,
      'logo': SITE_URL + '/logo.png',
      'description': 'The membership insights and engagement platform for associations',
      'sameAs': []
    });

    // WebPage (all pages)
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': data.title,
      'description': data.desc,
      'url': SITE_URL + path
    });

    // FAQPage (pages with FAQ sections)
    var faqItems = document.querySelectorAll('.pf-faq-item');
    if (faqItems.length > 0) {
      var faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': []
      };
      faqItems.forEach(function(item) {
        var q = item.querySelector('.pf-faq-question');
        var a = item.querySelector('.pf-faq-answer');
        if (q && a) {
          faqSchema.mainEntity.push({
            '@type': 'Question',
            'name': q.textContent.trim(),
            'acceptedAnswer': { '@type': 'Answer', 'text': a.textContent.trim() }
          });
        }
      });
      if (faqSchema.mainEntity.length > 0) schemas.push(faqSchema);
    }

    schemas.forEach(function(schema) {
      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
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
      // Skip any element that contains (or IS) a Webflow CMS list — the CMS may render
      // async and we'd leave it stuck at opacity:0. Let it render at full opacity.
      if (el.querySelector('.w-dyn-list, .w-dyn-item') || el.classList.contains('w-dyn-list')) return;
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

  // Safe page-content root: never returns <body>, which would wipe nav + footer.
  // Falls back to creating a <main> between nav and footer if the page lacks one,
  // and hides the Webflow template's body content so the JS-injected page takes over cleanly.
  function getPageMain() {
    var m = document.querySelector('[role="main"]') || document.querySelector('main');
    if (m) return m;
    m = document.createElement('main');
    m.setAttribute('role', 'main');
    var nav = document.querySelector('.pf-nav-bar');
    var footer = document.querySelector('.pf-footer');
    // Hide Webflow template body content between nav and footer — the calling fix function
    // is about to replace it with a full page render, so leaving originals visible causes dupes.
    if (nav && footer && nav.parentNode === footer.parentNode) {
      var el = nav.nextElementSibling;
      while (el && el !== footer) {
        if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && el.tagName !== 'NOSCRIPT') {
          el.style.display = 'none';
          el.setAttribute('data-pf-hidden-by-enhancer', 'true');
        }
        el = el.nextElementSibling;
      }
    }
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(m, nav.nextSibling);
    } else if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(m, footer);
    } else {
      document.body.appendChild(m);
    }
    return m;
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
      'Platform':  { text: 'Platform',       chevron: true, href: '/platform/overview' },
      'Product':   { text: 'Platform',       chevron: true, href: '/platform/overview' }, // alias used on old CMS templates
      'Use Cases': { text: 'Use Cases',      chevron: true, href: '/use-cases/onboarding' },
      'Solutions': { text: 'Use Cases',      chevron: true, href: '/use-cases/onboarding' }, // alias
      'Customers': { text: 'Client Success', chevron: true, href: '/roi' },
      'Company':   { text: 'Client Success', chevron: true, href: '/roi' }, // alias
      'Resources': { text: 'Resources',      chevron: true, href: '/resources/blog' }
    };
    navLinks.forEach(function(link) {
      var text = link.textContent.trim();
      var config = linkMap[text];
      if (config) {
        if (config.text !== text) {
          link.childNodes[0].textContent = config.text;
          if (config.href) link.setAttribute('href', config.href);
        }
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

    // Site-wide: rewrite legacy demo URLs to the canonical /book-a-demo. Covers:
    //   - /request-demo (which 404s)
    //   - /demo (previous slug, before rename)
    document.querySelectorAll('a[href="/request-demo"], a[href="request-demo"], a[href="/demo"], a[href="demo"], a[href$="/demo"]').forEach(function(a){
      var h = a.getAttribute('href') || '';
      // Guard: don't rewrite /demos, /demo-something, etc.
      if (h === '/demo' || h === 'demo' || h === '/request-demo' || h === 'request-demo' || /\/demo$/.test(h)) {
        a.setAttribute('href', '/book-a-demo');
      }
    });

    // Site-wide: force the footer "PropFuel" wordmark to the off-white palette color.
    // Webflow's native footer ships it at #2F2F2F (unreadable on dark footer background).
    document.querySelectorAll('.pf-footer .pf-nav-logo-text, .pf-footer-brand .pf-nav-logo-text, .pf-footer-brand h4').forEach(function(el){
      if ((el.textContent || '').trim() === 'PropFuel') el.style.color = '#EDE8DF';
    });

    // Site-wide: rewrite nav CTA buttons that have href="#" (CMS templates) to /book-a-demo
    document.querySelectorAll('.pf-nav-bar a.pf-btn-primary[href="#"], .pf-nav-bar a.pf-btn-nav[href="#"]').forEach(function(a){
      a.setAttribute('href', '/book-a-demo');
    });

    // Add logo icon. On some CMS templates .pf-nav-logo is a <div> (not clickable);
    // wrap it in an anchor to the homepage.
    var logoLink = document.querySelector('.pf-nav-logo');
    if (logoLink && logoLink.tagName === 'DIV' && !logoLink.closest('a')) {
      var wrap = document.createElement('a');
      wrap.href = '/';
      wrap.className = logoLink.className + ' w-inline-block';
      wrap.style.textDecoration = 'none';
      wrap.style.color = 'inherit';
      logoLink.parentNode.insertBefore(wrap, logoLink);
      wrap.appendChild(logoLink);
      logoLink = wrap;
    }
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
            { title: 'The Engagement Engine', desc: 'One question, every channel, real answers', href: '/platform/engagement' }
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
          { title: 'ROI & Results', desc: 'Hard numbers across the platform', href: '/roi' },
          { title: 'Case Studies', desc: 'Real results from real associations', href: '/client-success/case-studies' },
          { title: 'Testimonials', desc: 'What members and staff say', href: '/client-success/testimonials' },
          { title: 'Implementation', desc: 'What getting started looks like', href: '/client-success/implementation' }
        ]}]
      },
      'Resources': {
        narrow: true,
        cols: [{ links: [
          { title: 'Blog', desc: 'Insights on member engagement', href: '/resources/blog' },
          { title: 'Webinars', desc: 'On-demand sessions & recordings', href: '/resources/webinars' },
          { title: 'Guides & Playbooks', desc: 'Deep-dive strategy content', href: '/resources/guides' },
          { title: 'Help Center', desc: 'Documentation & support', href: 'https://help.propfuel.com/' },
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
          var extAttr = /^https?:\/\//.test(l.href) ? ' target="_blank" rel="noopener noreferrer"' : '';
          html += '<a href="' + l.href + '"' + extAttr + ' class="pf-dd-link"><span class="pf-dd-title">' + l.title + '</span><span class="pf-dd-desc">' + l.desc + '</span></a>';
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

    // ── HAMBURGER MENU (mobile/tablet) ──
    var navInner = document.querySelector('.pf-nav-inner');
    if (navInner && !navInner.querySelector('.pf-hamburger')) {
      var burger = document.createElement('button');
      burger.className = 'pf-hamburger';
      burger.setAttribute('aria-label', 'Toggle menu');
      burger.style.cssText = 'display:none;align-items:center;justify-content:center;width:44px;height:44px;background:none;border:none;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent';
      burger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="2" stroke-linecap="round"><line class="pf-burger-top" x1="4" y1="6" x2="20" y2="6" style="transition:all .3s ease"/><line class="pf-burger-mid" x1="4" y1="12" x2="20" y2="12" style="transition:all .3s ease"/><line class="pf-burger-bot" x1="4" y1="18" x2="20" y2="18" style="transition:all .3s ease"/></svg>';

      // Insert before the nav CTA button (right side). The ref node must be a
      // DIRECT child of navInner — on some CMS templates the CTA is nested inside
      // an anonymous wrapper div, which would throw NotFoundError.
      var navRight = navInner.querySelector('[class*="nav-right"], .pf-btn-nav, .pf-btn-primary');
      if (navRight && navRight.parentNode === navInner) { navInner.insertBefore(burger, navRight); }
      else { navInner.appendChild(burger); }

      var navLinksEl = document.querySelector('.pf-nav-links');

      // Move Log In + Get Started into the mobile menu so they remain accessible
      // when .pf-nav-right is hidden on mobile.
      if (navLinksEl && !navLinksEl.querySelector('.pf-mobile-ctas')) {
        var loginSrc = Array.from(document.querySelectorAll('.pf-nav-right a, .pf-nav-right button')).find(function(a) { return a.textContent.trim() === 'Log In'; });
        var startedSrc = Array.from(document.querySelectorAll('.pf-nav-right a, .pf-nav-right button')).find(function(a) { return a.textContent.trim() === 'Get Started'; });
        var ctaWrap = document.createElement('div');
        ctaWrap.className = 'pf-mobile-ctas';
        var ctaHTML = '';
        if (loginSrc) { ctaHTML += '<a href="' + (loginSrc.getAttribute('href')||'#') + '" class="pf-mobile-login">Log In</a>'; }
        if (startedSrc) { ctaHTML += '<a href="' + (startedSrc.getAttribute('href')||'/book-a-demo') + '" class="pf-mobile-started pf-btn-nav">Get Started</a>'; }
        ctaWrap.innerHTML = ctaHTML;
        navLinksEl.appendChild(ctaWrap);
      }
      // ── MOBILE NAV PANEL (PF_MOBILE_PANEL_V1) ──
      // Full-screen slide-in panel for mobile/tablet. Desktop pill + dropdowns
      // are untouched — this panel lives outside .pf-nav-links and is built
      // lazily on first burger tap, only when matchMedia('(max-width:1024px)').
      // Source of truth for nav items = the `dropdowns` object above (shared
      // with the desktop pill). Keep the two in sync if/when dropdowns change.
      var mobilePanel = null;
      var mobilePanelOpen = false;

      function syncBurgerIcon(open) {
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        var top = burger.querySelector('.pf-burger-top');
        var mid = burger.querySelector('.pf-burger-mid');
        var bot = burger.querySelector('.pf-burger-bot');
        if (open) {
          if (top) { top.setAttribute('x1','6'); top.setAttribute('y1','6'); top.setAttribute('x2','18'); top.setAttribute('y2','18'); }
          if (mid) { mid.style.opacity = '0'; }
          if (bot) { bot.setAttribute('x1','6'); bot.setAttribute('y1','18'); bot.setAttribute('x2','18'); bot.setAttribute('y2','6'); }
        } else {
          if (top) { top.setAttribute('x1','4'); top.setAttribute('y1','6'); top.setAttribute('x2','20'); top.setAttribute('y2','6'); }
          if (mid) { mid.style.opacity = '1'; }
          if (bot) { bot.setAttribute('x1','4'); bot.setAttribute('y1','18'); bot.setAttribute('x2','20'); bot.setAttribute('y2','18'); }
        }
      }

      function buildMobilePanel() {
        if (mobilePanel) return mobilePanel;
        var panel = document.createElement('div');
        panel.className = 'pf-mobile-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', 'Navigation menu');
        panel.setAttribute('aria-hidden', 'true');

        var logoSrc = 'https://cdn.prod.website-files.com/69ca88e6c52b04fb85f74a02/69cc30a4a0dc86d4b55ee8a1_logo.png';
        // Spec order: Platform, Use Cases, Resources, Client Success
        var ddOrder = ['Platform', 'Use Cases', 'Resources', 'Client Success'];

        // Read Log In + Get a Demo destinations from the existing desktop nav DOM
        // (single source of truth — if a CMS template changes them, we inherit it).
        var loginEl = Array.from(document.querySelectorAll('.pf-nav-right a, .pf-nav-right button, .pf-nav-bar a, .pf-nav-bar button')).find(function(a) { return (a.textContent || '').trim() === 'Log In'; });
        var demoEl  = document.querySelector('.pf-btn-nav');
        var loginHref = (loginEl && loginEl.getAttribute('href')) || '#';
        var demoHref  = (demoEl  && demoEl.getAttribute('href'))  || '/book-a-demo';

        var htmlParts = [];
        htmlParts.push(
          '<div class="pf-mp-header">' +
            '<a href="/" class="pf-mp-logo" aria-label="PropFuel home"><img src="' + logoSrc + '" alt="PropFuel"></a>' +
            '<button type="button" class="pf-mp-close" aria-label="Close menu">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>' +
            '</button>' +
          '</div>',
          '<nav class="pf-mp-body">'
        );
        ddOrder.forEach(function(title, idx) {
          var dd = dropdowns[title];
          if (!dd) return;
          var accId = 'pf-mp-acc-' + idx;
          htmlParts.push(
            '<div class="pf-mp-acc">' +
              '<button type="button" class="pf-mp-acc-btn" aria-expanded="false" aria-controls="' + accId + '">' +
                '<span>' + title + '</span>' +
                '<svg class="pf-mp-acc-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
              '</button>' +
              '<div class="pf-mp-acc-body" id="' + accId + '" role="region">'
          );
          if (dd.overview) {
            htmlParts.push(
              '<a class="pf-mp-sublink" href="' + dd.overview.href + '">' +
                '<span class="pf-mp-sub-title">' + dd.overview.title + '</span>' +
                '<span class="pf-mp-sub-desc">' + dd.overview.desc + '</span>' +
              '</a>'
            );
          }
          if (dd.ai) {
            htmlParts.push(
              '<a class="pf-mp-sublink pf-mp-sublink-ai" href="' + dd.ai.href + '">' +
                '<span class="pf-mp-sub-title">' + dd.ai.title + '</span>' +
                '<span class="pf-mp-sub-desc">' + dd.ai.desc + '</span>' +
              '</a>'
            );
          }
          (dd.cols || []).forEach(function(col) {
            if (col.heading) htmlParts.push('<div class="pf-mp-subhead">' + col.heading + '</div>');
            (col.links || []).forEach(function(l) {
              var ext = /^https?:\/\//.test(l.href || '') ? ' target="_blank" rel="noopener noreferrer"' : '';
              htmlParts.push(
                '<a class="pf-mp-sublink" href="' + l.href + '"' + ext + '>' +
                  '<span class="pf-mp-sub-title">' + l.title + '</span>' +
                  (l.desc ? '<span class="pf-mp-sub-desc">' + l.desc + '</span>' : '') +
                '</a>'
              );
            });
          });
          htmlParts.push('</div></div>');
        });
        htmlParts.push(
          '</nav>',
          '<div class="pf-mp-footer">' +
            '<a class="pf-mp-cta-ghost" href="' + loginHref + '">Log In</a>' +
            '<a class="pf-mp-cta-primary" href="' + demoHref + '">Get a Demo</a>' +
          '</div>'
        );
        panel.innerHTML = htmlParts.join('');
        document.body.appendChild(panel);

        // Accordion: one-open-at-a-time so the scroll stays manageable
        panel.querySelectorAll('.pf-mp-acc-btn').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = btn.getAttribute('aria-expanded') === 'true';
            panel.querySelectorAll('.pf-mp-acc-btn').forEach(function(b) {
              if (b !== btn) {
                b.setAttribute('aria-expanded', 'false');
                b.parentNode.classList.remove('open');
              }
            });
            btn.setAttribute('aria-expanded', String(!isOpen));
            btn.parentNode.classList.toggle('open', !isOpen);
          });
        });

        // X closes
        var closeBtn = panel.querySelector('.pf-mp-close');
        if (closeBtn) closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeMobilePanel(); });

        // Tapping any link navigates (closes implicitly on page unload; also explicit for same-page anchors)
        panel.querySelectorAll('a').forEach(function(a) {
          a.addEventListener('click', function() { closeMobilePanel(); });
        });

        mobilePanel = panel;
        return panel;
      }

      function openMobilePanel() {
        // Defense-in-depth: never open on desktop even if something else fires the burger.
        if (!window.matchMedia('(max-width:1024px)').matches) return;
        var panel = buildMobilePanel();
        // rAF so the .open transition animates from the initial translateX(100%)
        requestAnimationFrame(function() { panel.classList.add('open'); });
        panel.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        mobilePanelOpen = true;
        syncBurgerIcon(true);
      }

      function closeMobilePanel() {
        if (mobilePanel) {
          mobilePanel.classList.remove('open');
          mobilePanel.setAttribute('aria-hidden', 'true');
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        mobilePanelOpen = false;
        syncBurgerIcon(false);
      }

      burger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (mobilePanelOpen) closeMobilePanel();
        else openMobilePanel();
      });

      // ESC closes the panel
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobilePanelOpen) closeMobilePanel();
      });
    }

    // ── TOUCH-FRIENDLY DROPDOWNS ──
    if ('ontouchstart' in window) {
      document.querySelectorAll('.pf-dropdown').forEach(function(wrapper) {
        var trigger = wrapper.querySelector('.pf-nav-link');
        var menu = wrapper.querySelector('.pf-dropdown-menu');
        if (!trigger || !menu) return;
        trigger.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var isOpen = menu.classList.contains('open');
          // Close all others
          document.querySelectorAll('.pf-dropdown-menu.open').forEach(function(m) { m.classList.remove('open'); });
          if (!isOpen) menu.classList.add('open');
        });
      });
      // Close dropdowns on outside tap
      document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.pf-dropdown')) {
          document.querySelectorAll('.pf-dropdown-menu.open').forEach(function(m) { m.classList.remove('open'); });
        }
      });
    }
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
        { id: 'insights', label: 'Insights', title: 'More signal. Less noise.', desc: 'The Insights Engine interprets member behavior and surfaces who wants what, who\u2019s at risk, and who\u2019s ready for more \u2014 so you stop guessing and start acting.', features: ['Real-time member signals and response analysis','At-risk member identification before they lapse','AI-powered insight agent that learns over time','Clear, actionable dashboards \u2014 not data dumps'], link: '/platform/insights', mockup: '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Member Signal</span><span class="mu-pill mu-g">Healthy</span></div><div style="display:flex;justify-content:space-between;margin-top:10px"><div><div class="mu-name">Sarah Chen</div><div class="mu-sub">Director of Programs, ACME Assoc.</div></div><div style="text-align:right"><div class="mu-score">87</div><div class="mu-sub">Signal Strength</div></div></div><div class="mu-div"></div><div class="mu-tags"><span class="mu-tag">Certification</span><span class="mu-tag">Events</span><span class="mu-tag">Advocacy</span><span class="mu-tag">Mentorship</span></div></div><div class="mu-card"><div class="mu-hdr"><span class="mu-t">At-Risk Members</span><span class="mu-pill mu-r">12 flagged</span></div><div style="margin-top:10px"><div class="mu-bar-row"><span class="mu-bar-l">J. Rivera</span><div class="mu-bar"><div class="mu-bar-f" style="width:23%"></div></div><span class="mu-bar-v">23</span></div><div class="mu-bar-row" style="margin-top:8px"><span class="mu-bar-l">M. Patel</span><div class="mu-bar"><div class="mu-bar-f" style="width:31%"></div></div><span class="mu-bar-v">31</span></div><div class="mu-bar-row" style="margin-top:8px"><span class="mu-bar-l">K. Olsen</span><div class="mu-bar"><div class="mu-bar-f" style="width:18%"></div></div><span class="mu-bar-v">18</span></div></div></div>' },
        { id: 'automation', label: 'Automation', title: 'More personalization. Less busy work.', desc: 'The Automation Engine builds campaigns from scratch \u2014 segments, messaging, workflows \u2014 using 70+ blueprints. You just approve and launch.', features: ['70+ campaign blueprints ready to deploy','AI-generated messaging tailored to each segment','Conditional logic and drip sequences','One-click campaign builder \u2014 no technical skills needed'], link: '/platform/automation', mockup: '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Campaign Blueprint</span><span class="mu-pill mu-o">Ready to Launch</span></div><div style="margin-top:12px"><div class="mu-name">Renewal Win-Back \u2014 90 Day</div><div class="mu-sub">Targets 847 lapsed members \u00b7 3-step drip</div></div><div class="mu-div"></div><div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#2F2F2F"><div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">1</span> Segment</div><span style="color:#D6D0C4">\u2192</span><div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">2</span> Message</div><span style="color:#D6D0C4">\u2192</span><div style="display:flex;align-items:center;gap:6px"><span class="mu-step-n">3</span> Follow-up</div></div><div style="margin-top:16px;display:flex;gap:8px"><span class="mu-btn mu-btn-p">1-Click Deploy</span><span class="mu-btn mu-btn-o">Customize</span></div></div>' },
        { id: 'engagement', label: 'Engagement', title: 'More engagement. Less silence.', desc: 'The Engagement Engine turns one-way communications into two-way exchanges. Single-click responses across email, website, and SMS.', features: ['Single-click email responses members actually use','Website targeting \u2014 pop-ups, banners, inline content','SMS engagement with opt-in management','AMS integration with automatic data write-back'], link: '/platform/engagement', mockup: '<div class="mu-card"><div class="mu-hdr"><span class="mu-t">Live Response</span><span class="mu-pill mu-o">Collecting</span></div><div style="margin-top:12px;font-size:15px;font-weight:700;color:#2F2F2F">What\u2019s most important to you this year?</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><span class="mu-resp sel">Professional Development</span><span class="mu-resp">Networking</span><span class="mu-resp">Certification</span><span class="mu-resp">Advocacy</span></div><div class="mu-div"></div><div style="display:flex;gap:16px"><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;color:#2F2F2F">1,847</div><div class="mu-sub">Responses</div></div><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent">45%</div><div class="mu-sub">Engagement Rate</div></div><div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;color:#2F2F2F">3</div><div class="mu-sub">Channels</div></div></div></div>' },
        { id: 'ai', label: 'Membership AI', title: 'Intelligence that connects everything.', desc: 'Membership AI is the layer across all three engines \u2014 it listens, interprets, recommends, and builds. Every interaction makes the next one smarter.', features: ['Insight Agent \u2014 surfaces what matters from your data','Initiative Agent \u2014 recommends what to do next','Recommendation Agent \u2014 personalizes every touchpoint','Learns continuously \u2014 the more you use it, the better it gets'], link: '/membership-ai', mockup: '<div class="mu-card"><div style="font-size:12px;font-weight:700;color:#2F2F2F;margin-bottom:8px">\u2728 Insight Agent</div><div class="mu-bubble"><strong>12 members</strong> showing lapse signals this week. Signal strength dropped below 30.</div><div style="margin-top:12px;font-size:12px;font-weight:700;color:#2F2F2F;margin-bottom:8px">\ud83c\udfaf Initiative Agent</div><div class="mu-bubble">Recommended: Launch a <strong>win-back campaign</strong> for Q2 non-renewals. 80% success rate.</div><div style="margin-top:14px;display:flex;gap:8px"><span class="mu-btn mu-btn-p">Apply Recommendation</span><span class="mu-btn mu-btn-o">View Details</span></div></div>' }
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

    // Rewrite any static Help Center anchors (Webflow footer, etc.) to external URL
    document.querySelectorAll('a[href="/resources/help-center"], a[href$="/resources/help-center/"]').forEach(function(a) {
      a.href = 'https://help.propfuel.com/';
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });

    // Fix any "This is some text inside of a div block." placeholders
    document.querySelectorAll('div, p, span').forEach(function(el) {
      if (el.textContent.trim() === 'This is some text inside of a div block.') {
        el.textContent = '';
      }
    });

    // ═══════════════════════════════════════
    // USE CASES SECTION — inject between stats and testimonials
    // ═══════════════════════════════════════
    if (!document.querySelector('.hp-use-cases')) {
      var ucCards = [
        { type: 'Win-Back', num: '80%', label: 'of lapsed members re-engaged within 90 days', org: 'AAP \u2014 American Academy of Pediatrics', featured: true },
        { type: 'Renewals', num: '$320K', label: 'recovered revenue from at-risk members', org: 'ASAE' },
        { type: 'Data Intelligence', num: '42K', label: 'member insights captured in one quarter', org: 'ISTE', dark: true },
        { type: 'Onboarding', num: '3x', label: 'new member engagement in the first 60 days', org: 'NACUBO' },
        { type: 'Events', num: '45%', label: 'attendee engagement rate at annual conference', org: 'NAPNAP' },
        { type: 'Acquisition', num: '2.4x', label: 'conversion rate on non-member prospects', org: 'INCOSE' },
        { type: 'Data Enrichment', num: '4,500+', label: 'member profiles updated instantly', org: 'INS', dark: true, wide: true }
      ];
      var ucGridHTML = '';
      ucCards.forEach(function(c) {
        var cardBg = c.featured ? 'background:linear-gradient(135deg,#F47C2C,#F9A825,#FBC02D);color:#fff' :
          c.dark ? 'background:#2F2F2F;color:#fff' : 'background:#FFFBF2';
        var span = c.featured ? 'grid-column:span 2;' : c.wide ? 'grid-column:span 2;' : '';
        var typeColor = c.featured ? 'color:rgba(255,255,255,0.85)' : c.dark ? 'color:rgba(255,255,255,0.6)' : 'color:#F47C2C';
        var numStyle = c.featured ? 'color:#fff' : c.dark ? 'color:#FBC02D' :
          'background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text';
        var labelColor = c.featured ? 'color:rgba(255,255,255,0.9)' : c.dark ? 'color:rgba(255,255,255,0.7)' : 'color:#6E6E6E';
        var orgColor = c.featured ? 'color:rgba(255,255,255,0.75)' : c.dark ? 'color:rgba(255,255,255,0.5)' : 'color:#8C8479';
        ucGridHTML += '<div style="' + cardBg + ';border-radius:20px;padding:36px 32px;display:flex;flex-direction:column;justify-content:space-between;min-height:240px;' + span + 'transition:transform .3s ease,box-shadow .3s ease">' +
          '<div><p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;' + typeColor + '">' + c.type + '</p></div>' +
          '<div style="margin-top:auto"><p style="font-size:clamp(36px,5vw,48px);font-weight:900;letter-spacing:-0.03em;line-height:1;' + numStyle + '">' + c.num + '</p>' +
          '<p style="font-size:15px;line-height:1.5;margin-top:8px;' + labelColor + '">' + c.label + '</p>' +
          '<p style="font-size:12px;margin-top:8px;' + orgColor + '">' + c.org + '</p></div></div>';
      });
      var ucHTML = '<section class="hp-use-cases" style="padding:120px 48px;background:#EBE6DA">' +
        '<div style="max-width:1200px;margin:0 auto">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F47C2C;text-align:center;margin-bottom:16px">Use Cases</p>' +
        '<h2 style="font-size:clamp(32px,5vw,48px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;text-align:center;margin-bottom:56px">Real outcomes. Real associations.</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">' + ucGridHTML + '</div>' +
        '<div style="text-align:center;margin-top:48px"><a href="/client-success/case-studies" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2)">View All Case Studies <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a></div>' +
        '</div></section>';
      var testTarget = document.querySelector('.pf-testimonials-section');
      if (testTarget) {
        testTarget.insertAdjacentHTML('beforebegin', ucHTML);
      }
      // Hide the Webflow-native duplicate use-cases section (same heading as hp-use-cases)
      Array.from(document.querySelectorAll('section')).forEach(function(s){
        if (s.classList.contains('hp-use-cases')) return;
        var h = s.querySelector('h2');
        if (h && /^Real outcomes\.\s*Real associations\.?$/i.test((h.textContent || '').trim())) {
          s.style.display = 'none';
        }
      });
    }

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
    // Find the use case section — try multiple strategies
    var ucGrid = document.querySelector('.pf-usecases-grid');
    var ucSection = ucGrid ? ucGrid.closest('section') || ucGrid.parentElement : null;
    if (!ucSection) ucSection = document.querySelector('.pf-usecases-section, [class*="usecases-section"], [class*="use-cases"]');
    if (!ucSection) {
      var firstCard = document.querySelector('.pf-usecase-card');
      if (firstCard) ucSection = firstCard.closest('section') || firstCard.parentElement.parentElement;
    }

    if (ucSection) {
      // Find the grid container (the div holding the cards) — reuse ucGrid if already found
      if (!ucGrid) ucGrid = ucSection.querySelector('[class*="usecase-grid"], [class*="usecases-grid"]');
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

        // Hide original Webflow "View All Case Studies" button (parent .pf-cta-buttons)
        var origCTAbtns = ucSection.querySelector('.pf-cta-buttons');
        if (origCTAbtns) origCTAbtns.style.display = 'none';
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

    // Load ChiliPiper for post-submit scheduling
    var cpScript = document.createElement('script');
    cpScript.src = 'https://js.chilipiper.com/marketing.js';
    cpScript.type = 'text/javascript';
    document.head.appendChild(cpScript);

    // ChiliPiper listener — routes HubSpot form submission to Inbound_Router
    var cpTenantDomain = 'propfuel';
    var cpRouterName = 'Inbound_Router';
    var cpFormId = 'f8009d2f-d93b-40b1-a669-d6c112abe6a5';
    window.addEventListener('message', function(event) {
      if (cpFormId && event.data.id !== cpFormId) return;
      if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
        var lead = event.data.data.submissionValues;
        for (var key in lead) {
          if (Array.isArray(lead[key])) { lead[key] = lead[key].toString().replaceAll(',', ';'); }
        }
        if (window.ChiliPiper) {
          ChiliPiper.submit(cpTenantDomain, cpRouterName, { map: true, lead: lead });
        }
      }
    });
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
      heroSub.textContent = 'The AI-powered membership insights and engagement platform that helps associations understand what members want\u00a0\u2014\u00a0and act on it.';
    }

    // --- 4. Inject hero buttons (Webflow has NO buttons in the hero) ---
    if (heroHeading) {
      var heroParent = heroHeading.parentElement;
      if (!heroParent.querySelector('.pf-hero-btns-injected')) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'pf-hero-btns-injected fade-up';
        btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';
        btnWrap.innerHTML =
          '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">' +
            'Get a Demo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '<a href="/platform/insights" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">' +
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
    // SECTION 1B: PHILOSOPHY — "Stop Broadcasting. Start Conversing."
    // ═══════════════════════════════════════
    var firstSection = document.querySelector('.pf-section, .pf-feature-grid');
    if (firstSection && !document.querySelector('.po-philosophy')) {
      var philHTML = '<section class="po-philosophy" style="padding:96px 48px;background:#EBE6DA">' +
        '<div style="max-width:1100px;margin:0 auto">' +
        '<div style="text-align:center;margin-bottom:64px">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The PropFuel Difference</p>' +
          '<h2 style="font-size:clamp(32px,5vw,48px);font-weight:800;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Stop Broadcasting.<br>Start Conversing.</h2>' +
          '<p style="font-size:18px;color:#6E6E6E;max-width:620px;margin:0 auto;line-height:1.65">PropFuel is not another email tool or marketing automation platform. It is built on a fundamentally different idea: instead of broadcasting at members, you have conversations with them.</p>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center">' +
          '<div>' +
            '<h3 style="font-size:clamp(22px,3vw,28px);font-weight:700;color:#2F2F2F;line-height:1.2;margin-bottom:20px">One question at a time. Three channels. Every response matters.</h3>' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.65;margin-bottom:16px">Most platforms send newsletters, surveys, and blast emails \u2014 hoping someone responds. PropFuel asks one clear question through email, SMS, or your website. Members respond with a single tap. No friction, no fatigue.</p>' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.65">Every response flows back into the member profile and triggers the right next action \u2014 automatically. It is a continuous loop of listening and acting that turns passive members into engaged ones.</p>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:center">' +
            '<div style="max-width:400px;width:100%;font-family:DM Sans,sans-serif">' +
              '<style>@keyframes poSpinLoop{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style>' +
              '<svg viewBox="0 0 460 460" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%">' +
                '<defs>' +
                  '<linearGradient id="poLoopGrad" x1="0" y1="0" x2="460" y2="460" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#F47C2C"/><stop offset="100%" stop-color="#FBC02D"/></linearGradient>' +
                  '<linearGradient id="poLoopGrad2" x1="0" y1="0" x2="460" y2="460" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#F47C2C" stop-opacity="0.15"/><stop offset="100%" stop-color="#FBC02D" stop-opacity="0.15"/></linearGradient>' +
                '</defs>' +
                '<circle cx="230" cy="230" r="180" stroke="url(#poLoopGrad2)" stroke-width="3" fill="none"/>' +
                '<circle cx="230" cy="230" r="180" stroke="url(#poLoopGrad)" stroke-width="4" fill="none" stroke-dasharray="377 754" stroke-dashoffset="0" stroke-linecap="round" style="transform-origin:center;animation:poSpinLoop 8s linear infinite"/>' +
                '<path d="M 310 98 Q 370 170 350 270" stroke="url(#poLoopGrad2)" stroke-width="2" fill="none" stroke-dasharray="6 6"/>' +
                '<path d="M 330 310 Q 260 380 150 340" stroke="url(#poLoopGrad2)" stroke-width="2" fill="none" stroke-dasharray="6 6"/>' +
                '<path d="M 120 300 Q 80 200 160 110" stroke="url(#poLoopGrad2)" stroke-width="2" fill="none" stroke-dasharray="6 6"/>' +
                '<circle cx="230" cy="50" r="42" fill="url(#poLoopGrad)"/><text x="230" y="46" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="14" font-weight="800" fill="#fff">ASK</text><text x="230" y="62" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(255,255,255,0.8)">One Question</text>' +
                '<circle cx="386" cy="330" r="42" fill="url(#poLoopGrad)"/><text x="386" y="326" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="13" font-weight="800" fill="#fff">CAPTURE</text><text x="386" y="342" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(255,255,255,0.8)">Every Response</text>' +
                '<circle cx="74" cy="330" r="42" fill="url(#poLoopGrad)"/><text x="74" y="326" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="14" font-weight="800" fill="#fff">ACT</text><text x="74" y="342" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(255,255,255,0.8)">Right Action</text>' +
                '<text x="230" y="218" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="15" font-weight="700" fill="#2F2F2F">The Membership</text>' +
                '<text x="230" y="240" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="15" font-weight="700" fill="#2F2F2F">Engagement Loop</text>' +
              '</svg>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div></section>';
      firstSection.insertAdjacentHTML('beforebegin', philHTML);
    }

    // ═══════════════════════════════════════
    // SECTION 1C: ENGINES HEADER — "Three Engines, One Platform"
    // ═══════════════════════════════════════
    var engineSection = document.querySelector('.pf-section, .pf-feature-grid');
    if (engineSection && !document.querySelector('.po-engines-header')) {
      var engHeaderHTML = '<div class="po-engines-header" style="text-align:center;padding:96px 48px 32px;max-width:800px;margin:0 auto">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Three Engines, One Platform</p>' +
        '<h2 style="font-size:clamp(28px,4vw,42px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Everything You Need to Understand and Engage Your Members</h2>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6">PropFuel unifies insights, automation, and engagement into a single platform purpose-built for associations.</p>' +
      '</div>';
      engineSection.insertAdjacentHTML('beforebegin', engHeaderHTML);
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
        '<div style="text-align:right"><div class="mu-score">87</div><div class="mu-sub">Signal Strength</div></div></div>' +
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

    // Engine 04: Membership AI — 3-agent overview card
    var aiMockup =
      '<div class="mu-card" style="background:#1C1C1C;border:1px solid rgba(74,127,165,0.15)">' +
        '<div class="mu-hdr"><span class="mu-t" style="color:#4A7FA5">Membership AI</span><span class="mu-pill" style="background:rgba(74,127,165,0.12);color:#4A7FA5">3 Agents Active</span></div>' +
        '<div style="margin-top:14px;display:flex;flex-direction:column;gap:10px">' +
          '<div style="display:flex;align-items:center;gap:10px;background:rgba(74,127,165,0.06);border-radius:10px;padding:10px 12px;border:1px solid rgba(74,127,165,0.1)">' +
            '<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#4A7FA5,#35607E);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D0DFEA" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>' +
            '<div><div style="font-size:12px;font-weight:700;color:#D0DFEA">Insight Agent</div><div style="font-size:10px;color:#8C8479;margin-top:1px">47 at-risk members flagged</div></div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;background:rgba(74,127,165,0.06);border-radius:10px;padding:10px 12px;border:1px solid rgba(74,127,165,0.1)">' +
            '<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#35607E,#1F3A51);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D0DFEA" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>' +
            '<div><div style="font-size:12px;font-weight:700;color:#D0DFEA">Recommendation Agent</div><div style="font-size:10px;color:#8C8479;margin-top:1px">3 actions ready to review</div></div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;background:rgba(74,127,165,0.06);border-radius:10px;padding:10px 12px;border:1px solid rgba(74,127,165,0.1)">' +
            '<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#4A7FA5,#D0DFEA);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F3A51" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
            '<div><div style="font-size:12px;font-weight:700;color:#D0DFEA">Initiative Agent</div><div style="font-size:10px;color:#8C8479;margin-top:1px">2 campaigns drafted</div></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Map mockups to visuals by index (order on page: insights=0, automation=1, engagement=2, ai=3)
    var mockups = [insightsMockup, automationMockup, engagementMockup, aiMockup];
    visuals.forEach(function(v, i) {
      if (mockups[i] && !v.querySelector('.mu-card')) {
        v.innerHTML = mockups[i];
        v.style.background = i === 3 ? '#1C1C1C' : '#EBE6DA';
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
          'Response analysis and trend tracking',
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
        cta: { text: 'Explore the Engagement Engine', href: '/platform/engagement' }
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

      // Add engine number label above title (check direct parent to avoid duplicates)
      var insertParent = titleEl.parentNode;
      if (!insertParent.querySelector('.eng-num-label')) {
        var numLabel = document.createElement('p');
        numLabel.className = 'eng-num-label';
        numLabel.style.cssText = 'font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:8px';
        numLabel.textContent = eng.num;
        insertParent.insertBefore(numLabel, titleEl);
      }

      // Add tagline below title
      if (!insertParent.querySelector('.eng-tagline')) {
        var tagline = document.createElement('p');
        tagline.className = 'eng-tagline';
        tagline.style.cssText = 'font-size:18px;font-weight:600;color:#F47C2C;margin-top:4px;margin-bottom:16px';
        tagline.textContent = eng.tagline;
        insertParent.insertBefore(tagline, titleEl.nextSibling);
      }

      // Fix description
      var descEl = section.querySelector('.pf-feature-desc');
      if (descEl) descEl.textContent = eng.desc;

      // Fix bullet items
      var bullets = section.querySelectorAll('.pf-feature-list-item');
      bullets.forEach(function(b, i) {
        if (eng.bullets[i]) b.textContent = '\u2022 ' + eng.bullets[i];
      });

      // Fix CTA link: "Learn More" → "Explore the X Engine →" (dark pill button)
      // Search in section and also in the broader feature wrapper
      var ctaLink = section.querySelector('.pf-btn-primary') || (section.parentElement ? section.parentElement.querySelector('.pf-btn-primary') : null);
      if (ctaLink && ctaLink.textContent.trim() === 'Learn More') {
        ctaLink.className = 'pf-btn-dark-pill'; // Remove w-button class to avoid Webflow !important overrides
        ctaLink.href = eng.cta.href;
        ctaLink.style.cssText = 'display:inline-flex!important;align-items:center!important;gap:8px!important;background:#1A1714!important;background-image:none!important;border-radius:100px!important;' +
          'padding:12px 24px!important;font-size:14px!important;font-weight:600!important;letter-spacing:0.02em;color:#F4F1EA!important;text-decoration:none!important;' +
          'border:none!important;box-shadow:0 4px 16px rgba(0,0,0,0.1)!important;transition:box-shadow .3s ease;font-family:DM Sans,sans-serif';
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
      // Apply dark background to Membership AI section (matches Vercel)
      var aiWrapper = aiTitle.closest('.pf-section') || aiSection;
      if (aiWrapper) {
        aiWrapper.classList.add('pf-fullbleed-dark');
        aiWrapper.style.cssText += ';background:#1A1713!important;padding:96px 48px;margin:0 -48px;width:calc(100% + 96px)';
        aiWrapper.querySelectorAll('.pf-feature-title, h2').forEach(function(el) { el.style.color = '#EDE8DF'; });
        aiWrapper.querySelectorAll('.pf-feature-desc, p').forEach(function(el) { if (!el.closest('.mu-card')) el.style.color = '#8C8479'; });
        aiWrapper.querySelectorAll('.pf-feature-list-item').forEach(function(el) { el.style.color = '#EDE8DF'; });
        aiWrapper.querySelectorAll('.eng-num-label').forEach(function(el) { el.style.color = '#4A7FA5'; });
        aiWrapper.querySelectorAll('.eng-tagline').forEach(function(el) { el.style.color = '#4A7FA5'; });
        // Gradient on "Membership AI" title using AI steel palette (light -> steel for contrast on dark)
        aiTitle.style.background = 'linear-gradient(135deg, #D0DFEA 0%, #8BB0CC 45%, #4A7FA5 100%)';
        aiTitle.style.webkitBackgroundClip = 'text';
        aiTitle.style.backgroundClip = 'text';
        aiTitle.style.webkitTextFillColor = 'transparent';
        aiTitle.style.color = 'transparent';
        aiTitle.style.display = 'inline-block';
        aiTitle.style.paddingBottom = '4px';
      }
      var aiCta = (aiWrapper || aiSection).querySelector('.pf-btn-primary, .w-button');
      if (aiCta && aiCta.textContent.trim() === 'Learn More') {
        aiCta.href = '/membership-ai';
        aiCta.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:#1A1714;border-radius:100px;' +
          'padding:12px 24px;font-size:14px;font-weight:600;letter-spacing:0.02em;color:#F4F1EA;text-decoration:none;' +
          'border:none;box-shadow:0 4px 16px rgba(0,0,0,0.1);transition:box-shadow .3s ease';
        aiCta.innerHTML = 'Explore Membership AI <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      }
    }

    // ═══════════════════════════════════════
    // SECTION 5: CHANNELS — inject full section
    // ═══════════════════════════════════════
    var ctaSectionEl = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (ctaSectionEl && !document.querySelector('.po-channels')) {
      var channelsHTML = '<section class="po-channels" style="background:#EAE4D8;padding:96px 48px;width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw)">' +
        '<div style="max-width:1200px;margin:0 auto">' +
        '<div style="text-align:center;margin-bottom:56px">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Channels</p>' +
          '<h2 style="font-size:clamp(32px,5vw,42px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Reach Members Where They Are</h2>' +
          '<p style="font-size:18px;color:#6E6E6E;max-width:600px;margin:0 auto;line-height:1.6">Three channels, unified in one platform. Every response\u00a0\u2014\u00a0regardless of channel\u00a0\u2014\u00a0flows into the same member profile.</p>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px">' +
            '<div style="width:48px;height:48px;border-radius:14px;background:rgba(249,168,37,0.12);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg></div>' +
            '<h3 style="font-size:22px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Email</h3>' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.6;margin-bottom:20px">Conversational emails with single-click response buttons embedded right in the message. No links to click, no forms to fill out.</p>' +
            '<a href="/platform/email" style="font-size:14px;font-weight:600;color:#F47C2C;text-decoration:none;display:inline-flex;align-items:center;gap:6px">Learn more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px">' +
            '<div style="width:48px;height:48px;border-radius:14px;background:rgba(249,168,37,0.12);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>' +
            '<h3 style="font-size:22px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Website</h3>' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.6;margin-bottom:20px">Personalized pop-ups, banners, and inline widgets that turn anonymous visitors into known, engaged members on your site.</p>' +
            '<a href="/platform/website" style="font-size:14px;font-weight:600;color:#F47C2C;text-decoration:none;display:inline-flex;align-items:center;gap:6px">Learn more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px">' +
            '<div style="width:48px;height:48px;border-radius:14px;background:rgba(249,168,37,0.12);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>' +
            '<h3 style="font-size:22px;font-weight:700;color:#2F2F2F;margin-bottom:12px">SMS</h3>' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.6;margin-bottom:20px">Event-day texts, time-sensitive questions, and real-time engagement with built-in opt-in management and compliance.</p>' +
            '<a href="/platform/sms" style="font-size:14px;font-weight:600;color:#F47C2C;text-decoration:none;display:inline-flex;align-items:center;gap:6px">Learn more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '</div>' +
        '</div>' +
        '</div>' +
      '</section>';
      ctaSectionEl.insertAdjacentHTML('beforebegin', channelsHTML);
    }

    // ═══════════════════════════════════════
    // SECTION 6: INTEGRATIONS — inject full section
    // ═══════════════════════════════════════
    var channelsEl = document.querySelector('.po-channels');
    var insertTarget = ctaSectionEl;
    if (channelsEl) insertTarget = channelsEl;
    if (insertTarget && !document.querySelector('.po-integrations')) {
      var intHTML = '<section class="po-integrations" style="padding:96px 48px;background:#EBE6DA">' +
        '<div style="max-width:900px;margin:0 auto;text-align:center">' +
          '<h2 style="font-size:clamp(28px,4vw,36px);font-weight:700;color:#2F2F2F;letter-spacing:-0.01em;line-height:1.15;margin-bottom:20px">Built to Work With Your AMS</h2>' +
          '<p style="font-size:17px;color:#6E6E6E;line-height:1.65;margin-bottom:40px;max-width:640px;margin-left:auto;margin-right:auto">PropFuel connects directly to your association management system with two-way data sync. Member responses write back to your AMS automatically\u00a0\u2014\u00a0no manual data entry, no CSV exports, no lost insights.</p>' +
          '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:36px">' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#2F2F2F"><span style="width:6px;height:6px;border-radius:50%;background:#F9A825"></span> iMIS</span>' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#2F2F2F"><span style="width:6px;height:6px;border-radius:50%;background:#F9A825"></span> Nimble AMS</span>' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#2F2F2F"><span style="width:6px;height:6px;border-radius:50%;background:#F9A825"></span> Fonteva</span>' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#2F2F2F"><span style="width:6px;height:6px;border-radius:50%;background:#F9A825"></span> MemberSuite</span>' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#2F2F2F"><span style="width:6px;height:6px;border-radius:50%;background:#F9A825"></span> Salesforce</span>' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#2F2F2F"><span style="width:6px;height:6px;border-radius:50%;background:#F9A825"></span> Personify</span>' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#2F2F2F"><span style="width:6px;height:6px;border-radius:50%;background:#F9A825"></span> netFORUM</span>' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#2F2F2F"><span style="width:6px;height:6px;border-radius:50%;background:#F9A825"></span> YourMembership</span>' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;background:#F6F2E8;border:1px solid #E3DDD2;font-size:13px;font-weight:600;color:#6E6E6E">+ 50 more</span>' +
          '</div>' +
          '<a href="/integrations" style="font-size:14px;font-weight:600;color:#F47C2C;text-decoration:none;display:inline-flex;align-items:center;gap:6px">View All Integrations <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
        '</div>' +
      '</section>';
      // Insert after channels if it exists, otherwise before CTA
      if (channelsEl) {
        channelsEl.insertAdjacentHTML('afterend', intHTML);
      } else if (ctaSectionEl) {
        ctaSectionEl.insertAdjacentHTML('beforebegin', intHTML);
      }
    }

    // ═══════════════════════════════════════
    // SECTION 7B: STATS BAND — "Proven Results Across 330+ Associations"
    // ═══════════════════════════════════════
    var ctaSectionForStats = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (ctaSectionForStats && !document.querySelector('.po-stats-band')) {
      var statsHTML = '<section class="po-stats-band pf-section-dark" style="background:#1A1713;padding:96px 48px">' +
        '<div style="max-width:1000px;margin:0 auto;text-align:center">' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:12px">Proven Results Across 330+ Associations</h2>' +
          '<p style="font-size:17px;color:#8C8479;margin-bottom:56px">Organizations that use PropFuel don\u2019t just engage more members \u2014 they grow.</p>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:48px">' +
            '<div><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$100M+</p><p style="font-size:14px;color:#8C8479;margin-top:8px;line-height:1.5">Revenue growth attributed to PropFuel campaigns</p></div>' +
            '<div><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">330+</p><p style="font-size:14px;color:#8C8479;margin-top:8px;line-height:1.5">Associations trust PropFuel</p></div>' +
            '<div><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">72%</p><p style="font-size:14px;color:#8C8479;margin-top:8px;line-height:1.5">Of declining orgs reversed course</p></div>' +
          '</div>' +
        '</div>' +
      '</section>';
      ctaSectionForStats.insertAdjacentHTML('beforebegin', statsHTML);
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
  // FIX AUTOMATION ENGINE PAGE
  // ─────────────────────────────────────────
  function fixAutomationEngine() {
    if (window.location.pathname.indexOf('platform/automation') === -1) return;

    // ═══════════════════════════════════════
    // SECTION 1: FIX HERO
    // ═══════════════════════════════════════

    // Fix hero label
    var heroLabel = document.querySelector('.pf-page-hero-label');
    if (heroLabel) {
      heroLabel.textContent = 'The Automation Engine';
    } else {
      // Inject label if not present
      var heroTitle = document.querySelector('.pf-page-hero-title');
      if (heroTitle) {
        var parent = heroTitle.parentElement;
        if (!parent.querySelector('.pf-hero-label-injected')) {
          var label = document.createElement('p');
          label.className = 'pf-hero-label-injected fade-up';
          label.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;' +
            'background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;' +
            'font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;' +
            'box-shadow:0 2px 8px rgba(120,110,95,0.06)';
          label.textContent = 'The Automation Engine';
          parent.insertBefore(label, heroTitle);
        }
      }
    }

    // Fix hero heading
    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) {
      heroHeading.innerHTML = 'More personalization.<br>Less busy work.';
    }

    // Fix hero subtitle
    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) {
      heroSub.textContent = 'PropFuel automatically builds the engagement strategy \u2014 the audience, campaigns, and copy \u2014 you just approve and launch.';
    }

    // Inject hero buttons if not present
    if (heroHeading) {
      var heroParent = heroHeading.parentElement;
      if (!heroParent.querySelector('.pf-hero-btns-injected')) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'pf-hero-btns-injected fade-up';
        btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';
        btnWrap.innerHTML =
          '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">' +
            'Get Started <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '<a href="#workflowBand" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">' +
            'See It in Action</a>';
        var sub = heroParent.querySelector('.pf-page-hero-sub');
        if (sub) {
          sub.parentNode.insertBefore(btnWrap, sub.nextSibling);
        } else {
          heroParent.appendChild(btnWrap);
        }
      }
    }

    // ═══════════════════════════════════════
    // SECTION 2: HERO CAMPAIGN BUILDER MOCKUP
    // ═══════════════════════════════════════
    var heroVisual = document.querySelector('.ae-hero-mockup');
    if (!heroVisual) {
      var btns = document.querySelector('.pf-hero-btns-injected');
      var heroArea = btns ? btns.parentElement : (heroHeading ? heroHeading.parentElement : null);
      if (heroArea) {
        heroVisual = document.createElement('div');
        heroVisual.className = 'ae-hero-mockup';
        heroVisual.style.cssText = 'margin:48px auto 0;max-width:960px;padding:0 24px';
        heroArea.appendChild(heroVisual);
      }
    }
    if (heroVisual && !heroVisual.querySelector('.ae-campaign-builder')) {
      var mockupWrap = document.createElement('div');
      mockupWrap.className = 'ae-campaign-builder';
      mockupWrap.innerHTML =
        '<div style="width:100%;max-width:920px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(47,47,47,0.08);font-family:\'DM Sans\',sans-serif;color:#2F2F2F;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:#FAFAF6;border-bottom:1px solid #E3DDD2;">' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<div style="width:10px;height:10px;border-radius:50%;background:#F47C2C;"></div>' +
              '<span style="font-size:14px;font-weight:700;letter-spacing:-0.01em;">Renewal Campaign \u2014 Q4 2026</span>' +
              '<span style="font-size:11px;font-weight:500;color:#fff;background:#FBC02D;padding:2px 10px;border-radius:100px;">Active</span>' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
              '<span style="font-size:12px;color:#6E6E6E;padding:4px 12px;border:1px solid #E3DDD2;border-radius:6px;">Preview</span>' +
              '<span style="font-size:12px;color:#fff;background:#F47C2C;padding:4px 14px;border-radius:6px;font-weight:600;">Launch</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;min-height:260px;">' +
            '<div style="width:200px;border-right:1px solid #E3DDD2;padding:16px;background:#FAFAF6;flex-shrink:0;">' +
              '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6E6E6E;margin-bottom:12px;">Blueprints</div>' +
              '<div style="padding:8px 10px;background:#FBC02D20;border:1px solid #FBC02D;border-radius:8px;margin-bottom:8px;font-size:12px;font-weight:600;cursor:pointer;">Renewal Drip</div>' +
              '<div style="padding:8px 10px;border:1px solid #E3DDD2;border-radius:8px;margin-bottom:8px;font-size:12px;color:#6E6E6E;">New Member Onboard</div>' +
              '<div style="padding:8px 10px;border:1px solid #E3DDD2;border-radius:8px;margin-bottom:8px;font-size:12px;color:#6E6E6E;">Lapsed Re-engage</div>' +
              '<div style="padding:8px 10px;border:1px solid #E3DDD2;border-radius:8px;margin-bottom:8px;font-size:12px;color:#6E6E6E;">Event Follow-up</div>' +
              '<div style="padding:8px 10px;border:1px solid #E3DDD2;border-radius:8px;font-size:12px;color:#6E6E6E;">NPS Survey</div>' +
            '</div>' +
            '<div style="flex:1;padding:24px 28px;display:flex;flex-direction:column;align-items:center;gap:0;">' +
              '<div style="display:flex;align-items:center;gap:12px;width:100%;">' +
                '<div style="width:36px;height:36px;border-radius:50%;background:#FBC02D;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>' +
                '<div style="flex:1;background:#FAFAF6;border:1px solid #E3DDD2;border-radius:10px;padding:10px 14px;">' +
                  '<div style="font-size:12px;font-weight:700;">Day 1 \u2014 Welcome + Ask</div>' +
                  '<div style="font-size:11px;color:#6E6E6E;margin-top:2px;">\u201CWhat\u2019s one thing we could do better?\u201D</div>' +
                '</div>' +
              '</div>' +
              '<div style="width:2px;height:20px;background:#E3DDD2;margin-left:17px;align-self:flex-start;"></div>' +
              '<div style="display:flex;align-items:center;gap:12px;width:100%;">' +
                '<div style="width:36px;height:36px;border-radius:50%;background:#F47C2C;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>' +
                '<div style="flex:1;background:#FAFAF6;border:1px solid #E3DDD2;border-radius:10px;padding:10px 14px;">' +
                  '<div style="font-size:12px;font-weight:700;">Day 5 \u2014 Wait &amp; Branch</div>' +
                  '<div style="font-size:11px;color:#6E6E6E;margin-top:2px;">If responded \u2192 branch by answer \u00b7 If silent \u2192 nudge</div>' +
                '</div>' +
              '</div>' +
              '<div style="width:2px;height:20px;background:#E3DDD2;margin-left:17px;align-self:flex-start;"></div>' +
              '<div style="display:flex;gap:10px;width:100%;padding-left:48px;">' +
                '<div style="flex:1;background:#FBC02D15;border:1.5px solid #FBC02D;border-radius:10px;padding:10px 12px;text-align:center;">' +
                  '<div style="font-size:11px;font-weight:700;color:#F47C2C;">Positive</div>' +
                  '<div style="font-size:10px;color:#6E6E6E;margin-top:2px;">Send renewal link</div>' +
                '</div>' +
                '<div style="flex:1;background:#F47C2C10;border:1.5px solid #F47C2C;border-radius:10px;padding:10px 12px;text-align:center;">' +
                  '<div style="font-size:11px;font-weight:700;color:#F47C2C;">Neutral</div>' +
                  '<div style="font-size:10px;color:#6E6E6E;margin-top:2px;">Ask what\u2019s missing</div>' +
                '</div>' +
                '<div style="flex:1;background:#2F2F2F08;border:1.5px solid #BDBDBD;border-radius:10px;padding:10px 12px;text-align:center;">' +
                  '<div style="font-size:11px;font-weight:700;color:#2F2F2F;">Negative</div>' +
                  '<div style="font-size:10px;color:#6E6E6E;margin-top:2px;">Alert staff member</div>' +
                '</div>' +
              '</div>' +
              '<div style="width:2px;height:20px;background:#E3DDD2;margin-left:17px;align-self:flex-start;"></div>' +
              '<div style="display:flex;align-items:center;gap:12px;width:100%;">' +
                '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
                '<div style="flex:1;background:#FAFAF6;border:1px solid #E3DDD2;border-radius:10px;padding:10px 14px;">' +
                  '<div style="font-size:12px;font-weight:700;">Day 14 \u2014 Wrap-up</div>' +
                  '<div style="font-size:11px;color:#6E6E6E;margin-top:2px;">Write results to AMS \u00b7 Generate staff summary</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div style="width:180px;border-left:1px solid #E3DDD2;padding:16px;background:#FAFAF6;flex-shrink:0;">' +
              '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6E6E6E;margin-bottom:14px;">Campaign Stats</div>' +
              '<div style="margin-bottom:14px;"><div style="font-size:10px;color:#6E6E6E;margin-bottom:2px;">Sent</div><div style="font-size:22px;font-weight:800;color:#2F2F2F;">4,217</div></div>' +
              '<div style="margin-bottom:14px;"><div style="font-size:10px;color:#6E6E6E;margin-bottom:2px;">Response Rate</div><div style="font-size:22px;font-weight:800;color:#F47C2C;">38%</div><div style="width:100%;height:6px;background:#E3DDD2;border-radius:4px;margin-top:4px;overflow:hidden;"><div style="width:38%;height:100%;background:linear-gradient(90deg,#FBC02D,#F47C2C);border-radius:4px;"></div></div></div>' +
              '<div style="margin-bottom:14px;"><div style="font-size:10px;color:#6E6E6E;margin-bottom:2px;">Renewals</div><div style="font-size:22px;font-weight:800;color:#FBC02D;">892</div></div>' +
              '<div><div style="font-size:10px;color:#6E6E6E;margin-bottom:2px;">Staff Alerts</div><div style="font-size:22px;font-weight:800;color:#2F2F2F;">47</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      heroVisual.innerHTML = '';
      heroVisual.appendChild(mockupWrap);
      heroVisual.style.background = '#EBE6DA';
      heroVisual.style.borderRadius = '20px';
      heroVisual.style.padding = '28px';
    }

    // ═══════════════════════════════════════
    // SECTION 3: INJECT ALL MISSING SECTIONS
    // Find CTA as anchor; inject before it
    // ═══════════════════════════════════════
    var ctaSection = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (!ctaSection) return;

    // --- PROBLEM BAND (dark) ---
    if (!document.querySelector('.ae-problem-band')) {
      var problemHTML = '<section class="ae-problem-band" style="background:#1A1713;padding:96px 48px">' +
        '<div style="max-width:800px;margin:0 auto;text-align:center">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The Problem</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:32px">You know what you should be doing. You just don\u2019t have the bandwidth.</h2>' +
          '<p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">You know every new member should get a tailored onboarding experience. You know renewals should feel like conversations, not payment reminders. You know lapsed members deserve more than a generic \u201Cwe miss you\u201D email.</p>' +
          '<p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">You know all of this. And you have <strong style="color:#EDE8DF">one to three people to do it for thousands of members.</strong></p>' +
          '<p style="font-size:17px;color:#8C8479;line-height:1.65"><strong style="color:#EDE8DF">\u201CSix weeks making phone calls to stragglers.\u201D</strong> Another: <strong style="color:#EDE8DF">\u201COne staff member manages 5,000 members.\u201D</strong> You don\u2019t need more people. You need a system that does the heavy lifting.</p>' +
        '</div>' +
      '</section>';
      ctaSection.insertAdjacentHTML('beforebegin', problemHTML);
    }

    // --- BLUEPRINT SECTION ---
    if (!document.querySelector('.ae-blueprints')) {
      var blueprintHTML = '<section class="ae-blueprints" style="padding:96px 48px;max-width:1200px;margin:0 auto">' +
        '<div style="text-align:center;margin-bottom:56px">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">70+ Blueprints</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Start from a campaign that\u2019s already 80% built.</h2>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:32px">' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start">' +
            '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:800;color:#fff">O</div>' +
            '<div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Onboarding</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">3\u201311 check-ins over 3\u20139 months, running automatically from day one.</p></div>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start">' +
            '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:800;color:#fff">R</div>' +
            '<div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Renewals</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">90-day renewal conversations that adapt based on each member\u2019s responses.</p></div>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start">' +
            '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:800;color:#fff">W</div>' +
            '<div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Win-Back</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Automated re-engagement with different cadence for recent vs. long-lapsed members.</p></div>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start">' +
            '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:800;color:#fff">E</div>' +
            '<div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Events</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Pre-event registration drives, attendee prep, and post-event NPS with branching.</p></div>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start">' +
            '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:800;color:#fff">C</div>' +
            '<div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Certifications</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Guide members from discovery through credential renewal automatically.</p></div>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start">' +
            '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:800;color:#fff">D</div>' +
            '<div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Data Capture</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Progressive profiling through micro-conversations. No forms, no portal logins.</p></div>' +
          '</div>' +
        '</div>' +
        '<div style="background:#F6F2E8;border:1px solid #E3DDD2;border-radius:12px;padding:16px 24px;display:flex;align-items:center;gap:12px;max-width:600px;margin:0 auto">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F9A825" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>' +
          '<span style="font-size:14px;color:#6E6E6E;line-height:1.5">AI generates messaging tailored to your audience. You customize and approve.</span>' +
        '</div>' +
      '</section>';
      var problemBand = document.querySelector('.ae-problem-band');
      if (problemBand) {
        problemBand.insertAdjacentHTML('afterend', blueprintHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', blueprintHTML);
      }
    }

    // --- HOW IT WORKS PIPELINE ---
    if (!document.querySelector('.ae-how-it-works')) {
      var howHTML = '<section class="ae-how-it-works" id="workflowBand" style="padding:96px 48px;background:#EBE6DA">' +
        '<div style="max-width:1000px;margin:0 auto;text-align:center">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">How It Works</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">From \u201CI don\u2019t have the bandwidth\u201D to \u201CI just hit approve.\u201D</h2>' +
          '<div style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:0;align-items:flex-start">' +
            '<div style="text-align:center;padding:0 16px">' +
              '<p style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F47C2C;margin-bottom:12px">Step 1</p>' +
              '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Choose a Blueprint</h3>' +
              '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">70+ campaign blueprints cover every lifecycle stage. AI generates messaging tailored to your audience. You\u2019re not starting from a blank page.</p>' +
            '</div>' +
            '<div style="display:flex;align-items:center;padding-top:40px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E3DDD2" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg></div>' +
            '<div style="text-align:center;padding:0 16px">' +
              '<p style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F47C2C;margin-bottom:12px">Step 2</p>' +
              '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Set the Rules</h3>' +
              '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">Conditional logic branches campaigns based on responses. Drip sequences run over weeks or months. Enrollment triggers pull members in automatically.</p>' +
            '</div>' +
            '<div style="display:flex;align-items:center;padding-top:40px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E3DDD2" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg></div>' +
            '<div style="text-align:center;padding:0 16px">' +
              '<p style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F47C2C;margin-bottom:12px">Step 3</p>' +
              '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Approve & Launch</h3>' +
              '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">Review what PropFuel built. Hit go. Real-time alerts notify you when members respond or need attention. Responses write back to your AMS automatically.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
      var blueprints = document.querySelector('.ae-blueprints');
      if (blueprints) {
        blueprints.insertAdjacentHTML('afterend', howHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', howHTML);
      }
    }

    // --- FEATURE 1: CONDITIONAL LOGIC ---
    if (!document.querySelector('.ae-feature-logic')) {
      var condLogicMockup =
        '<div style="width:100%;max-width:520px;margin:0 auto;font-family:\'DM Sans\',sans-serif;color:#2F2F2F;padding:10px 0;">' +
          '<div style="background:#fff;border:2px solid #FBC02D;border-radius:14px;padding:16px 20px;text-align:center;box-shadow:0 2px 12px rgba(251,192,45,0.12);max-width:280px;margin:0 auto;">' +
            '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#F47C2C;margin-bottom:4px;">Question</div>' +
            '<div style="font-size:15px;font-weight:700;">\u201CDo you plan to renew?\u201D</div>' +
          '</div>' +
          '<div style="text-align:center;margin:0 auto;position:relative;height:50px;max-width:420px;">' +
            '<svg width="100%" height="50" viewBox="0 0 420 50" preserveAspectRatio="xMidYMid meet" style="display:block;margin:0 auto;">' +
              '<line x1="210" y1="0" x2="210" y2="14" stroke="#E3DDD2" stroke-width="2"/>' +
              '<circle cx="210" cy="18" r="4" fill="#FBC02D"/>' +
              '<line x1="210" y1="22" x2="70" y2="50" stroke="#FBC02D" stroke-width="2"/>' +
              '<line x1="210" y1="22" x2="210" y2="50" stroke="#F47C2C" stroke-width="2"/>' +
              '<line x1="210" y1="22" x2="350" y2="50" stroke="#BDBDBD" stroke-width="2"/>' +
            '</svg>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">' +
            '<div style="background:#fff;border-radius:12px;border:2px solid #FBC02D;overflow:hidden;box-shadow:0 1px 8px rgba(251,192,45,0.10);">' +
              '<div style="background:#FBC02D;padding:6px 0;text-align:center;"><span style="font-size:13px;font-weight:800;color:#fff;">Yes</span></div>' +
              '<div style="padding:12px 10px;">' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:22px;height:22px;border-radius:50%;background:#FBC02D20;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBC02D" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><span style="font-size:11px;font-weight:600;">Send renewal link</span></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:22px;height:22px;border-radius:50%;background:#FBC02D20;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBC02D" stroke-width="3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/></svg></div><span style="font-size:11px;font-weight:600;">Thank-you email</span></div>' +
                '<div style="display:flex;align-items:center;gap:6px;"><div style="width:22px;height:22px;border-radius:50%;background:#FBC02D20;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBC02D" stroke-width="3"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div><span style="font-size:11px;font-weight:600;">Tag in AMS</span></div>' +
              '</div>' +
            '</div>' +
            '<div style="background:#fff;border-radius:12px;border:2px solid #F47C2C;overflow:hidden;box-shadow:0 1px 8px rgba(244,124,44,0.10);">' +
              '<div style="background:#F47C2C;padding:6px 0;text-align:center;"><span style="font-size:13px;font-weight:800;color:#fff;">Maybe</span></div>' +
              '<div style="padding:12px 10px;">' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:22px;height:22px;border-radius:50%;background:#F47C2C15;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></svg></div><span style="font-size:11px;font-weight:600;">Ask what\u2019s holding you back</span></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:22px;height:22px;border-radius:50%;background:#F47C2C15;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><span style="font-size:11px;font-weight:600;">Wait 3 days</span></div>' +
                '<div style="display:flex;align-items:center;gap:6px;"><div style="width:22px;height:22px;border-radius:50%;background:#F47C2C15;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/></svg></div><span style="font-size:11px;font-weight:600;">Follow-up nudge</span></div>' +
              '</div>' +
            '</div>' +
            '<div style="background:#fff;border-radius:12px;border:2px solid #2F2F2F;overflow:hidden;box-shadow:0 1px 8px rgba(47,47,47,0.08);">' +
              '<div style="background:#2F2F2F;padding:6px 0;text-align:center;"><span style="font-size:13px;font-weight:800;color:#fff;">No</span></div>' +
              '<div style="padding:12px 10px;">' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:22px;height:22px;border-radius:50%;background:#2F2F2F10;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><span style="font-size:11px;font-weight:600;">Capture reason</span></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:22px;height:22px;border-radius:50%;background:#F47C2C20;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="3"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div><span style="font-size:11px;font-weight:600;color:#F47C2C;">Alert staff</span></div>' +
                '<div style="display:flex;align-items:center;gap:6px;"><div style="width:22px;height:22px;border-radius:50%;background:#2F2F2F10;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="3"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div><span style="font-size:11px;font-weight:600;">Log in AMS</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:14px;background:#fff;border:1px solid #E3DDD2;border-radius:10px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;">' +
            '<div style="display:flex;align-items:center;gap:6px;"><div style="width:8px;height:8px;border-radius:50%;background:#FBC02D;"></div><span style="font-size:11px;color:#6E6E6E;">3 branches</span></div>' +
            '<div style="display:flex;align-items:center;gap:6px;"><div style="width:8px;height:8px;border-radius:50%;background:#F47C2C;"></div><span style="font-size:11px;color:#6E6E6E;">9 actions</span></div>' +
            '<div style="display:flex;align-items:center;gap:6px;"><div style="width:8px;height:8px;border-radius:50%;background:#2F2F2F;"></div><span style="font-size:11px;color:#6E6E6E;">2 staff alerts</span></div>' +
          '</div>' +
        '</div>';

      var feature1HTML = '<section class="ae-feature-logic" style="padding:96px 48px">' +
        '<div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center">' +
          '<div>' +
            '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Smart Campaigns</p>' +
            '<h3 style="font-size:clamp(24px,3.5vw,32px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.2;margin-bottom:20px">Conditional logic & branching that feels personal at scale.</h3>' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.65;margin-bottom:24px">Branch campaigns based on how members respond. \u201CI plan to renew\u201D gets a renewal link. \u201CI\u2019m not sure\u201D gets asked what\u2019s holding them back. \u201CNo\u201D captures the reason and alerts staff.</p>' +
            '<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">' +
              '<li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>If/then logic for every member response</li>' +
              '<li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Relational branching connects campaigns so one outcome triggers another</li>' +
              '<li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Every member gets a different experience based on what they told you</li>' +
            '</ul>' +
          '</div>' +
          '<div style="background:#EBE6DA;border-radius:20px;padding:28px">' +
            condLogicMockup +
          '</div>' +
        '</div>' +
      '</section>';
      var howItWorks = document.querySelector('.ae-how-it-works');
      if (howItWorks) {
        howItWorks.insertAdjacentHTML('afterend', feature1HTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', feature1HTML);
      }
    }

    // --- FEATURE 2: REAL-TIME ALERTS ---
    if (!document.querySelector('.ae-feature-alerts')) {
      var alertFeedMockup =
        '<div style="width:100%;max-width:520px;margin:0 auto;font-family:\'DM Sans\',sans-serif;color:#2F2F2F;padding:10px 0;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding:0 4px;">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<div style="width:10px;height:10px;border-radius:50%;background:#F47C2C;box-shadow:0 0 0 3px rgba(244,124,44,0.2);"></div>' +
              '<span style="font-size:14px;font-weight:700;">Live Activity Feed</span>' +
            '</div>' +
            '<span style="font-size:11px;color:#6E6E6E;background:#fff;padding:3px 10px;border-radius:6px;border:1px solid #E3DDD2;">Last 15 min</span>' +
          '</div>' +
          // Alert 1: Sarah Mitchell (At-Risk)
          '<div style="background:#fff;border-radius:12px;border-left:4px solid #F47C2C;padding:14px 16px;margin-bottom:8px;box-shadow:0 1px 6px rgba(47,47,47,0.06);">' +
            '<div style="display:flex;align-items:flex-start;justify-content:space-between;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>' +
                '<div>' +
                  '<div style="font-size:13px;font-weight:700;">Sarah Mitchell <span style="font-size:10px;font-weight:600;color:#fff;background:#F47C2C;padding:1px 7px;border-radius:100px;margin-left:4px;">At-Risk</span></div>' +
                  '<div style="font-size:12px;color:#6E6E6E;margin-top:2px;">\u201CI\u2019m not sure I\u2019m getting enough value to renew.\u201D</div>' +
                '</div>' +
              '</div>' +
              '<span style="font-size:10px;color:#BDBDBD;flex-shrink:0;margin-left:8px;">2m ago</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:10px;padding-left:44px;">' +
              '<span style="font-size:10px;font-weight:600;color:#fff;background:#2F2F2F;padding:3px 8px;border-radius:5px;display:flex;align-items:center;gap:4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Assigned: Tom R.</span>' +
              '<span style="font-size:10px;font-weight:600;color:#F47C2C;background:#F47C2C15;padding:3px 8px;border-radius:5px;display:flex;align-items:center;gap:4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>AMS Updated</span>' +
            '</div>' +
          '</div>' +
          // Alert 2: James Park (Renewed)
          '<div style="background:#fff;border-radius:12px;border-left:4px solid #FBC02D;padding:14px 16px;margin-bottom:8px;box-shadow:0 1px 6px rgba(47,47,47,0.06);">' +
            '<div style="display:flex;align-items:flex-start;justify-content:space-between;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="width:34px;height:34px;border-radius:50%;background:#FBC02D20;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBC02D" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
                '<div>' +
                  '<div style="font-size:13px;font-weight:700;">James Park <span style="font-size:10px;font-weight:600;color:#fff;background:#FBC02D;padding:1px 7px;border-radius:100px;margin-left:4px;">Renewed</span></div>' +
                  '<div style="font-size:12px;color:#6E6E6E;margin-top:2px;">\u201CYes, I plan to renew. Love the networking events!\u201D</div>' +
                '</div>' +
              '</div>' +
              '<span style="font-size:10px;color:#BDBDBD;flex-shrink:0;margin-left:8px;">5m ago</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:10px;padding-left:44px;">' +
              '<span style="font-size:10px;font-weight:600;color:#FBC02D;background:#FBC02D15;padding:3px 8px;border-radius:5px;display:flex;align-items:center;gap:4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FBC02D" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Renewal Link Sent</span>' +
              '<span style="font-size:10px;font-weight:600;color:#F47C2C;background:#F47C2C15;padding:3px 8px;border-radius:5px;display:flex;align-items:center;gap:4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>AMS Updated</span>' +
            '</div>' +
          '</div>' +
          // Alert 3: AMS Sync (Batch)
          '<div style="background:#fff;border-radius:12px;border-left:4px solid #E3DDD2;padding:14px 16px;margin-bottom:8px;box-shadow:0 1px 6px rgba(47,47,47,0.06);">' +
            '<div style="display:flex;align-items:flex-start;justify-content:space-between;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="width:34px;height:34px;border-radius:50%;background:#EAE4D8;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>' +
                '<div>' +
                  '<div style="font-size:13px;font-weight:700;">AMS Sync Complete <span style="font-size:10px;font-weight:500;color:#6E6E6E;margin-left:4px;">Batch</span></div>' +
                  '<div style="font-size:12px;color:#6E6E6E;margin-top:2px;">12 member records updated \u00b7 3 tags applied \u00b7 2 flags set</div>' +
                '</div>' +
              '</div>' +
              '<span style="font-size:10px;color:#BDBDBD;flex-shrink:0;margin-left:8px;">8m ago</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:10px;padding-left:44px;">' +
              '<span style="font-size:10px;font-weight:600;color:#6E6E6E;background:#EAE4D8;padding:3px 8px;border-radius:5px;">iMIS</span>' +
              '<span style="font-size:10px;font-weight:600;color:#6E6E6E;background:#EAE4D8;padding:3px 8px;border-radius:5px;">Aptify</span>' +
              '<span style="font-size:10px;font-weight:600;color:#6E6E6E;background:#EAE4D8;padding:3px 8px;border-radius:5px;">Salesforce</span>' +
            '</div>' +
          '</div>' +
          // Alert 4: Maria Chen (Engaged)
          '<div style="background:#fff;border-radius:12px;border-left:4px solid #FBC02D;padding:14px 16px;box-shadow:0 1px 6px rgba(47,47,47,0.06);">' +
            '<div style="display:flex;align-items:flex-start;justify-content:space-between;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="width:34px;height:34px;border-radius:50%;background:#FBC02D20;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBC02D" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' +
                '<div>' +
                  '<div style="font-size:13px;font-weight:700;">Maria Chen <span style="font-size:10px;font-weight:600;color:#fff;background:#FBC02D;padding:1px 7px;border-radius:100px;margin-left:4px;">Engaged</span></div>' +
                  '<div style="font-size:12px;color:#6E6E6E;margin-top:2px;">\u201CMore local meetups would be amazing.\u201D</div>' +
                '</div>' +
              '</div>' +
              '<span style="font-size:10px;color:#BDBDBD;flex-shrink:0;margin-left:8px;">12m ago</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:10px;padding-left:44px;">' +
              '<span style="font-size:10px;font-weight:600;color:#FBC02D;background:#FBC02D15;padding:3px 8px;border-radius:5px;display:flex;align-items:center;gap:4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FBC02D" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Follow-up Queued</span>' +
              '<span style="font-size:10px;font-weight:600;color:#F47C2C;background:#F47C2C15;padding:3px 8px;border-radius:5px;display:flex;align-items:center;gap:4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>AMS Updated</span>' +
            '</div>' +
          '</div>' +
        '</div>';

      var feature2HTML = '<section class="ae-feature-alerts" style="padding:96px 48px;background:#EBE6DA">' +
        '<div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center">' +
          '<div style="background:#F6F2E8;border-radius:20px;padding:28px">' +
            alertFeedMockup +
          '</div>' +
          '<div>' +
            '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Stay Informed</p>' +
            '<h3 style="font-size:clamp(24px,3.5vw,32px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.2;margin-bottom:20px">Real-time alerts & automatic write-backs.</h3>' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.65;margin-bottom:24px">Get notified instantly when members respond, hit milestones, or need attention. When a member says \u201CI\u2019m thinking about leaving,\u201D the responsible staff member gets an alert so they can pick up the phone while the conversation is fresh.</p>' +
            '<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">' +
              '<li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Instant staff alerts for high-priority responses</li>' +
              '<li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Every response writes back to your AMS in real time</li>' +
              '<li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Follow-up questions, content delivery, and tagging \u2014 all automatic</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</section>';
      var featureLogic = document.querySelector('.ae-feature-logic');
      if (featureLogic) {
        featureLogic.insertAdjacentHTML('afterend', feature2HTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', feature2HTML);
      }
    }

    // --- STATS BAND (dark) ---
    if (!document.querySelector('.ae-stats-band')) {
      var statsHTML = '<section class="ae-stats-band" style="background:#1A1713;padding:96px 48px">' +
        '<div style="max-width:1000px;margin:0 auto;text-align:center">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Results</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">What happens when you give a small team the power of a big one.</h2>' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px">' +
            '<div style="text-align:center">' +
              '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$100M+</p>' +
              '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">All Clients</p>' +
              '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Total revenue growth across PropFuel clients.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">95%</p>' +
              '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">AAMFT</p>' +
              '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">On-time renewals \u2014 up from 80.5%, plus 7% membership growth.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">2,000+</p>' +
              '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">AAP</p>' +
              '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Lapsed members recovered with an 80% win-back rate.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">72%</p>' +
              '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">All Clients</p>' +
              '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Of declining organizations reversed course after implementing PropFuel.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
      var featureAlerts = document.querySelector('.ae-feature-alerts');
      if (featureAlerts) {
        featureAlerts.insertAdjacentHTML('afterend', statsHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', statsHTML);
      }
    }

    // --- CAPABILITIES GRID ---
    if (!document.querySelector('.ae-capabilities')) {
      var capHTML = '<section class="ae-capabilities" style="padding:96px 48px;max-width:1200px;margin:0 auto">' +
        '<div style="text-align:center;margin-bottom:56px">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Capabilities</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Everything you need to automate the member lifecycle.</h2>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden">' +
            '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div>' +
            '<h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Drip Sequence Campaigns</h4>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">Multi-step journeys that run automatically over weeks or months. An onboarding series with 5 check-ins over 9 months. A renewal sequence starting 90 days out.</p>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden">' +
            '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div>' +
            '<h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Automated Contact Enrollment</h4>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">Members enter campaigns automatically based on AMS data. New member status? Onboarding campaign. 90 days from renewal? Renewal campaign. No manual list management.</p>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden">' +
            '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div>' +
            '<h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Time Windows & Blackout Dates</h4>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">Control when messages send. Tuesday through Thursday mornings when engagement is highest. Never on weekends. Paused during your annual conference.</p>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden">' +
            '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div>' +
            '<h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Contact Tagging & List Actions</h4>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">Organize members dynamically based on behavior. Tag \u201Cinterested in leadership\u201D when they select it. Tags accumulate into a rich behavioral profile.</p>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden">' +
            '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div>' +
            '<h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Re-enrollment Settings</h4>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">Control whether members can re-enter campaigns. Evergreen programs that repeat annually keep the conversation going indefinitely with configurable waiting periods.</p>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden">' +
            '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div>' +
            '<h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Initiatives <span style="font-size:11px;font-weight:600;color:#F47C2C;background:rgba(244,124,44,0.1);padding:2px 8px;border-radius:100px;margin-left:6px">Coming Soon</span></h4>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">Group cross-channel campaigns under unified strategic goals. A \u201CQ4 Renewal Initiative\u201D coordinates email, website pop-ups, and SMS reminders \u2014 all working toward the same outcome.</p>' +
          '</div>' +
        '</div>' +
      '</section>';
      var statsBand = document.querySelector('.ae-stats-band');
      if (statsBand) {
        statsBand.insertAdjacentHTML('afterend', capHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', capHTML);
      }
    }

    // Use Cases section removed per feedback — redundant with /use-cases hub pages
    document.querySelectorAll('.ae-use-cases').forEach(function(n){ n.remove(); });
    // --- FAQ SECTION ---
    if (!document.querySelector('.ae-faq')) {
      var faqItems = [
        { q: 'How long does it take to launch our first campaign?', a: 'Most organizations have their first campaign live within 2\u20133 weeks. Full ramp-up \u2014 with multiple campaigns running across the lifecycle \u2014 typically takes 2\u20133 months. Staff training takes 10\u201345 minutes. You get a dedicated Customer Success Manager who helps build and launch your campaigns alongside you.' },
        { q: 'Do we need to build campaigns from scratch?', a: 'No. PropFuel includes 70+ campaign blueprints covering every major lifecycle stage \u2014 onboarding, renewals, win-back, events, certifications, data capture, and more. AI-powered content generation drafts messaging tailored to your audience. You customize and approve. You don\u2019t start from zero.' },
        { q: 'How does PropFuel connect to our AMS?', a: 'PropFuel integrates with 60+ external systems \u2014 including Salesforce, Fonteva, iMIS, Impexium, Novi, MemberSuite, Aptify, Personify, NetForum, and more. Two-way sync pulls member data in (hourly) and writes response data back (in real time). Setup takes 5\u201330 minutes. A Zapier connector is available for less common systems.' },
        { q: 'Will PropFuel replace our email marketing platform?', a: 'No. PropFuel is additive \u2014 it sits alongside your existing email marketing tools (Higher Logic, Real Magnet, Mailchimp, etc.). Your email tool handles newsletters and announcements. PropFuel handles the conversations, engagement data collection, and automated lifecycle campaigns that your broadcast tools weren\u2019t built for.' },
        { q: 'What if our team is really small \u2014 can we still run this?', a: 'That\u2019s exactly who PropFuel was built for. The typical PropFuel customer is a team of 1\u20133 people managing thousands of members. The Automation Engine does the heavy lifting \u2014 building campaigns, branching logic, triggering follow-up, writing data back to your AMS \u2014 so your team can focus on the personal, high-touch interactions where humans matter most.' }
      ];
      var faqHTML = '<section class="ae-faq" style="padding:96px 48px">' +
        '<div style="max-width:800px;margin:0 auto">' +
          '<div style="text-align:center;margin-bottom:56px">' +
            '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">FAQ</p>' +
            '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Common questions about the Automation Engine.</h2>' +
          '</div>';
      faqItems.forEach(function(item) {
        faqHTML += '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0">' +
          '<button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">' +
            item.q +
            '' +
          '</button>' +
          '<div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease">' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.65;padding-top:16px">' + item.a + '</p>' +
          '</div>' +
        '</div>';
      });
      faqHTML += '</div></section>';
      var anchor = document.querySelector('.ae-capabilities');
      if (anchor) {
        anchor.insertAdjacentHTML('afterend', faqHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', faqHTML);
      }
    }

    // ═══════════════════════════════════════
    // SECTION 4: FIX CTA
    // ═══════════════════════════════════════
    var ctaHeading = document.querySelector('.pf-cta-heading');
    if (ctaHeading) {
      ctaHeading.innerHTML = 'Let PropFuel<br><span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">do the work.</span>';
    }
    var ctaSub = document.querySelector('.pf-cta-sub');
    if (ctaSub) {
      ctaSub.textContent = 'You already know what your members need. Now you have a system that can deliver it \u2014 at scale, automatically, and without burning out your team.';
    }

    // ═══════════════════════════════════════
    // SECTION 5: HIDE EXISTING WEBFLOW FEATURE SECTIONS
    // (the generic "70+ campaign blueprints" and "Conditional logic" sections)
    // ═══════════════════════════════════════
    document.querySelectorAll('.pf-section').forEach(function(s) { s.style.display = 'none'; });
  }

  // ─────────────────────────────────────────
  // SMS PAGE FIX
  // ─────────────────────────────────────────
  function fixSmsPage() {
    if (window.location.pathname.indexOf('platform/sms') === -1) return;

    // ═══════════════════════════════════════
    // SECTION 1: FIX HERO
    // ═══════════════════════════════════════

    // Fix hero label
    var heroLabel = document.querySelector('.pf-page-hero-label');
    if (heroLabel) {
      heroLabel.textContent = 'SMS';
    } else {
      var heroTitle = document.querySelector('.pf-page-hero-title');
      if (heroTitle) {
        var parent = heroTitle.parentElement;
        if (!parent.querySelector('.pf-hero-label-injected')) {
          var label = document.createElement('p');
          label.className = 'pf-hero-label-injected fade-up';
          label.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;' +
            'background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;' +
            'font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;' +
            'box-shadow:0 2px 8px rgba(120,110,95,0.06)';
          label.textContent = 'SMS';
          parent.insertBefore(label, heroTitle);
        }
      }
    }

    // Fix hero heading
    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) {
      heroHeading.textContent = 'Meet members where they already are.';
    }

    // Fix hero subtitle
    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) {
      heroSub.textContent = 'PropFuel SMS brings the same single-question engagement model to text messaging \u2014 perfect for event-day communication, time-sensitive check-ins, and reaching members who don\u2019t open email.';
    }

    // Inject hero buttons if not present
    if (heroHeading) {
      var heroParent = heroHeading.parentElement;
      if (!heroParent.querySelector('.pf-hero-btns-injected')) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'pf-hero-btns-injected fade-up';
        btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';
        btnWrap.innerHTML =
          '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">' +
            'See It in Action <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '<a href="/book-a-demo" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">' +
            'Get Started</a>';
        var sub = heroParent.querySelector('.pf-page-hero-sub');
        if (sub) {
          sub.parentNode.insertBefore(btnWrap, sub.nextSibling);
        } else {
          heroParent.appendChild(btnWrap);
        }
      }
    }

    // ═══════════════════════════════════════
    // SECTION 2: HERO PHONE MOCKUP
    // ═══════════════════════════════════════
    var heroVisual = document.querySelector('.sms-hero-mockup');
    if (!heroVisual) {
      var btns = document.querySelector('.pf-hero-btns-injected');
      var heroArea = btns ? btns.parentElement : (heroHeading ? heroHeading.parentElement : null);
      if (heroArea) {
        heroVisual = document.createElement('div');
        heroVisual.className = 'sms-hero-mockup';
        heroVisual.style.cssText = 'margin:48px auto 0;max-width:960px;padding:0 24px';
        heroArea.appendChild(heroVisual);
      }
    }
    if (heroVisual && !heroVisual.querySelector('.sms-phone-mockup')) {
      var phoneMockup = document.createElement('div');
      phoneMockup.className = 'sms-phone-mockup';
      phoneMockup.innerHTML =
        '<div style="max-width:300px;margin:0 auto;font-family:\'DM Sans\',sans-serif;">' +
          '<div style="background:#2F2F2F;border-radius:32px;padding:12px;box-shadow:0 12px 40px rgba(0,0,0,.18);">' +
            '<div style="width:100px;height:6px;background:#1a1a1a;border-radius:4px;margin:0 auto 8px;"></div>' +
            '<div style="background:#fff;border-radius:22px;overflow:hidden;">' +
              '<div style="background:#F4F1EA;padding:8px 16px;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:11px;font-weight:600;color:#2F2F2F;">9:41</span>' +
                '<div style="display:flex;gap:4px;">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="#2F2F2F"><rect x="1" y="14" width="4" height="8" rx="1"/><rect x="7" y="10" width="4" height="12" rx="1"/><rect x="13" y="6" width="4" height="16" rx="1"/><rect x="19" y="2" width="4" height="20" rx="1"/></svg>' +
                '</div>' +
              '</div>' +
              '<div style="padding:10px 16px;border-bottom:1px solid #EBE6DA;display:flex;align-items:center;gap:10px;">' +
                '<div style="width:32px;height:32px;border-radius:50%;background:#FBC02D;display:flex;align-items:center;justify-content:center;">' +
                  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
                '</div>' +
                '<div>' +
                  '<div style="font-size:13px;font-weight:700;color:#2F2F2F;">Your Association</div>' +
                  '<div style="font-size:10px;color:#999;">SMS Check-in</div>' +
                '</div>' +
              '</div>' +
              '<div style="padding:16px;min-height:200px;background:#fafafa;">' +
                '<div style="background:#EBE6DA;border-radius:16px 16px 16px 4px;padding:12px 14px;max-width:85%;margin-bottom:14px;">' +
                  '<p style="margin:0;font-size:13px;color:#2F2F2F;line-height:1.4;">Hi Sarah! Quick question from your association: <strong>What\u2019s your biggest challenge right now?</strong></p>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;margin-left:auto;max-width:85%;">' +
                  '<div style="background:#FBC02D;color:#2F2F2F;padding:12px 16px;border-radius:16px 16px 4px 16px;font-size:12px;font-weight:600;text-align:center;box-shadow:0 2px 8px rgba(251,192,45,.3);">1. Finding time for CE credits</div>' +
                  '<div style="background:#F47C2C;color:#fff;padding:12px 16px;border-radius:16px 16px 4px 16px;font-size:12px;font-weight:600;text-align:center;">2. Connecting with peers</div>' +
                  '<div style="background:#2F2F2F;color:#fff;padding:12px 16px;border-radius:16px 16px 4px 16px;font-size:12px;font-weight:600;text-align:center;">3. Staying current on regulations</div>' +
                '</div>' +
                '<p style="text-align:center;font-size:10px;color:#bbb;margin-top:14px;">Reply with 1, 2, or 3</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      heroVisual.innerHTML = '';
      heroVisual.appendChild(phoneMockup);
      heroVisual.style.background = '#EBE6DA';
      heroVisual.style.borderRadius = '20px';
      heroVisual.style.padding = '28px';
    }

    // ═══════════════════════════════════════
    // SECTION 3: INJECT ALL MISSING SECTIONS
    // Find CTA as anchor; inject before it
    // ═══════════════════════════════════════
    var ctaSection = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (!ctaSection) return;

    // --- PROBLEM BAND (dark) ---
    if (!document.querySelector('.sms-problem-band')) {
      var problemHTML = '<section class="sms-problem-band" style="background:#1A1713;padding:96px 48px;position:relative;overflow:hidden">' +
        '<div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center">' +
          '<div>' +
            '<p style="font-size:13px;font-weight:600;color:#F9A825;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px">The Problem</p>' +
            '<h2 style="font-size:36px;font-weight:700;color:#EDE8DF;line-height:1.15;letter-spacing:-0.01em;margin-bottom:24px">Some members will never open that email.</h2>' +
            '<p style="font-size:17px;font-weight:400;color:#8C8479;line-height:1.7;margin-bottom:24px">You\u2019ve written the perfect check-in. The subject line is sharp. The question is relevant. And for <strong style="color:#EDE8DF;font-weight:600">30% of your members, it doesn\u2019t matter</strong> \u2014 because they stopped opening association emails a long time ago.</p>' +
            '<p style="font-size:17px;font-weight:400;color:#8C8479;line-height:1.7;margin-bottom:24px">Maybe they\u2019re overwhelmed. Maybe your messages land in a promotions tab they never check. Maybe they\u2019re at a conference with 200 unread messages in their inbox.</p>' +
            '<p style="font-size:17px;font-weight:400;color:#8C8479;line-height:1.7">And on event day? <strong style="color:#EDE8DF;font-weight:600">Email is practically useless.</strong> By the time someone checks their inbox, the session already started and the feedback window already closed.</p>' +
          '</div>' +
          '<div style="display:flex;gap:20px;font-family:\'DM Sans\',sans-serif;align-items:stretch;flex-wrap:wrap;justify-content:center;">' +
            '<div style="flex:1;min-width:160px;background:rgba(255,255,255,.08);border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,.1);text-align:center;">' +
              '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-bottom:12px;">' +
                '<rect x="4" y="10" width="40" height="28" rx="4" stroke="rgba(255,255,255,.3)" stroke-width="2" fill="none"/>' +
                '<polyline points="4,12 24,28 44,12" stroke="rgba(255,255,255,.3)" stroke-width="2" fill="none"/>' +
                '<rect x="8" y="6" width="32" height="4" rx="1" fill="rgba(255,255,255,.1)"/>' +
                '<rect x="10" y="2" width="28" height="4" rx="1" fill="rgba(255,255,255,.06)"/>' +
                '<circle cx="40" cy="10" r="8" fill="#F47C2C"/>' +
                '<text x="40" y="14" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold" font-family="DM Sans">47</text>' +
              '</svg>' +
              '<div style="color:#F47C2C;font-weight:700;font-size:14px;">Email Inbox</div>' +
              '<div style="color:rgba(255,255,255,.4);font-size:11px;margin-top:6px;">Avg. open time: 6+ hours</div>' +
              '<div style="background:rgba(244,124,44,.15);border-radius:8px;padding:8px;margin-top:12px;">' +
                '<div style="font-size:20px;font-weight:700;color:#F47C2C;">22%</div>' +
                '<div style="font-size:10px;color:rgba(255,255,255,.4);">open rate</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;color:rgba(255,255,255,.25);font-size:22px;font-weight:700;">vs</div>' +
            '<div style="flex:1;min-width:160px;background:rgba(251,192,45,.08);border-radius:16px;padding:24px;border:2px solid rgba(251,192,45,.3);text-align:center;">' +
              '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-bottom:12px;">' +
                '<rect x="12" y="2" width="24" height="44" rx="4" stroke="#FBC02D" stroke-width="2" fill="none"/>' +
                '<rect x="14" y="6" width="20" height="32" fill="rgba(251,192,45,.1)"/>' +
                '<circle cx="24" cy="42" r="2" fill="#FBC02D"/>' +
                '<rect x="16" y="10" width="16" height="8" rx="3" fill="#FBC02D"/>' +
                '<text x="24" y="16" text-anchor="middle" fill="#2F2F2F" font-size="6" font-weight="bold" font-family="DM Sans">New!</text>' +
              '</svg>' +
              '<div style="color:#FBC02D;font-weight:700;font-size:14px;">SMS</div>' +
              '<div style="color:rgba(255,255,255,.4);font-size:11px;margin-top:6px;">Avg. read time: 3 minutes</div>' +
              '<div style="background:rgba(251,192,45,.15);border-radius:8px;padding:8px;margin-top:12px;">' +
                '<div style="font-size:20px;font-weight:700;color:#FBC02D;">98%</div>' +
                '<div style="font-size:10px;color:rgba(255,255,255,.4);">open rate</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
      ctaSection.insertAdjacentHTML('beforebegin', problemHTML);
    }

    // --- CORE CONCEPT SECTION ---
    if (!document.querySelector('.sms-core-concept')) {
      var coreHTML = '<section class="sms-core-concept" style="padding:96px 48px;max-width:1200px;margin:0 auto">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center">' +
          '<div>' +
            '<p style="font-size:13px;font-weight:600;color:#F47C2C;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px">Same Model, Different Channel</p>' +
            '<h2 style="font-size:36px;font-weight:700;color:#2F2F2F;line-height:1.15;letter-spacing:-0.01em;margin-bottom:24px">One question. One text. One signal captured.</h2>' +
            '<p style="font-size:17px;color:#6E6E6E;line-height:1.7;margin-bottom:24px">PropFuel SMS isn\u2019t a blast messaging tool. It\u2019s the same single-question engagement model that drives 10-15% response rates via email \u2014 adapted for text.</p>' +
            '<p style="font-size:17px;color:#6E6E6E;line-height:1.7;margin-bottom:24px">A member gets a text with one question. They tap a response. That response <strong style="color:#2F2F2F;font-weight:600">updates their profile, triggers the next step in their journey,</strong> and gives your team a data point you never had before.</p>' +
            '<p style="font-size:17px;color:#6E6E6E;line-height:1.7;margin-bottom:24px">The difference is speed and reach. Text messages get read within minutes, not hours. They reach members who are email-dark. And they work in moments where email simply can\u2019t.</p>' +
            '<p style="font-size:17px;color:#6E6E6E;line-height:1.7"><strong style="color:#2F2F2F;font-weight:600">SMS doesn\u2019t replace email. It completes the picture.</strong></p>' +
          '</div>' +
          '<div style="max-width:280px;margin:0 auto;">' +
            '<div style="max-width:240px;margin:0 auto;font-family:\'DM Sans\',sans-serif;">' +
              '<div style="background:#2F2F2F;border-radius:28px;padding:10px;box-shadow:0 8px 30px rgba(0,0,0,.15);">' +
                '<div style="width:70px;height:5px;background:#1a1a1a;border-radius:3px;margin:0 auto 6px;"></div>' +
                '<div style="background:#fff;border-radius:20px;overflow:hidden;">' +
                  '<div style="padding:10px 14px;border-bottom:1px solid #EBE6DA;display:flex;align-items:center;gap:8px;">' +
                    '<div style="width:26px;height:26px;border-radius:50%;background:#FBC02D;display:flex;align-items:center;justify-content:center;">' +
                      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
                    '</div>' +
                    '<span style="font-size:12px;font-weight:700;color:#2F2F2F;">PropFuel</span>' +
                  '</div>' +
                  '<div style="padding:14px 12px;background:#fafafa;">' +
                    '<div style="background:#EBE6DA;border-radius:14px 14px 14px 4px;padding:10px 12px;margin-bottom:12px;">' +
                      '<p style="margin:0;font-size:11px;color:#2F2F2F;line-height:1.4;">How was your session with Dr. Williams today?</p>' +
                    '</div>' +
                    '<div style="display:flex;flex-direction:column;gap:6px;">' +
                      '<div style="background:#FBC02D;padding:10px;border-radius:12px 12px 4px 12px;text-align:center;font-size:11px;font-weight:600;color:#2F2F2F;">Loved it</div>' +
                      '<div style="background:#F47C2C;padding:10px;border-radius:12px 12px 4px 12px;text-align:center;font-size:11px;font-weight:600;color:#fff;">It was okay</div>' +
                      '<div style="background:#EBE6DA;padding:10px;border-radius:12px 12px 4px 12px;text-align:center;font-size:11px;font-weight:600;color:#2F2F2F;border:1px solid #d6d0c4;">Not for me</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
      var problemBand = document.querySelector('.sms-problem-band');
      if (problemBand) {
        problemBand.insertAdjacentHTML('afterend', coreHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', coreHTML);
      }
    }

    // --- EVENT-DAY TIMELINE ---
    if (!document.querySelector('.sms-timeline')) {
      var timelineData = [
        { time: 'Pre-Event', title: 'Collect Opt-Ins', desc: 'During registration, offer SMS updates for day-of logistics. Ask which sessions they\u2019re most excited about. No separate sign-up form.' },
        { time: 'Morning', title: 'Session Reminders', desc: 'Send reminders 15 minutes before sessions start. Members know exactly where to go and when \u2014 right on their phone.' },
        { time: 'Midday', title: 'Networking Nudges', desc: 'Push attendees toward networking opportunities, sponsor booths, and hallway conversations they\u2019d otherwise miss.' },
        { time: 'Afternoon', title: '1:1 Texting', desc: 'Staff can text individual attendees directly through PropFuel. No personal phone numbers needed. Real-time help when it matters.' },
        { time: 'Post-Event', title: 'NPS & Feedback', desc: 'Quick NPS check while the experience is fresh. Promoters get a testimonial request. Detractors trigger a staff alert.' }
      ];
      var timelineHTML = '<section class="sms-timeline" style="padding:96px 48px;max-width:1200px;margin:0 auto">' +
        '<p style="font-size:13px;font-weight:600;color:#F47C2C;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px">Event Day</p>' +
        '<h2 style="font-size:36px;font-weight:700;color:#2F2F2F;line-height:1.15;letter-spacing:-0.01em;margin-bottom:56px;max-width:600px">What a connected conference day looks like.</h2>' +
        '<div style="position:relative;overflow-x:auto;padding-bottom:24px;">' +
          '<div style="position:relative;display:flex;gap:0;min-width:900px;">' +
            '<div style="position:absolute;top:24px;left:0;right:0;height:4px;background:linear-gradient(to right,#FBC02D,#F9A825,#F47C2C,#F05A28,#F47C2C);border-radius:2px;z-index:0;"></div>';
      timelineData.forEach(function(item) {
        timelineHTML += '<div style="flex:1;text-align:center;position:relative;z-index:1;padding:0 8px;">' +
          '<div style="font-size:12px;font-weight:700;color:#F47C2C;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;">' + item.time + '</div>' +
          '<div style="width:16px;height:16px;border-radius:50%;background:#F6F2E8;border:3px solid #F47C2C;margin:16px auto 0;position:relative;z-index:2;"></div>' +
          '<div style="background:#F6F2E8;border-radius:20px;padding:24px 20px;margin-top:20px;box-shadow:0 8px 40px rgba(120,110,95,0.10);position:relative;overflow:hidden;">' +
            '<h3 style="font-size:16px;font-weight:600;color:#2F2F2F;margin-bottom:8px;line-height:1.3;">' + item.title + '</h3>' +
            '<p style="font-size:13px;color:#6E6E6E;line-height:1.6;">' + item.desc + '</p>' +
          '</div>' +
        '</div>';
      });
      timelineHTML += '</div></div></section>';
      var coreConcept = document.querySelector('.sms-core-concept');
      if (coreConcept) {
        coreConcept.insertAdjacentHTML('afterend', timelineHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', timelineHTML);
      }
    }

    // --- 3-CHANNEL SYSTEM ---
    if (!document.querySelector('.sms-channel-system')) {
      var channelHTML = '<section class="sms-channel-system" style="background:#EAE4D8;padding:96px 48px;position:relative;overflow:hidden">' +
        '<div style="max-width:1000px;margin:0 auto;text-align:center;">' +
          '<p style="font-size:13px;font-weight:600;color:#F47C2C;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px">The System</p>' +
          '<h2 style="font-size:36px;font-weight:700;color:#2F2F2F;line-height:1.15;letter-spacing:-0.01em;margin-bottom:56px">Three channels. One member profile. One insight.</h2>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:40px;">' +
            '<div style="background:#F6F2E8;border-radius:20px;padding:36px 24px;text-align:center;position:relative;overflow:hidden;box-shadow:0 8px 40px rgba(120,110,95,0.10);">' +
              '<div style="width:56px;height:56px;border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#F47C2C;background:rgba(251,192,45,0.12);">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
              '</div>' +
              '<h4 style="font-size:18px;font-weight:600;color:#2F2F2F;margin-bottom:8px;">Email</h4>' +
              '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;">Primary channel for lifecycle check-ins, onboarding journeys, and renewal campaigns. 10-15% response rates.</p>' +
            '</div>' +
            '<div style="background:#F6F2E8;border-radius:20px;padding:36px 24px;text-align:center;position:relative;overflow:hidden;box-shadow:0 8px 40px rgba(120,110,95,0.10);">' +
              '<div style="width:56px;height:56px;border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#F47C2C;background:rgba(249,168,37,0.12);">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
              '</div>' +
              '<h4 style="font-size:18px;font-weight:600;color:#2F2F2F;margin-bottom:8px;">Website</h4>' +
              '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;">Captures intent from anonymous visitors and known members browsing your site. 7-27% engagement rates.</p>' +
            '</div>' +
            '<div style="background:#F6F2E8;border-radius:20px;padding:36px 24px;text-align:center;position:relative;overflow:hidden;box-shadow:0 8px 40px rgba(120,110,95,0.10);">' +
              '<div style="width:56px;height:56px;border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#F47C2C;background:rgba(244,124,44,0.12);">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
              '</div>' +
              '<h4 style="font-size:18px;font-weight:600;color:#2F2F2F;margin-bottom:8px;">SMS</h4>' +
              '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;">Reaches email-dark members and powers event-day engagement. Instant read, instant response.</p>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:center;gap:8px;margin-bottom:24px;color:#F47C2C;">' +
            '<svg width="200" height="40" viewBox="0 0 200 40" fill="none">' +
              '<path d="M20 5 L100 35 L180 5" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" fill="none"/>' +
              '<polygon points="100,40 95,30 105,30" fill="currentColor"/>' +
            '</svg>' +
          '</div>' +
          '<div style="background:#F6F2E8;border-radius:16px;padding:24px 40px;box-shadow:0 8px 40px rgba(120,110,95,0.10);border-top:4px solid #F9A825;">' +
            '<p style="font-size:16px;font-weight:600;color:#2F2F2F;line-height:1.5;">All channels <span style="color:#F47C2C;">\u2192</span> One member profile <span style="color:#F47C2C;">\u2192</span> One insight <span style="color:#F47C2C;">\u2192</span> One next step</p>' +
          '</div>' +
        '</div>' +
      '</section>';
      var timeline = document.querySelector('.sms-timeline');
      if (timeline) {
        timeline.insertAdjacentHTML('afterend', channelHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', channelHTML);
      }
    }

    // --- CAPABILITIES GRID ---
    if (!document.querySelector('.sms-capabilities')) {
      var capItems = [
        { title: 'Text-Based Check-Ins', desc: 'The same conversational model that gets 10-15% response rates, now in their pocket. One question, one tap.' },
        { title: 'Opt-In Management', desc: 'Built-in compliance with messaging regulations. No legal headaches. Opt-in happens inside campaigns members are already engaging with.' },
        { title: 'Phone Number Validation', desc: 'Catches bad numbers, landlines, and formatting errors before you waste credits or damage delivery rates.' },
        { title: 'Conditional Logic', desc: 'If/then rules work the same as email. Different responses trigger different next steps, tags, and staff alerts.' },
        { title: 'Cross-Channel Tracking', desc: 'SMS, email, and website activity all flow into one member profile. Your team sees the complete picture.' },
        { title: '1:1 SMS Conversations', desc: 'Staff can text individual members directly through PropFuel. No personal phone numbers needed. Especially useful at events.' }
      ];
      var capHTML = '<section class="sms-capabilities" style="padding:96px 48px;max-width:1200px;margin:0 auto">' +
        '<p style="font-size:13px;font-weight:600;color:#F47C2C;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px">Capabilities</p>' +
        '<h2 style="font-size:36px;font-weight:700;color:#2F2F2F;line-height:1.15;letter-spacing:-0.01em;margin-bottom:56px;max-width:500px">SMS that listens, not just sends.</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">';
      capItems.forEach(function(item) {
        capHTML += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 28px;position:relative;overflow:hidden;box-shadow:0 8px 40px rgba(120,110,95,0.10);">' +
          '<div style="width:40px;height:3px;border-radius:2px;background:#F9A825;margin-bottom:24px;"></div>' +
          '<h3 style="font-size:18px;font-weight:600;color:#2F2F2F;margin-bottom:10px;line-height:1.3;">' + item.title + '</h3>' +
          '<p style="font-size:15px;color:#6E6E6E;line-height:1.6;">' + item.desc + '</p>' +
        '</div>';
      });
      capHTML += '</div></section>';
      var channelSystem = document.querySelector('.sms-channel-system');
      if (channelSystem) {
        channelSystem.insertAdjacentHTML('afterend', capHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', capHTML);
      }
    }

    // --- STATS BAND ---
    if (!document.querySelector('.sms-stats-band')) {
      var statsHTML = '<section class="sms-stats-band" style="background:#1A1713;padding:96px 48px;position:relative;overflow:hidden">' +
        '<div style="max-width:1100px;margin:0 auto;text-align:center;">' +
          '<p style="font-size:13px;font-weight:600;color:#F9A825;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px">Results</p>' +
          '<h2 style="font-size:36px;font-weight:700;color:#EDE8DF;line-height:1.15;letter-spacing:-0.01em;margin-bottom:64px">When you meet members where they are, they respond.</h2>' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;">' +
            '<div style="text-align:center;">' +
              '<p style="font-size:56px;font-weight:800;line-height:1;letter-spacing:-0.03em;margin-bottom:12px;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">$315K</p>' +
              '<p style="font-size:13px;font-weight:600;color:#EDE8DF;letter-spacing:0.02em;margin-bottom:8px;">VECCS</p>' +
              '<p style="font-size:14px;font-weight:400;color:#8C8479;line-height:1.55;max-width:220px;margin:0 auto;">Revenue from event engagement campaign \u2014 SMS played a key role in day-of engagement.</p>' +
            '</div>' +
            '<div style="text-align:center;">' +
              '<p style="font-size:56px;font-weight:800;line-height:1;letter-spacing:-0.03em;margin-bottom:12px;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">830%</p>' +
              '<p style="font-size:13px;font-weight:600;color:#EDE8DF;letter-spacing:0.02em;margin-bottom:8px;">G2 Review</p>' +
              '<p style="font-size:14px;font-weight:400;color:#8C8479;line-height:1.55;max-width:220px;margin:0 auto;">Increase in webinar registrations using multi-channel engagement.</p>' +
            '</div>' +
            '<div style="text-align:center;">' +
              '<p style="font-size:56px;font-weight:800;line-height:1;letter-spacing:-0.03em;margin-bottom:12px;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">72%</p>' +
              '<p style="font-size:13px;font-weight:600;color:#EDE8DF;letter-spacing:0.02em;margin-bottom:8px;">All Clients</p>' +
              '<p style="font-size:14px;font-weight:400;color:#8C8479;line-height:1.55;max-width:220px;margin:0 auto;">Of declining organizations reversed course with PropFuel\u2019s multi-channel approach.</p>' +
            '</div>' +
            '<div style="text-align:center;">' +
              '<p style="font-size:56px;font-weight:800;line-height:1;letter-spacing:-0.03em;margin-bottom:12px;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">10-15%</p>' +
              '<p style="font-size:13px;font-weight:600;color:#EDE8DF;letter-spacing:0.02em;margin-bottom:8px;">Response Rates</p>' +
              '<p style="font-size:14px;font-weight:400;color:#8C8479;line-height:1.55;max-width:220px;margin:0 auto;">Across PropFuel\u2019s engagement channels \u2014 5-6x the industry average.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
      var capabilities = document.querySelector('.sms-capabilities');
      if (capabilities) {
        capabilities.insertAdjacentHTML('afterend', statsHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', statsHTML);
      }
    }

    // --- FAQ SECTION ---
    if (!document.querySelector('.sms-faq')) {
      var faqItems = [
        { q: 'How do members opt in to SMS?', a: 'Opt-in happens inside your existing PropFuel campaigns. During onboarding, event registration, or any check-in, you can include a question asking if the member would like to receive text messages. PropFuel manages the opt-in record and ensures compliance with messaging regulations.' },
        { q: 'Does SMS work with PropFuel\u2019s conditional logic?', a: 'Yes. SMS campaigns use the exact same if/then logic as email campaigns. A member who responds \u201Cnot sure\u201D gets a different follow-up than a member who responds \u201Cyes.\u201D Branching, tagging, staff alerts, and AMS write-backs all work the same way.' },
        { q: 'Can staff have 1:1 text conversations with members?', a: 'Yes. PropFuel supports direct 1:1 SMS between staff and individual members. Especially useful during events when attendees need real-time help, or when a member\u2019s response warrants a personal follow-up.' },
        { q: 'Do SMS responses sync back to our AMS?', a: 'Yes. SMS responses are treated the same as email or website responses \u2014 they update the member\u2019s profile in PropFuel and can be written back to your AMS automatically. Every text response is a data point.' },
        { q: 'Is SMS available in the US and Canada?', a: 'Yes. PropFuel SMS supports two-way text messaging in the United States and Canada. SMS is available as an add-on (~$4,000-$5,000/year for 50,000 credits).' }
      ];
      var faqHTML = '<section class="sms-faq" style="background:#F6F2E8;padding:96px 48px">' +
        '<div style="max-width:760px;margin:0 auto">' +
          '<p style="font-size:13px;font-weight:600;color:#F47C2C;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px">FAQ</p>' +
          '<h2 style="font-size:36px;font-weight:700;color:#2F2F2F;line-height:1.15;letter-spacing:-0.01em;margin-bottom:48px">Common questions about PropFuel SMS.</h2>';
      faqItems.forEach(function(item, idx) {
        faqHTML += '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0;' + (idx === 0 ? 'border-top:1px solid #E3DDD2;' : '') + '">' +
          '<button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:600 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0;gap:16px">' +
            item.q +
            ' <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;transition:transform .3s ease"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '</button>' +
          '<div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease">' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.7;padding-top:16px;text-align:left">' + item.a + '</p>' +
          '</div>' +
        '</div>';
      });
      faqHTML += '</div></section>';
      var statsBand = document.querySelector('.sms-stats-band');
      if (statsBand) {
        statsBand.insertAdjacentHTML('afterend', faqHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', faqHTML);
      }
    }

    // ═══════════════════════════════════════
    // SECTION 4: FIX CTA
    // ═══════════════════════════════════════
    var ctaHeading = document.querySelector('.pf-cta-heading');
    if (ctaHeading) {
      ctaHeading.innerHTML = 'Text them.<br>They\u2019ll text back.';
    }
    var ctaSub = document.querySelector('.pf-cta-sub');
    if (ctaSub) {
      ctaSub.textContent = 'Your members are already on their phones. PropFuel SMS puts your most important questions right where they\u2019ll see them.';
    }

    // ═══════════════════════════════════════
    // SECTION 5: HIDE EXISTING WEBFLOW FEATURE SECTIONS
    // ═══════════════════════════════════════
    document.querySelectorAll('.pf-section').forEach(function(s) { s.style.display = 'none'; });
  }

  // ─────────────────────────────────────────
  // FIX EMAIL PAGE
  // ─────────────────────────────────────────
  function fixEmailPage() {
    if (window.location.pathname.indexOf('platform/email') === -1) return;

    // ═══════════════════════════════════════
    // SECTION 1: FIX HERO (Email Channel)
    // ═══════════════════════════════════════

    // Fix hero label
    var heroLabel = document.querySelector('.pf-page-hero-label');
    if (heroLabel) {
      heroLabel.textContent = 'Email';
    } else {
      var heroTitle = document.querySelector('.pf-page-hero-title');
      if (heroTitle) {
        var parent = heroTitle.parentElement;
        if (!parent.querySelector('.pf-hero-label-injected')) {
          var label = document.createElement('p');
          label.className = 'pf-hero-label-injected fade-up';
          label.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;' +
            'background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;' +
            'font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;' +
            'box-shadow:0 2px 8px rgba(120,110,95,0.06)';
          label.textContent = 'Email';
          parent.insertBefore(label, heroTitle);
        }
      }
    }

    // Fix hero heading
    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) {
      heroHeading.textContent = 'Not another email tool. A listening tool that happens to use email.';
    }

    // Fix hero subtitle
    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) {
      heroSub.textContent = 'PropFuel emails aren\u2019t newsletters. They\u2019re single-question check-ins that members actually respond to \u2014 because responding takes one click.';
    }

    // Inject hero buttons if not present
    if (heroHeading) {
      var heroParent = heroHeading.parentElement;
      if (!heroParent.querySelector('.pf-hero-btns-injected')) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'pf-hero-btns-injected fade-up';
        btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';
        btnWrap.innerHTML =
          '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">' +
            'Send Emails Members Answer <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '<a href="/book-a-demo" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">' +
            'Get Started</a>';
        var sub = heroParent.querySelector('.pf-page-hero-sub');
        if (sub) {
          sub.parentNode.insertBefore(btnWrap, sub.nextSibling);
        } else {
          heroParent.appendChild(btnWrap);
        }
      }
    }

    // ═══════════════════════════════════════
    // SECTION 2: HERO EMAIL CHECK-IN MOCKUP
    // ═══════════════════════════════════════
    var heroVisual = document.querySelector('.em-hero-mockup');
    if (!heroVisual) {
      var btns = document.querySelector('.pf-hero-btns-injected');
      var heroArea = btns ? btns.parentElement : (heroHeading ? heroHeading.parentElement : null);
      if (heroArea) {
        heroVisual = document.createElement('div');
        heroVisual.className = 'em-hero-mockup';
        heroVisual.style.cssText = 'margin:48px auto 0;max-width:960px;padding:0 24px';
        heroArea.appendChild(heroVisual);
      }
    }
    if (heroVisual && !heroVisual.querySelector('.em-email-checkin')) {
      var mockupWrap = document.createElement('div');
      mockupWrap.className = 'em-email-checkin';
      mockupWrap.innerHTML =
        '<div style="max-width:520px;margin:0 auto;font-family:\'DM Sans\',sans-serif;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.12);overflow:hidden;">' +
          '<div style="background:#2F2F2F;padding:14px 24px;display:flex;align-items:center;gap:10px;">' +
            '<div style="width:10px;height:10px;border-radius:50%;background:#ff5f56;"></div>' +
            '<div style="width:10px;height:10px;border-radius:50%;background:#ffbd2e;"></div>' +
            '<div style="width:10px;height:10px;border-radius:50%;background:#27c93f;"></div>' +
            '<span style="color:#aaa;font-size:12px;margin-left:12px;">inbox \u2014 membership@yourorg.org</span>' +
          '</div>' +
          '<div style="padding:32px 28px;">' +
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
              '<div style="width:40px;height:40px;border-radius:50%;background:#FBC02D;display:flex;align-items:center;justify-content:center;">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>' +
              '</div>' +
              '<div>' +
                '<div style="font-weight:700;color:#2F2F2F;font-size:14px;">Your Association</div>' +
                '<div style="color:#999;font-size:12px;">Quick check-in \u2014 1 question</div>' +
              '</div>' +
            '</div>' +
            '<h3 style="color:#2F2F2F;font-size:20px;margin:0 0 8px;font-weight:700;">What\u2019s your #1 priority this year?</h3>' +
            '<p style="color:#666;font-size:14px;margin:0 0 24px;line-height:1.5;">We want to make sure we\u2019re supporting what matters most to you. Tap one:</p>' +
            '<div style="display:flex;flex-direction:column;gap:10px;">' +
              '<div style="background:#FBC02D;color:#2F2F2F;padding:14px 20px;border-radius:10px;font-weight:600;font-size:15px;text-align:center;cursor:pointer;">Professional Development</div>' +
              '<div style="background:#F47C2C;color:#fff;padding:14px 20px;border-radius:10px;font-weight:600;font-size:15px;text-align:center;cursor:pointer;">Networking Opportunities</div>' +
              '<div style="background:#EBE6DA;color:#2F2F2F;padding:14px 20px;border-radius:10px;font-weight:600;font-size:15px;text-align:center;border:2px solid #d6d0c4;">Industry Advocacy</div>' +
            '</div>' +
            '<p style="color:#bbb;font-size:11px;text-align:center;margin-top:18px;">Powered by PropFuel</p>' +
          '</div>' +
        '</div>';
      heroVisual.innerHTML = '';
      heroVisual.appendChild(mockupWrap);
      heroVisual.style.background = '#EBE6DA';
      heroVisual.style.borderRadius = '20px';
      heroVisual.style.padding = '28px';
    }

    // ═══════════════════════════════════════
    // SECTION 3: INJECT ALL MISSING SECTIONS
    // Find CTA as anchor; inject before it
    // ═══════════════════════════════════════
    var ctaSection = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (!ctaSection) return;

    // --- PROBLEM BAND (dark) ---
    if (!document.querySelector('.em-problem-band')) {
      var problemHTML = '<section class="em-problem-band" style="background:#1A1713;padding:96px 48px">' +
        '<div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center">' +
          '<div>' +
            '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The Problem</p>' +
            '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:32px">Your email tool sends. PropFuel listens.</h2>' +
            '<p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">Email marketing for associations was designed for broadcasting. You write a newsletter, send it to 10,000 members, and measure success by how many people opened it. Not how many people told you what they need.</p>' +
            '<p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px"><strong style="color:#EDE8DF">Traditional email marketing:</strong> Send content, hope someone opens it, measure open rates.</p>' +
            '<p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px"><strong style="color:#EDE8DF">PropFuel email:</strong> Ask a question, member responds with one click, their response updates their profile and triggers the next step in their journey.</p>' +
            '<p style="font-size:17px;color:#8C8479;line-height:1.65">Every PropFuel email is a <strong style="color:#EDE8DF">database update waiting to happen.</strong></p>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:24px;font-family:\'DM Sans\',sans-serif;justify-content:center;flex-wrap:wrap;">' +
            '<div style="text-align:center;padding:28px;background:rgba(255,255,255,.08);border-radius:16px;border:1px solid rgba(255,255,255,.1);min-width:180px;">' +
              '<svg width="80" height="80" viewBox="0 0 80 80" fill="none">' +
                '<circle cx="40" cy="40" r="38" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)" stroke-width="1.5"/>' +
                '<path d="M22 40 L38 28 L38 52 Z" fill="#F47C2C" opacity=".8"/>' +
                '<rect x="38" y="34" width="20" height="12" rx="2" fill="#F47C2C" opacity=".8"/>' +
                '<line x1="62" y1="32" x2="70" y2="28" stroke="#F47C2C" stroke-width="2" opacity=".5"/>' +
                '<line x1="62" y1="40" x2="72" y2="40" stroke="#F47C2C" stroke-width="2" opacity=".5"/>' +
                '<line x1="62" y1="48" x2="70" y2="52" stroke="#F47C2C" stroke-width="2" opacity=".5"/>' +
              '</svg>' +
              '<div style="color:#F47C2C;font-weight:700;font-size:15px;margin-top:12px;">Broadcasting</div>' +
              '<div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:4px;">One-way. No signal back.</div>' +
            '</div>' +
            '<div style="color:rgba(255,255,255,.3);font-size:28px;font-weight:700;">vs</div>' +
            '<div style="text-align:center;padding:28px;background:rgba(251,192,45,.08);border-radius:16px;border:2px solid rgba(251,192,45,.3);min-width:180px;">' +
              '<svg width="80" height="80" viewBox="0 0 80 80" fill="none">' +
                '<circle cx="40" cy="40" r="38" fill="rgba(251,192,45,.08)" stroke="rgba(251,192,45,.3)" stroke-width="1.5"/>' +
                '<rect x="32" y="18" width="16" height="28" rx="8" fill="#FBC02D"/>' +
                '<path d="M26 40 Q26 56 40 56 Q54 56 54 40" stroke="#FBC02D" stroke-width="2.5" fill="none"/>' +
                '<line x1="40" y1="56" x2="40" y2="64" stroke="#FBC02D" stroke-width="2.5"/>' +
                '<line x1="32" y1="64" x2="48" y2="64" stroke="#FBC02D" stroke-width="2.5" stroke-linecap="round"/>' +
              '</svg>' +
              '<div style="color:#FBC02D;font-weight:700;font-size:15px;margin-top:12px;">Listening</div>' +
              '<div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:4px;">Two-way. Every response counts.</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
      ctaSection.insertAdjacentHTML('beforebegin', problemHTML);
    }

    // --- 8-SECOND EXPERIENCE ---
    if (!document.querySelector('.em-eight-second')) {
      var eightSecHTML = '<section class="em-eight-second" style="padding:96px 48px">' +
        '<div style="max-width:1100px;margin:0 auto;text-align:center">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">How It Works</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">What happens in 8 seconds.</h2>' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px">' +
            '<div style="text-align:center">' +
              '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:15px;font-weight:800;color:#fff;">1</div>' +
              '<div style="width:160px;margin:0 auto 20px;background:#2F2F2F;border-radius:20px;padding:8px;box-shadow:0 4px 20px rgba(0,0,0,.15);">' +
                '<div style="background:#fff;border-radius:14px;overflow:hidden;">' +
                  '<div style="background:#F4F1EA;padding:8px 12px;display:flex;align-items:center;gap:6px;">' +
                    '<div style="font-size:8px;color:#999;">9:41 AM</div>' +
                    '<div style="flex:1;"></div>' +
                    '<svg width="12" height="12" viewBox="0 0 24 24" fill="#999"><rect x="1" y="14" width="4" height="8" rx="1"/><rect x="7" y="10" width="4" height="12" rx="1"/><rect x="13" y="6" width="4" height="16" rx="1"/><rect x="19" y="2" width="4" height="20" rx="1"/></svg>' +
                  '</div>' +
                  '<div style="padding:12px 10px;">' +
                    '<div style="background:#FBC02D;border-radius:8px;padding:10px;margin-bottom:6px;">' +
                      '<div style="font-size:8px;font-weight:700;color:#2F2F2F;font-family:\'DM Sans\',sans-serif;">Your Association</div>' +
                      '<div style="font-size:7px;color:#2F2F2F;opacity:.7;margin-top:2px;">Quick check-in \u2014 1 question</div>' +
                    '</div>' +
                    '<div style="background:#eee;border-radius:6px;height:8px;width:80%;margin:4px 0;"></div>' +
                    '<div style="background:#eee;border-radius:6px;height:8px;width:60%;margin:4px 0;"></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Email Arrives</h3>' +
              '<p style="font-size:14px;color:#6E6E6E;line-height:1.5">From your domain, your brand. One question inside.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:15px;font-weight:800;color:#fff;">2</div>' +
              '<div style="width:160px;margin:0 auto 20px;background:#2F2F2F;border-radius:20px;padding:8px;box-shadow:0 4px 20px rgba(0,0,0,.15);">' +
                '<div style="background:#fff;border-radius:14px;overflow:hidden;padding:12px 10px;">' +
                  '<div style="font-size:9px;font-weight:700;color:#2F2F2F;font-family:\'DM Sans\',sans-serif;margin-bottom:8px;">What matters most?</div>' +
                  '<div style="background:#FBC02D;border-radius:6px;padding:8px;text-align:center;font-size:8px;font-weight:600;color:#2F2F2F;font-family:\'DM Sans\',sans-serif;margin-bottom:5px;position:relative;box-shadow:0 0 0 3px rgba(251,192,45,.3);">' +
                    'Professional Dev' +
                  '</div>' +
                  '<div style="background:#EBE6DA;border-radius:6px;padding:8px;text-align:center;font-size:8px;color:#2F2F2F;font-family:\'DM Sans\',sans-serif;margin-bottom:5px;">Networking</div>' +
                  '<div style="background:#EBE6DA;border-radius:6px;padding:8px;text-align:center;font-size:8px;color:#2F2F2F;font-family:\'DM Sans\',sans-serif;">Advocacy</div>' +
                '</div>' +
              '</div>' +
              '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:8px">One Click</h3>' +
              '<p style="font-size:14px;color:#6E6E6E;line-height:1.5">Member taps a response. Done. No login, no form.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:15px;font-weight:800;color:#fff;">3</div>' +
              '<div style="width:160px;margin:0 auto 20px;font-family:\'DM Sans\',sans-serif;">' +
                '<div style="background:#fff;border-radius:14px;padding:12px;box-shadow:0 4px 16px rgba(0,0,0,.1);">' +
                  '<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">' +
                    '<div style="width:24px;height:24px;border-radius:50%;background:#EBE6DA;display:flex;align-items:center;justify-content:center;">' +
                      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0114 0v2"/></svg>' +
                    '</div>' +
                    '<div style="font-size:8px;font-weight:700;color:#2F2F2F;">Jane M.</div>' +
                  '</div>' +
                  '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">' +
                    '<span style="background:#FBC02D;color:#2F2F2F;font-size:7px;padding:3px 6px;border-radius:4px;font-weight:600;">Prof Dev</span>' +
                    '<span style="background:#F47C2C;color:#fff;font-size:7px;padding:3px 6px;border-radius:4px;font-weight:600;">New Tag</span>' +
                  '</div>' +
                  '<div style="border-top:1px solid #EBE6DA;padding-top:8px;">' +
                    '<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">' +
                      '<svg width="10" height="10" viewBox="0 0 24 24" fill="#27c93f" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' +
                      '<span style="font-size:7px;color:#666;">Profile updated</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">' +
                      '<svg width="10" height="10" viewBox="0 0 24 24" fill="#27c93f" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' +
                      '<span style="font-size:7px;color:#666;">Follow-up sent</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:4px;">' +
                      '<svg width="10" height="10" viewBox="0 0 24 24" fill="#27c93f" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' +
                      '<span style="font-size:7px;color:#666;">Next check-in queued</span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Everything Triggers</h3>' +
              '<p style="font-size:14px;color:#6E6E6E;line-height:1.5">Profile updates. Tag applied. Follow-up sent. Next check-in queued.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:15px;font-weight:800;color:#fff;">4</div>' +
              '<div style="width:160px;margin:0 auto 20px;font-family:\'DM Sans\',sans-serif;">' +
                '<div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1);">' +
                  '<div style="padding:10px 12px;border-bottom:1px solid #EBE6DA;">' +
                    '<div style="font-size:7px;color:#999;margin-bottom:2px;">Original</div>' +
                    '<div style="font-size:8px;color:#2F2F2F;font-weight:600;text-decoration:line-through;opacity:.5;">Quick question about your goals</div>' +
                  '</div>' +
                  '<div style="padding:10px 12px;background:rgba(251,192,45,.06);">' +
                    '<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">' +
                      '<svg width="8" height="8" viewBox="0 0 24 24" fill="#F47C2C" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>' +
                      '<div style="font-size:7px;color:#F47C2C;font-weight:600;">Smart Reminder</div>' +
                    '</div>' +
                    '<div style="font-size:8px;color:#2F2F2F;font-weight:700;">We still want to hear from you</div>' +
                    '<div style="font-size:7px;color:#666;margin-top:4px;">Different subject line. Same question. Auto-sent to non-responders.</div>' +
                  '</div>' +
                  '<div style="padding:8px 12px;display:flex;align-items:center;gap:4px;">' +
                    '<div style="width:6px;height:6px;border-radius:50%;background:#FBC02D;"></div>' +
                    '<span style="font-size:7px;color:#999;">Sent automatically</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Non-Responders</h3>' +
              '<p style="font-size:14px;color:#6E6E6E;line-height:1.5">Smart reminder with different subject line. Automatic.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
      var problemBand = document.querySelector('.em-problem-band');
      if (problemBand) {
        problemBand.insertAdjacentHTML('afterend', eightSecHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', eightSecHTML);
      }
    }

    // --- COMPARISON: SEND VS LISTEN ---
    if (!document.querySelector('.em-comparison')) {
      var compHTML = '<section class="em-comparison" style="padding:96px 48px;background:#EBE6DA">' +
        '<div style="max-width:1000px;margin:0 auto">' +
          '<div style="text-align:center;margin-bottom:56px">' +
            '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Send vs Listen</p>' +
            '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Two different jobs. One inbox.</h2>' +
          '</div>' +
          '<div style="background:#F6F2E8;border-radius:16px;overflow:hidden;margin-bottom:32px">' +
            '<div style="display:grid;grid-template-columns:200px 1fr 1fr;background:#2F2F2F;color:#fff;font-size:13px;font-weight:700;padding:16px 24px;">' +
              '<div></div><div style="text-align:center">Traditional Email Marketing</div><div style="text-align:center;color:#FBC02D">PropFuel Email</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:200px 1fr 1fr;padding:16px 24px;border-bottom:1px solid #E3DDD2;font-size:14px;align-items:center">' +
              '<div style="font-weight:700;color:#2F2F2F">Purpose</div>' +
              '<div style="color:#6E6E6E;text-align:center">Send newsletters, announcements, event promotions</div>' +
              '<div style="color:#2F2F2F;text-align:center">Ask questions, capture responses, learn what members need</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:200px 1fr 1fr;padding:16px 24px;border-bottom:1px solid #E3DDD2;font-size:14px;align-items:center">' +
              '<div style="font-weight:700;color:#2F2F2F">What Members Do</div>' +
              '<div style="color:#6E6E6E;text-align:center">Open (maybe). Click (maybe). Read (maybe).</div>' +
              '<div style="color:#2F2F2F;text-align:center">Respond. One tap. Their answer is captured and acted on.</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:200px 1fr 1fr;padding:16px 24px;border-bottom:1px solid #E3DDD2;font-size:14px;align-items:center">' +
              '<div style="font-weight:700;color:#2F2F2F">What You Get Back</div>' +
              '<div style="color:#6E6E6E;text-align:center">Open rates and click rates</div>' +
              '<div style="color:#2F2F2F;text-align:center">Actual member data: intent, preferences, satisfaction, hesitations</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:200px 1fr 1fr;padding:16px 24px;border-bottom:1px solid #E3DDD2;font-size:14px;align-items:center">' +
              '<div style="font-weight:700;color:#2F2F2F">Personalization</div>' +
              '<div style="color:#6E6E6E;text-align:center">Segment by demographics. Everyone in a segment gets the same thing.</div>' +
              '<div style="color:#2F2F2F;text-align:center">Branch by individual response. Segment by AI intelligence. Branch by individual response.</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:200px 1fr 1fr;padding:16px 24px;border-bottom:1px solid #E3DDD2;font-size:14px;align-items:center">' +
              '<div style="font-weight:700;color:#2F2F2F">Data Impact</div>' +
              '<div style="color:#6E6E6E;text-align:center">Analytics stay in the email tool</div>' +
              '<div style="color:#2F2F2F;text-align:center">Every response writes back to your AMS automatically. No CSV exports.</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:200px 1fr 1fr;padding:16px 24px;border-bottom:1px solid #E3DDD2;font-size:14px;align-items:center">' +
              '<div style="font-weight:700;color:#2F2F2F">Deliverability</div>' +
              '<div style="color:#6E6E6E;text-align:center">Varies. Often below 90% for association email tools.</div>' +
              '<div style="color:#2F2F2F;text-align:center">97-99.2%. White-labeled from your domain. Private IPs available.</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:200px 1fr 1fr;padding:16px 24px;font-size:14px;align-items:center">' +
              '<div style="font-weight:700;color:#2F2F2F">Member Experience</div>' +
              '<div style="color:#6E6E6E;text-align:center">Another newsletter in an inbox full of newsletters</div>' +
              '<div style="color:#2F2F2F;text-align:center">A personal check-in that took 8 seconds to respond to</div>' +
            '</div>' +
          '</div>' +
          '<p style="text-align:center;font-size:16px;color:#6E6E6E;line-height:1.6"><strong style="color:#2F2F2F">Your email marketing tool handles the megaphone.</strong> PropFuel handles the microphone.</p>' +
        '</div>' +
      '</section>';
      var eightSec = document.querySelector('.em-eight-second');
      if (eightSec) {
        eightSec.insertAdjacentHTML('afterend', compHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', compHTML);
      }
    }

    // --- CAPABILITIES GRID ---
    if (!document.querySelector('.em-capabilities')) {
      var capCards = [
        { title: 'Single Question Check-Ins', desc: 'The core interaction model. One question per email. Members actually respond because you\u2019re not asking them to commit 15 minutes to a survey.' },
        { title: 'Single-Click Responses', desc: 'Members tap an answer directly in the email. No login, no form, no friction. This is what drives 10-15% response rates.' },
        { title: 'White-Labeled Delivery', desc: 'Emails come from your domain with your branding. Members see their association, not a software vendor. Built on SendGrid and AWS with DKIM, SPF, and DMARC.' },
        { title: '97-99.2% Deliverability', desc: 'Your emails actually land. Private IP addresses available. PropFuel handles the technical infrastructure so you don\u2019t have to.' },
        { title: 'Smart Check-In Reminders', desc: 'Non-responders automatically get a follow-up with a different subject line on a configurable schedule. Significantly increases total response rates.' },
        { title: 'Mobile-Friendly Templates', desc: 'Your brand, your tone, responsive on every device. Control subject lines, body content, and footers with a drag-and-drop editor.' },
        { title: 'Custom Follow-Up Emails', desc: 'A member who says \u201CI\u2019m interested in leadership\u201D gets a follow-up about committee opportunities. The follow-up matches what they told you.' },
        { title: 'In-Platform Email Replies', desc: 'When a member writes back with a personal note, staff can reply without switching to Outlook or Gmail. The full thread is saved in the member\u2019s record.' }
      ];
      var capHTML = '<section class="em-capabilities" style="padding:96px 48px;max-width:1200px;margin:0 auto">' +
        '<div style="text-align:center;margin-bottom:56px">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Capabilities</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Everything you need to listen at scale.</h2>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px">';
      capCards.forEach(function(c) {
        capHTML += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden">' +
          '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div>' +
          '<h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">' + c.title + '</h4>' +
          '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">' + c.desc + '</p>' +
        '</div>';
      });
      capHTML += '</div></section>';
      var compSection = document.querySelector('.em-comparison');
      if (compSection) {
        compSection.insertAdjacentHTML('afterend', capHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', capHTML);
      }
    }

    // --- STATS BAND (dark) ---
    if (!document.querySelector('.em-stats-band')) {
      var statsHTML = '<section class="em-stats-band" style="background:#1A1713;padding:96px 48px">' +
        '<div style="max-width:1000px;margin:0 auto;text-align:center">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Results</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">The numbers speak louder than any newsletter.</h2>' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px">' +
            '<div style="text-align:center">' +
              '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">44%</p>' +
              '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">NACUBO</p>' +
              '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Response rate in 24 hours on a data capture campaign.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">95%</p>' +
              '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">AAMFT</p>' +
              '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">On-time renewals \u2014 up from 80.5%, plus 7% membership growth.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$65K</p>' +
              '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">WQA</p>' +
              '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Additional revenue from a 5% renewal rate increase.</p>' +
            '</div>' +
            '<div style="text-align:center">' +
              '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">107</p>' +
              '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">NAPNAP</p>' +
              '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">New members in 45 days, generating $21.4K in revenue.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
      var capSection2 = document.querySelector('.em-capabilities');
      if (capSection2) {
        capSection2.insertAdjacentHTML('afterend', statsHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', statsHTML);
      }
    }

    // --- TESTIMONIAL CAROUSEL ---
    if (!document.querySelector('.em-testimonials')) {
      var testimonials = [
        { quote: 'Our members DO respond well to these one question emails. I was a bit skeptical at first \u2014 the \u2018why do we need another tool\u2019 opinion. Turns out we did need a new tool.', cite: 'Andrea Ross, Director of Meetings, Membership & Marketing, The American Ceramic Society' },
        { quote: 'We paid for our whole year of PropFuel with our first email campaign.', cite: 'Molly Martin, Women in Aviation International' },
        { quote: 'So far the PropFuel response rate is more than double that of our traditional dues email click-through rate. We are thrilled with that!', cite: 'Jeanette Kebede, Director of Communications, Washington Society of CPAs' },
        { quote: 'I launched my campaign yesterday around 2 pm, and so far I\u2019m up to 44% response rate in a little over 24 hours. We love PropFuel!', cite: 'Amy Barbieri, Assistant Director of Membership, NACUBO' },
        { quote: 'More people have responded to our PropFuel emails than have ever even opened our standard marketing emails.', cite: 'Kara Potter, MSTA' },
        { quote: 'I\u2019m glad we pushed through with the PropFuel campaign instead of Mailchimp! Members DEFINITELY respond best to short and sweet.', cite: 'Jessica, ACGIH' },
        { quote: 'Pardot\u2019s great at marketing. PropFuel is great at listening. And I need both.', cite: 'Jaqueline Gloria, VP of Operations, OHI/ARVC' }
      ];
      var testHTML = '<section class="em-testimonials" style="padding:96px 48px;background:#EBE6DA">' +
        '<div style="max-width:800px;margin:0 auto;text-align:center;position:relative">' +
          '<div style="font-size:120px;font-weight:900;color:#E3DDD2;line-height:0.8;margin-bottom:24px">\u201C</div>' +
          '<div class="em-test-carousel">';
      testimonials.forEach(function(t, i) {
        testHTML += '<div class="em-test-slide" style="display:' + (i === 0 ? 'block' : 'none') + '">' +
          '<blockquote style="font-size:clamp(18px,2.5vw,24px);font-weight:500;color:#2F2F2F;line-height:1.5;font-style:italic;margin:0 0 24px">' + t.quote + '</blockquote>' +
          '<cite style="font-size:14px;font-weight:600;color:#6E6E6E;font-style:normal">' + t.cite + '</cite>' +
        '</div>';
      });
      testHTML += '</div>' +
          '<div class="em-test-dots" style="display:flex;justify-content:center;gap:8px;margin-top:32px">';
      testimonials.forEach(function(t, i) {
        testHTML += '<button class="em-test-dot" data-index="' + i + '" style="width:10px;height:10px;border-radius:50%;border:none;cursor:pointer;background:' + (i === 0 ? '#F47C2C' : '#E3DDD2') + ';transition:background .3s ease;padding:0"></button>';
      });
      testHTML += '</div></div></section>';
      var statsBandEl = document.querySelector('.em-stats-band');
      if (statsBandEl) {
        statsBandEl.insertAdjacentHTML('afterend', testHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', testHTML);
      }

      // Wire up testimonial carousel
      setTimeout(function() {
        var slides = document.querySelectorAll('.em-test-slide');
        var dots = document.querySelectorAll('.em-test-dot');
        var currentIdx = 0;
        var timer = null;
        function showSlide(idx) {
          currentIdx = idx;
          slides.forEach(function(s) { s.style.display = 'none'; });
          dots.forEach(function(d) { d.style.background = '#E3DDD2'; });
          if (slides[idx]) slides[idx].style.display = 'block';
          if (dots[idx]) dots[idx].style.background = '#F47C2C';
        }
        function nextSlide() { showSlide((currentIdx + 1) % slides.length); }
        function startTimer() { clearInterval(timer); timer = setInterval(nextSlide, 6000); }
        dots.forEach(function(d) {
          d.addEventListener('click', function() { showSlide(parseInt(d.dataset.index)); startTimer(); });
        });
        startTimer();
      }, 100);
    }

    // --- FAQ SECTION ---
    if (!document.querySelector('.em-faq')) {
      var faqItems = [
        { q: 'Will PropFuel emails compete with our existing email marketing?', a: 'No. PropFuel is additive \u2014 it sits alongside your email marketing platform (Higher Logic, Real Magnet, Mailchimp, whatever you use). Your email tool handles newsletters and announcements. PropFuel handles the conversations that give you something back. The recommended cadence is 8-13 PropFuel check-ins per year.' },
        { q: 'Will members get annoyed by more emails?', a: 'The data says the opposite. PropFuel check-ins get 10-15% response rates \u2014 5-6x the industry average. Members respond because the emails are short, relevant, and ask them something real. A single question that matters beats a 2,000-word newsletter every time.' },
        { q: 'How does PropFuel ensure high deliverability?', a: 'Emails are white-labeled and sent from your organization\u2019s domain. During onboarding, PropFuel configures DKIM, SPF, and DMARC authentication. Infrastructure runs on SendGrid and AWS with private IP addresses available. Result: 97-99.2% deliverability.' },
        { q: 'What types of questions can we ask?', a: 'Multiple choice, yes/no, NPS and satisfaction scales, and open-ended text. AI-powered sentiment analysis automatically categorizes open-ended responses so your team doesn\u2019t have to read every one individually.' },
        { q: 'How quickly can we launch our first email campaign?', a: 'First campaign live in 2-3 weeks. Full ramp-up in 2-3 months. You get a dedicated Customer Success Manager with less than 3-hour response time and access to 70+ campaign blueprints \u2014 pre-built templates for onboarding, renewals, win-back, events, and more.' }
      ];
      var faqHTML = '<section class="em-faq" style="padding:96px 48px">' +
        '<div style="max-width:800px;margin:0 auto">' +
          '<div style="text-align:center;margin-bottom:56px">' +
            '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">FAQ</p>' +
            '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Common questions about PropFuel Email.</h2>' +
          '</div>';
      faqItems.forEach(function(item) {
        faqHTML += '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0">' +
          '<button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">' +
            item.q +
            '' +
          '</button>' +
          '<div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease">' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.65;padding-top:16px">' + item.a + '</p>' +
          '</div>' +
        '</div>';
      });
      faqHTML += '</div></section>';
      var testSection = document.querySelector('.em-testimonials');
      if (testSection) {
        testSection.insertAdjacentHTML('afterend', faqHTML);
      } else {
        ctaSection.insertAdjacentHTML('beforebegin', faqHTML);
      }
    }

    // Related Use Cases removed per feedback — redundant with global nav
    document.querySelectorAll('.em-related').forEach(function(n){ n.remove(); });

    // ═══════════════════════════════════════
    // SECTION 4: FIX CTA
    // ═══════════════════════════════════════
    var ctaHeading = document.querySelector('.pf-cta-heading');
    if (ctaHeading) {
      ctaHeading.innerHTML = 'Send emails members<br><span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">actually answer.</span>';
    }
    var ctaSub = document.querySelector('.pf-cta-sub');
    if (ctaSub) {
      ctaSub.textContent = 'Every email you send is a chance to learn something about a member. Most email tools waste that chance. PropFuel doesn\u2019t.';
    }

    // ═══════════════════════════════════════
    // SECTION 5: HIDE EXISTING WEBFLOW FEATURE SECTIONS
    // ═══════════════════════════════════════
    document.querySelectorAll('.pf-section').forEach(function(s) { s.style.display = 'none'; });
  }

  // ─────────────────────────────────────────

  // ─────────────────────────────────────────
  // 12. MEMBERSHIP AI PAGE FIXES
  // ─────────────────────────────────────────
  // FIX ENGAGEMENT PAGE
  // ─────────────────────────────────────────
  function fixEngagementPage() {
    if (window.location.pathname.indexOf('platform/engagement') === -1) return;
    var heroLabel = document.querySelector('.pf-page-hero-label');
    if (heroLabel) { heroLabel.textContent = 'The Engagement Engine'; } else { var heroTitle = document.querySelector('.pf-page-hero-title'); if (heroTitle) { var parent = heroTitle.parentElement; if (!parent.querySelector('.pf-hero-label-injected')) { var label = document.createElement('p'); label.className = 'pf-hero-label-injected fade-up'; label.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)'; label.textContent = 'The Engagement Engine'; parent.insertBefore(label, heroTitle); } } }
    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) { heroHeading.innerHTML = 'More engagement.<br>Less silence.'; }
    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) { heroSub.textContent = 'PropFuel turns every communication into a meaningful opportunity to listen to, engage, and serve your members \u2014 across email, website, and SMS.'; }
    if (heroHeading) { var heroParent = heroHeading.parentElement; if (!heroParent.querySelector('.pf-hero-btns-injected')) { var btnWrap = document.createElement('div'); btnWrap.className = 'pf-hero-btns-injected fade-up'; btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px'; btnWrap.innerHTML = '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">See It in Action <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/book-a-demo" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">Get Started</a>'; var sub = heroParent.querySelector('.pf-page-hero-sub'); if (sub) { sub.parentNode.insertBefore(btnWrap, sub.nextSibling); } else { heroParent.appendChild(btnWrap); } } }
    // Hero mockup — always create own container
    var heroVisual = document.querySelector('.ee-hero-mockup');
    if (!heroVisual) { var btns = document.querySelector('.pf-hero-btns-injected'); var heroArea = btns ? btns.parentElement : (heroHeading ? heroHeading.parentElement : null); if (heroArea) { heroVisual = document.createElement('div'); heroVisual.className = 'ee-hero-mockup'; heroVisual.style.cssText = 'margin:48px auto 0;max-width:960px;padding:0 24px'; heroArea.appendChild(heroVisual); } }
    if (heroVisual && !heroVisual.querySelector('.ee-channel-cards')) { var mockupWrap = document.createElement('div'); mockupWrap.className = 'ee-channel-cards'; mockupWrap.innerHTML = '<div style="width:100%;max-width:900px;margin:0 auto;padding:24px;display:flex;flex-direction:column;gap:16px;"><div style="display:flex;align-items:center;gap:12px;padding:12px 20px;background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);"><div style="width:10px;height:10px;border-radius:50%;background:#E74C3C;"></div><div style="width:10px;height:10px;border-radius:50%;background:#FBC02D;"></div><div style="width:10px;height:10px;border-radius:50%;background:#2ECC71;"></div><div style="flex:1;text-align:center;font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:.3px;">PropFuel \u2014 Engagement Engine</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;"><div style="background:#fff;border-radius:14px;padding:20px 16px;box-shadow:0 2px 8px rgba(0,0,0,.05);display:flex;flex-direction:column;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg></div><div style="font-size:13px;font-weight:700;color:#2F2F2F;">Email</div><div style="width:100%;display:flex;flex-direction:column;gap:6px;"><div style="background:#F4F1EA;border-radius:8px;padding:8px 10px;font-size:11px;color:#6E6E6E;">How valuable is your membership?</div><div style="display:flex;gap:4px;"><div style="flex:1;background:#FBC02D;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#fff;">Very</div><div style="flex:1;background:#EBE6DA;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#2F2F2F;">Somewhat</div><div style="flex:1;background:#EBE6DA;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#2F2F2F;">Not sure</div></div></div><div style="display:flex;align-items:center;gap:4px;margin-top:2px;"><div style="width:6px;height:6px;border-radius:50%;background:#2ECC71;"></div><span style="font-size:10px;color:#6E6E6E;">12.4% response rate</span></div></div><div style="background:#fff;border-radius:14px;padding:20px 16px;box-shadow:0 2px 8px rgba(0,0,0,.05);display:flex;flex-direction:column;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#F47C2C,#F05A28);display:flex;align-items:center;justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><div style="font-size:13px;font-weight:700;color:#2F2F2F;">Website</div><div style="width:100%;display:flex;flex-direction:column;gap:6px;"><div style="background:#F4F1EA;border-radius:8px;padding:8px 10px;font-size:11px;color:#6E6E6E;">What brought you here today?</div><div style="display:flex;gap:4px;"><div style="flex:1;background:#F47C2C;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#fff;">Event</div><div style="flex:1;background:#EBE6DA;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#2F2F2F;">Benefits</div><div style="flex:1;background:#EBE6DA;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#2F2F2F;">Other</div></div></div><div style="display:flex;align-items:center;gap:4px;margin-top:2px;"><div style="width:6px;height:6px;border-radius:50%;background:#2ECC71;"></div><span style="font-size:10px;color:#6E6E6E;">7,400+ captured</span></div></div><div style="background:#fff;border-radius:14px;padding:20px 16px;box-shadow:0 2px 8px rgba(0,0,0,.05);display:flex;flex-direction:column;align-items:center;gap:10px;"><div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#2F2F2F,#4A4A4A);display:flex;align-items:center;justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div style="font-size:13px;font-weight:700;color:#2F2F2F;">SMS</div><div style="width:100%;display:flex;flex-direction:column;gap:6px;"><div style="background:#F4F1EA;border-radius:8px;padding:8px 10px;font-size:11px;color:#6E6E6E;">Are you attending the conference?</div><div style="display:flex;gap:4px;"><div style="flex:1;background:#2F2F2F;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#fff;">Yes!</div><div style="flex:1;background:#EBE6DA;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#2F2F2F;">Maybe</div><div style="flex:1;background:#EBE6DA;border-radius:6px;padding:5px;text-align:center;font-size:10px;font-weight:600;color:#2F2F2F;">No</div></div></div><div style="display:flex;align-items:center;gap:4px;margin-top:2px;"><div style="width:6px;height:6px;border-radius:50%;background:#2ECC71;"></div><span style="font-size:10px;color:#6E6E6E;">Real-time replies</span></div></div></div><div style="background:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 1px 4px rgba(0,0,0,.06);display:flex;align-items:center;gap:16px;"><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;">JD</div><div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;color:#2F2F2F;">Jane Doe \u2014 Unified Member Timeline</div><div style="font-size:11px;color:#6E6E6E;margin-top:2px;">Email response <span style="color:#FBC02D;">\u25CF</span> Website visit <span style="color:#F47C2C;">\u25CF</span> SMS reply <span style="color:#2F2F2F;">\u25CF</span></div></div><div style="display:flex;gap:4px;"><div style="width:28px;height:6px;border-radius:3px;background:#FBC02D;"></div><div style="width:16px;height:6px;border-radius:3px;background:#F47C2C;"></div><div style="width:22px;height:6px;border-radius:3px;background:#2F2F2F;"></div><div style="width:12px;height:6px;border-radius:3px;background:#FBC02D;"></div><div style="width:20px;height:6px;border-radius:3px;background:#F47C2C;"></div></div></div></div>'; heroVisual.innerHTML = ''; heroVisual.appendChild(mockupWrap); heroVisual.style.background = '#EBE6DA'; heroVisual.style.borderRadius = '20px'; heroVisual.style.padding = '28px'; }
    // Inject sections
    var ctaSection = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (!ctaSection) return;
    if (!document.querySelector('.ee-problem-band')) { ctaSection.insertAdjacentHTML('beforebegin', '<section class="ee-problem-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center"><div><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The Problem</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:32px">You\u2019re speaking into the void.</h2><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">You send the newsletter. You promote the event. You remind them about renewal. And then \u2014 nothing.</p><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">No signal that it landed. No data about who opened it, what resonated, or whether anyone cared. Every member looks the same in the database because <strong style="color:#EDE8DF">nothing comes back.</strong></p><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:32px">The problem isn\u2019t your members. The problem is that you\u2019ve been working with tools built for <strong style="color:#EDE8DF">broadcasting, not listening.</strong></p><div style="background:rgba(251,192,45,0.06);border-left:3px solid #FBC02D;border-radius:0 12px 12px 0;padding:20px 24px"><p style="font-size:15px;color:#EDE8DF;line-height:1.5;font-style:italic;margin-bottom:8px">\u201CMore people have responded to our PropFuel emails than have ever even opened our standard marketing emails.\u201D</p><cite style="font-size:13px;color:#8C8479;font-style:normal">\u2014 Kara Potter, MSTA</cite></div></div><div style="padding:24px"><div style="width:100%;max-width:400px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:20px;"><div style="width:100%;display:flex;flex-direction:column;gap:10px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg></div><div style="flex:1;background:#2C2720;border-radius:10px;padding:10px 14px;font-size:12px;color:#8C8479;">Monthly Newsletter</div></div><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#F47C2C,#F05A28);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div style="flex:1;background:#2C2720;border-radius:10px;padding:10px 14px;font-size:12px;color:#8C8479;">Event Promotion</div></div><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:10px;background:#4A4A4A;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div style="flex:1;background:#2C2720;border-radius:10px;padding:10px 14px;font-size:12px;color:#8C8479;">Renewal Reminder</div></div></div><div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 0;"><div style="width:100%;height:1px;background:rgba(140,132,121,0.3);"></div><span style="font-size:14px;font-weight:700;color:#F47C2C;letter-spacing:.5px;">NO SIGNAL BACK</span><div style="width:100%;height:1px;background:rgba(140,132,121,0.3);"></div></div><div style="width:100%;display:flex;justify-content:center;gap:16px;"><div style="text-align:center;"><div style="font-size:24px;font-weight:800;color:#3A3530;">0</div><div style="font-size:10px;color:#8C8479;margin-top:2px;">Replies</div></div><div style="width:1px;background:#2E2924;"></div><div style="text-align:center;"><div style="font-size:24px;font-weight:800;color:#3A3530;">?</div><div style="font-size:10px;color:#8C8479;margin-top:2px;">Who cared</div></div><div style="width:1px;background:#2E2924;"></div><div style="text-align:center;"><div style="font-size:24px;font-weight:800;color:#3A3530;">0</div><div style="font-size:10px;color:#8C8479;margin-top:2px;">Data points</div></div></div></div></div></div></section>'); }
    if (!document.querySelector('.ee-stats-band')) { var prev = document.querySelector('.ee-problem-band'); var s = '<section class="ee-stats-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Results</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">The numbers speak for themselves.</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px"><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$315K</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">VECCS</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">In revenue from website widget \u2014 10% of conference registrations.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">7,416</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">AMA</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Contacts captured and $304K in membership revenue from website engagement.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">72%</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">ARN</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Engagement rate on weekly quiz campaign \u2014 continuous member conversation.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">830%</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">G2 Review</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Increase in webinar registrations using PropFuel engagement.</p></div></div></div></section>'; if (prev) { prev.insertAdjacentHTML('afterend', s); } else { ctaSection.insertAdjacentHTML('beforebegin', s); } }
    if (!document.querySelector('.ee-use-cases')) { var prev2 = document.querySelector('.ee-stats-band'); var s2 = '<section class="ee-use-cases" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:1200px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Use Cases</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">What the Engagement Engine powers.</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Onboarding</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Ask new members what they hope to get from membership. Learn their preferences. Guide them to the right resources.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Renewals</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Start the renewal conversation 90 days out. Ask about intent. Surface hesitations. Make it personal, not transactional.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Win-Back</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Re-open a conversation with lapsed members. Find out if they left intentionally or just lost track.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Acquisition</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Capture interest from anonymous website visitors. Ask what brought them here. Nurture warm leads with relevant follow-up.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Events</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Drive registrations by understanding interest. Send day-of SMS reminders. Collect feedback that connects back to the member profile.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Data & Intelligence</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Weave profile update questions into existing campaigns. Every response is a database update \u2014 no forms, no portals.</p></div></div></div></section>'; if (prev2) { prev2.insertAdjacentHTML('afterend', s2); } else { ctaSection.insertAdjacentHTML('beforebegin', s2); } }
    if (!document.querySelector('.ee-faq')) { var eeFaqItems=[{q:'Is PropFuel a survey tool?',a:'No. Unlike traditional surveys, PropFuel sends short, ongoing interactions \u2014 one question at a time \u2014 throughout the member lifecycle. It is a continuous listening system, not a one-time data collection tool. Think of it as building a relationship through micro-conversations rather than long-form surveys.'},{q:'Is PropFuel a replacement for our email marketing tool?',a:'No. PropFuel sits alongside your email marketing platform \u2014 Higher Logic, Real Magnet, Mailchimp, whatever you use. Your email tool handles newsletters and announcements. PropFuel handles the conversations that give you something back.'},{q:'How often should we reach out to members?',a:'8-13 check-ins per year is the sweet spot. Every interaction should feel purposeful, not like noise. PropFuel is about relevance over volume.'},{q:'What kind of response rates can we expect?',a:'10-15% response rates, which is 5-6x the industry average for email engagement. Some campaigns \u2014 like data capture or renewal intent \u2014 regularly hit 25-44% response rates.'},{q:'How does PropFuel handle email deliverability?',a:'Emails are white-labeled and sent from your organization\u2019s domain. PropFuel handles DKIM, SPF, and DMARC configuration during onboarding. Deliverability rates are 97-99.2%, built on SendGrid and AWS infrastructure with private IP addresses available.'}]; var h='<section class="ee-faq" style="padding:96px 48px"><div style="max-width:800px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">FAQ</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Common questions about the Engagement Engine.</h2></div>'; eeFaqItems.forEach(function(item){h+='<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">'+item.q+'</button><div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease"><p style="font-size:16px;color:#6E6E6E;line-height:1.65;padding-top:16px">'+item.a+'</p></div></div>';}); h+='</div></section>'; var prev3=document.querySelector('.ee-use-cases'); if(prev3){prev3.insertAdjacentHTML('afterend',h);}else{ctaSection.insertAdjacentHTML('beforebegin',h);} }
    var ctaHeading=document.querySelector('.pf-cta-heading'); if(ctaHeading){ctaHeading.innerHTML='Turn silence<br>into <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">signal.</span>';} var ctaSub2=document.querySelector('.pf-cta-sub'); if(ctaSub2){ctaSub2.textContent='Every communication is an opportunity to learn something about your members. PropFuel makes sure you never miss it.';}
    document.querySelectorAll('.pf-section').forEach(function(s){s.style.display='none';});
  }

  // ─────────────────────────────────────────
  // FIX WEBSITE PAGE
  // ─────────────────────────────────────────
  function fixWebsitePage() {
    if (window.location.pathname.indexOf('platform/website') === -1) return;
    var heroLabel=document.querySelector('.pf-page-hero-label'); if(heroLabel){heroLabel.textContent='Website Channel';}else{var heroTitle=document.querySelector('.pf-page-hero-title');if(heroTitle){var parent=heroTitle.parentElement;if(!parent.querySelector('.pf-hero-label-injected')){var label=document.createElement('p');label.className='pf-hero-label-injected fade-up';label.style.cssText='display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)';label.textContent='Website Channel';parent.insertBefore(label,heroTitle);}}}
    var heroHeading=document.querySelector('.pf-page-hero-title');if(heroHeading){heroHeading.innerHTML='Turn your website into a conversation.';}
    var heroSub=document.querySelector('.pf-page-hero-sub');if(heroSub){heroSub.textContent='Every day, members and prospects visit your website and leave without a trace. PropFuel captures their interest before they disappear \u2014 with targeted questions that turn anonymous browsing into actionable data.';}
    if(heroHeading){var heroParent=heroHeading.parentElement;if(!heroParent.querySelector('.pf-hero-btns-injected')){var btnWrap=document.createElement('div');btnWrap.className='pf-hero-btns-injected fade-up';btnWrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';btnWrap.innerHTML='<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Capture Every Visitor\u2019s Intent <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/book-a-demo" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">Get Started</a>';var sub=heroParent.querySelector('.pf-page-hero-sub');if(sub){sub.parentNode.insertBefore(btnWrap,sub.nextSibling);}else{heroParent.appendChild(btnWrap);}}}
    // Hero mockup
    var heroVisual=document.querySelector('.pf-feature-visual');if(!heroVisual){var btns=document.querySelector('.pf-hero-btns-injected');var heroArea=btns?btns.parentElement:(heroHeading?heroHeading.parentElement:null);if(heroArea&&!heroArea.querySelector('.ws-hero-mockup')){heroVisual=document.createElement('div');heroVisual.className='ws-hero-mockup';heroVisual.style.cssText='margin:48px auto 0;max-width:960px;padding:0 24px';heroArea.appendChild(heroVisual);}}
    if(heroVisual&&!heroVisual.querySelector('.ws-browser-mockup')){var mockupWrap=document.createElement('div');mockupWrap.className='ws-browser-mockup';mockupWrap.innerHTML='<div style="max-width:600px;margin:0 auto;font-family:\'DM Sans\',sans-serif;position:relative;"><div style="background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.12);overflow:hidden;"><div style="background:#2F2F2F;padding:10px 16px;display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:#ff5f56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#ffbd2e;"></div><div style="width:10px;height:10px;border-radius:50%;background:#27c93f;"></div><div style="flex:1;background:#1a1a1a;border-radius:6px;padding:5px 12px;margin-left:12px;"><span style="color:#999;font-size:11px;">yourassociation.org/membership</span></div></div><div style="padding:30px 24px;min-height:200px;position:relative;"><div style="display:flex;gap:20px;margin-bottom:20px;"><div style="flex:1;"><div style="background:#EBE6DA;height:12px;border-radius:4px;width:60%;margin-bottom:8px;"></div><div style="background:#EBE6DA;height:8px;border-radius:4px;width:90%;margin-bottom:6px;"></div><div style="background:#EBE6DA;height:8px;border-radius:4px;width:75%;"></div></div><div style="width:100px;height:70px;background:#EBE6DA;border-radius:8px;"></div></div><div style="position:absolute;bottom:16px;right:16px;background:#fff;border-radius:14px;box-shadow:0 6px 28px rgba(0,0,0,.18);padding:20px;width:260px;border-left:4px solid #FBC02D;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="width:28px;height:28px;border-radius:50%;background:#FBC02D;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><span style="font-size:12px;font-weight:700;color:#2F2F2F;">Quick Question</span></div><p style="font-size:13px;color:#2F2F2F;margin:0 0 14px;line-height:1.4;font-weight:600;">What brought you to our site today?</p><div style="display:flex;flex-direction:column;gap:6px;"><div style="background:#FBC02D;color:#2F2F2F;padding:10px;border-radius:8px;font-size:11px;font-weight:600;text-align:center;">Exploring membership</div><div style="background:#F47C2C;color:#fff;padding:10px;border-radius:8px;font-size:11px;font-weight:600;text-align:center;">Looking for events</div><div style="background:#EBE6DA;color:#2F2F2F;padding:10px;border-radius:8px;font-size:11px;font-weight:600;text-align:center;">Researching certifications</div></div></div></div></div></div>';heroVisual.innerHTML='';heroVisual.appendChild(mockupWrap);heroVisual.style.background='#EBE6DA';heroVisual.style.borderRadius='20px';heroVisual.style.padding='28px';}
    var ctaSection=document.querySelector('.pf-cta-section, [class*="cta-section"]');if(!ctaSection)return;
    if(!document.querySelector('.ws-problem-band')){ctaSection.insertAdjacentHTML('beforebegin','<section class="ws-problem-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center"><div><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The Problem</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:32px">Your website is a library with no librarian.</h2><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">Visitors walk in, browse the shelves, and leave. You know how many people came in \u2014 your analytics tell you that. But you have no idea <strong style="color:#EDE8DF">what they were looking for, whether they found it, or what would have made them stay.</strong></p><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">Most associations try to fix this with generic pop-ups. \u201CSubscribe to our newsletter.\u201D Tools designed to capture an email address \u2014 not to understand a person.</p><p style="font-size:17px;color:#8C8479;line-height:1.65"><strong style="color:#EDE8DF">PropFuel asks a question instead.</strong> One tap. Now you know exactly what that visitor wants \u2014 and PropFuel routes them to the right next step automatically.</p></div><div style="padding:24px"><div style="background:rgba(255,255,255,.08);border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,.1);"><div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><span style="color:rgba(255,255,255,.4);font-size:11px;">Website Traffic \u2014 Last 30 Days</span></div><div style="display:flex;align-items:flex-end;gap:4px;height:80px;margin-bottom:16px;"><div style="flex:1;background:rgba(251,192,45,.2);border-radius:3px 3px 0 0;height:45%;"></div><div style="flex:1;background:rgba(251,192,45,.2);border-radius:3px 3px 0 0;height:60%;"></div><div style="flex:1;background:rgba(251,192,45,.25);border-radius:3px 3px 0 0;height:75%;"></div><div style="flex:1;background:rgba(251,192,45,.3);border-radius:3px 3px 0 0;height:90%;"></div><div style="flex:1;background:#FBC02D;border-radius:3px 3px 0 0;height:100%;"></div></div><div style="display:flex;gap:12px;"><div style="flex:1;background:rgba(255,255,255,.05);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#FBC02D;">12,847</div><div style="font-size:9px;color:rgba(255,255,255,.4);">Visitors</div></div><div style="flex:1;background:rgba(244,124,44,.1);border-radius:8px;padding:10px;text-align:center;border:1px dashed rgba(244,124,44,.3);"><div style="font-size:18px;font-weight:700;color:#F47C2C;">???</div><div style="font-size:9px;color:rgba(255,255,255,.4);">What they want</div></div><div style="flex:1;background:rgba(244,124,44,.1);border-radius:8px;padding:10px;text-align:center;border:1px dashed rgba(244,124,44,.3);"><div style="font-size:18px;font-weight:700;color:#F47C2C;">???</div><div style="font-size:9px;color:rgba(255,255,255,.4);">Who they are</div></div></div><p style="text-align:center;font-size:10px;color:rgba(255,255,255,.3);margin:16px 0 0;">Anonymous visitors leaving without a trace</p></div></div></div></section>');}
    if(!document.querySelector('.ws-stats-band')){var p=document.querySelector('.ws-problem-band');var s='<section class="ws-stats-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Results</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">From anonymous traffic to attributable revenue.</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px"><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$315K</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">VECCS</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Conference revenue from a single website widget.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$304K</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">AMA</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Membership revenue generated from website engagement.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">27%</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">VECCS</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Engagement rate \u2014 vs 2-3% typical for industry pop-ups.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">449</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">VECCS</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Conference registrations \u2014 approx. 10% of all registrations from one widget.</p></div></div></div></section>';if(p){p.insertAdjacentHTML('afterend',s);}else{ctaSection.insertAdjacentHTML('beforebegin',s);}}
    if(!document.querySelector('.ws-faq')){var wsFaqItems=[{q:'How does the website widget get installed?',a:'A lightweight JavaScript snippet gets added to your website \u2014 similar to Google Analytics or a chat widget. PropFuel\u2019s team handles the setup during onboarding. Most installations are complete in under an hour.'},{q:'Will a pop-up annoy our website visitors?',a:'Traditional pop-ups that ask for an email address get 1-2% engagement. PropFuel widgets that ask a relevant question get 7-27%. The difference is relevance: when the question helps visitors find what they\u2019re looking for, it feels like a service, not an interruption.'},{q:'Can we target different questions to different visitors?',a:'Yes \u2014 this is the core feature. You can target by page, member status, visit count, and referral source.'},{q:'What happens after a visitor responds?',a:'Their response can trigger any combination of: a personalized landing page, a follow-up email, enrollment in a drip campaign, a staff alert, a tag on their profile, and a write-back to your AMS.'}];var h2='<section class="ws-faq" style="padding:96px 48px"><div style="max-width:800px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">FAQ</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Common questions about Website Engagement.</h2></div>';wsFaqItems.forEach(function(item){h2+='<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">'+item.q+'</button><div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease"><p style="font-size:16px;color:#6E6E6E;line-height:1.65;padding-top:16px">'+item.a+'</p></div></div>';});h2+='</div></section>';var p2=document.querySelector('.ws-stats-band');if(p2){p2.insertAdjacentHTML('afterend',h2);}else{ctaSection.insertAdjacentHTML('beforebegin',h2);}}
    var ctaHeading=document.querySelector('.pf-cta-heading');if(ctaHeading){ctaHeading.innerHTML='Capture every<br>visitor\u2019s <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">intent.</span>';}var ctaSub2=document.querySelector('.pf-cta-sub');if(ctaSub2){ctaSub2.textContent='Your website gets thousands of visits. Right now, most of them leave without telling you anything. PropFuel turns passive browsing into active signal.';}
    document.querySelectorAll('.pf-section').forEach(function(s){s.style.display='none';});
  }

  // ─────────────────────────────────────────
  // FIX INTEGRATIONS PAGE
  // ─────────────────────────────────────────
  function fixIntegrationsPage() {
    if (window.location.pathname.indexOf('/integrations') === -1) return;
    var heroLabel=document.querySelector('.pf-page-hero-label');if(heroLabel){heroLabel.textContent='Integrations';}else{var heroTitle=document.querySelector('.pf-page-hero-title');if(heroTitle){var parent=heroTitle.parentElement;if(!parent.querySelector('.pf-hero-label-injected')){var label=document.createElement('p');label.className='pf-hero-label-injected fade-up';label.style.cssText='display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)';label.textContent='Integrations';parent.insertBefore(label,heroTitle);}}}
    var heroHeading=document.querySelector('.pf-page-hero-title');if(heroHeading){heroHeading.innerHTML='Your AMS. 60+ integrations. Connected in minutes.';}
    var heroSub=document.querySelector('.pf-page-hero-sub');if(heroSub){heroSub.textContent='PropFuel connects to 60+ external systems with two-way sync \u2014 pull member data in, push engagement data back. Setup takes 5-30 minutes. No IT department required.';}
    if(heroHeading){var heroParent=heroHeading.parentElement;if(!heroParent.querySelector('.pf-hero-btns-injected')){var btnWrap=document.createElement('div');btnWrap.className='pf-hero-btns-injected fade-up';btnWrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';btnWrap.innerHTML='<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Connect Your AMS <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/book-a-demo" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">Get Started</a>';var sub=heroParent.querySelector('.pf-page-hero-sub');if(sub){sub.parentNode.insertBefore(btnWrap,sub.nextSibling);}else{heroParent.appendChild(btnWrap);}}}
    // Hero mockup
    var heroVisual=document.querySelector('.pf-feature-visual');if(!heroVisual){var btns=document.querySelector('.pf-hero-btns-injected');var heroArea=btns?btns.parentElement:(heroHeading?heroHeading.parentElement:null);if(heroArea&&!heroArea.querySelector('.ig-hero-mockup')){heroVisual=document.createElement('div');heroVisual.className='ig-hero-mockup';heroVisual.style.cssText='margin:48px auto 0;max-width:960px;padding:0 24px';heroArea.appendChild(heroVisual);}}
    if(heroVisual&&!heroVisual.querySelector('.ig-dashboard-mockup')){var mockupWrap=document.createElement('div');mockupWrap.className='ig-dashboard-mockup';mockupWrap.innerHTML='<div style="max-width:600px;margin:0 auto;font-family:\'DM Sans\',sans-serif;"><div style="background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.12);overflow:hidden;"><div style="background:#2F2F2F;padding:12px 20px;display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:#ff5f56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#ffbd2e;"></div><div style="width:10px;height:10px;border-radius:50%;background:#27c93f;"></div><span style="color:#aaa;font-size:11px;margin-left:12px;">PropFuel \u2014 Integrations</span></div><div style="padding:24px;"><div style="display:flex;align-items:center;justify-content:space-between;padding:16px;background:#F4F1EA;border-radius:12px;margin-bottom:16px;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:40px;height:40px;border-radius:10px;background:#FBC02D;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F2F2F" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F;">Your AMS</div><div style="font-size:11px;color:#999;">iMIS / Nimble / YourMembership</div></div></div><div style="display:flex;align-items:center;gap:6px;background:#e8f5e9;padding:6px 12px;border-radius:20px;"><div style="width:8px;height:8px;border-radius:50%;background:#27c93f;"></div><span style="font-size:11px;font-weight:600;color:#2e7d32;">Connected</span></div></div><div style="display:flex;gap:12px;margin-bottom:16px;"><div style="flex:1;background:#fafafa;border-radius:10px;padding:14px;text-align:center;border:1px solid #EBE6DA;"><div style="font-size:22px;font-weight:700;color:#FBC02D;">14,328</div><div style="font-size:10px;color:#999;">Members synced</div></div><div style="flex:1;background:#fafafa;border-radius:10px;padding:14px;text-align:center;border:1px solid #EBE6DA;"><div style="font-size:22px;font-weight:700;color:#F47C2C;">2,847</div><div style="font-size:10px;color:#999;">Write-backs today</div></div><div style="flex:1;background:#fafafa;border-radius:10px;padding:14px;text-align:center;border:1px solid #EBE6DA;"><div style="font-size:22px;font-weight:700;color:#27c93f;">Live</div><div style="font-size:10px;color:#999;">Two-way sync</div></div></div><div style="background:#fafafa;border-radius:10px;padding:14px;border:1px solid #EBE6DA;"><div style="font-size:11px;font-weight:600;color:#2F2F2F;margin-bottom:10px;">Field Mapping</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><div style="background:#EBE6DA;padding:4px 10px;border-radius:4px;font-size:10px;">Member.Interest</div><span style="color:#FBC02D;font-weight:700;">\u2192</span><div style="background:#FBC02D;padding:4px 10px;border-radius:4px;font-size:10px;font-weight:600;">PropFuel.Tag</div></div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><div style="background:#EBE6DA;padding:4px 10px;border-radius:4px;font-size:10px;">Member.Email</div><span style="color:#F47C2C;font-weight:700;">\u21C4</span><div style="background:#F47C2C;padding:4px 10px;border-radius:4px;font-size:10px;color:#fff;font-weight:600;">PropFuel.Contact</div></div><div style="display:flex;align-items:center;gap:8px;"><div style="background:#EBE6DA;padding:4px 10px;border-radius:4px;font-size:10px;">Member.Status</div><span style="color:#FBC02D;font-weight:700;">\u21C4</span><div style="background:#FBC02D;padding:4px 10px;border-radius:4px;font-size:10px;font-weight:600;">PropFuel.Segment</div></div></div></div></div></div>';heroVisual.innerHTML='';heroVisual.appendChild(mockupWrap);heroVisual.style.background='#EBE6DA';heroVisual.style.borderRadius='20px';heroVisual.style.padding='28px';}
    var ctaSection=document.querySelector('.pf-cta-section, [class*="cta-section"]');if(!ctaSection)return;
    if(!document.querySelector('.ig-problem-band')){ctaSection.insertAdjacentHTML('beforebegin','<section class="ig-problem-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center"><div><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The Problem</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:32px">You\u2019ve been burned by integration projects before.</h2><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">Somewhere in your organization\u2019s history, someone approved a \u201Csimple integration\u201D that turned into a <strong style="color:#EDE8DF">six-month IT project.</strong> The scar tissue is real.</p><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">Behind the integration anxiety is a deeper frustration: every engagement tool creates another data silo. Campaign responses in one system. Member profiles in another. And someone on your team spending hours <strong style="color:#EDE8DF">exporting CSVs</strong> and uploading them, hoping nothing gets lost.</p><p style="font-size:17px;color:#8C8479;line-height:1.65">OHI/ARVC lived this. After switching to Pardot, their VP called it <strong style="color:#EDE8DF">\u201Cdeath by CSV.\u201D</strong> When a board member asked what members really wanted, the best they had was an educated guess. They came back to PropFuel.</p></div><div style="padding:24px"><div style="background:rgba(255,255,255,.06);border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,.1);text-align:center;"><div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:20px;"><div style="background:rgba(255,255,255,.08);border-radius:10px;padding:14px 18px;border:1px solid rgba(255,255,255,.1);"><div style="font-size:10px;color:rgba(255,255,255,.4);">AMS</div></div><div style="background:#F47C2C;padding:4px 10px;border-radius:4px;font-size:9px;font-weight:700;color:#fff;">CSV</div><div style="background:rgba(255,255,255,.08);border-radius:10px;padding:14px 18px;border:1px solid rgba(255,255,255,.1);"><div style="font-size:10px;color:rgba(255,255,255,.4);">Email Tool</div></div></div><span style="color:#F47C2C;font-size:13px;font-weight:700;font-style:italic;">\u201CDeath by CSV\u201D</span><p style="color:rgba(255,255,255,.3);font-size:10px;margin:8px 0 0;">Manual exports. Manual imports. Manual errors. Every week.</p></div></div></div></section>');}
    if(!document.querySelector('.ig-connectors')){var p=document.querySelector('.ig-problem-band');var s='<section class="ig-connectors" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Supported Platforms</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:48px">60+ integrations. Yours is probably here.</h2><p style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#F47C2C;margin-bottom:20px">Tier 1 \u2014 Deepest Integration</p><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:40px"><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px 16px;text-align:center"><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Nimble AMS</h4><span style="font-size:11px;color:#6E6E6E;background:#EBE6DA;padding:3px 10px;border-radius:100px;">5-15 min</span></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px 16px;text-align:center"><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Salesforce</h4><span style="font-size:11px;color:#6E6E6E;background:#EBE6DA;padding:3px 10px;border-radius:100px;">5-15 min</span></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px 16px;text-align:center"><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Fonteva</h4><span style="font-size:11px;color:#6E6E6E;background:#EBE6DA;padding:3px 10px;border-radius:100px;">5-15 min</span></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px 16px;text-align:center"><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:6px">iMIS</h4><span style="font-size:11px;color:#6E6E6E;background:#EBE6DA;padding:3px 10px;border-radius:100px;">~30 min</span></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px 16px;text-align:center"><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Impexium</h4><span style="font-size:11px;color:#6E6E6E;background:#EBE6DA;padding:3px 10px;border-radius:100px;">~30 min</span></div></div><p style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#F47C2C;margin-bottom:20px">Tier 2 \u2014 Full Integration</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px"><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">Novi</h4></div><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">MemberSuite</h4></div><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">Aptify</h4></div><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">Personify</h4></div><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">NetForum</h4></div><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">YourMembership</h4></div><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">MemberClicks</h4></div><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">GrowthZone</h4></div><div class="pf-card" style="background:#F6F2E8;border-radius:14px;padding:18px 16px;text-align:center"><h4 style="font-size:14px;font-weight:700;color:#2F2F2F">HubSpot</h4></div></div><div style="background:#F6F2E8;border:1px solid #E3DDD2;border-radius:12px;padding:16px 24px;max-width:600px;margin:0 auto"><p style="font-size:14px;color:#6E6E6E;line-height:1.5"><strong style="color:#2F2F2F">Plus Zapier for 5,000+ more applications.</strong> If your AMS isn\u2019t on the list, PropFuel\u2019s Zapier connector bridges the gap.</p></div></div></section>';if(p){p.insertAdjacentHTML('afterend',s);}else{ctaSection.insertAdjacentHTML('beforebegin',s);}}
    if(!document.querySelector('.ig-setup')){var p2=document.querySelector('.ig-connectors');var s2='<section class="ig-setup" style="padding:96px 48px"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Setup</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">Live in four simple steps.</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px"><div style="text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:18px;font-weight:800;color:#fff;">1</div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Pick Your AMS</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Find your AMS in PropFuel\u2019s library of 60+ pre-built connectors. No custom development. No API keys to hunt down.</p></div><div style="text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:18px;font-weight:800;color:#fff;">2</div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Map Your Fields</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Standard fields map automatically. Add custom fields specific to your organization. Choose which 15-50 fields to sync.</p></div><div style="text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:18px;font-weight:800;color:#fff;">3</div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Sync Runs</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Hourly pull from your AMS. Real-time write-back when members respond. No batching, no delays, no manual work.</p></div><div style="text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:18px;font-weight:800;color:#fff;">4</div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Compliance Stays</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">PropFuel integrates with your AMS unsubscribe and preference center. CAN-SPAM, CASL, and GDPR compliance built in.</p></div></div></div></section>';if(p2){p2.insertAdjacentHTML('afterend',s2);}else{ctaSection.insertAdjacentHTML('beforebegin',s2);}}
    if(!document.querySelector('.ig-stats-band')){var p3=document.querySelector('.ig-setup');var s3='<section class="ig-stats-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Results</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">Integration that makes your entire system smarter.</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px"><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">60+</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">Connectors</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Pre-built AMS/AMS connectors covering the platforms associations actually use.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">4,500+</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">INS</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Member profile fields updated through PropFuel campaigns \u2014 all synced back automatically.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$100M+</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">All Clients</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Revenue growth across PropFuel clients \u2014 powered by data that stays connected.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">93%</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">Retention</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Client retention rate \u2014 because the integration works and keeps working.</p></div></div></div></section>';if(p3){p3.insertAdjacentHTML('afterend',s3);}else{ctaSection.insertAdjacentHTML('beforebegin',s3);}}
    if(!document.querySelector('.ig-faq')){var igFaqItems=[{q:'How long does integration setup really take?',a:'5-30 minutes for most AMS platforms. PropFuel has 60+ pre-built connectors that are plug-and-play. Your team configures the field mapping, tests the sync, and you\u2019re live. No IT department needed.'},{q:'What if our AMS isn\u2019t on the supported list?',a:'PropFuel\u2019s Zapier connector serves as a fallback for less common systems. Zapier supports 5,000+ applications and can handle pulling contact data into PropFuel and pushing responses back.'},{q:'Does the write-back really work in real time?',a:'Yes. When a member responds to a PropFuel check-in, the data writes back to your AMS immediately \u2014 not in a nightly batch, not in a weekly export. If a member updates their job title at 2:15pm, your AMS reflects that by 2:15pm.'},{q:'Will PropFuel mess up our existing AMS data?',a:'No. PropFuel maps to existing fields in your AMS \u2014 it doesn\u2019t create custom objects or modify your schema. You control exactly which fields sync and in which direction. The integration is additive \u2014 it enriches your data, it doesn\u2019t restructure it.'},{q:'How does PropFuel handle unsubscribes and compliance?',a:'PropFuel integrates with your AMS unsubscribe and preference center. Global unsubscribes are honored across all PropFuel campaigns. CAN-SPAM, CASL, and GDPR compliance is built in, including granular per-campaign and per-channel opt-out management.'}];var h3='<section class="ig-faq" style="padding:96px 48px"><div style="max-width:800px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">FAQ</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Common questions about Integrations.</h2></div>';igFaqItems.forEach(function(item){h3+='<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">'+item.q+'</button><div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease"><p style="font-size:16px;color:#6E6E6E;line-height:1.65;padding-top:16px">'+item.a+'</p></div></div>';});h3+='</div></section>';var p4=document.querySelector('.ig-stats-band');if(p4){p4.insertAdjacentHTML('afterend',h3);}else{ctaSection.insertAdjacentHTML('beforebegin',h3);}}
    var ctaHeading=document.querySelector('.pf-cta-heading');if(ctaHeading){ctaHeading.innerHTML='Connect your AMS<br>in <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">minutes.</span>';}var ctaSub2=document.querySelector('.pf-cta-sub');if(ctaSub2){ctaSub2.textContent='No IT project. No CSV exports. No data silos. Just your AMS and PropFuel, working together from day one.';}
    document.querySelectorAll('.pf-section').forEach(function(s){s.style.display='none';});
  }


  // ─────────────────────────────────────────
  // STAGING-ONLY (webflow.io): renders the new Membership AI page design
  // (qa/maif-page-preview.html). Production keeps the existing fixMembershipAIPage()
  // implementation untouched until this is promoted.
  // ─────────────────────────────────────────
  function renderMembershipAIPageStaging() {
    // 1. Inject scoped styles once
    if (!document.getElementById('maif-v2-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'maif-v2-styles';
      styleEl.textContent = (
        // Section utilities
        '.maif-v2 .section{padding:96px 32px}' +
        '.maif-v2 .section.dark{background:#1A1713;color:#EDE8DF}' +
        '.maif-v2 .section.warm{background:#EBE6DA}' +
        '.maif-v2 .container{max-width:1200px;margin:0 auto}' +
        '.maif-v2 .container.narrow{max-width:820px}' +
        '.maif-v2 .container.medium{max-width:1000px}' +
        '.maif-v2 .eyebrow{font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4A7FA5;margin-bottom:16px}' +
        '.maif-v2 .section.dark .eyebrow{color:#D0DFEA}' +
        '.maif-v2 .h2{font-size:clamp(28px,4vw,40px);font-weight:700;letter-spacing:-0.02em;line-height:1.15;color:#2F2F2F}' +
        '.maif-v2 .section.dark .h2{color:#EDE8DF}' +
        // Brand-spec buttons (.btn.btn-* selectors bump specificity past the bundle\'s a:link reset)
        '.maif-v2 .btn{display:inline-flex;align-items:center;gap:8px;font-family:\'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;cursor:pointer;letter-spacing:0.01em}' +
        '.maif-v2 .btn.btn-primary{position:relative;overflow:hidden;isolation:isolate;padding:14px 36px;font:600 15px/1 \'DM Sans\',sans-serif;background:#FBC02D;color:#FFFFFF;border:1.5px solid transparent;box-shadow:0 4px 16px rgba(240,90,40,0.20);transition:color .3s ease,border-color .3s ease,box-shadow .3s ease}' +
        '.maif-v2 .btn.btn-primary::after{content:\'\';position:absolute;inset:0;background:linear-gradient(to right,#F47C2C,#FBC02D);transition:opacity .35s ease;z-index:-1}' +
        '.maif-v2 .btn.btn-primary svg{stroke:currentColor;transition:stroke .3s ease}' +
        '.maif-v2 .btn.btn-primary:hover{color:#1A1714;border-color:#1A1714;box-shadow:0 4px 20px rgba(251,192,45,0.30)}' +
        '.maif-v2 .btn.btn-primary:hover::after{opacity:0}' +
        '.maif-v2 .btn.btn-primary:active{box-shadow:0 2px 10px rgba(251,192,45,0.20)}' +
        '.maif-v2 .btn.btn-secondary{padding:13px 35px;font:600 15px/1 \'DM Sans\',sans-serif;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.60);box-shadow:0 2px 8px rgba(244,124,44,0.06);transition:border-color .2s ease,box-shadow .2s ease,color .2s ease}' +
        '.maif-v2 .btn.btn-secondary:hover{border-color:#F47C2C;box-shadow:0 4px 16px rgba(244,124,44,0.15)}' +
        '.maif-v2 .btn.btn-secondary:active{box-shadow:0 2px 8px rgba(244,124,44,0.10)}' +
        // Hero accent (gradient on "Membership AI" word in H1)
        '.maif-v2-hero-accent{background:linear-gradient(135deg,#7AA8C9 0%,#4A7FA5 35%,#35607E 70%,#1F3A51 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}' +
        // Video — facade pattern: clean poster + play button on initial load,
        // swap to <wistia-player> only on click. Eliminates custom-element flash.
        '.maif-v2 .mai-video-wrap{max-width:1100px;margin:0 auto;padding:24px 24px 96px}' +
        '.maif-v2 .mai-video{position:relative;width:100%;aspect-ratio:16 / 9;border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(31,58,81,0.25),0 8px 24px rgba(31,58,81,0.15);background:#1F3A51}' +
        '.maif-v2 .mai-video-poster-btn{position:absolute;inset:0;width:100%;height:100%;border:0;padding:0;margin:0;cursor:pointer;display:block;background:#1F3A51;-webkit-appearance:none;appearance:none;font:inherit}' +
        '.maif-v2 .mai-video-poster-btn img{display:block;width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none}' +
        '.maif-v2 .mai-video-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;transition:transform 200ms ease}' +
        '.maif-v2 .mai-video-poster-btn:hover .mai-video-play,.maif-v2 .mai-video-poster-btn:focus-visible .mai-video-play{transform:scale(1.06)}' +
        '.maif-v2 .mai-video-poster-btn:focus-visible{outline:3px solid #4A7FA5;outline-offset:3px}' +
        '.maif-v2 .mai-video wistia-player{position:absolute;inset:0;display:block;width:100%;height:100%}' +
        // Fallback for browsers without aspect-ratio support
        '@supports not (aspect-ratio:1/1){.maif-v2 .mai-video{height:0;padding-top:56.25%}}' +
        // Testimonial
        '.maif-v2 .mai-quote{text-align:center}' +
        '.maif-v2 .mai-quote .mark{font-size:120px;font-weight:800;color:rgba(249,168,37,0.20);line-height:1;margin-bottom:-12px;font-family:Georgia,serif}' +
        '.maif-v2 .mai-quote blockquote{font-size:clamp(22px,2.2vw,28px);font-weight:500;color:#2F2F2F;line-height:1.4;letter-spacing:-0.005em;margin:0 0 24px;max-width:760px;margin-left:auto;margin-right:auto}' +
        '.maif-v2 .mai-quote cite{font-size:14px;font-weight:600;color:#6E6E6E;font-style:normal;letter-spacing:0;text-transform:none}' +
        '.maif-v2 .section.warm.mai-quote{padding:96px 32px}' +
        // Why
        '.maif-v2 .mai-why{text-align:center}' +
        '.maif-v2 .mai-why .pill{display:inline-flex;align-items:center;padding:10px 22px;border-radius:100px;background:rgba(208,223,234,0.08);border:1px solid rgba(208,223,234,0.25);font-size:13px;font-weight:600;color:#D0DFEA;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:80px}' +
        '.maif-v2 .mai-why .why-line{font-size:clamp(32px,3.6vw,52px);font-weight:600;line-height:1.25;letter-spacing:-0.02em;color:#EDE8DF;max-width:1080px;margin:0 auto}' +
        '.maif-v2 .mai-why .why-line.is-solution{text-shadow:0 0 28px rgba(122,168,201,0.40),0 0 80px rgba(74,127,165,0.25),0 0 140px rgba(74,127,165,0.18)}' +
        '.maif-v2 .mai-why .why-arrow{display:flex;justify-content:center;align-items:center;margin:64px auto;filter:drop-shadow(0 6px 18px rgba(244,124,44,0.30))}' +
        '.maif-v2 .mai-why .why-arrow svg{width:56px;height:56px;display:block}' +
        '.maif-v2 .section.dark.mai-why{padding:128px 32px}' +
        '@media (prefers-reduced-motion:no-preference){.maif-v2 .mai-why .why-arrow svg{animation:maif-v2-why-bob 2.4s ease-in-out infinite}@keyframes maif-v2-why-bob{0%,100%{transform:translateY(-4px)}50%{transform:translateY(4px)}}}' +
        // Paper grain (T1)
        '.maif-v2 .paper-grain{position:relative}' +
        '.maif-v2 .paper-grain::before{content:\'\';position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'320\' height=\'320\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\' seed=\'3\'/><feColorMatrix values=\'0 0 0 0 0.18  0 0 0 0 0.16  0 0 0 0 0.13  0 0 0 0.55 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>");background-size:320px 320px;mix-blend-mode:multiply;opacity:0.35;z-index:0}' +
        '.maif-v2 .paper-grain > *{position:relative;z-index:1}' +
        // Texture overlay on features section
        '.maif-v2 .membership-ai-features{position:relative}' +
        '.maif-v2 .membership-ai-features::before{content:\'\';position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'320\' height=\'320\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\' seed=\'3\'/><feColorMatrix values=\'0 0 0 0 0.18  0 0 0 0 0.16  0 0 0 0 0.13  0 0 0 0.55 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>");background-size:320px 320px;mix-blend-mode:multiply;opacity:0.35;z-index:0}' +
        '.maif-v2 .membership-ai-features > *{position:relative;z-index:1}' +
        // What is MAI funnel
        '.maif-v2 .mai-what{text-align:center}' +
        '.maif-v2 .mai-what .pill{display:inline-flex;align-items:center;padding:10px 22px;border-radius:100px;background:rgba(74,127,165,0.08);border:1px solid rgba(74,127,165,0.35);font-size:13px;font-weight:600;color:#4A7FA5;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:64px}' +
        '.maif-v2 .funnel{max-width:880px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 96px auto;column-gap:48px;align-items:center;justify-items:stretch;position:relative}' +
        '.maif-v2 .funnel-card{background:#F6F2E8;border:1px solid #E3DDD2;border-radius:20px;padding:32px 28px;font-size:clamp(16px,1.2vw,18px);font-weight:600;color:#2F2F2F;line-height:1.4;text-align:center;box-shadow:0 8px 28px rgba(120,110,95,0.08);min-height:108px;display:flex;align-items:center;justify-content:center}' +
        '.maif-v2 .funnel-card-left{grid-column:1;grid-row:1}' +
        '.maif-v2 .funnel-card-right{grid-column:2;grid-row:1}' +
        '.maif-v2 .funnel-connector{grid-column:1 / 3;grid-row:2;width:100%;height:100%;display:block}' +
        '.maif-v2 .funnel-result{grid-column:1 / 3;grid-row:3;justify-self:center;background:rgba(74,127,165,0.06);border:1.5px solid rgba(74,127,165,0.45);border-radius:20px;padding:28px 56px;box-shadow:0 12px 36px rgba(74,127,165,0.12);min-width:340px;text-align:center}' +
        '.maif-v2 .funnel-result span{font-size:clamp(28px,3vw,40px);font-weight:700;letter-spacing:-0.02em;line-height:1.1;background:linear-gradient(135deg,#7AA8C9 0%,#4A7FA5 35%,#35607E 70%,#1F3A51 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;display:inline-block}' +
        '.maif-v2 .section.warm.mai-what{padding:96px 32px 112px}' +
        '@media (max-width:700px){.maif-v2 .funnel{grid-template-columns:1fr;grid-template-rows:auto 56px auto 56px auto;column-gap:0;row-gap:0;max-width:420px}.maif-v2 .funnel-card-left{grid-column:1;grid-row:1}.maif-v2 .funnel-card-right{grid-column:1;grid-row:3}.maif-v2 .funnel-connector{grid-column:1;grid-row:2}.maif-v2 .funnel-connector.connector-2{grid-column:1;grid-row:4;display:block}.maif-v2 .funnel-result{grid-column:1;grid-row:5;min-width:0;width:100%}.maif-v2 .funnel-connector svg.desktop-only{display:none}.maif-v2 .funnel-connector svg.mobile-only{display:block;margin:0 auto}}' +
        '@media (min-width:701px){.maif-v2 .funnel-connector.connector-2{display:none}.maif-v2 .funnel-connector svg.mobile-only{display:none}}' +
        // Stats
        '.maif-v2 .mai-stats h2{text-align:center;margin-bottom:48px}' +
        '.maif-v2 .mai-stats .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:48px;text-align:center}' +
        '.maif-v2 .mai-stats .stat .num{font-size:clamp(48px,6vw,84px);font-weight:800;letter-spacing:-0.03em;line-height:1;background:linear-gradient(180deg,#F47C2C,#FBC02D);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}' +
        '.maif-v2 .mai-stats .stat .desc{font-size:16px;color:#8C8479;margin-top:18px;line-height:1.55;max-width:320px;margin-left:auto;margin-right:auto}' +
        // FAQ
        '.maif-v2 .mai-faq h2{text-align:center;margin-bottom:8px}' +
        '.maif-v2 .mai-faq .eyebrow{text-align:center;display:block}' +
        '.maif-v2 .mai-faq .list{margin-top:48px;border-top:1px solid #E3DDD2}' +
        '.maif-v2 .mai-faq details{border-bottom:1px solid #E3DDD2;padding:20px 0}' +
        '.maif-v2 .mai-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:24px;font-size:17px;font-weight:700;color:#2F2F2F;padding:0;transition:color .2s ease}' +
        '.maif-v2 .mai-faq summary::-webkit-details-marker{display:none}' +
        '.maif-v2 .mai-faq summary::after{content:"+";font-weight:400;font-size:24px;color:#6E6E6E;transition:transform .2s ease;flex-shrink:0}' +
        '.maif-v2 .mai-faq details[open] summary::after{content:"–"}' +
        '.maif-v2 .mai-faq summary:hover{color:#F47C2C}' +
        '.maif-v2 .mai-faq .answer{padding-top:14px;font-size:15px;color:#6E6E6E;line-height:1.65}' +
        // Mobile responsive
        '@media (max-width:600px){.maif-v2 .mai-stats .stats-grid{grid-template-columns:1fr}.maif-v2 .section{padding:64px 20px}.maif-v2 .mai-video-wrap{padding:0 20px 64px}.maif-v2 .mai-video{border-radius:18px}}'
      );
      document.head.appendChild(styleEl);
    }

    // 2. Tag body so scoped styles apply
    document.body.classList.add('maif-v2');

    // 3. (Wistia scripts intentionally NOT loaded upfront — see step 11 below
    //     for the facade pattern that loads them lazily on viewport approach + click.)

    // 4. Hero label (eyebrow pill — same blue style as production)
    var heroLabel = document.querySelector('.pf-page-hero-label');
    if (heroLabel) {
      heroLabel.textContent = 'Membership AI';
      heroLabel.style.cssText = 'display:inline-flex;align-items:center;padding:10px 22px;border-radius:100px;background:rgba(74,127,165,0.08);border:1px solid rgba(74,127,165,0.35);font-size:13px;font-weight:600;color:#4A7FA5;letter-spacing:0.08em;margin-bottom:48px;box-shadow:0 2px 8px rgba(74,127,165,0.06);text-transform:uppercase';
    } else {
      var heroTitle0 = document.querySelector('.pf-page-hero-title');
      if (heroTitle0) {
        var parent0 = heroTitle0.parentElement;
        if (!parent0.querySelector('.pf-hero-label-injected')) {
          var label = document.createElement('p');
          label.className = 'pf-hero-label-injected fade-up';
          label.style.cssText = 'display:inline-flex;align-items:center;padding:10px 22px;border-radius:100px;background:rgba(74,127,165,0.08);border:1px solid rgba(74,127,165,0.35);font-size:13px;font-weight:600;color:#4A7FA5;letter-spacing:0.08em;margin-bottom:48px;box-shadow:0 2px 8px rgba(74,127,165,0.06);text-transform:uppercase';
          label.textContent = 'Membership AI';
          parent0.insertBefore(label, heroTitle0);
        }
      }
    }

    // 5. Hero H1 + sub
    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) {
      heroHeading.innerHTML = '<span class="maif-v2-hero-accent">Membership AI</span>, for the ones who do the job of many.';
    }
    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) {
      heroSub.innerHTML = 'Meet your new teammate trained on every part of the playbook<br>and your association’s unique context.';
    }

    // 6. Hero buttons (brand spec)
    if (heroHeading) {
      var heroParent = heroHeading.parentElement;
      if (!heroParent.querySelector('.pf-hero-btns-injected')) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'pf-hero-btns-injected fade-up';
        btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:40px';
        btnWrap.innerHTML =
          '<a href="/book-a-demo" class="btn btn-primary">Meet Your AI Membership Team <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '<a href="/book-a-demo" class="btn btn-secondary">Get Started</a>';
        var sub = heroParent.querySelector('.pf-page-hero-sub');
        if (sub) { sub.parentNode.insertBefore(btnWrap, sub.nextSibling); }
        else { heroParent.appendChild(btnWrap); }
      }
    }

    // 7. Find CTA section anchor (sections inserted before it)
    var ctaSection = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (!ctaSection) return;

    // 8. Inject all sections in one go (preserves order)
    if (!document.getElementById('maif-v2-marker')) {
      var sectionsHTML =
        '<div id="maif-v2-marker" style="display:none"></div>' +
        // Video
        '<div class="mai-video-wrap"><div class="mai-video">' +
          '<button type="button" class="mai-video-poster-btn" aria-label="Play video">' +
            '<img src="https://alexhively.github.io/propfuel-webflow-custom/images/maif-poster.jpg" alt="" loading="eager" decoding="async" fetchpriority="high" />' +
            '<span class="mai-video-play" aria-hidden="true">' +
              '<svg viewBox="0 0 80 80" width="84" height="84" xmlns="http://www.w3.org/2000/svg">' +
                '<circle cx="40" cy="40" r="40" fill="rgba(255,255,255,0.96)"/>' +
                '<path d="M32 26 L32 54 L56 40 Z" fill="#1F3A51"/>' +
              '</svg>' +
            '</span>' +
          '</button>' +
        '</div></div>' +
        // Testimonial (light)
        '<section class="section warm mai-quote"><div class="container narrow"><div class="mark">“</div><blockquote>You just gave us another staff member.</blockquote><cite>Bryan Soady — Executive Director &amp; CEO, SUAA</cite></div></section>' +
        // Why MAI (dark, orange-gradient arrow + steel-blue glow on solution)
        '<section class="section dark mai-why"><div class="container">' +
          '<span class="pill">Why Membership AI</span>' +
          '<p class="why-line">Associations and membership teams are far too often understaffed and underresourced.</p>' +
          '<div class="why-arrow" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<defs><linearGradient id="maif-v2-arrow-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F47C2C"/><stop offset="100%" stop-color="#FBC02D"/></linearGradient></defs>' +
              '<line x1="12" y1="5" x2="12" y2="19" stroke="url(#maif-v2-arrow-grad)"/>' +
              '<polyline points="6 13 12 19 18 13" stroke="url(#maif-v2-arrow-grad)"/>' +
            '</svg>' +
          '</div>' +
          '<p class="why-line is-solution">AI has the power to give them the bandwidth to completely reinvigorate the industry.</p>' +
        '</div></section>' +
        // What is MAI (funnel/Y, paper grain)
        '<section class="section warm mai-what paper-grain"><div class="container">' +
          '<span class="pill">What is Membership AI</span>' +
          '<div class="funnel" role="img" aria-label="Membership AI sits at the convergence of what membership teams need most and what AI does best.">' +
            '<div class="funnel-card funnel-card-left">What membership teams need most</div>' +
            '<div class="funnel-card funnel-card-right">What AI does best</div>' +
            '<div class="funnel-connector">' +
              '<svg class="desktop-only" viewBox="0 0 600 96" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">' +
                '<line x1="170" y1="4" x2="285" y2="92" stroke="rgba(74,127,165,0.45)" stroke-width="1.25" stroke-linecap="round"/>' +
                '<line x1="430" y1="4" x2="315" y2="92" stroke="rgba(74,127,165,0.45)" stroke-width="1.25" stroke-linecap="round"/>' +
              '</svg>' +
              '<svg class="mobile-only" viewBox="0 0 24 56" width="24" height="56" aria-hidden="true">' +
                '<line x1="12" y1="4" x2="12" y2="52" stroke="rgba(74,127,165,0.45)" stroke-width="1.25" stroke-linecap="round"/>' +
              '</svg>' +
            '</div>' +
            '<div class="funnel-connector connector-2">' +
              '<svg class="mobile-only" viewBox="0 0 24 56" width="24" height="56" aria-hidden="true">' +
                '<line x1="12" y1="4" x2="12" y2="52" stroke="rgba(74,127,165,0.45)" stroke-width="1.25" stroke-linecap="round"/>' +
              '</svg>' +
            '</div>' +
            '<div class="funnel-result"><span>Membership&nbsp;AI</span></div>' +
          '</div>' +
        '</div></section>' +
        // Features mount (rendered by renderMembershipAIFeatures)
        '<section id="maif-v2-features-mount" class="membership-ai-features"></section>' +
        // Stats (3-stat orange-yellow gradient)
        '<section class="section dark mai-stats">' +
          '<div class="container medium" style="text-align:center"><p class="eyebrow">Results</p><h2 class="h2">The numbers — even before the full AI layer.</h2></div>' +
          '<div class="container medium" style="margin-top:48px"><div class="stats-grid">' +
            '<div class="stat"><div class="num">8.68%</div><div class="desc">Average first-year revenue growth</div></div>' +
            '<div class="stat"><div class="num">$100M+</div><div class="desc">Revenue growth across clients</div></div>' +
            '<div class="stat"><div class="num">72%</div><div class="desc">Of declining orgs reversed course</div></div>' +
          '</div></div>' +
        '</section>' +
        // FAQ
        '<section class="section mai-faq">' +
          '<div class="container narrow">' +
            '<p class="eyebrow">FAQ</p>' +
            '<h2 class="h2">Common questions about Membership AI.</h2>' +
            '<div class="list">' +
              '<details><summary>Most churn is decided in the first 30 days. Can Membership AI actually move that needle?</summary><p class="answer">Yes — that’s exactly where it shines. Engagement patterns in a member’s first month predict retention better than any other window. Membership AI watches every signal from sign-up forward — what they opened, what they ignored, where they got stuck — and surfaces at-risk members weeks before they show up in your churn report. By the time someone is “at-risk” in a spreadsheet, it’s already late. We flag them while there’s still time to re-engage.</p></details>' +
              '<details><summary>We don’t have a data analyst. Can our membership director actually use this?</summary><p class="answer">That’s exactly who it’s built for. There’s no SQL, no dashboard authoring, no analyst required. You describe what you want in plain English — “members who attended last year’s conference but haven’t engaged this quarter” — and Membership AI builds the segment, drafts the campaign, and queues it for your review. Your team brings judgment. The system does the analytical work.</p></details>' +
              '<details><summary>How is this different from ChatGPT or other general-purpose AI tools?</summary><p class="answer">General AI doesn’t know your AMS schema, your renewal cycle, which committees matter to which members, or what worked in last year’s win-back campaign. Membership AI is purpose-built for associations and operates inside PropFuel — where your member data, campaign history, and engagement signals already live. It carries your association’s context the way a long-tenured staff member would.</p></details>' +
              '<details><summary>What kind of results have other associations seen?</summary><p class="answer">PropFuel clients have generated $100M+ in additional revenue, with $650K average first-year growth per organization. 72% of declining associations reverse course after implementing PropFuel. AAMFT moved from 80.5% to 95% on-time renewals. Membership AI accelerates these outcomes by identifying opportunities your team would miss and executing faster than any manual workflow.</p></details>' +
              '<details><summary>What happens to our institutional knowledge when staff turn over?</summary><p class="answer">When a membership director leaves today, the institutional memory walks out the door with them — every member context, every campaign learning, every nuance about which board member cares about what. With Membership AI, the intelligence lives in the platform, not in people. A new hire is productive on day one because PropFuel already knows the member history, the campaign performance, and the recommended next actions.</p></details>' +
              '<details><summary>How long until we see results?</summary><p class="answer">First campaign live in 2–3 weeks. Full ramp-up in 2–3 months. Staff training takes 10–45 minutes. You get a dedicated Customer Success Manager with a sub-3-hour response time. PropFuel’s onboarding has been recognized with an ASAE Gold Circle Award.</p></details>' +
            '</div>' +
          '</div>' +
        '</section>';
      ctaSection.insertAdjacentHTML('beforebegin', sectionsHTML);

      // Mount features section now that the host element exists
      var featSec = document.getElementById('maif-v2-features-mount');
      if (featSec && typeof renderMembershipAIFeatures === 'function') {
        renderMembershipAIFeatures(featSec);
      }
    }

    // 9. Override CTA section to dark mode + new copy
    if (ctaSection && !ctaSection.classList.contains('maif-v2-cta-staged')) {
      ctaSection.classList.add('maif-v2-cta-staged');
      ctaSection.style.background = '#1A1713';
      ctaSection.style.color = '#EDE8DF';
      var ctaHeading = ctaSection.querySelector('.pf-cta-heading');
      if (ctaHeading) {
        ctaHeading.style.color = '#EDE8DF';
        ctaHeading.innerHTML = 'Meet your AI <br><span style="background:linear-gradient(135deg,#7AA8C9 0%,#4A7FA5 35%,#35607E 70%,#1F3A51 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">membership team.</span>';
      }
      var ctaSub = ctaSection.querySelector('.pf-cta-sub');
      if (ctaSub) {
        ctaSub.style.color = '#A8A097';
        ctaSub.textContent = 'Membership AI knows your members. It tells you what matters. It builds what you need. And it does it without asking you to add headcount, learn analytics, or spend weeks building campaigns.';
      }
    }

    // 10. Hide original Webflow Insight/Initiative/Recommendation feature sections
    document.querySelectorAll('.pf-section').forEach(function(s) {
      var t = s.querySelector('.pf-feature-title, h2');
      if (t) {
        var txt = t.textContent.trim();
        if (txt.indexOf('Insight Agent') !== -1 || txt.indexOf('Initiative') !== -1 || txt.indexOf('Recommendation') !== -1) {
          s.style.display = 'none';
        }
      }
    });

    // 11. Wistia video facade — load scripts lazily, swap player on click.
    //     Page lands with a static poster image (zero custom-element flash, zero
    //     letterbox bands). Scripts preload when the video nears the viewport so
    //     click-to-play feels instant. Replacing the button with <wistia-player>
    //     happens inside the same .mai-video container so border-radius/shadow
    //     persist seamlessly.
    var posterBtn = document.querySelector('.maif-v2 .mai-video-poster-btn');
    if (posterBtn) {
      var wistiaRequested = false;
      function loadWistiaScripts() {
        if (wistiaRequested) return;
        wistiaRequested = true;
        if (!document.querySelector('script[data-maif-wistia="player"]')) {
          var s1 = document.createElement('script');
          s1.src = 'https://fast.wistia.com/player.js';
          s1.async = true;
          s1.setAttribute('data-maif-wistia', 'player');
          document.head.appendChild(s1);
        }
        if (!document.querySelector('script[data-maif-wistia="media"]')) {
          var s2 = document.createElement('script');
          s2.src = 'https://fast.wistia.com/embed/vpndoabz9k.js';
          s2.async = true;
          s2.type = 'module';
          s2.setAttribute('data-maif-wistia', 'media');
          document.head.appendChild(s2);
        }
      }
      // Preload when section nears viewport so click → play is near-instant
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function(entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) { loadWistiaScripts(); io.disconnect(); break; }
          }
        }, { rootMargin: '600px 0px' });
        io.observe(posterBtn);
      } else {
        loadWistiaScripts();
      }
      // Click swaps the poster for the real player and autoplays
      posterBtn.addEventListener('click', function() {
        loadWistiaScripts();
        var player = document.createElement('wistia-player');
        player.setAttribute('media-id', 'vpndoabz9k');
        player.setAttribute('aspect', '1.7777777777777777');
        player.setAttribute('autoplay', 'true');
        var parent = posterBtn.parentNode;
        if (parent) parent.replaceChild(player, posterBtn);
      });
    }
  }

  // ─────────────────────────────────────────
  function fixMembershipAIPage() {
    if (window.location.pathname.indexOf('membership-ai') === -1) return;
    // PROD + STAGING: render the new Membership AI design (formerly the staging-only path).
    // The legacy code below is now unreachable but is left in place as a safe rollback target —
    // restore the previous hostname gate to fall back if anything goes wrong on production.
    return renderMembershipAIPageStaging();

    // Fix hero label — blue steel styling
    var heroLabel = document.querySelector('.pf-page-hero-label');
    if (heroLabel) {
      heroLabel.textContent = 'Membership AI';
      heroLabel.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(74,127,165,0.08);border:1px solid rgba(74,127,165,0.35);font-size:13px;font-weight:600;color:#4A7FA5;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(74,127,165,0.06)';
    } else {
      var heroTitle = document.querySelector('.pf-page-hero-title');
      if (heroTitle) {
        var parent = heroTitle.parentElement;
        if (!parent.querySelector('.pf-hero-label-injected')) {
          var label = document.createElement('p');
          label.className = 'pf-hero-label-injected fade-up';
          label.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(74,127,165,0.08);border:1px solid rgba(74,127,165,0.35);font-size:13px;font-weight:600;color:#4A7FA5;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(74,127,165,0.06)';
          label.textContent = 'Membership AI';
          parent.insertBefore(label, heroTitle);
        }
      }
    }

    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) {
      heroHeading.innerHTML = 'Intelligence that connects everything.';
    }

    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) {
      heroSub.textContent = 'A 24/7/365 resource monitoring everything in PropFuel \u2014 summarizing metrics, identifying signals, and building campaigns for your team to review and launch.';
    }

    if (heroHeading) {
      var heroParent = heroHeading.parentElement;
      if (!heroParent.querySelector('.pf-hero-btns-injected')) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'pf-hero-btns-injected fade-up';
        btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';
        btnWrap.innerHTML =
          '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Meet Your AI Membership Team <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '<a href="/book-a-demo" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#4A7FA5;border:1.5px solid rgba(74,127,165,0.35);transition:border-color .25s ease,box-shadow .25s ease">Get Started</a>';
        var sub = heroParent.querySelector('.pf-page-hero-sub');
        if (sub) { sub.parentNode.insertBefore(btnWrap, sub.nextSibling); }
        else { heroParent.appendChild(btnWrap); }
      }
    }

    // Hero AI Dashboard Mockup — always create new container (don't use .pf-feature-visual which may be inside a hidden section)
    var heroVisual = document.querySelector('.mai-hero-mockup');
    if (!heroVisual) {
      var btns = document.querySelector('.pf-hero-btns-injected');
      var heroArea = btns ? btns.parentElement : (heroHeading ? heroHeading.parentElement : null);
      if (heroArea) {
        heroVisual = document.createElement('div');
        heroVisual.className = 'mai-hero-mockup';
        heroVisual.style.cssText = 'margin:48px auto 0;max-width:960px;padding:0 24px';
        heroArea.appendChild(heroVisual);
      }
    }
    if (heroVisual && !heroVisual.querySelector('.mai-dashboard')) {
      var mockupWrap = document.createElement('div');
      mockupWrap.className = 'mai-dashboard';
      mockupWrap.innerHTML =
        '<div style="width:100%;background:#1C1C1C;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.15);font-family:\'DM Sans\',sans-serif;padding:32px;box-sizing:border-box;">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;"><div style="width:10px;height:10px;border-radius:50%;background:#E53935;"></div><div style="width:10px;height:10px;border-radius:50%;background:#FBC02D;"></div><div style="width:10px;height:10px;border-radius:50%;background:#43A047;"></div><div style="flex:1;height:28px;background:rgba(255,255,255,0.08);border-radius:8px;margin-left:12px;display:flex;align-items:center;padding:0 12px;"><span style="font-size:11px;color:rgba(255,255,255,0.35);">Membership AI Dashboard</span></div></div>' +
          '<div style="display:flex;gap:16px;flex:1;">' +
            '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:12px;padding:20px;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.08);"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#4A7FA5,#35607E);display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div><div style="font-size:13px;font-weight:700;color:#fff;">Insights Agent</div><div style="font-size:10px;color:rgba(255,255,255,0.4);">Monitoring signals</div></div><div style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:#43A047;box-shadow:0 0 6px #43A047;"></div></div><svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none" style="margin-bottom:12px;"><polyline points="0,45 30,38 60,42 90,25 120,30 150,15 180,20 200,8" fill="none" stroke="#4A7FA5" stroke-width="2.5" stroke-linecap="round"/><polyline points="0,50 30,48 60,50 90,40 120,38 150,35 180,32 200,28" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round"/></svg><div style="font-size:10px;color:rgba(255,255,255,0.3);line-height:1.6;"><div style="display:flex;justify-content:space-between;"><span>At-risk members</span><span style="color:#4A7FA5;">47</span></div><div style="display:flex;justify-content:space-between;"><span>Engagement trend</span><span style="color:#43A047;">+12%</span></div><div style="display:flex;justify-content:space-between;"><span>Sentiment shift</span><span style="color:#35607E;">-3pts</span></div></div></div>' +
            '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:12px;padding:20px;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.08);"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#35607E,#1F3A51);display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div><div><div style="font-size:13px;font-weight:700;color:#fff;">Recommendations</div><div style="font-size:10px;color:rgba(255,255,255,0.4);">3 actions ready</div></div><div style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:#4A7FA5;box-shadow:0 0 6px #4A7FA5;"></div></div><div style="display:flex;flex-direction:column;gap:8px;"><div style="background:rgba(74,127,165,0.1);border:1px solid rgba(74,127,165,0.2);border-radius:8px;padding:10px 12px;font-size:10px;color:rgba(255,255,255,0.6);line-height:1.4;"><div style="color:#4A7FA5;font-weight:600;margin-bottom:3px;">High Priority</div>Launch win-back for 47 at-risk members</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px 12px;font-size:10px;color:rgba(255,255,255,0.5);line-height:1.4;"><div style="color:#35607E;font-weight:600;margin-bottom:3px;">Medium</div>Send certification nudge to 120 eligible</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px 12px;font-size:10px;color:rgba(255,255,255,0.5);line-height:1.4;"><div style="color:rgba(255,255,255,0.3);font-weight:600;margin-bottom:3px;">Suggestion</div>Update stale profiles via data refresh</div></div></div>' +
            '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:12px;padding:20px;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.08);"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#43A047,#2E7D32);display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div><div style="font-size:13px;font-weight:700;color:#fff;">Initiative Builder</div><div style="font-size:10px;color:rgba(255,255,255,0.4);">Drafting campaigns</div></div><div style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:#43A047;box-shadow:0 0 6px #43A047;"></div></div><div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:14px;border:1px solid rgba(255,255,255,0.06);margin-bottom:10px;"><div style="font-size:11px;color:rgba(255,255,255,0.6);font-weight:600;margin-bottom:8px;">Win-Back Campaign Draft</div><div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;"><div style="width:24px;height:24px;border-radius:6px;background:rgba(74,127,165,0.15);display:flex;align-items:center;justify-content:center;font-size:9px;color:#4A7FA5;font-weight:700;">Q1</div><div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;"><div style="width:70%;height:100%;background:#4A7FA5;border-radius:3px;"></div></div></div><div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;"><div style="width:24px;height:24px;border-radius:6px;background:rgba(53,96,126,0.15);display:flex;align-items:center;justify-content:center;font-size:9px;color:#35607E;font-weight:700;">Q2</div><div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;"><div style="width:40%;height:100%;background:#35607E;border-radius:3px;"></div></div></div><div style="display:flex;align-items:center;gap:6px;"><div style="width:24px;height:24px;border-radius:6px;background:rgba(67,160,71,0.15);display:flex;align-items:center;justify-content:center;font-size:9px;color:#43A047;font-weight:700;">Q3</div><div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;"><div style="width:15%;height:100%;background:#43A047;border-radius:3px;"></div></div></div></div><div style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center;margin-top:auto;"><span style="color:#43A047;">Ready for review</span> \u00b7 3 campaigns drafted</div></div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:0;margin-top:16px;"><div style="flex:1;height:2px;background:linear-gradient(90deg,transparent,#4A7FA5);border-radius:1px;"></div><div style="width:10px;height:10px;border-radius:50%;background:#4A7FA5;flex-shrink:0;"></div><div style="flex:1;height:2px;background:linear-gradient(90deg,#4A7FA5,#35607E);border-radius:1px;"></div><div style="width:10px;height:10px;border-radius:50%;background:#35607E;flex-shrink:0;"></div><div style="flex:1;height:2px;background:linear-gradient(90deg,#35607E,#43A047);border-radius:1px;"></div><div style="width:10px;height:10px;border-radius:50%;background:#43A047;flex-shrink:0;"></div><div style="flex:1;height:2px;background:linear-gradient(90deg,#43A047,transparent);border-radius:1px;"></div></div>' +
        '</div>';
      heroVisual.innerHTML = '';
      heroVisual.appendChild(mockupWrap);
      heroVisual.style.background = '#1C1C1C';
      heroVisual.style.borderRadius = '20px';
      heroVisual.style.padding = '0';
    }

    // Inject sections before CTA
    var ctaSection = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (!ctaSection) return;

    // STAGING-ONLY gate: on propfuel-v2.webflow.io, the new Features section
    // replaces progression/three-agents/staff-turnover and removes related-use-cases.
    // Production (propfuel.com) is structurally untouched until this gate is removed.
    var __maifStaging = location.hostname.indexOf('webflow.io') !== -1;

    // Problem Band
    if (!document.querySelector('.mai-problem-band')) {
      var problemHTML = '<section class="mai-problem-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:800px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4A7FA5;margin-bottom:16px">The Problem</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:32px">You have the data. You don\u2019t have the answers.</h2><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">Your AMS has 47 fields per member. Your email tool has open rates. Your spreadsheet has last year\u2019s renewal numbers. Your head has the institutional knowledge about which members care about what.</p><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">None of it connects. None of it tells you what to do next. And none of it helps you explain to the board why 200 members didn\u2019t renew.</p><p style="font-size:17px;color:#8C8479;line-height:1.65"><strong style="color:#EDE8DF">\u201CIn the absence of data, blame defaults to marketing.\u201D</strong> \u2014 TXCPA customer interview</p></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1100px;margin:48px auto 0"><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px 24px"><h4 style="font-size:16px;font-weight:700;color:#D0DFEA;margin-bottom:10px">Data but no insight</h4><p style="font-size:14px;color:#8C8479;line-height:1.55">Thousands of data points captured across PropFuel and your AMS \u2014 but someone still has to figure out what it all means.</p></div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px 24px"><h4 style="font-size:16px;font-weight:700;color:#D0DFEA;margin-bottom:10px">Individuals treated the same</h4><p style="font-size:14px;color:#8C8479;line-height:1.55">You know you should communicate differently to different members. What stops you isn\u2019t desire \u2014 it\u2019s the work of building segments and campaign variants.</p></div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px 24px"><h4 style="font-size:16px;font-weight:700;color:#D0DFEA;margin-bottom:10px">Want to act but don\u2019t know what</h4><p style="font-size:14px;color:#8C8479;line-height:1.55">Fear of failure. Fear of being inundated with responses. You need a guide, not just a tool.</p></div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px 24px"><h4 style="font-size:16px;font-weight:700;color:#D0DFEA;margin-bottom:10px">Can\u2019t prove ROI to the board</h4><p style="font-size:14px;color:#8C8479;line-height:1.55">Every source surfaces the same emotional job: feel confident presenting to leadership with hard data, not anecdotes.</p></div></div></section>';
      ctaSection.insertAdjacentHTML('beforebegin', problemHTML);
    }

    // STAGING: insert new Features section between problem band and stats.
    if (__maifStaging && !document.querySelector('.membership-ai-features')) {
      var featSec = document.createElement('section');
      featSec.className = 'membership-ai-features';
      var pbForFeat = document.querySelector('.mai-problem-band');
      if (pbForFeat) { pbForFeat.insertAdjacentElement('afterend', featSec); }
      else { ctaSection.insertAdjacentElement('beforebegin', featSec); }
      renderMembershipAIFeatures(featSec);
    }

    // Progression — PRODUCTION ONLY (skip on staging; new Features section replaces it)
    if (!__maifStaging && !document.querySelector('.mai-progression')) {
      var progressionHTML = '<section class="mai-progression" style="padding:96px 48px;max-width:1100px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4A7FA5;margin-bottom:16px">The Progression</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">Know. Act. Build. Grow.</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center"><div><p style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4A7FA5,#35607E);color:#fff;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">1</p><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">Know Your Members</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Not as a monolith. As individuals. Know what they want, what they\u2019re getting, and what they\u2019re not.</p></div><div><p style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4A7FA5,#35607E);color:#fff;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">2</p><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">Know What to Do Next</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Without guesswork. Without hoping the campaign you built is the right one. With data-backed confidence.</p></div><div><p style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4A7FA5,#35607E);color:#fff;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">3</p><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">Build It Automatically</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Without adding headcount. Without spending weeks configuring campaigns. Review and approve \u2014 don\u2019t build from scratch.</p></div><div><p style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4A7FA5,#35607E);color:#fff;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">4</p><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">Membership Grows Itself</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">When every member believes the association understands them, engagement becomes natural. Retention follows. Growth follows.</p></div></div></section>';
      var pb = document.querySelector('.mai-problem-band');
      if (pb) { pb.insertAdjacentHTML('afterend', progressionHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', progressionHTML); }
    }

    // Three AI Agents — PRODUCTION ONLY
    if (!__maifStaging && !document.querySelector('.mai-agents')) {
      var agentsHTML = '<section class="mai-agents" style="padding:96px 48px;max-width:1200px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4A7FA5;margin-bottom:16px">Three AI Agents</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Meet the team that never sleeps.</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:48px"><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 28px;border-top:4px solid #4A7FA5"><p style="font-size:15px;font-weight:600;color:#4A7FA5;font-style:italic;margin-bottom:12px">\u201CWhat do I need to know?\u201D</p><h3 style="font-size:22px;font-weight:800;color:#2F2F2F;margin-bottom:16px">Insight Agent</h3><p style="font-size:15px;color:#6E6E6E;line-height:1.65;margin-bottom:20px">Continuously monitors everything \u2014 member responses, engagement rates, website activity, AMS data, campaign performance \u2014 and surfaces what matters. Not a dashboard of numbers. A clear picture of what is happening and why.</p><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px"><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#4A7FA5">\u2022</span>Surfaces calculated metrics across segments \u2014 engagement, response rate, deliverability, trends</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#4A7FA5">\u2022</span>Identifies at-risk members before they lapse with AI-powered signals</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#4A7FA5">\u2022</span>Detects trends and anomalies you wouldn\u2019t catch manually</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#4A7FA5">\u2022</span>Builds Super Member Profiles \u2014 a complete picture of every individual</li></ul></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 28px;border-top:4px solid #35607E"><p style="font-size:15px;font-weight:600;color:#35607E;font-style:italic;margin-bottom:12px">\u201CWhat should I do next?\u201D</p><h3 style="font-size:22px;font-weight:800;color:#2F2F2F;margin-bottom:16px">Recommendation Agent</h3><p style="font-size:15px;color:#6E6E6E;line-height:1.65;margin-bottom:20px">Identifies the highest-impact opportunities for engagement at any given moment \u2014 which segments need attention, which campaigns will move the needle, which members need personal outreach.</p><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px"><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#35607E">\u2022</span>Identifies highest-impact engagement opportunities</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#35607E">\u2022</span>Generates personalized 1:1 messages based on member profiles</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#35607E">\u2022</span>Provides specific, prioritized recommendations \u2014 not dashboards</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#35607E">\u2022</span>Reduces fear of execution \u2014 confidence from data, not hunches</li></ul></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 28px;border-top:4px solid #1F3A51"><p style="font-size:15px;font-weight:600;color:#1F3A51;font-style:italic;margin-bottom:12px">\u201CCan you just build it for me?\u201D</p><h3 style="font-size:22px;font-weight:800;color:#2F2F2F;margin-bottom:16px">Initiative Agent</h3><p style="font-size:15px;color:#6E6E6E;line-height:1.65;margin-bottom:20px">Doesn\u2019t just recommend campaigns \u2014 it builds them. Across email, website, and SMS. With the right segments already populated. Ready for your team to review, approve, and launch.</p><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px"><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#1F3A51">\u2022</span>Builds campaigns automatically across all three channels</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#1F3A51">\u2022</span>Pre-populates segments based on AI analysis</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#1F3A51">\u2022</span>Walks staff through campaigns with visual review before launch</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#1F3A51">\u2022</span>Organizes campaigns under unified strategic Initiatives</li><li style="font-size:14px;color:#2F2F2F;line-height:1.5;padding-left:18px;position:relative"><span style="position:absolute;left:0;color:#1F3A51">\u2022</span>Learns from results and refines every recommendation</li></ul></div></div><div style="display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;padding:24px 0"><span style="font-size:14px;font-weight:600;color:#4A7FA5;background:rgba(74,127,165,0.08);padding:10px 20px;border-radius:100px;border:1px solid rgba(74,127,165,0.15)">Insight surfaces what matters</span><span style="font-size:18px;color:#D0DFEA">\u2192</span><span style="font-size:14px;font-weight:600;color:#35607E;background:rgba(53,96,126,0.08);padding:10px 20px;border-radius:100px;border:1px solid rgba(53,96,126,0.15)">Recommendation tells you what to do</span><span style="font-size:18px;color:#D0DFEA">\u2192</span><span style="font-size:14px;font-weight:600;color:#1F3A51;background:rgba(31,58,81,0.08);padding:10px 20px;border-radius:100px;border:1px solid rgba(31,58,81,0.15)">Initiative builds it</span><span style="font-size:18px;color:#D0DFEA">\u2192</span><span style="font-size:14px;font-weight:600;color:#2F2F2F;background:rgba(47,47,47,0.05);padding:10px 20px;border-radius:100px;border:1px solid rgba(47,47,47,0.12)">You review and launch</span></div></section>';
      var prog = document.querySelector('.mai-progression');
      if (prog) { prog.insertAdjacentHTML('afterend', agentsHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', agentsHTML); }
    }

    // Staff Turnover — PRODUCTION ONLY
    if (!__maifStaging && !document.querySelector('.mai-turnover')) {
      var turnoverHTML = '<section class="mai-turnover" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center"><div><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4A7FA5;margin-bottom:16px">The Staff Turnover Problem</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:24px">The knowledge doesn\u2019t walk out the door.</h2><p style="font-size:16px;color:#6E6E6E;line-height:1.65;margin-bottom:16px">When a membership director leaves, the institutional knowledge walks out with them. Who are the at-risk members? What worked last renewal season? Which board member cares about certification revenue?</p><p style="font-size:16px;color:#2F2F2F;line-height:1.65;font-weight:600;margin-bottom:16px">With Membership AI, the intelligence lives in the platform \u2014 not in people.</p><p style="font-size:16px;color:#6E6E6E;line-height:1.65">PropFuel knows the member history. It knows the account objectives. It knows what campaigns have been run, what worked, what didn\u2019t, and what should happen next. A new staff member can be effective from day one.</p></div><div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 16px rgba(0,0,0,0.06);font-family:\'DM Sans\',sans-serif"><div style="display:flex;align-items:center;gap:12px;margin-bottom:20px"><div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#4A7FA5,#35607E);display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F">New Staff Member \u2014 Day One</div><div style="font-size:11px;color:#6E6E6E">Full AI-powered context available</div></div></div><div style="display:flex;flex-direction:column;gap:10px"><div style="background:#F6F2E8;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:8px;background:rgba(74,127,165,0.1);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A7FA5" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div><div style="font-size:12px;font-weight:600;color:#2F2F2F">Member History</div><div style="font-size:10px;color:#6E6E6E">Full engagement timeline per member</div></div></div><div style="background:#F6F2E8;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:8px;background:rgba(53,96,126,0.1);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#35607E" stroke-width="2.5"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div><div><div style="font-size:12px;font-weight:600;color:#2F2F2F">Campaign Performance</div><div style="font-size:10px;color:#6E6E6E">What worked and what didn\u2019t</div></div></div><div style="background:#F6F2E8;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:8px;background:rgba(31,58,81,0.1);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F3A51" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div><div style="font-size:12px;font-weight:600;color:#2F2F2F">Recommended Actions</div><div style="font-size:10px;color:#6E6E6E">What should happen next</div></div></div></div></div></div></section>';
      var ag = document.querySelector('.mai-agents');
      if (ag) { ag.insertAdjacentHTML('afterend', turnoverHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', turnoverHTML); }
    }

    // Stats Band
    if (!document.querySelector('.mai-stats-band')) {
      var statsHTML = '<section class="mai-stats-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#D0DFEA;margin-bottom:16px">Results</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">The numbers \u2014 even before the full AI layer.</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px"><div><p class="ai-gradient-text" style="font-size:clamp(36px,5vw,48px);font-weight:900;letter-spacing:-0.03em;line-height:1">$100M+</p><p style="font-size:13px;font-weight:600;color:#4A7FA5;margin-top:8px">All Clients</p><p style="font-size:14px;color:#8C8479;margin-top:4px;line-height:1.5">Revenue growth across PropFuel clients.</p></div><div><p class="ai-gradient-text" style="font-size:clamp(36px,5vw,48px);font-weight:900;letter-spacing:-0.03em;line-height:1">$650K</p><p style="font-size:13px;font-weight:600;color:#4A7FA5;margin-top:8px">Average</p><p style="font-size:14px;color:#8C8479;margin-top:4px;line-height:1.5">Average first-year revenue growth per client.</p></div><div><p class="ai-gradient-text" style="font-size:clamp(36px,5vw,48px);font-weight:900;letter-spacing:-0.03em;line-height:1">72%</p><p style="font-size:13px;font-weight:600;color:#4A7FA5;margin-top:8px">Declining Orgs</p><p style="font-size:14px;color:#8C8479;margin-top:4px;line-height:1.5">Of declining organizations reversed course after implementing PropFuel.</p></div><div><p class="ai-gradient-text" style="font-size:clamp(36px,5vw,48px);font-weight:900;letter-spacing:-0.03em;line-height:1">95%</p><p style="font-size:13px;font-weight:600;color:#4A7FA5;margin-top:8px">AAMFT</p><p style="font-size:14px;color:#8C8479;margin-top:4px;line-height:1.5">On-time renewal rate \u2014 up from 80.5%.</p></div></div></div></section>';
      var to = document.querySelector('.mai-turnover');
      if (to) { to.insertAdjacentHTML('afterend', statsHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', statsHTML); }
    }

    // Roadmap — REMOVED per feedback (no public dated roadmap)
    if (false && !document.querySelector('.mai-roadmap')) {
      var roadmapHTML = '<section class="mai-roadmap" style="padding:96px 48px;max-width:1100px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4A7FA5;margin-bottom:16px">Roadmap</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">What\u2019s live vs. what\u2019s coming.</h2></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:48px"><div><h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:24px;display:flex;align-items:center;gap:10px"><span style="width:10px;height:10px;border-radius:50%;background:#43A047;box-shadow:0 0 6px #43A047;display:inline-block"></span> Live Now</h3><div style="display:flex;flex-direction:column;gap:16px"><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#43A047;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Insights Page</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Campaign and engagement analytics with real-time performance metrics.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#43A047;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">AI-Powered Response Analysis</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Automatic categorization and sentiment scoring of member responses at scale.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#43A047;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Campaign Blueprints with AI Generation</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">70+ pre-built campaign templates with AI-assisted content generation.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#43A047;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">All Engagement Engine Features</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Full email, website, and SMS engagement across all channels.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#43A047;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">All Automation Engine Features</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Drip campaigns, workflows, conditional logic, and AMS write-backs.</p></div></div></div></div><div><h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:24px;display:flex;align-items:center;gap:10px"><span style="width:10px;height:10px;border-radius:50%;background:#4A7FA5;box-shadow:0 0 6px #4A7FA5;display:inline-block"></span> Coming Soon</h3><div style="display:flex;flex-direction:column;gap:16px"><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#4A7FA5;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Segments <span style="font-size:11px;font-weight:600;color:#4A7FA5;background:rgba(74,127,165,0.1);padding:2px 8px;border-radius:6px;margin-left:6px">In Progress</span></h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Contact grouping by demographics and behavior for targeted engagement.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#4A7FA5;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Signals <span style="font-size:11px;font-weight:600;color:#4A7FA5;background:rgba(74,127,165,0.1);padding:2px 8px;border-radius:6px;margin-left:6px">In Progress</span></h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">AI-powered behavioral and semantic observations that surface what matters.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#4A7FA5;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Client Details and Goals <span style="font-size:11px;font-weight:600;color:#4A7FA5;background:rgba(74,127,165,0.1);padding:2px 8px;border-radius:6px;margin-left:6px">March 2026</span></h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Measurable goal tracking aligned to your association\u2019s priorities.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#4A7FA5;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Super Contact Profile <span style="font-size:11px;font-weight:600;color:#4A7FA5;background:rgba(74,127,165,0.1);padding:2px 8px;border-radius:6px;margin-left:6px">April 2026</span></h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Full individual member view with demographics, activity, sentiment, and signals.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#4A7FA5;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Insights Summaries <span style="font-size:11px;font-weight:600;color:#4A7FA5;background:rgba(74,127,165,0.1);padding:2px 8px;border-radius:6px;margin-left:6px">May 2026</span></h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">AI-driven metric interpretation with actionable recommendations.</p></div></div><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:8px;height:8px;border-radius:50%;background:#4A7FA5;margin-top:6px;flex-shrink:0"></span><div><h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Initiatives <span style="font-size:11px;font-weight:600;color:#4A7FA5;background:rgba(74,127,165,0.1);padding:2px 8px;border-radius:6px;margin-left:6px">July 2026</span></h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5">Campaigns grouped under unified strategic goals for coordinated execution.</p></div></div></div></div></div></section>';
      var sb = document.querySelector('.mai-stats-band');
      if (sb) { sb.insertAdjacentHTML('afterend', roadmapHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', roadmapHTML); }
    }

    // Testimonial
    if (!document.querySelector('.mai-testimonials')) {
      var testimonialHTML = '<section class="mai-testimonials" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:800px;margin:0 auto;text-align:center"><div style="font-size:72px;font-weight:900;color:#D0DFEA;line-height:1;margin-bottom:-8px">\u201C</div><blockquote style="font-size:clamp(18px,2.5vw,24px);font-weight:500;color:#2F2F2F;line-height:1.5;font-style:italic;margin-bottom:20px">I never thought we would have the bandwidth to create an effective engagement program for our members, but PropFuel\u2019s service was invaluable helping us get set up quickly.</blockquote><cite style="font-size:14px;font-weight:600;color:#6E6E6E;font-style:normal">Liliana Arguello, Director of Membership, PIHRA</cite></div></section>';
      var rm = document.querySelector('.mai-roadmap');
      if (rm) { rm.insertAdjacentHTML('afterend', testimonialHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', testimonialHTML); }
    }

    // FAQ
    if (!document.querySelector('.mai-faq')) {
      var faqHTML = '<section class="mai-faq pf-faq-section" style="padding:96px 48px"><div style="max-width:800px;margin:0 auto"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4A7FA5;margin-bottom:16px;text-align:center">FAQ</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:48px;text-align:center">Common questions about Membership AI.</h2>' +
        '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:20px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">Is Membership AI a separate product?</button><div class="pf-faq-answer" style="display:none;padding-top:12px"><p style="font-size:15px;color:#6E6E6E;line-height:1.65">No. Membership AI is the intelligence layer that powers all of PropFuel. It is not a standalone add-on \u2014 it is the evolution of the platform. The three engines (Insights, Automation, Engagement) are the architecture. Membership AI is the intelligence that makes them smarter over time.</p></div></div>' +
        '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:20px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">Will Membership AI replace my team?</button><div class="pf-faq-answer" style="display:none;padding-top:12px"><p style="font-size:15px;color:#6E6E6E;line-height:1.65">No. Membership AI does the analytical and operational work that your team doesn\u2019t have bandwidth for \u2014 interpreting data, building segments, drafting campaigns. Your team brings judgment, context, and the human touch. The system builds it. You approve and launch.</p></div></div>' +
        '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:20px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">How is PropFuel different from ChatGPT or other AI tools?</button><div class="pf-faq-answer" style="display:none;padding-top:12px"><p style="font-size:15px;color:#6E6E6E;line-height:1.65">General-purpose AI tools don\u2019t understand the association context \u2014 member lifecycles, renewal cycles, onboarding journeys, or how engagement data connects to retention. Membership AI is purpose-built for associations. It is trained on the patterns that matter to membership teams and operates within the PropFuel platform where the data, campaigns, and member profiles already live.</p></div></div>' +
        '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:20px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">What kind of results can we expect?</button><div class="pf-faq-answer" style="display:none;padding-top:12px"><p style="font-size:15px;color:#6E6E6E;line-height:1.65">PropFuel clients see 10-15% response rates (5-6x industry average), average first-year revenue growth of $650K, and 72% of declining organizations reverse course. Membership AI amplifies these results by identifying opportunities your team would miss and executing faster than any manual process.</p></div></div>' +
        '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:20px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">How long does it take to get started?</button><div class="pf-faq-answer" style="display:none;padding-top:12px"><p style="font-size:15px;color:#6E6E6E;line-height:1.65">First campaign live in 2-3 weeks. Full ramp-up in 2-3 months. Staff training takes 10-45 minutes. You get a dedicated Customer Success Manager with less than 3-hour response time. PropFuel\u2019s onboarding has been recognized with an ASAE Gold Circle Award.</p></div></div>' +
      '</div></section>';
      var te = document.querySelector('.mai-testimonials');
      if (te) { te.insertAdjacentHTML('afterend', faqHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', faqHTML); }
    }

    // Related Use Cases — PRODUCTION ONLY (removed on staging per design)
    if (!__maifStaging && !document.querySelector('.mai-related')) {
      var relatedHTML = '<section class="mai-related" style="padding:80px 24px;max-width:960px;margin:0 auto"><h2 style="font-size:32px;font-weight:700;color:#2F2F2F;margin-bottom:40px;text-align:center">Related Use Cases</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px"><a href="/use-cases/data-intelligence" style="text-decoration:none;background:#F6F2E8;border-radius:16px;padding:32px;transition:transform 0.2s ease,box-shadow 0.2s ease"><h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Data Intelligence</h3><p style="font-size:15px;color:#6E6E6E;line-height:1.5">Let AI turn raw member data into actionable insights that drive smarter decisions.</p></a><a href="/use-cases/certifications" style="text-decoration:none;background:#F6F2E8;border-radius:16px;padding:32px;transition:transform 0.2s ease,box-shadow 0.2s ease"><h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Certifications &amp; Credentials</h3><p style="font-size:15px;color:#6E6E6E;line-height:1.5">Use AI to guide members through certification journeys and boost completion rates.</p></a></div></section>';
      var fq = document.querySelector('.mai-faq');
      if (fq) { fq.insertAdjacentHTML('afterend', relatedHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', relatedHTML); }
    }

    // Fix CTA heading to match Vercel
    var ctaHeading = document.querySelector('.pf-cta-heading');
    if (ctaHeading) {
      ctaHeading.innerHTML = 'Meet your AI <br><span style="background:linear-gradient(to top,#1F3A51,#4A7FA5 45%,#35607E);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">membership team.</span>';
    }
    var ctaSub = document.querySelector('.pf-cta-sub');
    if (ctaSub) {
      ctaSub.textContent = 'Membership AI knows your members. It tells you what matters. It builds what you need. And it does it without asking you to add headcount, learn analytics, or spend weeks building campaigns.';
    }

    // Hide original Webflow feature sections (Insight Agent, Initiative & Recommendation Agents)
    document.querySelectorAll('.pf-section').forEach(function(s) {
      var title = s.querySelector('.pf-feature-title, h2');
      if (title) {
        var txt = title.textContent.trim();
        if (txt.indexOf('Insight Agent') !== -1 || txt.indexOf('Initiative') !== -1 || txt.indexOf('Recommendation') !== -1) {
          s.style.display = 'none';
        }
      }
    });
  }

  // ─────────────────────────────────────────
  // FIX INSIGHTS PAGE
  // ─────────────────────────────────────────
  function fixInsightsPage() {
    if (window.location.pathname.indexOf('platform/insights') === -1) return;
    var heroLabel = document.querySelector('.pf-page-hero-label');
    if (heroLabel) { heroLabel.textContent = 'The Insights Engine'; }
    else { var heroTitle = document.querySelector('.pf-page-hero-title'); if (heroTitle) { var parent = heroTitle.parentElement; if (!parent.querySelector('.pf-hero-label-injected')) { var label = document.createElement('p'); label.className = 'pf-hero-label-injected fade-up'; label.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)'; label.textContent = 'The Insights Engine'; parent.insertBefore(label, heroTitle); } } }
    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) { heroHeading.innerHTML = 'More signal.<br>Less noise.'; }
    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) { heroSub.textContent = 'PropFuel turns messy, fragmented member data into clear insights: who wants what, who\u2019s at risk, and who\u2019s ready for more.'; }
    if (heroHeading) { var heroParent = heroHeading.parentElement; if (!heroParent.querySelector('.pf-hero-btns-injected')) { var btnWrap = document.createElement('div'); btnWrap.className = 'pf-hero-btns-injected fade-up'; btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px'; btnWrap.innerHTML = '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Get Started <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/book-a-demo" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">See It in Action</a>'; var sub = heroParent.querySelector('.pf-page-hero-sub'); if (sub) { sub.parentNode.insertBefore(btnWrap, sub.nextSibling); } else { heroParent.appendChild(btnWrap); } } }
    // Always create own container for dashboard (don't use .pf-feature-visual which is inside a section that gets hidden)
    var heroVisual = document.querySelector('.ie-hero-mockup');
    if (!heroVisual) { var btns = document.querySelector('.pf-hero-btns-injected'); var heroArea = btns ? btns.parentElement : (heroHeading ? heroHeading.parentElement : null); if (heroArea) { heroVisual = document.createElement('div'); heroVisual.className = 'ie-hero-mockup'; heroVisual.style.cssText = 'margin:48px auto 0;max-width:960px;padding:0 24px'; heroArea.appendChild(heroVisual); } }
    if (heroVisual && !heroVisual.querySelector('.ie-dashboard')) {
      var mockupWrap = document.createElement('div'); mockupWrap.className = 'ie-dashboard';
      mockupWrap.innerHTML = '<div style="width:100%;max-width:960px;margin:0 auto;display:flex;flex-direction:column;padding:24px 28px;font-family:\'DM Sans\',sans-serif;background:#fff;border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 2px 16px rgba(47,47,47,0.08);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;background:#FBC02D;border-radius:6px;display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 13h4v8H3zM9 9h4v12H9zM15 5h4v16h-4z" fill="#fff"/></svg></div><span style="font-weight:700;font-size:15px;color:#2F2F2F;">Insights Engine</span></div><div style="display:flex;gap:6px;"><span style="font-size:11px;padding:4px 12px;background:#FBC02D;color:#2F2F2F;border-radius:20px;font-weight:600;">Live</span><span style="font-size:11px;padding:4px 12px;background:#F4F1EA;color:#6E6E6E;border-radius:20px;font-weight:500;">Last 30 days</span></div></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;"><div style="background:#F4F1EA;border-radius:10px;padding:14px 16px;"><div style="font-size:10px;color:#6E6E6E;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;text-align:left;">Members</div><div style="font-size:22px;font-weight:700;color:#2F2F2F;text-align:left;">12,847</div><div style="font-size:10px;color:#4CAF50;font-weight:600;text-align:left;">+8.3%</div></div><div style="background:#F4F1EA;border-radius:10px;padding:14px 16px;"><div style="font-size:10px;color:#6E6E6E;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;text-align:left;">Engagement</div><div style="font-size:22px;font-weight:700;color:#2F2F2F;text-align:left;">67%</div><div style="font-size:10px;color:#4CAF50;font-weight:600;text-align:left;">+12.1%</div></div><div style="background:#F4F1EA;border-radius:10px;padding:14px 16px;"><div style="font-size:10px;color:#6E6E6E;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;text-align:left;">Responses</div><div style="font-size:22px;font-weight:700;color:#2F2F2F;text-align:left;">3,421</div><div style="font-size:10px;color:#4CAF50;font-weight:600;text-align:left;">+22.5%</div></div><div style="background:#F4F1EA;border-radius:10px;padding:14px 16px;"><div style="font-size:10px;color:#6E6E6E;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;text-align:left;">AI Signals</div><div style="font-size:22px;font-weight:700;color:#F47C2C;text-align:left;">48</div><div style="font-size:10px;color:#F47C2C;font-weight:600;text-align:left;">12 urgent</div></div></div><div style="display:grid;grid-template-columns:2fr 1fr;gap:14px;flex:1;min-height:0;"><div style="background:#F4F1EA;border-radius:10px;padding:16px;display:flex;flex-direction:column;"><div style="font-size:11px;font-weight:600;color:#2F2F2F;margin-bottom:12px;text-align:left;">Response Trends</div><div style="height:140px;display:flex;align-items:flex-end;gap:6px;padding-bottom:4px;"><div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;background:#FBC02D;border-radius:4px 4px 0 0;height:56px;opacity:0.7;"></div><span style="font-size:8px;color:#6E6E6E;">Jan</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;background:#FBC02D;border-radius:4px 4px 0 0;height:78px;opacity:0.8;"></div><span style="font-size:8px;color:#6E6E6E;">Feb</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;background:#FBC02D;border-radius:4px 4px 0 0;height:68px;opacity:0.75;"></div><span style="font-size:8px;color:#6E6E6E;">Mar</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;background:#FBC02D;border-radius:4px 4px 0 0;height:92px;opacity:0.85;"></div><span style="font-size:8px;color:#6E6E6E;">Apr</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;background:#FBC02D;border-radius:4px 4px 0 0;height:84px;"></div><span style="font-size:8px;color:#6E6E6E;">May</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;background:#F47C2C;border-radius:4px 4px 0 0;height:110px;"></div><span style="font-size:8px;color:#6E6E6E;">Jun</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;background:#F47C2C;border-radius:4px 4px 0 0;height:120px;"></div><span style="font-size:8px;color:#6E6E6E;">Jul</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;background:#F47C2C;border-radius:4px 4px 0 0;height:130px;"></div><span style="font-size:8px;color:#6E6E6E;">Aug</span></div></div></div><div style="background:#F4F1EA;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;"><div style="font-size:11px;font-weight:600;color:#2F2F2F;text-align:left;">AI-Powered Signals</div><div style="background:#fff;border-radius:8px;padding:10px 12px;border-left:3px solid #F47C2C;"><div style="font-size:10px;font-weight:600;color:#F47C2C;text-align:left;">At Risk</div><div style="font-size:9px;color:#6E6E6E;text-align:left;">127 members showing decline</div></div><div style="background:#fff;border-radius:8px;padding:10px 12px;border-left:3px solid #FBC02D;"><div style="font-size:10px;font-weight:600;color:#2F2F2F;text-align:left;">Upsell Ready</div><div style="font-size:9px;color:#6E6E6E;text-align:left;">84 high-engagement members</div></div><div style="background:#fff;border-radius:8px;padding:10px 12px;border-left:3px solid #4CAF50;"><div style="font-size:10px;font-weight:600;color:#2F2F2F;text-align:left;">Thriving</div><div style="font-size:9px;color:#6E6E6E;text-align:left;">2,341 actively engaged</div></div></div></div></div>';
      heroVisual.innerHTML = ''; heroVisual.appendChild(mockupWrap); heroVisual.style.background = '#EBE6DA'; heroVisual.style.borderRadius = '20px'; heroVisual.style.padding = '28px';
    }
    var ctaSection = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (!ctaSection) return;
    if (!document.querySelector('.ie-problem-band')) { var problemHTML = '<section class="ie-problem-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center"><div><p style="font-size:13px;font-weight:600;color:#F9A825;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px">The Problem</p><h2 style="font-size:clamp(28px,4vw,36px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:24px">You have data. What you don\u2019t have is clarity.</h2><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">Your member data lives in at least four places right now. The AMS has some of it. The email tool has some. There\u2019s a spreadsheet someone built two years ago that nobody trusts.</p><p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">The three questions you ask every day \u2014 <strong style="color:#EDE8DF">who wants what, who\u2019s at risk, and who\u2019s ready for more</strong> \u2014 your current tools can\u2019t answer any of them.</p><p style="font-size:17px;color:#8C8479;line-height:1.65"><strong style="color:#EDE8DF">\u201CIn the absence of data, blame defaults to marketing.\u201D</strong> Not because marketing failed \u2014 because nobody has the data to prove otherwise.</p></div><div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;position:relative;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-bottom:20px;"><div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px;text-align:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="margin-bottom:4px;"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#F47C2C" stroke-width="1.5"/><path d="M7 8h10M7 12h6M7 16h8" stroke="#F47C2C" stroke-width="1.5" stroke-linecap="round"/></svg><div style="font-size:10px;font-weight:600;color:#EDE8DF;">AMS Data</div><div style="font-size:8px;color:#8C8479;margin-top:2px;">Partial records</div></div><div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px;text-align:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="margin-bottom:4px;"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#FBC02D" stroke-width="1.5"/><path d="M2 8l10 6 10-6" stroke="#FBC02D" stroke-width="1.5"/></svg><div style="font-size:10px;font-weight:600;color:#EDE8DF;">Email Tool</div><div style="font-size:8px;color:#8C8479;margin-top:2px;">Open/click only</div></div><div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px;text-align:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="margin-bottom:4px;"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#8C8479" stroke-width="1.5"/><path d="M3 9h18M9 3v18" stroke="#8C8479" stroke-width="1.5"/></svg><div style="font-size:10px;font-weight:600;color:#EDE8DF;">Spreadsheets</div><div style="font-size:8px;color:#8C8479;margin-top:2px;">Outdated 2yrs</div></div><div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px;text-align:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="margin-bottom:4px;"><circle cx="12" cy="8" r="4" stroke="#8C8479" stroke-width="1.5"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#8C8479" stroke-width="1.5" stroke-linecap="round"/></svg><div style="font-size:10px;font-weight:600;color:#EDE8DF;">Tribal Knowledge</div><div style="font-size:8px;color:#8C8479;margin-top:2px;">In people\u2019s heads</div></div></div><div style="display:flex;align-items:center;justify-content:center;margin:4px 0 8px;"><svg width="120" height="32" viewBox="0 0 120 32"><path d="M10 4 L60 28" stroke="#FBC02D" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/><path d="M40 4 L60 28" stroke="#FBC02D" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/><path d="M80 4 L60 28" stroke="#FBC02D" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/><path d="M110 4 L60 28" stroke="#FBC02D" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/><circle cx="60" cy="28" r="3" fill="#FBC02D"/></svg></div><div style="background:linear-gradient(135deg,#FBC02D 0%,#F47C2C 100%);border-radius:12px;padding:16px 20px;width:85%;display:flex;align-items:center;gap:14px;"><div style="width:40px;height:40px;background:rgba(255,255,255,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div><div style="text-align:left;"><div style="font-size:12px;font-weight:700;color:#fff;">Unified Member Profile</div><div style="font-size:9px;color:rgba(255,255,255,0.85);margin-top:2px;">Complete view from all sources</div></div></div></div></div></section>'; ctaSection.insertAdjacentHTML('beforebegin', problemHTML); }
    if (!document.querySelector('.ie-how-it-works')) { var howHTML = '<section class="ie-how-it-works" style="padding:96px 48px;max-width:1200px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">How It Works</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">From fragmented data to clear next steps.</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><p style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F47C2C;margin-bottom:12px">Step 1</p><h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Capture</h3><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Every PropFuel interaction generates a data point. Responses, clicks, website behavior, SMS replies \u2014 all flow into a unified member profile.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><p style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F47C2C;margin-bottom:12px">Step 2</p><h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Interpret</h3><p style="font-size:15px;color:#6E6E6E;line-height:1.6">AI-powered response analysis categorizes and scores engagement automatically. Signals surface who\u2019s at risk, who\u2019s thriving, and who needs something you haven\u2019t offered yet.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><p style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F47C2C;margin-bottom:12px">Step 3</p><h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Act</h3><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Actionable dashboards give your team clear next steps. Board reporting takes minutes, not days. Insight feeds directly into automated campaigns.</p></div></div></section>'; var pb = document.querySelector('.ie-problem-band'); if (pb) { pb.insertAdjacentHTML('afterend', howHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', howHTML); } }
    if (!document.querySelector('.ie-feature-ai')) { var aiMockup = '<div style="width:100%;display:flex;flex-direction:column;padding:20px;font-family:\'DM Sans\',sans-serif;overflow:hidden;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;"><div style="width:24px;height:24px;background:#F47C2C;border-radius:6px;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span style="font-size:13px;font-weight:700;color:#2F2F2F;">AI Response Analysis</span></div><span style="font-size:10px;color:#6E6E6E;background:#fff;padding:3px 10px;border-radius:12px;">847 replies analyzed</span></div><div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;"><span style="font-size:9px;font-weight:600;padding:4px 10px;background:#FBC02D;color:#2F2F2F;border-radius:12px;">Networking 34%</span><span style="font-size:9px;font-weight:600;padding:4px 10px;background:#F47C2C;color:#fff;border-radius:12px;">Education 28%</span><span style="font-size:9px;font-weight:600;padding:4px 10px;background:#EBE6DA;color:#2F2F2F;border-radius:12px;">Advocacy 19%</span><span style="font-size:9px;font-weight:600;padding:4px 10px;background:#EBE6DA;color:#2F2F2F;border-radius:12px;">Events 12%</span><span style="font-size:9px;font-weight:600;padding:4px 10px;background:#EBE6DA;color:#6E6E6E;border-radius:12px;">Other 7%</span></div><div style="display:flex;flex-direction:column;gap:8px;flex:1;overflow:hidden;"><div style="background:#fff;border-radius:10px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;"><div style="width:8px;height:8px;background:#4CAF50;border-radius:50%;flex-shrink:0;margin-top:4px;"></div><div style="flex:1;text-align:left;"><div style="font-size:10px;color:#2F2F2F;line-height:1.4;">\u201CThe annual conference was the highlight of my membership year. Already planning for next year.\u201D</div><div style="display:flex;gap:6px;margin-top:6px;"><span style="font-size:8px;padding:2px 6px;background:#E8F5E9;color:#2E7D32;border-radius:8px;font-weight:600;">Positive</span><span style="font-size:8px;padding:2px 6px;background:#FFF8E1;color:#F47C2C;border-radius:8px;font-weight:600;">Events</span></div></div></div><div style="background:#fff;border-radius:10px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;"><div style="width:8px;height:8px;background:#F47C2C;border-radius:50%;flex-shrink:0;margin-top:4px;"></div><div style="flex:1;text-align:left;"><div style="font-size:10px;color:#2F2F2F;line-height:1.4;">\u201CI\u2019m not getting the ROI I expected. Considering whether to renew.\u201D</div><div style="display:flex;gap:6px;margin-top:6px;"><span style="font-size:8px;padding:2px 6px;background:#FBE9E7;color:#D32F2F;border-radius:8px;font-weight:600;">At Risk</span><span style="font-size:8px;padding:2px 6px;background:#FFF8E1;color:#F47C2C;border-radius:8px;font-weight:600;">Value</span></div></div></div><div style="background:#fff;border-radius:10px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;"><div style="width:8px;height:8px;background:#FBC02D;border-radius:50%;flex-shrink:0;margin-top:4px;"></div><div style="flex:1;text-align:left;"><div style="font-size:10px;color:#2F2F2F;line-height:1.4;">\u201CWould love more professional development webinars on leadership topics.\u201D</div><div style="display:flex;gap:6px;margin-top:6px;"><span style="font-size:8px;padding:2px 6px;background:#FFF8E1;color:#F9A825;border-radius:8px;font-weight:600;">Suggestion</span><span style="font-size:8px;padding:2px 6px;background:#FFF8E1;color:#F47C2C;border-radius:8px;font-weight:600;">Education</span></div></div></div></div></div>'; var f1 = '<section class="ie-feature-ai" style="padding:96px 48px"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center"><div><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">AI-Powered</p><h3 style="font-size:clamp(24px,3.5vw,32px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.2;margin-bottom:20px">Hundreds of replies distilled into clear themes.</h3><p style="font-size:16px;color:#6E6E6E;line-height:1.65;margin-bottom:24px">When a campaign generates hundreds of open-text responses, you don\u2019t have to read every one. AI categorizes replies into themes, sentiment patterns, and outliers that need attention.</p><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px"><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Automatic sentiment scoring across all channels</li><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Theme detection across open-text responses</li><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Outlier flagging for urgent human attention</li></ul></div><div style="background:#EBE6DA;border-radius:20px;padding:28px">' + aiMockup + '</div></div></section>'; var hw = document.querySelector('.ie-how-it-works'); if (hw) { hw.insertAdjacentHTML('afterend', f1); } else { ctaSection.insertAdjacentHTML('beforebegin', f1); } }
    if (!document.querySelector('.ie-feature-dashboard')) { var dashMockup = '<div style="width:100%;display:flex;flex-direction:column;padding:20px;font-family:\'DM Sans\',sans-serif;overflow:hidden;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;"><span style="font-size:13px;font-weight:700;color:#2F2F2F;">Campaign Performance</span><div style="display:flex;gap:4px;"><span style="font-size:9px;padding:3px 8px;background:#FBC02D;color:#2F2F2F;border-radius:10px;font-weight:600;">30d</span><span style="font-size:9px;padding:3px 8px;background:#fff;color:#6E6E6E;border-radius:10px;">90d</span><span style="font-size:9px;padding:3px 8px;background:#fff;color:#6E6E6E;border-radius:10px;">1yr</span></div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;"><div style="background:#fff;border-radius:8px;padding:10px 12px;"><div style="font-size:8px;color:#6E6E6E;text-transform:uppercase;font-weight:500;text-align:left;">Response Rate</div><div style="font-size:20px;font-weight:700;color:#2F2F2F;text-align:left;">44%</div><div style="width:100%;height:4px;background:#EBE6DA;border-radius:2px;margin-top:4px;"><div style="width:44%;height:100%;background:#FBC02D;border-radius:2px;"></div></div></div><div style="background:#fff;border-radius:8px;padding:10px 12px;"><div style="font-size:8px;color:#6E6E6E;text-transform:uppercase;font-weight:500;text-align:left;">Open Rate</div><div style="font-size:20px;font-weight:700;color:#2F2F2F;text-align:left;">72%</div><div style="width:100%;height:4px;background:#EBE6DA;border-radius:2px;margin-top:4px;"><div style="width:72%;height:100%;background:#F47C2C;border-radius:2px;"></div></div></div><div style="background:#fff;border-radius:8px;padding:10px 12px;"><div style="font-size:8px;color:#6E6E6E;text-transform:uppercase;font-weight:500;text-align:left;">NPS Score</div><div style="font-size:20px;font-weight:700;color:#4CAF50;text-align:left;">+62</div><div style="width:100%;height:4px;background:#EBE6DA;border-radius:2px;margin-top:4px;"><div style="width:81%;height:100%;background:#4CAF50;border-radius:2px;"></div></div></div></div><div style="background:#fff;border-radius:10px;padding:14px;flex:1;display:flex;flex-direction:column;"><div style="font-size:10px;font-weight:600;color:#2F2F2F;margin-bottom:10px;text-align:left;">Engagement Trend</div><div style="flex:1;position:relative;"><svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none" style="overflow:visible;"><line x1="0" y1="30" x2="400" y2="30" stroke="#EBE6DA" stroke-width="1"/><line x1="0" y1="60" x2="400" y2="60" stroke="#EBE6DA" stroke-width="1"/><line x1="0" y1="90" x2="400" y2="90" stroke="#EBE6DA" stroke-width="1"/><path d="M0 90 Q50 80 100 70 T200 50 T300 35 T400 20 L400 120 L0 120 Z" fill="#FBC02D" opacity="0.12"/><path d="M0 90 Q50 80 100 70 T200 50 T300 35 T400 20" fill="none" stroke="#FBC02D" stroke-width="2.5" stroke-linecap="round"/><path d="M0 100 Q50 95 100 85 T200 70 T300 55 T400 40" fill="none" stroke="#F47C2C" stroke-width="2" stroke-dasharray="6 4" stroke-linecap="round"/><circle cx="200" cy="50" r="4" fill="#FBC02D"/><circle cx="400" cy="20" r="4" fill="#FBC02D"/><circle cx="200" cy="70" r="3.5" fill="#F47C2C"/><circle cx="400" cy="40" r="3.5" fill="#F47C2C"/></svg></div><div style="display:flex;gap:16px;margin-top:8px;"><div style="display:flex;align-items:center;gap:4px;"><div style="width:10px;height:3px;background:#FBC02D;border-radius:2px;"></div><span style="font-size:8px;color:#6E6E6E;">Engagement</span></div><div style="display:flex;align-items:center;gap:4px;"><div style="width:10px;height:3px;background:#F47C2C;border-radius:2px;"></div><span style="font-size:8px;color:#6E6E6E;">Responses</span></div></div></div></div>'; var f2 = '<section class="ie-feature-dashboard" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center"><div style="background:#F6F2E8;border-radius:20px;padding:28px">' + dashMockup + '</div><div><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Dashboard</p><h3 style="font-size:clamp(24px,3.5vw,32px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.2;margin-bottom:20px">Board reports in minutes, not days.</h3><p style="font-size:16px;color:#6E6E6E;line-height:1.65;margin-bottom:24px">Clear, actionable metrics with flexible date ranges and trend comparisons. Built for board reporting, monthly check-ins, and spotting problems before they become crises.</p><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px"><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Real-time campaign and engagement analytics</li><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Flexible date ranges with trend comparisons</li><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Cross-channel contact tracking (email, web, SMS)</li></ul></div></div></section>'; var fa = document.querySelector('.ie-feature-ai'); if (fa) { fa.insertAdjacentHTML('afterend', f2); } else { ctaSection.insertAdjacentHTML('beforebegin', f2); } }
    if (!document.querySelector('.ie-feature-profile')) { var profileMockup = '<div style="width:100%;display:flex;flex-direction:column;padding:20px;font-family:\'DM Sans\',sans-serif;overflow:hidden;"><div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;"><div style="width:48px;height:48px;background:linear-gradient(135deg,#FBC02D,#F47C2C);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:18px;font-weight:700;color:#fff;">SM</span></div><div style="text-align:left;flex:1;"><div style="font-size:14px;font-weight:700;color:#2F2F2F;">Sarah Mitchell</div><div style="font-size:10px;color:#6E6E6E;">VP of Operations \u2014 Acme Corp</div><div style="font-size:9px;color:#6E6E6E;margin-top:2px;">Member since 2019 \u2022 Chicago, IL</div></div><div style="text-align:center;flex-shrink:0;"><div style="width:44px;height:44px;border-radius:50%;border:3px solid #4CAF50;display:flex;align-items:center;justify-content:center;"><span style="font-size:14px;font-weight:700;color:#4CAF50;">92</span></div><div style="font-size:7px;color:#6E6E6E;margin-top:2px;">Engagement</div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1;min-height:0;"><div style="display:flex;flex-direction:column;gap:8px;"><div style="background:#fff;border-radius:8px;padding:10px 12px;"><div style="font-size:9px;font-weight:600;color:#6E6E6E;text-transform:uppercase;margin-bottom:6px;text-align:left;">Member Details</div><div style="display:flex;flex-direction:column;gap:4px;"><div style="display:flex;justify-content:space-between;"><span style="font-size:9px;color:#6E6E6E;">Segment</span><span style="font-size:9px;font-weight:600;color:#2F2F2F;">Enterprise</span></div><div style="display:flex;justify-content:space-between;"><span style="font-size:9px;color:#6E6E6E;">Renewal</span><span style="font-size:9px;font-weight:600;color:#2F2F2F;">Mar 2026</span></div><div style="display:flex;justify-content:space-between;"><span style="font-size:9px;color:#6E6E6E;">Tenure</span><span style="font-size:9px;font-weight:600;color:#2F2F2F;">7 years</span></div><div style="display:flex;justify-content:space-between;"><span style="font-size:9px;color:#6E6E6E;">LTV</span><span style="font-size:9px;font-weight:600;color:#2F2F2F;">$14,200</span></div></div></div><div style="background:#fff;border-radius:8px;padding:10px 12px;"><div style="font-size:9px;font-weight:600;color:#6E6E6E;text-transform:uppercase;margin-bottom:6px;text-align:left;">Sentiment Over Time</div><svg width="100%" height="48" viewBox="0 0 200 48" preserveAspectRatio="none"><path d="M0 40 Q25 35 50 30 T100 22 T150 18 T200 10" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/><circle cx="200" cy="10" r="3" fill="#4CAF50"/></svg><div style="display:flex;justify-content:space-between;margin-top:2px;"><span style="font-size:7px;color:#BDBDBD;">2019</span><span style="font-size:7px;color:#BDBDBD;">2026</span></div></div></div><div style="display:flex;flex-direction:column;gap:8px;"><div style="background:#fff;border-radius:8px;padding:10px 12px;flex:1;"><div style="font-size:9px;font-weight:600;color:#6E6E6E;text-transform:uppercase;margin-bottom:8px;text-align:left;">Activity Timeline</div><div style="display:flex;flex-direction:column;gap:6px;"><div style="display:flex;align-items:flex-start;gap:8px;"><div style="width:6px;height:6px;background:#FBC02D;border-radius:50%;flex-shrink:0;margin-top:3px;"></div><div style="text-align:left;"><div style="font-size:8px;font-weight:600;color:#2F2F2F;">Opened renewal survey</div><div style="font-size:7px;color:#BDBDBD;">2 days ago</div></div></div><div style="display:flex;align-items:flex-start;gap:8px;"><div style="width:6px;height:6px;background:#F47C2C;border-radius:50%;flex-shrink:0;margin-top:3px;"></div><div style="text-align:left;"><div style="font-size:8px;font-weight:600;color:#2F2F2F;">Replied: \u201CLove the new events\u201D</div><div style="font-size:7px;color:#BDBDBD;">1 week ago</div></div></div><div style="display:flex;align-items:flex-start;gap:8px;"><div style="width:6px;height:6px;background:#EBE6DA;border-radius:50%;flex-shrink:0;margin-top:3px;"></div><div style="text-align:left;"><div style="font-size:8px;font-weight:600;color:#2F2F2F;">Attended Spring Conf</div><div style="font-size:7px;color:#BDBDBD;">3 weeks ago</div></div></div><div style="display:flex;align-items:flex-start;gap:8px;"><div style="width:6px;height:6px;background:#EBE6DA;border-radius:50%;flex-shrink:0;margin-top:3px;"></div><div style="text-align:left;"><div style="font-size:8px;font-weight:600;color:#2F2F2F;">Clicked 3 resource links</div><div style="font-size:7px;color:#BDBDBD;">1 month ago</div></div></div></div></div><div style="background:linear-gradient(135deg,#FBC02D,#F47C2C);border-radius:8px;padding:10px 12px;"><div style="font-size:9px;font-weight:700;color:#fff;margin-bottom:4px;text-align:left;">Recommended Actions</div><div style="font-size:8px;color:rgba(255,255,255,0.9);line-height:1.5;text-align:left;">\u2022 Send leadership committee invite<br>\u2022 Early renewal offer (high likelihood)<br>\u2022 Nominate for member spotlight</div></div></div></div></div>'; var f3 = '<section class="ie-feature-profile" style="padding:96px 48px"><div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center"><div><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Member Profiles</p><h3 style="font-size:clamp(24px,3.5vw,32px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.2;margin-bottom:20px">Everything you\u2019d want to know before picking up the phone.</h3><p style="font-size:16px;color:#6E6E6E;line-height:1.65;margin-bottom:24px">The complete picture of every member in one view: demographics, activity history, sentiment, engagement signals, and opportunities. When staff turns over, the relationship history stays.</p><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px"><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Unified member profiles from all data sources</li><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Full conversation record across all channels</li><li style="font-size:15px;color:#2F2F2F;line-height:1.5;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#F47C2C">\u2022</span>Behavioral segmentation, not just demographics</li></ul></div><div style="background:#EBE6DA;border-radius:20px;padding:28px">' + profileMockup + '</div></div></section>'; var fd = document.querySelector('.ie-feature-dashboard'); if (fd) { fd.insertAdjacentHTML('afterend', f3); } else { ctaSection.insertAdjacentHTML('beforebegin', f3); } }
    if (!document.querySelector('.ie-stats-band')) { var statsHTML = '<section class="ie-stats-band" style="background:#1A1713;padding:96px 48px"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Results</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">The numbers behind the noise reduction.</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px"><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">44%</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">NACUBO</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Response rate in 24 hours on a profile-building campaign.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">4,500+</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">INS</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Member profile fields updated through conversations. No forms.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">95%</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">AAMFT</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">On-time renewals \u2014 up from 80.5%, plus 7% membership growth.</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">72%</p><p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">All Clients</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">Of declining organizations reversed course after implementing PropFuel.</p></div></div></div></section>'; var fp = document.querySelector('.ie-feature-profile'); if (fp) { fp.insertAdjacentHTML('afterend', statsHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', statsHTML); } }
    if (!document.querySelector('.ie-capabilities')) { var capHTML = '<section class="ie-capabilities" style="padding:96px 48px;max-width:1200px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Capabilities</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Everything you need to understand your members.</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Campaign Analytics</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">See what\u2019s working across every campaign and channel \u2014 open rates, response rates, engagement trends \u2014 in real time.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">AI Response Analysis</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Automatically categorize open-text member responses at scale. Hundreds of replies distilled into themes and sentiment patterns.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Insights Dashboard</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Clear, actionable metrics with flexible date ranges and trend comparisons. Built for board reporting and spotting problems early.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Contact Segmentation</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Find and group members by behavior, not just demographics. Build audiences like \u201Cfirst-year members who haven\u2019t responded to any check-ins.\u201D</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Super Contact Profile <span style="font-size:11px;font-weight:600;color:#F47C2C;background:rgba(244,124,44,0.1);padding:2px 8px;border-radius:100px;margin-left:6px">Coming Soon</span></h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">The complete picture of every member in one view: demographics, activity history, sentiment, engagement signals, and opportunities.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F9A825;border-radius:20px 20px 0 0"></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">AI-Powered Signals</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Automated detection of at-risk, highly engaged, and opportunity members. Surfaces things you didn\u2019t know to look for.</p></div></div></section>'; var sb = document.querySelector('.ie-stats-band'); if (sb) { sb.insertAdjacentHTML('afterend', capHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', capHTML); } }
    if (!document.querySelector('.ie-faq')) { var faqItems = [{ q: 'Is PropFuel a survey tool?', a: 'No. Unlike traditional surveys, PropFuel sends short, ongoing interactions \u2014 one to three questions each \u2014 throughout the member lifecycle. It\u2019s a continuous listening system, not a one-time data collection tool. Think of it as progressive profiling through micro-conversations.' },{ q: 'What kind of response rates can we expect?', a: 'PropFuel campaigns average 10-15% response rates \u2014 that\u2019s 5-6x the industry average for email engagement. Some data capture campaigns perform even higher: NACUBO saw 44% response rates within 24 hours.' },{ q: 'How does PropFuel keep our AMS data current?', a: 'Every member response writes back to your AMS automatically in real time. PropFuel connects to 60+ external systems with two-way sync \u2014 setup takes 5-30 minutes. No CSV exports. No manual data entry.' },{ q: 'Do we need analytical expertise to use the Insights Engine?', a: 'No. The Insights Engine is built for membership professionals, not data analysts. Dashboards surface clear, actionable metrics \u2014 not data dumps. AI-powered analysis handles the interpretation: categorizing responses, identifying patterns, and flagging what needs attention.' },{ q: 'How is PropFuel different from our existing email analytics?', a: 'Your email tool tells you who opened and who clicked. PropFuel tells you what members actually want, why they\u2019re hesitating, and what they need next. As one customer put it: \u201CPardot\u2019s great at marketing. PropFuel is great at listening. And I need both.\u201D' }]; var faqHTML = '<section class="ie-faq" style="padding:96px 48px"><div style="max-width:800px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">FAQ</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Common questions about the Insights Engine.</h2></div>'; faqItems.forEach(function(item) { faqHTML += '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0"><button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">' + item.q + '</button><div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease"><p style="font-size:16px;color:#6E6E6E;line-height:1.65;padding-top:16px">' + item.a + '</p></div></div>'; }); faqHTML += '</div></section>'; var cs = document.querySelector('.ie-capabilities'); if (cs) { cs.insertAdjacentHTML('afterend', faqHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', faqHTML); } }
    var ctaHeading = document.querySelector('.pf-cta-heading');
    if (ctaHeading) { ctaHeading.innerHTML = 'Stop guessing.<br><span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Start knowing.</span>'; }
    var ctaSub = document.querySelector('.pf-cta-sub');
    if (ctaSub) { ctaSub.textContent = 'Your members are telling you what they need. You just need the right way to hear them.'; }
    document.querySelectorAll('.pf-section').forEach(function(s) { s.style.display = 'none'; });

    // CTA Fix
    var ctaHeading2 = ctaSection.querySelector('h2, [class*="title"]');
    if (ctaHeading2) { ctaHeading2.innerHTML = 'Stop guessing.<br>Start <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">knowing.</span>'; }
    var ctaDesc2 = ctaSection.querySelector('p:not([class*="label"]):not(h2)');
    if (!ctaDesc2) { var allP2 = ctaSection.querySelectorAll('p'); for (var pi2 = 0; pi2 < allP2.length; pi2++) { if (allP2[pi2].textContent.length > 30) { ctaDesc2 = allP2[pi2]; break; } } }
    if (ctaDesc2) { ctaDesc2.textContent = 'Your members are telling you what they need. You just need the right way to hear them.'; }

    // Hide original Webflow feature sections (Real-time member signals, At-risk member detection)
    document.querySelectorAll('.pf-section').forEach(function(s) {
      var title = s.querySelector('.pf-feature-title, h2');
      if (title) {
        var txt = title.textContent.trim();
        if (txt.indexOf('Real-time member') !== -1 || txt.indexOf('At-risk member') !== -1) {
          s.style.display = 'none';
        }
      }
    });

    // Add Use Cases section
    if (!document.querySelector('.ie-use-cases')) {
      var ucHTML = '<section class="ie-use-cases" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:1200px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Use Cases</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">The Insights Engine powers every stage of the member lifecycle.</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Onboarding</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Build a data foundation from day one. Learn what new members want before the renewal window opens.</p></div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Renewals</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Spot at-risk members before they lapse. Understand why someone is hesitating so you can address it.</p></div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Win-Back</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Know why members left while the reasons are still fresh. Target outreach based on actual lapse reasons.</p></div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Data & Intelligence</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Every PropFuel interaction is a database update. Profile building, NPS scoring, satisfaction tracking.</p></div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Events</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Turn post-event feedback into actionable data. Know which sessions resonated and who needs follow-up.</p></div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px"><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Acquisition</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Capture visitor intent from your website before prospects disappear. Learn what they\u2019re looking for.</p></div>' +
      '</div></div></section>';
      var faqEl = document.querySelector('.ie-faq');
      if (faqEl) { faqEl.insertAdjacentHTML('beforebegin', ucHTML); } else { ctaSection.insertAdjacentHTML('beforebegin', ucHTML); }
    }

    // Add Testimonial section
    if (!document.querySelector('.ie-testimonials')) {
      var testHTML = '<section class="ie-testimonials" style="padding:80px 48px;background:#EBE6DA"><div style="max-width:700px;margin:0 auto;text-align:center"><p style="font-size:48px;margin-bottom:16px">\u201C</p><p style="font-size:clamp(18px,2.5vw,24px);font-weight:600;color:#2F2F2F;line-height:1.5;font-style:italic;margin-bottom:24px">There was something about PropFuel that got our members talking to us. We\u2019ve never seen engagement like that.</p><p style="font-size:15px;font-weight:700;color:#2F2F2F">\u2014 Dena Pearlman</p><p style="font-size:13px;color:#6E6E6E;margin-top:4px">CCSA</p></div></section>';
      var ucEl = document.querySelector('.ie-use-cases');
      if (ucEl) { ucEl.insertAdjacentHTML('afterend', testHTML); } else { var faqE = document.querySelector('.ie-faq'); if (faqE) faqE.insertAdjacentHTML('beforebegin', testHTML); }
    }

    // Related Use Cases removed per feedback — redundant with /use-cases nav
    document.querySelectorAll('.ie-related').forEach(function(n){ n.remove(); });
  }

  // ─────────────────────────────────────────
  // USE CASE PAGE SHARED HELPER
  // ─────────────────────────────────────────
  function buildUseCasePage(cfg) {
    if (window.location.pathname.indexOf(cfg.path) === -1) return;

    var prefix = cfg.path.replace(/[^a-z]/g, '');

    // ═══════════════════════════════════════
    // HERO
    // ═══════════════════════════════════════
    var heroLabel = document.querySelector('.pf-page-hero-label');
    if (heroLabel) {
      heroLabel.textContent = cfg.heroLabel || 'Use Case';
    } else {
      var heroTitle = document.querySelector('.pf-page-hero-title');
      if (heroTitle) {
        var parent = heroTitle.parentElement;
        if (!parent.querySelector('.pf-hero-label-injected')) {
          var label = document.createElement('p');
          label.className = 'pf-hero-label-injected fade-up';
          label.style.cssText = 'display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)';
          label.textContent = cfg.heroLabel || 'Use Case';
          parent.insertBefore(label, heroTitle);
        }
      }
    }

    var heroHeading = document.querySelector('.pf-page-hero-title');
    if (heroHeading) { heroHeading.textContent = cfg.heroTitle; }

    var heroSub = document.querySelector('.pf-page-hero-sub');
    if (heroSub) { heroSub.textContent = cfg.heroSub; }

    if (heroHeading) {
      var heroParent = heroHeading.parentElement;
      if (!heroParent.querySelector('.pf-hero-btns-injected')) {
        var btnWrap = document.createElement('div');
        btnWrap.className = 'pf-hero-btns-injected fade-up';
        btnWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';
        btnWrap.innerHTML =
          '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">' +
            'Get Started <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' +
          '<a href="#ucCenterpiece" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">' +
            'See It in Action</a>';
        var sub2 = heroParent.querySelector('.pf-page-hero-sub');
        if (sub2) { sub2.parentNode.insertBefore(btnWrap, sub2.nextSibling); }
        else { heroParent.appendChild(btnWrap); }
      }
    }

    // ═══════════════════════════════════════
    // INJECT SECTIONS BEFORE CTA
    // ═══════════════════════════════════════
    var ctaSection = document.querySelector('.pf-cta-section, [class*="cta-section"]');
    if (!ctaSection) return;

    // --- PROBLEM BAND (dark) ---
    if (!document.querySelector('.' + prefix + '-problem')) {
      var problemHTML = '<section class="' + prefix + '-problem" style="background:#1A1713;padding:96px 48px">' +
        '<div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center">' +
          '<div>' +
            '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">' + (cfg.problemLabel || 'The Problem') + '</p>' +
            '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:32px">' + cfg.problemH2 + '</h2>';
      cfg.problemBody.forEach(function(p) {
        problemHTML += '<p style="font-size:17px;color:#8C8479;line-height:1.65;margin-bottom:20px">' + p.replace(/<strong>/g, '<strong style="color:#EDE8DF">') + '</p>';
      });
      problemHTML += '</div>';
      if (cfg.problemGraphic) {
        problemHTML += '<div style="display:flex;align-items:center;justify-content:center">' + cfg.problemGraphic + '</div>';
      }
      problemHTML += '</div></section>';
      ctaSection.insertAdjacentHTML('beforebegin', problemHTML);
    }

    // --- CENTERPIECE ---
    if (cfg.centerpieceHTML && !document.querySelector('.' + prefix + '-centerpiece')) {
      var cpHTML = '<section id="ucCenterpiece" class="' + prefix + '-centerpiece" style="padding:96px 48px">' +
        '<div style="max-width:1100px;margin:0 auto">' + cfg.centerpieceHTML + '</div></section>';
      var prevSection = document.querySelector('.' + prefix + '-problem');
      if (prevSection) { prevSection.insertAdjacentHTML('afterend', cpHTML); }
      else { ctaSection.insertAdjacentHTML('beforebegin', cpHTML); }
    }

    // --- ENGINES SECTION (cream band) ---
    if (cfg.engines && !document.querySelector('.' + prefix + '-engines')) {
      var engHTML = '<section class="' + prefix + '-engines" style="padding:96px 48px;background:#EBE6DA">' +
        '<div style="max-width:1100px;margin:0 auto;text-align:center">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Which Engines Power This</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">' + cfg.enginesH2 + '</h2>' +
          '<div style="display:grid;grid-template-columns:repeat(' + cfg.engines.length + ',1fr);gap:24px">';
      var engIcons = {
        'Engagement Engine': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        'Automation Engine': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        'Insights Engine': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F47C2C" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        'Membership AI': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A7FA5" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="12" r="10" stroke-dasharray="2 2"/></svg>'
      };
      cfg.engines.forEach(function(eng) {
        var isAI = eng.name === 'Membership AI';
        var iconColor = isAI ? '#4A7FA5' : '#F47C2C';
        var icon = engIcons[eng.name] || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + iconColor + '" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
        engHTML += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 28px;text-align:center">' +
          '<div style="width:56px;height:56px;border-radius:50%;background:' + (isAI ? 'rgba(74,127,165,0.1)' : 'rgba(244,124,44,0.1)') + ';display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' + icon + '</div>' +
          '<h4 style="font-size:18px;font-weight:700;color:' + (isAI ? '#4A7FA5' : '#2F2F2F') + ';margin-bottom:10px">' + eng.name + '</h4>' +
          '<p style="font-size:14px;color:#6E6E6E;line-height:1.6">' + eng.desc + '</p>' +
        '</div>';
      });
      engHTML += '</div></div></section>';
      var cpSection = document.querySelector('.' + prefix + '-centerpiece');
      if (cpSection) { cpSection.insertAdjacentHTML('afterend', engHTML); }
      else {
        var probSection = document.querySelector('.' + prefix + '-problem');
        if (probSection) { probSection.insertAdjacentHTML('afterend', engHTML); }
        else { ctaSection.insertAdjacentHTML('beforebegin', engHTML); }
      }
    }

    // --- STATS BAND (dark) ---
    if (cfg.stats && !document.querySelector('.' + prefix + '-stats')) {
      var stHTML = '<section class="' + prefix + '-stats" style="background:#1A1713;padding:96px 48px">' +
        '<div style="max-width:1000px;margin:0 auto;text-align:center">' +
          '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Results</p>' +
          '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">' + cfg.statsH2 + '</h2>' +
          '<div style="display:grid;grid-template-columns:repeat(' + cfg.stats.length + ',1fr);gap:32px">';
      cfg.stats.forEach(function(st) {
        stHTML += '<div style="text-align:center">' +
          '<p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">' + st.num + '</p>' +
          '<p style="font-size:13px;font-weight:700;color:#F9A825;margin-top:8px">' + st.org + '</p>' +
          '<p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:4px">' + st.desc + '</p>' +
        '</div>';
      });
      stHTML += '</div></div></section>';
      var engSection = document.querySelector('.' + prefix + '-engines');
      if (engSection) { engSection.insertAdjacentHTML('afterend', stHTML); }
      else { ctaSection.insertAdjacentHTML('beforebegin', stHTML); }
    }

    // --- FAQ SECTION ---
    if (cfg.faqs && !document.querySelector('.' + prefix + '-faq')) {
      var faqHTML = '<section class="' + prefix + '-faq" style="padding:96px 48px">' +
        '<div style="max-width:800px;margin:0 auto">' +
          '<div style="text-align:center;margin-bottom:56px">' +
            '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">FAQ</p>' +
            '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">' + cfg.faqH2 + '</h2>' +
          '</div>';
      cfg.faqs.forEach(function(item) {
        faqHTML += '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0">' +
          '<button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">' +
            item.q +
            '' +
          '</button>' +
          '<div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease">' +
            '<p style="font-size:16px;color:#6E6E6E;line-height:1.65;padding-top:16px">' + item.a + '</p>' +
          '</div>' +
        '</div>';
      });
      faqHTML += '</div></section>';
      var statsSection = document.querySelector('.' + prefix + '-stats');
      if (statsSection) { statsSection.insertAdjacentHTML('afterend', faqHTML); }
      else { ctaSection.insertAdjacentHTML('beforebegin', faqHTML); }
    }

    // --- CTA FIX ---
    var ctaHeading = document.querySelector('.pf-cta-heading');
    if (ctaHeading) {
      if (cfg.ctaH2.indexOf('<br>') !== -1) {
        var parts = cfg.ctaH2.split('<br>');
        ctaHeading.innerHTML = parts[0] + '<br><span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">' + parts[1] + '</span>';
      } else {
        ctaHeading.innerHTML = cfg.ctaH2;
      }
    }
    var ctaSubEl = document.querySelector('.pf-cta-sub');
    if (ctaSubEl) { ctaSubEl.textContent = cfg.ctaSub; }

    // --- HIDE EXISTING WEBFLOW FEATURE SECTIONS ---
    document.querySelectorAll('.pf-section').forEach(function(s) {
      s.style.display = 'none';
    });
  }

  // ─────────────────────────────────────────
  // USE CASE: ONBOARDING
  // ─────────────────────────────────────────
  function fixUseCaseOnboarding() {
    buildUseCasePage({
      path: 'use-cases/onboarding',
      heroLabel: 'Onboarding',
      heroTitle: 'The retention conversation starts the day a member joins.',
      heroSub: 'Most associations send a welcome email and then go silent until renewal. PropFuel turns onboarding into a year-long engagement journey \u2014 with the right conversation at every milestone.',
      problemLabel: 'The Problem',
      problemH2: 'A welcome email is not an onboarding strategy.',
      problemBody: [
        'A new member joins. They get a welcome email \u2014 maybe two. It has a login link, a list of benefits, and a reminder to update their profile. Then silence. For months. The next time they hear from the association, it is a renewal notice.',
        'In the meantime, that member never found the resources that would have mattered to them. They never connected with a local chapter or a committee. <strong>They never told anyone what they were hoping to get out of their membership \u2014 because nobody asked.</strong>',
        '<strong>\u201CHorrible retention rate \u2014 losing new members before years two or three.\u201D</strong> That is not a PropFuel talking point. That is what associations say about themselves when they are being honest.'
      ],
      problemGraphic: '<div style="background:rgba(255,255,255,.06);border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,.1);text-align:center;max-width:340px">' +
        '<div style="font-size:48px;font-weight:900;color:#F47C2C;margin-bottom:8px">1</div>' +
        '<div style="font-size:14px;color:#EDE8DF;font-weight:600;margin-bottom:4px">Welcome Email</div>' +
        '<div style="font-size:12px;color:#8C8479;margin-bottom:24px">then silence for months</div>' +
        '<div style="width:2px;height:40px;background:rgba(255,255,255,.1);margin:0 auto 16px"></div>' +
        '<div style="font-size:48px;font-weight:900;color:#F47C2C;margin-bottom:8px">?</div>' +
        '<div style="font-size:14px;color:#EDE8DF;font-weight:600">Renewal Notice</div>' +
        '<div style="font-size:12px;color:#8C8479;margin-top:4px">\u201CPlease renew\u201D \u2014 with no relationship built</div>' +
      '</div>',
      centerpieceHTML: '<div style="text-align:center;margin-bottom:56px">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The Journey</p>' +
        '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Six conversations across the first year.</h2>' +
      '</div>' +
      '<div style="max-width:700px;margin:0 auto;position:relative">' +
        '<div style="position:absolute;left:24px;top:24px;bottom:24px;width:2px;background:linear-gradient(to bottom,#FBC02D,#F47C2C);border-radius:1px"></div>' +
        ['Week 1|Get Acquainted|The very first check-in. Understand what brought them to the association and what they are hoping to get from their membership.|What are you most hoping to get out of your membership this year?',
         'Week 3|Understand Preferences|Learn how they prefer to engage \u2014 events, online resources, networking, or a mix. This shapes what content and opportunities get surfaced to them.|What\u2019s your preferred way to stay involved \u2014 events, online resources, or networking?',
         'Month 2|Update Their Profile|Confirm their role, focus area, and contact details. This is a database update disguised as a friendly check-in.|We want to make sure we\u2019re sending you relevant content. Can you confirm your current role and area of focus?',
         'Month 3\u20134|Get Them Involved|Surface volunteer opportunities, committees, and local chapters based on what they have already told you about their interests.|Is there a committee or volunteer opportunity you\u2019d be interested in?',
         'Month 5\u20136|Gauge Satisfaction|A mid-year pulse check. Promoters get routed to testimonial and referral requests. Detractors trigger staff alerts.|How has your membership experience been so far?',
         'Month 8\u20139|Prepare for Renewal|The pre-renewal conversation. This is the moment to surface hesitations, reinforce value, and give staff a heads-up on at-risk members.|Has your membership been worth it so far? We\u2019d love your honest feedback.'
        ].map(function(s) {
          var p = s.split('|');
          return '<div style="display:flex;gap:24px;margin-bottom:40px;position:relative">' +
            '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
            '</div>' +
            '<div style="flex:1">' +
              '<div style="font-size:13px;font-weight:700;color:#F47C2C;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">' + p[0] + '</div>' +
              '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:8px">' + p[1] + '</h3>' +
              '<p style="font-size:15px;color:#6E6E6E;line-height:1.6;margin-bottom:12px">' + p[2] + '</p>' +
              '<div style="background:#F6F2E8;border-radius:12px;padding:16px 20px;border-left:3px solid #FBC02D">' +
                '<p style="font-size:14px;color:#2F2F2F;font-style:italic;line-height:1.5">\u201C' + p[3] + '\u201D</p>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>',
      enginesH2: 'Four engines working together to run your onboarding.',
      engines: [
        { name: 'Engagement Engine', desc: 'Delivers single-question check-ins via email, website, and SMS \u2014 the interactions that capture what each new member needs.' },
        { name: 'Automation Engine', desc: 'Runs the full onboarding sequence automatically \u2014 timing, branching, follow-ups, and staff alerts \u2014 with no manual work.' },
        { name: 'Insights Engine', desc: 'Turns every response into a searchable, reportable data point. See trends, identify at-risk members, and measure engagement over time.' },
        { name: 'Membership AI', desc: 'Generates campaign content, analyzes open-ended responses, and scores member health \u2014 so your team focuses where it matters most.' }
      ],
      statsH2: 'Proof that conversations build retention.',
      stats: [
        { num: '2x', org: 'AMA', desc: 'Doubled new member engagement with a structured onboarding conversation series.' },
        { num: '45%', org: 'AMA', desc: 'Engagement rate on a 10-email onboarding series \u2014 far above industry benchmarks.' },
        { num: '1,700+', org: 'AMA', desc: 'Responses collected from new members in the first year of onboarding campaigns.' },
        { num: '$650K', org: 'All Clients', desc: 'Average first-year revenue growth across PropFuel clients running onboarding programs.' }
      ],
      faqH2: 'Common questions about onboarding campaigns.',
      faqs: [
        { q: 'How many check-ins should we send during onboarding?', a: 'Most successful onboarding programs use 3\u201311 check-ins spread across the first 3\u20139 months. PropFuel blueprints default to 6 touchpoints, but the sequence is fully customizable based on your membership cycle and capacity.' },
        { q: 'What if we already send a welcome email series?', a: 'PropFuel onboarding is different from a welcome drip. Your existing emails broadcast information. PropFuel emails ask questions and capture responses. They work alongside your existing communications \u2014 adding a listening layer on top of what you already send.' },
        { q: 'Can we customize the questions for different member types?', a: 'Yes. PropFuel supports segmentation by member type, join date, chapter, or any field in your AMS. You can run different onboarding tracks for students vs. professionals, individual vs. organizational members, or any other segment.' },
        { q: 'How do responses get back to our AMS?', a: 'Every response writes back to your AMS automatically in real time. No CSV exports, no manual data entry. If a member tells PropFuel they are interested in a committee, that data appears in their AMS record immediately.' },
        { q: 'What kind of response rates should we expect?', a: 'Onboarding campaigns typically see 10\u201325% response rates per check-in. New members are the most engaged audience you have \u2014 they just joined and they want to hear from you. The key is asking while the motivation is fresh.' }
      ],
      ctaH2: 'Stop losing members<br>you never onboarded.',
      ctaSub: 'Retention does not start at renewal. It starts the day a member joins. If the first year feels generic, the renewal is already lost.'
    });
  }

  // ─────────────────────────────────────────
  // USE CASE: RENEWALS
  // ─────────────────────────────────────────
  function fixUseCaseRenewals() {
    buildUseCasePage({
      path: 'use-cases/renewals',
      heroLabel: 'Renewals',
      heroTitle: 'Earn the renewal. Long before the invoice.',
      heroSub: 'PropFuel starts the renewal conversation 90 days before the invoice. Committed members renew faster. Wavering members get the nudge that matters.',
      problemLabel: 'The Problem',
      problemH2: 'You remind them. You never ask them.',
      problemBody: [
        'Expiration approaches. Three emails go out. A mailed invoice. Maybe a call. <strong>They all say the same thing \u2014 renew now \u2014 and none of them ask whether membership was worth it.</strong>',
        'When someone doesn\u2019t renew, the only data point is non-payment. Cost? Relevance? Career change? <strong>The decision to leave happened weeks earlier \u2014 and the association was never in the conversation.</strong>'
      ],
      problemGraphic: '<div style="background:rgba(255,255,255,.06);border-radius:18px;padding:26px;border:1px solid rgba(255,255,255,.1);max-width:380px;font-family:\'DM Sans\',sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.3)"><div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.08)"><div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;flex-shrink:0">JD</div><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;color:#EDE8DF;line-height:1.2">Jennifer Davis</div><div style="font-size:11px;color:#8C8479;margin-top:2px">Member since 2019 \u00B7 Expires Apr 30</div></div><div style="background:rgba(230,81,0,.18);color:#F47C2C;font-size:10px;font-weight:800;padding:5px 9px;border-radius:6px;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap">At Risk</div></div><div style="display:flex;flex-direction:column;gap:10px"><div style="background:rgba(255,255,255,.04);border-left:3px solid #F47C2C;padding:12px 14px;border-radius:8px"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px"><span style="font-size:11px;color:#8C8479">no-reply@assoc.org</span><span style="font-size:11px;color:#8C8479">Apr 15</span></div><div style="font-size:13px;color:#EDE8DF;font-weight:600;margin-bottom:5px">Your membership is expiring</div><div style="display:flex;align-items:center;gap:6px;font-size:10px;color:#8C8479"><span style="width:6px;height:6px;border-radius:50%;background:#F47C2C;display:inline-block"></span>Unread</div></div><div style="background:rgba(255,255,255,.04);border-left:3px solid #F47C2C;padding:12px 14px;border-radius:8px"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px"><span style="font-size:11px;color:#8C8479">no-reply@assoc.org</span><span style="font-size:11px;color:#8C8479">Apr 22</span></div><div style="font-size:13px;color:#EDE8DF;font-weight:600;margin-bottom:5px">Reminder: Membership expires soon</div><div style="display:flex;align-items:center;gap:6px;font-size:10px;color:#8C8479"><span style="width:6px;height:6px;border-radius:50%;background:#F47C2C;display:inline-block"></span>Unread</div></div><div style="background:rgba(255,255,255,.04);border-left:3px solid #E65100;padding:12px 14px;border-radius:8px"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px"><span style="font-size:11px;color:#8C8479">no-reply@assoc.org</span><span style="font-size:11px;color:#8C8479">Apr 29</span></div><div style="font-size:13px;color:#EDE8DF;font-weight:600;margin-bottom:5px">Final notice: Renew today</div><div style="display:flex;align-items:center;gap:6px;font-size:10px;color:#8C8479"><span style="width:6px;height:6px;border-radius:50%;background:#E65100;display:inline-block"></span>Unread</div></div></div><div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:12px"><span style="font-size:12px;color:#8C8479;font-style:italic">3 messages. 0 conversations.</span><span style="font-size:10px;font-weight:800;color:#EDE8DF;text-transform:uppercase;letter-spacing:.08em;background:#E65100;padding:5px 10px;border-radius:6px">Lapsed</span></div></div>',
      centerpieceHTML: '<div style="text-align:center;margin-bottom:56px">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The Sandwich Technique</p>' +
        '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;margin-bottom:24px">Five steps. Ninety days.</h2>' +
        '<p style="font-size:17px;color:#6E6E6E;line-height:1.6;max-width:700px;margin:0 auto">PropFuel\u2019s renewal approach wraps the direct renewal ask between emotional value conversations \u2014 so the payment request never arrives cold.</p>' +
      '</div>' +
      '<div style="max-width:800px;margin:0 auto;display:flex;flex-direction:column;gap:24px">' +
        ['90 Days Out|Soft Intent|A low-pressure check-in that asks about the member\u2019s experience. No mention of renewal yet. Just listening.|#FBC02D',
         '60 Days Out|Emotional Value|Reinforce what the membership has delivered. Surface personalized benefits based on their engagement history.|#F9A825',
         '45 Days Out|Direct Action|The renewal ask \u2014 but it arrives after two conversations that reminded them why they joined. Context changes everything.|#F47C2C',
         '30 Days Out|Surface Hesitations|For non-responders: ask what is holding them back. Cost? Relevance? Time? The answer determines the follow-up.|#E65100',
         'Expiration|Final Notice|A last touchpoint that acknowledges the relationship and makes it easy to act \u2014 or tells you exactly why they are leaving.|#D84315'
        ].map(function(s, i) {
          var p = s.split('|');
          return '<div style="display:flex;gap:24px;align-items:flex-start">' +
            '<div style="width:80px;flex-shrink:0;text-align:center">' +
              '<div style="width:48px;height:48px;border-radius:50%;background:' + p[3] + ';display:flex;align-items:center;justify-content:center;margin:0 auto;color:#fff;font-size:18px;font-weight:800">' + (i + 1) + '</div>' +
            '</div>' +
            '<div class="pf-card" style="flex:1;background:#F6F2E8;border-radius:16px;padding:28px 24px">' +
              '<div style="font-size:13px;font-weight:700;color:#F47C2C;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">' + p[0] + '</div>' +
              '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:8px">' + p[1] + '</h3>' +
              '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">' + p[2] + '</p>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>',
      enginesH2: 'Four engines working together to run your renewal conversation.',
      engines: [
        { name: 'Engagement Engine', desc: 'Delivers single-question check-ins that surface intent, satisfaction, and hesitations \u2014 the signals that predict renewal.' },
        { name: 'Automation Engine', desc: 'Runs the full 90-day renewal sequence with timing, branching, and staff alerts \u2014 no manual intervention required.' },
        { name: 'Insights Engine', desc: 'Aggregates renewal signals into dashboards. See who is likely to renew, who is wavering, and what the common objections are.' },
        { name: 'Membership AI', desc: 'Scores renewal likelihood, generates personalized messaging, and flags at-risk members before staff would catch them.' }
      ],
      statsH2: 'Proof that conversations drive renewals.',
      stats: [
        { num: '95%', org: 'AAMFT', desc: 'On-time renewal rate \u2014 up from 80.5%, plus 7% overall membership growth.' },
        { num: '653', org: 'Feline VMA', desc: 'Members renewed after a targeted PropFuel renewal conversation campaign.' },
        { num: '$65K', org: 'WQA', desc: 'Additional revenue from a 5% renewal rate increase driven by PropFuel conversations.' },
        { num: '72%', org: 'All Clients', desc: 'Average engagement rate on renewal intent campaigns across all PropFuel clients.' }
      ],
      faqH2: 'Common questions about renewal campaigns.',
      faqs: [
        { q: 'When should we start the renewal conversation?', a: 'Ninety days before expiration. This gives you three months to build context, surface hesitations, and address concerns \u2014 instead of sending three identical payment reminders in the final weeks.' },
        { q: 'Will this replace our existing renewal emails?', a: 'It can complement or replace them. Many organizations run PropFuel\u2019s renewal sequence alongside their AMS-generated invoices. The PropFuel emails handle the conversation; your AMS handles the transaction.' },
        { q: 'What if a member says they are not going to renew?', a: 'That response is valuable data. PropFuel captures the reason, triggers a staff alert, and can route the member to a personalized follow-up \u2014 a discount offer, a call from a board member, or an exit survey.' },
        { q: 'How do we measure the impact on renewal rates?', a: 'PropFuel\u2019s Insights Engine tracks renewal intent, member signals, and actual renewal rates. You can compare cohorts that received PropFuel outreach against those that did not.' },
        { q: 'Can we run different renewal campaigns for different member types?', a: 'Yes. Segment by member type, tenure, engagement level, or any AMS field. A first-year member gets a different renewal experience than a 20-year veteran.' }
      ],
      ctaH2: 'Turn renewals<br>into conversations.',
      ctaSub: 'The members who do not renew are not the ones who forgot. They are the ones who decided it was not worth it \u2014 and nobody asked them why until it was too late.'
    });
  }

  // ─────────────────────────────────────────
  // USE CASE: WIN-BACK
  // ─────────────────────────────────────────
  function fixUseCaseWinBack() {
    buildUseCasePage({
      path: 'use-cases/win-back',
      heroLabel: 'Win-Back',
      heroTitle: 'Know why they left. Win them back.',
      heroSub: 'PropFuel asks every lapsed member why they left \u2014 and runs personalized win-back campaigns based on what they say. Not a blast email to an indifferent list. A conversation.',
      problemLabel: 'The Problem',
      problemH2: 'You know when members leave. You don\u2019t know why.',
      problemBody: [
        'An expiration date passes. A \u201Cwe miss you\u201D email goes out. Maybe someone picks up the phone. <strong>But nobody knows why the member left \u2014 so every outreach is a guess.</strong>',
        'Some left on purpose. Some just lost track. Some would come back if anyone made it easy. <strong>The association can\u2019t tell the difference \u2014 because no one ever asked.</strong>',
        '<strong>\u201CWe\u2019ve never actually asked lapsed members why they left.\u201D</strong> That\u2019s the starting point for most associations. PropFuel changes it \u2014 one question at a time.'
      ],
      problemGraphic: '<div style="background:rgba(255,255,255,.06);border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,.1);max-width:340px;text-align:center">' +
        '<div style="font-size:64px;font-weight:900;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px">?</div>' +
        '<div style="font-size:16px;font-weight:700;color:#EDE8DF;margin-bottom:16px">Why did they leave?</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;text-align:left">' +
          '<div style="background:rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;font-size:13px;color:#8C8479;display:flex;align-items:center;gap:8px"><span style="color:#F47C2C">\u2022</span> Cost too high?</div>' +
          '<div style="background:rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;font-size:13px;color:#8C8479;display:flex;align-items:center;gap:8px"><span style="color:#F47C2C">\u2022</span> Not relevant anymore?</div>' +
          '<div style="background:rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;font-size:13px;color:#8C8479;display:flex;align-items:center;gap:8px"><span style="color:#F47C2C">\u2022</span> Career change?</div>' +
          '<div style="background:rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;font-size:13px;color:#8C8479;display:flex;align-items:center;gap:8px"><span style="color:#FBC02D">\u2022</span> Just forgot?</div>' +
        '</div>' +
      '</div>',
      centerpieceHTML: '<div style="text-align:center;margin-bottom:56px">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Two Tracks</p>' +
        '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Different cadences for different lapse windows.</h2>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:56px">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px">' +
          '<h3 style="font-size:22px;font-weight:700;color:#F47C2C;margin-bottom:8px">Recently Lapsed</h3>' +
          '<p style="font-size:14px;color:#6E6E6E;margin-bottom:20px">0\u20136 months past expiration</p>' +
          '<div style="display:flex;flex-direction:column;gap:16px">' +
            '<div style="display:flex;gap:12px;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:13px;font-weight:700">1</div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F">Acknowledge the Lapse</div><div style="font-size:13px;color:#6E6E6E;margin-top:2px">Warm, personal outreach that says \u201Cwe noticed.\u201D</div></div></div>' +
            '<div style="display:flex;gap:12px;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:13px;font-weight:700">2</div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F">Ask Why</div><div style="font-size:13px;color:#6E6E6E;margin-top:2px">Surface the reason \u2014 cost, relevance, career change, or just forgot.</div></div></div>' +
            '<div style="display:flex;gap:12px;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:13px;font-weight:700">3</div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F">Branch by Answer</div><div style="font-size:13px;color:#6E6E6E;margin-top:2px">Cost concerns get a payment plan. Relevance issues get a value pitch.</div></div></div>' +
            '<div style="display:flex;gap:12px;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:13px;font-weight:700">4</div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F">Close or Escalate</div><div style="font-size:13px;color:#6E6E6E;margin-top:2px">Auto-renewal link or staff alert for personal follow-up.</div></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px">' +
          '<h3 style="font-size:22px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Dormant Members</h3>' +
          '<p style="font-size:14px;color:#6E6E6E;margin-bottom:20px">6+ months to years past expiration</p>' +
          '<div style="display:flex;flex-direction:column;gap:16px">' +
            '<div style="display:flex;gap:12px;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:#2F2F2F;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:13px;font-weight:700">1</div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F">Re-Introduce Yourself</div><div style="font-size:13px;color:#6E6E6E;margin-top:2px">They may not remember you. Lead with value, not payment.</div></div></div>' +
            '<div style="display:flex;gap:12px;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:#2F2F2F;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:13px;font-weight:700">2</div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F">Test Interest</div><div style="font-size:13px;color:#6E6E6E;margin-top:2px">Ask what has changed in their career. Find the new hook.</div></div></div>' +
            '<div style="display:flex;gap:12px;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:#2F2F2F;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:13px;font-weight:700">3</div><div><div style="font-size:14px;font-weight:700;color:#2F2F2F">Make It Easy</div><div style="font-size:13px;color:#6E6E6E;margin-top:2px">One-click rejoin link tailored to their response.</div></div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="max-width:600px;margin:0 auto;background:#F6F2E8;border-radius:16px;padding:28px 32px">' +
        '<h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:16px">Example Questions</h4>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          '<div style="background:#fff;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F;border:1px solid #E3DDD2">\u201CWe noticed you haven\u2019t renewed. What was the biggest reason?\u201D</div>' +
          '<div style="background:#fff;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F;border:1px solid #E3DDD2">\u201CIf we could change one thing about membership, what would it be?\u201D</div>' +
          '<div style="background:#fff;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F;border:1px solid #E3DDD2">\u201CWould a multi-year or payment plan option make a difference?\u201D</div>' +
        '</div>' +
      '</div>',
      enginesH2: 'Four engines working together to bring members back.',
      engines: [
        { name: 'Engagement Engine', desc: 'Delivers personalized outreach that acknowledges the lapse and opens a real conversation \u2014 not just another blast.' },
        { name: 'Automation Engine', desc: 'Manages two separate cadences for recently lapsed and dormant members, with branching based on responses.' },
        { name: 'Insights Engine', desc: 'Captures why members left, identifies common patterns, and reports on win-back conversion rates.' },
        { name: 'Membership AI', desc: 'Scores re-engagement likelihood and recommends personalized messaging for each lapsed segment.' }
      ],
      statsH2: 'Proof that conversations bring members back.',
      stats: [
        { num: '80%', org: 'AAP', desc: 'Win-back rate on lapsed members who were re-engaged through PropFuel conversations.' },
        { num: '$15K', org: 'INCOSE', desc: 'Revenue recovered from a single win-back campaign targeting recently lapsed members.' },
        { num: '50', org: 'MSTA', desc: 'Members re-engaged in one campaign \u2014 members who had been silent for over a year.' },
        { num: '$100M+', org: 'All Clients', desc: 'Total revenue growth across PropFuel clients, including win-back contributions.' }
      ],
      faqH2: 'Common questions about win-back campaigns.',
      faqs: [
        { q: 'How soon after lapse should we reach out?', a: 'Immediately \u2014 within the first 30 days. The longer you wait, the harder it gets. PropFuel\u2019s recently lapsed track starts automatically when a member\u2019s expiration passes without renewal.' },
        { q: 'What about members who lapsed years ago?', a: 'PropFuel\u2019s dormant member track uses a different approach \u2014 re-introduction rather than reminder. The messaging acknowledges the time gap and leads with value rather than payment.' },
        { q: 'How do we handle members who say they left intentionally?', a: 'That response is captured and categorized. You learn the reason, the data feeds your retention strategy, and the member is removed from further outreach. Not every lapsed member should be won back \u2014 but you should always know why they left.' },
        { q: 'Can we offer discounts or payment plans through PropFuel?', a: 'Yes. PropFuel can branch based on the stated reason for lapsing. If a member says cost is the issue, the follow-up can include a payment plan link or discount code. If they say irrelevance, they get a different value-focused message.' },
        { q: 'What win-back rates are realistic?', a: 'Recently lapsed members (0\u20136 months) typically see 15\u201330% re-engagement rates. Long-dormant members are harder \u2014 5\u201315% is a strong result. The key insight is that even members who do not rejoin provide data that improves your retention strategy.' }
      ],
      ctaH2: 'Bring them back.',
      ctaSub: 'Every lapsed member is a relationship that ended without a conversation. Some left on purpose. Some lost track. Some would come back if anyone asked. PropFuel asks.'
    });
  }

  // ─────────────────────────────────────────
  // USE CASE: ACQUISITION
  // ─────────────────────────────────────────
  function fixUseCaseAcquisition() {
    buildUseCasePage({
      path: 'use-cases/acquisition',
      heroLabel: 'Acquisition',
      heroTitle: 'Turn warm prospects into new members.',
      heroSub: 'Non-members attend your events, subscribe to your newsletter, browse your website, and take your CE courses. PropFuel identifies them and nurtures them into membership \u2014 through conversation, not campaigns.',
      problemLabel: 'The Problem',
      problemH2: 'Your best prospects are already in the room. You just don\u2019t know who they are.',
      problemBody: [
        '8,500 people visit your site this month. 2,000 show up at your conference. Hundreds more subscribe to your newsletter \u2014 without a membership. <strong>Most of them quietly leave: unidentified, untracked, unengaged.</strong>',
        'Your team burns budget on paid ads and partnerships chasing new prospects \u2014 while the warmest ones already raised their hands. <strong>You just don\u2019t have a mechanism to capture the signal.</strong>'
      ],
      problemGraphic: '<div style="background:rgba(255,255,255,.05);border-radius:18px;padding:28px 24px;border:1px solid rgba(255,255,255,.1);max-width:380px">' +
        '<div style="font-size:13px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:22px;text-align:center">Prospects, Unseen</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:14px">' +
          '<div><div style="font-size:13px;font-weight:600;color:#EDE8DF">Website</div><div style="font-size:11px;color:#8C8479">monthly visitors</div></div>' +
          '<div style="text-align:right"><div style="font-size:22px;font-weight:900;color:#FBC02D;line-height:1">8,500</div><div style="font-size:11px;color:#F47C2C;margin-top:3px">\u2192 0 identified</div></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:14px">' +
          '<div><div style="font-size:13px;font-weight:600;color:#EDE8DF">Events</div><div style="font-size:11px;color:#8C8479">non-member attendees</div></div>' +
          '<div style="text-align:right"><div style="font-size:22px;font-weight:900;color:#FBC02D;line-height:1">350</div><div style="font-size:11px;color:#F47C2C;margin-top:3px">\u2192 0 nurtured</div></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
          '<div><div style="font-size:13px;font-weight:600;color:#EDE8DF">Newsletter</div><div style="font-size:11px;color:#8C8479">non-member subscribers</div></div>' +
          '<div style="text-align:right"><div style="font-size:22px;font-weight:900;color:#FBC02D;line-height:1">720</div><div style="font-size:11px;color:#F47C2C;margin-top:3px">\u2192 0 engaged</div></div>' +
        '</div>' +
      '</div>',
      centerpieceHTML: '<div style="text-align:center;margin-bottom:56px">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Three Paths</p>' +
        '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Every prospect has a starting point. PropFuel meets them there.</h2>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:56px">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px 28px">' +
          '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg></div>' +
          '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Non-Member Event Attendees</h3>' +
          '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;margin-bottom:16px">Your conferences, webinars, and CE courses fill rooms with future members. PropFuel follows up with check-ins that turn attendance into a joining conversation.</p>' +
          '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:13px;color:#2F2F2F;font-weight:600">Convert the room you already filled</div>' +
        '</div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px 28px">' +
          '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg></div>' +
          '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Newsletter & Content Subscribers</h3>' +
          '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;margin-bottom:16px">Non-members already reading your content are warm leads. PropFuel runs personalized check-ins that surface membership as the obvious next step \u2014 on their timeline, not yours.</p>' +
          '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:13px;color:#2F2F2F;font-weight:600">Conversations, not drip campaigns</div>' +
        '</div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px 28px">' +
          '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>' +
          '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Anonymous Website Visitors</h3>' +
          '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;margin-bottom:16px">A single conversational question on your site \u2014 \u201CWhat brought you here today?\u201D \u2014 captures intent from anonymous traffic and turns the warmest visits into identified prospects.</p>' +
          '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:13px;color:#2F2F2F;font-weight:600">7\u201314\u00d7 more engagement than typical pop-ups</div>' +
        '</div>' +
      '</div>' +
      '<div style="max-width:700px;margin:0 auto">' +
        '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;text-align:center;margin-bottom:32px">5-Step Nurture Flow</h3>' +
        '<div style="display:flex;flex-direction:column;gap:16px">' +
          ['1|Capture Interest|A check-in at any touchpoint \u2014 event, newsletter, website, or CE course \u2014 asks what brought them to your association.',
           '2|Qualify Intent|Follow-up asks about their role, industry, and what they are looking for.',
           '3|Deliver Value|Share a relevant resource \u2014 event, publication, or community \u2014 based on their answers.',
           '4|Surface Membership|Position membership as the natural next step for what they have already shown interest in.',
           '5|Convert or Nurture|Ready prospects get a join link. Not-yet-ready prospects stay in the conversation.'
          ].map(function(s) {
            var p = s.split('|');
            return '<div style="display:flex;gap:16px;align-items:center">' +
              '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:14px;font-weight:800">' + p[0] + '</div>' +
              '<div style="flex:1;background:#F6F2E8;border-radius:12px;padding:16px 20px">' +
                '<span style="font-weight:700;color:#2F2F2F">' + p[1] + ':</span> ' +
                '<span style="color:#6E6E6E">' + p[2] + '</span>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>',
      enginesH2: 'Three engines working together to turn prospects into members.',
      engines: [
        { name: 'Engagement Engine', desc: 'Captures interest through check-ins across email, SMS, and the website \u2014 meeting prospects wherever they already are.' },
        { name: 'Automation Engine', desc: 'Runs nurture sequences automatically, branching by interest and channel to keep every prospect moving toward membership.' },
        { name: 'Insights Engine', desc: 'Tracks the full acquisition funnel \u2014 from first touchpoint to new member \u2014 with attribution by channel and campaign.' }
      ],
      statsH2: 'Proof that conversations convert prospects.',
      stats: [
        { num: '$304K', org: 'AMA', desc: 'Membership revenue generated from website visitor capture and nurture campaigns.' },
        { num: '107', org: 'NAPNAP', desc: 'New members in 45 days from a PropFuel acquisition campaign, generating $21.4K.' },
        { num: '14%', org: 'AMA', desc: 'Conversion rate from website visitor capture to qualified prospect.' },
        { num: '2x', org: 'A|B Test', desc: 'Higher engagement from PropFuel widget vs. traditional website pop-ups.' }
      ],
      faqH2: 'Common questions about acquisition.',
      faqs: [
        { q: 'What channels does PropFuel use to acquire members?', a: 'Wherever non-members show up: your website, your events, your newsletter, your CE courses, and your content library. PropFuel deploys lightweight check-ins to any of those touchpoints and routes the responses into the same nurture engine.' },
        { q: 'How do you follow up with non-member event attendees?', a: 'After your conference, webinar, or CE course, PropFuel sends attendees a single-question check-in (\u201CWhat was your biggest takeaway?\u201D or similar). Responses kick off a personalized nurture that positions membership as the next step based on what they said.' },
        { q: 'How does the website widget work?', a: 'A lightweight conversational embed asks one question \u2014 \u201CWhat brought you here today?\u201D or similar \u2014 and captures the visitor\u2019s email and interest. No login, no form, no friction. Setup takes about 15 minutes.' },
        { q: 'How is this different from an email drip?', a: 'A drip broadcasts the same sequence to everyone. PropFuel starts with a single question, branches based on what the prospect tells you, and keeps the conversation going until they convert or opt out. It reads less like marketing and more like a human follow-up.' },
        { q: 'What if someone is already a member?', a: 'PropFuel cross-references captures against your AMS. Known members are routed to engagement campaigns instead of acquisition flows. No duplicate outreach, no confusion.' }
      ],
      ctaH2: 'Turn every touchpoint<br>into a member.',
      ctaSub: 'Every event, every subscriber, every visitor is a potential member. PropFuel makes sure none of them slip away \u2014 and turns the warmest ones into dues-paying members.'
    });
  }

  // ─────────────────────────────────────────
  // USE CASE: EVENTS
  // ─────────────────────────────────────────
  function fixUseCaseEvents() {
    buildUseCasePage({
      path: 'use-cases/events',
      heroLabel: 'Events',
      heroTitle: 'Your biggest event. Your richest signal.',
      heroSub: 'Capture what members tell you before, during, and after \u2014 so every session, booth, and survey turns into data that outlasts the event.',
      problemLabel: 'The Problem',
      problemH2: 'Your event is loaded with signal. Most of it vanishes the day it ends.',
      problemBody: [
        'Registration tells you who signed up. Attendance tells you who showed up. But <strong>nobody captures what attendees hoped to get \u2014 or whether they got it.</strong>',
        '<strong>\u201CWe know 2,000 people attended. We have no idea what 2,000 people thought.\u201D</strong> That is the gap PropFuel closes.'
      ],
      problemGraphic: '<div style="background:rgba(255,255,255,.05);border-radius:18px;padding:28px 24px;border:1px solid rgba(255,255,255,.1);max-width:360px">' +
        '<div style="font-size:13px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:22px;text-align:center">Signal, Captured</div>' +
        '<div style="margin-bottom:18px">' +
          '<div style="font-size:11px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Before</div>' +
          '<div style="background:rgba(255,255,255,.05);border-radius:10px;padding:10px 12px;font-size:13px;color:#EDE8DF;line-height:1.45">\u201CWhat do you hope to get out of this year\u2019s conference?\u201D</div>' +
          '<div style="font-size:12px;color:#F47C2C;font-style:italic;margin-top:6px">\u2192 1,247 responses</div>' +
        '</div>' +
        '<div style="margin-bottom:18px">' +
          '<div style="font-size:11px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">During</div>' +
          '<div style="background:rgba(255,255,255,.05);border-radius:10px;padding:10px 12px;font-size:13px;color:#EDE8DF;line-height:1.45">\u201CHow is today\u2019s session landing for you?\u201D</div>' +
          '<div style="font-size:12px;color:#F47C2C;font-style:italic;margin-top:6px">\u2192 893 responses</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:11px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">After</div>' +
          '<div style="background:rgba(255,255,255,.05);border-radius:10px;padding:10px 12px;font-size:13px;color:#EDE8DF;line-height:1.45">\u201CWhat one thing will you take back to your work?\u201D</div>' +
          '<div style="font-size:12px;color:#F47C2C;font-style:italic;margin-top:6px">\u2192 1,508 responses</div>' +
        '</div>' +
      '</div>',
      centerpieceHTML: '<div style="text-align:center;margin-bottom:56px">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Three Phases</p>' +
        '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Before. During. After.</h2>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-bottom:56px">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 28px">' +
          '<div style="font-size:13px;font-weight:700;color:#F47C2C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">Before</div>' +
          '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Build Anticipation</h3>' +
          '<ul style="font-size:14px;color:#6E6E6E;line-height:1.8;padding-left:18px"><li>Drive registrations from interested non-attendees</li><li>Ask what sessions matter most</li><li>Surface networking and volunteer interests</li><li>Pre-event profile enrichment</li></ul>' +
        '</div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 28px">' +
          '<div style="font-size:13px;font-weight:700;color:#F47C2C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">During</div>' +
          '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Capture In Real Time</h3>' +
          '<ul style="font-size:14px;color:#6E6E6E;line-height:1.8;padding-left:18px"><li>SMS check-ins during sessions</li><li>Real-time satisfaction pulse</li><li>Session-specific feedback</li><li>Exhibitor and sponsor engagement</li></ul>' +
        '</div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 28px">' +
          '<div style="font-size:13px;font-weight:700;color:#F47C2C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">After</div>' +
          '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Convert and Follow Up</h3>' +
          '<ul style="font-size:14px;color:#6E6E6E;line-height:1.8;padding-left:18px"><li>NPS with branching follow-up</li><li>Promoters routed to testimonials</li><li>Detractors trigger staff alerts</li><li>Non-attendees get \u201Cwhat you missed\u201D outreach</li></ul>' +
        '</div>' +
      '</div>' +
      '<div class="pf-card" style="background:#1A1713;border-radius:20px;padding:40px;max-width:700px;margin:0 auto;text-align:center">' +
        '<div style="font-size:13px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Case Study</div>' +
        '<div style="font-size:clamp(34px,3.6vw,44px);font-weight:900;line-height:1.15;padding:6px 0;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px">$315,300</div>' +
        '<div style="font-size:18px;font-weight:700;color:#EDE8DF;margin-bottom:8px">VECCS Conference Revenue</div>' +
        '<p style="font-size:14px;color:#8C8479;line-height:1.6">10% of total conference registrations came through PropFuel\u2019s website engagement widget \u2014 turning casual website visitors into registered attendees.</p>' +
      '</div>',
      enginesH2: 'Four engines working together to maximize your event ROI.',
      engines: [
        { name: 'Engagement Engine', desc: 'Delivers check-ins via email before and after, and SMS during \u2014 capturing signal at every phase of the event lifecycle.' },
        { name: 'Automation Engine', desc: 'Runs pre-event registration drives, day-of SMS sequences, and post-event follow-up \u2014 all automatically.' },
        { name: 'Insights Engine', desc: 'Aggregates event feedback into actionable reports \u2014 session ratings, NPS trends, and sponsor engagement data.' },
        { name: 'Membership AI', desc: 'Analyzes open-ended feedback, identifies themes, and generates summary reports for leadership and sponsors.' }
      ],
      statsH2: 'Proof that events generate intelligence.',
      stats: [
        { num: '$315K', org: 'VECCS', desc: 'Conference revenue from website engagement \u2014 10% of total registrations.' },
        { num: '830%', org: 'G2 Review', desc: 'Increase in webinar registrations using PropFuel engagement campaigns.' },
        { num: '27%', org: 'VECCS', desc: 'Response rate on post-event satisfaction check-ins \u2014 far above survey benchmarks.' },
        { num: '12%', org: 'ALA', desc: 'Conversion rate from event follow-up to new member or renewed member.' }
      ],
      faqH2: 'Common questions about event campaigns.',
      faqs: [
        { q: 'Can we use PropFuel for day-of event communication?', a: 'Yes. PropFuel SMS is designed for real-time event engagement \u2014 session reminders, satisfaction pulses, and feedback collection. Text messages get read within minutes, making them ideal for conference-day communication.' },
        { q: 'How does event data connect back to member profiles?', a: 'Every event interaction writes back to your AMS. A member who said they loved the keynote, rated the networking a 9/10, and wants more CE content \u2014 all of that becomes part of their profile and shapes future outreach.' },
        { q: 'What about non-member event attendees?', a: 'They are some of your warmest acquisition prospects. PropFuel captures their information during the event and nurtures them toward membership afterward \u2014 based on what they told you they cared about.' },
        { q: 'How do we handle NPS branching?', a: 'Promoters (9-10) automatically get routed to testimonial or referral requests. Passives (7-8) get a follow-up asking what would make it a 10. Detractors (0-6) trigger a staff alert for personal outreach.' },
        { q: 'Can we share event feedback with sponsors?', a: 'Yes. The Insights Engine can generate reports segmented by session, sponsor, or topic. This data makes your sponsorship packages more valuable because you can show sponsors exactly how attendees engaged with their content.' }
      ],
      ctaH2: 'Make every<br>event count.',
      ctaSub: 'Your next conference generates more than revenue \u2014 it generates thousands of data points about what your members care about. PropFuel makes sure that intelligence shapes every interaction that follows.'
    });
  }

  // ─────────────────────────────────────────
  // USE CASE: CERTIFICATIONS
  // ─────────────────────────────────────────
  function fixUseCaseCertifications() {
    buildUseCasePage({
      path: 'use-cases/certifications',
      heroLabel: 'Certifications',
      heroTitle: 'A credential earned through you. A career built with you.',
      heroSub: 'PropFuel engages certification candidates from first interest through credential renewal \u2014 so every credential deepens the tie to your association.',
      problemLabel: 'The Problem',
      problemH2: 'Certifications are one of your most valuable non-dues revenue streams. They are also one of the most neglected parts of the member experience.',
      problemBody: [
        'A member hears about your certification program. They visit the page. Maybe they download a guide. Then nothing. <strong>You have no mechanism to nurture that interest into registration \u2014 because your marketing tools were not built for individual follow-up.</strong>',
        'For members who do enroll, the experience is often transactional. They study, they test, they get a credential. <strong>Nobody checks in during the learning process. Nobody asks how it is going. Nobody connects the certification back to their broader membership experience.</strong>',
        'And when the credential comes up for renewal? <strong>The same problem as membership renewal \u2014 a payment notice with no conversation about whether the credential still matters to their career.</strong>'
      ],
      problemGraphic: '<div style="background:rgba(255,255,255,.06);border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,.1);max-width:340px;text-align:center">' +
        '<div style="font-size:13px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:20px">Certification Funnel</div>' +
        '<div style="display:flex;flex-direction:column;gap:12px;align-items:center">' +
          '<div style="width:240px;background:rgba(251,192,45,.15);border-radius:8px;padding:10px;font-size:13px;color:#FBC02D;font-weight:600">Interested: 500</div>' +
          '<div style="width:180px;background:rgba(249,168,37,.15);border-radius:8px;padding:10px;font-size:13px;color:#F9A825;font-weight:600">Registered: 120</div>' +
          '<div style="width:140px;background:rgba(244,124,44,.15);border-radius:8px;padding:10px;font-size:13px;color:#F47C2C;font-weight:600">Completed: 85</div>' +
          '<div style="width:100px;background:rgba(244,124,44,.2);border-radius:8px;padding:10px;font-size:13px;color:#F47C2C;font-weight:600">Renewed: ?</div>' +
        '</div>' +
        '<div style="font-size:12px;color:#8C8479;margin-top:16px;font-style:italic">380 interested members lost without a conversation</div>' +
      '</div>',
      centerpieceHTML: '<div style="text-align:center;margin-bottom:56px">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Four-Stage Lifecycle</p>' +
        '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">From discovery to credential renewal.</h2>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-bottom:56px">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 24px;text-align:center"><div style="font-size:36px;margin-bottom:12px">\uD83D\uDD0D</div><h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">Discovery</h3><p style="font-size:14px;color:#6E6E6E;line-height:1.6">Surface certification interest in onboarding and engagement campaigns. Ask members about their career goals and professional development priorities.</p></div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 24px;text-align:center"><div style="font-size:36px;margin-bottom:12px">\uD83D\uDCDD</div><h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">Registration</h3><p style="font-size:14px;color:#6E6E6E;line-height:1.6">Nurture interested members from exploration to enrollment. Address objections \u2014 time, cost, relevance \u2014 with personalized follow-up based on what they told you.</p></div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 24px;text-align:center"><div style="font-size:36px;margin-bottom:12px">\uD83D\uDCDA</div><h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">Learner Engagement</h3><p style="font-size:14px;color:#6E6E6E;line-height:1.6">Check in during the certification process. Ask how the experience is going. Surface resources. Identify members who may be struggling before they drop out.</p></div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 24px;text-align:center"><div style="font-size:36px;margin-bottom:12px">\uD83D\uDD04</div><h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">Credential Renewal</h3><p style="font-size:14px;color:#6E6E6E;line-height:1.6">Start the credential renewal conversation before expiration. Reinforce how the certification has shaped their career and make renewal frictionless.</p></div>' +
      '</div>' +
      '<div class="pf-card" style="background:#1A1713;border-radius:20px;padding:40px;max-width:700px;margin:0 auto;text-align:center">' +
        '<div style="font-size:13px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Case Study: ARN</div>' +
        '<div style="font-size:clamp(34px,3.6vw,44px);font-weight:900;line-height:1.15;padding:6px 0;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px">32% Increase</div>' +
        '<div style="font-size:18px;font-weight:700;color:#EDE8DF;margin-bottom:8px">Certification Engagement</div>' +
        '<p style="font-size:14px;color:#8C8479;line-height:1.6">ARN used PropFuel to engage certification candidates throughout the learning process \u2014 resulting in a 32% increase in engagement and significantly higher completion rates.</p>' +
      '</div>',
      enginesH2: 'Four engines working together to build certification relationships.',
      engines: [
        { name: 'Engagement Engine', desc: 'Delivers check-ins at every stage of the certification lifecycle \u2014 from initial interest through credential renewal.' },
        { name: 'Automation Engine', desc: 'Runs nurture sequences, learner check-ins, and renewal campaigns automatically based on certification milestones.' },
        { name: 'Insights Engine', desc: 'Tracks the full certification funnel \u2014 interest to enrollment to completion to renewal \u2014 with drop-off analysis at every stage.' },
        { name: 'Membership AI', desc: 'Identifies at-risk learners, generates personalized encouragement, and predicts credential renewal likelihood.' }
      ],
      statsH2: 'Proof that engagement drives certification success.',
      stats: [
        { num: '32%', org: 'ARN', desc: 'Increase in certification engagement through PropFuel learner check-ins.' },
        { num: '100%', org: 'AAGO', desc: 'Engagement rate on a targeted certification interest campaign.' },
        { num: '72%', org: 'ARN', desc: 'Response rate on weekly certification-related engagement campaigns.' },
        { num: '30%', org: 'CSI', desc: 'Increase in certification program awareness through PropFuel outreach.' }
      ],
      faqH2: 'Common questions about certification campaigns.',
      faqs: [
        { q: 'How do we identify members interested in certification?', a: 'PropFuel weaves certification interest questions into your existing campaigns \u2014 onboarding, engagement, and renewal check-ins. When a member says they are interested in professional development or credential advancement, that signal triggers the certification nurture track.' },
        { q: 'Can we engage learners during the certification process?', a: 'Yes. PropFuel sends periodic check-ins during the learning and preparation phase \u2014 asking how the experience is going, surfacing study resources, and identifying members who may need additional support before they drop out.' },
        { q: 'How does this connect to certification renewal?', a: 'PropFuel starts the credential renewal conversation before the expiration date \u2014 just like membership renewal. The conversation reinforces the credential\u2019s career value and makes the renewal frictionless.' },
        { q: 'What if a member shows interest but does not register?', a: 'That is exactly the use case for PropFuel\u2019s nurture automation. Members who express interest but do not register get a follow-up sequence that addresses common objections \u2014 time commitment, cost, relevance \u2014 based on what they told you.' },
        { q: 'Does certification data sync with our AMS?', a: 'Yes. Every certification-related interaction writes back to your AMS \u2014 interest expressed, registration status, learner engagement, and credential renewal intent. Your team has a complete picture of each member\u2019s certification journey.' }
      ],
      ctaH2: 'Turn certifications into<br>career commitments.',
      ctaSub: 'When a credential is tied to your association, membership stops being an annual decision and starts being a professional identity. PropFuel helps more members get there \u2014 and stay there.'
    });
  }

  // ─────────────────────────────────────────
  // USE CASE: DATA INTELLIGENCE
  // ─────────────────────────────────────────
  function fixUseCaseDataIntelligence() {
    buildUseCasePage({
      path: 'use-cases/data-intelligence',
      heroLabel: 'Data & Intelligence',
      heroTitle: 'Every PropFuel interaction is a database update.',
      heroSub: 'Member data decays from the moment it is entered. PropFuel keeps profiles current by collecting zero-party data through conversations \u2014 not forms members hate filling out. And every response writes back to your AMS automatically.',
      problemLabel: 'The Problem',
      problemH2: 'Your member data is bad. You know it. Your team knows it. Your board probably suspects it.',
      problemBody: [
        'Job titles are three years old. Email addresses bounce. Industry codes are wrong. <strong>And the fields that would actually help you personalize \u2014 interests, goals, engagement preferences \u2014 are mostly blank.</strong>',
        'You have tried profile update forms. The response rate was abysmal. You have tried surveys. Members are tired of them. <strong>The data keeps decaying because you have no passive, ongoing mechanism to keep it fresh.</strong>',
        '<strong>\u201CWe don\u2019t trust our own database.\u201D</strong> That is the confession behind most association data problems. PropFuel gives you a way to rebuild that trust \u2014 one conversation at a time.'
      ],
      problemGraphic: '<div style="background:rgba(255,255,255,.06);border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,.1);max-width:340px;text-align:center">' +
        '<div style="font-size:13px;font-weight:700;color:#F9A825;text-transform:uppercase;letter-spacing:.08em;margin-bottom:20px">Data Decay</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;text-align:left">' +
          '<div style="display:flex;align-items:center;gap:10px"><div style="flex:1;height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden"><div style="width:35%;height:100%;background:#F47C2C;border-radius:4px"></div></div><span style="font-size:11px;color:#8C8479;width:80px">Job titles: 35%</span></div>' +
          '<div style="display:flex;align-items:center;gap:10px"><div style="flex:1;height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden"><div style="width:22%;height:100%;background:#F47C2C;border-radius:4px"></div></div><span style="font-size:11px;color:#8C8479;width:80px">Interests: 22%</span></div>' +
          '<div style="display:flex;align-items:center;gap:10px"><div style="flex:1;height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden"><div style="width:48%;height:100%;background:#FBC02D;border-radius:4px"></div></div><span style="font-size:11px;color:#8C8479;width:80px">Emails: 48%</span></div>' +
          '<div style="display:flex;align-items:center;gap:10px"><div style="flex:1;height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden"><div style="width:12%;height:100%;background:#F47C2C;border-radius:4px"></div></div><span style="font-size:11px;color:#8C8479;width:80px">Goals: 12%</span></div>' +
        '</div>' +
        '<div style="font-size:12px;color:#8C8479;margin-top:16px;font-style:italic">Percent of profiles with accurate, current data</div>' +
      '</div>',
      centerpieceHTML: '<div style="text-align:center;margin-bottom:56px">' +
        '<p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">How It Works</p>' +
        '<h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Every conversation makes your database better.</h2>' +
      '</div>' +
      '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:40px;max-width:800px;margin:0 auto 56px;text-align:center">' +
        '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:24px">AMS Write-Back Flow</h3>' +
        '<div style="display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap">' +
          '<div style="background:#fff;border-radius:12px;padding:20px;border:2px solid #FBC02D;min-width:140px"><div style="font-size:14px;font-weight:700;color:#2F2F2F">Member</div><div style="font-size:12px;color:#6E6E6E;margin-top:4px">Responds to check-in</div></div>' +
          '<div style="font-size:24px;color:#F47C2C;font-weight:700">\u2192</div>' +
          '<div style="background:#fff;border-radius:12px;padding:20px;border:2px solid #F47C2C;min-width:140px"><div style="font-size:14px;font-weight:700;color:#2F2F2F">PropFuel</div><div style="font-size:12px;color:#6E6E6E;margin-top:4px">Captures + categorizes</div></div>' +
          '<div style="font-size:24px;color:#F47C2C;font-weight:700">\u2192</div>' +
          '<div style="background:#fff;border-radius:12px;padding:20px;border:2px solid #2F2F2F;min-width:140px"><div style="font-size:14px;font-weight:700;color:#2F2F2F">Your AMS</div><div style="font-size:12px;color:#6E6E6E;margin-top:4px">Profile updated in real time</div></div>' +
        '</div>' +
        '<p style="font-size:14px;color:#6E6E6E;margin-top:20px">No CSV exports. No manual entry. No batch processing. Real-time write-back.</p>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px">' +
          '<h3 style="font-size:22px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Profile Building</h3>' +
          '<p style="font-size:15px;color:#6E6E6E;line-height:1.6;margin-bottom:20px">Weave data capture questions into your existing campaigns. Members answer a question about their goals, and their profile gets richer. No separate data-collection campaign needed.</p>' +
          '<div style="display:flex;flex-direction:column;gap:10px">' +
            '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F">\u201CWhat is your current job title?\u201D</div>' +
            '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F">\u201CWhich topics matter most to you this year?\u201D</div>' +
            '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F">\u201CAre you still based in [city]?\u201D</div>' +
          '</div>' +
        '</div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px 32px">' +
          '<h3 style="font-size:22px;font-weight:700;color:#2F2F2F;margin-bottom:12px">NPS and Satisfaction</h3>' +
          '<p style="font-size:15px;color:#6E6E6E;line-height:1.6;margin-bottom:20px">Run ongoing satisfaction measurement that feeds directly into member profiles. NPS scores, satisfaction ratings, and open-ended feedback \u2014 all captured and acted on automatically.</p>' +
          '<div style="display:flex;flex-direction:column;gap:10px">' +
            '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F">\u201COn a scale of 0-10, how likely are you to recommend us?\u201D</div>' +
            '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F">Promoters \u2192 testimonial request</div>' +
            '<div style="background:#EBE6DA;border-radius:10px;padding:12px 16px;font-size:14px;color:#2F2F2F">Detractors \u2192 staff alert</div>' +
          '</div>' +
        '</div>' +
      '</div>',
      enginesH2: 'Four engines working together to keep your data clean.',
      engines: [
        { name: 'Engagement Engine', desc: 'Delivers data capture questions within existing campaigns \u2014 so profile updates happen naturally, not through forms.' },
        { name: 'Automation Engine', desc: 'Schedules data refresh cycles, triggers profile update requests, and manages the write-back to your AMS automatically.' },
        { name: 'Insights Engine', desc: 'Shows data completeness scores, identifies gaps, and measures how fast your database is improving over time.' },
        { name: 'Membership AI', desc: 'Analyzes open-ended responses, categorizes free-text answers, and identifies patterns across thousands of member interactions.' }
      ],
      statsH2: 'Proof that conversations clean your data.',
      stats: [
        { num: '44%', org: 'NACUBO', desc: 'Response rate in 24 hours on a data capture campaign \u2014 no forms, no surveys.' },
        { num: '4,500+', org: 'INS', desc: 'Member profile fields updated through PropFuel conversations, all synced automatically.' },
        { num: '400+', org: 'Chattanooga', desc: 'Member profiles enriched in a single campaign cycle through targeted questions.' },
        { num: '60+', org: 'Connectors', desc: 'AMS integrations that support real-time write-back of every PropFuel response.' }
      ],
      faqH2: 'Common questions about data intelligence.',
      faqs: [
        { q: 'Do we need to run separate data capture campaigns?', a: 'No. PropFuel weaves data capture questions into your existing engagement campaigns. A renewal check-in can include a profile update question. An onboarding sequence can confirm job title and interests. Data gets collected as a byproduct of the conversation.' },
        { q: 'How does the write-back work?', a: 'When a member responds to a PropFuel check-in, the response writes back to your AMS in real time. The specific field mapping is configured during setup \u2014 you control exactly which fields get updated and in which direction.' },
        { q: 'What about open-ended responses?', a: 'PropFuel\u2019s AI automatically categorizes open-ended text responses into themes and sentiment. Your team does not need to read every response individually \u2014 the system surfaces patterns and flags outliers.' },
        { q: 'How do we measure data quality improvement?', a: 'The Insights Engine tracks data completeness scores over time \u2014 showing which fields are improving, which segments have gaps, and how fast your database is getting better.' },
        { q: 'Will this work with our AMS?', a: 'PropFuel integrates with 60+ external systems with two-way sync. The write-back works with Salesforce, Fonteva, iMIS, Impexium, Nimble, Novi, and many more. Setup takes 5\u201330 minutes.' }
      ],
      ctaH2: 'Clean data without<br>the cleanup.',
      ctaSub: 'Every PropFuel interaction makes your database a little more accurate. Members answer a question. Their profile gets better. Your next message gets more relevant. That is the cycle that makes membership meaningful.'
    });
  }

  // ─────────────────────────────────────────
  // RESOURCES PAGES
  // ─────────────────────────────────────────

  // Wire CMS blog card hrefs ('#') to real blog post URLs (/blog-posts/{slug})
  // The colleague added a Collection List but forgot to bind the link URL.
  function wireBlogCardHrefs() {
    if (!/^\/resources\/blog\/?$/.test(window.location.pathname)) return;
    applyDefaultBlogThumb();
    var cards = document.querySelectorAll('a.blog-card');
    if (!cards.length) return;
    var needsFixing = Array.prototype.some.call(cards, function(a){
      return !a.href || /\/resources\/blog\/?#?$/.test(a.href) || a.getAttribute('href') === '#';
    });
    if (!needsFixing) return;
    fetch('https://alexhively.github.io/propfuel-webflow-custom/js/blog-slugs.json?v=1')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        if (!data || !Array.isArray(data.posts)) return;
        var prefix = data.urlPrefix || '/blog-posts/';
        // Build a case- and punctuation-insensitive lookup
        function normTitle(s) {
          return String(s || '')
            .toLowerCase()
            .replace(/[‘’“”'"`]/g, '')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        var bySlug = {};
        data.posts.forEach(function(p){ bySlug[normTitle(p.name)] = p.slug; });
        var fixed = 0, missed = [];
        cards.forEach(function(card){
          var titleEl = card.querySelector('.blog-card-title, h3, h4');
          var title = titleEl ? titleEl.textContent : '';
          var key = normTitle(title);
          var slug = bySlug[key];
          if (slug) {
            card.setAttribute('href', prefix + slug);
            fixed++;
          } else if (title) {
            missed.push(title);
          }
        });
        if (missed.length && window.console) {
          console.log('[pf] blog hrefs: fixed', fixed, 'of', cards.length, '; no slug match for:', missed);
        }
      })
      .catch(function(){});
  }

  // Fallback thumbnail for blog posts without a CMS-set image.
  // Applies to both listing cards (.blog-card-thumb-img) and detail hero (.blog-hero-image).
  function applyDefaultBlogThumb() {
    var DEFAULT = 'https://alexhively.github.io/propfuel-webflow-custom/images/blog-default-thumb.png';
    function isBad(img) {
      if (!img) return false;
      // Webflow marks unbound CMS images with this class and sets display:none
      if (img.classList && img.classList.contains('w-dyn-bind-empty')) return true;
      var src = img.getAttribute('src');
      if (!src) return true;
      var s = String(src).trim();
      if (!s || s === 'about:blank') return true;
      // Webflow default placeholder SVG
      if (/\/plugins\/Basic\/assets\/placeholder/.test(s)) return true;
      if (/placeholder\.(svg|png)$/i.test(s)) return true;
      if (/\/_default(\.|_)/.test(s)) return true;
      return false;
    }
    function swap(img) {
      if (!img || img.tagName !== 'IMG') return;
      img.src = DEFAULT;
      img.removeAttribute('srcset');
      img.classList.remove('w-dyn-bind-empty');
      // Webflow hides placeholders; unhide so the default shows
      if (img.style.display === 'none') img.style.display = '';
      img.style.removeProperty('display');
    }
    var targets = document.querySelectorAll('.blog-card-thumb-img, .blog-hero-image, img.blog-card-thumb-img, .blog-hero-image-section img');
    targets.forEach(function(img){
      if (!img || img.tagName !== 'IMG') return;
      if (isBad(img)) {
        swap(img);
      } else {
        img.addEventListener('error', function onErr(){
          img.removeEventListener('error', onErr);
          swap(img);
        });
      }
    });
    // Also watch for DOM insertions (Webflow CMS can render late)
    if (!window.__pfBlogThumbObserver) {
      var obs = new MutationObserver(function(mutations){
        var newImgs = [];
        mutations.forEach(function(m){
          m.addedNodes && m.addedNodes.forEach(function(n){
            if (n.nodeType !== 1) return;
            if (n.matches && n.matches('img.blog-card-thumb-img, img.blog-hero-image, .blog-hero-image-section img')) newImgs.push(n);
            if (n.querySelectorAll) Array.prototype.push.apply(newImgs, n.querySelectorAll('img.blog-card-thumb-img, img.blog-hero-image, .blog-hero-image-section img'));
          });
        });
        newImgs.forEach(function(img){
          if (isBad(img)) swap(img);
        });
      });
      obs.observe(document.body, { childList: true, subtree: true });
      window.__pfBlogThumbObserver = obs;
    }
  }

  // Blog post detail template (/blog-posts/*) — colleague's Webflow template has
  // unbound placeholders: breadcrumb says "Article Title", category-badge is empty.
  function fixBlogPostTemplate() {
    if (!/^\/blog-posts\//.test(window.location.pathname)) return;
    applyDefaultBlogThumb();
    // Breadcrumb: replace literal "Article Title" with the real post title
    var crumbPieces = document.querySelectorAll('.blog-breadcrumb div, .blog-breadcrumb span');
    var realTitle = (document.querySelector('.blog-article-title, h1') || {}).textContent;
    crumbPieces.forEach(function(el){
      var t = (el.textContent || '').trim();
      if (t === 'Article Title' && realTitle) el.textContent = realTitle;
    });
    // Category badge: hide if empty (avoids the orphan orange pill)
    document.querySelectorAll('.blog-category-badge').forEach(function(el){
      var txt = (el.textContent || '').trim();
      if (!txt) el.style.display = 'none';
    });
    // Update nav CTA button text on template (button class differs from main site)
    document.querySelectorAll('.pf-btn-nav, .w-button').forEach(function(btn){
      var t = (btn.textContent || '').trim();
      if (t === 'Get a Demo') btn.textContent = 'Get Started';
    });
    // Nav overlaps top of blog content — push the article wrap down past the floating nav (nav = 96px tall)
    var articleWrap = document.querySelector('.blog-article-wrap');
    if (articleWrap) {
      articleWrap.style.paddingTop = '120px';
    }
    // Blog template wraps nav in a 1200px .w-container — the 960px .pf-nav-inner inside is
    // left-aligned by default, making the pill look offset from page center. Force centered.
    var blogNavInner = document.querySelector('.pf-nav-bar .pf-nav-inner');
    if (blogNavInner) {
      blogNavInner.style.marginLeft = 'auto';
      blogNavInner.style.marginRight = 'auto';
    }
    // CTA heading in blog template hyphenates badly ("non-dues" / "data-driven" break at hyphens).
    // Replace with punchier copy that has no mid-word hyphens, stacked across 3 lines.
    var ctaH = document.querySelector('.pf-cta-section .pf-cta-heading, .pf-cta-section h2');
    if (ctaH) {
      ctaH.innerHTML = 'Turn member<br>conversations<br>into <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">real revenue.</span>';
      ctaH.style.maxWidth = '560px';
      ctaH.style.marginBottom = '40px';
    }
    var ctaSub = document.querySelector('.pf-cta-section .pf-cta-sub, .pf-cta-section p');
    if (ctaSub && /non-dues|data-driven/i.test(ctaSub.textContent)) {
      ctaSub.textContent = 'See how associations like yours are using PropFuel to engage members and grow revenue year-round.';
    }
    if (ctaSub) {
      ctaSub.style.marginBottom = '48px';
    }
    // Add breathing room above buttons
    var ctaButtons = document.querySelector('.pf-cta-section .pf-btn-group, .pf-cta-section .btn-group, .pf-cta-section [class*="button"]');
    if (ctaButtons && ctaButtons.parentElement) {
      // Find the flex container wrapping both buttons
      var btnRow = document.querySelector('.pf-cta-section .pf-cta-buttons, .pf-cta-section .pf-btn-row');
      if (btnRow) btnRow.style.marginTop = '16px';
    }
  }

  function fixBlog() {
    // Only run on the blog listing page, not individual blog post templates
    if (!/^\/resources\/blog\/?$/.test(window.location.pathname)) return;
    // Hide the "Expert perspectives / Practical guides" category-card section (empty placeholder)
    Array.from(document.querySelectorAll('h2.pf-feature-title, .pf-feature-title')).forEach(function(h) {
      var t = (h.textContent || '').trim();
      if (t === 'Expert perspectives' || t === 'Practical guides') {
        var sec = h.closest('.pf-section, section');
        if (sec) sec.style.display = 'none';
      }
    });
    // If Webflow CMS has rendered real blog items, defer to the CMS template but still fix their hrefs
    if (document.querySelector('.w-dyn-item')) { wireBlogCardHrefs(); return; }
    var main = getPageMain();

    var blogArticles = [
      { cat: 'Engagement', title: 'How One Association Increased Renewals by 34%', excerpt: 'Learn how a mid-size professional association used PropFuel to transform their renewal process from transactional reminders into meaningful conversations.', author: 'Sarah Mitchell', date: 'Mar 15, 2026' },
      { cat: 'Strategy', title: 'The Death of the Annual Survey', excerpt: 'Why leading associations are replacing yearly surveys with continuous micro-conversations that deliver real-time insights.', author: 'Jake Thompson', date: 'Mar 8, 2026' },
      { cat: 'Product', title: 'Introducing Membership AI: Your Always-On Engagement Partner', excerpt: 'Meet the AI that knows your members, builds campaigns, and surfaces insights \u2014 without adding headcount.', author: 'PropFuel Team', date: 'Feb 28, 2026' },
      { cat: 'Data', title: '5 Metrics That Actually Predict Member Retention', excerpt: 'Forget open rates. These are the engagement signals that tell you who is about to leave \u2014 and who is ready to upgrade.', author: 'Emily Nguyen', date: 'Feb 20, 2026' },
      { cat: 'Best Practices', title: 'Your Onboarding Emails Are Failing. Here\'s Why.', excerpt: 'Most associations lose new members in the first 90 days. The fix is simpler than you think: ask them what they need.', author: 'Sarah Mitchell', date: 'Feb 12, 2026' },
      { cat: 'Case Study', title: 'How AMA Captured 7,400+ Contacts From Their Website', excerpt: 'The Academy of Model Aeronautics turned anonymous website visitors into known, engaged contacts using PropFuel\'s website widget.', author: 'Jake Thompson', date: 'Feb 5, 2026' }
    ];

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Blog</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">The PropFuel Blog</h1>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6;max-width:600px;margin:0 auto">Insights on member engagement, association strategy, and the future of membership.</p>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:900px;margin:0 auto">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:48px;text-align:left">' +
          '<p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#F9A825;margin-bottom:12px">Featured</p>' +
          '<h2 style="font-size:clamp(24px,3vw,32px);font-weight:800;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.2;margin-bottom:16px">Why Associations That Listen Grow Faster</h2>' +
          '<p style="font-size:16px;color:#6E6E6E;line-height:1.6;margin-bottom:24px">The data is clear: organizations that build feedback loops into every member touchpoint see higher retention, stronger revenue, and deeper loyalty. Here\'s what the best are doing differently.</p>' +
          '<div style="display:flex;align-items:center;gap:12px"><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff">SM</div><div><span style="font-size:14px;font-weight:600;color:#2F2F2F">Sarah Mitchell</span><span style="font-size:13px;color:#8C8479;margin-left:8px">Mar 22, 2026</span></div></div>' +
        '</div>' +
      '</div></section>' +

      '<section style="padding:0 48px 64px"><div style="max-width:1100px;margin:0 auto"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">';

    blogArticles.forEach(function(a) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px;text-align:left;display:flex;flex-direction:column">' +
        '<span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#F9A825;margin-bottom:12px">' + a.cat + '</span>' +
        '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;line-height:1.3;margin-bottom:12px">' + a.title + '</h3>' +
        '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;margin-bottom:20px;flex:1">' + a.excerpt + '</p>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-top:auto"><span style="font-size:13px;font-weight:600;color:#2F2F2F">' + a.author + '</span><span style="font-size:12px;color:#8C8479">' + a.date + '</span></div>' +
      '</div>';
    });

    html += '</div></div></section>' +
      '<section style="padding:64px 48px;background:#F6F2E8"><div style="max-width:600px;margin:0 auto;text-align:center">' +
        '<h2 style="font-size:clamp(24px,3vw,32px);font-weight:800;color:#2F2F2F;letter-spacing:-0.02em;margin-bottom:12px">Stay in the Loop</h2>' +
        '<p style="font-size:16px;color:#6E6E6E;line-height:1.6;margin-bottom:32px">Get the latest insights on member engagement delivered to your inbox.</p>' +
        '<div style="display:flex;gap:12px;max-width:480px;margin:0 auto"><input type="email" placeholder="Your email address" class="pf-form-input" style="flex:1;border-radius:100px;padding:14px 24px"><button class="pf-form-submit" style="width:auto;padding:14px 32px;margin-top:0">Subscribe</button></div>' +
      '</div></section>';

    main.innerHTML = html;
  }

  // Wire webinar cards on /resources/webinars to their real /videos/{slug} detail pages.
  // Colleague's Webflow template binds every card's href to a static "/videos" instead of the
  // current item's slug — so we fetch a name→slug snapshot and rewrite.
  function wireWebinarCardHrefs() {
    if (!/^\/resources\/webinars\/?$/.test(window.location.pathname)) return;
    var cards = document.querySelectorAll('.w-dyn-item');
    if (!cards.length) return;
    // Anchor candidates — card could be an <a> itself or contain one
    var anchors = [];
    cards.forEach(function(card){
      var a = card.matches && card.matches('a') ? card : card.querySelector('a');
      if (a) anchors.push(a);
    });
    if (!anchors.length) return;
    var needsFixing = anchors.some(function(a){
      var h = a.getAttribute('href') || '';
      return !h || h === '#' || /^\/videos\/?$/.test(h);
    });
    if (!needsFixing) return;
    fetch('https://alexhively.github.io/propfuel-webflow-custom/js/webinar-slugs.json?v=1')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        if (!data || !Array.isArray(data.items)) return;
        var prefix = data.urlPrefix || '/videos/';
        function normTitle(s) {
          return String(s || '')
            .toLowerCase()
            .replace(/[‘’“”'"`]/g, '')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        var bySlug = {};
        data.items.forEach(function(p){ bySlug[normTitle(p.name)] = p.slug; });
        var fixed = 0, missed = [];
        cards.forEach(function(card){
          var a = card.matches && card.matches('a') ? card : card.querySelector('a');
          if (!a) return;
          var titleEl = card.querySelector('.webinar-card-title, h3, h4, h2, [class*="title"]');
          var title = titleEl ? titleEl.textContent : '';
          var key = normTitle(title);
          var slug = bySlug[key];
          if (slug) {
            a.setAttribute('href', prefix + slug);
            fixed++;
          } else if (title) {
            missed.push(title);
          }
        });
        if (missed.length && window.console) {
          console.log('[pf] webinar hrefs: fixed', fixed, 'of', anchors.length, '; no slug match for:', missed);
        }
      })
      .catch(function(){});
  }

  // Webinar / video detail template (/videos/*). Webflow template renders static placeholders
  // for optional fields (slides PDF, related videos) that fall back to href="#" when CMS
  // fields are empty — creating orphan buttons and an empty "related videos" dark card.
  function fixVideoTemplate() {
    if (!/^\/videos\/[^/]+/.test(window.location.pathname)) return;
    // 1) Hide Download Slides button when there's no slides file attached (href="#" or empty)
    var dlBtns = document.querySelectorAll('a.pf-btn-secondary, a.pf-btn-primary, a.w-button');
    dlBtns.forEach(function(a){
      if (!/Download Slides/i.test((a.textContent || '').trim())) return;
      var href = a.getAttribute('href');
      if (!href || href === '#' || href === '' || href === 'javascript:void(0)') {
        a.style.display = 'none';
      }
    });
    // 2) Hide the related-videos dark card when CMS didn't populate it (empty titles + "#" links)
    document.querySelectorAll('.blog-sidebar-dark-card.is-below-content').forEach(function(card){
      var cards = card.querySelectorAll('.video-related-card');
      if (!cards.length) { card.style.display = 'none'; return; }
      var anyPopulated = false;
      cards.forEach(function(rc){
        var title = rc.querySelector('.video-related-card-title');
        var link = rc.querySelector('.video-related-card-link, a');
        var hasTitle = title && title.textContent.trim().length > 0;
        var href = link && link.getAttribute('href');
        var hasLink = href && href !== '#' && href !== '';
        if (hasTitle || hasLink) anyPopulated = true;
      });
      if (!anyPopulated) card.style.display = 'none';
    });
    // 3) Nav pill is left-aligned inside the template's 1200px .w-container — center it
    var navInner = document.querySelector('.pf-nav-bar .pf-nav-inner');
    if (navInner) {
      navInner.style.marginLeft = 'auto';
      navInner.style.marginRight = 'auto';
    }
    // 3.5) Hide the orphan "Videos" breadcrumb at the very top of the page (vestigial wrapper
    //      from a different template variant — the real breadcrumb lives inside .webinar-hero-wrap)
    document.querySelectorAll('.cs-breadcrumb-wrap').forEach(function(el){
      el.style.display = 'none';
    });
    // 4) CMS templates ship a stripped-down footer — swap in the full main-site footer.
    swapStrippedFooter();
  }

  // Shared: CMS template pages (videos, case-studies, team-members) render a minimal
  // footer with only a few links. This replaces the inner content with the full
  // main-site footer, or — if the full footer already exists — just ensures the
  // "PropFuel" wordmark is white.
  function swapStrippedFooter() {
    var footer = document.querySelector('.pf-footer');
    // Some templates (team-members) ship the footer as an anonymous dark <section>
    // with inline styles instead of .pf-footer. Detect by known tagline text and
    // tag it so the site-wide .pf-footer CSS applies to the injected content.
    if (!footer) {
      var sections = document.querySelectorAll('section');
      for (var i = sections.length - 1; i >= 0; i--) {
        var s = sections[i];
        if (/Member engagement,\s*powered by data/i.test(s.textContent || '')) {
          footer = s;
          footer.classList.add('pf-footer');
          footer.removeAttribute('style');
          break;
        }
      }
    }
    if (!footer) return;
    if (!footer.querySelector('.pf-footer-inner')) {
      footer.innerHTML =
        '<div class="pf-footer-inner">' +
          '<div class="pf-footer-top">' +
            '<div class="pf-footer-brand">' +
              '<img src="https://cdn.prod.website-files.com/69ca88e6c52b04fb85f74a02/69cc30a4a0dc86d4b55ee8a1_logo.png" alt="PropFuel" style="height:48px;width:auto;display:block;margin-bottom:16px">' +
              '<h4 class="pf-nav-logo-text" style="color:#EDE8DF">PropFuel</h4>' +
              '<p>The membership insights and engagement platform that helps associations understand what members want and act on it.</p>' +
            '</div>' +
            '<div>' +
              '<h4 class="pf-footer-col-title">Product</h4>' +
              '<a href="/platform/insights" class="pf-footer-link">The Insights Engine</a>' +
              '<a href="/platform/automation" class="pf-footer-link">The Automation Engine</a>' +
              '<a href="/platform/website" class="pf-footer-link">The Engagement Engine</a>' +
              '<a href="/membership-ai" class="pf-footer-link">Membership AI</a>' +
              '<a href="/integrations" class="pf-footer-link">Integrations</a>' +
            '</div>' +
            '<div>' +
              '<h4 class="pf-footer-col-title">Resources</h4>' +
              '<a href="/client-success/case-studies" class="pf-footer-link">Case Studies</a>' +
              '<a href="/resources/blog" class="pf-footer-link">Blog</a>' +
              '<a href="/roi" class="pf-footer-link">ROI</a>' +
              '<a href="https://help.propfuel.com/" class="pf-footer-link" target="_blank" rel="noopener noreferrer">Help Center</a>' +
            '</div>' +
            '<div>' +
              '<h4 class="pf-footer-col-title">Company</h4>' +
              '<a href="/company/about" class="pf-footer-link">About</a>' +
              '<a href="/company/careers" class="pf-footer-link">Careers</a>' +
              '<a href="/company/contact" class="pf-footer-link">Contact</a>' +
              '<a href="/company/partners" class="pf-footer-link">Partners</a>' +
            '</div>' +
          '</div>' +
          '<div class="pf-footer-bottom">' +
            '<p class="pf-footer-copy">© 2026 PropFuel. All rights reserved.</p>' +
            '<div class="pf-footer-legal">' +
              '<a href="/legal/privacy" class="pf-footer-link">Privacy</a>' +
              '<a href="/legal/terms" class="pf-footer-link">Terms</a>' +
            '</div>' +
          '</div>' +
        '</div>';
    } else {
      var logoText = footer.querySelector('.pf-nav-logo-text');
      if (logoText) logoText.style.color = '#EDE8DF';
    }
  }

  function fixTeamMemberTemplate() {
    if (!/^\/team-members\/[^/]+/.test(window.location.pathname)) return;
    // Nav centering (same pattern as blog/video/case-study templates)
    var navInner = document.querySelector('.pf-nav-bar .pf-nav-inner');
    if (navInner) {
      navInner.style.maxWidth = '960px';
      navInner.style.marginLeft = 'auto';
      navInner.style.marginRight = 'auto';
    }
    // Hide the vestigial "Home › About Us › {name}" breadcrumb section that
    // sits right after the nav — the H1 already tells users where they are,
    // and the breadcrumb visually overlaps the centered nav pill.
    var nav = document.querySelector('.pf-nav-bar');
    if (nav) {
      var sib = nav.nextElementSibling;
      while (sib) {
        if (sib.tagName === 'SECTION' && /Home\s*›\s*About/i.test(sib.textContent || '')) {
          sib.style.display = 'none';
          break;
        }
        sib = sib.nextElementSibling;
      }
      // The nav pill is centered but without background, so the content below
      // rides right up under it. Push the first content section down so the
      // pill gets breathing room.
      var firstContent = nav.nextElementSibling;
      while (firstContent && (firstContent.style.display === 'none' || firstContent.offsetHeight === 0)) {
        firstContent = firstContent.nextElementSibling;
      }
      if (firstContent) {
        firstContent.style.paddingTop = '120px';
      }
    }
    // Swap the stripped-down footer for the full main-site footer
    swapStrippedFooter();
  }

  function wireTeamCardHrefs() {
    // Only needed if Webflow's native CMS rendering is active (.w-dyn-item present).
    // Our team.json hydration already generates anchored cards via buildTeamCard.
    if (window.location.pathname.indexOf('/company/about') === -1) return;
    var cards = document.querySelectorAll('.pf-team-grid-slot .w-dyn-item');
    if (!cards.length) return;
    fetch('https://alexhively.github.io/propfuel-webflow-custom/js/team.json?v=2')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        if (!data || !Array.isArray(data.members)) return;
        var prefix = data.urlPrefix || '/team-members/';
        function normName(s){ return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
        var bySlug = {};
        data.members.forEach(function(m){ if (m.name && m.slug) bySlug[normName(m.name)] = m.slug; });
        cards.forEach(function(card){
          var a = card.matches && card.matches('a') ? card : card.querySelector('a');
          if (!a) return;
          var h = a.getAttribute('href') || '';
          if (h && h !== '#' && !/\/company\/about\/?$/.test(h)) return;
          var nameEl = card.querySelector('h1, h2, h3, h4, h5, [class*="name"], [class*="title"]');
          var name = nameEl ? nameEl.textContent : '';
          var slug = bySlug[normName(name)];
          if (slug) a.setAttribute('href', prefix + slug);
        });
      })
      .catch(function(){});
  }

  function fixCaseStudyTemplate() {
    if (!/^\/case-studies\/[^/]+/.test(window.location.pathname)) return;
    // The case study template binds the industry field twice, producing:
    //   <div class="cs-industry-badge"><div>X</div><div>X</div></div>
    // Keep the first child and remove the rest.
    document.querySelectorAll('.cs-industry-badge').forEach(function(badge){
      var kids = badge.children;
      while (kids.length > 1) badge.removeChild(kids[kids.length - 1]);
    });
    // Nav pill stretches full-bleed because the template puts .pf-nav-inner inside a
    // wide .w-container wrapper. Force the pill to its normal 960px and center it.
    var navInner = document.querySelector('.pf-nav-bar .pf-nav-inner');
    if (navInner) {
      navInner.style.maxWidth = '960px';
      navInner.style.marginLeft = 'auto';
      navInner.style.marginRight = 'auto';
    }
    // Swap in the full main-site footer (template ships stripped-down version)
    swapStrippedFooter();
  }

  function fixWebinars() {
    // Only run on the webinars listing page, not individual webinar templates
    if (!/^\/resources\/webinars\/?$/.test(window.location.pathname)) return;
    // Hide the empty "Strategy sessions / Product deep-dives" category-card section
    // (colleague\'s Webflow template has it but no content is configured in it)
    Array.from(document.querySelectorAll('h2.pf-feature-title, .pf-feature-title')).forEach(function(h) {
      if (h.textContent.trim() === 'Strategy sessions') {
        var sec = h.closest('.pf-section, section');
        if (sec) sec.style.display = 'none';
      }
    });
    // If Webflow CMS has rendered real webinar items, defer to the CMS template but wire up hrefs
    if (document.querySelector('.w-dyn-item')) { wireWebinarCardHrefs(); return; }
    var main = getPageMain();

    var upcoming = [
      { title: 'The Future of Member Engagement in 2026', date: 'April 15, 2026 \u2014 1:00 PM ET', desc: 'Join our panel of association leaders as they share what\u2019s working now and what\u2019s next in member engagement strategy.' },
      { title: 'From Data to Action: Using Insights to Drive Renewals', date: 'May 6, 2026 \u2014 2:00 PM ET', desc: 'Learn how to turn member response data into targeted renewal campaigns that actually convert.' }
    ];
    var onDemand = [
      { title: 'Onboarding That Sticks: The First 90 Days', desc: 'How to build an onboarding sequence that keeps new members engaged beyond the welcome email.' },
      { title: 'SMS for Associations: Getting Started', desc: 'Everything you need to know about adding SMS to your member engagement toolkit.' },
      { title: 'Building a Listening Culture at Your Association', desc: 'Why the most successful associations treat every touchpoint as a chance to learn.' },
      { title: 'Website Engagement: Beyond the Homepage', desc: 'Turn your website into a two-way conversation with visitors and members alike.' },
      { title: 'The ROI of Member Feedback', desc: 'How to measure and communicate the business impact of continuous member engagement.' },
      { title: 'Winning Back Lapsed Members', desc: 'Proven strategies for re-engaging members who didn\u2019t renew.' }
    ];

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Resources</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">Webinars &amp; Events</h1>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6;max-width:600px;margin:0 auto">Live and on-demand sessions to help you get more from PropFuel and your member engagement strategy.</p>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:1000px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px">Upcoming</h2>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">';

    upcoming.forEach(function(w) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px;text-align:left">' +
        '<p style="font-size:13px;font-weight:600;color:#F47C2C;margin-bottom:12px">' + w.date + '</p>' +
        '<h3 style="font-size:20px;font-weight:700;color:#2F2F2F;line-height:1.3;margin-bottom:12px">' + w.title + '</h3>' +
        '<p style="font-size:15px;color:#6E6E6E;line-height:1.6;margin-bottom:24px">' + w.desc + '</p>' +
        '<span aria-disabled="true" role="button" style="display:inline-flex;align-items:center;gap:8px;padding:14px 32px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;background:rgba(120,110,95,0.08);color:#8C8479;border:1.5px dashed rgba(120,110,95,0.3);cursor:default">Registration opening soon</span>' +
      '</div>';
    });

    html += '</div></div></section>' +
      '<section style="padding:0 48px 64px"><div style="max-width:1000px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px">On-Demand Library</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">';

    onDemand.forEach(function(w) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px;text-align:left">' +
        '<h3 style="font-size:17px;font-weight:700;color:#2F2F2F;line-height:1.3;margin-bottom:10px">' + w.title + '</h3>' +
        '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;margin-bottom:20px">' + w.desc + '</p>' +
        '<a href="#" style="font-size:14px;font-weight:600;color:#F47C2C;text-decoration:none">Watch Now \u2192</a>' +
      '</div>';
    });

    html += '</div></div></section>' +
      '<section style="padding:64px 48px;background:#F6F2E8"><div style="max-width:600px;margin:0 auto;text-align:center">' +
        '<h2 style="font-size:clamp(24px,3vw,32px);font-weight:800;color:#2F2F2F;letter-spacing:-0.02em;margin-bottom:12px">Never Miss a Session</h2>' +
        '<p style="font-size:16px;color:#6E6E6E;line-height:1.6;margin-bottom:32px">Subscribe to get notified about upcoming webinars and events.</p>' +
        '<div style="display:flex;gap:12px;max-width:480px;margin:0 auto"><input type="email" placeholder="Your email address" class="pf-form-input" style="flex:1;border-radius:100px;padding:14px 24px"><button class="pf-form-submit" style="width:auto;padding:14px 32px;margin-top:0">Subscribe</button></div>' +
      '</div></section>';

    main.innerHTML = html;
  }

  function fixGuides() {
    // Only run on the guides listing page, not individual guide templates
    if (!/^\/resources\/guides\/?$/.test(window.location.pathname)) return;
    // If Webflow CMS has rendered real guide items, defer to the CMS template
    if (document.querySelector('.w-dyn-item')) return;
    var main = getPageMain();
    var esc = function(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};

    // Skeleton render (hero + CTA) \u2014 featured + grid populate async from js/guides.json
    main.innerHTML = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Resources</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">Guides &amp; Resources</h1>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6;max-width:600px;margin:0 auto">Practical playbooks, templates, and tools to level up your member engagement strategy.</p>' +
      '</div></section>' +
      '<section class="gd-featured-wrap" style="padding:64px 48px"><div style="max-width:900px;margin:0 auto" class="gd-featured-slot"></div></section>' +
      '<section style="padding:0 48px 64px"><div style="max-width:1100px;margin:0 auto"><div class="gd-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"></div></div></section>' +
      '<section class="pf-cta-section" style="padding:96px 48px;text-align:center"><div style="max-width:600px;margin:0 auto">' +
        '<h2 class="pf-cta-heading" style="font-size:clamp(28px,4vw,42px);font-weight:800;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Want More Like This?</h2>' +
        '<p style="font-size:17px;color:#8C8479;line-height:1.6;margin-bottom:32px">Subscribe to get new guides, templates, and resources delivered straight to your inbox.</p>' +
        '<a href="/resources/newsletter" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none">Subscribe Now</a>' +
      '</div></section>';

    fetch('https://alexhively.github.io/propfuel-webflow-custom/js/guides.json?v=1')
      .then(function(r){return r.json();})
      .then(function(guides){
        if (!Array.isArray(guides) || !guides.length) return;
        var featured = guides.find(function(g){return g.featured;}) || guides[0];
        var rest = guides.filter(function(g){return g !== featured;});
        var fSlot = document.querySelector('.gd-featured-slot');
        if (fSlot) {
          fSlot.innerHTML =
            '<a href="' + esc(featured.url) + '" target="_blank" rel="noopener noreferrer" class="pf-card" style="display:block;background:linear-gradient(135deg,#F47C2C,#F9A825,#FBC02D);border-radius:20px;padding:48px;text-align:left;color:#fff;text-decoration:none;box-shadow:0 10px 40px rgba(244,124,44,0.18);transition:transform .2s ease,box-shadow .2s ease" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 14px 48px rgba(244,124,44,0.28)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 10px 40px rgba(244,124,44,0.18)\'">' +
              '<p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px;opacity:.85">Featured ' + esc(featured.type || 'Guide') + '</p>' +
              '<h2 style="font-size:clamp(24px,3vw,32px);font-weight:800;letter-spacing:-0.02em;line-height:1.2;margin-bottom:16px;color:#fff">' + esc(featured.name) + '</h2>' +
              '<p style="font-size:16px;line-height:1.6;margin-bottom:24px;opacity:.92;color:#fff">' + esc(featured.summary) + '</p>' +
              '<span style="display:inline-flex;align-items:center;gap:8px;padding:14px 32px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;background:rgba(255,255,255,0.95);color:#F47C2C;border:none">Download Now \u2192</span>' +
            '</a>';
        }
        var grid = document.querySelector('.gd-grid');
        if (grid) {
          var h = '';
          rest.forEach(function(g){
            h += '<a href="' + esc(g.url) + '" target="_blank" rel="noopener noreferrer" class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px;text-align:left;display:flex;flex-direction:column;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease;border:1px solid rgba(140,132,121,0.08)" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 10px 28px rgba(47,47,47,0.08)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'none\'">' +
              '<span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#F9A825;margin-bottom:12px">' + esc(g.type || 'Guide') + '</span>' +
              '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;line-height:1.3;margin-bottom:10px">' + esc(g.name) + '</h3>' +
              '<p style="font-size:14px;color:#6E6E6E;line-height:1.6;margin-bottom:20px;flex:1">' + esc(g.summary) + '</p>' +
              '<span style="font-size:13px;font-weight:600;color:#F47C2C">Download \u2192</span>' +
            '</a>';
          });
          grid.innerHTML = h;
        }
      })
      .catch(function(){});
  }

  function fixHelp() {
    if (window.location.pathname.indexOf('/resources/help-center') === -1) return;
    // Help Center now lives externally — redirect anyone landing here to help.propfuel.com
    window.location.replace('https://help.propfuel.com/');
    return;
    // Legacy in-page help center content kept below for reference but unreachable.
    var main = getPageMain();

    var topics = [
      { icon: '\u{1F680}', title: 'Getting Started', items: ['Setting up your account', 'Importing members', 'Creating your first campaign', 'Connecting your AMS'] },
      { icon: '\u{1F4E7}', title: 'Email Campaigns', items: ['Building a PropFuel email', 'Response collection', 'A/B testing', 'Deliverability best practices'] },
      { icon: '\u{1F310}', title: 'Website Widget', items: ['Installing the widget', 'Customizing appearance', 'Targeting rules', 'Tracking conversions'] },
      { icon: '\u{1F4AC}', title: 'SMS', items: ['SMS setup & compliance', 'Opt-in management', 'Two-way messaging', 'Campaign scheduling'] },
      { icon: '\u{1F4CA}', title: 'Insights & Reporting', items: ['Dashboard overview', 'Member profiles', 'Response analysis', 'Exporting data'] },
      { icon: '\u{1F517}', title: 'Integrations', items: ['AMS integrations', 'AMS connections', 'API documentation', 'Webhooks'] }
    ];

    var faqs = [
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, or contact your account administrator to reset it from the admin panel.' },
      { q: 'Can I import members from a CSV file?', a: 'Yes. Go to Members > Import and upload a CSV with at least an email address column. PropFuel will map fields automatically.' },
      { q: 'How do I connect my AMS?', a: 'Navigate to Settings > Integrations and select your AMS provider. Follow the guided setup to authenticate and configure sync settings.' },
      { q: 'What browsers are supported?', a: 'PropFuel supports the latest versions of Chrome, Firefox, Safari, and Edge. We recommend Chrome for the best experience.' },
      { q: 'How do I cancel a scheduled campaign?', a: 'Go to Campaigns > Scheduled, find the campaign, and click "Cancel Send." You can reschedule it at any time.' },
      { q: 'Is there a mobile app?', a: 'PropFuel is a web-based platform optimized for desktop use. The dashboard is responsive and works on tablets and mobile browsers.' }
    ];

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Help Center</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">How Can We Help?</h1>' +
        '<div style="max-width:500px;margin:24px auto 0"><input type="text" placeholder="Search for help articles..." class="pf-form-input" style="border-radius:100px;padding:16px 24px;font-size:16px"></div>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:1000px;margin:0 auto">' +
        '<h2 style="font-size:20px;font-weight:800;color:#2F2F2F;margin-bottom:24px">Quick Actions</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">' +
          '<a href="/company/contact" class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px;text-align:center;text-decoration:none"><div style="font-size:28px;margin-bottom:12px">\u{1F4E9}</div><h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Contact Support</h3><p style="font-size:13px;color:#6E6E6E">Get help from our team</p></a>' +
          '<a href="/book-a-demo" class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px;text-align:center;text-decoration:none"><div style="font-size:28px;margin-bottom:12px">\u{1F4C5}</div><h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">Schedule Demo</h3><p style="font-size:13px;color:#6E6E6E">See PropFuel in action</p></a>' +
          '<a href="#" class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px;text-align:center;text-decoration:none"><div style="font-size:28px;margin-bottom:12px">\u{2705}</div><h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:6px">System Status</h3><p style="font-size:13px;color:#6E6E6E">All systems operational</p></a>' +
        '</div>' +
      '</div></section>' +

      '<section style="padding:0 48px 64px"><div style="max-width:1100px;margin:0 auto">' +
        '<h2 style="font-size:20px;font-weight:800;color:#2F2F2F;margin-bottom:24px">Knowledge Base</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">';

    topics.forEach(function(t) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px;text-align:left">' +
        '<div style="font-size:28px;margin-bottom:16px">' + t.icon + '</div>' +
        '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:16px">' + t.title + '</h3>' +
        '<ul style="list-style:none;padding:0;margin:0">';
      t.items.forEach(function(item) {
        html += '<li style="padding:8px 0;border-bottom:1px solid #E3DDD2"><a href="#" style="font-size:14px;color:#6E6E6E;text-decoration:none">' + item + '</a></li>';
      });
      html += '</ul></div>';
    });

    html += '</div></div></section>' +
      '<section style="padding:64px 48px"><div style="max-width:1000px;margin:0 auto">' +
        '<h2 style="font-size:20px;font-weight:800;color:#2F2F2F;margin-bottom:24px">Contact Methods</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px;text-align:center"><div style="font-size:24px;margin-bottom:10px">\u{1F4E7}</div><h4 style="font-size:14px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Email</h4><p style="font-size:13px;color:#6E6E6E">support@propfuel.com</p></div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px;text-align:center"><div style="font-size:24px;margin-bottom:10px">\u{1F4AC}</div><h4 style="font-size:14px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Live Chat</h4><p style="font-size:13px;color:#6E6E6E">Mon\u2013Fri, 9am\u20135pm ET</p></div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px;text-align:center"><div style="font-size:24px;margin-bottom:10px">\u{1F4DE}</div><h4 style="font-size:14px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Phone</h4><p style="font-size:13px;color:#6E6E6E">For enterprise clients</p></div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:24px;text-align:center"><div style="font-size:24px;margin-bottom:10px">\u{1F4DA}</div><h4 style="font-size:14px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Documentation</h4><p style="font-size:13px;color:#6E6E6E">API & developer docs</p></div>' +
        '</div>' +
      '</div></section>' +

      '<section style="padding:0 48px 64px"><div style="max-width:800px;margin:0 auto">' +
        '<h2 style="font-size:20px;font-weight:800;color:#2F2F2F;margin-bottom:32px;text-align:center">Frequently Asked Questions</h2>';

    faqs.forEach(function(f) {
      html += '<div class="pf-faq-item" style="border-bottom:1px solid #E3DDD2;padding:24px 0">' +
        '<button class="pf-faq-question" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;font:700 17px/1.4 \'DM Sans\',sans-serif;color:#2F2F2F;text-align:left;padding:0">' + f.q + '</button>' +
        '<div class="pf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height .35s ease"><p style="font-size:16px;color:#6E6E6E;line-height:1.65;padding-top:16px">' + f.a + '</p></div></div>';
    });

    html += '</div></section>' +
      '<section class="pf-cta-section" style="padding:96px 48px;text-align:center"><div style="max-width:600px;margin:0 auto">' +
        '<h2 class="pf-cta-heading" style="font-size:clamp(28px,4vw,42px);font-weight:800;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Still Have Questions?</h2>' +
        '<p style="font-size:17px;color:#8C8479;line-height:1.6;margin-bottom:32px">Our team is here to help. Reach out and we\'ll get back to you within one business day.</p>' +
        '<a href="/company/contact" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none">Contact Support</a>' +
      '</div></section>';

    main.innerHTML = html;
  }

  function fixNewsletter() {
    if (window.location.pathname.indexOf('/resources/newsletter') === -1) return;
    var main = getPageMain();

    var benefits = [
      { icon: '\u{1F4A1}', title: 'Engagement Insights', desc: 'Data-backed strategies for improving member retention and participation.' },
      { icon: '\u{1F4CB}', title: 'Playbooks & Templates', desc: 'Ready-to-use campaign frameworks you can implement immediately.' },
      { icon: '\u{1F4E3}', title: 'Product Updates', desc: 'Be the first to know about new PropFuel features and capabilities.' },
      { icon: '\u{1F3AF}', title: 'Industry Benchmarks', desc: 'See how your engagement metrics stack up against peer organizations.' }
    ];

    var benefitsHtml = benefits.map(function(b){
      return '<li style="display:flex;align-items:flex-start;gap:16px;margin-bottom:20px">' +
        '<div style="flex-shrink:0;width:44px;height:44px;border-radius:12px;background:rgba(251,192,45,0.12);display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid rgba(249,168,37,0.25)">' + b.icon + '</div>' +
        '<div><p style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:4px">' + b.title + '</p><p style="font-size:14px;color:#6E6E6E;line-height:1.55">' + b.desc + '</p></div>' +
      '</li>';
    }).join('');

    var html = '' +
      '<section style="padding:96px 48px 64px"><div class="nl-hero-grid" style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.05fr 1fr;gap:72px;align-items:center">' +
        '<div>' +
          '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Newsletter</p>' +
          '<h1 style="font-size:clamp(32px,4.2vw,48px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">Stay Ahead of Membership Engagement Trends</h1>' +
          '<p style="font-size:17px;color:#6E6E6E;line-height:1.6;margin-bottom:36px">Join 5,000+ association professionals getting actionable insights on member engagement, retention, and growth \u2014 delivered twice a month.</p>' +
          '<p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#F9A825;margin-bottom:20px">What you\'ll get</p>' +
          '<ul style="list-style:none;padding:0;margin:0">' + benefitsHtml + '</ul>' +
        '</div>' +
        '<div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:40px;box-shadow:0 8px 32px rgba(120,110,95,0.08);border:1px solid rgba(227,221,210,0.6)">' +
            '<h2 style="font-size:22px;font-weight:800;color:#2F2F2F;margin-bottom:6px">Subscribe free</h2>' +
            '<p style="font-size:14px;color:#6E6E6E;margin-bottom:28px">Two emails a month. Unsubscribe anytime.</p>' +
            '<form id="pf-newsletter-form" novalidate>' +
              '<div class="pf-form-group"><label class="pf-form-label" for="pf-nl-fname">First Name</label><input id="pf-nl-fname" name="firstname" type="text" placeholder="Jane" class="pf-form-input" autocomplete="given-name" required></div>' +
              '<div class="pf-form-group"><label class="pf-form-label" for="pf-nl-lname">Last Name</label><input id="pf-nl-lname" name="lastname" type="text" placeholder="Doe" class="pf-form-input" autocomplete="family-name" required></div>' +
              '<div class="pf-form-group"><label class="pf-form-label" for="pf-nl-email">Email<span style="color:#F05A28;margin-left:2px">*</span></label><input id="pf-nl-email" name="email" type="email" placeholder="jane@association.org" class="pf-form-input" autocomplete="email" required></div>' +
              '<div class="pf-form-group"><label class="pf-form-label" for="pf-nl-company">Organization</label><input id="pf-nl-company" name="company" type="text" placeholder="Your association or company" class="pf-form-input" autocomplete="organization"></div>' +
              '<button type="submit" class="pf-form-submit" id="pf-nl-submit">Subscribe</button>' +
              '<div id="pf-nl-msg" style="margin-top:16px;font-size:14px;line-height:1.5;display:none"></div>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div></section>' +

            '<style>@media (max-width:900px){.nl-hero-grid{grid-template-columns:1fr!important;gap:40px!important}}</style>';

    main.innerHTML = html;

    // Custom form submits directly to HubSpot's Forms API (no iframe, fully styleable)
    var form = document.getElementById('pf-newsletter-form');
    if (!form) return;
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var submitBtn = document.getElementById('pf-nl-submit');
      var msg = document.getElementById('pf-nl-msg');
      var fd = new FormData(form);
      var fields = [];
      fd.forEach(function(val, name){
        if (val && String(val).trim()) fields.push({ name: name, value: String(val).trim() });
      });
      if (!fields.find(function(f){ return f.name === 'email'; })) {
        msg.style.display = 'block';
        msg.style.color = '#D84315';
        msg.textContent = 'Please enter a valid email.';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';
      // Get hutk cookie for HubSpot tracking (if present)
      var hutk = (document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/) || [])[1];
      var payload = {
        submittedAt: Date.now(),
        fields: fields,
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      };
      if (hutk) payload.context.hutk = hutk;
      fetch('https://api.hsforms.com/submissions/v3/integration/submit/21158441/e62f4793-4fde-4a54-ad2b-e0735c3e7984', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(r){
        return r.ok ? r.json() : r.json().then(function(e){ throw new Error((e && e.errors && e.errors[0] && e.errors[0].message) || 'Submission failed'); });
      }).then(function(){
        form.innerHTML = '<div style="color:#2F2F2F;font-size:15px;line-height:1.6;padding:20px;background:rgba(251,192,45,0.15);border-radius:12px;border:1px solid rgba(249,168,37,0.35);text-align:center"><p style="font-weight:700;margin-bottom:6px;font-size:17px">You\'re on the list</p><p style="color:#6E6E6E">Check your inbox for a welcome email. Talk soon!</p></div>';
      }).catch(function(err){
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
        msg.style.display = 'block';
        msg.style.color = '#D84315';
        msg.textContent = err.message || 'Something went wrong. Please try again.';
      });
    });
  }

  function fixApi() {
    if (window.location.pathname.indexOf('/resources/api-docs') === -1) return;
    var main = getPageMain();

    var capabilities = [
      { title: 'Member Data', desc: 'Read and write member profiles, tags, scores, and custom fields via RESTful endpoints.' },
      { title: 'Campaigns', desc: 'Create, schedule, and manage engagement campaigns programmatically.' },
      { title: 'Insights', desc: 'Pull engagement metrics, response data, and trend analysis in real time.' },
      { title: 'Webhooks', desc: 'Subscribe to events like responses, score changes, and campaign completions.' },
      { title: 'Authentication', desc: 'OAuth 2.0 with API keys and scoped tokens for secure access control.' },
      { title: 'Rate Limits', desc: '1,000 requests/minute for standard plans. Higher limits available for enterprise.' }
    ];

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Developer API</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">PropFuel API</h1>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6;max-width:600px;margin:0 auto">Build custom integrations, sync member data, and extend PropFuel\'s capabilities with our RESTful API.</p>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:800px;margin:0 auto">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:40px;text-align:left">' +
          '<h2 style="font-size:22px;font-weight:800;color:#2F2F2F;margin-bottom:12px">Overview</h2>' +
          '<p style="font-size:16px;color:#6E6E6E;line-height:1.7">The PropFuel API provides programmatic access to your engagement platform. Use it to sync member data from your AMS, trigger campaigns based on external events, pull response data into your data warehouse, and build custom workflows that extend PropFuel\'s core capabilities.</p>' +
        '</div>' +
      '</div></section>' +

      '<section style="padding:0 48px 64px"><div style="max-width:1100px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px;text-align:center">Key Capabilities</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">';

    capabilities.forEach(function(c) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px;text-align:left">' +
        '<h3 style="font-size:17px;font-weight:700;color:#2F2F2F;margin-bottom:10px">' + c.title + '</h3>' +
        '<p style="font-size:14px;color:#6E6E6E;line-height:1.6">' + c.desc + '</p>' +
      '</div>';
    });

    html += '</div></div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:800px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px;text-align:center">Getting Started</h2>' +
        '<div style="display:flex;flex-direction:column;gap:24px">' +
          '<div style="display:flex;align-items:flex-start;gap:16px"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0">1</div><div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Generate an API Key</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.6">Navigate to Settings &gt; API in your PropFuel dashboard and create a new API key with the appropriate scopes.</p></div></div>' +
          '<div style="display:flex;align-items:flex-start;gap:16px"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0">2</div><div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Make Your First Request</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.6">Test your connection with a simple GET request to the members endpoint.</p></div></div>' +
          '<div style="display:flex;align-items:flex-start;gap:16px"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0">3</div><div><h4 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:4px">Build Your Integration</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.6">Use our SDKs (Node.js, Python) or make direct HTTP requests to build your custom workflows.</p></div></div>' +
        '</div>' +
        '<div style="margin-top:32px;background:#1A1713;border-radius:12px;padding:24px;overflow-x:auto">' +
          '<pre style="margin:0;font-family:\'SF Mono\',Monaco,Consolas,monospace;font-size:13px;line-height:1.6;color:#EDE8DF"><code>curl -X GET https://api.propfuel.com/v1/members \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"</code></pre>' +
        '</div>' +
      '</div></section>' +

      '<section class="pf-cta-section" style="padding:96px 48px;text-align:center"><div style="max-width:600px;margin:0 auto">' +
        '<h2 class="pf-cta-heading" style="font-size:clamp(28px,4vw,42px);font-weight:800;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Ready to Build?</h2>' +
        '<p style="font-size:17px;color:#8C8479;line-height:1.6;margin-bottom:32px">Explore the full API documentation or reach out to our developer support team.</p>' +
        '<div style="display:flex;justify-content:center;gap:16px">' +
          '<a href="#" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none">View Full Docs</a>' +
          '<a href="/company/contact" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#EDE8DF;border:1.5px solid rgba(237,232,223,0.35)">Contact Dev Support</a>' +
        '</div>' +
      '</div></section>';

    main.innerHTML = html;
  }

  // ─────────────────────────────────────────
  // COMPANY PAGES
  // ─────────────────────────────────────────

  function fixAbout() {
    if (window.location.pathname.indexOf('/company/about') === -1) return;
    var main = getPageMain();

    // Preserve any Webflow CMS team list the designer set up (.w-dyn-list).
    // If present, the CMS wins; otherwise fall back to the real Vercel roster.
    var cmsTeamLists = Array.prototype.slice.call(main.querySelectorAll('.w-dyn-list'));
    var cmsTeamHTML = cmsTeamLists.map(function(el){ return el.outerHTML; }).join('');

    // Real team data from Vercel (source of truth)
    var departments = [
      { name: 'Leadership', members: [
        { name: 'Dave Will', title: 'Co-Founder, CEO' },
        { name: 'Cameron Aubuchon', title: 'President, CTO' },
        { name: 'Ryan Graham', title: 'Chief Revenue Officer' }
      ]},
      { name: 'Client Success', members: [
        { name: 'Ashley Wucher', title: 'Director of Client Success' },
        { name: 'Nick Kiesseg', title: 'Client Success Manager' },
        { name: 'Brett Voeltz', title: 'Client Success Manager' },
        { name: 'Clara Meek', title: 'Client Success Manager' },
        { name: 'Bruna Letti', title: 'Managed Services Coordinator' }
      ]},
      { name: 'Marketing', members: [
        { name: 'Alex Hively', title: 'Head of Marketing' },
        { name: 'Brittany Lancor', title: 'Senior Marketing Manager' },
        { name: 'Alejandra Prado', title: 'Marketing Coordinator' }
      ]},
      { name: 'Sales', members: [
        { name: 'Lisa McNeil', title: 'Sales Development Representative' },
        { name: 'Mike Arisco', title: 'Account Executive' }
      ]},
      { name: 'Engineering', members: [
        { name: 'Sebastian Marulanda', title: 'Full-stack Software Engineer' },
        { name: 'Allison Lee', title: 'Product Manager' }
      ]}
    ];

    var milestones = [
      { year: '2018', title: 'The Spark', desc: 'PropFuel was founded on a simple observation: associations were broadcasting to their members, but nobody was truly listening. We set out to change that with conversational engagement technology.' },
      { year: '2019', title: 'First Platform Launch', desc: 'Our initial platform launched, enabling associations to ask members one question at a time via email — and act on the answers automatically. Early customers saw response rates they’d never achieved before.' },
      { year: '2021', title: 'Multi-Channel Expansion', desc: 'PropFuel expanded beyond email to include website personalization and SMS, giving associations the ability to meet members wherever they are with the right question at the right time.' },
      { year: '2024', title: 'AI-Powered Intelligence', desc: 'We introduced Membership AI — intelligent agents that understand member context, predict needs, and automate personalized outreach at a scale never before possible for associations.' },
      { year: 'Today', title: 'Trusted by Hundreds of Associations', desc: 'PropFuel now serves associations of all sizes, helping them reach millions of members with conversations that drive real engagement, retention, and growth.' }
    ];

    function buildTeamCard(m) {
      var initials = m.initials || (m.name || '').split(' ').map(function(n){ return n[0]; }).join('').slice(0,2);
      var photoHTML = m.photo
        ? '<img src="' + m.photo + '" alt="' + (m.name || '') + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 14px;display:block;box-shadow:0 2px 8px rgba(0,0,0,0.08)" onerror="this.outerHTML=\'<div style=&quot;width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;margin:0 auto 14px&quot;>' + initials + '</div>\'" />'
        : '<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;margin:0 auto 14px">' + initials + '</div>';
      var inner =
        photoHTML +
        '<h4 style="font-size:15px;font-weight:700;color:#2F2F2F;margin-bottom:4px">' + (m.name || '') + '</h4>' +
        '<p style="font-size:13px;color:#8C8479">' + (m.title || '') + '</p>';
      if (m.slug) {
        return '<a href="/team-members/' + m.slug + '" class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px;text-align:center;display:block;text-decoration:none;color:inherit;transition:transform 0.15s,box-shadow 0.15s">' +
          inner + '</a>';
      }
      return '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px;text-align:center">' +
        inner + '</div>';
    }

    function buildTeamFromSnapshot(data) {
      if (!data || !Array.isArray(data.members)) return '';
      var members = data.members.slice().sort(function(a, b) { return (a.sort || 999) - (b.sort || 999); });
      return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px">' +
        members.map(buildTeamCard).join('') +
      '</div>';
    }

    // Hardcoded fallback (initials only) used instantly while the real snapshot loads
    function buildTeamFallback(depts) {
      var all = [];
      depts.forEach(function(dept) { dept.members.forEach(function(m) { all.push(m); }); });
      return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px">' +
        all.map(buildTeamCard).join('') +
      '</div>';
    }

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">About Us</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">About PropFuel</h1>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6;max-width:640px;margin:0 auto">We help associations listen to and act on what their members actually want \u2014 turning one-way broadcasts into two-way conversations that drive retention, engagement, and growth.</p>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:32px">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:40px;text-align:left">' +
          '<p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#F9A825;margin-bottom:12px">Our Mission</p>' +
          '<p style="font-size:17px;color:#2F2F2F;line-height:1.65;font-weight:500">Make membership meaningful.</p>' +
        '</div>' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:40px;text-align:left">' +
          '<p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#F9A825;margin-bottom:12px">Our Vision</p>' +
          '<p style="font-size:17px;color:#2F2F2F;line-height:1.65;font-weight:500">A world where every association has the tools to make every member feel like membership was made for them.</p>' +
        '</div>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:1100px;margin:0 auto">' +
        '<div style="text-align:center;margin-bottom:48px">' +
          '<p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#F9A825;margin-bottom:12px">Our People</p>' +
          '<h2 style="font-size:clamp(28px,3.5vw,40px);font-weight:800;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.1;margin-bottom:16px">Meet the Team</h2>' +
          '<p style="font-size:17px;color:#6E6E6E;line-height:1.6;max-width:560px;margin:0 auto">The people behind PropFuel are passionate about helping associations thrive through better member engagement.</p>' +
        '</div>' +
        '<div class="pf-team-grid-slot">' + (cmsTeamHTML || buildTeamFallback(departments)) + '</div>' +
      '</div></section>' +

      '<section style="padding:64px 48px;background:#F6F2E8"><div style="max-width:900px;margin:0 auto">' +
        '<div style="text-align:center;margin-bottom:48px">' +
          '<p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#F9A825;margin-bottom:12px">Our Story</p>' +
          '<h2 style="font-size:clamp(24px,3vw,32px);font-weight:800;color:#2F2F2F;letter-spacing:-0.02em;margin-bottom:16px">The PropFuel Journey</h2>' +
          '<p style="font-size:16px;color:#6E6E6E;line-height:1.6">From a simple idea to a platform trusted by associations across the country.</p>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:32px">';

    milestones.forEach(function(m) {
      html += '<div style="display:flex;align-items:flex-start;gap:24px">' +
        '<div style="min-width:80px;text-align:right"><span style="font-size:20px;font-weight:900;background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">' + m.year + '</span></div>' +
        '<div style="width:2px;background:#E3DDD2;flex-shrink:0;min-height:60px"></div>' +
        '<div><h4 style="font-size:17px;font-weight:700;color:#2F2F2F;margin-bottom:6px">' + m.title + '</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">' + m.desc + '</p></div>' +
      '</div>';
    });

    html += '</div></div></section>' +

      '<section class="pf-section-dark" style="padding:80px 48px"><div style="max-width:800px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;text-align:center">' +
        '<div><p style="font-size:clamp(32px,4vw,48px);font-weight:900;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1">2018</p><p style="font-size:14px;color:#8C8479;margin-top:8px">Founded</p></div>' +
        '<div><p style="font-size:clamp(32px,4vw,48px);font-weight:900;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1">340+</p><p style="font-size:14px;color:#8C8479;margin-top:8px">Customers</p></div>' +
        '<div><p style="font-size:clamp(32px,4vw,48px);font-weight:900;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1">10M+</p><p style="font-size:14px;color:#8C8479;margin-top:8px">Members Reached</p></div>' +
      '</div></section>' +

      '<section class="pf-cta-section" style="padding:96px 48px;text-align:center"><div style="max-width:600px;margin:0 auto">' +
        '<h2 class="pf-cta-heading" style="font-size:clamp(28px,4vw,42px);font-weight:800;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Ready to Transform Member Engagement?</h2>' +
        '<p style="font-size:17px;color:#8C8479;line-height:1.6;margin-bottom:32px">See how PropFuel can help your association build deeper connections with every member.</p>' +
        '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none">Request a Demo</a>' +
      '</div></section>';

    main.innerHTML = html;

    // Hydrate team grid from Webflow CMS snapshot (team.json) — replaces initials with real photos + full roster
    if (!cmsTeamHTML) {
      fetch('https://alexhively.github.io/propfuel-webflow-custom/js/team.json?v=1')
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
          if (!data) return;
          var slot = document.querySelector('.pf-team-grid-slot');
          var real = buildTeamFromSnapshot(data);
          if (slot && real) slot.innerHTML = real;
        })
        .catch(function() {});
    }
  }

  function fixCareers() {
    if (window.location.pathname.indexOf('/company/careers') === -1) return;
    var main = getPageMain();

    var values = [
      { title: 'Members First', desc: 'Everything we build starts with a simple question: does this help associations serve their members better?' },
      { title: 'Bias Toward Action', desc: 'We ship fast, learn faster, and trust our team to make decisions without waiting for permission.' },
      { title: 'Radical Transparency', desc: 'We share context openly \u2014 financials, strategy, challenges. Everyone deserves the full picture.' },
      { title: 'Enjoy the Ride', desc: 'We\u2019re building something meaningful. We celebrate wins, learn from setbacks, and don\u2019t take ourselves too seriously.' }
    ];

    var benefitsList = [
      { icon: '\u{1F3E0}', title: 'Remote-First', desc: 'Work from anywhere. We\u2019ve been distributed since day one.' },
      { icon: '\u{1FA7A}', title: 'Health & Wellness', desc: 'Comprehensive medical, dental, and vision coverage for you and your family.' },
      { icon: '\u{1F4BB}', title: 'Equipment Budget', desc: '$1,500 annual stipend to set up your ideal workspace.' },
      { icon: '\u{1F334}', title: 'Unlimited PTO', desc: 'Take the time you need. We trust you to manage your schedule.' },
      { icon: '\u{1F4DA}', title: 'Learning Budget', desc: '$1,000 annual budget for courses, conferences, and professional development.' }
    ];

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Careers</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">Join the Team</h1>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6;max-width:600px;margin:0 auto">Help us build the future of member engagement. We\u2019re a small, remote-first team solving big problems for associations.</p>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:1000px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px;text-align:center">Our Values</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px">';

    values.forEach(function(v) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px;text-align:left">' +
        '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">' + v.title + '</h3>' +
        '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">' + v.desc + '</p>' +
      '</div>';
    });

    html += '</div></div></section>' +

      '<section style="padding:0 48px 64px"><div style="max-width:1100px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px;text-align:center">Benefits & Perks</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">';

    benefitsList.forEach(function(b) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px;text-align:center">' +
        '<div style="font-size:32px;margin-bottom:14px">' + b.icon + '</div>' +
        '<h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:8px">' + b.title + '</h3>' +
        '<p style="font-size:14px;color:#6E6E6E;line-height:1.5">' + b.desc + '</p>' +
      '</div>';
    });

    html += '</div></div></section>' +

      '<section style="padding:64px 48px;background:#F6F2E8"><div style="max-width:800px;margin:0 auto;text-align:center">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:16px">Open Positions</h2>' +
        '<div class="pf-card" style="background:#fff;border-radius:16px;padding:48px;text-align:center">' +
          '<p style="font-size:32px;margin-bottom:16px">\u{1F50D}</p>' +
          '<p style="font-size:17px;font-weight:600;color:#2F2F2F;margin-bottom:8px">No open positions at this time</p>' +
          '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">We\u2019re always looking for great people. Send us your resume and we\u2019ll keep you in mind.</p>' +
        '</div>' +
      '</div></section>' +

      '<section class="pf-cta-section" style="padding:96px 48px;text-align:center"><div style="max-width:600px;margin:0 auto">' +
        '<h2 class="pf-cta-heading" style="font-size:clamp(28px,4vw,42px);font-weight:800;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Don\'t See Your Role?</h2>' +
        '<p style="font-size:17px;color:#8C8479;line-height:1.6;margin-bottom:32px">We\u2019re always interested in hearing from talented people who are passionate about member engagement.</p>' +
        '<a href="mailto:careers@propfuel.com" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none">Send Your Resume</a>' +
      '</div></section>';

    main.innerHTML = html;
  }

  function fixContact() {
    if (window.location.pathname.indexOf('/company/contact') === -1) return;
    var main = getPageMain();

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Contact</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">Get in Touch</h1>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6;max-width:600px;margin:0 auto">Have a question, want a demo, or just want to say hello? We\'d love to hear from you.</p>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:1000px;margin:0 auto">' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px;text-align:center">' +
            '<div style="font-size:28px;margin-bottom:14px">\u{1F4B0}</div>' +
            '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Sales</h3>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6;margin-bottom:12px">Interested in PropFuel for your association? Let\u2019s talk.</p>' +
            '<a href="mailto:sales@propfuel.com" style="font-size:14px;font-weight:600;color:#F47C2C;text-decoration:none">sales@propfuel.com</a>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px;text-align:center">' +
            '<div style="font-size:28px;margin-bottom:14px">\u{1F6E0}\u{FE0F}</div>' +
            '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Support</h3>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6;margin-bottom:12px">Need help with your PropFuel account? Our team is here for you.</p>' +
            '<a href="mailto:support@propfuel.com" style="font-size:14px;font-weight:600;color:#F47C2C;text-decoration:none">support@propfuel.com</a>' +
          '</div>' +
          '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px;text-align:center">' +
            '<div style="font-size:28px;margin-bottom:14px">\u{1F91D}</div>' +
            '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:8px">Partnerships</h3>' +
            '<p style="font-size:15px;color:#6E6E6E;line-height:1.6;margin-bottom:12px">Explore integration, referral, or content partnership opportunities.</p>' +
            '<a href="mailto:partners@propfuel.com" style="font-size:14px;font-weight:600;color:#F47C2C;text-decoration:none">partners@propfuel.com</a>' +
          '</div>' +
        '</div>' +
      '</div></section>' +

      '<section style="padding:0 48px 64px"><div style="max-width:640px;margin:0 auto">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:40px">' +
          '<h2 style="font-size:22px;font-weight:800;color:#2F2F2F;margin-bottom:24px">Send Us a Message</h2>' +
          '<div class="pf-form-group"><label class="pf-form-label">Full Name</label><input type="text" placeholder="Jane Doe" class="pf-form-input"></div>' +
          '<div class="pf-form-group"><label class="pf-form-label">Email</label><input type="email" placeholder="jane@association.org" class="pf-form-input"></div>' +
          '<div class="pf-form-group"><label class="pf-form-label">Organization</label><input type="text" placeholder="Your association or company" class="pf-form-input"></div>' +
          '<div class="pf-form-group"><label class="pf-form-label">Subject</label><select class="pf-form-input"><option value="">Select a topic...</option><option value="demo">Request a Demo</option><option value="support">Support Question</option><option value="partnership">Partnership Inquiry</option><option value="press">Press / Media</option><option value="other">Other</option></select></div>' +
          '<div class="pf-form-group"><label class="pf-form-label">Message</label><textarea placeholder="How can we help?" class="pf-form-input pf-form-textarea"></textarea></div>' +
          '<button class="pf-form-submit">Send Message</button>' +
        '</div>' +
      '</div></section>' +

      '<section style="padding:64px 48px;background:#F6F2E8"><div style="max-width:600px;margin:0 auto;text-align:center">' +
        '<h2 style="font-size:22px;font-weight:800;color:#2F2F2F;margin-bottom:12px">Office Location</h2>' +
        '<p style="font-size:16px;color:#6E6E6E;line-height:1.6">PropFuel is a remote-first company headquartered in the United States. Our team works from coast to coast.</p>' +
      '</div></section>' +

      '<section class="pf-cta-section" style="padding:96px 48px;text-align:center"><div style="max-width:600px;margin:0 auto">' +
        '<h2 class="pf-cta-heading" style="font-size:clamp(28px,4vw,42px);font-weight:800;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Ready to See PropFuel in Action?</h2>' +
        '<p style="font-size:17px;color:#8C8479;line-height:1.6;margin-bottom:32px">Schedule a personalized demo and see how PropFuel can transform your member engagement.</p>' +
        '<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none">Request a Demo</a>' +
      '</div></section>';

    main.innerHTML = html;
  }

  function fixPartners() {
    if (window.location.pathname.indexOf('/company/partners') === -1) return;
    var main = getPageMain();

    var partnerTypes = [
      { title: 'AMS Integration Partners', desc: 'Connect your AMS with PropFuel to unlock seamless member data sync and engagement automation.' },
      { title: 'Consulting Partners', desc: 'Help your association clients implement engagement strategies powered by PropFuel.' },
      { title: 'Technology Partners', desc: 'Integrate your platform with PropFuel to deliver richer member experiences.' },
      { title: 'Content & Community Partners', desc: 'Co-create content, host events, and build community around member engagement best practices.' }
    ];

    var collaborations = [
      { name: 'iMIS', desc: 'Deep AMS integration for real-time member data sync and response analysis.' },
      { name: 'Nimble AMS', desc: 'Native Salesforce-based integration with bi-directional data flow.' },
      { name: 'MemberSuite', desc: 'Automated member import and response data push-back to member records.' },
      { name: 'Association Analytics', desc: 'Combined engagement + analytics for predictive member health scoring.' },
      { name: 'Billhighway', desc: 'Chapter-level engagement data connected to financial performance metrics.' },
      { name: 'Higher Logic', desc: 'Community engagement data enriched with PropFuel conversation insights.' }
    ];

    var partnerBenefits = [
      { title: 'Revenue Share', desc: 'Earn recurring revenue for every client you bring to PropFuel.' },
      { title: 'Co-Marketing', desc: 'Joint webinars, case studies, and content campaigns to drive mutual growth.' },
      { title: 'Technical Support', desc: 'Dedicated partner engineering team and sandbox environments.' },
      { title: 'Training & Certification', desc: 'Get certified on PropFuel to better serve your clients.' },
      { title: 'Partner Portal', desc: 'Self-service dashboard for tracking referrals, revenue, and resources.' },
      { title: 'Early Access', desc: 'Preview new features and shape the product roadmap with partner input.' }
    ];

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<p style="display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:24px">Partnerships</p>' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">Partner With PropFuel</h1>' +
        '<p style="font-size:18px;color:#6E6E6E;line-height:1.6;max-width:600px;margin:0 auto">Join our partner ecosystem and help associations build deeper connections with their members.</p>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:1000px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px;text-align:center">Partnership Types</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px">';

    partnerTypes.forEach(function(p) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:36px;text-align:left">' +
        '<h3 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:10px">' + p.title + '</h3>' +
        '<p style="font-size:15px;color:#6E6E6E;line-height:1.6">' + p.desc + '</p>' +
      '</div>';
    });

    html += '</div></div></section>' +

      '<section style="padding:0 48px 64px"><div style="max-width:1100px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px;text-align:center">Past Collaborations</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">';

    collaborations.forEach(function(c) {
      html += '<div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px;text-align:left">' +
        '<h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:8px">' + c.name + '</h3>' +
        '<p style="font-size:14px;color:#6E6E6E;line-height:1.5">' + c.desc + '</p>' +
      '</div>';
    });

    html += '</div></div></section>' +

      '<section style="padding:64px 48px;background:#F6F2E8"><div style="max-width:1100px;margin:0 auto">' +
        '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:32px;text-align:center">Partner Benefits</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">';

    partnerBenefits.forEach(function(b) {
      html += '<div class="pf-card" style="background:#fff;border-radius:16px;padding:28px;text-align:left">' +
        '<h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:8px">' + b.title + '</h3>' +
        '<p style="font-size:14px;color:#6E6E6E;line-height:1.5">' + b.desc + '</p>' +
      '</div>';
    });

    html += '</div></div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:640px;margin:0 auto">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:40px">' +
          '<h2 style="font-size:22px;font-weight:800;color:#2F2F2F;margin-bottom:24px;text-align:center">Become a Partner</h2>' +
          '<div class="pf-form-group"><label class="pf-form-label">Name</label><input type="text" placeholder="Your full name" class="pf-form-input"></div>' +
          '<div class="pf-form-group"><label class="pf-form-label">Email</label><input type="email" placeholder="you@company.com" class="pf-form-input"></div>' +
          '<div class="pf-form-group"><label class="pf-form-label">Organization</label><input type="text" placeholder="Your company" class="pf-form-input"></div>' +
          '<div class="pf-form-group"><label class="pf-form-label">Partnership Type</label><select class="pf-form-input"><option value="">Select a type...</option><option value="ams">AMS Integration</option><option value="consulting">Consulting</option><option value="technology">Technology</option><option value="content">Content & Community</option></select></div>' +
          '<div class="pf-form-group"><label class="pf-form-label">Message</label><textarea placeholder="Tell us about the partnership opportunity..." class="pf-form-input pf-form-textarea"></textarea></div>' +
          '<button class="pf-form-submit">Submit Application</button>' +
        '</div>' +
      '</div></section>' +

      '<section class="pf-cta-section" style="padding:96px 48px;text-align:center"><div style="max-width:600px;margin:0 auto">' +
        '<h2 class="pf-cta-heading" style="font-size:clamp(28px,4vw,42px);font-weight:800;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.1;margin-bottom:20px">Ready to Partner with PropFuel?</h2>' +
        '<p style="font-size:17px;color:#8C8479;line-height:1.6;margin-bottom:32px">Let\u2019s explore how we can grow together and deliver more value to associations.</p>' +
        '<a href="mailto:partners@propfuel.com" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none">Get in Touch</a>' +
      '</div></section>';

    main.innerHTML = html;
  }

  // ─────────────────────────────────────────
  // LEGAL PAGES
  // ─────────────────────────────────────────

  function fixPrivacy() {
    if (window.location.pathname.indexOf('/legal/privacy') === -1) return;
    var main = getPageMain();

    var ss = 'font-size:15px;color:#6E6E6E;line-height:1.7;margin-bottom:16px';
    var sh = 'font-size:22px;font-weight:700;color:#2F2F2F;margin:40px 0 16px';
    var sh2 = 'font-size:18px;font-weight:700;color:#2F2F2F;margin:32px 0 12px';

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px">Privacy Policy</h1>' +
        '<p style="font-size:16px;color:#8C8479">Last updated: January 7, 2022</p>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:800px;margin:0 auto;text-align:left">' +
        '<p style="' + ss + '">This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>' +
        '<p style="' + ss + '">We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>' +

        '<h2 style="' + sh + '">Interpretation and Definitions</h2>' +
        '<h3 style="' + sh2 + '">Interpretation</h3>' +
        '<p style="' + ss + '">The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>' +
        '<h3 style="' + sh2 + '">Definitions</h3>' +
        '<p style="' + ss + '">For the purposes of this Privacy Policy:</p>' +
        '<ul style="' + ss + ';padding-left:24px">' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to PropFuel.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Country</strong> refers to the United States of America.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Service</strong> refers to the Website.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">Website</strong> refers to PropFuel, accessible from <a href="https://www.propfuel.com" style="color:#F47C2C">https://www.propfuel.com</a>.</li>' +
          '<li style="margin-bottom:8px"><strong style="color:#2F2F2F">You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>' +
        '</ul>' +

        '<h2 style="' + sh + '">Collecting and Using Your Personal Data</h2>' +
        '<h3 style="' + sh2 + '">Types of Data Collected</h3>' +
        '<p style="' + ss + '"><strong style="color:#2F2F2F">Personal Data:</strong> While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: email address, first name and last name, phone number, address, state, province, ZIP/postal code, city, and usage data.</p>' +
        '<p style="' + ss + '"><strong style="color:#2F2F2F">Usage Data:</strong> Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device\'s Internet Protocol address, browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>' +

        '<h2 style="' + sh + '">Use of Your Personal Data</h2>' +
        '<p style="' + ss + '">The Company may use Personal Data for the following purposes: to provide and maintain our Service; to manage Your Account; for the performance of a contract; to contact You; to provide You with news, special offers and general information; to manage Your requests; for business transfers; and for other purposes such as data analysis, identifying usage trends, and improving our Service.</p>' +

        '<h2 style="' + sh + '">Sharing Your Personal Data</h2>' +
        '<p style="' + ss + '">We may share Your personal information in the following situations: with Service Providers, for business transfers, with affiliates, with business partners, with other users when You share information publicly, and with Your consent.</p>' +

        '<h2 style="' + sh + '">Retention of Your Personal Data</h2>' +
        '<p style="' + ss + '">The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>' +

        '<h2 style="' + sh + '">Transfer of Your Personal Data</h2>' +
        '<p style="' + ss + '">Your information, including Personal Data, is processed at the Company\'s operating offices and in any other places where the parties involved in the processing are located. Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>' +

        '<h2 style="' + sh + '">Disclosure of Your Personal Data</h2>' +
        '<p style="' + ss + '">The Company may disclose Your Personal Data in the good faith belief that such action is necessary to: comply with a legal obligation; protect and defend the rights or property of the Company; prevent or investigate possible wrongdoing in connection with the Service; protect the personal safety of Users of the Service or the public; and protect against legal liability.</p>' +

        '<h2 style="' + sh + '">Security of Your Personal Data</h2>' +
        '<p style="' + ss + '">The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>' +

        '<h2 style="' + sh + '">Analytics</h2>' +
        '<p style="' + ss + '">We may use third-party Service providers to monitor and analyze the use of our Service. Google Analytics is a web analytics service offered by Google that tracks and reports website traffic. For more information on the privacy practices of Google, please visit the Google Privacy & Terms web page.</p>' +

        '<h2 style="' + sh + '">GDPR Privacy</h2>' +
        '<p style="' + ss + '">If You are a resident of the European Economic Area (EEA), You have certain data protection rights. PropFuel aims to take reasonable steps to allow You to correct, amend, delete or limit the use of Your Personal Data. You have the right to access, update or delete the information we have on You, the right of rectification, the right to object, the right of restriction, the right to data portability, and the right to withdraw consent.</p>' +

        '<h2 style="' + sh + '">CCPA Privacy</h2>' +
        '<p style="' + ss + '">If You are a California resident, You are entitled to learn what data we collect about You, ask to delete Your data, and not be discriminated against. To exercise Your data protection rights, You can contact Us.</p>' +

        '<h2 style="' + sh + '">Contact Us</h2>' +
        '<p style="' + ss + '">If you have any questions about this Privacy Policy, You can contact us by email at <a href="mailto:support@propfuel.com" style="color:#F47C2C">support@propfuel.com</a>.</p>' +

      '</div></section>';

    main.innerHTML = html;
  }

  function fixTerms() {
    if (window.location.pathname.indexOf('/legal/terms') === -1) return;
    var main = getPageMain();

    var html = '' +
      '<section style="padding:96px 48px 0;text-align:center"><div style="max-width:800px;margin:0 auto">' +
        '<h1 style="font-size:clamp(36px,5vw,56px);font-weight:800;color:#2F2F2F;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px">Terms of Service</h1>' +
      '</div></section>' +

      '<section style="padding:64px 48px"><div style="max-width:600px;margin:0 auto;text-align:center">' +
        '<div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:64px 48px">' +
          '<p style="font-size:32px;margin-bottom:20px">\u{1F4C4}</p>' +
          '<h2 style="font-size:24px;font-weight:800;color:#2F2F2F;margin-bottom:12px">Coming Soon</h2>' +
          '<p style="font-size:16px;color:#6E6E6E;line-height:1.6">Our Terms of Service are being updated. In the meantime, please contact us at <a href="mailto:support@propfuel.com" style="color:#F47C2C;font-weight:600">support@propfuel.com</a> with any questions.</p>' +
        '</div>' +
      '</div></section>';

    main.innerHTML = html;
  }

  // ─────────────────────────────────────────
  // FIX ROI RESULTS PAGE
  // ─────────────────────────────────────────
  function fixRoiResults() {
    var p = window.location.pathname.replace(/\/$/, '');
    if (p !== '/roi') return;
    var heroLabel=document.querySelector('.pf-page-hero-label');if(heroLabel){heroLabel.textContent='Client Success';}else{var heroTitle=document.querySelector('.pf-page-hero-title');if(heroTitle){var parent=heroTitle.parentElement;if(!parent.querySelector('.pf-hero-label-injected')){var label=document.createElement('p');label.className='pf-hero-label-injected fade-up';label.style.cssText='display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)';label.textContent='Client Success';parent.insertBefore(label,heroTitle);}}}
    var heroHeading=document.querySelector('.pf-page-hero-title');if(heroHeading){heroHeading.innerHTML='The Numbers Don\u2019t Lie';}
    var heroSub=document.querySelector('.pf-page-hero-sub');if(heroSub){heroSub.textContent='PropFuel helps associations drive measurable revenue growth through deeper member engagement. Here\u2019s the proof.';}
    if(heroHeading){var heroParent=heroHeading.parentElement;if(!heroParent.querySelector('.pf-hero-btns-injected')){var btnWrap=document.createElement('div');btnWrap.className='pf-hero-btns-injected fade-up';btnWrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';btnWrap.innerHTML='<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Get a Demo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/client-success/case-studies" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">See Case Studies</a>';var sub=heroParent.querySelector('.pf-page-hero-sub');if(sub){sub.parentNode.insertBefore(btnWrap,sub.nextSibling);}else{heroParent.appendChild(btnWrap);}}}
    var ctaSection=document.querySelector('.pf-cta-section, [class*="cta-section"]');if(!ctaSection)return;
    if(!document.querySelector('.roi-hero-feature')){var heroSection=document.querySelector('.pf-page-hero')||document.querySelector('[class*="page-hero"]');var featureHTML='<section class="roi-hero-feature" style="padding:24px 48px 64px;background:transparent"><div style="max-width:760px;margin:0 auto"><div style="background:#F6F2E8;border-radius:24px;padding:40px 32px;border:1px solid rgba(227,221,210,0.6);box-shadow:0 8px 32px rgba(120,110,95,0.08)"><p style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;text-align:center;margin-bottom:8px">Year-Over-Year Growth</p><h3 style="font-size:clamp(22px,2.4vw,28px);font-weight:800;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15;text-align:center;margin-bottom:40px">Average Association Growth Rates</h3><div style="display:flex;justify-content:center;align-items:flex-end;gap:48px;height:220px;padding:0 32px;border-bottom:1px solid #E3DDD2"><div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;max-width:160px"><p style="font-size:clamp(22px,2.4vw,28px);font-weight:900;color:#2F2F2F;letter-spacing:-0.02em">0.98%</p><div style="width:100%;height:22px;background:#D8D2C4;border-radius:8px 8px 0 0;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.04)"></div></div><div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;max-width:160px"><p style="font-size:clamp(30px,3.2vw,40px);font-weight:900;color:#2F2F2F;letter-spacing:-0.02em">8.68%</p><div style="width:100%;height:190px;background:linear-gradient(180deg,#FBC02D 0%,#F9A825 35%,#F47C2C 100%);border-radius:10px 10px 0 0;box-shadow:0 4px 16px rgba(244,124,44,0.25)"></div></div></div><div style="display:flex;justify-content:center;gap:48px;padding:16px 32px 0"><p style="flex:1;max-width:160px;text-align:center;font-size:14px;color:#6E6E6E;line-height:1.4">Industry<br>Average</p><p style="flex:1;max-width:160px;text-align:center;font-size:14px;font-weight:700;color:#2F2F2F;line-height:1.4">Our Clients<br>in Year 1</p></div></div></div></section>';if(heroSection){heroSection.insertAdjacentHTML('afterend',featureHTML);}else{ctaSection.insertAdjacentHTML('beforebegin',featureHTML);}}
    if(!document.querySelector('.roi-headline-stats')){ctaSection.insertAdjacentHTML('beforebegin','<section class="roi-headline-stats pf-section-dark" style="background:#1A1713;padding:96px 48px"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Headline Numbers</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">Impact at a glance.</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:40px"><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$100M+</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">in total client revenue growth</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">72%</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">of declining orgs reversed course</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">2x</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">average annual growth post-PropFuel</p></div></div></div></section>');}
    if(!document.querySelector('.roi-case-spotlight')){var prev2=document.querySelector('.roi-headline-stats');var s2='<section class="roi-case-spotlight" style="padding:96px 48px;background:#F6F2E8"><div style="max-width:1100px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Case Study Spotlight</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Proof from the front lines.</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div class="pf-card" style="background:#fff;border-radius:20px;padding:36px 28px"><p style="font-size:13px;font-weight:700;color:#F9A825;margin-bottom:8px">AAP</p><h4 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">80% Win-Back Rate</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">AAP used PropFuel to re-engage lapsed members with personalized outreach. The result: an 80% win-back rate on targeted campaigns, recovering thousands of members who had previously gone silent.</p></div><div class="pf-card" style="background:#fff;border-radius:20px;padding:36px 28px"><p style="font-size:13px;font-weight:700;color:#F9A825;margin-bottom:8px">AMA</p><h4 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">$304K in Membership Revenue</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">AMA captured 7,416 contacts through website engagement and converted them into $304K in membership revenue \u2014 turning anonymous website visitors into paying members.</p></div><div class="pf-card" style="background:#fff;border-radius:20px;padding:36px 28px"><p style="font-size:13px;font-weight:700;color:#F9A825;margin-bottom:8px">VECCS</p><h4 style="font-size:20px;font-weight:700;color:#2F2F2F;margin-bottom:12px">$315K from Website Widget</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">VECCS generated $315K in conference revenue from a single website widget \u2014 approximately 10% of all conference registrations came through PropFuel engagement.</p></div></div></div></section>';if(prev2){prev2.insertAdjacentHTML('afterend',s2);}else{ctaSection.insertAdjacentHTML('beforebegin',s2);}}
    if(!document.querySelector('.roi-turnaround')){var prev3=document.querySelector('.roi-case-spotlight');var s3='<section class="roi-turnaround pf-section-dark" style="background:#1A1713;padding:96px 48px"><div style="max-width:1100px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">The Turnaround</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15">Before and after PropFuel.</h2></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:48px"><div style="background:rgba(255,255,255,.05);border-radius:20px;padding:40px 32px;border:1px solid rgba(255,255,255,.08)"><h3 style="font-size:20px;font-weight:700;color:#F47C2C;margin-bottom:24px">Before PropFuel</h3><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:16px"><li style="display:flex;align-items:flex-start;gap:12px;font-size:15px;color:#8C8479;line-height:1.6"><span style="color:#F47C2C;font-size:18px;flex-shrink:0">\u2717</span>Batch-and-blast emails with 1\u20132% engagement</li><li style="display:flex;align-items:flex-start;gap:12px;font-size:15px;color:#8C8479;line-height:1.6"><span style="color:#F47C2C;font-size:18px;flex-shrink:0">\u2717</span>No insight into why members leave</li><li style="display:flex;align-items:flex-start;gap:12px;font-size:15px;color:#8C8479;line-height:1.6"><span style="color:#F47C2C;font-size:18px;flex-shrink:0">\u2717</span>Anonymous website traffic with zero conversion</li><li style="display:flex;align-items:flex-start;gap:12px;font-size:15px;color:#8C8479;line-height:1.6"><span style="color:#F47C2C;font-size:18px;flex-shrink:0">\u2717</span>Renewal campaigns that feel transactional</li></ul></div><div style="background:rgba(251,192,45,.06);border-radius:20px;padding:40px 32px;border:1px solid rgba(249,168,37,.2)"><h3 style="font-size:20px;font-weight:700;color:#FBC02D;margin-bottom:24px">After PropFuel</h3><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:16px"><li style="display:flex;align-items:flex-start;gap:12px;font-size:15px;color:#8C8479;line-height:1.6"><span style="color:#FBC02D;font-size:18px;flex-shrink:0">\u2713</span>8.68% avg response rate (5\u20136x industry avg)</li><li style="display:flex;align-items:flex-start;gap:12px;font-size:15px;color:#8C8479;line-height:1.6"><span style="color:#FBC02D;font-size:18px;flex-shrink:0">\u2713</span>Real-time signal on member intent and satisfaction</li><li style="display:flex;align-items:flex-start;gap:12px;font-size:15px;color:#8C8479;line-height:1.6"><span style="color:#FBC02D;font-size:18px;flex-shrink:0">\u2713</span>Website visitors converted into identified prospects</li><li style="display:flex;align-items:flex-start;gap:12px;font-size:15px;color:#8C8479;line-height:1.6"><span style="color:#FBC02D;font-size:18px;flex-shrink:0">\u2713</span>Personalized renewal conversations that drive retention</li></ul></div></div></div></section>';if(prev3){prev3.insertAdjacentHTML('afterend',s3);}else{ctaSection.insertAdjacentHTML('beforebegin',s3);}}
    if(!document.querySelector('.roi-results-grid')){var prev4=document.querySelector('.roi-turnaround');var s4='<section class="roi-results-grid" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:1200px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">More Results</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Results across every use case.</h2></div><h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:20px;text-transform:uppercase;letter-spacing:0.06em">Renewals &amp; Retention</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px"><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">80%</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">AAP Win-Back Rate</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">Lapsed members recovered through targeted outreach</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">12%</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">Avg Retention Lift</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">Renewal rate improvement across PropFuel clients</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$650K</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">Renewal Revenue Recovered</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">Through renewal and win-back campaigns</p></div></div><h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:20px;text-transform:uppercase;letter-spacing:0.06em">Win-Back</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px"><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">66%</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">Win-Back Rate</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">Lapsed members re-engaged through PropFuel</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">2,000+</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">Members Recovered (AAP)</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">Lapsed members brought back through personalized campaigns</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$304K</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">AMA Membership Revenue</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">From website engagement converting visitors to members</p></div></div><h3 style="font-size:16px;font-weight:700;color:#2F2F2F;margin-bottom:20px;text-transform:uppercase;letter-spacing:0.06em">Acquisition &amp; Events</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px"><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$315K</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">VECCS Conference Revenue</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">From a single website widget \u2014 10% of all registrations</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">7,416</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">AMA Contacts Captured</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">Via website engagement, fueling membership pipeline</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:28px 24px"><p style="font-size:clamp(28px,3vw,36px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">830%</p><p style="font-size:13px;font-weight:700;color:#2F2F2F;margin-top:6px">Webinar Registration Increase</p><p style="font-size:13px;color:#6E6E6E;line-height:1.5;margin-top:4px">Using PropFuel engagement to drive event sign-ups</p></div></div></div></section>';if(prev4){prev4.insertAdjacentHTML('afterend',s4);}else{ctaSection.insertAdjacentHTML('beforebegin',s4);}}
    if(!document.querySelector('.roi-big-swings')){var prev5=document.querySelector('.roi-results-grid');var s5='<section class="roi-big-swings pf-section-dark" style="background:#1A1713;padding:96px 48px"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Big Swings</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#EDE8DF;letter-spacing:-0.02em;line-height:1.15;margin-bottom:56px">The outliers that prove the model.</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px"><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">100%+</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">ROI within the first year for top-performing clients</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$10.9M</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">Largest single-client revenue impact tracked</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">830%</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">Increase in webinar registrations via PropFuel</p></div></div></div></section>';if(prev5){prev5.insertAdjacentHTML('afterend',s5);}else{ctaSection.insertAdjacentHTML('beforebegin',s5);}}
    var ctaHeading=document.querySelector('.pf-cta-heading');if(ctaHeading){ctaHeading.innerHTML='Ready to See<br>Your <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Numbers?</span>';}var ctaSub2=document.querySelector('.pf-cta-sub');if(ctaSub2){ctaSub2.textContent='Join 100+ associations driving measurable revenue growth with PropFuel.';}
    var ctaSecBtn=document.querySelector('.pf-cta-section .pf-btn-secondary, .pf-cta-section .w-button:not(.pf-btn-primary)');if(ctaSecBtn&&ctaSecBtn.textContent.trim()==='Learn More'){ctaSecBtn.textContent='See Case Studies';ctaSecBtn.href='/client-success/case-studies';}
    document.querySelectorAll('.pf-section').forEach(function(s){s.style.display='none';});
  }

  // ─────────────────────────────────────────
  // FIX CASE STUDIES PAGE
  // ─────────────────────────────────────────
  // Wire case study cards on /client-success/case-studies to their real /case-studies/{slug}
  // detail pages. Parallels the blog/webinar wiring — if Webflow's designer binds card hrefs
  // to a static "#" or "/client-success/case-studies" placeholder, swap in the real slug.
  function wireCaseStudyCardHrefs() {
    if (!/^\/client-success\/case-studies\/?$/.test(window.location.pathname)) return;
    var cards = document.querySelectorAll('.w-dyn-item');
    if (!cards.length) return;
    var anchors = [];
    cards.forEach(function(card){
      var a = card.matches && card.matches('a') ? card : card.querySelector('a');
      if (a) anchors.push(a);
    });
    if (!anchors.length) return;
    var needsFixing = anchors.some(function(a){
      var h = a.getAttribute('href') || '';
      return !h || h === '#' || /^\/client-success\/case-studies\/?$/.test(h) || /^\/case-studies\/?$/.test(h);
    });
    if (!needsFixing) return;
    fetch('https://alexhively.github.io/propfuel-webflow-custom/js/case-study-slugs.json?v=1')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        if (!data || !Array.isArray(data.items)) return;
        var prefix = data.urlPrefix || '/case-studies/';
        function normTitle(s) {
          return String(s || '')
            .toLowerCase()
            .replace(/[‘’“”'"`]/g, '')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        var bySlug = {};
        data.items.forEach(function(p){ bySlug[normTitle(p.name)] = p.slug; });
        var fixed = 0, missed = [];
        cards.forEach(function(card){
          var a = card.matches && card.matches('a') ? card : card.querySelector('a');
          if (!a) return;
          var titleEl = card.querySelector('.case-study-title, h3, h4, h2, [class*="title"], [class*="heading"]');
          var title = titleEl ? titleEl.textContent : '';
          var key = normTitle(title);
          var slug = bySlug[key];
          if (slug) {
            a.setAttribute('href', prefix + slug);
            fixed++;
          } else if (title) {
            missed.push(title);
          }
        });
        if (missed.length && window.console) {
          console.log('[pf] case study hrefs: fixed', fixed, 'of', anchors.length, '; no slug match for:', missed);
        }
      })
      .catch(function(){});
  }

  function fixCaseStudies() {
    // Only run on the case studies listing page, not individual case study templates
    if (!/^\/client-success\/case-studies\/?$/.test(window.location.pathname)) return;
    // If Webflow CMS has rendered real case study items, defer to the CMS template but wire up hrefs
    if (document.querySelector('.w-dyn-item')) { wireCaseStudyCardHrefs(); return; }
    var heroLabel=document.querySelector('.pf-page-hero-label');if(heroLabel){heroLabel.textContent='Client Success';}else{var heroTitle=document.querySelector('.pf-page-hero-title');if(heroTitle){var parent=heroTitle.parentElement;if(!parent.querySelector('.pf-hero-label-injected')){var label=document.createElement('p');label.className='pf-hero-label-injected fade-up';label.style.cssText='display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)';label.textContent='Client Success';parent.insertBefore(label,heroTitle);}}}
    var heroHeading=document.querySelector('.pf-page-hero-title');if(heroHeading){heroHeading.innerHTML='Real Results from Real Associations';}
    var heroSub=document.querySelector('.pf-page-hero-sub');if(heroSub){heroSub.textContent='See how associations like yours are using PropFuel to drive engagement, retention, and revenue.';}
    if(heroHeading){var heroParent=heroHeading.parentElement;if(!heroParent.querySelector('.pf-hero-btns-injected')){var btnWrap=document.createElement('div');btnWrap.className='pf-hero-btns-injected fade-up';btnWrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';btnWrap.innerHTML='<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Get a Demo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/roi" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">See ROI Numbers</a>';var sub=heroParent.querySelector('.pf-page-hero-sub');if(sub){sub.parentNode.insertBefore(btnWrap,sub.nextSibling);}else{heroParent.appendChild(btnWrap);}}}
    var ctaSection=document.querySelector('.pf-cta-section, [class*="cta-section"]');if(!ctaSection)return;
    if(!document.querySelector('.cs-wrap')){var esc=function(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};ctaSection.insertAdjacentHTML('beforebegin','<section class="cs-wrap" style="padding:96px 48px;background:#F6F2E8"><div style="max-width:1200px;margin:0 auto"><div class="cs-featured-slot"></div><div style="text-align:center;margin:64px 0 40px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">All Case Studies</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Real results. Real associations.</h2></div><div class="cs-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"></div></div></section>');fetch('https://alexhively.github.io/propfuel-webflow-custom/js/case-studies.json?v=1').then(function(r){return r.json();}).then(function(cs){if(!Array.isArray(cs)||!cs.length)return;var featured=cs.find(function(c){return c.featured;})||cs[0];var rest=cs.filter(function(c){return c!==featured;});var fSlot=document.querySelector('.cs-featured-slot');if(fSlot){fSlot.innerHTML='<a href="/case-studies/'+esc(featured.slug)+'" style="display:block;text-decoration:none;color:inherit"><div style="background:#fff;border-radius:24px;padding:48px 40px;box-shadow:0 4px 24px rgba(0,0,0,.06);display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:center;transition:transform .2s ease,box-shadow .2s ease" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 12px 36px rgba(0,0,0,.1)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 4px 24px rgba(0,0,0,.06)\'"><div><p style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#F9A825;margin-bottom:12px">Featured \u2014 '+esc(featured.org)+'</p><h3 style="font-size:clamp(24px,3vw,32px);font-weight:800;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.2;margin-bottom:20px">'+esc(featured.name)+'</h3><p style="font-size:16px;color:#6E6E6E;line-height:1.65;margin-bottom:28px">'+esc(featured.summary)+'</p><div style="display:flex;gap:32px;flex-wrap:wrap">'+featured.kpis.map(function(k){return '<div><p style="font-size:clamp(24px,2.6vw,32px);font-weight:900;letter-spacing:-0.02em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">'+esc(k.value)+'</p><p style="font-size:12px;color:#6E6E6E;margin-top:6px">'+esc(k.label)+'</p></div>';}).join('')+'</div><p style="font-size:13px;font-weight:600;color:#F47C2C;margin-top:28px">Read the full case study \u2192</p></div><div style="background:#EBE6DA;border-radius:20px;padding:36px 32px"><p style="font-size:42px;color:#F9A825;line-height:1;margin-bottom:12px">\u201C</p><p style="font-size:16px;font-weight:600;color:#2F2F2F;font-style:italic;line-height:1.5;margin-bottom:16px">'+esc(featured.quote)+'</p><p style="font-size:13px;color:#6E6E6E;font-style:normal">\u2014 '+esc(featured.org)+'</p></div></div></a>';}var grid=document.querySelector('.cs-grid');if(grid){var html='';rest.forEach(function(c){var kpiLine=c.kpis.slice(0,2).map(function(k){return '<span style="display:inline-flex;align-items:center;gap:6px"><strong style="color:#F47C2C;font-weight:800">'+esc(k.value)+'</strong><span style="color:#6E6E6E">'+esc(k.label)+'</span></span>';}).join('<span style="color:#D0C9B8;margin:0 10px">\u2022</span>');html+='<a href="/case-studies/'+esc(c.slug)+'" class="pf-card" style="background:#fff;border-radius:20px;padding:32px 28px;display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:transform .2s ease,box-shadow .2s ease;border:1px solid rgba(227,221,210,0.6)" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 10px 28px rgba(47,47,47,.08)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'none\'"><p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#F9A825;margin-bottom:10px">'+esc(c.org)+'</p><h4 style="font-size:18px;font-weight:800;color:#2F2F2F;line-height:1.3;margin-bottom:12px;letter-spacing:-0.01em">'+esc(c.name)+'</h4><p style="font-size:14px;color:#6E6E6E;line-height:1.5;margin-bottom:18px;flex:1">'+esc(c.subtitle)+'</p><div style="font-size:13px;color:#2F2F2F;padding-top:16px;border-top:1px solid #EBE6DA">'+kpiLine+'</div><p style="font-size:13px;font-weight:600;color:#F47C2C;margin-top:16px">Read more \u2192</p></a>';});grid.innerHTML=html;}}).catch(function(){});}
    if(!document.querySelector('.cs-aggregate')){var csWrap=document.querySelector('.cs-wrap');var s2='<section class="cs-aggregate pf-section-dark" style="background:#1A1713;padding:96px 48px;width:100vw;position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw"><div style="max-width:1200px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">By the numbers</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#F6F2E8;letter-spacing:-0.02em;line-height:1.15">Real results across 100+ associations.</h2></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px"><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$100M+</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">Revenue influenced</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">100+</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">Associations served</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">8.68%</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">Average response rate</p></div><div style="text-align:center"><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Since 2019</p><p style="font-size:14px;color:#8C8479;line-height:1.5;margin-top:8px">Serving the association space</p></div></div></div></section>';if(csWrap){csWrap.insertAdjacentHTML('afterend',s2);}else{ctaSection.insertAdjacentHTML('beforebegin',s2);}}
    var ctaHeading=document.querySelector('.pf-cta-heading');if(ctaHeading){ctaHeading.innerHTML='Ready to See Results<br>Like <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">These?</span>';}var ctaSub2=document.querySelector('.pf-cta-sub');if(ctaSub2){ctaSub2.textContent='Join 100+ associations already driving measurable results with PropFuel.';}
    var ctaSecBtn=document.querySelector('.pf-cta-section .pf-btn-secondary, .pf-cta-section .w-button:not(.pf-btn-primary)');if(ctaSecBtn&&ctaSecBtn.textContent.trim()==='Learn More'){ctaSecBtn.textContent='Talk to Sales';ctaSecBtn.href='/book-a-demo';}
    document.querySelectorAll('.pf-section').forEach(function(s){s.style.display='none';});
  }

  // ─────────────────────────────────────────
  // FIX TESTIMONIALS PAGE
  // ─────────────────────────────────────────
  function fixTestimonials() {
    if (window.location.pathname.indexOf('client-success/testimonials') === -1) return;
    var heroLabel=document.querySelector('.pf-page-hero-label');if(heroLabel){heroLabel.textContent='Testimonials';}else{var heroTitle=document.querySelector('.pf-page-hero-title');if(heroTitle){var parent=heroTitle.parentElement;if(!parent.querySelector('.pf-hero-label-injected')){var label=document.createElement('p');label.className='pf-hero-label-injected fade-up';label.style.cssText='display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)';label.textContent='Testimonials';parent.insertBefore(label,heroTitle);}}}
    var heroHeading=document.querySelector('.pf-page-hero-title');if(heroHeading){heroHeading.innerHTML='What Our Clients Say About PropFuel';}
    var heroSub=document.querySelector('.pf-page-hero-sub');if(heroSub){heroSub.textContent='Hear directly from the associations using PropFuel every day.';}
    if(heroHeading){var heroParent=heroHeading.parentElement;if(!heroParent.querySelector('.pf-hero-btns-injected')){var btnWrap=document.createElement('div');btnWrap.className='pf-hero-btns-injected fade-up';btnWrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';btnWrap.innerHTML='<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Get a Demo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/client-success/case-studies" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">See Case Studies</a>';var sub=heroParent.querySelector('.pf-page-hero-sub');if(sub){sub.parentNode.insertBefore(btnWrap,sub.nextSibling);}else{heroParent.appendChild(btnWrap);}}}
    var ctaSection=document.querySelector('.pf-cta-section, [class*="cta-section"]');if(!ctaSection)return;
    document.querySelectorAll('.tm-stats-band').forEach(function(n){n.remove();});
    if(!document.querySelector('.tm-featured-quote')){var s='<section class="tm-featured-quote pf-section-dark" style="background:#1A1713;padding:112px 48px;width:100vw;position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw"><div style="max-width:860px;margin:0 auto;text-align:center"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:20px">Client Story</p><p style="font-size:72px;font-weight:900;line-height:0.8;margin-bottom:20px;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">\u201C</p><p style="font-size:clamp(22px,3vw,30px);font-weight:600;color:#F6F2E8;line-height:1.5;font-style:italic;margin-bottom:28px">PropFuel has completely changed the way we think about member engagement. We\u2019re not just sending emails anymore \u2014 we\u2019re having real conversations with our members, and the data we\u2019re getting back is invaluable.</p><p style="font-size:15px;font-weight:700;color:#F6F2E8">\u2014 Margret Atkinson</p><p style="font-size:13px;color:#8C8479;margin-top:4px">ISTE</p></div></section>';ctaSection.insertAdjacentHTML('beforebegin',s);}
    if(!document.querySelector('.tm-famewall')){var prev2=document.querySelector('.tm-featured-quote');var s2='<section class="tm-famewall" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:1200px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Wall of Love</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">What our clients are saying.</h2></div><div class="famewall-embed" data-src="propfuel-nzjj" data-format="grid" style="width:100%;min-height:300px"></div></div></div></section>';if(prev2){prev2.insertAdjacentHTML('afterend',s2);}else{ctaSection.insertAdjacentHTML('beforebegin',s2);}if(!document.querySelector('script[src*="embed.famewall.io"]')){var fw=document.createElement('script');fw.src='https://embed.famewall.io/frame.js';fw.async=true;document.body.appendChild(fw);}}
    document.querySelectorAll('.tm-quotes-grid').forEach(function(n){n.remove();});
    var ctaHeading=document.querySelector('.pf-cta-heading');if(ctaHeading){ctaHeading.innerHTML='Ready to<br>Join <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Them?</span>';}var ctaSub2=document.querySelector('.pf-cta-sub');if(ctaSub2){ctaSub2.textContent='See why 100+ associations trust PropFuel to drive member engagement and revenue.';}
    var ctaSecBtn=document.querySelector('.pf-cta-section .pf-btn-secondary, .pf-cta-section .w-button:not(.pf-btn-primary)');if(ctaSecBtn&&ctaSecBtn.textContent.trim()==='Learn More'){ctaSecBtn.textContent='See the ROI';ctaSecBtn.href='/roi';}
    document.querySelectorAll('.pf-section').forEach(function(s){s.style.display='none';});
  }

  // ─────────────────────────────────────────
  // FIX CUSTOMERS PAGE
  // ─────────────────────────────────────────
  function fixCustomers() {
    // Only run on the customers listing page, not individual customer templates
    if (!/^\/client-success\/customers\/?$/.test(window.location.pathname)) return;
    // If Webflow CMS has rendered real customer/logo items, defer to the CMS template
    if (document.querySelector('.w-dyn-item')) return;
    var heroLabel=document.querySelector('.pf-page-hero-label');if(heroLabel){heroLabel.textContent='Customer Wall';}else{var heroTitle=document.querySelector('.pf-page-hero-title');if(heroTitle){var parent=heroTitle.parentElement;if(!parent.querySelector('.pf-hero-label-injected')){var label=document.createElement('p');label.className='pf-hero-label-injected fade-up';label.style.cssText='display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)';label.textContent='Customer Wall';parent.insertBefore(label,heroTitle);}}}
    var heroHeading=document.querySelector('.pf-page-hero-title');if(heroHeading){heroHeading.innerHTML='Trusted by 330+ Associations';}
    var heroSub=document.querySelector('.pf-page-hero-sub');if(heroSub){heroSub.textContent='From the largest medical associations to niche professional societies, PropFuel powers engagement for organizations of every size.';}
    if(heroHeading){var heroParent=heroHeading.parentElement;if(!heroParent.querySelector('.pf-hero-btns-injected')){var btnWrap=document.createElement('div');btnWrap.className='pf-hero-btns-injected fade-up';btnWrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';btnWrap.innerHTML='<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Get a Demo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/client-success/case-studies" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">See Case Studies</a>';var sub=heroParent.querySelector('.pf-page-hero-sub');if(sub){sub.parentNode.insertBefore(btnWrap,sub.nextSibling);}else{heroParent.appendChild(btnWrap);}}}
    var ctaSection=document.querySelector('.pf-cta-section, [class*="cta-section"]');if(!ctaSection)return;
    // Inject shell + async fetch all customer logos from the CMS snapshot (js/customer-logos.json)
    if(!document.querySelector('.cu-logo-grid')){
      var shellHTML='<section class="cu-logo-grid" style="padding:32px 48px 96px;background:transparent"><div style="max-width:1200px;margin:0 auto"><div class="cu-logo-grid-inner" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:20px;align-items:center;justify-items:center"></div></div></section>';
      ctaSection.insertAdjacentHTML('beforebegin',shellHTML);
      fetch('https://alexhively.github.io/propfuel-webflow-custom/js/customer-logos.json?v=1')
        .then(function(r){return r.json();})
        .then(function(logos){
          var grid=document.querySelector('.cu-logo-grid-inner');if(!grid)return;
          var esc=function(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
          var html='';
          logos.forEach(function(l){
            var openTag=l.w?'<a href="'+esc(l.w)+'" target="_blank" rel="noopener noreferrer"':'<div';
            var closeTag=l.w?'</a>':'</div>';
            html+=openTag+' style="display:flex;align-items:center;justify-content:center;height:100px;padding:12px;text-decoration:none"><img loading="lazy" src="'+esc(l.u)+'" alt="'+esc(l.n)+'" style="max-height:60px;max-width:140px;object-fit:contain">'+closeTag;
          });
          grid.innerHTML=html;
        })
        .catch(function(){});
    }
    // Hide the colleague\'s 5 empty static logo-card placeholders if present
    var oldStaticLogos=document.querySelector('.logo-card-grid');
    if(oldStaticLogos){var sec=oldStaticLogos.closest('section');if(sec)sec.style.display='none';else oldStaticLogos.style.display='none';}
    if(!document.querySelector('.cu-stats-band')){var prev=document.querySelector('.cu-logo-grid');var s='<section class="cu-stats-band pf-section-dark" style="background:#1A1713;padding:96px 48px"><div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center"><div><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">330+</p><p style="font-size:14px;color:#8C8479;margin-top:8px">Associations served</p></div><div><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">500K+</p><p style="font-size:14px;color:#8C8479;margin-top:8px">Members engaged</p></div><div><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">40+</p><p style="font-size:14px;color:#8C8479;margin-top:8px">AMS integrations</p></div><div><p style="font-size:clamp(40px,5vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Since 2019</p><p style="font-size:14px;color:#8C8479;margin-top:8px">Serving the association space</p></div></div></section>';if(prev){prev.insertAdjacentHTML('afterend',s);}else{ctaSection.insertAdjacentHTML('beforebegin',s);}}
    var ctaHeading=document.querySelector('.pf-cta-heading');if(ctaHeading){ctaHeading.innerHTML='Join 330+ Associations<br>on <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">PropFuel</span>';}var ctaSub2=document.querySelector('.pf-cta-sub');if(ctaSub2){ctaSub2.textContent='See why hundreds of associations trust PropFuel to engage their members and drive revenue.';}
    var ctaSecBtn=document.querySelector('.pf-cta-section .pf-btn-secondary, .pf-cta-section .w-button:not(.pf-btn-primary)');if(ctaSecBtn&&ctaSecBtn.textContent.trim()==='Learn More'){ctaSecBtn.textContent='Talk to Sales';ctaSecBtn.href='/book-a-demo';}
    document.querySelectorAll('.pf-section').forEach(function(s){s.style.display='none';});
  }

  // ─────────────────────────────────────────
  // FIX IMPLEMENTATION PAGE
  // ─────────────────────────────────────────
  function fixImplementation() {
    if (window.location.pathname.indexOf('client-success/implementation') === -1) return;
    var heroLabel=document.querySelector('.pf-page-hero-label');if(heroLabel){heroLabel.textContent='Getting Started';}else{var heroTitle=document.querySelector('.pf-page-hero-title');if(heroTitle){var parent=heroTitle.parentElement;if(!parent.querySelector('.pf-hero-label-injected')){var label=document.createElement('p');label.className='pf-hero-label-injected fade-up';label.style.cssText='display:inline-flex;align-items:center;padding:8px 20px;border-radius:100px;background:rgba(251,192,45,0.08);border:1px solid rgba(249,168,37,0.35);font-size:13px;font-weight:600;color:#2F2F2F;letter-spacing:0.04em;margin-bottom:48px;box-shadow:0 2px 8px rgba(120,110,95,0.06)';label.textContent='Getting Started';parent.insertBefore(label,heroTitle);}}}
    var heroHeading=document.querySelector('.pf-page-hero-title');if(heroHeading){heroHeading.innerHTML='Live in Weeks, Not Months';}
    var heroSub=document.querySelector('.pf-page-hero-sub');if(heroSub){heroSub.textContent='PropFuel is designed for fast time-to-value. Most associations are live and seeing results within 2\u20133 weeks.';}
    if(heroHeading){var heroParent=heroHeading.parentElement;if(!heroParent.querySelector('.pf-hero-btns-injected')){var btnWrap=document.createElement('div');btnWrap.className='pf-hero-btns-injected fade-up';btnWrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px';btnWrap.innerHTML='<a href="/book-a-demo" class="pf-btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;border:none;box-shadow:0 4px 16px rgba(240,90,40,0.2);transition:box-shadow .3s ease">Get Started <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a><a href="/client-success/case-studies" style="display:inline-flex;align-items:center;gap:8px;padding:15px 35px;font:600 15px/1 \'DM Sans\',sans-serif;border-radius:100px;text-decoration:none;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,0.35);transition:border-color .25s ease,box-shadow .25s ease">See Case Studies</a>';var sub=heroParent.querySelector('.pf-page-hero-sub');if(sub){sub.parentNode.insertBefore(btnWrap,sub.nextSibling);}else{heroParent.appendChild(btnWrap);}}}
    var ctaSection=document.querySelector('.pf-cta-section, [class*="cta-section"]');if(!ctaSection)return;
    if(!document.querySelector('.im-quick-stats')){ctaSection.insertAdjacentHTML('beforebegin','<section class="im-quick-stats pf-section-dark" style="background:#1A1713;padding:64px 48px"><div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;text-align:center"><div><p style="font-size:clamp(36px,4vw,48px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">2\u20133 Weeks</p><p style="font-size:14px;color:#8C8479;margin-top:8px">Average time to launch</p></div><div><p style="font-size:clamp(36px,4vw,48px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">10\u201345 Min</p><p style="font-size:14px;color:#8C8479;margin-top:8px">AMS integration setup</p></div><div><p style="font-size:clamp(36px,4vw,48px);font-weight:900;letter-spacing:-0.03em;line-height:1;background:linear-gradient(to top,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">&lt;3 Hours</p><p style="font-size:14px;color:#8C8479;margin-top:8px">Total staff time required</p></div></div></section>');}
    if(!document.querySelector('.im-timeline')){var prev=document.querySelector('.im-quick-stats');var s='<section class="im-timeline" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:1100px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Implementation Timeline</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Four phases to full launch.</h2></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px"><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px 24px;border-top:4px solid #FBC02D"><p style="font-size:12px;font-weight:700;color:#F9A825;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Phase 1 \u2014 Week 1</p><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:16px">Connect &amp; Configure</h4><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px"><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#FBC02D;flex-shrink:0">\u2022</span>AMS integration (10\u201345 minutes)</li><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#FBC02D;flex-shrink:0">\u2022</span>Email domain configuration (DKIM, SPF)</li><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#FBC02D;flex-shrink:0">\u2022</span>Member data sync verification</li></ul></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px 24px;border-top:4px solid #F9A825"><p style="font-size:12px;font-weight:700;color:#F9A825;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Phase 2 \u2014 Weeks 1\u20132</p><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:16px">Strategy &amp; Build</h4><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px"><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F9A825;flex-shrink:0">\u2022</span>Campaign strategy session with CSM</li><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F9A825;flex-shrink:0">\u2022</span>Select and customize from 70+ Blueprints</li><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F9A825;flex-shrink:0">\u2022</span>Configure automation rules and routing</li></ul></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px 24px;border-top:4px solid #F47C2C"><p style="font-size:12px;font-weight:700;color:#F9A825;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Phase 3 \u2014 Weeks 2\u20133</p><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:16px">Launch &amp; Learn</h4><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px"><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F47C2C;flex-shrink:0">\u2022</span>Deploy first campaigns to live audience</li><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F47C2C;flex-shrink:0">\u2022</span>Monitor response rates and engagement data</li><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F47C2C;flex-shrink:0">\u2022</span>Refine messaging based on real results</li></ul></div><div class="pf-card" style="background:#F6F2E8;border-radius:20px;padding:32px 24px;border-top:4px solid #F05A28"><p style="font-size:12px;font-weight:700;color:#F9A825;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Phase 4 \u2014 Months 2\u20133</p><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:16px">Expand &amp; Optimize</h4><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px"><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F05A28;flex-shrink:0">\u2022</span>Add new use cases (win-back, events, website)</li><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F05A28;flex-shrink:0">\u2022</span>Expand to additional channels (SMS, website)</li><li style="font-size:14px;color:#6E6E6E;line-height:1.5;display:flex;align-items:flex-start;gap:8px"><span style="color:#F05A28;flex-shrink:0">\u2022</span>Optimize campaigns with engagement insights</li></ul></div></div></div></section>';if(prev){prev.insertAdjacentHTML('afterend',s);}else{ctaSection.insertAdjacentHTML('beforebegin',s);}}
    if(!document.querySelector('.im-what-you-get')){var prev2=document.querySelector('.im-timeline');var s2='<section class="im-what-you-get" style="padding:96px 48px;background:#F6F2E8"><div style="max-width:1100px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">What You Get</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">Built-in support at every step.</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div class="pf-card" style="background:#fff;border-radius:20px;padding:36px 28px"><div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Dedicated CSM</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">A dedicated Customer Success Manager guides you through onboarding, strategy, and ongoing optimization. They know the association space and help you get the most out of PropFuel.</p></div><div class="pf-card" style="background:#fff;border-radius:20px;padding:36px 28px"><div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">70+ Blueprints</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Pre-built campaign templates for every use case \u2014 renewals, win-back, onboarding, events, data capture, and more. Customize them to match your voice and goals.</p></div><div class="pf-card" style="background:#fff;border-radius:20px;padding:36px 28px"><div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#FBC02D,#F47C2C);display:flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><h4 style="font-size:18px;font-weight:700;color:#2F2F2F;margin-bottom:12px">Managed Services</h4><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Don\u2019t have the bandwidth to manage campaigns? PropFuel\u2019s Managed Services team builds, deploys, and optimizes campaigns on your behalf \u2014 so you get results without the lift.</p></div></div></div></section>';if(prev2){prev2.insertAdjacentHTML('afterend',s2);}else{ctaSection.insertAdjacentHTML('beforebegin',s2);}}
    if(!document.querySelector('.im-concerns')){var prev3=document.querySelector('.im-what-you-get');var s3='<section class="im-concerns" style="padding:96px 48px;background:#EBE6DA"><div style="max-width:900px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">Common Concerns</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">We hear you.</h2></div><div style="display:flex;flex-direction:column;gap:24px"><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:32px 28px"><p style="font-size:15px;font-weight:700;color:#F47C2C;margin-bottom:8px">\u201CWe don\u2019t have the staff bandwidth for another tool.\u201D</p><p style="font-size:15px;color:#6E6E6E;line-height:1.6">PropFuel is designed to save staff time, not add to it. With 70+ pre-built Blueprints, managed services, and automation that runs in the background, most clients spend less than 3 hours total on setup \u2014 and ongoing management is minimal.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:32px 28px"><p style="font-size:15px;font-weight:700;color:#F47C2C;margin-bottom:8px">\u201COur AMS integration sounds complicated.\u201D</p><p style="font-size:15px;color:#6E6E6E;line-height:1.6">PropFuel integrates with 60+ AMS platforms. Most integrations take 10\u201345 minutes using our guided setup wizard. No IT department required. Two-way sync means member data flows in and engagement data flows back automatically.</p></div><div class="pf-card" style="background:#F6F2E8;border-radius:16px;padding:32px 28px"><p style="font-size:15px;font-weight:700;color:#F47C2C;margin-bottom:8px">\u201CWhat if our members don\u2019t respond?\u201D</p><p style="font-size:15px;color:#6E6E6E;line-height:1.6">Our average response rate is 8.68% \u2014 that\u2019s 5\u20136x the industry average. PropFuel\u2019s approach (short, targeted questions instead of long surveys) is specifically designed to maximize engagement. Top campaigns regularly hit 25\u201344% response rates.</p></div></div></div></section>';if(prev3){prev3.insertAdjacentHTML('afterend',s3);}else{ctaSection.insertAdjacentHTML('beforebegin',s3);}}
    if(!document.querySelector('.im-testimonials')){var prev4=document.querySelector('.im-concerns');var s4='<section class="im-testimonials" style="padding:96px 48px;background:#F6F2E8"><div style="max-width:1100px;margin:0 auto"><div style="text-align:center;margin-bottom:56px"><p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F9A825;margin-bottom:16px">What Clients Say</p><h2 style="font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-0.02em;line-height:1.15">The onboarding experience.</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div class="pf-card" style="background:#fff;border-radius:16px;padding:32px 28px;border-left:4px solid #FBC02D"><p style="font-size:15px;color:#2F2F2F;font-style:italic;line-height:1.6;margin-bottom:16px">\u201CImplementation was seamless. We were live in two weeks and seeing results by week three.\u201D</p><p style="font-size:14px;font-weight:700;color:#2F2F2F">\u2014 Membership Director</p><p style="font-size:13px;color:#6E6E6E;margin-top:2px">NAPNAP</p></div><div class="pf-card" style="background:#fff;border-radius:16px;padding:32px 28px;border-left:4px solid #FBC02D"><p style="font-size:15px;color:#2F2F2F;font-style:italic;line-height:1.6;margin-bottom:16px">\u201CThe PropFuel team held our hand through the entire process. It was the easiest software rollout we\u2019ve ever done.\u201D</p><p style="font-size:14px;font-weight:700;color:#2F2F2F">\u2014 Executive Director</p><p style="font-size:13px;color:#6E6E6E;margin-top:2px">AAMFT</p></div><div class="pf-card" style="background:#fff;border-radius:16px;padding:32px 28px;border-left:4px solid #FBC02D"><p style="font-size:15px;color:#2F2F2F;font-style:italic;line-height:1.6;margin-bottom:16px">\u201CWe launched three campaigns in our first month. The Blueprints made it incredibly fast to get started.\u201D</p><p style="font-size:14px;font-weight:700;color:#2F2F2F">\u2014 VP of Member Services</p><p style="font-size:13px;color:#6E6E6E;margin-top:2px">INS</p></div></div></div></section>';if(prev4){prev4.insertAdjacentHTML('afterend',s4);}else{ctaSection.insertAdjacentHTML('beforebegin',s4);}}
    var ctaHeading=document.querySelector('.pf-cta-heading');if(ctaHeading){ctaHeading.innerHTML='Ready to<br>Get <span style="background:linear-gradient(135deg,#F47C2C,#FBC02D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Started?</span>';}var ctaSub2=document.querySelector('.pf-cta-sub');if(ctaSub2){ctaSub2.textContent='Most associations are live and seeing results within 2\u20133 weeks. Let\u2019s talk about your timeline.';}
    var ctaSecBtn=document.querySelector('.pf-cta-section .pf-btn-secondary, .pf-cta-section .w-button:not(.pf-btn-primary)');if(ctaSecBtn&&ctaSecBtn.textContent.trim()==='Learn More'){ctaSecBtn.textContent='Talk to Sales';ctaSecBtn.href='/book-a-demo';}
    document.querySelectorAll('.pf-section').forEach(function(s){s.style.display='none';});
  }

  // INIT
  // ─────────────────────────────────────────
  function init() {
    injectDynamicCSS();
    applyTextures();
    fixNav();
    fixHomepage();
    fixPlatformOverview();
    fixAutomationEngine();
    fixInsightsPage();
    fixEngagementPage();
    fixWebsitePage();
    fixIntegrationsPage();
    fixEmailPage();
    fixSmsPage();
    fixMembershipAIPage();
    fixUseCaseOnboarding();
    fixUseCaseRenewals();
    fixUseCaseWinBack();
    fixUseCaseAcquisition();
    fixUseCaseEvents();
    fixUseCaseCertifications();
    fixUseCaseDataIntelligence();
    fixRoiResults();
    fixCaseStudies();
    fixTestimonials();
    fixCustomers();
    fixImplementation();
    fixBlog();
    fixBlogPostTemplate();
    fixVideoTemplate();
    fixCaseStudyTemplate();
    fixTeamMemberTemplate();
    wireTeamCardHrefs();
    fixWebinars();
    fixGuides();
    fixHelp();
    fixNewsletter();
    fixApi();
    fixAbout();
    fixCareers();
    fixContact();
    fixPartners();
    fixPrivacy();
    fixTerms();
    // Clean up duplicates: hide original Webflow elements when injected ones exist
    var injectedBtns = document.querySelector('.pf-hero-btns-injected');
    if (injectedBtns) {
      var heroParent = injectedBtns.parentElement;
      if (heroParent) {
        // Hide Webflow w-button elements
        heroParent.querySelectorAll('.w-button').forEach(function(btn) { btn.style.display = 'none'; });
        // Hide Webflow hero button wrapper (.pf-hero-buttons)
        heroParent.querySelectorAll('.pf-hero-buttons').forEach(function(wrap) { wrap.style.display = 'none'; });
      }
    }
    // Hide original Webflow hero labels if injected one exists
    var injectedLabel = document.querySelector('.pf-hero-label-injected');
    if (injectedLabel) {
      // Hide .pf-page-hero-label and .pf-transition-label (both used as hero labels across pages)
      document.querySelectorAll('.pf-page-hero-label, .pf-transition-label').forEach(function(el) {
        if (el !== injectedLabel) el.style.display = 'none';
      });
    }
    // Fix CTA heading word-spacing: ensure <br> renders as a line break, not collapsed
    document.querySelectorAll('.pf-cta-heading').forEach(function(el) {
      el.style.display = 'block';
      el.style.wordSpacing = 'normal';
      // Ensure text nodes around <br> have proper spacing
      var html = el.innerHTML;
      if (html.indexOf('<br>') !== -1) {
        // Add a newline character around <br> to prevent word merging
        el.innerHTML = html.replace(/<br>/g, ' <br>');
      }
    });
    // Also fix any hero titles that use <br>
    document.querySelectorAll('.pf-page-hero-title').forEach(function(el) {
      var html = el.innerHTML;
      if (html.indexOf('<br>') !== -1 && html.indexOf(' <br>') === -1) {
        el.innerHTML = html.replace(/<br>/g, ' <br>');
      }
    });
    // Hide empty .pf-feature-visual containers (grey boxes from Webflow template)
    document.querySelectorAll('.pf-feature-visual').forEach(function(v) {
      if (v.children.length === 0 || (v.children.length === 1 && !v.children[0].textContent.trim())) {
        v.style.display = 'none';
      }
    });
    // Apply textures to ALL injected sections based on background color
    document.querySelectorAll('section, [class*="-band"], [class*="-section"]').forEach(function(s) {
      if (s.offsetHeight < 50) return;
      var bg = getComputedStyle(s).backgroundColor;
      var hasTex = getComputedStyle(s).backgroundImage.indexOf('data:image') !== -1;
      if (hasTex) return; // already has texture
      if (bg === 'rgb(26, 23, 19)' || bg === 'rgb(28, 28, 28)') {
        // Dark sections get dark texture
        s.style.backgroundImage = 'var(--dark-texture)';
        s.style.backgroundSize = '512px 512px';
      } else if (bg === 'rgb(235, 230, 218)' || bg === 'rgb(234, 228, 216)' || bg === 'rgb(246, 242, 232)') {
        // Cream/warm sections get warm texture
        s.style.backgroundImage = 'var(--faq-texture)';
        s.style.backgroundSize = '512px 512px';
      }
    });
    initScrollAnimations();
    initFaqAccordion();
    initNavScroll();
    initDemoForm();
    applyMembershipAIPalette();
    // SEO: inject meta tags and schema after all content is built
    injectSEOMeta();
    injectSchemaMarkup();
  }

  // ─────────────────────────────────────────────────────────────
  // Membership AI Features Section — self-contained CSS+HTML+JS.
  // Used by fixMembershipAIPage() (gated to webflow.io staging) and by
  // qa/maif-preview.html (called directly with relative headshotBase).
  // CSS injects via runtime <style> so a stale-cache state can never
  // split CSS from JS — they ship together as one file.
  // ─────────────────────────────────────────────────────────────
  var __maifStylesInjected = false;

  var MAIF_CSS = "" +
    ".membership-ai-features{--burnt-orange:#F47C2C;--page-bg:#F4F1EA;--card-bg:#F6F2E8;--deep-cream:#EAE4D8;--neutral-fill:#E7E2D8;--divider:#E3DDD2;--charcoal:#2F2F2F;--mid-grey:#6E6E6E;--light-grey:#BDBDBD;--ai-highlight:#D0DFEA;--ai-primary:#4A7FA5;--ai-shadow:#35607E;--ai-dark-edge:#1F3A51;--shadow-card:0 8px 40px rgba(120,110,95,0.10);font-family:'DM Sans',system-ui,-apple-system,sans-serif;font-weight:400;font-size:16px;line-height:1.6;color:var(--charcoal);background:var(--page-bg);position:relative;padding:96px 0;-webkit-font-smoothing:antialiased}" +
    ".membership-ai-features *,.membership-ai-features *::before,.membership-ai-features *::after{box-sizing:border-box;margin:0;padding:0}" +
    ".membership-ai-features img,.membership-ai-features svg{display:block;max-width:100%}" +
    ".membership-ai-features h2,.membership-ai-features h3{font-family:'DM Sans',sans-serif;color:var(--charcoal);letter-spacing:-0.01em}" +
    ".membership-ai-features h2{font-size:clamp(28px,3.4vw,42px);font-weight:600;line-height:1.15;letter-spacing:-0.015em}" +
    ".membership-ai-features h3{font-size:clamp(28px,3.4vw,44px);font-weight:700;line-height:1.15;letter-spacing:-0.02em;background:linear-gradient(to top,#1F3A51,#4A7FA5 45%,#35607E);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;display:inline-block;padding-bottom:0.05em}" +
    ".membership-ai-features .section-intro{max-width:720px;margin:0 auto 96px;padding:0 32px;text-align:center}" +
    ".membership-ai-features .section-intro h2{margin-bottom:18px}" +
    ".membership-ai-features .section-intro p{color:var(--mid-grey);font-size:18px;line-height:1.55}" +
    ".membership-ai-features .reveal{opacity:0;transform:translateY(24px);transition:opacity 0.7s ease-out,transform 0.7s ease-out}" +
    ".membership-ai-features .reveal.revealed{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .feature-row{max-width:1200px;margin:0 auto;padding:80px 32px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:80px;align-items:center}" +
    ".membership-ai-features .feature-row .text-side{max-width:480px;text-align:left}" +
    ".membership-ai-features .feature-row .feature-kicker{font-size:clamp(14px,1.1vw,17px);font-weight:700;letter-spacing:0.14em;color:var(--ai-primary);text-transform:uppercase;margin-bottom:18px;display:flex;align-items:center;gap:8px}" +
    ".membership-ai-features .feature-row .feature-kicker::before{content:\"\\2726\";font-size:1.05em}" +
    ".membership-ai-features .feature-row h3{margin-bottom:18px}" +
    ".membership-ai-features .feature-row p{font-size:17px;line-height:1.6;color:var(--mid-grey)}" +
    ".membership-ai-features .feature-row .visual-side{width:100%;display:flex;align-items:center;justify-content:center}" +
    ".membership-ai-features .feature-row.visual-right .text-side{grid-column:1;grid-row:1;justify-self:end}" +
    ".membership-ai-features .feature-row.visual-right .visual-side{grid-column:2;grid-row:1}" +
    ".membership-ai-features .feature-row.visual-left .text-side{grid-column:2;grid-row:1;justify-self:start}" +
    ".membership-ai-features .feature-row.visual-left .visual-side{grid-column:1;grid-row:1}" +
    "@media (max-width:900px){.membership-ai-features .feature-row{grid-template-columns:1fr;gap:40px;padding:64px 24px}.membership-ai-features .feature-row.visual-right .text-side,.membership-ai-features .feature-row.visual-left .text-side{grid-column:1;grid-row:1;justify-self:stretch;max-width:100%}.membership-ai-features .feature-row.visual-right .visual-side,.membership-ai-features .feature-row.visual-left .visual-side{grid-column:1;grid-row:2}}" +
    ".membership-ai-features .loop-stage{width:100%;max-width:540px;aspect-ratio:1/1;background:var(--card-bg);border-radius:22px;position:relative;overflow:hidden;box-shadow:var(--shadow-card)}" +
    ".membership-ai-features .loop-stage::before{content:\"\";position:absolute;inset:0;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0.94 0 0 0 0 0.91 0 0 0 0 0.86 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\");mix-blend-mode:multiply;opacity:0.5;pointer-events:none;z-index:1}" +
    ".membership-ai-features .loop-stage .brand-mark{position:absolute;top:5%;left:6%;z-index:5;font-size:clamp(10px,1.4vw,13px);font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--mid-grey);display:flex;align-items:center;gap:7px}" +
    ".membership-ai-features .loop-stage .brand-mark::before{content:\"\";width:5px;height:5px;background:var(--burnt-orange);border-radius:50%}" +
    ".membership-ai-features .loop-stage .step-rail{position:absolute;bottom:4%;left:50%;transform:translateX(-50%);z-index:4;display:flex;gap:9px}" +
    ".membership-ai-features .loop-stage .step-rail .step{width:5px;height:5px;border-radius:50%;background:var(--neutral-fill);transition:background 400ms ease,transform 400ms ease}" +
    ".membership-ai-features .loop-stage .step-rail .step.active{background:var(--ai-primary);transform:scale(1.4)}" +
    ".membership-ai-features .signals-loop .population{position:absolute;inset:0;z-index:2}" +
    ".membership-ai-features .signals-loop .member{position:absolute;border-radius:50%;overflow:hidden;border:2px solid transparent;box-shadow:0 2px 6px rgba(120,110,95,0.18);transition:left 1100ms cubic-bezier(0.65,0,0.35,1),top 1100ms cubic-bezier(0.65,0,0.35,1),width 900ms cubic-bezier(0.65,0,0.35,1),height 900ms cubic-bezier(0.65,0,0.35,1),border-color 600ms ease,box-shadow 600ms ease,filter 800ms ease,opacity 1000ms ease}" +
    ".membership-ai-features .signals-loop .member img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".membership-ai-features .signals-loop .member.idle{filter:saturate(0.85)}" +
    ".membership-ai-features .signals-loop .member.selected{border-color:var(--ai-primary);box-shadow:0 4px 14px rgba(31,58,81,0.22),0 0 0 3px rgba(74,127,165,0.16);filter:saturate(1) brightness(1.04);z-index:4}" +
    ".membership-ai-features .signals-loop .member.faded{opacity:0;filter:saturate(0.4) brightness(0.95)}" +
    ".membership-ai-features .signals-loop .reasoning-panel{position:absolute;right:6%;top:50%;transform:translateY(-50%);width:38%;max-width:280px;z-index:6;display:flex;flex-direction:column;gap:clamp(7px,1vw,12px);opacity:0;transition:opacity 500ms ease}" +
    ".membership-ai-features .signals-loop .reasoning-panel.show{opacity:1}" +
    ".membership-ai-features .signals-loop .reasoning-header{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:4px}" +
    ".membership-ai-features .signals-loop .reasoning-header .badge{font-size:clamp(9px,1.2vw,11px);font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--ai-primary);display:flex;align-items:center;gap:5px;white-space:nowrap}" +
    ".membership-ai-features .signals-loop .reasoning-header .badge::before{content:\"\\2726\";font-size:clamp(10px,1.3vw,12px)}" +
    ".membership-ai-features .signals-loop .reasoning-headline{display:flex;align-items:baseline;gap:7px;margin-bottom:8px}" +
    ".membership-ai-features .signals-loop .reasoning-headline .count{font-size:clamp(28px,4.2vw,44px);font-weight:700;color:var(--charcoal);line-height:0.95;letter-spacing:-0.025em;font-variant-numeric:tabular-nums}" +
    ".membership-ai-features .signals-loop .reasoning-headline .label{font-size:clamp(13px,1.8vw,17px);font-weight:600;color:var(--ai-shadow);line-height:1.15}" +
    ".membership-ai-features .signals-loop .criteria{display:flex;flex-direction:column;gap:clamp(7px,1vw,11px);border-top:1px solid var(--divider);padding-top:clamp(7px,1vw,11px)}" +
    ".membership-ai-features .signals-loop .criterion{display:flex;align-items:flex-start;gap:clamp(6px,0.9vw,10px);opacity:0;transform:translateX(8px);transition:opacity 500ms ease,transform 500ms cubic-bezier(0.34,1.2,0.64,1)}" +
    ".membership-ai-features .signals-loop .criterion.show{opacity:1;transform:translateX(0)}" +
    ".membership-ai-features .signals-loop .criterion .check{width:clamp(13px,1.7vw,18px);height:clamp(13px,1.7vw,18px);border-radius:50%;background:var(--ai-primary);color:#FFF;display:flex;align-items:center;justify-content:center;font-size:clamp(7px,1vw,9px);font-weight:700;flex-shrink:0;margin-top:2px;box-shadow:0 2px 6px rgba(31,58,81,0.18)}" +
    ".membership-ai-features .signals-loop .criterion .text{display:flex;flex-direction:column;gap:1px}" +
    ".membership-ai-features .signals-loop .criterion .text .primary{font-size:clamp(10px,1.4vw,12.5px);font-weight:600;color:var(--charcoal);line-height:1.3;letter-spacing:-0.005em}" +
    ".membership-ai-features .signals-loop .criterion .text .meta{font-size:clamp(9px,1.2vw,11px);font-weight:400;color:var(--mid-grey);line-height:1.3}" +
    "@keyframes maif-sig-ambient{0%,100%{box-shadow:0 2px 6px rgba(120,110,95,0.18)}50%{box-shadow:0 2px 6px rgba(120,110,95,0.18),0 0 0 2px rgba(74,127,165,0.08)}}" +
    ".membership-ai-features .signals-loop .member.idle.pulsing{animation:maif-sig-ambient 2.4s ease-in-out infinite}" +
    ".membership-ai-features .segments-loop .thread{position:absolute;inset:0;z-index:2;padding:13% 8%;display:flex;flex-direction:column;justify-content:center;gap:2.4%;transition:transform 900ms cubic-bezier(0.65,0,0.35,1),opacity 700ms ease}" +
    /* Hide pending chat rows so the layout doesn't reserve empty space for them. */
    ".membership-ai-features .segments-loop .thread .row.ai:not(.show){display:none}" +
    ".membership-ai-features .segments-loop .thread .row.result:not(.show){display:none}" +
    ".membership-ai-features .segments-loop .thread .choice-row:not(.show){display:none}" +
    ".membership-ai-features .segments-loop .thread.scrolled-up{transform:translateY(-26%);opacity:0.5}" +
    ".membership-ai-features .segments-loop .row{display:flex;flex-direction:column;max-width:78%}" +
    ".membership-ai-features .segments-loop .row.user{align-self:flex-end;align-items:flex-end}" +
    ".membership-ai-features .segments-loop .row.ai{align-self:flex-start;align-items:flex-start}" +
    ".membership-ai-features .segments-loop .row .speaker{font-size:clamp(9px,1.2vw,11px);font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--mid-grey);margin-bottom:6px;display:flex;align-items:center;gap:5px}" +
    ".membership-ai-features .segments-loop .row.ai .speaker{color:var(--ai-primary)}" +
    ".membership-ai-features .segments-loop .row.ai .speaker::before{content:\"\\2726\";font-size:clamp(10px,1.3vw,12px)}" +
    ".membership-ai-features .segments-loop .user-bubble{background:#FFF;border:1.5px solid var(--divider);border-radius:16px 16px 4px 16px;padding:clamp(10px,1.6vw,16px) clamp(13px,2vw,18px);font-size:clamp(13px,1.7vw,16px);color:var(--charcoal);line-height:1.4;box-shadow:0 2px 6px rgba(120,110,95,0.06);transition:border-color 0.4s ease,box-shadow 0.4s ease,background 0.4s ease,color 0.4s ease;display:flex;align-items:center}" +
    ".membership-ai-features .segments-loop .user-bubble.typing{border-color:var(--ai-primary);box-shadow:0 0 0 3px rgba(74,127,165,0.10)}" +
    ".membership-ai-features .segments-loop .user-bubble.sent{background:var(--ai-shadow);color:#FFF;border-color:var(--ai-shadow)}" +
    ".membership-ai-features .segments-loop .cursor{display:inline-block;width:2px;height:clamp(13px,1.7vw,17px);background:var(--charcoal);margin-left:1px;vertical-align:middle;animation:maif-seg-blink 1s steps(2,start) infinite}" +
    "@keyframes maif-seg-blink{to{visibility:hidden}}" +
    ".membership-ai-features .segments-loop .ai-bubble{background:var(--ai-highlight);color:var(--ai-dark-edge);border-radius:16px 16px 16px 4px;padding:clamp(10px,1.6vw,16px) clamp(13px,2vw,18px);font-size:clamp(13px,1.7vw,16px);font-weight:500;line-height:1.4;box-shadow:0 4px 12px rgba(31,58,81,0.08);opacity:0;transform:translateY(8px);transition:opacity 500ms ease,transform 500ms cubic-bezier(0.34,1.2,0.64,1)}" +
    ".membership-ai-features .segments-loop .row.ai.show .ai-bubble{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .segments-loop .choice-row{display:flex;gap:8px;opacity:0;transform:translateY(8px);transition:opacity 400ms ease,transform 400ms cubic-bezier(0.34,1.2,0.64,1)}" +
    ".membership-ai-features .segments-loop .choice-row.show{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .segments-loop .choice{background:#FFF;color:var(--charcoal);border:1.5px solid var(--divider);padding:clamp(7px,1.1vw,10px) clamp(13px,1.8vw,17px);border-radius:100px;font-size:clamp(11px,1.5vw,13px);font-weight:500;transition:background 400ms ease,color 400ms ease,transform 400ms cubic-bezier(0.34,1.2,0.64,1),border-color 400ms ease}" +
    ".membership-ai-features .segments-loop .choice.selected{background:var(--ai-primary);color:#FFF;border-color:var(--ai-primary);transform:scale(1.05);box-shadow:0 4px 10px rgba(31,58,81,0.18)}" +
    ".membership-ai-features .segments-loop .row.result{align-self:stretch;align-items:stretch;max-width:100%}" +
    ".membership-ai-features .segments-loop .segment-card{background:#FFF;border:1px solid var(--ai-highlight);border-radius:14px;padding:clamp(11px,1.8vw,18px) clamp(13px,2vw,20px);box-shadow:0 12px 32px rgba(31,58,81,0.12);opacity:0;transform:translateY(10px);transition:opacity 600ms ease,transform 600ms cubic-bezier(0.34,1.2,0.64,1)}" +
    ".membership-ai-features .segments-loop .row.result.show .segment-card{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .segments-loop .seg-tag{font-size:clamp(9px,1.2vw,11px);font-weight:700;letter-spacing:0.12em;color:var(--ai-primary);text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:5px}" +
    ".membership-ai-features .segments-loop .seg-tag::before{content:\"\\2726\"}" +
    ".membership-ai-features .segments-loop .seg-headline{display:flex;align-items:baseline;gap:10px;margin-bottom:10px;flex-wrap:wrap}" +
    ".membership-ai-features .segments-loop .count{font-size:clamp(24px,3.4vw,36px);font-weight:700;color:var(--charcoal);line-height:0.95;letter-spacing:-0.025em;font-variant-numeric:tabular-nums}" +
    ".membership-ai-features .segments-loop .label{font-size:clamp(13px,1.7vw,16px);font-weight:600;color:var(--ai-shadow);line-height:1.2}" +
    ".membership-ai-features .segments-loop .filters{padding-top:8px;border-top:1px solid var(--divider);display:flex;flex-wrap:wrap;gap:5px}" +
    ".membership-ai-features .segments-loop .filter-chip{background:rgba(208,223,234,0.45);color:var(--ai-dark-edge);padding:4px 10px;border-radius:100px;font-size:clamp(10px,1.3vw,12px);font-weight:500}" +
    ".membership-ai-features .segments-loop .roster{position:absolute;left:8%;right:8%;bottom:8%;z-index:3;background:#FFF;border:1px solid var(--ai-highlight);border-top:3px solid var(--ai-primary);border-radius:14px;box-shadow:0 -12px 40px rgba(31,58,81,0.16);padding:clamp(12px,1.8vw,18px) clamp(12px,1.8vw,18px) clamp(14px,2vw,20px);opacity:0;transform:translateY(70%);transition:opacity 700ms ease,transform 900ms cubic-bezier(0.34,1.1,0.64,1);pointer-events:none}" +
    ".membership-ai-features .segments-loop .roster.show{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .segments-loop .roster-header{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--divider)}" +
    ".membership-ai-features .segments-loop .roster-title{display:flex;align-items:baseline;gap:9px}" +
    ".membership-ai-features .segments-loop .roster-count{font-size:clamp(20px,2.8vw,30px);font-weight:700;color:var(--charcoal);line-height:1;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}" +
    ".membership-ai-features .segments-loop .roster-label{font-size:clamp(11px,1.5vw,13px);font-weight:600;color:var(--ai-shadow)}" +
    ".membership-ai-features .segments-loop .roster-meta{font-size:clamp(9px,1.2vw,11px);font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--ai-primary);display:flex;align-items:center;gap:4px}" +
    ".membership-ai-features .segments-loop .roster-meta::before{content:\"\\2726\"}" +
    ".membership-ai-features .segments-loop .roster-list{display:flex;flex-direction:column;gap:8px}" +
    ".membership-ai-features .segments-loop .roster-row{display:flex;align-items:center;gap:10px;opacity:0;transform:translateY(8px);transition:opacity 350ms ease,transform 350ms cubic-bezier(0.34,1.1,0.64,1)}" +
    ".membership-ai-features .segments-loop .roster-row.show{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .segments-loop .roster-row .photo{width:clamp(24px,3vw,32px);height:clamp(24px,3vw,32px);border-radius:50%;overflow:hidden;border:1.5px solid var(--ai-highlight);flex-shrink:0;box-shadow:0 1px 3px rgba(120,110,95,0.12)}" +
    ".membership-ai-features .segments-loop .roster-row .photo img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".membership-ai-features .segments-loop .roster-row .name{font-size:clamp(11px,1.5vw,13px);font-weight:500;color:var(--charcoal);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".membership-ai-features .segments-loop .roster-row .role{font-size:clamp(10px,1.3vw,12px);color:var(--mid-grey);text-align:right;white-space:nowrap}" +
    ".membership-ai-features .segments-loop .roster-more{display:flex;align-items:center;gap:9px;margin-top:6px;padding-top:7px;border-top:1px dashed var(--divider);opacity:0;transform:translateY(8px);transition:opacity 400ms ease,transform 400ms cubic-bezier(0.34,1.1,0.64,1)}" +
    ".membership-ai-features .segments-loop .roster-more.show{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .segments-loop .roster-more-stack{display:flex;align-items:center;flex-shrink:0}" +
    ".membership-ai-features .segments-loop .roster-more-stack .photo{width:clamp(20px,2.6vw,26px);height:clamp(20px,2.6vw,26px);min-width:clamp(20px,2.6vw,26px);min-height:clamp(20px,2.6vw,26px);margin-left:-8px;border:2px solid #FFF;border-radius:50%;overflow:hidden;flex-shrink:0;box-shadow:0 1px 3px rgba(120,110,95,0.18)}" +
    ".membership-ai-features .segments-loop .roster-more-stack .photo:first-child{margin-left:0}" +
    ".membership-ai-features .segments-loop .roster-more-stack .photo img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".membership-ai-features .segments-loop .roster-more-text{font-size:clamp(11px,1.5vw,13px);font-weight:600;color:var(--ai-shadow);margin-left:9px}" +
    ".membership-ai-features .cw-loop .workspace{position:absolute;inset:0;z-index:2;padding:11% 8% 10%;display:flex;flex-direction:column;justify-content:center;gap:clamp(11px,1.6vw,18px);transition:transform 700ms cubic-bezier(0.65,0,0.35,1),opacity 600ms ease}" +
    ".membership-ai-features .cw-loop .workspace.shifted{transform:translateY(-22%);opacity:0.45}" +
    ".membership-ai-features .cw-loop .section-title{font-size:clamp(9px,1.3vw,11px);font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--ai-primary);display:flex;align-items:center;gap:6px}" +
    ".membership-ai-features .cw-loop .section-title::before{content:\"\\2726\";font-size:clamp(11px,1.5vw,13px)}" +
    ".membership-ai-features .cw-loop .context-panel{background:#FFF;border:1px solid var(--divider);border-radius:13px;padding:clamp(12px,1.8vw,20px) clamp(14px,2vw,22px);box-shadow:0 4px 16px rgba(120,110,95,0.06)}" +
    ".membership-ai-features .cw-loop .context-panel-header{display:flex;align-items:baseline;justify-content:space-between;padding-bottom:clamp(8px,1.2vw,11px);border-bottom:1px solid var(--divider);margin-bottom:clamp(9px,1.3vw,12px)}" +
    ".membership-ai-features .cw-loop .context-panel-title{font-size:clamp(11px,1.5vw,14px);font-weight:600;color:var(--charcoal);letter-spacing:-0.01em}" +
    ".membership-ai-features .cw-loop .context-panel-meta{font-size:clamp(8px,1.1vw,10px);font-weight:600;color:var(--ai-primary);letter-spacing:0.08em;text-transform:uppercase}" +
    ".membership-ai-features .cw-loop .context-list{display:flex;flex-direction:column;gap:clamp(8px,1.2vw,12px)}" +
    ".membership-ai-features .cw-loop .context-item{display:flex;align-items:flex-start;gap:clamp(8px,1.2vw,11px);opacity:0;transform:translateX(-10px);transition:opacity 460ms ease,transform 460ms cubic-bezier(0.34,1.1,0.64,1)}" +
    ".membership-ai-features .cw-loop .context-item.show{opacity:1;transform:translateX(0)}" +
    ".membership-ai-features .cw-loop .context-item .ctx-check{width:clamp(14px,1.9vw,18px);height:clamp(14px,1.9vw,18px);border-radius:50%;background:var(--ai-primary);color:#FFF;display:flex;align-items:center;justify-content:center;font-size:clamp(8px,1.1vw,10px);font-weight:700;flex-shrink:0;margin-top:1px;box-shadow:0 2px 6px rgba(31,58,81,0.18)}" +
    ".membership-ai-features .cw-loop .context-item .ctx-text{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}" +
    ".membership-ai-features .cw-loop .context-item .ctx-primary{font-size:clamp(11px,1.5vw,13.5px);color:var(--charcoal);font-weight:500;line-height:1.35;letter-spacing:-0.005em}" +
    ".membership-ai-features .cw-loop .context-item .ctx-source{font-size:clamp(9px,1.25vw,11px);color:var(--mid-grey);font-style:italic}" +
    ".membership-ai-features .cw-loop .context-item .ctx-source b{color:var(--ai-shadow);font-style:normal;font-weight:600}" +
    ".membership-ai-features .cw-loop .email-compose{position:absolute;left:8%;right:8%;top:11%;bottom:9%;z-index:3;background:#FFF;border:1px solid var(--ai-highlight);border-top:3px solid var(--ai-primary);border-radius:14px;box-shadow:0 -12px 40px rgba(31,58,81,0.18);padding:clamp(11px,1.6vw,16px) clamp(13px,1.9vw,19px) clamp(10px,1.5vw,15px);opacity:0;transform:translateY(85%);transition:opacity 700ms ease,transform 900ms cubic-bezier(0.34,1.05,0.64,1);pointer-events:none;display:flex;flex-direction:column;gap:clamp(6px,0.9vw,9px);overflow:hidden}" +
    ".membership-ai-features .cw-loop .email-compose.show{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .cw-loop .compose-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:clamp(6px,0.9vw,9px);border-bottom:1px solid var(--divider)}" +
    ".membership-ai-features .cw-loop .compose-header-title{font-size:clamp(9px,1.25vw,11px);font-weight:700;color:var(--ai-primary);letter-spacing:0.12em;text-transform:uppercase;display:flex;align-items:center;gap:5px}" +
    ".membership-ai-features .cw-loop .compose-header-title::before{content:\"\\2726\"}" +
    ".membership-ai-features .cw-loop .compose-header-meta{font-size:clamp(8px,1.15vw,10px);color:var(--mid-grey);font-weight:500}" +
    ".membership-ai-features .cw-loop .compose-field{display:flex;flex-direction:column;gap:4px}" +
    ".membership-ai-features .cw-loop .compose-field-label{font-size:clamp(8px,1.1vw,10px);font-weight:600;color:var(--mid-grey);letter-spacing:0.08em;text-transform:uppercase}" +
    ".membership-ai-features .cw-loop .compose-subject{font-size:clamp(12px,1.7vw,15.5px);font-weight:600;color:var(--charcoal);line-height:1.3;letter-spacing:-0.01em;opacity:0;transform:translateY(4px);transition:opacity 380ms ease,transform 380ms cubic-bezier(0.34,1.1,0.64,1)}" +
    ".membership-ai-features .cw-loop .compose-subject.show{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .cw-loop .compose-field-body{flex:1 1 auto;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:4px}" +
    ".membership-ai-features .cw-loop .compose-body{font-size:clamp(10px,1.4vw,12px);font-weight:400;color:var(--charcoal);line-height:1.5;letter-spacing:-0.005em;overflow:hidden;display:flex;flex-direction:column;gap:0.55em;flex:1 1 auto;min-height:0}" +
    ".membership-ai-features .cw-loop .compose-body .para{opacity:0;transform:translateY(6px);transition:opacity 380ms ease,transform 380ms cubic-bezier(0.34,1.1,0.64,1)}" +
    ".membership-ai-features .cw-loop .compose-body .para.show{opacity:1;transform:translateY(0)}" +
    ".membership-ai-features .cw-loop .spark-overlay{position:absolute;inset:0;pointer-events:none;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 220ms ease;z-index:4}" +
    ".membership-ai-features .cw-loop .spark-overlay.show{opacity:1}" +
    ".membership-ai-features .cw-loop .spark-overlay .spark{font-size:clamp(32px,5vw,48px);color:var(--ai-primary);animation:maif-cw-spark 600ms ease-out;text-shadow:0 0 24px rgba(74,127,165,0.5)}" +
    "@keyframes maif-cw-spark{0%{transform:scale(0.6) rotate(-15deg);opacity:0}40%{transform:scale(1.15) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:0.85}}" +
    ".membership-ai-features .cw-loop .compose-actions{display:flex;gap:7px;padding-top:7px;border-top:1px solid var(--divider);opacity:0;transition:opacity 500ms ease}" +
    ".membership-ai-features .cw-loop .compose-actions.show{opacity:1}" +
    ".membership-ai-features .cw-loop .action{font-size:clamp(9px,1.3vw,11px);font-weight:600;padding:6px 13px;border-radius:100px}" +
    ".membership-ai-features .cw-loop .action.primary{background:var(--burnt-orange);color:#FFF;box-shadow:0 3px 10px rgba(244,124,44,0.22)}" +
    ".membership-ai-features .cw-loop .action.secondary{background:var(--neutral-fill);color:var(--mid-grey)}" +
    ".membership-ai-features .static-visual{width:100%;max-width:540px;aspect-ratio:1/1;background:var(--card-bg);border-radius:22px;padding:36px;position:relative;overflow:hidden;box-shadow:var(--shadow-card);display:flex;flex-direction:column}" +
    ".membership-ai-features .static-visual::before{content:\"\";position:absolute;inset:0;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0.94 0 0 0 0 0.91 0 0 0 0 0.86 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\");mix-blend-mode:multiply;opacity:0.45;pointer-events:none;z-index:1}" +
    ".membership-ai-features .static-visual > *{position:relative;z-index:2}" +
    ".membership-ai-features .form-visual{justify-content:center;gap:14px}" +
    ".membership-ai-features .form-row{background:#FFF;border:1.5px solid var(--divider);border-radius:12px;padding:16px 20px;display:grid;grid-template-columns:130px 1fr auto;align-items:center;gap:16px;font-size:14.5px;transition:border-color 0.3s ease;opacity:0.4;box-shadow:0 1px 3px rgba(120,110,95,0.05)}" +
    ".membership-ai-features .form-row.filled{opacity:1;border-color:var(--ai-highlight);animation:maif-form-pulse 0.8s ease-out}" +
    "@keyframes maif-form-pulse{0%{border-color:var(--divider);box-shadow:0 0 0 0 rgba(74,127,165,0.4)}40%{border-color:var(--ai-primary);box-shadow:0 0 0 5px rgba(74,127,165,0.15)}100%{border-color:var(--ai-highlight);box-shadow:0 0 0 0 rgba(74,127,165,0)}}" +
    ".membership-ai-features .form-label{color:var(--mid-grey);font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase}" +
    ".membership-ai-features .form-value{color:var(--charcoal);font-weight:500;font-size:15px}" +
    ".membership-ai-features .form-source{font-size:11.5px;color:var(--ai-shadow);font-style:italic;white-space:nowrap}" +
    "@media (max-width:600px){.membership-ai-features .form-row{grid-template-columns:100px 1fr;padding:12px 14px}.membership-ai-features .form-source{display:none}}" +
    "@media (prefers-reduced-motion:reduce){.membership-ai-features *,.membership-ai-features *::before,.membership-ai-features *::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important}.membership-ai-features .reveal{opacity:1!important;transform:none!important}.membership-ai-features .signals-loop .member{transition-delay:0ms!important}}";

  function maifBuildHTML() {
    return [
      '<div class="feature-row visual-right reveal">',
        '<div class="text-side">',
          '<div class="feature-kicker">Signals</div>',
          '<h3>Patterns you didn&rsquo;t have time to look for.</h3>',
          '<p>Signals are patterns of behavior and intent that Membership AI detects in your existing data &mdash; automatically. Each pattern is a Signal. The matching members are one click away.</p>',
        '</div>',
        '<div class="visual-side">',
          '<div class="loop-stage signals-loop" data-loop="signals">',
            '<div class="population"></div>',
            '<div class="reasoning-panel">',
              '<div class="reasoning-header"><div class="badge">Signal detected</div></div>',
              '<div class="reasoning-headline"><div class="count">12</div><div class="label">Churn risk</div></div>',
              '<div class="criteria">',
                '<div class="criterion" data-crit="0"><div class="check">&#10003;</div><div class="text"><div class="primary">Year-2 members</div><div class="meta">Past first renewal &middot; low retention cohort</div></div></div>',
                '<div class="criterion" data-crit="1"><div class="check">&#10003;</div><div class="text"><div class="primary">Open rate down 40%</div><div class="meta">Last 90 days vs prior 90</div></div></div>',
                '<div class="criterion" data-crit="2"><div class="check">&#10003;</div><div class="text"><div class="primary">No event RSVPs in 90 days</div><div class="meta">Previously active in events</div></div></div>',
                '<div class="criterion" data-crit="3"><div class="check">&#10003;</div><div class="text"><div class="primary">Declined last campaign</div><div class="meta">Or did not respond</div></div></div>',
              '</div>',
            '</div>',
            '<div class="step-rail"><div class="step"></div><div class="step"></div><div class="step"></div><div class="step"></div></div>',
          '</div>',
        '</div>',
      '</div>',

      '<div class="feature-row visual-left reveal">',
        '<div class="text-side">',
          '<div class="feature-kicker">Segments</div>',
          '<h3>Type what you want. Get the audience.</h3>',
          '<p>Tell Membership AI who you&rsquo;re looking for in plain language. It asks clarifying questions, then builds the audience from your PropFuel data, your AMS, and member behavior. Review, edit, add filters, finalize. No IQA setup.</p>',
        '</div>',
        '<div class="visual-side">',
          '<div class="loop-stage segments-loop" data-loop="segments">',
            '<div class="thread">',
              '<div class="row user"><div class="speaker">You</div><div class="user-bubble"><span class="prompt-text"></span><span class="cursor"></span></div></div>',
              '<div class="row ai"><div class="speaker">Membership AI</div><div class="ai-bubble">Should I include members who unsubscribed?</div></div>',
              '<div class="row user"><div class="choice-row"><span class="choice include">Include</span><span class="choice exclude">Exclude</span></div></div>',
              '<div class="row result"><div class="segment-card"><div class="seg-tag">Segment ready</div><div class="seg-headline"><div class="count">127</div><div class="label">members match</div></div><div class="filters"><span class="filter-chip">Joined &lt; 90 days</span><span class="filter-chip">No opens</span><span class="filter-chip">Excludes unsubscribes</span></div></div></div>',
            '</div>',
            '<div class="roster">',
              '<div class="roster-header"><div class="roster-title"><div class="roster-count">127</div><div class="roster-label">members in segment</div></div><div class="roster-meta">Live</div></div>',
              '<div class="roster-list"></div>',
              '<div class="roster-more"><div class="roster-more-stack"></div><div class="roster-more-text">+ 119 more</div></div>',
            '</div>',
            '<div class="step-rail"><div class="step"></div><div class="step"></div><div class="step"></div><div class="step"></div></div>',
          '</div>',
        '</div>',
      '</div>',

      '<div class="feature-row visual-right reveal">',
        '<div class="text-side">',
          '<div class="feature-kicker">AI Content Writing</div>',
          '<h3>A draft that already knows the room.</h3>',
          '<p>Draft campaign content and landing page copy with an in-platform writing assistant &mdash; tuned to your org, your audience, and your campaign goal. Use it as a starting point, or keep it as written.</p>',
        '</div>',
        '<div class="visual-side">',
          '<div class="loop-stage cw-loop" data-loop="cw">',
            '<div class="workspace">',
              '<div class="section-title">AI Content Writing</div>',
              '<div class="context-panel">',
                '<div class="context-panel-header"><div class="context-panel-title">What the AI knows</div><div class="context-panel-meta">Drawn from your suite</div></div>',
                '<div class="context-list">',
                  '<div class="context-item" data-ctx="0"><span class="ctx-check">&#10003;</span><div class="ctx-text"><span class="ctx-primary">Year-2 retention campaign &middot; warm, direct tone</span><span class="ctx-source">from <b>Membership AI Tab</b></span></div></div>',
                  '<div class="context-item" data-ctx="1"><span class="ctx-check">&#10003;</span><div class="ctx-text"><span class="ctx-primary">127-member segment, mid-career professionals</span><span class="ctx-source">from <b>Segments</b> + <b>Strategic Context</b></span></div></div>',
                  '<div class="context-item" data-ctx="2"><span class="ctx-check">&#10003;</span><div class="ctx-text"><span class="ctx-primary">Direct subject lines outperformed clever ones last quarter</span><span class="ctx-source">from <b>Campaign History Summary</b></span></div></div>',
                '</div>',
              '</div>',
            '</div>',
            '<div class="email-compose">',
              '<div class="spark-overlay"><span class="spark">&#10022;</span></div>',
              '<div class="compose-header"><div class="compose-header-title">AI draft &middot; email</div><div class="compose-header-meta">To: 127 members</div></div>',
              '<div class="compose-field"><div class="compose-field-label">Subject</div><div class="compose-subject">Your membership is almost up &mdash; here&rsquo;s what&rsquo;s worth keeping.</div></div>',
              '<div class="compose-field compose-field-body"><div class="compose-field-label">Body</div><div class="compose-body">',
                '<div class="para" data-p="0">Hi Marcus,</div>',
                '<div class="para" data-p="1">You joined us last year, and your renewal date is coming up on June 14.</div>',
                '<div class="para" data-p="2">I wanted to reach out personally &mdash; not with a sales pitch, but to ask: has your membership been worth it? If yes, renewing takes 30 seconds at the link below. If not, I&rsquo;d genuinely like to hear what we could be doing better.</div>',
                '<div class="para" data-p="3">Either way, thanks for being part of this.</div>',
                '<div class="para" data-p="4">Sarah</div>',
                '<div class="para" data-p="5">Director of Membership</div>',
              '</div></div>',
              '<div class="compose-actions"><span class="action primary">Use this</span><span class="action secondary">Regenerate</span><span class="action secondary">Edit</span></div>',
            '</div>',
            '<div class="step-rail"><div class="step"></div><div class="step"></div><div class="step"></div><div class="step"></div></div>',
          '</div>',
        '</div>',
      '</div>',

      '<div class="feature-row visual-left reveal">',
        '<div class="text-side">',
          '<div class="feature-kicker">Strategic Context</div>',
          '<h3>The &ldquo;why&rdquo; behind every campaign.</h3>',
          '<p>Every association is different. Strategic Context captures yours &mdash; your industry, your members, your mission, the goals you&rsquo;ve talked through with your CS team. Pulled in automatically from your website, your conversations, and your campaign history. It&rsquo;s the layer that lets every other AI feature understand what success means for <em>you</em>.</p>',
        '</div>',
        '<div class="visual-side">',
          '<div class="static-visual form-visual" data-static="form">',
            '<div class="form-row" data-idx="0"><span class="form-label">Industry</span><span class="form-value">Nursing education</span><span class="form-source">your website</span></div>',
            '<div class="form-row" data-idx="1"><span class="form-label">Members</span><span class="form-value">3,400 active</span><span class="form-source">your website</span></div>',
            '<div class="form-row" data-idx="2"><span class="form-label">Mission</span><span class="form-value">Advancing care through education</span><span class="form-source">your about page</span></div>',
            '<div class="form-row" data-idx="3"><span class="form-label">Stated goal</span><span class="form-value">Increase year-2 retention</span><span class="form-source">CS call &middot; Mar 12</span></div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function renderMembershipAIFeatures(target, opts) {
    if (!target) return;
    opts = opts || {};
    var headshotBase = opts.headshotBase || 'https://alexhively.github.io/propfuel-webflow-custom/images/headshots/';
    if (!__maifStylesInjected) {
      var style = document.createElement('style');
      style.id = 'maif-styles';
      style.textContent = MAIF_CSS;
      document.head.appendChild(style);
      __maifStylesInjected = true;
    }
    target.classList.add('membership-ai-features');
    target.innerHTML = maifBuildHTML();
    initMaifFlows(target, headshotBase);
  }

  function initMaifFlows(root, headshotBase) {
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    // Full membership pool — 28 headshots scattered as the "population"
    // state for Signals. The animation selects 12 from this pool into
    // the cluster; the rest fade out (representing AI evaluating everyone
    // but surfacing only those matching the signal pattern).
    var HEADSHOTS = [];
    for (var i = 1; i <= 28; i++) {
      HEADSHOTS.push(headshotBase + (i < 10 ? '0' + i : '' + i) + '.webp');
    }

    function makeRand(seed) {
      var s = seed;
      return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    }
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function whenInView(el, cb, threshold) {
      if (reducedMotion) return;
      if (!('IntersectionObserver' in window)) { cb(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { cb(); io.unobserve(el); }
        });
      }, { threshold: threshold || 0.4 });
      io.observe(el);
    }

    // Reveal on scroll
    (function revealObserver() {
      var items = root.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window) || reducedMotion) {
        items.forEach(function (i) { i.classList.add('revealed'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      items.forEach(function (i) { io.observe(i); });
    })();

    // Strategic Context — auto-populating form
    (function formFillFlow() {
      var host = root.querySelector('[data-static="form"]');
      if (!host) return;
      var rows = host.querySelectorAll('.form-row');
      if (reducedMotion) { rows.forEach(function (r) { r.classList.add('filled'); }); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            rows.forEach(function (r, i) { setTimeout(function () { r.classList.add('filled'); }, 300 + i * 420); });
            io.unobserve(host);
          }
        });
      }, { threshold: 0.4 });
      io.observe(host);
    })();

    // SIGNALS
    (function signalsLoop() {
      var stage = root.querySelector('[data-loop="signals"]');
      if (!stage) return;
      var population = stage.querySelector('.population');
      var panel      = stage.querySelector('.reasoning-panel');
      var criteria   = stage.querySelectorAll('.criterion');
      var stepEls    = stage.querySelectorAll('.step-rail .step');
      var TOTAL = HEADSHOTS.length;
      var SELECT_COUNT = 12;
      var rand = makeRand(73);
      // Pack 28 population members into the stage. MIN_DIST tuned so each
      // face has a small gap (~0.5% past touching) on average. If after
      // 8000 attempts we can't place all of them, accept what fits.
      var positions = [];
      var MIN_DIST = 10, attempts = 0;
      while (positions.length < TOTAL && attempts < 8000) {
        attempts++;
        var x = 7 + rand() * 86, y = 9 + rand() * 82;
        var tooClose = positions.some(function (p) { var dx = p.x - x, dy = p.y - y; return Math.sqrt(dx*dx + dy*dy) < MIN_DIST; });
        if (!tooClose) positions.push({ x: x, y: y });
      }
      // If packing fell short, relax once and try again — better than blanks.
      if (positions.length < TOTAL) {
        var MIN_DIST_RELAX = 9;
        var more = 0;
        while (positions.length < TOTAL && more < 5000) {
          more++;
          var x2 = 7 + rand() * 86, y2 = 9 + rand() * 82;
          var tooClose2 = positions.some(function (p) { var dx = p.x - x2, dy = p.y - y2; return Math.sqrt(dx*dx + dy*dy) < MIN_DIST_RELAX; });
          if (!tooClose2) positions.push({ x: x2, y: y2 });
        }
      }
      // Cluster geometry — 12 distinct readable faces, no clipping, no panel collision.
      // All values are % of the STAGE (not viewport).
      // Reasoning panel occupies right 38% (x ≥ 56%); cluster must stay left of 56%.
      // With CX=28 + R_OUTER=22 + outer_face_half=4.5 → rightmost edge = 54.5% ✓
      // With CX=28 - R_OUTER=22 - outer_face_half=4.5 → leftmost edge = 1.5% ✓
      var CLUSTER_CX = 28, CLUSTER_CY = 50;
      var R_INNER = 12;
      var R_OUTER = 22;
      var targets = [{ x: CLUSTER_CX, y: CLUSTER_CY }];
      for (var k = 0; k < 5; k++) {
        var a1 = (k / 5) * Math.PI * 2 - Math.PI / 2;
        targets.push({ x: CLUSTER_CX + Math.cos(a1) * R_INNER, y: CLUSTER_CY + Math.sin(a1) * R_INNER });
      }
      for (var k2 = 0; k2 < 6; k2++) {
        var a2 = (k2 / 6) * Math.PI * 2 - Math.PI / 3;
        targets.push({ x: CLUSTER_CX + Math.cos(a2) * R_OUTER, y: CLUSTER_CY + Math.sin(a2) * R_OUTER });
      }
      // Sizes as % of stage. Tight, non-overlapping packing.
      var POP_SIZE = 9.5;
      function clusterSize(idx) { return idx === 0 ? 12 : idx < 6 ? 9 : 9; }

      var members = [];
      HEADSHOTS.forEach(function (src, i) {
        var el = document.createElement('div');
        el.className = 'member idle';
        var pos = positions[i];
        el.style.left = pos.x + '%';
        el.style.top = pos.y + '%';
        el.style.width = POP_SIZE + '%';
        el.style.height = POP_SIZE + '%';
        el.style.transform = 'translate(-50%, -50%)';
        var img = document.createElement('img');
        img.src = src; img.loading = 'lazy'; img.decoding = 'async'; img.alt = '';
        el.appendChild(img);
        population.appendChild(el);
        members.push({ el: el, originalPos: pos });
      });
      members.forEach(function (m) {
        m.el.classList.add('pulsing');
        m.el.style.animationDelay = (rand() * 4).toFixed(2) + 's';
      });

      function pickSelected() {
        var idxs = [];
        for (var i = 0; i < TOTAL; i++) idxs.push(i);
        var r = makeRand(101);
        for (var j = idxs.length - 1; j > 0; j--) {
          var n = Math.floor(r() * (j + 1));
          var t = idxs[j]; idxs[j] = idxs[n]; idxs[n] = t;
        }
        return idxs.slice(0, SELECT_COUNT);
      }
      var selected = pickSelected();
      function setStep(n) { stepEls.forEach(function (el) { el.classList.remove('active'); }); if (n >= 0 && stepEls[n]) stepEls[n].classList.add('active'); }

      function runCycle() {
        return Promise.resolve().then(function () {
          members.forEach(function (m) {
            m.el.className = 'member idle pulsing';
            m.el.style.left = m.originalPos.x + '%';
            m.el.style.top  = m.originalPos.y + '%';
            m.el.style.width = POP_SIZE + '%';
            m.el.style.height = POP_SIZE + '%';
          });
          panel.classList.remove('show');
          criteria.forEach(function (el) { el.classList.remove('show'); });
          setStep(-1);
        }).then(function () { return wait(1000); }).then(function () {
          setStep(0);
          selected.forEach(function (idx, n) {
            setTimeout(function () { members[idx].el.classList.remove('idle', 'pulsing'); members[idx].el.classList.add('selected'); }, n * 50);
          });
          return wait(800);
        }).then(function () {
          setStep(1);
          members.forEach(function (m, i) { if (selected.indexOf(i) === -1) m.el.classList.add('faded'); });
          return wait(1300);
        }).then(function () {
          setStep(2);
          selected.forEach(function (idx, n) {
            var t = targets[n], s = clusterSize(n);
            members[idx].el.style.left = t.x + '%';
            members[idx].el.style.top  = t.y + '%';
            members[idx].el.style.width  = s + '%';
            members[idx].el.style.height = s + '%';
          });
          return wait(1100);
        }).then(function () {
          setStep(3);
          panel.classList.add('show');
          return wait(700);
        }).then(function () {
          var p = Promise.resolve();
          for (var i = 0; i < criteria.length; i++) (function (idx) {
            p = p.then(function () { criteria[idx].classList.add('show'); return wait(700); });
          })(i);
          return p;
        }).then(function () { return wait(3000); }).then(function () {
          panel.classList.remove('show');
          criteria.forEach(function (el) { el.classList.remove('show'); });
          members.forEach(function (m, i) { if (selected.indexOf(i) === -1) m.el.classList.remove('faded'); });
          return wait(800);
        });
      }
      function loop() { runCycle().then(loop); }

      if (reducedMotion) {
        selected.forEach(function (idx, n) {
          var t = targets[n], s = clusterSize(n);
          members[idx].el.classList.remove('idle', 'pulsing');
          members[idx].el.classList.add('selected');
          members[idx].el.style.left = t.x + '%'; members[idx].el.style.top = t.y + '%';
          members[idx].el.style.width = s + '%'; members[idx].el.style.height = s + '%';
        });
        members.forEach(function (m, i) { if (selected.indexOf(i) === -1) m.el.classList.add('faded'); });
        panel.classList.add('show');
        criteria.forEach(function (el) { el.classList.add('show'); });
        setStep(3);
      } else {
        whenInView(stage, loop, 0.3);
      }
    })();

    // SEGMENTS
    (function segmentsLoop() {
      var stage = root.querySelector('[data-loop="segments"]');
      if (!stage) return;
      var userBubble = stage.querySelector('.user-bubble');
      var promptEl   = stage.querySelector('.prompt-text');
      var cursor     = stage.querySelector('.cursor');
      var rowAi      = stage.querySelector('.row.ai');
      var choices    = stage.querySelector('.choice-row');
      var choiceExc  = stage.querySelector('.choice.exclude');
      var rowResult  = stage.querySelector('.row.result');
      var thread     = stage.querySelector('.thread');
      var roster     = stage.querySelector('.roster');
      var rosterList = stage.querySelector('.roster-list');
      var rosterMore = stage.querySelector('.roster-more');
      var moreStack  = stage.querySelector('.roster-more-stack');
      var stepEls    = stage.querySelectorAll('.step-rail .step');

      var ROSTER = [
        { name: 'Alana Ramirez',   role: 'Joined 14 days ago' },
        { name: 'Marcus Chen',     role: 'Joined 22 days ago' },
        { name: 'Priya Bhatt',     role: 'Joined 31 days ago' },
        { name: 'Jordan Whitley',  role: 'Joined 38 days ago' },
        { name: 'Elena Castillo',  role: 'Joined 47 days ago' },
        { name: 'Devon Okafor',    role: 'Joined 56 days ago' },
        { name: 'Sarah O’Brien', role: 'Joined 64 days ago' },
        { name: 'Tomas Lindqvist', role: 'Joined 78 days ago' }
      ];
      ROSTER.forEach(function (m, i) {
        var row = document.createElement('div');
        row.className = 'roster-row';
        row.innerHTML =
          '<div class="photo"><img src="' + HEADSHOTS[i] + '" alt="" loading="lazy" decoding="async"></div>' +
          '<div class="name">' + m.name + '</div>' +
          '<div class="role">' + m.role + '</div>';
        rosterList.appendChild(row);
      });
      for (var j = 8; j < 12 && j < HEADSHOTS.length; j++) {
        var ph = document.createElement('div');
        ph.className = 'photo';
        ph.innerHTML = '<img src="' + HEADSHOTS[j] + '" alt="" loading="lazy" decoding="async">';
        moreStack.appendChild(ph);
      }
      var rosterRows = rosterList.querySelectorAll('.roster-row');
      var fullText = 'Members who joined in the last 90 days and haven’t opened an email yet.';

      function setStep(n) { stepEls.forEach(function (el) { el.classList.remove('active'); }); if (n >= 0 && stepEls[n]) stepEls[n].classList.add('active'); }
      function reset() {
        promptEl.textContent = '';
        userBubble.classList.remove('typing', 'sent');
        rowAi.classList.remove('show');
        choices.classList.remove('show');
        rowResult.classList.remove('show');
        choiceExc.classList.remove('selected');
        if (cursor) cursor.style.display = 'inline-block';
        thread.classList.remove('scrolled-up');
        roster.classList.remove('show');
        rosterRows.forEach(function (r) { r.classList.remove('show'); });
        rosterMore.classList.remove('show');
        setStep(-1);
      }
      function typeText(txt) {
        return new Promise(function (resolve) {
          userBubble.classList.add('typing');
          var i = 0;
          (function step() {
            promptEl.textContent = txt.slice(0, i);
            if (i++ >= txt.length) { resolve(); return; }
            setTimeout(step, 40 + Math.random() * 35);
          })();
        });
      }
      function runCycle() {
        return Promise.resolve().then(function () { reset(); return wait(700); })
          .then(function () { setStep(0); return typeText(fullText); })
          .then(function () { if (cursor) cursor.style.display = 'none'; return wait(350); })
          .then(function () { userBubble.classList.remove('typing'); userBubble.classList.add('sent'); return wait(550); })
          .then(function () { setStep(1); rowAi.classList.add('show'); return wait(1500); })
          .then(function () { choices.classList.add('show'); return wait(750); })
          .then(function () { choiceExc.classList.add('selected'); setStep(2); return wait(1100); })
          .then(function () { setStep(3); rowResult.classList.add('show'); return wait(1700); })
          .then(function () { thread.classList.add('scrolled-up'); return wait(250); })
          .then(function () { roster.classList.add('show'); return wait(450); })
          .then(function () {
            var p = Promise.resolve();
            for (var i = 0; i < rosterRows.length; i++) (function (idx) { p = p.then(function () { rosterRows[idx].classList.add('show'); return wait(120); }); })(i);
            return p;
          })
          .then(function () { rosterMore.classList.add('show'); return wait(3500); })
          .then(function () {
            roster.classList.remove('show'); thread.classList.remove('scrolled-up');
            rowAi.classList.remove('show'); choices.classList.remove('show'); rowResult.classList.remove('show');
            rosterRows.forEach(function (r) { r.classList.remove('show'); });
            rosterMore.classList.remove('show');
            return wait(700);
          });
      }
      function loop() { runCycle().then(loop); }

      if (reducedMotion) {
        promptEl.textContent = fullText;
        userBubble.classList.add('sent');
        if (cursor) cursor.style.display = 'none';
        rowAi.classList.add('show'); choices.classList.add('show'); choiceExc.classList.add('selected');
        rowResult.classList.add('show'); thread.classList.add('scrolled-up'); roster.classList.add('show');
        rosterRows.forEach(function (r) { r.classList.add('show'); });
        rosterMore.classList.add('show'); setStep(3);
      } else {
        whenInView(stage, loop, 0.4);
      }
    })();

    // CONTENT WRITING
    (function cwLoop() {
      var stage = root.querySelector('[data-loop="cw"]');
      if (!stage) return;
      var workspace    = stage.querySelector('.workspace');
      var ctxItems     = stage.querySelectorAll('.context-item');
      var compose      = stage.querySelector('.email-compose');
      var subjectText  = stage.querySelector('.compose-subject');
      var paragraphs   = stage.querySelectorAll('.compose-body .para');
      var composeActs  = stage.querySelector('.compose-actions');
      var sparkOverlay = stage.querySelector('.spark-overlay');
      var stepEls      = stage.querySelectorAll('.step-rail .step');

      function setStep(n) { stepEls.forEach(function (el) { el.classList.remove('active'); }); if (n >= 0 && stepEls[n]) stepEls[n].classList.add('active'); }
      function reset() {
        ctxItems.forEach(function (el) { el.classList.remove('show'); });
        workspace.classList.remove('shifted');
        compose.classList.remove('show');
        composeActs.classList.remove('show');
        subjectText.classList.remove('show');
        paragraphs.forEach(function (p) { p.classList.remove('show'); });
        sparkOverlay.classList.remove('show');
        setStep(-1);
      }
      function runCycle() {
        return Promise.resolve().then(function () { reset(); return wait(600); })
          .then(function () {
            var p = Promise.resolve();
            for (var i = 0; i < ctxItems.length; i++) (function (idx) {
              p = p.then(function () { setStep(idx); ctxItems[idx].classList.add('show'); return wait(560); });
            })(i);
            return p;
          })
          .then(function () { return wait(450); })
          .then(function () { workspace.classList.add('shifted'); setStep(3); return wait(200); })
          .then(function () { compose.classList.add('show'); return wait(550); })
          .then(function () { sparkOverlay.classList.add('show'); return wait(400); })
          .then(function () { subjectText.classList.add('show'); return wait(180); })
          .then(function () { sparkOverlay.classList.remove('show'); return wait(160); })
          .then(function () {
            var p = Promise.resolve();
            for (var i = 0; i < paragraphs.length; i++) (function (idx) { p = p.then(function () { paragraphs[idx].classList.add('show'); return wait(220); }); })(i);
            return p;
          })
          .then(function () { return wait(350); })
          .then(function () { composeActs.classList.add('show'); return wait(4500); })
          .then(function () { compose.classList.remove('show'); composeActs.classList.remove('show'); workspace.classList.remove('shifted'); return wait(700); });
      }
      function loop() { runCycle().then(loop); }

      if (reducedMotion) {
        ctxItems.forEach(function (el) { el.classList.add('show'); });
        workspace.classList.add('shifted'); compose.classList.add('show');
        subjectText.classList.add('show'); paragraphs.forEach(function (p) { p.classList.add('show'); });
        composeActs.classList.add('show'); setStep(3);
      } else {
        whenInView(stage, loop, 0.4);
      }
    })();
  }

  // expose for the local preview harness only
  window.__pfRenderMembershipAIFeatures = renderMembershipAIFeatures;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
