// ========================================
// 🧪 テスト環境用 GAS (Code-test.gs)
// ========================================
// ⚠️ このファイルはテスト環境専用です
// 本番環境では使用しないでください
// ========================================

// ========== 設定 ==========
const SPREADSHEET_ID   = '1uYoIdPx9gq0t0d-wnJLuA799ynUbYMoJtQew0ltRkM4'; // 🧪 テスト用スプレッドシート
const MASTER_SHEET_NAME = 'マスタ';                // 決済完了後のデータ保存先
const PENDING_SHEET_NAME = 'pending_applications'; // 決済前の仮保存シート
const KEYS_SHEET_NAME   = 'keys';                  // 申込IDと行番号の対応表
const LOG_SHEET_NAME    = 'webhook_logs';          // Webhook詳細ログシート

// Vercel Production URL（固定）を使用 - Preview URLは毎回変わるため使用しない
const VERCEL_PRODUCTION = 'https://minna-no-zeimu-komon.vercel.app';
const LP2_BASE_URL      = VERCEL_PRODUCTION + '/lp2-success-test.html';  // 🧪 テスト用
const LP2_DETAIL_URL    = VERCEL_PRODUCTION + '/lp2-detail-test.html';  // 🧪 テスト用

// 🧪 テスト用キーワード
const TEST_AUTH_KEYWORD = 'tak'; // LP2簡易テスト用キーワード

// 【以下、本番用Code.gsと同じ内容】
// A〜F列のヘッダー（基本情報・Googleドライブ関連）
const BASIC_HEADERS = [
  '採番',                    // A列: 将来的なGoogleドライブ用
  '親ドライブURL',           // B列: 将来的なGoogleドライブ用
  '未使用C',                 // C列: Googleドライブ関連（未使用）
  '未使用D',                 // D列: Googleドライブ関連（未使用）
  '決済時のメールアドレス',  // E列: 決済時のメールアドレス
  'タイムスタンプ'           // F列: Googleドライブ生成時のタイムスタンプ
];

// G〜AA（LP①）のヘッダー（既存スキーマ）
const LP1_HEADERS = [
  '個人・法人','青色・白色','設立日','青色申告提出日','次回決算日',
  'インボイス番号','業種','専従者給与の支払い','役員報酬','給与所得',
  '不動産所得','ふるさと納税','住宅ローン控除の申請','法定調書・年末調整セット',
  '源泉納付（特例）','源泉納付（普通）','FX所得','暗号資産の取引',
  'プラン','料金','初年度合計金額'
];

// AB〜AF（決済データ）のヘッダー
const PAYMENT_HEADERS = [
  '決済ステータス', 'UUID', '決済日時', 'Stripe Customer ID', 'Stripe Subscription ID'
];

// LP2（詳細情報）のヘッダー（AG〜AW列）
const LP2_HEADERS = [
  '法人名', '法人郵便番号', '法人住所',                           // AG-AI（法人のみ）
  '代表者名/名前', 'フリガナ',                                   // AJ-AK
  '代表者郵便番号/郵便番号', '代表者住所/住所',                   // AL-AM
  'e-tax利用者識別番号', 'e-tax暗証番号/パスワード',             // AN-AO
  'e-Ltax利用者ID', 'e-Ltax暗証番号',                           // AP-AQ（法人のみ）
  '会計ソフト使用状況', '使用会計ソフト名', 'その他会計ソフト名', // AR-AT
  'クラウド会計メールアドレス',                                  // AU
  'LP2入力完了フラグ', 'LP2入力日時'                            // AV-AW
];

// Stripe Price ID マッピング（テスト環境用）
const STRIPE_PRICES = {
  tax_yearly: 'price_1SLYthE9A3F57SZ7pp1p5fSA',      // 消費税あり・年払い (¥128,880/年)
  tax_monthly: 'price_1SLYu8E9A3F57SZ7ga1zp8xm',     // 消費税あり・月額 (¥12,300/月)
  no_tax_yearly: 'price_1SLYvAE9A3F57SZ7sJ9oTQNt',   // 消費税なし・年払い (¥99,080/年)
  no_tax_monthly: 'price_1SLYvVE9A3F57SZ7nhwxQcUl'   // 消費税なし・月額 (¥9,800/月)
};

// オプション料金マッピング
const OPTION_PRICES = {
  salary: 5000,              // 給与所得
  realestate: 50000,         // 不動産所得
  furusato: 5000,            // ふるさと納税
  mortgage: 20000,           // 住宅ローン控除
  yearend: 20000,            // 法定調書・年末調整
  withholding_special: 6000, // 源泉納付（特例）
  withholding_normal: 36000, // 源泉納付（普通）
  fx_base: 50000,            // FX基本料金
  fx_per_unit: 50000,        // FX追加料金（千万円あたり）
  crypto_base: 100000,       // 暗号資産基本料金
  crypto_per_unit: 100000    // 暗号資産追加料金（千万円あたり）
};

/* ========== 以下、本番用Code.gsから全ての関数をコピー ========== */
/* ※ authenticateLP2 関数のみ、テスト用キーワード機能を追加 */

// ... (本番用Code.gsの全ての関数をここにコピー)
// 紙面の都合上、ここでは主要な変更点のみ記載

/**
 * 🧪 テスト機能追加版：LP2アクセス時の簡易認証
 * メールアドレスの最初の3文字を照合
 * ⚠️ テスト環境: "tak" 入力で仮データを自動生成
 */
function authenticateLP2(sessionId, emailPrefix) {
  try {
    // 🧪 テスト用キーワードチェック
    if (emailPrefix.toLowerCase() === TEST_AUTH_KEYWORD) {
      Logger.log('🧪 テストキーワード検出: 仮データを作成');
      return createTestLP2Data(sessionId);
    }

    // 通常の認証処理（本番用と同じ）
    const uuid = getUuidBySessionId_(sessionId);
    if (!uuid) {
      return {
        success: false,
        error: 'session_not_found',
        message: '無効なセッションIDです'
      };
    }

    const info = findRowIndexByUUID(uuid);
    if (!info || info.sheetType !== 'master') {
      return {
        success: false,
        error: 'data_not_found',
        message: 'データが見つかりません'
      };
    }

    const masterSheet = getOrCreateMaster_();
    const rowIndex = info.rowIndex;
    const rowData = masterSheet.getRange(rowIndex, 1, 1, masterSheet.getLastColumn()).getValues()[0];
    
    const email = rowData[4]; // E列
    if (!email) {
      return {
        success: false,
        error: 'email_not_found',
        message: 'メールアドレスが見つかりません'
      };
    }

    const actualPrefix = email.substring(0, 3).toLowerCase();
    const inputPrefix = emailPrefix.toLowerCase();
    
    if (actualPrefix !== inputPrefix) {
      return {
        success: true,
        authenticated: false,
        message: 'メールアドレスの最初の3文字が一致しません'
      };
    }

    const entityType = rowData[6]; // G列

    return {
      success: true,
      authenticated: true,
      entityType: entityType,
      uuid: uuid
    };

  } catch (error) {
    Logger.log('authenticateLP2 Error: ' + error.toString());
    return {
      success: false,
      error: 'internal_error',
      message: '認証処理中にエラーが発生しました'
    };
  }
}

/**
 * 🧪 テスト用：仮UUIDとデータを作成してLP2テストを可能にする
 */
function createTestLP2Data(sessionId) {
  try {
    Logger.log('🧪 テスト用データ作成開始');
    
    const masterSheet = getOrCreateMaster_();
    const keysSheet = getOrCreateKeys_();
    
    // 仮UUIDを生成
    const testUuid = 'TEST-' + Utilities.getUuid();
    const testEmail = 'takeshi-test@example.com';
    const entityType = '個人'; // デフォルトは個人
    
    // マスタシートに新規行を追加
    const masterRowIndex = masterSheet.getLastRow() + 1;
    
    // A列にUUID
    masterSheet.getRange(masterRowIndex, 1).setValue(testUuid);
    
    // E列にメールアドレス
    masterSheet.getRange(masterRowIndex, 5).setValue(testEmail);
    
    // G列にentityType（個人）
    masterSheet.getRange(masterRowIndex, 7).setValue(entityType);
    
    // AB列に決済ステータス（テスト用）
    masterSheet.getRange(masterRowIndex, 28, 1, PAYMENT_HEADERS.length).setValues([[
      'completed_test',
      testUuid,
      new Date().toISOString(),
      'test_customer_id',
      'test_subscription_id'
    ]]);
    
    // keysシートに登録
    keysSheet.appendRow([
      testUuid,
      masterRowIndex,
      new Date().toISOString(),
      'test_created',
      'master',
      sessionId // Session ID保存
    ]);
    
    logWebhookEvent('createTestLP2Data', testUuid, 'success', 'Test data created for LP2', '');
    
    Logger.log('🧪 テスト用データ作成完了 - UUID: ' + testUuid);
    
    return {
      success: true,
      authenticated: true,
      entityType: entityType,
      uuid: testUuid,
      isTestData: true // テストデータであることを明示
    };
    
  } catch (error) {
    Logger.log('🧪 createTestLP2Data Error: ' + error.toString());
    return {
      success: false,
      error: 'test_data_creation_failed',
      message: 'テストデータの作成に失敗しました: ' + error.toString()
    };
  }
}

// ========================================
// 🧪 以下、本番用Code.gsの残りの関数を全てコピー
// （authenticateLP2以外は変更なし）
// ========================================

/* ========== CORS対応：OPTIONSリクエスト処理 ========== */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ========== Vercel→GAS：LP①保存API ========== */
function doPost(e) {
  try {
    logWebhookEvent('doPost_start', '', 'received', 'Request received (TEST ENV)', '');
    
    if (e.postData && e.postData.contents) {
      try {
        var body = JSON.parse(e.postData.contents);
        
        if (body.id && body.type && body.type.indexOf('.') > 0) {
          logWebhookEvent('webhook_detected', body.id, 'processing', 'Event type: ' + body.type, '');
          Logger.log('Stripe Webhook detected: ' + body.type);
          var webhookResult = handleStripeWebhook(e);
          logWebhookEvent('webhook_processed', body.id, 'success', 'Result: ' + JSON.stringify(webhookResult), '');
          return ContentService.createTextOutput(JSON.stringify(webhookResult))
            .setMimeType(ContentService.MimeType.JSON);
        }
      } catch (parseError) {
        logWebhookEvent('parse_json_skipped', '', 'info', 'URL-encoded request (normal)', String(parseError));
      }
    }
    
    var action, record, payment;
    
    if (e.parameter && e.parameter.action) {
      action = e.parameter.action;
      if (e.parameter.record) {
        record = JSON.parse(e.parameter.record);
      }
      if (e.parameter.payment) {
        payment = JSON.parse(e.parameter.payment);
      }
    }
    else if (e.postData && e.postData.contents) {
      var body = JSON.parse(e.postData.contents);
      action = body.action;
      record = body.record;
      payment = body.payment;
    }
    
    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({success:false, error:'invalid_body'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'saveLP1') {
      var res = saveApplicationDataLP1(record);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'saveLP1AndCreateCheckout') {
      var saveResult = saveApplicationDataLP1(record);
      if (!saveResult.success) {
        return ContentService.createTextOutput(JSON.stringify(saveResult))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var checkoutResult = createStripeCheckoutSession(saveResult.uuid, payment);
      if (!checkoutResult.success) {
        return ContentService.createTextOutput(JSON.stringify(checkoutResult))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        uuid: saveResult.uuid,
        rowIndex: saveResult.rowIndex,
        sessionId: checkoutResult.sessionId,
        checkoutUrl: checkoutResult.url
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'getApplicationStatus') {
      var uuid = e.parameter.uuid || (e.postData && JSON.parse(e.postData.contents).uuid);
      var statusResult = getApplicationStatus(uuid);
      return ContentService.createTextOutput(JSON.stringify(statusResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'authenticateLP2') {
      var sessionId = e.parameter.sessionId || (e.postData && JSON.parse(e.postData.contents).sessionId);
      var emailPrefix = e.parameter.emailPrefix || (e.postData && JSON.parse(e.postData.contents).emailPrefix);
      var authResult = authenticateLP2(sessionId, emailPrefix);
      return ContentService.createTextOutput(JSON.stringify(authResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'getLP2FormData') {
      var sessionId = e.parameter.sessionId || (e.postData && JSON.parse(e.postData.contents).sessionId);
      var formDataResult = getLP2FormData(sessionId);
      return ContentService.createTextOutput(JSON.stringify(formDataResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'saveLP2Data') {
      var sessionId, data;
      if (e.parameter && e.parameter.sessionId) {
        sessionId = e.parameter.sessionId;
        data = e.parameter.data ? JSON.parse(e.parameter.data) : null;
      } else if (e.postData && e.postData.contents) {
        var body = JSON.parse(e.postData.contents);
        sessionId = body.sessionId;
        data = body.data;
      }
      var saveResult = saveLP2Data(sessionId, data);
      return ContentService.createTextOutput(JSON.stringify(saveResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({success:false, error:'unknown_action'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return ContentService.createTextOutput(JSON.stringify({success:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ========== GETエンドポイント（動作確認用） ========== */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    environment: 'TEST', // 🧪 テスト環境であることを明示
    message: '🧪 TEST Environment - 1218tst Backend API is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/* ========== 以下、本番用Code.gsの残りの全関数をコピー ========== */
/* 紙面の都合上省略 - 実際には全関数をコピーしてください */
/* getSpreadsheet_(), getOrCreateMaster_(), 等々... */


