# Stripe Webhook 設定ガイド

## 📋 概要

Stripe決済が完了した際に、Google Apps ScriptへWebhook通知を送信する設定手順です。

---

## 🔧 設定手順

### 1. Stripe Dashboardにアクセス

1. **Stripeダッシュボード**にログイン
2. **開発者 > Webhook** にアクセス
   - URL: https://dashboard.stripe.com/test/webhooks

### 2. Webhookエンドポイントを追加

#### ① 「エンドポイントを追加」ボタンをクリック

#### ② エンドポイントURLを入力

```
https://script.google.com/macros/s/AKfycbwvlaDlzwOvOGGP2BTGBOFiCAC2KNsTn39Mrk_HwF-Otn4RHtawtGn_j-omX_tUyBfQ/exec
```

#### ③ リッスンするイベントを選択

以下のイベントを選択してください：

##### 必須イベント（本番環境用）
- ✅ `checkout.session.completed` - Checkout完了時
- ✅ `payment_intent.succeeded` - 決済成功時
- ✅ `payment_intent.payment_failed` - 決済失敗時
- ✅ `customer.subscription.created` - サブスクリプション作成時
- ✅ `customer.subscription.updated` - サブスクリプション更新時
- ✅ `customer.subscription.deleted` - サブスクリプション削除時

##### オプション（推奨）
- `invoice.payment_succeeded` - 請求書支払い成功
- `invoice.payment_failed` - 請求書支払い失敗
- `charge.refunded` - 返金処理

#### ④ Webhookを保存

「エンドポイントを追加」ボタンをクリックして保存します。

---

## 🔑 Webhook署名シークレットの取得

### 1. 作成したWebhookをクリック

Webhook一覧から、今作成したWebhookをクリックします。

### 2. 「署名シークレット」をコピー

- **署名シークレット（Signing secret）**の欄に表示されている文字列をコピー
- 形式: `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX`

### 3. GASスクリプトプロパティに追加

#### Google Apps Scriptを開く
1. GASプロジェクト: https://script.google.com/home
2. 「1218tst Backend API」プロジェクトを開く
3. **⚙️ プロジェクトの設定** をクリック

#### スクリプトプロパティに追加
「スクリプトプロパティ」セクションで、以下を追加：

| プロパティ | 値 |
|----------|-----|
| `STRIPE_WEBHOOK_SECRET_TEST` | `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX` (コピーした署名シークレット) |

**保存**をクリック

---

## ✅ テスト手順

### 1. Stripe Dashboardでテストイベントを送信

1. Webhook詳細ページで**「イベントを送信」**ボタンをクリック
2. イベントタイプで**`checkout.session.completed`**を選択
3. 「イベントを送信」をクリック

### 2. GAS実行ログを確認

1. GASプロジェクトで**「実行数」**をクリック
2. 最新の実行ログを確認
3. エラーがなければ成功

### 3. Google Sheetsを確認

「マスタ」シートの最新行を確認：
- AC列：決済ID
- AD列：決済日時
- AE列：Stripe Customer ID
- AF列：Stripe Subscription ID

上記が更新されていれば**Webhook設定成功**です！

---

## 🎯 本番環境への適用

テスト環境で動作確認後、本番環境でも同じ設定を行います：

### 1. 本番環境のWebhookを作成

1. Stripeダッシュボードの右上で**「テストモード」をOFF**に切り替え
2. **開発者 > Webhook**にアクセス
3. 同じURLで新しいWebhookを作成
4. 同じイベントを選択

### 2. 本番環境の署名シークレットを取得

1. 本番Webhookの署名シークレットをコピー
2. GASスクリプトプロパティに追加：

| プロパティ | 値 |
|----------|-----|
| `STRIPE_WEBHOOK_SECRET_LIVE` | `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX` (本番の署名シークレット) |

---

## 🔍 トラブルシューティング

### Webhookが届かない場合

#### 1. URLが正しいか確認
```
https://script.google.com/macros/s/AKfycbwvlaDlzwOvOGGP2BTGBOFiCAC2KNsTn39Mrk_HwF-Otn4RHtawtGn_j-omX_tUyBfQ/exec
```

#### 2. GASのアクセス権限を確認
- **実行するユーザー**: 自分
- **アクセスできるユーザー**: 全員（匿名ユーザーを含む）

#### 3. Stripeダッシュボードでログを確認
- Webhook詳細ページで「試行の詳細」を確認
- HTTPステータスコードが`200`であれば成功

#### 4. GAS実行ログを確認
```javascript
Logger.log('Webhook received:', JSON.stringify(event));
```

---

## 📝 注意事項

### セキュリティ
- Webhook署名シークレットは**絶対に公開しない**
- GitHubなどにコミットしない
- GASスクリプトプロパティで管理する

### タイムアウト
- Webhookは**10秒以内**に応答する必要があります
- GASの処理が重い場合は、非同期処理を検討してください

### リトライ
- Stripeは失敗したWebhookを**最大3日間リトライ**します
- 失敗が続く場合、Webhookが自動的に無効化されます

---

## 🎉 完了確認

以下が全て完了したらOKです：

- ✅ テスト環境のWebhook設定完了
- ✅ テスト環境の署名シークレット設定完了
- ✅ テストイベント送信で動作確認完了
- ✅ Google Sheetsに決済データが保存されることを確認
- ✅ 本番環境のWebhook設定完了（後日）
- ✅ 本番環境の署名シークレット設定完了（後日）

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. Stripe Dashboard > Webhook > 試行の詳細
2. GAS 実行ログ
3. Google Sheets「マスタ」シートの最新行

エラーメッセージをコピーして、AIに相談してください。




