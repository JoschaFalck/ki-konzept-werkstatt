import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primaer text-white hover:bg-primaer-hover',
  secondary: 'bg-karte text-primaer border border-primaer hover:bg-flaeche',
  ghost: 'bg-transparent text-sekundaer hover:text-text',
  danger: 'bg-karte text-fehler border border-fehler hover:bg-flaeche',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 rounded px-4 py-2 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
