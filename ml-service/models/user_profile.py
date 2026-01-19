"""
Sistema de Gerenciamento de Perfil do Usuário
Armazena histórico, preferências e aprende com interações
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib

@dataclass
class Interacao:
    """Registro de uma interação com o usuário"""
    timestamp: str
    pergunta: str
    resposta: str
    topicos: List[str]
    feedback: Optional[float] = None  # 0-1, None se não avaliado
    contexto: Optional[Dict] = None

@dataclass 
class TreinoRealizado:
    """Registro de um treino realizado"""
    data: str
    dia_treino: str
    exercicios_realizados: List[Dict]
    feedback: float  # 0-1
    observacoes: str
    duracao_minutos: int

@dataclass
class PerfilCompleto:
    """Perfil completo do usuário com histórico"""
    # Identificação
    id: str
    nome: str
    email: Optional[str] = None
    senha_hash: Optional[str] = None  # Hash da senha para autenticação
    
    # Dados físicos
    idade: int = 25
    peso: float = 70.0
    altura: float = 170.0
    sexo: str = "M"
    
    # Objetivos
    objetivo_principal: str = "hipertrofia"
    objetivos_secundarios: List[str] = None
    
    # Experiência
    nivel: str = "iniciante"  # iniciante, intermediario, avancado
    tempo_treino_meses: int = 0
    
    # Disponibilidade
    dias_disponiveis: int = 3
    tempo_por_treino_minutos: int = 60
    horario_preferido: str = "manha"  # manha, tarde, noite
    
    # Limitações e condições
    limitacoes: List[str] = None
    condicoes_medicas: List[str] = None
    
    # Equipamentos disponíveis
    equipamentos: List[str] = None
    treina_em: str = "academia"  # academia, casa, ar_livre
    
    # Preferências de treino
    exercicios_favoritos: List[str] = None
    exercicios_evitar: List[str] = None
    prefere_compostos: bool = True
    
    # Histórico
    historico_interacoes: List[Dict] = None
    historico_treinos: List[Dict] = None
    
    # Métricas de progresso
    progressos: List[Dict] = None  # peso, medidas, cargas
    
    # Treino atual salvo
    treino_atual: Optional[Dict] = None
    
    # Status do perfil
    perfil_completo: bool = False  # Indica se preencheu avaliação
    
    # Metadados
    criado_em: str = None
    atualizado_em: str = None
    
    def __post_init__(self):
        if self.limitacoes is None:
            self.limitacoes = []
        if self.condicoes_medicas is None:
            self.condicoes_medicas = []
        if self.equipamentos is None:
            self.equipamentos = ["barra", "halteres", "maquinas", "cabos"]
        if self.exercicios_favoritos is None:
            self.exercicios_favoritos = []
        if self.exercicios_evitar is None:
            self.exercicios_evitar = []
        if self.objetivos_secundarios is None:
            self.objetivos_secundarios = []
        if self.historico_interacoes is None:
            self.historico_interacoes = []
        if self.historico_treinos is None:
            self.historico_treinos = []
        if self.progressos is None:
            self.progressos = []
        if self.criado_em is None:
            self.criado_em = datetime.now().isoformat()
        self.atualizado_em = datetime.now().isoformat()


class GerenciadorPerfil:
    """
    Gerencia perfis de usuários com persistência e aprendizado
    """
    
    def __init__(self, data_dir: str = "data/users"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.perfis_cache: Dict[str, PerfilCompleto] = {}
        print(f"[OK] Gerenciador de Perfil inicializado em {self.data_dir}")
    
    def _gerar_id(self, nome: str, email: str = None) -> str:
        """Gera ID único para o usuário"""
        base = f"{nome}_{email or 'anonimo'}_{datetime.now().timestamp()}"
        return hashlib.md5(base.encode()).hexdigest()[:12]
    
    def criar_perfil(self, dados: Dict) -> PerfilCompleto:
        """
        Cria um novo perfil de usuário
        
        Args:
            dados: Dicionário com dados do usuário
            
        Returns:
            Perfil criado
        """
        user_id = self._gerar_id(dados.get("nome", "Usuario"), dados.get("email"))
        
        perfil = PerfilCompleto(
            id=user_id,
            nome=dados.get("nome", "Usuário"),
            email=dados.get("email"),
            senha_hash=dados.get("senha_hash"),
            idade=dados.get("idade", 25),
            peso=dados.get("peso", 70.0),
            altura=dados.get("altura", 170.0),
            sexo=dados.get("sexo", "M"),
            objetivo_principal=dados.get("objetivo", "hipertrofia"),
            nivel=dados.get("nivel", "iniciante"),
            dias_disponiveis=dados.get("dias", 3),
            tempo_por_treino_minutos=dados.get("tempo", 60),
            limitacoes=dados.get("limitacoes", []),
            equipamentos=dados.get("equipamentos", ["barra", "halteres", "maquinas", "cabos"]),
            treina_em=dados.get("local", "academia"),
            horario_preferido=dados.get("horario_preferido", "noite"),
            exercicios_favoritos=dados.get("exercicios_preferidos", []),
            exercicios_evitar=dados.get("exercicios_evitar", []),
            perfil_completo=dados.get("perfil_completo", False)
        )
        
        self._salvar_perfil(perfil)
        self.perfis_cache[user_id] = perfil
        
        print(f"✅ Perfil criado: {user_id} - {perfil.nome}")
        return perfil
    
    def excluir_perfil(self, user_id: str) -> bool:
        """
        Exclui um perfil permanentemente
        
        Args:
            user_id: ID do usuário
            
        Returns:
            True se excluído com sucesso
        """
        # Remover do cache
        if user_id in self.perfis_cache:
            del self.perfis_cache[user_id]
        
        # Remover arquivo do disco
        filepath = self.data_dir / f"{user_id}.json"
        if filepath.exists():
            filepath.unlink()
            print(f"🗑️ Perfil excluído: {user_id}")
            return True
        
        return False
    
    def obter_perfil(self, user_id: str) -> Optional[PerfilCompleto]:
        """
        Obtém perfil por ID
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Perfil ou None
        """
        # Verificar cache
        if user_id in self.perfis_cache:
            return self.perfis_cache[user_id]
        
        # Carregar do disco
        filepath = self.data_dir / f"{user_id}.json"
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                dados = json.load(f)
                perfil = PerfilCompleto(**dados)
                self.perfis_cache[user_id] = perfil
                return perfil
        
        return None
    
    def atualizar_perfil(self, user_id: str, atualizacoes: Dict) -> Optional[PerfilCompleto]:
        """
        Atualiza dados do perfil
        
        Args:
            user_id: ID do usuário
            atualizacoes: Campos a atualizar
            
        Returns:
            Perfil atualizado
        """
        perfil = self.obter_perfil(user_id)
        if not perfil:
            return None
        
        # Aplicar atualizações
        for key, value in atualizacoes.items():
            if hasattr(perfil, key):
                setattr(perfil, key, value)
        
        perfil.atualizado_em = datetime.now().isoformat()
        
        self._salvar_perfil(perfil)
        self.perfis_cache[user_id] = perfil
        
        return perfil
    
    def registrar_interacao(self, user_id: str, interacao: Interacao) -> bool:
        """
        Registra uma interação no histórico do usuário
        
        Args:
            user_id: ID do usuário
            interacao: Dados da interação
            
        Returns:
            Sucesso
        """
        perfil = self.obter_perfil(user_id)
        if not perfil:
            return False
        
        perfil.historico_interacoes.append(asdict(interacao))
        
        # Manter apenas últimas 100 interações
        if len(perfil.historico_interacoes) > 100:
            perfil.historico_interacoes = perfil.historico_interacoes[-100:]
        
        self._salvar_perfil(perfil)
        return True
    
    def registrar_treino(self, user_id: str, treino: TreinoRealizado) -> bool:
        """
        Registra um treino realizado
        
        Args:
            user_id: ID do usuário
            treino: Dados do treino
            
        Returns:
            Sucesso
        """
        perfil = self.obter_perfil(user_id)
        if not perfil:
            return False
        
        perfil.historico_treinos.append(asdict(treino))
        
        # Manter últimos 365 treinos (1 ano)
        if len(perfil.historico_treinos) > 365:
            perfil.historico_treinos = perfil.historico_treinos[-365:]
        
        self._salvar_perfil(perfil)
        return True
    
    def registrar_progresso(self, user_id: str, progresso: Dict) -> bool:
        """
        Registra progresso (peso, medidas, cargas)
        
        Args:
            user_id: ID do usuário
            progresso: Dados do progresso
            
        Returns:
            Sucesso
        """
        perfil = self.obter_perfil(user_id)
        if not perfil:
            return False
        
        progresso["data"] = datetime.now().isoformat()
        perfil.progressos.append(progresso)
        
        # Atualizar peso se fornecido
        if "peso" in progresso:
            perfil.peso = progresso["peso"]
        
        self._salvar_perfil(perfil)
        return True
    
    def obter_estatisticas(self, user_id: str) -> Dict:
        """
        Calcula estatísticas do usuário
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Dicionário com estatísticas
        """
        perfil = self.obter_perfil(user_id)
        if not perfil:
            return {}
        
        treinos = perfil.historico_treinos
        
        # Total de treinos
        total_treinos = len(treinos)
        
        # Frequência média (treinos por semana no último mês)
        treinos_ultimo_mes = [
            t for t in treinos 
            if self._dias_atras(t.get("data", "")) <= 30
        ]
        freq_semanal = len(treinos_ultimo_mes) / 4.3  # semanas em um mês
        
        # Feedback médio
        feedbacks = [t.get("feedback", 0.7) for t in treinos if t.get("feedback")]
        feedback_medio = sum(feedbacks) / len(feedbacks) if feedbacks else 0.7
        
        # Grupos mais treinados
        grupos_count = {}
        for treino in treinos:
            for ex in treino.get("exercicios_realizados", []):
                grupo = ex.get("grupo", "outros")
                grupos_count[grupo] = grupos_count.get(grupo, 0) + 1
        
        grupos_favoritos = sorted(grupos_count.items(), key=lambda x: -x[1])[:3]
        
        # Progresso de peso
        if len(perfil.progressos) >= 2:
            peso_inicial = perfil.progressos[0].get("peso", perfil.peso)
            peso_atual = perfil.progressos[-1].get("peso", perfil.peso)
            variacao_peso = peso_atual - peso_inicial
        else:
            variacao_peso = 0
        
        return {
            "total_treinos": total_treinos,
            "frequencia_semanal": round(freq_semanal, 1),
            "feedback_medio": round(feedback_medio, 2),
            "grupos_favoritos": grupos_favoritos,
            "variacao_peso": round(variacao_peso, 1),
            "dias_desde_ultimo_treino": self._dias_desde_ultimo_treino(treinos),
            "nivel_consistencia": self._calcular_consistencia(treinos_ultimo_mes, perfil.dias_disponiveis)
        }
    
    def _dias_atras(self, data_str: str) -> int:
        """Calcula quantos dias atrás foi uma data"""
        try:
            data = datetime.fromisoformat(data_str.replace("Z", "+00:00"))
            return (datetime.now() - data.replace(tzinfo=None)).days
        except:
            return 999
    
    def _dias_desde_ultimo_treino(self, treinos: List[Dict]) -> int:
        """Calcula dias desde o último treino"""
        if not treinos:
            return 999
        
        ultimo = treinos[-1].get("data", "")
        return self._dias_atras(ultimo)
    
    def _calcular_consistencia(self, treinos_mes: List[Dict], dias_esperados: int) -> str:
        """Calcula nível de consistência"""
        treinos_esperados = dias_esperados * 4.3  # treinos esperados no mês
        realizados = len(treinos_mes)
        
        if realizados >= treinos_esperados * 0.9:
            return "excelente"
        elif realizados >= treinos_esperados * 0.7:
            return "bom"
        elif realizados >= treinos_esperados * 0.5:
            return "regular"
        else:
            return "precisa melhorar"
    
    def inferir_preferencias(self, user_id: str) -> Dict:
        """
        Infere preferências do usuário baseado no histórico
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Preferências inferidas
        """
        perfil = self.obter_perfil(user_id)
        if not perfil:
            return {}
        
        interacoes = perfil.historico_interacoes
        treinos = perfil.historico_treinos
        
        # Tópicos mais perguntados
        topicos_count = {}
        for inter in interacoes:
            for topico in inter.get("topicos", []):
                topicos_count[topico] = topicos_count.get(topico, 0) + 1
        
        interesses = sorted(topicos_count.items(), key=lambda x: -x[1])[:5]
        
        # Exercícios com melhor feedback
        exercicios_feedback = {}
        for treino in treinos:
            feedback_treino = treino.get("feedback", 0.7)
            for ex in treino.get("exercicios_realizados", []):
                nome = ex.get("nome", "")
                if nome:
                    if nome not in exercicios_feedback:
                        exercicios_feedback[nome] = []
                    exercicios_feedback[nome].append(feedback_treino)
        
        exercicios_preferidos = []
        exercicios_evitar = []
        
        for ex, feedbacks in exercicios_feedback.items():
            media = sum(feedbacks) / len(feedbacks)
            if media >= 0.8:
                exercicios_preferidos.append(ex)
            elif media <= 0.4:
                exercicios_evitar.append(ex)
        
        return {
            "interesses": [t[0] for t in interesses],
            "exercicios_preferidos": exercicios_preferidos,
            "exercicios_evitar": exercicios_evitar,
            "horario_mais_ativo": self._inferir_horario(interacoes),
            "nivel_engajamento": len(interacoes) / 30 if interacoes else 0  # interações por dia
        }
    
    def _inferir_horario(self, interacoes: List[Dict]) -> str:
        """Infere horário preferido baseado nas interações"""
        horarios = {"manha": 0, "tarde": 0, "noite": 0}
        
        for inter in interacoes:
            try:
                hora = datetime.fromisoformat(inter.get("timestamp", "")).hour
                if 5 <= hora < 12:
                    horarios["manha"] += 1
                elif 12 <= hora < 18:
                    horarios["tarde"] += 1
                else:
                    horarios["noite"] += 1
            except:
                pass
        
        return max(horarios.items(), key=lambda x: x[1])[0] if any(horarios.values()) else "manha"
    
    def _salvar_perfil(self, perfil: PerfilCompleto):
        """Salva perfil no disco"""
        filepath = self.data_dir / f"{perfil.id}.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(asdict(perfil), f, ensure_ascii=False, indent=2)
    
    def listar_perfis(self) -> List[Dict]:
        """Lista todos os perfis salvos"""
        perfis = []
        for filepath in self.data_dir.glob("*.json"):
            with open(filepath, 'r', encoding='utf-8') as f:
                dados = json.load(f)
                perfis.append({
                    "id": dados.get("id"),
                    "nome": dados.get("nome"),
                    "objetivo": dados.get("objetivo_principal"),
                    "nivel": dados.get("nivel"),
                    "criado_em": dados.get("criado_em")
                })
        return perfis


# Singleton
_gerenciador = None

def get_gerenciador_perfil() -> GerenciadorPerfil:
    """Retorna instância singleton do gerenciador de perfil"""
    global _gerenciador
    if _gerenciador is None:
        _gerenciador = GerenciadorPerfil()
    return _gerenciador
