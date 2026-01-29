# Stage 1: build
FROM eclipse-temurin:17-jdk as build
WORKDIR /app

# Copiar código fonte e libs
COPY src ./src
COPY lib ./lib

RUN mkdir -p bin \
 && find src -name "*.java" > sources.txt \
 && javac -encoding UTF-8 --release 17 -d bin -cp "lib/postgresql.jar:lib/json-20210307.jar:lib/junit-platform-console-standalone-1.9.3.jar" @sources.txt

# Stage 2: runtime
FROM eclipse-temurin:17-jre
WORKDIR /app

# Variáveis de ambiente
ENV PORT=8081
ENV HTTPS_ENABLED=false


# Copiar binários e recursos
COPY --from=build /app/bin ./bin
COPY lib ./lib
COPY data ./data
COPY src/log ./src/log
COPY src/WebServer.java ./src/WebServer.java

# Copiar o build do React (dist) para a pasta web do Java
COPY ../../dashboard-react/dist/ ./web/

# Criar diretório de logs
RUN mkdir -p logs

# Expor porta
EXPOSE 8081

# Comando de inicialização
CMD ["java","-cp","bin:lib/postgresql.jar","WebServer"]