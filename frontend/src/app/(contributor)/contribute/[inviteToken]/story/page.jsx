'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { validateContributorInvite } from '@/services/contributorService.js';
import ContributorShell from '@/components/contributor/shell/ContributorShell.jsx';
import ContributorButton from '@/components/contributor/shell/ContributorButton.jsx';
import { ContributorErrorState, ContributorLoadingState, ContributorPageHeader } from '@/components/contributor/shell/ContributorStates.jsx';

const MOCK_SUGGESTIONS = [
  'Our first time meeting',
  'A day I will never forget',
  'The kindness they always showed',
  'A memory that makes me smile',
  'What they taught me',
];

export default function StoryPage() {
  const router = useRouter();
  const { inviteToken } = useParams();
  const [invite, setInvite] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    validateContributorInvite(inviteToken).then((result) => {
      if (isMounted) {
        setInvite(result);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [inviteToken]);

  function handleSuggestion(suggestion) {
    setTitle(suggestion);
    setShowSuggestions(false);
  }

  async function handleContinue() {
    if (!title.trim() && !body.trim()) {
      setError('Please add a title or write something before continuing.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      router.push(`/contribute/${inviteToken}/upload`);
    } catch (err) {
      console.error('Story save failed:', err);
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  if (isLoading) return <ContributorLoadingState message="Loading story editor..." />;
  if (!invite || invite.status !== 'valid') {
    return (
      <ContributorErrorState
        title="This invitation is not available"
        body="Please return to your invitation link and try again."
        actionHref={`/contribute/${inviteToken}`}
      />
    );
  }

  return (
    <ContributorShell backHref={`/contribute/${inviteToken}/upload`} contentClassName="gap-10">
      <ContributorPageHeader
        title="Upload your memories"
        subtitle={`Type a story about ${invite.deceased.name}.`}
      />

      <div className="page-shell">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-h4 text-r-text">Story title</label>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-1.5 text-body-2 text-r-text transition-opacity hover:opacity-70"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2L12 16.4l-6.2 4.5 2.4-7.2L2 9.2h7.6z" />
              </svg>
              Need suggestions?
            </button>
          </div>

          {showSuggestions && (
            <div className="overflow-hidden rounded-xl border border-r-border bg-r-modal shadow-sm">
              {MOCK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestion(suggestion)}
                  className="w-full border-b border-r-card bg-transparent px-4 py-3 text-left text-body-2 text-r-text transition-colors last:border-b-0 hover:bg-r-card"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="Our first time meeting"
            className="w-full rounded-xl border border-r-border bg-transparent px-4 py-4 text-body-1 text-r-text focus:border-r-border-focus focus:outline-none"
          />

          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setError(''); }}
            placeholder="Write your memory here..."
            rows={12}
            className="w-full resize-none rounded-xl border border-r-border bg-transparent px-4 py-4 text-body-1 leading-relaxed text-r-text focus:border-r-border-focus focus:outline-none"
          />

          {error ? <p className="text-body-2 text-r-danger">{error}</p> : null}
        </div>

        <ContributorButton onClick={handleContinue} disabled={saving}>
          {saving ? 'Saving…' : 'Continue'}
        </ContributorButton>
      </div>
    </ContributorShell>
  );
}
