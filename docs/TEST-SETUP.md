# 🧪 テスト環境セットアップガイド

## 🎯 概要

テスト環境は開発・検証用の環境です。自由に変更・テストができます。

---

## 📂 ファイル構成

```
決済LP/
└── テスト用フォルダ/
    ├── Code-test.gs（テスト用GAS）
    ├── 1218tst-test.html（LP1テスト版）
    ├── lp2-detail-test.html（LP2テスト版）
    └── docs/
        ├── TEST-SETUP.md（本ファイル）
        ├── TEST-CHANGELOG.md（テスト環境変更履歴）
        └── TEST-FEATURES.md（テスト専用機能）
```

---

## 🌐 テスト環境情報

### Google Sheets

| 項目 | 値 |
|---|---|
| **スプレッドシート名** | みんなの税務顧問 - テスト |
| **スプレッドシートID** | `1uYoIdPx9gq0t0d-wnJLuA799ynUbYMoJtQew0ltRkM4` |
| **URL** | [スプレッドシートを開く](https://docs.google.com/spreadsheets/d/1uYoIdPx9gq0t0d-wnJLuA799ynUbYMoJtQew0ltRkM4/edit?gid=1371411121#gid=1371411121) |
| **シート構成** | `master`, `pending_applications`, `keys`, `webhook_logs` |

### Apps Script

| 項目 | 値 |
|---|---|
| **プロジェクト名** | 1218tst Backend（テスト） |
| **スクリプトID** | `1AubHBmTJP3nCob5X5PldKmdzZRYOBCaACFc7uOBuk6zn0MiXMbZMi-8k` |
| **URL** | [Apps Script を開く](https://script.google.com/home/projects/1AubHBmTJP3nCob5X5PldKmdzZRYOBCaACFc7uOBuk6zn0MiXMbZMi-8k/edit) |
| **ファイル** | `Code-test.gs` |
| **現在のバージョン** | v1（テスト） |
| **Web App URL** | ⚠️ デプロイ後に更新 |

### Vercel

| 項目 | 値 |
|---|---|
| **プロジェクト名** | minna-no-zeimu-komon |
| **Production URL** | `https://minna-no-zeimu-komon.vercel.app` |
| **LP1テスト版** | `https://minna-no-zeimu-komon.vercel.app/1218tst-test.html` |
| **LP2テスト版** | `https://minna-no-zeimu-komon.vercel.app/lp2-detail-test.html` |

### Stripe

| 項目 | 値 |
|---|---|
| **モード** | `test`（常にテストモード） |
| **Price IDs** | テスト用Price IDを使用 |
| **Webhook URL** | テスト用GAS Web App URL |

---

## ⚙️ スクリプトプロパティ

以下のプロパティがApps Scriptに設定されています：

| プロパティ名 | 値 | 備考 |
|---|---|---|
| `STRIPE_MODE` | `test` | 常にテストモード |
| `STRIPE_PUBLISHABLE_KEY_TEST` | `pk_test_...` | テスト用 |
| `STRIPE_SECRET_KEY_TEST` | `sk_test_...` | テスト用 |
| `STRIPE_WEBHOOK_SECRET_TEST` | `whsec_...` | テスト用 |

---

## 🚀 初期セットアップ手順

### ステップ1: GASプロジェクトにCode-test.gsをコピー

```
1. テスト用Apps Scriptプロジェクトを開く
2. 既存のCode.gsをバックアップ
3. gas-backend/Code-test.gsの内容を全てコピー
4. GASエディタに貼り付け
5. 保存（Ctrl+S / Cmd+S）
```

### ステップ2: スプレッドシートIDを確認

```javascript
// Code-test.gs の2行目
const SPREADSHEET_ID = '1uYoIdPx9gq0t0d-wnJLuA799ynUbYMoJtQew0ltRkM4'; // ✅ 正しいIDか確認
```

### ステップ3: GASをデプロイ

```
1. GASエディタで「デプロイ」→「新しいデプロイ」
2. 「種類の選択」→「ウェブアプリ」
3. 説明: "v1 - Test Environment"
4. 次のユーザーとして実行: 「自分」
5. アクセスできるユーザー: 「全員」
6. 「デプロイ」をクリック
7. Web App URLをコピー（例: https://script.google.com/macros/s/XXXXX/exec）
```

### ステップ4: HTMLファイルのGAS API URLを更新

#### 1218tst-test.html の更新

```javascript
// 675行目付近
const GAS_API_URL = '【ステップ3で取得したURL】'; // ここを更新
```

#### lp2-detail-test.html の更新

```javascript
// 410行目付近
const GAS_API_URL = '【ステップ3で取得したURL】'; // ここを更新
```

### ステップ5: Vercelへのデプロイ

```bash
cd /Users/takujimatsunaga/minna-no-zeimu-komon
vercel --prod
```

### ステップ6: 動作確認

```
1. https://minna-no-zeimu-komon.vercel.app/1218tst-test.html にアクセス
2. 「テスト版」バッジが表示されることを確認
3. 右下に「🧪 テスト環境」が表示されることを確認
4. フォームに入力してテスト決済を実行
5. テスト用Google Sheetsにデータが保存されることを確認
```

---

## 🧪 テスト専用機能

### LP2簡易テスト機能

LP1をスキップして、LP2のみを直接テストできる機能です。

#### 使い方

1. LP2テスト版にアクセス:
   ```
   https://minna-no-zeimu-komon.vercel.app/lp2-detail-test.html?session_id=test_session_001
   ```
   ※ session_idは任意の文字列でOK

2. 簡易認証で `tak` と入力

3. 「認証する」をクリック

4. **自動的に仮UUIDとテストデータが作成される**

5. LP2フォームが表示される

6. データを入力して保存

7. テスト用Google Sheetsに保存される

#### メリット

- ✅ LP1の入力が不要
- ✅ 決済のステップをスキップ
- ✅ LP2の開発・検証が迅速に
- ✅ いつでもLP2だけをテスト可能

---

## 🔄 更新手順

### GASの更新

```
1. Code-test.gsを編集
2. 保存
3. デプロイ → 「デプロイを管理」
4. 「新しいバージョン」をクリック
5. バージョン説明を入力
6. 「デプロイ」
```

### HTMLの更新

```
1. 1218tst-test.html または lp2-detail-test.html を編集
2. 保存
3. Vercelへデプロイ
```

```bash
cd /Users/takujimatsunaga/minna-no-zeimu-komon
vercel --prod
```

---

## ✅ テスト環境の利点

1. **自由に実験できる**
   - 新機能の実装
   - UIの変更
   - ロジックの修正

2. **本番に影響なし**
   - テスト用データベース
   - テスト用Stripe
   - 独立した環境

3. **迅速な検証**
   - 即座にデプロイ
   - すぐに動作確認
   - 問題があれば即修正

4. **安全な開発**
   - 失敗しても大丈夫
   - 顧客への影響ゼロ
   - 安心して試せる

---

## ⚠️ 注意事項

### 本番環境との乖離

- テスト環境と本番環境は独立しています
- テスト環境の変更は自動的に本番に反映されません
- 本番反映は別途手動で行う必要があります

### データの扱い

- テスト用スプレッドシートのデータは定期的にクリーンアップ可能
- 本番データと混同しないように注意
- テストデータは `TEST-` プレフィックスで識別可能

### Stripe決済

- 常にテストモードで動作
- テストカード（4242 4242 4242 4242）を使用
- 実際の決済は発生しません

---

## 📚 関連ドキュメント

- [本番環境セットアップガイド](./PRODUCTION-SETUP.md)
- [テスト環境変更履歴](./TEST-CHANGELOG.md)
- [本番反映チェックリスト](./DEPLOYMENT-CHECKLIST.md)
- [トラブルシューティング](./TROUBLESHOOTING.md)

---

**最終更新日**: 2025-10-29  
**バージョン**: v1.0  
**作成者**: AI Assistant

