import serial
import subprocess
import sys
import time


if len(sys.argv) < 4:
    print('Uso: python script.py <rec_time> <space> <usrname>')
    sys.exit(1)

REC_TIME = int(sys.argv[1]) if len(sys.argv) > 1 else 10
SPACE = int(sys.argv[2])
PLACE = sys.argv[3]

# Conecta al Arduino por serial
arduino = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
time.sleep(1)

# ========== LOOP PRINCIPAL ==========
while True:
    if arduino.in_waiting:
        mensaje = arduino.readline().decode('utf-8').strip()
        print(mensaje)
        if "Movement detected" in mensaje:
            print("Movimiento detectado, tomando foto y video...")

            with open("cam_logs.txt", "a") as log_file:
                try:
                    subprocess.run(
                        ["python3", "take_event.py", str(REC_TIME), str(SPACE), str(PLACE)],
                        check=True,
                        stdout=log_file,
                        stderr=log_file
                    )
                except subprocess.CalledProcessError as e:
                    log_file.write(f"ERROR al ejecutar take_event.py: {e}\n")
        else:
            print(f"Mensaje recibido: {mensaje}")
            arduino.reset_input_buffer()
