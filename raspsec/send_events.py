import requests
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from db_config import Base, get_session
from models import Evento
import sys

if len(sys.argv) < 2:
    print("Uso: python send_events.py <ip_server>")
    sys.exit(1)

ip_server = sys.argv[1]

session = get_session()

Base.metadata.create_all(bind=session.get_bind())

# URL del servidor al que quieres enviar los datos
API_ENDPOINT = f"http://{ip_server}:8000/api/eventos/"  # ← cambia esto

# Obtener eventos no reportados
eventos = session.query(Evento).filter_by(reported=False).all()

for evento in eventos:
    data = {
        "id": evento.id,
        "timestamp": evento.timestamp.isoformat(),
        "lugar": evento.lugar,
        "tipo": evento.tipo,
        "filename": evento.filename,
        "space": evento.space
    }

    try:
        response = requests.post(API_ENDPOINT, json=data)
        if response.status_code == 200:
            evento.reported = True
            session.commit()
            print(f"Evento {evento.id} reportado exitosamente.")
        else:
            print(f"Fallo al reportar {evento.id}: {response.status_code}")
    except Exception as e:
        print(f"Error al conectar para {evento.id}: {e}")