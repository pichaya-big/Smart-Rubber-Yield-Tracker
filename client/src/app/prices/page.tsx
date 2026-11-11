"use client";

import { DateField } from "@/components/date-field";

import { useState } from "react";
import { ArrowDown, ArrowUp, Minus, Trash2 } from "lucide-react";
import { Button, Card, Req, SectionHeader } from "@/components/ui";
import { addPrice, removeItem, useData, useReady, type PriceSource, type RubberType } from "@/lib/store";
import { RUBBER_LABEL, SOURCE_LABEL, baht, priceTrend, thaiDate, todayIso } from "@/lib/calc";

const RUBBERS: RubberType[] = ["latex", "cuplump", "sheet"];
const SOURCES: PriceSource[] = ["auction", "middleman", "factory", "other"];

export default function PricesPage() {
  const ready = useReady();
  const data = useData();
  const [dateOverride, setDate] = useState<string | null>(null);
  const [rubber, setRubber] = useState<RubberType>("latex");
  const [price, setPrice] = useState("");
  const [source, setSource] = useState<PriceSource>("auction");
  const [saved, setSaved] = useState(false);

  if (!ready) return null;

  // Read the clock only in the browser; static rendering must not touch Date.
  const date = dateOverride ?? todayIso();
  const priceNum = Number(price) || 0;
  const canSave = priceNum > 0;

  const save = () => {
    if (!canSave) return;
    addPrice({ date, rubber, pricePerKg: priceNum, source });
    setPrice("");
    setSaved(true);
  };

  const sorted = [...data.prices].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">ราคายาง</h1>
        <p className="mt-1 text-sm text-muted">
          บันทึกราคาที่ลานประมูลหรือพ่อค้าให้ในแต่ละงวด ระบบจะเทียบให้ว่าราคาขึ้นหรือลง
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Card>
          <SectionHeader title="บันทึกราคาใหม่" accent="gold" />
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">วันที่<Req /></span>
              <DateField value={date} onChange={setDate} label="วันที่" />
            </label>

            <div className="flex flex-col gap-2 text-sm">
              <span className="text-muted">ชนิดยาง</span>
              <div className="grid grid-cols-3 gap-2">
                {RUBBERS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={rubber === r}
                    onClick={() => {
                      setSaved(false);
                      setRubber(r);
                    }}
                    className={`h-11 rounded-md border px-2 text-xs font-semibold transition active:scale-[0.98] ${
                      rubber === r ? "border-primary bg-primary text-primary-ink" : "border-line bg-canvas hover:border-primary/40"
                    }`}
                  >
                    {RUBBER_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted">ราคาที่ได้ (฿ ต่อกก.)<Req /></span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => {
                  setSaved(false);
                  setPrice(e.target.value);
                }}
                placeholder="0.00"
                className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
              />
            </label>

            <div className="flex flex-col gap-2 text-sm">
              <span className="text-muted">ราคานี้มาจากไหน</span>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={source === s}
                    onClick={() => setSource(s)}
                    className={`h-10 rounded-md border px-3 text-xs font-semibold transition ${
                      source === s ? "border-primary bg-primary/10 text-primary" : "border-line bg-canvas hover:border-primary/40"
                    }`}
                  >
                    {SOURCE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {saved && <span className="text-sm text-primary">บันทึกราคาแล้ว</span>}
              <Button onClick={save} disabled={!canSave} className="w-full">
                บันทึกราคา
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 xl:col-span-2 md:grid-cols-3">
          {RUBBERS.map((r) => (
            <TrendCard key={r} rubber={r} trend={priceTrend(data.prices, r)} />
          ))}
        </div>
      </div>

      <Card>
        <SectionHeader title="ประวัติราคาทั้งหมด" subtitle="ใหม่สุดอยู่ด้านบน" />
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">ยังไม่มีการบันทึกราคา</p>
        ) : (
          <ul className="divide-y divide-line">
            {sorted.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{RUBBER_LABEL[p.rubber]}</p>
                  <p className="text-xs text-muted">
                    {thaiDate(p.date)} • {SOURCE_LABEL[p.source]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="font-mono text-base font-semibold tabular-nums">
                    ฿{baht(p.pricePerKg)}
                    <span className="text-xs font-normal text-muted">/กก.</span>
                  </p>
                  <button
                    type="button"
                    aria-label="ลบรายการนี้"
                    onClick={() => removeItem("prices", p.id)}
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
  );
}

function TrendCard({
  rubber,
  trend,
}: {
  rubber: RubberType;
  trend: ReturnType<typeof priceTrend>;
}) {
  if (!trend) {
    return (
      <Card>
        <p className="text-sm font-semibold">{RUBBER_LABEL[rubber]}</p>
        <p className="mt-2 text-xs text-muted">ยังไม่มีราคา</p>
      </Card>
    );
  }

  const up = trend.diff > 0;
  const down = trend.diff < 0;
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus;
  const tone = up ? "text-primary" : down ? "text-crimson" : "text-muted";
  const recent = trend.history.slice(-8);
  const values = recent.map((p) => p.pricePerKg);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <Card>
      <p className="text-sm font-semibold">{RUBBER_LABEL[rubber]}</p>
      <p className="mt-1 text-xs text-muted">ล่าสุด {thaiDate(trend.last.date)}</p>
      <p className="mt-3 font-mono text-2xl font-semibold tabular-nums">
        ฿{baht(trend.last.pricePerKg)}
        <span className="text-xs font-normal text-muted">/กก.</span>
      </p>
      <p className={`mt-1 flex items-center gap-1 text-sm font-semibold ${tone}`}>
        <Icon className="size-4" aria-hidden />
        {trend.prev
          ? `${up ? "ขึ้น" : down ? "ลง" : "เท่าเดิม"} ${baht(Math.abs(trend.diff))} บาท (${Math.abs(trend.pct).toFixed(1)}%)`
          : "ยังไม่มีราคาก่อนหน้าให้เทียบ"}
      </p>

      <div className="mt-4 flex h-16 items-end gap-1" role="img" aria-label="แนวโน้มราคาย้อนหลัง">
        {recent.map((p) => {
          const height = max === min ? 60 : 20 + ((p.pricePerKg - min) / (max - min)) * 80;
          return (
            <div
              key={p.id}
              title={`${thaiDate(p.date)} ฿${baht(p.pricePerKg)}`}
              className="flex-1 rounded-t-sm bg-primary/60"
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    </Card>
  );
}
