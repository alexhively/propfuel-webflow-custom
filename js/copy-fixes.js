// Claims + typography fixes (Oct 19 2026 sprint). Loaded by loadCopyFixes() in webflow-enhancements.js.
// Live on all hosts since Alex's OK (Oct 19 2026). The site-script copy is also fixed at the source; these text
// fixes remain a safety net for the same wording in Webflow embeds.
//  1. Setup/sync wording: the July 2026 audit removed "hourly" sync, guaranteed "real-time" AMS write-back,
//     "5-30 minutes" setup, "plug-and-play", "connected in minutes", "No IT project" and the PropFuel API (none exists).
//  2. The 12% revenue-growth stat always sits next to "vs 0.98% for the average association".
//  3. Front-facing tagline is "Know and Grow Your Membership".
//  4. No orphan words: text-wrap balance on headings, buttons and labels; pretty on body copy.
// Runs on load and again as page scripts inject content (MutationObserver, stops after 15s).
// window.__pfCopyFixes lists what was applied, for QA.
(function () {
  if (window.__pfCopyFixesLoaded) return;
  window.__pfCopyFixesLoaded = true;
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var applied = (window.__pfCopyFixes = []);

  var css = document.createElement('style');
  css.id = 'pf-copy-fixes';
  css.textContent = 'h1,h2,h3,h4,h5,blockquote,button,.w-button,a[class*="btn"],a[class*="button"],[class*="eyebrow"],[class*="label"],[class*="pill"]{text-wrap:balance}' +
    'p,li,figcaption,dd,summary{text-wrap:pretty}';
  document.head.appendChild(css);

  // [path, exact text as it stands, replacement]. Paths without a trailing slash; '*' = every page.
  var FIXES = [
    ['/', 'Connecting your AMS typically takes 5–30 minutes, staff training', 'Our team connects your AMS with you, staff training'],
    ['/platform/overview', 'It pulls member data from your AMS, typically every hour, and writes every response back in real time — mapped to', 'Responses write back to your AMS automatically where your AMS supports it, mapped to'],
    ['/platform/overview', ' Most connections take 5–30 minutes to set up.', ' Our team handles setup with you.'],
    ['/platform/overview', 'The AMS connection is plug-and-play, staff training', 'Staff training'],
    ['/platform/overview', 'a Zapier connector and the PropFuel API are available', 'a Zapier connector is available'],
    // The CTA's last word is a highlighted span: swap each text node so the span keeps its gradient.
    ['/platform/overview', 'Ready to Make Membership', 'Ready to Know and Grow'],
    ['/platform/overview', 'Meaningful?', 'Your Membership?'],
    ['/integrations', 'Connected in minutes.', 'Answers written back.'],
    ['/integrations', 'Connect your AMS in minutes.', 'We connect your AMS with you.'],
    ['/integrations', 'No IT project. ', ''],
    ['/use-cases/onboarding', 'writes back to your AMS automatically in real time.', 'writes back to your AMS automatically, where your AMS supports it.'],
    ['/use-cases/onboarding', 'that data appears in their AMS record immediately.', 'that answer is saved to their AMS record.'],
    ['/use-cases/onboarding', 'writes back to their AMS record in real time.', 'writes back to their AMS record automatically.'],
    ['/use-cases/data-intelligence', 'Real-time write-back.', 'Automatic write-back.'],
    ['/use-cases/data-intelligence', 'Setup takes 5–30 minutes.', 'Our team handles setup with you.'],
    ['/use-cases/renewals', ', which typically runs hourly', ''],
    ['/platform/insights', 'writes back to your AMS automatically in real time.', 'writes back to your AMS automatically.'],
    ['/platform/automation', 'writes back to your AMS in real time', 'writes back to your AMS automatically'],
    ['/ig', 'after implementing PropFuel', 'after implementing PropFuel, vs 0.98% for the average association']
  ];
  var mine = FIXES.filter(function (f) { return f[0] === '*' || f[0] === path; });
  var done = {};

  function textFixes() {
    if (!mine.length) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) {
      for (var i = 0; i < mine.length; i++) {
        if (n.data.indexOf(mine[i][1]) === -1) continue;
        n.data = n.data.split(mine[i][1]).join(mine[i][2]);
        if (!done[i]) { done[i] = 1; applied.push('text: ' + mine[i][1].slice(0, 50)); }
      }
    }
    // Text split across inline tags (<strong>, <br>, spans): rewrite the smallest element that holds the whole phrase.
    for (var j = 0; j < mine.length; j++) {
      if (done[j]) continue;
      var hit = null;
      document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,span,div').forEach(function (el) {
        if (el.textContent.indexOf(mine[j][1]) !== -1 && (!hit || hit.contains(el))) hit = el;
      });
      if (hit && hit.textContent.length < 400) {
        hit.textContent = hit.textContent.split(mine[j][1]).join(mine[j][2]);
        done[j] = 1; applied.push('element: ' + mine[j][1].slice(0, 50));
      }
    }
  }

  // Any "12%" stat whose card says "annual revenue growth" but has no 0.98% gets the comparison appended to its label.
  function statFixes() {
    document.querySelectorAll('body *').forEach(function (el) {
      if (el.children.length || el.textContent.trim() !== '12%' || el.closest('[data-pf098]')) return;
      var card = el.parentElement, hops = 0;
      while (card && hops < 3 && !/annual revenue growth/i.test(card.textContent)) { card = card.parentElement; hops++; }
      if (!card || hops >= 3 || /0\.98/.test(card.textContent) || card.textContent.length > 600) return;
      // The stat's own label = the first non-empty text after the number (in a row of stats, not a neighbour's label).
      var w = document.createTreeWalker(card, NodeFilter.SHOW_TEXT), n, last = null;
      while ((n = w.nextNode())) if (n.data.trim() && !el.contains(n) && (el.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING)) { last = n; break; }
      if (!last) return;
      card.setAttribute('data-pf098', '');
      last.data = last.data.replace(/\s*$/, '') + ', vs 0.98% for the average association';
      applied.push('stat: 12% + 0.98%');
    });
  }

  function run() { textFixes(); statFixes(); }
  run();
  var t, mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(run, 120); });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  setTimeout(function () { mo.disconnect(); run(); }, 15000);
})();
