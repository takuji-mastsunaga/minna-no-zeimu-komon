# 🔍 Webhook詳細ログガイド

## 📋 概要

Stripe WebhookのすべてのリクエストとGAS内部処理が`webhook_logs`シートに記録されます。

---

## 🗂️ ログシートの構造

### 列構成

| 列 | 内容 | 説明 |
|---|---|---|
| A | **Timestamp** | イベント発生日時（ISO 8601形式） |
| B | **Event Type** | イベントの種類（下記参照） |
| C | **UUID** | 申込ID（該当する場合） |
| D | **Status** | 処理ステータス |
| E | **Details** | 詳細情報 |
| F | **Error** | エラー内容（エラー時のみ） |

---

## 📝 イベントタイプ一覧

### 1. リクエスト受信
```
Event Type: doPost_start
Status: received
Details: Request received
```
→ GASがリクエストを受信した最初の証拠

### 2. Webhook検出
```
Event Type: webhook_detected
Status: processing
Details: Event type: checkout.session.completed
```
→ Stripe Webhookとして認識された

### 3. Webhook処理開始
```
Event Type: handleStripeWebhook
Status: processing
Details: Event type: checkout.session.completed
```
→ Webhook処理関数が呼び出された

### 4. Checkout完了処理
```
Event Type: checkout.session.completed
Status: processing
Details: Customer: cus_xxxxx, Subscription: sub_xxxxx
```
→ 決済完了イベントを処理中

### 5. 決済ステータス更新
```
Event Type: updatePaymentStatus
Status: start → found_row → success
Details: Row index: 10, Status: completed, Customer: cus_xxxxx
```
→ Google Sheetsに決済情報を書き込み

### 6. 処理完了
```
Event Type: handleStripeWebhook
Status: success
Details: Event processed: checkout.session.completed
```
→ すべての処理が正常に完了

---

## ❌ エラー診断

### 問題1: ログが全く記録されない
**原因**: リクエストがGASに到達していない
- **確認事項**:
  - Stripe DashboardのWebhook URLが正しいか
  - Webhook URLのデプロイIDが最新か（v18）
  - GASの「アクセスできるユーザー」が「全員（匿名ユーザーを含む）」になっているか

### 問題2: `doPost_start`のみ記録される
**原因**: JSON解析エラー、またはWebhook検出ロジックの問題
- **確認事項**:
  - `parse_error`イベントがあるか確認
  - Stripeが送信しているJSONの形式

### 問題3: `webhook_detected`まで記録されるが、その後が無い
**原因**: `handleStripeWebhook`関数内でエラーが発生
- **確認事項**:
  - Error列にエラーメッセージがあるか確認
  - GASの実行ログ（Apps Script エディタ → 実行ログ）を確認

### 問題4: `updatePaymentStatus`が`error: UUID not found`
**原因**: metadataにUUIDが含まれていない、またはkeysシートに登録されていない
- **確認事項**:
  - Checkoutセッション作成時にmetadata.uuidを設定しているか
  - keysシートに該当のUUIDがあるか確認

### 問題5: `updatePaymentStatus`が途中で止まる
**原因**: Google Sheetsへの書き込み権限エラー
- **確認事項**:
  - GASの実行ユーザーがスプレッドシートへの編集権限を持っているか
  - スプレッドシートIDが正しいか

---

## 🧪 テスト方法

### 1. GAS再デプロイ後の確認
```
1. Google Sheetsを開く
2. 「webhook_logs」シートが自動作成されることを確認
3. ヘッダー行が表示されることを確認:
   [Timestamp | Event Type | UUID | Status | Details | Error]
```

### 2. Webhookテスト
```
1. Stripe Dashboardで「テストWebhookを送信」
2. webhook_logsシートを開く
3. 新しい行が追加されることを確認
4. Event Typeが記録されることを確認
```

### 3. 決済フロー全体テスト
```
1. フロントエンドから申し込みを実行
2. Stripe Checkoutで決済完了
3. webhook_logsシートを確認:
   ✅ doPost_start
   ✅ webhook_detected
   ✅ handleStripeWebhook (processing)
   ✅ checkout.session.completed (processing)
   ✅ updatePaymentStatus (start → found_row → success)
   ✅ handleStripeWebhook (success)
```

---

## 📊 正常なログの例

| Timestamp | Event Type | UUID | Status | Details | Error |
|---|---|---|---|---|---|
| 2025-10-24T10:30:00Z | doPost_start | | received | Request received | |
| 2025-10-24T10:30:00Z | webhook_detected | evt_xxxxx | processing | Event type: checkout.session.completed | |
| 2025-10-24T10:30:00Z | handleStripeWebhook | evt_xxxxx | processing | Event type: checkout.session.completed | |
| 2025-10-24T10:30:00Z | checkout.session.completed | abc-123-def | processing | Customer: cus_xxxxx, Subscription: sub_xxxxx | |
| 2025-10-24T10:30:00Z | updatePaymentStatus | abc-123-def | start | Updating status: completed | |
| 2025-10-24T10:30:00Z | updatePaymentStatus | abc-123-def | found_row | Row index: 5 | |
| 2025-10-24T10:30:00Z | updatePaymentStatus | abc-123-def | success | Row: 5, Status: completed, Customer: cus_xxxxx | |
| 2025-10-24T10:30:00Z | handleStripeWebhook | evt_xxxxx | success | Event processed: checkout.session.completed | |

---

## 🎯 次のアクション

### ✅ GAS再デプロイ完了後
1. **Stripe Webhook URLを更新** (v18のデプロイIDに)
2. **テストWebhook送信** (Stripe Dashboard)
3. **webhook_logsシート確認** (ログが記録されているか)
4. **決済テスト実行** (フロントエンドから申し込み)
5. **マスタシートのAC-AF列確認** (決済データが記録されているか)

---

## 🆘 サポート

ログを確認しても問題が解決しない場合：
1. `webhook_logs`シートの最新5行をコピー
2. `keys`シートで該当のUUIDを検索
3. `マスタ`シートの該当行（AC-AF列）を確認
4. これらの情報を提供してください

---

**作成日**: 2025-10-24  
**バージョン**: v18  
**対象GAS**: Code.gs (Webhook詳細ログ機能付き)




