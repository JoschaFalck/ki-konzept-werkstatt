import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'hero';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-primaer text-white hover:bg-primaer-hover hover:shadow-schwebend hover:-translate-y-0.5',
  secondary: 'bg-karte text-primaer border border-primaer hover:bg-flaeche hover:-translate-y-0.5',
  ghost: 'bg-transparent text-sekundaer hover:text-text',
  danger: 'bg-karte text-fehler border border-fehler hover:bg-flaeche',
  // CTA auf dunklen Aurora-Flächen (Spezifikation Abschnitt 6)
  hero: 'bg-bernstein text-bernstein-text hover:shadow-schwebend-lg hover:-translate-y-0.5 font-semibold',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-base font-medium transition-all duration-200 motion-reduce:transform-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
