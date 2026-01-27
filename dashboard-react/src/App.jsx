import LoginRegister from './components/LoginRegister';
// Endpoints públicos dos backends
const API_ENDPOINTS = {
  java: 'https://app-1-0-java.onrender.com',
  python: 'https://app-1-0-python.onrender.com'
};
import './style.css';
import './brand.css';

// Configuração padrão dos widgets (id, visibilidade, ordem)
const defaultWidgetConfig = [
  { id: 'hero-treino', visible: true, order: 0 },
  { id: 'ficha-atual', visible: true, order: 1 },
  { id: 'quick-stats', visible: true, order: 2 },
  { id: 'progresso', visible: true, order: 3 },
  { id: 'coach-ia', visible: true, order: 4 },
  { id: 'templates', visible: true, order: 5 },
  { id: 'conquistas', visible: true, order: 6 },
  { id: 'fadiga', visible: true, order: 7 },
  { id: 'sua-divisao', visible: true, order: 8 },
  { id: 'timer-descanso', visible: true, order: 9 },
  { id: 'agua', visible: true, order: 10 },
  { id: 'nutricao', visible: true, order: 11 },
  { id: 'motivacional', visible: true, order: 12 },
  { id: 'planejamento-semanal', visible: true, order: 13 },
  { id: 'prs-volume', visible: true, order: 14 },
  { id: 'sono-recuperacao', visible: true, order: 15 }
];

import React, { useState, useEffect } from 'react';
import DashboardGrid from './components/DashboardGrid';

import HeroTreinoCard from './components/HeroTreinoCard';
import FichaAtualCard from './components/FichaAtualCard';
import QuickStatsCard from './components/QuickStatsCard';
import ProgressoCard from './components/ProgressoCard';
import CoachIACard from './components/CoachIACard';
import TemplatesCard from './components/TemplatesCard';
import ConquistasCard from './components/ConquistasCard';
import FadigaCard from './components/FadigaCard';
import SuaDivisaoCard from './components/SuaDivisaoCard';
import TimerDescansoCard from './components/TimerDescansoCard';
import AguaCard from './components/AguaCard';
import NutricaoCard from './components/NutricaoCard';
import MotivacionalCard from './components/MotivacionalCard';
import PlanejamentoSemanalCard from './components/PlanejamentoSemanalCard';
import PRsVolumeCard from './components/PRsVolumeCard';
import SonoRecuperacaoCard from './components/SonoRecuperacaoCard';
import PersonalizationModal from './components/PersonalizationModal';



function App() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dashboard_user');
    return saved ? JSON.parse(saved) : null;
  });
  // Estado de configuração dos widgets
  const [widgetConfig, setWidgetConfig] = useState(() => {
    const saved = localStorage.getItem('dashboard_widgets_config');
    return saved ? JSON.parse(saved) : defaultWidgetConfig;
  });

  // Estados para dados reais dos widgets
  const [ficha, setFicha] = useState(null);
  const [stats, setStats] = useState(null);
  const [progresso, setProgresso] = useState(null);
  const [conquistas, setConquistas] = useState([]);
  const [fadiga, setFadiga] = useState(null);
  const [divisao, setDivisao] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [refeicoes, setRefeicoes] = useState([]);
  const [planejamento, setPlanejamento] = useState([]);
  const [prsVolume, setPrsVolume] = useState(null);
  const [sono, setSono] = useState(null);

  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);

  // Função utilitária para fetch com tratamento de erro

  async function fetchWithError(url, setter) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erro ao buscar ${url}: ${res.status}`);
      const data = await res.json();
      setter(data);
    } catch (err) {
      setFetchError(`Falha ao carregar dados (${url}): ${err.message}`);
    }
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchWithError(`${API_ENDPOINTS.java}/api/ficha`, setFicha),
      fetchWithError(`${API_ENDPOINTS.java}/api/stats`, setStats),
      fetchWithError(`${API_ENDPOINTS.java}/api/progresso`, setProgresso),
      fetchWithError(`${API_ENDPOINTS.java}/api/conquistas`, setConquistas),
      fetchWithError(`${API_ENDPOINTS.java}/api/fadiga`, setFadiga),
      fetchWithError(`${API_ENDPOINTS.java}/api/divisao`, setDivisao),
      fetchWithError(`${API_ENDPOINTS.java}/api/templates`, setTemplates),
      fetchWithError(`${API_ENDPOINTS.python}/api/refeicoes`, setRefeicoes),
      fetchWithError(`${API_ENDPOINTS.java}/api/planejamento`, setPlanejamento),
      fetchWithError(`${API_ENDPOINTS.java}/api/prs-volume`, setPrsVolume),
      fetchWithError(`${API_ENDPOINTS.python}/api/sono`, setSono)
    ]).finally(() => setLoading(false));
  }, []);

  if (!user) {
    return <LoginRegister onAuth={u => {
      setUser(u);
      localStorage.setItem('dashboard_user', JSON.stringify(u));
    }} />;
  }

  return (
    <div className="dashboard-root">
      <h2>Dashboard React</h2>
      {loading && (
        <div className="loading" style={{margin: '24px 0', textAlign: 'center'}}>
          <span className="spinner" style={{display: 'inline-block', width: 32, height: 32, border: '4px solid #ccc', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: 8}}></span>
          Carregando dados do dashboard...
        </div>
      )}
      {fetchError && <div className="error" style={{color: 'red', marginBottom: 12}}>{fetchError}</div>}
      <button onClick={() => setShowModal(true)}>
        Personalizar Dashboard
      </button>
      <DashboardGrid>
        {widgetConfig
          .filter(w => w.visible)
          .sort((a, b) => a.order - b.order)
          .map(w => {
            switch (w.id) {
              case 'hero-treino':
                return <HeroTreinoCard key={w.id} onStartWorkout={() => alert('Iniciar treino!')} />;
              case 'ficha-atual':
                return <FichaAtualCard key={w.id} ficha={ficha} onSwitchTab={tab => alert(`Ir para ${tab}`)} />;
              case 'quick-stats':
                return <QuickStatsCard key={w.id} stats={stats} />;
              case 'progresso':
                return <ProgressoCard key={w.id} progresso={progresso} />;
              case 'coach-ia':
                return <CoachIACard key={w.id} mensagem={"Pergunte algo ao Coach IA!"} onPerguntar={() => alert('Perguntar IA')} />;
              case 'templates':
                return <TemplatesCard key={w.id} templates={templates} onSelecionar={tpl => alert(`Selecionar ${tpl.nome}`)} />;
              case 'conquistas':
                return <ConquistasCard key={w.id} conquistas={conquistas} />;
              case 'fadiga':
                return <FadigaCard key={w.id} fadiga={fadiga} />;
              case 'sua-divisao':
                return <SuaDivisaoCard key={w.id} divisao={divisao} />;
              case 'timer-descanso':
                return <TimerDescansoCard key={w.id} />;
              case 'agua':
                return <AguaCard key={w.id} />;
              case 'nutricao':
                return <NutricaoCard key={w.id} refeicoes={refeicoes} />;
              case 'motivacional':
                return <MotivacionalCard key={w.id} mensagem={"Você é mais forte do que imagina!"} />;
              case 'planejamento-semanal':
                return <PlanejamentoSemanalCard key={w.id} planejamento={planejamento} />;
              case 'prs-volume':
                return <PRsVolumeCard key={w.id} prsVolume={prsVolume} />;
              case 'sono-recuperacao':
                return <SonoRecuperacaoCard key={w.id} sono={sono} />;
              default:
                return null;
            }
          })}
      </DashboardGrid>
      <PersonalizationModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Personalizar Dashboard</h3>
        <ul>
          {widgetConfig
            .sort((a, b) => a.order - b.order)
            .map((w, idx) => (
              <li key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{w.id}</span>
                <button onClick={() => setWidgetConfig(cfg => cfg.map(item => item.id === w.id ? { ...item, visible: !item.visible } : item))}>
                  {w.visible ? 'Ocultar' : 'Mostrar'}
                </button>
                <button disabled={idx === 0} onClick={() => setWidgetConfig(cfg => {
                  const newCfg = [...cfg];
                  const i = newCfg.findIndex(item => item.id === w.id);
                  if (i > 0) {
                    [newCfg[i - 1].order, newCfg[i].order] = [newCfg[i].order, newCfg[i - 1].order];
                  }
                  return newCfg;
                })}>↑</button>
                <button disabled={idx === widgetConfig.length - 1} onClick={() => setWidgetConfig(cfg => {
                  const newCfg = [...cfg];
                  const i = newCfg.findIndex(item => item.id === w.id);
                  if (i < newCfg.length - 1) {
                    [newCfg[i + 1].order, newCfg[i].order] = [newCfg[i].order, newCfg[i + 1].order];
                  }
                  return newCfg;
                })}>↓</button>
              </li>
            ))}
        </ul>
      </PersonalizationModal>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
