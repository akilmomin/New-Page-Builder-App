"use client";

import React from "react";

interface PaperItem {
  readonly id: number;
  readonly title: string;
  readonly category: string;
  readonly date: string;
  readonly url: string;
}

interface BusinessPaperProps {
  readonly editMode?: boolean;
}

const PAPERS: readonly PaperItem[] = [
  { id: 1, title: "Strategic Planning Framework 2026", category: "Strategy", date: "07 May 2026", url: "/#" },
  { id: 2, title: "Digital Transformation Whitepaper", category: "Technology", date: "05 May 2026", url: "/#" },
  { id: 3, title: "Risk Management Policy Update", category: "Compliance", date: "03 May 2026", url: "/#" },
  { id: 4, title: "Customer Experience Research Report", category: "Research", date: "30 Apr 2026", url: "/#" },
  { id: 5, title: "Supply Chain Optimisation Guide", category: "Operations", date: "27 Apr 2026", url: "/#" },
] as const;

const CATEGORY_ICON: Record<string, string> = {
  Strategy: "📊",
  Technology: "💻",
  Compliance: "🔒",
  Research: "🔬",
  Operations: "⚙️",
};

export const BusinessPaper: React.FC<BusinessPaperProps> = ({
  editMode = false,
}) => {
  const handleClick = (item: PaperItem) => {
    if (editMode) return;
    window.open(item.url, "_self");
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text">Business Paper</h3>
        <a href="/#" className="text-xs text-primary hover:underline font-medium">
          See all
        </a>
      </div>

      <ul className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[420px] pr-0.5">
        {PAPERS.map((item) => (
          <li
            key={item.id}
            onClick={() => handleClick(item)}
            className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
              editMode ? "cursor-default" : "cursor-pointer hover:bg-surface-muted"
            }`}
          >
            <span
              className="text-xl flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              {CATEGORY_ICON[item.category] ?? "📄"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text line-clamp-2 leading-snug">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-text-muted">
                  {item.category}
                </span>
                <span className="text-[11px] text-text-subtle">·</span>
                <span className="text-[11px] text-text-subtle">{item.date}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
