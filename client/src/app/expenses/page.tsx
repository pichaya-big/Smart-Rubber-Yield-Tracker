"use client";

import { DateField } from "@/components/date-field";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, Card, Req, SectionHeader } from "@/components/ui";
import { addExpense, removeItem, useData, useReady, type ExpenseCategory } from "@/lib/store";
import { CATEGORIES, CATEGORY_LABEL, baht, monthOf, sum, thaiDate, todayIso } from "@/lib/calc";

export default function ExpensesPage() {
  const ready = useReady();
  const data = useData();
  const [dateOverride, setDate] = useState<string | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>("fertilizer");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  if (!ready) return null;

  // Read the clock only in the browser; static rendering must not touch Date.
  const date = dateOverride ?? todayIso();
  const amountNum = Number(amount) || 0;
  const canSave = amountNum > 0;
  const thisMonth = todayIso().slice(0, 7);

  const monthExpenses = data.expenses.filter((e) => monthOf(e.date) === thisMonth);
  const monthTotal = sum(monthExpenses.map((e) => e.amount));
  const byCategory = CATEGORIES.map((c) => ({
    id: c,
    total: sum(monthExpenses.filter((e) => e.category === c).map((e) => e.amount)),
  })).filter((c) => c.total > 0);

  const save = () => {
    if (!canSave) return;
    addExpense({ date, category, amount: amountNum, note: note.trim() || undefined });
    setAmount("");
    setNote("");
    setSaved(true);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">รายจ่าย</h1>
        <p className="mt-1 text-sm text-muted">
          เดือนนี้จ่ายไปแล้ว <span className="font-mono font-semibold text-ink tabular-nums">฿{baht(monthTotal)}</span>
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">วันที่จ่าย<Req /></span>
            <DateField value={date} onChange={setDate} label="วันที่จ่าย" />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">จำนวนเงิน (฿)<Req /></span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={amount}
              onChange={(e) => {
                setSaved(false);
                setAmount(e.target.value);
              }}
              placeholder="0.00"
              className="h-12 rounded-md border border-line bg-canvas px-3 font-mono text-lg tabular-nums outline-none focus:border-primary md:h-10"
            />
          </label>

          <div className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="text-muted">หมวดรายจ่าย</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`h-10 rounded-md border px-3 text-xs font-semibold transition ${
                    category === c ? "border-primary bg-primary/10 text-primary" : "border-line bg-canvas hover:border-primary/40"
                  }`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="text-muted">รายละเอียด (ไม่บังคับ)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ปุ๋ย 15-5-18 จำนวน 2 กระสอบ"
              className="h-12 rounded-md border border-line bg-canvas px-3 outline-none placeholder:text-muted focus:border-primary md:h-10"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {saved && <span className="text-sm text-primary sm:mr-auto">บันทึกรายจ่ายแล้ว</span>}
          <Button onClick={save} disabled={!canSave} className="w-full sm:w-auto">
            บันทึกรายจ่าย
          </Button>
        </div>
      </Card>

      {byCategory.length > 0 && (
        <Card>
          <SectionHeader title="รายจ่ายเดือนนี้แยกตามหมวด" />
          <ul className="flex flex-col gap-3">
            {byCategory.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{CATEGORY_LABEL[c.id]}</span>
                <span className="font-mono tabular-nums">฿{baht(c.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="xl:col-span-3">
        <SectionHeader title="รายการทั้งหมด" />
        {data.expenses.length === 0 ? (
          <p className="text-sm text-muted">ยังไม่มีรายจ่าย</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{CATEGORY_LABEL[e.category]}</p>
                  <p className="text-xs text-muted">
                    {thaiDate(e.date)}
                    {e.note ? ` • ${e.note}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="font-mono text-base font-semibold tabular-nums">฿{baht(e.amount)}</p>
                  <button
                    type="button"
                    aria-label="ลบรายการนี้"
                    onClick={() => removeItem("expenses", e.id)}
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
