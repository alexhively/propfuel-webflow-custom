/* /ig: Instagram bio demo page (bio: "Know and Grow Your Membership. / Trusted by 370+ associations to ask members
   one question at a time, and act on the answer. / See it with your members ↓").
   Mobile-first, built from the Meta landing-page work (propfuel-meta-ads: research/landing-pages/teardown.md,
   landing-pages/see-it-with-your-members.html):
     - qualifier first line, headline that continues the bio, one sourced proof line
     - one CTA: a 3-tap fit check (one question per screen, PropFuel's own mechanic), visible on the first screen,
       ending at the demo form; the CTA repeats after every proof block
     - sample one-question email card, 3 named results from live case studies, "what you'll see", vs-today, FAQ
   The Webflow page is a duplicate of /book-a-demo: the .pf-demo-form-card keeps the HubSpot demo form (f8009d2f),
   ChiliPiper, Meta Lead/Schedule + CAPI, LinkedIn 31101610, click IDs and the ig-bio UTM defaults
   (webflow-enhancements.js). The form has no fit-check fields, so answers go to PostHog only. */
(function () {
  if (!/^\/ig\/?$/.test(window.location.pathname)) return;
  if (document.getElementById('pfig')) return;
  var root = document.documentElement;
  var CS = 'https://www.propfuel.com/case-studies/';

  // ---------------------------------------------------------------- content
  var FIT = [
    { q: 'What do you want to fix first?', a: [['Renewals', 'Too many members lapse'], ['First-year members', 'New members drift away'], ['Member data', 'We don’t know what members want'], ['Events and non-dues', 'Registrations, certification, products']] },
    { q: 'How many members do you have?', a: [['Under 2,000'], ['2,000 to 10,000'], ['10,000 to 50,000'], ['More than 50,000']] },
    { q: 'When would you want this running?', a: [['This quarter'], ['Next quarter'], ['Next renewal cycle'], ['Just looking']] }
  ];
  // matched to the fit-check goal; live case studies only, numbers as on the live pages
  var MATCH = [
    { num: '1,078', text: 'renewals so far from one renewal and lapsed-member check-in, at a 40% engagement rate.', org: 'Geological Society of America', url: CS + 'gsa-renewal-lapsed-member-check-in' },
    { num: '2x', text: 'new member engagement from an onboarding series that asks first.', org: 'Academy of Model Aeronautics', url: CS + 'how-ama-doubled-new-member-engagement-with-personalized-onboarding' },
    { num: '996', text: 'institutions answered one yes/no question, and 67 new chief business officer contacts came in.', org: 'NACUBO', url: CS + 'nacubo-chief-business-officer-contact-check-in' },
    { num: '$315,300', text: 'in revenue from website engagement, and 10% of conference registrations.', org: 'VECCS', url: CS + 'how-veccs-drove-10-of-conference-registrations-with-website-engagement' }
  ];
  var CASES = [
    { num: '2,246', text: 'answers to one question, with an 18% average engagement rate.', org: 'AWHONN', url: CS + 'awhonn-lapsed-member-check-in' },
    { num: '38.3%', text: 'response rate when one question went on 1,502 autorenewal notices.', org: 'Texas Society of CPAs', url: CS + 'txcpa-autorenewal-response' },
    { num: '1,078', text: 'renewals so far from one renewal and lapsed-member check-in, at a 40% engagement rate.', org: 'Geological Society of America', url: CS + 'gsa-renewal-lapsed-member-check-in' }
  ];
  var SEE = [
    'One renewal or onboarding campaign built for an association your size',
    'The one-question emails your members would get, and what each answer triggers',
    'How answers land on the member record, and who gets flagged for a call',
    'Membership AI drafting the next campaign for your team to approve'
  ];
  var VS = [
    ['Annual member survey', 'Once a year, from the few who finish it', 'One question at a time, all year, one tap to answer'],
    ['Renewal phone calls', 'Weeks of calls, after members have already gone quiet', 'At-risk members flagged before the renewal notice'],
    ['AMS email blasts', 'The same message to everyone, nothing comes back', 'The next message depends on what each member said']
  ];
  var FAQ = [
    ['Does PropFuel replace the AMS we use?', 'No. Keep your AMS. PropFuel connects to it, asks members what they need and acts on the answer.'],
    ['Won’t members get tired of surveys?', 'It isn’t a survey. Members get one question at a time, answered with one tap, and what they hear next depends on their answer.'],
    ['We’re a small team. Who builds the campaigns?', 'A dedicated success manager builds the first ones with you, and Membership AI drafts the audience, campaign and copy for your team to approve.'],
    ['What does it cost?', 'It depends on your membership and what you want to run. We’ll walk through pricing on the call.'],
    ['What happens after I book?', 'You pick a time on the calendar right after the form. The demo uses a goal you care about, like renewals or first-year onboarding.']
  ];

  // ---------------------------------------------------------------- styles (light only: IG in-app browser + iOS dark mode)
  var css = '' +
    ':root{color-scheme:light only}html,body{background:#F4F1EA!important;color:#2F2F2F}' +
    '.pfig,.pfig-hero{--ink:#2F2F2F;--mute:#5F5F5F;--page:#F4F1EA;--card:#F6F2E8;--white:#FFFDF8;--line:#E3DDD2;--or:#F47C2C;--deep:#F05A28;--rust:#A9431B;--peach:#FDEBDD;--olive:#5F7A36;' +
      'font-family:"DM Sans",-apple-system,BlinkMacSystemFont,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}' +
    '.pfig *,.pfig-hero *{box-sizing:border-box}' +
    '.pfig :where(h2,h3,p,ul,ol,li,blockquote){margin:0;padding:0}.pfig :where(ul,ol){list-style:none}' +
    '.pfig-hero :where(p,h1){margin-bottom:0}.pfig-match p{margin-bottom:0!important}' +
    /* nav: logo + one button that goes to the fit check */
    'html.pfig-on .pf-nav-links,html.pfig-on .pf-nav-right>a:not(.pf-btn-nav),html.pfig-on .pf-hamburger{display:none!important}' +
    'html.pfig-on .pf-nav-right{display:flex!important}' +
    /* hero: replace the generic /book-a-demo text column */
    'html.pfig-on .pf-demo-hero-inner>div:first-child>:not(.pfig-hero){display:none!important}' +
    '.pfig-eyebrow{display:block;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--rust)}' +
    '.pfig-h1{font-size:clamp(30px,8.2vw,52px);font-weight:800;line-height:1.05;letter-spacing:-.03em;margin:8px 0 0;color:var(--ink)}' +
    '.pfig-sub{font-size:17px;line-height:1.45;color:#444;margin:10px 0 0;max-width:38ch}' +
    '.pfig-proof{display:flex;align-items:flex-start;gap:8px;line-height:1.35;margin:12px 0 0;font-size:15px;font-weight:700;color:var(--ink)}' +
    '.pfig-proof:before{content:"\\2713";display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--or);color:#fff;font-size:12px;flex:none}' +
    /* fit check */
    '.pfig-fit{margin-top:16px;background:var(--white);border:1px solid var(--line);border-radius:16px;padding:16px;box-shadow:0 14px 34px rgba(110,90,40,.12);scroll-margin-top:92px}' +
    '.pfig-fit-top{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}' +
    '.pfig-fit-q{font-size:20px;font-weight:800;line-height:1.2;letter-spacing:-.01em;margin:8px 0 12px;color:var(--ink)}' +
    '.pfig-tiles{display:grid;gap:8px}' +
    '.pfig button.pfig-tile,.pfig-hero button.pfig-tile{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;width:100%;min-height:52px;text-align:left;padding:10px 14px;border-radius:12px;' +
      'border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:600 16px/1.25 "DM Sans",sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:border-color .15s ease,background .15s ease}' +
    '.pfig-tile small{font-weight:400;font-size:13px;color:var(--mute);margin-top:2px}' +
    '.pfig-tile:active,.pfig-tile:hover{border-color:var(--or);background:var(--peach)}' +
    '.pfig-bar{height:4px;border-radius:4px;background:var(--line);margin-top:12px;overflow:hidden}.pfig-bar i{display:block;height:100%;background:var(--or);transform-origin:left;transition:transform .25s ease}' +
    '.pfig-fit-foot{display:flex;justify-content:space-between;align-items:center;margin-top:4px}' +
    '.pfig-hero .pfig-quiet{display:inline-flex;align-items:center;min-height:44px;padding:0 2px;background:none;border:0;color:var(--mute)!important;' +
      'font:600 14px "DM Sans",sans-serif;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.pfig-hero .pfig-quiet:hover,.pfig-hero .pfig-quiet:active{color:var(--ink)!important}' +
    '.pfig-hero a.pfig-link,.pfig-hero button.pfig-link,.pfig a.pfig-link{background:none;border:0;padding:0;color:#3D6E92;text-decoration:underline;text-underline-offset:3px;font:500 14px "DM Sans",sans-serif;cursor:pointer}' +
    '.pfig-match{margin:0 0 12px;padding:12px;border-radius:12px;background:var(--card);border:1px solid var(--line)}' +
    '.pfig-match span{display:block;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--mute)}' +
    '.pfig-match b{display:block;font-size:26px;font-weight:800;letter-spacing:-.02em;line-height:1.15;color:var(--ink);margin-top:4px}.pfig-match p{font-size:14px;line-height:1.4;color:#444;margin-top:2px}' +
    /* body */
    '.pfig{background:var(--page)}' +
    '.pfig-wrap{max-width:1080px;margin:0 auto;padding:0 20px}' +
    '.pfig-sec{padding:44px 0;border-top:1px solid var(--line)}' +
    '.pfig-h2{font-size:clamp(24px,6.4vw,34px);font-weight:800;line-height:1.12;letter-spacing:-.02em;margin-top:6px;color:var(--ink);max-width:24ch}' +
    '.pfig-lede{font-size:16px;color:#444;margin-top:8px;max-width:56ch}' +
    '.pfig-qcard{margin-top:18px;max-width:440px;background:var(--white);border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:0 14px 34px rgba(110,90,40,.12)}' +
    '.pfig-qmeta{display:flex;justify-content:space-between;font-size:12px;color:var(--mute)}.pfig-qmeta em{font-style:normal;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--rust)}' +
    '.pfig-qq{font-size:19px;font-weight:700;line-height:1.25;margin:10px 0 12px;color:var(--ink)}' +
    '.pfig-qcard button.pfig-tile.is-on{border-color:var(--or);background:var(--peach)}' +
    '.pfig-qres{margin-top:10px;font-size:14px;font-weight:600;color:var(--olive);min-height:20px}' +
    '.pfig-cases{display:grid;gap:12px;margin-top:18px}' +
    '.pfig a.pfig-case{display:block;text-decoration:none;color:var(--ink);background:var(--white);border:1px solid var(--line);border-radius:14px;padding:16px}' +
    '.pfig-case b{display:block;font-size:30px;font-weight:800;letter-spacing:-.02em;color:var(--ink)}.pfig-case p{font-size:15px;color:#444;margin-top:4px}' +
    '.pfig-case span{display:flex;justify-content:space-between;gap:10px;font-size:13px;font-weight:700;color:var(--mute);margin-top:10px}.pfig-case span i{font-style:normal;color:var(--rust)}' +
    '.pfig-see{display:grid;gap:10px;margin-top:16px;counter-reset:s}' +
    '.pfig-see li{position:relative;padding:12px 14px 12px 46px;background:var(--white);border:1px solid var(--line);border-radius:12px;font-size:15px;color:var(--ink)}' +
    '.pfig-see li:before{counter-increment:s;content:counter(s);position:absolute;left:14px;top:11px;width:22px;height:22px;border-radius:50%;background:var(--or);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}' +
    '.pfig-vs{display:grid;gap:12px;margin-top:16px}' +
    '.pfig-vs>div{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--white)}' +
    '.pfig-vs h3{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);padding:12px 14px 0}' +
    '.pfig-vs p{font-size:15px;padding:6px 14px 12px;color:#444}.pfig-vs p.us{background:var(--peach);color:var(--ink);font-weight:600;padding:10px 14px}' +
    '.pfig-vs p.us:before{content:"With PropFuel: ";color:var(--rust)}' +
    '.pfig-faq{margin-top:14px;border-top:1px solid var(--line)}.pfig-faq details{border-bottom:1px solid var(--line)}' +
    '.pfig-faq summary{list-style:none;cursor:pointer;padding:16px 32px 16px 0;font-weight:700;font-size:16px;position:relative;color:var(--ink)}.pfig-faq summary::-webkit-details-marker{display:none}' +
    '.pfig-faq summary:after{content:"+";position:absolute;right:4px;top:12px;font-size:24px;font-weight:400;color:var(--or)}.pfig-faq details[open] summary:after{content:"\\2212"}' +
    '.pfig-faq p{font-size:15px;color:#444;padding:0 0 16px}' +
    '.pfig a.pfig-btn,.pfig-hero a.pfig-btn{display:flex;align-items:center;justify-content:center;min-height:52px;margin-top:20px;padding:0 24px;border-radius:12px;background:var(--or);color:#2F2F2F!important;white-space:nowrap;' +
      'font:800 17px/1.2 "DM Sans",sans-serif;text-decoration:none;max-width:420px;box-shadow:0 6px 18px rgba(240,90,40,.22)}' +
    '.pfig-hero a.pfig-btn--full{margin-top:0;max-width:none;width:100%}' +
    '.pfig a.pfig-btn:active,.pfig-hero a.pfig-btn:active{background:var(--deep)}' +
    '.pfig-tag{margin-top:14px;font-weight:700;color:var(--mute)}' +
    '@media (min-width:768px){.pfig-cases{grid-template-columns:repeat(3,1fr)}.pfig-see{grid-template-columns:1fr 1fr}.pfig-vs{grid-template-columns:repeat(3,1fr)}.pfig-sec{padding:64px 0}}' +
    '@media (max-width:767px){' +
      /* first screen: tighter hero so the fit check sits above the fold inside Instagram\'s browser */
      /* hero clears the floating nav pill (bottom ~84px) by ~28px; one 16px gutter for hero, fit card and form card */
      'html.pfig-on .pf-demo-hero{padding:112px 16px 28px!important}' +
      'html.pfig-on .pf-demo-hero-inner{gap:16px!important;padding:0!important}' +
      'html.pfig-on .pf-demo-form-card{padding:20px 16px!important;border-radius:16px!important}' +
      'html.pfig-on .pf-demo-form-heading{font-size:22px!important;margin:0!important}' +
      'html.pfig-on #hs-demo-form{margin-top:12px!important}' +
      '.pfig-wrap{padding:0 16px}' +
    '}';
  var st = document.createElement('style'); st.id = 'pfig-styles'; st.textContent = css; document.head.appendChild(st);
  root.classList.add('pfig-on');

  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ph(ev, props) { try { if (window.posthog && window.posthog.capture) window.posthog.capture(ev, props); } catch (e) {} }
  var card = document.querySelector('.pf-demo-form-card');
  if (card) {
    card.id = 'pfig-form';
    card.style.scrollMarginTop = '92px';
    var fh = card.querySelector('.pf-demo-form-heading'), fp = card.querySelector('.pf-paragraph-small');
    if (fh) fh.textContent = 'Book your demo';
    if (fp) fp.style.display = 'none';
  }
  function go(id) {
    var t = document.getElementById(id); if (!t) return;
    // the fixed nav pill floats over the top ~90px
    var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 100, behavior: smooth ? 'smooth' : 'auto' });
    // sections slide in (site scroll animation), which moves the target after the first scroll; settle once
    setTimeout(function () { var y = t.getBoundingClientRect().top; if (Math.abs(y - 100) > 6) window.scrollTo({ top: y + window.pageYOffset - 100, behavior: smooth ? 'smooth' : 'auto' }); }, 900);
  }

  // ---------------------------------------------------------------- hero + fit check
  var col = document.querySelector('.pf-demo-hero-inner > div:first-child');
  var hero = el('div', 'pfig-hero');
  hero.innerHTML =
    '<span class="pfig-eyebrow">For membership teams at associations</span>' +
    '<h1 class="pfig-h1">See it with your members.</h1>' +
    '<p class="pfig-sub">One question at a time tells you who’s at risk, who’s ready for more, and what to send next.</p>' +
    '<p class="pfig-proof"><span>Trusted by 370+ associations \u00b7 12% average annual revenue growth after implementing PropFuel</span></p>' +
    '<div class="pfig-fit" id="pfig-fit" aria-live="polite"></div>';
  if (col) { col.insertBefore(hero, col.firstChild); var oldH1 = col.querySelector('h1.pf-demo-title'); if (oldH1) oldH1.removeAttribute('class'); }
  var fit = hero.querySelector('#pfig-fit'), step = 0, ans = [];
  function renderFit() {
    fit.innerHTML = '';
    if (step >= FIT.length) {
      var m = MATCH[ans[0]];
      fit.appendChild(el('div', 'pfig-fit-top', '<span>Your match</span><span>3 of 3</span>'));
      fit.appendChild(el('p', 'pfig-fit-q', ans[2] === 3 ? 'No pressure. Here’s the closest story to yours.' : 'Good fit. Associations with your goal start here.'));
      fit.appendChild(el('div', 'pfig-match', '<span>' + esc(m.org) + '</span><b>' + esc(m.num) + '</b><p>' + esc(m.text) + '</p>'));
      var cta = el('a', 'pfig-btn pfig-btn--full', 'Pick a demo time'); cta.href = '#pfig-form';
      fit.appendChild(cta);
      var again = el('button', 'pfig-quiet', '← Start over'); again.type = 'button'; again.style.marginTop = '4px';
      again.addEventListener('click', function () { step = 0; ans = []; renderFit(); });
      fit.appendChild(again);
      ph('ig_fit_check_completed', { fit_goal: FIT[0].a[ans[0]][0], fit_members: FIT[1].a[ans[1]][0], fit_timing: FIT[2].a[ans[2]][0] });
      if (window.innerWidth < 768) setTimeout(function () { go('pfig-form'); }, 900);
      return;
    }
    var s = FIT[step];
    fit.appendChild(el('div', 'pfig-fit-top', '<span>See if PropFuel fits · 3 taps</span><span>' + (step + 1) + ' of ' + FIT.length + '</span>'));
    fit.appendChild(el('p', 'pfig-fit-q', esc(s.q)));
    var tiles = el('div', 'pfig-tiles');
    s.a.forEach(function (a, k) {
      var b = el('button', 'pfig-tile', esc(a[0]) + (a[1] ? '<small>' + esc(a[1]) + '</small>' : ''));
      b.type = 'button';
      b.addEventListener('click', function () { ans[step] = k; if (step === 0) ph('ig_fit_check_started', {}); step++; renderFit(); });
      tiles.appendChild(b);
    });
    fit.appendChild(tiles);
    fit.appendChild(el('div', 'pfig-bar', '<i style="transform:scaleX(' + (step / FIT.length) + ')"></i>'));
    var foot = el('div', 'pfig-fit-foot');
    if (step > 0) { var back = el('button', 'pfig-quiet', '← Back'); back.type = 'button'; back.addEventListener('click', function () { step--; renderFit(); }); foot.appendChild(back); }
    else foot.appendChild(el('span'));
    var skip = el('a', 'pfig-quiet', 'Skip to the form'); skip.href = '#pfig-form'; foot.appendChild(skip);
    fit.appendChild(foot);
  }
  renderFit();

  // ---------------------------------------------------------------- body
  function cta() { return '<a class="pfig-btn" href="#pfig-fit">See it with your members</a>'; }
  var html = '';
  html += '<section class="pfig-sec"><div class="pfig-wrap"><span class="pfig-eyebrow">What your members get</span>' +
    '<h2 class="pfig-h2">One question. One tap. You act on the answer.</h2>' +
    '<div class="pfig-qcard"><div class="pfig-qmeta"><span>From: Your Association</span><em>Sample</em></div>' +
    '<p class="pfig-qq">How has your membership been this year?</p><div class="pfig-tiles">' +
    [['Great, I use it a lot', 'Tagged: engaged. Next: an invite to volunteer or speak.'],
     ['It’s been OK', 'Tagged: neutral. Next: a nudge toward the benefit they use least.'],
     ['Not getting much from it', 'Tagged: at risk. Your team gets a heads-up to call.']].map(function (o) {
      return '<button type="button" class="pfig-tile" data-r="' + esc(o[1]) + '">' + esc(o[0]) + '</button>';
    }).join('') + '</div><p class="pfig-qres" aria-live="polite">Tap an answer. That’s all your member does.</p></div></div></section>';
  html += '<section class="pfig-sec"><div class="pfig-wrap"><span class="pfig-eyebrow">Client results</span>' +
    '<h2 class="pfig-h2">What associations got from one question</h2><div class="pfig-cases">' +
    CASES.map(function (c) {
      return '<a class="pfig-case" href="' + c.url + '" target="_blank" rel="noopener"><b>' + esc(c.num) + '</b><p>' + esc(c.text) + '</p><span>' + esc(c.org) + '<i>Case study →</i></span></a>';
    }).join('') + '</div>' + cta() + '</div></section>';
  html += '<section class="pfig-sec"><div class="pfig-wrap"><span class="pfig-eyebrow">The demo</span>' +
    '<h2 class="pfig-h2">What you’ll see in 20 minutes</h2><ol class="pfig-see">' +
    SEE.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' + cta() + '</div></section>';
  html += '<section class="pfig-sec"><div class="pfig-wrap"><span class="pfig-eyebrow">Today vs. PropFuel</span>' +
    '<h2 class="pfig-h2">What membership teams do today, and what changes</h2><div class="pfig-vs">' +
    VS.map(function (v) { return '<div><h3>' + esc(v[0]) + '</h3><p>' + esc(v[1]) + '</p><p class="us">' + esc(v[2]) + '</p></div>'; }).join('') +
    '</div>' + cta() + '</div></section>';
  html += '<section class="pfig-sec"><div class="pfig-wrap"><span class="pfig-eyebrow">FAQ</span>' +
    '<h2 class="pfig-h2">Questions membership teams ask us</h2><div class="pfig-faq">' +
    FAQ.map(function (f) { return '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join('') +
    '</div>' + cta() + '<p class="pfig-tag">Know and Grow Your Membership</p></div></section>';
  var body = el('div', 'pfig'); body.id = 'pfig'; body.innerHTML = html;
  var heroSec = document.querySelector('.pf-demo-hero');
  if (heroSec && heroSec.parentNode) heroSec.parentNode.insertBefore(body, heroSec.nextSibling);

  // sample card
  var res = body.querySelector('.pfig-qres'), opts = body.querySelectorAll('.pfig-qcard .pfig-tile');
  Array.prototype.forEach.call(opts, function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(opts, function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on'); res.textContent = b.getAttribute('data-r');
    });
  });
  // in-page links
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#pfig-form"],a[href="#pfig-fit"]');
    if (!a) return;
    e.preventDefault(); go(a.getAttribute('href').slice(1));
  });
  var navCta = document.querySelector('.pf-nav-right .pf-btn-nav');
  if (navCta) { navCta.setAttribute('href', '#pfig-form'); navCta.textContent = 'Book a demo'; }
})();
