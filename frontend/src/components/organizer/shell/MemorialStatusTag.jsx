const STATUS_COPY = {
  collecting: "Collecting memories",
  generating: "Generating memorial",
  complete: "Memorial published",
  published: "Memorial published",
};

const STATUS_STYLES = {
  collecting: "bg-[#C9DCE4] text-r-text",
  generating: "bg-[#C9DCE4] text-r-text",
  complete: "bg-[#DDE2CF] text-r-text",
  published: "bg-[#DDE2CF] text-r-text",
  default: "bg-[#B7C19A] text-r-text",
};

export function formatMemorialStatusLabel(status) {
  if (!status) return "Status tag";
  const normalized = String(status).toLowerCase();
  return STATUS_COPY[normalized] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

export default function MemorialStatusTag({ status, className = "" }) {
  const normalized = String(status || "").toLowerCase();
  const styles = STATUS_STYLES[normalized] ?? STATUS_STYLES.default;

  return (
    <span
      className={`inline-flex h-10 min-w-[166px] items-center justify-center rounded-[14px] px-4 text-caption ${styles} ${className}`}
    >
      {formatMemorialStatusLabel(status)}
    </span>
  );
}
