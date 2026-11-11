"use client";

import { Card, SectionHeader } from "@/components/ui";
import { useData, useReady } from "@/lib/store";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CHANNEL_LABEL,
  PAY_LABEL,
  baht,
  channelStats,
  kg,
  monthLabel,
  monthlyRows,
  sum,
  unsoldKg,
} from "@/lib/calc";

export default function ReportsPage() {
  const ready = useReady();
  const data = useData();
  if (!ready) return null;

  const produced = sum(data.harvests.map((h) => h.dryKg));
  const sales = sum(data.sales.map((s) => s.dryKg * s.pricePerKg - s.fees));
  const wages = sum(data.jobs.map((j) => j.earned));
  const expenses = sum(data.expenses.map((e) => e.amount));
  const profit = sales + wages - expenses;
  const jobsReceived = sum(data.jobs.filter((j) => j.received).map((j) => j.earned));
  const rows = monthlyRows(data);
  const mid = channelStats(data.sales, "middleman");
  const auc = channelStats(data.sales, "auction");
  const maxExpense = Math.max(1, ...CATEGORIES.map((c) => sum(data.expenses.filter((e) => e.category === c).map((e) => e.amount))));

  const payTypes = Object.keys(PAY_LABEL) as (keyof typeof PAY_LABEL)[];

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">สรุปผล</h1>
        <p className="mt-1 text-sm text-muted">ภาพรวมตั้งแต่เริ่มบันทึก รวมทั้งสวนตัวเองและงานรับจ้าง</p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-5">
        <Figure label="ผลิตได้จากสวนตัวเอง" value={kg(produced)} unit="กก. แห้ง" />
        <Figure label="ขายยางของสวน" value={`฿${baht(sales)}`} />
        <Figure label="รับจ้างกรีด" value={`฿${baht(wages)}`} unit={`รับแล้ว ฿${baht(jobsReceived)}`} />
        <Figure label="รายจ่ายรวม" value={`฿${baht(expenses)}`} />
        <Figure label="กำไรสุทธิ" value={`฿${baht(profit)}`} tone={profit >= 0 ? "text-primary" : "text-crimson"} />
      </section>
      <p className="text-xs text-muted">
        กำไรคำนวณจากยอดขายยางสวนหลังหักค่าใช้จ่ายการขาย บวกค่ารับจ้างกรีด ลบด้วยรายจ่ายที่บันทึก ยังไม่รวมค่าเสื่อมต้นยางและค่าที่ดิน
        ยังไม่ได้ขายยางของสวนอยู่ {kg(unsoldKg(data))} กก. แห้ง
      </p>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeader title="ขายทางไหนได้ราคาดีกว่า" subtitle="ราคาเฉลี่ยต่อกก. แห้ง หลังหักค่าใช้จ่ายในการขาย" accent="gold" />
          {mid.count === 0 && auc.count === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีการขาย</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "middleman" as const, s: mid },
                { key: "auction" as const, s: auc },
              ].map(({ key, s }) => (
                <div key={key} className="rounded-lg bg-canvas p-4">
                  <p className="text-sm font-semibold">{CHANNEL_LABEL[key]}</p>
                  <p className="mt-1 text-xs text-muted">
                    ขาย {s.count} ครั้ง • {kg(s.kg)} กก. แห้ง
                  </p>
                  <p className="mt-3 font-mono text-xl font-semibold tabular-nums">
                    ฿{baht(s.avg)}
                    <span className="text-xs font-normal text-muted">/กก.</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader title="รายจ่ายแยกตามหมวด" accent="cyan" />
          {data.expenses.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีรายจ่าย</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {CATEGORIES.map((c) => {
                const total = sum(data.expenses.filter((e) => e.category === c).map((e) => e.amount));
                if (total === 0) return null;
                return (
                  <li key={c}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span>{CATEGORY_LABEL[c]}</span>
                      <span className="font-mono tabular-nums">฿{baht(total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-raised">
                      <div className="h-full rounded-full bg-cyan" style={{ width: `${(total / maxExpense) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <SectionHeader title="รายเดือน" />
        {rows.length === 0 ? (
          <p className="text-sm text-muted">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="py-2 font-medium">เดือน</th>
                  <th className="py-2 text-right font-medium">ผลิต (กก.)</th>
                  <th className="py-2 text-right font-medium">ขายยาง</th>
                  <th className="py-2 text-right font-medium">รับจ้าง</th>
                  <th className="py-2 text-right font-medium">รายจ่าย</th>
                  <th className="py-2 text-right font-medium">กำไร</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.month} className="border-b border-line last:border-0">
                    <td className="py-3">{monthLabel(r.month)}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{kg(r.produced)}</td>
                    <td className="py-3 text-right font-mono tabular-nums">฿{baht(r.net)}</td>
                    <td className="py-3 text-right font-mono tabular-nums">฿{baht(r.wages)}</td>
                    <td className="py-3 text-right font-mono tabular-nums">฿{baht(r.expenses)}</td>
                    <td className={`py-3 text-right font-mono font-semibold tabular-nums ${r.profit >= 0 ? "text-primary" : "text-crimson"}`}>
                      ฿{baht(r.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="งานรับจ้างแยกตามวิธีคิดค่าจ้าง" accent="primary" />
        <div className="grid gap-3 md:grid-cols-3">
          {payTypes.map((t) => {
            const list = data.jobs.filter((j) => j.payType === t);
            return (
              <div key={t} className="rounded-lg bg-canvas p-4">
                <p className="text-sm font-semibold">{PAY_LABEL[t]}</p>
                <p className="mt-1 text-xs text-muted">{list.length} งาน</p>
                <p className="mt-3 font-mono text-lg font-semibold tabular-nums">฿{baht(sum(list.map((j) => j.earned)))}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Figure({ label, value, unit, tone = "text-ink" }: { label: string; value: string; unit?: string; tone?: string }) {
  return (
    <Card className="flex flex-col gap-2">
      <p className="text-xs text-muted">{label}</p>
      <p className={`font-mono text-xl font-semibold tabular-nums md:text-2xl ${tone}`}>{value}</p>
      {unit && <p className="text-xs text-muted">{unit}</p>}
    </Card>
  );
}
