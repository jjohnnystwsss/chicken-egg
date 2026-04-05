type SpreadItem = {
  label: string;
  value: number;
};

type SpreadBarsProps = {
  title: string;
  subtitle: string;
  items: SpreadItem[];
};

export function SpreadBars({ title, subtitle, items }: SpreadBarsProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <article className="bars-card">
      <p className="eyebrow">{title}</p>
      <h3>{subtitle}</h3>
      <div className="bars-list">
        {items.map((item) => (
          <div key={item.label} className="bars-row">
            <div className="bars-row__labels">
              <span>{item.label}</span>
              <strong>{item.value.toFixed(1)}</strong>
            </div>
            <div className="bars-track">
              <div
                className="bars-fill"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
