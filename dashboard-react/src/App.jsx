
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
        <HeroTreinoCard onStartWorkout={() => alert('Iniciar treino!')} />
        <FichaAtualCard ficha={ficha} onSwitchTab={tab => alert(`Ir para ${tab}`)} />
        <QuickStatsCard stats={stats} />
        <ProgressoCard progresso={progresso} />
        <CoachIACard mensagem={"Pergunte algo ao Coach IA!"} onPerguntar={() => alert('Perguntar IA')} />
        <TemplatesCard templates={templates} onSelecionar={tpl => alert(`Selecionar ${tpl.nome}`)} />
        <ConquistasCard conquistas={conquistas} />
        <FadigaCard fadiga={fadiga} />
        <SuaDivisaoCard divisao={divisao} />
        <TimerDescansoCard />
        <AguaCard />
        <NutricaoCard refeicoes={refeicoes} />
        <MotivacionalCard mensagem={"Você é mais forte do que imagina!"} />
        <PlanejamentoSemanalCard planejamento={planejamento} />
        <PRsVolumeCard prsVolume={prsVolume} />
        <SonoRecuperacaoCard sono={sono} />
      </DashboardGrid>
      <PersonalizationModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <p>Conteúdo do modal de personalização</p>
      </PersonalizationModal>
    </div>
  );
}

export default App;
