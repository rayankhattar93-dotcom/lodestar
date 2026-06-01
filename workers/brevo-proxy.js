const ALLOWED_ORIGINS = new Set([
  'https://lodestarcareers.co',
  'https://www.lodestarcareers.co'
]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const acao = ALLOWED_ORIGINS.has(origin) ? origin : 'https://lodestarcareers.co';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(acao) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, acao);
    }

    if (!env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY secret is not set on this Worker');
      return json({ error: 'Server misconfiguration' }, 500, acao);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request body' }, 400, acao);
    }

    const { firstName, email, listId } = body;
    if (!firstName || !email || !listId) {
      return json({ error: 'Missing required fields: firstName, email, listId' }, 400, acao);
    }

    let brevoRes;
    try {
      brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.BREVO_API_KEY
        },
        body: JSON.stringify({
          email,
          attributes: { FIRSTNAME: firstName },
          listIds: [Number(listId)],
          updateEnabled: true
        })
      });
    } catch (e) {
      console.error('Failed to reach Brevo:', e);
      return json({ error: 'Failed to reach Brevo' }, 502, acao);
    }

    if (brevoRes.ok) {
      return json({ ok: true }, 200, acao);
    }

    const err = await brevoRes.json().catch(() => ({}));
    console.error('Brevo rejected the request:', brevoRes.status, JSON.stringify(err));
    return json({ error: err.message || 'Brevo error' }, brevoRes.status, acao);
  }
};

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
  });
}
