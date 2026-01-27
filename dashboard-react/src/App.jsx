import LoginRegister from './components/LoginRegister';
import Toast from './components/Toast';
import React, { useState, useRef } from 'react';
// Endpoints públicos dos backends
const API_ENDPOINTS = {
  java: 'https://app-1-0-java.onrender.com',
  python: 'https://app-1-0-python.onrender.com'
};
import './style.css';
import './brand.css';
import OnboardingProfile from './components/OnboardingProfile';
import FeedAtividades from './components/FeedAtividades';
import Badge from './components/Badge';
import Ranking from './components/Ranking';
import { GamificationProvider, useGamification } from './context/GamificationContext';

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dashboard_user')) || null;
    } catch {
      return null;
    }
  });
  const [onboardingDone, setOnboardingDone] = useState(() => {
    try {
      return localStorage.getItem('dashboard_onboarding') === 'ok';
    } catch {
      return false;
    }
  });

  // Estado e função para Toast visual
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimeout = useRef(null);
  function showToast(message) {
    setToast({ message, visible: true });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }

  // Buscar preferências do backend antes de agendar notificações
  async function agendarNotificacoes(user) {
    if (!user) return;
    const userId = user.id || user.email || 'anon';
    let notifySettings = null;
    try {
      const res = await fetch(`https://app-1-0-python.onrender.com/api/notify-settings?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        notifySettings = await res.json();
        localStorage.setItem('dashboard_notify_settings', JSON.stringify(notifySettings));
      }
    } catch {}
    if (!notifySettings) {
      notifySettings = JSON.parse(localStorage.getItem('dashboard_notify_settings') || '{"horario":"09:00","tipos":{"missoes":true,"desafios":true,"conquistas":true,"streaks":true},"push":true}');
    }
    if ('Notification' in window && Notification.permission === 'granted' && notifySettings.push) {
      setTimeout(() => {
        // Notificação inicial para cada tipo ativado
        if (notifySettings.tipos.desafios) {
          let desafiosPend = 0;
          try {
            const desafios = JSON.parse(localStorage.getItem('dashboard_user_desafios') || '[]');
            desafiosPend = desafios.filter(d => d.progresso < d.meta).length;
          } catch {}
          if (desafiosPend > 0) {
            notificar(`Você tem ${desafiosPend} desafio${desafiosPend>1?'s':''} fitness pendente${desafiosPend>1?'s':''} hoje!`);
            showToast(`Você tem ${desafiosPend} desafio${desafiosPend>1?'s':''} fitness pendente${desafiosPend>1?'s':''} hoje!`);
          } else {
            notificar('Parabéns! Você está em dia com seus desafios!');
            showToast('Parabéns! Você está em dia com seus desafios!');
          }
        }
        if (notifySettings.tipos.streaks) {
          let streakAtual = 0;
          try {
            streakAtual = parseInt(localStorage.getItem('dashboard_user_streak') || '0', 10);
          } catch {}
          if (streakAtual > 0) {
            notificar(`Você está em uma sequência de ${streakAtual>1?'s':''} dia${streakAtual>1?'s':''} de atividades! Continue assim!`);
            showToast(`Você está em uma sequência de ${streakAtual>1?'s':''} dia${streakAtual>1?'s':''} de atividades! Continue assim!`);
          }
        }
        if (notifySettings.tipos.conquistas) {
          let novasConquistas = 0;
          try {
            const conquistas = JSON.parse(localStorage.getItem('dashboard_user_conquistas') || '[]');
            novasConquistas = conquistas.filter(c => c.nova).length;
          } catch {}
          if (novasConquistas > 0) {
            notificar(`Você conquistou ${novasConquistas} nova${novasConquistas>1?'s':''} conquista${novasConquistas>1?'s':''}! Veja seu progresso!`);
            showToast(`Você conquistou ${novasConquistas} nova${novasConquistas>1?'s':''} conquista${novasConquistas>1?'s':''}! Veja seu progresso!`);
          }
        }
      }, 2000);

      // Agendar notificação diária no horário escolhido
      const [h, m] = notifySettings.horario.split(':').map(Number);
      const now = new Date();
      const nextTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      if (now > nextTime) nextTime.setDate(nextTime.getDate() + 1);
      const msToNext = nextTime - now;
      setTimeout(() => {
        // Lembrete diário para cada tipo ativado
        if (notifySettings.tipos.desafios) {
          let desafiosPend = 0;
          try {
            const desafios = JSON.parse(localStorage.getItem('dashboard_user_desafios') || '[]');
            desafiosPend = desafios.filter(d => d.progresso < d.meta).length;
          } catch {}
          if (desafiosPend > 0) {
            notificar(`Lembrete: você tem ${desafiosPend} desafio${desafiosPend>1?'s':''} fitness para completar!`);
            showToast(`Lembrete: você tem ${desafiosPend} desafio${desafiosPend>1?'s':''} fitness para completar!`);
          } else {
            notificar('Continue assim! Todos os desafios do dia estão completos!');
            showToast('Continue assim! Todos os desafios do dia estão completos!');
          }
        }
        if (notifySettings.tipos.missoes) {
          let missoesPend = 0;
          try {
            const missoes = JSON.parse(localStorage.getItem('dashboard_user_missoes') || '[]');
            missoesPend = missoes.filter(m => !m.completa).length;
          } catch {}
          if (missoesPend > 0) {
            notificar(`Lembrete: você tem ${missoesPend} missão${missoesPend>1?'s':''} diária para completar!`);
            showToast(`Lembrete: você tem ${missoesPend} missão${missoesPend>1?'s':''} diária para completar!`);
          } else {
            notificar('Todas as missões do dia estão completas!');
            showToast('Todas as missões do dia estão completas!');
          }
        }
        if (notifySettings.tipos.conquistas) {
          let novasConquistas = 0;
          try {
            const conquistas = JSON.parse(localStorage.getItem('dashboard_user_conquistas') || '[]');
            novasConquistas = conquistas.filter(c => c.nova).length;
          } catch {}
          if (novasConquistas > 0) {
            notificar(`Você conquistou ${novasConquistas} nova${novasConquistas>1?'s':''} conquista${novasConquistas>1?'s':''}! Veja seu progresso!`);
            showToast(`Você conquistou ${novasConquistas} nova${novasConquistas>1?'s':''} conquista${novasConquistas>1?'s':''}! Veja seu progresso!`);
          }
        }
        if (notifySettings.tipos.streaks) {
          let streakAtual = 0;
          try {
            streakAtual = parseInt(localStorage.getItem('dashboard_user_streak') || '0', 10);
          } catch {}
          if (streakAtual > 0) {
            notificar(`Você está em uma sequência de ${streakAtual>1?'s':''} dia${streakAtual>1?'s':''} de atividades! Continue assim!`);
          }
        }
      }, msToNext);
    }
  }

  React.useEffect(() => {
    if (user) agendarNotificacoes(user);
  }, [user]);

  // Renderização condicional do fluxo
  if (!user) {
    function App() {
      const [user, setUser] = useState(() => {
        try {
          return JSON.parse(localStorage.getItem('dashboard_user')) || null;
        } catch {
          return null;
        }
      });
      const [onboardingDone, setOnboardingDone] = useState(() => {
        try {
          return localStorage.getItem('dashboard_onboarding') === 'ok';
        } catch {
          return false;
        }
      });
      // ...existing code...
      const { badges, ranking } = useGamification();
      return (
        <div className="dashboard-root">
          <button onClick={handleLogout} style={{position:'absolute',top:10,right:10,zIndex:10}}>Sair</button>
          <FeedAtividades userId={user?.id || user?.email} />
          <div style={{marginTop:24}}>
            <h3>Badges</h3>
            {badges.map(b => <Badge key={b.nome} {...b} />)}
          </div>
          <Ranking usuarios={ranking} />
          <style>{`
            color: #ffb3b3;
          }
        `}</style>
      </div>
    );
  }
  if (!onboardingDone) {
    return (
      <div className="dashboard-root">
        <OnboardingProfile user={user} onAuth={u => {
          setOnboardingDone(true);
          localStorage.setItem('dashboard_onboarding', 'ok');
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          body[data-theme='dark'], .dashboard-root.dark {
            background: #181a1b;
            color: #f1f1f1;
          }
          .dashboard-root.dark .card, .dashboard-root.dark .dashboard-grid, .dashboard-root.dark .login-register-root {
            background: #23272b;
            color: #f1f1f1;
          }
          .dashboard-root.dark input, .dashboard-root.dark select, .dashboard-root.dark textarea {
            background: #23272b;
            color: #f1f1f1;
            border: 1px solid #444;
          }
          .dashboard-root.dark button {
            background: #222;
            color: #f1f1f1;
            border: 1px solid #444;
          }
          .dashboard-root.dark .spinner {
            border-color: #444;
            border-top-color: #00bfff;
          }
          .dashboard-root.dark .error {
            color: #ffb3b3;
          }
        `}</style>
      </div>
    );
  }
  function handleLogout() {
    setUser(null);
    setOnboardingDone(false);
    localStorage.removeItem('dashboard_user');
    localStorage.removeItem('dashboard_onboarding');
    // Limpar outros dados se necessário
  }
  // Mock badges e ranking para demonstração
  const badges = [
    { nome: 'Primeiro treino', descricao: 'Complete seu primeiro treino', icone: '🏆' },
    { nome: 'Desafio 7 dias', descricao: 'Complete 7 dias seguidos', icone: '🔥' }
  ];
  const ranking = [
    { id: 'test-user', nome: user?.nome || 'Você', pontos: 120 },
    { id: 'user2', nome: 'Maria', pontos: 110 },
    { id: 'user3', nome: 'João', pontos: 90 }
  ];
  return (
    <div className="dashboard-root">
      <button onClick={handleLogout} style={{position:'absolute',top:10,right:10,zIndex:10}}>Sair</button>
      <FeedAtividades userId={user?.id || user?.email} />
      <div style={{marginTop:24}}>
        <h3>Badges</h3>
        {badges.map(b => <Badge key={b.nome} {...b} />)}
      </div>
      <Ranking usuarios={ranking} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        body[data-theme='dark'], .dashboard-root.dark {
          background: #181a1b;
          color: #f1f1f1;
        }
        .dashboard-root.dark .card, .dashboard-root.dark .dashboard-grid, .dashboard-root.dark .login-register-root {
          background: #23272b;
          color: #f1f1f1;
        }
        .dashboard-root.dark input, .dashboard-root.dark select, .dashboard-root.dark textarea {
          background: #23272b;
          color: #f1f1f1;
          border: 1px solid #444;
        }
        .dashboard-root.dark button {
          background: #222;
          color: #f1f1f1;
          border: 1px solid #444;
        }
        .dashboard-root.dark .spinner {
          border-color: #444;
          border-top-color: #00bfff;
        }
        .dashboard-root.dark .error {
          color: #ffb3b3;
        }
      `}</style>
    </div>
  );
}

export default function AppWithProvider() {
  return (
    <GamificationProvider>
      <App />
    </GamificationProvider>
  );
}
