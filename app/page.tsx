import sampleData from "../public/data/sample-insights.json";
import { LineChart } from "../components/LineChart";
import { SpreadBars } from "../components/SpreadBars";

const insightCards = [
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

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__tag">Poultry Market Insight Project</p>
          <h1>把家禽交易行情做成一個有洞察、可瀏覽的作品網站</h1>
          <p className="hero__lead">
            第一版先專注在白肉雞與雞蛋的價格走勢、價差與季節性觀察，
            用敘事型頁面整理資料來源、分析問題與視覺化方向。
          </p>
          <div className="hero__actions">
            <a href="#insights" className="button button--primary">查看分析模組</a>
            <a href="#workflow" className="button button--ghost">看實作流程</a>
          </div>
        </div>
        <div className="hero__panel">
          <p className="eyebrow">資料集摘要</p>
          <ul className="stat-list">
            <li><span>資料來源</span><strong>農業部開放資料</strong></li>
            <li><span>更新頻率</span><strong>每日</strong></li>
            <li><span>分析主題</span><strong>白肉雞 / 雞蛋</strong></li>
            <li><span>部署目標</span><strong>GitHub + Vercel</strong></li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Project Angle</p>
          <h2>這個專案不是只畫圖，而是把價格變動講成一個有邏輯的故事</h2>
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
          <h2>第一版先展示 3 個核心視角</h2>
        </div>
        <div className="charts-grid">
          <LineChart
            title="White Broiler"
            subtitle="白肉雞 2.0Kg 以上走勢"
            color="#cc5a2f"
            data={sampleData.series.broilerLarge}
          />
          <LineChart
            title="Egg Logistics"
            subtitle="雞蛋大運輸價走勢"
            color="#257179"
            data={sampleData.series.eggWholesale}
          />
          <SpreadBars
            title="Price Spread"
            subtitle="優先呈現的分析比較"
            items={sampleData.spreads}
          />
        </div>
      </section>

      <section className="section section--alt">
        <div className="section-heading">
          <p className="eyebrow">Data Workflow</p>
          <h2 id="workflow">資料流與後續自動更新方式</h2>
        </div>
        <div className="workflow">
          <div className="workflow__diagram">
            <div>農業部原始資料</div>
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
          <h2>下一階段把真實資料接進來後，就能往完整作品集版本推進</h2>
        </div>
        <div className="next-grid">
          <article className="next-card">
            <h3>資料處理</h3>
            <p>下載原始資料後，先標準化日期、欄位型別、缺值與數值格式，再產生分析用欄位。</p>
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
