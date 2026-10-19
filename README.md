# PropFuel Webflow Custom Code

External CSS and JavaScript for the PropFuel Webflow site. Hosted via GitHub Pages so changes deploy automatically without touching Webflow.

## Setup (One Time)

### 1. Enable GitHub Pages
- Go to this repo's **Settings > Pages**
- Source: **Deploy from a branch**
- Branch: **main**, Folder: **/ (root)**
- Save

### 2. Paste into Webflow

Go to **Project Settings > Custom Code** in Webflow.

**Head Code:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://alexhively.github.io/propfuel-webflow-custom/css/webflow-overrides.css">
```

**Footer Code:**
```html
<script src="https://alexhively.github.io/propfuel-webflow-custom/js/webflow-enhancements.js"></script>
```

### 3. Publish Webflow
Publish the site. Done.

## How Updates Work

1. Edit `css/webflow-overrides.css` or `js/webflow-enhancements.js`
2. Commit and push to `main`
3. GitHub Pages deploys automatically (~1-2 minutes)
4. Changes are live on the Webflow site (after browser cache expires, ~10 minutes)
5. No need to touch Webflow at all

## What's Included

### CSS (`webflow-overrides.css`)
- DM Sans variable font override
- Body background color
- Primary button hover (gradient dissolve → golden yellow + charcoal border)
- Secondary button (orange text + border)
- Card/feature texture overlays (::before pseudo-elements)
- Dark section textures (stats, CTA, footer)
- FAQ/warm section textures
- Fade-up scroll animations
- FAQ accordion styles
- Card hover lift effect
- Nav scroll state
- Reduced motion support

### JavaScript (`webflow-enhancements.js`)
- Canvas-based texture generation (page, card, dark, FAQ)
- Texture application via CSS custom properties
- IntersectionObserver scroll animations
- FAQ accordion toggle
- Nav scroll detection
- Reduced motion bypass

## SEO metadata lives in Webflow, not here (Sep 2026)

Titles, meta descriptions, canonical, robots, Open Graph images and JSON-LD
(Organization, WebSite, WebPage, BreadcrumbList, SoftwareApplication) are set
natively in Webflow: page settings for static pages, CMS field bindings on the
Blog Posts / Videos / Case Studies / Team Members / Guides templates, the site
head custom code (Organization), and the global canonical URL in Site Settings.
They render server-side so AI crawlers and link unfurlers, which do not run JS,
see them. This script only adds FAQPage schema. Do not reintroduce client-side
title/meta/canonical injection; edit the Webflow fields instead.

## QA gate (pre-push)

`qa/hooks/pre-push` runs `qa/run-qa.mjs` before every push. Install it once per clone:

```sh
cp qa/hooks/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push
```

It tests **what's being pushed**: the staging site (propfuel-v2.webflow.io) is loaded twice, once with the live GitHub Pages files (main) and once with this repo's working-tree files swapped in.

- **Brand** blocks only on violations the push *adds*. Violations already live are listed, not blocking.
- **Visual** is a before/after diff of the push on 4 pages × 3 viewports. It's advisory: it flags any page below 99.95% (identical code scores 100%) but doesn't block. Set `QA_VISUAL_STRICT=1` to make it block.
- **Scope:** if nothing in the push touches `js/`, `css/` or `images/`, the checks are skipped.
- **Capture errors** (network, browser) block, so a broken run never passes silently.
- Run by hand: `cd qa && npm run qa` (checks everything). Reports: `qa/reports/brand-report.html`, `qa/reports/visual-report.html`.
