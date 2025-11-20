import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Sistema de Planejamento Semanal Automático - Agenda Insta Jet Chicken
// Funcionalidades: Geração automática de agenda, histórico semanal, dicas dinâmicas

const SAMPLE_HASHTAGS = [
  "#LondrinaPR",
  "#JetChicken",
  "#FrangoFrito",
  "#PolentaFrita",
  "#BatataFrita",
  "#CervejaGelada",
  "#ChoppBrahma",
  "#HappyHour",
  "#SaborQueFazHistoria",
  "#ClienteSatisfeito",
];

const PILLARS = [
  "Produto/Serviço",
  "Prova Social",
  "Institucional",
  "Engajamento Local",
];

const AVAILABLE_TAGS = ['promoção', 'evento', 'sazonal', 'urgente', 'destaque', 'parceria'];

const POST_TEMPLATES = {
  "Produto/Serviço": [
    "Frango frito crocante chegando! 🍗 Venha experimentar a porção para compartilhar.",
    "Nossa polenta frita é irresistível! Crocante por fora, macia por dentro.",
    "Batata frita perfeita para acompanhar seu frango! 🍟",
    "Promoção especial: Combo família com desconto!",
    "Novo sabor chegando! Experimente nossa receita exclusiva.",
  ],
  "Prova Social": [
    "Clientes felizes no final de semana! #SaborQueFazHistoria",
    "Depoimento de cliente: 'Melhor frango frito de Londrina!'",
    "Família reunida saboreando nossos pratos! ❤️",
    "Mais de 1000 clientes satisfeitos este mês!",
    "Avaliação 5 estrelas no Google! Obrigado pela confiança.",
  ],
  "Institucional": [
    "Jet Chicken: Tradição e qualidade desde 2010!",
    "Nossa história começou com uma receita de família.",
    "Compromisso com ingredientes frescos e selecionados.",
    "Equipe dedicada para melhor atendimento!",
    "Valores que nos movem: qualidade, tradição e sabor.",
  ],
  "Engajamento Local": [
    "Promoção do chopp Brahma hoje das 18h às 20h 🍺",
    "Evento especial: Música ao vivo neste sábado!",
    "Parceria com a comunidade local de Londrina!",
    "Apoiamos eventos esportivos da cidade!",
    "Happy Hour especial para estudantes!",
  ],
};

const WEEKLY_TIPS = [
  "Marcar localização: Jet Chicken - Londrina - PR",
  "Usar 3–5 hashtags locais",
  "Postar Reels 11h–13h ou 19h",
  "Interaja com perfis locais após postar",
  "Use stories para mostrar bastidores",
  "Responda comentários rapidamente",
  "Poste conteúdo educativo sobre frango",
  "Crie polls nos stories para engajamento",
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function getRandomPostType() {
  const types = ["Reel", "Feed", "Story"];
  const weights = [0.4, 0.4, 0.2]; // 40% Reel, 40% Feed, 20% Story
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) return types[i];
  }
  return "Feed";
}

function generateHashtags(pilar) {
  const baseHashtags = ["#JetChicken", "#LondrinaPR"];
  const pilarHashtags = {
    "Produto/Serviço": ["#FrangoFrito", "#PolentaFrita", "#BatataFrita"],
    "Prova Social": ["#SaborQueFazHistoria", "#ClienteSatisfeito"],
    "Institucional": ["#Tradicao", "#Qualidade"],
    "Engajamento Local": ["#ChoppBrahma", "#HappyHour", "#Comunidade"],
  };
  
  const allHashtags = [...baseHashtags, ...pilarHashtags[pilar]];
  return allHashtags.slice(0, Math.min(5, allHashtags.length));
}

function getRandomTips() {
  const shuffled = [...WEEKLY_TIPS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}

function getCurrentWeekId() {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = getWeekNumber(now);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getWeekStartDate(weekId) {
  const [year, week] = weekId.split('-W');
  const firstDayOfYear = new Date(year, 0, 1);
  const daysToAdd = (parseInt(week) - 1) * 7;
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(firstDayOfYear.getDate() + daysToAdd - firstDayOfYear.getDay() + 1);
  return weekStart.toISOString().slice(0, 10);
}

function formatWeekId(weekId) {
  const [year, week] = weekId.split('-W');
  return `${week}/${year}`;
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(dateISO, days) {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function weekDatesAround(centerISO) {
  const c = new Date(centerISO);
  const start = new Date(c);
  start.setDate(c.getDate() - 3);
  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

function formatDateShort(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return [isDark, setIsDark];
}

// Função para inicializar o sistema semanal
function initializeWeeklySystem() {
  const currentWeekId = getCurrentWeekId();
  return {
    [currentWeekId]: generateInitialWeek(currentWeekId)
  };
}

function generateInitialWeek(weekId) {
  const weekStart = getWeekStartDate(weekId);
  const posts = [];
  
  // Gerar alguns posts iniciais para demonstração
  for (let i = 0; i < 3; i++) {
    const date = addDays(weekStart, i);
    const pilar = PILLARS[i % PILLARS.length];
    const templates = POST_TEMPLATES[pilar];
    
    posts.push({
      id: uid(),
      type: getRandomPostType(),
      pilar,
      date,
      caption: templates[0],
      hashtags: generateHashtags(pilar),
      location: "Jet Chicken - Londrina - PR",
      status: "planejado",
      weekId,
      createdAt: new Date().toISOString(),
    });
  }
  
  return {
    weekId,
    weekStart,
    posts,
    tips: WEEKLY_TIPS.slice(0, 4),
    createdAt: new Date().toISOString(),
  };
}

export default function AgendaInstaJetChicken() {
  const [weeklyData, setWeeklyData] = useState(() => {
    try {
      const raw = localStorage.getItem("aji_weekly_v2");
      return raw ? JSON.parse(raw) : initializeWeeklySystem();
    } catch (e) {
      return initializeWeeklySystem();
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [query, setQuery] = useState("");
  const [currentWeekId, setCurrentWeekId] = useState(() => getCurrentWeekId());
  const [isDark, setIsDark] = useDarkMode();
  const [searchFilters, setSearchFilters] = useState({
    pilar: "Todos",
    type: "Todos",
    status: "Todos"
  });

  // Verificar se precisa criar nova semana
  useEffect(() => {
    const weekId = getCurrentWeekId();
    if (weekId !== currentWeekId) {
      setCurrentWeekId(weekId);
      createNewWeekIfNeeded(weekId);
    }
  }, [currentWeekId]);

  useEffect(() => {
    localStorage.setItem("aji_weekly_v2", JSON.stringify(weeklyData));
    // Backup automático
    const backups = JSON.parse(localStorage.getItem('aji_backups') || '[]');
    backups.push({
      timestamp: new Date().toISOString(),
      data: weeklyData,
      version: '2.0'
    });
    
    // Manter apenas últimos 5 backups
    if (backups.length > 5) {
      backups.shift();
    }
    
    localStorage.setItem('aji_backups', JSON.stringify(backups));
  }, [weeklyData]);

  function createNewWeekIfNeeded(weekId) {
    if (!weeklyData[weekId]) {
      const newWeek = generateWeeklyAgenda(weekId);
      setWeeklyData(prev => ({
        ...prev,
        [weekId]: newWeek
      }));
      toast.success('Nova semana criada automaticamente! 📅');
    }
  }

  function generateWeeklyAgenda(weekId) {
    const weekStart = getWeekStartDate(weekId);
    const posts = [];
    
    // Gerar posts para cada dia da semana (segunda a domingo)
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dayOfWeek = new Date(date).getDay();
      
      // Pular domingo ou gerar menos posts nos fins de semana
      if (dayOfWeek === 0) continue;
      
      // Gerar 1-2 posts por dia útil
      const postsPerDay = dayOfWeek === 6 ? 1 : Math.random() > 0.5 ? 2 : 1;
      
      for (let j = 0; j < postsPerDay; j++) {
        const pilar = PILLARS[Math.floor(Math.random() * PILLARS.length)];
        const templates = POST_TEMPLATES[pilar];
        const caption = templates[Math.floor(Math.random() * templates.length)];
        
        posts.push({
          id: uid(),
          type: getRandomPostType(),
          pilar,
          date,
          caption,
          hashtags: generateHashtags(pilar),
          location: "Jet Chicken - Londrina - PR",
          status: "planejado",
          weekId,
          tags: [],
          createdAt: new Date().toISOString(),
        });
      }
    }
    
    return {
      weekId,
      weekStart,
      posts,
      tips: getRandomTips(),
      createdAt: new Date().toISOString(),
    };
  }

  const currentWeek = weeklyData[currentWeekId] || { posts: [] };
  const posts = currentWeek.posts || [];

  function addPost(newPost) {
    const postWithWeek = { 
      id: uid(), 
      status: "planejado", 
      weekId: currentWeekId,
      createdAt: new Date().toISOString(),
      ...newPost 
    };
    
    setWeeklyData(prev => ({
      ...prev,
      [currentWeekId]: {
        ...prev[currentWeekId],
        posts: [postWithWeek, ...(prev[currentWeekId]?.posts || [])]
      }
    }));
    toast.success('Post adicionado com sucesso! ✅');
  }

  function markPosted(id) {
    setWeeklyData(prev => ({
      ...prev,
      [currentWeekId]: {
        ...prev[currentWeekId],
        posts: prev[currentWeekId].posts.map((x) => 
          x.id === id ? { ...x, status: "postado", postedAt: new Date().toISOString() } : x
        )
      }
    }));
    toast.success('Post marcado como publicado! 🎉');
  }

  function updateMetrics(id, metrics) {
    setWeeklyData(prev => ({
      ...prev,
      [currentWeekId]: {
        ...prev[currentWeekId],
        posts: prev[currentWeekId].posts.map((x) => 
          x.id === id ? { ...x, metrics } : x
        )
      }
    }));
  }

  function regenerateWeek() {
    const newWeek = generateWeeklyAgenda(currentWeekId);
    setWeeklyData(prev => ({
      ...prev,
      [currentWeekId]: newWeek
    }));
    toast.success('Agenda da semana regenerada! 🔄');
  }

  function getBackups() {
    return JSON.parse(localStorage.getItem('aji_backups') || '[]');
  }

  function restoreBackup(backup) {
    if (window.confirm('Tem certeza que deseja restaurar este backup? Os dados atuais serão substituídos.')) {
      setWeeklyData(backup.data);
      toast.success('Backup restaurado com sucesso! ✅');
    }
  }

  function exportToCSV() {
    const headers = ['Data', 'Tipo', 'Pilar', 'Legenda', 'Hashtags', 'Status', 'Views', 'Likes', 'Comments'];
    
    const rows = posts.map(post => [
      post.date,
      post.type,
      post.pilar,
      post.caption.replace(/"/g, '""'),
      post.hashtags.join(', '),
      post.status,
      post.metrics?.views || '',
      post.metrics?.likes || '',
      post.metrics?.comments || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agenda-semana-${currentWeekId}.csv`;
    link.click();
    toast.success('CSV exportado com sucesso! 📥');
  }

  const filtered = posts.filter((p) => {
    // Busca por texto (legenda ou hashtags)
    if (query && !p.caption.toLowerCase().includes(query.toLowerCase()) 
        && !p.hashtags.some(h => h.toLowerCase().includes(query.toLowerCase()))) {
      return false;
    }
    
    // Filtro por pilar
    if (searchFilters.pilar !== "Todos" && p.pilar !== searchFilters.pilar) return false;
    
    // Filtro por tipo
    if (searchFilters.type !== "Todos" && p.type !== searchFilters.type) return false;
    
    // Filtro por status
    if (searchFilters.status !== "Todos" && p.status !== searchFilters.status) return false;
    
    return true;
  });

  const upcoming = posts.filter((p) => p.status === "planejado").slice(0, 6);
  const weekHistory = Object.keys(weeklyData).sort().reverse();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <Toaster position="top-right" />
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold dark:text-white">Agenda Insta - Jet Chicken</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sistema de Planejamento Semanal Automático • Semana {formatWeekId(currentWeekId)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:brightness-95"
          >
            ➕ Nova Postagem
          </button>
          <button
            onClick={regenerateWeek}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg shadow hover:brightness-95"
            title="Regenerar agenda da semana"
          >
            🔄 Regenerar Semana
          </button>
          <button
            onClick={exportToCSV}
            className="px-3 py-2 bg-green-500 text-white rounded-lg shadow hover:brightness-95"
            title="Exportar semana para CSV"
          >
            📥 Exportar CSV
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg shadow hover:brightness-95"
            title="Alternar modo escuro"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => { localStorage.removeItem('aji_weekly_v2'); window.location.reload(); }}
            className="px-3 py-1 border rounded text-sm dark:border-gray-600 dark:text-gray-300"
            title="Resetar sistema"
          >
            Resetar Sistema
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="col-span-2 space-y-6">
          <DashboardStats posts={posts} />
          
          <PerformanceChart posts={posts} />

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold dark:text-white">Planejador Semanal</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  placeholder="Pesquisar legenda ou hashtag..."
                  className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  value={searchFilters.pilar}
                  onChange={(e) => setSearchFilters({...searchFilters, pilar: e.target.value})}
                  className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Todos</option>
                  {PILLARS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={searchFilters.type}
                  onChange={(e) => setSearchFilters({...searchFilters, type: e.target.value})}
                  className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Todos</option>
                  <option>Reel</option>
                  <option>Feed</option>
                  <option>Story</option>
                  <option>Live</option>
                </select>
                <select
                  value={searchFilters.status}
                  onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                  className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Todos</option>
                  <option>planejado</option>
                  <option>postado</option>
                </select>
                {(query || searchFilters.pilar !== "Todos" || searchFilters.type !== "Todos" || searchFilters.status !== "Todos") && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSearchFilters({ pilar: "Todos", type: "Todos", status: "Todos" });
                    }}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <WeeklyCalendar
              posts={filtered}
              onMarkPosted={markPosted}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
            <h2 className="font-semibold mb-3 dark:text-white">Histórico / Tabela</h2>
            <HistoryTable posts={posts} onUpdateMetrics={updateMetrics} onMarkPosted={markPosted} />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
            <h3 className="font-semibold mb-2 dark:text-white">Próximos Posts</h3>
            <div className="space-y-2">
              {upcoming.length === 0 && <p className="text-sm text-gray-500">Nenhum post planejado</p>}
              {upcoming.map((p) => (
                <div key={p.id} className="p-2 border rounded flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{p.type} • {p.pilar}</div>
                    <div className="text-xs text-gray-600">{p.date} — {p.caption.slice(0, 60)}{p.caption.length>60? '...' : ''}</div>
                    <div className="text-xs mt-1">{p.hashtags.join(' ')}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => markPosted(p.id)} className="text-xs bg-green-500 px-2 py-1 rounded text-white">Marcar Postado</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
            <h3 className="font-semibold mb-2 dark:text-white">Dicas da Semana</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc ml-5">
              {(currentWeek.tips || WEEKLY_TIPS.slice(0, 4)).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
            <h3 className="font-semibold mb-2 dark:text-white">Histórico de Semanas</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {weekHistory.slice(0, 5).map((weekId) => (
                <div key={weekId} className="flex items-center justify-between p-2 border rounded dark:border-gray-700">
                  <div>
                    <div className="text-sm font-medium dark:text-white">Semana {formatWeekId(weekId)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {weeklyData[weekId]?.posts?.length || 0} posts • 
                      {weeklyData[weekId]?.posts?.filter(p => p.status === 'postado').length || 0} postados
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentWeekId(weekId)}
                    className={`text-xs px-2 py-1 rounded ${
                      weekId === currentWeekId 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {weekId === currentWeekId ? 'Atual' : 'Ver'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
            <h3 className="font-semibold mb-2 dark:text-white">Backups</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {getBackups().slice(-3).reverse().map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded dark:border-gray-700">
                  <div>
                    <div className="text-xs font-medium dark:text-white">
                      {new Date(backup.timestamp).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Object.keys(backup.data).length} semanas
                    </div>
                  </div>
                  <button
                    onClick={() => restoreBackup(backup)}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Restaurar
                  </button>
                </div>
              ))}
              {getBackups().length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Nenhum backup disponível</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
            <h3 className="font-semibold mb-2 dark:text-white">Hashtags sugeridas</h3>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_HASHTAGS.map((h) => (
                <span key={h} className="text-xs px-2 py-1 border rounded">{h}</span>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <AnimatePresence>{showForm && <PostForm onClose={() => setShowForm(false)} onSave={addPost} />}</AnimatePresence>

      <footer className="max-w-6xl mx-auto mt-6 text-center text-xs text-gray-500">Protótipo — pronto para commit no GitHub e deploy no Vercel.</footer>
    </div>
  );
}

function DashboardStats({ posts }) {
  const total = posts.length;
  const planned = posts.filter((p) => p.status === "planejado").length;
  const postedArray = posts.filter((p) => p.status === "postado");
  const posted = postedArray.length;
  
  const totalEngagement = postedArray.reduce((sum, p) => {
    const metrics = p.metrics || {};
    return sum + (parseInt(metrics.likes) || 0) + (parseInt(metrics.comments) || 0);
  }, 0);
  
  const avgEngagement = postedArray.length > 0 ? (totalEngagement / postedArray.length).toFixed(1) : 0;
  const conversionRate = posts.length > 0 ? ((posted / posts.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow flex gap-4">
        <StatCard title="Total de Posts" value={total} />
        <StatCard title="Planejados" value={planned} />
        <StatCard title="Postados" value={posted} />
        <StatCard title="Taxa Conversão" value={`${conversionRate}%`} />
      </div>
      
      {postedArray.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
          <h3 className="font-semibold mb-3 dark:text-white">Estatísticas Avançadas</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Engajamento Médio</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{avgEngagement}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">likes + comentários por post</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Engajamento</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalEngagement}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">soma de todas interações</div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2 dark:text-white">Performance por Pilar</div>
            <div className="space-y-2">
              {PILLARS.map(pilar => {
                const pillarPosts = postedArray.filter(p => p.pilar === pilar);
                const pillarEngagement = pillarPosts.reduce((sum, p) => {
                  const metrics = p.metrics || {};
                  return sum + (parseInt(metrics.likes) || 0);
                }, 0);
                const avgPillarEngagement = pillarPosts.length > 0 
                  ? (pillarEngagement / pillarPosts.length).toFixed(1) 
                  : 0;
                
                return (
                  <div key={pilar} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="font-medium dark:text-white">{pilar}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 dark:text-gray-400">{pillarPosts.length} posts</span>
                      <span className="font-bold text-yellow-600 dark:text-yellow-400">{avgPillarEngagement}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="flex-1 p-3 bg-yellow-50 dark:bg-gray-700 rounded-lg">
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      <div className="text-2xl font-bold dark:text-white">{value}</div>
    </div>
  );
}

function PerformanceChart({ posts }) {
  const data = posts
    .filter(p => p.metrics && p.status === 'postado')
    .map(p => ({
      date: p.date.slice(5), // MM-DD
      views: parseInt(p.metrics.views) || 0,
      likes: parseInt(p.metrics.likes) || 0,
      comments: parseInt(p.metrics.comments) || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
        <h3 className="font-semibold mb-2 dark:text-white">Gráfico de Performance</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Adicione métricas aos posts para ver o gráfico</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow dark:shadow-gray-900">
      <h3 className="font-semibold mb-4 dark:text-white">Gráfico de Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} name="Views" />
          <Line type="monotone" dataKey="likes" stroke="#82ca9d" strokeWidth={2} name="Likes" />
          <Line type="monotone" dataKey="comments" stroke="#ffc658" strokeWidth={2} name="Comments" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function WeeklyCalendar({ posts, onMarkPosted, selectedDate, onSelectDate }) {
  const [viewMode, setViewMode] = useState('week');
  const week = weekDatesAround(selectedDate);
  const selectedDateObj = new Date(selectedDate);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().slice(0, 10);
      const dayPosts = posts.filter(p => p.date === dateStr);
      return dayPosts.length > 0 ? (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 font-bold mt-1">{dayPosts.length}</div>
      ) : null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'week' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'month' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div className="grid grid-cols-7 gap-2">
          {week.map((d) => (
            <div key={d} className="border rounded p-2 bg-gray-50 dark:bg-gray-700">
              <div className="text-xs font-medium mb-2 dark:text-white">{formatDateShort(d)}</div>
              <div className="space-y-2">
                {posts
                  .filter((p) => p.date === d)
                  .map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-semibold dark:text-white">{p.type} • {p.pilar}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{p.caption.slice(0, 50)}{p.caption.length>50? '...' : ''}</div>
                          <div className="text-xs mt-1">{p.hashtags.join(' ')}</div>
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.tags.map(tag => (
                                <span key={tag} className="text-xs px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {p.status === 'planejado' ? (
                            <button onClick={() => onMarkPosted(p.id)} className="text-xs bg-green-500 px-2 py-1 rounded text-white">✓</button>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Postado</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
              <div className="mt-2 text-center">
                <button onClick={() => onSelectDate(d)} className="text-xs underline dark:text-gray-400">Selecionar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl">
          <Calendar
            onChange={(date) => onSelectDate(date.toISOString().slice(0, 10))}
            value={selectedDateObj}
            tileContent={tileContent}
            className="rounded-lg border-0 dark:bg-gray-800"
            tileClassName="dark:text-white"
          />
          <div className="mt-4 space-y-2">
            {posts
              .filter((p) => p.date === selectedDate)
              .map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-sm font-semibold dark:text-white">{p.type} • {p.pilar}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{p.caption.slice(0, 60)}</div>
                  {p.status === 'planejado' && (
                    <button onClick={() => onMarkPosted(p.id)} className="mt-1 text-xs bg-green-500 px-2 py-1 rounded text-white">
                      Marcar Postado
                    </button>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PostForm({ onClose, onSave }) {
  const [type, setType] = useState("Reel");
  const [pilar, setPilar] = useState(PILLARS[0]);
  const [date, setDate] = useState(todayISO());
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState(SAMPLE_HASHTAGS.slice(0, 4));
  const [location] = useState("Jet Chicken - Londrina - PR");
  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};
    
    if (!caption.trim()) {
      newErrors.caption = 'Legenda é obrigatória';
    }
    if (caption.length > 2200) {
      newErrors.caption = 'Legenda muito longa (máx 2200 caracteres)';
    }
    if (hashtags.length === 0) {
      newErrors.hashtags = 'Adicione pelo menos uma hashtag';
    }
    if (hashtags.length > 30) {
      newErrors.hashtags = 'Máximo de 30 hashtags';
    }
    if (!date) {
      newErrors.date = 'Data é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) {
      onSave({ type, pilar, date, caption, hashtags, tags, location });
      onClose();
    } else {
      toast.error('Por favor, corrija os erros no formulário');
    }
  }

  function toggleTag(tag) {
    setTags(prev => prev.includes(tag) 
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
    );
  }

  function toggleHashtag(tag) {
    setHashtags((h) => (h.includes(tag) ? h.filter((x) => x !== tag) : [...h, tag]));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
    >
      <motion.form
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        exit={{ y: 20 }}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Nova Postagem</h3>
          <button type="button" onClick={onClose} className="text-gray-500">Fechar</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded px-2 py-2">
            <option>Reel</option>
            <option>Feed</option>
            <option>Story</option>
            <option>Live</option>
          </select>

          <select value={pilar} onChange={(e) => setPilar(e.target.value)} className="border rounded px-2 py-2">
            {PILLARS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <div>
            <input className={`border rounded px-2 py-2 w-full ${errors.date ? 'border-red-500' : ''}`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
          </div>

          <input className="border rounded px-2 py-2" value={location} readOnly />
        </div>

        <div>
          <textarea className={`w-full border rounded p-2 mb-1 ${errors.caption ? 'border-red-500' : ''}`} rows={4} placeholder="Legenda sugerida..." value={caption} onChange={(e) => setCaption(e.target.value)} />
          {errors.caption && <div className="text-red-500 text-xs mb-2">{errors.caption}</div>}
          <div className="text-xs text-gray-500 text-right">{caption.length}/2200 caracteres</div>
        </div>

        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-2">Hashtags sugeridas (clique para adicionar/remover)</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_HASHTAGS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => toggleHashtag(h)}
                className={`text-xs px-2 py-1 border rounded ${hashtags.includes(h) ? 'bg-yellow-100' : ''}`}
              >
                {h}
              </button>
            ))}
          </div>
          {errors.hashtags && <div className="text-red-500 text-xs mt-1">{errors.hashtags}</div>}
          <div className="text-xs text-gray-500 mt-1">{hashtags.length} hashtags selecionadas</div>
        </div>

        <div className="mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags (opcional)</div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2 py-1 border rounded ${
                  tags.includes(tag)
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {tags.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">{tags.length} tag(s) selecionada(s)</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancelar</button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded">Salvar Post</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function HistoryTable({ posts, onUpdateMetrics, onMarkPosted }) {
  const [editing, setEditing] = useState(null);
  const [v, setV] = useState({ views: "", likes: "", comments: "" });

  function openEdit(p) {
    setEditing(p.id);
    setV(p.metrics || { views: "", likes: "", comments: "" });
  }

  function saveEdit(id) {
    onUpdateMetrics(id, v);
    setEditing(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="p-2">Data</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Pilar</th>
            <th className="p-2">Legenda</th>
            <th className="p-2">Métricas</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2 align-top">{p.date}</td>
              <td className="p-2 align-top">{p.type}</td>
              <td className="p-2 align-top">{p.pilar}</td>
              <td className="p-2 align-top">{p.caption.slice(0, 80)}{p.caption.length>80? '...' : ''}</td>
              <td className="p-2 align-top">
                {p.metrics ? (
                  <div className="text-xs">V:{p.metrics.views} • L:{p.metrics.likes} • C:{p.metrics.comments}</div>
                ) : (
                  <div className="text-xs text-gray-400">-</div>
                )}
              </td>
              <td className="p-2 align-top">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 border rounded">Editar Métricas</button>
                  {p.status === 'planejado' && <button onClick={() => onMarkPosted(p.id)} className="text-xs px-2 py-1 bg-green-500 text-white rounded">Marcar Postado</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded p-4 max-w-md w-full">
              <h4 className="font-semibold mb-2">Editar Métricas</h4>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <input placeholder="Views" value={v.views} onChange={(e) => setV({ ...v, views: e.target.value })} className="border rounded px-2 py-1" />
                <input placeholder="Likes" value={v.likes} onChange={(e) => setV({ ...v, likes: e.target.value })} className="border rounded px-2 py-1" />
                <input placeholder="Comments" value={v.comments} onChange={(e) => setV({ ...v, comments: e.target.value })} className="border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="px-3 py-1 border rounded">Cancelar</button>
                <button onClick={() => saveEdit(editing)} className="px-3 py-1 bg-yellow-500 text-white rounded">Salvar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper utilities ---
