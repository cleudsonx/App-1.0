// Função para compartilhar desafio
function shareDesafio(desafio) {
  const text = `🔥 Desafio: ${desafio.titulo}\nProgresso: ${desafio.progresso}/${desafio.meta}\nRecompensa: ${desafio.recompensa}`;
  const url = window.location.href;
  // Compartilhamento nativo
  if (navigator.share) {
    navigator.share({ text, title: 'Meu desafio fitness no APP Trainer!', url });
    return;
  }
  // WhatsApp
  const wa = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
  // Telegram
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  // X (Twitter)
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + '\n' + url)}`;
  // Copiar para área de transferência
  navigator.clipboard.writeText(text + '\n' + url);
  alert('Desafio copiado! Compartilhe onde quiser.');
  // Abrir opções
  window.open(wa, '_blank');
}
import React, { useState, useRef, useEffect } from 'react';
import { addFeedEvent } from '../utils/feed';
import { notificar } from '../utils/notify';

// Função utilitária para exportar evento .ics
function exportarICS(desafio) {
  const dtStart = new Date();
  dtStart.setHours(9, 0, 0, 0); // 9h da manhã
  const dtEnd = new Date(dtStart.getTime() + 60*60*1000); // 1h depois
  const pad = n => n.toString().padStart(2, '0');
  const formatDate = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${desafio.titulo}`,
    `DESCRIPTION:Desafio fitness - Meta: ${desafio.meta} | Recompensa: ${desafio.recompensa}`,
    `DTSTART:${formatDate(dtStart)}`,
    `DTEND:${formatDate(dtEnd)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `desafio-${desafio.id || desafio.titulo}.ics`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}
// Toast simples
function Toast({ msg, onClose }) {
  React.useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div style={{position:'fixed',bottom:32,right:32,zIndex:9999,background:'#222',color:'#fff',padding:'14px 28px',borderRadius:8,boxShadow:'0 2px 16px #0006',fontSize:16,animation:'fadein .4s'}}>
      {msg}
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}`}</style>
    </div>
  );
}

const desafiosMock = [
  { id: 1, titulo: '7 dias de treino seguido', meta: 7, progresso: 4, recompensa: '🔥 Badge Foco Total' },
  { id: 2, titulo: '30 treinos no mês', meta: 30, progresso: 18, recompensa: '🏅 Badge Consistência' },
  { id: 3, titulo: '5 treinos de pernas', meta: 5, progresso: 5, recompensa: '💪 Badge Perna Forte' }
];


export default function DesafiosCard({ desafios }) {
  const [userDesafios, setUserDesafios] = useState([]);
  const [form, setForm] = useState({ titulo: '', meta: 1, recompensa: '' });
  const [loadingSync, setLoadingSync] = useState(false);
  const [animAdd, setAnimAdd] = useState(false);
  const [animConcluido, setAnimConcluido] = useState({});
  const [animProgresso, setAnimProgresso] = useState({});
  const allDesafios = desafios || desafiosMock;
  const addRef = useRef();
  const [toast, setToast] = useState("");

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  async function handleAdd(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.recompensa.trim()) return;
    const novo = {
      id: Date.now(),
      titulo: form.titulo,
      meta: Number(form.meta),
      progresso: 0,
      recompensa: form.recompensa
    };
    setAnimAdd(true);
    setToast('Desafio criado!');
    setTimeout(() => setAnimAdd(false), 800);
    if (addRef.current) {
      addRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setLoadingSync(true);
    try {
      // Tenta salvar no backend Python
      const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');
      const res = await fetch('https://app-1-0-python.onrender.com/api/desafios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ ...novo, user_id: user.id || user.email || 'anon' })
      });
      if (!res.ok) throw new Error('Backend offline');
      const novos = [...userDesafios, novo];
      setUserDesafios(novos);
      localStorage.setItem('dashboard_user_desafios', JSON.stringify(novos));
    } catch (err) {
      // Fallback local
      const novos = [...userDesafios, novo];
      setUserDesafios(novos);
      localStorage.setItem('dashboard_user_desafios', JSON.stringify(novos));
      setToast('Desafio salvo localmente (offline)');
    } finally {
      setForm({ titulo: '', meta: 1, recompensa: '' });
      setLoadingSync(false);
    }
  }
  async function handleProgresso(id) {
    const novos = userDesafios.map(d => {
      if (d.id === id) {
        const novoProg = Math.min(d.meta, d.progresso + 1);
        if (novoProg === d.meta) {
          setAnimConcluido(a => ({ ...a, [id]: true }));
          setToast('Desafio concluído! Parabéns!');
          setTimeout(() => setAnimConcluido(a => ({ ...a, [id]: false })), 1200);
          // Registrar evento no feed e notificar
          const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');
          addFeedEvent({
            user_id: user.id || user.email || 'anon',
            tipo: 'desafio',
            descricao: `Desafio concluído: ${d.titulo}`,
            extras: { id: d.id, meta: d.meta, recompensa: d.recompensa }
          });
          notificar(`Desafio concluído: ${d.titulo}`, { title: 'Desafio Fitness' });
        } else {
          setAnimProgresso(a => ({ ...a, [id]: true }));
          setTimeout(() => setAnimProgresso(a => ({ ...a, [id]: false })), 600);
        }
        return { ...d, progresso: novoProg };
      }
      return d;
    });
    setUserDesafios(novos);
    localStorage.setItem('dashboard_user_desafios', JSON.stringify(novos));
    // Tenta atualizar progresso no backend
    try {
      const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');
      await fetch('https://app-1-0-python.onrender.com/api/desafios/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ desafio_id: id, progresso: novos.find(d => d.id === id)?.progresso, user_id: user.id || user.email || 'anon' })
      });
    } catch (err) {
      // Fallback: progresso só local
    }
  }
  // Buscar desafios do backend ao montar
  useEffect(() => {
    async function fetchDesafios() {
      setLoadingSync(true);
      try {
        const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');
        const res = await fetch('https://app-1-0-python.onrender.com/api/desafios?user_id=' + encodeURIComponent(user.id || user.email || 'anon'));
        if (!res.ok) throw new Error('Backend offline');
        const data = await res.json();
        setUserDesafios(data);
        localStorage.setItem('dashboard_user_desafios', JSON.stringify(data));
      } catch (err) {
        // Fallback local
        const saved = localStorage.getItem('dashboard_user_desafios');
        setUserDesafios(saved ? JSON.parse(saved) : []);
      } finally {
        setLoadingSync(false);
      }
    }
    fetchDesafios();
  }, []);

  return (
    <div className="dashboard-widget widget-card card-desafios">
      <Toast msg={toast} onClose={() => setToast("")} />
      {loadingSync && <div style={{position:'absolute',top:8,right:8,fontSize:13,color:'#007bff'}}>Sincronizando...</div>}
      <span role="img" aria-label="Desafios">🔥</span>
      <h3>Desafios Fitness</h3>
      <form onSubmit={handleAdd} style={{marginBottom:16, background:'#f3f3f3', borderRadius:8, padding:8, transition:'box-shadow .3s', boxShadow:animAdd?'0 0 12px #00c851':'none'}}>
        <input name="titulo" placeholder="Novo desafio (ex: 10 treinos)" value={form.titulo} onChange={handleChange} required style={{marginRight:8}} />
        <input name="meta" type="number" min="1" max="100" value={form.meta} onChange={handleChange} required style={{width:60,marginRight:8}} />
        <input name="recompensa" placeholder="Recompensa (ex: 🏅 Badge)" value={form.recompensa} onChange={handleChange} required style={{marginRight:8}} />
        <button type="submit">Criar</button>
      </form>
      <ul style={{paddingLeft:0}}>
        {[...allDesafios, ...userDesafios].map((d, idx) => (
          <li key={d.id} ref={idx === allDesafios.length + userDesafios.length - 1 ? addRef : null}
            style={{
              marginBottom:12,
              listStyle:'none',
              background:'#f7f7f7',
              borderRadius:8,
              padding:8,
              position:'relative',
              boxShadow: animConcluido[d.id] ? '0 0 16px #00c851' : animProgresso[d.id] ? '0 0 10px #007bff' : 'none',
              transition:'box-shadow .4s'
            }}>
            <strong>{d.titulo}</strong> <span style={{float:'right'}}>{d.progresso}/{d.meta}</span>
            <div style={{height:8, background:'#eee', borderRadius:4, margin:'6px 0', overflow:'hidden'}}>
              <div style={{
                width:`${Math.min(100,100*d.progresso/d.meta)}%`,
                height:8,
                background:d.progresso>=d.meta?'#00c851':'#007bff',
                borderRadius:4,
                transition:'width .3s, background .3s'
              }}></div>
            </div>
            <span style={{fontSize:13}}>
              Recompensa: <span style={{fontWeight:'bold'}}>{d.recompensa}</span>
              {d.progresso>=d.meta && (
                <>
                  <span style={{marginLeft:8, color:'#00c851', fontWeight:'bold', fontSize:15, animation:'pop .7s'}}>Concluído!</span>
                  <button title="Compartilhar desafio" onClick={() => shareDesafio(d)} style={{marginLeft:8, fontSize:16, cursor:'pointer'}}>🔗</button>
                  <a href={`https://wa.me/?text=${encodeURIComponent('🔥 Desafio: '+d.titulo+'\nProgresso: '+d.progresso+'/'+d.meta+'\nRecompensa: '+d.recompensa+'\n'+window.location.href)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{marginLeft:4,fontSize:17}}>🟢</a>
                  <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('🔥 Desafio: '+d.titulo+'\nProgresso: '+d.progresso+'/'+d.meta+'\nRecompensa: '+d.recompensa)}`} target="_blank" rel="noopener noreferrer" title="Telegram" style={{marginLeft:2,fontSize:17}}>🔵</a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('🔥 Desafio: '+d.titulo+'\nProgresso: '+d.progresso+'/'+d.meta+'\nRecompensa: '+d.recompensa+'\n'+window.location.href)}`} target="_blank" rel="noopener noreferrer" title="Compartilhar no X" style={{marginLeft:2,fontSize:17}}>✖️</a>
                </>
              )}
            </span>
            {userDesafios.some(ud => ud.id === d.id) && d.progresso < d.meta && (
              <>
                <button style={{position:'absolute',right:8,top:8,transition:'transform .2s',transform:animProgresso[d.id]?'scale(1.2)':'none'}} onClick={() => handleProgresso(d.id)} title="Adicionar progresso">+1</button>
                <button style={{position:'absolute',right:44,top:8,fontSize:15}} onClick={() => exportarICS(d)} title="Adicionar ao calendário">📅</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <style>{`
        @keyframes pop {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
      <p style={{fontSize:13,marginTop:8}}>Complete desafios e ganhe badges exclusivos!</p>
    </div>
  );
}
