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
