// Sample data taken from the Stitch screens. Replace with API calls when the backend has these endpoints.

export const owner = { name: "สมชัย ยางทองดี", initials: "สม", role: "เจ้าของสวน" };

export const parcel = "สวนยางเนินเขาแปลงที่ 1 (สุราษฎร์ธานี)";

export const marketTicker = "฿78.50/กก.";

export const weather = { place: "สุราษฎร์ธานี", tempC: 28, humidity: 78 };

export const marketPrices = [
  { name: "น้ำยางสด (Latex 100%)", note: "เนื้อแห้ง 100% ณ โรงงาน", price: 72.5, delta: 1.2, tone: "primary" as const },
  { name: "ยางแผ่นรมควันชั้น 3 (RSS3)", note: "มาตรฐานการส่งออก", price: 84.2, delta: 2.0, tone: "gold" as const },
  { name: "ยางก้อนถ้วย (Cup Lump)", note: "เนื้อแห้ง 50% จุดรับซื้อท้องถิ่น", price: 51.0, delta: 0, tone: "cyan" as const },
];

export type RubberType = "latex" | "cuplump" | "sheet";

export const rubberTypes: { id: RubberType; label: string; drc: string }[] = [
  { id: "latex", label: "น้ำยางสด", drc: "DRC ~35-42%" },
  { id: "cuplump", label: "ยางก้อนถ้วย", drc: "DRC ~50-65%" },
  { id: "sheet", label: "ยางแผ่นดิบ", drc: "DRC ~80-95%" },
];

export type Receipt = {
  id: string;
  title: string;
  date: string;
  grossKg: number;
  drcPct: number;
  dryKg: number;
  tapper: string;
  pricePerKg: number;
  total: number;
  tapperShare: number;
  verified: boolean;
  overridden?: string;
};

export const recentReceipts: Receipt[] = [
  {
    id: "R-001",
    title: "น้ำยางสด (Fresh Latex)",
    date: "18 พ.ค. 2567 (06:45 น.)",
    grossKg: 420,
    drcPct: 38.5,
    dryKg: 161.7,
    tapper: "สมพร พรเจริญ (แปลง A-1)",
    pricePerKg: 72,
    total: 11642.4,
    tapperShare: 4656.96,
    verified: true,
  },
  {
    id: "R-002",
    title: "ยางก้อนถ้วย (Cup Lump)",
    date: "16 พ.ค. 2567 (07:30 น.)",
    grossKg: 580,
    drcPct: 50.0,
    dryKg: 290.0,
    tapper: "บุญมี มณีวงษ์ (แปลง B-2)",
    pricePerKg: 48.5,
    total: 14065.0,
    tapperShare: 5626.0,
    verified: true,
  },
  {
    id: "R-003",
    title: "น้ำยางสด (Fresh Latex)",
    date: "14 พ.ค. 2567 (06:10 น.)",
    grossKg: 395,
    drcPct: 37.8,
    dryKg: 149.3,
    tapper: "สมพร พรเจริญ (แปลง A-1)",
    pricePerKg: 71.5,
    total: 10674.95,
    tapperShare: 4269.98,
    verified: true,
    overridden: "แก้ไขค่า DRC จากเครื่องวัดเดิม (+0.6%)",
  },
  {
    id: "R-004",
    title: "ยางแผ่นดิบ (Unsmoked Sheet)",
    date: "12 พ.ค. 2567",
    grossKg: 210,
    drcPct: 90.0,
    dryKg: 189.0,
    tapper: "สมจิตต์ แซ่ลี้ (แปลง C-3)",
    pricePerKg: 82,
    total: 15498.0,
    tapperShare: 6199.2,
    verified: true,
  },
];

export const forecast = [
  { day: "พรุ่งนี้ (19 พ.ค.)", detail: "โอกาสฝน 10% • อมสงบ", status: "กรีดได้เต็มที่", tone: "primary" as const },
  { day: "มะรืนนี้ (20 พ.ค.)", detail: "โอกาสฝน 35% ช่วงบ่าย", status: "กรีดได้รอบเช้ามืด", tone: "gold" as const },
  { day: "21 พ.ค.", detail: "ฝนฟ้าคะนอง 75% เช้ามืด", status: "เลื่อนวันกรีด", tone: "crimson" as const },
];

export const laborEfficiency = [
  { name: "สมพร พรเจริญ (แปลง A)", kg: 1480, pct: 102, tone: "primary" as const },
  { name: "บุญมี มณีวงษ์ (แปลง B)", kg: 1210, pct: 94, tone: "gold" as const },
  { name: "สมจิตต์ แซ่ลี้ (แปลง C)", kg: 1155, pct: 88, tone: "cyan" as const },
];

export const yoyMonths = [
  { label: "มกราคม", y2566: 2250, y2567: 3050 },
  { label: "กุมภาพันธ์", y2566: 2600, y2567: 2850 },
  { label: "มีนาคม (ผลดีน้อย)", y2566: 1150, y2567: 1650 },
  { label: "เมษายน", y2566: 2700, y2567: 3200 },
  { label: "พฤษภาคม", y2566: 3000, y2567: 3850 },
];

export const auditTrail = [
  {
    id: "TXN-670514-082",
    time: "14 พ.ค. 2567 • 14:22 น.",
    kind: "แก้ไขค่า % DRC",
    title: "แก้ไขเปอร์เซ็นต์ DRC น้ำยางสด • แปลงที่ 2 (โรงเกษตร)",
    before: "34.2%",
    after: "37.8% DRC",
    reason: "ผลตรวจจากห้องปฏิบัติการเกษตรอ่านค่าได้สูงกว่าเดิม",
    by: "สมชัย ยางทองดี (เจ้าของสวน / ผู้ตรวจสอบ)",
  },
  {
    id: "TXN-670510-019",
    time: "10 พ.ค. 2567 • 09:15 น.",
    kind: "ปรับแก้น้ำหนัก",
    title: "ปรับน้ำหนักยางก้อนถ้วย (Cup Lump) • ชุดชั่งรวมระบบที่ 1",
    before: "620.0 กก.",
    after: "585.0 กก.",
    reason: "หักค่าน้ำหนักถังเก็บน้ำยางรวมเข้าในรอบชั่ง",
    by: "สมชัย ยางทองดี",
  },
  {
    id: "TXN-670502-070",
    time: "02 พ.ค. 2567 • 18:40 น.",
    kind: "ปรับราคาอ้างอิง",
    title: "อัปเดตราคาตลาดกลางยางพาราหาดใหญ่ (Songkhla Central Rubber Market)",
    before: "฿70.00/กก.",
    after: "฿71.50/กก.",
    reason: "อัปเดตราคาปิดตลาดช่วงเย็นจาก API การค้าแห่งประเทศไทย",
    by: "ระบบอัตโนมัติ (System Price Sync)",
  },
];
