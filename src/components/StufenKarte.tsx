// StufenKarten als echte Radio-Group (Spezifikation Abschnitt 7) —
// fieldset/legend/input type=radio, nicht klickbare Divs.

import type { DiagnosisItem } from '../types/contentSchemas';
import type { Level } from '../types/schemas';

interface StufenAuswahlProps {
  item: DiagnosisItem;
  value: Level | null;
  onChange: (level: Level) => void;
  large?: boolean;
}

export function StufenAuswahl({ item, value, onChange, large = false }: StufenAuswahlProps) {
  const name = `stufe-${item.id}`;
  return (
    <fieldset>
      <legend className="sr-only">{item.text}: Stufe auswählen</legend>
      <div className={large ? 'grid gap-3 md:grid-cols-2' : 'grid gap-3'}>
        {item.levels.map((level) => {
          const checked = value === level.level;
          return (
            <label
              key={level.level}
              className={`flex cursor-pointer items-start gap-3 rounded-karte border bg-karte p-4 shadow-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primaer ${
                checked
                  ? 'border-primaer ring-1 ring-primaer'
                  : 'border-sekundaer/20 hover:border-sekundaer/50'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={level.level}
                checked={checked}
                onChange={() => onChange(level.level as Level)}
                className="mt-1 h-4 w-4 shrink-0 accent-primaer"
              />
              <span>
                <span className={`font-semibold ${checked ? 'text-primaer' : 'text-text'}`}>
                  Stufe {level.level}
                </span>
                <span className={`mt-1 block text-sekundaer ${large ? 'text-base' : 'text-sm'}`}>
                  {level.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
