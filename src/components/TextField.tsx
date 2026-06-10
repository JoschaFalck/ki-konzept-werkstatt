import { useId } from 'react';
import { ui } from '../../content/ui-strings';

interface CommonProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

function Counter({ length, maxLength }: { length: number; maxLength: number }) {
  // Zeichenzähler ab 80 % des Limits (Spezifikation Abschnitt 6).
  if (length < maxLength * 0.8) return null;
  return (
    <span className={`text-xs ${length >= maxLength ? 'text-fehler' : 'text-sekundaer'}`}>
      {length} / {maxLength} {ui.builder.zeichen}
    </span>
  );
}

const FIELD_CLASSES =
  'w-full rounded border border-sekundaer/40 bg-karte px-3 py-2 text-base text-text placeholder:text-sekundaer/70';

export function TextField({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  hint,
  required,
}: CommonProps) {
  const id = useId();
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {required && <span className="ml-1 text-sekundaer">({ui.builder.pflichtfeld})</span>}
        </label>
        <Counter length={value.length} maxLength={maxLength} />
      </div>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_CLASSES}
      />
      {hint && <p className="text-xs text-sekundaer">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  hint,
  required,
  rows = 4,
}: CommonProps & { rows?: number }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {required && <span className="ml-1 text-sekundaer">({ui.builder.pflichtfeld})</span>}
        </label>
        <Counter length={value.length} maxLength={maxLength} />
      </div>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_CLASSES}
      />
      {hint && <p className="text-xs text-sekundaer">{hint}</p>}
    </div>
  );
}
