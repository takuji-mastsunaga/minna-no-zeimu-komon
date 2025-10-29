# 1218tst デプロイ手順書

## 📋 システム構成

```
┌─────────────────────────────────────────┐
│  1218tst.html (フロントエンド)         │
│  - Vercel / Netlifyにデプロイ          │
│  - ユーザーが入力フォームを操作         │
│  - fetch()でGAS APIを呼び出し          │
└─────────────┬───────────────────────────┘
              │ HTTPS POST
              ↓
┌─────────────────────────────────────────┐
│  Code.gs (バックエンドAPI)             │
│  - Google Apps Scriptにデプロイ        │
│  - doPost(): LP①データを保存           │
│  - doOptions(): CORS対応               │
│  - UUID発行 & スプレッドシートに保存    │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│  Google スプレッドシート                │
│  - マスタシート: 申込データ（G〜AA列）  │
│  - keysシート: UUID↔行番号の対応表      │
└─────────────────────────────────────────┘
```

## 🚀 デプロイ手順

### ステップ1: Google Apps Scriptにデプロイ

#### 1-1. GASプロジェクトを開く

1. [Google Apps Script](https://script.google.com/)にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「1218tst-Backend」に変更

#### 1-2. Code.gsをコピー

1. `gas-backend/Code.gs`の内容をすべてコピー
2. GASエディタの`Code.gs`に貼り付け
3. 💾 保存

#### 1-3. スプレッドシートIDを確認

`Code.gs`の8行目に既に設定されています：

```javascript
const SPREADSHEET_ID = '19YI0cjUlgznSX-T3KA8AuknTjNlmHMuQHBfoXKZTBdg';
```

このスプレッドシートが存在することを確認してください。
アクセスURL: `https://docs.google.com/spreadsheets/d/19YI0cjUlgznSX-T3KA8AuknTjNlmHMuQHBfoXKZTBdg/edit`

#### 1-4. Webアプリとしてデプロイ

1. エディタ右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で「ウェブアプリ」を選択
3. 以下の設定を行います：

   | 項目 | 設定値 |
   |------|--------|
   | 説明 | 1218tst Backend API v1 |
   | 次のユーザーとして実行 | 自分 |
   | アクセスできるユーザー | **全員** ← 重要！ |

4. 「デプロイ」ボタンをクリック
5. **ウェブアプリのURL**をコピーして保存

   例: `https://script.google.com/macros/s/AKfycby.../exec`

### ステップ2: 1218tst.htmlの設定

#### 2-1. GAS_API_URLを設定

1. `1218tst.html`を開く
2. 10行目付近の以下の部分を見つける：

```javascript
const GAS_API_URL = 'YOUR_GAS_WEB_APP_URL_HERE';
```

3. ステップ1-4で取得したURLに置き換える：

```javascript
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```

4. 💾 保存

### ステップ3: Vercelにデプロイ

#### 3-1. Vercelにデプロイ

```bash
cd /Users/takujimatsunaga/minna-no-zeimu-komon

# Vercelにデプロイ
vercel --prod
```

#### 3-2. 動作確認

1. デプロイされたURL（例：`https://your-domain.vercel.app/1218tst`）にアクセス
2. フォームを入力して申込テスト
3. スプレッドシートにデータが保存されることを確認

## ✅ 動作確認チェックリスト

### バックエンド（GAS）の確認

- [ ] Code.gsをGASにコピー完了
- [ ] SPREADSHEET_IDが正しく設定されている
- [ ] Webアプリとしてデプロイ完了（アクセス: **全員**）
- [ ] デプロイURLを取得
- [ ] ブラウザでGAS URLにアクセスして確認：
  ```json
  {"status":"ok","message":"1218tst Backend API is running","timestamp":"..."}
  ```

### フロントエンド（1218tst.html）の確認

- [ ] `GAS_API_URL`を設定完了
- [ ] Vercelにデプロイ完了
- [ ] デプロイURLでアクセス可能

### 連携テスト

- [ ] フォームに情報を入力して申込
- [ ] エラーが発生せずに完了メッセージが表示される
- [ ] スプレッドシート「マスタ」シートのG〜AA列にデータが保存されている
- [ ] スプレッドシート「keys」シートにUUIDと行番号が記録されている
- [ ] 完了メッセージにUUID、行番号、LP②URLが表示される

## 🔧 トラブルシューティング

### エラー: "GAS URLが設定されていません"

**原因**: `1218tst.html`の`GAS_API_URL`が設定されていない

**解決策**:
1. GASをデプロイして URLを取得
2. `1218tst.html`の`GAS_API_URL`を設定
3. Vercelに再デプロイ

### エラー: "CORS エラー"

**原因**: GASのデプロイ設定が正しくない

**解決策**:
1. GASの「デプロイを管理」を開く
2. 「アクセスできるユーザー」が「**全員**」になっているか確認
3. 新しいバージョンとして再デプロイ

### エラー: "スプレッドシートが見つかりません"

**原因**: `SPREADSHEET_ID`が正しくない、または権限がない

**解決策**:
1. スプレッドシートのURLを確認
2. `Code.gs`の`SPREADSHEET_ID`を確認
3. スプレッドシートにアクセス権限があるか確認

### データが保存されない

**原因**: GASの実行権限が不足

**解決策**:
1. GASエディタで適当な関数を実行
2. 「権限を確認」をクリック
3. 必要な権限を承認

## 📊 スプレッドシートのデータ構造

### マスタシート

| 列 | ヘッダー | 内容 | 例 |
|----|----------|------|-----|
| A-F | （既存列） | 既存データ | - |
| G | 個人・法人 | 事業形態 | 個人 / 法人 |
| H | 青色・白色 | 申告方法 | 青色 / 白色 |
| I | 設立日 | 法人の設立日 | 2024-01-01 |
| J | 青色申告提出日 | 提出日 | 2024-03-15 |
| K | 次回決算日 | 決算日 | 2025-03-31 |
| L | インボイス番号 | T+13桁 | T1234567890123 |
| M | 業種 | 選択した業種 | IT, サービス業 |
| N | 専従者給与の支払い | あり/なし | あり |
| O | 役員報酬 | あり/なし | あり |
| P | 給与所得 | あり/なし | あり |
| Q | 不動産所得 | あり/なし | なし |
| R | ふるさと納税 | あり/なし | なし |
| S | 住宅ローン控除の申請 | あり/なし | なし |
| T | 法定調書・年末調整セット | あり/なし | あり |
| U | 源泉納付（特例） | あり/なし | あり |
| V | 源泉納付（普通） | あり/なし | なし |
| W | FX所得 | あり/なし | なし |
| X | 暗号資産の取引 | あり/なし | なし |
| Y | プラン | 年間一括 / 月額 | 年間一括払い |
| Z | 料金 | 基本料金 | 99080 |
| AA | 初年度合計金額 | 合計金額 | 99080 |

### keysシート

| 列 | ヘッダー | 内容 | 例 |
|----|----------|------|-----|
| A | uuid | UUID | 550e8400-e29b-41d4-a716-446655440000 |
| B | rowIndex | マスタシートの行番号 | 2 |
| C | createdAt | 作成日時 | 2025-10-21T12:34:56.789Z |
| D | status | ステータス | LP1_saved |

## 🔄 更新手順

Code.gsを更新した場合：

1. GASエディタでコードを編集
2. 💾 保存
3. 「デプロイ」→「デプロイを管理」
4. 現在のデプロイの右側の鉛筆アイコンをクリック
5. 「バージョン」で「新バージョン」を選択
6. 「デプロイ」をクリック

**注意**: URLは変わりません

1218tst.htmlを更新した場合：

```bash
cd /Users/takujimatsunaga/minna-no-zeimu-komon
git add 1218tst.html
git commit -m "Update: 1218tst.html"
git push
# または
vercel --prod
```

## 🔐 セキュリティに関する注意事項

### CORS設定

- 現在は`Access-Control-Allow-Origin: *`で全許可
- 本番環境では特定ドメインに限定することを推奨：

```javascript
function buildCorsHeaders_() {
  return {
    'Access-Control-Allow-Origin': 'https://your-domain.vercel.app',  // 特定ドメインのみ
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600'
  };
}
```

### APIキーの管理

- GAS Web App URLは秘密情報として扱う
- 公開リポジトリにコミットしない（環境変数を使用）

### データの保護

- スプレッドシートは自分のGoogleアカウントでのみアクセス可能
- 他のユーザーと共有する場合は適切な権限設定を行う

## 📞 サポート

### 参考リンク

- [Google Apps Script ドキュメント](https://developers.google.com/apps-script)
- [Vercel デプロイ](https://vercel.com/docs)

### ログの確認方法

**Google Apps Script**:
```
GASエディタ → 実行ログ（画面下部）
```

**ブラウザ**:
```
F12 → Console タブ
```

## 🎉 完成！

すべてのセットアップが完了すると：

1. ユーザーが`https://your-domain.vercel.app/1218tst`にアクセス
2. フォームに情報を入力
3. 「申込を完了する」をクリック
4. データが自動的にGoogleスプレッドシートに保存
5. UUIDとLP②のURLが表示される

これで完全に機能する1218tstシステムが完成です！


