type MonthlyItem = {
  label: string;
  value: number;
};

type MonthlyBarsProps = {
  title: string;
  subtitle: string;
  colorClassName?: string;
  items: MonthlyItem[];
};

export function MonthlyBars({
  title,
  subtitle,
  colorClassName = "",
  items,
}: MonthlyBarsProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <article className="bars-card">
      <p className="eyebrow">{title}</p>
      <h3>{subtitle}</h3>
      <div className="month-bars">
        {items.map((item) => (
          <div key={item.label} className="month-bars__item">
            <div className="month-bars__value">{item.value.toFixed(1)}</div>
            <div className="month-bars__track">
              <div
                className={`month-bars__fill ${colorClassName}`.trim()}
                style={{ height: `${(item.value / max) * 100}%` }}
              />
            </div>
            <div className="month-bars__label">{item.label}</div>
          </div>
        ))}
      </div>
    </article>
  );
}
