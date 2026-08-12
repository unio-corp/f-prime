# Behaviors — magdabutrym.com `/it-en/moodboard-official`

All CSS below is copied verbatim from the site's own stylesheets
(`docs/research/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/site-relevant.css`),
not estimated. Class-hash suffixes (`__or9jF` etc.) are stripped for readability.

---

## 1. Scroll sweep

**Finding: the page has almost no scroll-driven behaviour.**

| Checked | Result |
|---------|--------|
| Header change on scroll | **None.** Header is `sticky; top:0`, stays black-on-transparent at every scroll position. The `HeaderWrap_headerBackgroundWrap_isVisible-true` / `background-transparent` classes are static on this page. |
| Header dark gradient | Present in markup but **disabled**: `HeaderWrap_gradient_isHidden-true { opacity: 0 }`. Do not render a visible gradient. |
| Elements animating into view | **None.** No IntersectionObserver reveal, no fade-up, no stagger. |
| Scroll-snap | **None.** |
| Parallax | **None.** |
| Smooth-scroll library | **None** (no `.lenis`, no Locomotive). Native scrolling with `html { scroll-behavior: smooth; scroll-padding: 100px }`. |

Header CSS that matters:

```css
.Header_root { position: sticky; top: 0; z-index: 100; }
.HeaderWrap_headerBackgroundWrap { position: absolute; top:0; left:0; right:0; z-index:1; transition: transform .3s ease-in-out; }
.HeaderWrap_headerBackgroundWrap_isVisible-true  { transform: translateY(0); }
.HeaderWrap_headerBackgroundWrap_isVisible-false { transform: translateY(-100%); }   /* not used on this page */
.HeaderWrap_headerBackgroundWrap_background-transparent { background: transparent; } /* active on this page */
.HeaderWrap_gradient { background: linear-gradient(0deg, transparent, rgba(0,0,0,.3)); pointer-events:none; transition: opacity .3s; position: fixed; top:0; left:0; width:100%; height:50vh; }
.HeaderWrap_gradient_isHidden-true { opacity: 0; }                                    /* active on this page */
.HeaderWrap_headerWrap { height: clamp(68px, 46.5135135135px + 5.7297297297vw, 121px);
  padding-top: clamp(8px, 1.5135135135px + 1.7297297297vw, 24px);
  padding-bottom: clamp(8px, 1.5135135135px + 1.7297297297vw, 24px);
  display: grid; grid-template-columns: 1fr auto 1fr; }
@media (min-width: 740px) { .HeaderWrap_headerWrap { justify-content: start; } }
.HeaderWrap_headerWrap_theme-BLACK { color: #000; }                                   /* active on this page */
```

---

## 2. Time-driven behaviour

**13 of the 32 tiles are Mux videos that autoplay, loop and are muted.** Nothing else
on the page changes over time.

```css
.Viedo_videoWrap { position: relative; }
.Viedo_videoWrap_layout-fill { width: 100%; height: 100%; overflow: hidden; }
.Viedo_videoElement { width: 100%; height: 100%; position: absolute; top: 0; left: 0; object-fit: cover; }
```

Video source shape (from the RSC payload):

```json
{ "type": "mux-video",
  "video": { "aspectRatio": "3:4", "width": 1080, "height": 1440, "hasAudioTrack": false,
             "firstFrame": "https://image.mux.com/<playbackId>/thumbnail.jpg?time=0",
             "mp4":        "https://stream.mux.com/<playbackId>/highest.mp4" } }
```

Video element attributes: `autoplay loop muted playsinline`, poster = `firstFrame`.

**Verification performed:** every tile's `currentSrc` sampled every 400 ms for 23.5 s →
0 changes. The tiles are NOT a rotating/cycling moodboard.

---

## 3. Click sweep

### 3.1 Moodboard tile → Products preview modal

Each tile is a `<button class="clickable_clickable ProductsPreviewModal_trigger">` with
`aria-label="Preview N product"` / `"Preview N products"` (N = number of linked products,
range 1–11 across the 32 tiles).

Clicking opens a **full-viewport modal**:

- Overlay: `background-color: rgb(252, 250, 247)` (`#fcfaf7`), covers the whole viewport, `position: relative`, fills `100vw × 100vh`.
- Close button: top-right, inside `Container_wrap Content_header Content_header_position-fixed`, `position: fixed`, grid `60px 1192px 60px`, height 60px. `×` glyph icon.
- Three-column composition at desktop:
  - **Left**: the tile's own media (image or the looping video), max ~510 × 625px, left-aligned at the container margin.
  - **Centre**: product info block — title (`font-serif`, ~19px), price (`13px`, muted `#9e9e9e`), `Add to bag` button (bordered, transparent, full column width), `View details` underlined link.
  - **Right**: the product images, stacked vertically in a scrolling column on a light grey backdrop.
- **INTERACTION MODEL: scroll-driven.** With multiple products, scrolling the modal advances through the product list; the centre info block is sticky per product and swaps to the product whose image is in view. With a single product there is nothing to scroll.
- `Escape` closes the modal.

### 3.2 Header nav — mega-menus

Nav labels `Shop`, `Sale`, `Highlights`, `Explore` open a mega-menu on **hover**
(not click). Verified: hovering the label opens the panel; the panel closes when the
pointer leaves.

```css
.DesktopNavItem_contentWrap { padding-top: clamp(68px,46.5135135135px + 5.7297297297vw,121px);
  position:absolute; display:flex; justify-content:center; align-items:flex-start;
  width:100%; max-height:100vh; top:0; left:0; right:0; padding-bottom:60px;
  pointer-events:none; transition: opacity .3s ease-in-out, visibility .3s; }
.DesktopNavItem_contentWrap_state-EXITED  { opacity:0; visibility:hidden; }
.DesktopNavItem_contentWrap_state-ENTERED { opacity:1; visibility:visible; }
.DesktopNavItem_contentWrap_state-EXITING { opacity:0; visibility:hidden; transition: opacity .2s ease-in-out, visibility .2s; }

/* white panel behind the menu */
.DesktopNavItem_backgroundWrap { position:absolute; left:-30px; right:-30px; top:0; height:100%;
  z-index:-1; background-color:#fff; transition: opacity .3s ease-in-out; pointer-events:none; }
@media (min-width:420px)  { .DesktopNavItem_backgroundWrap { left:-36px; right:-36px; } }
@media (min-width:740px)  { .DesktopNavItem_backgroundWrap { left:-46px; right:-46px; } }
@media (min-width:1000px) { .DesktopNavItem_backgroundWrap { left:-60px; right:-60px; } }
.DesktopNavItem_backgroundWrap_isVisible-true  { opacity:1; pointer-events:auto; }
.DesktopNavItem_backgroundWrap_isVisible-false { opacity:0; pointer-events:none; }

/* dark mask over the rest of the page */
.DesktopNavItem_backgroundMask { position:absolute; left:-30px; right:-30px; top:0; height:100vh;
  z-index:-2; background-color: rgba(0,0,0,.7); transition: opacity .3s ease-in-out; pointer-events:none; }
.DesktopNavItem_backgroundMask_isVisible-true  { opacity:1; }
.DesktopNavItem_backgroundMask_isVisible-false { opacity:0; }

.DesktopNavItem_threeColumnLayout { display:grid; grid-template-columns: 1fr 1fr 2fr; gap:8px;
  width:100%; position:relative; pointer-events:auto; margin-top:28px; }
.DesktopNavItem_styledArrowDown { transform-origin:50%; transition: transform .2s, fill .1s; fill: currentColor; }
.DesktopNavItem_styledArrowDown_isActive-true { transform: rotate(-180deg); }
```

Panel content (extracted live — see `MEGA_MENUS.md`): a links column on the left and two
featured image cards on the right, each card = image (1000×1250 Sanity JPG) + caption link.

### 3.3 Other click targets

| Trigger | Behaviour on the live site | In this clone |
|---------|---------------------------|---------------|
| Search icon | opens search modal | trigger only, inert |
| `IT / EUR` | opens country/currency modal | trigger only, inert |
| `Assistance` | opens assistance modal | trigger only, inert |
| `Bag 0` | opens mini-cart drawer | trigger only, inert |
| Hamburger (<1000px) | opens full-screen mobile menu | trigger only, inert |
| `Boutique` | link → `/it-en/boutique` | plain link |
| Footer links | plain links | plain links |
| Newsletter submit | POSTs email | inert form |

---

## 4. Hover sweep

The site defines **very few** hover effects. Do not invent any.

```css
@media (hover:hover) and (pointer:fine) {
  .DesktopNavItem_tabLabelText:hover { text-decoration: underline; }
}
.DesktopNavItem_tabLabelText { font-size:13px; line-height:17px; font-family: var(--font-sans);
  border-bottom:1px solid transparent; padding:5px 0; text-decoration:none; cursor:default;
  display:inline-flex; align-items:center; color: currentColor; text-underline-offset:2px; }
.DesktopNavItem_activeBorderBottom,
.DesktopNavItem_mainTabLink_isActive-true { border-bottom-color: currentColor !important; }
.clickable_clickable { cursor: pointer; }
.clickable_clickable:disabled { pointer-events: none; }
```

| Element | Hover |
|---------|-------|
| Nav label (`Shop`/`Sale`/`Highlights`/`Explore`) | `text-decoration: underline`, `text-underline-offset: 2px`; also opens the mega-menu |
| Side nav (`IT / EUR`, `Boutique`, `Assistance`, `Bag`) | underline, same rule family |
| Footer links | underline (`text-underline-position: under` from `body`) |
| **Moodboard tile** | **no hover effect at all** — no zoom, no overlay, no caption. `cursor: pointer` only. |
| Logo | none (`transition: fill 100ms` on the SVG for theme changes) |

Focus-visible: `box-shadow: 0 0 0 2px #0071e3` on nav arrow buttons.

---

## 5. Responsive sweep

Verified by resizing the live window to 1440 / 768 / 390.

### ≥1000px (desktop)
- Moodboard: 8 columns.
- Header: left nav (`Shop Sale Highlights Explore` + search icon), centred wordmark logo, right side-list (`IT / EUR`, `Boutique`, `Assistance`, `Bag 0`).
- Footer: 3-column grid.

### 740–999px (tablet)
- Moodboard: **4 columns** (tile ≈192px @768).
- Header: hamburger icon left, wordmark centred, `Bag 0` right. Desktop nav and side list are `display: none`.
- Footer: 3-column grid (`@media (min-width:740px)`).

### <740px (mobile)
- Moodboard: 4 columns (tile ≈97.5px @390).
- Header: same reduced layout as tablet; wordmark scales down with the `clamp()` header height (68px min).
- Footer: single stacked column — full-width wordmark, then `About / Contact / Stockists`, `Shipping / Returns and Exchanges / Customer Service`, `Newsletter` + email field, then a 2-column block (`Instagram / Facebook / LinkedIn` | `Terms and Conditions / Privacy Policy / Accessibility / Cookie Policy`), then `©Magda Butrym` with the knot icon right-aligned.

Relevant CSS:

```css
.HeaderContent_desktopNavigationWrap { display: none; }
@media (min-width:1000px) { .HeaderContent_desktopNavigationWrap { flex-grow:1; display:flex; justify-content:space-between; align-items:center; } }
.HeaderContent_listWrap { display:grid; grid-auto-flow:column; justify-content:start; align-content:center; grid-gap:16px; }
.HeaderContent_sideList { display:none; list-style:none; z-index:1; }
@media (min-width:1000px) { .HeaderContent_sideList { display:grid; justify-content:end; } }
.HeaderContent_cartButtonWrap { justify-self:end; align-self:center; }
@media (min-width:1000px) { .HeaderContent_cartButtonWrap { display:none; } }
.HeaderWrap_mobileMenuWrap { display:flex; align-items:center; }
@media (min-width:1000px) { .HeaderWrap_mobileMenuWrap { display:none; } }

.Media_desktopMedia { display:grid; border:none; }
.Media_desktopMedia_shouldHideOnMobile-true { display:none; }
@media (min-width:740px) { .Media_desktopMedia_shouldHideOnMobile-true { display:grid; } }
.Media_mobileMedia { display:grid; }
@media (min-width:740px) { .Media_mobileMedia { display:none; } }
.Media_responsiveWrap { position:relative; display:grid; border:none; }
.Media_responsiveWrap_layout-fill { width:100%; height:100%; }
```

Image `sizes` attribute used by the site for moodboard tiles:
`["25vw", "25vw", "25vw", "12.5vw"]` (4 cols until the 1000px breakpoint, 8 cols above).

---

## 6. Design tokens observed

| Token | Value |
|-------|-------|
| Page background | `#fcfaf7` (cream) — on `html`, `body`, `footer`, modal |
| Promo bar background | `#fff` |
| Mega-menu panel background | `#fff` |
| Mega-menu backdrop | `rgba(0,0,0,.7)` |
| Text primary | `#000` |
| Text muted | `#9e9e9e` |
| Border / rule | `#e0e0e0`, `rgba(0,0,0,.2)` |
| Disabled button bg / fg | `#616161` / `#9e9e9e` |
| Focus ring | `#0071e3` |
| Highlight (Sale label) | `red` |
| Body base | `line-height: 1`, `text-underline-position: under`, antialiased |
| Nav / small text | `13px / 17px`, `var(--font-sans)` |
| Promo bar text | `11px`, `line-height: 1.8181818182`, `var(--font-sans)` |
| Copyright / muted | `13px`, `line-height: 1.9230769231`, `#9e9e9e` |
| Product title | `16px`, `line-height: 1.25`, `var(--font-serif)` |
| Primary button | `12px / 1.5`, `height: 40px`, `background:#000`, `color:#fff` |

Fonts (self-hosted, `font-display: swap`, weight 400 only):

| CSS var | Family | Fallback metrics |
|---------|--------|------------------|
| `--font-sans` | `__fontSans` (woff2 + woff) | `local("Arial")`, ascent 93.48%, descent 22.52%, size-adjust 103.45% |
| `--font-serif` | `__fontSerif` (woff, + italic woff) | `local("Arial")`, ascent 111.76%, descent 35.52%, size-adjust 89.48% |
| `--font-serif-alternative` | `__fontSerifAlternative` (woff2 + woff) | `local("Arial")`, ascent 131.24%, descent 41.73%, size-adjust 76.20% |
