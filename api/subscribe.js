// Modulo "Non sei pronto?": manda il numero di telefono all'app web Apps Script del foglio Google
// "Contatti giacomostudio", che aggiunge la riga e avvisa Giacomo via Gmail (script in apps-script/Code.gs).
// Giacomo poi scrive a mano su WhatsApp: nessun messaggio automatico al cliente.

const ERR_TEL  = 'Controlla il numero, sembra incompleto.';
const ERR_CONF = 'Configurazione server mancante.';
const ERR_SEND = 'Invio non riuscito. Riprova.';

// Stessa regola di normPhone() in index.html: numeri italiani, +39 davanti.
export function normPhone(raw) {
  let s = String(raw ?? '').replace(/[\s.\-()\/]/g, '');
  if (s.startsWith('0039')) s = '+39' + s.slice(4);
  if (s.startsWith('+39')) s = s.slice(3);
  else if (s.startsWith('+')) return null;
  return /^\d{6,11}$/.test(s) ? '+39' + s : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telefono, ha_sito, source } = req.body || {};

  const tel = normPhone(telefono);
  if (!tel) {
    return res.status(400).json({ error: ERR_TEL });
  }

  const url   = process.env.SHEET_WEBHOOK_URL;
  const token = process.env.SHEET_TOKEN;
  if (!url || !token) {
    console.error('Missing SHEET_WEBHOOK_URL / SHEET_TOKEN');
    return res.status(500).json({ error: ERR_CONF });
  }

  const payload = { token, telefono: tel, ha_sito: String(ha_sito ?? ''), source: String(source ?? '') };

  try {
    // Apps Script risponde 302 verso googleusercontent.com: il redirect va seguito per leggere il JSON.
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    const data = r.ok ? await r.json() : null;
    if (data && data.ok === true) {
      return res.status(200).json({ ok: true });
    }
    console.error('Apps Script error:', r.status, data);
  } catch (err) {
    console.error('Apps Script fetch error:', err && err.message);
  }
  return res.status(502).json({ error: ERR_SEND });
}
