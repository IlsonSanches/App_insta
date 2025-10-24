import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ContentGeneratorService from '../../services/ContentGeneratorService.js';

const ContentGenerator = () => {
  const [contentService] = useState(() => new ContentGeneratorService());
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIdeas, setCurrentIdeas] = useState(null);
  const [context, setContext] = useState({
    season: '',
    specialEvents: '',
    previousPerformance: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const performanceStats = contentService.getPerformanceStats();
    setStats(performanceStats);
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const newIdeas = await contentService.generateContentIdeas(context);
      setCurrentIdeas(newIdeas);
      loadStats(); // Atualiza estatísticas
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      if (error.message.includes('API key')) {
        alert('🔑 ' + error.message + '\n\nCrie um arquivo .env na raiz do projeto com:\nVITE_OPENAI_API_KEY=sua-api-key-aqui');
      } else if (error.message.includes('quota') || error.message.includes('429')) {
        alert('💳 Quota da OpenAI excedida!\n\nO sistema está usando ideias demo enquanto você resolve a cobrança.\n\nPara usar IA real:\n1. Acesse https://platform.openai.com/account/billing\n2. Adicione créditos à sua conta\n3. Teste novamente');
      } else {
        alert('Erro ao gerar conteúdo: ' + error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsExecuted = (ideaId, performance) => {
    contentService.markIdeaAsExecuted(ideaId, performance);
    loadStats();
  };

  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case 'alto': return 'text-green-600 bg-green-100';
      case 'médio': return 'text-yellow-600 bg-yellow-100';
      case 'baixo': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vídeo': return '🎥';
      case 'carrossel': return '📸';
      case 'stories': return '📱';
      default: return '📷';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🐔 Gerador de Conteúdo Jet Chicken
          </h1>
          <p className="text-gray-600">
            IA para criar ideias criativas de conteúdo semanalmente
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="text-2xl font-bold text-blue-600">{stats.totalIdeas}</div>
              <div className="text-sm text-gray-600">Total de Ideias</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="text-2xl font-bold text-green-600">{stats.executedIdeas}</div>
              <div className="text-sm text-gray-600">Ideias Executadas</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="text-2xl font-bold text-purple-600">{stats.averageEngagement}</div>
              <div className="text-sm text-gray-600">Engajamento Médio</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="text-2xl font-bold text-orange-600">{stats.topPerformingIdeas.length}</div>
              <div className="text-sm text-gray-600">Top Performers</div>
            </div>
          </motion.div>
        )}

        {/* Context Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-md mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Contexto para Geração</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estação do Ano
              </label>
              <select
                value={context.season}
                onChange={(e) => setContext({...context, season: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="Verão">Verão</option>
                <option value="Outono">Outono</option>
                <option value="Inverno">Inverno</option>
                <option value="Primavera">Primavera</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eventos Especiais
              </label>
              <input
                type="text"
                value={context.specialEvents}
                onChange={(e) => setContext({...context, specialEvents: e.target.value})}
                placeholder="Ex: Dia das Mães, Black Friday..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Anterior
              </label>
              <textarea
                value={context.previousPerformance}
                onChange={(e) => setContext({...context, previousPerformance: e.target.value})}
                placeholder="Descreva resultados anteriores..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
              />
            </div>
          </div>
          <button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating ? 'Gerando Ideias...' : '🎯 Gerar Novas Ideias'}
          </button>
        </motion.div>

        {/* Generated Ideas */}
        {currentIdeas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Ideias Geradas - {new Date(currentIdeas.date).toLocaleDateString('pt-BR')}
                {currentIdeas.isDemo && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    🎭 Modo Demo
                  </span>
                )}
              </h2>
              <span className="text-sm text-gray-500">
                Status: <span className="font-semibold text-orange-600">{currentIdeas.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentIdeas.ideas.map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      {getTypeIcon(idea.type)} {idea.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(idea.engagement)}`}>
                      {idea.engagement}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{idea.description}</p>

                  {idea.hashtags && idea.hashtags.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Hashtags:</div>
                      <div className="flex flex-wrap gap-1">
                        {idea.hashtags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {idea.callToAction && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Call-to-Action:</div>
                      <p className="text-sm text-gray-600 italic">"{idea.callToAction}"</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAsExecuted(currentIdeas.id, {
                        likes: Math.floor(Math.random() * 100),
                        comments: Math.floor(Math.random() * 20)
                      })}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      ✅ Marcar como Executado
                    </button>
                    <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors">
                      📋 Copiar Ideia
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Performing Ideas */}
        {stats && stats.topPerformingIdeas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-md mt-8"
          >
            <h2 className="text-xl font-semibold mb-4">🏆 Top Ideias Performantes</h2>
            <div className="space-y-3">
              {stats.topPerformingIdeas.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{entry.ideas[0]?.title || 'Ideia sem título'}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {(entry.performance?.likes || 0) + (entry.performance?.comments || 0)} engajamentos
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.performance?.likes || 0} curtidas, {entry.performance?.comments || 0} comentários
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
