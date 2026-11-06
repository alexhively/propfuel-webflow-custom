/* /ig: Instagram bio page. Since Nov 6 2026 it renders the /book-a-demo page itself (lp/book-a-demo-v2/page.js: brand film,
   Membership AI build video, proof, case-study cards, quotes, demo form), so /ig stays as fun as the demo page and picks up
   every change to it. The Webflow page is still a /book-a-demo duplicate loading this file deferred in <head>.
   - Attribution: webflow-enhancements.js tags untagged /ig visits instagram / profile / ig-bio (PF_DEMO_PAGE_UTM), and the
     demo page's forms send those as pf_last_utm_* like on /book-a-demo.
   - The Webflow hero + its demo form card are removed before DOMContentLoaded, so initDemoForm() finds no card and only the
     demo page's forms load (no second HubSpot form racing for the prefill URL params).
   The previous hand-built /ig (3-tap fit check, vs-table, FAQ) is in git history before this commit. */
(function () {
  if (!/^\/ig\/?$/.test(window.location.pathname)) return;
  if (document.getElementById('af-h1')) return;
  var st = document.createElement('style');
  st.textContent = ':root{color-scheme:light only}html,body{background:#F4F1EA!important}.pf-nav-bar,.pf-demo-hero{display:none!important}';
  document.head.appendChild(st);
  var hero = document.querySelector('.pf-demo-hero');
  if (hero) hero.parentNode.removeChild(hero);
  // page.js inserts its markup just before its own <script>, so put that script first in <body>.
  var s = document.createElement('script');
  s.src = 'https://alexhively.github.io/propfuel-webflow-custom/lp/book-a-demo-v2/page.js?v=1';
  document.body.insertBefore(s, document.body.firstChild);
})();
