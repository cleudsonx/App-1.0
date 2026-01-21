FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8001

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary app files (exclude tests, logs, cache)
COPY main.py main_ml.py ./
COPY models/ ./models/
COPY security/ ./security/

# Create directories for runtime data
RUN mkdir -p data/users data/auth logs

EXPOSE 8001
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
