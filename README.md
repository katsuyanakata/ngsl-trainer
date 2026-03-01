# NGSL Learn Screen (Minimal)

NGSL単語学習のミニマルUI実装です。

## Features

- 1スクリーン完結のLearn画面
- 表示は最初 `word` のみ
- タップ/クリックで段階開示（`0 -> 1 -> 2`）
  - `reveal=1`: `意味`
  - `reveal=2`: `意味 + 例文 + スワイプ誘導UI`
- 評価はスワイプのみ
  - 左スワイプ: `Keep`
  - 右スワイプ: `Clear`
- スワイプ中は `KEEP / CLEAR` ラベルがフェードイン
- 初回のみ下部にスワイプヒントを表示（初回スワイプで非表示）
- スワイプ未到達時はスナップバック
- Undoは直前1回のみ
- 進捗はバー + `done/total` 表示
- Clearedページ（`/cleared`）とKeepページ（`/keep`）で一覧を確認可能
- 学習進捗とCleared一覧を `localStorage` に保存（リロード保持）

## Run

```bash
npm install
npm run dev
```

## Data

`/data/ngsl.json` を読み込みます。
同じスキーマでデータを差し替えると、そのまま語彙数を拡張できます。
