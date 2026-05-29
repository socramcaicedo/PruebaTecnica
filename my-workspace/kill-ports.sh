#!/bin/bash
# kill-dev-ports.sh
# Detecta y cierra TODOS los puertos de desarrollo (Node, Angular, etc.)

echo "=== Puertos activos de desarrollo ==="

# Buscar todos los PIDs de node.exe que estén escuchando puertos
PIDS=$(netstat -ano | grep LISTENING | grep -E ":(4200|4300|3000|5000|5500|8080|8000|8081|9000|1234|4000)" | awk '{print $5}' | sort -u)

if [ -z "$PIDS" ]; then
  echo "No hay puertos de desarrollo activos."
  exit 0
fi

for PID in $PIDS; do
  # Obtener el puerto que usa cada PID
  PORTS=$(netstat -ano | grep "LISTENING" | grep "$PID" | awk '{print $2}' | sed 's/.*://')
  echo "Matando PID $PID -> puerto(s): $PORTS"
  taskkill //PID "$PID" //F 2>/dev/null
done

echo ""
echo "=== Verificando ==="
netstat -ano | grep LISTENING | grep -E ":(4200|4300|3000|5000|5500|8080|8000|8081|9000|1234|4000)" && echo "Quedan puertos activos" || echo "Todos los puertos cerrados"
