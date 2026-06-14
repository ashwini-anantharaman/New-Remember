export default function ContributorButton({
  children,
  type = "button",
  href,
  disabled = false,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "flex h-[62px] w-full max-w-[434px] items-center justify-center rounded-full px-10 text-body font-[family-name:var(--font-switzer)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-r-border-focus disabled:cursor-not-allowed disabled:opacity-60";

  const styles =
    variant === "secondary"
      ? "border border-r-muted bg-transparent text-r-text hover:bg-r-card"
      : "bg-r-btn text-r-text hover:opacity-90";

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
