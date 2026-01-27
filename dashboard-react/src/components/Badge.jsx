import React from 'react';

export default function Badge({ nome, descricao, icone }) {
  return (
    <div className="badge-widget" style={{display:'inline-block',margin:8,padding:8,border:'1px solid #ccc',borderRadius:8}}>
      <span style={{fontSize:32}}>{icone || '🏅'}</span>
      <div><b>{nome}</b></div>
      <div style={{fontSize:12,color:'#666'}}>{descricao}</div>
    </div>
  );
}
