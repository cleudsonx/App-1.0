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
import Tooltip from './components/Tooltip';



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
                return (
                  <Tooltip key={w.id} text="Inicie seu treino do dia com acompanhamento inteligente.">
                    <HeroTreinoCard onStartWorkout={() => alert('Iniciar treino!')} />
                  </Tooltip>
                );
              case 'ficha-atual':
                return (
                  <Tooltip key={w.id} text="Veja sua ficha de treino atual, séries, repetições e exercícios.">
                    <FichaAtualCard ficha={ficha} onSwitchTab={tab => alert(`Ir para ${tab}`)} />
                  </Tooltip>
                );
              case 'quick-stats':
                return (
                  <Tooltip key={w.id} text="Resumo rápido dos seus treinos, calorias e metas.">
                    <QuickStatsCard stats={stats} />
                  </Tooltip>
                );
              case 'progresso':
                return (
                  <Tooltip key={w.id} text="Acompanhe sua evolução semanal e mensal.">
                    <ProgressoCard progresso={progresso} />
                  </Tooltip>
                );
              case 'coach-ia':
                return (
                  <Tooltip key={w.id} text="Converse com a IA para tirar dúvidas e receber dicas personalizadas.">
                    <CoachIACard mensagem={"Pergunte algo ao Coach IA!"} onPerguntar={() => alert('Perguntar IA')} />
                  </Tooltip>
                );
              case 'templates':
                return (
                  <Tooltip key={w.id} text="Escolha modelos de treino prontos para diferentes objetivos.">
                    <TemplatesCard templates={templates} onSelecionar={tpl => alert(`Selecionar ${tpl.nome}`)} />
                  </Tooltip>
                );
              case 'conquistas':
                return (
                  <Tooltip key={w.id} text="Veja suas conquistas e badges por desempenho.">
                    <ConquistasCard conquistas={conquistas} />
                  </Tooltip>
                );
              case 'fadiga':
                return (
                  <Tooltip key={w.id} text="Monitore sinais de fadiga e otimize sua recuperação.">
                    <FadigaCard fadiga={fadiga} />
                  </Tooltip>
                );
              case 'sua-divisao':
                return (
                  <Tooltip key={w.id} text="Veja como está dividida sua rotina de treinos.">
                    <SuaDivisaoCard divisao={divisao} />
                  </Tooltip>
                );
              case 'timer-descanso':
                return (
                  <Tooltip key={w.id} text="Cronometre seus intervalos entre séries.">
                    <TimerDescansoCard />
                  </Tooltip>
                );
              case 'agua':
                return (
                  <Tooltip key={w.id} text="Controle sua hidratação diária.">
                    <AguaCard />
                  </Tooltip>
                );
              case 'nutricao':
                return (
                  <Tooltip key={w.id} text="Registre e visualize suas refeições do dia.">
                    <NutricaoCard refeicoes={refeicoes} />
                  </Tooltip>
                );
              case 'motivacional':
                return (
                  <Tooltip key={w.id} text="Receba frases motivacionais para manter o foco.">
                    <MotivacionalCard mensagem={"Você é mais forte do que imagina!"} />
                  </Tooltip>
                );
              case 'planejamento-semanal':
                return (
                  <Tooltip key={w.id} text="Planeje sua semana de treinos.">
                    <PlanejamentoSemanalCard planejamento={planejamento} />
                  </Tooltip>
                );
              case 'prs-volume':
                return (
                  <Tooltip key={w.id} text="Acompanhe seu volume de treino e recordes pessoais.">
                    <PRsVolumeCard prsVolume={prsVolume} />
                  </Tooltip>
                );
              case 'sono-recuperacao':
                return (
                  <Tooltip key={w.id} text="Monitore seu sono e recuperação.">
                    <SonoRecuperacaoCard sono={sono} />
                  </Tooltip>
                );
              default:
                return null;
            }
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
