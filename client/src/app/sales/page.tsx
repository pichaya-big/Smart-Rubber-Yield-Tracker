"use client";

import { DateField } from "@/components/date-field";

import { useState } from "react";
import { Gavel, Trash2, UserRound } from "lucide-react";
import { Badge, Button, Card, Req, SectionHeader } from "@/components/ui";
import { addSale, removeItem, togglePaid, useData, useReady, type SaleChannel } from "@/lib/store";
import { CHANNEL_LABEL, baht, kg, saleGross, saleNet, thaiDate, todayIso, unsoldKg } from "@/lib/calc";

const GRADES = ["RSS1", "RSS3", "RSS4", "ยางก้อนถ้วย", "น้ำยางข้น", "อื่นๆ"];

export default function SalesPage() {
  const ready = useReady();
  const data = useData();
  const [channel, setChannel] = useState<SaleChannel>("middleman");
  const [dateOverride, setDate] = useState<string | null>(null);
  const [buyer, setBuyer] = useState("");
  const [lot, setLot] = useState("");
  const [grade, setGrade] = useState("RSS3");
  const [dry, setDry] = useState("");
  const [price, setPrice] = useState("");
  const [fees, setFees] = useState("");
  const [saved, setSaved] = useState(false);

  if (!ready) return null;

  // Read the clock only in the browser; static rendering must not touch Date.
  const date = dateOverride ?? todayIso();
  const unsold = unsoldKg(data);
  const dryNum = Number(dry) || 0;
  const priceNum = Number(price) || 0;
  const feesNum = Number(fees) || 0;
  const gross = dryNum * priceNum;
  const net = gross - feesNum;
  const canSave = dryNum > 0 && priceNum > 0 && buyer.trim() !== "";

  const reset = () => {
    setBuyer("");
    setLot("");
    setDry("");
    setPrice("");
    setFees("");
  };

  const save = () => {
    if (!canSave) return;
    addSale({
      date,
      channel,
      buyer: buyer.trim(),
      lot: channel === "auction" && lot.trim() ? lot.trim() : undefined,
      grade: channel === "auction" ? grade : undefined,
      dryKg: dryNum,
      pricePerKg: priceNum,
      fees: feesNum,
      paid: false,
    });
    reset();
    setSaved(true);
  };

  const isAuction = channel === "auction";

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">บันทึกการขายยาง</h1>
        <p className="mt-1 text-sm text-muted">
          ยังไม่ได้ขายอยู่ <span className="font-mono font-semibold text-ink tabular-nums">{kg(unsold)}</span> กก. แห้ง
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        {/* Channel toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-canvas p-1">
          {(["middleman", "auction"] as const).map((c) => {
            const active = channel === c;
            const Icon = c === "auction" ? Gavel : UserRound;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSaved(false);
                  setChannel(c);
                }}
                className={`flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                  active ? "bg-primary text-primary-ink" : "text-muted hover:text-ink"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {CHANNEL_LABEL[c]}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">วันที่ขาย<Req /></span>
            <DateField value={date} onChange={setDate} label="วันที่ขาย" />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">{isAuction ? "ชื่อลานประมูล" : "ชื่อพ่อค้า"}<Req /></span>
            <input
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              placeholder={isAuction ? "เช่น ลานประมูลยางหาดใหญ่" : "เช่น ลุงเปิ้ล"}
              className="h-12 rounded-md border border-line bg-canvas px-3 outline-none placeholder:text-muted focus:border-primary md:h-10"
            />
          </label>

          {isAuction && (
            <>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-muted">เลขล็อต</span>
                <input
                  value={lot}
                  onChange={(e) => setLot(e.target.value)}
                  placeholder="เช่น LOT-1142"
                  className="h-12 rounded-md border border-line bg-canvas px-3 outline-none placeholder:text-muted focus:border-primary md:h-10"
                />
              </label>
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-muted">เกรด</span>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`h-10 rounded-md border px-3 text-xs font-semibold transition ${
                        grade === g ? "border-primary bg-primary/10 text-primary" : "border-line bg-canvas hover:border-primary/40"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-muted">น้ำหนักแห้งที่ขาย (กก.)<Req /></span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              value={dry}
              onChange={(e) => setDry(e.target.value)}
              placeholder="0.0"
              className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
            />
            {unsold > 0 && (
              <button
                type="button"
                onClick={() => setDry(String(unsold))}
                className="self-start text-xs font-semibold text-primary hover:underline"
              >
                ใช้ยอดที่ยังไม่ได้ขาย ({kg(unsold)} กก.)
              </button>
            )}
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">ราคาต่อกก. แห้ง (฿)<Req /></span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="text-muted">
              {isAuction ? "ค่าธรรมเนียมลานและค่าขนส่ง (฿)" : "ค่าหัก ค่าขนส่ง หรือค่าอื่นๆ (฿)"}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              placeholder="0.00"
              className="h-12 rounded-md border border-line bg-canvas px-3 font-mono tabular-nums outline-none focus:border-primary md:h-10"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg bg-canvas p-4 text-center">
          <Figure label="ยอดขายก่อนหัก" value={`฿${baht(gross)}`} />
          <Figure label="ค่าใช้จ่ายที่หัก" value={`฿${baht(feesNum)}`} />
          <Figure label="รับเงินสุทธิ" value={`฿${baht(net)}`} tone="text-primary" />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {saved && <span className="text-sm text-primary sm:mr-auto">บันทึกการขายแล้ว รอรับเงิน</span>}
          <Button onClick={save} disabled={!canSave} className="w-full sm:w-auto">
            บันทึกการขาย
          </Button>
        </div>
      </Card>

      <Card>
        <SectionHeader title="ประวัติการขาย" subtitle="กดปุ่มเมื่อได้รับเงินแล้ว" />
        {data.sales.length === 0 ? (
          <p className="text-sm text-muted">ยังไม่มีการขาย</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.sales.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{s.buyer}</p>
                    <Badge tone={s.channel === "auction" ? "cyan" : "neutral"}>{CHANNEL_LABEL[s.channel]}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {thaiDate(s.date)} • {kg(s.dryKg)} กก. แห้ง × ฿{s.pricePerKg.toFixed(2)}
                    {s.lot ? ` • ล็อต ${s.lot}` : ""}
                    {s.grade ? ` • เกรด ${s.grade}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    ยอดก่อนหัก ฿{baht(saleGross(s))} • หัก ฿{baht(s.fees)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="font-mono text-base font-semibold tabular-nums">฿{baht(saleNet(s))}</p>
                  <button
                    type="button"
                    onClick={() => togglePaid(s.id)}
                    className={`h-9 rounded-full border px-3 text-xs font-semibold transition ${
                      s.paid ? "border-primary bg-primary/10 text-primary" : "border-gold/40 bg-gold/10 text-gold"
                    }`}
                  >
                    {s.paid ? "รับเงินแล้ว" : "รอรับเงิน"}
                  </button>
                  <button
                    type="button"
                    aria-label="ลบรายการนี้"
                    onClick={() => removeItem("sales", s.id)}
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
