export default function OrganizerButton({
  children,
  type = "button",
  href,
  disabled = false,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "flex h-[62px] items-center justify-center rounded-full px-8 text-body font-[family-name:var(--font-switzer)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-r-border-focus disabled:cursor-not-allowed disabled:opacity-60";

  const styles =
    variant === "secondary"
      ? "border border-r-muted bg-transparent text-r-text hover:bg-r-card"
      : variant === "compact"
        ? "h-[50px] px-6 text-body-2 bg-r-btn text-r-btn-text hover:opacity-90"
        : "w-full max-w-[434px] bg-r-btn text-r-btn-text hover:opacity-90";

  const classes = `${base} ${styles} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...props}>
      {children}
    </button>
  );
}
