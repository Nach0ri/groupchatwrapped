"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pause, Play } from "lucide-react";

interface CardDeckProps {
  cards: React.ReactNode[];
}

const AUTO_ADVANCE_MS = 4000;
const TAP_THRESHOLD_MS = 220;

export function CardDeck({ cards }: CardDeckProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoplay, setAutoplay] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const advanceTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const advanceStartRef = useRef<number>(0);
  const pressedAtRef = useRef<number | null>(null);
  const pressedZoneRef = useRef<"left" | "right" | null>(null);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= cards.length - 1) return i;
      setDirection(1);
      return i + 1;
    });
  }, [cards.length]);

  const prev = useCallback(() => {
    setIndex((i) => {
      if (i <= 0) return i;
      setDirection(-1);
      return i - 1;
    });
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [next, prev]);

  const clearTimers = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimers();
    setProgress(0);
    if (!autoplay || paused || index >= cards.length - 1) return;

    advanceStartRef.current = Date.now();
    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - advanceStartRef.current;
      setProgress(Math.min(1, elapsed / AUTO_ADVANCE_MS));
    }, 50);
    advanceTimerRef.current = window.setTimeout(() => {
      next();
    }, AUTO_ADVANCE_MS);

    return clearTimers;
  }, [autoplay, paused, index, cards.length, next]);

  const handlePointerDown =
    (zone: "left" | "right") => (_: React.PointerEvent) => {
      pressedAtRef.current = Date.now();
      pressedZoneRef.current = zone;
      setPaused(true);
    };

  const handlePointerUp = (_: React.PointerEvent) => {
    const downAt = pressedAtRef.current;
    const zone = pressedZoneRef.current;
    pressedAtRef.current = null;
    pressedZoneRef.current = null;
    setPaused(false);
    if (downAt === null || !zone) return;
    const duration = Date.now() - downAt;
    if (duration < TAP_THRESHOLD_MS) {
      if (zone === "left") prev();
      else next();
    }
  };

  const handlePointerCancel = () => {
    pressedAtRef.current = null;
    pressedZoneRef.current = null;
    setPaused(false);
  };

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? 40 : -40,
      scale: 0.96,
    }),
    center: { opacity: 1, y: 0, scale: 1 },
    exit: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? -40 : 40,
      scale: 0.96,
    }),
  };

  return (
    <div className="relative w-full max-w-[460px] flex flex-col gap-3">
      <div className="flex gap-1 px-1">
        {cards.map((_, i) => {
          const fill =
            i < index
              ? 1
              : i === index
                ? autoplay && !paused
                  ? progress
                  : 1
                : 0;
          return (
            <div
              key={i}
              className="flex-1 h-1 rounded-full bg-white/15 overflow-hidden"
            >
              <div
                className="h-full bg-white transition-[width] duration-75"
                style={{ width: `${fill * 100}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="relative aspect-[9/16] w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {cards[index]}
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          aria-label="previous card"
          onPointerDown={handlePointerDown("left")}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
          onContextMenu={(e) => e.preventDefault()}
          className="absolute top-0 bottom-20 left-0 w-[35%] z-10 cursor-w-resize select-none"
          style={{ WebkitTapHighlightColor: "transparent" }}
        />
        <button
          type="button"
          aria-label="next card"
          onPointerDown={handlePointerDown("right")}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
          onContextMenu={(e) => e.preventDefault()}
          className="absolute top-0 bottom-20 right-0 w-[65%] z-10 cursor-e-resize select-none"
          style={{ WebkitTapHighlightColor: "transparent" }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-white/40 px-1">
        <button
          onClick={prev}
          disabled={index === 0}
          className="hover:text-white disabled:opacity-30 transition py-1"
        >
          ← prev
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoplay((v) => !v)}
            aria-label={autoplay ? "stop autoplay" : "start autoplay"}
            className="flex items-center gap-1.5 hover:text-white transition py-1"
          >
            {autoplay ? (
              <Pause className="size-3" />
            ) : (
              <Play className="size-3" />
            )}
            <span>{autoplay ? "stop" : "auto"}</span>
          </button>
          <span>
            {index + 1} / {cards.length}
          </span>
        </div>
        <button
          onClick={next}
          disabled={index === cards.length - 1}
          className="hover:text-white disabled:opacity-30 transition py-1"
        >
          next →
        </button>
      </div>
    </div>
  );
}
