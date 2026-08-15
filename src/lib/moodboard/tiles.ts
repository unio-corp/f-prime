import type { MoodboardTile } from '@/types/moodboard';

/**
 * CONTENUTI PLACEHOLDER TEMPORANEI — DA SOSTITUIRE PRIMA DEL LANCIO.
 *
 * Ogni Tile punta a `/moodboard/placeholder.jpg`. Solo `width`/`height` sono
 * reali: portano le proporzioni originali di ciascuna Tile, così griglia e
 * modale si dispongono esattamente come faranno con i Media definitivi.
 *
 * Sostituire questo file (o il CMS dietro `./source.ts`) con i Media veri
 * prima del lancio: pubblicare il placeholder significherebbe pubblicare 32
 * immagini identiche.
 */

export const MOODBOARD_TILES: MoodboardTile[] = [
  {"id":0,"media":{"kind":"image","src":"/moodboard/tiles/tile-0.jpg","width":3880,"height":5773,"alt":""},"modal":"zoom"},
  {"id":1,"media":{"kind":"image","src":"/moodboard/tiles/tile-1.jpg","width":2048,"height":3072,"alt":""},"modal":"zoom"},
  {"id":2,"media":{"kind":"image","src":"/moodboard/tiles/tile-2.jpg","width":2560,"height":3840,"alt":""},"modal":"zoom"},
  {"id":3,"media":{"kind":"image","src":"/moodboard/tiles/tile-3.jpg","width":1600,"height":2400,"alt":""},"modal":"zoom"},
  {"id":4,"media":{"kind":"image","src":"/moodboard/tiles/tile-0.jpg","width":3880,"height":5773,"alt":""},"modal":"double","extraMedia":[{"media":{"kind":"image","src":"/moodboard/tiles/tile-1.jpg","width":2048,"height":3072,"alt":""},"href":"https://femminaprime.com"}]},
  {"id":5,"media":{"kind":"image","src":"/moodboard/tiles/tile-2.jpg","width":2560,"height":3840,"alt":""},"modal":"gallery","extraMedia":[{"media":{"kind":"image","src":"/moodboard/tiles/tile-3.jpg","width":1600,"height":2400,"alt":""},"href":"https://femminaprime.com"},{"media":{"kind":"image","src":"/moodboard/tiles/tile-0.jpg","width":3880,"height":5773,"alt":""}},{"media":{"kind":"image","src":"/moodboard/tiles/tile-1.jpg","width":2048,"height":3072,"alt":""},"href":"/"}]},
  {"id":6,"media":{"kind":"image","src":"/moodboard/tiles/tile-4.jpg","width":900,"height":1125,"alt":""},"modal":"zoom"},
  {"id":7,"media":{"kind":"image","src":"/moodboard/tiles/tile-5.jpg","width":2048,"height":3072,"alt":""},"modal":"zoom"},
  {"id":8,"media":{"kind":"image","src":"/moodboard/tiles/tile-6.jpg","width":2048,"height":3072,"alt":""},"modal":"zoom"},
  {"id":9,"media":{"kind":"image","src":"/moodboard/tiles/tile-7.jpg","width":2048,"height":3072,"alt":""},"modal":"zoom"},
  {"id":10,"media":{"kind":"image","src":"/moodboard/tiles/tile-8.jpg","width":2048,"height":3072,"alt":""},"modal":"zoom"},
  {"id":11,"media":{"kind":"image","src":"/moodboard/tiles/tile-9.jpg","width":2048,"height":3072,"alt":""},"modal":"zoom"},
  {"id":12,"media":{"kind":"image","src":"/moodboard/tiles/tile-10.png","width":941,"height":1672,"alt":""},"modal":"zoom"},
  {"id":13,"media":{"kind":"image","src":"/moodboard/tiles/tile-11.jpg","width":2560,"height":3840,"alt":""},"modal":"zoom"},
  {"id":14,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"modal":"zoom"},
  {"id":15,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":16,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":17,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":18,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"modal":"zoom"},
  {"id":19,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":20,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"modal":"zoom"},
  {"id":21,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2226,"height":2783,"alt":""},"modal":"zoom"},
  {"id":22,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":23,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"modal":"zoom"},
  {"id":24,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":25,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"modal":"zoom"},
  {"id":26,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":27,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"modal":"zoom"},
  {"id":28,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":29,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
  {"id":30,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":1080,"height":1440,"alt":""},"modal":"zoom"},
  {"id":31,"media":{"kind":"image","src":"/moodboard/placeholder.jpg","width":2000,"height":2500,"alt":""},"modal":"zoom"},
];
