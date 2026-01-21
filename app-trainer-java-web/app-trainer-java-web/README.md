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

## HTTPS (producao)
Para habilitar HTTPS no servidor Java:

1. Gere um certificado (PKCS12):
```powershell
keytool -genkeypair -alias app-trainer -keyalg RSA -keysize 2048 -validity 365 \
	-storetype PKCS12 -keystore certs/app-trainer.p12 -storepass CHANGEME \
	-dname "CN=app-trainer, OU=Eng, O=APP, L=Sao Paulo, ST=SP, C=BR"
```
2. Defina variaveis de ambiente antes de executar:
```powershell
$env:HTTPS_ENABLED = "true"
$env:HTTPS_PORT = "8443"
$env:TLS_KEYSTORE_PATH = "c:/caminho/para/certs/app-trainer.p12"
$env:TLS_KEYSTORE_PASSWORD = "CHANGEME"
# Opcional: $env:TLS_KEYSTORE_TYPE = "PKCS12" # (default)
```
3. Inicie o servidor normalmente:
```powershell
cd app-trainer-java-web
javac -d bin src/*.java src/api/*.java src/storage/*.java src/db/*.java src/log/*.java
java -cp bin WebServer
```
O servidor exibira URLs com https:// e usara a porta configurada (default 8443).
