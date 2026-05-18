"use client";

import React from "react";

interface NewsItem {
  readonly id: number;
  readonly title: string;
  readonly category: string;
  readonly date: string;
  readonly url: string;
}

interface NewsProps {
  readonly editMode?: boolean;
  readonly onPropsChange?: (patch: Record<string, unknown>) => void;
  readonly widgetTitle?: string;
  readonly maxItems?: number;
}

const NEWS_ITEMS: readonly NewsItem[] = [
  { id: 1, title: "Company Quarterly Results Exceed Expectations", category: "Finance", date: "08 May 2026", url: "/#" },
  { id: 2, title: "New Office Opens in Singapore", category: "Corporate", date: "06 May 2026", url: "/#" },
  { id: 3, title: "Annual Sustainability Report Released", category: "ESG", date: "04 May 2026", url: "/#" },
  { id: 4, title: "Technology Innovation Award 2026", category: "Tech", date: "01 May 2026", url: "/#" },
  { id: 5, title: "Employee Wellness Programme Launched", category: "HR", date: "28 Apr 2026", url: "/#" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Finance:   "bg-emerald-100 text-emerald-700",
  Corporate: "bg-blue-100 text-blue-700",
  ESG:       "bg-teal-100 text-teal-700",
  Tech:      "bg-violet-100 text-violet-700",
  HR:        "bg-orange-100 text-orange-700",
};

export const News: React.FC<NewsProps> = ({
  editMode = false,
  widgetTitle = "News",
  maxItems = 5,
}) => {
  const items = NEWS_ITEMS.slice(0, Math.max(1, Math.min(maxItems, NEWS_ITEMS.length)));

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text">{widgetTitle}</h3>
        <a href="/#" className="text-xs text-primary hover:underline font-medium">See all</a>
      </div>
      <ul className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[420px] pr-0.5">
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => { if (!editMode) window.open(item.url, "_self"); }}
            className={`flex gap-3 p-2 rounded-lg transition-colors ${
              editMode ? "cursor-default" : "cursor-pointer hover:bg-surface-muted"
            }`}
          >
            <div className="w-1 rounded-full flex-shrink-0 self-stretch" style={{ background: "var(--color-primary, #0078d4)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text line-clamp-2 leading-snug">{item.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {item.category}
                </span>
                <span className="text-[11px] text-text-subtle">{item.date}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
