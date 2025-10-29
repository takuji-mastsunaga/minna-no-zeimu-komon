# 📘 本番環境 変更履歴

本番環境への変更内容を記録します。

---

## フォーマット

```markdown
## YYYY-MM-DD - バージョン番号

### 追加 (Added)
- 新機能や新ファイル

### 変更 (Changed)
- 既存機能の変更

### 修正 (Fixed)
- バグ修正

### 削除 (Removed)
- 削除された機能

### デプロイ情報
- **GASバージョン**: vXX
- **デプロイID**: AKfycb...
- **反映者**: （担当者名）
- **テスト状況**: テスト環境で検証済み
- **ダウンタイム**: なし / XX分
```

---

## 2025-10-29 - v33（現在）

### 概要
LP2（詳細情報入力ページ）機能の実装完了

### 追加 (Added)
- LP2詳細情報入力ページ（lp2-detail.html）
- LP2簡易認証機能（メールアドレス最初の3文字）
- LP2データ保存機能（AG-AW列）
- LP2案内メール自動送信
- Session ID管理（keysシートF列）
- UUID管理（masterシートA列、AC列）
- Stripe SessionからEmail取得機能

### 変更 (Changed)
- 決済完了後のリダイレクト先をLP2詳細入力ページに変更
- `moveFromPendingToMaster`に冪等性チェックを追加
- BASIC_HEADERS（A-F列）の追加
- LP2_HEADERS（AG-AW列）の追加
- Vercel Production URLへの統一

### 修正 (Fixed)
- Webhook重複実行時のエラー処理
- Session ID保存処理の追加
- Email取得処理の修正（Stripe Sessionから）
- LP2データマッピングの修正

### デプロイ情報
- **GASバージョン**: v33
- **デプロイID**: `AKfycbxOzL6nobt5YybWDIz8Vk3wbatxxdkixmoeT-ACQBxP4UtFu6TqZ9LpZnvMKV2kybOG`
- **Web App URL**: `https://script.google.com/macros/s/AKfycbxOzL6nobt5YybWDIz8Vk3wbatxxdkixmoeT-ACQBxP4UtFu6TqZ9LpZnvMKV2kybOG/exec`
- **反映日**: 2025-10-XX（実際の日付を記入）
- **反映者**: （担当者名）
- **テスト状況**: 検証済み
- **ダウンタイム**: なし

---

## 2025-10-XX - v18

### 概要
pending_applicationsシートの導入

### 追加 (Added)
- 仮保存シート（pending_applications）
- `moveFromPendingToMaster`関数
- 詳細なWebhook Logging（webhook_logsシート）

### 変更 (Changed)
- LP1データを一時的にpending_applicationsに保存
- 決済完了時にmasterシートへ移動

### 修正 (Fixed)
- 決済失敗時のデータ保存問題

### デプロイ情報
- **GASバージョン**: v18
- **デプロイID**: `AKfycb...`（記録がある場合記入）
- **反映日**: 2025-10-XX
- **反映者**: （担当者名）

---

## 今後の予定変更

### 次回反映予定（v34）

**予定日**: テスト環境での検証完了後

**予定内容**:
- （TEST-CHANGELOG.mdから反映予定の内容を記入）

---

## 変更履歴の記入ルール

1. **日付は逆時系列**（新しいものが上）
2. **バージョン番号を明記**
3. **デプロイ情報を必ず記録**
4. **テスト状況を明記**
5. **影響範囲を明確に**
6. **ダウンタイムの有無を記録**
7. **重要な変更には ⚠️ マークを付ける**

---

**管理者**: （担当者名）  
**最終更新**: 2025-10-29

