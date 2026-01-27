import React, { useState } from 'react';

const desafiosMock = [
  { id: 1, titulo: '7 dias de treino seguido', meta: 7, progresso: 4, recompensa: '🔥 Badge Foco Total' },
  { id: 2, titulo: '30 treinos no mês', meta: 30, progresso: 18, recompensa: '🏅 Badge Consistência' },
  { id: 3, titulo: '5 treinos de pernas', meta: 5, progresso: 5, recompensa: '💪 Badge Perna Forte' }
];

export default function DesafiosCard({ desafios = desafiosMock }) {
  return (
    <div className="dashboard-widget widget-card card-desafios">
      <span role="img" aria-label="Desafios">🔥</span>
      <h3>Desafios Fitness</h3>
      <ul style={{paddingLeft:0}}>
        {desafios.map(d => (
          <li key={d.id} style={{marginBottom:12, listStyle:'none', background:'#f7f7f7', borderRadius:8, padding:8, position:'relative'}}>
            <strong>{d.titulo}</strong> <span style={{float:'right'}}>{d.progresso}/{d.meta}</span>
            <div style={{height:8, background:'#eee', borderRadius:4, margin:'6px 0'}}>
              <div style={{width:`${Math.min(100,100*d.progresso/d.meta)}%`, height:8, background:d.progresso>=d.meta?'#00c851':'#007bff', borderRadius:4, transition:'width .3s'}}></div>
            </div>
            <span style={{fontSize:13}}>
              Recompensa: <span style={{fontWeight:'bold'}}>{d.recompensa}</span>
              {d.progresso>=d.meta && <span style={{marginLeft:8, color:'#00c851'}}>Concluído!</span>}
            </span>
          </li>
        ))}
      </ul>
      <p style={{fontSize:13,marginTop:8}}>Complete desafios e ganhe badges exclusivos!</p>
    </div>
  );
}
