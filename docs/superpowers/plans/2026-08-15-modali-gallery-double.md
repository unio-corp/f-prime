# Layout modali `gallery` e `double` — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** far sì che una Tile possa portare più Media e che il modale li mostri con due layout, `double` (due Media) e `gallery` (N Media scorribili), con link opzionale per Medium.

**Architecture:** i dati grezzi restano permissivi; `toMoodItem()` li valida e produce una union discriminata su `modal`, così un renderer non può ricevere una cardinalità sbagliata. Il guscio del modale non conosce i layout: delega a un registro tipizzato, dove aggiungere un layout significa scrivere un componente e registrarlo.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript strict, Tailwind CSS v4 con token `fp-`, Vitest (introdotto da questo piano).

**Spec:** `docs/superpowers/specs/2026-08-15-modali-gallery-double-design.md`

## Global Constraints

- TypeScript strict, **nessun `any`**, export nominati.
- Solo design token con prefisso `fp-` definiti in `src/app/globals.css`. Mai px o hex grezzi, mai stili inline.
- Classi utility Tailwind, indentazione 2 spazi, mobile-first.
- **Commenti in italiano.** Stringhe UI e `aria-label` restano in inglese.
- Ogni transizione porta `motion-reduce:transition-none`.
- Ogni link esterno porta `target="_blank"` e `rel="noopener noreferrer"`.
- Il branch di lavoro è `chore/rimuovi-prodotti-esterni`, che ha ~195 modifiche non committate preesistenti: **ogni commit di questo piano usa `git add` sui soli file elencati nel task**, mai `git add -A`.
- Messaggi di commit in italiano, conventional commits, **senza trailer di attribuzione**.
- La build si verifica sempre pulita: `rm -rf .next && npm run build`. Una build sporca ha già ingannato una sessione precedente riusando CSS in cache.
- Tailwind ignora in silenzio le classi che non risolve: dopo aver introdotto una utility nuova, controllare che esista davvero in `.next/static/chunks/*.css`.

---

### Task 1: Vocabolario di dominio

Il glossario oggi vieta esplicitamente il secondo Medium: finché non è corretto, il resto del piano contraddice la documentazione.

**Files:**
- Modify: `CONTEXT.md`

**Interfaces:**
- Consumes: niente.
- Produces: i termini **Medium** (rivisto), **Detail view**, **Link**, usati come vocabolario da tutti i task successivi.

- [ ] **Step 1: Riscrivere la voce Medium**

Sostituire l'intera voce `## Medium` con:

```markdown
## Medium

The image or video shown on a Tile. A Tile carries one or more Media, in order:
the first is the one the Moodboard shows in the grid, and the detail view opens
on that same Medium, unchanged. The Media that follow appear only in the detail
view.

Media are produced editorially. They are not screenshots or downloads of social
posts, even when the Text beside them comes from one.
```

- [ ] **Step 2: Aggiungere le voci Detail view e Link**

Inserire dopo la voce `## Medium`:

```markdown
## Detail view

What a Tile opens into: the Tile's Media, shown large. Which layout the detail
view uses is a property of the Tile, never a choice the reader makes.

## Link

An optional destination carried by a Medium in the detail view. A Medium with a
Link opens it in a new tab; a Medium without one does nothing. The Medium shown
in the grid never carries a Link.
```

- [ ] **Step 3: Verificare che il glossario resti solo glossario**

Rileggere le tre voci: nessun nome di file, nessun tipo TypeScript, nessuna decisione architetturale. Se ce ne sono, spostarli nello spec.

- [ ] **Step 4: Commit**

```bash
git add CONTEXT.md
git commit -m "docs: il glossario ammette più Media per Tile e definisce Link"
```

---

### Task 2: Contratto dati grezzo

Introduce `extraMedia` e rimuove `products`, campo deprecato che nessun codice legge.

**Files:**
- Modify: `src/types/moodboard.ts`
- Modify: `src/lib/moodboard/tiles.ts`

**Interfaces:**
- Consumes: `MoodboardMedia` (già esistente).
- Produces: `MoodboardDetailMedium { media: MoodboardMedia; href?: string }` e `MoodboardTile.extraMedia?: MoodboardDetailMedium[]`, consumati dal Task 3.

- [ ] **Step 1: Aggiungere il tipo del Medium di dettaglio**

In `src/types/moodboard.ts`, subito dopo `export type MoodboardMedia = …`:

```ts
/**
 * Un Medium del detail view, con la sua destinazione opzionale. Il Link vive
 * qui e non su `MoodboardMedia`, che resta un descrittore puro: la griglia
 * riusa lo stesso tipo senza sapere che i link esistono.
 */
export interface MoodboardDetailMedium {
  media: MoodboardMedia;
  /** Se presente e valido, il Medium apre questa pagina in una nuova scheda. */
  href?: string;
}
```

- [ ] **Step 2: Sostituire `products` con `extraMedia` in `MoodboardTile`**

Sostituire il blocco:

```ts
  /** Handle ereditati dai dati catturati; non usati dalla UI. */
  products?: string[];
```

con:

```ts
  /** Media mostrati solo nel detail view, in ordine dopo `media`. */
  extraMedia?: MoodboardDetailMedium[];
```

- [ ] **Step 3: Togliere `products` dai 32 record grezzi**

```bash
sed -i '' -E 's/,"products":\[[^]]*\]//g' src/lib/moodboard/tiles.ts
grep -c products src/lib/moodboard/tiles.ts
```

Atteso: `0`.

- [ ] **Step 4: Verificare che nulla leggesse quel campo**

```bash
grep -rn "products" src/ && echo "TROVATO" || echo "pulito"
```

Atteso: `pulito`. Se compare qualcosa, è codice che va aggiornato prima di proseguire.

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

Atteso: nessun errore.

- [ ] **Step 6: Commit**

```bash
git add src/types/moodboard.ts src/lib/moodboard/tiles.ts
git commit -m "feat: i dati di una Tile ammettono Media aggiuntivi con Link"
```

---

### Task 3: Validazione e union discriminata (TDD)

Il cuore del piano. Estrae la conversione in un modulo proprio perché sia testabile senza passare dai dati reali, introduce Vitest e ci fa TDD.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/moodboard/to-mood-item.ts`
- Create: `src/lib/moodboard/to-mood-item.test.ts`
- Modify: `src/lib/moodboard/source.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `MoodboardTile`, `MoodboardDetailMedium`, `MoodboardMedia` dal Task 2.
- Produces:
  - `type DetailMedium = { media: MoodboardMedia; href?: string }` — il Medium **validato**.
  - `type MoodItem` — union discriminata su `modal`, con rami `"zoom" | "gallery" | "double"`.
  - `function toMoodItem(tile: MoodboardTile): MoodItem`.
  - `MoodItem` resta ri-esportato da `@/lib/moodboard/source`, che è il percorso da cui tutti i componenti lo importano già oggi.

- [ ] **Step 1: Installare Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Configurare Vitest**

Creare `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Logica pura: nessun ambiente DOM, nessun plugin React. L'alias replica
// quello di `tsconfig.json`, che Vitest non legge da solo.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Aggiungere gli script**

In `package.json`, dentro `"scripts"`, aggiungere `"test": "vitest run"` e sostituire la riga `check` con:

```json
    "check": "npm run lint && npm run typecheck && npm run test && npm run build",
```

- [ ] **Step 4: Scrivere i test che falliscono**

Creare `src/lib/moodboard/to-mood-item.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import type { MoodboardDetailMedium, MoodboardMedia, MoodboardTile } from "@/types/moodboard";

import { toMoodItem } from "./to-mood-item";

const media: MoodboardMedia = {
  kind: "image",
  src: "/moodboard/placeholder.jpg",
  width: 2000,
  height: 2500,
  alt: "",
};

function detail(href?: string): MoodboardDetailMedium {
  return href ? { media, href } : { media };
}

// Ogni test usa un id diverso: l'avviso di degrado è deduplicato per Tile e
// resterebbe silenzioso al secondo test con lo stesso id.
function tile(id: number, overrides: Partial<MoodboardTile> = {}): MoodboardTile {
  return { id, media, ...overrides };
}

describe("toMoodItem", () => {
  it("deriva slug e layout predefinito quando la Tile non dichiara nulla", () => {
    const item = toMoodItem(tile(1));

    expect(item).toEqual({ id: 1, slug: "tile-1", media, modal: "zoom" });
  });

  it("accetta gallery con un solo Medium aggiuntivo", () => {
    const item = toMoodItem(tile(2, { modal: "gallery", extraMedia: [detail()] }));

    expect(item.modal).toBe("gallery");
    expect(item.modal === "gallery" && item.extraMedia).toHaveLength(1);
  });

  it("accetta gallery con molti Media aggiuntivi", () => {
    const extraMedia = [detail(), detail(), detail()];
    const item = toMoodItem(tile(3, { modal: "gallery", extraMedia }));

    expect(item.modal === "gallery" && item.extraMedia).toHaveLength(3);
  });

  it("degrada gallery a zoom quando non ci sono Media aggiuntivi", () => {
    const item = toMoodItem(tile(4, { modal: "gallery", extraMedia: [] }));

    expect(item.modal).toBe("zoom");
  });

  it("accetta double con esattamente un Medium aggiuntivo", () => {
    const item = toMoodItem(tile(5, { modal: "double", extraMedia: [detail()] }));

    expect(item.modal === "double" && item.extraMedia).toHaveLength(1);
  });

  it("degrada double a zoom quando i Media aggiuntivi sono due", () => {
    const item = toMoodItem(tile(6, { modal: "double", extraMedia: [detail(), detail()] }));

    expect(item.modal).toBe("zoom");
  });

  it("degrada text a zoom perché non è implementato", () => {
    const item = toMoodItem(tile(7, { modal: "text" }));

    expect(item.modal).toBe("zoom");
  });

  it("conserva gli href http, https e relativi", () => {
    const item = toMoodItem(
      tile(8, {
        modal: "gallery",
        extraMedia: [
          detail("https://femminaprime.com/a"),
          detail("http://femminaprime.com/b"),
          detail("/collezioni/c"),
        ],
      }),
    );

    const hrefs = item.modal === "gallery" ? item.extraMedia.map((entry) => entry.href) : [];
    expect(hrefs).toEqual([
      "https://femminaprime.com/a",
      "http://femminaprime.com/b",
      "/collezioni/c",
    ]);
  });

  it("scarta gli href pericolosi o protocol-relative senza scartare il Medium", () => {
    const item = toMoodItem(
      tile(9, {
        modal: "gallery",
        // Il punto del test è proprio che questi href non arrivino mai al DOM.
        extraMedia: [detail("javascript:alert(1)"), detail("//evil.example"), detail("mailto:a@b.c")],
      }),
    );

    const hrefs = item.modal === "gallery" ? item.extraMedia.map((entry) => entry.href) : [];
    expect(hrefs).toEqual([undefined, undefined, undefined]);
    expect(item.modal === "gallery" && item.extraMedia).toHaveLength(3);
  });

  it("avvisa una sola volta per Tile quando degrada", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    toMoodItem(tile(10, { modal: "double", extraMedia: [] }));
    toMoodItem(tile(10, { modal: "double", extraMedia: [] }));

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
```

- [ ] **Step 5: Eseguire i test e verificare che falliscano**

```bash
npm run test
```

Atteso: FAIL, `Failed to resolve import "./to-mood-item"`.

- [ ] **Step 6: Implementare la conversione**

Creare `src/lib/moodboard/to-mood-item.ts`:

```ts
import type { MoodboardMedia, MoodboardTile } from "@/types/moodboard";

/**
 * Da dati grezzi a dati garantiti: qui la forma dichiarata da una Tile viene
 * verificata una volta sola, e ciò che esce è un tipo che i renderer non
 * possono usare male. Una Tile incoerente non è un errore fatale: diventa
 * `zoom`, perché i contenuti arriveranno da un CMS e un refuso editoriale non
 * deve rompere la pagina.
 */

/** Un Medium del detail view con href già ripulito. */
export interface DetailMedium {
  media: MoodboardMedia;
  href?: string;
}

interface MoodItemBase {
  id: number;
  /** Identificatore pubblico stabile. Derivato dall'id finché non lo fornisce il CMS. */
  slug: string;
  media: MoodboardMedia;
}

export type MoodItem =
  | (MoodItemBase & { modal: "zoom" })
  | (MoodItemBase & { modal: "gallery"; extraMedia: readonly [DetailMedium, ...DetailMedium[]] })
  | (MoodItemBase & { modal: "double"; extraMedia: readonly [DetailMedium] });

/**
 * Tiene fuori dal DOM tutto ciò che non è una pagina: `javascript:`, `data:`,
 * `mailto:` e gli URL protocol-relative, che seguono lo schema della pagina e
 * portano altrove.
 */
function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  if (href.startsWith("//")) return undefined;
  if (href.startsWith("/")) return href;

  try {
    const { protocol } = new URL(href);
    return protocol === "http:" || protocol === "https:" ? href : undefined;
  } catch {
    return undefined;
  }
}

// Il degrado si segnala una volta per Tile: in sviluppo React rimonta, e un
// avviso a ogni render sommergerebbe la console.
const warned = new Set<number>();

function warnOnce(tile: MoodboardTile, reason: string): void {
  if (process.env.NODE_ENV === "production" || warned.has(tile.id)) return;

  warned.add(tile.id);
  console.warn(`[moodboard] Tile ${tile.id}: ${reason} — falling back to "zoom".`);
}

export function toMoodItem(tile: MoodboardTile): MoodItem {
  const base: MoodItemBase = { id: tile.id, slug: `tile-${tile.id}`, media: tile.media };
  const layout = tile.modal ?? "zoom";
  const [first, ...rest] = (tile.extraMedia ?? []).map<DetailMedium>((entry) => {
    const href = safeHref(entry.href);
    return href ? { media: entry.media, href } : { media: entry.media };
  });

  if (first) {
    if (layout === "gallery") return { ...base, modal: "gallery", extraMedia: [first, ...rest] };
    if (layout === "double" && rest.length === 0) {
      return { ...base, modal: "double", extraMedia: [first] };
    }
  }

  if (layout !== "zoom") {
    warnOnce(tile, `layout "${layout}" is not satisfied by its Media`);
  }

  return { ...base, modal: "zoom" };
}
```

- [ ] **Step 7: Eseguire i test e verificare che passino**

```bash
npm run test
```

Atteso: 10 test passati.

- [ ] **Step 8: Riscrivere `source.ts` sopra la nuova conversione**

Sostituire l'intero contenuto di `src/lib/moodboard/source.ts` con:

```ts
import type { MoodboardTile } from "@/types/moodboard";

import { MOODBOARD_TILES } from "./tiles";
import { toMoodItem } from "./to-mood-item";

/**
 * L'unico punto che sa da dove arrivano i contenuti della moodboard.
 *
 * Oggi legge il file statico in questa cartella; domani interrogherà Sanity.
 * Nessun modulo esterno importa `./tiles`, quindi cambiare la sorgente resta
 * una modifica a queste due funzioni. La validazione vive accanto, in
 * `./to-mood-item`, per restare testabile senza passare dai dati reali.
 */

export type { DetailMedium, MoodItem } from "./to-mood-item";

export async function getAllMoodItems() {
  return MOODBOARD_TILES.map(toMoodItem);
}

export async function getMoodItem(slug: string) {
  const tile = MOODBOARD_TILES.find((candidate: MoodboardTile) => `tile-${candidate.id}` === slug);
  return tile ? toMoodItem(tile) : null;
}
```

- [ ] **Step 9: Verificare typecheck e lint**

```bash
npm run typecheck && npm run lint
```

Atteso: nessun errore. `MoodItem["modal"]` ora non può valere `"text"`; se `modal-layouts.ts` protesta, è previsto e lo sistema il Task 4.

- [ ] **Step 10: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/lib/moodboard/to-mood-item.ts src/lib/moodboard/to-mood-item.test.ts src/lib/moodboard/source.ts
git commit -m "feat: valida i Media di una Tile e ne deriva un tipo discriminato"
```

---

### Task 4: Contratti, registro tipizzato e guscio

Il registro impara i tipi dei singoli layout, e il cursore impara a nascondersi.

**Files:**
- Create: `src/components/moodboard/modal-contracts.ts`
- Delete: `src/components/moodboard/modal-layouts.ts`
- Create: `src/components/moodboard/modal-layouts.tsx`
- Modify: `src/components/moodboard/MoodModal.tsx`

**Interfaces:**
- Consumes: `MoodItem` dal Task 3.
- Produces:
  - `CURSOR_HIDDEN` e `type CursorLabel = string | null`, da `./modal-contracts`.
  - `type RightColumnLayout = "gallery" | "double"` e `interface ModalColumnProps<K extends RightColumnLayout> { item; onCursorLabel }`, da `./modal-contracts`.
  - `RIGHT_COLUMN_RENDERERS` e `renderRightColumn(item, onCursorLabel): ReactNode`, da `./modal-layouts`.

I contratti stanno in un modulo separato dal registro perché `modal-layouts` importa i componenti e i componenti importano i contratti: tenendoli insieme si otterrebbe un ciclo di import a runtime.

- [ ] **Step 1: Creare il modulo dei contratti**

Creare `src/components/moodboard/modal-contracts.ts`:

```ts
import type { MoodItem } from "@/lib/moodboard/source";

/**
 * Ciò che un renderer di colonna destra deve conoscere. Sta qui e non in
 * `./modal-layouts` perché quel modulo importa i componenti, e i componenti
 * importano questi tipi: insieme formerebbero un ciclo.
 */

/**
 * Etichetta del cursore dichiarata dal contenuto: `null` lascia al guscio il
 * suo `CLOSE`, `CURSOR_HIDDEN` non disegna nulla — per il contenuto inerte,
 * dove anche `CLOSE` mentirebbe.
 */
export const CURSOR_HIDDEN = "";

export type CursorLabel = string | null;

/** I layout che hanno una colonna destra: tutti tranne `zoom`. */
export type RightColumnLayout = Exclude<MoodItem["modal"], "zoom">;

export interface ModalColumnProps<K extends RightColumnLayout> {
  /** Ristretto al ramo di `MoodItem` che corrisponde al layout. */
  item: Extract<MoodItem, { modal: K }>;
  onCursorLabel: (label: CursorLabel) => void;
}
```

- [ ] **Step 2: Sostituire il registro**

```bash
git rm src/components/moodboard/modal-layouts.ts
```

Creare `src/components/moodboard/modal-layouts.tsx`:

```tsx
import type { ComponentType, ReactNode } from "react";

import type { MoodItem } from "@/lib/moodboard/source";

import type { CursorLabel, ModalColumnProps, RightColumnLayout } from "./modal-contracts";

/**
 * Registro dei renderer della colonna destra, indicizzati per layout.
 *
 * Aggiungere un layout significa scrivere un componente e registrarlo qui: il
 * guscio del modale non cambia mai. `zoom` è assente di proposito, perché è il
 * layout senza colonna destra: la sinistra occupa tutta la larghezza.
 */
export const RIGHT_COLUMN_RENDERERS: {
  [K in RightColumnLayout]?: ComponentType<ModalColumnProps<K>>;
} = {};

/**
 * Risolve il layout effettivamente reso. I dati incoerenti non arrivano più
 * fin qui — li ferma `toMoodItem()` — quindi resta un solo caso: dati validi
 * per un layout il cui renderer non è ancora scritto.
 */
const warned = new Set<RightColumnLayout>();

export function resolveModalLayout(layout: MoodItem["modal"]): MoodItem["modal"] {
  if (layout === "zoom" || RIGHT_COLUMN_RENDERERS[layout]) return layout;

  if (process.env.NODE_ENV !== "production" && !warned.has(layout)) {
    warned.add(layout);
    console.warn(
      `[moodboard] No renderer registered for modal layout "${layout}" — falling back to "zoom".`,
    );
  }

  return "zoom";
}

/**
 * L'unico punto in cui la dispatch dinamica incontra la union: TypeScript non
 * collega da solo la chiave `item.modal` al ramo di `MoodItem` corrispondente,
 * e questo `as` è il prezzo — pagato una volta, qui, invece che in ogni
 * renderer.
 */
export function renderRightColumn(
  item: MoodItem,
  onCursorLabel: (label: CursorLabel) => void,
): ReactNode {
  if (resolveModalLayout(item.modal) === "zoom" || item.modal === "zoom") return null;

  const Renderer = RIGHT_COLUMN_RENDERERS[item.modal] as ComponentType<{
    item: MoodItem;
    onCursorLabel: (label: CursorLabel) => void;
  }>;

  return <Renderer item={item} onCursorLabel={onCursorLabel} />;
}
```

- [ ] **Step 3: Far usare al guscio l'helper**

In `src/components/moodboard/MoodModal.tsx`, sostituire la riga di import:

```ts
import { RIGHT_COLUMN_RENDERERS, resolveModalLayout } from "./modal-layouts";
```

con:

```ts
import { CURSOR_HIDDEN } from "./modal-contracts";
import { renderRightColumn } from "./modal-layouts";
```

- [ ] **Step 4: Sostituire il calcolo del layout**

Sostituire:

```ts
  const layout = resolveModalLayout(item.modal);
  const RightColumn = RIGHT_COLUMN_RENDERERS[layout];
```

con:

```ts
  const rightColumn = renderRightColumn(item, setCursorLabel);
```

- [ ] **Step 5: Sostituire il blocco di render della colonna destra**

Sostituire:

```tsx
          RightColumn && "nav:grid-cols-[1fr_1fr] wide:grid-cols-[1fr_var(--spacing-fp-product-column)]",
```

con:

```tsx
          rightColumn && "nav:grid-cols-[1fr_1fr] wide:grid-cols-[1fr_var(--spacing-fp-product-column)]",
```

e sostituire:

```tsx
        {RightColumn ? (
          <div onClick={(event) => event.stopPropagation()}>
            <RightColumn item={item} />
          </div>
        ) : null}
```

con:

```tsx
        {/* Nessun wrapper che fermi il click: ogni Medium della colonna decide
            da sé se il click gli appartiene o se deve chiudere il modale. */}
        {rightColumn}
```

- [ ] **Step 6: Insegnare al cursore a nascondersi**

Sostituire:

```tsx
      {cursor ? (
```

con:

```tsx
      {cursor && contentLabel !== CURSOR_HIDDEN ? (
```

- [ ] **Step 7: Verificare typecheck, lint e test**

```bash
npm run typecheck && npm run lint && npm run test
```

Atteso: nessun errore. Il registro è ancora vuoto, quindi il modale rende solo `zoom`: è lo stato previsto fino al Task 6.

- [ ] **Step 8: Commit**

```bash
git add src/components/moodboard/modal-contracts.ts src/components/moodboard/modal-layouts.tsx src/components/moodboard/modal-layouts.ts src/components/moodboard/MoodModal.tsx
git commit -m "refactor: registro dei layout tipizzato e cursore che sa nascondersi"
```

---

### Task 5: `ColumnMedium`, il Medium della colonna destra

Il pezzo che `gallery` e `double` hanno in comune: rendering, cursore, click. Isolarlo lascia ai due layout il solo problema della composizione.

**Files:**
- Create: `src/components/moodboard/ColumnMedium.tsx`

**Interfaces:**
- Consumes: `DetailMedium` dal Task 3, `CURSOR_HIDDEN` e `CursorLabel` dal Task 4.
- Produces: `ColumnMedium({ item, onCursorLabel, priority }: ColumnMediumProps)`, usato dai Task 6 e 7.

- [ ] **Step 1: Scrivere il componente**

Creare `src/components/moodboard/ColumnMedium.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect } from "react";

import type { DetailMedium } from "@/lib/moodboard/source";

import { CURSOR_HIDDEN, type CursorLabel } from "./modal-contracts";

interface ColumnMediumProps {
  item: DetailMedium;
  onCursorLabel: (label: CursorLabel) => void;
  /** Il primo Medium visibile della colonna si carica subito, gli altri pigramente. */
  priority?: boolean;
}

/**
 * Un Medium della colonna destra. Con un Link è un'ancora e il cursore dice
 * `OPEN LINK`; senza, è inerte e il cursore sparisce — mostrare `CLOSE` su
 * qualcosa che ferma il click sarebbe una promessa non mantenuta.
 */
export function ColumnMedium({ item, onCursorLabel, priority = false }: ColumnMediumProps) {
  const { media, href } = item;
  const label = href ? "OPEN LINK" : CURSOR_HIDDEN;

  // Smontare il Medium (chiusura, cambio di Tile) non deve lasciare
  // un'etichetta appesa sul cursore.
  useEffect(() => () => onCursorLabel(null), [onCursorLabel]);

  const visual =
    media.kind === "image" ? (
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 64rem) 50vw, 100vw"
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="h-auto w-full select-none"
      />
    ) : (
      <video
        src={media.src}
        poster={media.poster}
        width={media.width}
        height={media.height}
        aria-label={media.alt}
        muted
        loop
        playsInline
        autoPlay
        className="h-auto w-full select-none"
      />
    );

  const pointerProps = {
    onPointerEnter: () => onCursorLabel(label),
    onPointerLeave: () => onCursorLabel(null),
  };

  if (!href) {
    return (
      // Inerte per davvero: ferma il click, così il cursore invisibile non
      // nasconde una chiusura inattesa del modale.
      <div {...pointerProps} onClick={(event) => event.stopPropagation()} className="block">
        {visual}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...pointerProps}
      // Il click apre il Link, non chiude il modale.
      onClick={(event) => event.stopPropagation()}
      className="block"
    >
      {visual}
    </a>
  );
}
```

- [ ] **Step 2: Verificare typecheck e lint**

```bash
npm run typecheck && npm run lint
```

Atteso: nessun errore. Il componente non è ancora usato da nessuno; è previsto.

- [ ] **Step 3: Commit**

```bash
git add src/components/moodboard/ColumnMedium.tsx
git commit -m "feat: Medium della colonna destra con Link opzionale"
```

---

### Task 6: Layout `double`

Primo layout registrato. Dopo questo task il registro non è più vuoto e la struttura a due colonne del guscio si vede davvero.

**Files:**
- Create: `src/components/moodboard/DoubleColumn.tsx`
- Modify: `src/components/moodboard/modal-layouts.tsx`
- Modify: `src/lib/moodboard/tiles.ts`

**Interfaces:**
- Consumes: `ModalColumnProps<"double">` dal Task 4, `ColumnMedium` dal Task 5.
- Produces: `DoubleColumn`, registrato sotto la chiave `double`.

- [ ] **Step 1: Scrivere il renderer**

Creare `src/components/moodboard/DoubleColumn.tsx`:

```tsx
"use client";

import { ColumnMedium } from "./ColumnMedium";
import type { ModalColumnProps } from "./modal-contracts";

/**
 * Due Media affiancati: la copertina a sinistra la rende il guscio, qui c'è il
 * secondo. Il tipo garantisce che ce ne sia esattamente uno, quindi non c'è
 * nulla da controllare a runtime.
 */
export function DoubleColumn({ item, onCursorLabel }: ModalColumnProps<"double">) {
  const [medium] = item.extraMedia;

  return (
    <div className="flex min-h-full items-start">
      <ColumnMedium item={medium} onCursorLabel={onCursorLabel} priority />
    </div>
  );
}
```

- [ ] **Step 2: Registrarlo**

In `src/components/moodboard/modal-layouts.tsx`, aggiungere l'import:

```tsx
import { DoubleColumn } from "./DoubleColumn";
```

e sostituire:

```tsx
} = {};
```

con:

```tsx
} = { double: DoubleColumn };
```

- [ ] **Step 3: Dare al layout una Tile su cui esistere**

In `src/lib/moodboard/tiles.ts`, sostituire l'intero record con `"id":4` con:

```json
  {"id":4,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"modal":"double","extraMedia":[{"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"href":"https://femminaprime.com"}]},
```

Le Tile 0–3 portano immagini reali inserite editorialmente: non toccarle. I dati di
prova vivono solo su Tile che usano ancora `placeholder.jpg`.

- [ ] **Step 4: Verificare la catena statica**

```bash
npm run typecheck && npm run lint && npm run test
```

Atteso: nessun errore, 10 test passati.

- [ ] **Step 5: Guardarlo nel browser**

```bash
npm run dev
```

Aprire `http://localhost:3000`, cliccare la Tile 2. Attesi: due colonne, il Medium di destra con cursore `OPEN LINK`, il click che apre `femminaprime.com` in una scheda nuova senza chiudere il modale, `Esc` e click sulle bande laterali che chiudono.

- [ ] **Step 6: Commit**

```bash
git add src/components/moodboard/DoubleColumn.tsx src/components/moodboard/modal-layouts.tsx src/lib/moodboard/tiles.ts
git commit -m "feat: layout modale double"
```

---

### Task 7: Layout `gallery`

**Files:**
- Create: `src/components/moodboard/GalleryColumn.tsx`
- Modify: `src/components/moodboard/modal-layouts.tsx`
- Modify: `src/lib/moodboard/tiles.ts`

**Interfaces:**
- Consumes: `ModalColumnProps<"gallery">` dal Task 4, `ColumnMedium` dal Task 5.
- Produces: `GalleryColumn`, registrato sotto la chiave `gallery`.

- [ ] **Step 1: Scrivere il renderer**

Creare `src/components/moodboard/GalleryColumn.tsx`:

```tsx
"use client";

import { ColumnMedium } from "./ColumnMedium";
import type { ModalColumnProps } from "./modal-contracts";

/**
 * I Media aggiuntivi impilati, senza spazio fra loro: scorrono con la pagina,
 * che nel modale è già l'unico contesto di scroll. Il tipo garantisce che ce
 * ne sia almeno uno.
 */
export function GalleryColumn({ item, onCursorLabel }: ModalColumnProps<"gallery">) {
  return (
    <div className="flex min-h-full flex-col">
      {item.extraMedia.map((medium, index) => (
        <ColumnMedium
          // La sorgente può ripetere lo stesso Medium: l'indice fa parte
          // dell'identità, e l'ordine di questa lista non cambia mai.
          key={`${medium.media.src}-${index}`}
          item={medium}
          onCursorLabel={onCursorLabel}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Registrarlo**

In `src/components/moodboard/modal-layouts.tsx`, aggiungere l'import:

```tsx
import { GalleryColumn } from "./GalleryColumn";
```

e sostituire:

```tsx
} = { double: DoubleColumn };
```

con:

```tsx
} = { double: DoubleColumn, gallery: GalleryColumn };
```

- [ ] **Step 3: Dare al layout una Tile su cui esistere**

In `src/lib/moodboard/tiles.ts`, sostituire l'intero record con `"id":5` con:

```json
  {"id":5,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"gallery","extraMedia":[{"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"href":"https://femminaprime.com"},{"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""}},{"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2226,"height":2783,"alt":""},"href":"/"}]},
```

Le Tile 0–3 portano immagini reali inserite editorialmente: non toccarle.

Tre Media con proporzioni diverse, di cui uno **senza** `href`: è il caso che rende osservabile il cursore nascosto.

- [ ] **Step 4: Verificare la catena statica**

```bash
npm run typecheck && npm run lint && npm run test
```

Atteso: nessun errore, 10 test passati.

- [ ] **Step 5: Guardarlo nel browser**

Con `npm run dev` attivo, aprire la Tile 3. Attesi: tre Media impilati a destra, il secondo senza cursore e inerte al click, gli altri due con `OPEN LINK`.

- [ ] **Step 6: Commit**

```bash
git add src/components/moodboard/GalleryColumn.tsx src/components/moodboard/modal-layouts.tsx src/lib/moodboard/tiles.ts
git commit -m "feat: layout modale gallery"
```

---

### Task 8: Verifica finale

Build e typecheck non coprono niente di ciò che rende usabile un modale. Questo task esiste per quello.

**Files:** nessuna modifica prevista; le correzioni che emergono si committano qui.

**Interfaces:**
- Consumes: tutto il lavoro precedente.
- Produces: la conferma che il piano è finito.

- [ ] **Step 1: Catena completa su build pulita**

```bash
rm -rf .next && npm run check
```

Atteso: lint, typecheck, test e build senza errori.

- [ ] **Step 2: Verificare che le utility Tailwind siano state generate**

```bash
grep -o "wide:grid-cols\|nav:grid-cols" .next/static/chunks/*.css | head
```

Atteso: almeno un riscontro. Tailwind ignora in silenzio le classi che non risolve, quindi l'assenza è un bug reale e non un dettaglio.

- [ ] **Step 3: Verificare che il placeholder sia tracciato**

```bash
git ls-files --error-unmatch public/moodboard/placeholder.jpg
```

Atteso: il percorso stampato. Se il file risulta sconosciuto a git, aggiungerlo: dopo un clone pulito tutte le Tile andrebbero in 404.

- [ ] **Step 4: Verifica in Chrome**

Con `npm run dev` attivo, usare la skill `claude-in-chrome`. Verificare, su Tile 2 (`double`) e Tile 3 (`gallery`):

- apertura del modale e ritorno del focus alla Tile che l'ha aperto alla chiusura;
- `Esc` chiude;
- click sulle bande laterali e sul backdrop chiude;
- `Tab` resta dentro il modale e ci gira in tondo;
- cursore `CLOSE` sul backdrop, `FIT`/`ZOOM` sul Medium di sinistra, `OPEN LINK` sui Media di destra con Link, **nessun cursore** su quelli senza;
- il click su un Medium con Link apre una scheda nuova e lascia il modale aperto;
- il click su un Medium senza Link non fa nulla;
- la colonna `gallery` scorre.

Gli eventi `pointerenter` sintetici non attivano `onPointerEnter` di React: serve il puntatore reale, cioè `computer` → `hover`, non `javascript_tool`.

- [ ] **Step 5: Verificare `prefers-reduced-motion`**

In Chrome DevTools, Rendering → *Emulate CSS media feature prefers-reduced-motion: reduce*. Riaprire un modale: la dissolvenza del backdrop deve essere assente, non solo più rapida.

- [ ] **Step 6: Verificare il degrado a `zoom`**

Modificare temporaneamente la Tile 2 mettendo `"extraMedia":[]` e lasciando `"modal":"double"`. Attesi: la Tile si apre in `zoom` a piena larghezza e la console mostra **una sola volta** `[moodboard] Tile 2: layout "double" is not satisfied by its Media — falling back to "zoom".` Ripristinare il record al termine.

- [ ] **Step 7: Commit delle eventuali correzioni**

Se i passi precedenti hanno richiesto modifiche:

```bash
git add <i soli file corretti>
git commit -m "fix: correzioni emerse dalla verifica dei layout modali"
```

Se non è cambiato nulla, non creare un commit vuoto.

---

## Fuori da questo piano

Restano intatti e non vanno toccati: il layout `text`, i concetti `Text` / `Provenance` / `Action`, il ramo morto `layout="natural"` di `TileMedia`, la traduzione delle stringhe UI e di `AGENTS.md`.

Le route `/icon`, `/apple-icon` e `/opengraph-image` restituiscono 500 in sviluppo per un problema noto di `ImageResponse` con Turbopack, e funzionano in produzione. Non è una regressione introdotta da questo piano.
