"use client";

import React from "react";

interface BannerProps {
  readonly editMode?: boolean;
}

const SLIDES = [
  { id: 1, title: "Welcome to the Page Builder", subtitle: "Drag, drop and build pages effortlessly", bg: "from-blue-600 to-blue-800" },
  { id: 2, title: "Powerful Layout System", subtitle: "Responsive grids inspired by Cosine UI", bg: "from-indigo-600 to-purple-700" },
  { id: 3, title: "Component Library", subtitle: "News, Events, Quick Tiles and more", bg: "from-teal-600 to-cyan-700" },
] as const;

export const Banner: React.FC<BannerProps> = ({ editMode = false }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (editMode) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [editMode]);

  const activeSlide = SLIDES[activeIndex];

  return (
    <div className="relative w-full h-[260px] overflow-hidden rounded-xl shadow-card">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${activeSlide.bg} transition-all duration-700`}
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-8">
        <h2 className="text-3xl font-bold mb-2 drop-shadow">{activeSlide.title}</h2>
        <p className="text-lg opacity-90">{activeSlide.subtitle}</p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setActiveIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === activeIndex ? "bg-white scale-110" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {editMode && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
          <span className="bg-black/40 text-white text-sm px-3 py-1 rounded-full">
            Banner (Edit Mode)
          </span>
        </div>
      )}
    </div>
  );
};
