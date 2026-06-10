interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-sekundaer/20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={`rounded-t px-4 py-2 text-base font-medium ${
            tab.id === active
              ? 'border-b-2 border-primaer text-primaer'
              : 'text-sekundaer hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
