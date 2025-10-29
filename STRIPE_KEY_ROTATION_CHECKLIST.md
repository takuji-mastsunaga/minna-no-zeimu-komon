# 🔄 Stripeシークレットキー ローテーション チェックリスト

**作成日**: 2025年10月22日  
**実施予定日**: 明日

---

## 📋 変更が必要な箇所（全リスト）

### ✅ **変更が必要なもの**

#### 1. **Google Cloud Functions（tax-auto-folder-project）**
**場所**: `/Users/takujimatsunaga/tax-auto-folder-project/stripe-webhook/`

**変更内容**:
```bash
# .envファイルを作成・更新
cd /Users/takujimatsunaga/tax-auto-folder-project/stripe-webhook/
nano .env
```

**設定内容**:
```env
STRIPE_SECRET_KEY=sk_live_[新しいキー]
STRIPE_WEBHOOK_SECRET=whsec_...  # ←変更不要
GMAIL_USER=takuji.matsunaga@solvis-group.com
GMAIL_PASSWORD=[Appパスワード]
BASIC_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSdZSI6VG8kcZK91O691kG6HIQbA4AsjEQM1XpgY-hD1i4EK-Q/viewform
PREMIUM_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSfPx2lRHB6Y4mwGw6UwbMm_2TpyhfLSdSLEqQkXNwGmPDLWuA/viewform
```

**再デプロイ**:
```bash
# Google Cloud Functionsに再デプロイ
gcloud functions deploy stripeWebhook \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point stripeWebhook \
  --set-env-vars STRIPE_SECRET_KEY=sk_live_[新しいキー]
```

---

#### 2. **Vercel環境変数（stripe-webhook-email）**
**場所**: Vercelダッシュボード

**手順**:
1. https://vercel.com/tacks-projects-8e89a9f8/stripe-webhook-email にアクセス
2. **Settings** → **Environment Variables**
3. `STRIPE_SECRET_KEY` を見つける
4. 「Edit」をクリック → 新しいキーに更新
5. **Production**, **Preview**, **Development** 全てにチェック
6. 「Save」をクリック

**または、CLIで更新**:
```bash
cd /Users/takujimatsunaga/stripe-webhook-email
vercel env rm STRIPE_SECRET_KEY
vercel env add STRIPE_SECRET_KEY
# → Productionを選択 → 新しいキーを入力
```

---

#### 3. **Vercel環境変数（stripe-webhook-personal）**
**状態**: 未デプロイ（Vercelにリンクされていない）

**対応**: 
- 現在未使用のため、デプロイ時に新しいキーを設定

---

#### 4. **Vercel環境変数（stripe-webhook-public）**
**状態**: 未デプロイ（Vercelにリンクされていない）

**対応**: 
- 現在未使用のため、デプロイ時に新しいキーを設定

---

### ✅ **変更が不要なもの（確認のみ）**

#### 1. **minna-no-zeimu-komon プロジェクト**
**理由**: Stripe決済リンクのみ使用（シークレットキーは不使用）

**決済リンク一覧**:
- `cost.html`: 
  - 月払い: `https://buy.stripe.com/4gM7sK0SseGVaKB5en7Zu0e`
  - 年払い: `https://buy.stripe.com/cNi28qbx642h5qh5en7Zu0g`
- `cost.tax.html`:
  - 月払い: `https://buy.stripe.com/cNi4gybx61U905X36f7Zu0h`
  - 年払い: `https://buy.stripe.com/9B6fZg8kU6ap9Gx0Y77Zu0i`

**✅ これらのリンクは変更不要です**

---

#### 2. **Stripe Webhookエンドポイント**
**理由**: Stripeのメッセージにある通り、Webhookは**そのまま有効**

**Webhook URL**: 変更不要  
**Webhook Secret (`whsec_...`)**: 変更不要

---

#### 3. **既存顧客・サブスクリプション**
**理由**: Stripeアカウントレベルで管理されている

**影響なし**:
- 既存の顧客データ
- 継続中のサブスクリプション
- 決済履歴

---

## 📝 ローテーション実施手順

### **実施前の準備**
```bash
# 1. 現在のシステム状態を確認
cd /Users/takujimatsunaga/tax-auto-folder-project/stripe-webhook/
cat .env 2>/dev/null || echo ".envファイルが存在しません"

# 2. バックアップディレクトリを作成
mkdir -p ~/stripe-key-backup
echo "旧キー: sk_live_...PGr9" > ~/stripe-key-backup/old-key-$(date +%Y%m%d).txt
```

---

### **実施手順**

#### **ステップ1: 新しいキーを取得**
1. https://dashboard.stripe.com/apikeys にアクセス
2. 「キーをローリング」をクリック
3. 新しい `sk_live_...` キーをコピー
4. 安全な場所（パスワードマネージャー等）に保存

---

#### **ステップ2: 環境変数を更新**

**2-1. Google Cloud Functions**
```bash
# .envファイルを更新
cd /Users/takujimatsunaga/tax-auto-folder-project/stripe-webhook/
echo "STRIPE_SECRET_KEY=sk_live_[新しいキー]" > .env.new
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> .env.new
echo "GMAIL_USER=takuji.matsunaga@solvis-group.com" >> .env.new
echo "GMAIL_PASSWORD=[Appパスワード]" >> .env.new
echo "BASIC_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSdZSI6VG8kcZK91O691kG6HIQbA4AsjEQM1XpgY-hD1i4EK-Q/viewform" >> .env.new
echo "PREMIUM_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSfPx2lRHB6Y4mwGw6UwbMm_2TpyhfLSdSLEqQkXNwGmPDLWuA/viewform" >> .env.new

# バックアップと置き換え
mv .env .env.backup-$(date +%Y%m%d) 2>/dev/null || true
mv .env.new .env

# Google Cloud Functionsに再デプロイ
gcloud functions deploy stripeWebhook \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point stripeWebhook \
  --update-env-vars STRIPE_SECRET_KEY=sk_live_[新しいキー]
```

**2-2. Vercel（stripe-webhook-email）**
```bash
cd /Users/takujimatsunaga/stripe-webhook-email

# 古いキーを削除
vercel env rm STRIPE_SECRET_KEY production

# 新しいキーを追加
vercel env add STRIPE_SECRET_KEY production
# → プロンプトで新しいキーを入力

# 再デプロイ
vercel --prod
```

---

#### **ステップ3: 動作確認**

**3-1. Webhookテスト**
```bash
# Stripeダッシュボードで「Webhookをテスト」を実行
# または、テスト決済を実行
```

**3-2. メール送信テスト**
```bash
cd /Users/takujimatsunaga/tax-auto-folder-project/stripe-webhook/
node testPaymentEmail.js
```

**3-3. 決済リンクテスト**
- ブラウザで決済リンクにアクセス
- テストモードで決済を実行
- メールが届くことを確認

---

#### **ステップ4: 旧キーの削除**
**全ての動作確認が完了したら**:
1. Stripeダッシュボード → APIキー
2. 旧キー（`...PGr9`）の右側の「...」メニュー
3. 「削除」をクリック

---

## 🚨 トラブルシューティング

### **問題1: Webhook処理が動かない**
```bash
# Google Cloud Functionsのログを確認
gcloud functions logs read stripeWebhook --limit 50
```

**対処**:
- 環境変数が正しく設定されているか確認
- Webhook Secretが変わっていないか確認

---

### **問題2: メール送信エラー**
```bash
# ローカルでテスト
cd /Users/takujimatsunaga/tax-auto-folder-project/stripe-webhook/
node testPaymentEmail.js
```

**対処**:
- Gmail Appパスワードが有効か確認
- GMAIL_USER, GMAIL_PASSWORD が正しいか確認

---

### **問題3: 決済リンクが動かない**
**原因**: 決済リンクはアカウントレベルなので、キーのローテーションでは影響を受けません

**確認**:
- Stripeダッシュボードで決済リンクが有効か確認
- 商品が有効か確認

---

## 📊 影響範囲まとめ

| プロジェクト | 変更必要 | 影響度 | 対応方法 |
|------------|---------|--------|---------|
| **tax-auto-folder-project** | ✅ はい | 🔴 高 | .env更新 + 再デプロイ |
| **stripe-webhook-email** | ✅ はい | 🔴 高 | Vercel環境変数更新 |
| **stripe-webhook-personal** | ⚠️ 未使用 | 🟡 中 | デプロイ時に設定 |
| **stripe-webhook-public** | ⚠️ 未使用 | 🟡 中 | デプロイ時に設定 |
| **minna-no-zeimu-komon** | ❌ いいえ | 🟢 低 | 変更不要 |
| **Stripe決済リンク** | ❌ いいえ | 🟢 低 | 変更不要 |
| **Webhook エンドポイント** | ❌ いいえ | 🟢 低 | 変更不要 |
| **既存顧客データ** | ❌ いいえ | 🟢 低 | 影響なし |

---

## ✅ 最終チェックリスト

実施前:
- [ ] 新しいStripeキーを取得
- [ ] 旧キー（`...PGr9`）をバックアップ
- [ ] パスワードマネージャーに保存

実施中:
- [ ] tax-auto-folder-project の .env 更新
- [ ] Google Cloud Functions 再デプロイ
- [ ] stripe-webhook-email のVercel環境変数更新
- [ ] Vercel 再デプロイ

実施後:
- [ ] Webhook処理のテスト完了
- [ ] メール送信のテスト完了
- [ ] 決済リンクのテスト完了
- [ ] 旧キーの削除完了

---

## 📞 サポート

**問題が発生した場合**:
1. このチェックリストのトラブルシューティングセクションを確認
2. Google Cloud Functionsのログを確認
3. Vercelのデプロイログを確認
4. Stripeダッシュボードでイベントログを確認

**緊急時の復旧**:
```bash
# 旧キーに戻す場合
cd /Users/takujimatsunaga/tax-auto-folder-project/stripe-webhook/
cp .env.backup-[日付] .env
gcloud functions deploy stripeWebhook \
  --update-env-vars STRIPE_SECRET_KEY=sk_live_...PGr9
```

---

**このチェックリストを保存して、明日の作業時に参照してください。**





