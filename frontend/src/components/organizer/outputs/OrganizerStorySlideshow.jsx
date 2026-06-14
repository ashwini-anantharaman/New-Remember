"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeOrganizerStorySlides } from "@/lib/organizer/storySlides";

function EmptyStoryState() {
  return (
    <div className="flex min-h-[680px] items-center justify-center rounded-[10px] border border-r-muted bg-white text-body-2 text-r-secondary lg:min-h-[720px]">
      No story slides are available yet.
    </div>
  );
}

export default function OrganizerStorySlideshow({ output, story }) {
  const slides = useMemo(() => normalizeOrganizerStorySlides(output, story), [output, story]);
  const [index, setIndex] = useState(0);
  const currentIndex = slides.length ? Math.min(index, slides.length - 1) : 0;
  const slide = slides[currentIndex];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowLeft" && currentIndex > 0) setIndex(currentIndex - 1);
      if (event.key === "ArrowRight" && currentIndex < slides.length - 1) setIndex(currentIndex + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, slides.length]);

  if (!slides.length) return <EmptyStoryState />;

  return (
    <section className="w-full" aria-label="Organizer story slideshow">
      <div className="relative min-h-[680px] overflow-hidden rounded-[10px] border border-r-muted bg-[#ddd8cf] lg:min-h-[720px]">
        {slide.photoUrl ? (
          <img
            src={slide.photoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-r-card" />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(89, 118, 60, 0.88) 0%, rgba(89, 118, 60, 0.35) 38%, rgba(89, 118, 60, 0.05) 72%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => setIndex(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
          aria-label="Previous story slide"
          className="absolute left-5 top-1/2 z-20 flex size-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white transition hover:bg-white/30 disabled:opacity-30"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          type="button"
          onClick={() => setIndex(Math.min(currentIndex + 1, slides.length - 1))}
          disabled={currentIndex === slides.length - 1}
          aria-label="Next story slide"
          className="absolute right-5 top-1/2 z-20 flex size-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white transition hover:bg-white/30 disabled:opacity-30"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-8 pt-24 text-white">
          {slide.caption ? (
            <p className="max-w-3xl text-body italic leading-relaxed text-white/95">{slide.caption}</p>
          ) : null}
          <p className="mt-4 font-[family-name:var(--font-boska)] text-h3 text-white">{slide.title}</p>
          <p className="mt-2 text-body-2 text-white/85">{slide.submittedLabel}</p>
          <span className="mt-4 inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-caption text-white">
            {slide.aiTag}
          </span>
        </div>
      </div>
    </section>
  );
}
