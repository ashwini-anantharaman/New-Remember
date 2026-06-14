export function TabLoading() {
  return (
    <div className="flex justify-center py-16">
      <div
        className="size-8 animate-spin rounded-full border-2 border-r-border"
        style={{ borderTopColor: "var(--color-r-text)" }}
      />
    </div>
  );
}

export function TabEmpty({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-r-card" />
      <p className="font-[family-name:var(--font-boska)] text-body text-r-text">{title}</p>
      <p className="mt-1 max-w-xs text-body-2 text-r-secondary">{message}</p>
    </div>
  );
}

export function TabError({ title, message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-[family-name:var(--font-boska)] text-body text-r-text">{title}</p>
      <p className="mt-1 max-w-xs text-body-2 text-r-secondary">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-r-btn px-6 py-2.5 text-body-2 text-r-btn-text"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function PreGenerationEmpty({
  canGenerate,
  disabledMessage,
  generationError,
  generating,
  onGenerate,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-[family-name:var(--font-boska)] text-body text-r-text">Generation hasn&apos;t run yet</p>
      <p className="mt-1 max-w-sm text-body-2 text-r-secondary">
        Once you have contributions, click Generate to create the Story, Constellation, Voices, and Photos.
      </p>
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || generating}
        className="mt-6 h-[62px] w-full max-w-[207px] rounded-full bg-r-btn px-6 text-body text-r-btn-text transition hover:opacity-90 disabled:opacity-50"
      >
        {generating ? "Generating..." : "Generate"}
      </button>
      {!generating && disabledMessage ? (
        <p className="mt-3 max-w-xs text-caption text-r-secondary">{disabledMessage}</p>
      ) : null}
      {generationError ? (
        <p className="mt-3 max-w-xs text-body-2 text-r-danger" role="alert">
          {generationError}
        </p>
      ) : null}
    </div>
  );
}
