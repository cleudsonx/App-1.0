import os

# Porta e chave JWT vindas do Render
PORT = int(os.getenv("PORT", "8001"))
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_secret_key")
def send_confirmation_email(email: str, token: str, user_id: str):
    # Função de envio de email de confirmação
    # Implemente aqui o envio real de email
    print(f"Enviando email de confirmação para {email} com token {token} e user_id {user_id}")

"""
ML Service para APP Trainer
Coach Virtual com NLP e geração de treino inteligente

v2.0 - Melhorias:
- Base de conhecimento expandida
- Geração de treino personalizada
- Análise de contexto do aluno
- Scoring de relevância
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import re
import random
import uuid
import json
import smtplib
import secrets
from email.message import EmailMessage
from pathlib import Path

# Security imports
from security.password_hasher import PasswordHasher
from security.jwt_manager import JWTManager, TokenPair
from security.rate_limiter import RateLimiter
from security.input_validator import InputValidator, ValidationResult
from security.app_logger import logger

app = FastAPI(
    title="APP Trainer ML Service",
    version="2.0.0",
    description="Serviço de IA para Coach Virtual de Musculação"
)

# CORS para acesso web (shaipados.com)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://shaipados.com",
        "https://cleudsonx.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ AUTENTICAÇÃO ============

USERS_DIR = Path(__file__).parent / "data" / "auth"
USERS_DIR.mkdir(parents=True, exist_ok=True)
USERS_FILE = USERS_DIR / "users.json"

def load_users() -> Dict[str, Any]:
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text(encoding="utf-8"))
    return {}

def save_users(users: Dict[str, Any]):
    USERS_FILE.write_text(json.dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")

class LoginRequest(BaseModel):
    email: str
    senha: str

class RegisterRequest(BaseModel):
    nome: str
    email: str
    senha: str

class AuthResponse(BaseModel):
    user_id: str
    nome: str
    email: str
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"
    perfil: Optional[Dict[str, Any]] = None

class VerifyResponse(BaseModel):
    valid: bool
    tem_perfil_completo: bool = False
    objetivo: Optional[str] = None
    nivel: Optional[str] = None

@app.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login with JWT tokens and rate limiting
    - Validates password with PBKDF2
    - Rate limit: 5 attempts per 5 minutes
    - Returns access + refresh tokens
    """
    # 🔐 Rate limiting
    if not RateLimiter.is_allowed(request.email):
        wait_seconds = RateLimiter.get_wait_time_seconds(request.email)
        logger.auth_attempt(request.email, success=False, reason="RATE_LIMITED")
        raise HTTPException(
            status_code=429,
            detail=f"Muitas tentativas. Aguarde {wait_seconds} segundos"
        )
    
    users = load_users()
    
    for user_id, user_data in users.items():
        if user_data["email"] == request.email:
            # 🔐 Verify password with PBKDF2
            if PasswordHasher.verify_password(request.senha, user_data["senha_hash"]):
                # ✅ Login successful - reset rate limiter
                RateLimiter.reset(request.email)
                
                # Generate JWT tokens
                tokens = JWTManager.generate_tokens(user_id, request.email)
                
                logger.auth_attempt(request.email, success=True, user_id=user_id)
                
                return AuthResponse(
                    user_id=user_id,
                    nome=user_data["nome"],
                    email=user_data["email"],
                    access_token=tokens.access_token,
                    refresh_token=tokens.refresh_token,
                    expires_in=tokens.expires_in,
                    perfil=user_data.get("perfil")
                )
            else:
                logger.auth_attempt(request.email, success=False, reason="INVALID_PASSWORD")
                raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    logger.auth_attempt(request.email, success=False, reason="USER_NOT_FOUND")
    raise HTTPException(status_code=401, detail="Email ou senha inválidos")

@app.post("/auth/registro", response_model=AuthResponse, status_code=201)
async def registro(request: RegisterRequest):
    """
    Register new user with secure password hashing
    - Password hashed with PBKDF2 (10k iterations)
    - Password strength validation (8+ chars, maiuscula, numero, simbolo)
    - Email validation
    - Returns JWT tokens
    """
    users = load_users()
    
    # ✅ Validar email
    if not InputValidator.is_valid_email(request.email):
        raise HTTPException(status_code=400, detail="Email inválido")
    
    # ✅ Validar nome
    if not InputValidator.is_valid_name(request.nome):
        raise HTTPException(status_code=400, detail="Nome inválido")
    
    # Verificar se email já existe
    for user_data in users.values():
        if user_data["email"] == request.email:
            raise HTTPException(status_code=409, detail="Email já cadastrado")
    
    # ✅ Validar força da senha (mesmas regras do Java)
    password_result = InputValidator.validate_password(request.senha)
    if not password_result.valid:
        raise HTTPException(status_code=400, detail=password_result.message)
    
    user_id = uuid.uuid4().hex[:12]
    
    # 🔐 Hash password with PBKDF2
    senha_hash = PasswordHasher.hash_password(request.senha)
    
    users[user_id] = {
        "nome": request.nome,
        "email": request.email,
        "senha_hash": senha_hash,
        "perfil": None
    }
    save_users(users)
    
    # Gerar token de confirmação
    confirm_token = secrets.token_urlsafe(32)
    users[user_id] = {
        "nome": request.nome,
        "email": request.email,
        "senha_hash": senha_hash,
        "perfil": None,
        "email_confirmed": False,
        "confirm_token": confirm_token
    }
    save_users(users)

    # Enviar email de confirmação
    send_confirmation_email(request.email, confirm_token, user_id)

    logger.info(f"Novo usuário registrado: {request.email}", user_id=user_id)

    return {"message": "Cadastro realizado. Confirme seu email para ativar a conta."}

class RefreshRequest(BaseModel):
    refresh_token: str

class RefreshResponse(BaseModel):
    access_token: str
    expires_in: int
    token_type: str = "Bearer"

@app.post("/auth/refresh", response_model=RefreshResponse)
async def refresh_token(request: RefreshRequest):
    """
    Refresh access token using refresh token
    - Validates refresh token
    - Generates new access token (15 minutes)
    """
    # 🔐 Verify refresh token
    payload = JWTManager.verify_token(request.refresh_token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado")
    
    # Verify it's actually a refresh token
    if payload.token_type != "refresh":
        raise HTTPException(status_code=401, detail="Token fornecido não é um refresh token")
    
    # Verify user still exists
    users = load_users()
    if payload.user_id not in users:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    # ✅ Generate new access token
    new_access_token = JWTManager.generate_access_token(payload.user_id, payload.email)
    
    return RefreshResponse(
        access_token=new_access_token,
        expires_in=900  # 15 minutes
    )

@app.get("/auth/verificar/{user_id}", response_model=VerifyResponse)
async def verificar_usuario(user_id: str):
    users = load_users()
    
    if user_id not in users:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user = users[user_id]
    perfil = user.get("perfil") or {}
    
    return VerifyResponse(
        valid=True,
        tem_perfil_completo=bool(perfil.get("objetivo")),
        objetivo=perfil.get("objetivo"),
        nivel=perfil.get("nivel")
    )

class PerfilRequest(BaseModel):
    idade: Optional[int] = None
    peso: Optional[float] = None
    altura: Optional[float] = None
    sexo: Optional[str] = None
    objetivo: Optional[str] = None
    nivel: Optional[str] = None
    dias_disponiveis: Optional[List[int]] = None
    local: Optional[str] = None
    equipamentos: Optional[List[str]] = None

@app.post("/perfil/{user_id}")
async def salvar_perfil(user_id: str, request: PerfilRequest):
    users = load_users()
    
    if user_id not in users:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    users[user_id]["perfil"] = request.dict(exclude_none=True)
    save_users(users)
    
    return {"success": True, "perfil": users[user_id]["perfil"]}

@app.get("/perfil/{user_id}")
async def obter_perfil(user_id: str):
    users = load_users()
    
    if user_id not in users:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user = users[user_id]
    perfil = user.get("perfil") or {}
    
    # Incluir dados básicos do usuário junto com o perfil
    return {
        "nome": user.get("nome"),
        "email": user.get("email"),
        **perfil
    }

@app.post("/perfil/{user_id}/completar")
async def completar_perfil(user_id: str, request: PerfilRequest):
    """Endpoint para completar o perfil após onboarding"""
    users = load_users()
    
    if user_id not in users:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    users[user_id]["perfil"] = request.dict(exclude_none=True)
    save_users(users)
    
    return {"success": True, "perfil": users[user_id]["perfil"]}

# ============ BASE DE CONHECIMENTO ============

CONHECIMENTO = {
    "hipertrofia": {
        "keywords": ["hipertrofia", "massa", "muscular", "crescer", "volume", "ganhar massa"],
        "respostas": [
            "Para hipertrofia, trabalhe na faixa de 8-12 repetições com tempo sob tensão de 40-60 segundos por série.",
            "O volume semanal ideal para hipertrofia é de 10-20 séries por grupo muscular, distribuídas em 2-3 treinos.",
            "Progressive overload é essencial: aumente carga, reps ou volume progressivamente.",
            "Descanse 60-90 segundos entre séries para otimizar o estímulo metabólico.",
            "Consuma 1.6-2.2g de proteína por kg de peso corporal para suportar o crescimento muscular."
        ]
    },
    "força": {
        "keywords": ["força", "forte", "pesado", "carga máxima", "1rm", "powerlifting"],
        "respostas": [
            "Para força máxima, trabalhe com 1-5 repetições e 85-95% da carga máxima.",
            "Descanse 3-5 minutos entre séries pesadas para recuperação neural completa.",
            "Foque nos movimentos compostos: agachamento, supino, terra e desenvolvimento.",
            "Periodização é fundamental: alterne semanas de volume e intensidade.",
            "A velocidade de execução deve ser explosiva na fase concêntrica."
        ]
    },
    "perda_peso": {
        "keywords": ["emagrecer", "perder peso", "secar", "definir", "gordura", "cardio"],
        "respostas": [
            "Combine treino de força com cardio para maximizar o gasto calórico.",
            "Mantenha a proteína alta (2g/kg) mesmo em déficit para preservar massa muscular.",
            "Déficit calórico de 300-500kcal é seguro e sustentável.",
            "Treinos em circuito aumentam o EPOC (queima pós-treino).",
            "Priorize exercícios compostos que recrutam mais músculos e gastam mais energia."
        ]
    },
    "resistência": {
        "keywords": ["resistência", "condicionamento", "endurance", "aeróbico", "cardio"],
        "respostas": [
            "Para resistência, trabalhe com 15-25 repetições e descansos curtos (30-60s).",
            "Combine treino intervalado (HIIT) com steady-state cardio.",
            "Progressão: aumente duração antes de aumentar intensidade.",
            "Monitore a frequência cardíaca para treinar nas zonas adequadas.",
            "Hidratação é crucial para performance em resistência."
        ]
    },
    "técnica_agachamento": {
        "keywords": ["agachamento", "squat", "agachar"],
        "respostas": [
            "Pés na largura dos ombros ou ligeiramente mais largos, pontas para fora.",
            "Desça controladamente, mantendo joelhos alinhados com os pés.",
            "Profundidade ideal: coxas paralelas ao solo ou abaixo (se mobilidade permitir).",
            "Core ativado, peito alto, olhar para frente durante todo o movimento.",
            "Na subida, empurre o chão e contraia glúteos no topo."
        ]
    },
    "técnica_supino": {
        "keywords": ["supino", "bench", "press peito"],
        "respostas": [
            "Escápulas retraídas e deprimidas, criando arco torácico estável.",
            "Pegada ligeiramente mais larga que a largura dos ombros.",
            "Desça a barra até tocar levemente o esterno (parte baixa do peito).",
            "Cotovelos em ~45-75 graus do corpo, não totalmente abertos.",
            "Empurre em linha reta, travando cotovelos no topo."
        ]
    },
    "técnica_terra": {
        "keywords": ["terra", "deadlift", "levantamento"],
        "respostas": [
            "Pés na largura dos quadris, barra sobre o meio dos pés.",
            "Pegada na largura dos ombros, mista ou overhand.",
            "NUNCA arredonde a lombar - mantenha coluna neutra.",
            "O movimento começa empurrando o chão, não puxando a barra.",
            "Barra deve permanecer próxima ao corpo durante todo o movimento."
        ]
    },
    "divisão_treino": {
        "keywords": ["divisão", "split", "abc", "ppl", "push pull", "full body"],
        "respostas": [
            "Iniciantes: Full Body 3x/semana para aprender os movimentos.",
            "Intermediários: Upper/Lower 4x ou Push/Pull/Legs 3-6x/semana.",
            "A melhor divisão é aquela que você consegue manter consistentemente.",
            "Maior frequência = menor volume por sessão = boa recuperação.",
            "Considere seu tempo disponível e capacidade de recuperação."
        ]
    },
    "descanso": {
        "keywords": ["descanso", "recuperação", "sono", "overtraining", "deload"],
        "respostas": [
            "Músculos crescem durante o descanso, não durante o treino.",
            "7-9 horas de sono de qualidade são essenciais para recuperação.",
            "Sinais de overtraining: fadiga crônica, queda de performance, irritabilidade.",
            "Faça semanas de deload (50-60% volume) a cada 4-6 semanas.",
            "Mínimo 48 horas entre treinos do mesmo grupo muscular."
        ]
    },
    "nutrição": {
        "keywords": ["proteína", "carboidrato", "nutrição", "dieta", "comer", "alimentação"],
        "respostas": [
            "Proteína: 1.6-2.2g/kg de peso corporal distribuída ao longo do dia.",
            "20-40g de proteína por refeição para síntese muscular ótima.",
            "Carboidratos são combustível para treinos intensos - não os evite.",
            "Para ganhar massa: superávit de 300-500kcal. Para perder: déficit similar.",
            "Hidratação: 35-40ml de água por kg de peso corporal."
        ]
    },
    "lesão": {
        "keywords": ["lesão", "dor", "machucado", "joelho", "ombro", "lombar", "coluna"],
        "respostas": [
            "Dor aguda = pare imediatamente e avalie com profissional.",
            "DOMS (dor muscular tardia) é normal; dor articular NÃO é.",
            "Aquecimento específico reduz significativamente risco de lesões.",
            "Respeite a amplitude que seu corpo permite sem forçar.",
            "Fortalecimento preventivo é melhor que reabilitação."
        ]
    }
}

EXERCICIOS_DB = {
    "peito": [
        {"nome": "Supino Reto com Barra", "tipo": "composto", "equipamento": ["barra", "banco"]},
        {"nome": "Supino Inclinado com Halteres", "tipo": "composto", "equipamento": ["halteres", "banco"]},
        {"nome": "Crucifixo na Máquina", "tipo": "isolador", "equipamento": ["maquina"]},
        {"nome": "Crossover no Cabo", "tipo": "isolador", "equipamento": ["cabo"]},
        {"nome": "Flexão de Braço", "tipo": "composto", "equipamento": ["peso_corpo"]},
    ],
    "costas": [
        {"nome": "Remada Curvada com Barra", "tipo": "composto", "equipamento": ["barra"]},
        {"nome": "Puxada Frontal", "tipo": "composto", "equipamento": ["cabo", "maquina"]},
        {"nome": "Remada Unilateral com Halter", "tipo": "composto", "equipamento": ["halteres", "banco"]},
        {"nome": "Remada no Cabo (Seated Row)", "tipo": "composto", "equipamento": ["cabo"]},
        {"nome": "Pulldown na Polia", "tipo": "composto", "equipamento": ["cabo"]},
    ],
    "pernas": [
        {"nome": "Agachamento Livre", "tipo": "composto", "equipamento": ["barra"]},
        {"nome": "Leg Press 45°", "tipo": "composto", "equipamento": ["maquina"]},
        {"nome": "Extensora", "tipo": "isolador", "equipamento": ["maquina"]},
        {"nome": "Mesa Flexora", "tipo": "isolador", "equipamento": ["maquina"]},
        {"nome": "Stiff com Barra", "tipo": "composto", "equipamento": ["barra"]},
        {"nome": "Afundo/Passada", "tipo": "composto", "equipamento": ["halteres", "peso_corpo"]},
    ],
    "ombros": [
        {"nome": "Desenvolvimento com Halteres", "tipo": "composto", "equipamento": ["halteres"]},
        {"nome": "Elevação Lateral", "tipo": "isolador", "equipamento": ["halteres", "cabo"]},
        {"nome": "Elevação Frontal", "tipo": "isolador", "equipamento": ["halteres"]},
        {"nome": "Face Pull", "tipo": "isolador", "equipamento": ["cabo"]},
    ],
    "biceps": [
        {"nome": "Rosca Direta com Barra", "tipo": "isolador", "equipamento": ["barra"]},
        {"nome": "Rosca Alternada com Halteres", "tipo": "isolador", "equipamento": ["halteres"]},
        {"nome": "Rosca Scott", "tipo": "isolador", "equipamento": ["barra", "banco"]},
        {"nome": "Rosca no Cabo", "tipo": "isolador", "equipamento": ["cabo"]},
    ],
    "triceps": [
        {"nome": "Tríceps Corda na Polia", "tipo": "isolador", "equipamento": ["cabo"]},
        {"nome": "Tríceps Testa", "tipo": "isolador", "equipamento": ["barra", "banco"]},
        {"nome": "Mergulho no Banco", "tipo": "composto", "equipamento": ["banco", "peso_corpo"]},
        {"nome": "Supino Fechado", "tipo": "composto", "equipamento": ["barra", "banco"]},
    ],
    "gluteos": [
        {"nome": "Hip Thrust", "tipo": "composto", "equipamento": ["barra", "banco"]},
        {"nome": "Elevação Pélvica", "tipo": "isolador", "equipamento": ["peso_corpo"]},
        {"nome": "Abdução de Quadril", "tipo": "isolador", "equipamento": ["maquina", "cabo"]},
    ],
    "abdomen": [
        {"nome": "Prancha", "tipo": "isométrico", "equipamento": ["peso_corpo"]},
        {"nome": "Abdominal Crunch", "tipo": "isolador", "equipamento": ["peso_corpo"]},
        {"nome": "Abdominal Infra", "tipo": "isolador", "equipamento": ["peso_corpo"]},
    ]
}


# ============ FUNÇÕES NLP ============

def normalizar(texto: str) -> str:
    """Normaliza texto: lowercase, remove acentos e pontuação"""
    if not texto:
        return ""
    s = texto.lower().strip()
    replacements = {
        'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e',
        'í': 'i', 'ì': 'i',
        'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o',
        'ú': 'u', 'ù': 'u',
        'ç': 'c'
    }
    for old, new in replacements.items():
        s = s.replace(old, new)
    s = re.sub(r'[^\w\s]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def encontrar_topico(pergunta: str) -> tuple:
    """Encontra o tópico mais relevante e retorna (topico, score)"""
    pergunta_norm = normalizar(pergunta)
    melhor_topico = None
    melhor_score = 0
    
    for topico, dados in CONHECIMENTO.items():
        score = 0
        for keyword in dados["keywords"]:
            if normalizar(keyword) in pergunta_norm:
                score += len(keyword)
        
        if score > melhor_score:
            melhor_score = score
            melhor_topico = topico
    
    return melhor_topico, melhor_score


def gerar_resposta_coach(pergunta: str, nome: Optional[str], objetivo: Optional[str], nivel: Optional[str]) -> str:
    """Gera resposta do coach baseada em NLP"""
    
    topico, score = encontrar_topico(pergunta)
    
    ctx_parts = []
    if nome:
        ctx_parts.append(f"Olá, {nome}!")
    if objetivo:
        ctx_parts.append(f"Considerando seu objetivo de {objetivo}")
    if nivel:
        ctx_parts.append(f"e seu nível {nivel}")
    
    contexto = " ".join(ctx_parts) + "." if ctx_parts else ""
    
    if topico and score > 0:
        respostas = CONHECIMENTO[topico]["respostas"]
        selected = random.sample(respostas, min(3, len(respostas)))
        resposta_base = " ".join(selected)
    else:
        resposta_base = (
            "Posso ajudar com dúvidas sobre técnica de exercícios, hipertrofia, força, "
            "divisão de treino, nutrição e prevenção de lesões. "
            "Faça uma pergunta mais específica para eu poder ajudar melhor!"
        )
    
    dica = ""
    if nivel:
        nivel_lower = nivel.lower()
        if "iniciante" in nivel_lower:
            dica = " 💡 Dica para iniciante: foque na técnica antes de aumentar carga!"
        elif "intermediario" in nivel_lower:
            dica = " 💡 Dica para intermediário: experimente técnicas avançadas como drop sets."
        elif "avancado" in nivel_lower:
            dica = " 💡 Dica para avançado: periodização é fundamental para continuar evoluindo."
    
    sugestao = ""
    if objetivo:
        obj_lower = objetivo.lower()
        if "hipertrofia" in obj_lower:
            sugestao = " Para seu objetivo de hipertrofia, mantenha volume alto e técnica controlada."
        elif "forca" in obj_lower:
            sugestao = " Para força, priorize exercícios compostos com cargas pesadas."
        elif "perda" in obj_lower or "emagrecer" in obj_lower:
            sugestao = " Para perda de peso, combine treino de força com déficit calórico moderado."
    
    return f"{contexto} {resposta_base}{sugestao}{dica}".strip()


def gerar_treino(objetivo: str, nivel: str, dias: int = 4, restricoes: str = "", equipamentos: str = "") -> dict:
    """Gera treino personalizado"""
    
    equip_disponiveis = set(e.strip().lower() for e in equipamentos.split(",") if e.strip())
    if not equip_disponiveis:
        equip_disponiveis = {"barra", "halteres", "maquina", "cabo", "banco", "peso_corpo"}
    
    restricoes_set = set(r.strip().lower() for r in restricoes.split(",") if r.strip())
    
    configs = {
        "hipertrofia": {"series": (3, 4), "reps": (8, 12), "descanso": 75},
        "forca": {"series": (4, 5), "reps": (3, 6), "descanso": 180},
        "perda_peso": {"series": (3, 4), "reps": (12, 15), "descanso": 45},
        "resistencia": {"series": (2, 3), "reps": (15, 20), "descanso": 30}
    }
    
    config = configs.get(objetivo.lower(), configs["hipertrofia"])
    
    divisoes = {
        3: [["peito", "triceps", "ombros"], ["costas", "biceps"], ["pernas", "gluteos", "abdomen"]],
        4: [["peito", "triceps"], ["costas", "biceps"], ["pernas", "gluteos"], ["ombros", "abdomen"]],
        5: [["peito"], ["costas"], ["ombros", "triceps"], ["pernas"], ["biceps", "gluteos", "abdomen"]],
        6: [["peito", "triceps"], ["costas", "biceps"], ["pernas"], ["ombros"], ["peito", "costas"], ["pernas", "gluteos"]]
    }
    
    divisao = divisoes.get(dias, divisoes[4])
    
    def exercicio_valido(ex: dict) -> bool:
        tem_equip = any(e in equip_disponiveis for e in ex["equipamento"])
        sem_restricao = True
        if "joelho" in restricoes_set and ex["nome"].lower() in ["agachamento livre", "leg press 45°"]:
            sem_restricao = False
        if "ombro" in restricoes_set and "ombro" in ex["nome"].lower():
            sem_restricao = False
        return tem_equip and sem_restricao
    
    treinos = []
    for i, grupos in enumerate(divisao):
        dia = {
            "numero": i + 1,
            "nome": " / ".join([g.capitalize() for g in grupos]),
            "exercicios": []
        }
        
        ordem = 1
        for grupo in grupos:
            exercicios_grupo = EXERCICIOS_DB.get(grupo, [])
            validos = [e for e in exercicios_grupo if exercicio_valido(e)]
            
            n_exercicios = 3 if nivel.lower() != "iniciante" else 2
            selecionados = random.sample(validos, min(n_exercicios, len(validos))) if validos else []
            
            for ex in selecionados:
                series = random.randint(*config["series"])
                reps = random.randint(*config["reps"])
                
                dia["exercicios"].append({
                    "ordem": ordem,
                    "nome": ex["nome"],
                    "grupoMuscular": grupo,
                    "series": series,
                    "repeticoes": str(reps) if objetivo.lower() != "forca" else f"{reps}-{reps+2}",
                    "descansoSeg": config["descanso"]
                })
                ordem += 1
        
        treinos.append(dia)
    
    observacoes = {
        "hipertrofia": "Foque no tempo sob tensão (2s descida, 1s subida). Progrida carga quando atingir limite superior de reps em todas as séries.",
        "forca": "Priorize aquecimento progressivo. Descanse o tempo necessário entre séries pesadas. Não treine até a falha em todos os sets.",
        "perda_peso": "Mantenha transições rápidas entre exercícios. Considere fazer em formato de circuito. Combine com cardio nos outros dias.",
        "resistencia": "Mantenha ritmo constante. Hidrate-se bem. Considere adicionar cardio após o treino."
    }
    
    from fastapi.responses import RedirectResponse
    return {
        "nivel": nivel,
        "frequencia": f"{dias}x por semana",
        "treinos": treinos,
        "observacoes": observacoes.get(objetivo.lower(), "Mantenha consistência e progrida gradualmente.")
    }
# ============ ENDPOINTS ============

class CoachResponse(BaseModel):
    answer: str
    topico: Optional[str] = None
    confianca: float = 0.8

class SuggestResponse(BaseModel):
    titulo: str
    objetivo: str
    nivel: str
    frequencia: str
    treinos: List[Dict[str, Any]]
    observacoes: str

class HealthResponse(BaseModel):
    status: str
    version: str
    endpoints: List[str]


@app.get("/coach", response_model=CoachResponse)
async def coach_endpoint(
    q: str = Query(..., description="Pergunta do usuário"),
    nome: Optional[str] = Query(None, description="Nome do aluno"),
    objetivo: Optional[str] = Query(None, description="Objetivo do aluno"),
    nivel: Optional[str] = Query(None, description="Nível do aluno")
):
    """Coach Virtual - responde perguntas sobre musculação"""
    if not q.strip():
        raise HTTPException(status_code=400, detail="Pergunta não pode ser vazia")
    
    topico, score = encontrar_topico(q)
    resposta = gerar_resposta_coach(q, nome, objetivo, nivel)
    confianca = min(0.95, 0.5 + score * 0.05) if score > 0 else 0.5
    
    return CoachResponse(answer=resposta, topico=topico, confianca=confianca)


@app.get("/suggest", response_model=SuggestResponse)
async def suggest_endpoint(
    objetivo: str = Query(..., description="Objetivo: hipertrofia, forca, perda_peso, resistencia"),
    nivel: str = Query(..., description="Nível: iniciante, intermediario, avancado"),
    diasSemana: int = Query(4, ge=3, le=6, description="Dias de treino por semana"),
    restricoes: str = Query("", description="Restrições/lesões separadas por vírgula"),
    equipamentos: str = Query("", description="Equipamentos disponíveis separados por vírgula")
):
    """Gera sugestão de treino personalizado"""
    treino = gerar_treino(objetivo, nivel, diasSemana, restricoes, equipamentos)
    return SuggestResponse(**treino)



# Healthcheck padrão
@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check do serviço"""
    return HealthResponse(status="ok", version="2.0.0", endpoints=["/coach", "/suggest", "/health", "/docs"])

# Healthcheck para /ml/health
@app.get("/ml/health")
async def ml_health():
    return {"status": "ok"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "APP Trainer ML Service"}

@app.get("/")
async def root():
    return {"message": "APP Trainer ML Service v2.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
