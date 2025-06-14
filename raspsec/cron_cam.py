import sys
from crontab import CronTab
import getpass

if len(sys.argv) != 7:
    print("Uso: python cron_cam.py REC_TIME START_HOUR END_HOUR INTERVAL_MIN")
    sys.exit(1)

REC_TIME = sys.argv[1]
START_HOUR = int(sys.argv[2])
END_HOUR = int(sys.argv[3])
INTERVAL = int(sys.argv[4])
SPACE = int(sys.argv[5])
PLACE = sys.argv[6]

USRNAME = getpass.getuser()

VENV_PYTHON = f"/home/{USRNAME}/Desktop/raspsec/.venv/bin/python3"
SCRIPT_PATH = f"/home/{USRNAME}/Desktop/raspsec/take_event.py"
LOG_PATH = f"/home/{USRNAME}/Desktop/raspsec/cam_logs.txt"


cron = CronTab(user=True)
cron.remove_all(comment='captura_raspberry')

for hour in range(START_HOUR, END_HOUR + 1):
    for minute in range(0, 60, INTERVAL):
        command = f'{VENV_PYTHON} {SCRIPT_PATH} {REC_TIME} {SPACE} {PLACE}>> {LOG_PATH} 2>&1'
        job = cron.new(command=command, comment='captura_raspberry')
        job.minute.on(minute)
        job.hour.on(hour)

cron.write()
print(f"Tareas programadas cada {INTERVAL} min de {START_HOUR}:00 a {END_HOUR}:00 para grabar {REC_TIME}s.")
