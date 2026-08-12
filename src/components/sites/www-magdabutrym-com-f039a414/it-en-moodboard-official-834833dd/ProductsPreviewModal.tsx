"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/sites/www-magdabutrym-com-f039a414/shared/icons";
import { cn } from "@/lib/utils";
import type { MoodboardProduct, MoodboardTile } from "@/types/moodboard";

import { MOODBOARD_PRODUCTS } from "./moodboard-products";
import { TileMedia } from "./TileMedia";

interface ProductsPreviewModalProps {
  tile: MoodboardTile;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function formatPrice(product: MoodboardProduct) {
  // Spec: `${amount} ${currencyCode}` with no decimals, e.g. "2615 EUR".
  return `${Math.round(product.price)} ${product.currency}`;
}

function ProductRow({ product }: { product: MoodboardProduct }) {
  return (
    <div className="relative flex w-60 flex-col-reverse nav:grid nav:w-auto nav:grid-cols-2 nav:items-start">
      <div className="nav:sticky nav:top-0 nav:flex nav:h-screen nav:flex-col nav:justify-center nav:pr-8 nav:pl-16">
        <h2 className="font-mb-serif text-base leading-[1.25] text-black">
          {product.title}
        </h2>
        <p className="font-mb-sans mt-1 text-[13px] leading-[1.9230769231] text-[#9e9e9e]">
          {formatPrice(product)}
        </p>
        <button
          type="button"
          className="font-mb-sans mt-3 h-10 w-full bg-black text-center text-xs leading-[1.5] text-white transition-colors duration-300 nav:h-[35px] nav:border nav:border-black nav:bg-transparent nav:text-black nav:hover:bg-black nav:hover:text-white"
        >
          Add to bag
        </button>
        <Link
          href={product.href}
          className="font-mb-sans mt-3 self-center text-[13px] leading-[1.9230769231] text-black underline [text-underline-offset:2px]"
        >
          View details
        </Link>
      </div>

      <div className="relative aspect-[1000/1400] w-60 shrink-0 bg-[#f0eeea] nav:h-screen nav:w-full nav:bg-transparent">
        {product.image ? (
          <Image
            src={product.image.src}
            alt={product.title}
            fill
            sizes="(min-width: 1000px) 40vw, 240px"
            className="object-contain"
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * Full-viewport preview opened from a moodboard tile.
 *
 * INTERACTION MODEL: scroll-driven at >=1000px — the tile media is sticky on the
 * left while the product column scrolls, and each product's info block stays
 * pinned beside its own image. Below 1000px the products become a horizontal
 * scroller, matching `.ProductsPreviewModal_productsWrap`.
 */
export function ProductsPreviewModal({ tile, onClose }: ProductsPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Target uses `Content_contentBaseClass_transition-fade` (~.3s opacity) on open.
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    closeButtonRef.current?.focus();

    // Trigger the fade-in on the next frame so the initial opacity-0 paints first.
    const raf = requestAnimationFrame(() => setIsVisible(true));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !modalRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const products = tile.products
    .map((handle) => MOODBOARD_PRODUCTS[handle])
    .filter((product): product is MoodboardProduct => Boolean(product));

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Product preview"
      className={cn(
        "fixed inset-0 z-[9000] overflow-y-auto bg-white opacity-0 transition-opacity duration-300 wide:bg-[#f5f3ef]",
        isVisible && "opacity-100",
      )}
    >
      <div className="mb-container pointer-events-none fixed inset-x-0 top-0 z-[2] grid h-15 grid-cols-[60px_1fr_60px]">
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="pointer-events-auto col-start-3 grid cursor-pointer place-items-center justify-self-end"
        >
          <CloseIcon className="size-6 text-black" />
        </button>
      </div>

      <div className="grid h-full max-h-full min-h-[calc(71vh+110px)] grid-rows-[1fr_auto] mini:max-h-none mini:min-h-screen nav:grid-cols-[1fr_1fr] nav:grid-rows-none wide:grid-cols-[1fr_800px]">
        <div className="relative min-h-0 overflow-hidden nav:overflow-visible">
          <div className="h-full min-h-[100px] w-full px-16 py-6 mini:px-8 tab:px-12 nav:sticky nav:top-0 nav:flex nav:h-screen nav:items-center nav:p-16">
            <TileMedia
              media={tile.media}
              layout="intrinsic"
              sizes="(min-width: 1000px) 45vw, 100vw"
              className="max-h-full"
            />
          </div>
        </div>

        <div className="grid auto-cols-min grid-flow-col justify-items-center gap-x-6 gap-y-0.5 overflow-x-auto overflow-y-hidden pb-4 [-ms-overflow-style:none] [align-content:safe_center] [scrollbar-width:none] before:block before:w-[0.1px] before:content-[''] after:block after:w-[0.1px] after:content-['_'] [&::-webkit-scrollbar]:hidden nav:auto-cols-auto nav:grid-flow-row nav:justify-items-stretch nav:gap-x-0 nav:overflow-x-hidden nav:overflow-y-visible nav:bg-[#fcfaf7] nav:pb-0">
          {products.map((product) => (
            <ProductRow key={product.handle} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
