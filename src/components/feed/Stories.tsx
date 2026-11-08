"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import type { Story } from "@/lib/types";

const SLIDE_MS = 4300;

/* Точечные фиксы просмотрщика: зона тапов не перекрывает ✕, пауза работает
   на тач-устройствах (touch-action:none), драг = пауза + перемотка. */
const VIEWER_FIXES = `
  .viewer{touch-action:none;user-select:none;-webkit-user-select:none}
  .viewer button{touch-action:none}
  .vtap{top:64px}
  .vclose{z-index:5}
  .vbottom{z-index:5}
  .vbar i{transition:width .12s linear}
`;

export function StoriesRow({ stories, canCreate }: { stories: Story[]; canCreate: boolean }) {
  const { isSeen, markSeen } = useAppState();
  const router = useRouter();
  const toast = useToast();
  const [openAt, setOpenAt] = useState<number | null>(null);

  const open = (index: number) => {
    for (let i = 0; i < index; i++) markSeen(stories[i].id);
    setOpenAt(index);
  };

  return (
    <>
      <style>{VIEWER_FIXES}</style>
      <div className="stories">
        <button
          className="story"
          onClick={() => (canCreate ? router.push("/stories/new") : toast("Войди, чтобы добавить историю"))}
          aria-label="Добавить свою историю"
        >
          <span className="ownring">
            <Icon name="user" size={20} style={{ stroke: "var(--muted)", fill: "none", strokeWidth: 2 }} />
            <span className="splus">+</span>
          </span>
          <span className="sname">Моя история</span>
        </button>

        {stories.map((story, index) => (
          <button
            key={story.id}
            className={`story${isSeen(story.id) ? " seen" : ""}`}
            onClick={() => open(index)}
            aria-label={`Истории: ${story.name}`}
          >
            <span className="sring">
              <span className="sava" style={{ background: story.bg, color: story.fg }}>
                {story.mono}
              </span>
            </span>
            <span className="sname">{story.name}</span>
          </button>
        ))}
      </div>

      {openAt !== null ? (
        <StoryViewer stories={stories} start={openAt} onClose={() => setOpenAt(null)} />
      ) : null}
    </>
  );
}

function StoryViewer({
  stories,
  start,
  onClose,
}: {
  stories: Story[];
  start: number;
  onClose: () => void;
}) {
  const { markSeen } = useAppState();
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [storyIndex, setStoryIndex] = useState(start);
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reacted, setReacted] = useState<Record<string, boolean>>({});
  const [bubbles, setBubbles] = useState<{ id: number; symbol: string; right: number }[]>([]);
  const bubbleId = useRef(0);

  /* драг-управление: короткое касание = тап, удержание = пауза + перемотка */
  const drag = useRef({ active: false, startX: 0, startP: 0, timer: 0 as unknown as ReturnType<typeof setTimeout> });

  const story = stories[storyIndex];
  const slide = story.slides[slideIndex] ?? { title: story.name, text: "" };

  const stop = useCallback(() => {
    markSeen(story.id);
    onClose();
  }, [markSeen, onClose, story.id]);

  const goNext = useCallback(() => {
    markSeen(story.id);
    if (slideIndex + 1 < story.slides.length) {
      setSlideIndex(slideIndex + 1);
      setProgress(0);
      return;
    }
    if (storyIndex + 1 < stories.length) {
      setStoryIndex(storyIndex + 1);
      setSlideIndex(0);
      setProgress(0);
      return;
    }
    stop();
  }, [markSeen, slideIndex, story.id, story.slides.length, storyIndex, stories, stop]);

  const goPrev = useCallback(() => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
      setProgress(0);
      return;
    }
    if (storyIndex > 0) {
      const previous = stories[storyIndex - 1];
      setStoryIndex(storyIndex - 1);
      setSlideIndex(previous.slides.length - 1);
      setProgress(0);
    }
  }, [slideIndex, stories, storyIndex]);

  const nextRef = useRef(goNext);
  nextRef.current = goNext;
  const prevRef = useRef(goPrev);
  prevRef.current = goPrev;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setProgress((value) => Math.min(1, value + 40 / SLIDE_MS)), 40);
    return () => clearInterval(id);
  }, [paused, slideIndex, storyIndex]);

  useEffect(() => {
    if (progress >= 1) nextRef.current();
  }, [progress]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stop();
      if (event.key === "ArrowRight") nextRef.current();
      if (event.key === "ArrowLeft") prevRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [stop, goPrev]);

  const react = (symbol: string) => {
    setReacted((prev) => ({ ...prev, [story.id]: true }));
    const id = bubbleId.current++;
    setBubbles((prev) => [...prev, { id, symbol, right: 30 + Math.random() * 50 }]);
    setTimeout(() => setBubbles((prev) => prev.filter((bubble) => bubble.id !== id)), 1250);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".vbottom,.vclose")) return;
    setPaused(true);
    const rect = viewerRef.current?.getBoundingClientRect();
    drag.current = {
      active: false,
      startX: event.clientX,
      startP: progress,
      timer: setTimeout(() => {
        drag.current.active = true;
        try {
          (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
        } catch {}
      }, 180),
    };
    void rect;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const width = viewerRef.current?.clientWidth ?? 1;
    const p = Math.max(0, Math.min(1, drag.current.startP + (event.clientX - drag.current.startX) / width));
    setProgress(p);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    clearTimeout(drag.current.timer);
    const width = viewerRef.current?.clientWidth ?? 1;
    if (drag.current.active) {
      drag.current.active = false;
      const p = progress;
      if (p >= 0.98) {
        goNext();
      } else if (p <= 0.02) {
        if (slideIndex > 0) {
          setSlideIndex(slideIndex - 1);
          setProgress(0);
        } else if (storyIndex > 0) {
          const previous = stories[storyIndex - 1];
          setStoryIndex(storyIndex - 1);
          setSlideIndex(previous.slides.length - 1);
          setProgress(0);
        } else {
          setProgress(0);
          setPaused(false);
        }
      } else {
        setPaused(false);
      }
      return;
    }
    setPaused(false);
    const rect = viewerRef.current?.getBoundingClientRect();
    const x = event.clientX - (rect?.left ?? 0);
    if (x > (rect?.width ?? 0) / 2) nextRef.current();
    else prevRef.current();
  };

  const onPointerCancel = () => {
    clearTimeout(drag.current.timer);
    drag.current.active = false;
    setPaused(false);
  };

  return (
    <div
      ref={viewerRef}
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`Истории: ${story.name}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="vbars">
        {story.slides.map((_, index) => (
          <div key={index} className="vbar">
            <i
              style={{
                width: index < slideIndex ? "100%" : index === slideIndex ? `${progress * 100}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <div className="vbrand">
        <span className="mini" style={{ background: story.bg, color: story.fg }}>
          {story.mono}
        </span>
        <span>{story.name}</span>
      </div>

      <button className="vclose" onClick={stop} aria-label="Закрыть истории">
        ✕
      </button>

      <div className="vslide" style={{ background: `linear-gradient(160deg, ${story.fg}, ${story.bg})` }}>
        <div className="vtag">{story.name}</div>
        <div className="vt">{slide.title}</div>
        <div className="vs">{slide.text}</div>
      </div>

      <div className="vtap l" aria-hidden="true" />
      <div className="vtap r" aria-hidden="true" />

      <div className="vbottom">
        <button
          className={`vreact${reacted[story.id] ? " on" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            react("❤️");
          }}
          aria-label="Нравится"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 21C7 16.5 3 13.3 3 9.2 3 6.4 5.2 4 8 4c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.8 0 5 2.4 5 5.2 0 4.1-4 7.3-9 11.8z" />
          </svg>
        </button>
        {["🔥", "😂", "😍"].map((emoji) => (
          <button
            key={emoji}
            className="vemoji"
            onClick={(event) => {
              event.stopPropagation();
              react(emoji);
            }}
            aria-label={`Реакция ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {bubbles.map((bubble) => (
        <span key={bubble.id} className="bubble" style={{ right: bubble.right }}>
          {bubble.symbol}
        </span>
      ))}
    </div>
  );
}
