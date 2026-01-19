# APP Trainer (Java + Web)

Aplicativo simples para academia: cadastro de alunos, cadastro de professores e sugestão de treino, servidos via HTTP com página web.

## Requisitos
- Java 17 (JDK)

## Como executar
No diretório raiz do workspace:

```powershell
# Compilar
javac "app-trainer-java-web/src/Aluno.java" "app-trainer-java-web/src/Professor.java" "app-trainer-java-web/src/Storage.java" "app-trainer-java-web/src/WebServer.java"

# Executar
java -cp "app-trainer-java-web/src" WebServer
```

Abra: http://localhost:8080

## Endpoints
- `GET /api/alunos/add?nome=...&idade=...&objetivo=perda_peso|hipertrofia|resistencia&nivel=iniciante|intermediario|avancado`
- `GET /api/alunos/list`
- `GET /api/profs/add?nome=...&especialidade=musculacao|cardio|funcional|alongamento`
- `GET /api/profs/list`
- `GET /api/sugestao?objetivo=...&nivel=...`

## Armazenamento
- CSV em `app-trainer-java-web/data/` para alunos e professores.
- Incremental em memória com persistência a cada inclusão.
