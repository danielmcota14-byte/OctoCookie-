// netlify/functions/deriv-proxy.js
// Proxy para a Options API da Deriv — evita bloqueio de CORS no navegador.

exports.handler = async function(event) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Deriv-App-ID',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const derivPath = event.queryStringParameters?.path;
  if (!derivPath) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Parâmetro "path" não informado.' }),
    };
  }

  const derivUrl = 'https://api.derivws.com' + derivPath;

  // Netlify converte todos os headers para lowercase — buscar sempre em lowercase
  const h = event.headers;
  const authorization = h['authorization'] || '';
  const appId         = h['deriv-app-id'] || '';

  console.log('[deriv-proxy] path:', derivPath);
  console.log('[deriv-proxy] authorization presente:', !!authorization);
  console.log('[deriv-proxy] deriv-app-id:', appId);

  if (!authorization) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Header Authorization ausente no proxy.' }),
    };
  }
  if (!appId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Header Deriv-App-ID ausente no proxy.' }),
    };
  }

  const forwardHeaders = {
    'Content-Type':  'application/json',
    'Authorization': authorization,
    'Deriv-App-ID':  appId,
  };

  try {
    const response = await fetch(derivUrl, {
      method:  event.httpMethod,
      headers: forwardHeaders,
      body:    event.body || undefined,
    });

    const responseText = await response.text();
    console.log('[deriv-proxy] status Deriv:', response.status);

    return {
      statusCode: response.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: responseText,
    };
  } catch (err) {
    console.error('[deriv-proxy] erro fetch:', err.message);
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Erro ao conectar com a Deriv: ' + err.message }),
    };
  }
};