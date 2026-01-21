FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8001

# System deps (optional): none for now

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

EXPOSE 8001
CMD ["python","-m","uvicorn","main:app","--host","0.0.0.0","--port","${PORT}"]
