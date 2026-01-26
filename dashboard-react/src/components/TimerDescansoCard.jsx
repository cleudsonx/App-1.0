import React, { useState } from 'react';

// Widget: Timer de Descanso
const TimerDescansoCard = () => {
  const [segundos, setSegundos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const iniciarTimer = () => {
    if (!ativo) {
      setAtivo(true);
      setIntervalId(setInterval(() => {
        setSegundos(s => s + 1);
      }, 1000));
    }
  };

  const pausarTimer = () => {
    setAtivo(false);
    clearInterval(intervalId);
  };

  const resetarTimer = () => {
    setAtivo(false);
    clearInterval(intervalId);
    setSegundos(0);
  };

  return (
    <div className="dashboard-widget widget-card card-timer">
      <span role="img" aria-label="Ícone">⏱️</span>
      <h3>Timer de Descanso</h3>
      <div>
        <p>Tempo: {segundos} segundos</p>
        <button className="btn-primary" onClick={iniciarTimer} disabled={ativo}>Iniciar</button>
        <button className="btn-secondary" onClick={pausarTimer} disabled={!ativo}>Pausar</button>
        <button className="btn-secondary" onClick={resetarTimer}>Resetar</button>
      </div>
    </div>
  );
};

export default TimerDescansoCard;
