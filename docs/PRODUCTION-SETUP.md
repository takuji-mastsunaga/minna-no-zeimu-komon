# 📁 本番環境セットアップガイド

## 🎯 概要

本番環境は実際のお客様が使用する環境です。慎重な管理が必要です。

---

## 📂 ファイル構成

```
決済LP/
└── 本番フォルダ/
    ├── Code.gs（本番用GAS）
    ├── 1218tst.html（LP1）
    ├── lp2-detail.html（LP2）
    └── docs/
        ├── PRODUCTION-SETUP.md（本ファイル）
        ├── PRODUCTION-CHANGELOG.md（変更履歴）
        └── PRODUCTION-DEPLOYMENT.md（デプロイ手順書）
```

---

## 🌐 本番環境情報

### Google Sheets

| 項目 | 値 |
|---|---|
| **スプレッドシート名** | みんなの税務顧問 - 本番 |
| **スプレッドシートID** | `19YI0cjUlgznSX-T3KA8AuknTjNlmHMuQHBfoXKZTBdg` |
| **URL** | [スプレッドシートを開く](https://docs.google.com/spreadsheets/d/19YI0cjUlgznSX-T3KA8AuknTjNlmHMuQHBfoXKZTBdg/edit?usp=sharing) |
| **シート構成** | `master`, `pending_applications`, `keys`, `webhook_logs` |

### Apps Script

| 項目 | 値 |
|---|---|
| **プロジェクト名** | 1218tst Backend（本番） |
| **スクリプトID** | `18OwxBYQYtSQ_M9FLNdChGZmfDUh7G3RJrxviB3XMSMxrziXgweqMqJgF` |
| **URL** | [Apps Script を開く](https://script.google.com/home/projects/18OwxBYQYtSQ_M9FLNdChGZmfDUh7G3RJrxviB3XMSMxrziXgweqMqJgF/edit) |
| **ファイル** | `Code.gs` |
| **現在のバージョン** | v33 |
| **最新デプロイID** | `AKfycbxOzL6nobt5YybWDIz8Vk3wbatxxdkixmoeT-ACQBxP4UtFu6TqZ9LpZnvMKV2kybOG` |
| **Web App URL** | `https://script.google.com/macros/s/AKfycbxOzL6nobt5YybWDIz8Vk3wbatxxdkixmoeT-ACQBxP4UtFu6TqZ9LpZnvMKV2kybOG/exec` |

### Vercel

| 項目 | 値 |
|---|---|
| **プロジェクト名** | minna-no-zeimu-komon |
| **Production URL** | `https://minna-no-zeimu-komon.vercel.app` |
| **LP1 (申し込みフォーム)** | `https://minna-no-zeimu-komon.vercel.app/1218tst.html` |
| **LP2 (詳細入力ページ)** | `https://minna-no-zeimu-komon.vercel.app/lp2-detail.html` |

### Stripe

| 項目 | 値 |
|---|---|
| **モード** | `test`（現在）→ `live`（反映時） |
| **Price IDs** | テスト用Price IDを使用中 |
| **Webhook URL** | GAS Web App URL（上記） |

---

## ⚙️ スクリプトプロパティ

以下のプロパティがApps Scriptに設定されています：

| プロパティ名 | 用途 |
|---|---|
| `STRIPE_MODE` | Stripeのモード（`test` or `live`） |
| `STRIPE_PUBLISHABLE_KEY_LIVE` | Stripe本番用公開可能キー |
| `STRIPE_SECRET_KEY_LIVE` | Stripe本番用シークレットキー |
| `STRIPE_PUBLISHABLE_KEY_TEST` | Stripeテスト用公開可能キー |
| `STRIPE_SECRET_KEY_TEST` | Stripeテスト用シークレットキー |
| `STRIPE_WEBHOOK_SECRET_TEST` | Stripe Webhook署名シークレット |

---

## 🚀 デプロイ手順

### 1. GASの更新

```
1. Apps Scriptエディタを開く
2. Code.gsを編集
3. 保存（Ctrl+S / Cmd+S）
4. デプロイ → 「新しいデプロイ」
5. バージョン番号を入力（例: v34）
6. 「デプロイ」をクリック
7. 新しいWeb App URLを取得
```

### 2. HTMLファイルの更新

```
1. 1218tst.html と lp2-detail.html を開く
2. GAS_API_URLを新しいURLに更新
3. 保存
```

### 3. Vercelへのデプロイ

```bash
cd /Users/takujimatsunaga/minna-no-zeimu-komon
vercel --prod
```

### 4. Stripe Webhook URLの更新

```
1. Stripe Dashboardを開く
2. 開発者 → Webhooks
3. 該当のWebhookエンドポイントを選択
4. エンドポイントURLを新しいGAS URLに更新
5. 保存
```

---

## ⚠️ 重要な注意事項

### 🔴 本番環境の更新ルール

1. **テスト環境で十分に検証してから更新すること**
2. **変更内容は必ずCHANGELOG.mdに記録すること**
3. **更新前に必ずバックアップを取ること**
4. **顧客への影響を常に考慮すること**
5. **営業時間外のデプロイを推奨**

### 📅 更新タイミング

- **推奨**: テスト環境で検証完了後、適切なタイミングで反映
- **頻度**: 必要に応じて（ただし慎重に）
- **通知**: 重要な変更は事前に関係者に通知

### 🔒 セキュリティ

- **API キーは絶対に公開しないこと**
- **スクリプトプロパティの値は慎重に管理**
- **テスト用と本番用の混同に注意**

---

## 📞 緊急時の連絡先

システムに問題が発生した場合:
- **担当者**: （担当者名を記入）
- **Email**: minzei@solvis-group.com
- **対応時間**: 平日 9:00-18:00

---

## 📚 関連ドキュメント

- [テスト環境セットアップガイド](./TEST-SETUP.md)
- [変更履歴](./PRODUCTION-CHANGELOG.md)
- [デプロイ手順書](./PRODUCTION-DEPLOYMENT.md)
- [トラブルシューティング](./TROUBLESHOOTING.md)

---

**最終更新日**: 2025-10-29  
**バージョン**: v1.0  
**作成者**: AI Assistant

