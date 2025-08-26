# みんなの税務顧問 - チャットボット 技術仕様書

## 概要
現在のchatbot.htmlから抽出した技術的実装詳細、API仕様、拡張可能性について整理したドキュメント。

---

## 技術スタック

### フロントエンド
```
HTML5: セマンティックマークアップ
CSS3: 
├── Flexbox レイアウト
├── CSS Grid（一部使用）
├── CSS カスタムプロパティ
├── アニメーション（keyframes）
└── レスポンシブデザイン

JavaScript (Vanilla):
├── ES6+ 構文
├── DOM操作
├── イベント処理
├── 非同期処理（setTimeout）
└── ローカルストレージ（可能性）
```

### 外部依存関係
```
フォント:
├── Google Fonts API
├── Noto Sans JP (400,500,600,700)
└── Noto Serif JP (400,500,700)

Analytics:
├── Google Tag Manager
└── Google Analytics (AW-17411262353)

その他:
├── OGP メタタグ
└── Twitter Card
```

---

## アーキテクチャ概要

### ファイル構成
```
chatbot.html (単一ファイル構成)
├── HTML構造
├── <style> 内CSS（1200行+）
├── <script> 内JavaScript（600行+）
└── 外部リソース参照

関連ファイル:
├── styles.css (共通スタイル)
└── script.js (共通スクリプト)
```

### 設計パターン
```
モジュラーCSS:
├── BEM風命名規則
├── コンポーネント指向
└── 状態管理クラス

JavaScript:
├── 関数型プログラミング
├── イベント駆動
├── シンプルな状態管理
└── プレーンオブジェクト使用
```

---

## データ構造詳細

### FAQ Database Schema
```javascript
const faqDatabase = {
  "検索キーワード": {
    answer: "回答テキスト（Markdown風記法対応）",
    category: "サービス|料金|契約|申告|その他"
  }
};

// 例
"どのようなサービス": {
  answer: "年商1,000万円以下の個人事業主やスタートアップの方向けに...",
  category: "サービス"
}
```

### Chat History Schema
```javascript
let chatHistory = [
  {
    type: "user" | "bot",
    message: "メッセージ内容（HTML可）",
    timestamp: Date Object
  }
];

// 使用状況
chatHistory.push({
  type: 'user',
  message: userInput,
  timestamp: new Date()
});
```

### UI State Management
```javascript
// グローバル状態変数
let isTyping = false;  // ボット応答中フラグ

// DOM要素への状態反映
element.classList.add('show');    // 表示状態
element.classList.remove('active'); // アクティブ状態
element.style.display = 'flex';   // 直接スタイル操作
```

---

## API設計仕様

### 内部API（JavaScript関数）

#### チャット制御API
```javascript
// チャットの開閉制御
toggleChatSupport(): void
├── 入力: なし
├── 処理: チャット状態の切り替え
└── 出力: UI状態変更

closeChatSupport(): void
├── 入力: なし
├── 処理: チャットを閉じる
└── 出力: UI状態変更

initializeChat(): void
├── 入力: なし
├── 処理: チャット初期化
└── 出力: フォーカス設定、スクロール調整
```

#### メッセージ処理API
```javascript
sendMessage(): void
├── 入力: DOM入力欄の値
├── 処理: バリデーション、メッセージ表示、応答生成
└── 出力: チャット履歴更新

addMessage(type: string, content: string, showTime: boolean = true): void
├── 入力: メッセージタイプ、内容、時刻表示フラグ
├── 処理: DOM要素生成、追加
└── 出力: メッセージ表示

addBotMessage(title: string, htmlContent: string, showTime: boolean = true): void
├── 入力: タイトル、HTMLコンテンツ、時刻表示フラグ
├── 処理: 構造化メッセージ生成
└── 出力: リッチメッセージ表示
```

#### 応答生成API
```javascript
generateBotResponse(userMessage: string): void
├── 入力: ユーザーメッセージ
├── 処理: 非同期応答生成（遅延付き）
└── 出力: ボット応答表示

findBestResponse(userMessage: string): string
├── 入力: ユーザーメッセージ
├── 処理: FAQデータベース検索、マッチング
└── 出力: 最適応答テキスト

formatLineResponse(answer: string, category: string): string
├── 入力: 応答内容、カテゴリ
├── 処理: LINE風フォーマット適用
└── 出力: 整形済み応答テキスト
```

#### メニューシステムAPI
```javascript
showMenuContent(menuType: string): void
├── 入力: メニュータイプ（'service'|'price'|'faq'|'contact'）
├── 処理: 動的HTMLコンテンツ生成
└── 出力: メニュー表示

sendQuickQuestion(question: string): void
├── 入力: 定型質問
├── 処理: 入力欄設定、自動送信
└── 出力: 質問送信実行
```

---

## アルゴリズム詳細

### FAQ検索アルゴリズム
```javascript
function findBestResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // 1. 完全キーワードマッチング
  for (const [key, value] of Object.entries(faqDatabase)) {
    if (message.includes(key.toLowerCase())) {
      return formatLineResponse(value.answer, value.category);
    }
  }
  
  // 2. 部分マッチング（優先度順）
  if (message.includes('サービス') || message.includes('何')) {
    return formatLineResponse(faqDatabase["サービス内容"].answer, "サービス");
  }
  // ... 他の部分マッチング
  
  // 3. デフォルト応答
  return formatDefaultResponse();
}

時間計算量: O(n) - nはFAQエントリ数
空間計算量: O(1) - 固定サイズ
```

### テキスト整形アルゴリズム
```javascript
function formatLineResponse(answer, category) {
  const formattedAnswer = answer
    .replace(/\n\n/g, '\n\n')                    // 段落間改行保持
    .replace(/•/g, '・')                         // 中点統一
    .replace(/✅/g, '・')                        // チェックマーク→中点
    .replace(/(\d+[,\d]*円)/g, '\n$1')          // 金額前改行
    .replace(/([。！？])\s*([・\-\*])/g, '$1\n\n$2')  // 箇条書き前改行
    .replace(/([。！？])\s*([ァ-ヶー]+)/g, '$1\n\n$2'); // 文後改行
  
  return `${categoryLabel}\n\n${formattedAnswer}`;
}
```

### メッセージ遅延アルゴリズム
```javascript
// 人間らしい応答遅延の実装
setTimeout(() => {
  // ボット応答処理
}, 800 + Math.random() * 400); // 0.8-1.2秒のランダム遅延

目的: より自然な会話体験の演出
範囲: 800ms～1200ms
分布: 一様分布
```

---

## イベント処理システム

### DOM Events Mapping
```javascript
// チャット開閉
'click' → toggleChatSupport()
├── #floatingChatButton
├── .center-cta
└── #chatOverlay (close)

// メッセージ送信
'click' → sendMessage()
├── #sendButton
'keydown' → handleInputKeydown()
├── #chatInput (Enter key)

// メニュー操作
'click' → showMenuContent()
├── .line-menu-item[data-menu]

// クイック質問
'click' → sendQuickQuestion()
├── .menu-card[data-question]
```

### Event Delegation Pattern
```javascript
// 動的コンテンツへのイベント付与
document.addEventListener('click', function(event) {
  if (event.target.matches('.menu-card')) {
    const question = event.target.dataset.question;
    if (question) sendQuickQuestion(question);
  }
});
```

---

## CSS Architecture

### Component Structure
```css
/* ブロック */
.line-chat-wrapper { /* コンテナ */ }
.line-chat-header { /* ヘッダー */ }
.line-messages-container { /* メッセージエリア */ }

/* エレメント */
.line-business-icon { /* ビジネスアイコン */ }
.line-business-name { /* ビジネス名 */ }
.line-message-content { /* メッセージ内容 */ }

/* モディファイア */
.line-message.bot { /* ボットメッセージ */ }
.line-message.user { /* ユーザーメッセージ */ }
.line-menu-item.active { /* アクティブメニュー */ }
```

### CSS Custom Properties (Variables)
```css
:root {
  --primary-teal: #14b8a6;
  --primary-blue: #0891b2;
  --gradient-primary: linear-gradient(135deg, var(--primary-teal), var(--primary-blue));
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --background-light: #f7f7f7;
  --border-light: #e5e5e5;
  --border-radius-large: 20px;
  --border-radius-medium: 16px;
  --border-radius-small: 8px;
}
```

### Animation Performance
```css
/* GPU加速の活用 */
.line-chat-wrapper {
  transform: translateY(20px);  /* transform使用 */
  will-change: transform, opacity;  /* 最適化ヒント */
}

/* 60fps を保つための軽量アニメーション */
@keyframes slideInUp {
  from { 
    opacity: 0; 
    transform: translateY(10px);  /* 小さな移動量 */
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
```

---

## Performance Optimization

### 実装済み最適化
```javascript
// 1. 遅延DOM操作
function addMessage(type, content, showTime = true) {
  // 一度に要素生成、一度にDOM追加
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `...`; // バッチ処理
  messagesContainer.appendChild(messageDiv);
}

// 2. イベントデリゲーション
// 動的要素への効率的イベント処理

// 3. 条件分岐最適化
if (!input || message === '' || isTyping) return;
// 早期リターンでネストを削減
```

### 推奨する追加最適化
```javascript
// 1. Virtual Scrolling (長いチャット履歴用)
// 2. Message Pooling (DOM要素再利用)
// 3. Debouncing (入力処理)
// 4. Lazy Loading (大きなFAQデータベース用)
// 5. Service Worker (オフライン対応)
```

---

## セキュリティ考慮事項

### 実装済み対策
```javascript
// 1. XSS対策の基本
// HTML文字列のサニタイゼーション必要箇所
messageDiv.innerHTML = content; // ⚠️ 要注意箇所

// 2. 外部リンクセキュリティ
window.open(url, '_blank', 'noopener,noreferrer');

// 3. 入力検証
if (message === '' || isTyping) return; // 基本的な検証
```

### 推奨する追加対策
```javascript
// 1. Content Security Policy (CSP)
// 2. 入力サニタイゼーション
function sanitizeInput(input) {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// 3. Rate Limiting
// 4. Input Length Validation
// 5. CSRF Protection (if server-side added)
```

---

## 拡張可能性

### アーキテクチャの拡張ポイント

#### 1. バックエンド統合
```javascript
// 現在: 静的FAQデータベース
// 拡張: REST API / GraphQL
async function generateBotResponse(userMessage) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });
    const data = await response.json();
    return data.response;
  } catch (error) {
    return formatDefaultResponse();
  }
}
```

#### 2. AI統合
```javascript
// OpenAI API 統合例
async function getAIResponse(userMessage, context) {
  const response = await fetch('/api/openai', {
    method: 'POST',
    body: JSON.stringify({
      message: userMessage,
      context: chatHistory.slice(-5), // 直近の文脈
      faq: faqDatabase // 既存のFAQ知識
    })
  });
  return response.json();
}
```

#### 3. リアルタイム機能
```javascript
// WebSocket 統合例
const ws = new WebSocket('wss://api.minzei-tax.com/chat');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'bot_response') {
    addMessage('bot', message.content);
  }
};
```

#### 4. 多言語対応
```javascript
// i18n システム
const messages = {
  ja: {
    'chat.welcome': 'こんにちは！税務に関するご質問にお答えします。',
    'chat.placeholder': 'メッセージを入力'
  },
  en: {
    'chat.welcome': 'Hello! We can answer your tax-related questions.',
    'chat.placeholder': 'Type a message'
  }
};

function t(key) {
  const lang = navigator.language.slice(0, 2) || 'ja';
  return messages[lang][key] || messages.ja[key];
}
```

### データベース設計（将来的）
```sql
-- ユーザーセッション管理
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255),
  started_at TIMESTAMP,
  last_activity TIMESTAMP,
  status VARCHAR(50)
);

-- チャット履歴
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  type VARCHAR(10), -- 'user' or 'bot'
  content TEXT,
  created_at TIMESTAMP
);

-- FAQ分析
CREATE TABLE faq_analytics (
  id UUID PRIMARY KEY,
  question TEXT,
  matched_faq VARCHAR(255),
  user_satisfaction INTEGER,
  created_at TIMESTAMP
);
```

---

## テスト戦略

### 単体テスト
```javascript
// Jest/Mocha例
describe('FAQ Search Algorithm', () => {
  test('exact keyword match', () => {
    const result = findBestResponse('料金について教えて');
    expect(result).toContain('【料金について】');
  });
  
  test('partial match', () => {
    const result = findBestResponse('サービス');
    expect(result).toContain('【サービス内容】');
  });
  
  test('no match fallback', () => {
    const result = findBestResponse('xyz123');
    expect(result).toContain('【お問い合わせ】');
  });
});
```

### E2E テスト
```javascript
// Playwright/Cypress例
test('chatbot full interaction flow', async ({ page }) => {
  await page.goto('/chatbot');
  await page.click('[data-testid="floating-chat-button"]');
  await page.fill('[data-testid="chat-input"]', '料金について');
  await page.press('[data-testid="chat-input"]', 'Enter');
  await expect(page.locator('.line-message.bot')).toContainText('料金');
});
```

---

## 監視・分析

### 推奨メトリクス
```javascript
// Analytics Events
function trackChatEvent(action, details) {
  gtag('event', action, {
    event_category: 'chatbot',
    event_label: details.type,
    custom_parameter_1: details.message_length,
    custom_parameter_2: details.response_time
  });
}

// 追跡すべきイベント
- chat_opened: チャット開始
- message_sent: メッセージ送信
- faq_matched: FAQ適中
- menu_clicked: メニュー使用
- external_link_clicked: 外部リンククリック
- chat_closed: チャット終了
```

### パフォーマンス監視
```javascript
// Core Web Vitals
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime);
    }
  }
});
observer.observe({entryTypes: ['largest-contentful-paint']});
```

---

## デプロイメント考慮事項

### Static Site Hosting
```
現在のアーキテクチャ:
├── 単一HTMLファイル（自己完結）
├── 外部依存最小限
├── CDN配信可能
└── キャッシュ最適化対応

推奨ホスティング:
├── Vercel（現在使用中）
├── Netlify
├── AWS S3 + CloudFront
└── GitHub Pages
```

### CI/CD Pipeline
```yaml
# GitHub Actions例
name: Chatbot Deploy
on:
  push:
    paths: ['chatbot.html', 'chatbot-*.md']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 更新履歴
- 初版作成: 技術仕様の全体的な抽出と整理
- 詳細化: アルゴリズム、API、拡張性の明文化
- 実装ガイド: 新規開発・拡張に必要な全情報を整備

