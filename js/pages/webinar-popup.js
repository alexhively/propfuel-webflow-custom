/* Oct 28 2026 webinar pop-up ("How to Win Back Lapsed Members"). Loaded site-wide by
   webflow-enhancements.js. To reuse for another webinar, edit CFG only. */
(function () {
  'use strict';
  var BASE = 'https://alexhively.github.io/propfuel-webflow-custom/images/popups/';
  var CFG = {
    key: 'pfWebinarPop_2026-10-28_win-back',
    url: 'https://us02web.zoom.us/webinar/register/2217920948412/WN_mjMjfTodSMqD5MGThEKkFQ',
    img: BASE + 'win-back-oct28-840.jpg?v=1',
    webp: BASE + 'win-back-oct28-840.webp?v=1',
    alt: 'Free webinar: How to Win Back Lapsed Members, with Ryan Graham. Wednesday, October 28, 2026 at 2:00 PM ET. Register free.',
    expiresAt: '2026-10-28T14:00:00-04:00', // webinar start (18:00 UTC)
    delayMs: 8000,
    scrollPct: 0.4,
    capMs: 3 * 86400000,
    skipPaths: /^\/(book-a-demo|cats-ask|ai-campaign-builder|legal)(\/|$)/
  };

  var path = location.pathname.replace(/\/+$/, '') || '/';
  if (CFG.skipPaths.test(path)) return;
  if (Date.now() >= new Date(CFG.expiresAt).getTime()) return;
  if (/zoom\.(us|com)/i.test(document.referrer)) return;
  if (document.querySelector('.pf-wp-card')) return;

  function read() { try { return JSON.parse(localStorage.getItem(CFG.key) || '{}'); } catch (e) { return {}; } }
  function write(o) { try { localStorage.setItem(CFG.key, JSON.stringify(o)); } catch (e) {} }
  var seen = read();
  if (seen.clicked || (seen.shown && Date.now() - seen.shown < CFG.capMs)) return;

  function track(event) {
    var p = { webinar: 'win-back-lapsed-members-2026-10-28', page_path: location.pathname };
    try {
      if (window.posthog && typeof window.posthog.capture === 'function') window.posthog.capture(event, p);
      if (typeof window.gtag === 'function') window.gtag('event', event, p);
      else if (window.dataLayer && window.dataLayer.push) { p.event = event; window.dataLayer.push(p); }
    } catch (e) {}
  }

  var done = false;
  function show() {
    if (done) return;
    done = true;
    window.removeEventListener('scroll', onScroll);
    clearTimeout(timer);
    if (Date.now() >= new Date(CFG.expiresAt).getTime()) return;

    var st = document.createElement('style');
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

    var card = document.createElement('div');
    card.className = 'pf-wp-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Webinar: How to Win Back Lapsed Members, October 28 at 2:00 PM ET');
    card.innerHTML =
      '<a class="pf-wp-link" href="' + CFG.url + '" target="_blank" rel="noopener"><picture>' +
      '<source type="image/webp" srcset="' + CFG.webp + '"><img src="' + CFG.img + '" width="840" height="840" alt="' + CFG.alt + '"></picture></a>' +
      '<button type="button" class="pf-wp-x" aria-label="Close webinar pop-up">&times;</button>';
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
      write({ shown: Date.now(), clicked: true });
      track('webinar_popup_click');
      close();
    });
    try { x.focus({ preventScroll: true }); } catch (e) {}
    write({ shown: Date.now() });
    // The lead-magnet slide-in sits in the same corner; skip it this session.
    try { sessionStorage.setItem('pfLM_shown', '1'); } catch (e) {}
    track('webinar_popup_view');
  }

  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0 && window.scrollY / h >= CFG.scrollPct) show();
  }
  var timer = setTimeout(show, CFG.delayMs);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
