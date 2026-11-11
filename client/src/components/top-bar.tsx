import Link from "next/link";
import { Droplet, MapPin, Settings, TrendingUp } from "lucide-react";
import { Badge } from "./ui";
import { marketTicker, owner, parcel } from "@/lib/mock-data";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-ink">
          <Droplet className="size-4" aria-hidden />
        </span>
        <span className="text-sm font-semibold">Smart Rubber Yield Tracker</span>
      </div>

      <div className="hidden h-10 items-center gap-2 rounded-md border border-line bg-panel px-3 text-sm md:flex">
        <MapPin className="size-4 text-primary" aria-hidden />
        {parcel}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Badge tone="primary" dot>
          ออนไลน์
        </Badge>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-sm sm:flex">
          <TrendingUp className="size-4 text-gold" aria-hidden />
          <span className="text-muted">ราคากลาง</span>
          <span className="font-mono font-semibold text-gold tabular-nums">{marketTicker}</span>
        </div>
        <Link
          href="/settings"
          aria-label="ตั้งค่า"
          className="flex size-9 items-center justify-center rounded-md text-muted transition hover:bg-raised hover:text-ink"
        >
          <Settings className="size-5" aria-hidden />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-raised text-sm font-semibold">
            {owner.initials}
          </span>
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold">{owner.name}</p>
            <p className="text-xs text-primary">{owner.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
