import time
import sys
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput
from datetime import datetime

# Duración de la grabación en segundos
if len(sys.argv) > 1:
    REC_TIME = int(sys.argv[1])
    START_HOUR = int(sys.argv[2])
    END_HOUR = int(sys.argv[3])
    DELAY = int(sys.argv[4])
else:
    REC_TIME = 10
    START_HOUR = 15  # 3 PM
    END_HOUR = 20    # 8 PM
    DELAY = 60*10

picam = Picamera2()

def tomar_foto_y_video():
    # Tomar foto
    picam.configure(picam.create_still_configuration())
    picam.start()
    time.sleep(2)
    timestamp = datetime.now().strftime("%d-%m-%Y-%H-%M-%S")
    foto_filename = f'photo_{timestamp}.jpg'
    picam.capture_file(foto_filename)
    print(f'Foto {foto_filename} guardada exitosamente.')
    picam.stop()

    # Grabar video
    time.sleep(1)
    picam.configure(picam.create_video_configuration())
    picam.start()
    time.sleep(1)
    video_filename = f'video_{timestamp}.h264'
    encoder = H264Encoder()
    output = FileOutput(video_filename)
    picam.start_recording(encoder, output)
    time.sleep(REC_TIME)
    picam.stop_recording()
    print(f'Video {video_filename} guardado exitosamente.')
    picam.stop()
    time.sleep(2)

print("Esperando hora adecuada para grabar...")

while True:
    now = datetime.now()
    current_hour = now.hour

    if START_HOUR <= current_hour < END_HOUR:
        print(f"{now.strftime('%H:%M:%S')} - Dentro del horario de grabación.")
        tomar_foto_y_video()
        # Esperar un rato antes de volver a grabar (ajusta según tus necesidades)
        time.sleep(DELAY)  # Espera 10 minutos
    else:
        print(f"{now.strftime('%H:%M:%S')} - Fuera del horario. Esperando...")
        time.sleep(60)  # Verifica cada minuto si ya es hora
