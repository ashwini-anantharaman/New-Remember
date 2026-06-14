"use client";

import { useEffect, useRef, useState } from "react";

function WaveformPlayer({ audioUrl, color }) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    import("wavesurfer.js").then((WaveSurfer) => {
      if (!mounted) return;
      if (wavesurferRef.current) wavesurferRef.current.destroy();
      const ws = WaveSurfer.default.create({
        container: containerRef.current,
        waveColor: color || "var(--color-r-colleague)",
        progressColor: "var(--color-r-text)",
        cursorColor: "transparent",
        barWidth: 3,
        barGap: 2,
        barRadius: 3,
        height: 48,
        normalize: true,
        interact: true,
        backend: "WebAudio",
      });
      if (audioUrl) {
        ws.load(audioUrl);
        ws.on("ready", () => {
          setReady(true);
          setDuration(ws.getDuration());
        });
        ws.on("timeupdate", (time) => setCurrentTime(time));
        ws.on("finish", () => setPlaying(false));
      } else {
        setReady(false);
      }
      wavesurferRef.current = ws;
    }).catch(() => {
      if (mounted) setReady(false);
    });

    return () => {
      mounted = false;
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, color]);

  function togglePlay() {
    if (!wavesurferRef.current || !ready) return;
    wavesurferRef.current.playPause();
    setPlaying(!playing);
  }

  function formatTime(secs) {
    if (!secs || Number.isNaN(secs)) return "0:00";
    return `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        style={{ backgroundColor: "var(--color-r-colleague)" }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1">
        {audioUrl ? (
          <div ref={containerRef} className="w-full" />
        ) : (
          <div className="flex h-12 items-center gap-0.5">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full transition-all"
                style={{
                  backgroundColor: "var(--color-r-colleague)",
                  opacity: playing ? 0.8 : 0.4,
                  height: `${16 + Math.sin(i * 0.6) * 12 + Math.cos(i * 1.2) * 8}px`,
                }}
              />
            ))}
          </div>
        )}
        {(ready || audioUrl) && (
          <div className="flex justify-between text-caption text-r-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViewerVoicesSection({ voices }) {
  const [selected, setSelected] = useState(0);
  const current = voices?.[selected];

  if (!voices || voices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-body-2 font-medium text-r-text">No voice recordings were submitted for this memorial</p>
        <p className="mt-1 text-body-2 text-r-muted">Voice recordings will appear here once contributors have submitted.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pt-2">
      <h2 className="mb-6 text-h1 text-r-text">Voices</h2>
      <div className="flex gap-8">
        <div className="flex w-48 shrink-0 flex-col gap-0">
          <div className="mb-4 flex items-center gap-2">
            <select
              className="cursor-pointer appearance-none rounded-lg bg-transparent px-3 py-1.5 pr-8 text-caption text-r-text focus:outline-none"
              style={{ border: "1px solid var(--color-r-border)" }}
              defaultValue="sort"
            >
              <option value="sort">Sort</option>
              <option value="date">By date</option>
              <option value="name">By name</option>
            </select>
          </div>
          {voices.map((voice, index) => (
            <button
              key={voice.id || index}
              type="button"
              onClick={() => setSelected(index)}
              className="py-3 text-left text-h4 transition-colors"
              style={{
                fontWeight: index === selected ? 500 : 400,
                color: index === selected ? "var(--color-r-text)" : "var(--color-r-muted)",
                borderBottom: `1px solid ${index === selected ? "var(--color-r-text)" : "var(--color-r-border)"}`,
              }}
            >
              {voice.contributor_title || voice.title || `Recording ${index + 1}`}
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4">
          {current?.photo_url ? (
            <img src={current.photo_url} alt="" className="aspect-video w-full rounded-2xl object-cover" />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-r-card">
              <span className="text-body-2 text-r-muted">No photo linked</span>
            </div>
          )}
          {current ? (
            <WaveformPlayer key={current.id} audioUrl={current.audio_url || null} color="var(--color-r-colleague)" />
          ) : null}
          {current?.transcript_text ? (
            <p className="text-body-2 text-r-muted" style={{ fontStyle: "italic", lineHeight: 1.6 }}>
              &quot;{current.transcript_text}&quot;
            </p>
          ) : null}
          {current?.ai_category ? (
            <span
              className="inline-block self-start rounded-full px-4 py-1.5 text-body-2 text-r-muted"
              style={{ border: "1px solid var(--color-r-border)" }}
            >
              {current.ai_category}
            </span>
          ) : null}
          {current ? (
            <p className="text-body-2 font-medium text-r-text">
              Submitted by {current.contributor_name || "Contributor"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
