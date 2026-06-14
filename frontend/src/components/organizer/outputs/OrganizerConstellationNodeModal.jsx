"use client";

function ThemeDetail({ node, onClose }) {
  return (
    <div className="relative w-full max-w-3xl overflow-hidden rounded-[10px] border border-r-muted bg-white shadow-2xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 text-2xl leading-none text-r-text hover:opacity-70"
        aria-label="Close"
      >
        ×
      </button>

      <div className="border-b border-r-muted px-8 py-6">
        <h2 className="font-[family-name:var(--font-boska)] text-h2 text-r-text">{node.label}</h2>
        {node.category ? (
          <p className="mt-1 text-body-2 capitalize text-r-secondary">{node.category}</p>
        ) : null}
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-8 py-6">
        {node.summary ? (
          <p className="text-body leading-7 text-r-text">{node.summary}</p>
        ) : null}

        {node.discoveryAngle ? (
          <p className="mt-4 text-body-2 italic text-r-secondary">{node.discoveryAngle}</p>
        ) : null}

        {node.quotes?.length ? (
          <div className="mt-6 space-y-4">
            {node.quotes.map((quote, index) => (
              <blockquote
                key={index}
                className="border-l-2 border-r-muted pl-4 font-[family-name:var(--font-boska)] text-body italic text-r-text"
              >
                {quote.text}
                {quote.contributor_name ? (
                  <footer className="mt-2 text-caption not-italic text-r-secondary">
                    — {quote.contributor_name}
                  </footer>
                ) : null}
              </blockquote>
            ))}
          </div>
        ) : null}

        {node.photo_urls?.length ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {node.photo_urls.slice(0, 6).map((photoUrl, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-[10px] bg-r-btn">
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ContributorRelationshipSection({ member, fillColor }) {
  return (
    <article className="border-t border-r-muted pt-8 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-5">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full text-2xl font-[family-name:var(--font-boska)] text-white"
          style={{ backgroundColor: fillColor || "#B7C19A" }}
        >
          {(member.name || "?").charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-[family-name:var(--font-boska)] text-h3 text-r-text">{member.name}</h3>
          <p className="mt-1 text-body-2 capitalize text-r-secondary">{member.relationshipLabel}</p>

          {member.extractedQuote ? (
            <blockquote className="mt-4 font-[family-name:var(--font-boska)] text-h3 italic leading-8 text-r-text">
              &ldquo;{member.extractedQuote}&rdquo;
            </blockquote>
          ) : null}

          {member.summary ? (
            <p className="mt-4 text-body leading-7 text-r-text">{member.summary}</p>
          ) : null}

          {!member.extractedQuote && !member.summary ? (
            <p className="mt-4 text-body-2 text-r-secondary">
              No questionnaire responses from {member.name} yet.
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function RelationshipDetail({ node, onClose }) {
  const members = node.members || [];
  const hasMemberContent = members.some((member) => member.extractedQuote || member.summary);
  const hasTypeContent = node.extractedQuote || node.summary;

  return (
    <div className="relative w-full max-w-3xl overflow-hidden rounded-[10px] border border-r-muted bg-r-card shadow-2xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 text-2xl leading-none text-r-text hover:opacity-70"
        aria-label="Close"
      >
        ×
      </button>

      <div className="flex max-h-[85vh] flex-col gap-8 overflow-y-auto p-8 sm:flex-row sm:items-start sm:p-10">
        <div className="flex shrink-0 justify-center sm:justify-start">
          <div
            className="flex size-36 items-center justify-center rounded-full text-5xl font-[family-name:var(--font-boska)] text-white shadow-md"
            style={{ backgroundColor: node.fillColor || "#B7C19A" }}
          >
            {(node.label || "?").charAt(0)}
          </div>
        </div>

        <div className="min-w-0 flex-1 pt-2">
          <h2 className="font-[family-name:var(--font-boska)] text-h2 text-r-text">{node.label}</h2>
          <p className="mt-1 text-body-2 text-r-secondary">
            {node.count} contributor{node.count === 1 ? "" : "s"}
          </p>

          {members.length ? (
            <div className="mt-6 space-y-0">
              {members.map((member) => (
                <ContributorRelationshipSection
                  key={member.id}
                  member={member}
                  fillColor={node.fillColor}
                />
              ))}
            </div>
          ) : hasTypeContent ? (
            <>
              {node.extractedQuote ? (
                <blockquote className="mt-5 font-[family-name:var(--font-boska)] text-h3 italic leading-8 text-r-text">
                  &ldquo;{node.extractedQuote}&rdquo;
                </blockquote>
              ) : null}
              {node.summary ? (
                <p className="mt-5 text-body leading-7 text-r-text">{node.summary}</p>
              ) : null}
            </>
          ) : (
            <p className="mt-5 text-body-2 text-r-secondary">
              No questionnaire memories for {node.label?.toLowerCase()} relationships yet.
            </p>
          )}

          {!hasMemberContent && !hasTypeContent && members.length ? (
            <p className="mt-5 text-body-2 text-r-secondary">
              Contributors are listed, but no questionnaire responses were found. Re-generate after contributors submit their answers.
            </p>
          ) : null}

          <div className="mt-8">
            <span className="inline-flex rounded-full border border-r-muted bg-white px-5 py-2 text-body-2 text-r-text">
              {node.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerConstellationNodeModal({ node, mode, onClose }) {
  if (!node) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        {mode === "relationships" ? (
          <RelationshipDetail node={node} onClose={onClose} />
        ) : (
          <ThemeDetail node={node} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
