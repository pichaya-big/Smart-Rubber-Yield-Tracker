import type { Data, ExpenseCategory, PayType, PricePoint, PriceSource, RubberType, Sale, SaleChannel } from "./store";

export const RUBBER_LABEL = { latex: "น้ำยางสด", cuplump: "ยางก้อนถ้วย", sheet: "ยางแผ่นดิบ" } as const;

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  fertilizer: "ปุ๋ยและสารปรุงดิน",
  chemicals: "กรดและยาบำรุงต้น",
  labor: "ค่าแรง",
  fuel: "น้ำมันและขนส่ง",
  equipment: "อุปกรณ์กรีด",
  other: "อื่นๆ",
};

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as ExpenseCategory[];

export const CHANNEL_LABEL: Record<SaleChannel, string> = {
  middleman: "พ่อค้าคนกลาง",
  auction: "ลานประมูล",
};

export const SOURCE_LABEL: Record<PriceSource, string> = {
  auction: "ลานประมูล",
  middleman: "พ่อค้า",
  factory: "โรงงาน",
  other: "อื่นๆ",
};

export const PAY_LABEL: Record<PayType, string> = {
  share: "ส่วนแบ่ง (% ของยอดขาย)",
  perKg: "ต่อกก. แห้ง",
  daily: "เหมาต่อวัน",
};

const pad = (n: number) => String(n).padStart(2, "0");

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const dryKgOf = (grossKg: number, drcPct: number) => round2((grossKg * drcPct) / 100);
export const saleGross = (s: Sale) => s.dryKg * s.pricePerKg;
export const saleNet = (s: Sale) => saleGross(s) - s.fees;
export const monthOf = (iso: string) => iso.slice(0, 7);

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const baht = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const kg = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });

export function thaiDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

/** Dry kg produced on own farm and not yet sold. */
export function unsoldKg(data: Data): number {
  return round2(sum(data.harvests.map((h) => h.dryKg)) - sum(data.sales.map((s) => s.dryKg)));
}

export function channelStats(sales: Sale[], channel: SaleChannel) {
  const list = sales.filter((s) => s.channel === channel);
  const dry = sum(list.map((s) => s.dryKg));
  const net = sum(list.map(saleNet));
  return { count: list.length, kg: dry, net, avg: dry > 0 ? net / dry : 0 };
}

/** All recorded prices for one rubber type, oldest first. */
export function priceHistory(prices: PricePoint[], rubber: RubberType): PricePoint[] {
  return prices.filter((p) => p.rubber === rubber).sort((a, b) => a.date.localeCompare(b.date));
}

/** Latest price compared with the one before it. */
export function priceTrend(prices: PricePoint[], rubber: RubberType) {
  const history = priceHistory(prices, rubber);
  if (history.length === 0) return null;
  const last = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : null;
  const diff = prev ? round2(last.pricePerKg - prev.pricePerKg) : 0;
  const pct = prev && prev.pricePerKg > 0 ? round2((diff / prev.pricePerKg) * 100) : 0;
  return { last, prev, diff, pct, history };
}

export type MonthRow = {
  month: string;
  produced: number;
  soldKg: number;
  net: number; // รายได้จากขายยางสวนตัวเอง
  wages: number; // รายได้จากรับจ้างกรีด
  expenses: number;
  profit: number; // รายได้รวม - รายจ่าย
};

export function monthlyRows(data: Data): MonthRow[] {
  const months = new Set<string>([
    ...data.harvests.map((h) => monthOf(h.date)),
    ...data.sales.map((s) => monthOf(s.date)),
    ...data.expenses.map((e) => monthOf(e.date)),
    ...data.jobs.map((j) => monthOf(j.date)),
  ]);
  return [...months]
    .sort()
    .reverse()
    .map((m) => {
      const sales = data.sales.filter((s) => monthOf(s.date) === m);
      const net = sum(sales.map(saleNet));
      const wages = sum(data.jobs.filter((j) => monthOf(j.date) === m).map((j) => j.earned));
      const expenses = sum(data.expenses.filter((e) => monthOf(e.date) === m).map((e) => e.amount));
      return {
        month: m,
        produced: sum(data.harvests.filter((h) => monthOf(h.date) === m).map((h) => h.dryKg)),
        soldKg: sum(sales.map((s) => s.dryKg)),
        net,
        wages,
        expenses,
        profit: net + wages - expenses,
      };
    });
}
