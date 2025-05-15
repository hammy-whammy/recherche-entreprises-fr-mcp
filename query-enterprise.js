const fetch = require('node-fetch');

async function queryEntreprise(siren) {
  const response = await fetch('https://mcp-entreprises-server.hamza-ahmed-18575.workers.dev/sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: Date.now().toString(),
      method: 'search',
      params: { siren }
    })
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
}

// Usage example:
queryEntreprise('821161197')
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(err => console.error('Error:', err.message));