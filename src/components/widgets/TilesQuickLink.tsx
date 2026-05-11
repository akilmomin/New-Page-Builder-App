"use client";

import React, { useCallback, useRef, useState } from "react";

interface QuickTile {
  readonly key: string;
  readonly text: string;
  readonly icon: string;
  readonly show: boolean;
}

const ALL_TILES: readonly QuickTile[] = [
  { key: "facebook", text: "Facebook", icon: "📘", show: true },
  { key: "website", text: "Website", icon: "🌐", show: true },
  { key: "twitter", text: "Twitter", icon: "🐦", show: true },
  { key: "files", text: "Files", icon: "📁", show: true },
  { key: "documents", text: "Documents", icon: "📄", show: true },
  { key: "calendar", text: "Calendar", icon: "📅", show: true },
  { key: "email", text: "Email", icon: "✉️", show: true },
  { key: "teams", text: "Teams", icon: "💬", show: true },
  { key: "sharepoint", text: "SharePoint", icon: "🔷", show: true },
  { key: "requests", text: "Requests", icon: "📋", show: false },
  { key: "reports", text: "Reports", icon: "📊", show: true },
  { key: "settings", text: "Settings", icon: "⚙️", show: false },
] as const;

export const TilesQuickLink: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleTiles = isEditMode
    ? ALL_TILES
    : ALL_TILES.filter((t) => t.show);

  const scrollLeft = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft -= 160;
  }, []);

  const scrollRight = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft += 160;
  }, []);

  const handleSave = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text">Quick Tiles</h3>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <button
              onClick={handleSave}
              className="text-xs px-2.5 py-1 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="p-1.5 text-text-muted hover:text-text hover:bg-surface-muted rounded transition-colors"
              title="Edit tiles"
            >
              ✏️
            </button>
          )}
          <button
            onClick={() => setIsGridView((v) => !v)}
            className="p-1.5 text-text-muted hover:text-text hover:bg-surface-muted rounded transition-colors"
            title={isGridView ? "Switch to carousel" : "Switch to grid"}
          >
            {isGridView ? "☰" : "⊞"}
          </button>
        </div>
      </div>

      {/* Tile grid or carousel */}
      {isGridView ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {visibleTiles.map((tile) => (
            <TileItem key={tile.key} tile={tile} />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Scroll left */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-card rounded-full w-7 h-7 flex items-center justify-center hover:bg-surface-muted transition-colors -ml-3"
            aria-label="Scroll left"
          >
            ‹
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide px-4 py-1"
            style={{ scrollbarWidth: "none" }}
          >
            {visibleTiles.map((tile) => (
              <TileItem key={tile.key} tile={tile} scrollable />
            ))}
          </div>

          {/* Scroll right */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-card rounded-full w-7 h-7 flex items-center justify-center hover:bg-surface-muted transition-colors -mr-3"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

// ─── TileItem ─────────────────────────────────────────────────────────────────

interface TileItemProps {
  readonly tile: QuickTile;
  readonly scrollable?: boolean;
}

const TileItem: React.FC<TileItemProps> = ({ tile, scrollable = false }) => (
  <button
    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-primary-light transition-colors group ${
      scrollable ? "flex-shrink-0 w-16" : "w-full aspect-square"
    }`}
    title={tile.text}
  >
    <span className="text-2xl group-hover:scale-110 transition-transform">
      {tile.icon}
    </span>
    <span className="text-[10px] text-text-muted group-hover:text-primary font-medium leading-tight text-center truncate w-full">
      {tile.text}
    </span>
  </button>
);
