import express, { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface Param {
  name: string;
  in: string;
  required: boolean;
  schema: any;
  description: string;
}

interface EndpointDescriptor {
  id: string;
  path: string;
  method: string;
  description: string;
  parameters: Param[];
  responses: any;
}

interface MCPDescriptor {
  endpoints: EndpointDescriptor[];
}

const app = express();
const port = process.env.PORT || 3000;

const descriptorPath = path.join(__dirname, '../mcp.json');
const descriptor: MCPDescriptor = JSON.parse(fs.readFileSync(descriptorPath, 'utf-8'));

app.use(express.json());

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

// JSON-RPC endpoint for MCP
app.post('/', async (req: Request, res: Response) => {
  const { jsonrpc, method, params, id } = req.body;
  let result;

  if (method === 'initialize') {
    result = {
      tools: descriptor.endpoints.map((ep: EndpointDescriptor) => ({
        id: ep.id,
        name: ep.id,
        description: ep.description,
        parameters: ep.parameters,
        returnSchema: {}
      })),
      resources: [],
      prompts: []
    };
  } else if (method === 'tools/list') {
    result = descriptor.endpoints.map((ep: EndpointDescriptor) => ({
      id: ep.id,
      name: ep.id,
      description: ep.description,
      parameters: ep.parameters,
      returnSchema: {}
    }));
  } else if (method === 'tools/call') {
    const { tool, inputs } = params;
    if (tool.id === 'lookupBySiren') {
      try {
        const apiRes = await axios.get(
          `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(inputs.siren)}`
        );
        result = { outputs: apiRes.data };
      } catch (error) {
        return res.status(500).json({
          jsonrpc: '2.0',
          id,
          error: { code: -32000, message: 'External API call failed' }
        });
      }
    } else {
      return res.status(400).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: 'Method not found' }
      });
    }
  } else if (method === 'resources') {
    result = [];
  } else if (method === 'prompts') {
    result = [];
  } else {
    return res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: 'Method not found' }
    });
  }

  res.json({ jsonrpc: '2.0', id, result });
});

app.listen(port, () => {
  console.log(`SIREN MCP server listening on port ${port}`);
});
