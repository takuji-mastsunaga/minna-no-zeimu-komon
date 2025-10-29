# ファイル構成ドキュメント

## 📋 概要

本番用とテスト用のファイルを分離し、安全にテスト・開発ができる環境を整備しました。

---

## 🔥 本番用ファイル（実際の決済・データ保存）

### LP1（申し込みフォーム）
- **ファイル名**: `1218tst.html`
- **URL**: `https://minna-no-zeimu-komon.vercel.app/1218tst.html`
- **GAS API**: v33 本番用
- **用途**: 実際のお客様が使用する申し込みフォーム
- **特徴**:
  - Stripe本番決済
  - Google Sheets本番データ保存
  - LP2詳細ページへの自動リダイレクト

### LP2（詳細情報入力ページ）
- **ファイル名**: `lp2-detail.html`
- **URL**: `https://minna-no-zeimu-komon.vercel.app/lp2-detail.html`
- **GAS API**: v33 本番用
- **用途**: 決済完了後の詳細情報収集
- **特徴**:
  - 簡易認証（メールアドレスの最初の3文字）
  - 個人/法人に応じた動的フォーム
  - AG-AU列へのデータ保存

---

## 🧪 テスト用ファイル（開発・検証用）

### テスト用GAS
- **ファイル名**: `gas-backend/Code-test.gs`
- **Apps Script プロジェクトID**: `1AubHBmTJP3nCob5X5PldKmdzZRYOBCaACFc7uOBuk6zn0MiXMbZMi-8k`
- **Google Sheets ID**: `1uYoIdPx9gq0t0d-wnJLuA799ynUbYMoJtQew0ltRkM4`
- **用途**: テスト環境専用のバックエンド
- **特別機能**:
  - 🧪 LP2簡易テスト（`tak`認証）
  - 🧪 仮UUID自動生成
  - テスト用シートへのデータ保存

### LP1テスト版
- **ファイル名**: `1218tst-test.html`
- **URL**: `https://minna-no-zeimu-komon.vercel.app/1218tst-test.html`
- **GAS API**: テスト用（Code-test.gs）
- **用途**: 開発・検証・デモ用
- **特徴**:
  - ヘッダーに「テスト版」バッジ表示
  - 右下に固定で「🧪 テスト環境」表示
  - Stripeテスト決済
  - テスト用Google Sheetsへの保存
  - 本番データに影響なし

### LP2テスト版
- **ファイル名**: `lp2-detail-test.html`
- **URL**: `https://minna-no-zeimu-komon.vercel.app/lp2-detail-test.html`
- **GAS API**: テスト用（Code-test.gs）
- **用途**: LP2の開発・検証用
- **特別機能**: 🧪 **`tak`認証でLP1をスキップ**
- **特徴**:
  - ヘッダーに「テスト版」バッジ表示
  - 右下に固定で「🧪 テスト環境」表示
  - テスト用Google Sheetsへの保存
  - 本番データに影響なし
  - `tak`と入力するだけで仮データ作成→即座にLP2テスト可能

---

## 📊 ファイル比較表

| 項目 | 本番用 | テスト用 |
|---|---|---|
| **GASファイル** | `gas-backend/Code.gs` | `gas-backend/Code-test.gs` |
| **GASプロジェクトID** | `18OwxBYQYt...` | `1AubHBmTJP...` |
| **Google Sheets ID** | `19YI0cjUlg...` | `1uYoIdPx9g...` |
| **LP1ファイル** | `1218tst.html` | `1218tst-test.html` |
| **LP2ファイル** | `lp2-detail.html` | `lp2-detail-test.html` |
| **タイトル** | 契約までの確認事項 | 【テスト版】契約までの確認事項 |
| **表示バッジ** | なし | 「テスト版」赤バッジ |
| **固定表示** | なし | 右下に「🧪 テスト環境」 |
| **Stripe決済** | test→live（予定） | 常にtest |
| **特別機能** | なし | 🧪 `tak`認証 |
| **顧客影響** | あり | なし |

---

## 📁 ドキュメントフォルダ

全てのドキュメントは `/Users/takujimatsunaga/minna-no-zeimu-komon/docs/` に格納されています。

### ドキュメント一覧

| ファイル名 | 説明 | 対象者 |
|---|---|---|
| **README.md** | ドキュメント集の総合案内 | 全員 |
| **PRODUCTION-SETUP.md** | 本番環境セットアップガイド | 管理者 |
| **PRODUCTION-CHANGELOG.md** | 本番環境変更履歴 | 管理者 |
| **TEST-SETUP.md** | テスト環境セットアップガイド | 開発者 |
| **TEST-CHANGELOG.md** | テスト環境変更履歴 | 開発者 |
| **DEPLOYMENT-CHECKLIST.md** | 本番反映チェックリスト | 管理者 |
| **TROUBLESHOOTING.md** | トラブルシューティング | 全員 |

### 参照方法

1. **最初に読むドキュメント**: [docs/README.md](./docs/README.md)
2. **テスト環境をセットアップ**: [docs/TEST-SETUP.md](./docs/TEST-SETUP.md)
3. **本番環境を理解**: [docs/PRODUCTION-SETUP.md](./docs/PRODUCTION-SETUP.md)
4. **本番反映時**: [docs/DEPLOYMENT-CHECKLIST.md](./docs/DEPLOYMENT-CHECKLIST.md)
5. **問題発生時**: [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

## 🔧 テスト環境の使い方

### 方法1: 🧪 LP2簡易テスト（`tak`認証）

LP1と決済をスキップして、LP2のみを迅速にテストできます。

**手順**:
1. LP2テスト版にアクセス:
   ```
   https://minna-no-zeimu-komon.vercel.app/lp2-detail-test.html?session_id=test_session_001
   ```
   ※ `session_id`は任意の文字列でOK

2. 簡易認証で `tak` と入力

3. 「認証する」をクリック

4. **自動的に仮UUID（`TEST-`で始まる）とテストデータが作成される**

5. LP2フォームが表示される

6. データを入力して保存

7. テスト用Google Sheetsに保存される

**メリット**:
- ✅ LP1の入力不要
- ✅ 決済のスキップ
- ✅ 何度でも繰り返しテスト可能
- ✅ LP2の開発・検証が迅速に

---

### 方法2: 通常フロー（LP1→決済→LP2）

本番と同じフローでテストします。

**手順**:
1. テスト版LP1にアクセス
2. フォームに入力
3. Stripeテストカード（`4242 4242 4242 4242`）で決済
4. LP2詳細ページで情報入力
5. テスト用Google Sheetsでデータ確認

---

### セットアップ手順

詳細なセットアップ手順は [docs/TEST-SETUP.md](./docs/TEST-SETUP.md) を参照してください。

**概要**:
1. テスト用Google Sheetsの確認
2. テスト用GAS（Code-test.gs）のデプロイ
3. テスト用HTMLのGAS API URL更新
4. Vercelへのデプロイ
5. 動作確認

---

## 🚀 デプロイ方法

### Vercelへのデプロイ

```bash
cd /Users/takujimatsunaga/minna-no-zeimu-komon
vercel --prod
```

デプロイ後、以下のURLで確認：
- 本番LP1: `https://minna-no-zeimu-komon.vercel.app/1218tst.html`
- 本番LP2: `https://minna-no-zeimu-komon.vercel.app/lp2-detail.html`
- テストLP1: `https://minna-no-zeimu-komon.vercel.app/1218tst-test.html`
- テストLP2: `https://minna-no-zeimu-komon.vercel.app/lp2-detail-test.html`

---

## ⚠️ 重要な注意事項

### 本番ファイルの変更時

1. **必ずバックアップを取る**
   - 変更前に現在のファイルをコピー
   - Git commitで履歴を残す

2. **テスト環境で検証**
   - テスト版で動作確認
   - 複数のシナリオでテスト
   - 本番データに影響がないことを確認

3. **段階的なデプロイ**
   - まずテスト版をデプロイ
   - 問題なければ本番版をデプロイ
   - デプロイ後は本番環境で最終確認

### テストファイルの扱い

- テスト版は自由に修正可能
- 本番データに影響しない
- 新機能の開発はテスト版で行う
- 動作確認後、本番版に反映

---

## 📝 変更履歴

### 2025-10-29 v2.0
- テスト環境の完全分離
- テスト用GAS（Code-test.gs）の作成
- 🧪 LP2簡易テスト機能（`tak`認証）の実装
- 🧪 仮UUID自動生成機能の実装
- ドキュメント体系の整備（docs/フォルダ）
  - README.md（総合案内）
  - PRODUCTION-SETUP.md
  - TEST-SETUP.md
  - DEPLOYMENT-CHECKLIST.md
  - TROUBLESHOOTING.md
  - 変更履歴ドキュメント各種

### 2025-10-27 v1.0
- 本番用とテスト用のHTMLファイル分離
- `1218tst.html` / `1218tst-test.html` 作成
- `lp2-detail.html` / `lp2-detail-test.html` 作成
- UI統一（ホワイト基調、ティールアクセント）
- テスト版バッジとインジケーターの追加

---

## 🆘 トラブルシューティング

### Q: テスト版が本番データに書き込んでいる

**A**: GAS API URLがテスト用になっているか確認してください。テスト用GASは別のGoogle Sheetsを参照する必要があります。

### Q: テスト版バッジが表示されない

**A**: ブラウザキャッシュをクリアして、スーパーリロード（Cmd+Shift+R / Ctrl+Shift+R）を実行してください。

### Q: 本番版に変更を加えたい

**A**: まずテスト版で変更して動作確認後、本番版に同じ変更を適用してください。

---

## 📞 サポート

質問や問題がある場合は、以下にご連絡ください：
- Email: minzei@solvis-group.com



