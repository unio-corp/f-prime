# ProductsPreviewModal Specification

## Overview
- **Target file:** `src/components/sites/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/ProductsPreviewModal.tsx`
- **Interaction model:** **scroll-driven** at ≥1000px (the product column scrolls vertically; each product's info block sits beside its image). At <1000px the products become a **horizontal** scroller. Not a tabbed/click switcher.
- Opened by clicking a `MoodboardTile`. Closed with the `×` button or `Escape`.

## DOM Structure

```
div.ProductsPreviewModal_modal              full-viewport surface
├─ div.Container_wrap.Content_header (position-fixed)
│  └─ button.Content_closeButton            → CloseIcon, top-right
└─ div.ProductsPreviewModal_body
   ├─ div.ProductsPreviewModal_mediaWrap
   │  └─ div.ProductsPreviewModal_mediaWrapInner   → the tile's own image/video
   └─ div.ProductsPreviewModal_productsWrap
      └─ div.ProductsPreviewModal_productWrap × N
         ├─ product info (title, price, Add to bag, View details)
         └─ product image
```

## Computed Styles (exact)

### Surface — `.ProductsPreviewModal_modal`
```css
background: #fff;
```
```css
@media (min-width: 1300px) { background: #f5f3ef; }   /* _hasMedia-true */
```
Every tile has media on this page, so ≥1300px the surface is `#f5f3ef`.

### Header / close — `.Content_header_position-fixed`
`position: fixed; display: grid; grid-template-columns: 60px 1fr 60px; height: 60px`,
inside `.mb-container` margins. The close button sits in the right 60px cell,
`justify-self: end`. Measured @1440: container 1312px wide starting at x=64.

### Body — `.ProductsPreviewModal_body`
```css
display: grid;
position: relative;
overflow: visible;
grid-template-columns: unset;
grid-template-rows: 1fr auto;
min-height: calc(71vh + 110px);
max-height: 100%;
height: 100%;
```
```css
@media (min-width: 420px)  { min-height: 100vh; max-height: none; }
@media (min-width: 1000px) { grid-template-columns: 1fr 1fr; grid-template-rows: unset; }
@media (min-width: 1300px) { grid-template-columns: 1fr 800px; }
```

### Media column — `.ProductsPreviewModal_mediaWrap` / `_mediaWrapInner`
```css
.mediaWrap      { position: relative; }
.mediaWrapInner { min-height: 100px; width: 100%; height: 100%;
                  padding-block: 24px; padding-inline: 64px; }
@media (min-width: 420px)  { .mediaWrapInner { padding-inline: 32px; } }
@media (min-width: 740px)  { .mediaWrapInner { padding-inline: 48px; } }
@media (min-width: 1000px) { .mediaWrapInner { position: sticky; height: 100vh; padding: 64px; } }
```
The media keeps its own aspect ratio (`object-fit: contain`, `4:5` for images,
`3:4` for videos) and is left-aligned within the padded box. Videos keep playing.

### Products column — `.ProductsPreviewModal_productsWrap`
```css
display: grid;
grid-row-gap: 2px;
grid-column-gap: 24px;
grid-auto-columns: min-content;
grid-auto-flow: column;        /* horizontal scroller on small screens */
overflow-x: auto;
overflow-y: hidden;
align-content: safe center;
justify-items: center;
padding-bottom: 16px;
```
```css
.productsWrap::-webkit-scrollbar { display: none; }
.productsWrap::before { content: ""; display: block; width: .1px; }
.productsWrap::after  { content: " "; display: block; width: .1px; }
@media (min-width: 1000px) {
  .productsWrap {
    grid-column-gap: unset;
    grid-auto-columns: unset;
    grid-auto-flow: unset;      /* back to vertical rows */
    overflow-x: hidden;
    overflow-y: auto;
    justify-items: unset;
    background: #fcfaf7;
    padding-bottom: 0;
  }
}
```

### Product cell — `.ProductsPreviewModal_productWrap`
```css
position: relative;
width: 240px;                                   /* _size-default */
```
```css
@media (min-width: 1000px) { width: auto; }
```
`_size-large` variant: `280px` base · `340px` ≥420 · `380px` ≥740 · `auto` ≥1000.

### Product info block
- Title: `font-size: 16px; line-height: 1.25; font-family: var(--mb-font-serif)`
  (`.ProductCard_titleContainer`). Rendered at ~19px in the modal screenshots because
  the serif fallback metrics inflate it — use the 16px token and the real serif face.
- Price: `font-size: 13px; line-height: 1.9230769231; font-family: var(--mb-font-sans); color: #9e9e9e`
  Format: `${amount} ${currencyCode}` with no decimals — e.g. `2615 EUR`, `620 EUR`, `685 EUR`.
- **Add to bag** (`.ProductDetails_addToCartButton`):
  ```css
  font-size: 12px; line-height: 1.5; font-family: var(--mb-font-sans);
  width: 100%; height: 40px; background: #000; color: #fff; text-align: center;
  transition: .3s;
  ```
  ```css
  @media (min-width: 1000px) { height: 35px; background: transparent; color: #000; border: 1px solid; }
  ```
- **View details**: 13px sans, `text-decoration: underline`, links to the product page.

## States & Behaviors

### Open / close
- **Trigger:** click on a `MoodboardTile` button.
- **Transition:** `transition-fade` — `opacity` fade in/out. The site uses
  `Content_contentBaseClass_transition-fade` with the standard `.3s` fade.
- `Escape` closes. Body scroll is locked while open. Focus moves to the close button
  and returns to the triggering tile on close.

### Scroll-driven product advance (≥1000px)
- **Trigger:** scrolling the products column.
- Each product occupies its own row; its info block is `position: sticky` near the top
  of the viewport while that product's image is in view, then the next product's block
  takes over. With a single product there is nothing to scroll.
- **Implementation approach:** plain CSS `position: sticky` per product row — no
  IntersectionObserver needed, and it matches the observed behaviour (the info of the
  in-view product stays pinned while the next one pushes it up).

### Hover
`Add to bag` has a `.3s` colour transition; `View details` is already underlined.
No other hover effects.

## Per-State Content
Products come from the clicked tile: `tile.products.map(h => MOODBOARD_PRODUCTS[h])`.
Each product carries `title`, `price`, `currency`, `href`, `image`, `image2`, `color`.
Counts range 1–11 across the 32 tiles.

Example (tile 14, 11 products) — first two, verbatim from the live modal:
- `Brigitte in dark brown croco-embossed leather with flower charm` — `2615 EUR`
- `Brigitte in black leather with flower charm` — `2615 EUR`

## Assets
- Tile media: reuse the tile's own `media` object.
- Product images: `/sites/<site>/<page>/products/*.jpg` (1000px wide).
- `CloseIcon` from the shared icons module.

## Responsive Behavior
- **Desktop ≥1300px:** `1fr 800px`, surface `#f5f3ef`, media sticky full-height on the left, products scroll vertically on a `#fcfaf7` panel.
- **Desktop 1000–1299px:** `1fr 1fr`, same behaviour, surface `#fff`.
- **Tablet / mobile <1000px:** single column, `grid-template-rows: 1fr auto`; media on top, products become a **horizontal** snapless scroller with hidden scrollbar, cells 240px (or 280–380px for the large variant), 24px column gap.
- **Breakpoints:** `420px`, `740px`, `1000px`, `1300px`.
