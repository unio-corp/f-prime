# Femmina Prime

Repo principale di Femmina Prime (`f-prime`). La superficie attuale è la
moodboard: una griglia editoriale di Tile, ognuna con un Medium (immagine o
video), un Testo e la sua Provenienza.

**Produzione:** https://f-prime.vercel.app
(`moodboard-femmina.vercel.app` resta come alias storico)

## Stato

Il progetto è in **personalizzazione**: la griglia viene progressivamente
riscritta nel linguaggio e nell'estetica di Femmina Prime.

I componenti della moodboard stanno in `src/components/moodboard/`, i dati e la
loro sorgente in `src/lib/moodboard/`, gli asset in `public/moodboard/`.

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
vercel deploy --prod   # produzione → f-prime.vercel.app
```

Progetto Vercel: `unio-root/f-prime`.

## Struttura

```
src/
  app/                  # route Next.js
  components/
    moodboard/          # griglia, Tile, media, modale prodotti
    ui/                 # primitive shadcn/ui
    icons.tsx           # icone SVG condivise
  lib/
    moodboard/          # dati e sorgente dei contenuti (source.ts)
    utils.ts            # utility cn()
  types/moodboard.ts    # Tile, Medium, Provenance …
public/
  moodboard/            # asset: immagini, video, font, seo
docs/
  adr/                  # decisioni architetturali
  agents/               # workflow degli agenti
CONTEXT.md              # glossario di dominio
```

`src/lib/moodboard/source.ts` è l'unico modulo che sa da dove arrivano i
contenuti: espone `getAllMoodItems()` e `getMoodItem(slug)`. I componenti
importano solo da lì, mai dai file di dati. Quando la sorgente diventerà
Sanity, cambierà solo questo modulo.

## Convenzioni

- Il vocabolario di dominio sta in [`CONTEXT.md`](CONTEXT.md): i nomi nel codice
  lo seguono (una cella è una *Tile*, non una *card*).
- Le decisioni architetturali si annotano in `docs/adr/`.
- Le linee guida per gli agenti stanno in [`AGENTS.md`](AGENTS.md).

## Note

`public/moodboard/` contiene circa 90 MB di media, in gran parte video.
Prima di aggiungere altri binari pesanti al repo, valutare Vercel Blob.
