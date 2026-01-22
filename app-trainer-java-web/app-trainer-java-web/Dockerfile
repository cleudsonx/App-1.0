# Stage 1: build
FROM eclipse-temurin:17-jdk as build
WORKDIR /app

# Copiar código fonte e libs
COPY src ./src
COPY lib ./lib

# Compilar os .java para bin/
RUN mkdir -p bin \
 && find src -name "*.java" > sources.txt \
 && javac -encoding UTF-8 --release 17 -d bin -cp "lib/postgresql.jar" @sources.txt

# Stage 2: runtime
FROM eclipse-temurin:17-jre
WORKDIR /app

# Variáveis de ambiente
ENV PORT=8081
ENV HTTPS_ENABLED=false

# Copiar binários e recursos
COPY --from=build /app/bin ./bin
COPY lib ./lib
COPY web ./web
COPY data ./data
COPY src/log ./src/log
COPY src/WebServer.java ./src/WebServer.java

# Criar diretório de logs
RUN mkdir -p logs

# Expor porta
EXPOSE 8081

# Comando de inicialização
CMD ["java","-cp","bin:lib/postgresql.jar","WebServer"]