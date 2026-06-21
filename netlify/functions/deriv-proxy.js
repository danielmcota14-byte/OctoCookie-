exports.handler = async function(event) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Deriv-App-ID',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // Debug: loga tudo que chegou
  console.log('[deriv-proxy] event.path:', event.path);
  console.log('[deriv-proxy] event.rawUrl:', event.rawUrl);
  console.log('[deriv-proxy] event.queryStringParameters:', JSON.stringify(event.queryStringParameters));
  console.log('[deriv-proxy] event.rawQuery:', event.rawQuery);
  console.log('[deriv-proxy] headers:', JSON.stringify(event.headers));

  // Tenta pegar o path de todas as formas possíveis
  let derivPath =
    (event.queryStringParameters && event.queryStringParameters.path) ||
    (event.multiValueQueryStringParameters && event.multiValueQueryStringParameters.path && event.multiValueQueryStringParameters.path[0]) ||
    null;

  // Fallback: tenta parsear a rawQuery manualmente
  if (!derivPath && event.rawQuery) {
    const match = event.rawQuery.match(/(?:^|&)path=([^&]*)/);
    if (match) derivPath = decodeURIComponent(match[1]);
  }

  // Fallback: tenta pegar da rawUrl
  if (!derivPath && event.rawUrl) {
    try {
      const url = new URL(event.rawUrl);
      derivPath = url.searchParams.get('path');
    } catch(e) {}
  }

  console.log('[deriv-proxy] derivPath resolvido:', derivPath);

  if (!derivPath) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Parâmetro "path" não encontrado.',
        debug: {
          queryStringParameters: event.queryStringParameters,
          rawQuery: event.rawQuery,
          rawUrl: event.rawUrl,
        }
      }),
    };
  }

  const derivUrl = 'https://api.derivws.com' + derivPath;
  const h = event.headers;
  const authorization = h['authorization'] || '';
  const appId = h['deriv-app-id'] || '';

  console.log('[deriv-proxy] url destino:', derivUrl);
  console.log('[deriv-proxy] authorization presente:', !!authorization);
  console.log('[deriv-proxy] appId:', appId);

  if (!authorization) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Header Authorization ausente.' }),
    };
  }
  if (!appId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Header Deriv-App-ID ausente.' }),
    };
  }

  try {
    const response = await fetch(derivUrl, {
      method: event.httpMethod === 'OPTIONS' ? 'GET' : event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
        'Deriv-App-ID': appId,
      },
      body: event.body && event.httpMethod !== 'GET' ? event.body : undefined,
    });

    const responseText = await response.text();
    console.log('[deriv-proxy] resposta Deriv status:', response.status);

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
