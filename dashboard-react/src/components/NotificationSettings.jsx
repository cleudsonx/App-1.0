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
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dashboard_notify_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dashboard_notify_settings', JSON.stringify(settings));
  }, [settings]);

  function handleTipoChange(tipo) {
    setSettings(s => ({ ...s, tipos: { ...s.tipos, [tipo]: !s.tipos[tipo] } }));
  }

  function handleHorarioChange(e) {
    setSettings(s => ({ ...s, horario: e.target.value }));
  }

  function handlePushChange(e) {
    setSettings(s => ({ ...s, push: e.target.checked }));
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
