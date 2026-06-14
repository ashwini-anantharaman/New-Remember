export function ContributorLoadingState({ message = "Opening your invitation..." }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-r-bg px-6 py-10 text-r-text sm:px-[50px]">
      <section className="flex flex-col items-center gap-4 text-center" aria-live="polite">
        <div
          className="size-12 rounded-full border-2 border-r-border"
          style={{ borderTopColor: "var(--color-r-text)" }}
        />
        <p className="text-body-2 text-r-secondary">{message}</p>
      </section>
    </main>
  );
}

export function ContributorErrorState({ title, body, actionHref, actionLabel = "Return to invitation" }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-r-bg px-6 py-10 text-r-text sm:px-[50px]">
      <section className="flex w-full max-w-[560px] flex-col items-center gap-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-r-card font-[family-name:var(--font-boska)] text-2xl text-r-muted">
          R
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-[family-name:var(--font-boska)] text-h1 text-r-text">{title}</h1>
          <p className="text-body text-r-secondary">{body}</p>
        </div>
        {actionHref ? (
          <a
            href={actionHref}
            className="mt-2 flex h-[52px] items-center justify-center rounded-full bg-r-btn px-8 text-body-2 text-r-text transition hover:opacity-90"
          >
            {actionLabel}
          </a>
        ) : null}
      </section>
    </main>
  );
}

export function ContributorPageHeader({ title, subtitle, align = "center" }) {
  return (
    <header className={`flex flex-col gap-5 ${align === "center" ? "items-center text-center" : "text-left"}`}>
      <h1 className="max-w-[886px] font-[family-name:var(--font-boska)] text-h1 font-bold text-r-text">{title}</h1>
      {subtitle ? <p className="max-w-[886px] text-body text-r-secondary">{subtitle}</p> : null}
    </header>
  );
}
