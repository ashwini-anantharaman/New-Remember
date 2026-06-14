import OrganizerNav from "./OrganizerNav.jsx";

export default function OrganizerShell({
  children,
  backHref,
  onBack,
  className = "",
  contentClassName = "",
  showNav = true,
}) {
  return (
    <main className={`min-h-screen bg-r-bg px-6 py-10 text-r-text sm:px-[50px] sm:py-[50px] ${className}`}>
      <div className={`mx-auto flex w-full max-w-[1340px] flex-col gap-[100px] ${contentClassName}`}>
        {showNav ? <OrganizerNav backHref={backHref} onBack={onBack} /> : null}
        {children}
      </div>
    </main>
  );
}
