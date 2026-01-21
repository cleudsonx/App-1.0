#!/bin/bash
# Healthcheck para PostgreSQL no Render
# Use as variáveis de ambiente do Render para host, user, dbname, port

PGHOST="dpg-d5okgv5actks73a3uuc0-a.virginia-postgres.render.com"
PGUSER="cleudsonx"
PGDATABASE="postgres_app_1_0"
PGPORT=5432
PGPASSWORD="vKOXxdmv93HYJBXtETw6dNvzqxOdda58"

export PGPASSWORD

psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -p "$PGPORT" -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "PostgreSQL OK"
  exit 0
else
  echo "PostgreSQL FALHOU"
  exit 1
fi
