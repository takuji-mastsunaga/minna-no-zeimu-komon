#!/bin/bash

echo "🚀 Vercel完全セットアップガイド"
echo "=============================="

echo ""
echo "現在の状況:"
echo "✅ GitHubリポジトリ: https://github.com/takuji-mastsunaga/minna-no-zeimu-komon.git"
echo "✅ プロジェクト名: minna-no-zeimu-komon"
echo "✅ vercel.json設定ファイル作成済み"

echo ""
echo "🔧 権限エラー解決方法 (優先順)"
echo "================================="

echo ""
echo "方法A: GitHub連携デプロイ (最も簡単)"
echo "-----------------------------------"
echo "1. https://vercel.com/new にアクセス"
echo "2. 'Import Git Repository' をクリック"
echo "3. GitHubでサインイン"
echo "4. 'takuji-mastsunaga/minna-no-zeimu-komon' を選択"
echo "5. プロジェクト設定:"
echo "   - Framework Preset: Other"
echo "   - Root Directory: ./"
echo "   - Build Command: (空欄)"
echo "   - Output Directory: ./"
echo "6. Deploy をクリック"

echo ""
echo "方法B: CLI認証 (Personal Access Token)"
echo "------------------------------------"
echo "1. https://vercel.com/account/tokens でトークン作成"
echo "2. 環境変数設定:"
echo "   export VERCEL_TOKEN=your_token_here"
echo "3. 認証確認:"
echo "   vercel whoami"
echo "4. プロジェクト関連付け:"
echo "   vercel link"
echo "5. デプロイ:"
echo "   vercel --prod"

echo ""
echo "方法C: 新しいターミナルでの認証"
echo "------------------------------"
echo "1. 新しいターミナルウィンドウを開く"
echo "2. cd $(pwd)"
echo "3. vercel login"
echo "4. ブラウザでGitHubログイン完了"
echo "5. 元のターミナルに戻って vercel --prod"

echo ""
echo "🔍 トラブルシューティング"
echo "========================"
echo "現在のVercel設定確認:"
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI インストール済み"
    vercel --version
else
    echo "❌ Vercel CLI未インストール"
    echo "インストール: npm i -g vercel"
fi

echo ""
echo "Git状態確認:"
git status --porcelain
if [ $? -eq 0 ]; then
    echo "✅ Gitリポジトリ正常"
else
    echo "❌ Git設定に問題あり"
fi

echo ""
echo "必要ファイル確認:"
for file in index.html styles.css script.js vercel.json; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
    fi
done

echo ""
echo "🎯 推奨手順:"
echo "============"
echo "1. まず方法A (GitHub連携) を試行"
echo "2. GitHubからの自動デプロイ設定"
echo "3. 問題があれば方法B (Token認証) を実行"
echo ""
echo "📧 サポート:"
echo "============"
echo "GitHubリポジトリ: https://github.com/takuji-mastsunaga/minna-no-zeimu-komon"
echo "Vercelドキュメント: https://vercel.com/docs"

