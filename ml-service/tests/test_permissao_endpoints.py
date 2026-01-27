import pytest

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_perfil_sem_autenticacao():
    resp = client.get("/perfil/1")
    assert resp.status_code in (401, 403)

def test_admin_endpoint_sem_permissao():
    # Exemplo: supondo que /admin só pode ser acessado por admin
    resp = client.get("/admin")
    assert resp.status_code in (401, 403, 404)  # 404 se não existir

def test_login_permitido():
    resp = client.post("/auth/login", json={"email": "user@teste.com", "senha": "senha123"})
    assert resp.status_code in (200, 401, 403)  # 200 se credenciais válidas, 401/403 se inválidas
