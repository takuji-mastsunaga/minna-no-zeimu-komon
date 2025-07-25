#!/bin/bash

echo "🤖 完全自動デプロイスクリプト"
echo "=============================="

# Surge.shでの自動デプロイを試行（認証不要）
echo "📤 Surge.sh での自動デプロイを試行中..."

# 一時的にファイルを展開
TEMP_DIR="temp_deploy"
if [[ -d "$TEMP_DIR" ]]; then
    rm -rf "$TEMP_DIR"
fi

mkdir "$TEMP_DIR"
cd "$TEMP_DIR"

# ZIPを展開
unzip -q ../vercel-deploy.zip
if [[ $? -eq 0 ]]; then
    echo "✅ ZIPファイル展開完了"
else
    echo "❌ ZIPファイル展開失敗"
    exit 1
fi

# Surge.shでのデプロイ実行
echo "🚀 Surge.sh でのデプロイ開始..."

# ランダムなドメイン名を生成
RANDOM_DOMAIN="minna-no-zeimu-komon-$(date +%s).surge.sh"

echo "🌐 デプロイ先: https://$RANDOM_DOMAIN"

# Surgeでデプロイ実行（メール入力を自動化）
echo "takuji.matsunaga@solvis-group.com" | npx surge --project . --domain "$RANDOM_DOMAIN" 2>&1

if [[ $? -eq 0 ]]; then
    echo ""
    echo "🎉 自動デプロイ成功！"
    echo "🌐 サイトURL: https://$RANDOM_DOMAIN"
    echo "📋 確認事項:"
    echo "• サイトの表示確認"
    echo "• 全機能の動作確認"
    echo "• モバイル表示確認"
else
    echo "❌ Surge.sh デプロイ失敗"
    echo ""
    echo "🔄 代替案:"
    echo "1. 手動でNetlify Drop を使用"
    echo "2. 手動でVercel を使用"
    echo "3. GitHub Pages を使用"
fi

# 一時ディレクトリを削除
cd ..
rm -rf "$TEMP_DIR"

echo ""
echo "🏁 スクリプト完了"