// Exemplo de integração com ChatGPT API
// Este arquivo mostra como implementar a funcionalidade

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Função para gerar conteúdo com ChatGPT
async function generateContentWithChatGPT(weekId, previousWeekData) {
  try {
    const prompt = createPromptForWeek(weekId, previousWeekData);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em marketing digital para restaurantes locais em Londrina-PR. 
            Crie conteúdo criativo e engajante para o Instagram do Jet Chicken, um restaurante de frango frito.
            Foque em: produtos locais, engajamento da comunidade, promoções sazonais e conteúdo educativo sobre culinária.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return parseChatGPTResponse(data.choices[0].message.content);
    
  } catch (error) {
    console.error('Erro ao gerar conteúdo com ChatGPT:', error);
    return generateFallbackContent(weekId);
  }
}

// Criar prompt personalizado baseado no contexto
function createPromptForWeek(weekId, previousWeekData) {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const season = getSeason(month);
  
  let prompt = `Crie uma agenda semanal de posts para o Instagram do Jet Chicken em Londrina-PR.
  
  Contexto:
  - Estação: ${season}
  - Mês: ${month}
  - Semana: ${weekId}
  
  `;
  
  if (previousWeekData) {
    prompt += `
    Performance da semana anterior:
    - Posts mais engajados: ${getTopPerformingPosts(previousWeekData)}
    - Horários com melhor performance: ${getBestPostingTimes(previousWeekData)}
    `;
  }
  
  prompt += `
  
  Crie 7 posts (um para cada dia da semana) seguindo esta estrutura:
  
  Para cada post, forneça:
  1. Tipo de conteúdo (Reel, Feed, Story)
  2. Pilar de conteúdo (Produto/Serviço, Prova Social, Institucional, Engajamento Local)
  3. Legenda criativa e engajante
  4. Hashtags relevantes (máximo 5)
  5. Horário sugerido de postagem
  
  Foque em:
  - Conteúdo local de Londrina
  - Sazonalidade (${season})
  - Promoções criativas
  - Engajamento da comunidade
  - Educação sobre frango frito e culinária
  
  Responda em formato JSON estruturado.`;
  
  return prompt;
}

// Funções auxiliares
function getSeason(month) {
  if (month >= 12 || month <= 2) return 'Verão';
  if (month >= 3 && month <= 5) return 'Outono';
  if (month >= 6 && month <= 8) return 'Inverno';
  return 'Primavera';
}

function getTopPerformingPosts(weekData) {
  // Analisar posts com melhor performance
  return weekData.posts
    .filter(post => post.metrics)
    .sort((a, b) => (b.metrics.likes + b.metrics.comments) - (a.metrics.likes + a.metrics.comments))
    .slice(0, 2)
    .map(post => post.pilar);
}

function getBestPostingTimes(weekData) {
  // Analisar horários com melhor performance
  return "11h-13h, 19h-21h"; // Exemplo baseado em dados
}

// Parsear resposta do ChatGPT
function parseChatGPTResponse(response) {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Se não conseguir parsear JSON, usar regex para extrair informações
    return extractContentFromText(response);
  } catch (error) {
    console.error('Erro ao parsear resposta do ChatGPT:', error);
    return generateFallbackContent();
  }
}

// Gerar conteúdo de fallback se a API falhar
function generateFallbackContent(weekId) {
  return {
    posts: [
      {
        type: "Reel",
        pilar: "Produto/Serviço",
        caption: "Frango frito crocante chegando! 🍗 Venha experimentar nossa receita especial.",
        hashtags: ["#JetChicken", "#FrangoFrito", "#LondrinaPR"],
        suggestedTime: "19:00"
      }
    ],
    tips: [
      "Marcar localização: Jet Chicken - Londrina - PR",
      "Usar 3–5 hashtags locais",
      "Postar Reels 11h–13h ou 19h",
      "Interaja com perfis locais após postar"
    ]
  };
}

// Hook personalizado para usar ChatGPT
export function useChatGPTContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateWeeklyContent = async (weekId, previousWeekData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateContentWithChatGPT(weekId, previousWeekData);
      return content;
    } catch (err) {
      setError(err.message);
      return generateFallbackContent(weekId);
    } finally {
      setIsLoading(false);
    }
  };

  return { generateWeeklyContent, isLoading, error };
}

export default {
  generateContentWithChatGPT,
  createPromptForWeek,
  parseChatGPTResponse
};

