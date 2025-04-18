import serial
import time
import sys
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput
from datetime import datetime

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

def tomar_foto():
    picam.configure(picam.create_still_configuration())
    picam.start()
    time.sleep(1)

    timestamp = datetime.now().strftime("%d-%m-%Y-%H-%M-%S")
    filename = f'photo_{timestamp}.jpg'
    picam.capture_file(filename)
    print(f'Foto {filename} guardad exitosamente. Viva el idolosh!!')
    picam.stop()
    time.sleep(1)

    picam.configure(picam.create_video_configuration())
    picam.start()
    time.sleep(1)
    filename2 = f'video_{timestamp}.h264'
    encoder = H264Encoder()
    output = FileOutput(filename2)
    picam.start_recording(encoder, output)
    time.sleep(REC_TIME)
    picam.stop_recording()
    print(f'Video {filename2} guardado exitosamente. Viva el idolosh!!')
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
