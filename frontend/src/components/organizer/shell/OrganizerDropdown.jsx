export default function OrganizerDropdown({
  value,
  onChange,
  options,
  className = "",
  ariaLabel,
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className="h-[63px] w-full cursor-pointer appearance-none rounded-[13px] border border-r-muted bg-white px-4 pr-10 text-body-2 text-r-text outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-r-text"
        aria-hidden="true"
      >
        ▾
      </span>
    </div>
  );
}
