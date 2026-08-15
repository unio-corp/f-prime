# Layout modali `gallery` e `double` — design

**Data:** 2026-08-15
**Stato:** approvato in brainstorming, da implementare
**Branch di lavoro:** `chore/rimuovi-prodotti-esterni`

## Problema

Il guscio del modale (`MoodModal`) è già progettato per ospitare layout diversi
tramite un registro di renderer per la colonna destra, ma il registro è vuoto:
esiste solo `zoom`, il layout senza colonna destra. I valori `gallery`, `double`
e `text` sono dichiarati in `ModalLayout` e ricadono tutti su `zoom`.

Manca il modello dati. Nessuna Tile porta oggi più di un Medium, e i dati di
prodotto che riempivano la colonna destra nella versione precedente sono stati
eliminati. Prima di scrivere un renderer va deciso *che cosa* mostra.

## Scope

Dentro: modello dati per Media multipli, validazione, tipizzazione del registro,
renderer `gallery` e `double`.

Fuori: il layout `text`, i concetti `Text` / `Provenance` / `Action`, la rimozione
del ramo morto `layout="natural"` di `TileMedia`, la traduzione delle stringhe UI.

## Decisioni

### 1. Una Tile può portare più Media

`CONTEXT.md` oggi lo vieta esplicitamente. La voce **Medium** viene riscritta:

> **Medium** — The image or video shown on a Tile. A Tile carries one or more
> Media, in order: the first is the one the Moodboard shows in the grid, and the
> detail view opens on that same Medium, unchanged. The Media that follow appear
> only in the detail view.
>
> Media are produced editorially. They are not screenshots or downloads of social
> posts, even when the Text beside them comes from one.

Si aggiunge una voce **Detail view**, oggi usata dal glossario senza essere
definita, con la precisazione che il suo layout è determinato dalla Tile e non
scelto dal lettore.

Nessun termine di dominio nuovo per l'insieme dei Media: non esiste il concetto
"galleria", esistono *i Media di una Tile*, ordinati. La divisione in due campi
nel codice è una scelta di rappresentazione e non entra nel glossario.

`Text`, `Provenance` e `Action` restano nel glossario, invariati e non implementati.

### 2. Copertina più Media aggiuntivi

Il Medium della griglia resta il campo `media` e non cambia forma: la griglia non
va toccata. I Media successivi vivono in un campo separato e compaiono solo nel
detail view, dopo la copertina, che è **sempre** inclusa.

Il conto dei Media di un layout è quindi **totale, copertina inclusa**.

### 3. `gallery` e `double` si distinguono per cardinalità

- `double` — esattamente due Media: la copertina a sinistra, uno a destra.
  Cade esattamente nella struttura a due colonne che il guscio già applica.
- `gallery` — la copertina a sinistra, un numero libero (almeno uno) di Media
  scorribili a destra.

### 4. Dati incoerenti degradano a `zoom`

Una Tile che dichiara un layout ma non porta i Media che quel layout richiede non
è un errore fatale: viene resa come `zoom`, con un `console.warn` in sviluppo.
È lo stesso comportamento che `resolveModalLayout()` ha già per i layout privi di
renderer, e regge il caso reale in cui i contenuti arriveranno da un CMS.

### 5. I Media del detail view possono portare un Link

Un Medium della colonna destra può avere una destinazione. Voce di glossario da
aggiungere a `CONTEXT.md`:

> **Link** — An optional destination carried by a Medium in the detail view.
> A Medium with a Link opens it in a new tab; a Medium without one does nothing.
> The Medium shown in the grid never carries a Link.

Conseguenze:

- I Media aggiuntivi non sono `MoodboardMedia` nudi ma una coppia
  Medium + Link opzionale. `MoodboardMedia` resta un descrittore puro,
  riusato dalla griglia senza saperne nulla.
- Il cursore ha **tre** stati, non due: `OPEN LINK` sopra un Medium con Link,
  **nessuna etichetta** sopra un Medium senza Link, `CLOSE` ovunque altro.
- Un Medium senza Link è inerte: ferma il click, così un cursore invisibile non
  nasconde una chiusura inattesa.
- L'apertura usa `target="_blank"` con `rel="noopener noreferrer"`, e la
  validazione scarta ogni href che non sia `http(s)` o un percorso relativo:
  i contenuti arriveranno da un CMS, e uno `javascript:` non deve arrivare al DOM.

### 6. Il tipo prodotto dalla validazione è una union discriminata

Dati grezzi permissivi in ingresso, tipo stretto in uscita: *parse, don't
validate*. Un renderer non può ricevere una cardinalità sbagliata perché il tipo
non lo permette.

## Architettura

### Contratto grezzo — `src/types/moodboard.ts`

```ts
/** Un Medium del detail view, con la sua destinazione opzionale. */
export interface MoodboardDetailMedium {
  media: MoodboardMedia;
  /** Se presente e valido, il Medium apre questa pagina in una nuova scheda. */
  href?: string;
}

export interface MoodboardTile {
  id: number;
  media: MoodboardMedia;
  modal?: ModalLayout;
  /** Media mostrati solo nel detail view, in ordine dopo `media`. */
  extraMedia?: MoodboardDetailMedium[];
}
```

`products?: string[]` viene rimosso dal tipo e dai 32 record di `tiles.ts`:
nessun codice lo legge, `MoodItem` non lo espone.

`ModalLayout` resta `"zoom" | "gallery" | "double" | "text"`. `text` continua a
esistere come valore dichiarato e continua a degradare, senza codice associato.

### Tipo consumato dalla UI — `src/lib/moodboard/source.ts`

```ts
interface MoodItemBase {
  id: number;
  slug: string;
  media: MoodboardMedia;
}

export type MoodItem =
  | (MoodItemBase & { modal: "zoom" })
  | (MoodItemBase & { modal: "gallery"; extraMedia: readonly [DetailMedium, ...DetailMedium[]] })
  | (MoodItemBase & { modal: "double";  extraMedia: readonly [DetailMedium] });
```

`toMoodItem()` fa lo switch sul layout dichiarato, verifica la cardinalità di
`extraMedia` e restituisce il ramo stretto corrispondente. Se la verifica non
passa — o se il layout è `text` — restituisce il ramo `zoom` e avvisa una volta
per Tile in sviluppo, mai a ogni render.

La stessa funzione ripulisce gli href: un `href` che non sia `http(s)://…` o un
percorso relativo che inizia per `/` viene scartato, e il Medium diventa senza
Link. `DetailMedium` è quindi il tipo *validato*, con `href?: string` già sicuro.

Conseguenza voluta: `MoodItem["modal"]` non può valere `"text"`.

`resolveModalLayout()` resta ma cambia mestiere. Non copre più i layout invalidi,
che ora sono impossibili a valle di `source.ts`; copre il caso «dati validi,
renderer non ancora scritto», utile mentre i due renderer vengono costruiti uno
alla volta.

### Registro — `src/components/moodboard/modal-layouts.ts`

```ts
type RightColumnLayout = Exclude<MoodItem["modal"], "zoom">;  // "gallery" | "double"

export interface ModalColumnProps<K extends RightColumnLayout> {
  item: Extract<MoodItem, { modal: K }>;
  onCursorLabel: (label: string | null) => void;
}

export const RIGHT_COLUMN_RENDERERS: {
  [K in RightColumnLayout]?: ComponentType<ModalColumnProps<K>>;
} = { gallery: GalleryColumn, double: DoubleColumn };
```

La dispatch dinamica e la union si incontrano in un unico punto: un helper
`renderRightColumn(item, onCursorLabel)` esportato da questo modulo, che contiene
il solo `as` del sistema, commentato. Il contratto per aggiungere un layout resta
quello promesso: **un componente più una voce nella mappa, niente altro**.

Lo stesso modulo espone il booleano che dice se una Tile ha una colonna destra,
oggi ricalcolato dentro il guscio.

### Guscio — `src/components/moodboard/MoodModal.tsx`

Due modifiche:

1. `onCursorLabel` viene passata anche ai renderer del registro, non più solo a
   `ZoomMedia`.
2. L'etichetta del cursore acquista lo stato «nascosta», che oggi non esiste.
   `null` continua a significare «eredita `CLOSE`»; la costante esportata
   `CURSOR_HIDDEN` significa «non disegnare nulla». Il guscio non renderizza
   l'etichetta quando il contenuto ha dichiarato `CURSOR_HIDDEN`.

Backdrop, chiusura, focus trap e blocco dello scroll non cambiano.

### Renderer

`GalleryColumn` e `DoubleColumn` in `src/components/moodboard/`. La composizione
visiva — ritmo delle spaziature, comportamento dello scroll, stati hover, densità
— è deliberatamente decisa in implementazione con la skill `frontend-design`,
dentro questi vincoli:

- solo design token con prefisso `fp-`, mai px o hex grezzi;
- `event.stopPropagation()` sul contenuto, altrimenti il click chiude il modale;
- `motion-reduce:transition-none` su ogni transizione;
- etichetta del cursore dichiarata via `onCursorLabel`, con cleanup in `useEffect`
  come fa già `ZoomMedia`: `OPEN LINK` con Link, `CURSOR_HIDDEN` senza.

Entrambi i renderer disegnano i loro Media attraverso un unico componente
condiviso, `ColumnMedium` (`src/components/moodboard/ColumnMedium.tsx` — nome
distinto dal tipo `DetailMedium`, che è il dato), che
incapsula le tre cose che i due layout hanno in comune: il rendering
dell'immagine a larghezza di colonna, l'etichetta del cursore e il
comportamento al click. `gallery` e `double` restano così puri problemi di
composizione.

## Dati di prova

Nessun Medium reale esiste ancora. Le Tile di prova usano `placeholder.jpg`
ripetuto con `width`/`height` diversi, così le proporzioni cambiano e la
composizione si legge. Una Tile riceve `double`, un'altra `gallery`, entrambe in
modo stabile: `tiles.ts` è già marcato contenuto temporaneo, quindi non serve
ripristinare nulla.

Fra i Media di prova, almeno uno porta un `href` e almeno uno ne è privo, così
entrambi gli stati del cursore sono osservabili senza toccare i dati.

Il degrado a `zoom` di una Tile incoerente si verifica manualmente e non lascia
dati di prova nel file.

## Verifica

```bash
npm run lint
npm run typecheck
rm -rf .next && npm run build   # mai build sporca: la cache CSS ha già ingannato
```

Tailwind ignora in silenzio le classi che non risolve: dopo aver introdotto nuove
utility, ispezionare il CSS compilato in `.next/static/chunks/*.css`.

Build e typecheck non coprono il comportamento. In Chrome vanno verificati:
apertura dei due layout, `Esc`, click fuori, focus trap e ritorno del focus alla
Tile che ha aperto il modale, `OPEN LINK` e apertura in nuova scheda sui Media
con Link, cursore assente e click inerte su quelli senza, scroll
della colonna in `gallery`, `prefers-reduced-motion`. Gli eventi `pointerenter`
sintetici non attivano `onPointerEnter` di React: serve il puntatore reale.

Va inoltre verificato che `public/moodboard/placeholder.jpg` sia tracciato in git.

Le route `/icon`, `/apple-icon`, `/opengraph-image` danno 500 in sviluppo per un
problema noto di `ImageResponse` con Turbopack. In produzione funzionano. Non è
una regressione.

## Alternative scartate

- **Tipi permissivi con invariante garantita solo dal codice** (`extraMedia`
  sempre array, eventualmente vuoto). Nessun attrito nel registro, ma il tipo non
  impedisce a `double` di ricevere tre Media: lo impedisce solo la disciplina.
- **Cardinalità impossibile da rappresentare già nei dati grezzi.** Rende un
  errore di contenuto un errore di compilazione, troppo rigido per una sorgente
  che diventerà un CMS.
- **Validazione dentro ogni renderer.** Sparpaglia le regole e contraddice il
  principio per cui `source.ts` è l'unico punto che conosce i contenuti.
- **`switch` sul discriminante nel guscio** al posto dell'helper con un `as`.
  Zero cast, ma aggiungere un layout diventa componente più voce nella mappa più
  un `case`: contratto peggiore per un guadagno di una riga.
