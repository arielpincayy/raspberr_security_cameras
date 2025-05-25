import os
import sys
import time
import uuid
from datetime import datetime
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput

from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

# ========== CONFIGURACIÓN DE BASE DE DATOS ==========
DATABASE_URL = "cockroachdb://root@192.168.137.51:26257/raspsec?sslmode=disable"
engine = create_engine(DATABASE_URL)
Base = declarative_base()

class Evento(Base):
    __tablename__ = 'eventos'
    id = Column(String(50), primary_key=True)
    timestamp = Column(DateTime, nullable=False)
    lugar = Column(String(100), nullable=False)
    tipo = Column(String(10), nullable=False)
    filename = Column(String(255), nullable=True)
    reported = Column(Boolean, default=False)
    space = Column(Integer, default=1)

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

# ========== FUNCIÓN PARA REGISTRAR EVENTO ==========
def registrar_evento(tipo, filename, timestamp, id):
    evento = Evento(
        id=id,
        timestamp=timestamp,
        lugar="Aula 2",
        tipo=tipo,
        filename=filename,
        reported=False,
        space=2
    )
    session.add(evento)
    session.commit()
    print(f"Evento '{tipo}' registrado: {filename}")

# ========== FUNCIÓN PRINCIPAL ==========
def take_event(rec_time):
    output_folder = "/home/ariel/Desktop/raspsec/files"
    os.makedirs(output_folder, exist_ok=True)

    try:
        picam = Picamera2()
    except Exception as e:
        print(f"Error al inicializar la cámara: {e}")
        return

    try:
        picam.configure(picam.create_still_configuration())
        picam.start()
        time.sleep(2)

        timestamp = datetime.now()
        uid = str(uuid.uuid4())
        path_name_ref = f'photo_{timestamp.strftime("%Y-%m-%d_%H-%M-%S")}.jpg'
        foto_filename = os.path.join(output_folder, path_name_ref)
        picam.capture_file(foto_filename)
        print(f"Foto guardada: {foto_filename}")
        registrar_evento("foto", f'files/{path_name_ref}', timestamp, uid)

        picam.stop()
        time.sleep(1)
    except Exception as e:
        print(f"Error al capturar la foto: {e}")
        return

    try:
        picam.configure(picam.create_video_configuration())
        picam.start()
        time.sleep(1)
        
        path_name_ref = f'video_{timestamp.strftime("%Y-%m-%d_%H-%M-%S")}.h264'
        video_filename = os.path.join(output_folder, f'video_{timestamp.strftime("%Y-%m-%d_%H-%M-%S")}.h264')
        encoder = H264Encoder()
        output = FileOutput(video_filename)
        picam.start_recording(encoder, output)
        time.sleep(rec_time)
        picam.stop_recording()
        print(f"Video guardado: {video_filename}")

        registrar_evento("video", f'files/{path_name_ref}', timestamp, f"{uid}_video")

        picam.stop()
    except Exception as e:
        print(f"Error al grabar el video: {e}")
        return

# ========== MAIN ==========
if __name__ == "__main__":
    rec_time = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    take_event(rec_time)
