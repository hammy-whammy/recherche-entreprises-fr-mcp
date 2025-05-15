#!/usr/bin/env node

const readline = require('readline');
const fetch = require('node-fetch');

// Set up standard input interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let buffer = '';
rl.on('line', (line) => {
  if (line === '') {
    handleRequest();
  } else {
    buffer += line;
  }
});

async function handleRequest() {
  try {
    const req = JSON.parse(buffer);
    buffer = '';
    let result = null;
    if (req.method === 'search' && req.params && req.params.siren) {
      const siren = encodeURIComponent(req.params.siren);
      const url = `https://recherche-entreprises.api.gouv.fr/search?q=${siren}`;
      const response = await fetch(url);
      result = await response.json();
    } else {
      throw new Error('Invalid request parameters');
    }
    const resObj = { id: req.id, result, error: null };
    process.stdout.write(JSON.stringify(resObj));
    process.stdout.write('\n\n');
  } catch (err) {
    const errObj = { id: null, result: null, error: err.message };
    process.stdout.write(JSON.stringify(errObj));
    process.stdout.write('\n\n');
  }
}
