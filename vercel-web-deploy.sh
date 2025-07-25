#!/bin/bash

echo "🌐 Vercel Web UI デプロイ支援スクリプト"
echo "========================================"

# プロジェクト情報
PROJECT_NAME="minna-no-zeimu-komon"
DEPLOY_FILE="vercel-deploy.zip"
CURRENT_DIR=$(pwd)

echo "📁 プロジェクト: $PROJECT_NAME"
echo "📂 ディレクトリ: $CURRENT_DIR"
echo "📦 デプロイファイル: $DEPLOY_FILE"

# ファイル確認
if [[ -f "$DEPLOY_FILE" ]]; then
    file_size=$(ls -lh "$DEPLOY_FILE" | awk '{print $5}')
    echo "✅ デプロイファイル確認: $DEPLOY_FILE ($file_size)"
else
    echo "❌ デプロイファイルが見つかりません: $DEPLOY_FILE"
    echo "📦 ZIPファイルを生成中..."
    zip -r "$DEPLOY_FILE" index.html styles.css script.js terms.html images/ vercel.json -x "*.DS_Store" > /dev/null 2>&1
    if [[ $? -eq 0 ]]; then
        file_size=$(ls -lh "$DEPLOY_FILE" | awk '{print $5}')
        echo "✅ ZIPファイル生成完了: $DEPLOY_FILE ($file_size)"
    else
        echo "❌ ZIPファイル生成失敗"
        exit 1
    fi
fi

# Vercel Web UIの起動を試行
echo ""
echo "🚀 Vercel Web UIでのデプロイ手順:"
echo "=================================="
echo ""
echo "1. 以下のURLをブラウザで開く:"
echo "   👉 https://vercel.com/new"
echo ""
echo "2. 'Import Git Repository' ではなく 'Browse' を選択"
echo ""
echo "3. 以下のファイルを選択:"
echo "   📁 $CURRENT_DIR/$DEPLOY_FILE"
echo ""
echo "4. プロジェクト設定:"
echo "   • Project Name: $PROJECT_NAME"
echo "   • Framework Preset: Other"
echo "   • Root Directory: ./"
echo "   • Build Command: (空白)"
echo "   • Output Directory: ./"
echo "   • Install Command: (空白)"
echo ""
echo "5. 'Deploy' ボタンをクリック"
echo ""
echo "6. デプロイ完了後、生成されるURLをメモ"

# ブラウザでURLを開く試行
echo ""
echo "🌐 ブラウザでVercel New Projectページを開きます..."

# macOSでブラウザを開く
if command -v open >/dev/null 2>&1; then
    open "https://vercel.com/new" 2>/dev/null && echo "✅ ブラウザでVercelページを開きました"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "https://vercel.com/new" 2>/dev/null && echo "✅ ブラウザでVercelページを開きました"
else
    echo "⚠️  手動でブラウザを開いてください: https://vercel.com/new"
fi

# Finderでファイルを表示
echo ""
echo "📁 Finderでデプロイファイルを表示します..."
if command -v open >/dev/null 2>&1; then
    open -R "$CURRENT_DIR/$DEPLOY_FILE" 2>/dev/null && echo "✅ Finderでファイルを表示しました"
else
    echo "⚠️  手動でファイルを選択してください: $CURRENT_DIR/$DEPLOY_FILE"
fi

echo ""
echo "📋 デプロイ後の確認項目:"
echo "• サイトが正しく表示されるか"
echo "• 全ての画像が読み込まれるか"
echo "• モバイルメニューが動作するか"
echo "• 申込フォームが機能するか"
echo "• 利用規約ページにアクセスできるか"
echo ""
echo "🎉 デプロイ手順完了! ブラウザでの操作を続行してください。"