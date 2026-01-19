"""
Rede Neural para Recomendação de Treinos Personalizados
Usa PyTorch para criar um modelo que aprende preferências do usuário
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Dict, List, Tuple, Optional
import json
import os
from dataclasses import dataclass
from enum import Enum

class Objetivo(Enum):
    HIPERTROFIA = 0
    FORCA = 1
    EMAGRECIMENTO = 2
    RESISTENCIA = 3
    CONDICIONAMENTO = 4

class NivelExperiencia(Enum):
    INICIANTE = 0
    INTERMEDIARIO = 1
    AVANCADO = 2

class GrupoMuscular(Enum):
    PEITO = 0
    COSTAS = 1
    OMBROS = 2
    BICEPS = 3
    TRICEPS = 4
    PERNAS = 5
    GLUTEOS = 6
    ABDOMEN = 7

@dataclass
class PerfilUsuario:
    """Perfil completo do usuário para o modelo"""
    objetivo: Objetivo
    nivel: NivelExperiencia
    idade: int
    peso: float
    altura: float
    dias_disponiveis: int
    tempo_por_treino: int  # minutos
    limitacoes: List[str]
    equipamentos_disponiveis: List[str]
    historico_feedback: List[Dict]  # Histórico de treinos e feedback

class TreinoRecommender(nn.Module):
    """
    Rede Neural para recomendação de treinos
    
    Arquitetura:
    - Input: Features do usuário (objetivo, nível, limitações, etc)
    - Hidden: Camadas densas com ReLU e Dropout
    - Output: Score para cada tipo de exercício/configuração
    """
    
    def __init__(self, input_size: int = 32, hidden_size: int = 64, output_size: int = 24):
        super(TreinoRecommender, self).__init__()
        
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Linear(hidden_size // 2, output_size),
            nn.Sigmoid()  # Scores entre 0 e 1
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)


class SistemaRecomendacao:
    """
    Sistema completo de recomendação de treinos com aprendizado
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = TreinoRecommender().to(self.device)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        self.criterion = nn.MSELoss()
        
        # Carregar modelo se existir
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            # Inicializar com pesos pré-treinados básicos
            self._initialize_pretrained()
        
        # Base de exercícios detalhada
        self.exercicios = self._init_exercicios()
        
        # Configurações de treino por objetivo
        self.configs_objetivo = self._init_configs()
        
        print(f"✅ Sistema de Recomendação inicializado no dispositivo: {self.device}")
    
    def _initialize_pretrained(self):
        """
        Inicializa o modelo com conhecimento básico de musculação
        Simula pré-treinamento com regras conhecidas
        """
        # Criar dados de treinamento sintéticos baseados em conhecimento especialista
        training_data = self._generate_expert_data()
        
        # Treinar por algumas épocas
        self.model.train()
        for epoch in range(50):
            total_loss = 0
            for features, targets in training_data:
                features = torch.FloatTensor(features).to(self.device)
                targets = torch.FloatTensor(targets).to(self.device)
                
                self.optimizer.zero_grad()
                outputs = self.model(features)
                loss = self.criterion(outputs, targets)
                loss.backward()
                self.optimizer.step()
                total_loss += loss.item()
        
        print(f"✅ Modelo pré-treinado com {len(training_data)} exemplos")
    
    def _generate_expert_data(self) -> List[Tuple[List[float], List[float]]]:
        """
        Gera dados de treinamento baseados em conhecimento especialista
        """
        data = []
        
        # Padrão: [objetivo(5), nivel(3), idade_norm, peso_norm, altura_norm, 
        #          dias(7), tempo_norm, limitacoes(8), equipamentos(5)]
        # Total: 5 + 3 + 1 + 1 + 1 + 7 + 1 + 8 + 5 = 32 features
        
        # Target: [grupos_musculares(8), series(1), reps(1), descanso(1), 
        #          exercicios_compostos(1), intensidade(1), frequencia(1), etc]
        # Total: 24 outputs
        
        # === INICIANTE HIPERTROFIA ===
        features = self._encode_perfil(
            objetivo=Objetivo.HIPERTROFIA,
            nivel=NivelExperiencia.INICIANTE,
            idade=25, peso=70, altura=175,
            dias=3, tempo=60,
            limitacoes=[],
            equipamentos=["barra", "halteres", "maquinas", "cabos"]
        )
        targets = [
            0.8, 0.8, 0.6, 0.5, 0.5, 0.9, 0.7, 0.5,  # grupos (8)
            0.5, 0.6, 0.5,  # séries, reps, descanso (3)
            0.7, 0.6, 0.4,  # compostos, intensidade, freq (3)
            0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5  # extras (10) = 24
        ]
        data.append((features, targets))
        
        # === INTERMEDIÁRIO HIPERTROFIA ===
        features = self._encode_perfil(
            objetivo=Objetivo.HIPERTROFIA,
            nivel=NivelExperiencia.INTERMEDIARIO,
            idade=28, peso=80, altura=180,
            dias=5, tempo=75,
            limitacoes=[],
            equipamentos=["barra", "halteres", "maquinas", "cabos", "peso_corpo"]
        )
        targets = [
            0.9, 0.9, 0.8, 0.7, 0.7, 0.95, 0.8, 0.6,  # grupos (8)
            0.7, 0.65, 0.5,  # séries, reps, descanso (3)
            0.6, 0.75, 0.7,  # compostos, intensidade, freq (3)
            0.6, 0.6, 0.7, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6  # extras (10) = 24
        ]
        data.append((features, targets))
        
        # === FORÇA ===
        features = self._encode_perfil(
            objetivo=Objetivo.FORCA,
            nivel=NivelExperiencia.INTERMEDIARIO,
            idade=30, peso=90, altura=178,
            dias=4, tempo=90,
            limitacoes=[],
            equipamentos=["barra", "halteres", "rack"]
        )
        targets = [
            0.8, 0.8, 0.6, 0.4, 0.4, 0.9, 0.5, 0.5,  # grupos (8)
            0.6, 0.3, 0.9,  # séries, reps, descanso (3)
            0.95, 0.9, 0.55,  # compostos, intensidade, freq (3)
            0.7, 0.7, 0.8, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7  # extras (10) = 24 total
        ]
        data.append((features, targets))
        
        # === EMAGRECIMENTO ===
        features = self._encode_perfil(
            objetivo=Objetivo.EMAGRECIMENTO,
            nivel=NivelExperiencia.INICIANTE,
            idade=35, peso=95, altura=170,
            dias=4, tempo=60,
            limitacoes=[],
            equipamentos=["barra", "halteres", "maquinas", "cabos", "peso_corpo"]
        )
        targets = [
            0.7, 0.7, 0.6, 0.5, 0.5, 0.8, 0.8, 0.7,  # grupos (8)
            0.5, 0.7, 0.3,  # séries, reps, descanso (3)
            0.6, 0.65, 0.55,  # compostos, intensidade, freq (3)
            0.8, 0.8, 0.5, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8  # extras (10) = 24
        ]
        data.append((features, targets))
        
        # === COM LIMITAÇÃO JOELHO ===
        features = self._encode_perfil(
            objetivo=Objetivo.HIPERTROFIA,
            nivel=NivelExperiencia.INTERMEDIARIO,
            idade=40, peso=85, altura=175,
            dias=4, tempo=60,
            limitacoes=["joelho"],
            equipamentos=["barra", "halteres", "maquinas", "cabos"]
        )
        targets = [
            0.9, 0.9, 0.8, 0.8, 0.8, 0.4, 0.6, 0.6,  # grupos (8)
            0.6, 0.7, 0.5,  # séries, reps, descanso (3)
            0.5, 0.6, 0.55,  # compostos, intensidade, freq (3)
            0.4, 0.4, 0.6, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4  # extras (10) = 24
        ]
        data.append((features, targets))
        
        # === COM LIMITAÇÃO OMBRO ===
        features = self._encode_perfil(
            objetivo=Objetivo.HIPERTROFIA,
            nivel=NivelExperiencia.INTERMEDIARIO,
            idade=32, peso=78, altura=180,
            dias=4, tempo=60,
            limitacoes=["ombro"],
            equipamentos=["barra", "halteres", "maquinas", "cabos"]
        )
        targets = [
            0.5, 0.8, 0.3, 0.7, 0.6, 0.9, 0.8, 0.6,  # grupos (8)
            0.5, 0.7, 0.5,  # séries, reps, descanso (3)
            0.4, 0.5, 0.55,  # compostos, intensidade, freq (3)
            0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5  # extras (10) = 24 total
        ]
        data.append((features, targets))
        
        # === RESISTÊNCIA ===
        features = self._encode_perfil(
            objetivo=Objetivo.RESISTENCIA,
            nivel=NivelExperiencia.INICIANTE,
            idade=28, peso=65, altura=168,
            dias=5, tempo=45,
            limitacoes=[],
            equipamentos=["peso_corpo", "halteres"]
        )
        targets = [
            0.6, 0.6, 0.5, 0.4, 0.4, 0.7, 0.6, 0.7,  # grupos (8)
            0.4, 0.85, 0.2,  # séries, reps, descanso (3)
            0.5, 0.5, 0.7,  # compostos, intensidade, freq (3)
            0.9, 0.9, 0.4, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9  # extras (10) = 24
        ]
        data.append((features, targets))
        
        # === IDOSO INICIANTE ===
        features = self._encode_perfil(
            objetivo=Objetivo.CONDICIONAMENTO,
            nivel=NivelExperiencia.INICIANTE,
            idade=60, peso=75, altura=170,
            dias=3, tempo=45,
            limitacoes=["joelho", "lombar"],
            equipamentos=["maquinas", "cabos", "peso_corpo"]
        )
        targets = [
            0.5, 0.5, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5,  # grupos (8)
            0.4, 0.7, 0.4,  # séries, reps, descanso (3)
            0.3, 0.4, 0.4,  # compostos, intensidade, freq (3)
            0.5, 0.5, 0.3, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5  # extras (10) = 24
        ]
        data.append((features, targets))
        
        return data
    
    def _encode_perfil(self, objetivo: Objetivo, nivel: NivelExperiencia,
                       idade: int, peso: float, altura: float,
                       dias: int, tempo: int,
                       limitacoes: List[str],
                       equipamentos: List[str]) -> List[float]:
        """
        Codifica um perfil de usuário em features numéricas
        """
        features = []
        
        # One-hot objetivo (5)
        obj_onehot = [0.0] * 5
        obj_onehot[objetivo.value] = 1.0
        features.extend(obj_onehot)
        
        # One-hot nível (3)
        nivel_onehot = [0.0] * 3
        nivel_onehot[nivel.value] = 1.0
        features.extend(nivel_onehot)
        
        # Idade normalizada (1)
        features.append((idade - 18) / (70 - 18))  # Normalizar entre 18-70
        
        # Peso normalizado (1)
        features.append((peso - 40) / (150 - 40))  # Normalizar entre 40-150kg
        
        # Altura normalizada (1)
        features.append((altura - 150) / (200 - 150))  # Normalizar entre 150-200cm
        
        # Dias disponíveis one-hot (7)
        dias_onehot = [0.0] * 7
        dias_onehot[min(dias - 1, 6)] = 1.0
        features.extend(dias_onehot)
        
        # Tempo por treino normalizado (1)
        features.append(tempo / 120)  # Normalizar até 120 min
        
        # Limitações (8 possíveis)
        limitacoes_map = ["joelho", "ombro", "lombar", "coluna", "punho", "cotovelo", "quadril", "tornozelo"]
        limitacoes_encoded = [1.0 if l in [lim.lower() for lim in limitacoes] else 0.0 for l in limitacoes_map]
        features.extend(limitacoes_encoded)
        
        # Equipamentos (5 possíveis)
        equip_map = ["barra", "halteres", "maquinas", "cabos", "peso_corpo"]
        equip_encoded = [1.0 if any(e in eq.lower() for eq in equipamentos) else 0.0 for e in equip_map]
        features.extend(equip_encoded)
        
        return features
    
    def _init_exercicios(self) -> Dict[str, List[Dict]]:
        """Base completa de exercícios"""
        return {
            "peito": [
                {"nome": "Supino Reto com Barra", "tipo": "composto", "dificuldade": 0.6, 
                 "equipamento": ["barra", "banco"], "contraindica": ["ombro"]},
                {"nome": "Supino Inclinado com Halteres", "tipo": "composto", "dificuldade": 0.5,
                 "equipamento": ["halteres", "banco"], "contraindica": []},
                {"nome": "Crucifixo na Máquina", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["maquinas"], "contraindica": ["ombro"]},
                {"nome": "Crossover no Cabo", "tipo": "isolador", "dificuldade": 0.4,
                 "equipamento": ["cabos"], "contraindica": []},
                {"nome": "Flexão de Braço", "tipo": "composto", "dificuldade": 0.4,
                 "equipamento": ["peso_corpo"], "contraindica": ["punho", "ombro"]},
                {"nome": "Supino na Máquina", "tipo": "composto", "dificuldade": 0.3,
                 "equipamento": ["maquinas"], "contraindica": []},
            ],
            "costas": [
                {"nome": "Remada Curvada com Barra", "tipo": "composto", "dificuldade": 0.7,
                 "equipamento": ["barra"], "contraindica": ["lombar"]},
                {"nome": "Puxada Frontal", "tipo": "composto", "dificuldade": 0.5,
                 "equipamento": ["cabos", "maquinas"], "contraindica": []},
                {"nome": "Remada Unilateral com Halter", "tipo": "composto", "dificuldade": 0.5,
                 "equipamento": ["halteres", "banco"], "contraindica": []},
                {"nome": "Remada no Cabo (Seated Row)", "tipo": "composto", "dificuldade": 0.4,
                 "equipamento": ["cabos"], "contraindica": []},
                {"nome": "Pulldown na Polia", "tipo": "composto", "dificuldade": 0.4,
                 "equipamento": ["cabos"], "contraindica": []},
                {"nome": "Barra Fixa", "tipo": "composto", "dificuldade": 0.8,
                 "equipamento": ["peso_corpo"], "contraindica": ["ombro"]},
            ],
            "pernas": [
                {"nome": "Agachamento Livre", "tipo": "composto", "dificuldade": 0.8,
                 "equipamento": ["barra"], "contraindica": ["joelho", "lombar"]},
                {"nome": "Leg Press 45°", "tipo": "composto", "dificuldade": 0.4,
                 "equipamento": ["maquinas"], "contraindica": []},
                {"nome": "Extensora", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["maquinas"], "contraindica": []},
                {"nome": "Mesa Flexora", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["maquinas"], "contraindica": []},
                {"nome": "Stiff com Barra", "tipo": "composto", "dificuldade": 0.6,
                 "equipamento": ["barra"], "contraindica": ["lombar"]},
                {"nome": "Afundo/Passada", "tipo": "composto", "dificuldade": 0.5,
                 "equipamento": ["halteres", "peso_corpo"], "contraindica": ["joelho"]},
                {"nome": "Cadeira Abdutora", "tipo": "isolador", "dificuldade": 0.2,
                 "equipamento": ["maquinas"], "contraindica": []},
                {"nome": "Panturrilha na Máquina", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["maquinas"], "contraindica": ["tornozelo"]},
            ],
            "ombros": [
                {"nome": "Desenvolvimento com Halteres", "tipo": "composto", "dificuldade": 0.5,
                 "equipamento": ["halteres"], "contraindica": ["ombro"]},
                {"nome": "Elevação Lateral", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["halteres", "cabos"], "contraindica": []},
                {"nome": "Elevação Frontal", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["halteres"], "contraindica": []},
                {"nome": "Face Pull", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["cabos"], "contraindica": []},
                {"nome": "Desenvolvimento na Máquina", "tipo": "composto", "dificuldade": 0.3,
                 "equipamento": ["maquinas"], "contraindica": []},
            ],
            "biceps": [
                {"nome": "Rosca Direta com Barra", "tipo": "isolador", "dificuldade": 0.4,
                 "equipamento": ["barra"], "contraindica": ["punho"]},
                {"nome": "Rosca Alternada com Halteres", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["halteres"], "contraindica": []},
                {"nome": "Rosca Scott", "tipo": "isolador", "dificuldade": 0.4,
                 "equipamento": ["barra", "banco"], "contraindica": ["cotovelo"]},
                {"nome": "Rosca no Cabo", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["cabos"], "contraindica": []},
                {"nome": "Rosca Martelo", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["halteres"], "contraindica": []},
            ],
            "triceps": [
                {"nome": "Tríceps Corda na Polia", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["cabos"], "contraindica": []},
                {"nome": "Tríceps Testa", "tipo": "isolador", "dificuldade": 0.5,
                 "equipamento": ["barra", "halteres"], "contraindica": ["cotovelo"]},
                {"nome": "Mergulho no Banco", "tipo": "composto", "dificuldade": 0.4,
                 "equipamento": ["banco", "peso_corpo"], "contraindica": ["ombro"]},
                {"nome": "Supino Fechado", "tipo": "composto", "dificuldade": 0.5,
                 "equipamento": ["barra", "banco"], "contraindica": []},
                {"nome": "Tríceps Francês", "tipo": "isolador", "dificuldade": 0.4,
                 "equipamento": ["halteres"], "contraindica": ["cotovelo"]},
            ],
            "gluteos": [
                {"nome": "Hip Thrust", "tipo": "composto", "dificuldade": 0.5,
                 "equipamento": ["barra", "banco"], "contraindica": []},
                {"nome": "Elevação Pélvica", "tipo": "isolador", "dificuldade": 0.2,
                 "equipamento": ["peso_corpo"], "contraindica": []},
                {"nome": "Abdução de Quadril", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["maquinas", "cabos"], "contraindica": ["quadril"]},
                {"nome": "Kickback no Cabo", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["cabos"], "contraindica": []},
            ],
            "abdomen": [
                {"nome": "Prancha", "tipo": "isométrico", "dificuldade": 0.4,
                 "equipamento": ["peso_corpo"], "contraindica": []},
                {"nome": "Abdominal Crunch", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["peso_corpo"], "contraindica": ["lombar"]},
                {"nome": "Abdominal Infra", "tipo": "isolador", "dificuldade": 0.4,
                 "equipamento": ["peso_corpo"], "contraindica": ["lombar"]},
                {"nome": "Abdominal na Máquina", "tipo": "isolador", "dificuldade": 0.3,
                 "equipamento": ["maquinas"], "contraindica": []},
                {"nome": "Prancha Lateral", "tipo": "isométrico", "dificuldade": 0.5,
                 "equipamento": ["peso_corpo"], "contraindica": []},
            ],
        }
    
    def _init_configs(self) -> Dict[Objetivo, Dict]:
        """Configurações base por objetivo"""
        return {
            Objetivo.HIPERTROFIA: {
                "series": (3, 4),
                "reps": (8, 12),
                "descanso": (60, 90),
                "compostos_ratio": 0.6,
                "intensidade": "moderada-alta"
            },
            Objetivo.FORCA: {
                "series": (4, 6),
                "reps": (1, 5),
                "descanso": (180, 300),
                "compostos_ratio": 0.9,
                "intensidade": "máxima"
            },
            Objetivo.EMAGRECIMENTO: {
                "series": (3, 4),
                "reps": (12, 15),
                "descanso": (30, 45),
                "compostos_ratio": 0.7,
                "intensidade": "moderada"
            },
            Objetivo.RESISTENCIA: {
                "series": (2, 3),
                "reps": (15, 25),
                "descanso": (20, 30),
                "compostos_ratio": 0.5,
                "intensidade": "baixa-moderada"
            },
            Objetivo.CONDICIONAMENTO: {
                "series": (2, 3),
                "reps": (12, 15),
                "descanso": (45, 60),
                "compostos_ratio": 0.5,
                "intensidade": "moderada"
            },
        }
    
    def recomendar_treino(self, perfil: PerfilUsuario) -> Dict:
        """
        Gera recomendação de treino personalizada usando a rede neural
        
        Args:
            perfil: Perfil completo do usuário
            
        Returns:
            Treino personalizado com exercícios, séries, reps, etc.
        """
        # Codificar perfil
        features = self._encode_perfil(
            objetivo=perfil.objetivo,
            nivel=perfil.nivel,
            idade=perfil.idade,
            peso=perfil.peso,
            altura=perfil.altura,
            dias=perfil.dias_disponiveis,
            tempo=perfil.tempo_por_treino,
            limitacoes=perfil.limitacoes,
            equipamentos=perfil.equipamentos_disponiveis
        )
        
        # Obter scores da rede neural
        self.model.eval()
        with torch.no_grad():
            features_tensor = torch.FloatTensor(features).unsqueeze(0).to(self.device)
            scores = self.model(features_tensor).squeeze().cpu().numpy()
        
        # Interpretar scores
        grupo_scores = scores[:8]  # Primeiros 8 são grupos musculares
        config_scores = scores[8:14]  # Configurações de treino
        
        # Gerar divisão de treino baseada nos dias
        divisao = self._gerar_divisao(perfil.dias_disponiveis, perfil.nivel, grupo_scores)
        
        # Gerar treinos para cada dia
        treinos = []
        config = self.configs_objetivo[perfil.objetivo]
        
        for dia, grupos in divisao.items():
            treino_dia = {
                "dia": dia,
                "grupos": grupos,
                "exercicios": [],
                "duracao_estimada": 0
            }
            
            for grupo in grupos:
                exercicios_grupo = self._selecionar_exercicios(
                    grupo=grupo,
                    config=config,
                    limitacoes=perfil.limitacoes,
                    equipamentos=perfil.equipamentos_disponiveis,
                    nivel=perfil.nivel,
                    grupo_score=grupo_scores[GrupoMuscular[grupo.upper()].value]
                )
                treino_dia["exercicios"].extend(exercicios_grupo)
            
            # Calcular duração estimada
            tempo_por_exercicio = 5  # minutos base
            treino_dia["duracao_estimada"] = len(treino_dia["exercicios"]) * tempo_por_exercicio
            
            treinos.append(treino_dia)
        
        # Gerar recomendações adicionais
        recomendacoes = self._gerar_recomendacoes(perfil, scores)
        
        return {
            "perfil_resumo": {
                "objetivo": perfil.objetivo.name,
                "nivel": perfil.nivel.name,
                "dias_semana": perfil.dias_disponiveis,
                "limitacoes": perfil.limitacoes
            },
            "divisao": list(divisao.keys()),
            "treinos": treinos,
            "config_geral": {
                "series": f"{config['series'][0]}-{config['series'][1]}",
                "repeticoes": f"{config['reps'][0]}-{config['reps'][1]}",
                "descanso": f"{config['descanso'][0]}-{config['descanso'][1]}s",
                "intensidade": config["intensidade"]
            },
            "recomendacoes": recomendacoes,
            "confianca_modelo": float(np.mean(scores))
        }
    
    def _gerar_divisao(self, dias: int, nivel: NivelExperiencia, 
                       grupo_scores: np.ndarray) -> Dict[str, List[str]]:
        """Gera divisão de treino baseada nos dias disponíveis"""
        
        if dias <= 2:
            # Full Body
            return {
                "Dia A": ["peito", "costas", "pernas", "ombros"],
                "Dia B": ["peito", "costas", "pernas", "biceps", "triceps"]
            }[:dias]
        
        elif dias == 3:
            if nivel == NivelExperiencia.INICIANTE:
                # Full Body 3x
                return {
                    "Dia A": ["peito", "costas", "pernas"],
                    "Dia B": ["ombros", "biceps", "triceps", "pernas"],
                    "Dia C": ["peito", "costas", "gluteos", "abdomen"]
                }
            else:
                # Push/Pull/Legs
                return {
                    "Push": ["peito", "ombros", "triceps"],
                    "Pull": ["costas", "biceps", "abdomen"],
                    "Legs": ["pernas", "gluteos"]
                }
        
        elif dias == 4:
            # Upper/Lower
            return {
                "Upper A": ["peito", "costas", "ombros"],
                "Lower A": ["pernas", "gluteos", "abdomen"],
                "Upper B": ["peito", "costas", "biceps", "triceps"],
                "Lower B": ["pernas", "gluteos"]
            }
        
        elif dias == 5:
            # PPL + Upper/Lower
            return {
                "Push": ["peito", "ombros", "triceps"],
                "Pull": ["costas", "biceps"],
                "Legs": ["pernas", "gluteos"],
                "Upper": ["peito", "costas", "ombros"],
                "Lower": ["pernas", "gluteos", "abdomen"]
            }
        
        else:  # 6+ dias
            # PPL 2x
            return {
                "Push A": ["peito", "ombros", "triceps"],
                "Pull A": ["costas", "biceps"],
                "Legs A": ["pernas", "gluteos"],
                "Push B": ["peito", "ombros", "triceps"],
                "Pull B": ["costas", "biceps", "abdomen"],
                "Legs B": ["pernas", "gluteos"]
            }
    
    def _selecionar_exercicios(self, grupo: str, config: Dict,
                               limitacoes: List[str], equipamentos: List[str],
                               nivel: NivelExperiencia, grupo_score: float) -> List[Dict]:
        """Seleciona exercícios adequados para um grupo muscular"""
        
        exercicios_disponiveis = self.exercicios.get(grupo, [])
        
        # Filtrar por limitações
        exercicios_filtrados = []
        for ex in exercicios_disponiveis:
            contraindicado = False
            for limitacao in limitacoes:
                if limitacao.lower() in [c.lower() for c in ex.get("contraindica", [])]:
                    contraindicado = True
                    break
            
            if not contraindicado:
                # Verificar equipamento
                tem_equipamento = any(
                    eq in equipamentos 
                    for eq in ex.get("equipamento", [])
                )
                if tem_equipamento:
                    exercicios_filtrados.append(ex)
        
        # Ordenar por dificuldade adequada ao nível
        dificuldade_ideal = {
            NivelExperiencia.INICIANTE: 0.3,
            NivelExperiencia.INTERMEDIARIO: 0.5,
            NivelExperiencia.AVANCADO: 0.7
        }[nivel]
        
        exercicios_filtrados.sort(
            key=lambda e: abs(e["dificuldade"] - dificuldade_ideal)
        )
        
        # Selecionar número de exercícios baseado no score
        num_exercicios = max(2, min(4, int(grupo_score * 5)))
        if nivel == NivelExperiencia.INICIANTE:
            num_exercicios = min(num_exercicios, 2)
        
        # Priorizar compostos
        compostos = [e for e in exercicios_filtrados if e["tipo"] == "composto"]
        isoladores = [e for e in exercicios_filtrados if e["tipo"] != "composto"]
        
        selecionados = []
        
        # Adicionar compostos primeiro
        num_compostos = int(num_exercicios * config["compostos_ratio"])
        selecionados.extend(compostos[:num_compostos])
        
        # Completar com isoladores
        num_isoladores = num_exercicios - len(selecionados)
        selecionados.extend(isoladores[:num_isoladores])
        
        # Adicionar configurações de séries/reps
        resultado = []
        for ex in selecionados:
            series = np.random.randint(config["series"][0], config["series"][1] + 1)
            reps = np.random.randint(config["reps"][0], config["reps"][1] + 1)
            
            resultado.append({
                "exercicio": ex["nome"],
                "tipo": ex["tipo"],
                "series": series,
                "repeticoes": reps,
                "descanso": f"{config['descanso'][0]}-{config['descanso'][1]}s"
            })
        
        return resultado
    
    def _gerar_recomendacoes(self, perfil: PerfilUsuario, scores: np.ndarray) -> List[str]:
        """Gera recomendações personalizadas"""
        recomendacoes = []
        
        # Recomendações por objetivo
        if perfil.objetivo == Objetivo.HIPERTROFIA:
            recomendacoes.append("🥩 Consuma 1.6-2.2g de proteína por kg de peso corporal")
            recomendacoes.append("📈 Aumente cargas progressivamente (2.5-5% por semana)")
        elif perfil.objetivo == Objetivo.EMAGRECIMENTO:
            recomendacoes.append("🔥 Mantenha déficit calórico de 300-500kcal")
            recomendacoes.append("🏃 Adicione 2-3 sessões de cardio por semana")
        elif perfil.objetivo == Objetivo.FORCA:
            recomendacoes.append("💪 Foque em progressão de carga nos exercícios principais")
            recomendacoes.append("⏰ Respeite os descansos longos entre séries pesadas")
        
        # Recomendações por nível
        if perfil.nivel == NivelExperiencia.INICIANTE:
            recomendacoes.append("📚 Foque em aprender a técnica correta antes de aumentar cargas")
            recomendacoes.append("🎯 Consistência é mais importante que intensidade no início")
        
        # Recomendações por limitações
        for limitacao in perfil.limitacoes:
            if "joelho" in limitacao.lower():
                recomendacoes.append("🦵 Evite exercícios de alto impacto e amplitude excessiva")
            elif "ombro" in limitacao.lower():
                recomendacoes.append("💆 Trabalhe mobilidade e fortaleça manguito rotador")
            elif "lombar" in limitacao.lower():
                recomendacoes.append("🏋️ Fortaleça o core e evite exercícios com sobrecarga axial")
        
        # Recomendação geral
        recomendacoes.append("😴 Durma 7-9 horas por noite para otimizar recuperação")
        
        return recomendacoes
    
    def atualizar_com_feedback(self, perfil: PerfilUsuario, feedback: Dict):
        """
        Atualiza o modelo com feedback do usuário (aprendizado contínuo)
        
        Args:
            perfil: Perfil do usuário
            feedback: Dicionário com avaliações (0-1 por exercício/dia)
        """
        features = self._encode_perfil(
            objetivo=perfil.objetivo,
            nivel=perfil.nivel,
            idade=perfil.idade,
            peso=perfil.peso,
            altura=perfil.altura,
            dias=perfil.dias_disponiveis,
            tempo=perfil.tempo_por_treino,
            limitacoes=perfil.limitacoes,
            equipamentos=perfil.equipamentos_disponiveis
        )
        
        # Converter feedback em targets
        # feedback = {"grupos": [0.8, 0.9, ...], "geral": 0.85}
        if "grupos" in feedback:
            targets = feedback["grupos"]
            if len(targets) < 24:
                targets = targets + [feedback.get("geral", 0.7)] * (24 - len(targets))
            
            # Fine-tuning
            self.model.train()
            features_tensor = torch.FloatTensor(features).unsqueeze(0).to(self.device)
            targets_tensor = torch.FloatTensor(targets).unsqueeze(0).to(self.device)
            
            for _ in range(10):  # Poucas iterações para não overfit
                self.optimizer.zero_grad()
                outputs = self.model(features_tensor)
                loss = self.criterion(outputs, targets_tensor)
                loss.backward()
                self.optimizer.step()
            
            print(f"✅ Modelo atualizado com feedback (loss: {loss.item():.4f})")
    
    def save_model(self, path: str):
        """Salva o modelo treinado"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
        }, path)
        print(f"✅ Modelo salvo em {path}")
    
    def load_model(self, path: str):
        """Carrega um modelo salvo"""
        checkpoint = torch.load(path, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        print(f"✅ Modelo carregado de {path}")


# Singleton
_recommender = None

def get_recommender() -> SistemaRecomendacao:
    """Retorna instância singleton do sistema de recomendação"""
    global _recommender
    if _recommender is None:
        _recommender = SistemaRecomendacao()
    return _recommender
