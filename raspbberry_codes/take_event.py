import os
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput
from datetime import datetime
import time
import sys

def take_event(rec_time):
    # Ruta absoluta
    output_folder = "/home/ariel/Desktop/raspsec/files"
    os.makedirs(output_folder, exist_ok=True)

    try:
        picam = Picamera2()
    except Exception as e:
        print(f"Error al inicializar la cámara: {e}")
        return

    try:
        # Tomar foto
        picam.configure(picam.create_still_configuration())
        picam.start()
        time.sleep(2)
        timestamp = datetime.now().strftime("%d-%m-%Y-%H-%M-%S")
        foto_filename = os.path.join(output_folder, f'photo_{timestamp}.jpg')
        picam.capture_file(foto_filename)
        print(f"Foto {foto_filename} guardada.")
    
        # Detener antes de grabar video
        picam.stop()
        time.sleep(1)
    except Exception as e:
        print(f"Error al capturar la foto: {e}")
        return

    try:
        # Grabar video
        picam.configure(picam.create_video_configuration())
        picam.start()
        time.sleep(1)
        video_filename = os.path.join(output_folder, f'video_{timestamp}.h264')
        encoder = H264Encoder()
        output = FileOutput(video_filename)
        picam.start_recording(encoder, output)
        time.sleep(rec_time)
        picam.stop_recording()
        print(f"Video {video_filename} guardado.")
    
        # Detener la cámara
        picam.stop()
    except Exception as e:
        print(f"Error al grabar el video: {e}")
        return

if __name__ == "__main__":
    rec_time = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    take_event(rec_time)
