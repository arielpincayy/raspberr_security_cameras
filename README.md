# 🔍 Raspberry Pi 4 - Sistema de Vigilancia con Detección de Movimiento

Este proyecto implementa un sistema de vigilancia distribuido utilizando Raspberry Pi 4 con sistema operativo de 32 bits. Cada Raspberry actúa como nodo autónomo capaz de capturar imágenes y videos cuando un Arduino detecta movimiento mediante un sensor PIR. Toda la evidencia se guarda automáticamente en una base de datos MySQL local.

## 📸 Funcionalidad Principal

- Detección de movimiento a través de Arduino (via puerto serial).
- Captura de fotos y videos con la cámara oficial de Raspberry Pi usando `libcamera`.
- Almacenamiento de eventos (foto y video) con metadatos en una base de datos MySQL.
- Organización de archivos con marcas de tiempo únicas.
- Posibilidad de ajustar el tiempo de grabación por parámetro.

## 📂 Estructura del Proyecto

- cam_ardu.py # Script principal que enlaza Arduino con la cámara y la base de datos
- sketch_apr08a.ino # Código del Arduino que detecta movimiento
- files/ # Carpeta donde se guardan las fotos y videos capturados
- README.md # Este archivo


## 🧪 Requisitos

### Hardware
- Raspberry Pi 4 con Raspberry Pi OS 32-bit.
- Arduino Uno/Nano con sensor PIR.
- Cámara compatible con `libcamera` (como la HQ Camera o Camera Module 3).
- Conexión entre Raspberry y Arduino por USB.

### Software
- Python 3
- `picamera2`
- `mysql-connector-python`
- `libcamera`
- Servidor MySQL/MariaDB con la base de datos `proyecto_multimedia` y tabla `eventos`.

## 🛠 Instalación

1. **Instala dependencias:**

```bash
sudo apt update
sudo apt install libcamera-apps python3-picamera2 python3-serial mariadb-server
pip3 install mysql-connector-python
```

2. **Configuración de base de datos:**

```sql
CREATE DATABASE proyecto_multimedia;
USE proyecto_multimedia;

CREATE TABLE eventos (
  id VARCHAR(100) PRIMARY KEY,
  timestamp DATETIME,
  lugar VARCHAR(100),
  tipo ENUM('foto', 'video'),
  filename VARCHAR(200)
);
```

3. **Conecte al Arduino y verifique su puerto**
   
ls /dev/ttyACM*

4. **Ejecuta el script en la Raspberry:**
```bash
./run_all.sh
```

## ⚙️ Personalización

Modifica el archivo config.txt para configurar los parametros iniciales del sistema

## 🚧 Pendientes / Mejoras futuras

    Envío de notificaciones (correo, Telegram, etc.).

    Transmisión en vivo vía RTSP o HLS.

    Integración con servidor central para clúster de cámaras.

## 🧠 Créditos

Desarrollado por el team Idolosh Lovers 🩷 para un sistema de vigilancia distribuida con Raspberry Pi y Arduino.
