"""
Modelo de Embeddings Semânticos para NLP em Português
Usa Sentence-BERT para criar representações vetoriais de texto
"""

import torch
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple, Optional
import json
import os

class EmbeddingModel:
    """
    Modelo de embeddings usando Sentence-BERT multilingual
    Permite busca semântica em português para perguntas de musculação
    """
    
    def __init__(self, model_name: str = "paraphrase-multilingual-MiniLM-L12-v2"):
        """
        Inicializa o modelo de embeddings
        
        Args:
            model_name: Nome do modelo Sentence-BERT (multilingual para português)
        """
        print(f"🔄 Carregando modelo de embeddings: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        print(f"✅ Modelo carregado no dispositivo: {self.device}")
        
        # Base de conhecimento com embeddings pré-calculados
        self.knowledge_base: Dict[str, Dict] = {}
        self.knowledge_embeddings: Optional[np.ndarray] = None
        self.knowledge_keys: List[str] = []
        
        # Inicializar base de conhecimento de musculação
        self._init_knowledge_base()
    
    def _init_knowledge_base(self):
        """Inicializa a base de conhecimento de musculação"""
        
        knowledge = {
            # HIPERTROFIA
            "hipertrofia_basico": {
                "pergunta": "Como ganhar massa muscular? Como fazer hipertrofia?",
                "resposta": "Para ganhar massa muscular (hipertrofia), você precisa: 1) Treinar com 8-12 repetições por série, 2) Descansar 60-90 segundos entre séries, 3) Consumir 1.6-2.2g de proteína por kg de peso corporal, 4) Manter superávit calórico de 300-500kcal, 5) Dormir 7-9 horas por noite.",
                "topicos": ["hipertrofia", "massa muscular", "crescimento"],
                "nivel": "iniciante"
            },
            "hipertrofia_volume": {
                "pergunta": "Quantas séries devo fazer para hipertrofia? Qual o volume ideal?",
                "resposta": "O volume ideal para hipertrofia é de 10-20 séries por grupo muscular por semana. Iniciantes: 10-12 séries. Intermediários: 12-16 séries. Avançados: 16-20+ séries. Distribua entre 2-3 sessões semanais por grupo.",
                "topicos": ["volume", "séries", "hipertrofia"],
                "nivel": "intermediario"
            },
            "hipertrofia_tempo_tensao": {
                "pergunta": "O que é tempo sob tensão? Como usar para hipertrofia?",
                "resposta": "Tempo sob tensão (TUT) é o tempo total que o músculo fica sob carga durante uma série. Para hipertrofia ideal, mantenha 40-60 segundos por série. Exemplo: 3 segundos descendo, 1 segundo pausando, 2 segundos subindo = 6 segundos por rep × 10 reps = 60 segundos.",
                "topicos": ["tempo sob tensão", "TUT", "hipertrofia"],
                "nivel": "avancado"
            },
            
            # FORÇA
            "forca_basico": {
                "pergunta": "Como ficar mais forte? Como treinar força?",
                "resposta": "Para ganhar força: 1) Treine com 1-5 repetições por série, 2) Use 85-95% da sua carga máxima, 3) Descanse 3-5 minutos entre séries, 4) Foque em exercícios compostos: agachamento, supino, terra, desenvolvimento.",
                "topicos": ["força", "powerlifting", "carga máxima"],
                "nivel": "intermediario"
            },
            "forca_periodizacao": {
                "pergunta": "Como fazer periodização para força?",
                "resposta": "Periodização para força: Semana 1-2: 5×5 com 80%. Semana 3-4: 4×4 com 85%. Semana 5-6: 3×3 com 90%. Semana 7: Deload 3×5 com 60%. Semana 8: Teste de máximo. Progrida 2.5-5kg no ciclo seguinte.",
                "topicos": ["periodização", "força", "progressão"],
                "nivel": "avancado"
            },
            
            # EMAGRECIMENTO
            "emagrecer_basico": {
                "pergunta": "Como emagrecer? Como perder gordura?",
                "resposta": "Para emagrecer de forma saudável: 1) Crie déficit calórico de 300-500kcal/dia, 2) Mantenha proteína alta (2g/kg) para preservar músculo, 3) Combine treino de força com cardio, 4) Priorize sono de qualidade, 5) Seja consistente - resultados levam tempo.",
                "topicos": ["emagrecimento", "perda de gordura", "definição"],
                "nivel": "iniciante"
            },
            "emagrecer_treino": {
                "pergunta": "Qual o melhor treino para emagrecer? Devo fazer cardio?",
                "resposta": "O melhor treino combina: 1) Musculação 3-4x/semana (prioridade para manter massa), 2) HIIT 2x/semana (queima mais calorias em menos tempo), 3) Cardio moderado opcional 2-3x/semana. Treinos em circuito também são eficientes para queimar gordura.",
                "topicos": ["treino", "emagrecimento", "cardio", "HIIT"],
                "nivel": "iniciante"
            },
            
            # TÉCNICAS DE EXERCÍCIOS
            "tecnica_agachamento": {
                "pergunta": "Como fazer agachamento corretamente? Qual a técnica do squat?",
                "resposta": "Técnica do agachamento: 1) Pés na largura dos ombros, pontas levemente para fora, 2) Desça controladamente empurrando quadril para trás, 3) Joelhos alinhados com os pés, 4) Coxas paralelas ao solo ou abaixo, 5) Core ativado, peito alto, coluna neutra, 6) Empurre o chão na subida, contraia glúteos no topo.",
                "topicos": ["agachamento", "técnica", "pernas"],
                "nivel": "iniciante"
            },
            "tecnica_supino": {
                "pergunta": "Como fazer supino corretamente? Técnica do bench press",
                "resposta": "Técnica do supino: 1) Deite com escápulas retraídas e deprimidas, 2) Crie um leve arco torácico, 3) Pegada ligeiramente mais larga que ombros, 4) Desça a barra até o esterno, 5) Cotovelos em 45-75 graus, 6) Empurre em linha reta, trave cotovelos no topo.",
                "topicos": ["supino", "peito", "técnica"],
                "nivel": "iniciante"
            },
            "tecnica_terra": {
                "pergunta": "Como fazer levantamento terra? Técnica do deadlift",
                "resposta": "Técnica do terra: 1) Pés na largura dos quadris, barra sobre meio do pé, 2) Pegada na largura dos ombros, 3) NUNCA arredonde a lombar, 4) Empurre o chão (não puxe a barra), 5) Barra próxima ao corpo, 6) Trave quadril e glúteos no topo, 7) Desça de forma controlada.",
                "topicos": ["levantamento terra", "deadlift", "técnica"],
                "nivel": "intermediario"
            },
            
            # DIVISÃO DE TREINO
            "divisao_iniciante": {
                "pergunta": "Qual a melhor divisão de treino para iniciante?",
                "resposta": "Para iniciantes, recomendo Full Body 3x/semana (ex: segunda, quarta, sexta). Benefícios: maior frequência de estímulo, aprende movimentos mais rápido, recuperação adequada. Exemplo: Agachamento, Supino, Remada, Desenvolvimento, Rosca, Tríceps a cada treino.",
                "topicos": ["divisão", "iniciante", "full body"],
                "nivel": "iniciante"
            },
            "divisao_intermediario": {
                "pergunta": "Qual divisão de treino para intermediário?",
                "resposta": "Para intermediários, recomendo: Upper/Lower 4x/semana ou Push/Pull/Legs 2x (6 dias). Upper/Lower: Segunda (Upper), Terça (Lower), Quinta (Upper), Sexta (Lower). PPL: Peito+Ombro+Tríceps, Costas+Bíceps, Pernas - repete.",
                "topicos": ["divisão", "intermediário", "PPL", "upper lower"],
                "nivel": "intermediario"
            },
            
            # LIMITAÇÕES E LESÕES
            "lesao_joelho": {
                "pergunta": "Tenho problema no joelho, como treinar pernas?",
                "resposta": "Com problemas no joelho: 1) Evite exercícios de alto impacto (pular), 2) Prefira leg press com amplitude controlada, 3) Fortaleça quadríceps na extensora (amplitude parcial), 4) Trabalhe posteriores (mesa flexora, stiff), 5) Glúteos com hip thrust. Sempre aqueça bem e pare se sentir dor.",
                "topicos": ["joelho", "lesão", "adaptação"],
                "nivel": "especial"
            },
            "lesao_ombro": {
                "pergunta": "Tenho dor no ombro, como treinar peito e ombros?",
                "resposta": "Com problemas no ombro: 1) Evite supino reto - prefira inclinado ou máquina, 2) Não faça desenvolvimento atrás da cabeça, 3) Use pegada neutra quando possível, 4) Fortaleça manguito rotador com face pulls, 5) Trabalhe mobilidade diariamente, 6) Reduza amplitude se necessário.",
                "topicos": ["ombro", "lesão", "adaptação"],
                "nivel": "especial"
            },
            "lesao_lombar": {
                "pergunta": "Tenho problema na lombar, como treinar?",
                "resposta": "Com problemas lombares: 1) EVITE terra e agachamento livre até melhorar, 2) Prefira leg press, hack machine, 3) Fortaleça core (prancha, dead bug), 4) Use suporte lombar em exercícios sentados, 5) Evite hiperextensão da coluna, 6) Trabalhe mobilidade de quadril. Consulte um fisioterapeuta.",
                "topicos": ["lombar", "coluna", "lesão", "adaptação"],
                "nivel": "especial"
            },
            
            # NUTRIÇÃO
            "nutricao_proteina": {
                "pergunta": "Quanta proteína devo consumir? Quando tomar proteína?",
                "resposta": "Consumo de proteína: 1.6-2.2g por kg de peso corporal. Distribua em 4-6 refeições com 20-40g cada. Pós-treino é importante mas não mágico - o total diário importa mais. Fontes: frango, carne, peixe, ovos, whey, leguminosas.",
                "topicos": ["proteína", "nutrição", "dieta"],
                "nivel": "iniciante"
            },
            "nutricao_carboidrato": {
                "pergunta": "Devo cortar carboidrato? Carboidrato engorda?",
                "resposta": "Carboidratos são combustível para treinos intensos - NÃO corte completamente. Eles não engordam, excesso calórico sim. Para treino de força/hipertrofia: 3-5g/kg. Para emagrecer: 2-3g/kg. Prefira carboidratos complexos: arroz, batata, aveia, frutas.",
                "topicos": ["carboidrato", "nutrição", "dieta"],
                "nivel": "iniciante"
            },
            
            # DESCANSO E RECUPERAÇÃO
            "descanso_sono": {
                "pergunta": "Quanto devo dormir? O sono afeta o ganho de massa?",
                "resposta": "O sono é CRUCIAL para ganhos: 7-9 horas por noite é o ideal. Durante o sono: liberação de GH e testosterona, síntese proteica, recuperação neural. Dicas: quarto escuro e fresco, rotina de horários, evitar telas 1h antes, evitar cafeína após 14h.",
                "topicos": ["sono", "descanso", "recuperação"],
                "nivel": "iniciante"
            },
            "descanso_overtraining": {
                "pergunta": "O que é overtraining? Como evitar?",
                "resposta": "Overtraining é excesso de treino sem recuperação adequada. Sintomas: fadiga crônica, queda de força, irritabilidade, insônia, dores persistentes. Evite: respeitando descanso, fazendo deload a cada 4-6 semanas (50-60% volume), dormindo bem, alimentando-se adequadamente.",
                "topicos": ["overtraining", "descanso", "recuperação"],
                "nivel": "intermediario"
            },
            
            # SUPLEMENTAÇÃO
            "suplemento_whey": {
                "pergunta": "Devo tomar whey protein? Qual o melhor suplemento?",
                "resposta": "Whey é conveniente mas não essencial - priorize comida. Se usar: 1 dose pós-treino ou para completar proteína diária. Suplementos com evidência: Creatina (5g/dia), Cafeína (pré-treino), Vitamina D (se deficiente). Economize em BCAAs, pré-treinos caros e termogênicos.",
                "topicos": ["suplemento", "whey", "creatina"],
                "nivel": "iniciante"
            },
            
            # TEMPO E FREQUÊNCIA
            "frequencia_treino": {
                "pergunta": "Quantas vezes por semana devo treinar?",
                "resposta": "A frequência ideal depende do seu nível e disponibilidade: Iniciantes: 3x/semana (Full Body). Intermediários: 4-5x/semana (Upper/Lower ou PPL). Avançados: 5-6x/semana. O mais importante é CONSISTÊNCIA - melhor 3x/semana sempre do que 6x/semana às vezes.",
                "topicos": ["frequência", "treino", "rotina"],
                "nivel": "iniciante"
            },
            "duracao_treino": {
                "pergunta": "Quanto tempo deve durar o treino?",
                "resposta": "Um treino eficiente dura 45-75 minutos (não contando aquecimento). Mais que 90 minutos pode indicar: muito descanso, muita conversa, ou volume excessivo. Qualidade > quantidade. Seja objetivo e focado.",
                "topicos": ["duração", "tempo", "treino"],
                "nivel": "iniciante"
            }
        }
        
        # Armazenar e calcular embeddings
        self.knowledge_base = knowledge
        self.knowledge_keys = list(knowledge.keys())
        
        # Calcular embeddings de todas as perguntas
        perguntas = [kb["pergunta"] for kb in knowledge.values()]
        print(f"🔄 Calculando embeddings para {len(perguntas)} itens de conhecimento...")
        self.knowledge_embeddings = self.model.encode(perguntas, convert_to_numpy=True)
        print("✅ Base de conhecimento inicializada")
    
    def encode(self, text: str) -> np.ndarray:
        """
        Codifica um texto em embedding
        
        Args:
            text: Texto para codificar
            
        Returns:
            Vetor de embedding
        """
        return self.model.encode(text, convert_to_numpy=True)
    
    def encode_batch(self, texts: List[str]) -> np.ndarray:
        """
        Codifica múltiplos textos em embeddings
        
        Args:
            texts: Lista de textos
            
        Returns:
            Matriz de embeddings
        """
        return self.model.encode(texts, convert_to_numpy=True)
    
    def find_similar(self, query: str, top_k: int = 3) -> List[Tuple[str, float, Dict]]:
        """
        Encontra os itens mais similares na base de conhecimento
        
        Args:
            query: Pergunta do usuário
            top_k: Número de resultados
            
        Returns:
            Lista de tuplas (chave, similaridade, dados)
        """
        # Codificar a pergunta
        query_embedding = self.encode(query).reshape(1, -1)
        
        # Calcular similaridade com toda a base
        similarities = cosine_similarity(query_embedding, self.knowledge_embeddings)[0]
        
        # Ordenar por similaridade
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            key = self.knowledge_keys[idx]
            similarity = float(similarities[idx])
            data = self.knowledge_base[key]
            results.append((key, similarity, data))
        
        return results
    
    def semantic_search(self, query: str, threshold: float = 0.5) -> Optional[Dict]:
        """
        Busca semântica na base de conhecimento
        
        Args:
            query: Pergunta do usuário
            threshold: Limiar mínimo de similaridade
            
        Returns:
            Melhor resposta ou None se abaixo do threshold
        """
        results = self.find_similar(query, top_k=1)
        
        if results and results[0][1] >= threshold:
            key, similarity, data = results[0]
            return {
                "resposta": data["resposta"],
                "topicos": data["topicos"],
                "nivel": data["nivel"],
                "confianca": similarity,
                "fonte": key
            }
        
        return None
    
    def get_context_response(self, query: str, user_context: Dict = None) -> Dict:
        """
        Resposta contextualizada considerando perfil do usuário
        
        Args:
            query: Pergunta do usuário
            user_context: Contexto do usuário (objetivo, limitações, nível)
            
        Returns:
            Resposta adaptada ao contexto
        """
        # Buscar respostas similares
        results = self.find_similar(query, top_k=3)
        
        if not results or results[0][1] < 0.3:
            return {
                "resposta": "Desculpe, não encontrei informações específicas sobre isso. Pode reformular a pergunta sobre musculação, treino ou nutrição?",
                "confianca": 0.0,
                "sugestoes": ["Como ganhar massa muscular?", "Qual a melhor divisão de treino?", "Como emagrecer?"]
            }
        
        best_key, best_sim, best_data = results[0]
        
        # Adaptar resposta ao contexto do usuário
        resposta = best_data["resposta"]
        
        if user_context:
            # Verificar limitações
            limitacoes = user_context.get("limitacoes", [])
            if limitacoes:
                # Buscar adaptações para as limitações
                for limitacao in limitacoes:
                    adaptacao = self._buscar_adaptacao(limitacao)
                    if adaptacao:
                        resposta += f"\n\n⚠️ Considerando sua limitação ({limitacao}): {adaptacao}"
            
            # Adaptar ao objetivo
            objetivo = user_context.get("objetivo")
            if objetivo:
                resposta = self._adaptar_ao_objetivo(resposta, objetivo)
        
        return {
            "resposta": resposta,
            "topicos": best_data["topicos"],
            "nivel": best_data["nivel"],
            "confianca": float(best_sim),
            "fonte": best_key,
            "alternativas": [
                {"topico": r[2]["topicos"][0], "relevancia": float(r[1])}
                for r in results[1:] if r[1] > 0.4
            ]
        }
    
    def _buscar_adaptacao(self, limitacao: str) -> Optional[str]:
        """Busca adaptações para uma limitação específica"""
        limitacao_lower = limitacao.lower()
        
        adaptacoes = {
            "joelho": "Evite impacto e amplitude excessiva. Prefira leg press e exercícios de isolamento com amplitude controlada.",
            "ombro": "Evite supino reto e desenvolvimento atrás da cabeça. Use pegada neutra e trabalhe mobilidade.",
            "lombar": "Evite terra e agachamento livre. Fortaleça o core e use máquinas com suporte.",
            "coluna": "Priorize exercícios com apoio. Fortaleça core e trabalhe mobilidade.",
            "punho": "Use straps quando necessário. Evite pegadas extremas.",
            "cotovelo": "Reduza volume de isolamento para bíceps/tríceps. Use amplitude confortável."
        }
        
        for key, adaptacao in adaptacoes.items():
            if key in limitacao_lower:
                return adaptacao
        
        return None
    
    def _adaptar_ao_objetivo(self, resposta: str, objetivo: str) -> str:
        """Adapta a resposta ao objetivo do usuário"""
        objetivo_lower = objetivo.lower()
        
        if "emagrecer" in objetivo_lower or "perder" in objetivo_lower:
            return resposta + "\n\n💡 Para seu objetivo de emagrecimento: mantenha intensidade alta e déficit calórico moderado."
        elif "massa" in objetivo_lower or "hipertrofia" in objetivo_lower:
            return resposta + "\n\n💡 Para seu objetivo de hipertrofia: garanta superávit calórico e proteína adequada."
        elif "força" in objetivo_lower:
            return resposta + "\n\n💡 Para seu objetivo de força: priorize cargas altas e descanso adequado."
        
        return resposta


# Singleton para uso global
_embedding_model = None

def get_embedding_model() -> EmbeddingModel:
    """Retorna instância singleton do modelo de embeddings"""
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = EmbeddingModel()
    return _embedding_model
