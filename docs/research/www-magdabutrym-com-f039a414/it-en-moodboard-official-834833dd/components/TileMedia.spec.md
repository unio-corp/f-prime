# TileMedia Specification

## Overview
- **Target file:** `src/components/sites/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/TileMedia.tsx`
- **Interaction model:** static, except that video media autoplays and loops.
- Shared leaf component: rendered by `MoodboardTile` (`layout="fill"`) and by
  `ProductsPreviewModal` (`layout="intrinsic"`).

## Frozen public interface

```tsx
interface TileMediaProps {
  media: MoodboardMedia;              // discriminated union, kind: "image" | "video"
  layout?: "fill" | "intrinsic";      // default "fill"
  sizes?: string;                     // default "(min-width: 1000px) 12.5vw, 25vw"
  priority?: boolean;                 // default false
  className?: string;
}
export function TileMedia(props: TileMediaProps): JSX.Element
```

Do not rename, remove or reorder these props — two callers depend on them.

## Computed Styles (verbatim from the target site)

### Wrapper — `.Media_responsiveWrap` / `_layout-fill`
```css
position: relative;
display: grid;
border: none;
width: 100%;
height: 100%;
```

### Video — `.Viedo_videoWrap` / `.Viedo_videoElement`
```css
.videoWrap             { position: relative; }
.videoWrap_layout-fill { width: 100%; height: 100%; overflow: hidden; }
.videoElement          { width: 100%; height: 100%; position: absolute;
                         top: 0; left: 0; object-fit: cover; }
```

### Image
`object-fit: cover` in `fill` layout. In `intrinsic` layout the media keeps its own
aspect ratio and is contained (`object-fit: contain`).

## States & Behaviors

### Video playback
Attributes, matching the target markup exactly:
`autoPlay loop muted playsInline preload="metadata"`, `poster` = the Mux first-frame JPG.
There is no audio track on any of the 13 videos (`hasAudioTrack: false`).

### Reduced motion — documented deviation
The target site plays all 13 videos unconditionally. This clone pauses them under
`prefers-reduced-motion: reduce`; keep that deviation and keep it commented.

### Hover / focus
None. This component renders media only.

## Media source shapes

```ts
{ kind: "image", src, width, height, alt }                  // Sanity JPG, 2000x2500
{ kind: "video", src, poster, width, height, alt }          // Mux MP4, 1080x1440 (3:4)
```

`alt` is `""` for every tile on this page — the media is decorative and the
accessible name lives on the tile button (`Preview N products`). Pass `alt=""`
through rather than inventing alt text.

## Assets
- `/sites/<site>/<page>/tiles/*.jpg`
- `/sites/<site>/<page>/videos/*.mp4` + `*.jpg` posters

## Responsive Behavior
Layout is driven entirely by the parent cell. The default `sizes` string
`"(min-width: 1000px) 12.5vw, 25vw"` is the exact value the target site ships for
moodboard tiles (8 columns at >=1000px, 4 below). The modal passes its own `sizes`.
