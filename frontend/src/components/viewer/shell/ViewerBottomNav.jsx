export const VIEWER_TABS = ["Slideshow", "Themes", "Relationships", "Voices", "Photo Archive"];

export default function ViewerBottomNav({ active, onChange, tabs = VIEWER_TABS }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-r-border bg-r-bg px-4 py-2 sm:px-[50px]"
      role="tablist"
      aria-label="Memorial sections"
    >
      <div className="mx-auto grid max-w-[1340px] gap-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => {
          const isActive = active === tab;
          const shortLabel = tab === "Photo Archive" ? "Photos" : tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab)}
              className={`rounded-lg px-1 py-3 text-center text-caption transition sm:text-body-2 ${
                isActive
                  ? "font-medium text-r-text underline decoration-r-text decoration-2 underline-offset-8"
                  : "text-r-muted hover:text-r-secondary"
              }`}
            >
              {shortLabel}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
