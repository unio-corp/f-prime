import type { SVGProps } from "react";

/**
 * Icone SVG condivise.
 */

type IconProps = SVGProps<SVGSVGElement>;

/** Comando di chiusura del modale di anteprima. */
export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" />
    </svg>
  );
}
