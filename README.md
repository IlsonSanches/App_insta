# 🐔 App Insta - Jet Chicken

Sistema completo de planejamento e geração de conteúdo para Instagram do Jet Chicken - Londrina/PR.

## 🚀 Funcionalidades

### 📅 Agenda Semanal
- Planejamento automático de posts semanais
- Sistema de pilares de conteúdo (Produto/Serviço, Prova Social, Institucional, Engajamento Local)
- Calendário visual semanal
- Histórico de posts e métricas
- Dicas semanais personalizadas

### 🤖 Gerador de Conteúdo com IA
- Integração com OpenAI GPT para geração de ideias criativas
- Análise de performance baseada em resultados anteriores
- Contexto sazonal e eventos especiais
- Sistema de agendamento automático semanal
- Dashboard de estatísticas e top performers

## 🛠️ Configuração

### 1. Instalação
```bash
npm install
```

### 2. Configuração da API OpenAI
1. Obtenha sua API key no [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie um arquivo `.env` na raiz do projeto:
```env
VITE_OPENAI_API_KEY=sua-api-key-aqui
```

**Importante**: No Vite, as variáveis de ambiente devem começar com `VITE_` para serem acessíveis no frontend.

### 3. Executar o projeto
```bash
npm run dev
```

## 📱 Como Usar

### Agenda Semanal
1. Acesse a aba "📅 Agenda Semanal"
2. Visualize os posts planejados para a semana
3. Marque posts como executados
4. Adicione métricas de engajamento
5. Use o botão "🔄 Regenerar Semana" para criar nova agenda

### Gerador IA
1. Acesse a aba "🤖 Gerador IA"
2. Configure o contexto (estação, eventos especiais, performance anterior)
3. Clique em "🎯 Gerar Novas Ideias"
4. Revise as ideias geradas pela IA
5. Marque ideias como executadas e adicione métricas
6. Visualize estatísticas e top performers

## 🎯 Pilares de Conteúdo

- **Produto/Serviço**: Destaque dos pratos e promoções
- **Prova Social**: Depoimentos e avaliações de clientes
- **Institucional**: História e valores da marca
- **Engajamento Local**: Eventos e parcerias comunitárias

## 📊 Métricas e Analytics

O sistema acompanha:
- Total de ideias geradas
- Ideias executadas
- Engajamento médio
- Top performers
- Histórico de semanas

## 🔧 Tecnologias

- **React 19** - Framework principal
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **OpenAI API** - Geração de conteúdo com IA
- **LocalStorage** - Armazenamento local de dados

## 🚀 Deploy

O projeto está configurado para deploy no Vercel:
- Build automático
- Variáveis de ambiente configuráveis
- URL: `app-insta-sandy.vercel.app`

## 📝 Próximos Passos

- [ ] Integração com Instagram API para postagem automática
- [ ] Sistema de notificações para lembretes
- [ ] Análise de sentimentos dos comentários
- [ ] Relatórios semanais automáticos
- [ ] Integração com Google Analytics

## 🤝 Contribuição

Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato através do GitHub Issues.

---

**Desenvolvido para Jet Chicken - Londrina/PR** 🐔
