#!/bin/bash

# Cargar variables desde config.txt
source <(grep = config.txt)

# Activar entorno virtual
source .venv/bin/activate

# Eliminar las tareas existentes
python removes_crons.py

# Ejecutar script de cron para captura periódica
python cron_cam.py "$REC_TIME" "$START_HOUR" "$END_HOUR" "$INTERVAL" "$SPACE" "$PLACE"

# Ejecutar escucha por Arduino en segundo plano
python cam_ardu.py "$REC_TIME" "$SPACE" "$PLACE" &

# Calcular hora y minuto para enviar eventos
OFFSET_MIN=$(( (SPACE - 1) * 3 ))
CRON_HOUR=$(( 9 + OFFSET_MIN / 60 ))
CRON_MIN=$(( OFFSET_MIN % 60 ))

# Ruta absoluta a Python del entorno virtual
PYTHON_PATH="$(pwd)/.venv/bin/python"
SCRIPT_PATH="$(pwd)/send_events.py"

# Añadir cron para enviar eventos a la hora calculada
(crontab -l 2>/dev/null; echo "$CRON_MIN $CRON_HOUR * * * $PYTHON_PATH $SCRIPT_PATH $SERVER_IP") | crontab -