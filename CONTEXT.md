# Context

Ubiquitous language for this project. Glossary only — no implementation
details, no specs, no decisions (those live in `docs/adr/`).

## Moodboard

The grid that conveys the mood of Femmina Prime through images and words.
There is one Moodboard; it is not user-owned or per-account. It is never
complete: Tiles are added editorially over time until the grid is filled.

## Tile

One cell of the Moodboard: one or more Media and a Text, plus the Text's Provenance.
A Tile also holds a Position.

## Position

A Tile's seat in the Moodboard: a number from 1 to 48, in reading order. No
two Tiles share a Position, and the Moodboard has no more seats than that.

Position is layout-independent: it says *which* seat, never how many columns
that seat sits in.

## Medium

The image or video shown on a Tile. A Tile carries one or more Media, in order:
the first is the one the Moodboard shows in the grid, and the detail view opens
on that same Medium, unchanged. The Media that follow appear only in the detail
view.

Media are produced editorially. They are not screenshots or downloads of social
posts, even when the Text beside them comes from one.

## Detail view

What a Tile opens into: the Tile's Media, shown large. Which layout the detail
view uses is a property of the Tile, never a choice the reader makes.

## Link

An optional destination carried by a Medium in the detail view. A Medium with a
Link opens it in a new tab; a Medium without one does nothing. The Medium shown
in the grid never carries a Link.

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
