// Vercel Serverless Function: Stripe Webhook 中間プロキシ
// 目的: GASの302リダイレクト問題を回避し、Stripeに200を返す

// GAS Web App URL (v53)
const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwqW2piUBJOcOHdqv0GMCX1u_qJveJsHyuYW7GW2oF2DMecqsvLwEuvoHd3ZUrQ-nzI/exec';

export default async function handler(req, res) {
  // POSTリクエストのみ受け付け
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ログ出力（Vercel Dashboardで確認可能）
  console.log('[stripe-webhook] Request received');
  console.log('[stripe-webhook] Headers:', JSON.stringify(req.headers, null, 2));

  try {
    // Stripeからのリクエストボディを取得
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    console.log('[stripe-webhook] Forwarding to GAS...');

    // GASにリクエストを転送
    const gasResponse = await fetch(GAS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Stripeの署名ヘッダーを転送
        'stripe-signature': req.headers['stripe-signature'] || '',
      },
      body: rawBody,
      // GASの302リダイレクトを追跡
      redirect: 'follow',
    });

    console.log('[stripe-webhook] GAS response status:', gasResponse.status);

    // GASからのレスポンスを取得（ログ用）
    let gasResponseText = '';
    try {
      gasResponseText = await gasResponse.text();
      console.log('[stripe-webhook] GAS response body:', gasResponseText.substring(0, 500));
    } catch (e) {
      console.log('[stripe-webhook] Could not read GAS response body');
    }

    // Stripeには常に200を返す（GASの302問題を回避）
    return res.status(200).json({ 
      received: true,
      gasStatus: gasResponse.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // エラーが発生しても、Stripeには200を返す
    // （GASが既に処理を完了している可能性があるため）
    console.error('[stripe-webhook] Error:', error.message);
    
    return res.status(200).json({ 
      received: true,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
