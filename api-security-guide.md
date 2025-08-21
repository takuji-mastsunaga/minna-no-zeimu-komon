# 🔐 API キー管理とセキュリティガイド

## ⚠️ 重要な警告

**環境変数(.env)ファイルは決してGitにコミットしてはいけません。**
APIキーの流出は深刻なセキュリティインシデントにつながります。

## 📊 リスクレベル別分析

### 🔴 **高リスク（絶対に避ける）**
```javascript
// ❌ 絶対にダメ - ソースコードに直接記載
const apiKey = "sk-1234567890abcdef...";
```

### 🟡 **中リスク（要注意）**
```bash
# ❌ .envファイルをGitに含める
API_KEY=sk-1234567890abcdef...
```

### 🟢 **低リスク（推奨）**
- Vercel環境変数
- サーバーサイドでの処理
- 暗号化されたシークレット管理

## 🛡️ セキュアなAPIキー管理方法

### 1. **Vercel環境変数（推奨）**

#### 設定方法
```bash
# Vercel Dashboard で設定
Dashboard → Project → Settings → Environment Variables
```

#### 設定例
```
Variable Name: OPENAI_API_KEY
Value: sk-your-actual-api-key-here
Environment: Production, Preview, Development
```

#### コードでの使用
```javascript
// サーバーサイド（API Route）でのみ使用
export default async function handler(req, res) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    
    // API呼び出し処理
}
```

### 2. **Next.js API Routes使用**

#### フォルダ構造
```
/api
  /chat
    /ai-response.js    # サーバーサイドでAI API呼び出し
/pages
  /chat.html          # フロントエンド（APIキーを含まない）
```

#### セキュアな実装例
```javascript
// /api/chat/ai-response.js
export default async function handler(req, res) {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', 'https://minzei-tax.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message } = req.body;
        
        // レート制限
        if (!isRateLimited(req)) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }
        
        // OpenAI API呼び出し
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'あなたは税務の専門家です。みんなの税務顧問のサービスについて答えてください。'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'API request failed');
        }
        
        return res.status(200).json({
            response: data.choices[0].message.content,
            usage: data.usage
        });
        
    } catch (error) {
        console.error('AI API Error:', error);
        return res.status(500).json({ 
            error: 'AI service temporarily unavailable' 
        });
    }
}
```

### 3. **フロントエンドでの安全な呼び出し**

```javascript
// chat.html内のJavaScript
async function getAIResponse(userMessage) {
    try {
        const response = await fetch('/api/chat/ai-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        return data.response;
        
    } catch (error) {
        console.error('Error:', error);
        return '申し訳ございません。一時的にAIサービスが利用できません。';
    }
}
```

## 🔒 セキュリティ対策

### 1. **.gitignore設定**
```bash
# .gitignore
.env
.env.local
.env.production
.env.staging
*.log
node_modules/
.DS_Store
```

### 2. **レート制限実装**
```javascript
// レート制限ミドルウェア
const rateLimiter = new Map();

function isRateLimited(req) {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1分
    const maxRequests = 10; // 1分間に10リクエスト
    
    if (!rateLimiter.has(clientIP)) {
        rateLimiter.set(clientIP, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    const clientData = rateLimiter.get(clientIP);
    
    if (now > clientData.resetTime) {
        rateLimiter.set(clientIP, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (clientData.count >= maxRequests) {
        return false;
    }
    
    clientData.count++;
    return true;
}
```

### 3. **API使用量監視**
```javascript
// 使用量ログ記録
function logAPIUsage(usage, userIP) {
    console.log(`API Usage: ${JSON.stringify({
        timestamp: new Date().toISOString(),
        userIP: userIP,
        tokens: usage.total_tokens,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens
    })}`);
}
```

## 🚨 .envファイル流出事例と対策

### よくある流出パターン
1. **Gitコミット**: `.env`ファイルをうっかりコミット
2. **公開リポジトリ**: プライベートリポジトリを公開設定に変更
3. **ログ出力**: APIキーをログに記録
4. **スクリーンショット**: 開発中の画面キャプチャ

### 流出時の対応手順
```bash
# 1. 即座にAPIキーを無効化
# OpenAI Dashboard → API Keys → Revoke

# 2. 新しいAPIキーを生成
# 新しいキーをVercel環境変数に設定

# 3. Gitからの完全削除（履歴からも）
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# 4. 強制プッシュ（注意: チーム開発では要相談）
git push --force --all
```

## 📈 コスト管理

### 1. **使用量制限設定**
```javascript
// OpenAI API使用量制限
const MONTHLY_LIMIT = 50; // $50/月
const DAILY_LIMIT = 5;    // $5/日

function checkUsageLimit(currentUsage) {
    if (currentUsage.monthly > MONTHLY_LIMIT) {
        throw new Error('Monthly usage limit exceeded');
    }
    if (currentUsage.daily > DAILY_LIMIT) {
        throw new Error('Daily usage limit exceeded');
    }
}
```

### 2. **アラート設定**
```javascript
// 使用量アラート
function sendUsageAlert(usage) {
    if (usage.percentage > 80) {
        // Slack/メール等でアラート送信
        console.warn(`API usage at ${usage.percentage}%`);
    }
}
```

## 🔧 実装推奨アーキテクチャ

### 現在のシステム
```
[フロントエンド: chat.html] 
         ↓
[FAQデータベース検索]
         ↓
[静的回答表示]
```

### AI強化後のシステム
```
[フロントエンド: chat.html] 
         ↓
[FAQデータベース検索] → [見つからない場合]
         ↓                      ↓
[静的回答表示]          [/api/chat/ai-response]
                              ↓
                    [OpenAI API（サーバーサイド）]
                              ↓
                        [AI生成回答表示]
```

## 🎯 チャットボット強化の段階的実装

### Phase 1: 基本AI統合
- FAQ未対応の質問をAI処理
- シンプルな税務質問への回答
- 基本的なレート制限

### Phase 2: 高度化
- 過去の会話履歴考慮
- 個人化された回答
- 多言語対応

### Phase 3: 分析強化
- 質問パターン分析
- FAQ自動更新提案
- パフォーマンス最適化

## ⚡ クイックスタートガイド

### 1. **Vercel環境変数設定**
```bash
1. Vercel Dashboard → Settings → Environment Variables
2. OPENAI_API_KEY = your-api-key
3. NODE_ENV = production
```

### 2. **API Route作成**
```bash
mkdir -p api/chat
touch api/chat/ai-response.js
```

### 3. **フロントエンド統合**
```javascript
// chat.html に追加
if (!faqResponse) {
    response = await getAIResponse(userMessage);
}
```

---

**🔒 セキュリティチェックリスト**
- [ ] APIキーはサーバーサイドのみで使用
- [ ] .envファイルは.gitignoreに追加
- [ ] レート制限を実装
- [ ] 使用量監視を設定
- [ ] エラーハンドリングを適切に実装
- [ ] CORS設定を適切に設定
