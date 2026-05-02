"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "motion/react";

interface CardDeckProps {
  cards: React.ReactNode[];
}

export function CardDeck({ cards }: CardDeckProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

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

  const onDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const swipe = info.offset.y * 0.5 + info.velocity.y * 0.05;
    if (swipe < -40) next();
    else if (swipe > 40) prev();
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
        {cards.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i <= index ? "bg-white" : "bg-white/15"
            }`}
          />
        ))}
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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            onClick={next}
            className="absolute inset-0 cursor-pointer touch-pan-y"
          >
            {cards[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between text-xs text-white/40 px-1">
        <button
          onClick={prev}
          disabled={index === 0}
          className="hover:text-white disabled:opacity-30 transition py-1"
        >
          ← prev
        </button>
        <span>
          {index + 1} / {cards.length}
        </span>
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
