/**
 * Contratti di contenuto della moodboard. Le forme sono ristrette a ciò che
 * la UI renderizza davvero.
 */

export interface MoodboardImageMedia {
  kind: "image";
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface MoodboardVideoMedia {
  kind: "video";
  src: string;
  poster: string;
  width: number;
  height: number;
  alt: string;
}

export type MoodboardMedia = MoodboardImageMedia | MoodboardVideoMedia;

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

/**
 * Quale layout usa il modale per una Tile. Oggi solo `zoom` ha un renderer;
 * gli altri valori sono dichiarati perché un nuovo layout sia un componente
 * più una voce nella mappa, mai una modifica al guscio del modale. I valori
 * non implementati ricadono su `zoom` al momento del render.
 */
export type ModalLayout = "zoom" | "gallery" | "double" | "text";

/** Una cella della griglia della moodboard. */
export interface MoodboardTile {
  id: number;
  media: MoodboardMedia;
  /** Vale `zoom` quando la sorgente dei contenuti non lo specifica. */
  modal?: ModalLayout;
  /** Media mostrati solo nel detail view, in ordine dopo `media`. */
  extraMedia?: MoodboardDetailMedium[];
}
