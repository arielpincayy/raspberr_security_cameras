import mysql.connector
from lxml import etree

# Datos de conexión a tu base de datos
db = mysql.connector.connect(
    host="localhost",
    user="arieluser",        # Cambia aquí si usas otro usuario
    password="miclave123",   # Cambia tu contraseña real
    database="proyecto_multimedia"
)

cursor = db.cursor()

# Consultar eventos
cursor.execute("SELECT id, timestamp, lugar, tipo, filename FROM eventos")
eventos = cursor.fetchall()

# Crear estructura XML
root = etree.Element("eventos")

for evento in eventos:
    evento_elem = etree.SubElement(root, "evento")
    
    etree.SubElement(evento_elem, "id").text = str(evento[0])
    etree.SubElement(evento_elem, "timestamp").text = str(evento[1])
    etree.SubElement(evento_elem, "lugar").text = str(evento[2])
    etree.SubElement(evento_elem, "tipo").text = str(evento[3])
    etree.SubElement(evento_elem, "filename").text = str(evento[4])

# Crear el árbol XML
tree = etree.ElementTree(root)

# Crear archivo eventos.xml con referencia al DTD
dtd_path = "eventos.dtd"
with open("eventos.xml", "wb") as f:
    f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
    f.write(f'<!DOCTYPE eventos SYSTEM "{dtd_path}">\n'.encode('utf-8'))
    tree.write(f, encoding="utf-8", pretty_print=True)

print("Archivo 'eventos.xml' generado exitosamente.")

# Validar XML contra DTD
print("Validando 'eventos.xml' contra 'eventos.dtd'...")

with open("eventos.dtd", "rb") as dtd_file:
    dtd = etree.DTD(dtd_file)

tree = etree.parse("eventos.xml")

if dtd.validate(tree):
    print("¡Validación exitosa! El XML cumple con el DTD.")
else:
    print("¡Validación fallida!")
    print(dtd.error_log.filter_from_errors())
