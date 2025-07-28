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
        alert('消費税申告なしプランでお申し込みありがとうございます。担当者より連絡いたします。');
    });
}

if (applyWithTaxBtn) {
    applyWithTaxBtn.addEventListener('click', function() {
        if (!termsCheckbox.checked) {
            alert('利用規約への同意が必要です。');
            return;
        }
        // Stripeの決済ページにリダイレクト
        window.location.href = 'https://buy.stripe.com/9B66oGcBa7etdWNbCL7Zu00';
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