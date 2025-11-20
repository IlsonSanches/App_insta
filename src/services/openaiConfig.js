import OpenAI from 'openai';

// Configuração da API do OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
  dangerouslyAllowBrowser: true // Para uso no frontend (em produção, use backend)
});

export default openai;
