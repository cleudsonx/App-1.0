import React, { useEffect, useState } from 'react';

// Missões diárias e streaks
const missoesPadrao = [
  { id: 1, titulo: 'Complete 1 treino hoje', tipo: 'treino', meta: 1, recompensa: '🔥 +5 pontos', icone: '🔥' },
  { id: 2, titulo: 'Beba 2L de água', tipo: 'agua', meta: 2000, recompensa: '💧 +3 pontos', icone: '💧' },
  { id: 3, titulo: 'Registre uma refeição', tipo: 'refeicao', meta: 1, recompensa: '🍽️ +2 pontos', icone: '🍽️' }
];

export default function MissoesDiariasStreaks({ userId }) {
  const [missoes, setMissoes] = useState([]);
  const [streak, setStreak] = useState(0);
  const [hoje, setHoje] = useState(new Date().toLocaleDateString());

  // Carrega missões do localStorage ou inicializa
  useEffect(() => {
    const key = `missoes_${userId}_${hoje}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setMissoes(JSON.parse(saved));
    } else {
      setMissoes(missoesPadrao.map(m => ({ ...m, progresso: 0, concluida: false })));
    }
    // Streak
    const streakKey = `streak_${userId}`;
    setStreak(Number(localStorage.getItem(streakKey) || 0));
  }, [userId, hoje]);

  // Atualiza progresso de missão
  function atualizarMissao(idx, valor = 1) {
    setMissoes(missoes => {
      const novas = [...missoes];
      if (!novas[idx].concluida) {
        novas[idx].progresso += valor;
        if (novas[idx].progresso >= novas[idx].meta) {
          novas[idx].concluida = true;
        }
        localStorage.setItem(`missoes_${userId}_${hoje}`, JSON.stringify(novas));
      }
      return novas;
    });
  }

  // Checa streak ao completar todas
  useEffect(() => {
    if (missoes.length > 0 && missoes.every(m => m.concluida)) {
      const streakKey = `streak_${userId}`;
      const atual = Number(localStorage.getItem(streakKey) || 0);
      localStorage.setItem(streakKey, atual + 1);
      setStreak(atual + 1);
    }
  }, [missoes, userId]);

  return (
    <div className="dashboard-widget widget-card card-missoes">
      <span role="img" aria-label="Missões">🎯</span>
      <h3>Missões Diárias & Streak</h3>
      <div style={{marginBottom:8}}>
        <b>Streak:</b> <span style={{color:'#00c851',fontWeight:'bold'}}>{streak} 🔥</span> dias seguidos
      </div>
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
      <p style={{fontSize:13,marginTop:8}}>Complete todas as missões do dia para aumentar seu streak!</p>
    </div>
  );
}
