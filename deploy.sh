#!/bin/bash

# みんなの税務顧問 - 自動デプロイスクリプト
echo "🚀 みんなの税務顧問 - 自動デプロイスクリプト"
echo "==============================================="

# プロジェクト情報
PROJECT_NAME="minna-no-zeimu-komon"
BUILD_DIR="$(pwd)"
DEPLOY_ZIP="vercel-deploy.zip"

echo "📁 プロジェクトディレクトリ: $BUILD_DIR"
echo "📦 デプロイファイル: $DEPLOY_ZIP"

# 1. ファイル存在確認
echo ""
echo "🔍 必要ファイルの確認..."
required_files=("index.html" "styles.css" "script.js" "terms.html" "vercel.json")
missing_files=()

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo ""
    echo "❌ 必要なファイルが不足しています: ${missing_files[*]}"
    exit 1
fi

# 2. 画像フォルダ確認
if [[ -d "images" ]]; then
    image_count=$(find images -type f | wc -l)
    echo "✅ images フォルダ ($image_count files)"
else
    echo "❌ images フォルダが見つかりません"
    exit 1
fi

# 3. ZIPファイル生成
echo ""
echo "📦 デプロイ用ZIPファイル生成中..."
if [[ -f "$DEPLOY_ZIP" ]]; then
    rm "$DEPLOY_ZIP"
fi

zip -r "$DEPLOY_ZIP" index.html styles.css script.js terms.html images/ vercel.json -x "*.DS_Store" > /dev/null 2>&1

if [[ $? -eq 0 ]]; then
    zip_size=$(ls -lh "$DEPLOY_ZIP" | awk '{print $5}')
    echo "✅ ZIPファイル生成完了: $DEPLOY_ZIP ($zip_size)"
else
    echo "❌ ZIPファイル生成失敗"
    exit 1
fi

# 4. ローカルサーバーテスト
echo ""
echo "🧪 ローカルサーバーテスト..."
python3 -m http.server 8001 > /dev/null 2>&1 &
server_pid=$!
sleep 2

if curl -s http://localhost:8001 | grep -q "みんなの税務顧問"; then
    echo "✅ ローカルサーバーテスト成功"
    kill $server_pid 2>/dev/null
else
    echo "❌ ローカルサーバーテスト失敗"
    kill $server_pid 2>/dev/null
    exit 1
fi

# 5. デプロイ方法の案内
echo ""
echo "🎯 デプロイ準備完了!"
echo "==============================================="
echo ""
echo "📋 次の手順でデプロイしてください:"
echo ""
echo "【方法1: Vercelブラウザ経由】"
echo "1. https://vercel.com/new にアクセス"
echo "2. 'Import' タブを選択"
echo "3. 'Browse' をクリックして以下のファイルを選択:"
echo "   📁 $BUILD_DIR/$DEPLOY_ZIP"
echo "4. Project Name: $PROJECT_NAME"
echo "5. Framework: Other/Static Site"
echo "6. 'Deploy' をクリック"
echo ""
echo "【方法2: Vercel CLI (認証後)】"
echo "1. vercel login でログイン"
echo "2. vercel --prod でデプロイ"
echo ""
echo "【方法3: 他の静的サイトホスティング】"
echo "- Netlify: https://netlify.com/drop"
echo "- GitHub Pages: リポジトリにプッシュ"
echo "- Firebase Hosting: firebase deploy"
echo ""
echo "📦 デプロイファイル: $BUILD_DIR/$DEPLOY_ZIP"
echo "📊 プロジェクト統計:"
echo "   - HTMLファイル: $(find . -name "*.html" | wc -l)"
echo "   - CSSファイル: $(find . -name "*.css" | wc -l)"
echo "   - JSファイル: $(find . -name "*.js" | wc -l)"
echo "   - 画像ファイル: $image_count"
echo "   - 総サイズ: $zip_size"
echo ""
echo "🎉 準備完了! デプロイを開始してください!"