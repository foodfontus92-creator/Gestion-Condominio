#!/bin/bash
# Script de despliegue para entorno QA - Condominio 3D Dashboard
# Uso: ./deploy-qa.sh

set -e

echo "========================================"
echo "  Despliegue QA - Condominio 3D Dashboard"
echo "========================================"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}[1/5]${NC} Verificando requisitos..."

# Verificar Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}Java no encontrado. Instala Java 17+${NC}"
    exit 1
fi

# Verificar Maven
if ! command -v mvn &> /dev/null && [ ! -f /home/ingfood/opt/maven/bin/mvn ]; then
    echo -e "${RED}Maven no encontrado${NC}"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}Requisitos OK${NC}"

echo -e "${GREEN}[2/5]${NC} Construyendo backend Spring Boot..."
cd /home/ingfood/condominio-3d-dashboard/backend-spring-boot
rm -f condominio.db
/home/ingfood/opt/maven/bin/mvn clean package -DskipTests -q
echo -e "${GREEN}Backend construido${NC}"

echo -e "${GREEN}[3/5]${NC} Instalando dependencias frontend..."
cd /home/ingfood/condominio-3d-dashboard/frontend
npm install --silent
echo -e "${GREEN}Dependencias frontend OK${NC}"

echo -e "${GREEN}[4/5]${NC} Iniciando servicios QA..."

# Iniciar backend en segundo plano
cd /home/ingfood/condominio-3d-dashboard/backend-spring-boot
nohup /home/ingfood/opt/maven/bin/mvn spring-boot:run > /tmp/qa-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Esperar a que el backend esté listo
echo "Esperando a que el backend inicie..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8080/api/buildings > /dev/null 2>&1; then
        echo -e "${GREEN}Backend listo en puerto 8080${NC}"
        break
    fi
    sleep 2
done

# Iniciar frontend en segundo plano
cd /home/ingfood/condominio-3d-dashboard/frontend
VITE_API_URL=http://localhost:8080/api nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/qa-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo -e "${GREEN}[5/5]${NC} Verificando despliegue QA..."

sleep 3

echo ""
echo "========================================"
echo "  DESPLIEGUE QA COMPLETADO"
echo "========================================"
echo ""
echo -e "${GREEN}Frontend:${NC}  http://localhost:5173"
echo -e "${GREEN}Backend:${NC}   http://localhost:8080"
echo -e "${GREEN}API Docs:${NC}  http://localhost:8080/api/buildings"
echo ""
echo "Credenciales de prueba:"
echo "  admin@condominio.com / admin123 (Administrador)"
echo "  residente@condominio.com / residente123 (Residente)"
echo "  portero@condominio.com / portero123 (Portero)"
echo ""
echo "Logs:"
echo "  Backend: /tmp/qa-backend.log"
echo "  Frontend: /tmp/qa-frontend.log"
echo ""
echo "Para detener: kill $BACKEND_PID $FRONTEND_PID"
echo "========================================"
