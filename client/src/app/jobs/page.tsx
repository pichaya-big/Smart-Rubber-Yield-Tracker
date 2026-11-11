"use client";

import { DateField } from "@/components/date-field";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge, Button, Card, Req, SectionHeader } from "@/components/ui";
import { addJob, jobEarned, removeItem, toggleJobReceived, useData, useReady, type PayType } from "@/lib/store";
import { PAY_LABEL, baht, dryKgOf, kg, sum, thaiDate, todayIso } from "@/lib/calc";

const PAY_OPTIONS: { id: PayType; hint: string; unit: string }[] = [
  { id: "share", hint: "ได้ % จากยอดขายยางของสวนนั้น", unit: "%" },
  { id: "perKg", hint: "ได้ ฿ ต่อกก. แห้งที่กรีด", unit: "฿/กก." },
  { id: "daily", hint: "ได้เป็นค่าแรงรายวัน", unit: "฿/วัน" },
];

export default function JobsPage() {
  const ready = useReady();
  const data = useData();
  const [dateOverride, setDate] = useState<string | null>(null);
  const [farm, setFarm] = useState("");
  const [plot, setPlot] = useState("");
  const [gross, setGross] = useState("");
  const [drc, setDrc] = useState("38");
  const [farmPrice, setFarmPrice] = useState("");
  const [payType, setPayType] = useState<PayType>("share");
  const [payValue, setPayValue] = useState("40");
  const [saved, setSaved] = useState(false);

  if (!ready) return null;

  // Read the clock only in the browser; static rendering must not touch Date.
  const date = dateOverride ?? todayIso();
  const grossNum = Number(gross) || 0;
  const drcNum = Number(drc) || 0;
  const priceNum = Number(farmPrice) || 0;
  const valueNum = Number(payValue) || 0;
  const dry = dryKgOf(grossNum, drcNum);
  const earned = jobEarned(dry, priceNum, payType, valueNum);
  const needsPrice = payType === "share";
  const canSave = farm.trim() !== "" && grossNum > 0 && drcNum > 0 && drcNum <= 100 && valueNum > 0 && (!needsPrice || priceNum > 0);

  const option = PAY_OPTIONS.find((o) => o.id === payType) ?? PAY_OPTIONS[0];
  const month = date.slice(0, 7);
  const monthWages = sum(data.jobs.filter((j) => j.date.slice(0, 7) === month).map((j) => j.earned));
  const unpaid = sum(data.jobs.filter((j) => !j.received).map((j) => j.earned));

  const save = () => {
    if (!canSave) return;
    addJob({
      date,
      farm: farm.trim(),
      plot: plot.trim() || undefined,
      grossKg: grossNum,
      drcPct: drcNum,
      farmPricePerKg: needsPrice ? priceNum : 0,
      payType,
      payValue: valueNum,
      note: undefined,
    });
    setGross("");
    setSaved(true);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">รับจ้างกรีด</h1>
        <p className="mt-1 text-sm text-muted">
          งานกรีดให้สวนอื่น เดือนนี้ได้ <span className="font-mono font-semibold text-ink tabular-nums">฿{baht(monthWages)}</span>{" "}
          • ยังไม่ได้รับ <span className="font-mono font-semibold text-gold tabular-nums">฿{baht(unpaid)}</span>
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">วันที่กรีด<Req /></span>
              <DateField value={date} onChange={setDate} label="วันที่กรีด" />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">ชื่อเจ้าของสวน<Req /></span>
              <input
                value={farm}
                onChange={(e) => {
                  setSaved(false);
                  setFarm(e.target.value);
                }}
                placeholder="เช่น ลุงสำราญ"
                className="h-12 rounded-md border border-line bg-canvas px-3 outline-none placeholder:text-muted focus:border-primary md:h-10"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">แปลง (ไม่บังคับ)</span>
              <input
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
                placeholder="เช่น แปลง 3"
                className="h-12 rounded-md border border-line bg-canvas px-3 outline-none placeholder:text-muted focus:border-primary md:h-10"
              />
            </label>

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

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">เนื้อยางแห้ง (%)<Req /></span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min={0}
                max={100}
                value={drc}
                onChange={(e) => setDrc(e.target.value)}
                className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
              />
            </label>

            {needsPrice && (
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-muted">ราคาขายยางของสวนนี้ (฿/กก. แห้ง)<Req /></span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0}
                  value={farmPrice}
                  onChange={(e) => setFarmPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
                />
              </label>
            )}

            <div className="flex flex-col gap-2 text-sm md:col-span-2">
              <span className="text-muted">วิธีคิดค่าจ้าง</span>
              <div className="grid gap-2 sm:grid-cols-3">
                {PAY_OPTIONS.map(({ id, hint }) => {
                  const active = payType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setPayType(id);
                        setPayValue(id === "share" ? "40" : id === "perKg" ? "6" : "300");
                      }}
                      className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition active:scale-[0.98] ${
                        active ? "border-primary bg-primary text-primary-ink" : "border-line bg-canvas hover:border-primary/40"
                      }`}
                    >
                      <span className="text-sm font-semibold">{PAY_LABEL[id]}</span>
                      <span className={`text-xs ${active ? "text-primary-ink/80" : "text-muted"}`}>{hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">
                ค่า{option.unit === "%" ? "ส่วนแบ่ง" : "จ้าง"} ({option.unit})<Req />
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={payValue}
                onChange={(e) => setPayValue(e.target.value)}
                className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
              />
            </label>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg bg-canvas p-4 text-center">
            <Figure label="น้ำหนักแห้ง" value={`${kg(dry)} กก.`} />
            <Figure label="ค่าจ้างที่จะได้" value={`฿${baht(earned)}`} tone="text-primary" />
            <Figure label="วันที่" value={thaiDate(date)} />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {saved && <span className="text-sm text-primary sm:mr-auto">บันทึกงานรับจ้างแล้ว รอรับเงิน</span>}
            <Button onClick={save} disabled={!canSave} className="w-full sm:w-auto">
              บันทึกงานรับจ้าง
            </Button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="งานรับจ้างล่าสุด" subtitle="กดเมื่อได้รับค่าจ้างแล้ว" accent="gold" />
          {data.jobs.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีงานรับจ้าง</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.jobs.map((j) => (
                <li key={j.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {j.farm}
                        {j.plot ? ` • ${j.plot}` : ""}
                      </p>
                      <p className="text-xs text-muted">
                        {thaiDate(j.date)} • {kg(j.dryKg)} กก. แห้ง • {PAY_LABEL[j.payType]} {j.payValue}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-base font-semibold tabular-nums">฿{baht(j.earned)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleJobReceived(j.id)}
                      aria-pressed={j.received}
                      className="focus:outline-none"
                    >
                      <Badge tone={j.received ? "primary" : "gold"} dot>
                        {j.received ? "รับค่าจ้างแล้ว" : "รอรับค่าจ้าง"}
                      </Badge>
                    </button>
                    <button
                      type="button"
                      aria-label="ลบรายการนี้"
                      onClick={() => removeItem("jobs", j.id)}
                      className="flex size-9 items-center justify-center rounded-md text-muted transition hover:bg-crimson/10 hover:text-crimson"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Figure({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-mono text-base font-semibold tabular-nums md:text-lg ${tone}`}>{value}</p>
    </div>
  );
}
