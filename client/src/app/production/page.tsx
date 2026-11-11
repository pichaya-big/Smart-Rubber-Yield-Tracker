"use client";

import { DateField } from "@/components/date-field";

import { useState } from "react";
import { Droplet, Layers, Triangle, Trash2 } from "lucide-react";
import { Button, Card, Req, SectionHeader } from "@/components/ui";
import { addHarvest, removeItem, useData, useReady, type RubberType } from "@/lib/store";
import { RUBBER_LABEL, dryKgOf, kg, thaiDate, todayIso } from "@/lib/calc";

const RUBBER_OPTIONS: { id: RubberType; icon: typeof Droplet; hint: string }[] = [
  { id: "latex", icon: Droplet, hint: "เนื้อแห้ง 35-42%" },
  { id: "cuplump", icon: Layers, hint: "เนื้อแห้ง 50-65%" },
  { id: "sheet", icon: Triangle, hint: "เนื้อแห้ง 80-95%" },
];

const DRC_PRESETS = [35, 38, 40, 50, 60];

export default function ProductionPage() {
  const ready = useReady();
  const data = useData();
  const [dateOverride, setDate] = useState<string | null>(null);
  const [rubber, setRubber] = useState<RubberType>("latex");
  const [gross, setGross] = useState("");
  const [drc, setDrc] = useState("38");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  if (!ready) return null;

  // Read the clock only in the browser; static rendering must not touch Date.
  const date = dateOverride ?? todayIso();
  const grossNum = Number(gross) || 0;
  const drcNum = Number(drc) || 0;
  const canSave = grossNum > 0 && drcNum > 0 && drcNum <= 100;

  const save = () => {
    if (!canSave) return;
    addHarvest({ date, rubber, grossKg: grossNum, drcPct: drcNum, note: note.trim() || undefined });
    setGross("");
    setNote("");
    setSaved(true);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">บันทึกน้ำยาง</h1>
        <p className="mt-1 text-sm text-muted">ชั่งน้ำหนักแล้วกรอกเปอร์เซ็นต์เนื้อยางแห้ง ระบบจะคำนวณให้เอง</p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">วันที่<Req /></span>
            <DateField value={date} onChange={setDate} label="วันที่" />
          </label>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-muted">ชนิดยาง</span>
            <div className="grid grid-cols-3 gap-2">
              {RUBBER_OPTIONS.map(({ id, icon: Icon, hint }) => {
                const active = rubber === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setRubber(id)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition active:scale-[0.98] ${
                      active ? "border-primary bg-primary text-primary-ink" : "border-line bg-canvas hover:border-primary/40"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden />
                    <span className="text-xs font-semibold">{RUBBER_LABEL[id]}</span>
                    <span className={`text-[11px] ${active ? "text-primary-ink/80" : "text-muted"}`}>{hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">น้ำหนักที่ชั่งได้ (กก.)<Req /></span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              value={gross}
              onChange={(e) => {
                setSaved(false);
                setGross(e.target.value);
              }}
              placeholder="0.0"
              className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
            />
          </label>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-muted">เนื้อยางแห้ง (%)<Req /></span>
            <span className="text-xs text-muted">
              ดูจากใบที่ลานประมูลหรือพ่อค้าให้ไว้ ถ้าไม่มีให้เลือกค่าใกล้เคียงด้านล่าง
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              max={100}
              value={drc}
              onChange={(e) => {
                setSaved(false);
                setDrc(e.target.value);
              }}
              className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
            />
            <div className="flex flex-wrap gap-2">
              {DRC_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSaved(false);
                    setDrc(String(p));
                  }}
                  className={`h-9 rounded-md border px-3 text-xs font-semibold transition ${
                    Number(drc) === p ? "border-primary bg-primary/10 text-primary" : "border-line bg-canvas hover:border-primary/40"
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="text-muted">หมายเหตุ (ไม่บังคับ)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ฝนตกตอนบ่าย มีน้ำยางตกค้างถัง"
              className="h-12 rounded-md border border-line bg-canvas px-3 outline-none placeholder:text-muted focus:border-primary md:h-10"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            {canSave ? (
              <>
                เนื้อยางแห้งประมาณ <span className="font-mono font-semibold tabular-nums">{kg(dryKgOf(grossNum, drcNum))}</span> กก.
              </>
            ) : (
              <span className="text-muted">กรอกน้ำหนักและเนื้อยางแห้งเพื่อดูยอดที่ได้</span>
            )}
          </p>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-primary">บันทึกแล้ว</span>}
            <Button onClick={save} disabled={!canSave} className="w-full sm:w-auto">
              บันทึกน้ำยาง
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="รายการที่บันทึกล่าสุด" subtitle="ลบได้หากกรอกผิด" />
        {data.harvests.length === 0 ? (
          <p className="text-sm text-muted">ยังไม่มีรายการ</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.harvests.slice(0, 10).map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {RUBBER_LABEL[h.rubber]} • {kg(h.grossKg)} กก.
                  </p>
                  <p className="text-xs text-muted">
                    {thaiDate(h.date)} • เนื้อแห้ง {h.drcPct}% • แห้ง {kg(h.dryKg)} กก.
                    {h.note ? ` • ${h.note}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="ลบรายการนี้"
                  onClick={() => removeItem("harvests", h.id)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-crimson/10 hover:text-crimson"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      </div>
    </div>
  );
}
