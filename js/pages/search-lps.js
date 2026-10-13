/* Google Search landing pages (PF | Search | Q4-2026): /member-engagement-platform, /member-feedback-tool,
   /membership-renewal-software, /works-with-your-ams.
   Each Webflow page is a duplicate of /book-a-demo (nav, hero, .pf-demo-form-card with the HubSpot demo form,
   ChiliPiper, pixel/CAPI/LinkedIn hooks, footer). This module:
     1. sets the hero copy for the page, picking an approved H1/subhead variant from ?kw= (Google ValueTrack
        {keyword}, set as the campaign Final URL suffix). Unknown or missing kw = the page default. The raw
        keyword is never written into the page.
     2. renders the body (proof, how it works, page-specific section, client results, FAQ, CTA) under the hero.
     3. trims the nav to logo + demo button so paid visitors stay on the form.
   Copy rules: knowledge/messaging-guardrails.md + creative-messaging-rules.md in propfuel-meta-ads. Every number
   is in roi.md / case-studies-master.md / testimonials.md; clients are named only where the case study is live. */
(function () {
  var path = window.location.pathname.replace(/\/+$/, '');
  var CS = 'https://www.propfuel.com/case-studies/';

  // ---------------------------------------------------------------- shared blocks
  var STEPS = [
    ['Ask', 'One question per email or website check-in. Members answer with one click.'],
    ['Capture', 'Every answer is saved to the member record in your AMS, so your data stays current.'],
    ['Act', 'Each answer starts the right follow-up, and Membership AI drafts the next campaign for your team to approve.']
  ];
  var CASES = {
    awhonn: { org: 'AWHONN', stat: '2,246', cap: 'answers to one question, with an 18% average engagement rate', url: CS + 'awhonn-lapsed-member-check-in' },
    ala: { org: 'Association of Legal Administrators', stat: '12%', cap: 'response rate on a website pop-up asking visitors about the annual conference', url: CS + '12-response-rate-on-a-website-pop-up-heres-how-ala-did-it' },
    veccs: { org: 'VECCS', stat: '$315,300', cap: 'in revenue from website engagement, and 10% of conference registrations', url: CS + 'how-veccs-drove-10-of-conference-registrations-with-website-engagement' },
    txcpa: { org: 'Texas Society of CPAs', stat: '38.3%', cap: 'response rate when one question went on 1,502 autorenewal notices', url: CS + 'txcpa-autorenewal-response' },
    nacubo: { org: 'NACUBO', stat: '996', cap: 'institutions answered one yes/no question, and 67 new chief business officer contacts came in', url: CS + 'nacubo-chief-business-officer-contact-check-in' },
    gsa: { org: 'Geological Society of America', stat: '1,078', cap: 'renewals so far from a renewal and lapsed-member check-in, at a 40% engagement rate', url: CS + 'gsa-renewal-lapsed-member-check-in' },
    medsoc: { org: 'An international medical society', stat: '$18,438', cap: 'and 42 lapsed members won back in its first seven weeks on PropFuel', url: CS + 'medical-society-lapsed-member-win-back' }
  };
  var Q = {
    ala: { text: '[The website engagement module] is not pushy, it’s not salesy. It’s a better way to have real conversations.', who: 'Mike Donovan, Director, Membership Services and Development, Association of Legal Administrators' },
    veccs: { text: 'I cannot say enough how nice it is having a partner that doesn’t over promise and underdeliver.', who: 'Lauren San Martin, Director of Marketing & Membership, VECCS' },
    txcpa: { text: 'They love correcting errors and it makes them so happy… that’s why I think this auto renewal thing’s working.', who: 'Texas Society of CPAs, on asking members to confirm their own records' },
    medsoc: { text: 'I think 14 conversions is a lot more than we would have gotten if we just sent our regular emails.', who: 'Membership team, an international medical society' }
  };
  var FAQ_AMS = ['Does it work with the AMS we use?', 'PropFuel connects to iMIS, Salesforce, Nimble AMS, Fonteva, Impexium, Novi, MemberSuite, Aptify, Personify, NetForum, YourMembership, MemberClicks, GrowthZone and Wicket. Answers are written back to the member record where your AMS supports it. If yours isn’t listed, ask us on the call.'];
  var FAQ_TEAM = ['We’re a small team. Who builds the campaigns?', 'Every client gets a dedicated success manager who builds the first campaigns with you, and Membership AI drafts the audience, campaign and copy. Your team reviews and approves.'];
  var FAQ_EMAIL = ['Won’t members tire of more email?', 'Each message asks one question and takes one click to answer. What a member hears next depends on what they told you, not on the next scheduled blast.'];
  var FAQ_COST = ['What does it cost?', 'It depends on your membership and what you want to run. We’ll walk through pricing on the call.'];
  var FAQ_DEMO = ['What happens in the demo?', 'We pick one goal you care about, like renewals or first-year onboarding, and show you how PropFuel would run it for your members.'];

  // ---------------------------------------------------------------- pages
  // hero.v: kw (lowercase) -> variant id; hero.variants[id] overrides label/h1/sub.
  var PAGES = {
    '/member-engagement-platform': {
      hero: {
        label: 'Member insights and engagement platform',
        h1: 'Member engagement that starts with one question',
        sub: 'Most member engagement software pushes messages out. PropFuel asks members one question at a time, saves every answer to your AMS, and drafts the next campaign for your team to approve. 370+ associations use it.',
        checks: ['One-question emails members answer with one click', 'Website check-ins that ask visitors what they came for', 'Every answer saved to the member record in your AMS', 'Membership AI drafts the next campaign; you approve it'],
        formH: 'See it on your members',
        formP: 'Pick a time and we’ll walk through one goal you care about, like renewals or first-year onboarding.',
        v: {
          'member engagement software': 'software',
          'member engagement platform': 'platform', 'member engagement platforms': 'platform',
          'member engagement solution': 'solution', 'member engagement solutions': 'solution',
          'member engagement tools': 'tools', 'member engagement app': 'app',
          'member communication software': 'comms', 'member communication solutions': 'comms'
        },
        variants: {
          software: { h1: 'Member engagement software that gets answers, not just opens' },
          platform: { h1: 'The member insights and engagement platform built for associations' },
          solution: { h1: 'A member engagement solution a small team can run' },
          tools: { h1: 'Member engagement tools that hear back from members' },
          app: { h1: 'Member engagement with nothing for members to download',
                 sub: 'Members answer by clicking a link in an email or on your website. No app to install. Every answer is saved to your AMS and starts the right follow-up.' },
          comms: { label: 'Member communication for associations', h1: 'Member communication that gets a reply',
                   sub: 'Newsletters go out and you hear nothing back. PropFuel sends one-question emails members answer with one click, then sends each member the next message based on what they said.' }
        }
      },
      stats: [['370+', 'associations use PropFuel'], ['8.68%', 'average revenue growth in year one'], ['$100M+', 'in revenue growth across clients'], ['72%', 'of declining organizations reversed course']],
      section: { kind: 'compare', h: 'Messages out vs. answers back',
        left: ['The same newsletter for every member', 'Open and click rates, but no idea what members need', 'Segments you never have time to build', 'Member data that goes stale in the AMS'],
        right: ['One question that lets each member tell you what they need', 'Answers you can read, sorted by what members said', 'Follow-ups that branch on each answer, drafted for you', 'Every answer written back to the member record'] },
      cases: ['awhonn', 'ala', 'veccs'], quote: 'veccs',
      faq: [['How is this different from our email tool?', 'Your email tool sends messages out. PropFuel asks one question, captures the answer and uses it to decide what each member gets next. Most clients keep their email tool and use both.'], FAQ_AMS, FAQ_TEAM, FAQ_EMAIL, FAQ_COST]
    },

    '/member-feedback-tool': {
      hero: {
        label: 'Member feedback for associations',
        h1: 'Member feedback, one question at a time',
        sub: 'Swap the long annual survey for one-question check-ins members answer with a click. Every answer is saved to your AMS and starts the right follow-up.',
        checks: ['One question per email, answered with one click', 'Follow-up that changes with each answer', 'Answers saved to the member record, not a spreadsheet', 'Website check-ins that ask visitors what they came for'],
        formH: 'See it on your members',
        formP: 'Bring the question you most want answered. We’ll show you how PropFuel would ask it and what happens with each answer.',
        v: { 'member feedback tools': 'feedback', 'association member survey tool': 'survey' },
        variants: {
          feedback: {},
          survey: { label: 'Member surveys for associations', h1: 'The member survey, rebuilt as one question',
                    sub: 'Long surveys get skipped. One question on the Texas Society of CPAs’ autorenewal notices drew a 38.3% response rate. PropFuel asks one question at a time and saves every answer to your AMS.' }
        }
      },
      stats: [['2,246', 'answers to one question (AWHONN)'], ['38.3%', 'response rate on one question (TXCPA)'], ['62%', 'engagement rate on a yes/no check-in (NACUBO)'], ['370+', 'associations use PropFuel']],
      section: { kind: 'compare', h: 'Annual survey vs. one-question check-ins',
        left: ['Twenty questions, once a year', 'Results in a spreadsheet nobody acts on', 'Members who answered never hear back', 'A low response rate you can’t explain'],
        right: ['One question, asked when it matters', 'Answers saved to each member’s record', 'Every answer starts a follow-up that fits it', 'A question short enough to answer in one click'] },
      cases: ['awhonn', 'txcpa', 'nacubo'], quote: 'ala',
      faq: [['How is this different from a survey tool?', 'A survey tool collects answers in a separate file. PropFuel asks one question at a time, saves each answer to the member record and sends the follow-up that fits it.'], FAQ_EMAIL, FAQ_AMS, FAQ_TEAM, FAQ_COST]
    },

    '/membership-renewal-software': {
      hero: {
        label: 'Renewals and retention',
        h1: 'Membership renewal software that asks before it reminds',
        sub: 'Renewal notices tell every member the same thing. PropFuel checks in first, asks one question, and sends each member the follow-up that fits their answer. Every reply is saved to your AMS.',
        checks: ['Check-ins before the renewal ask', 'A different follow-up for every reason a member gives', 'Grace-period and lapsed-member campaigns', 'Every answer saved to your AMS'],
        formH: 'See it on your renewal cycle',
        formP: 'Pick a time and we’ll show you the renewal and win-back campaigns other associations run, set up for your members.',
        v: {
          'membership renewal software': 'renewal',
          'member retention software': 'retention', 'membership retention software': 'retention',
          'membership retention strategies': 'strategy'
        },
        variants: {
          renewal: {},
          retention: { h1: 'Member retention software that tells you who’s at risk',
                       sub: 'Ask members one question and their answers show who’s thinking of leaving, and why. PropFuel sends each one the follow-up that fits and saves every reply to your AMS.' },
          strategy: { label: 'A retention plan you can run', h1: 'A membership retention strategy you can run this renewal cycle',
                      sub: 'Check in before the renewal ask, ask lapsing members why, and follow up on each reason. One client moved on-time renewals from 80.5% to 95%.' }
        }
      },
      stats: [['80.5% → 95%', 'on-time renewals at one client, with membership up 7%'], ['1,078', 'renewals from one check-in campaign (GSA)'], ['80%', 'win-back rate on one client’s lapsed campaign'], ['72%', 'of declining organizations reversed course']],
      section: { kind: 'compare', h: 'Renewal reminders vs. renewal conversations',
        left: ['Three reminder emails that say the same thing', 'Phone calls to lapsed members when there’s time', 'No idea why members didn’t renew', 'Lapsed members who never hear from you again'],
        right: ['A check-in before the ask: how is your membership going?', 'Hundreds of answers sorted by reason, each with its own follow-up', 'The reasons saved to the member record in your AMS', 'Grace-period and lapsed campaigns that ask why and offer a way back'] },
      cases: ['gsa', 'txcpa', 'medsoc'], quote: 'medsoc',
      faq: [['We already send renewal reminders. What changes?', 'Reminders tell members a date. PropFuel asks a question first, so you learn who plans to renew, who’s unsure and why, and each group gets a different next message.'], FAQ_AMS, FAQ_TEAM, ['When should we start?', 'Before your next renewal cycle. Start check-ins a few weeks before the first renewal notice goes out.'], FAQ_COST]
    },

    '/works-with-your-ams': {
      hero: {
        label: 'PropFuel is not an AMS. It works with yours.',
        h1: 'Keep your AMS. Add the member insights it’s missing.',
        sub: 'Your AMS stores who members are. PropFuel asks what they need right now and writes the answers back to the member record. It connects to iMIS, Salesforce, Nimble AMS, Fonteva, Impexium and more.',
        checks: ['Connects to the AMS you already run', 'Member answers written back to your records', 'Profiles kept current without data entry', 'No migration, no new system of record'],
        formH: 'See it with your AMS',
        formP: 'Tell us which AMS you run. We’ll show you how PropFuel connects to it and what members’ answers look like in your records.',
        v: {
          'association membership software': 'default', 'association membership management software': 'default',
          'best association management software': 'shopping', 'top association management software': 'shopping',
          'association management software comparison': 'shopping', 'association management software reviews': 'shopping',
          'association management software integration': 'integration',
          'association management software salesforce': 'salesforce',
          'small association management software': 'small'
        },
        variants: {
          'default': {},
          shopping: { h1: 'Shopping for a new AMS? Check the gap first.',
                      sub: 'Many teams look at a new AMS because they can’t tell what members need. PropFuel answers that on top of the AMS you already have, and writes every answer back to the member record.' },
          integration: { h1: 'Add member insights to the AMS you already run' },
          salesforce: { h1: 'On Salesforce? PropFuel connects to it.',
                        sub: 'PropFuel connects to Salesforce and Salesforce-based AMSs like Nimble AMS and Fonteva. It asks members one question at a time and writes the answers back to the record.' },
          small: { h1: 'A small team doesn’t need a bigger AMS',
                   sub: 'It needs to know what members want. PropFuel works with the AMS you have, and a dedicated success manager builds your first campaigns with you.' }
        }
      },
      stats: [['370+', 'associations use PropFuel'], ['4,500+', 'member profile fields updated by one client’s campaign'], ['996', 'institutions confirmed their contacts with one question (NACUBO)'], ['8.68%', 'average revenue growth in year one']],
      section: { kind: 'ams', h: 'Connects to the AMS you already run',
        tier1: ['iMIS', 'Salesforce', 'Nimble AMS', 'Fonteva', 'Impexium'],
        tier2: ['Novi', 'MemberSuite', 'Aptify', 'Personify', 'NetForum', 'YourMembership', 'MemberClicks', 'GrowthZone', 'Wicket'],
        note: 'Not on the list? A Zapier connector covers many other systems. Ask us on the call.',
        left: ['Who members are: name, dues, join date', 'Records that go stale between renewals', 'Exports to CSV to segment anyone'],
        right: ['What members need right now, in their own answers', 'Members confirming and correcting their own records', 'Answers written back, ready to segment in your AMS'] },
      cases: ['nacubo', 'txcpa', 'gsa'], quote: 'txcpa',
      faq: [['Is PropFuel an AMS?', 'No. PropFuel is a member insights and engagement platform. Your AMS stays your system of record; PropFuel asks members questions and writes the answers back to it.'], FAQ_AMS, ['We’re in the middle of changing AMS. Should we wait?', 'Not necessarily. PropFuel can connect to the AMS you run today and move to the new one when you switch. We’ll talk through timing on the call.'], FAQ_TEAM, FAQ_COST]
    }
  };

  var cfg = PAGES[path];
  if (!cfg) return;
  var root = document.documentElement;
  function done() { root.classList.remove('pflp-kw'); }
  if (document.getElementById('pflp')) { done(); return; }

  // ---------------------------------------------------------------- helpers
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function kwVariant() {
    var raw = '';
    try { raw = new URLSearchParams(window.location.search).get('kw') || ''; } catch (e) {}
    var k = raw.toLowerCase().replace(/[+_]/g, ' ').replace(/["\[\]]/g, '').replace(/\s+/g, ' ').trim();
    var id = cfg.hero.v[k];
    return { id: id || 'default', o: (id && cfg.hero.variants[id]) || {} };
  }
  function setText(sel, txt) { var el = document.querySelector(sel); if (el && txt) el.textContent = txt; return el; }

  // ---------------------------------------------------------------- styles
  var css = '' +
    '.pflp{--ch:#2F2F2F;--mg:#6E6E6E;--bg:#F4F1EA;--card:#F6F2E8;--line:#E3DDD2;--or:#F47C2C;--yl:#FBC02D;' +
      'color:var(--ch);background:var(--bg);font-family:"DM Sans",-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.6;font-size:16px;-webkit-font-smoothing:antialiased}' +
    '.pflp *{box-sizing:border-box}' +
    '.pflp :where(h2,h3,p,ul,li,blockquote,figure){margin:0;padding:0;border:0}.pflp :where(ul){list-style:none}' +
    '.pflp-wrap{max-width:1120px;margin:0 auto;padding:0 20px}' +
    '.pflp-sec{padding:64px 0;border-top:1px solid var(--line)}.pflp-sec:first-child{border-top:0;padding-top:48px}' +
    '.pflp-label{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--mg)}' +
    '.pflp-h2{font-size:clamp(26px,3.6vw,36px);font-weight:700;line-height:1.15;letter-spacing:-.02em;margin-top:8px;max-width:24ch}' +
    '.pflp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}' +
    '.pflp-stat{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px 20px}' +
    '.pflp-num{font-size:clamp(26px,3vw,34px);font-weight:700;letter-spacing:-.02em;line-height:1.1;color:var(--or)}' +
    '.pflp-cap{font-size:14px;color:var(--mg);margin-top:6px;line-height:1.45}' +
    '.pflp-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px}' +
    '.pflp-step{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px}' +
    '.pflp-step b{display:block;font-size:20px;letter-spacing:-.01em}.pflp-step b span{color:var(--or);margin-right:8px}' +
    '.pflp-step p{color:var(--mg);margin-top:8px;font-size:15px}' +
    '.pflp-cmp{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px}' +
    '.pflp-col{border-radius:16px;padding:24px;border:1px solid var(--line);background:var(--card)}' +
    '.pflp-col.is-pf{background:#fff;border-color:rgba(244,124,44,.35);box-shadow:0 8px 28px rgba(240,90,40,.08)}' +
    '.pflp-col h3{font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mg)}.pflp-col.is-pf h3{color:var(--or)}' +
    '.pflp-col li{padding:12px 0 12px 26px;border-top:1px solid var(--line);position:relative;font-size:15px}.pflp-col li:first-child{border-top:0}' +
    '.pflp-col li:before{content:"\\2013";position:absolute;left:4px;color:var(--mg)}.pflp-col.is-pf li:before{content:"\\2713";color:var(--or);font-weight:700}' +
    '.pflp-ams{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}' +
    '.pflp-chip{padding:9px 16px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:600;font-size:15px}.pflp-chip.is-t1{border-color:rgba(244,124,44,.45)}' +
    '.pflp-note{color:var(--mg);font-size:14px;margin-top:14px}' +
    '.pflp-cases{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px}' +
    '.pflp-case{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px;text-decoration:none;color:inherit;transition:border-color .2s ease,box-shadow .2s ease}' +
    '.pflp-case:hover{border-color:rgba(244,124,44,.45);box-shadow:0 8px 28px rgba(240,90,40,.1)}' +
    '.pflp-case .o{font-size:13px;font-weight:700;color:var(--mg)}.pflp-case .n{font-size:32px;font-weight:700;letter-spacing:-.02em;margin-top:10px;line-height:1.1}' +
    '.pflp-case .c{font-size:15px;color:var(--mg);margin-top:8px;flex:1}.pflp-case .r{font-size:14px;font-weight:700;color:var(--or);margin-top:16px}' +
    '.pflp-quote{margin-top:28px;background:var(--card);border-left:4px solid var(--or);border-radius:0 16px 16px 0;padding:24px 28px}' +
    '.pflp-quote p{font-size:clamp(18px,2.2vw,22px);font-weight:500;line-height:1.45}.pflp-quote cite{display:block;font-style:normal;font-size:14px;color:var(--mg);margin-top:12px}' +
    '.pflp-faq{margin-top:24px;border-top:1px solid var(--line)}' +
    '.pflp-faq details{border-bottom:1px solid var(--line)}' +
    '.pflp-faq summary{cursor:pointer;list-style:none;padding:18px 36px 18px 0;font-weight:700;font-size:17px;position:relative}' +
    '.pflp-faq summary::-webkit-details-marker{display:none}' +
    '.pflp-faq summary:after{content:"+";position:absolute;right:6px;top:14px;font-size:24px;font-weight:400;color:var(--or)}.pflp-faq details[open] summary:after{content:"\\2212"}' +
    '.pflp-faq p{color:var(--mg);padding:0 0 18px;max-width:70ch}' +
    '.pflp-cta{text-align:center}.pflp-cta .pflp-h2{margin:8px auto 0}' +
    '.pflp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 32px;margin-top:24px;border-radius:100px;border:1.5px solid transparent;' +
      'background:linear-gradient(to right,#F47C2C,#FBC02D);color:#fff;font-weight:700;font-size:16px;text-decoration:none;box-shadow:0 4px 16px rgba(240,90,40,.2);transition:background .2s ease,color .2s ease,border-color .2s ease}' +
    '.pflp-btn:hover{background:#FBC02D;color:#1A1714;border-color:#1A1714}' +
    '.pflp-tag{margin-top:18px;font-weight:700;color:var(--mg);letter-spacing:.02em}' +
    /* nav: logo + demo button only; the demo button scrolls to the form */
    'html.pflp-on .pf-nav-links,html.pflp-on .pf-nav-right>a:not(.pf-btn-nav),html.pflp-on .pf-hamburger{display:none!important}' +
    'html.pflp-on .pf-nav-right{display:flex!important}' +
    /* anti-flicker: hero text hidden only while a kw variant is being applied (failsafe in page head) */
    'html.pflp-kw .pf-demo-hero h1,html.pflp-kw .pf-demo-subtitle,html.pflp-kw .pf-demo-label{visibility:hidden}' +
    '@media (max-width:991px){html.pflp-on .pf-nav-right{display:flex!important}}' +
    '@media (max-width:767px){' +
      '.pflp-stats{grid-template-columns:1fr 1fr}.pflp-steps,.pflp-cmp,.pflp-cases{grid-template-columns:1fr}' +
      '.pflp-sec{padding:48px 0}' +
      /* mobile: form close to the top. Checklist moves under the form. */
      'html.pflp-on .pf-demo-checklist{display:none!important}' +
      'html.pflp-on .pf-demo-subtitle{margin-bottom:0!important}' +
      'html.pflp-on .pf-demo-hero-inner{gap:20px!important}' +
    '}';
  var st = document.createElement('style'); st.id = 'pflp-styles'; st.textContent = css; document.head.appendChild(st);
  root.classList.add('pflp-on');

  // ---------------------------------------------------------------- hero
  var h = cfg.hero, kv = kwVariant();
  setText('.pf-demo-label', kv.o.label || h.label);
  setText('.pf-demo-hero h1', kv.o.h1 || h.h1);
  setText('.pf-demo-subtitle', kv.o.sub || h.sub);
  setText('.pf-demo-form-heading', h.formH);
  setText('.pf-demo-form-card .pf-paragraph-small', h.formP);
  var items = document.querySelectorAll('.pf-demo-checklist .pf-demo-check-item');
  for (var i = 0; i < items.length; i++) if (h.checks[i]) items[i].textContent = '✓ ' + h.checks[i];
  root.setAttribute('data-pflp-variant', kv.id);
  done();

  // nav demo button -> the form on this page
  var navCta = document.querySelector('.pf-nav-right .pf-btn-nav');
  if (navCta) { navCta.setAttribute('href', '#pflp-form'); navCta.textContent = 'Book a Demo'; }

  // ---------------------------------------------------------------- body
  var card = document.querySelector('.pf-demo-form-card');
  if (card && !card.id) card.id = 'pflp-form';
  var out = [];
  out.push('<section class="pflp-sec"><div class="pflp-wrap"><div class="pflp-stats">' + cfg.stats.map(function (s) {
    return '<div class="pflp-stat"><div class="pflp-num">' + esc(s[0]) + '</div><p class="pflp-cap">' + esc(s[1]) + '</p></div>';
  }).join('') + '</div></div></section>');
  out.push('<section class="pflp-sec"><div class="pflp-wrap"><p class="pflp-label">How it works</p><h2 class="pflp-h2">Ask. Capture. Act.</h2><div class="pflp-steps">' +
    STEPS.map(function (s, n) { return '<div class="pflp-step"><b><span>' + (n + 1) + '</span>' + esc(s[0]) + '</b><p>' + esc(s[1]) + '</p></div>'; }).join('') +
    '</div></div></section>');
  var sec = cfg.section, cmp = '<div class="pflp-cmp"><div class="pflp-col"><h3>' + (sec.kind === 'ams' ? 'Your AMS' : 'Today') + '</h3><ul>' +
    sec.left.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div class="pflp-col is-pf"><h3>' +
    (sec.kind === 'ams' ? 'Your AMS + PropFuel' : 'With PropFuel') + '</h3><ul>' +
    sec.right.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>';
  if (sec.kind === 'ams') {
    out.push('<section class="pflp-sec"><div class="pflp-wrap"><p class="pflp-label">Integrations</p><h2 class="pflp-h2">' + esc(sec.h) + '</h2><div class="pflp-ams">' +
      sec.tier1.map(function (x) { return '<span class="pflp-chip is-t1">' + esc(x) + '</span>'; }).join('') +
      sec.tier2.map(function (x) { return '<span class="pflp-chip">' + esc(x) + '</span>'; }).join('') +
      '</div><p class="pflp-note">' + esc(sec.note) + '</p>' + cmp + '</div></section>');
  } else {
    out.push('<section class="pflp-sec"><div class="pflp-wrap"><p class="pflp-label">What changes</p><h2 class="pflp-h2">' + esc(sec.h) + '</h2>' + cmp + '</div></section>');
  }
  var q = Q[cfg.quote];
  out.push('<section class="pflp-sec"><div class="pflp-wrap"><p class="pflp-label">Results</p><h2 class="pflp-h2">What associations got from one question</h2><div class="pflp-cases">' +
    cfg.cases.map(function (k) {
      var c = CASES[k];
      return '<a class="pflp-case" href="' + c.url + '" target="_blank" rel="noopener"><span class="o">' + esc(c.org) + '</span><span class="n">' + esc(c.stat) +
        '</span><span class="c">' + esc(c.cap) + '</span><span class="r">Read the case study →</span></a>';
    }).join('') + '</div>' +
    (q ? '<blockquote class="pflp-quote"><p>“' + esc(q.text) + '”</p><cite>' + esc(q.who) + '</cite></blockquote>' : '') +
    '</div></section>');
  out.push('<section class="pflp-sec"><div class="pflp-wrap"><p class="pflp-label">FAQ</p><h2 class="pflp-h2">Questions teams ask before a demo</h2><div class="pflp-faq">' +
    cfg.faq.concat([FAQ_DEMO]).map(function (f) { return '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join('') +
    '</div></div></section>');
  out.push('<section class="pflp-sec pflp-cta"><div class="pflp-wrap"><p class="pflp-label">Book a demo</p><h2 class="pflp-h2">See PropFuel on your own members</h2>' +
    '<a class="pflp-btn" href="#pflp-form">Book your demo</a><p class="pflp-tag">Know and Grow Your Membership</p></div></section>');

  var body = document.createElement('div');
  body.id = 'pflp'; body.className = 'pflp';
  body.innerHTML = out.join('');
  var hero = document.querySelector('.pf-demo-hero');
  if (hero && hero.parentNode) hero.parentNode.insertBefore(body, hero.nextSibling);
  else { var f = document.querySelector('.pf-footer'); if (f && f.parentNode) f.parentNode.insertBefore(body, f); }

  // in-page demo links scroll to the form (fixed nav: leave room above it)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#pflp-form"]');
    if (!a || !card) return;
    e.preventDefault();
    var y = card.getBoundingClientRect().top + window.pageYOffset - 96;
    window.scrollTo({ top: y, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
})();
