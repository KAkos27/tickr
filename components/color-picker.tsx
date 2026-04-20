"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ALLOWED_COLORS } from "@/lib/colors";
import type { FormAction } from "@/types/common";

import style from "@/styles/components/color-picker.module.scss";

type ColorPickerState = { message?: string };

export default function ColorPicker({
  currentColor,
  action,
}: {
  currentColor: string;
  action: FormAction<ColorPickerState>;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [state, formAction] = useActionState<ColorPickerState, FormData>(
    action,
    {},
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={style.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={style.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Szín választás"
      >
        <span
          className={style.dot}
          style={{ backgroundColor: currentColor }}
        />
        <span className={style.label}>Szín</span>
      </button>

      <div
        className={style.dropdown}
        style={{ display: open ? undefined : "none" }}
      >
        <span className={style.dropdownLabel}>Válassz színt</span>
        <div className={style.grid}>
          {ALLOWED_COLORS.map((color) => (
            <form key={color} action={formAction}>
              <input type="hidden" name="color" value={color} />
              <button
                type="submit"
                className={`${style.swatch} ${
                  color === currentColor ? style.swatchActive : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setOpen(false)}
                aria-label={color}
              />
            </form>
          ))}
        </div>
        {state.message && (
          <span className={style.feedback}>{state.message}</span>
        )}
      </div>
    </div>
  );
}
