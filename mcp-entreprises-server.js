// Cloudflare Worker-compatible version
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    let req;
    try {
      req = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ id: null, result: null, error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (req.method === 'search' && req.params && req.params.siren) {
      const siren = encodeURIComponent(req.params.siren);
      const url = `https://recherche-entreprises.api.gouv.fr/search?q=${siren}`;
      try {
        const apiRes = await fetch(url);
        const result = await apiRes.json();
        return new Response(JSON.stringify({ id: req.id, result, error: null }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ id: req.id, result: null, error: err.message }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({ id: req && req.id || null, result: null, error: 'Invalid request parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
};
