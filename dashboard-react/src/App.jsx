import { useEffect } from 'react';
  // Salva configuração no localStorage ao alterar ordem/visibilidade
  useEffect(() => {
    localStorage.setItem('dashboard_widgets_config', JSON.stringify(widgetConfig));
  }, [widgetConfig]);
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

import React, { useState } from 'react';
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

  // Exemplos de dados iniciais para cada widget
  const ficha = { resumo: 'Treino ABC, 3x por semana' };
  const stats = { treinos: 42, volume: '12.000kg', prs: 5 };
  const progresso = { volume: '12.000kg', prs: 5, ultimaEvolucao: 'Semana passada' };
  const conquistas = [
    { titulo: 'Primeiro Treino', descricao: 'Você completou seu primeiro treino!' },
    { titulo: 'PR de Agachamento', descricao: 'Novo recorde de agachamento.' }
  ];
  const fadiga = { nivel: 'Moderado', recomendacao: 'Descanse 1 dia.' };
  const divisao = { descricao: 'ABC - Hipertrofia', dias: ['Segunda', 'Quarta', 'Sexta'] };
  const templates = [
    { categoria: 'Hipertrofia', fichas: [ { nome: 'Ficha A' }, { nome: 'Ficha B' } ] },
    { categoria: 'Resistência', fichas: [ { nome: 'Ficha X' } ] }
  ];
  const refeicoes = [
    { horario: '08:00', descricao: 'Café da manhã: ovos e aveia' },
    { horario: '12:00', descricao: 'Almoço: frango e arroz' }
  ];
  const planejamento = [
    { dia: 'Segunda', atividade: 'Treino A' },
    { dia: 'Quarta', atividade: 'Treino B' }
  ];
  const prsVolume = { prs: 5, volume: '12.000kg' };
  const sono = { horas: 7, qualidade: 'Boa' };

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
        <p>Conteúdo do modal de personalização</p>
      </PersonalizationModal>
    </div>
  );
}

export default App;
