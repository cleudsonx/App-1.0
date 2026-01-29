FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
#    PORT=8001   <-- remova ou comente esta linha

# Instala dependências
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia arquivos e pastas essenciais
COPY main.py .
COPY main_ml.py .
COPY models/ ./models/
COPY security/ ./security/
COPY data/ ./data/

EXPOSE 8001
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port $PORT"]