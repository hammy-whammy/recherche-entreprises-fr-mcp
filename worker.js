export default {
  async fetch(request, env, ctx) {
    const urlObj = new URL(request.url);
    if (urlObj.pathname !== "/sse") {
      return new Response("Not found", { status: 404 });
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    let req;
    try {
      req = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ id: null, result: null, error: "Invalid JSON" }), { status: 400 });
    }
    let result = null;
    try {
      if (req.method === "search" && req.params && req.params.siren) {
        const siren = encodeURIComponent(req.params.siren);
        const apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${siren}`;
        const apiRes = await fetch(apiUrl);
        result = await apiRes.json();
        return new Response(JSON.stringify({ id: req.id, result, error: null }), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        throw new Error("Invalid request parameters");
      }
    } catch (err) {
      return new Response(JSON.stringify({ id: req && req.id || null, result: null, error: err.message }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }
  },
};
