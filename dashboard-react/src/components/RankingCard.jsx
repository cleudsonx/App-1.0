import React from 'react';

// Ranking mock semanal
const rankingMock = [
  { nome: 'Você', pontos: 120, pos: 2 },
  { nome: 'Ana', pontos: 150, pos: 1 },
  { nome: 'Carlos', pontos: 110, pos: 3 },
  { nome: 'Bruna', pontos: 90, pos: 4 },
  { nome: 'Lucas', pontos: 80, pos: 5 }
];

export default function RankingCard({ ranking = rankingMock }) {
  return (
    <div className="dashboard-widget widget-card card-ranking">
      <span role="img" aria-label="Ranking">🏅</span>
      <h3>Ranking Semanal</h3>
      <ol style={{paddingLeft:24}}>
        {ranking.sort((a,b)=>a.pos-b.pos).map((r,idx) => (
          <li key={idx} style={{fontWeight: r.nome==='Você'?'bold':'normal', color: r.nome==='Você'?'#007bff':'inherit'}}>
            {r.pos}º {r.nome} — {r.pontos} pts
          </li>
        ))}
      </ol>
      <p style={{fontSize:13,marginTop:8}}>Pontue treinando e suba no ranking!</p>
    </div>
  );
}
