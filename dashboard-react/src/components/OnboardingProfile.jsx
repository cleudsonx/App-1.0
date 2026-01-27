import React, { useState } from 'react';

const objetivos = [
  'Hipertrofia',
  'Emagrecimento',
  'Resistência',
  'Saúde geral',
  'Performance'
];
const niveis = ['Iniciante', 'Intermediário', 'Avançado'];

export default function OnboardingProfile({ onFinish }) {
  const [step, setStep] = useState(0);
  const [perfil, setPerfil] = useState({
    idade: '',
    sexo: '',
    objetivo: objetivos[0],
    nivel: niveis[0],
    dias: 3,
    tempo: 60
  });

  function handleChange(e) {
    setPerfil(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function next() {
    setStep(s => s + 1);
  }
  function prev() {
    setStep(s => s - 1);
  }

  function handleFinish() {
    // Aqui pode-se enviar o perfil para o backend futuramente
    onFinish(perfil);
  }

  return (
    <div className="onboarding-profile-root">
      <h3>Personalize seu perfil</h3>
      {step === 0 && (
        <div>
          <label>Idade:<br />
            <input name="idade" type="number" min="10" max="99" value={perfil.idade} onChange={handleChange} required />
          </label>
          <br />
          <label>Sexo:<br />
            <select name="sexo" value={perfil.sexo} onChange={handleChange} required>
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </label>
          <br />
          <button onClick={next} disabled={!perfil.idade || !perfil.sexo}>Próximo</button>
        </div>
      )}
      {step === 1 && (
        <div>
          <label>Objetivo principal:<br />
            <select name="objetivo" value={perfil.objetivo} onChange={handleChange}>
              {objetivos.map(obj => <option key={obj} value={obj}>{obj}</option>)}
            </select>
          </label>
          <br />
          <label>Nível de experiência:<br />
            <select name="nivel" value={perfil.nivel} onChange={handleChange}>
              {niveis.map(nv => <option key={nv} value={nv}>{nv}</option>)}
            </select>
          </label>
          <br />
          <button onClick={prev}>Voltar</button>
          <button onClick={next}>Próximo</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <label>Dias por semana de treino:<br />
            <input name="dias" type="number" min="1" max="7" value={perfil.dias} onChange={handleChange} />
          </label>
          <br />
          <label>Duração média do treino (min):<br />
            <input name="tempo" type="number" min="20" max="180" value={perfil.tempo} onChange={handleChange} />
          </label>
          <br />
          <button onClick={prev}>Voltar</button>
          <button onClick={handleFinish}>Finalizar</button>
        </div>
      )}
    </div>
  );
}
