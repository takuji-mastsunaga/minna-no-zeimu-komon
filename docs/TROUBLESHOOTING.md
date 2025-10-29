# 🔧 トラブルシューティングガイド

よくある問題と解決方法をまとめました。

---

## 📑 目次

1. [GAS関連](#gas関連)
2. [Stripe決済関連](#stripe決済関連)
3. [Google Sheets関連](#google-sheets関連)
4. [Webhook関連](#webhook関連)
5. [LP2（詳細入力ページ）関連](#lp2詳細入力ページ関連)
6. [Vercelデプロイ関連](#vercelデプロイ関連)

---

## GAS関連

### ❌ `unknown_action` エラー

**症状**:
- フロントエンドからGASを呼び出すと `unknown_action` エラー

**原因**:
- GASが最新バージョンでデプロイされていない
- HTMLのGAS_API_URLが古いデプロイIDを参照している

**解決方法**:
1. GASを最新バージョンで再デプロイ
2. 新しいWeb App URLを取得
3. HTMLファイルのGAS_API_URLを更新
4. Vercelへ再デプロイ

---

### ❌ `Exception: https://api.stripe.com のリクエストに失敗しました（エラー：400）`

**症状**:
- Stripe APIへのリクエストが400エラー

**原因**:
- `line_items`の形式が正しくない
- Price IDが存在しない、または環境が異なる

**解決方法**:
1. **Price IDの確認**:
   - Stripe Dashboardで該当のPrice IDが存在するか確認
   - テストモード/本番モードが正しいか確認

2. **API キーの確認**:
   - GASスクリプトプロパティの`STRIPE_MODE`を確認
   - `STRIPE_SECRET_KEY_TEST` または `STRIPE_SECRET_KEY_LIVE`が正しいか確認

3. **ログの確認**:
   - GAS実行ログ（`Logger.log`）を確認
   - エラーメッセージの詳細を確認

---

### ❌ `「[object Object]」を int に変換できません`

**症状**:
- `updatePaymentStatus`でエラー

**原因**:
- `findRowIndexByUUID`がオブジェクトを返すように変更されたが、古いコードが数値を期待している

**解決方法**:
1. `findRowIndexByUUID`の戻り値を確認
2. `info.rowIndex`でアクセスする
3. GASを最新バージョンに更新

---

## Stripe決済関連

### ❌ 決済ページにリダイレクトされない

**症状**:
- 「申し込みをする」ボタンをクリックしても決済ページに移動しない
- 「保存に失敗しました」とエラー表示

**原因**:
- GAS APIエラー
- Price IDの環境ミスマッチ
- ネットワークエラー

**解決方法**:
1. **ブラウザのコンソールを確認**:
   - F12を押してコンソールを開く
   - エラーメッセージを確認

2. **GAS実行ログを確認**:
   - Apps Scriptエディタ → 実行数 → 最新のログを確認

3. **Price IDを確認**:
   - Stripe DashboardでPrice IDが存在するか確認
   - STRIPE_MODEが正しいか確認（test or live）

---

### ❌ 決済後、LP2にリダイレクトされない

**症状**:
- 決済完了後、404 NOT FOUNDエラー

**原因**:
- `LP2_DETAIL_URL`が古いVercel URLを参照している
- LP2ファイルがデプロイされていない

**解決方法**:
1. **GASのLP2_DETAIL_URLを確認**:
```javascript
const LP2_DETAIL_URL = 'https://minna-no-zeimu-komon.vercel.app/lp2-detail.html';
```

2. **LP2ファイルの存在確認**:
   - `lp2-detail.html`がプロジェクトルートに存在するか確認

3. **Vercel Production URLを使用**:
   - Preview URLではなく、Production URLを使用する

---

### ❌ Webhook が 302 ERR または 401 ERR

**症状**:
- Stripe Webhook Logsに `302 ERR` または `401 ERR`

**原因**:
- Webhook URLが正しくない（`/exec`が抜けている）
- GAS Web Appのアクセス権限が「全員」になっていない

**解決方法**:
1. **Webhook URLを確認**:
   - 正しい形式: `https://script.google.com/macros/s/【ID】/exec`
   - `/exec`が最後に付いているか確認

2. **GAS アクセス権限を確認**:
   - デプロイ → デプロイを管理
   - アクセスできるユーザー: 「全員（匿名ユーザーを含む）」

3. **GASを再デプロイ**:
   - 新しいバージョンでデプロイ
   - 新しいURLをStripe Webhookに設定

---

## Google Sheets関連

### ❌ データがGoogle Sheetsに保存されない

**症状**:
- 申し込み完了後、Sheetsにデータが表示されない

**確認項目**:

1. **SPREADSHEET_IDが正しいか**:
```javascript
const SPREADSHEET_ID = '19YI0cjUlgznSX-T3KA8AuknTjNlmHMuQHBfoXKZTBdg'; // 本番
```

2. **GAS実行ログを確認**:
   - エラーが発生していないか確認

3. **シートの存在確認**:
   - `マスタ`, `pending_applications`, `keys`, `webhook_logs` シートが存在するか

4. **権限の確認**:
   - GASがスプレッドシートにアクセス権限を持っているか

---

### ❌ pending_applicationsにはあるが、masterに移動されない

**症状**:
- 決済完了したのに、masterシートにデータが移動されない

**原因**:
- Webhookが正常に動作していない
- `moveFromPendingToMaster`でエラー

**解決方法**:
1. **webhook_logsシートを確認**:
   - `checkout.session.completed`イベントが記録されているか
   - エラーが記録されていないか

2. **Stripe Webhook Logsを確認**:
   - Webhook が正常に200 OKを返しているか

3. **手動でテスト**:
```javascript
// GASエディタでテスト実行
function testMoveFromPendingToMaster() {
  var uuid = '【実際のUUID】';
  var paymentData = {
    status: 'completed',
    uuid: uuid,
    paymentDate: new Date().toISOString(),
    customerId: 'test_customer',
    subscriptionId: 'test_sub',
    email: 'test@example.com'
  };
  var result = moveFromPendingToMaster(uuid, paymentData);
  Logger.log(result);
}
```

---

## Webhook関連

### ❌ Webhookが複数回呼ばれる（重複データ）

**症状**:
- 同じデータがmasterシートに複数行追加される

**原因**:
- Stripeが自動リトライしている
- 冪等性（idempotency）の実装が不完全

**解決方法**:
1. **最新版のGASコードを使用**:
   - `moveFromPendingToMaster`に冪等性チェックが実装されている

2. **webhook_logsで確認**:
   - `Already in master row`のログが記録されていれば正常

3. **既存の重複データを削除**:
   - 手動で重複行を削除
   - UUIDで識別

---

## LP2（詳細入力ページ）関連

### ❌ LP2で「無効なセッションIDです」エラー

**症状**:
- LP2にアクセスすると認証エラー

**原因**:
- Session IDが`keys`シートのF列に保存されていない
- URLの`session_id`パラメータが正しくない

**解決方法**:
1. **keysシートを確認**:
   - F列（sessionId）にSession IDが保存されているか確認
   - テスト関数で確認: `testShowKeysSheet()`

2. **createStripeCheckoutSessionを確認**:
```javascript
// keysシートにSession IDを保存
keysSheet.getRange(i + 1, 6).setValue(session.id); // F列
```

3. **最新版のGASコードを使用**

---

### ❌ LP2で「メールアドレスが見つかりません」エラー

**症状**:
- LP2簡易認証で「メールアドレスが見つかりません」

**原因**:
- masterシートのE列（メールアドレス）が空

**解決方法**:
1. **Stripe Sessionからメール取得を確認**:
```javascript
// handleCheckoutCompleted内
const email = session.customer_details?.email || session.customer_email || '';
```

2. **moveFromPendingToMasterでE列に保存**:
```javascript
master.getRange(masterRowIndex, 5).setValue(email);
```

3. **Stripe Checkoutでメール入力を必須に**:
   - Stripe Checkout設定で`billing_address_collection`を有効化

---

### ❌ LP2データが保存されない（AG-AU列が空）

**症状**:
- LP2フォームを送信しても、Sheetsに反映されない

**原因**:
- フロントエンドのデータキー名とGASの期待するキー名が不一致
- `buildLP2Values_`のマッピングが間違っている

**解決方法**:
1. **フロントエンドのデータキー名を確認**:
```javascript
const data = {
  corpName: corpName,
  corpPostal: corpPostal,
  // ...
};
```

2. **GASの`buildLP2Values_`を確認**:
```javascript
data.corpName || '',  // AG列
data.corpPostal || '', // AH列
// ...
```

3. **キー名を一致させる**

4. **テスト関数で確認**:
```javascript
testSaveLP2DataIndividual();
```

---

### ❌ 🧪 テスト環境で`tak`が動かない

**症状**:
- テスト版LP2で`tak`と入力しても認証できない

**原因**:
- テスト用GAS（Code-test.gs）がデプロイされていない
- テスト用HTMLのGAS_API_URLが本番用を参照している

**解決方法**:
1. **Code-test.gsをデプロイ**:
   - テスト用Apps Scriptプロジェクトでデプロイ

2. **テスト用HTMLのURLを更新**:
```javascript
// lp2-detail-test.html
const GAS_API_URL = '【テスト用GAS URL】';
```

3. **Vercel再デプロイ**

---

## Vercelデプロイ関連

### ❌ `vercel --prod` でエラー

**症状**:
- デプロイコマンドでエラーが発生

**解決方法**:
1. **Vercelにログイン**:
```bash
vercel login
```

2. **プロジェクトをリンク**:
```bash
vercel link
```

3. **再度デプロイ**:
```bash
vercel --prod
```

---

### ❌ デプロイ後も古いバージョンが表示される

**症状**:
- Vercelへデプロイしたのに変更が反映されない

**原因**:
- ブラウザのキャッシュ
- Vercelのキャッシュ

**解決方法**:
1. **スーパーリロード**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **シークレットモードで確認**

3. **Vercel Dashboardで確認**:
   - 最新のデプロイが成功しているか確認

---

## 🆘 それでも解決しない場合

### デバッグ手順

1. **ログを確認**:
   - GAS実行ログ
   - webhook_logsシート
   - ブラウザのコンソール
   - Stripe Webhook Logs

2. **テスト関数を実行**:
   - GASエディタで各種テスト関数を実行
   - エラーメッセージを確認

3. **バージョンを確認**:
   - GASのバージョン
   - デプロイID
   - HTMLのGAS_API_URL

4. **環境を確認**:
   - テスト環境 or 本番環境
   - SPREADSHEET_ID
   - STRIPE_MODE

### サポート連絡先

**Email**: minzei@solvis-group.com  
**対応時間**: 平日 9:00-18:00

---

**最終更新**: 2025-10-29  
**バージョン**: v1.0

