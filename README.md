# みんなの税務顧問 - ランディングページ

サブスクリプション型税理士顧問サービスのランディングページです。

## 🚀 特徴

- **レスポンシブデザイン**: スマートフォン・タブレット・PCに対応
- **Stripe決済統合**: 2種類のサブスクリプションプラン
- **現代的なUI**: 美しいグラデーションとアニメーション
- **SEO最適化**: メタタグとセマンティックHTML
- **高速表示**: 最適化されたCSS・JavaScript

## 📁 ファイル構成

```
subscription-lp/
├── index.html          # メインランディングページ
├── terms.html          # 利用規約ページ
├── styles.css          # スタイルシート
├── script.js           # JavaScript機能
├── vercel.json         # Vercel設定ファイル
├── package.json        # プロジェクト設定
├── README.md           # このファイル
├── images/             # FigmaMakeから抽出された画像
└── meta.json           # FigmaMakeメタデータ
```

## ⚙️ Stripe決済リンクの設定

### 1. Stripe アカウントの準備

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. 左メニューから「商品」→「商品を追加」
3. 各プランを作成：
   - **ベーシックプラン**: ¥19,800/月
   - **プレミアムプラン**: ¥39,800/月

### 2. 決済リンクの作成

1. 各商品の「決済リンクを作成」をクリック
2. 以下の設定を行う：
   - 請求間隔：毎月
   - 無料トライアル期間（任意）
   - 成功ページURL：`https://yourdomain.com/success`
   - キャンセルページURL：`https://yourdomain.com/cancel`

### 3. JavaScriptファイルの更新

`script.js`の以下の部分を実際のStripe決済リンクに置き換えてください：

```javascript
const APPLICATION_LINKS = {
    'no-tax': 'https://buy.stripe.com/実際の消費税申告なしプランのリンク',
    'with-tax': 'https://buy.stripe.com/実際の消費税申告ありプランのリンク'
};
```

**設定例:**
```javascript
const APPLICATION_LINKS = {
    'no-tax': 'https://buy.stripe.com/test_28o123...', // 消費税申告なしプラン
    'with-tax': 'https://buy.stripe.com/test_4gw456...' // 消費税申告ありプラン
};
```

## 🌐 Vercelデプロイ手順

### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

### 2. Vercelにログイン

```bash
vercel login
```

### 3. プロジェクトのデプロイ

```bash
# プロジェクトディレクトリで実行
vercel

# 本番環境にデプロイ
vercel --prod
```

### 4. ドメインの設定

1. Vercel Dashboardでプロジェクトを開く
2. 「Settings」→「Domains」
3. 「Add Domain」で独自ドメインを追加
4. DNS設定でCNAMEレコードを追加

## 🔧 ローカル開発

### 開発サーバーの起動

```bash
# serve を使用（推奨）
npm run dev

# または Python を使用
python3 -m http.server 3000

# または PHP を使用
php -S localhost:3000
```

ブラウザで `http://localhost:3000` にアクセス

## 📝 カスタマイズ

### 1. 色・デザインの変更

`styles.css`でカラーパレットを変更：

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1d4ed8;
    --text-color: #333;
    --background-color: #ffffff;
}
```

### 2. サービス内容の変更

`index.html`のサービスセクションを編集：

```html
<div class="service-card">
    <div class="service-icon">📊</div>
    <h3>新しいサービス</h3>
    <p>サービスの説明をここに記載</p>
</div>
```

### 3. 利用規約の追加

`terms.html`の各セクションに実際の規約内容を追加してください。

## 🔒 セキュリティ

- HTTPSの強制使用
- XSSプロテクション
- コンテンツタイプの厳格化
- フレーミング保護

## 📊 分析・追跡

Google Analytics を追加する場合：

1. `index.html`と`terms.html`の`<head>`内に追加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🐛 トラブルシューティング

### 決済リンクが動作しない

1. `script.js`のリンクが正しく設定されているか確認
2. ブラウザの開発者ツールでエラーをチェック
3. Stripeの決済リンクが有効か確認

### Vercelデプロイエラー

1. `vercel.json`の構文が正しいか確認
2. ファイルパスが正しいか確認
3. Vercelのログを確認

### スタイルが適用されない

1. CSS・JSファイルのパスが正しいか確認
2. ブラウザキャッシュをクリア
3. 開発者ツールでネットワークエラーをチェック

## 📞 サポート

技術的な問題や質問がある場合は、以下を確認してください：

1. このREADMEファイル
2. ブラウザの開発者ツール（F12）
3. Vercelのドキュメント
4. Stripeのドキュメント

## 📄 ライセンス

MIT License

---

**重要な設定項目チェックリスト：**

- [ ] Stripe決済リンクの設定
- [ ] 利用規約の内容追加
- [ ] 連絡先情報の更新
- [ ] Google Analytics の設定（任意）
- [ ] OGP画像の設定（任意）
- [ ] ファビコンの追加（任意） # GitHub連携テスト - Sat Jul 26 05:52:11 JST 2025
