#!/bin/bash
# Healthcheck para ML service Python (ajuste a URL conforme necessário)
URL_PYTHON="https://SEU_ML_SERVICE.onrender.com/health"

http_code=$(curl -s -o /dev/null -w "%{http_code}" "$URL_PYTHON")
if [ "$http_code" = "200" ]; then
  echo "ML service Python OK ($http_code)"
  exit 0
else
  echo "ML service Python FALHOU ($http_code)"
  exit 1
fi
