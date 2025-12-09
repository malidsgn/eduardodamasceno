/**
 * ColectOps Proxy - Protege sua API key da AssemblyAI
 * Deploy na Vercel como Serverless Function (suporta arquivos até 50MB)
 */

// API key e senha ficam nas variáveis de ambiente da Vercel
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || 'colectops2024';

// Configuração para aceitar arquivos grandes
export const config = {
  api: {
    bodyParser: false, // Desabilita parser padrão para streaming
    responseLimit: false,
  },
  maxDuration: 60, // 60 segundos de timeout
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Password',
};

// Helper para adicionar CORS headers
function corsResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export default async function handler(request, response) {
  // Adicionar CORS headers em todas as respostas
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.setHeader(key, value);
  });

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  try {
    const path = request.url.replace('/api/transcribe', '').split('?')[0];
    
    // Verificar senha
    const password = request.headers['x-password'];
    if (ACCESS_PASSWORD && password !== ACCESS_PASSWORD) {
      response.status(401).json({ error: 'Senha incorreta' });
      return;
    }

    // Verificar se API key existe
    if (!ASSEMBLYAI_API_KEY) {
      response.status(500).json({ error: 'API key não configurada no servidor' });
      return;
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

    // Coletar body da requisição
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    // Forward request to AssemblyAI
    const assemblyResponse = await fetch(assemblyUrl, {
      method: request.method,
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': request.headers['content-type'] || 'application/json',
      },
      body: request.method !== 'GET' ? body : undefined,
    });

    // Tentar parsear como JSON
    const responseText = await assemblyResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText || 'Erro desconhecido da API' };
    }

    response.status(assemblyResponse.status).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    response.status(500).json({ error: error.message || 'Erro interno do proxy' });
  }
}

