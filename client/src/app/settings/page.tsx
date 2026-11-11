"use client";

import { useState } from "react";
import { Button, Card, SectionHeader } from "@/components/ui";
import { owner, parcel } from "@/lib/mock-data";
import { resetToSample, useReady } from "@/lib/store";

export default function SettingsPage() {
  const ready = useReady();
  const [done, setDone] = useState(false);
  if (!ready) return null;

  const reset = () => {
    if (window.confirm("ล้างข้อมูลทั้งหมดในเครื่องนี้ และใส่ข้อมูลตัวอย่างแทน ต้องการดำเนินการต่อหรือไม่")) {
      resetToSample();
      setDone(true);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">ตั้งค่า</h1>
      </header>

      <Card>
        <SectionHeader title="ข้อมูลสวน" />
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">เจ้าของ</dt>
            <dd>{owner.name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">สวน</dt>
            <dd>{parcel}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <SectionHeader title="ข้อมูลในเครื่อง" subtitle="ข้อมูลการกรีด การขาย และรายจ่ายเก็บอยู่ในเบราว์เซอร์นี้" accent="cyan" />
        <p className="text-sm text-muted">
          ถ้าเปลี่ยนเบราว์เซอร์หรือเครื่อง ข้อมูลจะไม่ตามไปด้วย และการล้างข้อมูลจะลบทั้งหมดที่บันทึกไว้
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="danger" onClick={reset}>
            ล้างและใส่ข้อมูลตัวอย่าง
          </Button>
          {done && <span className="text-sm text-primary">ล้างข้อมูลแล้ว</span>}
        </div>
      </Card>
    </div>
  );
}
