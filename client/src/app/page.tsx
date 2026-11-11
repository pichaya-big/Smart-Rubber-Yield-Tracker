"use client";

import Link from "next/link";
import { CloudSun, Droplet, HandCoins, Receipt, Store, Thermometer } from "lucide-react";
import { Calendar, UpcomingReminders } from "@/components/calendar";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { forecast, weather } from "@/lib/mock-data";
import { useData, useReady, type RubberType } from "@/lib/store";
import {
  RUBBER_LABEL,
  baht,
  channelStats,
  kg,
  monthlyRows,
  priceTrend,
  saleNet,
  sum,
  thaiDate,
  todayIso,
  unsoldKg,
} from "@/lib/calc";
import { owner } from "@/lib/mock-data";

const RUBBER_KEYS: RubberType[] = ["latex", "cuplump", "sheet"];

export default function HomePage() {
  const ready = useReady();
  const data = useData();
  if (!ready) return null;

  const thisMonth = todayIso().slice(0, 7);
  const month = monthlyRows(data).find((r) => r.month === thisMonth) ?? {
    produced: 0,
    soldKg: 0,
    net: 0,
    wages: 0,
    expenses: 0,
    profit: 0,
  };
  const unsold = unsoldKg(data);
  const pending = data.sales.filter((s) => !s.paid);
  const pendingTotal = sum(pending.map(saleNet));
  const mid = channelStats(data.sales, "middleman");
  const auc = channelStats(data.sales, "auction");
  const diff = auc.avg - mid.avg;
  const compareText =
    mid.count === 0 || auc.count === 0
      ? "ขายทั้งสองทางแล้วจะเห็นการเปรียบเทียบที่นี่"
      : diff > 0
        ? `ลานประมูลให้ราคาเฉลี่ยดีกว่าพ่อค้า ${baht(diff)} บาท/กก. หลังหักค่าใช้จ่าย`
        : diff < 0
          ? `พ่อค้าให้ราคาเฉลี่ยดีกว่าลาน ${baht(-diff)} บาท/กก. หลังหักค่าใช้จ่าย`
          : "ราคาเฉลี่ยของทั้งสองทางใกล้เคียงกัน";

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Greeting */}
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <CloudSun className="size-4 text-gold" aria-hidden />
            {weather.place} {weather.tempC}°C • ความชื้น {weather.humidity}%
          </p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">สวัสดีคุณ{owner.name.split(" ")[0]}</h1>
        </div>
        <Badge tone="primary" dot>
          ข้อมูลบันทึกในเครื่องนี้แล้ว
        </Badge>
      </section>

      {/* Main actions */}
      <nav className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="ทางลัด">
        <Link
          href="/production"
          className="flex flex-col items-start gap-3 rounded-lg bg-primary p-4 text-primary-ink shadow-sm transition hover:bg-primary-deep md:flex-row md:items-center"
        >
          <Droplet className="size-6" aria-hidden />
          <span className="text-sm font-semibold">บันทึกน้ำยาง</span>
        </Link>
        <Link
          href="/sales"
          className="flex flex-col items-start gap-3 rounded-lg border border-line bg-panel p-4 shadow-sm transition hover:border-primary/40 md:flex-row md:items-center"
        >
          <Store className="size-6 text-primary" aria-hidden />
          <span className="text-sm font-semibold">บันทึกการขาย</span>
        </Link>
        <Link
          href="/expenses"
          className="flex flex-col items-start gap-3 rounded-lg border border-line bg-panel p-4 shadow-sm transition hover:border-primary/40 md:flex-row md:items-center"
        >
          <Receipt className="size-6 text-gold" aria-hidden />
          <span className="text-sm font-semibold">บันทึกรายจ่าย</span>
        </Link>
        <Link
          href="/jobs"
          className="flex flex-col items-start gap-3 rounded-lg border border-line bg-panel p-4 shadow-sm transition hover:border-primary/40 md:flex-row md:items-center"
        >
          <HandCoins className="size-6 text-primary" aria-hidden />
          <span className="text-sm font-semibold">บันทึกรับจ้างกรีด</span>
        </Link>
      </nav>

      {/* This month */}
      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-5">
        <Stat label="ผลิตได้เดือนนี้" value={kg(month.produced)} unit="กก. แห้ง" />
        <Stat label="ขายยางของสวน" value={`฿${baht(month.net)}`} />
        <Stat label="รับจ้างกรีด" value={`฿${baht(month.wages)}`} />
        <Stat label="รายจ่ายเดือนนี้" value={`฿${baht(month.expenses)}`} />
        <Stat label="กำไรเดือนนี้" value={`฿${baht(month.profit)}`} highlight={month.profit >= 0} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent sales */}
        <Card className="xl:col-span-2">
          <SectionHeader
            title="การขายล่าสุด"
            subtitle={`ยังไม่ได้ขาย ${kg(unsold)} กก. แห้ง • ค้างรับเงิน ฿${baht(pendingTotal)}`}
            action={
              <Link href="/sales" className="shrink-0 text-xs font-semibold text-primary hover:underline">
                ดูทั้งหมด
              </Link>
            }
          />
          {data.sales.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีการขาย กดบันทึกการขายเมื่อขายยางแล้ว</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.sales.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.buyer}</p>
                    <p className="text-xs text-muted">
                      {thaiDate(s.date)} • {s.channel === "auction" ? `ลานประมูล ${s.lot ?? ""}` : "พ่อค้าคนกลาง"} •{" "}
                      {kg(s.dryKg)} กก. แห้ง
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-base font-semibold tabular-nums">฿{baht(saleNet(s))}</p>
                    <p className="text-xs">
                      {s.paid ? <span className="text-primary">รับเงินแล้ว</span> : <span className="text-gold">รอรับเงิน</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <SectionHeader
              title="ราคายางล่าสุด"
              subtitle="ราคาที่คุณบันทึกไว้ เทียบกับงวดก่อน"
              accent="gold"
              action={
                <Link href="/prices" className="shrink-0 text-xs font-semibold text-primary hover:underline">
                  บันทึกราคา
                </Link>
              }
            />
            <ul className="flex flex-col gap-3">
              {RUBBER_KEYS.map((r) => {
                const t = priceTrend(data.prices, r);
                const up = !!t && t.diff > 0;
                const down = !!t && t.diff < 0;
                return (
                  <li key={r} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{RUBBER_LABEL[r]}</p>
                      {t ? (
                        <p className="text-xs text-muted">ล่าสุด {thaiDate(t.last.date)}</p>
                      ) : (
                        <p className="text-xs text-muted">ยังไม่มีราคา</p>
                      )}
                    </div>
                    {t ? (
                      <div className="shrink-0 text-right">
                        <p className="font-mono text-sm font-semibold tabular-nums">
                          ฿{baht(t.last.pricePerKg)}
                          <span className="text-xs font-normal text-muted">/กก.</span>
                        </p>
                        {t.prev && (
                          <p className={`text-xs font-semibold ${up ? "text-primary" : down ? "text-crimson" : "text-muted"}`}>
                            {up ? "▲ ขึ้น" : down ? "▼ ลง" : "เท่าเดิม"} {baht(Math.abs(t.diff))}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 rounded-md bg-primary/10 p-3 text-xs leading-relaxed text-ink">{compareText}</p>
          </Card>

          <UpcomingReminders data={data} />

          <Card>
            <SectionHeader title="พยากรณ์กรีด 3 วัน" subtitle="อิงจากฝนและความชื้น" accent="cyan" />
            <ul className="flex flex-col gap-3">
              {forecast.map((f) => (
                <li key={f.day} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan/10 text-cyan">
                    <Thermometer className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{f.day}</p>
                    <p className="text-xs text-muted">{f.detail}</p>
                  </div>
                  <Badge tone={f.tone === "primary" ? "primary" : f.tone === "gold" ? "gold" : "crimson"}>{f.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Calendar data={data} />
    </div>
  );
}

function Stat({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <Card className="flex flex-col gap-2">
      <p className="text-xs text-muted">{label}</p>
      <p className={`font-mono text-xl font-semibold tabular-nums md:text-2xl ${highlight === false ? "text-crimson" : "text-ink"}`}>
        {value}
        {unit && <span className="ml-1 font-sans text-xs font-medium text-muted">{unit}</span>}
      </p>
    </Card>
  );
}
