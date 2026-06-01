export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }

    const { firstName, email, listId } = body;
    if (!firstName || !email || !listId) {
      return json({ error: 'Missing required fields: firstName, email, listId' }, 400);
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
    } catch {
      return json({ error: 'Failed to reach Brevo' }, 502);
    }

    if (brevoRes.ok) {
      return json({ ok: true }, 200);
    }

    const err = await brevoRes.json().catch(() => ({}));
    return json({ error: err.message || 'Brevo error' }, brevoRes.status);
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': 'https://lodestarcareers.co',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors() }
  });
}
