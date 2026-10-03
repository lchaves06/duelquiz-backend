# Quiz Backend API

API em Node.js (sem frameworks) desenvolvida para o projeto de Quiz da faculdade. A aplicação conecta-se a uma base de dados PostgreSQL alojada no Supabase e disponibiliza endpoints em JSON.

## 🚀 Endpoints Disponíveis

- `GET /api/questions` - Retorna todas as perguntas acompanhadas pelas suas alternativas.
- `GET /api/questions?categoria=Backend` - Filtra as perguntas por categoria.
- `GET /api/questions/:id` - Retorna os detalhes de uma pergunta específica.
- `GET /api/categories` - Retorna a lista de categorias disponíveis.

## 🛠️ Tecnologias Utilizadas

- **Node.js** (Módulo `http` nativo)
- **Supabase** (PostgreSQL e SDK `@supabase/supabase-js`)
- **dotenv** (Gestão de variáveis de ambiente)
- **Render** (Hospedagem da API na nuvem)