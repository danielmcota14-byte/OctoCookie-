// netlify/functions/deriv-proxy.js
// Proxy para a Options API da Deriv — evita bloqueio de CORS no navegador.
// O navegador chama /.netlify/functions/deriv-proxy e esta função repassa para api.derivws.com

const https = require('https');

exports.handler = async function(event) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Deriv-App-ID',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // Lê o path que veio após /deriv-proxy, ex: /trading/v1/options/accounts
  const derivPath = event.queryStringParameters?.path;
  if (!derivPath) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Parâmetro "path" não informado.' }),
    };
  }

  const derivUrl = 'https://api.derivws.com' + derivPath;

  // Repassa os headers de autenticação
  const forwardHeaders = {
    'Content-Type': 'application/json',
  };
  if (event.headers['authorization'] || event.headers['Authorization']) {
    forwardHeaders['Authorization'] = event.headers['authorization'] || event.headers['Authorization'];
  }
  if (event.headers['deriv-app-id'] || event.headers['Deriv-App-ID']) {
    forwardHeaders['Deriv-App-ID'] = event.headers['deriv-app-id'] || event.headers['Deriv-App-ID'];
  }

  try {
    const response = await fetch(derivUrl, {
      method: event.httpMethod,
      headers: forwardHeaders,
      body: event.body || undefined,
    });

    const responseText = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
      body: responseText,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Erro ao conectar com a Deriv: ' + err.message }),
    };
  }
};
