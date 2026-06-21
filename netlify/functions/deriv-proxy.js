exports.handler = async function(event) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Deriv-Auth, X-Deriv-App-ID',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // Pega o path do destino
  let derivPath = null;
  if (event.queryStringParameters && event.queryStringParameters.path) {
    derivPath = event.queryStringParameters.path;
  } else if (event.rawQuery) {
    const match = event.rawQuery.match(/(?:^|&)path=([^&]*)/);
    if (match) derivPath = decodeURIComponent(match[1]);
  }

  if (!derivPath) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Parâmetro path ausente.' }),
    };
  }

  const h = event.headers;

  // Estratégia 1: headers customizados (não são stripados pelo Netlify)
  let authorization = h['x-deriv-auth'] || '';
  let appId = h['x-deriv-app-id'] || '';

  // Estratégia 2: fallback para Authorization padrão
  if (!authorization) authorization = h['authorization'] || '';
  if (!appId) appId = h['deriv-app-id'] || '';

  // Estratégia 3: fallback para body JSON
  if (!authorization && event.body) {
    try {
      const bodyData = JSON.parse(event.body);
      if (bodyData._auth) authorization = bodyData._auth;
      if (bodyData._appId) appId = bodyData._appId;
    } catch(e) {}
  }

  console.log('[deriv-proxy] path:', derivPath);
  console.log('[deriv-proxy] auth presente:', !!authorization, '| appId:', appId);

  if (!authorization || !appId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Credenciais ausentes.', auth: !!authorization, appId: !!appId }),
    };
  }

  const derivUrl = 'https://api.derivws.com' + derivPath;
  const method = event.httpMethod === 'OPTIONS' ? 'GET' : event.httpMethod;

  // Remove campos internos do body antes de repassar
  let forwardBody = undefined;
  if (event.body && method !== 'GET') {
    try {
      const parsed = JSON.parse(event.body);
      delete parsed._auth;
      delete parsed._appId;
      forwardBody = JSON.stringify(parsed);
    } catch(e) {
      forwardBody = event.body;
    }
  }

  try {
    const response = await fetch(derivUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization.startsWith('Bearer ') ? authorization : 'Bearer ' + authorization,
        'Deriv-App-ID': appId,
      },
      body: forwardBody,
    });

    const responseText = await response.text();
    console.log('[deriv-proxy] Deriv status:', response.status);

    return {
      statusCode: response.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: responseText,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Erro fetch: ' + err.message }),
    };
  }
};