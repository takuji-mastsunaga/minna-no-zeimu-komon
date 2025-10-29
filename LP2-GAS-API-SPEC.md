# LP2 GAS API 詳細設計書

## 📋 概要

LP2（詳細情報入力ページ）で使用する、Google Apps Script（GAS）のAPI実装仕様書。

---

## 🔧 新規追加API一覧

### 1. `authenticateLP2(sessionId, emailPrefix)`
### 2. `getLP2FormData(sessionId)`
### 3. `saveLP2Data(sessionId, data)`
### 4. `sendLP2Email(uuid, sessionId)`

---

## API詳細仕様

### 1. authenticateLP2()

#### 目的
LP2アクセス時の簡易認証（メールアドレスの最初の3文字確認）

#### シグネチャ
```javascript
function authenticateLP2(sessionId, emailPrefix)
```

#### パラメータ
- `sessionId` (string): Stripe Checkout Session ID
- `emailPrefix` (string): メールアドレスの最初の3文字（大文字小文字区別なし）

#### 戻り値
```javascript
// 成功
{
  success: true,
  authenticated: true,
  entityType: 'individual', // or 'corporate'
  uuid: '947d7c33-1373-4999-9cb2-8f757feff73f'
}

// 失敗
{
  success: true,
  authenticated: false,
  message: 'メールアドレスの最初の3文字が一致しません'
}

// エラー
{
  success: false,
  error: 'session_not_found',
  message: '無効なセッションIDです'
}
```

#### 処理フロー
```javascript
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

    // 6. entityType を取得（B列）
    const entityType = rowData[1]; // B列 = index 1

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
```

#### 補助関数
```javascript
/**
 * Session ID から UUID を取得
 */
function getUuidBySessionId_(sessionId) {
  const keysSheet = getOrCreateKeys_();
  const keysData = keysSheet.getDataRange().getValues();
  
  for (let i = 1; i < keysData.length; i++) {
    if (keysData[i][1] === sessionId) { // B列: session_id
      return keysData[i][0]; // A列: uuid
    }
  }
  
  return null;
}
```

---

### 2. getLP2FormData()

#### 目的
LP2フォーム表示用データ取得（入力済みチェック、entityType取得）

#### シグネチャ
```javascript
function getLP2FormData(sessionId)
```

#### パラメータ
- `sessionId` (string): Stripe Checkout Session ID

#### 戻り値
```javascript
// 未入力の場合
{
  success: true,
  completed: false,
  entityType: 'individual', // or 'corporate'
  uuid: '947d7c33-1373-4999-9cb2-8f757feff73f',
  data: null
}

// 入力済みの場合
{
  success: true,
  completed: true,
  completedAt: '2025-10-27T10:30:00.000Z',
  entityType: 'corporate',
  message: '詳細情報は既に入力済みです。変更がある場合は、minzei@solvis-group.comまでお問い合わせください。',
  data: {
    corporationName: '株式会社テスト',
    corporationPostalCode: '1234567',
    // ... AG-AU列のデータ
  }
}

// エラー
{
  success: false,
  error: 'session_not_found',
  message: '無効なセッションIDです'
}
```

#### 処理フロー
```javascript
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
    const rowData = masterSheet.getRange(rowIndex, 1, 1, masterSheet.getLastColumn()).getValues()[0];
    
    // 4. entityType を取得（B列）
    const entityType = rowData[1]; // B列 = index 1

    // 5. LP2入力完了フラグをチェック（AV列 = index 47）
    const lp2Completed = rowData[47]; // AV列
    const lp2CompletedAt = rowData[48]; // AW列

    // 6. 未入力の場合
    if (!lp2Completed) {
      return {
        success: true,
        completed: false,
        entityType: entityType,
        uuid: uuid,
        data: null
      };
    }

    // 7. 入力済みの場合、AG-AU列のデータを取得
    const lp2Data = extractLP2Data_(rowData, entityType);

    return {
      success: true,
      completed: true,
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
```

#### 補助関数
```javascript
/**
 * AG-AU列のデータを抽出
 */
function extractLP2Data_(rowData, entityType) {
  const data = {
    corporationName: rowData[32] || '', // AG列
    corporationPostalCode: rowData[33] || '', // AH列
    corporationAddress: rowData[34] || '', // AI列
    representativeName: rowData[35] || '', // AJ列
    representativeNameKana: rowData[36] || '', // AK列
    representativePostalCode: rowData[37] || '', // AL列
    representativeAddress: rowData[38] || '', // AM列
    etaxNumber: rowData[39] || '', // AN列
    etaxPassword: rowData[40] || '', // AO列
    eltaxId: rowData[41] || '', // AP列
    eltaxPassword: rowData[42] || '', // AQ列
    accountingSoftwareUsage: rowData[43] || '', // AR列
    accountingSoftwareName: rowData[44] || '', // AS列
    accountingSoftwareOther: rowData[45] || '', // AT列
    cloudAccountingEmail: rowData[46] || '' // AU列
  };

  return data;
}
```

---

### 3. saveLP2Data()

#### 目的
LP2で入力された詳細情報をmasterシートのAG-AW列に保存

#### シグネチャ
```javascript
function saveLP2Data(sessionId, data)
```

#### パラメータ
- `sessionId` (string): Stripe Checkout Session ID
- `data` (object): LP2で入力されたデータ

**data構造（個人）**:
```javascript
{
  name: '山田太郎',
  nameKana: 'ヤマダタロウ',
  postalCode: '1234567',
  address: '東京都千代田区...',
  etaxNumber: '1234567890123456',
  etaxPassword: 'password123',
  accountingSoftwareUsage: '使用している',
  accountingSoftwareName: 'マネーフォワード',
  accountingSoftwareOther: '',
  cloudAccountingEmail: 'test@example.com'
}
```

**data構造（法人）**:
```javascript
{
  corporationName: '株式会社テスト',
  corporationPostalCode: '1234567',
  corporationAddress: '東京都千代田区...',
  representativeName: '山田太郎',
  representativeNameKana: 'ヤマダタロウ',
  representativePostalCode: '7654321',
  representativeAddress: '東京都港区...',
  etaxNumber: '1234567890123456',
  etaxPassword: 'password123',
  eltaxId: 'eltax123',
  eltaxPassword: 'eltaxpass',
  accountingSoftwareUsage: '使用している',
  accountingSoftwareName: 'freee',
  accountingSoftwareOther: '',
  cloudAccountingEmail: 'test@example.com'
}
```

#### 戻り値
```javascript
// 成功
{
  success: true,
  message: '詳細情報を保存しました'
}

// 失敗（既に入力済み）
{
  success: false,
  error: 'already_completed',
  message: '詳細情報は既に入力済みです。変更がある場合は、minzei@solvis-group.comまでお問い合わせください。'
}

// エラー
{
  success: false,
  error: 'session_not_found',
  message: '無効なセッションIDです'
}
```

#### 処理フロー
```javascript
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

    // 4. LP2入力完了フラグをチェック（AV列 = 48列目）
    const lp2Completed = masterSheet.getRange(rowIndex, 48).getValue();
    if (lp2Completed === true || lp2Completed === 'TRUE') {
      return {
        success: false,
        error: 'already_completed',
        message: '詳細情報は既に入力済みです。変更がある場合は、minzei@solvis-group.comまでお問い合わせください。'
      };
    }

    // 5. entityType を取得（B列）
    const entityType = masterSheet.getRange(rowIndex, 2).getValue();

    // 6. LP2データを列に配置
    const lp2Values = buildLP2Values_(data, entityType);

    // 7. AG-AU列（33-47列目）にデータを書き込み
    masterSheet.getRange(rowIndex, 33, 1, 15).setValues([lp2Values]);

    // 8. AV列（48列目）にTRUEを設定
    masterSheet.getRange(rowIndex, 48).setValue(true);

    // 9. AW列（49列目）に現在日時を記録
    masterSheet.getRange(rowIndex, 49).setValue(new Date());

    // 10. ログ記録
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
```

#### 補助関数
```javascript
/**
 * LP2データを列の配列に変換
 */
function buildLP2Values_(data, entityType) {
  if (entityType === 'individual') {
    // 個人の場合
    return [
      '', // AG: 空欄
      '', // AH: 空欄
      '', // AI: 空欄
      data.name || '', // AJ: 名前
      data.nameKana || '', // AK: フリガナ
      data.postalCode || '', // AL: 郵便番号
      data.address || '', // AM: 住所
      data.etaxNumber || '', // AN: e-tax番号
      data.etaxPassword || '', // AO: e-tax パスワード
      '', // AP: 空欄
      '', // AQ: 空欄
      data.accountingSoftwareUsage || '', // AR: 会計ソフト使用状況
      data.accountingSoftwareName || '', // AS: 会計ソフト名
      data.accountingSoftwareOther || '', // AT: その他ソフト名
      data.cloudAccountingEmail || '' // AU: クラウド会計メール
    ];
  } else {
    // 法人の場合
    return [
      data.corporationName || '', // AG: 法人名
      data.corporationPostalCode || '', // AH: 法人郵便番号
      data.corporationAddress || '', // AI: 法人住所
      data.representativeName || '', // AJ: 代表者名
      data.representativeNameKana || '', // AK: 代表者フリガナ
      data.representativePostalCode || '', // AL: 代表者郵便番号
      data.representativeAddress || '', // AM: 代表者住所
      data.etaxNumber || '', // AN: e-tax番号
      data.etaxPassword || '', // AO: e-tax暗証番号
      data.eltaxId || '', // AP: e-Ltax ID
      data.eltaxPassword || '', // AQ: e-Ltax暗証番号
      data.accountingSoftwareUsage || '', // AR: 会計ソフト使用状況
      data.accountingSoftwareName || '', // AS: 会計ソフト名
      data.accountingSoftwareOther || '', // AT: その他ソフト名
      data.cloudAccountingEmail || '' // AU: クラウド会計メール
    ];
  }
}
```

---

### 4. sendLP2Email()

#### 目的
決済完了後、LP2案内メールを送信

#### シグネチャ
```javascript
function sendLP2Email(uuid, sessionId)
```

#### パラメータ
- `uuid` (string): アプリケーションUUID
- `sessionId` (string): Stripe Checkout Session ID

#### 戻り値
```javascript
// 成功
{
  success: true,
  message: 'LP2案内メールを送信しました'
}

// エラー
{
  success: false,
  error: 'email_not_found',
  message: 'メールアドレスが見つかりません'
}
```

#### 処理フロー
```javascript
function sendLP2Email(uuid, sessionId) {
  try {
    // 1. UUID から master シートの行を検索
    const info = findRowIndexByUUID(uuid);
    if (!info || info.sheetType !== 'master') {
      Logger.log('sendLP2Email: master data not found for UUID: ' + uuid);
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
    const entityType = rowData[1]; // B列: entityType
    const lastName = rowData[2]; // C列: 姓
    const firstName = rowData[3]; // D列: 名
    const email = rowData[4]; // E列: メールアドレス
    
    if (!email) {
      Logger.log('sendLP2Email: email not found for UUID: ' + uuid);
      return {
        success: false,
        error: 'email_not_found',
        message: 'メールアドレスが見つかりません'
      };
    }

    // 4. LP2 URL を構築
    const lp2Url = LP2_BASE_URL + '?session_id=' + sessionId;

    // 5. メール本文を作成
    const fullName = lastName + ' ' + firstName;
    const subject = '【みんなの税務顧問】お申し込みありがとうございます - 詳細情報のご入力をお願いいたします';
    const body = buildLP2EmailBody_(fullName, lp2Url);

    // 6. メール送信
    GmailApp.sendEmail(email, subject, body);

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
```

#### 補助関数
```javascript
/**
 * LP2案内メール本文を作成
 */
function buildLP2EmailBody_(fullName, lp2Url) {
  return `${fullName} 様

この度は「みんなの税務顧問」にお申し込みいただき、誠にありがとうございます。

決済が正常に完了いたしました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 次のステップ：詳細情報のご入力
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

税務顧問サービスの開始にあたり、必要な詳細情報のご入力をお願いいたします。

以下のリンクから、詳細情報の入力ページにアクセスしてください：

▼ 詳細情報入力ページ
${lp2Url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ ご注意
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

・このリンクはお客様専用です。他の方と共有しないでください。
・詳細情報は一度入力されると、変更ができません。
・入力内容に変更が必要な場合は、minzei@solvis-group.com までご連絡ください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 今後の流れ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 詳細情報のご入力（本メールのリンクから）
2. 担当者より3営業日以内にご連絡
3. 必要書類のご案内
4. オンライン面談の日程調整
5. サービス開始

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたら、お気軽にお問い合わせください。

みんなの税務顧問 運営事務局
メール：minzei@solvis-group.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
```

---

## 🔄 既存関数の修正

### handleCheckoutCompleted() の修正

`handleCheckoutCompleted`関数に、LP2案内メール送信機能を追加します。

#### 修正箇所
```javascript
function handleCheckoutCompleted(eventData) {
  try {
    const session = eventData.data.object;
    const sessionId = session.id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const uuid = session.metadata ? session.metadata.uuid : null;

    logWebhookEvent('checkout.session.completed', uuid || '', 'processing', 
      'Customer: ' + customerId + ', Subscription: ' + subscriptionId, '');

    if (!uuid) {
      logWebhookEvent('checkout.session.completed', '', 'error', 'UUID not found in metadata', '');
      return { success: false, error: 'UUID not found in session metadata' };
    }

    const paymentData = {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      paymentIntentId: session.payment_intent || '',
      paymentDate: new Date(),
      paymentStatus: 'completed'
    };

    const result = moveFromPendingToMaster(uuid, paymentData);

    if (result.success) {
      logWebhookEvent('checkout.session.completed', uuid, 'success', 
        'Moved to master row: ' + result.masterRow, '');
      
      // 🆕 LP2案内メール送信
      const emailResult = sendLP2Email(uuid, sessionId);
      if (!emailResult.success) {
        // メール送信失敗してもエラーにはしない（ログのみ）
        Logger.log('LP2メール送信失敗（処理は続行）: ' + emailResult.message);
      }
      
      return { success: true, received: true };
    } else {
      logWebhookEvent('checkout.session.completed', uuid, 'error', 
        'moveFromPendingToMaster failed', result.error || 'unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    logWebhookEvent('checkout.session.completed', uuid || '', 'error', 
      'Exception in handleCheckoutCompleted', error.toString());
    throw error;
  }
}
```

---

## 🔧 定数の追加

`Code.gs`の冒頭に以下の定数を追加：

```javascript
// ========== Configuration ==========
const MASTER_SHEET_NAME = 'master';
const KEYS_SHEET_NAME = 'keys';
const PENDING_SHEET_NAME = 'pending_applications';
const STRIPE_MODE_KEY = 'STRIPE_MODE';
const LOG_SHEET_NAME = 'webhook_logs';
const LP2_BASE_URL = 'https://minna-no-zeimu-komon-ny5y0mx4o-solvis.vercel.app/lp2-detail.html'; // 🆕 追加
```

---

## 📊 スプレッドシート列追加

### masterシート ヘッダー行に追加

以下の列ヘッダーをAG-AW列に追加してください：

| 列 | ヘッダー名 |
|----|-----------|
| AG | 法人名 |
| AH | 法人郵便番号 |
| AI | 法人住所 |
| AJ | 代表者名/名前 |
| AK | フリガナ |
| AL | 代表者郵便番号/郵便番号 |
| AM | 代表者住所/住所 |
| AN | e-tax利用者識別番号 |
| AO | e-tax暗証番号/パスワード |
| AP | e-Ltax利用者ID |
| AQ | e-Ltax暗証番号 |
| AR | 会計ソフト使用状況 |
| AS | 使用会計ソフト名 |
| AT | その他会計ソフト名 |
| AU | クラウド会計メールアドレス |
| AV | LP2入力完了フラグ |
| AW | LP2入力日時 |

---

## 🧪 テストコード

### テスト用関数

```javascript
/**
 * authenticateLP2 テスト
 */
function testAuthenticateLP2() {
  const sessionId = 'cs_test_xxx'; // 実際のSession IDに置き換え
  const emailPrefix = 'tes'; // テスト用メールアドレスの最初の3文字
  
  const result = authenticateLP2(sessionId, emailPrefix);
  Logger.log('authenticateLP2 Result:');
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * getLP2FormData テスト
 */
function testGetLP2FormData() {
  const sessionId = 'cs_test_xxx'; // 実際のSession IDに置き換え
  
  const result = getLP2FormData(sessionId);
  Logger.log('getLP2FormData Result:');
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * saveLP2Data テスト（個人）
 */
function testSaveLP2DataIndividual() {
  const sessionId = 'cs_test_xxx'; // 実際のSession IDに置き換え
  const data = {
    name: '山田太郎',
    nameKana: 'ヤマダタロウ',
    postalCode: '1234567',
    address: '東京都千代田区丸の内1-1-1',
    etaxNumber: '1234567890123456',
    etaxPassword: 'testpass123',
    accountingSoftwareUsage: '使用している',
    accountingSoftwareName: 'マネーフォワード',
    accountingSoftwareOther: '',
    cloudAccountingEmail: 'test@example.com'
  };
  
  const result = saveLP2Data(sessionId, data);
  Logger.log('saveLP2Data Result:');
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * saveLP2Data テスト（法人）
 */
function testSaveLP2DataCorporate() {
  const sessionId = 'cs_test_xxx'; // 実際のSession IDに置き換え
  const data = {
    corporationName: '株式会社テスト',
    corporationPostalCode: '1234567',
    corporationAddress: '東京都千代田区丸の内1-1-1',
    representativeName: '山田太郎',
    representativeNameKana: 'ヤマダタロウ',
    representativePostalCode: '7654321',
    representativeAddress: '東京都港区赤坂1-1-1',
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
  Logger.log('saveLP2Data Result:');
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * sendLP2Email テスト
 */
function testSendLP2Email() {
  const uuid = '947d7c33-1373-4999-9cb2-8f757feff73f'; // 実際のUUIDに置き換え
  const sessionId = 'cs_test_xxx'; // 実際のSession IDに置き換え
  
  const result = sendLP2Email(uuid, sessionId);
  Logger.log('sendLP2Email Result:');
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

## 🚀 デプロイ手順

### 1. Code.gs に新規関数を追加
- `authenticateLP2()`
- `getLP2FormData()`
- `saveLP2Data()`
- `sendLP2Email()`
- 補助関数すべて

### 2. 既存関数を修正
- `handleCheckoutCompleted()` にメール送信処理を追加

### 3. 定数を追加
- `LP2_BASE_URL` を追加

### 4. スプレッドシートにヘッダー追加
- masterシートのAG-AW列にヘッダーを追加

### 5. デプロイ
- 「デプロイ」→「新しいデプロイ」
- バージョン説明: `v23 - LP2機能追加（認証、フォーム、メール送信）`
- デプロイ実行

### 6. テスト
- 各テスト関数を実行して動作確認
- 実際に決済テストを行い、メールが届くか確認

---

**作成日**: 2025年10月27日  
**バージョン**: 1.0  
**最終更新**: 2025年10月27日



