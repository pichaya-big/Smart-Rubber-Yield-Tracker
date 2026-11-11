"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Droplet, HandCoins, LayoutDashboard, Receipt, Store, Tag, type LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "หน้าหลัก", icon: LayoutDashboard },
  { href: "/production", label: "บันทึกน้ำยาง", icon: Droplet },
  { href: "/prices", label: "ราคายาง", icon: Tag },
  { href: "/sales", label: "ขายยาง", icon: Store },
  { href: "/jobs", label: "รับจ้างกรีด", icon: HandCoins },
  { href: "/expenses", label: "รายจ่าย", icon: Receipt },
  { href: "/reports", label: "สรุปผล", icon: BarChart3 },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

/** Desktop sidebar (lg and up). */
export function SideNav() {
  const isActive = useActive();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-panel lg:flex">
      <div className="flex items-center gap-3 px-6 py-5">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-ink">
          <Droplet className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">Smart Rubber Yield Tracker</p>
          <p className="text-xs text-muted">สวนยางของฉัน</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-4 pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm transition ${
                active ? "bg-primary font-semibold text-primary-ink" : "text-muted hover:bg-raised hover:text-ink"
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/** Mobile bottom navigation (below lg). */
export function MobileNav() {
  const isActive = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-panel/95 backdrop-blur lg:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[10px] leading-tight ${
              active ? "text-primary" : "text-muted"
            }`}
          >
            <Icon className="size-5" aria-hidden />
            <span className="line-clamp-1">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
