from http.server import SimpleHTTPRequestHandler, HTTPServer
import subprocess
import os

PORT = 8000

class MyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/eventos.xml':
            # Cada vez que alguien pide eventos.xml, generar el archivo actualizado
            print("Cliente pidió eventos.xml, generando nuevo XML...")
            subprocess.run(["python3", "exportar_y_validar.py"])

            if os.path.exists("eventos.xml"):
                self.send_response(200)
                self.send_header('Content-type', 'application/xml')
                self.end_headers()
                with open("eventos.xml", "rb") as file:
                    self.wfile.write(file.read())
            else:
                self.send_error(404, "Archivo eventos.xml no encontrado.")
        else:
            self.send_error(404, "Archivo no encontrado.")

if __name__ == "__main__":
    server = HTTPServer(("", PORT), MyHandler)
    print(f"Servidor corriendo en puerto {PORT}... esperando conexiones")
    server.serve_forever()
