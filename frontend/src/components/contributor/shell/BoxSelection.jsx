export default function BoxSelection({
  title,
  description,
  selected = false,
  onSelect,
  compact = false,
  className = "",
  children,
}) {
  const Component = onSelect ? "button" : "div";

  return (
    <Component
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      className={`flex w-full flex-col items-center justify-center rounded-[20px] border text-center transition ${
        compact ? "min-h-[115px] px-6 py-6" : "min-h-[280px] px-6 py-10"
      } ${
        selected
          ? "border-r-text bg-r-modal shadow-sm"
          : "border-r-muted bg-transparent hover:border-r-border-focus"
      } ${className}`}
    >
      {children}
      {title ? (
        <p className="font-[family-name:var(--font-boska)] text-2xl font-medium text-r-text">{title}</p>
      ) : null}
      {description ? (
        <p className="mt-3 max-w-[434px] text-body text-r-secondary">{description}</p>
      ) : null}
    </Component>
  );
}
