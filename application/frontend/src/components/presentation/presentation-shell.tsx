"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Slide {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface PresentationShellProps {
  slides: Slide[];
  onExit?: () => void;
  backLabel?: string;
  backHref?: string;
}

export function PresentationShell({ slides, onExit, backLabel, backHref }: PresentationShellProps) {
  const [current, setCurrent] = useState(() => {
    if (typeof window === "undefined") return 0;
    const params = new URLSearchParams(window.location.search);
    const slideParam = params.get("slide");
    if (!slideParam) return 0;
    const byId = slides.findIndex((s) => s.id === slideParam);
    if (byId >= 0) return byId;
    const byNum = parseInt(slideParam);
    if (!isNaN(byNum) && byNum >= 0 && byNum < slides.length) return byNum;
    return 0;
  });
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = slides.length;

  const goTo = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (index < 0 || index >= total || index === current || transitioning) return;
      setDirection(dir ?? (index > current ? "next" : "prev"));
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setTransitioning(false);
      }, 150);
    },
    [current, total, transitioning],
  );

  const next = useCallback(() => goTo(current + 1, "next"), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, "prev"), [current, goTo]);

  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    } else if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  }, [onExit]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "Escape":
          e.preventDefault();
          handleExit();
          break;
        case "Home":
          e.preventDefault();
          goTo(0, "prev");
          break;
        case "End":
          e.preventDefault();
          goTo(total - 1, "next");
          break;
        default:
          if (e.key >= "1" && e.key <= "9") {
            const idx = parseInt(e.key) - 1;
            if (idx < total) {
              e.preventDefault();
              goTo(idx);
            }
          }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, goTo, handleExit, total]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const progress = total > 1 ? ((current + 1) / total) * 100 : 100;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-background flex flex-col outline-none select-none"
    >
      {/* Progress bar */}
      <div className="h-1 bg-muted shrink-0">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide content */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center px-8 py-12 transition-all duration-200 ease-out",
            transitioning && direction === "next" && "opacity-0 translate-x-8",
            transitioning && direction === "prev" && "opacity-0 -translate-x-8",
            !transitioning && "opacity-100 translate-x-0",
          )}
        >
          <div className="w-full max-w-5xl mx-auto">
            {slides[current]?.content}
          </div>
        </div>
      </div>

      {/* Back link */}
      {backLabel && (
        <div className="shrink-0 flex justify-center pt-2">
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {backLabel}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="shrink-0 pb-6 pt-2 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          disabled={current === 0}
          className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "rounded-full transition-all duration-200",
                i === current
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === total - 1}
          className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-20"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Exit button */}
      <button
        onClick={handleExit}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Slide counter */}
      <div className="absolute bottom-2 right-4 text-xs text-muted-foreground/50">
        {current + 1} / {total}
      </div>
    </div>
  );
}
