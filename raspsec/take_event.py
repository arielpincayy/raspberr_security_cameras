import os
import sys
import time
import uuid
from datetime import datetime
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput
from models import Evento
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean
from db_config import Base, get_session
from getuser import get_system_user

# ========== SESIÓN Y ARGUMENTOS ==========
session = get_session()

rec_time = int(sys.argv[1])
space = int(sys.argv[2])
place = sys.argv[3]

usrname = get_system_user()

Base.metadata.create_all(bind=session.get_bind())

# ========== FUNCIONES ==========
def registrar_evento(tipo, filename, timestamp, id, space, place):
    evento = Evento(
        id=id,
        timestamp=timestamp,
        lugar=place,
        tipo=tipo,
        filename=filename,
        reported=False,
        space=space
    )
    session.add(evento)
    session.commit()
    print(f"Evento '{tipo}' registrado: {filename}")

def take_event(rec_time, space, place):
    output_folder = f"/home/{usrname}/Desktop/raspsec/files"
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
        photo_name = f'photo_{timestamp.strftime("%Y-%m-%d_%H-%M-%S")}.jpg'
        foto_path = os.path.join(output_folder, photo_name)
        picam.capture_file(foto_path)
        print(f"Foto guardada: {foto_path}")
        registrar_evento("foto", f'files/{photo_name}', timestamp, uid, space, place)

        picam.stop()
        time.sleep(1)
    except Exception as e:
        print(f"Error al capturar la foto: {e}")
        return

    try:
        picam.configure(picam.create_video_configuration())
        picam.start()
        time.sleep(1)

        video_name = f'video_{timestamp.strftime("%Y-%m-%d_%H-%M-%S")}.h264'
        video_path = os.path.join(output_folder, video_name)
        encoder = H264Encoder()
        output = FileOutput(video_path)
        picam.start_recording(encoder, output)
        time.sleep(rec_time)
        picam.stop_recording()
        print(f"Video guardado: {video_path}")

        registrar_evento("video", f'files/{video_name}', timestamp, f"{uid}_video", space, place)

        picam.stop()
    except Exception as e:
        print(f"Error al grabar el video: {e}")
        return

# ========== MAIN ==========
if __name__ == "__main__":
    take_event(rec_time, space, place)
