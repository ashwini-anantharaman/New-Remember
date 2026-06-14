export default function OrganizerPageHeader({ title, subtitle, icon }) {
  return (
    <header className="flex w-full max-w-[434px] flex-col items-center gap-5 text-center">
      {icon ?? (
        <div className="size-[100px] shrink-0 rounded-full bg-r-shape" aria-hidden="true" />
      )}
      <h1 className="font-[family-name:var(--font-boska)] text-h1 font-bold text-r-text">{title}</h1>
      {subtitle ? <p className="text-body text-r-secondary">{subtitle}</p> : null}
    </header>
  );
}
