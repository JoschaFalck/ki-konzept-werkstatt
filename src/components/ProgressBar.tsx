interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-primaer/10"
    >
      <div
        className="h-full rounded-full bg-aurora-balken transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
