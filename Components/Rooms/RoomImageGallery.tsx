"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

interface RoomImageGalleryProps {
  images: string[];
  autoPlayInterval?: number; // in milliseconds
}

const RoomImageGallery = ({ images, autoPlayInterval = 3000 }: RoomImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images.length]);

  const toggleAutoPlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlaying(!isAutoPlaying);
  }, [isAutoPlaying]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isHovered && images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isHovered, images.length, autoPlayInterval]);

  return (
    <div
      className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images Slider */}
      <div
        className="w-full h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0 relative"
          >
            <Image
              src={image}
              alt={`Room ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigations Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Image Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(index);
            }}
            className={`rounded-full transition-all duration-300 shadow-lg ${
              index === currentImageIndex
                ? "bg-brand-primary w-6 h-2"
                : "bg-white/60 hover:bg-white w-2 h-2"
            }`}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)' }}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
        {currentImageIndex + 1} / {images.length}
      </div>

      {/* Auto-play Toggle Button */}
      {images.length > 1 && (
        <button
          onClick={toggleAutoPlay}
          className="absolute top-3 left-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

export default RoomImageGallery;