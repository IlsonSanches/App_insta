import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContentGenerator from "./components/ContentGenerator/ContentGenerator.jsx";

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
  const [activeTab, setActiveTab] = useState("agenda"); // "agenda" ou "gerador"
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
  }, [weeklyData]);

  function createNewWeekIfNeeded(weekId) {
    if (!weeklyData[weekId]) {
      const newWeek = generateWeeklyAgenda(weekId);
      setWeeklyData(prev => ({
        ...prev,
        [weekId]: newWeek
      }));
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
  }

  const filtered = posts.filter((p) => {
    if (filter !== "Todos" && p.pilar !== filter) return false;
    if (query && !p.caption.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const upcoming = posts.filter((p) => p.status === "planejado").slice(0, 6);
  const weekHistory = Object.keys(weeklyData).sort().reverse();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-yellow-100 p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold">Agenda Insta - Jet Chicken</h1>
            <p className="text-sm text-gray-600">
              Sistema de Planejamento Semanal Automático • Semana {formatWeekId(currentWeekId)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "agenda" && (
              <>
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
                  onClick={() => { localStorage.removeItem('aji_weekly_v2'); window.location.reload(); }}
                  className="px-3 py-1 border rounded text-sm"
                  title="Resetar sistema"
                >
                  Resetar Sistema
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("agenda")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "agenda"
                ? "bg-white text-yellow-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📅 Agenda Semanal
          </button>
          <button
            onClick={() => setActiveTab("gerador")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "gerador"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🤖 Gerador IA
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {activeTab === "agenda" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="col-span-2 space-y-6">
              <DashboardStats posts={posts} />

              <div className="bg-white rounded-2xl p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">Planejador Semanal</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option>Todos</option>
                      {PILLARS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Pesquisar legenda..."
                      className="border rounded px-2 py-1 text-sm"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                <WeeklyCalendar
                  posts={filtered}
                  onMarkPosted={markPosted}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>

              <div className="bg-white rounded-2xl p-4 shadow">
                <h2 className="font-semibold mb-3">Histórico / Tabela</h2>
                <HistoryTable posts={posts} onUpdateMetrics={updateMetrics} onMarkPosted={markPosted} />
              </div>
            </section>

            <aside className="space-y-6">
              <div className="bg-white rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2">Próximos Posts</h3>
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

              <div className="bg-white rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2">Dicas da Semana</h3>
                <ul className="text-sm text-gray-700 list-disc ml-5">
                  {(currentWeek.tips || WEEKLY_TIPS.slice(0, 4)).map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2">Histórico de Semanas</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {weekHistory.slice(0, 5).map((weekId) => (
                    <div key={weekId} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">Semana {formatWeekId(weekId)}</div>
                        <div className="text-xs text-gray-500">
                          {weeklyData[weekId]?.posts?.length || 0} posts • 
                          {weeklyData[weekId]?.posts?.filter(p => p.status === 'postado').length || 0} postados
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentWeekId(weekId)}
                        className={`text-xs px-2 py-1 rounded ${
                          weekId === currentWeekId 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {weekId === currentWeekId ? 'Atual' : 'Ver'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2">Hashtags sugeridas</h3>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_HASHTAGS.map((h) => (
                    <span key={h} className="text-xs px-2 py-1 border rounded">{h}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <ContentGenerator />
        )}
      </main>

      <AnimatePresence>{showForm && <PostForm onClose={() => setShowForm(false)} onSave={addPost} />}</AnimatePresence>

      <footer className="max-w-6xl mx-auto mt-6 text-center text-xs text-gray-500">Protótipo — pronto para commit no GitHub e deploy no Vercel.</footer>
    </div>
  );
}

function DashboardStats({ posts }) {
  const total = posts.length;
  const planned = posts.filter((p) => p.status === "planejado").length;
  const posted = posts.filter((p) => p.status === "postado").length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow flex gap-4">
      <StatCard title="Total de Posts" value={total} />
      <StatCard title="Planejados" value={planned} />
      <StatCard title="Postados" value={posted} />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="flex-1 p-3 bg-yellow-50 rounded-lg">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function WeeklyCalendar({ posts, onMarkPosted, selectedDate, onSelectDate }) {
  // Simple weekly list grouped by date
  const week = weekDatesAround(selectedDate);

  return (
    <div className="grid grid-cols-7 gap-2">
      {week.map((d) => (
        <div key={d} className="border rounded p-2 bg-gray-50">
          <div className="text-xs font-medium mb-2">{formatDateShort(d)}</div>
          <div className="space-y-2">
            {posts
              .filter((p) => p.date === d)
              .map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 bg-white rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold">{p.type} • {p.pilar}</div>
                      <div className="text-xs text-gray-600">{p.caption.slice(0, 50)}{p.caption.length>50? '...' : ''}</div>
                      <div className="text-xs mt-1">{p.hashtags.join(' ')}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {p.status === 'planejado' ? (
                        <button onClick={() => onMarkPosted(p.id)} className="text-xs bg-green-500 px-2 py-1 rounded text-white">✓</button>
                      ) : (
                        <span className="text-xs text-gray-500">Postado</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
          <div className="mt-2 text-center">
            <button onClick={() => onSelectDate(d)} className="text-xs underline">Selecionar</button>
          </div>
        </div>
      ))}
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

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ type, pilar, date, caption, hashtags, location });
    onClose();
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

          <input className="border rounded px-2 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <input className="border rounded px-2 py-2" value={location} readOnly />
        </div>

        <textarea className="w-full border rounded p-2 mb-3" rows={4} placeholder="Legenda sugerida..." value={caption} onChange={(e) => setCaption(e.target.value)} />

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
