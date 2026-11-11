"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, thaiDate, todayIso } from "@/lib/calc";

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const pad = (n: number) => String(n).padStart(2, "0");

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Thai date picker: shows the date in Thai and opens a Thai month grid. */
export function DateField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(value.slice(0, 7));
  const rootRef = useRef<HTMLDivElement>(null);

  // Close when clicking anywhere outside the picker.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const [y, m] = cursor.split("-").map(Number);
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = todayIso();

  const toggle = () => {
    setCursor(value.slice(0, 7));
    setOpen((o) => !o);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label ?? "เลือกวันที่"}
        aria-expanded={open}
        onClick={toggle}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-md border border-line bg-canvas px-3 text-left text-sm transition hover:border-primary/40 focus:border-primary focus:outline-none md:h-10"
      >
        <span>{value ? thaiDate(value) : "เลือกวันที่"}</span>
        <CalendarDays className="size-4 shrink-0 text-muted" aria-hidden />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-30 mt-2 w-72 rounded-lg border border-line bg-panel p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="เดือนก่อนหน้า"
              onClick={() => setCursor((c) => shiftMonth(c, -1))}
              className="flex size-9 items-center justify-center rounded-md border border-line hover:border-primary"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <p className="text-sm font-semibold">{monthLabel(cursor)}</p>
            <button
              type="button"
              aria-label="เดือนถัดไป"
              onClick={() => setCursor((c) => shiftMonth(c, 1))}
              className="flex size-9 items-center justify-center rounded-md border border-line hover:border-primary"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted">
            {WEEKDAYS.map((w, i) => (
              <div key={w} className={`py-1 ${i === 0 ? "text-crimson" : ""}`}>
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} aria-hidden />;
              const iso = `${cursor}-${pad(day)}`;
              const selected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  aria-label={thaiDate(iso)}
                  aria-pressed={selected}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`h-9 rounded-md text-sm font-mono tabular-nums transition ${
                    selected
                      ? "bg-primary font-semibold text-primary-ink"
                      : "hover:bg-primary/10"
                  } ${isToday && !selected ? "ring-1 ring-primary" : ""} ${idx % 7 === 0 && !selected ? "text-crimson" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between">
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              วันนี้
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:underline">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
