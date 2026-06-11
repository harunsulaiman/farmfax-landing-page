"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "@/styles/modules/carousel.module.css";

export interface CarouselSlide {
  id: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
}

interface ImageCarouselProps {
  slides: readonly CarouselSlide[];
  autoAdvanceMs?: number;
}

export function ImageCarousel({
  slides,
  autoAdvanceMs = 7000,
}: ImageCarouselProps): React.JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setActiveIndex((index + total) % total);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (total <= 1 || autoAdvanceMs <= 0 || paused) return;
    const timer = window.setInterval(goNext, autoAdvanceMs);
    return () => window.clearInterval(timer);
  }, [autoAdvanceMs, goNext, paused, total]);

  if (total === 0) return null;

  const progress = ((activeIndex + 1) / total) * 100;

  return (
    <div
      className={styles.carousel}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className={styles.slide}
              aria-hidden={index !== activeIndex}
            >
              <div className={styles.slideImageWrap}>
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={styles.slideImage}
                />
                <div className={styles.slideGradient} />
                <div className={styles.slideOverlay}>
                  <span className={styles.slideTag}>Farmer story</span>
                  <h3 className={styles.slideTitle}>{slide.title}</h3>
                  <p className={styles.slideCaption}>{slide.caption}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowPrev}`}
          onClick={goPrev}
          aria-label="Previous story"
        >
          ‹
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowNext}`}
          onClick={goNext}
          aria-label="Next story"
        >
          ›
        </button>
      </div>

      <div className={styles.progressTrack} aria-hidden>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.footerControls}>
        <div className={styles.dots} role="tablist" aria-label="Choose story">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Story ${index + 1}: ${slide.title}`}
              className={
                index === activeIndex ? styles.dotActive : styles.dot
              }
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <span className={styles.counter}>
          {activeIndex + 1} / {total}
        </span>
      </div>
    </div>
  );
}
