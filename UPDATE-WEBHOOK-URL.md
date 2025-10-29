# Stripe Webhook URL更新手順

## 🔄 新しいデプロイIDへの更新

### 新しいGAS API URL
```
https://script.google.com/macros/s/AKfycbx17YFkmWpvK7uy30YD_nF7fC2HZzWAfofXR7XW8RNdcrPqWgZv_34jO0Nxkg8dkSWq/exec
```

---

## 📝 更新が必要な箇所

### 1. Stripe Webhook URL

#### 手順
1. **Stripe Dashboard** → **Webhook**を開く
   - https://dashboard.stripe.com/test/webhooks

2. 既存のWebhook **「1218tst Backend API - Webhook」** をクリック

3. 右上の **「...」（3点メニュー）** → **「エンドポイントを更新」** をクリック

4. **エンドポイントURL**を以下に変更：
   ```
   https://script.google.com/macros/s/AKfycbx17YFkmWpvK7uy30YD_nF7fC2HZzWAfofXR7XW8RNdcrPqWgZv_34jO0Nxkg8dkSWq/exec
   ```

5. **「エンドポイントを更新」** をクリックして保存

---

### 2. フロントエンド（1218tst.html）のAPI URL

#### 対象ファイル
`/Users/takujimatsunaga/minna-no-zeimu-komon/1218tst.html`

#### 変更箇所（675行目付近）
```javascript
// 変更前
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwvlaDlzwOvOGGP2BTGBOFiCAC2KNsTn39Mrk_HwF-Otn4RHtawtGn_j-omX_tUyBfQ/exec';

// 変更後
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbx17YFkmWpvK7uy30YD_nF7fC2HZzWAfofXR7XW8RNdcrPqWgZv_34jO0Nxkg8dkSWq/exec';
```

#### Vercel再デプロイ
変更後、以下のコマンドで再デプロイ：
```bash
vercel --prod
```

---

## ✅ 確認事項

更新後、以下を確認：

1. ✅ Stripe WebhookのURLが新しいデプロイIDに更新された
2. ✅ 1218tst.htmlのGAS_API_URLが新しいデプロイIDに更新された
3. ✅ Vercelに再デプロイされた
4. ✅ テスト決済で動作確認




