from datetime import date

# ============ ENDPOINTS DE MISSÕES DIÁRIAS E STREAKS ============

class MissaoRequest(BaseModel):
    user_id: str
    data: str  # formato YYYY-MM-DD
    missoes: list

# Os endpoints devem ser definidos após o app = FastAPI(...)

@app.get("/api/missoes-diarias")
async def get_missoes_diarias(user_id: str):
    hoje = date.today().isoformat()
    MISSOES_FILE = Path("data/missoes_diarias.json")
    if MISSOES_FILE.exists():
        all_missoes = json.loads(MISSOES_FILE.read_text(encoding="utf-8"))
    else:
        all_missoes = {}
    user_missoes = all_missoes.get(user_id, {})
    return user_missoes.get(hoje) or [
        {"id": 1, "titulo": "Complete 1 treino hoje", "tipo": "treino", "meta": 1, "recompensa": "🔥 +5 pontos", "icone": "🔥", "progresso": 0, "concluida": False},
        {"id": 2, "titulo": "Beba 2L de água", "tipo": "agua", "meta": 2000, "recompensa": "💧 +3 pontos", "icone": "💧", "progresso": 0, "concluida": False},
        {"id": 3, "titulo": "Registre uma refeição", "tipo": "refeicao", "meta": 1, "recompensa": "🍽️ +2 pontos", "icone": "🍽️", "progresso": 0, "concluida": False}
    ]

@app.post("/api/missoes-diarias")
async def salvar_missoes_diarias(req: MissaoRequest):
    MISSOES_FILE = Path("data/missoes_diarias.json")
    if MISSOES_FILE.exists():
        all_missoes = json.loads(MISSOES_FILE.read_text(encoding="utf-8"))
    else:
        all_missoes = {}
    if req.user_id not in all_missoes:
        all_missoes[req.user_id] = {}
    all_missoes[req.user_id][req.data] = req.missoes
    MISSOES_FILE.write_text(json.dumps(all_missoes, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"success": True}

@app.get("/api/streak")
async def get_streak(user_id: str):
    STREAK_FILE = Path("data/streaks.json")
    if STREAK_FILE.exists():
        streaks = json.loads(STREAK_FILE.read_text(encoding="utf-8"))
    else:
        streaks = {}
    return {"streak": streaks.get(user_id, 0)}

@app.post("/api/streak")
async def salvar_streak(user_id: str = Body(...), streak: int = Body(...)):
    STREAK_FILE = Path("data/streaks.json")
    if STREAK_FILE.exists():
        streaks = json.loads(STREAK_FILE.read_text(encoding="utf-8"))
    else:
        streaks = {}
    streaks[user_id] = streak
    STREAK_FILE.write_text(json.dumps(streaks, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"success": True}
from pathlib import Path
import json




# ============ ENDPOINTS DE DESAFIOS PERSONALIZADOS ============

# Definir endpoints após a criação do app

from pydantic import BaseModel

class DesafioRequest(BaseModel):
    user_id: str
    titulo: str
    meta: int = 1
    recompensa: str = "🏅 Badge"
    progresso: int = 0

# Após a linha 'app = FastAPI(...)':

app = FastAPI(
    title="APP Trainer ML Service",
    version="3.1.0",
    description="""
    🏋️ Sistema de IA para Coach Virtual de Musculação
    
    Features:
    - 🧠 NLP Semântico com Sentence-BERT
    - 🤖 Rede Neural PyTorch para recomendações
    - 👤 Perfil de usuário com aprendizado contínuo
    - 🎯 Personalização por objetivo, limitações e feedback
    - 🔐 Sistema de autenticação
    """
)

# Endpoints de desafios personalizados
@app.post("/api/desafios")
async def criar_desafio(request: DesafioRequest):
    DESAFIOS_FILE = Path("data/desafios.json")
    desafio = request.dict()
    if DESAFIOS_FILE.exists():
        desafios = json.loads(DESAFIOS_FILE.read_text(encoding="utf-8"))
    else:
        desafios = []
    desafios.append(desafio)
    DESAFIOS_FILE.write_text(json.dumps(desafios, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"success": True, "desafio": desafio}

@app.get("/api/desafios")
async def listar_desafios(user_id: str):
    DESAFIOS_FILE = Path("data/desafios.json")
    if DESAFIOS_FILE.exists():
        desafios = json.loads(DESAFIOS_FILE.read_text(encoding="utf-8"))
    else:
        desafios = []
    return [d for d in desafios if d.get("user_id") == user_id]

@app.post("/api/desafios/progresso")
async def atualizar_progresso_desafio(user_id: str = Body(...), desafio_id: int = Body(...), progresso: int = Body(...)):
    DESAFIOS_FILE = Path("data/desafios.json")
    if DESAFIOS_FILE.exists():
        desafios = json.loads(DESAFIOS_FILE.read_text(encoding="utf-8"))
    else:
        desafios = []
    atualizado = False
    for d in desafios:
        if d.get("user_id") == user_id and d.get("id") == desafio_id:
            d["progresso"] = progresso
            atualizado = True
    DESAFIOS_FILE.write_text(json.dumps(desafios, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"success": atualizado}

@app.get("/api/desafios/sugerir")
async def sugerir_desafios(user_id: str):
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    perfil = gerenciador_perfil.obter_perfil(user_id)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    desafios = []
    if perfil.objetivo_principal == "hipertrofia":
        desafios.append({
            "titulo": "Completar 10 treinos de força",
            "meta": 10,
            "recompensa": "💪 Badge Força",
            "progresso": 0
        })
    if perfil.nivel == "iniciante":
        desafios.append({
            "titulo": "7 dias seguidos de treino",
            "meta": 7,
            "recompensa": "🔥 Badge Foco",
            "progresso": 0
        })
    if perfil.dias_disponiveis >= 5:
        desafios.append({
            "titulo": "Treinar 5x na semana",
            "meta": 5,
            "recompensa": "🏅 Badge Consistência",
            "progresso": 0
        })
    return desafios
"""
APP Trainer ML Service - API Principal
Sistema de IA com Machine Learning Real para Coach Virtual de Musculação

v3.0 - Features:
- Sentence-BERT para NLP semântico em português
- Rede Neural PyTorch para recomendação de treinos
- Sistema de perfil do usuário com aprendizado contínuo
- Personalização baseada em objetivo, limitações e feedback
- Sistema de autenticação com login/registro
"""

from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import traceback
import hashlib
import secrets
from fastapi.responses import JSONResponse

# Tentar importar módulos de ML (com fallback se não disponível)
ML_AVAILABLE = False
embedding_model = None
recommender = None
EmbeddingModel = None
SistemaRecomendacao = None
PerfilUsuario = None
Objetivo = None
NivelExperiencia = None

try:
    from models.embedding_model import get_embedding_model, EmbeddingModel as _EmbeddingModel
    from models.recommender import (
        get_recommender, SistemaRecomendacao as _SistemaRecomendacao, 
        PerfilUsuario as _PerfilUsuario, Objetivo as _Objetivo, NivelExperiencia as _NivelExperiencia
    )
    EmbeddingModel = _EmbeddingModel
    SistemaRecomendacao = _SistemaRecomendacao
    PerfilUsuario = _PerfilUsuario
    Objetivo = _Objetivo
    NivelExperiencia = _NivelExperiencia
    ML_AVAILABLE = True
    print("[OK] Modulos de ML carregados com sucesso")
except Exception as e:
    print(f"[WARN] Modulos de ML nao disponiveis, usando fallback: {e}")
    ML_AVAILABLE = False

# Importar módulo de perfil (sempre disponível)
from models.user_profile import (
    get_gerenciador_perfil, GerenciadorPerfil,
    PerfilCompleto, Interacao, TreinoRealizado
)


app = FastAPI(
    title="APP Trainer ML Service",
    version="3.1.0",
    description="""
    🏋️ Sistema de IA para Coach Virtual de Musculação
    
    Features:
    - 🧠 NLP Semântico com Sentence-BERT
    - 🤖 Rede Neural PyTorch para recomendações
    - 👤 Perfil de usuário com aprendizado contínuo
    - 🎯 Personalização por objetivo, limitações e feedback
    - 🔐 Sistema de autenticação
    """
)

# Registrar endpoints de desafios personalizados após a definição do app


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ MODELOS PYDANTIC - AUTENTICAÇÃO ============

class RegistroRequest(BaseModel):
    email: str = Field(..., description="Email do usuário")
    senha: str = Field(..., min_length=6, description="Senha (mínimo 6 caracteres)")
    nome: str = Field(..., description="Nome completo")

class LoginRequest(BaseModel):
    email: str = Field(..., description="Email do usuário")
    senha: str = Field(..., description="Senha")

class LoginResponse(BaseModel):
    success: bool
    user_id: Optional[str] = None
    nome: Optional[str] = None
    token: Optional[str] = None
    tem_perfil_completo: bool = False
    message: str

# ============ MODELOS PYDANTIC ============

class PerguntaCoach(BaseModel):
    pergunta: str = Field(..., description="Pergunta sobre musculação")
    user_id: Optional[str] = Field(None, description="ID do usuário para contexto")
    
class RespostaCoach(BaseModel):
    resposta: str
    topicos: List[str]
    confianca: float
    fonte: Optional[str] = None
    sugestoes: Optional[List[str]] = None
    alternativas: Optional[List[Dict]] = None

class CriarPerfilRequest(BaseModel):
    nome: str = Field(..., description="Nome do usuário")
    email: Optional[str] = None
    idade: int = Field(25, ge=14, le=100)
    peso: Optional[float] = Field(None, alias="peso_kg")
    altura: Optional[float] = Field(None, alias="altura_cm")
    peso_kg: Optional[float] = None
    altura_cm: Optional[float] = None
    sexo: Optional[str] = Field("M")
    objetivo: Optional[str] = Field("hipertrofia")
    nivel: str = Field("iniciante")
    dias_disponiveis: Optional[int] = Field(None, alias="dias_semana")
    dias_semana: Optional[int] = None
    tempo_por_treino: Optional[int] = Field(None, alias="duracao_treino_min")
    duracao_treino_min: Optional[int] = None
    limitacoes: Optional[List[str]] = Field(default_factory=list, alias="restricoes")
    restricoes: Optional[List[str]] = None
    equipamentos: List[str] = Field(default_factory=lambda: ["barra", "halteres", "maquinas", "cabos"])
    local_treino: Optional[str] = Field("academia", alias="local")
    local: Optional[str] = None
    gordura_corporal: Optional[float] = None
    horario_preferido: Optional[str] = None
    detalhes_restricao: Optional[str] = None
    medicamentos: Optional[str] = None
    exercicios_preferidos: Optional[List[str]] = None
    exercicios_evitar: Optional[List[str]] = None
    observacoes: Optional[str] = None
    imc: Optional[float] = None
    tempo_treino_meses: Optional[int] = None
    
    class Config:
        populate_by_name = True

class AtualizarPerfilRequest(BaseModel):
    nome: Optional[str] = None
    idade: Optional[int] = None
    sexo: Optional[str] = None
    peso: Optional[float] = None
    altura: Optional[float] = None
    objetivo: Optional[str] = None
    nivel: Optional[str] = None
    dias_disponiveis: Optional[int] = None
    tempo_por_treino: Optional[int] = None
    limitacoes: Optional[List[str]] = None
    equipamentos: Optional[List[str]] = None
    local: Optional[str] = None
    treino_atual: Optional[Dict[str, Any]] = None

class GerarTreinoRequest(BaseModel):
    user_id: str = Field(..., description="ID do usuário")

class FeedbackRequest(BaseModel):
    user_id: str
    treino_id: Optional[str] = None
    feedback: float = Field(..., ge=0, le=1, description="Avaliação de 0 a 1")
    exercicios_feedback: Optional[Dict[str, float]] = None
    observacoes: Optional[str] = None

class RegistrarTreinoRequest(BaseModel):
    user_id: str
    dia_treino: str
    exercicios: List[Dict]
    feedback: float = Field(0.7, ge=0, le=1)
    observacoes: str = ""
    duracao_minutos: int = 60

class RegistrarProgressoRequest(BaseModel):
    user_id: str
    peso: Optional[float] = None
    medidas: Optional[Dict[str, float]] = None
    cargas: Optional[Dict[str, float]] = None

# ============ VARIÁVEIS GLOBAIS ============

embedding_model = None  # Será EmbeddingModel se ML disponível
recommender = None  # Será SistemaRecomendacao se ML disponível
gerenciador_perfil: Optional[GerenciadorPerfil] = None

# ============ EVENTOS DE STARTUP ============

@app.on_event("startup")
async def startup_event():
    """Inicializa modelos de ML no startup"""
    global embedding_model, recommender, gerenciador_perfil
    
    print("[STARTUP] Iniciando APP Trainer ML Service v3.1")
    print("=" * 50)
    
    if ML_AVAILABLE:
        try:
            print("\n[LOAD] Carregando modelo de embeddings...")
            from models.embedding_model import get_embedding_model
            embedding_model = get_embedding_model()
            
            print("\n[LOAD] Inicializando rede neural de recomendacao...")
            from models.recommender import get_recommender
            recommender = get_recommender()
            print("[OK] Modelos de ML carregados!")
        except Exception as e:
            print(f"[WARN] Erro ao carregar modelos ML: {e}")
    else:
        print("[WARN] Modo fallback - ML nao disponivel")
    
    try:
        print("\n[LOAD] Inicializando gerenciador de perfil...")
        gerenciador_perfil = get_gerenciador_perfil()
        
        print("\n" + "=" * 50)
        print("[OK] Servico inicializado com sucesso!")
        print("=" * 50)
        
    except Exception as e:
        print(f"[ERROR] Erro ao carregar gerenciador de perfil: {e}")
        traceback.print_exc()

# ============ ENDPOINTS DE SAÚDE ============

@app.get("/")
async def root():
    """Endpoint raiz com informações da API"""
    return {
        "service": "APP Trainer ML Service",
        "version": "3.0.0",
        "status": "online",
        "features": [
            "NLP Semântico com Sentence-BERT",
            "Rede Neural para Recomendação de Treinos",
            "Sistema de Perfil com Aprendizado",
            "Personalização por Objetivo e Limitações"
        ],
        "endpoints": {
            "coach": "/coach - Perguntas e respostas",
            "perfil": "/perfil - Gerenciamento de usuário",
            "treino": "/treino - Geração de treino",
            "feedback": "/feedback - Registro de feedback",
            "docs": "/docs - Documentação interativa"
        }
    }

@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models": {
            "embedding": embedding_model is not None,
            "recommender": recommender is not None,
            "perfil": gerenciador_perfil is not None
        }
    }

# ============ ENDPOINTS DE AUTENTICAÇÃO ============

def hash_senha(senha: str) -> str:
    """Gera hash da senha usando SHA256"""
    return hashlib.sha256(senha.encode()).hexdigest()

def gerar_token() -> str:
    """Gera token de sessão"""
    return secrets.token_hex(32)

def validar_email(email: str) -> bool:
    """Valida formato do email"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

@app.post("/auth/registro")
async def registrar_usuario(request: RegistroRequest):
    """
    📝 Registra um novo usuário
    
    Cria conta com email e senha, retorna token de sessão.
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Serviço não disponível")
    
    try:
        # Validar formato do email
        if not validar_email(request.email):
            raise HTTPException(status_code=400, detail="Email inválido. Use o formato: exemplo@dominio.com")
        
        # Validar nome (mínimo 3 caracteres)
        if len(request.nome.strip()) < 3:
            raise HTTPException(status_code=400, detail="Nome deve ter no mínimo 3 caracteres")
        
        # Validar senha (mínimo 6 caracteres)
        if len(request.senha) < 6:
            raise HTTPException(status_code=400, detail="Senha deve ter no mínimo 6 caracteres")
        
        # Verificar se email já existe
        usuarios = gerenciador_perfil.listar_perfis()
        for u in usuarios:
            user_id = u.get("id") if isinstance(u, dict) else u
            perfil = gerenciador_perfil.obter_perfil(user_id)
            if perfil and getattr(perfil, 'email', None) == request.email:
                raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        # Criar perfil básico com credenciais
        perfil = gerenciador_perfil.criar_perfil({
            "nome": request.nome,
            "email": request.email,
            "senha_hash": hash_senha(request.senha),
            "idade": 25,
            "peso": 70,
            "altura": 170,
            "sexo": "M",
            "objetivo": "hipertrofia",
            "nivel": "iniciante",
            "dias": 4,
            "tempo": 60,
            "limitacoes": [],
            "equipamentos": ["barra", "halteres", "maquinas", "cabos"],
            "local": "academia",
            "perfil_completo": False
        })
        
        token = gerar_token()
        
        return {
            "success": True,
            "user_id": perfil.id,
            "nome": perfil.nome,
            "access_token": token,
            "tem_perfil_completo": False,
            "message": f"Conta criada com sucesso! Bem-vindo, {perfil.nome}!"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao registrar: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login")
async def fazer_login(request: LoginRequest):
    """
    🔐 Faz login do usuário
    
    Verifica credenciais e retorna token de sessão.
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Serviço não disponível")
    
    try:
        # Buscar usuário por email
        usuarios = gerenciador_perfil.listar_perfis()
        usuario_encontrado = None
        
        for u in usuarios:
            user_id = u.get("id") if isinstance(u, dict) else u
            perfil = gerenciador_perfil.obter_perfil(user_id)
            if perfil and getattr(perfil, 'email', None) == request.email:
                usuario_encontrado = perfil
                break
        
        if not usuario_encontrado:
            return {
                "success": False,
                "message": "Email não encontrado"
            }
        
        # Verificar senha
        senha_hash = hash_senha(request.senha)
        if getattr(usuario_encontrado, 'senha_hash', None) != senha_hash:
            return {
                "success": False,
                "message": "Senha incorreta"
            }
        
        # Verificar se perfil está completo - usar campo salvo, não inferir de valores default
        tem_perfil_completo = getattr(usuario_encontrado, 'perfil_completo', False)
        
        token = gerar_token()
        
        return {
            "success": True,
            "user_id": usuario_encontrado.id,
            "nome": usuario_encontrado.nome,
            "access_token": token,
            "tem_perfil_completo": tem_perfil_completo,
            "message": f"Login realizado com sucesso! Bem-vindo de volta, {usuario_encontrado.nome}!"
        }
        
    except Exception as e:
        print(f"Erro ao fazer login: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/auth/verificar/{user_id}")
async def verificar_sessao(user_id: str):
    """
    ✅ Verifica se sessão é válida
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Serviço não disponível")
    
    perfil = gerenciador_perfil.obter_perfil(user_id)
    if not perfil:
        return {"valid": False, "message": "Usuário não encontrado"}
    
    # Usar campo salvo diretamente, não inferir de valores default
    tem_perfil_completo = getattr(perfil, 'perfil_completo', False)
    
    return {
        "valid": True,
        "user_id": perfil.id,
        "nome": perfil.nome,
        "tem_perfil_completo": tem_perfil_completo
    }

# ============ ENDPOINTS DE COACH ============

@app.get("/coach")
async def coach_get(
    q: str = Query(..., description="Pergunta sobre musculação"),
    user_id: Optional[str] = Query(None, description="ID do usuário para contexto")
):
    """
    🧠 Coach Virtual - Responde perguntas sobre musculação
    
    Usa NLP semântico para entender a pergunta e encontrar a melhor resposta.
    Se user_id fornecido, personaliza resposta ao contexto do usuário.
    """
    return await _processar_pergunta(q, user_id)

@app.post("/coach")
async def coach_post(request: PerguntaCoach):
    """
    🧠 Coach Virtual - Responde perguntas (POST)
    """
    return await _processar_pergunta(request.pergunta, request.user_id)

async def _processar_pergunta(pergunta: str, user_id: Optional[str] = None) -> Dict:
    """Processa uma pergunta do coach"""
    
    if not embedding_model:
        raise HTTPException(status_code=503, detail="Modelo de embeddings não carregado")
    
    try:
        # Obter contexto do usuário se disponível
        user_context = None
        if user_id and gerenciador_perfil:
            perfil = gerenciador_perfil.obter_perfil(user_id)
            if perfil:
                user_context = {
                    "objetivo": perfil.objetivo_principal,
                    "nivel": perfil.nivel,
                    "limitacoes": perfil.limitacoes
                }
        
        # Busca semântica na base de conhecimento
        resultado = embedding_model.get_context_response(pergunta, user_context)
        
        # Registrar interação
        if user_id and gerenciador_perfil:
            interacao = Interacao(
                timestamp=datetime.now().isoformat(),
                pergunta=pergunta,
                resposta=resultado.get("resposta", ""),
                topicos=resultado.get("topicos", []),
                contexto=user_context
            )
            gerenciador_perfil.registrar_interacao(user_id, interacao)
        
        return {
            "texto": resultado.get("resposta", ""),
            "topicos": resultado.get("topicos", []),
            "confianca": round(resultado.get("confianca", 0), 2),
            "nivel": resultado.get("nivel"),
            "fonte": resultado.get("fonte"),
            "sugestoes": resultado.get("sugestoes"),
            "alternativas": resultado.get("alternativas")
        }
        
    except Exception as e:
        print(f"Erro ao processar pergunta: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ============ ENDPOINTS DE PERFIL ============

@app.post("/perfil")
async def criar_perfil(request: CriarPerfilRequest):
    """
    👤 Cria um novo perfil de usuário E gera treino personalizado
    
    O perfil é usado para personalizar treinos e respostas do coach.
    Retorna o treino gerado junto com o perfil.
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    try:
        # Normalizar campos com aliases
        peso = request.peso or request.peso_kg or 70.0
        altura = request.altura or request.altura_cm or 170.0
        dias = request.dias_disponiveis or request.dias_semana or 4
        tempo = request.tempo_por_treino or request.duracao_treino_min or 60
        limitacoes = request.limitacoes or request.restricoes or []
        local = request.local_treino or request.local or "academia"
        sexo = request.sexo or "M"
        if sexo.lower() in ["masculino", "m"]:
            sexo = "M"
        elif sexo.lower() in ["feminino", "f"]:
            sexo = "F"
        else:
            sexo = "M"
        
        # Normalizar objetivo
        objetivo = request.objetivo or "hipertrofia"
        if objetivo == "perda_gordura":
            objetivo = "emagrecimento"
        elif objetivo == "saude":
            objetivo = "condicionamento"
        elif objetivo == "reabilitacao":
            objetivo = "condicionamento"
        
        perfil = gerenciador_perfil.criar_perfil({
            "nome": request.nome,
            "email": request.email,
            "idade": request.idade,
            "peso": peso,
            "altura": altura,
            "sexo": sexo,
            "objetivo": objetivo,
            "nivel": request.nivel,
            "dias": dias,
            "tempo": tempo,
            "limitacoes": limitacoes,
            "equipamentos": request.equipamentos,
            "local": local,
            "gordura_corporal": request.gordura_corporal,
            "horario_preferido": request.horario_preferido,
            "detalhes_restricao": request.detalhes_restricao,
            "medicamentos": request.medicamentos,
            "exercicios_preferidos": request.exercicios_preferidos,
            "exercicios_evitar": request.exercicios_evitar,
            "observacoes": request.observacoes
        })
        
        # Gerar treino automaticamente após criar perfil
        treino = None
        if recommender:
            try:
                objetivo_map = {
                    "hipertrofia": Objetivo.HIPERTROFIA,
                    "forca": Objetivo.FORCA,
                    "emagrecimento": Objetivo.EMAGRECIMENTO,
                    "resistencia": Objetivo.RESISTENCIA,
                    "condicionamento": Objetivo.CONDICIONAMENTO
                }
                
                nivel_map = {
                    "sedentario": NivelExperiencia.INICIANTE,
                    "iniciante": NivelExperiencia.INICIANTE,
                    "iniciante_avancado": NivelExperiencia.INICIANTE,
                    "intermediario": NivelExperiencia.INTERMEDIARIO,
                    "avancado": NivelExperiencia.AVANCADO,
                    "expert": NivelExperiencia.AVANCADO
                }
                
                perfil_nn = PerfilUsuario(
                    objetivo=objetivo_map.get(objetivo, Objetivo.HIPERTROFIA),
                    nivel=nivel_map.get(request.nivel, NivelExperiencia.INICIANTE),
                    idade=request.idade,
                    peso=peso,
                    altura=altura,
                    dias_disponiveis=dias,
                    tempo_por_treino=tempo,
                    limitacoes=limitacoes,
                    equipamentos_disponiveis=request.equipamentos,
                    historico_feedback=[]
                )
                
                treino = recommender.recomendar_treino(perfil_nn)
            except Exception as e:
                print(f"Erro ao gerar treino: {e}")
                traceback.print_exc()
        
        return {
            "success": True,
            "user_id": perfil.id,
            "message": f"Perfil criado para {perfil.nome}",
            "perfil": {
                "id": perfil.id,
                "nome": perfil.nome,
                "objetivo": perfil.objetivo_principal,
                "nivel": perfil.nivel,
                "dias_semana": perfil.dias_disponiveis
            },
            "treino": treino
        }
        
    except Exception as e:
        print(f"Erro ao criar perfil: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/perfil/{user_id}")
async def obter_perfil(user_id: str):
    """
    👤 Obtém perfil do usuário
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    perfil = gerenciador_perfil.obter_perfil(user_id)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    # Obter estatísticas
    estatisticas = gerenciador_perfil.obter_estatisticas(user_id)
    preferencias = gerenciador_perfil.inferir_preferencias(user_id)
    
    # Obter treino_atual se existir
    treino_atual = getattr(perfil, 'treino_atual', None)
    perfil_completo = getattr(perfil, 'perfil_completo', False)
    
    return {
        "perfil": {
            "id": perfil.id,
            "nome": perfil.nome,
            "idade": perfil.idade,
            "peso": perfil.peso,
            "altura": perfil.altura,
            "objetivo": perfil.objetivo_principal,
            "nivel": perfil.nivel,
            "dias_disponiveis": perfil.dias_disponiveis,
            "tempo_por_treino": perfil.tempo_por_treino_minutos,
            "limitacoes": perfil.limitacoes,
            "equipamentos": perfil.equipamentos
        },
        "estatisticas": estatisticas,
        "preferencias_inferidas": preferencias,
        "treino_atual": treino_atual,
        "perfil_completo": perfil_completo
    }

@app.put("/perfil/{user_id}")
async def atualizar_perfil(user_id: str, request: AtualizarPerfilRequest):
    """
    👤 Atualiza perfil do usuário
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    atualizacoes = {}
    if request.nome is not None:
        atualizacoes["nome"] = request.nome
    if request.idade is not None:
        atualizacoes["idade"] = request.idade
    if request.sexo is not None:
        atualizacoes["sexo"] = request.sexo
    if request.peso is not None:
        atualizacoes["peso"] = request.peso
    if request.altura is not None:
        atualizacoes["altura"] = request.altura
    if request.objetivo is not None:
        atualizacoes["objetivo_principal"] = request.objetivo
        atualizacoes["objetivo"] = request.objetivo
    if request.nivel is not None:
        atualizacoes["nivel"] = request.nivel
    if request.dias_disponiveis is not None:
        atualizacoes["dias_disponiveis"] = request.dias_disponiveis
    if request.tempo_por_treino is not None:
        atualizacoes["tempo_por_treino_minutos"] = request.tempo_por_treino
    if request.limitacoes is not None:
        atualizacoes["limitacoes"] = request.limitacoes
    if request.equipamentos is not None:
        atualizacoes["equipamentos"] = request.equipamentos
    if request.local is not None:
        atualizacoes["treina_em"] = request.local

    if request.treino_atual is not None:
        atualizacoes["treino_atual"] = request.treino_atual
    
    perfil = gerenciador_perfil.atualizar_perfil(user_id, atualizacoes)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    return {
        "success": True,
        "message": "Perfil atualizado",
        "user_id": user_id
    }

@app.delete("/perfil/{user_id}")
async def excluir_perfil(user_id: str):
    """
    🗑️ Exclui perfil do usuário permanentemente
    
    Remove:
    - Arquivo de perfil (dados pessoais, credenciais)
    - Histórico de treinos
    - Histórico de interações
    - Preferências e configurações
    - Cache do perfil em memória
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    # Verificar se perfil existe
    perfil = gerenciador_perfil.obter_perfil(user_id)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    try:
        # Usar método do gerenciador que limpa cache e arquivo
        sucesso = gerenciador_perfil.excluir_perfil(user_id)
        
        if sucesso:
            return {
                "success": True,
                "message": "Conta e todos os dados excluídos permanentemente",
                "user_id": user_id,
                "dados_excluidos": [
                    "Dados pessoais",
                    "Credenciais de acesso",
                    "Histórico de treinos",
                    "Histórico de interações",
                    "Preferências e configurações"
                ]
            }
        else:
            raise HTTPException(status_code=404, detail="Arquivo de perfil não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir perfil: {str(e)}")

@app.get("/perfis")
async def listar_perfis():
    """
    📋 Lista todos os perfis
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    return {
        "perfis": gerenciador_perfil.listar_perfis()
    }

@app.post("/perfil/{user_id}/completar")
# ============ ENDPOINTS MOCK PARA INTEGRAÇÃO FRONTEND ============

@app.get("/api/refeicoes")
async def get_refeicoes():
    # Endpoint mock para integração frontend
    return {
        "refeicoes": [
            {"id": 1, "aluno_id": 101, "data": "2024-01-01", "tipo": "Café da manhã", "descricao": "Pão, ovo, suco"},
            {"id": 2, "aluno_id": 101, "data": "2024-01-01", "tipo": "Almoço", "descricao": "Arroz, feijão, frango"},
            {"id": 3, "aluno_id": 101, "data": "2024-01-01", "tipo": "Jantar", "descricao": "Sopa de legumes"}
        ]
    }

@app.get("/api/sono")
async def get_sono():
    # Endpoint mock para integração frontend
    return [
        {"id": 1, "aluno_id": 101, "data": "2024-01-01", "horas": 8, "qualidade": "Boa"},
        {"id": 2, "aluno_id": 101, "data": "2024-01-02", "horas": 7, "qualidade": "Regular"}
    ]
async def completar_avaliacao(user_id: str, request: CriarPerfilRequest):
    """

@app.get("/api/ranking-desafios")
async def ranking_desafios():
    import json
    from pathlib import Path
    DESAFIOS_FILE = Path("data/desafios.json")
    def load_desafios():
        if DESAFIOS_FILE.exists():
            return json.loads(DESAFIOS_FILE.read_text(encoding="utf-8"))
        return []
    desafios = load_desafios()
    user_map = {}
    for d in desafios:
        if d.get("progresso", 0) >= d.get("meta", 1):
            uid = d.get("user_id", "anon")
            user_map[uid] = user_map.get(uid, 0) + 1
    ranking = sorted(
        [
            {"nome": uid, "desafios": total, "pos": i+1}
            for i, (uid, total) in enumerate(sorted(user_map.items(), key=lambda x: -x[1]))
        ],
        key=lambda x: x["pos"]
    )[:10]
    return ranking


    📋 Completa a avaliação de um usuário existente
    
    Usado quando o usuário já tem conta (registrado) mas ainda não 
    preencheu o formulário de avaliação física.
    Retorna treino personalizado.
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    # Verificar se usuário existe
    perfil_existente = gerenciador_perfil.obter_perfil(user_id)
    if not perfil_existente:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    try:
        # Normalizar campos
        peso = request.peso or request.peso_kg or 70.0
        altura = request.altura or request.altura_cm or 170.0
        dias = request.dias_disponiveis or request.dias_semana or 4
        tempo = request.tempo_por_treino or request.duracao_treino_min or 60
        limitacoes = request.limitacoes or request.restricoes or []
        local = request.local_treino or request.local or "academia"
        sexo = request.sexo or "M"
        if sexo.lower() in ["masculino", "m"]:
            sexo = "M"
        elif sexo.lower() in ["feminino", "f"]:
            sexo = "F"
        else:
            sexo = "M"
        
        # Normalizar objetivo
        objetivo = request.objetivo or "hipertrofia"
        if objetivo == "perda_gordura":
            objetivo = "emagrecimento"
        elif objetivo == "saude":
            objetivo = "condicionamento"
        elif objetivo == "reabilitacao":
            objetivo = "condicionamento"
        
        # Atualizar perfil com dados da avaliação
        atualizacoes = {
            "idade": request.idade,
            "peso": peso,
            "altura": altura,
            "sexo": sexo,
            "objetivo_principal": objetivo,
            "nivel": request.nivel,
            "dias_disponiveis": dias,
            "tempo_por_treino_minutos": tempo,
            "limitacoes": limitacoes,
            "equipamentos": request.equipamentos,
            "treina_em": local,
            "horario_preferido": request.horario_preferido or "noite",
            "exercicios_favoritos": request.exercicios_preferidos or [],
            "exercicios_evitar": request.exercicios_evitar or [],
            "perfil_completo": True  # Marca como completo
        }
        
        perfil = gerenciador_perfil.atualizar_perfil(user_id, atualizacoes)
        
        # Gerar treino
        treino = None
        if recommender:
            try:
                objetivo_map = {
                    "hipertrofia": Objetivo.HIPERTROFIA,
                    "forca": Objetivo.FORCA,
                    "emagrecimento": Objetivo.EMAGRECIMENTO,
                    "resistencia": Objetivo.RESISTENCIA,
                    "condicionamento": Objetivo.CONDICIONAMENTO
                }
                
                nivel_map = {
                    "sedentario": NivelExperiencia.INICIANTE,
                    "iniciante": NivelExperiencia.INICIANTE,
                    "iniciante_avancado": NivelExperiencia.INICIANTE,
                    "intermediario": NivelExperiencia.INTERMEDIARIO,
                    "avancado": NivelExperiencia.AVANCADO,
                    "expert": NivelExperiencia.AVANCADO
                }
                
                perfil_nn = PerfilUsuario(
                    objetivo=objetivo_map.get(objetivo, Objetivo.HIPERTROFIA),
                    nivel=nivel_map.get(request.nivel, NivelExperiencia.INICIANTE),
                    idade=request.idade,
                    peso=peso,
                    altura=altura,
                    dias_disponiveis=dias,
                    tempo_por_treino=tempo,
                    limitacoes=limitacoes,
                    equipamentos_disponiveis=request.equipamentos,
                    historico_feedback=[]
                )
                
                treino = recommender.recomendar_treino(perfil_nn)
                
                # Salvar treino no perfil
                gerenciador_perfil.atualizar_perfil(user_id, {"treino_atual": treino})
                
            except Exception as e:
                print(f"Erro ao gerar treino: {e}")
                traceback.print_exc()
        
        return {
            "success": True,
            "user_id": user_id,
            "message": "Avaliação completa! Treino gerado.",
            "perfil": {
                "id": perfil.id,
                "nome": perfil.nome,
                "objetivo": perfil.objetivo_principal,
                "nivel": perfil.nivel,
                "dias_semana": perfil.dias_disponiveis
            },
            "treino": treino
        }
        
    except Exception as e:
        print(f"Erro ao completar avaliação: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ============ ENDPOINTS DE TREINO ============

@app.post("/treino/gerar")
async def gerar_treino(request: GerarTreinoRequest):
    """
    🏋️ Gera treino personalizado usando rede neural
    
    Analisa o perfil do usuário e gera um treino otimizado
    considerando objetivo, nível, limitações e histórico.
    """
    if not recommender or not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Serviços não disponíveis")
    
    # Obter perfil
    perfil_db = gerenciador_perfil.obter_perfil(request.user_id)
    if not perfil_db:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    # Converter para formato do recomendador
    objetivo_map = {
        "hipertrofia": Objetivo.HIPERTROFIA,
        "forca": Objetivo.FORCA,
        "emagrecimento": Objetivo.EMAGRECIMENTO,
        "resistencia": Objetivo.RESISTENCIA,
        "condicionamento": Objetivo.CONDICIONAMENTO
    }
    
    nivel_map = {
        "iniciante": NivelExperiencia.INICIANTE,
        "intermediario": NivelExperiencia.INTERMEDIARIO,
        "avancado": NivelExperiencia.AVANCADO
    }
    
    perfil_nn = PerfilUsuario(
        objetivo=objetivo_map.get(perfil_db.objetivo_principal, Objetivo.HIPERTROFIA),
        nivel=nivel_map.get(perfil_db.nivel, NivelExperiencia.INICIANTE),
        idade=perfil_db.idade,
        peso=perfil_db.peso,
        altura=perfil_db.altura,
        dias_disponiveis=perfil_db.dias_disponiveis,
        tempo_por_treino=perfil_db.tempo_por_treino_minutos,
        limitacoes=perfil_db.limitacoes,
        equipamentos_disponiveis=perfil_db.equipamentos,
        historico_feedback=[]
    )
    
    # Gerar treino
    treino = recommender.recomendar_treino(perfil_nn)
    
    return {
        "success": True,
        "user_id": request.user_id,
        "treino": treino,
        "gerado_em": datetime.now().isoformat()
    }

@app.post("/treino/registrar")
async def registrar_treino(request: RegistrarTreinoRequest):
    """
    📝 Registra um treino realizado
    
    Usado para acompanhar progresso e melhorar recomendações futuras.
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    treino = TreinoRealizado(
        data=datetime.now().isoformat(),
        dia_treino=request.dia_treino,
        exercicios_realizados=request.exercicios,
        feedback=request.feedback,
        observacoes=request.observacoes,
        duracao_minutos=request.duracao_minutos
    )
    
    success = gerenciador_perfil.registrar_treino(request.user_id, treino)
    
    if not success:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    return {
        "success": True,
        "message": "Treino registrado com sucesso"
    }

# ============ ENDPOINTS DE FEEDBACK ============

@app.post("/feedback")
async def registrar_feedback(request: FeedbackRequest):
    """
    ⭐ Registra feedback do usuário
    
    O feedback é usado para melhorar as recomendações futuras.
    A rede neural aprende com cada feedback recebido.
    """
    if not recommender or not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Serviços não disponíveis")
    
    # Obter perfil
    perfil_db = gerenciador_perfil.obter_perfil(request.user_id)
    if not perfil_db:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    # Converter perfil
    objetivo_map = {
        "hipertrofia": Objetivo.HIPERTROFIA,
        "forca": Objetivo.FORCA,
        "emagrecimento": Objetivo.EMAGRECIMENTO,
        "resistencia": Objetivo.RESISTENCIA,
        "condicionamento": Objetivo.CONDICIONAMENTO
    }
    
    nivel_map = {
        "iniciante": NivelExperiencia.INICIANTE,
        "intermediario": NivelExperiencia.INTERMEDIARIO,
        "avancado": NivelExperiencia.AVANCADO
    }
    
    perfil_nn = PerfilUsuario(
        objetivo=objetivo_map.get(perfil_db.objetivo_principal, Objetivo.HIPERTROFIA),
        nivel=nivel_map.get(perfil_db.nivel, NivelExperiencia.INICIANTE),
        idade=perfil_db.idade,
        peso=perfil_db.peso,
        altura=perfil_db.altura,
        dias_disponiveis=perfil_db.dias_disponiveis,
        tempo_por_treino=perfil_db.tempo_por_treino_minutos,
        limitacoes=perfil_db.limitacoes,
        equipamentos_disponiveis=perfil_db.equipamentos,
        historico_feedback=[]
    )
    
    # Atualizar modelo com feedback
    feedback_data = {
        "geral": request.feedback,
        "grupos": [request.feedback] * 8  # Simplificado - aplicar a todos os grupos
    }
    
    if request.exercicios_feedback:
        # Feedback específico por exercício - implementação futura
        pass
    
    recommender.atualizar_com_feedback(perfil_nn, feedback_data)
    
    return {
        "success": True,
        "message": "Feedback registrado e modelo atualizado"
    }

# ============ ENDPOINTS DE PROGRESSO ============

@app.post("/progresso")
async def registrar_progresso(request: RegistrarProgressoRequest):
    """
    📈 Registra progresso do usuário (peso, medidas, cargas)
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    progresso = {}
    if request.peso:
        progresso["peso"] = request.peso
    if request.medidas:
        progresso["medidas"] = request.medidas
    if request.cargas:
        progresso["cargas"] = request.cargas
    
    success = gerenciador_perfil.registrar_progresso(request.user_id, progresso)
    
    if not success:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    return {
        "success": True,
        "message": "Progresso registrado"
    }

@app.get("/progresso/{user_id}")
async def obter_progresso(user_id: str):
    """
    📊 Obtém histórico de progresso do usuário
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Gerenciador de perfil não disponível")
    
    perfil = gerenciador_perfil.obter_perfil(user_id)
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    return {
        "user_id": user_id,
        "progressos": perfil.progressos,
        "estatisticas": gerenciador_perfil.obter_estatisticas(user_id)
    }

# ============ ENDPOINTS DE TEMPLATES DE TREINO ============

@app.get("/templates")
async def listar_templates():
    """
    📋 Lista todos os templates de treino disponíveis
    """
    templates = [
        {
            "id": "beginner_full",
            "name": "Iniciante - Full Body",
            "description": "Treino para iniciantes, 3x por semana",
            "level": "iniciante",
            "days": 3,
            "category": "full_body"
        },
        {
            "id": "intermediate_push_pull",
            "name": "Push/Pull/Legs",
            "description": "Divisão clássica para intermediários",
            "level": "intermediario",
            "days": 6,
            "category": "ppl"
        },
        {
            "id": "advanced_bro_split",
            "name": "Bro Split Avançado",
            "description": "Um grupo muscular por dia",
            "level": "avancado",
            "days": 5,
            "category": "bro_split"
        },
        {
            "id": "strength_5x5",
            "name": "Força 5x5",
            "description": "Programa clássico de força",
            "level": "intermediario",
            "days": 3,
            "category": "strength"
        },
        {
            "id": "hypertrophy_high_volume",
            "name": "Hipertrofia Alto Volume",
            "description": "Foco em ganho de massa",
            "level": "avancado",
            "days": 5,
            "category": "hypertrophy"
        }
    ]
    return {"templates": templates}

@app.get("/templates/{template_id}")
async def obter_template(template_id: str):
    """
    📋 Obtém um template específico de treino
    """
    templates_config = {
        "beginner_full": {"dias": 3, "objetivo": "condicionamento", "nivel": "iniciante"},
        "intermediate_push_pull": {"dias": 6, "objetivo": "hipertrofia", "nivel": "intermediario"},
        "advanced_bro_split": {"dias": 5, "objetivo": "hipertrofia", "nivel": "avancado"},
        "strength_5x5": {"dias": 3, "objetivo": "forca", "nivel": "intermediario"},
        "hypertrophy_high_volume": {"dias": 5, "objetivo": "hipertrofia", "nivel": "avancado"}
    }
    
    config = templates_config.get(template_id)
    if not config:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    treino = gerar_treino_por_dias(config["dias"], config["objetivo"], config["nivel"])
    
    return {
        "template_id": template_id,
        "treino": treino
    }

# ============ ENDPOINT DE BUSCA SEMÂNTICA ============

@app.get("/busca")
async def busca_semantica(
    q: str = Query(..., description="Termo de busca"),
    top_k: int = Query(5, ge=1, le=10, description="Número de resultados")
):
    """
    🔍 Busca semântica na base de conhecimento
    
    Retorna os itens mais relevantes da base de conhecimento
    ordenados por similaridade semântica.
    """
    if not embedding_model:
        raise HTTPException(status_code=503, detail="Modelo de embeddings não carregado")
    
    resultados = embedding_model.find_similar(q, top_k=top_k)
    
    return {
        "query": q,
        "resultados": [
            {
                "topico": r[0],
                "similaridade": round(r[1], 3),
                "resposta": r[2]["resposta"],
                "nivel": r[2].get("nivel")
            }
            for r in resultados
        ]
    }

# ============ ENDPOINTS DE SUGESTÃO ============

@app.get("/suggest")
async def sugestao(
    q: str = Query(..., description="Contexto para sugestão"),
    user_id: Optional[str] = Query(None, description="ID do usuário")
):
    """
    💡 Sugestões baseadas no contexto
    """
    if not embedding_model:
        raise HTTPException(status_code=503, detail="Modelo não disponível")
    
    # Buscar tópicos relacionados
    resultados = embedding_model.find_similar(q, top_k=3)
    
    sugestoes = []
    for key, sim, data in resultados:
        if sim > 0.3:
            sugestoes.append({
                "topico": data.get("topicos", [""])[0],
                "relevancia": round(sim, 2),
                "exemplo": data.get("pergunta", "").split("?")[0] + "?"
            })
    
    return {
        "query": q,
        "sugestoes": sugestoes
    }

# ============ ENDPOINTS DE CHAT ============

class ChatRequest(BaseModel):
    usuario_id: str = Field(..., description="ID do usuário")
    mensagem: str = Field(..., description="Mensagem do usuário")

def detectar_intencao_treino(mensagem: str) -> dict:
    """Detecta se a mensagem é sobre ajuste de treino"""
    mensagem_lower = mensagem.lower()
    
    intencoes = {
        "gerar_treino": ["gerar treino", "criar treino", "novo treino", "monte um treino", "preciso de um treino", "faz um treino"],
        "ajustar_treino": ["ajustar treino", "modificar treino", "mudar treino", "alterar treino", "trocar exercicio", "substituir exercicio"],
        "adicionar_exercicio": ["adicionar exercicio", "incluir exercicio", "colocar mais exercicio"],
        "remover_exercicio": ["remover exercicio", "tirar exercicio", "excluir exercicio"],
        "aumentar_carga": ["aumentar carga", "mais peso", "aumentar peso", "progredir carga"],
        "diminuir_carga": ["diminuir carga", "menos peso", "reduzir peso"],
        "mais_series": ["mais series", "aumentar series", "adicionar series"],
        "menos_series": ["menos series", "diminuir series", "reduzir series"]
    }
    
    for intencao, keywords in intencoes.items():
        for keyword in keywords:
            if keyword in mensagem_lower:
                return {"tipo": intencao, "keyword": keyword}
    
    return {"tipo": "pergunta_geral", "keyword": None}

def gerar_treino_por_dias(dias: int, objetivo: str, nivel: str) -> dict:
    """Gera treino alinhado com a quantidade de dias selecionada"""
    
    # Definição dos exercícios por grupo muscular
    exercicios_peito = [
        {"nome": "Supino Reto", "series": 4, "repeticoes": "8-12", "descanso": "90s", "carga_sugerida": ""},
        {"nome": "Supino Inclinado", "series": 3, "repeticoes": "10-12", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Crucifixo", "series": 3, "repeticoes": "12-15", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Crossover", "series": 3, "repeticoes": "12-15", "descanso": "60s", "carga_sugerida": ""},
    ]
    
    exercicios_costas = [
        {"nome": "Puxada Frontal", "series": 4, "repeticoes": "8-12", "descanso": "90s", "carga_sugerida": ""},
        {"nome": "Remada Curvada", "series": 3, "repeticoes": "10-12", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Remada Unilateral", "series": 3, "repeticoes": "10-12", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Pulldown", "series": 3, "repeticoes": "12-15", "descanso": "60s", "carga_sugerida": ""},
    ]
    
    exercicios_pernas = [
        {"nome": "Agachamento", "series": 4, "repeticoes": "8-12", "descanso": "120s", "carga_sugerida": ""},
        {"nome": "Leg Press", "series": 3, "repeticoes": "10-12", "descanso": "90s", "carga_sugerida": ""},
        {"nome": "Cadeira Extensora", "series": 3, "repeticoes": "12-15", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Mesa Flexora", "series": 3, "repeticoes": "12-15", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Panturrilha", "series": 4, "repeticoes": "15-20", "descanso": "45s", "carga_sugerida": ""},
    ]
    
    exercicios_ombros = [
        {"nome": "Desenvolvimento", "series": 4, "repeticoes": "8-12", "descanso": "90s", "carga_sugerida": ""},
        {"nome": "Elevação Lateral", "series": 3, "repeticoes": "12-15", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Elevação Frontal", "series": 3, "repeticoes": "12-15", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Crucifixo Inverso", "series": 3, "repeticoes": "12-15", "descanso": "60s", "carga_sugerida": ""},
    ]
    
    exercicios_biceps = [
        {"nome": "Rosca Direta", "series": 3, "repeticoes": "10-12", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Rosca Martelo", "series": 3, "repeticoes": "10-12", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Rosca Concentrada", "series": 3, "repeticoes": "12-15", "descanso": "45s", "carga_sugerida": ""},
    ]
    
    exercicios_triceps = [
        {"nome": "Tríceps Pulley", "series": 3, "repeticoes": "10-12", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Tríceps Francês", "series": 3, "repeticoes": "10-12", "descanso": "60s", "carga_sugerida": ""},
        {"nome": "Tríceps Testa", "series": 3, "repeticoes": "10-12", "descanso": "60s", "carga_sugerida": ""},
    ]
    
    exercicios_abdomen = [
        {"nome": "Abdominal Infra", "series": 3, "repeticoes": "15-20", "descanso": "45s", "carga_sugerida": ""},
        {"nome": "Prancha", "series": 3, "repeticoes": "30-60s", "descanso": "30s", "carga_sugerida": ""},
    ]
    
    # Divisões por quantidade de dias
    divisoes = {
        2: {
            "nome": "Treino AB - Full Body",
            "divisao": "AB",
            "dias": [
                {
                    "nome": "Treino A - Superior",
                    "grupos": "Peito, Costas, Ombros, Braços",
                    "exercicios": exercicios_peito[:2] + exercicios_costas[:2] + exercicios_ombros[:1] + exercicios_biceps[:1] + exercicios_triceps[:1]
                },
                {
                    "nome": "Treino B - Inferior + Core",
                    "grupos": "Pernas, Glúteos, Abdômen",
                    "exercicios": exercicios_pernas[:4] + exercicios_abdomen
                }
            ]
        },
        3: {
            "nome": "Treino ABC",
            "divisao": "ABC",
            "dias": [
                {
                    "nome": "Treino A - Peito e Tríceps",
                    "grupos": "Peito, Tríceps",
                    "exercicios": exercicios_peito[:3] + exercicios_triceps[:2]
                },
                {
                    "nome": "Treino B - Costas e Bíceps",
                    "grupos": "Costas, Bíceps",
                    "exercicios": exercicios_costas[:3] + exercicios_biceps[:2]
                },
                {
                    "nome": "Treino C - Pernas e Ombros",
                    "grupos": "Pernas, Ombros",
                    "exercicios": exercicios_pernas[:4] + exercicios_ombros[:2]
                }
            ]
        },
        4: {
            "nome": "Treino ABCD",
            "divisao": "ABCD",
            "dias": [
                {
                    "nome": "Treino A - Peito e Tríceps",
                    "grupos": "Peito, Tríceps",
                    "exercicios": exercicios_peito[:3] + exercicios_triceps[:2]
                },
                {
                    "nome": "Treino B - Costas e Bíceps",
                    "grupos": "Costas, Bíceps",
                    "exercicios": exercicios_costas[:3] + exercicios_biceps[:2]
                },
                {
                    "nome": "Treino C - Pernas",
                    "grupos": "Quadríceps, Posterior, Panturrilha",
                    "exercicios": exercicios_pernas
                },
                {
                    "nome": "Treino D - Ombros e Abdômen",
                    "grupos": "Ombros, Core",
                    "exercicios": exercicios_ombros[:3] + exercicios_abdomen
                }
            ]
        },
        5: {
            "nome": "Treino ABCDE",
            "divisao": "ABCDE",
            "dias": [
                {
                    "nome": "Treino A - Peito",
                    "grupos": "Peito",
                    "exercicios": exercicios_peito
                },
                {
                    "nome": "Treino B - Costas",
                    "grupos": "Costas",
                    "exercicios": exercicios_costas
                },
                {
                    "nome": "Treino C - Pernas",
                    "grupos": "Pernas completo",
                    "exercicios": exercicios_pernas
                },
                {
                    "nome": "Treino D - Ombros",
                    "grupos": "Ombros",
                    "exercicios": exercicios_ombros
                },
                {
                    "nome": "Treino E - Braços",
                    "grupos": "Bíceps, Tríceps",
                    "exercicios": exercicios_biceps + exercicios_triceps
                }
            ]
        },
        6: {
            "nome": "Treino Push/Pull/Legs x2",
            "divisao": "PPL x2",
            "dias": [
                {
                    "nome": "Push 1 - Peito e Tríceps",
                    "grupos": "Peito, Ombros, Tríceps",
                    "exercicios": exercicios_peito[:3] + exercicios_ombros[:1] + exercicios_triceps[:2]
                },
                {
                    "nome": "Pull 1 - Costas e Bíceps",
                    "grupos": "Costas, Bíceps",
                    "exercicios": exercicios_costas[:3] + exercicios_biceps[:2]
                },
                {
                    "nome": "Legs 1 - Pernas Quad",
                    "grupos": "Quadríceps, Panturrilha",
                    "exercicios": exercicios_pernas[:3] + [exercicios_pernas[4]]
                },
                {
                    "nome": "Push 2 - Ombros e Peito",
                    "grupos": "Ombros, Peito, Tríceps",
                    "exercicios": exercicios_ombros[:3] + exercicios_peito[:2] + exercicios_triceps[:1]
                },
                {
                    "nome": "Pull 2 - Costas e Bíceps",
                    "grupos": "Costas, Bíceps, Trapézio",
                    "exercicios": exercicios_costas + exercicios_biceps[:2]
                },
                {
                    "nome": "Legs 2 - Pernas Post",
                    "grupos": "Posterior, Glúteos, Panturrilha",
                    "exercicios": [exercicios_pernas[0], exercicios_pernas[3], exercicios_pernas[1], exercicios_pernas[4]] + exercicios_abdomen
                }
            ]
        },
        7: {
            "nome": "Treino Diário Especializado",
            "divisao": "7 dias",
            "dias": [
                {"nome": "Segunda - Peito", "grupos": "Peito", "exercicios": exercicios_peito},
                {"nome": "Terça - Costas", "grupos": "Costas", "exercicios": exercicios_costas},
                {"nome": "Quarta - Pernas", "grupos": "Pernas", "exercicios": exercicios_pernas},
                {"nome": "Quinta - Ombros", "grupos": "Ombros", "exercicios": exercicios_ombros},
                {"nome": "Sexta - Braços", "grupos": "Bíceps, Tríceps", "exercicios": exercicios_biceps + exercicios_triceps},
                {"nome": "Sábado - Pernas 2", "grupos": "Glúteos, Posterior", "exercicios": exercicios_pernas[1:] + exercicios_abdomen},
                {"nome": "Domingo - Cardio/Core", "grupos": "Core, Cardio", "exercicios": exercicios_abdomen + [{"nome": "Cardio HIIT", "series": 1, "repeticoes": "20 min", "descanso": "-", "carga_sugerida": ""}]}
            ]
        }
    }
    
    # Pegar divisão correta
    dias_validos = min(max(dias, 2), 7)
    treino = divisoes.get(dias_validos, divisoes[4]).copy()
    
    # Ajustar descrição baseada no objetivo
    descricoes = {
        "hipertrofia": "Foco em ganho de massa muscular",
        "forca": "Foco em ganho de força máxima",
        "emagrecimento": "Foco em queima de gordura e definição",
        "condicionamento": "Foco em saúde e condicionamento geral"
    }
    treino["descricao"] = descricoes.get(objetivo, descricoes["hipertrofia"])
    
    # Ajustar séries/reps baseado no nível
    import copy
    treino_ajustado = copy.deepcopy(treino)
    
    for dia in treino_ajustado["dias"]:
        for ex in dia["exercicios"]:
            if nivel == "iniciante":
                ex["series"] = max(2, ex["series"] - 1)
            elif nivel == "avancado":
                ex["series"] = min(6, ex["series"] + 1)
            
            # Ajustar para objetivo
            if objetivo == "forca":
                ex["repeticoes"] = "4-6"
                ex["descanso"] = "180s"
            elif objetivo == "emagrecimento":
                ex["repeticoes"] = "15-20"
                ex["descanso"] = "45s"
    
    return treino_ajustado

def gerar_treino_chat(perfil, objetivo: str = None) -> dict:
    """Gera um treino baseado no perfil usando a nova função de dias"""
    
    objetivo_usuario = objetivo or getattr(perfil, 'objetivo_principal', '') or getattr(perfil, 'objetivo', 'hipertrofia')
    nivel = getattr(perfil, 'nivel', 'iniciante')
    dias = getattr(perfil, 'dias_disponiveis', 4)
    
    # Se dias é uma lista, pegar o tamanho
    if isinstance(dias, list):
        dias = len(dias)
    
    return gerar_treino_por_dias(dias, objetivo_usuario, nivel)

@app.post("/chat/perguntar")
async def chat_perguntar(request: ChatRequest):
    """
    💬 Chat com o Coach Virtual
    
    Processa mensagens do usuário, detecta intenções de ajuste de treino,
    e pode gerar/modificar treinos conforme solicitado.
    """
    if not gerenciador_perfil:
        raise HTTPException(status_code=503, detail="Serviço não disponível")
    
    try:
        # Obter perfil do usuário
        perfil = gerenciador_perfil.obter_perfil(request.usuario_id)
        if not perfil:
            raise HTTPException(status_code=404, detail="Perfil não encontrado")
        
        # Detectar intenção
        intencao = detectar_intencao_treino(request.mensagem)
        
        resposta_data = {
            "resposta": "",
            "treino_atualizado": None,
            "acao": None
        }
        
        if intencao["tipo"] == "gerar_treino":
            # Gerar novo treino
            novo_treino = gerar_treino_chat(perfil)
            
            # Salvar treino no perfil
            perfil.treino_atual = novo_treino
            gerenciador_perfil.atualizar_perfil(request.usuario_id, {"treino_atual": novo_treino})
            
            resposta_data["resposta"] = f"""🏋️ Pronto! Criei seu novo treino personalizado!

**{novo_treino['nome']}**
📋 Divisão: {novo_treino['divisao']}
📝 {novo_treino['descricao']}

O treino foi adaptado para seu objetivo e nível. Quando quiser, pode voltar à Home para ver os detalhes completos e começar a treinar!

Quer que eu faça algum ajuste específico?"""
            
            resposta_data["treino_atualizado"] = novo_treino
            
        elif intencao["tipo"] == "ajustar_treino":
            resposta_data["resposta"] = """Claro! Posso ajustar seu treino de várias formas:

🔄 **Trocar exercícios** - Substituir por alternativas
➕ **Adicionar exercícios** - Incluir novos movimentos
➖ **Remover exercícios** - Simplificar a rotina
📈 **Ajustar volume** - Mudar séries/repetições

O que você gostaria de modificar especificamente?"""
            
        elif intencao["tipo"] in ["adicionar_exercicio", "remover_exercicio"]:
            resposta_data["resposta"] = """Entendi! Para fazer essa alteração, preciso saber:

1. **Qual treino?** (A, B, C ou o nome)
2. **Qual exercício?** 

Me diga exatamente o que deseja e eu atualizo seu treino!"""
            
        elif intencao["tipo"] in ["aumentar_carga", "diminuir_carga"]:
            acao = "aumentar" if "aumentar" in intencao["tipo"] else "diminuir"
            resposta_data["resposta"] = f"""💪 Boa! {acao.capitalize()} a carga é parte natural da progressão.

**Dicas para progressão segura:**
- Aumente de 2.5kg a 5kg por vez
- Mantenha a forma correta
- Se não conseguir as repetições, volte à carga anterior

Qual exercício você quer {acao}? Posso te ajudar a definir a carga ideal."""
            
        else:
            # Pergunta geral - usar o coach
            if embedding_model:
                try:
                    user_context = {
                        "objetivo": getattr(perfil, 'objetivo_principal', '') or getattr(perfil, 'objetivo', ''),
                        "nivel": perfil.nivel,
                        "limitacoes": perfil.limitacoes
                    }
                    resultado = embedding_model.get_context_response(request.mensagem, user_context)
                    resposta_data["resposta"] = resultado.get("resposta", "Não consegui processar sua pergunta.")
                except:
                    resposta_data["resposta"] = _resposta_fallback(request.mensagem)
            else:
                resposta_data["resposta"] = _resposta_fallback(request.mensagem)
        
        # Registrar interação
        try:
            interacao = Interacao(
                timestamp=datetime.now().isoformat(),
                pergunta=request.mensagem,
                resposta=resposta_data["resposta"],
                topicos=[intencao["tipo"]],
                contexto={"intencao": intencao}
            )
            gerenciador_perfil.registrar_interacao(request.usuario_id, interacao)
        except:
            pass
        
        return resposta_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no chat: {e}")
        traceback.print_exc()
        return {
            "resposta": "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?",
            "treino_atualizado": None,
            "acao": None
        }

def _resposta_fallback(mensagem: str) -> str:
    """Resposta padrão quando ML não está disponível"""
    mensagem_lower = mensagem.lower()
    
    if any(p in mensagem_lower for p in ["treino", "exercicio", "musculacao"]):
        return """Ótima pergunta sobre treino! 💪

Para um treino eficiente, lembre-se:
- Descanse 48h entre trabalhar o mesmo músculo
- Faça aquecimento antes de começar
- Progrida gradualmente as cargas
- Mantenha boa alimentação e sono

Quer que eu gere um treino personalizado para você?"""
    
    elif any(p in mensagem_lower for p in ["dieta", "alimentacao", "comer", "nutricao"]):
        return """🥗 Sobre alimentação para resultados:

**Proteínas:** 1.6-2.2g por kg de peso
**Carboidratos:** Fonte de energia para treinar
**Gorduras boas:** Importantes para hormônios
**Hidratação:** Mínimo 2L de água/dia

Consulte um nutricionista para um plano personalizado!"""
    
    elif any(p in mensagem_lower for p in ["descanso", "recuperacao", "dormir", "sono"]):
        return """😴 O descanso é fundamental!

- Durma 7-9 horas por noite
- Descanse 48-72h entre treinos do mesmo músculo
- Ouça seu corpo - dor persistente é sinal de alerta
- Considere uma semana de deload a cada 4-6 semanas"""
    
    else:
        return """Olá! Sou seu Coach Virtual de Musculação! 🏋️

Posso te ajudar com:
- 📋 Criar e ajustar seu treino
- 💪 Dúvidas sobre exercícios
- 🍎 Dicas de alimentação
- 😴 Orientações sobre descanso

O que você gostaria de saber?"""


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
