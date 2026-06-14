export default function ViewerButton({ children, onClick, href, className = "", ...props }) {
  const classes = `flex h-[62px] w-full max-w-[434px] items-center justify-center rounded-full bg-r-btn px-10 text-body text-r-btn-text transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-r-border-focus ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}
