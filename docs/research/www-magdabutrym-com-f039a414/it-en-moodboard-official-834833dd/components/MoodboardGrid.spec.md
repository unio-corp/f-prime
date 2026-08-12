# MoodboardGrid + MoodboardTile Specification

## Overview
- **Target files:**
  - `src/components/sites/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/MoodboardGrid.tsx`
  - `.../MoodboardTile.tsx`
- **Screenshots:** `desktop-1440-top.jpg`, `tablet-768-top.jpg`, `mobile-390-top.jpg`
- **Interaction model:** **static layout**. Tiles never change content on their own. Video tiles autoplay/loop. Clicking a tile opens `ProductsPreviewModal`.

## DOM Structure

```
div.PageBuilderList_root                      (relative, no padding, no max-width)
└─ section.SectionMoodboard_wrap              grid
   └─ div.SectionMoodboard_item × 32
      └─ button.ProductsPreviewModal_trigger  aria-label="Preview N product(s)"
         └─ div.Media_responsiveWrap (layout-fill)
            └─ div.Media_desktopMedia
               └─ img  |  div.Viedo_videoWrap > video.Viedo_videoElement
```

## Computed Styles (exact — this section's CSS is only three rules)

### `.SectionMoodboard_wrap`
```css
display: grid;
grid-template-columns: repeat(4, 1fr);
width: 100%;
```
```css
@media (min-width: 1000px) { grid-template-columns: repeat(8, 1fr); }
```
No `gap`. No container margin — the grid is edge-to-edge, full viewport width.

### `.SectionMoodboard_item`
```css
position: relative;
aspect-ratio: 1 / 1.25;
overflow: hidden;
```

### `.ProductsPreviewModal_trigger`
```css
position: relative;
width: 100%;
height: 100%;
vertical-align: top;
cursor: pointer;
```
Focus-visible uses an inset ring instead of an outer shadow:
```css
.trigger:focus-visible { box-shadow: none; }
.trigger:focus-visible::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  box-shadow: inset 0 0 0 2px #0071e3;
}
```

### `.Media_responsiveWrap` / `_layout-fill`
`position: relative; display: grid; border: none; width: 100%; height: 100%`

### `.Media_desktopMedia`
`display: grid; border: none`

### Image tile
`object-fit: cover`, fills the cell. Use `next/image` with `fill` and
`sizes="(min-width: 1000px) 12.5vw, 25vw"` — the exact `sizes` the target site ships.

### Video tile — `.Viedo_videoWrap` / `.Viedo_videoElement`
```css
.videoWrap          { position: relative; }
.videoWrap_layout-fill { width: 100%; height: 100%; overflow: hidden; }
.videoElement       { width: 100%; height: 100%; position: absolute; top: 0; left: 0; object-fit: cover; }
```
Attributes: `autoPlay loop muted playsInline preload="metadata"`, `poster` = the Mux
first-frame JPG. Source is a local `.mp4`.

## States & Behaviors

### Time-driven
Only the 13 video tiles: they autoplay, loop and are muted. **Nothing cycles.**
Verified by sampling every tile's `currentSrc` every 400 ms for 23.5 s → 0 changes.
Do not build a rotating/crossfading tile.

### Hover
**None.** No zoom, no overlay, no caption, no opacity change. `cursor: pointer` only.

### Click
Opens the products preview modal for that tile — see `ProductsPreviewModal.spec.md`.

### Reduced motion
Videos are decorative; pause them under `prefers-reduced-motion: reduce`
(the target site does not, but leaving 13 looping videos running is the one place
where matching 1:1 is user-hostile — document the deviation).

## Per-Tile Content

32 tiles from `moodboard-tiles.ts` (`MOODBOARD_TILES`), in payload order — the grid
fills row by row, so index order **is** visual order.

- 19 tiles: `media.kind === "image"` (Sanity JPG, 2000×2500)
- 13 tiles: `media.kind === "video"` (Mux MP4, 1080×1440, `aspectRatio: "3:4"`)
- `products` is an array of 1–11 product handles; look each up in `MOODBOARD_PRODUCTS`.

`aria-label` must be `Preview ${n} product` for n === 1 and `Preview ${n} products` otherwise,
matching the target site exactly.

## Assets
- `/sites/<site>/<page>/tiles/*.jpg` — 19 tile images
- `/sites/<site>/<page>/videos/*.mp4` + matching `*.jpg` posters — 13 videos

## Responsive Behavior
- **Desktop (≥1000px):** 8 columns × 4 rows; tile 180 × 225px @1440.
- **Tablet (768px):** 4 columns × 8 rows; tile 192 × 240px.
- **Mobile (390px):** 4 columns × 8 rows; tile 97.5 × 121.875px.
- **Breakpoint:** `1000px`, the only one.
