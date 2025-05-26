import json
from flask import Flask, request, jsonify
import mysql.connector
import os
from datetime import datetime
from config import DB_CONFIG

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

# Endpoint para guardar un nuevo evento
@app.route('/evento/nuevo', methods=['POST'])
def nuevo_evento():
    try:
        metadata = request.form.get("metadata")
        if metadata:
            metadata = json.loads(metadata)
            lugar = metadata["lugar"]
            tipo = metadata["tipo"]
            space = metadata.get("space", 0)
        else:
            return jsonify({'error': 'Falta metadata'}), 400

        print(f"Recibido: lugar={lugar}, tipo={tipo}, space={space}")

        # Obtener timestamp actual
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Subir archivo
        filename = None
        for key in ['foto', 'video', 'json']:
            if key in request.files:
                file = request.files[key]
                if file and file.filename:
                    filename = os.path.join(UPLOAD_FOLDER, file.filename)
                    file.save(filename)
                    break  # solo un archivo por evento

        # Insertar en MySQL
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO eventos (timestamp, lugar, tipo, filename, space)
            VALUES (%s, %s, %s, %s, %s)
        """, (timestamp, lugar, tipo, filename, space))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Evento guardado correctamente'}), 201

    except Exception as e:
        print(f"❌ ERROR en /evento/nuevo: {e}")
        return jsonify({'error': str(e)}), 500


# Endpoint para listar eventos
@app.route('/eventos', methods=['POST'])
def obtener_eventos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM eventos")
        eventos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(eventos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True,port=5000,host='0.0.0.0')
