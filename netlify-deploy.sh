#!/bin/bash

echo "🌐 Netlify Drop での自動デプロイを試行..."

# curlでNetlify APIを使ってファイルアップロードを試行
if command -v curl >/dev/null 2>&1; then
    echo "📤 Netlify APIでのデプロイを試行中..."
    
    # 一時的なサイト作成を試行（認証なしで）
    response=$(curl -s -X POST "https://api.netlify.com/api/v1/sites" \
        -H "Content-Type: application/json" \
        -d '{"name":"minna-no-zeimu-komon-auto"}' 2>/dev/null)
    
    if echo "$response" | grep -q "site_id"; then
        echo "✅ Netlify API接続成功"
    else
        echo "❌ Netlify APIは認証が必要です"
        echo ""
        echo "📋 手動でのNetlify Dropデプロイ:"
        echo "1. https://app.netlify.com/drop にアクセス"
        echo "2. vercel-deploy.zip をドラッグ&ドロップ"
        echo "3. 自動でデプロイが開始されます"
    fi
else
    echo "❌ curl コマンドが見つかりません"
fi

echo ""
echo "🎯 推奨デプロイ方法:"
echo "1. Netlify Drop: https://app.netlify.com/drop"
echo "2. Vercel Browser: https://vercel.com/new"
echo "3. Surge.sh: npx surge"
echo ""
echo "📁 デプロイファイル: $(pwd)/vercel-deploy.zip"