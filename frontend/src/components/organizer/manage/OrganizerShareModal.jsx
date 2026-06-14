"use client";

import { useEffect, useState } from "react";
import { createInviteLink, createShareLink } from "@/lib/api";
import { copyTextToClipboard, normalizeShareUrl } from "@/lib/copyToClipboard";

export default function OrganizerShareModal({ onClose, memorialId }) {
  const [contributorUrl, setContributorUrl] = useState("");
  const [viewerUrl, setViewerUrl] = useState("");
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState(null);
  const [copyError, setCopyError] = useState(null);
  const [copiedContributor, setCopiedContributor] = useState(false);
  const [copiedViewer, setCopiedViewer] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadShareLinks() {
      setLinksLoading(true);
      setLinksError(null);
      setContributorUrl("");
      setViewerUrl("");
      try {
        const invite = await createInviteLink(memorialId);
        if (cancelled) return;
        setContributorUrl(normalizeShareUrl(invite?.invite_link?.url ?? ""));

        try {
          const share = await createShareLink(memorialId);
          if (!cancelled) {
            setViewerUrl(normalizeShareUrl(share?.share_link?.url ?? ""));
          }
        } catch (shareErr) {
          console.warn("Viewer share link unavailable:", shareErr);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Could not load share links.";
          if (message.toLowerCase().includes("not authorized") || message.toLowerCase().includes("do not own")) {
            setLinksError(
              "This memorial is not linked to your account. Go to Dashboard, open a memorial you created, then try Share again.",
            );
          } else if (message.toLowerCase().includes("logged in")) {
            setLinksError(`${message} Sign in and try again.`);
          } else {
            setLinksError(`${message} Close and try again.`);
          }
        }
      } finally {
        if (!cancelled) setLinksLoading(false);
      }
    }

    loadShareLinks();
    return () => {
      cancelled = true;
    };
  }, [memorialId]);

  async function copyLink(type) {
    setCopyError(null);
    const url = type === "contributor" ? contributorUrl : viewerUrl;
    if (!url) {
      setCopyError("Link is not ready yet.");
      return;
    }
    try {
      await copyTextToClipboard(url);
      if (type === "contributor") {
        setCopiedContributor(true);
        setTimeout(() => setCopiedContributor(false), 2000);
      } else {
        setCopiedViewer(true);
        setTimeout(() => setCopiedViewer(false), 2000);
      }
    } catch {
      setCopyError("Copy failed. Select the link below and copy manually.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-6" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-r-modal p-8" onClick={(event) => event.stopPropagation()}>
        <div className="mb-8 flex items-center gap-3">
          <button type="button" onClick={onClose} className="text-r-text">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-h2 text-r-text">Share</h2>
        </div>
        {linksError ? <p className="mb-4 text-body-2 text-red-600">{linksError}</p> : null}
        {copyError ? <p className="mb-4 text-body-2 text-red-600">{copyError}</p> : null}
        {[
          { label: "Invite Contributors", sub: "For friends and family to share their memories:", type: "contributor", copied: copiedContributor, url: contributorUrl },
          { label: "Invite Viewers", sub: "For anyone to view this memorial:", type: "viewer", copied: copiedViewer, url: viewerUrl },
        ].map(({ label, sub, type, copied, url }) => (
          <div key={type} className="mb-6 flex items-start justify-between">
            <div className="min-w-0 pr-4">
              <p className="text-h3 text-r-text">{label}</p>
              <p className="mt-0.5 text-body-2 text-r-secondary">{sub}</p>
              {url ? <p className="mt-2 break-all text-caption text-r-secondary">{url}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => copyLink(type)}
              disabled={linksLoading || !url}
              className="ml-5 shrink-0 rounded-full border-none px-4 py-2 text-h4 transition-all disabled:opacity-50"
              style={{ backgroundColor: copied ? "#7D8C6A" : "var(--color-r-btn)", color: copied ? "#FBF9F6" : "var(--color-r-btn-text)" }}
            >
              {copied ? "Copied!" : linksLoading ? "Loading…" : "Copy Link"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
