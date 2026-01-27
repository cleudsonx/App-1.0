import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "version" in data

def test_coach():
    r = client.get("/coach", params={"q": "como fazer supino", "nome": "Teste", "objetivo": "hipertrofia", "nivel": "iniciante"})
    assert r.status_code == 200
    data = r.json()
    assert "answer" in data

def test_suggest():
    r = client.get("/suggest", params={"objetivo": "hipertrofia", "nivel": "intermediario", "diasSemana": 4})
    assert r.status_code == 200
    data = r.json()
    assert "treinos" in data
