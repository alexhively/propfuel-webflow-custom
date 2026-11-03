/* Website pop-ups from the Marketing OS (Nov 3 2026). Loaded site-wide by webflow-enhancements.js.
   Pop-ups are made in the OS (MCP update_popup; rules in the OS doc "Web Pop-ups - Master.md"), not here:
   this file reads the live ones from the OS feed and shows at most one per visit, in the corner card style of
   the Oct 28 webinar pop-up. ?pf_popup=<id> previews a draft (ignores the cap and timing). */
(function () {
  'use strict';
  var FEED = 'https://propfuel-marketing-os.vercel.app/api/popups';
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var preview = (location.search.match(/[?&]pf_popup=([a-z0-9-]+)/) || [])[1] || '';
  if (document.querySelector('.pf-wp-card')) return;
  if (!preview && /zoom\.(us|com)/i.test(document.referrer)) return;

  function on(p, r) { return r === '*' || (r === '/' ? p === '/' : p === r || p.indexOf(r + '/') === 0); }
  function key(id) { return 'pfPopup_' + id; }
  function read(id) { try { return JSON.parse(localStorage.getItem(key(id)) || '{}'); } catch (e) { return {}; } }
  function write(id, o) { try { localStorage.setItem(key(id), JSON.stringify(o)); } catch (e) {} }
  function capped(p) { var s = read(p.id); return s.clicked || (s.shown && Date.now() - s.shown < p.cap_days * 86400000); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  fetch(FEED + (preview ? '?preview=' + preview : ''), { credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : { popups: [] }; })
    .then(function (d) {
      var list = (d && d.popups) || [];
      var pop = null;
      for (var i = 0; i < list.length && !pop; i++) {
        var p = list[i];
        if (preview) { if (p.id === preview) pop = p; continue; }
        if (p.preview || Date.now() >= Date.parse(p.ends_at)) continue;
        if (p.skip.some(function (s) { return on(path, s); })) continue;
        if (!p.pages.some(function (r) { return on(path, r); })) continue;
        if (!capped(p)) pop = p;
      }
      if (pop) arm(pop);
    })
    .catch(function () {});

  function track(event, pop) {
    var p = { popup: pop.id, page_path: location.pathname };
    try {
      if (window.posthog && typeof window.posthog.capture === 'function') window.posthog.capture(event, p);
      if (typeof window.gtag === 'function') window.gtag('event', event, p);
      else if (window.dataLayer && window.dataLayer.push) { p.event = event; window.dataLayer.push(p); }
    } catch (e) {}
  }

  function arm(pop) {
    // A pop-up has priority over the lead-magnet poll (same corner): claim the session.
    if (!preview) try { sessionStorage.setItem('pfLM_shown', '1'); } catch (e) {}
    var done = false, timer;
    function onScroll() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h >= pop.scroll_pct / 100) show();
    }
    function show() {
      if (done) return;
      done = true;
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
      if (!preview && Date.now() >= Date.parse(pop.ends_at)) return;
      // Another pop-up already open: skip this page view (not recorded as shown, so it returns next page).
      if (!preview && window.pfPopupOpen && window.pfPopupOpen()) return;
      if (!document.getElementById('pf-wp-styles')) {
        var st = document.createElement('style');
        st.id = 'pf-wp-styles';
        st.textContent =
          '.pf-wp-card{position:fixed;z-index:9997;right:max(24px,env(safe-area-inset-right));bottom:max(24px,env(safe-area-inset-bottom));width:min(420px,90vw,calc(100vh - 48px));aspect-ratio:1/1;border-radius:18px;box-shadow:0 24px 60px rgba(26,23,20,.28),0 6px 18px rgba(26,23,20,.14);background:#F6F2E8;opacity:0;transform:translateY(24px);transition:transform .35s cubic-bezier(.2,.8,.2,1),opacity .35s ease}' +
          '.pf-wp-card.pf-wp-in{opacity:1;transform:none}' +
          '.pf-wp-link{display:block;width:100%;height:100%;border-radius:18px;overflow:hidden}' +
          '.pf-wp-link:focus-visible{outline:3px solid #F47C2C;outline-offset:3px}' +
          '.pf-wp-link img{display:block;width:100%;height:100%;object-fit:cover}' +
          '.pf-wp-x{position:absolute;top:-14px;right:-14px;width:36px;height:36px;border:1px solid #E3DDD2;border-radius:50%;background:#fff;color:#2F2F2F;font:400 22px/1 system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(26,23,20,.25)}' +
          '.pf-wp-x::after{content:"";position:absolute;inset:-4px}' + // 44px hit area
          '.pf-wp-x:hover{background:#F6F2E8}.pf-wp-x:focus-visible{outline:3px solid #F47C2C;outline-offset:2px}' +
          '@media (max-width:600px){.pf-wp-card{right:auto;left:50%;margin-left:calc(min(420px,90vw,calc(100vh - 48px)) / -2);bottom:max(16px,env(safe-area-inset-bottom))}}' +
          '@media (prefers-reduced-motion:reduce){.pf-wp-card{transition:opacity .2s ease;transform:none}}';
        document.head.appendChild(st);
      }
      var card = document.createElement('div');
      card.className = 'pf-wp-card';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-label', pop.alt);
      card.innerHTML =
        '<a class="pf-wp-link" href="' + esc(pop.link) + '" target="_blank" rel="noopener">' +
        '<img src="' + esc(pop.img) + '" width="840" height="840" alt="' + esc(pop.alt) + '"></a>' +
        '<button type="button" class="pf-wp-x" aria-label="Close pop-up">&times;</button>';
      document.body.appendChild(card);
      void card.offsetWidth;
      card.classList.add('pf-wp-in');

      var x = card.querySelector('.pf-wp-x');
      function close() {
        document.removeEventListener('keydown', onKey);
        card.classList.remove('pf-wp-in');
        setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 350);
      }
      function onKey(e) { if (e.key === 'Escape') close(); }
      x.addEventListener('click', close);
      document.addEventListener('keydown', onKey);
      card.querySelector('.pf-wp-link').addEventListener('click', function () {
        if (!preview) write(pop.id, { shown: Date.now(), clicked: true });
        track('popup_click', pop);
        close();
      });
      try { x.focus({ preventScroll: true }); } catch (e) {}
      if (!preview) { write(pop.id, { shown: Date.now() }); track('popup_view', pop); }
    }
    if (preview) return show();
    timer = setTimeout(show, pop.delay_s * 1000);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
