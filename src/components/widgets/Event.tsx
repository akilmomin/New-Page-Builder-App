"use client";

import React from "react";

interface EventItem {
  readonly id: number;
  readonly title: string;
  readonly date: string;
  readonly time: string;
  readonly location: string;
  readonly url: string;
  readonly color: string;
}

interface EventProps {
  readonly editMode?: boolean;
}

const EVENTS: readonly EventItem[] = [
  { id: 1, title: "Annual General Meeting", date: "15 May 2026", time: "09:00 AM", location: "Main Boardroom", url: "/#", color: "bg-blue-500" },
  { id: 2, title: "Tech Talk: AI in Finance", date: "18 May 2026", time: "02:00 PM", location: "Conference Hall A", url: "/#", color: "bg-violet-500" },
  { id: 3, title: "Team Building Workshop", date: "22 May 2026", time: "10:00 AM", location: "Rooftop Garden", url: "/#", color: "bg-emerald-500" },
  { id: 4, title: "Product Launch Q2 2026", date: "28 May 2026", time: "11:00 AM", location: "Auditorium", url: "/#", color: "bg-orange-500" },
  { id: 5, title: "Compliance Training Session", date: "02 Jun 2026", time: "03:00 PM", location: "Training Room B", url: "/#", color: "bg-rose-500" },
  { id: 6, title: "Mid-Year Strategy Review", date: "10 Jun 2026", time: "09:00 AM", location: "Executive Suite", url: "/#", color: "bg-teal-500" },
  { id: 7, title: "Innovation Hackathon", date: "20 Jun 2026", time: "08:00 AM", location: "Innovation Lab", url: "/#", color: "bg-indigo-500" },
  { id: 8, title: "Client Appreciation Day", date: "25 Jun 2026", time: "12:00 PM", location: "Grand Lobby", url: "/#", color: "bg-pink-500" },
] as const;

export const Event: React.FC<EventProps> = ({ editMode = false }) => {
  const handleClick = (item: EventItem) => {
    if (editMode) return;
    window.open(item.url, "_self");
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text">Events</h3>
        <a href="/#" className="text-xs text-primary hover:underline font-medium">
          See all
        </a>
      </div>

      <ul className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[560px] pr-0.5">
        {EVENTS.map((item) => (
          <li
            key={item.id}
            onClick={() => handleClick(item)}
            className={`flex gap-3 ${
              editMode ? "cursor-default" : "cursor-pointer group"
            }`}
          >
            {/* Date block */}
            <div
              className={`${item.color} text-white rounded-xl w-12 flex-shrink-0 flex flex-col items-center justify-center py-2 text-center`}
            >
              <span className="text-[10px] font-semibold uppercase leading-none">
                {item.date.split(" ")[1]}
              </span>
              <span className="text-xl font-bold leading-none mt-0.5">
                {item.date.split(" ")[0]}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 py-1">
              <p
                className={`text-sm font-medium text-text line-clamp-1 ${
                  !editMode ? "group-hover:text-primary" : ""
                } transition-colors`}
              >
                {item.title}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {item.time} · {item.location}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
