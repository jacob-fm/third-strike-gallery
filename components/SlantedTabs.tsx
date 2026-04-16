"use client";

interface Tab<T extends string> {
  value: T;
  label: string;
}

interface SlantedTabsProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

function SlantedTab<T extends string>({
  tab,
  isActive,
  onTabChange,
}: {
  tab: Tab<T>;
  isActive: boolean;
  onTabChange: (tab: T) => void;
}) {
  return (
    <button
      onClick={() => onTabChange(tab.value)}
      className={`-skew-x-12 font-orbitron flex items-center px-8 border-t-2 -mr-3 cursor-pointer
        ${
          isActive
            ? "h-13 bg-accent border-accent-hover z-10"
            : "h-11 bg-surface border-border z-0 hover:brightness-125"
        }`}
    >
      <span
        className={`skew-x-12 text-sm font-bold tracking-widest uppercase
          ${isActive ? "text-white" : "text-text-secondary"}`}
      >
        {tab.label}
      </span>
    </button>
  );
}

export default function SlantedTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: SlantedTabsProps<T>) {
  return (
    <div className="flex items-end">
      {tabs.map((tab) => (
        <SlantedTab
          key={tab.value}
          tab={tab}
          isActive={tab.value === activeTab}
          onTabChange={onTabChange}
        />
      ))}
    </div>
  );
}
