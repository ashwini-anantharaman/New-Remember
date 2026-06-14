"use client";

import { useMemo } from "react";
import { RELATIONSHIP_LEGEND } from "@/lib/organizer/constellationData";

const NODE_FILL = "#B7C19A";
const LINK_STROKE = "#97877B";

function wrapLabel(label = "", maxCharsPerLine = 16, maxLines = 3) {
  const words = String(label).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function computePositions(satellites, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const centerRadius = Math.min(width, height) * 0.11;
  const orbitRadius = Math.min(width, height) * 0.34;

  const nodes = satellites.map((node, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / Math.max(satellites.length, 1)) * index;
    const radius = node.prominence * 28 + 36;
    return {
      ...node,
      x: centerX + Math.cos(angle) * orbitRadius,
      y: centerY + Math.sin(angle) * orbitRadius,
      radius,
    };
  });

  return {
    centerX,
    centerY,
    centerRadius,
    nodes,
  };
}

function DiagramNode({ node, selected, onNodeClick, mode }) {
  const fill = mode === "relationships" ? node.fillColor || NODE_FILL : NODE_FILL;
  const lines = wrapLabel(node.label, mode === "themes" ? 18 : 14, 3);
  const lineHeight = 14;
  const textStartY = node.y - ((lines.length - 1) * lineHeight) / 2;

  return (
    <g
      role="button"
      tabIndex={0}
      className="cursor-pointer outline-none"
      onClick={() => onNodeClick?.(node)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onNodeClick?.(node);
        }
      }}
    >
      <circle
        cx={node.x}
        cy={node.y}
        r={node.radius}
        fill={fill}
        stroke={selected ? "#4A4A4A" : LINK_STROKE}
        strokeWidth={selected ? 2.5 : 1.5}
        className="transition-[stroke-width] duration-150"
      />
      <text
        x={node.x}
        y={textStartY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#2F2F2F"
        fontSize="12"
        fontWeight="600"
        pointerEvents="none"
        style={{ fontFamily: "var(--font-sans, Arial, sans-serif)" }}
      >
        {lines.map((line, index) => (
          <tspan key={index} x={node.x} dy={index === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export default function OrganizerConstellationDiagram({
  satellites = [],
  width = 1340,
  height = 640,
  showLegend = false,
  mode = "themes",
  selectedNodeId = null,
  onNodeClick,
  centerLabel = null,
}) {
  const layout = useMemo(
    () => computePositions(satellites, width, height),
    [satellites, width, height],
  );

  if (!satellites.length) {
    return (
      <div
        className="flex items-center justify-center rounded-[10px] border border-r-muted bg-white text-body-2 text-r-secondary"
        style={{ width, height }}
      >
        No constellation data yet.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-[10px] border border-r-muted bg-white">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Constellation diagram"
      >
        {layout.nodes.map((node) => (
          <line
            key={`link-${node.id}`}
            x1={layout.centerX}
            y1={layout.centerY}
            x2={node.x}
            y2={node.y}
            stroke={LINK_STROKE}
            strokeWidth="1.5"
          />
        ))}

        <circle
          cx={layout.centerX}
          cy={layout.centerY}
          r={layout.centerRadius}
          fill={NODE_FILL}
          stroke={LINK_STROKE}
          strokeWidth="1.5"
        />
        {centerLabel ? (
          <text
            x={layout.centerX}
            y={layout.centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#2F2F2F"
            fontSize="11"
            fontWeight="600"
            pointerEvents="none"
          >
            {wrapLabel(centerLabel, 12, 2).map((line, index) => (
              <tspan key={index} x={layout.centerX} dy={index === 0 ? 0 : 13}>
                {line}
              </tspan>
            ))}
          </text>
        ) : null}

        {layout.nodes.map((node) => (
          <DiagramNode
            key={node.id}
            node={node}
            mode={mode}
            selected={selectedNodeId === node.id}
            onNodeClick={onNodeClick}
          />
        ))}
      </svg>

      {showLegend ? (
        <div className="absolute bottom-4 left-4 rounded-[10px] border border-r-muted bg-white/95 p-4 shadow-sm">
          <p className="mb-3 text-body-2 font-medium text-r-text">Legend</p>
          <div className="space-y-2">
            {RELATIONSHIP_LEGEND.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-caption text-r-text">
                <span className="size-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
