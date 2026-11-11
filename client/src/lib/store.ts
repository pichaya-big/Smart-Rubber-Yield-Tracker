import { useSyncExternalStore } from "react";
import type { RubberType } from "./mock-data";

export type { RubberType };

export type Harvest = {
  id: string;
  date: string; // YYYY-MM-DD
  rubber: RubberType;
  grossKg: number; // น้ำหนักที่ชั่งได้
  drcPct: number; // เปอร์เซ็นต์เนื้อยางแห้ง
  dryKg: number; // น้ำหนักแห้ง = grossKg * drcPct / 100
  note?: string;
};

export type SaleChannel = "middleman" | "auction";

export type Sale = {
  id: string;
  date: string;
  channel: SaleChannel;
  buyer: string; // ชื่อพ่อค้า หรือชื่อลานประมูล
  lot?: string; // เลขล็อต (ลานประมูล)
  grade?: string; // เกรดยาง (ลานประมูล)
  dryKg: number; // น้ำหนักแห้งที่ขาย
  pricePerKg: number; // ราคาต่อกก. แห้ง
  fees: number; // ค่าธรรมเนียม ค่าขนส่ง หรือค่าหักอื่นๆ
  paid: boolean;
};

/** Tapping work for someone else's farm. */
export type PayType = "share" | "perKg" | "daily";

export type Job = {
  id: string;
  date: string;
  farm: string; // เจ้าของสวนที่จ้างกรีด
  plot?: string;
  grossKg: number;
  drcPct: number;
  dryKg: number;
  farmPricePerKg: number; // ราคาขายยางของสวนนั้น (ใช้คำนวณส่วนแบ่ง)
  payType: PayType;
  payValue: number; // % ของยอดขาย / ฿ ต่อกก. แห้ง / ฿ ต่อวัน
  earned: number; // ค่าจ้างที่ได้จากงานนี้
  received: boolean;
  note?: string;
};

export type ExpenseCategory = "fertilizer" | "chemicals" | "labor" | "fuel" | "equipment" | "other";

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
};

/** Price the farmer was offered for a rubber type on a given date (entered by the farmer). */
export type PriceSource = "auction" | "middleman" | "factory" | "other";

export type PricePoint = {
  id: string;
  date: string;
  rubber: RubberType;
  pricePerKg: number;
  source: PriceSource;
};

/** A planned item the farmer wants to be reminded of on a given day. */
export type Reminder = {
  id: string;
  date: string; // วันที่ต้องทำ
  title: string; // เช่น ขายยางที่ลานประมูล
  done: boolean;
};

export type Data = {
  harvests: Harvest[];
  sales: Sale[];
  expenses: Expense[];
  jobs: Job[];
  prices: PricePoint[];
  reminders: Reminder[];
};

const KEY = "sryt.data.v1";
const EMPTY: Data = { harvests: [], sales: [], expenses: [], jobs: [], prices: [], reminders: [] };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Wage for one job, from its pay terms. */
export function jobEarned(dryKg: number, farmPricePerKg: number, payType: PayType, payValue: number): number {
  if (payType === "share") return round2((dryKg * farmPricePerKg * payValue) / 100);
  if (payType === "perKg") return round2(dryKg * payValue);
  return round2(payValue); // daily: one day per job
}

function seedData(): Data {
  const dry = (g: number, d: number) => round2((g * d) / 100);
  return {
    harvests: [
      { id: "h1", date: "2026-11-03", rubber: "latex", grossKg: 420, drcPct: 38.5, dryKg: dry(420, 38.5) },
      { id: "h2", date: "2026-11-05", rubber: "cuplump", grossKg: 580, drcPct: 50, dryKg: dry(580, 50) },
      { id: "h3", date: "2026-11-07", rubber: "latex", grossKg: 395, drcPct: 37.8, dryKg: dry(395, 37.8) },
      { id: "h4", date: "2026-11-09", rubber: "sheet", grossKg: 210, drcPct: 90, dryKg: dry(210, 90) },
    ],
    sales: [
      {
        id: "s1",
        date: "2026-11-06",
        channel: "middleman",
        buyer: "พ่อค้าคนกลาง (ลุงเปิ้ล)",
        dryKg: 150,
        pricePerKg: 68,
        fees: 300,
        paid: true,
      },
      {
        id: "s2",
        date: "2026-11-10",
        channel: "auction",
        buyer: "ลานประมูลยางหาดใหญ่",
        lot: "LOT-1142",
        grade: "RSS3",
        dryKg: 120,
        pricePerKg: 72.5,
        fees: 260,
        paid: false,
      },
    ],
    expenses: [
      { id: "e1", date: "2026-11-02", category: "fertilizer", amount: 2100, note: "ปุ๋ย 15-5-18 จำนวน 2 กระสอบ" },
      { id: "e2", date: "2026-11-08", category: "labor", amount: 1800, note: "ค่าแรงกรีด 3 วัน" },
    ],
    jobs: [
      {
        id: "j1",
        date: "2026-11-04",
        farm: "ลุงสำราญ (สวนเขาใหญ่)",
        plot: "แปลง 3",
        grossKg: 300,
        drcPct: 37,
        dryKg: dry(300, 37),
        farmPricePerKg: 70,
        payType: "share",
        payValue: 40,
        earned: jobEarned(dry(300, 37), 70, "share", 40),
        received: true,
      },
      {
        id: "j2",
        date: "2026-11-09",
        farm: "ป้าสมศรี (สวนบ้านโคก)",
        grossKg: 260,
        drcPct: 36,
        dryKg: dry(260, 36),
        farmPricePerKg: 0,
        payType: "perKg",
        payValue: 6,
        earned: jobEarned(dry(260, 36), 0, "perKg", 6),
        received: false,
      },
    ],
    prices: [
      { id: "p1", date: "2026-10-20", rubber: "latex", pricePerKg: 70.5, source: "auction" },
      { id: "p2", date: "2026-10-27", rubber: "latex", pricePerKg: 69, source: "middleman" },
      { id: "p3", date: "2026-11-03", rubber: "latex", pricePerKg: 71, source: "auction" },
      { id: "p4", date: "2026-11-10", rubber: "latex", pricePerKg: 72.5, source: "auction" },
      { id: "p5", date: "2026-10-27", rubber: "cuplump", pricePerKg: 48, source: "middleman" },
      { id: "p6", date: "2026-11-10", rubber: "cuplump", pricePerKg: 49.5, source: "middleman" },
    ],
    reminders: [
      { id: "r1", date: "2026-11-14", title: "ขายยางที่ลานประมูล", done: false },
      { id: "r2", date: "2026-11-17", title: "ใส่ปุ๋ย 15-5-18", done: false },
    ],
  };
}

let cache: Data | null = null;
const listeners = new Set<() => void>();

/** Fill in collections that older saved data does not have yet. */
function normalize(raw: Partial<Data>): Data {
  return {
    harvests: raw.harvests ?? [],
    sales: raw.sales ?? [],
    expenses: raw.expenses ?? [],
    jobs: raw.jobs ?? [],
    prices: raw.prices ?? [],
    reminders: raw.reminders ?? [],
  };
}

function read(): Data {
  if (cache) return cache;
  let data: Data | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) data = normalize(JSON.parse(raw) as Partial<Data>);
  } catch {
    data = null; // storage blocked or corrupt: start from sample data
  }
  cache = data ?? seedData();
  return cache;
}

function write(next: Data) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable: data still lives in memory for this page view
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function useData(): Data {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** false during server render and hydration, true in the browser */
export function useReady(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function addHarvest(input: Omit<Harvest, "id" | "dryKg">) {
  const d = read();
  const dryKg = round2((input.grossKg * input.drcPct) / 100);
  write({ ...d, harvests: [{ id: newId(), ...input, dryKg }, ...d.harvests] });
}

export function addSale(input: Omit<Sale, "id">) {
  const d = read();
  write({ ...d, sales: [{ id: newId(), ...input }, ...d.sales] });
}

export function addExpense(input: Omit<Expense, "id">) {
  const d = read();
  write({ ...d, expenses: [{ id: newId(), ...input }, ...d.expenses] });
}

export function addJob(input: Omit<Job, "id" | "dryKg" | "earned" | "received">) {
  const d = read();
  const dryKg = round2((input.grossKg * input.drcPct) / 100);
  const earned = jobEarned(dryKg, input.farmPricePerKg, input.payType, input.payValue);
  write({ ...d, jobs: [{ id: newId(), ...input, dryKg, earned, received: false }, ...d.jobs] });
}

export function addPrice(input: Omit<PricePoint, "id">) {
  const d = read();
  write({ ...d, prices: [{ id: newId(), ...input }, ...d.prices] });
}

export function addReminder(input: Omit<Reminder, "id" | "done">) {
  const d = read();
  write({ ...d, reminders: [...d.reminders, { id: newId(), done: false, ...input }] });
}

export function toggleReminder(id: string) {
  const d = read();
  write({ ...d, reminders: d.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) });
}

export function togglePaid(id: string) {
  const d = read();
  write({ ...d, sales: d.sales.map((s) => (s.id === id ? { ...s, paid: !s.paid } : s)) });
}

export function toggleJobReceived(id: string) {
  const d = read();
  write({ ...d, jobs: d.jobs.map((j) => (j.id === id ? { ...j, received: !j.received } : j)) });
}

export function removeItem(
  kind: "harvests" | "sales" | "expenses" | "jobs" | "prices" | "reminders",
  id: string,
) {
  const d = read();
  write({ ...d, [kind]: d[kind].filter((item) => item.id !== id) });
}

export function resetToSample() {
  write(seedData());
}
