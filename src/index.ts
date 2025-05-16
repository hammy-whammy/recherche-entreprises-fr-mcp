import express from 'express';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

app.get('/lookup', async (req, res) => {
  const sirenParam = req.query.siren;
  if (!sirenParam || Array.isArray(sirenParam)) {
    return res.status(400).json({ error: 'Missing or invalid "siren" parameter' });
  }
  const siren = String(sirenParam);

  try {
    const apiRes = await axios.get(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(siren)}`);
    return res.json(apiRes.data);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching SIREN data:', error.message);
    } else {
      console.error('Error fetching SIREN data:', error);
    }
    return res.status(502).json({ error: 'Failed to fetch data from external API' });
  }
});

app.listen(port, () => {
  console.log(`SIREN MCP server listening on port ${port}`);
});
