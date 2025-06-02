from flask import Flask, request, jsonify
from flask import send_from_directory
import mysql.connector
from mysql.connector import Error
from datetime import datetime
from config import DB_CONFIG
import subprocess
import os
from flask_cors import CORS
import threading

app = Flask(__name__)

CORS(
    app,
    origins="*",
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

base_path = os.path.dirname(os.path.abspath(__file__))
spaces = {1: 'aldrinchp', 2: 'ariel', 3: 'moon', 4: 'joseph'}
ips = {1:50, 2:51, 3:52, 4:53}

def send_file(filename: str, space: int, spaces:dict, ips:dict):
    if space not in spaces:
        return False, 'Espacio no válido'

    space_name = spaces[space]
    ip = ips[space]
    source_path = f"{space_name}@192.168.137.{ip}:/home/{space_name}/Desktop/raspsec/{filename}"
    target_folder = os.path.join(base_path, "uploads", space_name)
    os.makedirs(target_folder, exist_ok=True)
    target_path = os.path.join(target_folder, os.path.basename(filename))

    try:
        subprocess.run(["scp", source_path, target_path], check=True)
        return True, 'Archivo enviado correctamente'
    except subprocess.CalledProcessError as e:
        return False, f'Error al enviar archivo: {e}'


@app.route('/api/eventos/', methods=['POST'])
def recibir_evento():
    data = request.get_json()

    required_fields = ['id', 'timestamp', 'lugar', 'tipo', 'filename', 'space']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400

    conn = None
    cursor = None

    try:
        # Enviar el archivo antes de guardar en la DB
        success, msg = send_file(data['filename'], data['space'], spaces, ips)
        if not success:
            return jsonify({'error': msg}), 500

        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        query = """
        INSERT INTO eventos (id, timestamp, lugar, tipo, filename, space, reported)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            timestamp = VALUES(timestamp),
            lugar = VALUES(lugar),
            tipo = VALUES(tipo),
            filename = VALUES(filename),
            space = VALUES(space),
            reported = 1
        """
        values = (
            data['id'],
            datetime.fromisoformat(data['timestamp']),
            data['lugar'],
            data['tipo'],
            data['filename'],
            data['space'],
            1
        )

        cursor.execute(query, values)
        conn.commit()

        return jsonify({'message': 'Evento guardado y archivo enviado correctamente'}), 200

    except Error as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/eventos/', methods=['GET'])
def listar_eventos():
    date_from = request.args.get('from')
    date_to = request.args.get('to')
    lugar = request.args.get('lugar')
    tipo = request.args.get('tipo')
    space = request.args.get('space', type=int)

    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM eventos WHERE 1=1"
        values = []

        if date_from:
            query += " AND timestamp >= %s"
            values.append(date_from)
        if date_to:
            query += " AND timestamp <= %s"
            values.append(date_to)
        if lugar:
            query += " AND lugar = %s"
            values.append(lugar)
        if tipo:
            query += " AND tipo = %s"
            values.append(tipo)
        if space is not None:
            query += " AND space = %s"
            values.append(space)

        query += " ORDER BY timestamp DESC"

        cursor.execute(query, values)
        rows = cursor.fetchall()

        return jsonify({'eventos': rows})

    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/lugares/', methods=['GET'])
def enlistar_lugares():
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT lugar FROM eventos")
        lugares = [row[0] for row in cursor.fetchall()]
        return jsonify({'lugares': lugares})
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/archivo/<space>/<filename>')
def servir_archivo(space, filename):
    name_space = spaces[int(space)]
    base_dir = os.path.join(base_path, 'uploads', name_space)
    return send_from_directory(base_dir, filename, as_attachment=False)

@app.route('/tansmision', methods=['POST'])
def transmision():
    space = request.args.get("space", type=int)
    transmision = request.args.get("value", type=lambda v: v.lower() == 'true')

    if space not in spaces:
        return jsonify({'error': 'Espacio no válido'}), 400

    name_space = spaces[space]
    ip = ips[space]

    command_act = (
        f"bash /home/{name_space}/Desktop/raspsec/stop_cam_ardu.sh && "
        "libcamera-vid -t 0 --inline --width 640 --height 480 --framerate 25 -o - | "
        "ffmpeg -re -f h264 -i - -c:v copy -f hls -hls_time 1 -hls_list_size 3 "
        "/var/www/html/stream/stream.m3u8"
    )
    
    command_deact = (
        f"bash /home/{name_space}/Desktop/raspsec/start_cam_ardu.sh && "
        "pkill -f libcamera-vid"
    )

    remote_cmd = f"{command_act}" if transmision else command_deact
    ssh_cmd = f"ssh {name_space}@192.168.137.{ip} '{remote_cmd}'"

    # Función para ejecutar SSH en segundo plano
    def ejecutar_comando():
        try:
            subprocess.Popen(ssh_cmd, shell=True)
        except subprocess.CalledProcessError as e:
            print(f"[ERROR SSH] {e}")

    # Lanzar el hilo y responder de inmediato
    threading.Thread(target=ejecutar_comando).start()

    return jsonify({'message': f'Comando enviado a {name_space}, ejecutándose en segundo plano'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña requeridos'}), 400

    conn = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and password == user['password']:
            return jsonify({'message': 'Login exitoso'}), 200
        else:
            return jsonify({'error': 'Credenciales incorrectas'}), 401

    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
