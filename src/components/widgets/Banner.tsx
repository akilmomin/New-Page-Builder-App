"use client";

import React from "react";

interface BannerProps {
  readonly editMode?: boolean;
  readonly onPropsChange?: (patch: Record<string, unknown>) => void;
  readonly heading?: string;
  readonly subheading?: string;
  readonly gradient?: "blue" | "purple" | "teal" | "rose" | "amber";
}

const GRADIENTS: Record<string, string> = {
  blue:   "from-blue-600 to-blue-800",
  purple: "from-indigo-600 to-purple-700",
  teal:   "from-teal-600 to-cyan-700",
  rose:   "from-rose-500 to-pink-700",
  amber:  "from-amber-500 to-orange-600",
};

export const Banner: React.FC<BannerProps> = ({
  editMode = false,
  heading = "Welcome to the Page Builder",
  subheading = "Build pages effortlessly with a drag-and-drop layout system",
  gradient = "blue",
}) => {
  const bgClass = GRADIENTS[gradient] ?? GRADIENTS.blue;

  return (
    <div className="relative w-full h-[260px] overflow-hidden rounded-xl shadow-card">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} transition-all duration-700`} />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-8">
        <h2 className="text-3xl font-bold mb-2 drop-shadow">{heading}</h2>
        <p className="text-lg opacity-90">{subheading}</p>
      </div>
      {editMode && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
          <span className="bg-black/40 text-white text-sm px-3 py-1 rounded-full">Banner</span>
        </div>
      )}
    </div>
  );
};
