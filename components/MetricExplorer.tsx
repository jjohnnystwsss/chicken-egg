"use client";

import { useState } from "react";

type DataPoint = {
  date: string;
  value: number;
};

type MetricOption = {
  id: string;
  label: string;
  description: string;
  color: string;
  data: DataPoint[];
};

type MetricExplorerProps = {
  title: string;
  subtitle: string;
  options: MetricOption[];
};

function buildPath(data: DataPoint[], width: number, height: number) {
  if (data.length === 0) return "";

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return data
    .map((point, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - ((point.value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function MetricExplorer({ title, subtitle, options }: MetricExplorerProps) {
  const [activeId, setActiveId] = useState(options[0]?.id ?? "");
  const active = options.find((option) => option.id === activeId) ?? options[0];

  if (!active) {
    return null;
  }

  const width = 620;
  const height = 220;
  const path = buildPath(active.data, width, height);
  const latest = active.data.at(-1)?.value ?? 0;
  const earliest = active.data.at(0)?.value ?? 0;
  const delta = latest - earliest;

  return (
    <article className="explorer-card">
      <div className="explorer-card__header">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{subtitle}</h3>
          <p className="section-copy">{active.description}</p>
        </div>
        <div className="chart-card__metric">
          <span>區間變化</span>
          <strong>{delta >= 0 ? "+" : ""}{delta.toFixed(1)}</strong>
        </div>
      </div>
      <div className="explorer-tabs">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`explorer-tab ${option.id === active.id ? "explorer-tab--active" : ""}`}
            onClick={() => setActiveId(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label={active.label}>
        <defs>
          <linearGradient id={`explorer-${active.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={active.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={active.color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L ${width} ${height} L 0 ${height} Z`}
          fill={`url(#explorer-${active.id})`}
        />
        <path d={path} fill="none" stroke={active.color} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="chart-card__footer">
        <span>{active.data[0]?.date}</span>
        <span>單位：元/台斤</span>
        <span>{active.data.at(-1)?.date}</span>
      </div>
    </article>
  );
}
