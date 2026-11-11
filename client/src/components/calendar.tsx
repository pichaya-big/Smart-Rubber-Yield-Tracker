"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Card, SectionHeader } from "./ui";
import { addReminder, removeItem, toggleReminder, type Data } from "@/lib/store";
import {
  CATEGORY_LABEL,
  CHANNEL_LABEL,
  RUBBER_LABEL,
  SOURCE_LABEL,
  baht,
  kg,
  monthLabel,
  saleNet,
  thaiDate,
  todayIso,
} from "@/lib/calc";

type Kind = "harvest" | "sale" | "job" | "expense" | "price" | "reminder";

type CalEvent = { kind: Kind; text: string; amount?: string; id?: string; done?: boolean };

const KIND_INFO: Record<Kind, { label: string; dot: string }> = {
  harvest: { label: "น้ำยาง", dot: "bg-primary" },
  sale: { label: "ขายยาง", dot: "bg-gold" },
  job: { label: "รับจ้างกรีด", dot: "bg-cyan" },
  expense: { label: "รายจ่าย", dot: "bg-crimson" },
  price: { label: "ราคายาง", dot: "bg-muted" },
  reminder: { label: "นัดหมาย", dot: "bg-ink" },
};

const KIND_ORDER: Kind[] = ["reminder", "harvest", "sale", "job", "expense", "price"];
const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const QUICK_TITLES = ["ขายยางที่ลาน", "ขายให้พ่อค้า", "กรีดยาง", "ใส่ปุ๋ย", "จ่ายค่าแรง"];

const pad = (n: number) => String(n).padStart(2, "0");

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/** Group every recorded item and reminder by its date (YYYY-MM-DD). */
function buildEvents(data: Data): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  const add = (date: string, ev: CalEvent) => {
    map.set(date, [...(map.get(date) ?? []), ev]);
  };

  data.reminders.forEach((r) =>
    add(r.date, { kind: "reminder", text: r.title, id: r.id, done: r.done }),
  );
  data.harvests.forEach((h) =>
    add(h.date, {
      kind: "harvest",
      text: `${RUBBER_LABEL[h.rubber]} ${kg(h.grossKg)} กก. (แห้ง ${kg(h.dryKg)} กก.)`,
    }),
  );
  data.sales.forEach((s) =>
    add(s.date, {
      kind: "sale",
      text: `ขายให้${CHANNEL_LABEL[s.channel]} ${s.buyer} ${kg(s.dryKg)} กก. แห้ง`,
      amount: `฿${baht(saleNet(s))}`,
    }),
  );
  data.jobs.forEach((j) =>
    add(j.date, { kind: "job", text: `รับจ้างกรีด ${j.farm}`, amount: `฿${baht(j.earned)}` }),
  );
  data.expenses.forEach((e) =>
    add(e.date, {
      kind: "expense",
      text: `${CATEGORY_LABEL[e.category]}${e.note ? ` • ${e.note}` : ""}`,
      amount: `฿${baht(e.amount)}`,
    }),
  );
  data.prices.forEach((p) =>
    add(p.date, {
      kind: "price",
      text: `ราคา${RUBBER_LABEL[p.rubber]} จาก${SOURCE_LABEL[p.source]}`,
      amount: `฿${baht(p.pricePerKg)}/กก.`,
    }),
  );
  return map;
}

export function Calendar({ data }: { data: Data }) {
  const today = todayIso();
  const [cursor, setCursor] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState<string>(today);
  const [title, setTitle] = useState("");

  const events = buildEvents(data);
  const [y, m] = cursor.split("-").map(Number);
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthCount = [...events.entries()]
    .filter(([date]) => date.startsWith(cursor))
    .reduce((n, [, list]) => n + list.length, 0);

  const selectedEvents = events.get(selected) ?? [];
  const orderedSelected = KIND_ORDER.flatMap((k) => selectedEvents.filter((e) => e.kind === k));

  const save = (text: string) => {
    const t = text.trim();
    if (!t) return;
    addReminder({ date: selected, title: t });
    setTitle("");
  };

  return (
    <Card>
      <SectionHeader
        title="ปฏิทินการทำงาน"
        subtitle={`เดือนนี้มี ${monthCount} รายการ • กดวันที่เพื่อดูหรือจดนัดหมาย`}
        accent="primary"
        action={
          <button
            type="button"
            onClick={() => {
              setCursor(today.slice(0, 7));
              setSelected(today);
            }}
            className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-primary"
          >
            วันนี้
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="เดือนก่อนหน้า"
              onClick={() => setCursor((c) => shiftMonth(c, -1))}
              className="flex size-10 items-center justify-center rounded-md border border-line transition hover:border-primary"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <p className="text-base font-semibold">{monthLabel(cursor)}</p>
            <button
              type="button"
              aria-label="เดือนถัดไป"
              onClick={() => setCursor((c) => shiftMonth(c, 1))}
              className="flex size-10 items-center justify-center rounded-md border border-line transition hover:border-primary"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
            {WEEKDAYS.map((w, i) => (
              <div key={w} className={`py-2 ${i === 0 ? "text-crimson" : ""}`}>
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} aria-hidden />;
              const iso = `${cursor}-${pad(day)}`;
              const list = events.get(iso) ?? [];
              const kinds = KIND_ORDER.filter((k) => list.some((e) => e.kind === k));
              const isToday = iso === today;
              const isSelected = iso === selected;
              const isSunday = idx % 7 === 0;
              return (
                <button
                  key={iso}
                  type="button"
                  aria-label={`${thaiDate(iso)}${list.length ? `, ${list.length} รายการ` : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelected(iso)}
                  className={`flex min-h-14 flex-col items-center justify-start gap-1 rounded-md border py-2 text-sm transition md:min-h-16 ${
                    isSelected
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-transparent hover:border-line hover:bg-canvas"
                  } ${isToday ? "ring-2 ring-primary/40" : ""} ${isSunday ? "text-crimson" : ""}`}
                >
                  <span className="font-mono tabular-nums">{day}</span>
                  <span className="flex items-center gap-0.5" aria-hidden>
                    {kinds.map((k) => (
                      <span key={k} className={`size-1.5 rounded-full ${KIND_INFO[k].dot}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
            {KIND_ORDER.map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${KIND_INFO[k].dot}`} aria-hidden />
                {KIND_INFO[k].label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 rounded-lg bg-canvas p-4 lg:col-span-2">
          <p className="text-sm font-semibold">{thaiDate(selected)}</p>

          {/* Add a reminder for the selected day */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TITLES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => save(q)}
                  className="rounded-full border border-line bg-panel px-2.5 py-1 text-xs transition hover:border-primary"
                >
                  + {q}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                save(title);
              }}
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="จดนัดหมาย เช่น ขายยางรอบบ่าย"
                className="h-10 min-w-0 flex-1 rounded-md border border-line bg-panel px-3 text-sm outline-none placeholder:text-muted focus:border-primary"
              />
              <button
                type="submit"
                disabled={!title.trim()}
                className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink transition disabled:opacity-50"
              >
                เพิ่ม
              </button>
            </form>
          </div>

          {orderedSelected.length === 0 ? (
            <p className="text-sm text-muted">ไม่มีรายการในวันนี้</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {orderedSelected.map((e, i) => (
                <li key={`${e.kind}-${e.id ?? i}`} className="flex items-start gap-3">
                  {e.kind === "reminder" && e.id ? (
                    <button
                      type="button"
                      aria-label={e.done ? "ยังไม่เสร็จ" : "ทำแล้ว"}
                      aria-pressed={!!e.done}
                      onClick={() => toggleReminder(e.id!)}
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
                        e.done ? "border-primary bg-primary text-primary-ink" : "border-line bg-panel"
                      }`}
                    >
                      {e.done && <Check className="size-3.5" aria-hidden />}
                    </button>
                  ) : (
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${KIND_INFO[e.kind].dot}`} aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">{KIND_INFO[e.kind].label}</p>
                    <p className={`text-sm ${e.done ? "text-muted line-through" : ""}`}>{e.text}</p>
                  </div>
                  {e.amount && <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">{e.amount}</p>}
                  {e.kind === "reminder" && e.id && (
                    <button
                      type="button"
                      aria-label="ลบนัดหมายนี้"
                      onClick={() => removeItem("reminders", e.id!)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-crimson/10 hover:text-crimson"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Upcoming reminders for the next 7 days that are not done yet. */
export function UpcomingReminders({ data }: { data: Data }) {
  const today = todayIso();
  const until = addDays(today, 7);
  const upcoming = data.reminders
    .filter((r) => !r.done && r.date >= today && r.date <= until)
    .sort((a, b) => a.date.localeCompare(b.date));

  const label = (date: string) => {
    if (date === today) return "วันนี้";
    if (date === addDays(today, 1)) return "พรุ่งนี้";
    return thaiDate(date);
  };

  return (
    <Card>
      <SectionHeader title="ใกล้ถึงกำหนด" subtitle="นัดหมาย 7 วันข้างหน้า" accent="primary" />
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted">ไม่มีนัดหมายใน 7 วันนี้ จดนัดได้ที่ปฏิทิน</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {upcoming.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3">
              <p className="text-sm">{r.title}</p>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  r.date === today ? "bg-primary/15 text-primary" : "bg-raised text-muted"
                }`}
              >
                {label(r.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
