import openai from './openaiConfig.js';

class ContentGeneratorService {
  constructor() {
    this.contentHistory = this.loadContentHistory();
  }

  // Carrega histórico de conteúdo do localStorage
  loadContentHistory() {
    try {
      const history = localStorage.getItem('contentHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  }

  // Salva histórico de conteúdo no localStorage
  saveContentHistory() {
    try {
      localStorage.setItem('contentHistory', JSON.stringify(this.contentHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  // Gera ideias de conteúdo baseadas no histórico e contexto
  async generateContentIdeas(context = {}) {
    try {
      // Verifica se a API key está configurada
      if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'your-api-key-here') {
        // Modo demo com ideias pré-definidas
        return this.generateDemoIdeas(context);
      }

      const prompt = this.buildPrompt(context);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em marketing digital e criação de conteúdo para Instagram, especialmente para restaurantes de frango. 
            Sua missão é criar ideias criativas e envolventes que aumentem o engajamento e as vendas.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      });

      const generatedContent = response.choices[0].message.content;
      const ideas = this.parseIdeas(generatedContent);
      
      // Adiciona ao histórico
      const newEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        ideas: ideas,
        context: context,
        status: 'pending'
      };
      
      this.contentHistory.unshift(newEntry);
      this.saveContentHistory();
      
      return newEntry;
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      
      // Se for erro de quota, usa modo demo
      if (error.message.includes('quota') || error.message.includes('429')) {
        console.log('Usando modo demo devido a erro de quota...');
        return this.generateDemoIdeas(context);
      }
      
      throw error;
    }
  }

  // Gera ideias demo quando não há API key ou quota
  generateDemoIdeas(context = {}) {
    const { season, specialEvents } = context;
    
    const demoIdeas = [
      {
        title: "Frango Crocante do Dia",
        description: "Nosso frango frito crocante por fora e macio por dentro! Feito com temperos especiais da casa. Venha experimentar!",
        type: "vídeo",
        hashtags: ["#jetchicken", "#frangofrito", "#londrina", "#crocrante", "#sabor"],
        callToAction: "Peça já o seu! Delivery disponível.",
        engagement: "alto"
      },
      {
        title: "Polenta Frita Imperdível",
        description: "A polenta frita que todo mundo ama! Crocante por fora, cremosa por dentro. O acompanhamento perfeito para o seu frango.",
        type: "foto",
        hashtags: ["#polentafrita", "#jetchicken", "#acompanhamento", "#londrina", "#delicia"],
        callToAction: "Experimente nossa polenta especial!",
        engagement: "médio"
      },
      {
        title: "Combo Família Especial",
        description: "Reúna a família para saborear nosso combo especial! Frango, polenta, batata frita e refrigerante. Economia garantida!",
        type: "carrossel",
        hashtags: ["#combofamilia", "#jetchicken", "#economia", "#londrina", "#familia"],
        callToAction: "Peça o combo família e economize!",
        engagement: "alto"
      },
      {
        title: "Depoimento de Cliente",
        description: "Cliente satisfeito recomenda: 'Melhor frango frito de Londrina! Sempre venho aqui com a família.'",
        type: "foto",
        hashtags: ["#depoimento", "#cliente", "#recomendacao", "#jetchicken", "#londrina"],
        callToAction: "Venha você também experimentar!",
        engagement: "médio"
      },
      {
        title: "Happy Hour Especial",
        description: "Happy Hour das 18h às 20h! Chopp Brahma gelado com nossos petiscos. Venha relaxar após o trabalho!",
        type: "stories",
        hashtags: ["#happyhour", "#choppbrahma", "#jetchicken", "#londrina", "#relaxar"],
        callToAction: "Aproveite nosso happy hour!",
        engagement: "alto"
      }
    ];

    // Adiciona contexto sazonal se fornecido
    if (season) {
      demoIdeas[0].description += ` Perfeito para o ${season}!`;
    }
    
    if (specialEvents) {
      demoIdeas[2].description += ` Especial para ${specialEvents}!`;
    }

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ideas: demoIdeas,
      context: context,
      status: 'pending',
      isDemo: true
    };
    
    this.contentHistory.unshift(newEntry);
    this.saveContentHistory();
    
    return newEntry;
  }

  // Constrói o prompt baseado no contexto e histórico
  buildPrompt(context) {
    const { season, specialEvents, previousPerformance } = context;
    
    let prompt = `Crie 5 ideias criativas de conteúdo para Instagram para o Jet Chicken - restaurante de frango em Londrina/PR.

Contexto atual:
- Estação: ${season || 'Não especificada'}
- Eventos especiais: ${specialEvents || 'Nenhum'}
- Foco: Aumentar engajamento e vendas`;

    if (this.contentHistory.length > 0) {
      prompt += `\n\nHistórico de conteúdo anterior (últimas 3 semanas):`;
      this.contentHistory.slice(0, 3).forEach((entry, index) => {
        prompt += `\nSemana ${index + 1} (${new Date(entry.date).toLocaleDateString('pt-BR')}):`;
        entry.ideas.forEach(idea => {
          prompt += `\n- ${idea.title}`;
        });
      });
    }

    if (previousPerformance) {
      prompt += `\n\nPerformance anterior: ${previousPerformance}`;
    }

    prompt += `\n\nPara cada ideia, forneça:
1. Título chamativo
2. Descrição do conteúdo
3. Tipo de post (foto, vídeo, carrossel, stories)
4. Hashtags relevantes
5. Call-to-action sugerido
6. Estimativa de engajamento (baixo, médio, alto)

Formato de resposta: JSON com array de objetos contendo os campos acima.`;

    return prompt;
  }

  // Parseia as ideias geradas pelo ChatGPT
  parseIdeas(content) {
    try {
      // Tenta extrair JSON da resposta
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Se não conseguir extrair JSON, cria estrutura manual
      const lines = content.split('\n').filter(line => line.trim());
      const ideas = [];
      let currentIdea = {};
      
      lines.forEach(line => {
        if (line.match(/^\d+\./)) {
          if (Object.keys(currentIdea).length > 0) {
            ideas.push(currentIdea);
          }
          currentIdea = {
            title: line.replace(/^\d+\.\s*/, ''),
            description: '',
            type: 'foto',
            hashtags: [],
            callToAction: '',
            engagement: 'médio'
          };
        } else if (line.includes('Descrição:')) {
          currentIdea.description = line.replace('Descrição:', '').trim();
        } else if (line.includes('Tipo:')) {
          currentIdea.type = line.replace('Tipo:', '').trim();
        } else if (line.includes('Hashtags:')) {
          currentIdea.hashtags = line.replace('Hashtags:', '').trim().split(' ').filter(tag => tag.startsWith('#'));
        } else if (line.includes('CTA:')) {
          currentIdea.callToAction = line.replace('CTA:', '').trim();
        }
      });
      
      if (Object.keys(currentIdea).length > 0) {
        ideas.push(currentIdea);
      }
      
      return ideas;
    } catch (error) {
      console.error('Erro ao parsear ideias:', error);
      return [{
        title: 'Conteúdo gerado automaticamente',
        description: content,
        type: 'foto',
        hashtags: ['#jetchicken', '#frango', '#londrina'],
        callToAction: 'Venha experimentar!',
        engagement: 'médio'
      }];
    }
  }

  // Marca uma ideia como executada
  markIdeaAsExecuted(ideaId, performance = {}) {
    const entry = this.contentHistory.find(e => e.id === ideaId);
    if (entry) {
      entry.status = 'executed';
      entry.performance = performance;
      entry.executedAt = new Date().toISOString();
      this.saveContentHistory();
    }
  }

  // Obtém estatísticas de performance
  getPerformanceStats() {
    const executed = this.contentHistory.filter(e => e.status === 'executed');
    const totalIdeas = executed.reduce((sum, entry) => sum + entry.ideas.length, 0);
    
    return {
      totalIdeas: totalIdeas,
      executedIdeas: executed.length,
      averageEngagement: this.calculateAverageEngagement(),
      topPerformingIdeas: this.getTopPerformingIdeas()
    };
  }

  calculateAverageEngagement() {
    const executed = this.contentHistory.filter(e => e.status === 'executed' && e.performance);
    if (executed.length === 0) return 0;
    
    const totalEngagement = executed.reduce((sum, entry) => {
      return sum + (entry.performance.likes || 0) + (entry.performance.comments || 0);
    }, 0);
    
    return Math.round(totalEngagement / executed.length);
  }

  getTopPerformingIdeas() {
    return this.contentHistory
      .filter(e => e.status === 'executed' && e.performance)
      .sort((a, b) => {
        const aEngagement = (a.performance.likes || 0) + (a.performance.comments || 0);
        const bEngagement = (b.performance.likes || 0) + (b.performance.comments || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 5);
  }

  // Agenda geração automática semanal
  scheduleWeeklyGeneration() {
    const cron = require('node-cron');
    
    // Executa toda segunda-feira às 9h
    cron.schedule('0 9 * * 1', async () => {
      console.log('Iniciando geração semanal de conteúdo...');
      
      const context = {
        season: this.getCurrentSeason(),
        specialEvents: this.getUpcomingEvents(),
        previousPerformance: this.getPerformanceStats()
      };
      
      try {
        await this.generateContentIdeas(context);
        console.log('Conteúdo semanal gerado com sucesso!');
      } catch (error) {
        console.error('Erro na geração semanal:', error);
      }
    });
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    const seasons = {
      0: 'Verão', 1: 'Verão', 2: 'Outono',
      3: 'Outono', 4: 'Outono', 5: 'Inverno',
      6: 'Inverno', 7: 'Inverno', 8: 'Primavera',
      9: 'Primavera', 10: 'Primavera', 11: 'Verão'
    };
    return seasons[month];
  }

  getUpcomingEvents() {
    const events = [
      'Dia das Mães', 'Dia dos Pais', 'Páscoa', 'Natal',
      'Ano Novo', 'Carnaval', 'Black Friday', 'Dia das Crianças'
    ];
    
    // Lógica simples para detectar eventos próximos
    const currentMonth = new Date().getMonth();
    const eventMap = {
      0: 'Ano Novo', 1: 'Carnaval', 4: 'Dia das Mães',
      7: 'Dia dos Pais', 10: 'Black Friday', 11: 'Natal'
    };
    
    return eventMap[currentMonth] || 'Nenhum evento especial';
  }
}

export default ContentGeneratorService;
