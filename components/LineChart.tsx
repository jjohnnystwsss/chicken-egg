type DataPoint = {
  date: string;
  value: number;
};

type LineChartProps = {
  title: string;
  subtitle: string;
  color: string;
  data: DataPoint[];
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

export function LineChart({ title, subtitle, color, data }: LineChartProps) {
  const width = 520;
  const height = 200;
  const path = buildPath(data, width, height);
  const latest = data.at(-1)?.value ?? 0;
  const earliest = data.at(0)?.value ?? 0;
  const delta = latest - earliest;

  return (
    <article className="chart-card">
      <div className="chart-card__header">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{subtitle}</h3>
        </div>
        <div className="chart-card__metric">
          <span>近期待變化</span>
          <strong>{delta >= 0 ? "+" : ""}{delta.toFixed(1)}</strong>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label={subtitle}>
        <defs>
          <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L ${width} ${height} L 0 ${height} Z`}
          fill={`url(#gradient-${title})`}
        />
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="chart-card__footer">
        <span>{data[0]?.date}</span>
        <span>單位：元/台斤</span>
        <span>{data.at(-1)?.date}</span>
      </div>
    </article>
  );
}
