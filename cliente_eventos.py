import requests
from lxml import etree

# IP del servidor (cambia aquí la IP real)
SERVIDOR_IP = "192.168.1.100"
PORT = 8000

url = f"http://{SERVIDOR_IP}:{PORT}/eventos.xml"

try:
    response = requests.get(url)
    if response.status_code == 200:
        # Guardar el archivo recibido
        with open("eventos_descargado.xml", "wb") as f:
            f.write(response.content)
        print("Archivo eventos.xml descargado exitosamente como eventos_descargado.xml.")
        
        # Validar el XML contra el DTD
        print("Validando el XML descargado contra el DTD...")
        with open("eventos.dtd", "rb") as dtd_file:
            dtd = etree.DTD(dtd_file)

        tree = etree.parse("eventos_descargado.xml")

        if dtd.validate(tree):
            print("¡Validación exitosa! El XML cumple con el DTD.")
        else:
            print("¡Validación fallida!")
            print(dtd.error_log.filter_from_errors())

    else:
        print(f"Error al descargar: Código de estado {response.status_code}")
except Exception as e:
    print(f"Ocurrió un error: {e}")

