# 家禽交易行情洞察作品網站

這是一個以「家禽交易行情(白肉雞/雞蛋)」資料集為核心的資料分析作品網站第一版，目標是把白肉雞與雞蛋的價格變化整理成一個可閱讀、可展示、可持續更新的專案。

資料集入口以政府資料開放平臺為準：

- `https://data.gov.tw/dataset/7536`
- 下載資源由該頁面的 JSON/CSV/XML 按鈕提供

## 專案定位

- 用公開資料完成一個從資料清理、分析到網站部署的完整作品。
- 第一版先專注在敘事型首頁與分析模組版型。
- 後續再接入農業部資料集，補上真實圖表與自動更新流程。

## 技術選型

- `Next.js`：網站頁面與 Vercel 部署
- `TypeScript`：型別安全與可維護性
- `Python + pandas`：資料清理與衍生欄位處理
- `GitHub Actions`：每日同步資料與重建網站資料檔

## 建議資料流程

1. 從 `data.gov.tw/dataset/7536` 下載原始資料
2. 在 `data/raw/` 保存原始檔
3. 用 Python 腳本清理資料，輸出到 `data/processed/`
4. 轉成前端使用的 `public/data/*.json`
5. 由 Vercel 部署網站

## 建議分析方向

1. 白肉雞不同規格的價格差異
2. 雞蛋產地價與大運輸價的價差與傳導
3. 農曆與節慶前後的價格波動
4. 長期趨勢、移動平均與高波動區間

## 目前已建立的內容

- `app/page.tsx`：首頁與分析敘事版型
- `components/`：簡單圖表元件
- `public/data/sample-insights.json`：範例資料
- `scripts/build_site_data.py`：網站資料輸出腳本佔位
- `.github/workflows/update-data.yml`：之後可接每日更新的 workflow

## 真實資料串接

目前已補上真實資料腳本：

- `scripts/fetch_data.py`：從 `data.gov.tw/dataset/7536` 對應的正式 JSON 資源抓取原始資料
- `scripts/build_site_data.py`：清理欄位、轉日期、計算價差與摘要、輸出網站 JSON

執行方式：

```bash
python3 scripts/build_site_data.py
```

如果你的電腦暫時無法直接連到資料資源網址，可以先從 [data.gov.tw/dataset/7536](https://data.gov.tw/dataset/7536) 手動下載 `JSON` 或 `CSV`，並放到以下其中一個路徑：

- `data/raw/poultry_market_source.json`
- `data/raw/poultry_market_source.csv`

之後再執行同一個指令，腳本會優先使用手動下載的檔案。

執行後會產生：

- `data/raw/poultry_market_raw.json`
- `data/processed/poultry_market_processed.json`
- `public/data/generated-insights.json`

首頁會優先讀取 `generated-insights.json`，若不存在才退回範例資料。

## 本地開發

先安裝依賴：

```bash
npm install
```

啟動開發環境：

```bash
npm run dev
```

## 下一步建議

- 驗證 `data.gov.tw` 資料資源欄位是否與目前腳本別名完全一致
- 補上月平均、移動平均與節慶前後比較圖
- 匯入 Vercel 進行第一次部署
- 再加入更多互動圖表與時間篩選
