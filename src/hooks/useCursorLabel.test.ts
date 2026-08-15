// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCursorLabel } from "./useCursorLabel";

describe("useCursorLabel", () => {
  it("pubblica la label al pointer enter", () => {
    const onCursorLabel = vi.fn();
    const { result } = renderHook(() => useCursorLabel("FIT", onCursorLabel));

    act(() => result.current.onPointerEnter());

    expect(onCursorLabel).toHaveBeenCalledWith("FIT");
  });

  it("ritira la label al pointer leave", () => {
    const onCursorLabel = vi.fn();
    const { result } = renderHook(() => useCursorLabel("FIT", onCursorLabel));

    act(() => result.current.onPointerEnter());
    act(() => result.current.onPointerLeave());

    expect(onCursorLabel).toHaveBeenLastCalledWith(null);
  });

  it("ripubblica la label se cambia mentre il puntatore è fermo sopra", () => {
    const onCursorLabel = vi.fn();
    const { result, rerender } = renderHook(({ label }) => useCursorLabel(label, onCursorLabel), {
      initialProps: { label: "FIT" },
    });

    act(() => result.current.onPointerEnter());
    onCursorLabel.mockClear();

    rerender({ label: "ZOOM" });

    expect(onCursorLabel).toHaveBeenCalledWith("ZOOM");
  });

  it("non pubblica se la label cambia mentre il puntatore è fuori", () => {
    const onCursorLabel = vi.fn();
    const { rerender } = renderHook(({ label }) => useCursorLabel(label, onCursorLabel), {
      initialProps: { label: "FIT" },
    });

    rerender({ label: "ZOOM" });

    expect(onCursorLabel).not.toHaveBeenCalled();
  });

  it("ritira la label allo smontaggio", () => {
    const onCursorLabel = vi.fn();
    const { unmount } = renderHook(() => useCursorLabel("FIT", onCursorLabel));

    unmount();

    expect(onCursorLabel).toHaveBeenCalledWith(null);
  });
});
