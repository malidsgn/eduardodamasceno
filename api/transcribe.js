/**
 * ColectOps Proxy - Protege sua API key da AssemblyAI
 * Deploy na Vercel como Edge Function
 */

// API key e senha ficam nas variáveis de ambiente da Vercel (não no código!)
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || 'colectops2024';

export const config = {
  runtime: 'edge',
};

// CORS headers - definido globalmente
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Password',
};

export default async function handler(request) {
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/transcribe', '');
    
    // Verificar senha
    const password = request.headers.get('X-Password');
    if (ACCESS_PASSWORD && password !== ACCESS_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Senha incorreta' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se API key existe
    if (!ASSEMBLYAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key não configurada no servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determinar endpoint da AssemblyAI
    let assemblyUrl = 'https://api.assemblyai.com/v2';
    
    if (path === '/upload' || path === '') {
      assemblyUrl += '/upload';
    } else if (path.startsWith('/transcript')) {
      assemblyUrl += path;
    } else {
      assemblyUrl += '/transcript';
    }

    // Preparar body se não for GET
    let body = null;
    if (request.method !== 'GET') {
      body = await request.arrayBuffer();
    }

    // Forward request to AssemblyAI
    const assemblyResponse = await fetch(assemblyUrl, {
      method: request.method,
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
      body: body,
    });

    // Tentar parsear como JSON, se falhar retorna texto
    const responseText = await assemblyResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText || 'Erro desconhecido da API' };
    }

    return new Response(JSON.stringify(data), {
      status: assemblyResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do proxy' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

