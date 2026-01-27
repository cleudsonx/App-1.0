import LoginRegister from './components/LoginRegister';
// Endpoints públicos dos backends
const API_ENDPOINTS = {
  java: 'https://app-1-0-java.onrender.com',
  python: 'https://app-1-0-python.onrender.com'
};
import './style.css';
import './brand.css';

    // Buscar preferências do backend antes de agendar notificações
    async function agendarNotificacoes() {
      const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');
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
            } else {
              notificar('Parabéns! Você está em dia com seus desafios!');
            }
          }
          if (notifySettings.tipos.missoes) {
            let missoesPend = 0;
            try {
              const missoes = JSON.parse(localStorage.getItem('dashboard_user_missoes') || '[]');
              missoesPend = missoes.filter(m => !m.completa).length;
            } catch {}
            if (missoesPend > 0) {
              notificar(`Você tem ${missoesPend} missão${missoesPend>1?'s':''} diária pendente${missoesPend>1?'s':''}!`);
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
        }, 2000);
        // Agendar notificação diária no horário escolhido
        const [h, m] = notifySettings.horario.split(':').map(Number);
        const now = new Date();
        const nextTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
        if (now > nextTime) nextTime.setDate(nextTime.getDate() + 1);
        const msToNext = nextTime - now;
        const daily = setTimeout(() => {
          // Lembrete diário para cada tipo ativado
          if (notifySettings.tipos.desafios) {
            let desafiosPend = 0;
            try {
              const desafios = JSON.parse(localStorage.getItem('dashboard_user_desafios') || '[]');
              desafiosPend = desafios.filter(d => d.progresso < d.meta).length;
            } catch {}
            if (desafiosPend > 0) {
              notificar(`Lembrete: você tem ${desafiosPend} desafio${desafiosPend>1?'s':''} fitness para completar!`);
            } else {
              notificar('Continue assim! Todos os desafios do dia estão completos!');
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
            } else {
              notificar('Todas as missões do dia estão completas!');
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
        }, 24*60*60*1000);
        return () => clearTimeout(daily);
      }
    }
    agendarNotificacoes();
  }, []);
            novasConquistas = conquistas.filter(c => c.nova).length;
          } catch {}
          if (novasConquistas > 0) {
            notificar(`Você conquistou ${novasConquistas} nova${novasConquistas>1?'s':''} conquista${novasConquistas>1?'s':''}! Veja seu progresso!`);
          }
        }
        if (notifySettings.tipos.streaks) {
          let streakAtual = 0;
          try {
            streakAtual = parseInt(localStorage.getItem('dashboard_user_streak') || '0', 10);
          } catch {}
          if (streakAtual > 0) {
            notificar(`Você está em uma sequência de ${streakAtual} dia${streakAtual>1?'s':''} de atividades! Continue assim!`);
          }
        }
      }, 2000);
      // Agendar notificação diária no horário escolhido
      const [h, m] = notifySettings.horario.split(':').map(Number);
      const now = new Date();
      const nextTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      if (now > nextTime) nextTime.setDate(nextTime.getDate() + 1);
      const msToNext = nextTime - now;
      const daily = setTimeout(() => {
        // Lembrete diário para cada tipo ativado
        if (notifySettings.tipos.desafios) {
          let desafiosPend = 0;
          try {
            const desafios = JSON.parse(localStorage.getItem('dashboard_user_desafios') || '[]');
            desafiosPend = desafios.filter(d => d.progresso < d.meta).length;
          } catch {}
          if (desafiosPend > 0) {
            notificar(`Lembrete: você tem ${desafiosPend} desafio${desafiosPend>1?'s':''} fitness para completar!`);
          } else {
            notificar('Continue assim! Todos os desafios do dia estão completos!');
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
          } else {
            notificar('Todas as missões do dia estão completas!');
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
          }
        }
        if (notifySettings.tipos.streaks) {
          let streakAtual = 0;
          try {
            streakAtual = parseInt(localStorage.getItem('dashboard_user_streak') || '0', 10);
          } catch {}
          if (streakAtual > 0) {
            notificar(`Você está em uma sequência de ${streakAtual} dia${streakAtual>1?'s':''} de atividades! Continue assim!`);
          }
        }
        setInterval(() => {
          // Lembrete recorrente para cada tipo ativado
          if (notifySettings.tipos.desafios) {
            let desafiosPend = 0;
            try {
              const desafios = JSON.parse(localStorage.getItem('dashboard_user_desafios') || '[]');
              desafiosPend = desafios.filter(d => d.progresso < d.meta).length;
            } catch {}
            if (desafiosPend > 0) {
              notificar(`Lembrete: você tem ${desafiosPend} desafio${desafiosPend>1?'s':''} fitness para completar!`);
            } else {
              notificar('Continue assim! Todos os desafios do dia estão completos!');
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
            } else {
              notificar('Todas as missões do dia estão completas!');
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
            }
          }
          if (notifySettings.tipos.streaks) {
            let streakAtual = 0;
            try {
              streakAtual = parseInt(localStorage.getItem('dashboard_user_streak') || '0', 10);
            } catch {}
            if (streakAtual > 0) {
              notificar(`Você está em uma sequência de ${streakAtual} dia${streakAtual>1?'s':''} de atividades! Continue assim!`);
            }
          }
        }, 24*60*60*1000);
      }, msToNext);
      return () => clearTimeout(daily);
    }
  }, []);

  if (!user) {
    return <LoginRegister onAuth={u => {
      setUser(u);
      localStorage.setItem('dashboard_user', JSON.stringify(u));
    }} />;
  }

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('dashboard_theme', theme);
  }, [theme]);

  return (
    <div className={`dashboard-root ${theme}`}> 
      <h2>Dashboard React</h2>
      <button style={{position:'absolute',top:16,right:16}} onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
      </button>
      {'Notification' in window && Notification.permission !== 'granted' && (
        <button style={{position:'absolute',top:16,right:120}} onClick={pedirPermissaoNotificacao}>
          Ativar Notificações 🔔
        </button>
      )}
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
      <NotificationSettings />
      <FeedAtividades userId={user?.id || user?.email || 'anon'} />
      <MissoesDiariasStreaks userId={user?.id || user?.email || 'anon'} />
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
                  <React.Fragment key={w.id}>
                    <Tooltip text="Veja suas conquistas e badges por desempenho.">
                      <ConquistasCard conquistas={conquistas} />
                    </Tooltip>
                    <Tooltip text="Veja seu desempenho no ranking semanal.">
                      <RankingCard />
                    </Tooltip>
                    <Tooltip text="Complete desafios fitness e ganhe recompensas.">
                      <DesafiosCard />
                    </Tooltip>
                  </React.Fragment>
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

export default App;
