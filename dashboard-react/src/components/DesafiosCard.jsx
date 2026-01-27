import React, { useState } from 'react';

const desafiosMock = [
  { id: 1, titulo: '7 dias de treino seguido', meta: 7, progresso: 4, recompensa: '🔥 Badge Foco Total' },
  { id: 2, titulo: '30 treinos no mês', meta: 30, progresso: 18, recompensa: '🏅 Badge Consistência' },
  { id: 3, titulo: '5 treinos de pernas', meta: 5, progresso: 5, recompensa: '💪 Badge Perna Forte' }
];


export default function DesafiosCard({ desafios }) {
  const [userDesafios, setUserDesafios] = useState(() => {
    const saved = localStorage.getItem('dashboard_user_desafios');
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState({ titulo: '', meta: 1, recompensa: '' });
  const allDesafios = desafios || desafiosMock;

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleAdd(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.recompensa.trim()) return;
    const novo = {
      id: Date.now(),
      titulo: form.titulo,
      meta: Number(form.meta),
      progresso: 0,
      recompensa: form.recompensa
    };
    const novos = [...userDesafios, novo];
    setUserDesafios(novos);
    localStorage.setItem('dashboard_user_desafios', JSON.stringify(novos));
    setForm({ titulo: '', meta: 1, recompensa: '' });
  }
  function handleProgresso(id) {
    const novos = userDesafios.map(d => d.id === id ? { ...d, progresso: Math.min(d.meta, d.progresso + 1) } : d);
    setUserDesafios(novos);
    localStorage.setItem('dashboard_user_desafios', JSON.stringify(novos));
  }

  return (
    <div className="dashboard-widget widget-card card-desafios">
      <span role="img" aria-label="Desafios">🔥</span>
      <h3>Desafios Fitness</h3>
      <form onSubmit={handleAdd} style={{marginBottom:16, background:'#f3f3f3', borderRadius:8, padding:8}}>
        <input name="titulo" placeholder="Novo desafio (ex: 10 treinos)" value={form.titulo} onChange={handleChange} required style={{marginRight:8}} />
        <input name="meta" type="number" min="1" max="100" value={form.meta} onChange={handleChange} required style={{width:60,marginRight:8}} />
        <input name="recompensa" placeholder="Recompensa (ex: 🏅 Badge)" value={form.recompensa} onChange={handleChange} required style={{marginRight:8}} />
        <button type="submit">Criar</button>
      </form>
      <ul style={{paddingLeft:0}}>
        {[...allDesafios, ...userDesafios].map(d => (
          <li key={d.id} style={{marginBottom:12, listStyle:'none', background:'#f7f7f7', borderRadius:8, padding:8, position:'relative'}}>
            <strong>{d.titulo}</strong> <span style={{float:'right'}}>{d.progresso}/{d.meta}</span>
            <div style={{height:8, background:'#eee', borderRadius:4, margin:'6px 0'}}>
              <div style={{width:`${Math.min(100,100*d.progresso/d.meta)}%`, height:8, background:d.progresso>=d.meta?'#00c851':'#007bff', borderRadius:4, transition:'width .3s'}}></div>
            </div>
            <span style={{fontSize:13}}>
              Recompensa: <span style={{fontWeight:'bold'}}>{d.recompensa}</span>
              {d.progresso>=d.meta && <span style={{marginLeft:8, color:'#00c851'}}>Concluído!</span>}
            </span>
            {userDesafios.some(ud => ud.id === d.id) && d.progresso < d.meta && (
              <button style={{position:'absolute',right:8,top:8}} onClick={() => handleProgresso(d.id)} title="Adicionar progresso">+1</button>
            )}
          </li>
        ))}
      </ul>
      <p style={{fontSize:13,marginTop:8}}>Complete desafios e ganhe badges exclusivos!</p>
    </div>
  );
}
