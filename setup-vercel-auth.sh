#!/bin/bash

echo "🔐 Vercel認証セットアップガイド"
echo "================================"

echo ""
echo "方法1: ブラウザ認証 (推奨)"
echo "------------------------"
echo "1. ブラウザでhttps://vercel.com/loginにアクセス"
echo "2. GitHubアカウントでログイン"
echo "3. Settings > Tokens で Personal Access Token を作成"
echo "4. 下記コマンドでトークン設定:"
echo "   export VERCEL_TOKEN=your_token_here"
echo ""

echo "方法2: 手動認証"
echo "---------------"
echo "1. 別のターミナルでvercel loginを実行"
echo "2. 矢印キーでGitHubを選択してEnter"
echo "3. ブラウザで認証完了"
echo ""

echo "方法3: 設定ファイル確認"
echo "---------------------"
echo "認証後、以下でプロジェクト状態確認:"
echo "   vercel ls"
echo "   vercel --version"
echo ""

echo "デプロイ実行:"
echo "   vercel --prod"
echo ""

echo "🚨 エラー対処法"
echo "===============" 
echo "- CLIが応答しない → Ctrl+C で中断後、新しいターミナルで再実行"
echo "- 権限エラー → Personal Access Tokenを使用"
echo "- プロジェクト認識されない → vercel link でプロジェクト関連付け"

