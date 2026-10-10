export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, tipo_business, ha_sito, source } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Email non valida.' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);

  if (!apiKey || !listId) {
    console.error('Missing BREVO env vars');
    return res.status(500).json({ error: 'Configurazione server mancante.' });
  }

  const payload = {
    email: email.trim(),
    listIds: [listId],
    updateEnabled: true,
  };

  // Include quiz attributes if provided
  // Requires TIPO_BUSINESS and HA_SITO custom attributes in Brevo (Contacts > Settings > Attributes)
  const attrs = {};
  if (tipo_business) attrs.TIPO_BUSINESS = tipo_business;
  if (ha_sito)       attrs.HA_SITO       = ha_sito;
  if (source)        attrs.SOURCE        = source;
  if (Object.keys(attrs).length) payload.attributes = attrs;

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
    console.error('Brevo error:', brevoRes.status, errBody);
    return res.status(502).json({ error: 'Iscrizione non riuscita. Riprova.' });

  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(502).json({ error: 'Errore di rete. Riprova.' });
  }
}
