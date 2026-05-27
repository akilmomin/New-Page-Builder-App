"use client";

import { useState } from "react";
import { PageBuilderApp } from "@/components/PageBuilderApp";
import { PageBuilderApp2 } from "@/components/PageBuilderApp2";
import { PageBuilderApp3 } from "@/components/PageBuilderApp3";
import { PageBuilderApp4 } from "@/components/PageBuilderApp4";
import { PageBuilderApp5 } from "@/components/PageBuilderApp5";
import { PageBuilderApp6 } from "@/components/PageBuilderApp6";

const TABS = [
  { id: "1", label: "Default Builder",      description: "Standard built-in UI" },
  { id: "2", label: "Custom UI Builder",    description: "All render props wired" },
  { id: "3", label: "Form Builder",         description: "Inline edit UI in components" },
  { id: "4", label: "Form Builder (Panel)", description: "Caller-owned side panel" },
  { id: "5", label: "DnD Reorder",          description: "Drag sections to reorder" },
  { id: "6", label: "DnD Add",              description: "Drag presets to insert sections" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("1");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col px-5 py-3 text-left border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
              <span className="text-[10px] text-gray-400">{tab.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — each builder stays mounted to preserve state */}
      <div className={activeTab === "1" ? "" : "hidden"}>
        <PageBuilderApp />
      </div>
      <div className={activeTab === "2" ? "" : "hidden"}>
        <PageBuilderApp2 />
      </div>
      <div className={activeTab === "3" ? "" : "hidden"}>
        <PageBuilderApp3 />
      </div>
      <div className={activeTab === "4" ? "" : "hidden"}>
        <PageBuilderApp4 />
      </div>
      <div className={activeTab === "5" ? "" : "hidden"}>
        <PageBuilderApp5 />
      </div>
      <div className={activeTab === "6" ? "" : "hidden"}>
        <PageBuilderApp6 />
      </div>
    </div>
  );
}
