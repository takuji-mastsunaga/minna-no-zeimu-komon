// ========== 設定 ==========
// v53: 月額プランのオプション料金を12で按分（年額ベース→月額按分）
// v51: LP2案内メール本文変更（連絡先をChatworkに統一、今後の流れを更新）
// v50: メール送信者ヘッダー設定、還付先説明文変更、役員人数ヘルプテキスト修正
// v49: CX列（郵便局名）を削除、CY列（貯金記号番号）のみ使用（13桁）
// v48: CQ-CS列（個人電話番号）を削除、個人は代表者電話番号（AY-BA列）のみ使用
// v47: 医療費控除オプション追加（個人のみ、¥10,000、CA列）
//      CJ列を個人・法人共通フィールドに拡張（事業を開始した日付/設立年月日）
//      BO列を MM-DD 形式に変更（決算日）
const SPREADSHEET_ID   = '19YI0cjUlgznSX-T3KA8AuknTjNlmHMuQHBfoXKZTBdg';
const MASTER_SHEET_NAME = 'マスタ';                // 決済完了後のデータ保存先
const PENDING_SHEET_NAME = 'pending_applications'; // 決済前の仮保存シート
const KEYS_SHEET_NAME   = 'keys';                  // 申込IDと行番号の対応表
const LOG_SHEET_NAME    = 'webhook_logs';          // Webhook詳細ログシート
// Vercel Production URL（固定）を使用 - Preview URLは毎回変わるため使用しない
// 本番環境では独自ドメインを使用
const VERCEL_PRODUCTION = 'https://www.minzei-tax.com';
const LP2_BASE_URL      = VERCEL_PRODUCTION + '/lp2-success.html';  // 決済完了ページ（現在未使用）
const LP2_DETAIL_URL    = VERCEL_PRODUCTION + '/lp2-detail.html';  // LP2詳細情報入力ページ

// A〜F列のヘッダー（基本情報・Googleドライブ関連）
const BASIC_HEADERS = [
  '採番',                    // A列: 将来的なクライアント採番用（予約）
  '親ドライブURL',           // B列: 将来的なGoogleドライブ用
  '未使用C',                 // C列: Googleドライブ関連（未使用）
  '未使用D',                 // D列: Googleドライブ関連（未使用）
  '決済時のメールアドレス',  // E列: 決済時のメールアドレス
  '課税対象者'               // F列: 課税/非課税の区分
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

// CH〜CI（プロモーションコード・割引）のヘッダー
const PROMO_HEADERS = [
  'プロモーションコード',  // CH列
  '割引額'                 // CI列
];

// LP2（詳細情報）のヘッダー（AG〜BZ列）
const LP2_HEADERS = [
  // 法人情報（AG-AU）- 個人の場合は空白
  '法人名',                          // AG
  '法人名フリガナ',                  // AH
  '法人番号',                        // AI
  '法人電話番号1',                   // AJ
  '法人電話番号2',                   // AK
  '法人電話番号3',                   // AL
  '法人郵便番号1',                   // AM
  '',                                // AN (未使用)
  '法人郵便番号2',                   // AO
  '',                                // AP (郵便番号検索ボタン用・データ保存なし)
  '法人都道府県',                    // AQ
  '法人住所1',                       // AR
  '法人住所1フリガナ',               // AS
  '法人住所2',                       // AT
  '法人住所2フリガナ',               // AU
  
  // 共通情報（AV）
  '所轄の税務署',                    // AV
  
  // 代表者情報/個人情報（AW-BI）
  '代表者名/氏名',                   // AW
  '代表者フリガナ/フリガナ',         // AX
  '代表者電話番号1/電話番号1',       // AY
  '代表者電話番号2/電話番号2',       // AZ
  '代表者電話番号3/電話番号3',       // BA
  '代表者郵便番号1/郵便番号1',       // BB
  '代表者郵便番号2/郵便番号2',       // BC
  '',                                // BD (郵便番号検索ボタン用・データ保存なし)
  '代表者都道府県/都道府県',         // BE
  '代表者住所1/住所1',               // BF
  '代表者住所1フリガナ/住所1フリガナ', // BG
  '代表者住所2/住所2',               // BH
  '代表者住所2フリガナ/住所2フリガナ', // BI
  
  // e-Tax/e-Ltax情報（BJ-BM）
  'e-tax利用者識別番号',             // BJ
  'e-tax暗証番号',                   // BK
  'e-Ltax利用者ID',                  // BL (法人のみ)
  'e-Ltax暗証番号',                  // BM (法人のみ)
  
  // 法人追加情報（BN-BQ）- 個人の場合は空白
  '資本金',                          // BN
  '決算日（MM-DD）',                 // BO (法人のみ、例: 03-31)
  '役員人数',                        // BP
  '従業員数',                        // BQ
  
  // 会計ソフト情報（BR-BV）
  'クラウド会計ソフト使用状況',      // BR
  '使用中の会計ソフト名',            // BS
  'その他会計ソフト名',              // BT
  'マネーフォワード事業者番号',      // BU (新規追加)
  'メールアドレス',                  // BV (元BU)
  
  // Chatwork情報（BW-BX）
  'chatwork利用有無',                // BW (元BV)
  'chatworkメールアドレス',          // BX (元BW)
  
  // 完了フラグ・日時（BY-BZ）
  'LP2入力完了フラグ',               // BY (元BX)
  'LP2入力日時',                     // BZ (元BY)
  
  // LP1オプション・予備（CA-CI）
  '医療費控除',                      // CA (個人のみ、あり・なし)
  '', '', '', '', '', '', '', '',    // CB-CI (予備列)
  
  // 法人追加情報2・個人基本情報（CJ）
  '設立年月日/事業を開始した日付',    // CJ (法人=設立年月日、個人=事業を開始した日付、yyyy-MM-dd)
  
  // 個人追加情報（CK-CP）
  '屋号',                            // CK
  '生年月日',                        // CL
  '性別',                            // CM
  '世帯主との続柄',                  // CN
  '世帯主の氏名（姓）',              // CO
  '世帯主の氏名（名）',              // CP
  // CQ-CS列（個人電話番号）は削除済み - 代表者電話番号（AY-BA列）を使用
  
  // 還付先金融機関（CT-CY）- 個人・法人共通
  '還付先金融機関名',                // CT
  '還付先金融機関支店名',            // CU
  '還付先金融機関預金種類',          // CV
  '還付先金融機関口座番号',          // CW
  '（削除）郵便局名',                // CX (削除済み - 貯金記号番号のみで特定可能)
  '還付先金融機関貯金記号番号'       // CY
];

// Stripe Price ID マッピング（本番環境用）
const STRIPE_PRICES = {
  tax_yearly: 'price_1RyTiICcw6eshotqmv1ezW3r',      // 消費税あり・年払い (¥128,880/年)
  tax_monthly: 'price_1RyTeiCcw6eshotqqIPkTHAz',     // 消費税あり・月額 (¥12,300/月)
  no_tax_yearly: 'price_1RySrxCcw6eshotqNdyfeqR4',   // 消費税なし・年払い (¥99,080/年)
  no_tax_monthly: 'price_1RySpsCcw6eshotqirRAGtRZ'   // 消費税なし・月額 (¥9,800/月)
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
  crypto_per_unit: 100000,   // 暗号資産追加料金（千万円あたり）
  medical: 10000             // 医療費控除（個人のみ）
};

/* ========== CORS対応：OPTIONSリクエスト処理 ========== */
function doOptions(e) {
  // プリフライトリクエスト（OPTIONS）に対応
  var output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setHeader('Access-Control-Max-Age', '86400');
  return output;
}

/* ========== CORS対応レスポンス生成ヘルパー ========== */
function createCorsResponse(data, mimeType) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(mimeType || ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

/* ========== Vercel→GAS：LP①保存API ========== */
function doPost(e) {
  try {
    // 📝 すべてのPOSTリクエストをログに記録
    logWebhookEvent('doPost_start', '', 'received', 'Request received', '');
    
    // Stripe Webhookリクエストの検出（actionパラメータがない場合）
    if (e.postData && e.postData.contents) {
      try {
        var body = JSON.parse(e.postData.contents);
        
        // Stripeイベントの特徴: idとtypeプロパティが存在
        if (body.id && body.type && body.type.indexOf('.') > 0) {
          logWebhookEvent('webhook_detected', body.id, 'processing', 'Event type: ' + body.type, '');
          Logger.log('Stripe Webhook detected: ' + body.type);
          var webhookResult = handleStripeWebhook(e);
          logWebhookEvent('webhook_processed', body.id, 'success', 'Result: ' + JSON.stringify(webhookResult), '');
          return ContentService.createTextOutput(JSON.stringify(webhookResult))
            .setMimeType(ContentService.MimeType.JSON);
        }
      } catch (parseError) {
        // JSON parseに失敗した場合は通常のリクエスト（URLエンコード形式）として処理
        // これは正常な動作です（フロントエンドがURLエンコード形式でデータを送信）
        logWebhookEvent('parse_json_skipped', '', 'info', 'URL-encoded request (normal)', String(parseError));
      }
    }
    
    // 通常のリクエスト処理（actionパラメータを持つ）
    var action, record, payment;
    
    // URLエンコード形式の場合
    if (e.parameter && e.parameter.action) {
      action = e.parameter.action;
      if (e.parameter.record) {
        record = JSON.parse(e.parameter.record);
      }
      if (e.parameter.payment) {
        payment = JSON.parse(e.parameter.payment);
      }
    }
    // JSON形式の場合（後方互換性）
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

    // LP①データ保存のみ
    if (action === 'saveLP1') {
      var res = saveApplicationDataLP1(record);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // LP①データ保存 + Stripe Checkout作成
    if (action === 'saveLP1AndCreateCheckout') {
      var saveResult = saveApplicationDataLP1(record);
      if (!saveResult.success) {
        return ContentService.createTextOutput(JSON.stringify(saveResult))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Stripe Checkoutセッション作成
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

    // 申込ステータス取得
    if (action === 'getApplicationStatus') {
      var uuid = e.parameter.uuid || (e.postData && JSON.parse(e.postData.contents).uuid);
      var statusResult = getApplicationStatus(uuid);
      return ContentService.createTextOutput(JSON.stringify(statusResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // LP2: 簡易認証
    if (action === 'authenticateLP2') {
      var sessionId = e.parameter.sessionId || (e.postData && JSON.parse(e.postData.contents).sessionId);
      var emailPrefix = e.parameter.emailPrefix || (e.postData && JSON.parse(e.postData.contents).emailPrefix);
      var authResult = authenticateLP2(sessionId, emailPrefix);
      return createCorsResponse(authResult);
    }

    // LP2: フォームデータ取得
    if (action === 'getLP2FormData') {
      var sessionId = e.parameter.sessionId || (e.postData && JSON.parse(e.postData.contents).sessionId);
      var formDataResult = getLP2FormData(sessionId);
      return createCorsResponse(formDataResult);
    }

    // LP2: データ保存
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
      return createCorsResponse(saveResult);
    }

    return createCorsResponse({success:false, error:'unknown_action'});
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return createCorsResponse({success:false, error:String(err)});
  }
}

/* ========== GETエンドポイント（動作確認用） ========== */
function doGet(e) {
  // actionパラメータがない場合は、ステータスを返す
  if (!e.parameter.action) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      message: '1218tst Backend API is running',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var action = e.parameter.action;
  
  // LP2: 簡易認証（GET対応）
  if (action === 'authenticateLP2') {
    var sessionId = e.parameter.sessionId;
    var emailPrefix = e.parameter.emailPrefix;
    var authResult = authenticateLP2(sessionId, emailPrefix);
    return ContentService.createTextOutput(JSON.stringify(authResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // LP2: フォームデータ取得（GET対応）
  if (action === 'getLP2FormData') {
    var sessionId = e.parameter.sessionId;
    var formDataResult = getLP2FormData(sessionId);
    return ContentService.createTextOutput(JSON.stringify(formDataResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'unknown_action'
  })).setMimeType(ContentService.MimeType.JSON);
}

/* ========== シート初期化系 ========== */
function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateMaster_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(MASTER_SHEET_NAME);

  // A〜F列の基本ヘッダーを設定
  const basicHeaderRange = sh.getRange(1, 1, 1, BASIC_HEADERS.length);
  const basicVals = basicHeaderRange.getValues();
  const basicExists = basicVals[0].filter(v => v && String(v).trim() !== '').length > 0;
  
  if (!basicExists) {
    basicHeaderRange.setValues([BASIC_HEADERS]);
  }

  // 1行目のG〜AAにLP1ヘッダーが並んでいるか確認。無ければ整備。
  const needCols = LP1_HEADERS.length;
  const startCol = 7; // G列
  const lastCol  = startCol + needCols - 1; // AA列
  const headerRange = sh.getRange(1, startCol, 1, needCols);
  const vals = headerRange.getValues();
  const exists = vals[0].filter(v => v && String(v).trim() !== '').length > 0;

  if (!exists) {
    headerRange.setValues([LP1_HEADERS]);
  }
  
  // AG〜AW列にLP2ヘッダーを追加
  const lp2StartCol = 33; // AG列
  const lp2HeaderRange = sh.getRange(1, lp2StartCol, 1, LP2_HEADERS.length);
  const lp2Vals = lp2HeaderRange.getValues();
  const lp2Exists = lp2Vals[0].filter(v => v && String(v).trim() !== '').length > 0;
  
  if (!lp2Exists) {
    lp2HeaderRange.setValues([LP2_HEADERS]);
  }
  
  return sh;
}

function getOrCreateKeys_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(KEYS_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(KEYS_SHEET_NAME);

  const header = ['uuid','rowIndex','createdAt','status','sheetType','sessionId'];
  const lastCol = sh.getLastColumn();
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, header.length).setValues([header]);
  } else {
    // 既存でも列確認（不足あれば補完）
    const current = sh.getRange(1, 1, 1, Math.max(lastCol, header.length)).getValues()[0];
    header.forEach((name, i) => { if (!current[i]) sh.getRange(1, i+1).setValue(name); });
  }
  return sh;
}

function getOrCreatePending_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(PENDING_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(PENDING_SHEET_NAME);

  // A〜F列の基本ヘッダーを設定
  const basicHeaderRange = sh.getRange(1, 1, 1, BASIC_HEADERS.length);
  const basicVals = basicHeaderRange.getValues();
  const basicExists = basicVals[0].filter(v => v && String(v).trim() !== '').length > 0;
  
  if (!basicExists) {
    basicHeaderRange.setValues([BASIC_HEADERS]);
  }

  // 1行目のG〜AAにLP1ヘッダーが並んでいるか確認。無ければ整備。
  const needCols = LP1_HEADERS.length;
  const startCol = 7; // G列
  const lastCol  = startCol + needCols - 1; // AA列
  const headerRange = sh.getRange(1, startCol, 1, needCols);
  const vals = headerRange.getValues();
  const exists = vals[0].filter(v => v && String(v).trim() !== '').length > 0;

  if (!exists) {
    headerRange.setValues([LP1_HEADERS]);
  }
  return sh;
}

function getOrCreateLogSheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(LOG_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(LOG_SHEET_NAME);
    // ヘッダー作成
    const header = ['Timestamp', 'Event Type', 'UUID', 'Status', 'Details', 'Error'];
    sh.getRange(1, 1, 1, header.length).setValues([header]);
    // 列幅調整
    sh.setColumnWidth(1, 150);  // Timestamp
    sh.setColumnWidth(2, 200);  // Event Type
    sh.setColumnWidth(3, 300);  // UUID
    sh.setColumnWidth(4, 100);  // Status
    sh.setColumnWidth(5, 400);  // Details
    sh.setColumnWidth(6, 400);  // Error
  }
  return sh;
}

function logWebhookEvent(eventType, uuid, status, details, error) {
  try {
    const logSheet = getOrCreateLogSheet_();
    const timestamp = new Date().toISOString();
    logSheet.appendRow([
      timestamp,
      eventType || '',
      uuid || '',
      status || '',
      details || '',
      error || ''
    ]);
  } catch (err) {
    Logger.log('logWebhookEvent error: ' + err);
  }
}

/* ========== LP①：保存エンドポイント ========== */
/**
 * LP①の申込データを仮保存シートに保存し、UUIDを払い出す
 * （決済完了後にマスタシートに移動される）
 * @param {Object} record ・・・ フロントのsubmitApplication()で組んだレコード（G〜AAの各項目名がキー）
 * @return {Object} { success, uuid, rowIndex, lp2Url }
 */
function saveApplicationDataLP1(record) {
  try {
    const pending = getOrCreatePending_(); // 仮保存シートを使用
    const keysSh = getOrCreateKeys_();

    // 1) 仮保存シートの新規行を決定
    const rowIndex = pending.getLastRow() + 1;

    // 2) LP①（G〜AA）を書き込む
    //    G列からLP1_HEADERS順でレコードを整列。
    const ordered = LP1_HEADERS.map(h => {
      let v = record[h] ?? '';
      // 数値はそのまま、文字は文字列化
      if (typeof v === 'number') return v;
      return String(v);
    });
    pending.getRange(rowIndex, 7, 1, ordered.length).setValues([ordered]);
    
    // 2-1) CA列に医療費控除を書き込む（個人のみ）
    if (record['医療費控除']) {
      pending.getRange(rowIndex, 79).setValue(record['医療費控除']); // CA列 = 79列目
    }

    // 3) UUID払い出し & keysに紐づけ保存（sheetType='pending'を記録）
    const uuid = Utilities.getUuid();
    keysSh.appendRow([uuid, rowIndex, new Date().toISOString(), 'pending', 'pending']);

    // 4) ログ記録
    logWebhookEvent('saveLP1', uuid, 'pending', 'Row: ' + rowIndex + ' in pending_applications', '');

    // 5) LP②リンクを返却
    const lp2Url = LP2_BASE_URL + '?uuid=' + encodeURIComponent(uuid);

    return { success: true, uuid, rowIndex, lp2Url };
  } catch (err) {
    console.error(err);
    logWebhookEvent('saveLP1', '', 'error', '', String(err));
    return { success: false, error: String(err) };
  }
}

/* ========== LP②：UUIDでAB以降を更新するための下準備 ========== */
/**
 * uuid → {rowIndex, sheetType} を引く（keysシート）
 */
function findRowIndexByUUID(uuid) {
  const sh = getOrCreateKeys_();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return null;
  
  const values = sh.getRange(2, 1, lastRow - 1, 5).getValues(); // [uuid, rowIndex, createdAt, status, sheetType]
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === uuid) {
      return {
        rowIndex: Number(values[i][1]),
        sheetType: values[i][4] || 'pending',
        keysRow: i + 2 // keysシート上の行番号
      };
    }
  }
  return null;
}

/**
 * （将来用）LP②のデータを AB 列以降に追記する
 * @param {string} uuid
 * @param {Object} lp2Data ・・・ AB列以降に並べたいキー→値（列の順序は別途ヘッダー定義で整列）
 */
function updateLP2ByUUID(uuid, lp2Data) {
  const master = getOrCreateMaster_();
  const rowIndex = findRowIndexByUUID(uuid);
  if (!rowIndex) throw new Error('UUIDに対応する行が見つかりません: ' + uuid);

  // ここでLP②ヘッダー群（AB以降）を定義し、並べ替えて一括書き込みします。
  // 必要に応じて：const LP2_HEADERS = ['顧客名', 'メール', '住所', ...];
  // ensureLP2Headers_(master, LP2_HEADERS);
  // const startCol = 28; // AB列
  // const ordered = LP2_HEADERS.map(h => lp2Data[h] ?? '');
  // master.getRange(rowIndex, startCol, 1, ordered.length).setValues([ordered]);

  // ステータス更新（任意）
  const keys = getOrCreateKeys_();
  const last = keys.getLastRow();
  const data = keys.getRange(2,1,last-1,4).getValues();
  for (let i=0;i<data.length;i++){
    if (data[i][0] === uuid) {
      keys.getRange(i+2, 4).setValue('LP2_saved');
      break;
    }
  }
  return { success: true, rowIndex };
}

/* 任意：LP②のヘッダー整備（AB以降） */
function ensureLP2Headers_(masterSheet, headers, startColAB = 28) {
  if (headers.length === 0) return;
  const range = masterSheet.getRange(1, startColAB, 1, headers.length);
  const row = range.getValues()[0];
  if (row.every(v => !v)) {
    range.setValues([headers]);
  }
}

/**
 * 採番を生成（A列用）
 * フォーマット：X_YY_ZZZZ_〇〇〇〇
 * - X: 1=法人、2=個人
 * - YY: 契約年度（下2桁）
 * - ZZZZ: 年度・種別ごとの連番（0001〜9999）
 * - 〇〇〇〇: 法人名/氏名
 */
function generateClientNumber(master, entityType, companyName, individualName, paymentDate) {
  try {
    // 1) X部分：法人=1、個人=2
    const typeCode = (entityType === '法人') ? '1' : '2';
    
    // 2) YY部分：契約年度の下2桁
    const date = new Date(paymentDate);
    const year = date.getFullYear();
    const yearCode = String(year).slice(-2); // 下2桁
    
    // 3) ZZZZ部分：年度・種別ごとの連番を生成
    // 既存のA列データから同じ年度・種別の最大連番を取得
    const allData = master.getRange(2, 1, Math.max(1, master.getLastRow() - 1), 1).getValues();
    let maxSerial = 0;
    
    const prefix = typeCode + '_' + yearCode + '_';
    for (let i = 0; i < allData.length; i++) {
      const cellValue = String(allData[i][0] || '');
      if (cellValue.startsWith(prefix)) {
        // 例: "1_25_0123_株式会社ABC" から "0123" を抽出
        const parts = cellValue.split('_');
        if (parts.length >= 3) {
          const serialStr = parts[2]; // "0123"
          const serial = parseInt(serialStr, 10);
          if (!isNaN(serial) && serial > maxSerial) {
            maxSerial = serial;
          }
        }
      }
    }
    
    const nextSerial = maxSerial + 1;
    if (nextSerial > 9999) {
      throw new Error('連番が上限（9999）を超えました。年度: ' + year + ', 種別: ' + entityType);
    }
    
    const serialCode = String(nextSerial).padStart(4, '0'); // 0001, 0002, ...
    
    // 4) 〇〇〇〇部分：法人名/氏名
    const name = (entityType === '法人') ? (companyName || '未設定') : (individualName || '未設定');
    
    // 5) 採番を生成
    const clientNumber = typeCode + '_' + yearCode + '_' + serialCode + '_' + name;
    
    Logger.log('採番生成: ' + clientNumber);
    return clientNumber;
    
  } catch (err) {
    Logger.log('採番生成エラー: ' + err);
    return ''; // エラー時は空文字を返す
  }
}

/**
 * 仮保存シートからマスタシートにデータを移動（決済完了時）
 * @param {string} uuid
 * @param {Object} paymentData - {status, uuid, paymentDate, customerId, subscriptionId, email}
 * @return {Object} {success, masterRowIndex}
 */
function moveFromPendingToMaster(uuid, paymentData) {
  try {
    logWebhookEvent('moveFromPendingToMaster', uuid, 'start', '', '');

    const pending = getOrCreatePending_();
    const master = getOrCreateMaster_();
    const keysSh = getOrCreateKeys_();
    
    // 1) UUIDから仮保存シートの行番号を取得
    const info = findRowIndexByUUID(uuid);
    if (!info) {
      throw new Error('UUID not found: ' + uuid);
    }
    
    // 既にmasterシートに存在する場合（冪等性：Stripeのリトライ対応）
    if (info.sheetType !== 'pending') {
      logWebhookEvent('moveFromPendingToMaster', uuid, 'info', 'Already in master row: ' + info.rowIndex, 'Data already exists in master sheet (idempotent)');
      return {
        success: true,
        alreadyExists: true,
        masterRowIndex: info.rowIndex,
        message: 'Data already exists in master sheet'
      };
    }

    const pendingRowIndex = info.rowIndex;
    logWebhookEvent('moveFromPendingToMaster', uuid, 'found_pending', 'Pending row: ' + pendingRowIndex, '');

    // 2) 仮保存シートからLP①データ（G〜AA列）を取得
    const lp1Data = pending.getRange(pendingRowIndex, 7, 1, LP1_HEADERS.length).getValues()[0];

    // 3) マスタシートに新規行を追加
    const masterRowIndex = master.getLastRow() + 1;
    
    // 3-0) LP①データ（G〜AA列）を先に書き込み（採番生成に必要な情報を取得するため）
    master.getRange(masterRowIndex, 7, 1, LP1_HEADERS.length).setValues([lp1Data]);

    // 3-1) A列に採番を生成して保存
    // lp1Dataから必要な情報を取得
    const entityType = lp1Data[0] || ''; // G列：個人・法人
    const companyName = ''; // AG列は後で取得（LP2データ）
    const individualName = ''; // AW列は後で取得（LP2データ）
    
    // LP2データが未入力の段階では名前が取れないため、仮の採番を生成
    // LP2入力完了時に再生成する
    const tempClientNumber = generateClientNumber(master, entityType, companyName, individualName, paymentData.paymentDate);
    if (tempClientNumber) {
      master.getRange(masterRowIndex, 1).setValue(tempClientNumber);
      logWebhookEvent('moveFromPendingToMaster', uuid, 'client_number_saved', 'Client Number: ' + tempClientNumber, '');
    }
    
    // 3-2) E列にメールアドレスを書き込み（Stripe Sessionから取得）
    const email = paymentData.email || '';
    if (email) {
      master.getRange(masterRowIndex, 5).setValue(email);
      logWebhookEvent('moveFromPendingToMaster', uuid, 'email_saved', 'Email: ' + email, '');
    }
    
    // 3-3) F列に課税対象者を書き込み（課税/非課税）
    const taxStatus = paymentData.hasTaxObligation ? '課税' : '非課税';
    master.getRange(masterRowIndex, 6).setValue(taxStatus);
    logWebhookEvent('moveFromPendingToMaster', uuid, 'tax_status_saved', 'Tax Status: ' + taxStatus, '');
    
    // 3-3-1) CA列に医療費控除を書き込み（pendingからコピー）
    const medicalDeduction = pending.getRange(pendingRowIndex, 79).getValue(); // CA列 = 79列目
    if (medicalDeduction) {
      master.getRange(masterRowIndex, 79).setValue(medicalDeduction);
      logWebhookEvent('moveFromPendingToMaster', uuid, 'medical_deduction_saved', 'Medical Deduction: ' + medicalDeduction, '');
    }
    
    // 3-4) CH列（86列目）にプロモーションコードを書き込み
    const promoCode = paymentData.promoCode || '';
    if (promoCode) {
      master.getRange(masterRowIndex, 86).setValue(promoCode);  // CH列
      logWebhookEvent('moveFromPendingToMaster', uuid, 'promo_code_saved', 'Promo Code: ' + promoCode, '');
    }
    
    // 3-5) CI列（87列目）に割引額を書き込み
    const discount = paymentData.discount || 0;
    if (discount > 0) {
      master.getRange(masterRowIndex, 87).setValue(discount);  // CI列
      logWebhookEvent('moveFromPendingToMaster', uuid, 'discount_saved', 'Discount: ' + discount + '円', '');
    }
    
    // 3-6) CH-CI列のヘッダーを確保
    const promoHeaderRow = master.getRange(1, 86, 1, 2).getValues()[0];
    if (!promoHeaderRow[0]) {
      master.getRange(1, 86, 1, 2).setValues([PROMO_HEADERS]);
      logWebhookEvent('moveFromPendingToMaster', uuid, 'promo_headers_added', 'Promo headers added', '');
    }

    // 4) AA列（初年度合計金額）をStripeの実際の決済金額（プロモーションコード適用後）に上書き
    const actualAmount = paymentData.actualAmount || 0;
    if (actualAmount > 0) {
      master.getRange(masterRowIndex, 27).setValue(actualAmount);  // AA列 = 27列目
      logWebhookEvent('moveFromPendingToMaster', uuid, 'actual_amount_saved', 'Actual Amount (after discount): ' + actualAmount + '円', '');
    }

    // 5) 決済データヘッダーを確保（AB〜AF列）
    const headerRow = master.getRange(1, 28, 1, PAYMENT_HEADERS.length).getValues()[0];
    if (!headerRow[0]) {
      master.getRange(1, 28, 1, PAYMENT_HEADERS.length).setValues([PAYMENT_HEADERS]);
    }

    // 6) 決済データ（AB〜AF列）を書き込み
    const paymentRow = [
      paymentData.status || '',
      paymentData.uuid || '',
      paymentData.paymentDate || '',
      paymentData.customerId || '',
      paymentData.subscriptionId || ''
    ];
    master.getRange(masterRowIndex, 28, 1, PAYMENT_HEADERS.length).setValues([paymentRow]);

    logWebhookEvent('moveFromPendingToMaster', uuid, 'written_to_master', 'Master row: ' + masterRowIndex, '');

    // 7) 仮保存シートから該当行を削除
    pending.deleteRow(pendingRowIndex);
    logWebhookEvent('moveFromPendingToMaster', uuid, 'deleted_from_pending', 'Deleted row: ' + pendingRowIndex, '');

    // 8) keysシートを更新（新しいマスタ行番号、status='completed', sheetType='master'）
    keysSh.getRange(info.keysRow, 2).setValue(masterRowIndex); // rowIndex更新
    keysSh.getRange(info.keysRow, 4).setValue('completed');    // status更新
    keysSh.getRange(info.keysRow, 5).setValue('master');       // sheetType更新

    logWebhookEvent('moveFromPendingToMaster', uuid, 'success', 'Moved to master row: ' + masterRowIndex, '');

    return {
      success: true,
      masterRowIndex: masterRowIndex
    };
  } catch (err) {
    logWebhookEvent('moveFromPendingToMaster', uuid, 'error', '', String(err));
    return {
      success: false,
      error: String(err)
    };
  }
}

/* ========== 参考：法人の青色申告可否判定（フロントと同ロジック） ========== */
function checkAoiroStatus(establishmentDateStr, applicationDateStr, fiscalEndDateStr) {
  const establishmentDate = new Date(establishmentDateStr + 'T00:00:00');
  const applicationDate = new Date(applicationDateStr + 'T00:00:00');
  const fiscalEndDate = new Date(fiscalEndDateStr + 'T00:00:00');

  let firstTermYear;
  if (establishmentDate.getMonth() <= fiscalEndDate.getMonth()) {
    firstTermYear = establishmentDate.getFullYear();
  } else {
    firstTermYear = establishmentDate.getFullYear() + 1;
  }
  const firstFiscalEndDate = new Date(firstTermYear, fiscalEndDate.getMonth() + 1, 0);
  const isFirstTerm = (fiscalEndDate.getTime() === firstFiscalEndDate.getTime());

  let deadline;
  if (isFirstTerm) {
    const deadlineDateA = new Date(establishmentDate.getTime());
    deadlineDateA.setMonth(deadlineDateA.getMonth() + 3);
    const deadlineDateB = firstFiscalEndDate;
    if (deadlineDateA.getTime() < deadlineDateB.getTime()) {
      deadline = new Date(deadlineDateA.getTime());
      deadline.setDate(deadline.getDate() - 1);
    } else {
      deadline = new Date(deadlineDateB.getTime());
      deadline.setDate(deadline.getDate() - 1);
    }
  } else {
    const termStartDate = new Date(fiscalEndDate.getFullYear(), fiscalEndDate.getMonth() - 11, 1);
    deadline = new Date(termStartDate.getTime());
    deadline.setDate(deadline.getDate() - 1);
  }

  return applicationDate.getTime() <= deadline.getTime() ? '青色' : '白色';
}

/* ========== Stripe連携関数群 ========== */

/**
 * プロパティストアからStripe APIキーを取得
 */
function getStripeApiKey() {
  const properties = PropertiesService.getScriptProperties();
  const mode = properties.getProperty('STRIPE_MODE') || 'test';
  const keyName = mode === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_TEST';
  return properties.getProperty(keyName);
}

/**
 * Price IDを取得（消費税義務とプランタイプから判定）
 */
function getPriceId(hasTaxObligation, planType) {
  if (hasTaxObligation && planType === 'yearly') {
    return STRIPE_PRICES.tax_yearly;
  }
  if (hasTaxObligation && planType === 'monthly') {
    return STRIPE_PRICES.tax_monthly;
  }
  if (!hasTaxObligation && planType === 'yearly') {
    return STRIPE_PRICES.no_tax_yearly;
  }
  if (!hasTaxObligation && planType === 'monthly') {
    return STRIPE_PRICES.no_tax_monthly;
  }
  throw new Error('Invalid plan configuration: hasTaxObligation=' + hasTaxObligation + ', planType=' + planType);
}

/**
 * Stripe Checkoutセッションを作成
 */
function createStripeCheckoutSession(uuid, payment) {
  try {
    const apiKey = getStripeApiKey();
    if (!apiKey) {
      throw new Error('Stripe APIキーが設定されていません');
    }

    // Price ID取得
    const priceId = getPriceId(payment.hasTaxObligation, payment.planType);
    
    // line_items構築
    const lineItems = [{
      price: priceId,
      quantity: 1
    }];

    // オプション追加（基本プランと同じ請求間隔で継続請求）
    // 注意: Stripeの制限により、同じCheckout Session内で異なる請求間隔は混在できない
    // v53: 月額プランの場合、オプション料金を12で割って按分
    if (payment.options && payment.options.length > 0) {
      payment.options.forEach(function(option) {
        // 月額プランの場合は年額を12で割って按分
        const optionAmount = payment.planType === 'yearly' 
          ? option.amount 
          : Math.round(option.amount / 12);
        
        lineItems.push({
          price_data: {
            currency: 'jpy',
            product_data: {
              name: option.name
            },
            unit_amount: optionAmount,
            recurring: {
              interval: payment.planType === 'yearly' ? 'year' : 'month'
            }
          },
          quantity: 1
        });
      });
    }

    // Stripe API呼び出し（全てsubscriptionモードで処理）
    const mode = 'subscription';
    const url = 'https://api.stripe.com/v1/checkout/sessions';
    
    // URLエンコード形式でpayloadを構築
    var payloadParts = [];
    payloadParts.push('mode=' + encodeURIComponent(mode));
    
    // line_items を配列形式でエンコード
    lineItems.forEach(function(item, index) {
      if (item.price) {
        // 既存のPrice IDを使用する場合
        payloadParts.push('line_items[' + index + '][price]=' + encodeURIComponent(item.price));
        payloadParts.push('line_items[' + index + '][quantity]=' + encodeURIComponent(item.quantity));
      } else if (item.price_data) {
        // price_dataを使用する場合（オプション）
        payloadParts.push('line_items[' + index + '][price_data][currency]=' + encodeURIComponent(item.price_data.currency));
        payloadParts.push('line_items[' + index + '][price_data][product_data][name]=' + encodeURIComponent(item.price_data.product_data.name));
        payloadParts.push('line_items[' + index + '][price_data][unit_amount]=' + encodeURIComponent(item.price_data.unit_amount));
        if (item.price_data.recurring) {
          payloadParts.push('line_items[' + index + '][price_data][recurring][interval]=' + encodeURIComponent(item.price_data.recurring.interval));
        }
        payloadParts.push('line_items[' + index + '][quantity]=' + encodeURIComponent(item.quantity));
      }
    });
    
    // success_urlとcancel_urlを動的に生成
    const baseUrl = LP2_DETAIL_URL.replace('/lp2-detail.html', '');
    payloadParts.push('success_url=' + encodeURIComponent(LP2_DETAIL_URL + '?session_id={CHECKOUT_SESSION_ID}'));
    payloadParts.push('cancel_url=' + encodeURIComponent(baseUrl + '/1218tst.html?canceled=true'));
    // プロモーションコード入力を許可（初年度のみ適用されるかは、Stripe Dashboardのプロモーションコード設定の「Duration: Once」による）
    payloadParts.push('allow_promotion_codes=true');
    
    // metadata
    payloadParts.push('metadata[uuid]=' + encodeURIComponent(uuid));
    payloadParts.push('metadata[entity_type]=' + encodeURIComponent(payment.entityType || 'individual'));
    payloadParts.push('metadata[plan_type]=' + encodeURIComponent(payment.planType));
    payloadParts.push('metadata[has_tax_obligation]=' + encodeURIComponent(payment.hasTaxObligation ? 'true' : 'false'));

    const options = {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: payloadParts.join('&'),
      muteHttpExceptions: true  // エラーレスポンスの全文を取得
    };

    Logger.log('Stripe API Request - Mode: ' + mode);
    Logger.log('Stripe API Request - Price ID: ' + priceId);
    Logger.log('Stripe API Request - API Key (first 10 chars): ' + apiKey.substring(0, 10));
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('Stripe API Response Code: ' + responseCode);
    Logger.log('Stripe API Response: ' + responseText);
    
    if (responseCode !== 200) {
      throw new Error('Stripe API Error (' + responseCode + '): ' + responseText);
    }
    
    const session = JSON.parse(responseText);

    // ログ記録（v18: 決済ステータスの更新は不要。pending_applicationsに保存済み）
    logWebhookEvent('createCheckoutSession', uuid, 'success', 'Session ID: ' + session.id, '');

    // keysシートにSession IDを保存（LP2機能用）
    const keysSheet = getOrCreateKeys_();
    const keysData = keysSheet.getDataRange().getValues();
    for (let i = 1; i < keysData.length; i++) {
      if (keysData[i][0] === uuid) {
        keysSheet.getRange(i + 1, 6).setValue(session.id); // F列にSession ID保存
        break;
      }
    }

    return {
      success: true,
      sessionId: session.id,
      url: session.url
    };
  } catch (err) {
    Logger.log('createStripeCheckoutSession error: ' + err);
    return {
      success: false,
      error: String(err)
    };
  }
}

/**
 * Stripe Webhookイベント処理
 */
function handleStripeWebhook(e) {
  try {
    const body = e.postData.contents;
    const event = JSON.parse(body);

    logWebhookEvent('handleStripeWebhook', event.id, 'processing', 'Event type: ' + event.type, '');
    Logger.log('Webhook event type: ' + event.type);

    // イベントタイプに応じて処理
    switch (event.type) {
      case 'checkout.session.completed':
        handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.created':
        handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        handleSubscriptionDeleted(event.data.object);
        break;
    }

    logWebhookEvent('handleStripeWebhook', event.id, 'success', 'Event processed: ' + event.type, '');
    return { success: true, received: true };
  } catch (err) {
    logWebhookEvent('handleStripeWebhook', '', 'error', '', String(err));
    Logger.log('handleStripeWebhook error: ' + err);
    return { success: false, error: String(err) };
  }
}

/**
 * Checkout完了イベント処理
 */
function handleCheckoutCompleted(session) {
  try {
    const uuid = session.metadata.uuid;
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const paymentIntentId = session.payment_intent;
    
    // Stripe Sessionからメールアドレスを取得
    const email = session.customer_details?.email || session.customer_email || '';
    
    // Stripe Sessionから課税判定を取得
    const hasTaxObligation = session.metadata.has_tax_obligation === 'true';
    
    // Stripe Sessionからプロモーションコード情報を取得（実際のコード名を取得）
    let promoCode = '';
    if (session.discounts && session.discounts[0]) {
      const pc = session.discounts[0].promotion_code;
      
      // 1. オブジェクトとして展開されている場合、codeプロパティを取得
      if (typeof pc === 'object' && pc !== null && pc.code) {
        promoCode = pc.code;  // 例: "TEST10"
        Logger.log('Promo code from expanded object: ' + promoCode);
      }
      // 2. 文字列（ID）の場合、Stripe APIで詳細取得
      else if (typeof pc === 'string' && pc.startsWith('promo_')) {
        try {
          const apiKey = getStripeApiKey();
          const url = 'https://api.stripe.com/v1/promotion_codes/' + pc;
          const response = UrlFetchApp.fetch(url, {
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + apiKey },
            muteHttpExceptions: true
          });
          
          if (response.getResponseCode() === 200) {
            const pcObj = JSON.parse(response.getContentText());
            promoCode = pcObj.code || pc;  // 例: "TEST10"
            Logger.log('Promo code from API: ' + promoCode);
          } else {
            promoCode = pc;  // APIエラー時はIDのまま保存
            Logger.log('Promo API error, using ID: ' + promoCode);
          }
        } catch (err) {
          promoCode = pc;  // エラー時はIDのまま保存
          Logger.log('Promo code fetch error: ' + err + ', using ID: ' + promoCode);
        }
      }
      // 3. その他の場合
      else if (typeof pc === 'string') {
        promoCode = pc;
      }
    }
    
    // 通貨を確認（JPYは最小通貨単位が1円なので変換不要）
    const currency = (session.currency || 'jpy').toLowerCase();
    const isZeroDecimalCurrency = ['jpy', 'krw', 'vnd', 'clp', 'pyg'].indexOf(currency) !== -1;
    
    const discountAmount = (session.total_details && session.total_details.amount_discount) ? session.total_details.amount_discount : 0;
    const amountTotal = session.amount_total || 0;
    const amountSubtotal = session.amount_subtotal || 0;
    
    // 通貨に応じて変換（JPYなどのゼロデシマル通貨は変換不要）
    const discountYen = isZeroDecimalCurrency ? discountAmount : Math.floor(discountAmount / 100);
    const totalYen = isZeroDecimalCurrency ? amountTotal : Math.floor(amountTotal / 100);
    const subtotalYen = isZeroDecimalCurrency ? amountSubtotal : Math.floor(amountSubtotal / 100);
    
    // デバッグ用：Stripeから取得した金額情報をログ出力
    Logger.log('=== Stripe Amount Details ===');
    Logger.log('Currency: ' + currency.toUpperCase() + (isZeroDecimalCurrency ? ' (Zero-decimal)' : ''));
    Logger.log('Amount Subtotal (元の金額): ' + amountSubtotal + ' → ' + subtotalYen + ' yen');
    Logger.log('Amount Discount (割引額): ' + discountAmount + ' → ' + discountYen + ' yen');
    Logger.log('Amount Total (請求額): ' + amountTotal + ' → ' + totalYen + ' yen');
    Logger.log('Promo Code: ' + promoCode);
    
    logWebhookEvent(
      'checkout.session.completed',
      uuid,
      'processing',
      'Customer: ' + customerId + ', Subscription: ' + subscriptionId + ', Email: ' + email + ', Tax: ' + (hasTaxObligation ? '課税' : '非課税') + (promoCode ? ', Promo: ' + promoCode + ', Discount: ' + discountYen + '円' : ''),
      ''
    );
    
    // 仮保存シートからマスタシートにデータを移動
    const paymentData = {
      status: 'completed',
      uuid: uuid,
      paymentDate: new Date().toISOString(),
      customerId: customerId,
      subscriptionId: subscriptionId,
      email: email,  // Stripeから取得したメールアドレス
      hasTaxObligation: hasTaxObligation,  // 課税判定
      promoCode: promoCode,  // プロモーションコード
      discount: discountYen,  // 割引額（円）
      actualAmount: totalYen  // 実際の決済金額（プロモーションコード適用後）
    };
    
    const moveResult = moveFromPendingToMaster(uuid, paymentData);
    
    if (moveResult.success) {
      const logMessage = moveResult.alreadyExists 
        ? 'Already in master row: ' + moveResult.masterRowIndex + ' (idempotent)'
        : 'Moved to master row: ' + moveResult.masterRowIndex;
      logWebhookEvent('checkout.session.completed', uuid, 'success', logMessage, '');
      Logger.log('Checkout completed for UUID: ' + uuid + ', ' + logMessage);
      
      // LP2案内メール送信（新規追加時のみ、既存データの場合はスキップ）
      if (!moveResult.alreadyExists) {
        const emailResult = sendLP2Email(uuid, session.id);
        if (!emailResult.success) {
          // メール送信失敗してもエラーにはしない（ログのみ）
          Logger.log('LP2メール送信失敗（処理は続行）: ' + emailResult.message);
        }
      }
    } else {
      logWebhookEvent('checkout.session.completed', uuid, 'error', '', moveResult.error);
      Logger.log('handleCheckoutCompleted error: ' + moveResult.error);
    }
  } catch (err) {
    logWebhookEvent('checkout.session.completed', '', 'error', '', String(err));
    Logger.log('handleCheckoutCompleted error: ' + err);
  }
}

/**
 * 決済成功イベント処理
 */
function handlePaymentSucceeded(paymentIntent) {
  Logger.log('Payment succeeded: ' + paymentIntent.id);
}

/**
 * 決済失敗イベント処理
 */
function handlePaymentFailed(paymentIntent) {
  Logger.log('Payment failed: ' + paymentIntent.id);
  // 必要に応じて管理者にメール通知
}

/**
 * サブスクリプション作成イベント処理
 */
function handleSubscriptionCreated(subscription) {
  Logger.log('Subscription created: ' + subscription.id);
}

/**
 * サブスクリプション更新イベント処理
 */
function handleSubscriptionUpdated(subscription) {
  Logger.log('Subscription updated: ' + subscription.id);
}

/**
 * サブスクリプション削除イベント処理
 */
function handleSubscriptionDeleted(subscription) {
  Logger.log('Subscription deleted: ' + subscription.id);
}

/**
 * 決済ステータスを更新（旧バージョン互換用）
 * 注意: v18では基本的に使用されません。moveFromPendingToMaster()を使用してください。
 */
function updatePaymentStatus(uuid, status, paymentId, paymentDate, customerId, subscriptionId) {
  try {
    logWebhookEvent('updatePaymentStatus', uuid, 'start', 'Updating status: ' + status, '');
    
    const info = findRowIndexByUUID(uuid);
    
    if (!info) {
      logWebhookEvent('updatePaymentStatus', uuid, 'error', '', 'UUID not found');
      Logger.log('UUID not found: ' + uuid);
      return;
    }

    logWebhookEvent('updatePaymentStatus', uuid, 'found_row', 'Row index: ' + info.rowIndex + ', sheetType: ' + info.sheetType, '');

    // sheetTypeに応じて適切なシートを選択
    let targetSheet;
    if (info.sheetType === 'master') {
      targetSheet = getOrCreateMaster_();
    } else if (info.sheetType === 'pending') {
      targetSheet = getOrCreatePending_();
    } else {
      throw new Error('Invalid sheetType: ' + info.sheetType);
    }

    // AB列以降にヘッダーがなければ追加
    const headerRow = targetSheet.getRange(1, 28, 1, PAYMENT_HEADERS.length).getValues()[0];
    if (!headerRow[0]) {
      targetSheet.getRange(1, 28, 1, PAYMENT_HEADERS.length).setValues([PAYMENT_HEADERS]);
      logWebhookEvent('updatePaymentStatus', uuid, 'header_added', 'Payment headers added', '');
    }

    // 決済データを更新
    const paymentData = [
      status || '',
      paymentId || '',
      paymentDate || '',
      customerId || '',
      subscriptionId || ''
    ];
    
    targetSheet.getRange(info.rowIndex, 28, 1, PAYMENT_HEADERS.length).setValues([paymentData]);
    
    logWebhookEvent(
      'updatePaymentStatus',
      uuid,
      'success',
      'Row: ' + info.rowIndex + ', SheetType: ' + info.sheetType + ', Status: ' + status + ', Customer: ' + customerId,
      ''
    );
    Logger.log('Payment status updated for UUID: ' + uuid);
  } catch (err) {
    logWebhookEvent('updatePaymentStatus', uuid, 'error', '', String(err));
    Logger.log('updatePaymentStatus error: ' + err);
  }
}

/**
 * 申込ステータスを取得
 */
function getApplicationStatus(uuid) {
  try {
    const info = findRowIndexByUUID(uuid);
    
    if (!info) {
      return {
        success: false,
        error: 'UUID not found'
      };
    }

    // sheetTypeに応じて適切なシートから取得
    if (info.sheetType === 'master') {
      const master = getOrCreateMaster_();
      const paymentData = master.getRange(info.rowIndex, 28, 1, PAYMENT_HEADERS.length).getValues()[0];
      
      return {
        success: true,
        uuid: uuid,
        rowIndex: info.rowIndex,
        sheetType: 'master',
        paymentStatus: paymentData[0] || 'completed',
        paymentId: paymentData[1] || null,
        paymentDate: paymentData[2] || null,
        customerId: paymentData[3] || null,
        subscriptionId: paymentData[4] || null
      };
    } else {
      // pending状態
      return {
        success: true,
        uuid: uuid,
        rowIndex: info.rowIndex,
        sheetType: 'pending',
        paymentStatus: 'pending',
        paymentId: null,
        paymentDate: null,
        customerId: null,
        subscriptionId: null
      };
    }
  } catch (err) {
    Logger.log('getApplicationStatus error: ' + err);
    return {
      success: false,
      error: String(err)
    };
  }
}

/**
 * 古い仮保存データをクリーンアップ（7日以上経過したデータを削除）
 * この関数をトリガーで定期実行することを推奨（例：毎日深夜1回）
 */
function cleanupOldPendingData() {
  try {
    const keysSh = getOrCreateKeys_();
    const pending = getOrCreatePending_();
    const now = new Date();
    const cutoffDays = 7; // 7日以上経過したデータを削除
    
    const lastRow = keysSh.getLastRow();
    if (lastRow < 2) return;
    
    const values = keysSh.getRange(2, 1, lastRow - 1, 5).getValues();
    let deletedCount = 0;
    
    // 下から上に向かって処理（行削除の影響を受けないため）
    for (let i = values.length - 1; i >= 0; i--) {
      const uuid = values[i][0];
      const rowIndex = values[i][1];
      const createdAt = new Date(values[i][2]);
      const status = values[i][3];
      const sheetType = values[i][4];
      
      // pending状態で7日以上経過したデータを削除
      if (sheetType === 'pending' && status === 'pending') {
        const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > cutoffDays) {
          // pending_applicationsシートから削除
          pending.deleteRow(rowIndex);
          
          // keysシートから削除
          keysSh.deleteRow(i + 2);
          
          deletedCount++;
          logWebhookEvent('cleanupOldPendingData', uuid, 'deleted', 'Days old: ' + Math.floor(daysDiff), '');
        }
      }
    }
    
    Logger.log('Cleanup completed. Deleted ' + deletedCount + ' old pending records.');
    logWebhookEvent('cleanupOldPendingData', '', 'completed', 'Deleted: ' + deletedCount + ' records', '');
    
    return {
      success: true,
      deletedCount: deletedCount
    };
  } catch (err) {
    Logger.log('cleanupOldPendingData error: ' + err);
    logWebhookEvent('cleanupOldPendingData', '', 'error', '', String(err));
    return {
      success: false,
      error: String(err)
    };
  }
}

/* ========================================
 * LP2（詳細情報入力ページ）機能
 * ======================================== */

/**
 * Session IDからUUIDを取得
 */
function getUuidBySessionId_(sessionId) {
  const keysSheet = getOrCreateKeys_();
  const keysData = keysSheet.getDataRange().getValues();
  
  for (let i = 1; i < keysData.length; i++) {
    if (keysData[i][5] === sessionId) { // F列: sessionId
      return keysData[i][0]; // A列: uuid
    }
  }
  
  return null;
}

/**
 * LP2アクセス時の簡易認証
 * メールアドレスの最初の3文字を照合
 */
function authenticateLP2(sessionId, emailPrefix) {
  try {
    // 1. sessionId から UUID を取得
    const uuid = getUuidBySessionId_(sessionId);
    if (!uuid) {
      return {
        success: false,
        error: 'session_not_found',
        message: '無効なセッションIDです'
      };
    }

    // 2. UUID から master シートの行を検索
    const info = findRowIndexByUUID(uuid);
    if (!info || info.sheetType !== 'master') {
      return {
        success: false,
        error: 'data_not_found',
        message: 'データが見つかりません'
      };
    }

    // 3. master シートからデータ取得
    const masterSheet = getOrCreateMaster_();
    const rowIndex = info.rowIndex;
    const rowData = masterSheet.getRange(rowIndex, 1, 1, masterSheet.getLastColumn()).getValues()[0];
    
    // 4. E列（メールアドレス）を取得
    const email = rowData[4]; // E列 = index 4
    if (!email) {
      return {
        success: false,
        error: 'email_not_found',
        message: 'メールアドレスが見つかりません'
      };
    }

    // 5. メールアドレスの最初の3文字と照合（大文字小文字区別なし）
    const actualPrefix = email.substring(0, 3).toLowerCase();
    const inputPrefix = emailPrefix.toLowerCase();
    
    if (actualPrefix !== inputPrefix) {
      return {
        success: true,
        authenticated: false,
        message: 'メールアドレスの最初の3文字が一致しません'
      };
    }

    // 6. entityType を取得（G列 = index 6: 個人・法人）
    const entityType = rowData[6]; // G列 = index 6

    // 7. 認証成功
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
 * AG-BX列のデータを抽出（44列分）
 */
function extractLP2Data_(rowData, entityType) {
  const data = {
    // 法人情報（AG-AU）
    corpName: rowData[32] || '',          // AG
    corpNameKana: rowData[33] || '',      // AH
    corpNumber: rowData[34] || '',        // AI
    corpTel1: rowData[35] || '',          // AJ
    corpTel2: rowData[36] || '',          // AK
    corpTel3: rowData[37] || '',          // AL
    corpPostal1: rowData[38] || '',       // AM
    // AN: 未使用
    corpPostal2: rowData[40] || '',       // AO
    // AP: 郵便番号検索ボタン
    corpPrefecture: rowData[42] || '',    // AQ
    corpAddress1: rowData[43] || '',      // AR
    corpAddress1Kana: rowData[44] || '',  // AS
    corpAddress2: rowData[45] || '',      // AT
    corpAddress2Kana: rowData[46] || '',  // AU
    
    // 共通情報（AV）
    taxOffice: rowData[47] || '',         // AV
    
    // 代表者情報/個人情報（AW-BI）
    repName: rowData[48] || '',           // AW
    repNameKana: rowData[49] || '',       // AX
    repTel1: rowData[50] || '',           // AY
    repTel2: rowData[51] || '',           // AZ
    repTel3: rowData[52] || '',           // BA
    repPostal1: rowData[53] || '',        // BB
    repPostal2: rowData[54] || '',        // BC
    // BD: 郵便番号検索ボタン
    repPrefecture: rowData[56] || '',     // BE
    repAddress1: rowData[57] || '',       // BF
    repAddress1Kana: rowData[58] || '',   // BG
    repAddress2: rowData[59] || '',       // BH
    repAddress2Kana: rowData[60] || '',   // BI
    
    // e-Tax/e-Ltax情報（BJ-BM）
    etaxId: rowData[61] || '',            // BJ
    etaxPassword: rowData[62] || '',      // BK
    eltaxId: rowData[63] || '',           // BL
    eltaxPassword: rowData[64] || '',     // BM
    
    // 法人追加情報（BN-BQ）
    capital: rowData[65] || '',           // BN
    fiscalMonth: rowData[66] || '',       // BO
    officerCount: rowData[67] || '',      // BP
    employeeCount: rowData[68] || '',     // BQ
    
    // 会計ソフト情報（BR-BV）
    accountingSoftware: rowData[69] || '', // BR
    softwareName: rowData[70] || '',       // BS
    otherSoftwareName: rowData[71] || '',  // BT
    mfBusinessNumber: rowData[72] || '',   // BU (マネーフォワード事業者番号)
    cloudEmail: rowData[73] || '',         // BV
    
    // Chatwork情報（BW-BX）
    chatworkUse: rowData[74] || '',        // BW
    chatworkEmail: rowData[75] || '',      // BX
    
    // 法人追加情報2（CJ）
    establishmentDate: rowData[87] || '',  // CJ (0ベースで87番目 = 88列目)
    
    // 個人追加情報（CK-CP）
    businessName: rowData[88] || '',       // CK 屋号
    birthDate: rowData[89] || '',          // CL 生年月日
    gender: rowData[90] || '',             // CM 性別
    householdRelation: rowData[91] || '',  // CN 世帯主との続柄
    householdLastName: rowData[92] || '',  // CO 世帯主の氏名（姓）
    householdFirstName: rowData[93] || '', // CP 世帯主の氏名（名）
    // CQ-CS列（個人電話番号）は削除 - 代表者電話番号（AY-BA列）を使用
    
    // 還付先金融機関（CT-CY）
    refundBankName: rowData[97] || '',     // CT 還付先金融機関名
    refundBranchName: rowData[98] || '',   // CU 還付先金融機関支店名
    refundDepositType: rowData[99] || '',  // CV 還付先金融機関預金種類
    refundAccountNumber: rowData[100] || '',// CW 還付先金融機関口座番号
    // CX 郵便局名は削除（貯金記号番号のみで特定可能）
    refundPostalSymbol: rowData[102] || '' // CY 還付先金融機関貯金記号番号
  };

  return data;
}

/**
 * LP2フォーム表示用データ取得
 */
function getLP2FormData(sessionId) {
  try {
    // 1. sessionId から UUID を取得
    const uuid = getUuidBySessionId_(sessionId);
    if (!uuid) {
      return {
        success: false,
        error: 'session_not_found',
        message: '無効なセッションIDです'
      };
    }

    // 2. UUID から master シートの行を検索
    const info = findRowIndexByUUID(uuid);
    if (!info || info.sheetType !== 'master') {
      return {
        success: false,
        error: 'data_not_found',
        message: 'データが見つかりません'
      };
    }

    // 3. master シートからデータ取得
    const masterSheet = getOrCreateMaster_();
    const rowIndex = info.rowIndex;
    
    // 3-1. CH-CI列のヘッダーを確保（LP2画面表示時に確実に追加）
    const promoHeaderRow = masterSheet.getRange(1, 86, 1, 2).getValues()[0];
    if (!promoHeaderRow[0]) {
      masterSheet.getRange(1, 86, 1, 2).setValues([PROMO_HEADERS]);
      logWebhookEvent('getLP2FormData', uuid, 'promo_headers_added', 'Promo headers added on LP2 access', '');
    }
    
    const rowData = masterSheet.getRange(rowIndex, 1, 1, masterSheet.getLastColumn()).getValues()[0];
    
    // 4. entityType を取得（G列 = index 6: 個人・法人）
    const entityType = rowData[6]; // G列 = index 6

    // 5. LP2入力完了フラグをチェック（BY列 = index 76）
    const lp2Completed = rowData[76]; // BY列 = 77列目 = index 76
    const lp2CompletedAt = rowData[77]; // BZ列 = 78列目 = index 77

    // 6. 未入力の場合
    if (!lp2Completed) {
      return {
        success: true,
        lp2Completed: false,
        entityType: entityType,
        uuid: uuid,
        data: null
      };
    }

    // 7. 入力済みの場合、AG-AU列のデータを取得
    const lp2Data = extractLP2Data_(rowData, entityType);

    return {
      success: true,
      lp2Completed: true,
      completedAt: lp2CompletedAt,
      entityType: entityType,
      message: '詳細情報は既に入力済みです。変更がある場合は、minzei@solvis-group.comまでお問い合わせください。',
      data: lp2Data
    };

  } catch (error) {
    Logger.log('getLP2FormData Error: ' + error.toString());
    return {
      success: false,
      error: 'internal_error',
      message: 'データ取得中にエラーが発生しました'
    };
  }
}

/**
 * LP2データを列の配列に変換（AG～BX列、44列分）
 */
function buildLP2Values_(data, entityType) {
  const isCorporate = entityType === '法人';
  
  return [
    // 法人情報（AG-AU）- 個人の場合は空白
    isCorporate ? (data.corpName || '') : '',           // AG
    isCorporate ? (data.corpNameKana || '') : '',       // AH
    isCorporate ? (data.corpNumber || '') : '',         // AI
    isCorporate ? (data.corpTel1 || '') : '',           // AJ
    isCorporate ? (data.corpTel2 || '') : '',           // AK
    isCorporate ? (data.corpTel3 || '') : '',           // AL
    isCorporate ? (data.corpPostal1 || '') : '',        // AM
    '',                                                 // AN (未使用)
    isCorporate ? (data.corpPostal2 || '') : '',        // AO
    '',                                                 // AP (郵便番号検索ボタン・データ保存なし)
    isCorporate ? (data.corpPrefecture || '') : '',     // AQ
    isCorporate ? (data.corpAddress1 || '') : '',       // AR
    isCorporate ? (data.corpAddress1Kana || '') : '',   // AS
    isCorporate ? (data.corpAddress2 || '') : '',       // AT
    isCorporate ? (data.corpAddress2Kana || '') : '',   // AU
    
    // 共通情報（AV）
    data.taxOffice || '',                               // AV
    
    // 代表者情報/個人情報（AW-BI）
    data.repName || '',                                 // AW
    data.repNameKana || '',                             // AX
    data.repTel1 || '',                                 // AY
    data.repTel2 || '',                                 // AZ
    data.repTel3 || '',                                 // BA
    data.repPostal1 || '',                              // BB
    data.repPostal2 || '',                              // BC
    '',                                                 // BD (郵便番号検索ボタン・データ保存なし)
    data.repPrefecture || '',                           // BE
    data.repAddress1 || '',                             // BF
    data.repAddress1Kana || '',                         // BG
    data.repAddress2 || '',                             // BH
    data.repAddress2Kana || '',                         // BI
    
    // e-Tax/e-Ltax情報（BJ-BM）
    data.etaxId || '',                                  // BJ
    data.etaxPassword || '',                            // BK
    isCorporate ? (data.eltaxId || '') : '',            // BL (法人のみ)
    isCorporate ? (data.eltaxPassword || '') : '',      // BM (法人のみ)
    
    // 法人追加情報（BN-BQ）- 個人の場合は空白
    isCorporate ? (data.capital || '') : '',            // BN
    isCorporate ? (data.fiscalMonth || '') : '',        // BO
    isCorporate ? (data.officerCount || '') : '',       // BP
    data.employeeCount || '',                           // BQ (法人・個人共通)
    
    // 会計ソフト情報（BR-BV）
    data.accountingSoftware || '',                      // BR
    data.softwareName || '',                            // BS
    data.otherSoftwareName || '',                       // BT
    data.mfBusinessNumber || '',                        // BU (マネーフォワード事業者番号)
    data.cloudEmail || '',                              // BV
    
    // Chatwork情報（BW-BX）
    data.chatworkUse || '',                             // BW
    data.chatworkEmail || '',                           // BX
    
    // 完了フラグ・日時（BY-BZ）は別途saveLP2Data関数で設定
    // ここでは空白を返す
    '', '',                                             // BY-BZ
    
    // LP1オプション・予備（CA-CI）
    '', '', '', '', '', '', '', '', '',                 // CA-CI (LP1データとして保存されるため空白)
    
    // 法人追加情報2・個人基本情報（CJ）
    data.establishmentDate || '',                       // CJ (法人=設立年月日、個人=事業を開始した日付)
    
    // 個人追加情報（CK-CP）- 法人の場合は空白
    !isCorporate ? (data.businessName || '') : '',      // CK 屋号
    !isCorporate ? (data.birthDate || '') : '',         // CL 生年月日
    !isCorporate ? (data.gender || '') : '',            // CM 性別
    !isCorporate ? (data.householdRelation || '') : '', // CN 世帯主との続柄
    !isCorporate ? (data.householdLastName || '') : '', // CO 世帯主の氏名（姓）
    !isCorporate ? (data.householdFirstName || '') : '',// CP 世帯主の氏名（名）
    // CQ-CS列（個人電話番号）は削除 - 代表者電話番号（AY-BA列）を個人の電話番号として使用
    '', '', '',                                         // CQ-CS 空白（今後使用しない）
    
    // 還付先金融機関（CT-CY）- 個人・法人共通
    data.refundBankName || '',                          // CT 還付先金融機関名
    data.refundBranchName || '',                        // CU 還付先金融機関支店名
    data.refundDepositType || '',                       // CV 還付先金融機関預金種類
    data.refundAccountNumber || '',                     // CW 還付先金融機関口座番号
    '',                                                 // CX 郵便局名（削除済み - 空白保存）
    data.refundPostalSymbol || ''                       // CY 還付先金融機関貯金記号番号
  ];
}

/**
 * LP2で入力された詳細情報を保存
 */
function saveLP2Data(sessionId, data) {
  try {
    // 1. sessionId から UUID を取得
    const uuid = getUuidBySessionId_(sessionId);
    if (!uuid) {
      return {
        success: false,
        error: 'session_not_found',
        message: '無効なセッションIDです'
      };
    }

    // 2. UUID から master シートの行を検索
    const info = findRowIndexByUUID(uuid);
    if (!info || info.sheetType !== 'master') {
      return {
        success: false,
        error: 'data_not_found',
        message: 'データが見つかりません'
      };
    }

    // 3. master シートを取得
    const masterSheet = getOrCreateMaster_();
    const rowIndex = info.rowIndex;

    // 4. LP2入力完了フラグをチェック（BY列 = 77列目）
    const lp2Completed = masterSheet.getRange(rowIndex, 77).getValue();
    if (lp2Completed === true || lp2Completed === 'TRUE') {
      return {
        success: false,
        error: 'already_completed',
        message: '詳細情報は既に入力済みです。変更がある場合は、minzei@solvis-group.comまでお問い合わせください。'
      };
    }

    // 5. entityType を取得（G列 = 7列目: 個人・法人）
    const entityType = masterSheet.getRange(rowIndex, 7).getValue();

    // 6. LP2データを列に配置（AG-CY = 71列）
    const lp2Values = buildLP2Values_(data, entityType);

    // 7. AG-CY列（33-103列目: 71列）にデータを書き込み
    masterSheet.getRange(rowIndex, 33, 1, 71).setValues([lp2Values]);

    // 8. BY列（77列目）にTRUEを設定（buildLP2Values_で空白を返しているため再設定）
    masterSheet.getRange(rowIndex, 77).setValue(true);

    // 9. BZ列（78列目）に現在日時を記録（buildLP2Values_で空白を返しているため再設定）
    masterSheet.getRange(rowIndex, 78).setValue(new Date());
    
    // 10. A列の採番を更新（法人名/氏名が取得できたので再生成）
    const companyName = masterSheet.getRange(rowIndex, 33).getValue(); // AG列：法人名
    const individualName = masterSheet.getRange(rowIndex, 49).getValue(); // AW列：氏名
    const paymentDate = masterSheet.getRange(rowIndex, 30).getValue(); // AD列：決済日時
    
    // 既存の採番を取得（年度・連番は維持）
    const oldClientNumber = masterSheet.getRange(rowIndex, 1).getValue() || '';
    const parts = String(oldClientNumber).split('_');
    
    if (parts.length >= 3) {
      // 既存の採番から年度と連番を取得
      const typeCode = parts[0]; // 1 or 2
      const yearCode = parts[1]; // YY
      const serialCode = parts[2]; // ZZZZ
      
      // 名前部分だけを更新
      const name = (entityType === '法人') ? (companyName || '未設定') : (individualName || '未設定');
      const newClientNumber = typeCode + '_' + yearCode + '_' + serialCode + '_' + name;
      
      masterSheet.getRange(rowIndex, 1).setValue(newClientNumber);
      logWebhookEvent('saveLP2Data', uuid, 'client_number_updated', 'Updated Client Number: ' + newClientNumber, '');
    }

    // 11. ログ記録
    logWebhookEvent('saveLP2Data', uuid, 'success', 'LP2 data saved', '');

    return {
      success: true,
      message: '詳細情報を保存しました'
    };

  } catch (error) {
    Logger.log('saveLP2Data Error: ' + error.toString());
    logWebhookEvent('saveLP2Data', uuid || '', 'error', 'Save failed', error.toString());
    return {
      success: false,
      error: 'internal_error',
      message: 'データ保存中にエラーが発生しました'
    };
  }
}

/**
 * LP2案内メール本文を作成
 * v51: 連絡先をChatworkに統一、今後の流れを更新
 */
function buildLP2EmailBody_(fullName, lp2Url) {
  return fullName + ' 様\n\n' +
    'この度は「みんなの税務顧問」にお申し込みいただき、誠にありがとうございます。\n\n' +
    '決済が正常に完了いたしました。\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '■ 次のステップ：詳細情報のご入力\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '税務顧問サービスの開始にあたり、必要な詳細情報のご入力をお願いいたします。\n\n' +
    '以下のリンクから、詳細情報の入力ページにアクセスしてください：\n\n' +
    '▼ 詳細情報入力ページ\n' +
    lp2Url + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '■ ご注意\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '・このリンクはお客様専用です。他の方と共有しないでください。\n' +
    '・詳細情報は一度入力されると、変更ができません。\n' +
    '・入力内容に変更が必要な場合は、Chatworkにてご連絡ください。\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '■ 今後の流れ\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '1. 詳細情報のご入力（本メールのリンクから）\n' +
    '2. Googleドライブの連携\n' +
    '3. 必要書類のご案内\n' +
    '4. Chatworkの連携\n' +
    '5. サービス開始\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'ご不明な点がございましたら、Chatworkにてご連絡をお願いいたします。\n\n' +
    'みんなの税務顧問 運営事務局\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
}

/**
 * LP2案内メールを送信
 */
function sendLP2Email(uuid, sessionId) {
  logWebhookEvent('sendLP2Email', uuid, 'start', 'Session ID: ' + sessionId, '');
  try {
    // 1. UUID から master シートの行を検索
    const info = findRowIndexByUUID(uuid);
    if (!info || info.sheetType !== 'master') {
      const errMsg = 'master data not found for UUID: ' + uuid;
      Logger.log('sendLP2Email: ' + errMsg);
      logWebhookEvent('sendLP2Email', uuid, 'error', '', errMsg);
      return {
        success: false,
        error: 'data_not_found',
        message: 'データが見つかりません'
      };
    }

    // 2. master シートからデータ取得
    const masterSheet = getOrCreateMaster_();
    const rowIndex = info.rowIndex;
    const rowData = masterSheet.getRange(rowIndex, 1, 1, masterSheet.getLastColumn()).getValues()[0];
    
    // 3. 必要なデータを取得
    const email = rowData[4]; // E列: メールアドレス
    const entityType = rowData[6]; // G列: 個人・法人
    
    if (!email) {
      const errMsg = 'email not found for UUID: ' + uuid;
      Logger.log('sendLP2Email: ' + errMsg);
      logWebhookEvent('sendLP2Email', uuid, 'error', '', errMsg);
      return {
        success: false,
        error: 'email_not_found',
        message: 'メールアドレスが見つかりません'
      };
    }

    // 4. LP2 URL を構築
    const lp2Url = LP2_DETAIL_URL + '?session_id=' + sessionId;

    // 5. メール本文を作成
    const recipientName = entityType === '法人' ? 'ご担当者' : 'お客';
    const subject = '【みんなの税務顧問】お申し込みありがとうございます - 詳細情報のご入力をお願いいたします';
    const body = buildLP2EmailBody_(recipientName, lp2Url);

    // 6. メール送信
    GmailApp.sendEmail(email, subject, body, {
      name: 'みんなの税務顧問',
      replyTo: 'minzei@solvis-group.com'
    });

    // 7. ログ記録
    logWebhookEvent('sendLP2Email', uuid, 'success', 'Email sent to: ' + email, '');

    Logger.log('LP2案内メール送信成功: ' + email);

    return {
      success: true,
      message: 'LP2案内メールを送信しました'
    };

  } catch (error) {
    Logger.log('sendLP2Email Error: ' + error.toString());
    logWebhookEvent('sendLP2Email', uuid || '', 'error', 'Email send failed', error.toString());
    return {
      success: false,
      error: 'send_failed',
      message: 'メール送信に失敗しました: ' + error.toString()
    };
  }
}

/* ========================================
 * テスト関数（GASエディタで実行）
 * ======================================== */

/**
 * authenticateLP2 テスト
 * 使い方：実際のSession IDとメールアドレスの最初の3文字を設定して実行
 */
function testAuthenticateLP2() {
  // ⚠️ 実際の値に置き換えてください
  const sessionId = 'cs_test_b1mNe5oGk0runPJ7yVgGuNFnBhznL5rfRgX6ms5fSRXElz1TSsNyJbIJpJ'; // 実際のSession ID
  const emailPrefix = 'tes'; // テスト用メールアドレスの最初の3文字
  
  const result = authenticateLP2(sessionId, emailPrefix);
  Logger.log('=== authenticateLP2 Result ===');
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success && result.authenticated) {
    Logger.log('✅ 認証成功！entityType: ' + result.entityType);
  } else if (result.success && !result.authenticated) {
    Logger.log('❌ 認証失敗：' + result.message);
  } else {
    Logger.log('❌ エラー：' + result.message);
  }
}

/**
 * getLP2FormData テスト
 */
function testGetLP2FormData() {
  // ⚠️ 実際のSession IDに置き換えてください
  const sessionId = 'cs_test_b1mNe5oGk0runPJ7yVgGuNFnBhznL5rfRgX6ms5fSRXElz1TSsNyJbIJpJ';
  
  const result = getLP2FormData(sessionId);
  Logger.log('=== getLP2FormData Result ===');
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success && !result.completed) {
    Logger.log('✅ LP2未入力です。entityType: ' + result.entityType);
  } else if (result.success && result.completed) {
    Logger.log('✅ LP2入力済みです。completedAt: ' + result.completedAt);
  } else {
    Logger.log('❌ エラー：' + result.message);
  }
}

/**
 * saveLP2Data テスト（個人）
 */
function testSaveLP2DataIndividual() {
  // ⚠️ 実際のSession IDに置き換えてください
  const sessionId = 'cs_test_b1mNe5oGk0runPJ7yVgGuNFnBhznL5rfRgX6ms5fSRXElz1TSsNyJbIJpJ';
  const data = {
    name: 'テスト太郎',
    nameKana: 'テストタロウ',
    postalCode: '1000001',
    address: '東京都千代田区千代田1-1',
    etaxNumber: '1234567890123456',
    etaxPassword: 'testpass123',
    accountingSoftwareUsage: '使用している',
    accountingSoftwareName: 'マネーフォワード',
    accountingSoftwareOther: '',
    cloudAccountingEmail: 'test@example.com'
  };
  
  const result = saveLP2Data(sessionId, data);
  Logger.log('=== saveLP2Data (Individual) Result ===');
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    Logger.log('✅ LP2データ保存成功！');
  } else {
    Logger.log('❌ エラー：' + result.message);
  }
}

/**
 * saveLP2Data テスト（法人）
 */
function testSaveLP2DataCorporate() {
  // ⚠️ 実際のSession IDに置き換えてください（法人のもの）
  const sessionId = 'cs_test_xxx'; // 法人の実際のSession ID
  const data = {
    corporationName: '株式会社テスト',
    corporationPostalCode: '1000001',
    corporationAddress: '東京都千代田区丸の内1-1-1',
    representativeName: '山田太郎',
    representativeNameKana: 'ヤマダタロウ',
    representativePostalCode: '1000002',
    representativeAddress: '東京都千代田区丸の内2-2-2',
    etaxNumber: '1234567890123456',
    etaxPassword: 'testpass123',
    eltaxId: 'eltax123456',
    eltaxPassword: 'eltaxpass',
    accountingSoftwareUsage: '使用している',
    accountingSoftwareName: 'freee',
    accountingSoftwareOther: '',
    cloudAccountingEmail: 'test@example.com'
  };
  
  const result = saveLP2Data(sessionId, data);
  Logger.log('=== saveLP2Data (Corporate) Result ===');
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    Logger.log('✅ LP2データ保存成功！');
  } else {
    Logger.log('❌ エラー：' + result.message);
  }
}

/**
 * sendLP2Email テスト
 */
function testSendLP2Email() {
  // ⚠️ 実際のUUIDとSession IDに置き換えてください
  const uuid = '947d7c33-1373-4999-9cb2-8f757feff73f'; // 実際のUUID
  const sessionId = 'cs_test_b1mNe5oGk0runPJ7yVgGuNFnBhznL5rfRgX6ms5fSRXElz1TSsNyJbIJpJ'; // 実際のSession ID
  
  const result = sendLP2Email(uuid, sessionId);
  Logger.log('=== sendLP2Email Result ===');
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    Logger.log('✅ LP2案内メール送信成功！');
  } else {
    Logger.log('❌ エラー：' + result.message);
  }
}

/**
 * getUuidBySessionId テスト
 */
function testGetUuidBySessionId() {
  // ⚠️ 実際のSession IDに置き換えてください
  const sessionId = 'cs_test_b1mNe5oGk0runPJ7yVgGuNFnBhznL5rfRgX6ms5fSRXElz1TSsNyJbIJpJ';
  
  const uuid = getUuidBySessionId_(sessionId);
  Logger.log('=== getUuidBySessionId Result ===');
  Logger.log('Session ID: ' + sessionId);
  Logger.log('UUID: ' + uuid);
  
  if (uuid) {
    Logger.log('✅ UUID取得成功！');
  } else {
    Logger.log('❌ UUIDが見つかりません');
  }
}

/**
 * keysシートの内容を確認（最新5件を表示）
 */
function testShowKeysSheet() {
  const keysSheet = getOrCreateKeys_();
  const lastRow = keysSheet.getLastRow();
  
  Logger.log('=== keys シート確認 ===');
  Logger.log('総行数: ' + lastRow);
  
  if (lastRow < 2) {
    Logger.log('❌ データが1件もありません');
    return;
  }
  
  // 最新5件（または全件）を取得
  const displayCount = Math.min(5, lastRow - 1);
  const startRow = Math.max(2, lastRow - displayCount + 1);
  
  Logger.log('\n--- 最新 ' + displayCount + ' 件のデータ ---');
  
  const data = keysSheet.getRange(startRow, 1, displayCount, 5).getValues();
  
  for (let i = 0; i < data.length; i++) {
    const rowNum = startRow + i;
    Logger.log('\n【行 ' + rowNum + '】');
    Logger.log('  UUID (A列): ' + data[i][0]);
    Logger.log('  Session ID (B列): ' + data[i][1]);
    Logger.log('  作成日時 (C列): ' + data[i][2]);
    Logger.log('  ステータス (D列): ' + data[i][3]);
    Logger.log('  シートタイプ (E列): ' + data[i][4]);
  }
  
  Logger.log('\n✅ keys シートの内容確認完了');
}

/**
 * 特定のUUIDでkeysシートを検索
 */
function testFindByUUID() {
  const uuid = '947d7c33-1373-4999-9cb2-8f757feff73f'; // 実際のUUID
  
  const keysSheet = getOrCreateKeys_();
  const data = keysSheet.getDataRange().getValues();
  
  Logger.log('=== UUID検索: ' + uuid + ' ===');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === uuid) {
      Logger.log('✅ 見つかりました！ 行番号: ' + (i + 1));
      Logger.log('  UUID: ' + data[i][0]);
      Logger.log('  Session ID: ' + data[i][1]);
      Logger.log('  rowIndex: ' + data[i][1]);
      Logger.log('  作成日時: ' + data[i][2]);
      Logger.log('  ステータス: ' + data[i][3]);
      Logger.log('  シートタイプ: ' + data[i][4]);
      return;
    }
  }
  
  Logger.log('❌ UUIDが見つかりませんでした');
}

/**
 * webhook_logsシートから最新のメール送信ログを確認
 */
function testCheckEmailLogs() {
  const logSheet = getOrCreateLogSheet_();
  const lastRow = logSheet.getLastRow();
  
  Logger.log('=== webhook_logs: sendLP2Email 検索 ===');
  Logger.log('総行数: ' + lastRow);
  
  if (lastRow < 2) {
    Logger.log('❌ ログが1件もありません');
    return;
  }
  
  // 最新20件からsendLP2Emailを検索
  const displayCount = Math.min(20, lastRow - 1);
  const startRow = Math.max(2, lastRow - displayCount + 1);
  
  const data = logSheet.getRange(startRow, 1, displayCount, 6).getValues();
  
  let found = false;
  for (let i = data.length - 1; i >= 0; i--) {
    const eventType = data[i][1]; // B列: Event Type
    
    if (eventType === 'sendLP2Email') {
      found = true;
      const rowNum = startRow + i;
      Logger.log('\n【行 ' + rowNum + '】sendLP2Email');
      Logger.log('  Timestamp: ' + data[i][0]);
      Logger.log('  UUID: ' + data[i][2]);
      Logger.log('  Status: ' + data[i][3]);
      Logger.log('  Details: ' + data[i][4]);
      Logger.log('  Error: ' + data[i][5]);
    }
  }
  
  if (!found) {
    Logger.log('❌ sendLP2Email のログが見つかりませんでした');
    Logger.log('最新のログ（最新5件）:');
    for (let i = Math.max(0, data.length - 5); i < data.length; i++) {
      Logger.log('\n【' + data[i][1] + '】' + data[i][3]);
    }
  }
}

