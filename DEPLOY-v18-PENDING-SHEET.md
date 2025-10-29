# 🚀 v18デプロイ手順（一時シート方式）

## 📋 デプロイ前チェックリスト

- [ ] 現在のマスタシートにデータがある場合、バックアップを取得
- [ ] Stripe APIキーが正しく設定されているか確認
- [ ] GASコードを最新版にコピー準備完了

---

## 🔧 手順1: GAS再デプロイ

### 1-1. Google Apps Script エディタを開く
```
https://script.google.com/
```

### 1-2. Code.gsの内容を全て置き換え
```
/Users/takujimatsunaga/minna-no-zeimu-komon/gas-backend/Code.gs
```
の内容を全てコピーして、既存のCode.gsに上書き貼り付け

### 1-3. 保存
`Ctrl+S` または `Cmd+S` で保存

### 1-4. 新しいデプロイを作成
```
1. 「デプロイ」→「新しいデプロイ」をクリック
2. 設定:
   - 種類: ウェブアプリ
   - 説明: v18 - 一時シート方式 + Webhook詳細ログ
   - 実行ユーザー: 自分
   - アクセスできるユーザー: 全員（匿名ユーザーを含む）
3. 「デプロイ」をクリック
4. 新しいデプロイURLをコピー
```

**例**:
```
https://script.google.com/macros/s/AKfycby...xxxxx.../exec
```

---

## 🗂️ 手順2: スプレッドシート確認

### 2-1. 新しいシートが自動作成される
デプロイ後、初回リクエストで以下のシートが自動作成されます：

- ✅ `pending_applications` - 仮保存シート
- ✅ `webhook_logs` - Webhookログ

### 2-2. keysシートに新しい列が追加される
既存の`keys`シートに`sheetType`列が追加されます。

---

## 🔄 手順3: Stripe Webhook URL更新

### 3-1. Stripe Dashboardを開く
```
https://dashboard.stripe.com/test/webhooks
```

### 3-2. 既存のWebhookを編集
```
1. 既存のWebhook（GAS URL）をクリック
2. 「エンドポイントURL」を編集
3. 手順1-4でコピーしたv18のデプロイURLを貼り付け
4. 保存
```

### 3-3. テストWebhookを送信
```
1. 「テストWebhookを送信」をクリック
2. イベント: checkout.session.completed
3. 送信
4. ステータスが200 OKであることを確認
```

---

## 🎨 手順4: フロントエンド再デプロイ（オプション）

### 4-1. 1218tst.htmlのGAS_API_URL更新
```javascript
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycby...v18...xxxxx.../exec';
```

### 4-2. Vercelに再デプロイ
```bash
cd /Users/takujimatsunaga/minna-no-zeimu-komon
vercel --prod
```

---

## 🧪 手順5: 動作確認

### テスト1: 申込フォーム送信
```
✅ pending_applicationsシートに保存される
✅ keysシートにUUID登録（status='pending', sheetType='pending'）
✅ マスタシートには何も追加されない
✅ Stripe Checkoutページにリダイレクトされる
```

### テスト2: 決済完了
```
✅ マスタシートに新しい行が追加される
✅ G〜AA列にLP①データが記録される
✅ AB〜AF列に決済データが記録される
✅ pending_applicationsシートから該当行が削除される
✅ keysシートのstatusが'completed'、sheetTypeが'master'に更新される
```

### テスト3: Webhookログ確認
```
✅ webhook_logsシートにログが記録される
✅ doPost_start → webhook_detected → handleStripeWebhook → checkout.session.completed
✅ moveFromPendingToMaster → success
```

### テスト4: 決済キャンセル
```
✅ pending_applicationsシートにデータが残る
✅ マスタシートには何も追加されない
✅ keysシートのstatusが'pending'のまま
```

---

## 📊 手順6: webhook_logsシートの確認

### 正常なログの例
| Timestamp | Event Type | UUID | Status | Details | Error |
|---|---|---|---|---|---|
| 2025-10-24T... | doPost_start | | received | Request received | |
| 2025-10-24T... | webhook_detected | evt_xxxxx | processing | Event type: checkout.session.completed | |
| 2025-10-24T... | handleStripeWebhook | evt_xxxxx | processing | Event type: checkout.session.completed | |
| 2025-10-24T... | checkout.session.completed | abc-123-def | processing | Customer: cus_xxxxx, Subscription: sub_xxxxx | |
| 2025-10-24T... | moveFromPendingToMaster | abc-123-def | start | | |
| 2025-10-24T... | moveFromPendingToMaster | abc-123-def | found_pending | Pending row: 2 | |
| 2025-10-24T... | moveFromPendingToMaster | abc-123-def | written_to_master | Master row: 2 | |
| 2025-10-24T... | moveFromPendingToMaster | abc-123-def | deleted_from_pending | Deleted row: 2 | |
| 2025-10-24T... | moveFromPendingToMaster | abc-123-def | success | Moved to master row: 2 | |
| 2025-10-24T... | checkout.session.completed | abc-123-def | success | Moved to master row: 2 | |
| 2025-10-24T... | handleStripeWebhook | evt_xxxxx | success | Event processed: checkout.session.completed | |

---

## 🔧 手順7: クリーンアップトリガー設定（推奨）

### 7-1. トリガーを追加
```
1. Google Apps Script エディタ
2. 左メニュー「トリガー」アイコン（時計マーク）
3. 「トリガーを追加」をクリック
```

### 7-2. 設定
```
実行する関数: cleanupOldPendingData
イベントのソース: 時間主導型
時間ベースのトリガー: 日タイマー
時刻: 深夜0時〜1時
```

### 7-3. 保存
```
「保存」をクリック
```

これで、7日以上経過した決済未完了のデータが毎日自動削除されます。

---

## ⚠️ ロールバック手順（万が一問題が発生した場合）

### 1. 旧バージョンに戻す
```
1. GASエディタで「デプロイ」→「デプロイを管理」
2. v17（または前のバージョン）を選択
3. 「編集」→「アクティブなバージョン」に設定
```

### 2. Stripe Webhook URLを旧バージョンに戻す
```
Stripe Dashboard → Webhooks → エンドポイントURL編集
```

### 3. フロントエンドのGAS_API_URLを旧バージョンに戻す
```
1218tst.html の GAS_API_URL を v17のURLに変更
vercel --prod で再デプロイ
```

---

## 📝 デプロイ後の確認項目

### ✅ チェックリスト
- [ ] GAS v18デプロイ完了（デプロイURLを控えた）
- [ ] pending_applicationsシート自動作成を確認
- [ ] webhook_logsシート自動作成を確認
- [ ] keysシートにsheetType列追加を確認
- [ ] Stripe Webhook URL更新完了
- [ ] テストWebhook送信で200 OK確認
- [ ] フロントエンドのGAS_API_URL更新完了
- [ ] 申込フォーム送信テスト成功
- [ ] 決済完了テスト成功
- [ ] webhook_logsに正常なログ記録を確認
- [ ] マスタシートに決済データ記録を確認
- [ ] pending_applicationsから該当行削除を確認
- [ ] 決済キャンセルテスト成功
- [ ] クリーンアップトリガー設定完了

---

## 🎉 完了！

おめでとうございます！一時シート方式のデプロイが完了しました。

### 次のステップ
1. 本番環境での決済テスト
2. クリーンアップ動作の確認（7日後）
3. webhook_logsの定期確認

---

## 🆘 トラブルシューティング

### 問題: pending_applicationsシートが作成されない
**対処法**: GAS APIにアクセスしてシート作成をトリガー
```bash
curl https://script.google.com/macros/s/AKfycby...v18.../exec
```

### 問題: Webhookが302エラー
**対処法**:
1. GASの「アクセスできるユーザー」が「全員（匿名ユーザーを含む）」になっているか確認
2. デプロイIDが最新（v18）になっているか確認
3. Stripe Webhook URLが最新のデプロイIDを使用しているか確認

### 問題: データが移動されない
**対処法**:
1. webhook_logsシートでエラー内容を確認
2. Error列に詳細なエラーメッセージが記録されているはず
3. エラーメッセージに基づいて対処

---

**作成日**: 2025-10-24  
**バージョン**: v18  
**対象**: 一時シート方式 + Webhook詳細ログ




