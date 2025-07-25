# SolvisチームへのVercelデプロイ手順

## 📋 事前準備
- GitHubアカウント: takuji-mastsunaga
- リポジトリ: minna-no-zeimu-komon
- Vercelアカウント: Solvisチームアクセス権限必要

## 🚀 GitHub連携デプロイ手順

### ステップ1: Vercelにアクセス
1. ブラウザで **https://vercel.com** にアクセス
2. **「Log in」** をクリック
3. **「Continue with GitHub」** を選択
4. GitHubアカウントでサインイン

### ステップ2: チーム切り替え
1. Vercelダッシュボード右上のプロフィールアイコンをクリック
2. **「Switch Team」** を選択
3. **「Solvis」** チームを選択
4. Solvisチームのダッシュボードに切り替わることを確認

### ステップ3: プロジェクトインポート
1. **「Add New...」** → **「Project」** をクリック
2. **「Import Git Repository」** を選択
3. GitHub連携を許可（初回のみ）
4. リポジトリ一覧から **「takuji-mastsunaga/minna-no-zeimu-komon」** を検索・選択

### ステップ4: プロジェクト設定
```
Project Name: minna-no-zeimu-komon
Framework Preset: Other
Root Directory: ./
Build Command: (空欄のまま)
Output Directory: ./
Install Command: (空欄のまま)
```

### ステップ5: 環境変数設定（必要に応じて）
- **「Environment Variables」** セクション
- 必要に応じてAPI キーやシークレットを追加

### ステップ6: デプロイ実行
1. **「Deploy」** ボタンをクリック
2. デプロイ進行状況を確認
3. 完了後、プロダクションURLを取得

## 🔧 Solvisチーム固有の設定

### ドメイン設定
1. プロジェクト設定 → **「Domains」**
2. カスタムドメインを追加（Solvis所有ドメイン）
3. DNS設定をVercelに向ける

### チーム権限管理
- **Project Settings** → **「General」**
- **Team Members**: Solvisチームメンバーのアクセス権限確認
- **Deployment Protection**: 本番環境の保護設定

### 自動デプロイ設定
- **Git Integration**: mainブランチの自動デプロイ有効
- **Production Branch**: main
- **Preview Deployments**: プルリクエストのプレビュー有効

## 📊 デプロイ後の確認項目

### 機能テスト
- [ ] トップページの表示
- [ ] スタイルシートの適用
- [ ] JavaScriptの動作
- [ ] 利用規約ページ（/terms）
- [ ] 画像の表示
- [ ] レスポンシブデザイン

### SEO・パフォーマンス
- [ ] meta.jsonの反映確認
- [ ] セキュリティヘッダーの適用
- [ ] ページ読み込み速度
- [ ] モバイル対応

## 🚨 トラブルシューティング

### よくある問題
1. **「Repository not found」**
   - GitHub連携の権限を再確認
   - リポジトリがPublicかPrivateかを確認

2. **「Build failed」**
   - vercel.json設定を確認
   - 必要ファイルの存在確認

3. **「Team access denied」**
   - Solvisチームへの招待状況確認
   - 管理者に権限付与を依頼

### サポート連絡先
- Solvisチーム管理者
- Vercelサポート: https://vercel.com/help

## 🎯 次のステップ
1. カスタムドメイン設定
2. SSL証明書の確認
3. アナリティクス設定
4. 継続的デプロイの運用確立
