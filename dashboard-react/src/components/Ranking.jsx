import React from 'react';

export default function Ranking({ usuarios }) {
  return (
    <div className="ranking-widget" style={{margin:16,padding:16,border:'1px solid #ccc',borderRadius:8}}>
      <h3>Ranking</h3>
      <ol>
        {usuarios.map((u, idx) => (
          <li key={u.id} style={{fontWeight:idx===0?'bold':'normal'}}>
            {idx+1}. {u.nome} {idx===0 && '👑'} - {u.pontos} pts
          </li>
        ))}
      </ol>
    </div>
  );
}
