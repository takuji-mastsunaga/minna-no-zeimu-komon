// DOM要素の取得
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const termsCheckbox = document.getElementById('terms-agreement');
const applyNoTaxBtn = document.getElementById('apply-no-tax');
const applyWithTaxBtn = document.getElementById('apply-with-tax');
const errorNoTax = document.getElementById('error-no-tax');
const errorWithTax = document.getElementById('error-with-tax');

// モバイルメニューの切り替え
if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
    });
}

// スムーススクロール機能
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // モバイルメニューを閉じる
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    }
}

// すべてのナビゲーションリンクにスムーススクロールを適用
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

// 利用規約チェックボックスの状態管理
if (termsCheckbox && applyNoTaxBtn && applyWithTaxBtn && errorNoTax && errorWithTax) {
    termsCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        
        // ボタンの有効/無効とクラス切り替え
        applyNoTaxBtn.disabled = !isChecked;
        applyWithTaxBtn.disabled = !isChecked;
        
        if (isChecked) {
            applyNoTaxBtn.classList.add('active');
            applyWithTaxBtn.classList.add('active');
            errorNoTax.classList.add('hidden');
            errorWithTax.classList.add('hidden');
        } else {
            applyNoTaxBtn.classList.remove('active');
            applyWithTaxBtn.classList.remove('active');
            errorNoTax.classList.remove('hidden');
            errorWithTax.classList.remove('hidden');
        }
    });
}

// 申し込みボタンのイベントハンドラ
if (applyNoTaxBtn) {
    applyNoTaxBtn.addEventListener('click', function() {
        if (!termsCheckbox.checked) {
            alert('利用規約への同意が必要です。');
            return;
        }
        // 通常プラン料金ページにリダイレクト
        window.location.href = 'https://www.minzei-tax.com/cost';
    });
}

if (applyWithTaxBtn) {
    applyWithTaxBtn.addEventListener('click', function() {
        if (!termsCheckbox.checked) {
            alert('利用規約への同意が必要です。');
            return;
        }
        // 消費税申告プラン料金ページにリダイレクト
        window.location.href = 'https://www.minzei-tax.com/cost.tax';
    });
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // 初期状態でボタンを無効化
    if (applyNoTaxBtn) applyNoTaxBtn.disabled = true;
    if (applyWithTaxBtn) applyWithTaxBtn.disabled = true;
    
    // エラーメッセージは初期表示のまま（クラスで制御）
});

// スクロール時のアニメーション効果（簡易版）
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.service-item, .comparison-card, .application-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// レスポンシブ対応：ウィンドウサイズ変更時の処理
window.addEventListener('resize', function() {
    // デスクトップサイズになったらモバイルメニューを閉じる
    if (window.innerWidth >= 1024 && mobileMenu) {
        mobileMenu.classList.remove('active');
    }
});

// ヘッダーのスクロール追従効果
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) { // Adjust scroll threshold if needed
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 動画の遅延読み込み設定
document.addEventListener('DOMContentLoaded', function() {
    const simulationVideo = document.getElementById('simulationVideo');
    if (simulationVideo) {
        // Intersection Observer で動画が画面に入った時に再生
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 動画を再生
                    entry.target.play().catch(e => {
                        console.log('Auto-play prevented:', e);
                        // 自動再生が阻止された場合、ユーザーの操作待ち
                    });
                } else {
                    // 画面から外れたら一時停止
                    entry.target.pause();
                }
            });
        }, {
            threshold: 0.5 // 50%見えたら再生
        });
        
        videoObserver.observe(simulationVideo);
        
        // ホバー時の再生強化
        simulationVideo.addEventListener('mouseenter', () => {
            simulationVideo.play().catch(e => console.log('Play failed:', e));
        });
        
        // エラーハンドリング
        simulationVideo.addEventListener('error', (e) => {
            console.log('Video error:', e);
            // 動画でエラーが起きた場合、フォールバック画像を表示
            const fallbackImg = simulationVideo.querySelector('img');
            if (fallbackImg) {
                fallbackImg.style.display = 'block';
                simulationVideo.style.display = 'none';
            }
        });
    }
});

// ========== 全画面チャット機能 ==========

// 更新された料金情報を含むナレッジベース
const knowledgeBase = {
    "サービス": {
        answer: "年商1,000万円以下の個人事業主・スタートアップ様向けの税務顧問サービスです。チャットでの税務相談、記帳代行、確定申告のサポートを主なサービスとしています。",
        category: "サービス"
    },
    "サービス内容": {
        answer: "主に以下のサービスを提供しています：\n\n• Chatworkでの税務相談\n• 記帳代行\n• 確定申告書または決算申告書の作成・提出\n• 節税や資金繰りに関する情報提供\n\n月額980円は顧問料のみとなり、実際のサービス利用には記帳代行料、申告料、システム料などが追加されます。実際の月額料金は最安プランで¥8,256/月からとなります。",
        category: "サービス"
    },
    "料金": {
        answer: "【重要】料金構成について\n月額980円は顧問料のみとなり、サービス利用には別途以下の料金が必要です：\n\n料金内訳\n・月額顧問料: ¥980（税込）\n・月間記帳代行料: ¥2,980～（税込）100件当たり\n・申告料: ¥39,800（税込）\n・消費税申告（別途）: ¥29,800（税込）\n・月間会計システム料: ¥980（税込）\n\n実際の料金プラン\n\n1. 消費税申告なし - 年間一括払いプラン（最安）\n¥8,256/月 | 年間総支払い: ¥99,080円\n\n2. 消費税申告なし - 月額払いプラン\n¥9,800/月 | 年間総支払い: ¥117,600円\n\n3. 消費税申告あり - 月額払いプラン\n¥12,300/月 | 年間総支払い: ¥147,600円\n\n4. 消費税申告あり - 年間一括払いプラン\n¥10,740/月 | 年間総支払い: ¥128,880円",
        category: "料金"
    },
    "月額980円": {
        answer: "いいえ、月額980円は顧問料のみです。実際のサービス利用には以下の料金が組み合わされます：\n\n・月額顧問料: ¥980（税込）\n・月間記帳代行料: ¥2,980～（税込）\n・申告料: ¥39,800（税込）\n・会計システム料: ¥980（税込）\n・消費税申告（必要な場合）: ¥29,800（税込）\n\n実際の月額料金は、最安プランで¥8,256/月となります。「月額980円」の表示は顧問料部分のみを指しており、トータルサービス料金ではございませんので、ご注意ください。",
        category: "料金"
    },
    "実際の料金": {
        answer: "実際の月額料金は選択されるプランによって異なります：\n\n最安プラン（消費税申告なし・年間一括払い）\n¥8,256/月（年間総支払い: ¥99,080円）\n\nその他のプラン\n・消費税申告なし（月額払い）: ¥9,800/月\n・消費税申告あり（月額払い）: ¥12,300/月\n・消費税申告あり（年間一括払い）: ¥10,740/月\n\n月額980円は顧問料の一部であり、実際のサービス利用料金とは異なりますのでご注意ください。",
        category: "料金"
    },
    "4つのプラン": {
        answer: "以下の4つのプランをご用意しております：\n\n1. 消費税申告なし - 年間一括払いプラン【最安】\n・月額換算: ¥8,256\n・年間総支払い: ¥99,080円\n・対象: 消費税申告が不要な事業者様\n\n2. 消費税申告なし - 月額払いプラン\n・月額: ¥9,800\n・年間総支払い: ¥117,600円\n・対象: 消費税申告が不要な事業者様\n\n3. 消費税申告あり - 月額払いプラン\n・月額: ¥12,300\n・年間総支払い: ¥147,600円\n・対象: インボイス登録事業者など消費税申告が必要な事業者様\n\n4. 消費税申告あり - 年間一括払いプラン\n・月額換算: ¥10,740\n・年間総支払い: ¥128,880円\n・対象: インボイス登録事業者など消費税申告が必要な事業者様\n\nどのプランも記帳代行、確定申告、税務相談がすべて含まれています。",
        category: "料金"
    },
    "消費税申告": {
        answer: "消費税の申告が必要になるのは、主に次のいずれかに当てはまる「課税事業者」です：\n\n• インボイス発行事業者（適格請求書発行事業者）の登録をしている\n• 2年前（基準期間）の課税売上高が1,000万円を超えている\n• 前年の前半6ヶ月（特定期間）の課税売上高または給与支払額が1,000万円を超えている\n• 任意で課税事業者になることを選択している\n\nどちらのタイプに該当するか、お気軽にご相談ください。",
        category: "申告"
    },
    "確定申告": {
        answer: "【確定申告のご契約期限】\n\n確定申告の期日（原則3月15日）の1ヶ月前までにご契約をお願いしております。\n\n【期限を過ぎた場合】\n上記期限を過ぎてからのご契約の場合、期限内の申告をお受けできない可能性があります。\n\n早めのご契約をおすすめいたします。",
        category: "申告"
    },
    "よくある質問": {
        answer: "よくあるご質問をまとめました：\n\n💰 料金について\n・月額980円は顧問料のみです\n・実際の最安プランは¥8,256/月〜\n・4つのプランから選択可能\n\n📋 サービス内容\n・Chatworkでの税務相談\n・記帳代行（領収書をフォルダ保存のみ）\n・確定申告書作成・提出\n\n📞 サポート体制\n・電話・メールサポートなし\n・Chatworkでのやり取りのみ\n・AIではなく担当者が対応\n\n詳しくは具体的な質問をお聞かせください！",
        category: "その他"
    },
    "AIが対応": {
        answer: "いいえ、ご相談にはAIではなく、担当者が直接対応いたしますのでご安心ください。AIは業務効率化のために活用していますが、お客様との相談は人が対応します。",
        category: "サービス"
    },
    "運営会社": {
        answer: "ソルビス税理士法人が運営しております。",
        category: "その他"
    }
};

// チャット要素の取得
const startChatButton = document.getElementById('startChatButton');
const fullscreenChatOverlay = document.getElementById('fullscreenChatOverlay');
const closeChatButton = document.getElementById('closeChatButton');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const welcomeMessage = document.getElementById('welcomeMessage');

// チャット開始ボタンのイベントリスナー
if (startChatButton) {
    startChatButton.addEventListener('click', openFullscreenChat);
}

// チャット閉じるボタンのイベントリスナー
if (closeChatButton) {
    closeChatButton.addEventListener('click', closeFullscreenChat);
}

// オーバーレイクリックで閉じる
if (fullscreenChatOverlay) {
    fullscreenChatOverlay.addEventListener('click', function(e) {
        if (e.target === fullscreenChatOverlay) {
            closeFullscreenChat();
        }
    });
}

// 送信ボタンとEnterキーのイベントリスナー
if (sendButton && chatInput) {
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// チャットを開く
function openFullscreenChat() {
    if (fullscreenChatOverlay) {
        fullscreenChatOverlay.style.display = 'flex';
        setTimeout(() => {
            fullscreenChatOverlay.classList.add('show');
        }, 10);
        
        // 入力フィールドにフォーカス
        if (chatInput) {
            chatInput.focus();
        }
        
        // Analytics追跡
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chat_opened', {
                event_category: 'chatbot',
                event_label: 'fullscreen_chat'
            });
        }
    }
}

// チャットを閉じる
function closeFullscreenChat() {
    if (fullscreenChatOverlay) {
        fullscreenChatOverlay.classList.remove('show');
        setTimeout(() => {
            fullscreenChatOverlay.style.display = 'none';
        }, 300);
    }
}

// メッセージ送信
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // ウェルカムメッセージを非表示
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
    
    // ユーザーメッセージを表示
    addMessage(message, 'user');
    
    // 入力をクリア
    chatInput.value = '';
    
    // ボットの応答を生成
    setTimeout(() => {
        const response = findBestResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

// クイックメッセージ送信
function sendQuickMessage(message) {
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
    
    addMessage(message, 'user');
    
    setTimeout(() => {
        const response = findBestResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

// メッセージを追加
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${sender}`;
    messageDiv.textContent = message;
    
    if (chatMessages) {
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 最適な応答を検索
function findBestResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // キーワードマッチング
    for (const [key, value] of Object.entries(knowledgeBase)) {
        if (message.includes(key.toLowerCase())) {
            return value.answer;
        }
    }
    
    // 部分マッチング
    if (message.includes('申し込み') || message.includes('始め')) {
        return "ご関心をお持ちいただき、ありがとうございます！実際の料金は最安プランで¥8,256/月からとなります。まずは料金プランをご確認いただき、お気軽にお申し込みください。";
    }
    if (message.includes('相談') || message.includes('聞きたい')) {
        return "どのようなことでもお気軽にご相談ください。税務のプロが分かりやすくお答えいたします。具体的にどのようなことでお困りでしょうか？";
    }
    if (message.includes('安い') || message.includes('価格') || message.includes('費用')) {
        return "実際の料金は最安プランで¥8,256/月からとなります。月額980円は顧問料のみで、記帳代行料、申告料、システム料が別途必要です。4つのプランからお選びいただけます。";
    }
    
    // デフォルト応答
    return "ご質問ありがとうございます。より具体的にお聞かせいただけますでしょうか？料金、サービス内容、確定申告など、どのようなことでもお気軽にご相談ください。";
}