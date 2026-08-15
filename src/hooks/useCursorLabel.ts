"use client";

import { useEffect, useRef } from "react";

/**
 * Pubblica `label` sul cursore del modale finché il puntatore resta sopra
 * l'elemento, e la ritira quando l'elemento smonta o quando il puntatore
 * esce. Se `label` cambia mentre il puntatore è fermo (React che riusa
 * l'istanza per un contenuto diverso), la ripubblica.
 */
export function useCursorLabel(label: string, onCursorLabel: (label: string | null) => void) {
  const isPointerInside = useRef(false);

  useEffect(() => {
    if (isPointerInside.current) onCursorLabel(label);
  }, [label, onCursorLabel]);

  useEffect(() => () => onCursorLabel(null), [onCursorLabel]);

  return {
    onPointerEnter: () => {
      isPointerInside.current = true;
      onCursorLabel(label);
    },
    onPointerLeave: () => {
      isPointerInside.current = false;
      onCursorLabel(null);
    },
  };
}
