import React, { useState, useEffect } from 'react';

const defaultSettings = {
  horario: '09:00',
  tipos: {
    missoes: true,
    desafios: true,
    conquistas: true,
    streaks: true
  },
  push: true
};

export default function NotificationSettings() {

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  // Busca user_id do localStorage
  const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');
  const userId = user.id || user.email || 'anon';

  // Buscar preferências do backend ao montar
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`https://app-1-0-python.onrender.com/api/notify-settings?user_id=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const backendSettings = await res.json();
          setSettings(backendSettings);
          localStorage.setItem('dashboard_notify_settings', JSON.stringify(backendSettings));
        } else {
          // fallback local
          const saved = localStorage.getItem('dashboard_notify_settings');
          setSettings(saved ? JSON.parse(saved) : defaultSettings);
        }
      } catch {
        const saved = localStorage.getItem('dashboard_notify_settings');
        setSettings(saved ? JSON.parse(saved) : defaultSettings);
      }
      setLoading(false);
    }
    fetchSettings();
    // eslint-disable-next-line
  }, [userId]);


  // Salvar preferências no backend e localStorage ao alterar
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('dashboard_notify_settings', JSON.stringify(settings));
      fetch('https://app-1-0-python.onrender.com/api/notify-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, settings })
      }).catch(() => {});
    }
  }, [settings, userId, loading]);

  function handleTipoChange(tipo) {
    setSettings(s => ({ ...s, tipos: { ...s.tipos, [tipo]: !s.tipos[tipo] } }));
  }

  function handleHorarioChange(e) {
    setSettings(s => ({ ...s, horario: e.target.value }));
  }

  function handlePushChange(e) {
    setSettings(s => ({ ...s, push: e.target.checked }));
  }

  if (loading) {
    return <div className="dashboard-widget widget-card card-notify-settings" style={{maxWidth:400,margin:'24px auto',textAlign:'center'}}>
      <span role="img" aria-label="Notificações">🔔</span>
      <p>Carregando preferências...</p>
    </div>;
  }
  return (
    <div className="dashboard-widget widget-card card-notify-settings" style={{maxWidth:400,margin:'24px auto'}}>
      <span role="img" aria-label="Notificações">🔔</span>
      <h3>Configurações de Notificações</h3>
      <div style={{marginBottom:12}}>
        <label>
          <input type="checkbox" checked={settings.push} onChange={handlePushChange} /> Ativar notificações push
        </label>
      </div>
      <div style={{marginBottom:12}}>
        <label>Horário do lembrete diário: </label>
        <input type="time" value={settings.horario} onChange={handleHorarioChange} style={{marginLeft:8}} />
      </div>
      <div>
        <b>Tipos de notificação:</b>
        <div>
          <label><input type="checkbox" checked={settings.tipos.missoes} onChange={()=>handleTipoChange('missoes')} /> Missões diárias</label>
        </div>
        <div>
          <label><input type="checkbox" checked={settings.tipos.desafios} onChange={()=>handleTipoChange('desafios')} /> Desafios</label>
        </div>
        <div>
          <label><input type="checkbox" checked={settings.tipos.conquistas} onChange={()=>handleTipoChange('conquistas')} /> Conquistas</label>
        </div>
        <div>
          <label><input type="checkbox" checked={settings.tipos.streaks} onChange={()=>handleTipoChange('streaks')} /> Streaks</label>
        </div>
      </div>
      <p style={{fontSize:13,marginTop:12}}>Essas preferências afetam os lembretes e notificações automáticas do app.</p>
    </div>
  );
}
