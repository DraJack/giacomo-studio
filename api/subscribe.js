// Modulo "Non sei pronto?": salva il numero di telefono su Brevo (attributo SMS).
// Giacomo poi scrive a mano su WhatsApp: nessuna email automatica.

const ERR_TEL = 'Controlla il numero, sembra incompleto.';

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

  const { telefono, tipo_business, ha_sito, source } = req.body || {};

  const sms = normPhone(telefono);
  if (!sms) {
    return res.status(400).json({ error: ERR_TEL });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);

  if (!apiKey || !listId) {
    console.error('Missing BREVO env vars');
    return res.status(500).json({ error: 'Configurazione server mancante.' });
  }

  // Brevo accetta un contatto senza email se ha l'attributo SMS.
  // TIPO_BUSINESS, HA_SITO e SOURCE vanno creati in Brevo (Contatti > Impostazioni > Attributi).
  const attributes = { SMS: sms };
  if (tipo_business) attributes.TIPO_BUSINESS = tipo_business;
  if (ha_sito)       attributes.HA_SITO       = ha_sito;
  if (source)        attributes.SOURCE        = source;

  const payload = { attributes, listIds: [listId], updateEnabled: true };

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (brevoRes.ok || brevoRes.status === 204) {
      return res.status(200).json({ ok: true });
    }

    const errBody = await brevoRes.json().catch(() => ({}));
    // Numero già in lista (ha già compilato il modulo): per chi scrive è comunque andata bene.
    if (brevoRes.status === 400 && errBody.code === 'duplicate_parameter') {
      return res.status(200).json({ ok: true });
    }
    console.error('Brevo error:', brevoRes.status, errBody);
    return res.status(502).json({ error: 'Invio non riuscito. Riprova.' });

  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(502).json({ error: 'Errore di rete. Riprova.' });
  }
}
