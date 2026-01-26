
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

  // Exemplo de busca de dados reais ao montar o componente
  useEffect(() => {
    // Substitua as URLs abaixo pelas rotas reais do seu backend
    fetch('/api/ficha').then(r => r.json()).then(setFicha);
    fetch('/api/stats').then(r => r.json()).then(setStats);
    fetch('/api/progresso').then(r => r.json()).then(setProgresso);
    fetch('/api/conquistas').then(r => r.json()).then(setConquistas);
    fetch('/api/fadiga').then(r => r.json()).then(setFadiga);
    fetch('/api/divisao').then(r => r.json()).then(setDivisao);
    fetch('/api/templates').then(r => r.json()).then(setTemplates);
    fetch('/api/refeicoes').then(r => r.json()).then(setRefeicoes);
    fetch('/api/planejamento').then(r => r.json()).then(setPlanejamento);
    fetch('/api/prs-volume').then(r => r.json()).then(setPrsVolume);
    fetch('/api/sono').then(r => r.json()).then(setSono);
  }, []);

  return (
    <div className="dashboard-root">
      <h2>Dashboard React</h2>
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
    </div>
  );
}

export default App;
