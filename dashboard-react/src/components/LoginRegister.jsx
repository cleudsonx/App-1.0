import '../login-register.css';
import React, { useState } from 'react';
import OnboardingProfile from './OnboardingProfile';

const API = {
  login: 'https://ml-service.onrender.com/auth/login',
  register: 'https://ml-service.onrender.com/auth/registro'
};

export default function LoginRegister({ onAuth }) {
  const [step, setStep] = useState('welcome'); // welcome | login | register | onboarding | onboarding-profile
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, senha: form.senha })
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        onAuth(data);
      } else {
        setError(data.detail || 'Login inválido');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        setUserData(data);
        setStep('onboarding-profile');
      } else {
        setError(data.detail || 'Cadastro inválido');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
    setLoading(false);
  }

  return (
    <div className="login-register-root">
      {step === 'welcome' && (
        <div className="welcome">
          <h2>Bem-vindo ao APP Trainer!</h2>
          <button onClick={() => setStep('login')}>Já tenho conta</button>
          <button onClick={() => setStep('register')}>Sou novo por aqui</button>
        </div>
      )}
      {step === 'login' && (
        <form className="login-form" onSubmit={handleLogin}>
          <h3>Login</h3>
          <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
          <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required autocomplete="current-password" />
          <button type="submit" disabled={loading}>Entrar</button>
          <button type="button" onClick={() => setStep('welcome')}>Voltar</button>
          {error && <div className="error">{error}</div>}
        </form>
      )}
      {step === 'register' && (
        <form className="register-form" onSubmit={handleRegister}>
          <h3>Cadastro</h3>
          <input name="nome" type="text" placeholder="Nome" value={form.nome} onChange={handleChange} required />
          <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
          <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required autocomplete="new-password" />
          <button type="submit" disabled={loading}>Cadastrar</button>
          <button type="button" onClick={() => setStep('welcome')}>Voltar</button>
          {error && <div className="error">{error}</div>}
        </form>
      )}
      {step === 'onboarding-profile' && (
        <OnboardingProfile onFinish={perfil => {
          // Salva perfil no localStorage e autentica usuário
          localStorage.setItem('dashboard_perfil', JSON.stringify(perfil));
          localStorage.setItem('dashboard_onboarding', 'ok');
          if (userData) {
            localStorage.setItem('dashboard_user', JSON.stringify(userData));
            onAuth(userData);
          }
        }} />
      )}
    </div>
  );
}
