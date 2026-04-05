type AnnualRow = {
  year: number;
  broilerAverage: number | null;
  broilerRange: number | null;
  eggAverage: number | null;
  eggRange: number | null;
  eggSpreadAverage: number | null;
};

type AnnualComparisonTableProps = {
  rows: AnnualRow[];
};

function formatCell(value: number | null) {
  return value === null ? "-" : value.toFixed(1);
}

export function AnnualComparisonTable({ rows }: AnnualComparisonTableProps) {
  return (
    <article className="table-card">
      <div className="records-table annual-table">
        <div className="records-table__header annual-table__header">
          <div className="records-table__head">年份</div>
          <div className="records-table__head">白肉雞年均價</div>
          <div className="records-table__head">白肉雞年內區間</div>
          <div className="records-table__head">雞蛋年均價</div>
          <div className="records-table__head">雞蛋年內區間</div>
          <div className="records-table__head">雞蛋平均價差</div>
        </div>
        {rows.map((row) => (
          <div key={row.year} className="records-table__row annual-table__row">
            <div className="records-table__cell">{row.year}</div>
            <div className="records-table__cell">{formatCell(row.broilerAverage)}</div>
            <div className="records-table__cell">{formatCell(row.broilerRange)}</div>
            <div className="records-table__cell">{formatCell(row.eggAverage)}</div>
            <div className="records-table__cell">{formatCell(row.eggRange)}</div>
            <div className="records-table__cell">{formatCell(row.eggSpreadAverage)}</div>
          </div>
        ))}
      </div>
    </article>
  );
}
