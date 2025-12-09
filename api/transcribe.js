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

export default async function handler(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Password',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/transcribe', '');
    
    // Verificar senha (opcional)
    const password = request.headers.get('X-Password');
    if (ACCESS_PASSWORD && password !== ACCESS_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Senha incorreta' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Forward request to AssemblyAI
    const assemblyResponse = await fetch(assemblyUrl, {
      method: request.method,
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
      body: request.method !== 'GET' ? await request.arrayBuffer() : undefined,
    });

    const data = await assemblyResponse.json();

    return new Response(JSON.stringify(data), {
      status: assemblyResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

