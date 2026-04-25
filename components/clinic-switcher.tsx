"use client";

import { useEffect, useRef, useState } from "react";

import style from "@/styles/components/clinic-switcher.module.scss";

type ClinicOption = {
  clinicId: string;
  clinicName: string;
};

export default function ClinicSwitcher({
  clinics,
  activeClinicId,
  action,
}: {
  clinics: ClinicOption[];
  activeClinicId: string | null;
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeName =
    clinics.find((c) => c.clinicId === activeClinicId)?.clinicName ??
    "Nincs rendelő";

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (clinics.length === 0) return null;

  if (clinics.length === 1) {
    return (
      <div className={style.wrapper}>
        <div className={style.single}>
          <span className={style.singleLabel}>Rendelő</span>
          <strong className={style.singleName}>{activeName}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className={style.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={style.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Rendelő váltás"
      >
        <span className={style.triggerLabel}>Rendelő</span>
        <strong className={style.triggerName}>{activeName}</strong>
        <span
          className={`${style.triggerArrow} ${open ? style.triggerArrowOpen : ""}`}
        >
          ▾
        </span>
      </button>

      <div
        className={style.dropdown}
        style={{ display: open ? undefined : "none" }}
      >
        <span className={style.dropdownLabel}>Válassz rendelőt</span>
        <ul className={style.list}>
          {clinics.map((clinic) => {
            const isActive = clinic.clinicId === activeClinicId;
            return (
              <li key={clinic.clinicId}>
                <form action={action} onSubmit={() => setOpen(false)}>
                  <input
                    type="hidden"
                    name="clinicId"
                    value={clinic.clinicId}
                  />
                  <button
                    type="submit"
                    className={`${style.option} ${isActive ? style.optionActive : ""}`}
                  >
                    <span className={style.optionName}>
                      {clinic.clinicName}
                    </span>
                    {isActive && (
                      <span className={style.optionBadge}>Aktív</span>
                    )}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
