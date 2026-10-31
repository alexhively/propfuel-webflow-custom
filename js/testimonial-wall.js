/* Testimonials page: video wall. Loaded by fixTestimonials() in webflow-enhancements.js.
   Every clip here has client consent recorded in the OS proof queue. CSI is text-only by the client's request;
   TPCSA is the audio-only cut. Add a clip by adding a row; yt = YouTube video id (null = text card). */
(function () {
  if (!/^\/client-success\/testimonials(\/|$)/.test(location.pathname)) return;
  if (document.querySelector('.tm-wall')) return;

  var CLIPS = [
    { k: 'mike-l1',    yt: 'qf03ylpS3WE', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: 'Old AMS: “uploading lists every single time.” PropFuel: three buttons.' },
    { k: 'mike-s1',    yt: 'EAgd_VL-mzc', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: '“If I was wearing a wig, it would have blown off.”' },
    { k: 'mike-s8',    yt: 'PJVhZAnTxjM', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: 'PropFuel’s first client loves it. “We’ll be 1A.”' },
    { k: 'mike-l4',    yt: 'UgAA9vIO7Q0', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: '“The TLC we get as a client, I’ve never seen anything like it.”' },
    { k: 'fei',        yt: '-Bih8Lc-xg4', who: 'Sofia Nyland', title: 'Chapter Administrator', org: 'Financial Executives International, Detroit Chapter', q: '“I set it up once and then it just does everything for me.”' },
    { k: 'sedona',     yt: 'puFYRjFuC48', who: 'Makenna Drake', title: '', org: 'Sedona Chamber of Commerce', q: '“Our event survey response rate is so much higher than it could ever possibly be without this.”' },
    { k: 'suaa',       yt: 'wQc519e-JC0', who: 'Bryan Soady', title: '', org: 'State Universities Annuitants Association', q: '“You guys aren’t just an onboard and leave us.”' },
    { k: 'orcpa-leah', yt: 'BPxMnrvQrgs', who: 'Leah Moore', title: '', org: 'Oregon Society of CPAs', q: '“PropFuel has been a game changer for us, for our renewals.”' },
    { k: 'nace',       yt: 'ZI7JwzbPuqI', who: 'Michelle Newhard', title: 'Director of Marketing & Creative Services', org: 'NACE', q: '“This system anticipated every decision I needed to make, which is awesome.”' },
    { k: 'anfp',       yt: 'x5DFNPtgwUs', who: 'Emmy Bender', title: 'Director of Marketing & Member Engagement', org: 'Association of Nutrition & Foodservice Professionals', q: '“We did see a higher retention rate for one to two year members.”' },
    { k: 'aopa',       yt: 'dz9fjbiInU8', who: 'Madison McTernan', title: 'Manager of Membership', org: 'American Orthotics & Prosthetics Association', q: '“I like that it’s pretty much built out everything much more to my specifications.”' },
    { k: 'ena',        yt: 'gQgOeXKjVf4', who: 'Zankhana Desai', title: '', org: 'Emergency Nurses Association', q: '“I didn’t know there was another human on the other side.”' },
    { k: 'icpas-brought', yt: 'FY2UBneabyY', who: 'Alexis Pelaez', title: '', org: 'Illinois CPA Society', q: '“We got to get PropFuel with us.”' },
    { k: 'icpas-winback', yt: 'QqxkxF3fwGY', who: 'Alexis Pelaez', title: '', org: 'Illinois CPA Society', q: '“Even if we didn’t get the join, we still got data.”' },
    { k: 'tpa-retention', yt: '-i5zYTgwF1Q', who: 'Anthony Pudlo', title: '', org: 'Tennessee Pharmacists Association', q: '“I know our retention rate of our current members has been improved.”' },
    { k: 'tpa-time',   yt: 'atSomldNZiQ', who: 'Anthony Pudlo', title: '', org: 'Tennessee Pharmacists Association', q: 'A small team. PropFuel does what a human would.' },
    { k: 'nasp',       yt: 'J68FcCj4fLg', who: 'Kaleigh Quinn', title: '', org: 'National Association of School Psychologists', q: '“480 some people. I’m like, blown away.”' },
    { k: 'acers',      yt: 'hffFyF2eMsE', who: 'Kameron Haines', title: '', org: 'American Ceramic Society', q: '“It was as easy as you guys said it was, which is kind of crazy.”' },
    { k: 'tpcsa',      yt: '5GhD-FT2CXM', who: 'Nadia Luna', title: '', org: 'Texas Public Charter Schools Association', q: '“I love this, the AI building it for me, so much easier.”', audio: true },
    { k: 'mike-l1-30', yt: 't5z2Jid-vj0', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: 'An iMIS “old enough to rent a car.” Then three buttons.' },
    { k: 'mike-l2',    yt: '_Cseyfv8y6Y', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: '“A conversation, not a series of emails asking someone to renew.”' },
    { k: 'mike-l3',    yt: 'C49fAVCFpLQ', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: 'To a bar association on the fence: “Stop thinking about it. Get it.”' },
    { k: 'mike-s3',    yt: 'LV5lXA8Si-8', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: 'Before PropFuel: double-digit checks before every send.' },
    { k: 'mike-s4',    yt: 'GetgZiq92n4', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: 'Outreach that feels like it’s for them, not 9,000 members.' },
    { k: 'mike-s5',    yt: 'IQdhIYWOELE', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: 'Members think, “Oh, somebody’s actually thinking about me.”' },
    { k: 'mike-s6',    yt: 'Drpw8OElu2c', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: '“Never spoken with anyone… that has a negative thing to say.”' },
    { k: 'mike-s7',    yt: 'cXtzeahv9FI', who: 'Mike Donovan', title: 'Director, Membership Services and Development', org: 'Association of Legal Administrators (ALA)', q: 'On PropFuel’s service: “I’ve never seen anything like it.”' },
    { k: 'csi',        yt: null,          who: 'Wendy Stoner', title: '', org: 'Construction Specifications Institute', q: '“PropFuel is my favorite tool.”' }
  ];

  var DEMO = '/book-a-demo?utm_source=website&utm_medium=testimonials-page&utm_campaign=testimonial-wall&utm_content=';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = '.tm-wall{background:#F6F2E8;padding:96px 48px}' +
    '.tm-wall-in{max-width:1240px;margin:0 auto}' +
    '.tm-wall-head{text-align:center;margin-bottom:56px}' +
    '.tm-wall-eye{font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#F9A825;margin:0 0 16px}' +
    '.tm-wall-head h2{font-size:clamp(28px,4vw,38px);font-weight:700;color:#2F2F2F;letter-spacing:-.02em;line-height:1.15;margin:0;text-wrap:balance}' +
    '.tm-wall-head p{font-size:17px;color:#5C564D;line-height:1.5;margin:16px auto 0;max-width:620px;text-wrap:pretty}' +
    '.tm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}' +
    '.tm-card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 14px rgba(120,110,95,.12);display:flex;flex-direction:column}' +
    '.tm-vid{position:relative;aspect-ratio:9/16;background:#1A1713;cursor:pointer;border:0;padding:0;width:100%;display:block}' +
    '.tm-vid img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '.tm-vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
    '.tm-play{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:linear-gradient(135deg,#F47C2C,#FBC02D);box-shadow:0 4px 16px rgba(240,90,40,.35)}' +
    '.tm-play:after{content:"";position:absolute;left:25px;top:19px;border-left:20px solid #fff;border-top:13px solid transparent;border-bottom:13px solid transparent}' +
    '.tm-audio{position:absolute;left:12px;top:12px;background:rgba(26,23,19,.78);color:#F6F2E8;font:600 11px/1 "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:6px 10px;border-radius:100px}' +
    '.tm-txt{aspect-ratio:9/16;background:#1A1713;display:flex;align-items:center;justify-content:center;padding:28px;text-align:center}' +
    '.tm-txt p{font-size:22px;font-weight:600;color:#F6F2E8;line-height:1.4;font-style:italic;margin:0;text-wrap:balance}' +
    '.tm-meta{padding:18px 20px 22px}' +
    '.tm-q{font-size:16px;font-weight:600;color:#2F2F2F;line-height:1.4;margin:0 0 12px;text-wrap:pretty}' +
    '.tm-who{font-size:14px;font-weight:700;color:#2F2F2F;margin:0}' +
    '.tm-sub{font-size:13px;color:#6B645A;line-height:1.4;margin:2px 0 0}' +
    '.tm-wall-cta{text-align:center;margin-top:64px}' +
    '.tm-wall-cta h3{font-size:clamp(24px,3vw,30px);font-weight:700;color:#2F2F2F;letter-spacing:-.02em;margin:0 0 8px;text-wrap:balance}' +
    '.tm-wall-cta p{font-size:16px;color:#5C564D;margin:0 0 28px}' +
    '.tm-wall a.tm-wall-btn{color:#fff!important;display:inline-flex;align-items:center;gap:8px;padding:16px 36px;font:600 15px/1 "DM Sans",sans-serif;border-radius:100px;text-decoration:none;background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;box-shadow:0 4px 16px rgba(240,90,40,.2)}' +
    '.tm-card.tm-more{display:none}.tm-wall.tm-open .tm-card.tm-more{display:flex}' +
    '.tm-showall{display:block;margin:40px auto 0;padding:14px 28px;font:600 15px/1 "DM Sans",sans-serif;border-radius:100px;background:transparent;color:#F47C2C;border:1.5px solid rgba(244,124,44,.45);cursor:pointer}' +
    '.tm-wall.tm-open .tm-showall{display:none}' +
    '@media(max-width:1100px){.tm-grid{grid-template-columns:repeat(3,1fr)}}' +
    '@media(max-width:820px){.tm-grid{grid-template-columns:repeat(2,1fr);gap:16px}.tm-wall{padding:64px 16px}}' +
    '@media(max-width:480px){.tm-grid{grid-template-columns:1fr}.tm-card{max-width:360px;margin:0 auto;width:100%}}';

  function card(c, i) {
    var meta = '<div class="tm-meta"><p class="tm-q">' + esc(c.q) + '</p><p class="tm-who">' + esc(c.who) + '</p><p class="tm-sub">' +
      (c.title ? esc(c.title) + '<br>' : '') + esc(c.org) + '</p></div>';
    var top = c.yt
      ? '<button class="tm-vid" type="button" data-yt="' + c.yt + '" data-k="' + c.k + '" aria-label="Play: ' + esc(c.who) + ', ' + esc(c.org) + '">' +
        '<img src="https://i.ytimg.com/vi/' + c.yt + '/hqdefault.jpg" alt="" loading="lazy"><span class="tm-play"></span>' +
        (c.audio ? '<span class="tm-audio">Audio only</span>' : '') + '</button>'
      : '<div class="tm-txt"><p>' + esc(c.q) + '</p></div>';
    return '<article class="tm-card' + (i >= 8 ? ' tm-more' : '') + '">' + top + meta + '</article>';
  }

  var html = '<section class="tm-wall"><style>' + css + '</style><div class="tm-wall-in">' +
    '<div class="tm-wall-head"><p class="tm-wall-eye">In their own words</p><h2>Hear it from the people who use PropFuel.</h2>' +
    '<p>Membership teams across 370+ associations, on camera.</p></div>' +
    '<div class="tm-grid">' + CLIPS.map(card).join('') + '</div>' +
    '<button class="tm-showall" type="button">See all ' + CLIPS.length + ' clips</button>' +
    '<div class="tm-wall-cta"><h3>See what PropFuel would do for your members.</h3><p>Book a demo and we’ll show you.</p>' +
    '<a class="tm-wall-btn" href="' + DEMO + 'wall-cta">Book a demo</a></div></div></section>';

  var anchor = document.querySelector('.tm-famewall') || document.querySelector('.pf-cta-section, [class*="cta-section"]');
  if (!anchor) return;
  anchor.insertAdjacentHTML('beforebegin', html);

  document.querySelector('.tm-wall').addEventListener('click', function (e) {
    if (e.target.closest('.tm-showall')) { this.classList.add('tm-open'); return; }
    var b = e.target.closest('.tm-vid');
    if (!b || b.querySelector('iframe')) return;
    b.innerHTML = '<iframe src="https://www.youtube.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Testimonial"></iframe>';
    try { if (window.posthog) window.posthog.capture('testimonial_played', { clip: b.getAttribute('data-k') }); } catch (_) {}
  });
})();
