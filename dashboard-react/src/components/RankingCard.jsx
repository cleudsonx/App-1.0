import React, { useState } from 'react';

// Ranking mock semanal
const rankingMock = [
  { nome: 'Você', pontos: 120, pos: 2 },
  { nome: 'Ana', pontos: 150, pos: 1 },
  { nome: 'Carlos', pontos: 110, pos: 3 },
  { nome: 'Bruna', pontos: 90, pos: 4 },
  { nome: 'Lucas', pontos: 80, pos: 5 }
];
// Ranking mock de desafios
const rankingDesafiosMock = [
  { nome: 'Você', desafios: 7, pos: 3 },
  { nome: 'Ana', desafios: 12, pos: 1 },
  { nome: 'Carlos', desafios: 9, pos: 2 },
  { nome: 'Bruna', desafios: 5, pos: 4 },
  { nome: 'Lucas', desafios: 3, pos: 5 }
];

export default function RankingCard({ ranking = rankingMock, rankingDesafios = rankingDesafiosMock }) {
  const [aba, setAba] = useState('semanal');
  return (
    <div className="dashboard-widget widget-card card-ranking">
      <span role="img" aria-label="Ranking">🏅</span>
      <h3>Ranking</h3>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <button onClick={()=>setAba('semanal')} style={{fontWeight:aba==='semanal'?'bold':'normal',background:aba==='semanal'?'#e3e3e3':'#fafafa',borderRadius:6,padding:'2px 10px'}}>Semanal</button>
        <button onClick={()=>setAba('desafios')} style={{fontWeight:aba==='desafios'?'bold':'normal',background:aba==='desafios'?'#e3e3e3':'#fafafa',borderRadius:6,padding:'2px 10px'}}>Desafios</button>
      </div>
      {aba==='semanal' ? (
        <>
          <ol style={{paddingLeft:24}}>
            {ranking.sort((a,b)=>a.pos-b.pos).map((r,idx) => (
              <li key={idx} style={{fontWeight: r.nome==='Você'?'bold':'normal', color: r.nome==='Você'?'#007bff':'inherit'}}>
                {r.pos}º {r.nome} — {r.pontos} pts
              </li>
            ))}
          </ol>
          <p style={{fontSize:13,marginTop:8}}>Pontue treinando e suba no ranking!</p>
        </>
      ) : (
        <>
          <ol style={{paddingLeft:24}}>
            {rankingDesafios.sort((a,b)=>a.pos-b.pos).map((r,idx) => (
              <li key={idx} style={{fontWeight: r.nome==='Você'?'bold':'normal', color: r.nome==='Você'?'#00c851':'inherit'}}>
                {r.pos}º {r.nome} — {r.desafios} desafios concluídos
              </li>
            ))}
          </ol>
          <p style={{fontSize:13,marginTop:8}}>Complete desafios para subir no ranking!</p>
        </>
      )}
    </div>
  );
}
