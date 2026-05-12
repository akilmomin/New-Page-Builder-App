import { useState, useMemo } from "react";
import type { ComponentDefinition } from "../../../../models/pageBuilder";

export function useComponentPicker(components: ComponentDefinition[]) {
  const [query, setQuery] = useState("");
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const filtered = query
      ? components.filter(
          (c) =>
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            c.category?.toLowerCase().includes(query.toLowerCase()),
        )
      : components;

    return filtered.reduce<Record<string, ComponentDefinition[]>>((acc, c) => {
      const cat = c.category ?? "Components";
      return { ...acc, [cat]: [...(acc[cat] ?? []), c] };
    }, {});
  }, [components, query]);

  return { query, setQuery, grouped, hoveredTile, setHoveredTile };
}
