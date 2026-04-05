import { readFile } from "node:fs/promises";
import { LineChart } from "../components/LineChart";
import { MonthlyBars } from "../components/MonthlyBars";
import { SpreadBars } from "../components/SpreadBars";
import sampleData from "../public/data/sample-insights.json";

type ChartPoint = {
  date: string;
  value: number;
};

type SiteData = {
  meta?: {
    dataset?: string;
    source?: string;
    sourceUrl?: string;
    records?: number;
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
  summary?: {
    latestDate?: string;
    broilerLarge?: number | null;
    broilerMedium?: number | null;
    eggFarm?: number | null;
    eggWholesale?: number | null;
  };
  insights?: {
    title: string;
    body: string;
  }[];
  highlights?: {
    title: string;
    body: string;
  }[];
  series: {
    broilerLarge: ChartPoint[];
    eggWholesale: ChartPoint[];
  };
  seasonality?: {
    broilerLargeMonthly: {
      label: string;
      value: number;
    }[];
    eggWholesaleMonthly: {
      label: string;
      value: number;
    }[];
  };
  spreads: {
    label: string;
    value: number;
  }[];
};

const fallbackInsightCards = [
  {
    title: "規格價差",
    body: "白肉雞 2.0Kg 以上與 1.75-1.95Kg 的價格差，可觀察市場對較大規格雞隻的偏好是否在節日前後擴大。",
  },
  {
    title: "價格傳導",
    body: "雞蛋產地價與大運輸價的變化速度不同，適合分析供應鏈價格傳導是否具有時間差與固定利差。",
  },
  {
    title: "季節波動",
    body: "依月份與農曆節期切分後，可以比較各年度的波動強度，找出市場較敏感的時段。",
  },
];

const roadmap = [
  "先以靜態 JSON 驅動畫面，確認分析敘事與圖表布局。",
  "接著用 Python 清理農業部原始資料，建立可重複更新的資料處理腳本。",
  "最後用 GitHub Actions 每日同步資料，讓 Vercel 自動重建站點。",
];

function formatValue(value?: number | null) {
  if (value === undefined || value === null) {
    return "-";
  }

  return `${value.toFixed(1)} 元/台斤`;
}

function getTrendSummary(series: ChartPoint[]) {
  if (series.length < 2) {
    return { delta: 0, direction: "持平" };
  }

  const first = series[0]?.value ?? 0;
  const last = series[series.length - 1]?.value ?? 0;
  const delta = Number((last - first).toFixed(1));

  if (delta > 0) {
    return { delta, direction: "走升" };
  }

  if (delta < 0) {
    return { delta, direction: "回落" };
  }

  return { delta, direction: "持平" };
}

async function getSiteData(): Promise<SiteData> {
  try {
    const file = await readFile(process.cwd() + "/public/data/generated-insights.json", "utf-8");
    return JSON.parse(file) as SiteData;
  } catch {
    return sampleData as SiteData;
  }
}

export default async function HomePage() {
  const siteData = await getSiteData();
  const insightCards = siteData.insights?.length ? siteData.insights : fallbackInsightCards;
  const highlightCards = siteData.highlights?.length ? siteData.highlights : fallbackInsightCards;
  const broilerTrend = getTrendSummary(siteData.series.broilerLarge);
  const eggTrend = getTrendSummary(siteData.series.eggWholesale);
  const snapshotCards = [
    {
      label: "白肉雞 2.0Kg 以上",
      value: formatValue(siteData.summary?.broilerLarge),
      note: `近 30 日 ${broilerTrend.direction} ${broilerTrend.delta >= 0 ? "+" : ""}${broilerTrend.delta.toFixed(1)}`,
    },
    {
      label: "雞蛋產地價",
      value: formatValue(siteData.summary?.eggFarm),
      note: "可用來對照通路與運輸價差",
    },
    {
      label: "雞蛋大運輸價",
      value: formatValue(siteData.summary?.eggWholesale),
      note: `近 30 日 ${eggTrend.direction} ${eggTrend.delta >= 0 ? "+" : ""}${eggTrend.delta.toFixed(1)}`,
    },
  ];

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__tag">Poultry Market Insight Project</p>
          <h1>把家禽交易行情做成一個有洞察、可瀏覽的作品網站</h1>
          <p className="hero__lead">
            這一版已經接上真實資料，開始把白肉雞與雞蛋的價格走勢、價差與市場節奏，
            整理成一個可以瀏覽、理解、延伸分析的作品頁。
          </p>
          <div className="hero__latest">
            <span>最新資料日</span>
            <strong>{siteData.summary?.latestDate ?? "尚未載入"}</strong>
            <p>目前頁面會優先讀取從 `data.gov.tw/dataset/7536` 轉出的正式資料檔。</p>
          </div>
          <div className="hero__actions">
            <a href="#insights" className="button button--primary">查看分析模組</a>
            <a href="#snapshot" className="button button--ghost">看市場快照</a>
          </div>
        </div>
        <div className="hero__panel">
          <p className="eyebrow">資料集摘要</p>
          <ul className="stat-list">
            <li><span>資料來源</span><strong>{siteData.meta?.source ?? "政府資料開放平臺 data.gov.tw"}</strong></li>
            <li><span>更新頻率</span><strong>每日</strong></li>
            <li><span>分析主題</span><strong>{siteData.meta?.dataset ?? "白肉雞 / 雞蛋"}</strong></li>
            <li><span>資料筆數</span><strong>{siteData.meta?.records ?? "範例"} 筆</strong></li>
            <li><span>時間範圍</span><strong>{siteData.meta?.dateRange?.start ?? "-"} 至 {siteData.meta?.dateRange?.end ?? "-"}</strong></li>
          </ul>
          <a className="source-link" href={siteData.meta?.sourceUrl ?? "https://data.gov.tw/dataset/7536"} target="_blank" rel="noreferrer">
            開啟原始資料集頁面
          </a>
        </div>
      </section>

      <section className="section" id="snapshot">
        <div className="section-heading">
          <p className="eyebrow">Market Snapshot</p>
          <h2>先看現在市場在哪個位置，再往下讀趨勢與價差</h2>
        </div>
        <div className="snapshot-grid">
          {snapshotCards.map((item) => (
            <article key={item.label} className="snapshot-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--alt">
        <div className="section-heading">
          <p className="eyebrow">Reading Guide</p>
          <h2>這份資料最值得看的，不是單一價格，而是三種結構性訊號</h2>
          <p className="section-copy">
            白肉雞規格差異、雞蛋上下游價差，以及近 30 天的價格節奏，是目前這個作品頁最核心的三條閱讀線。
          </p>
        </div>
        <div className="insight-grid">
          {insightCards.map((item) => (
            <article key={item.title} className="insight-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="insights">
        <div className="section-heading">
          <p className="eyebrow">Visual Modules</p>
          <h2>目前先把趨勢線與價差摘要做成可快速閱讀的分析模組</h2>
          <p className="section-copy">
            這一版先專注在最近 30 天，讓使用者快速掌握白肉雞與雞蛋價格的現況；下一步可以再往月份、節慶與多年比較延伸。
          </p>
        </div>
        <div className="charts-grid">
          <LineChart
            title="White Broiler"
            subtitle="白肉雞 2.0Kg 以上走勢"
            color="#cc5a2f"
            data={siteData.series.broilerLarge}
          />
          <LineChart
            title="Egg Logistics"
            subtitle="雞蛋大運輸價走勢"
            color="#257179"
            data={siteData.series.eggWholesale}
          />
          <SpreadBars
            title="Price Spread"
            subtitle="優先呈現的分析比較"
            items={siteData.spreads}
          />
        </div>
      </section>

      <section className="section section--alt">
        <div className="section-heading">
          <p className="eyebrow">What The Data Says</p>
          <h2>從這批資料先看到的訊號</h2>
        </div>
        <div className="story-grid">
          <article className="story-card">
            <h3>白肉雞近期相對平穩</h3>
            <p>
              近 30 天白肉雞 2.0Kg 以上價格整體呈現 {broilerTrend.direction}，
              變動幅度約 {broilerTrend.delta >= 0 ? "+" : ""}{broilerTrend.delta.toFixed(1)} 元/台斤。
            </p>
          </article>
          <article className="story-card">
            <h3>雞蛋價差仍有傳導空間</h3>
            <p>
              目前雞蛋產地價與大運輸價之間，近 30 日平均價差約為
              {" "}{siteData.spreads[1]?.value.toFixed(1) ?? "-"} 元/台斤，適合再往通路與運輸成本變化延伸。
            </p>
          </article>
          <article className="story-card">
            <h3>這份資料很適合做時間序列作品</h3>
            <p>
              現在已經整理出 {siteData.meta?.records ?? "-"} 筆日資料，
              能往月平均、節慶前後比較、異常波動區間與歷年重疊走勢繼續擴寫。
            </p>
          </article>
        </div>
      </section>

      <section className="section" id="seasonality">
        <div className="section-heading">
          <p className="eyebrow">Seasonality Preview</p>
          <h2>再往前一步看，這份資料其實已經能讀出月份節奏</h2>
          <p className="section-copy">
            下面這組月平均不是只看最近幾天，而是把歷年資料按月份重新整理，作為第二版的季節性預覽。
          </p>
        </div>
        <div className="charts-grid">
          <MonthlyBars
            title="Monthly Pattern"
            subtitle="白肉雞 2.0Kg 以上月平均"
            colorClassName="month-bars__fill--warm"
            items={siteData.seasonality?.broilerLargeMonthly ?? []}
          />
          <MonthlyBars
            title="Monthly Pattern"
            subtitle="雞蛋大運輸價月平均"
            colorClassName="month-bars__fill--cool"
            items={siteData.seasonality?.eggWholesaleMonthly ?? []}
          />
          <div className="story-grid story-grid--full">
            {highlightCards.map((item) => (
              <article key={item.title} className="story-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Data Workflow</p>
          <h2 id="workflow">資料流與後續自動更新方式</h2>
          <p className="section-copy">
            現在的結構已經能從原始資料走到網站用 JSON，後續只要把自動更新補齊，就能成為持續更新的公開作品。
          </p>
        </div>
        <div className="workflow">
          <div className="workflow__diagram">
            <div>data.gov.tw 資料集頁面</div>
            <div>Python 清理腳本</div>
            <div>網站用 JSON</div>
            <div>Next.js + Vercel</div>
          </div>
          <div className="workflow__steps">
            {roadmap.map((step, index) => (
              <div key={step} className="workflow__step">
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">What Comes Next</p>
          <h2>下一階段可以把它從展示頁，推進成更完整的數據作品</h2>
        </div>
        <div className="next-grid">
          <article className="next-card">
            <h3>資料處理</h3>
            <p>下載原始資料後，先標準化日期、欄位型別、缺值與數值格式，再產生分析用欄位與網站 JSON。</p>
          </article>
          <article className="next-card">
            <h3>分析主題</h3>
            <p>加入月度平均、節慶前後比較、30 日移動平均與波動區間，讓 insight 更有說服力。</p>
          </article>
          <article className="next-card">
            <h3>自動化</h3>
            <p>把抓資料和轉 JSON 的流程交給 GitHub Actions，讓網站可以按日更新。</p>
          </article>
        </div>
      </section>
    </main>
  );
}
