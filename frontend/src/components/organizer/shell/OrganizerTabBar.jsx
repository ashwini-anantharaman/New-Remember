export default function OrganizerTabBar({ tabs, active, onChange }) {
  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3" role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`h-10 border-b text-center text-h3 transition ${
              isActive
                ? "border-b-2 border-r-text font-bold text-r-text"
                : "border-r-text/80 font-medium text-r-text hover:text-r-secondary"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
