# Page Topology — magdabutrym.com `/it-en/moodboard-official`

Page title in nav: **Elevated Forms** (Highlights → Elevated Forms → `/it-en/moodboard-official`).
Document `<title>`: `Official Store`.

Total document height @1440px: **1423px** (36 promo + 900 moodboard + 487 footer).

## Visual order (top → bottom)

| # | Section | Element | Position | z-index | Height @1440 |
|---|---------|---------|----------|---------|--------------|
| 0 | Notifications portal | `div.Notifications_container` | `fixed` | 9000 | 0 (empty) |
| 1 | Promo bar | `div.PromoBar_root` | `relative` | 102 | 36px |
| 2 | Header | `div.Header_root` | `sticky; top:0` | 100 | 0 (children overlay) |
| 3 | Moodboard | `div.PageBuilderList_root > section.SectionMoodboard_wrap` | `relative` / `static` | auto | 900px |
| 4 | Footer | `footer.Footer_root` | `relative` | 90 | 487px |

The header is `position: sticky; top: 0` and **height-collapsed**: its inner
`HeaderWrap_headerBackgroundWrap` is `position: absolute`, so the header floats
**over** the moodboard rather than pushing it down. The moodboard therefore starts
directly under the promo bar and the nav sits on top of the first row of tiles.

## Layout model

- `html`, `body`: `background-color: #fcfaf7`, `scroll-behavior: smooth`, `scroll-padding: 100px`, `-webkit-font-smoothing: antialiased`, `body { line-height: 1 }`.
- No scroll container, no scroll-snap, no smooth-scroll library (no Lenis / Locomotive). Native scrolling only.
- Page is a plain vertical document flow. There is no parallax and no scroll-driven animation on the page itself.

### Moodboard grid

```css
.SectionMoodboard_wrap { display: grid; grid-template-columns: repeat(4, 1fr); width: 100%; }
@media (min-width: 1000px) { .SectionMoodboard_wrap { grid-template-columns: repeat(8, 1fr); } }
.SectionMoodboard_item { position: relative; aspect-ratio: 1 / 1.25; overflow: hidden; }
```

- 32 tiles, no gap, edge-to-edge (full viewport width, no container margin).
- @1440px → 8 × 4 grid, tile 180 × 225px.
- @768px / @390px → 4 columns, 8 rows.
- 19 tiles are Sanity images, 13 are Mux videos.

## z-index layers

| Layer | z-index |
|-------|---------|
| Notifications | 9000 |
| Promo bar | 102 |
| Header (sticky root) | 100 |
| Footer | 90 |
| Mega-menu backdrop mask | -2 (inside header stacking context) |
| Mega-menu white panel | -1 |
| Moodboard | auto (document flow) |

## Interaction model per section

| Section | Model |
|---------|-------|
| Promo bar | static |
| Header nav (desktop) | **hover-driven** mega-menu panels; hover-underline on labels |
| Header (mobile <1000px) | click-driven full-screen menu |
| Moodboard grid | **static layout**; video tiles are time-driven only in the sense that they autoplay/loop |
| Moodboard tile | **click-driven** → opens `ProductsPreviewModal` |
| Products preview modal | **scroll-driven** — scrolling the product column advances the active product info |
| Footer | static + link hover |

> ⚠️ The tiles do **not** cycle content. Early observation suggested cycling; that was
> Mux video playback in 13 of the 32 tiles. Verified by sampling every tile's media
> source every 400 ms for 23.5 s → **0 source changes**.

## Breakpoints (from the site's own CSS)

`420px`, `740px`, `1000px`, `1300px`, `1900px`, plus `@media (hover: hover)`.

| Token | base | ≥420 | ≥740 | ≥1000 | ≥1300 |
|-------|------|------|------|-------|-------|
| `Container_wrap` side margin | 30px | — | 36px | 46px | 60px |
| Moodboard columns | 4 | 4 | 4 | **8** | 8 |
| Desktop nav visible | no | no | no | **yes** | yes |
| Footer grid | 1 col (stacked) | — | **3 cols** | 3 cols | 3 cols |
| Footer padding | 36/20/30px | — | 56/72/64px | — | — |

## Out of scope for this clone

- Mega-menu third-level sub-links (hovering a category reveals a further column fetched client-side).
- Search modal, Assistance modal, Country selector modal, mini-cart drawer, mobile menu drawer contents — triggers are cloned, panels are not.
- Real cart / checkout / Shopify Storefront calls. `Add to bag` is inert.
