# 🎯 Stripe決済実装 - デプロイ手順書

## ✅ 実装完了項目

### Code.gs 実装済み機能

1. **Stripe APIキー管理**
   - プロパティストアから自動取得
   - test/live モード切り替え対応

2. **Price IDマッピング**
   - 消費税あり・なし × 年払い・月額 = 4パターン対応
   - 自動判定ロジック実装済み

3. **Stripe Checkout作成**
   - `createStripeCheckoutSession()` 関数
   - 基本プラン + オプション料金の動的追加
   - クーポン入力欄の自動表示
   - metadata設定（UUID紐付け）

4. **Webhook処理**
   - `handleStripeWebhook()` 関数
   - 決済完了・失敗イベント処理
   - サブスクリプションイベント処理
   - スプレッドシート自動更新

5. **APIエンドポイント**
   - `saveLP1AndCreateCheckout`: LP①保存 + Checkout作成
   - `stripeWebhook`: Webhook受信
   - `getApplicationStatus`: 申込状況取得

---

## 📋 デプロイ手順

### ステップ1: GASプロパティストア設定（必須）

```
Google Apps Script > プロジェクトの設定 > スクリプト プロパティ

追加するプロパティ:
┌────────────────────────────────┬────────────────────┐
│ プロパティ名                   │ 値                 │
├────────────────────────────────┼────────────────────┤
│ STRIPE_MODE                    │ test               │
│ STRIPE_SECRET_KEY_TEST         │ sk_test_51Rnvi... │
│ STRIPE_SECRET_KEY_LIVE         │ sk_live_51Rnvi... │
│ STRIPE_PUBLISHABLE_KEY_TEST    │ pk_test_51Rnvi... │
│ STRIPE_PUBLISHABLE_KEY_LIVE    │ pk_live_51Rnvi... │
└────────────────────────────────┴────────────────────┘

※ 開発中は STRIPE_MODE を "test" に設定
※ 本番リリース時に "live" に変更
```

### ステップ2: Code.gsをデプロイ

1. **コードを保存**
   ```
   Ctrl+S (Cmd+S) で保存
   ```

2. **デプロイ**
   ```
   右上の「デプロイ」> 「デプロイを管理」
   既存のデプロイを編集（または新しいデプロイを作成）
   
   設定:
   - 種類: ウェブアプリ
   - 次のユーザーとして実行: 自分
   - アクセスできるユーザー: 全員
   ```

3. **デプロイURLを確認**
   ```
   例: https://script.google.com/macros/s/AKfycby.../exec
   このURLをメモ（後で使用）
   ```

### ステップ3: スプレッドシート準備

Code.gsが自動で以下を作成します：
- マスタシートのG〜AA列: LP①データ
- マスタシートのAB〜AF列: 決済データ
- keysシート: UUID↔行番号対応表

特別な作業は不要（自動初期化）

---

## 🧪 テスト手順

### テスト1: GAS APIの動作確認

```bash
# ブラウザでGAS URLにアクセス
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

期待される応答:
{
  "status": "ok",
  "message": "1218tst Backend API is running",
  "timestamp": "2025-10-23T..."
}
```

### テスト2: プロパティストア確認

```javascript
// GASエディタで実行テスト関数を作成
function testStripeApiKey() {
  const apiKey = getStripeApiKey();
  Logger.log('API Key: ' + apiKey.substring(0, 20) + '...');
  Logger.log('Mode: ' + PropertiesService.getScriptProperties().getProperty('STRIPE_MODE'));
}

// 実行 > testStripeApiKey
// 実行ログを確認
```

### テスト3: Price ID判定

```javascript
function testPriceId() {
  // テストケース1: 消費税あり・年払い
  const priceId1 = getPriceId(true, 'yearly');
  Logger.log('消費税あり・年払い: ' + priceId1);
  // 期待値: price_1RyTiICcw6eshotqmv1ezW3r
  
  // テストケース2: 消費税なし・月額
  const priceId2 = getPriceId(false, 'monthly');
  Logger.log('消費税なし・月額: ' + priceId2);
  // 期待値: price_1RySpsCcw6eshotqirRAGtRZ
}
```

### テスト4: Stripe Checkout作成（実際の決済テスト）

```javascript
function testCreateCheckout() {
  const payment = {
    hasTaxObligation: false,
    planType: 'yearly',
    entityType: 'individual',
    options: [
      { name: '給与所得オプション', amount: 5000 }
    ]
  };
  
  const result = createStripeCheckoutSession('test-uuid-12345', payment);
  Logger.log(JSON.stringify(result));
  
  // result.url をブラウザで開いてStripe Checkoutページを確認
}
```

---

## 🔧 Stripe Webhookの設定

### ステップ1: Webhook URLの登録

```
Stripeダッシュボード > 開発者 > Webhook

エンドポイントを追加:
URL: https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

監視するイベント:
✅ checkout.session.completed
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
```

### ステップ2: Webhookシークレット（任意）

現在の実装では署名検証を省略していますが、本番環境では推奨：

```javascript
// handleStripeWebhook() に追加（将来）
const sig = e.headers['Stripe-Signature'];
const webhookSecret = PropertiesService.getScriptProperties().getProperty('STRIPE_WEBHOOK_SECRET');
// 署名検証ロジック
```

---

## 📊 決済フロー

```
ユーザー
  │
  ↓ 申込情報入力
LP① (1218tst.html)
  │
  ↓ POST: action=saveLP1AndCreateCheckout
GAS API (Code.gs)
  ├─ saveApplicationDataLP1()
  │  └─ スプレッドシート保存 + UUID発行
  │
  └─ createStripeCheckoutSession()
     └─ Stripe API呼び出し
        └─ Checkoutセッション作成
  │
  ↓ リダイレクト
Stripe Checkout
  │
  ↓ カード情報入力・決済
  │
  ├─ 成功 → LP②へリダイレクト
  │
  └─ Webhook (非同期)
     └─ GAS API: action=stripeWebhook
        └─ スプレッドシート更新
```

---

## 🔄 モード切り替え（Test → Live）

### 開発中（現在）
```
STRIPE_MODE = test
↓
sk_test_... を使用
pk_test_... を使用
テストカードで決済
実際の請求なし
```

### 本番リリース時
```
1. GASプロパティストアで STRIPE_MODE を "live" に変更
2. Code.gsを再デプロイ（不要な場合もある）
3. Webhook URLを本番用に追加登録
4. 少額テスト決済で動作確認
5. 正式リリース
```

---

## 📝 スプレッドシートデータ構造

### マスタシート

```
A〜F列: 既存データ（LP①では使用しない）
G〜AA列: LP①データ（21列）
  G: 個人・法人
  H: 青色・白色
  I: 設立日
  J: 青色申告提出日
  K: 次回決算日
  L: インボイス番号
  M: 業種
  N: 専従者給与の支払い
  O: 役員報酬
  P: 給与所得
  Q: 不動産所得
  R: ふるさと納税
  S: 住宅ローン控除の申請
  T: 法定調書・年末調整セット
  U: 源泉納付（特例）
  V: 源泉納付（普通）
  W: FX所得
  X: 暗号資産の取引
  Y: プラン
  Z: 料金
  AA: 初年度合計金額

AB〜AF列: 決済データ（5列）
  AB: 決済ステータス (pending/checkout_created/completed/failed)
  AC: 決済ID (pi_xxxxx)
  AD: 決済日時 (ISO 8601)
  AE: Stripe Customer ID (cus_xxxxx)
  AF: Stripe Subscription ID (sub_xxxxx)
```

### keysシート

```
A列: uuid
B列: rowIndex (マスタシートの行番号)
C列: createdAt (作成日時)
D列: status (LP1_saved/LP2_saved)
```

---

## 🐛 トラブルシューティング

### エラー: "Stripe APIキーが設定されていません"

**原因**: プロパティストアにAPIキーが保存されていない

**解決策**:
```
1. Google Apps Script > プロジェクトの設定
2. スクリプト プロパティ
3. STRIPE_SECRET_KEY_TEST と STRIPE_SECRET_KEY_LIVE を追加
```

### エラー: "Invalid plan configuration"

**原因**: hasTaxObligation または planType が不正

**解決策**:
```
payment オブジェクトを確認:
{
  hasTaxObligation: true/false,
  planType: 'yearly' または 'monthly'
}
```

### Webhook が動作しない

**原因**: Webhook URLが正しく登録されていない

**解決策**:
```
1. Stripeダッシュボード > 開発者 > Webhook
2. エンドポイントURLを確認
3. テスト送信で動作確認
4. GASのログを確認（表示 > ログ）
```

---

## ✅ 実装完了チェックリスト

### 準備
- [x] Stripeアカウント作成
- [x] 商品・価格登録（4プラン）
- [x] Price ID取得
- [x] テスト環境APIキー取得
- [x] 本番環境APIキー取得

### GAS実装
- [x] Code.gs Stripe機能実装
- [x] プロパティストア設定
- [ ] デプロイ実行
- [ ] 動作テスト

### Stripe設定
- [ ] Webhook URL登録
- [ ] テスト決済実行
- [ ] Webhook動作確認

### フロントエンド（次のステップ）
- [ ] 1218tst.html修正
- [ ] LP②作成
- [ ] Vercelデプロイ

---

## 📞 次のアクション

1. **GASプロパティストアにAPIキーを保存**
2. **Code.gsをデプロイ**
3. **テスト実行**
4. **動作確認完了後、フロントエンド実装へ進む**





