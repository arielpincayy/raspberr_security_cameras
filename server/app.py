from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from datetime import datetime
from config import DB_CONFIG
import subprocess
import os

app = Flask(__name__)
base_path = os.path.dirname(os.path.abspath(__file__))

def send_file(filename: str, space: int):
    spaces = {1: 'aldrinchp', 2: 'ariel', 3: 'moon', 4: 'joseph'}
    ips = {1:50, 2:51, 3:52, 4:53}
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
        success, msg = send_file(data['filename'], data['space'])
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
