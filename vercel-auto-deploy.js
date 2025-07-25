#!/usr/bin/env node

// Vercel自動デプロイスクリプト (Node.js版)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Vercel自動デプロイスクリプト');
console.log('================================');

// プロジェクト情報
const projectInfo = {
  name: 'minna-no-zeimu-komon',
  framework: 'static',
  buildCommand: null,
  outputDirectory: '.',
  installCommand: null
};

console.log(`📁 プロジェクト名: ${projectInfo.name}`);
console.log(`⚡ フレームワーク: ${projectInfo.framework}`);

// 必要ファイルの確認
const requiredFiles = ['index.html', 'styles.css', 'script.js', 'terms.html', 'vercel.json'];
const missingFiles = [];

console.log('\n🔍 ファイル確認:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ ${file} (missing)`);
    missingFiles.push(file);
  }
});

// 画像フォルダの確認
if (fs.existsSync('images')) {
  const imageFiles = fs.readdirSync('images');
  console.log(`✅ images/ (${imageFiles.length} files)`);
} else {
  console.log('❌ images/ (missing)');
  missingFiles.push('images/');
}

if (missingFiles.length > 0) {
  console.log(`\n❌ 必要ファイルが不足: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// Vercel設定の確認
console.log('\n⚙️  Vercel設定確認:');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log(`✅ vercel.json - version ${vercelConfig.version}`);
  console.log(`✅ routes: ${vercelConfig.routes?.length || 0} 件`);
  console.log(`✅ headers: ${vercelConfig.headers?.length || 0} 件`);
} catch (error) {
  console.log('❌ vercel.json読み込みエラー');
}

// 認証状況の確認
console.log('\n🔐 認証確認:');
try {
  const result = execSync('vercel whoami', { encoding: 'utf8', stdio: 'pipe' });
  console.log(`✅ 認証済み: ${result.trim()}`);
  
  // 認証済みの場合、デプロイ実行
  console.log('\n🚀 デプロイ開始...');
  try {
    const deployResult = execSync('vercel --prod --yes', { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 120000 // 2分タイムアウト
    });
    
    console.log('\n✅ デプロイ成功!');
    console.log(deployResult);
    
    // デプロイURLの抽出
    const urlMatch = deployResult.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      console.log(`\n🌐 サイトURL: ${urlMatch[0]}`);
    }
    
  } catch (deployError) {
    console.log('\n❌ デプロイエラー:');
    console.log(deployError.message);
  }
  
} catch (authError) {
  console.log('❌ 未認証');
  console.log('\n📋 手動デプロイ手順:');
  console.log('1. vercel login を実行');
  console.log('2. ブラウザで認証完了');
  console.log('3. vercel --prod でデプロイ');
  console.log('\n🌐 または以下のURLでブラウザデプロイ:');
  console.log('https://vercel.com/new');
  console.log(`📁 アップロードファイル: ${path.resolve('vercel-deploy.zip')}`);
}

console.log('\n📊 プロジェクト統計:');
try {
  const stats = fs.statSync('vercel-deploy.zip');
  console.log(`📦 デプロイファイル: vercel-deploy.zip (${Math.round(stats.size / 1024 / 1024)}MB)`);
} catch (error) {
  console.log('📦 デプロイファイル: 未作成');
}

console.log(`📁 作業ディレクトリ: ${process.cwd()}`);
console.log('\n🎉 スクリプト完了!');