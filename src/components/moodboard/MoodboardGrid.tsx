"use client";

import { useState } from "react";

import type { MoodItem } from "@/lib/moodboard/source";

import { MoodModal } from "./MoodModal";
import { MoodboardTile } from "./MoodboardTile";

interface MoodboardGridProps {
  items: MoodItem[];
}

/**
 * Griglia a tutta larghezza: 4 colonne fino a 1000px, 6 oltre. Nessun gap,
 * nessun margine di contenitore. Le Tile sono statiche: niente rotazioni né
 * dissolvenze.
 *
 * 18 Tile totali: 6x3 al breakpoint desktop. Sotto `nav:` le Tile 7 e 15
 * si nascondono (16 = 4x4 esatte), altrimenti l'ultima riga resterebbe con
 * due sole celle.
 *
 * `priority={item.id < 9}` copre la prima riga desktop (id 0-5) e le prime
 * due righe mobile (id 0-6 e 8; la 7 è nascosta). Al momento del render non
 * conosciamo la viewport, quindi carichiamo subito l'unione dei due casi
 * above the fold: qualche Tile in più su desktop è un sovraccarico piccolo
 * e voluto, preferibile al caricare troppo poco sugli schermi stretti.
 */
export function MoodboardGrid({ items }: MoodboardGridProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openItem = items.find((item) => item.slug === openSlug) ?? null;

  // Cattura e ripristino del focus vivono nel guscio del modale, che sa
  // quando viene montato e smontato.
  const handleClose = () => setOpenSlug(null);

  return (
    <div className="relative">
      <section aria-label="Moodboard" className="grid w-full grid-cols-4 nav:grid-cols-6">
        {items.map((item) => (
          <MoodboardTile
            key={item.slug}
            item={item}
            onOpen={setOpenSlug}
            priority={item.id < 9}
            hiddenBelowNav={item.id === 7 || item.id === 15}
          />
        ))}
      </section>

      {openItem ? <MoodModal item={openItem} onClose={handleClose} /> : null}
    </div>
  );
}
