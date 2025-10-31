// DOM要素の取得
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const termsCheckbox = document.getElementById('terms-agreement');
const applyButton = document.getElementById('apply-button');
const errorMessage = document.getElementById('error-message');

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
if (termsCheckbox && applyButton && errorMessage) {
    termsCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        
        // ボタンの有効/無効とクラス切り替え
        applyButton.disabled = !isChecked;
        
        if (isChecked) {
            applyButton.classList.add('active');
            errorMessage.classList.add('hidden');
        } else {
            applyButton.classList.remove('active');
            errorMessage.classList.remove('hidden');
        }
    });
}

// 申し込みボタンのイベントハンドラ
if (applyButton) {
    applyButton.addEventListener('click', function() {
        if (!termsCheckbox.checked) {
            alert('利用規約への同意が必要です。');
            return;
        }
        // 契約ページにリダイレクト
        window.location.href = 'https://www.minzei-tax.com/keiyaku';
    });
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // 初期状態でボタンを無効化
    if (applyButton) applyButton.disabled = true;
    
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

