import React, { useEffect, useState } from 'react';

// Endpoint backend Python
const API_PYTHON = 'https://app-1-0-python.onrender.com';

// Missões diárias e streaks
const missoesPadrao = [
  { id: 1, titulo: 'Complete 1 treino hoje', tipo: 'treino', meta: 1, recompensa: '🔥 +5 pontos', icone: '🔥' },
  { id: 2, titulo: 'Beba 2L de água', tipo: 'agua', meta: 2000, recompensa: '💧 +3 pontos', icone: '💧' },
  { id: 3, titulo: 'Registre uma refeição', tipo: 'refeicao', meta: 1, recompensa: '🍽️ +2 pontos', icone: '🍽️' }
];

export default function MissoesDiariasStreaks({ userId }) {
  const [missoes, setMissoes] = useState([]);
  const [streak, setStreak] = useState(0);
  const [hoje, setHoje] = useState(new Date().toISOString().slice(0,10)); // yyyy-mm-dd
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Carrega missões e streak do backend (com fallback offline)
  useEffect(() => {
    let cancelado = false;
    async function fetchMissoesStreak() {
      setLoading(true);
      setMsg("");
      try {
        // Buscar missões do backend
        const res = await fetch(`${API_PYTHON}/api/missoes-diarias?user_id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error('Backend offline');
        const missoesBackend = await res.json();
        if (!cancelado) setMissoes(missoesBackend);
        // Buscar streak do backend
        const resStreak = await fetch(`${API_PYTHON}/api/streak?user_id=${encodeURIComponent(userId)}`);
        if (!resStreak.ok) throw new Error('Backend offline');
        const streakBackend = await resStreak.json();
        if (!cancelado) setStreak(streakBackend.streak || 0);
        // Salvar no localStorage para fallback offline
        localStorage.setItem(`missoes_${userId}_${hoje}`, JSON.stringify(missoesBackend));
        localStorage.setItem(`streak_${userId}`, streakBackend.streak || 0);
      } catch (e) {
        // Fallback offline
        const key = `missoes_${userId}_${hoje}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          setMissoes(JSON.parse(saved));
        } else {
          setMissoes(missoesPadrao.map(m => ({ ...m, progresso: 0, concluida: false })));
        }
        const streakKey = `streak_${userId}`;
        setStreak(Number(localStorage.getItem(streakKey) || 0));
        setMsg("(Offline)");
      }
      setLoading(false);
    }
    fetchMissoesStreak();
    return () => { cancelado = true; };
  }, [userId, hoje]);

  // Atualiza progresso de missão e salva no backend/localStorage
  async function atualizarMissao(idx, valor = 1) {
    setMissoes(missoes => {
      const novas = [...missoes];
      if (!novas[idx].concluida) {
        novas[idx].progresso += valor;
        if (novas[idx].progresso >= novas[idx].meta) {
          novas[idx].concluida = true;
        }
        // Salva localmente
        localStorage.setItem(`missoes_${userId}_${hoje}`, JSON.stringify(novas));
        // Salva no backend
        salvarMissoesBackend(novas);
      }
      return novas;
    });
  }

  // Salva missões no backend
  async function salvarMissoesBackend(missoesParaSalvar) {
    setMsg("");
    try {
      await fetch(`${API_PYTHON}/api/missoes-diarias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, data: hoje, missoes: missoesParaSalvar })
      });
      setMsg("Missões salvas!");
    } catch {
      setMsg("Falha ao salvar no backend (offline)");
    }
  }

  // Checa streak ao completar todas e salva no backend/localStorage
  useEffect(() => {
    if (missoes.length > 0 && missoes.every(m => m.concluida)) {
      const streakKey = `streak_${userId}`;
      const atual = Number(localStorage.getItem(streakKey) || 0);
      const novoStreak = atual + 1;
      localStorage.setItem(streakKey, novoStreak);
      setStreak(novoStreak);
      // Salva streak no backend
      fetch(`${API_PYTHON}/api/streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, streak: novoStreak })
      }).catch(() => setMsg("Falha ao salvar streak (offline)"));
    }
  }, [missoes, userId]);

  return (
    <div className="dashboard-widget widget-card card-missoes">
      <span role="img" aria-label="Missões">🎯</span>
      <h3>Missões Diárias & Streak</h3>
      <div style={{marginBottom:8}}>
        <b>Streak:</b> <span style={{color:'#00c851',fontWeight:'bold'}}>{streak} 🔥</span> dias seguidos {msg && <span style={{marginLeft:8,fontSize:12}}>{msg}</span>}
      </div>
      {loading ? <div>Carregando missões...</div> : (
        <ul style={{paddingLeft:0}}>
          {missoes.map((m, idx) => (
            <li key={m.id} style={{marginBottom:10,listStyle:'none',background:'#f7f7f7',borderRadius:8,padding:8,opacity:m.concluida?0.6:1}}>
              <span style={{fontSize:20}}>{m.icone}</span> <b>{m.titulo}</b>
              <span style={{float:'right',fontSize:13}}>{m.progresso}/{m.meta}</span>
              <br/>
              <span style={{fontSize:13}}>{m.recompensa}</span>
              {!m.concluida && <button style={{marginLeft:12}} onClick={()=>atualizarMissao(idx,1)}>+1</button>}
              {m.concluida && <span style={{marginLeft:12,color:'#00c851',fontWeight:'bold'}}>Concluída!</span>}
            </li>
          ))}
        </ul>
      )}
      <p style={{fontSize:13,marginTop:8}}>Complete todas as missões do dia para aumentar seu streak!</p>
    </div>
  );
}
