# Configuracion del entorno de desarollo para el backend

# 1

# Windows (Casi todos)
python -m venv env
env\Scripts\activate

# Mac
python3 -m venv env
source env/bin/activate

# 2: Instalar dependencias
pip install -r requirements.txt

# 3: Variables de entorno

Crear un archivo .env en la raiz de server y añadir esto:
# datos de railway
DB_NAME=uguee
DB_USER=postgres
DB_PASSWORD=contrasena
DB_HOST=localhost
DB_PORT=5432
# ------
DEBUG=True

# 4: Inciar el server
cd server
python manage.py runserver