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

// Base fittizia usata solo per risolvere gli href relativi: se dopo la
// risoluzione l'origin è ancora questo, l'href era davvero root-relative.
const PLACEHOLDER_BASE = "https://placeholder.invalid";

/**
 * Tiene fuori dal DOM tutto ciò che non è una pagina: `javascript:`, `data:`,
 * `mailto:` e gli URL protocol-relative — inclusi quelli mascherati da
 * backslash (`/\evil.example`), che il WHATWG URL parser tratta come `/`
 * negli schemi speciali (http/https) e che un controllo su prefissi di
 * stringa non intercetta.
 */
function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;

  // Href assoluto: valido solo se lo è già da solo, senza bisogno di base.
  try {
    const { protocol } = new URL(href);
    return protocol === "http:" || protocol === "https:" ? href : undefined;
  } catch {
    // Non è un URL assoluto: potrebbe essere root-relative, si continua sotto.
  }

  // Href relativo: si risolve contro una base fittizia. Se l'origin
  // risultante è ancora quello della base, l'href era davvero root-relative
  // e non ha spostato la navigazione altrove.
  try {
    const resolved = new URL(href, PLACEHOLDER_BASE);
    return resolved.origin === PLACEHOLDER_BASE ? href : undefined;
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
