'use client';

// frontend/src/app/(viewer)/memorial/[id]/output/page.jsx

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getMemorialOutput, getMemorialById, createInviteLink, createShareLink, getAuthToken } from '@/lib/api';
import { copyTextToClipboard, normalizeShareUrl } from '@/lib/copyToClipboard';
import { getMemorialContributors } from '@/services/contributorService';
import { mockMemorials } from '@/data/mockMemorials.js';
import ViewerNav from "@/components/viewer/shell/ViewerNav";
import ViewerBottomNav from "@/components/viewer/shell/ViewerBottomNav";
import ViewerMemorialExperience from "@/components/viewer/ViewerMemorialExperience";

function ShareModal({ onClose, memorialId }) {
  const [contributorUrl, setContributorUrl] = useState('');
  const [viewerUrl, setViewerUrl] = useState('');
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
      setContributorUrl('');
      setViewerUrl('');
      try {
        const invite = await createInviteLink(memorialId);
        if (cancelled) return;
        setContributorUrl(normalizeShareUrl(invite?.invite_link?.url ?? ''));

        try {
          const share = await createShareLink(memorialId);
          if (!cancelled) {
            setViewerUrl(normalizeShareUrl(share?.share_link?.url ?? ''));
          }
        } catch (shareErr) {
          console.warn('Viewer share link unavailable:', shareErr);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Could not load share links.';
          if (message.toLowerCase().includes('not authorized') || message.toLowerCase().includes('do not own')) {
            setLinksError(
              'This memorial is not linked to your account. Go to Dashboard, open a memorial you created, then try Share again.',
            );
          } else if (message.toLowerCase().includes('logged in')) {
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
    return () => { cancelled = true; };
  }, [memorialId]);

  async function copyLink(type) {
    setCopyError(null);
    const url = type === 'contributor' ? contributorUrl : viewerUrl;
    if (!url) {
      setCopyError('Link is not ready yet.');
      return;
    }
    try {
      await copyTextToClipboard(url);
      if (type === 'contributor') {
        setCopiedContributor(true);
        setTimeout(() => setCopiedContributor(false), 2000);
      } else {
        setCopiedViewer(true);
        setTimeout(() => setCopiedViewer(false), 2000);
      }
    } catch {
      setCopyError('Copy failed. Select the link below and copy manually.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-6" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-8 bg-r-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-8">
          <button type="button" onClick={onClose} className="text-r-text">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-h2 text-r-text">Share</h2>
        </div>
        {linksError ? <p className="text-body-2 text-red-600 mb-4">{linksError}</p> : null}
        {copyError ? <p className="text-body-2 text-red-600 mb-4">{copyError}</p> : null}
        {[
          { label: 'Invite Contributors', sub: 'For friends and family to share their memories:', type: 'contributor', copied: copiedContributor, url: contributorUrl },
          { label: 'Invite Viewers', sub: 'For anyone to view this memorial:', type: 'viewer', copied: copiedViewer, url: viewerUrl },
        ].map(({ label, sub, type, copied, url }) => (
          <div key={type} className="flex items-start justify-between mb-6">
            <div className="min-w-0 pr-4">
              <p className="text-h3 text-r-text">{label}</p>
              <p className="text-body-2 text-r-secondary mt-0.5">{sub}</p>
              {url ? <p className="text-caption text-r-secondary mt-2 break-all">{url}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => copyLink(type)}
              disabled={linksLoading || !url}
              className="shrink-0 rounded-full px-4 py-2 text-h4 transition-all ml-5 border-none disabled:opacity-50"
              style={{ backgroundColor: copied ? '#7D8C6A' : 'var(--color-r-btn)', color: copied ? '#FBF9F6' : 'var(--color-r-btn-text)' }}
            >
              {copied ? 'Copied!' : linksLoading ? 'Loading…' : 'Copy Link'}
            </button>
          </div>
        ))}
        <div className="flex justify-center gap-6 mt-8">
          {['Message', 'Email', 'Instagram'].map((label) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="w-14 h-12 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-r-shape">
                <span className="text-caption font-medium text-white">{label[0]}</span>
              </div>
              <span className="text-caption text-r-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutputError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fef2f2' }}>
        <svg width="24" height="24" fill="none" stroke="var(--color-r-danger)" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-body-2 font-medium text-r-text">Unable to load memorial</p>
      <p className="mt-1 max-w-xs text-body-2 text-r-muted">Something went wrong. Please try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-full px-6 py-2.5 text-h4 font-medium transition-opacity hover:opacity-80 border-none"
        style={{ backgroundColor: 'var(--color-r-text)', color: '#FBF9F6' }}
      >
        Try again
      </button>
    </div>
  );
}

export default function MemorialOutputPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Slideshow');
  const [output, setOutput] = useState(null);
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    if (!id) return;
    async function loadContributors() {
      try {
        const token = await getAuthToken();
        const result = await getMemorialContributors(id, token);
        setContributors(result.contributors || []);
      } catch {
        // Non-blocking for viewer preview
      }
    }
    loadContributors();
  }, [id]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, memorialData] = await Promise.all([
        getMemorialOutput(id),
        getMemorialById(id).catch(() => null),
      ]);
      setOutput(data);
      const header = memorialData || mockMemorials.find((m) => m.id === id) || mockMemorials[0];
      setMemorial({
        id: header.id || id,
        subject_name: header.subject_name || header.deceased_name,
        cover_photo_url: header.cover_photo_url || header.profile_photo_url || null,
        date_of_birth: header.date_of_birth || header.birth_date || null,
        date_of_passing: header.date_of_passing || header.death_date || null,
        bio: header.brief_biography || header.short_description || header.biography || null,
      });
    } catch (err) {
      setError(err.message || "Failed to load memorial");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (!id) return; load(); }, [id, load]);

  return (
    <div className="min-h-screen w-full pb-24 bg-r-bg">
      <header className="px-6 py-10 sm:px-[50px]">
        <ViewerNav backHref="/dashboard" onShare={() => setShowShare(true)} />
      </header>

      <main className="px-6 pb-8 sm:px-[50px]">
        <div className="mx-auto max-w-[1340px]">
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--color-r-border)', borderTopColor: 'var(--color-r-text)' }} />
            </div>
          ) : error ? (
            <OutputError onRetry={load} />
          ) : (
            <ViewerMemorialExperience
              activeTab={activeTab}
              output={output}
              memorial={memorial}
              contributors={contributors}
            />
          )}
        </div>
      </main>

      <ViewerBottomNav active={activeTab} onChange={setActiveTab} />
      {showShare ? <ShareModal onClose={() => setShowShare(false)} memorialId={id} /> : null}
    </div>
  );
}
