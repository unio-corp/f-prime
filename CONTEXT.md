# Context

Ubiquitous language for this project. Glossary only — no implementation
details, no specs, no decisions (those live in `docs/adr/`).

## Moodboard

The grid that conveys the mood of Femmina Prime through images and words.
There is one Moodboard; it is not user-owned or per-account. It is never
complete: Tiles are added editorially over time until the grid is filled.

## Tile

One cell of the Moodboard: a Medium and a Text, plus the Text's Provenance.
A Tile also holds a Position.

## Position

A Tile's seat in the Moodboard: a number from 1 to 48, in reading order. No
two Tiles share a Position, and the Moodboard has no more seats than that.

Position is layout-independent: it says *which* seat, never how many columns
that seat sits in.

## Medium

The image or video shown on a Tile. The same Medium is reused, unchanged, in
the Tile's detail view — a Tile never carries a second, alternative image.

Media are produced editorially. They are not screenshots or downloads of
social posts, even when the Text beside them comes from one.

## Text

The words on a Tile: a quote, a passage, or an aphorism. The Text is what
carries the meaning; the Medium sets the tone.

## Provenance

Where a Text comes from. Three forms:

- **Social** — a Femmina Prime post on a social network.
- **Article** — a page on a website or blog.
- **None** — an aphorism or a standalone phrase, with no origin elsewhere.

Provenance determines which Actions a Tile offers. Actions are never set per
Tile by hand.

## Action

What a reader can do with a Tile's Text: share it, or open its original.
Both require a Provenance that has a URL, so a Tile whose Provenance is
*None* offers no Actions at all.
