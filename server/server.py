from flask import Flask, jsonify, request
import mysql.connector

app = Flask(__name__)

@app.route('/get_events', methods=['GET'])
def get_events():
    conn = mysql.connector.connect(
        host="localhost",
        user="arieluser",
        password="miclave123",
        database="proyecto_multimedia"
    )
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT id, timestamp, lugar, tipo, filename, space
        FROM eventos
        WHERE reported = FALSE
        ORDER BY timestamp DESC
    """
    cursor.execute(query)
    eventos = cursor.fetchall()
    conn.close()
    return jsonify(eventos)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
