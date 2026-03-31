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
