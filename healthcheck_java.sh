#!/bin/bash
# Healthcheck para backend Java (ajuste a URL conforme necessário)
URL_JAVA="https://SEU_BACKEND_JAVA.onrender.com/health"

http_code=$(curl -s -o /dev/null -w "%{http_code}" "$URL_JAVA")
if [ "$http_code" = "200" ]; then
  echo "Backend Java OK ($http_code)"
  exit 0
else
  echo "Backend Java FALHOU ($http_code)"
  exit 1
fi
