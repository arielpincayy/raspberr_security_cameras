import serial
import uuid
import time
import sys
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput
from datetime import datetime
import mysql.connector

if __name__ == "__main__":
    if len(sys.argv) > 1:
        REC_TIME = int(sys.argv[1])
    else: 
        REC_TIME = 10

picam = Picamera2()
# Conecta al Arduino por serial
arduino = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
time.sleep(1)

print("Esperando datos del Arduino...")

# Configuración de conexión a la base de datos
db = mysql.connector.connect(
    host="localhost",
    user="arieluser",          # Cambia si usas otro usuario
    password="miclave123",  # Cambia por tu contraseña real
    database="proyecto_multimedia"
)

cursor = db.cursor()

def tomar_foto():
    picam.configure(picam.create_still_configuration())
    picam.start()
    time.sleep(1)

    timestamp = datetime.now()
    id = str(uuid.uuid4())
    lugar = "Laboratorio"  # Puedes cambiarlo o pasarlo como parámetro

    filename = f'files/photo_{timestamp}.jpg'
    picam.capture_file(filename)
    print(f'Foto {filename} guardad exitosamente. Viva el idolosh!!')

    # Insertar foto en la base de datos
    sql = "INSERT INTO eventos (id, timestamp, lugar, tipo, filename) VALUES (%s, %s, %s, %s, %s)"
    val = (id, timestamp, lugar, "foto", filename)
    cursor.execute(sql, val)
    db.commit()

    picam.stop()
    time.sleep(1)

    picam.configure(picam.create_video_configuration())
    picam.start()
    time.sleep(1)

    filename2 = f'files/video_{timestamp}.h264'
    encoder = H264Encoder()
    output = FileOutput(filename2)
    picam.start_recording(encoder, output)
    time.sleep(REC_TIME)
    picam.stop_recording()
    print(f'Video {filename2} guardado exitosamente. Viva el idolosh!!')

    # Insertar video en la base de datos
    sql = "INSERT INTO eventos (id, timestamp, lugar, tipo, filename) VALUES (%s, %s, %s, %s, %s)"
    val = (f"{id}_video", timestamp, lugar, "video", filename2)
    cursor.execute(sql, val)
    db.commit()

    picam.stop()
    time.sleep(1)


while True:
    if arduino.in_waiting:
        mensaje = arduino.readline().decode('utf-8').strip()
        print(mensaje)
        if "Movement detected" in mensaje:
            print(f"Movimiento detectado: {mensaje}")
            tomar_foto()
        else:
            print(f"Mensaje recibido: {mensaje}")
            arduino.reset_input_buffer()
