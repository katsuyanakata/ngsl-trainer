# NGSL Learn Screen (Minimal)

NGSL単語学習のミニマルUI実装です。

## Features

- 1スクリーン完結のLearn画面
- 表示は最初 `word` のみ
- タップで段階開示（`0 -> 1 -> 2 -> 0`）
  - `reveal=1`: `pos + definition_en`
  - `reveal=2`: `example_en`
- 評価はスワイプのみ
  - 左スワイプ: `Again`
  - 右スワイプ: `Good`
- スワイプ未到達時はスナップバック
- Undoは直前1回のみ
- 進捗はドット表示
- 学習進捗を `localStorage` に保存（Due -> Unseenランダム優先）

## Run

```bash
npm install
npm run dev
```

## Data

`/data/ngsl.json` を読み込みます。
同じスキーマでデータを差し替えると、そのまま語彙数を拡張できます。
