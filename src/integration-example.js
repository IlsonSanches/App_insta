// Exemplo de como integrar ChatGPT no App.jsx principal
import { useChatGPTContent } from './services/chatgptService';

// No componente principal, adicionar:
export default function AgendaInstaJetChicken() {
  const { generateWeeklyContent, isLoading, error } = useChatGPTContent();
  
  // ... código existente ...

  // Função modificada para usar ChatGPT
  async function generateWeeklyAgenda(weekId) {
    const weekStart = getWeekStartDate(weekId);
    
    // Tentar gerar conteúdo com ChatGPT primeiro
    try {
      const chatGPTContent = await generateWeeklyContent(weekId, weeklyData[getPreviousWeekId(weekId)]);
      
      if (chatGPTContent && chatGPTContent.posts) {
        return {
          weekId,
          weekStart,
          posts: chatGPTContent.posts.map((post, index) => ({
            id: uid(),
            type: post.type,
            pilar: post.pilar,
            date: addDays(weekStart, index),
            caption: post.caption,
            hashtags: post.hashtags,
            location: "Jet Chicken - Londrina - PR",
            status: "planejado",
            weekId,
            createdAt: new Date().toISOString(),
            suggestedTime: post.suggestedTime,
            generatedBy: 'chatgpt'
          })),
          tips: chatGPTContent.tips || getRandomTips(),
          createdAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn('ChatGPT não disponível, usando conteúdo padrão:', error);
    }
    
    // Fallback para conteúdo padrão se ChatGPT falhar
    return generateFallbackWeeklyAgenda(weekId);
  }

  // ... resto do código ...
}

