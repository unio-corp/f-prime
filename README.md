# Moodboard Femmina Prime

La moodboard di Femmina Prime: una griglia editoriale di Tile, ognuna con un
Medium (immagine o video), un Testo e la sua Provenienza.

**Produzione:** https://moodboard-femmina.vercel.app

## Stato

La fase di clonazione è chiusa. Il layout attuale nasce come emulazione della
sezione moodboard di `magdabutrym.com/it-en/moodboard-official` e ora è in
**personalizzazione**: i componenti clonati vengono progressivamente riscritti
nel linguaggio e nell'estetica di Femmina Prime.

I componenti ancora nella forma originale vivono sotto
`src/components/sites/<host>/<pagina>/`, con gli asset corrispondenti in
`public/sites/<host>/<pagina>/`.

## Stack

- Next.js 16 (App Router, React 19, TypeScript strict)
- Tailwind CSS v4 con token oklch
- shadcn/ui su primitive Base UI
- Deploy su Vercel

## Sviluppo

```bash
npm install
npm run dev          # http://localhost:3000
```

Verifiche:

```bash
npm run lint
npm run typecheck
npm run build
npm run check        # i tre precedenti in sequenza
```

## Deploy

```bash
vercel deploy          # preview (protetta da Vercel Authentication)
vercel deploy --prod   # produzione → moodboard-femmina.vercel.app
```

Progetto Vercel: `unio-root/moodboard-femmina`.

## Struttura

```
src/
  app/                  # route Next.js
  components/
    sites/<host>/       # componenti clonati per pagina sorgente (+ shared/ icone)
    ui/                 # primitive shadcn/ui
  lib/utils.ts          # utility cn()
  types/moodboard.ts    # Tile, Medium, Provenance …
public/
  sites/<host>/<pag>/   # asset clonati: immagini, video, font, seo
docs/
  adr/                  # decisioni architetturali
  agents/               # workflow degli agenti
  design-references/    # screenshot della pagina sorgente, per il confronto visivo
CONTEXT.md              # glossario di dominio
```

## Convenzioni

- Il vocabolario di dominio sta in [`CONTEXT.md`](CONTEXT.md): i nomi nel codice
  lo seguono (una cella è una *Tile*, non una *card*).
- Le decisioni che divergono dal sito sorgente si annotano in `docs/adr/`.
- Le linee guida per gli agenti stanno in [`AGENTS.md`](AGENTS.md).

## Note

`public/sites/` contiene circa 90 MB di media clonati, in gran parte video.
Prima di aggiungere altri binari pesanti al repo, valutare Vercel Blob.
