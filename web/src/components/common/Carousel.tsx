import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface CarouselSlide {
  id: string | number;
  url: string;
  title?: string;
  subtitle?: string;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  autoScrollInterval?: number;
  showIndicators?: boolean;
  showControls?: boolean;
  className?: string;
  aspectRatio?: 'banner' | 'video' | 'custom';
}

export const Carousel: React.FC<CarouselProps> = ({
  slides,
  autoScrollInterval = 4000,
  showIndicators = true,
  showControls = true,
  className,
  aspectRatio = 'banner',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1 || autoScrollInterval <= 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [autoScrollInterval, isPaused, nextSlide, slides.length]);

  if (!slides || slides.length === 0) return null;

  const aspectStyles = {
    banner: 'h-44 sm:h-64 lg:h-72',
    video: 'aspect-video w-full',
    custom: '',
  };

  return (
    <div
      className={clsx(
        'relative w-full rounded-2xl overflow-hidden shadow-brand bg-slate-900 group select-none',
        aspectStyles[aspectRatio],
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Track */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={slide.id || idx} className="relative min-w-full h-full shrink-0">
            <img
              src={slide.url}
              alt={slide.title || `Slide ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {(slide.title || slide.subtitle) && (
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-16 text-white text-left">
                {slide.title && (
                  <h3 className="text-base sm:text-xl font-bold leading-tight drop-shadow-sm">
                    {slide.title}
                  </h3>
                )}
                {slide.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 drop-shadow-sm line-clamp-1">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showControls && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#1E293B] flex items-center justify-center backdrop-blur-xs shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#1E293B] flex items-center justify-center backdrop-blur-xs shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={clsx(
                'h-1.5 rounded-full transition-all duration-300',
                currentIndex === idx ? 'w-5 bg-[#006EFF]' : 'w-1.5 bg-white/70 hover:bg-white'
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
