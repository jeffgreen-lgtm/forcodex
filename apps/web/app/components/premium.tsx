import type { CSSProperties, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

import { colors, gradients, materials, radius } from "../../design";

type ElementProps<T extends HTMLElement> = HTMLAttributes<T> & {
  children?: ReactNode;
};

export function PremiumSurface({ children, className = "", style, ...props }: ElementProps<HTMLElement>) {
  return (
    <section className={`premium-surface ${className}`.trim()} style={{ ...materials.page, ...style }} {...props}>
      {children}
    </section>
  );
}

export function PremiumCard({ children, className = "", style, ...props }: ElementProps<HTMLElement>) {
  return (
    <article className={`premium-card ${className}`.trim()} style={{ ...materials.instrument, ...style }} {...props}>
      {children}
    </article>
  );
}

type PremiumButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
} & HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>;

export function PremiumButton({ children, href, variant = "primary", className = "", ...props }: PremiumButtonProps) {
  const buttonClass = `premium-button premium-button-${variant} ${className}`.trim();

  if (href) {
    return (
      <a className={buttonClass} href={href} {...(props as HTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={buttonClass} type="button" {...(props as HTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

export function PremiumInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`premium-input ${className}`.trim()} {...props} />;
}

export function PremiumToggle({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`premium-toggle ${className}`.trim()} type="checkbox" {...props} />;
}

export function PremiumNavigation({ children, className = "", ...props }: ElementProps<HTMLElement>) {
  return (
    <nav className={`premium-navigation ${className}`.trim()} {...props}>
      {children}
    </nav>
  );
}

export function PremiumHeader({ children, className = "", ...props }: ElementProps<HTMLElement>) {
  return (
    <header className={`premium-header ${className}`.trim()} {...props}>
      {children}
    </header>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
  className = ""
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`section-header ${className}`.trim()}>
      {eyebrow ? <p className="premium-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export function SolarHero({ className = "" }: { className?: string }) {
  return (
    <div className={`solar-hero ${className}`.trim()} aria-hidden="true">
      <span className="solar-orbit solar-orbit-primary hero-orbit hero-orbit-one" />
      <span className="solar-orbit solar-orbit-secondary hero-orbit hero-orbit-two" />
      <span className="solar-eclipse hero-eclipse" />
      <span className="solar-horizon hero-horizon" />
    </div>
  );
}

export function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-bar">
      <span>{label}</span>
      <i>
        <b style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </i>
      <strong>{value}%</strong>
    </div>
  );
}

export function OrbitalChart({ className = "" }: { className?: string }) {
  return (
    <div className={`orbital-chart ${className}`.trim()} aria-hidden="true">
      <span />
    </div>
  );
}

export function EnergyTimeline({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ol className={`energy-timeline ${className}`.trim()}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

export function GlassPanel({ children, className = "", style, ...props }: ElementProps<HTMLDivElement>) {
  return (
    <div
      className={`glass-panel ${className}`.trim()}
      style={{ background: colors.glass, border: `1px solid ${colors.line}`, borderRadius: radius.lg, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export function PremiumList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`premium-list ${className}`.trim()}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function PremiumMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="premium-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export const solarCssVars = {
  "--solar-black": colors.black,
  "--solar-night": colors.night,
  "--solar-void": colors.void,
  "--solar-ivory": colors.ivory,
  "--solar-white": colors.white,
  "--solar-muted": colors.muted,
  "--solar-gold": colors.gold,
  "--solar-gold-deep": colors.goldDeep,
  "--solar-line": colors.line,
  "--solar-line-strong": colors.lineStrong,
  "--solar-glass": colors.glass,
  "--solar-page-gradient": gradients.cosmicPage,
  "--solar-instrument-gradient": gradients.instrument,
  "--solar-gold-gradient": gradients.gold,
  "--solar-horizon-gradient": gradients.horizon
} as CSSProperties;
