interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="inline-flex gap-1 rounded-full bg-primaer/10 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-1.5 text-base font-medium transition-colors ${
            tab.id === active
              ? 'bg-primaer text-white shadow-schwebend'
              : 'text-sekundaer hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
