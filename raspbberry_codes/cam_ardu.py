import serial
import uuid
import time
import sys
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput
from datetime import datetime

from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# ========== CONFIG DB ==========
DATABASE_URL = "cockroachdb://root@192.168.137.50:26257/raspsec?sslmode=disable"
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

# ========== CONFIG SCRIPT ==========
if len(sys.argv) > 1:
    REC_TIME = int(sys.argv[1])
else:
    REC_TIME = 10

picam = Picamera2()

# Conecta al Arduino por serial
arduino = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
time.sleep(1)

print("Esperando datos del Arduino...")

def registrar_evento(tipo, filename, timestamp, id):
    nuevo = Evento(
        id=id,
        timestamp=timestamp,
        lugar="Laboratorio",
        tipo=tipo,
        filename=filename,
        reported=False,
        space=1
    )
    session.add(nuevo)
    session.commit()
    print(f"Evento '{tipo}' registrado en la base de datos.")

def tomar_foto_y_video():
    picam.configure(picam.create_still_configuration())
    picam.start()
    time.sleep(1)

    timestamp = datetime.now()
    uid = str(uuid.uuid4())
    filename_foto = f'files/photo_{timestamp.strftime("%Y-%m-%d_%H-%M-%S")}.jpg'
    picam.capture_file(filename_foto)
    print(f'Foto {filename_foto} guardada exitosamente.')

    registrar_evento("foto", filename_foto, timestamp, uid)

    picam.stop()
    time.sleep(1)

    picam.configure(picam.create_video_configuration())
    picam.start()
    time.sleep(1)
    filename_video = f'files/video_{timestamp.strftime("%Y-%m-%d_%H-%M-%S")}.h264'
    encoder = H264Encoder()
    output = FileOutput(filename_video)
    picam.start_recording(encoder, output)
    time.sleep(REC_TIME)
    picam.stop_recording()
    print(f'Video {filename_video} guardado exitosamente.')

    registrar_evento("video", filename_video, timestamp, f"{uid}_video")

    picam.stop()
    time.sleep(1)

# ========== LOOP PRINCIPAL ==========
while True:
    if arduino.in_waiting:
        mensaje = arduino.readline().decode('utf-8').strip()
        print(mensaje)
        if "Movement detected" in mensaje:
            print("Movimiento detectado, tomando foto y video...")
            tomar_foto_y_video()
        else:
            print(f"Mensaje recibido: {mensaje}")
            arduino.reset_input_buffer()
