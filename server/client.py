import requests
import json
import mysql.connector
from jsonschema import validate, ValidationError
from datetime import datetime

# URL del servidor remoto (ajusta IP si hace falta)
URL = "http://192.168.137.30:5000/get_events"

# Esquema JSON definido previamente
event_schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "id": { "type": "string" },
            "timestamp": { "type": "string", "format": "date-time" },
            "lugar": { "type": "string" },
            "tipo": { "type": "string", "enum": ["foto", "video"] },
            "filename": { "type": "string" },
            "space": { "type": "integer" }
        },
        "required": ["id", "timestamp", "lugar", "tipo", "filename", "space"]
    }
}

# Paso 1: Solicitar eventos al servidor
response = requests.get(URL)
data = response.json()

# Paso 2: Validar contra el esquema
try:
    validate(instance=data, schema=event_schema)
    print("✅ JSON válido.")
except ValidationError as e:
    print("❌ JSON inválido:", e)
    exit(1)

# Paso 3: Guardar en base local
conn = mysql.connector.connect(
    host="0.0.0.0",
    user="manuel",
    password="131202",
    database="proyecto_multimedia"
)
cursor = conn.cursor()

for evento in data:
    sql = """
        INSERT INTO eventos (id, timestamp, lugar, tipo, filename, space, reported)
        VALUES (%s, %s, %s, %s, %s, %s, TRUE)
    """
        # Parsear y convertir timestamp al formato correcto
    parsed_time = datetime.strptime(evento["timestamp"], "%a, %d %b %Y %H:%M:%S %Z")
    mysql_timestamp = parsed_time.strftime("%Y-%m-%d %H:%M:%S")

    val = (
        evento["id"],
        mysql_timestamp,
        evento["lugar"],
        evento["tipo"],
        evento["filename"],
        evento["space"]
    )
    try:
        cursor.execute(sql, val)
    except mysql.connector.IntegrityError:
        print(f"Evento ya existe: {evento['id']}")

conn.commit()
conn.close()
print("✅ Eventos guardados localmente.")
