require('dotenv').config();
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

// Inicializa o cliente do Supabase com as variáveis de ambiente
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Função utilitária para enviar respostas em JSON com cabeçalhos CORS
function enviarJSON(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  // Trata requisições Preflight (OPTIONS) do CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Permite apenas requisições GET
  if (req.method !== 'GET') {
    return enviarJSON(res, 405, { erro: 'Método não permitido. Esta API só aceita GET.' });
  }

  try {
    // ----------------------------------------------------
    // GET /api/questions -> Retorna todas as perguntas com suas alternativas
    // ----------------------------------------------------
    if (pathname === '/api/questions') {
      const categoria = url.searchParams.get('categoria');

      // Faz o JOIN trazendo todos os campos da tabela 'perguntas' 
      // e um array com todas as linhas relacionadas da tabela 'alternativas'
      let query = supabase
        .from('perguntas')
        .select('*, alternativas(*)');

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;

      if (error) throw error;
      return enviarJSON(res, 200, data);
    }

    // ----------------------------------------------------
    // GET /api/questions/:id -> Retorna uma pergunta específica pelo ID com alternativas
    // ----------------------------------------------------
    const matchId = pathname.match(/^\/api\/questions\/([0-9a-fA-F-]+)$/);
    if (matchId) {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*, alternativas(*)')
        .eq('id', matchId[1])
        .single();

      if (error) throw error;
      if (!data) return enviarJSON(res, 404, { erro: 'Pergunta não encontrada.' });
      return enviarJSON(res, 200, data);
    }

    // ----------------------------------------------------
    // GET /api/categories -> Retorna a lista de categorias disponíveis
    // ----------------------------------------------------
    if (pathname === '/api/categories') {
      const { data, error } = await supabase.from('perguntas').select('categoria');
      if (error) throw error;

      // Remove duplicatas de categorias
      const categorias = [...new Set(data.map((q) => q.categoria).filter(Boolean))];
      return enviarJSON(res, 200, categorias);
    }

    // Rota não encontrada
    return enviarJSON(res, 404, { erro: 'Rota não encontrada.' });

  } catch (err) {
    console.error('Erro ao consultar o Supabase:', err.message);
    return enviarJSON(res, 500, { erro: 'Erro interno ao consultar o banco de dados.' });
  }
});

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));