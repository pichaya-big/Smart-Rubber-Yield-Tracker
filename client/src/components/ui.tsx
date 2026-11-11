import type { ButtonHTMLAttributes, ReactNode } from "react";

export type Tone = "primary" | "gold" | "cyan" | "crimson" | "neutral";

const TONE_BG: Record<Tone, string> = {
  primary: "bg-primary/15 text-primary",
  gold: "bg-gold/15 text-gold",
  cyan: "bg-cyan/15 text-cyan",
  crimson: "bg-crimson/15 text-crimson",
  neutral: "bg-raised text-muted",
};

const TONE_TEXT: Record<Tone, string> = {
  primary: "text-primary",
  gold: "text-gold",
  cyan: "text-cyan",
  crimson: "text-crimson",
  neutral: "text-ink",
};

/** Enclosed module: Tier 1 background, 1px structural border, 16px radius. */
export function Card({
  className = "",
  children,
  active = false,
}: {
  className?: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <section
      className={`rounded-lg border bg-panel p-4 shadow-sm md:p-5 ${
        active ? "border-primary/40 shadow-[0_4px_20px_-10px_rgba(10,127,90,0.35)]" : "border-line"
      } ${className}`}
    >
      {children}
    </section>
  );
}

/** Pill status badge with optional pulsing-free 6px status dot. */
export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TONE_BG[tone]}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/** Card header: colored accent bar, title + subtitle, optional right-side action. */
export function SectionHeader({
  title,
  subtitle,
  action,
  accent = "primary",
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  accent?: Tone;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-1 h-6 w-1.5 shrink-0 rounded-full bg-current ${TONE_TEXT[accent]}`} aria-hidden />
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold md:text-lg">
            {icon}
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Metric card: label, large mono readout, optional trend pill / footer. */
export function StatCard({
  label,
  value,
  unit,
  footer,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  footer?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        {icon && <span className={TONE_TEXT[tone]}>{icon}</span>}
      </div>
      <p className="font-mono text-2xl font-semibold tabular-nums text-ink md:text-3xl">
        {value}
        {unit && <span className="ml-1 font-sans text-sm font-medium text-muted">{unit}</span>}
      </p>
      {footer && <div className="mt-auto text-xs text-muted">{footer}</div>}
    </Card>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-ink hover:bg-primary-deep hover:text-ink",
  secondary: "border border-line text-ink hover:border-primary",
  danger: "border border-crimson/40 bg-crimson/15 text-crimson hover:bg-crimson/25",
};

/** Red asterisk marking a required field. */
export function Req() {
  return (
    <span className="ml-0.5 text-crimson" aria-label="จำเป็นต้องกรอก">
      *
    </span>
  );
}

/** Buttons: 48px tall on mobile, 40px on desktop; subtle press scale. */
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 md:h-10 ${BUTTON_VARIANT[variant]} ${className}`}
    />
  );
}
