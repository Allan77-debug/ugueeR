# server/config/test_settings.py

"""
Configuración de Django específica para ejecutar tests.

Este archivo importa la configuración base de 'settings.py' y sobrescribe
ciertas partes para crear un entorno de pruebas optimizado, rápido y aislado.
"""

import os
import sys
from pathlib import Path

# Define el directorio base del proyecto.
BASE_DIR = Path(__file__).resolve().parent.parent

# Importa todas las configuraciones base del archivo principal.
from .settings import *

# --- Sobrescribir Base de Datos ---
# Se utiliza una base de datos SQLite en memoria para los tests.
# Es extremadamente rápida y se crea y destruye con cada ejecución,
# garantizando que los tests no interfieran entre sí.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:', # ':memory:' le dice a SQLite que use la RAM.
    }
}

# --- Deshabilitar Migraciones ---
# Acelera la creación de la base de datos de test, ya que crea las tablas
# directamente desde los modelos en lugar de aplicar todos los archivos de migración.
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# --- Hashers de Contraseña más Rápidos ---
# Se usan hashers menos seguros pero mucho más rápidos (como MD5) para acelerar
# la creación de usuarios durante los tests. Esto solo se hace en el entorno de pruebas.
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# --- Deshabilitar Logging ---
# Evita que la consola se llene de logs de la aplicación durante la ejecución de los tests,
# manteniendo la salida de los tests limpia y legible.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
    },
}

# --- Deshabilitar CORS ---
# No es necesario en el entorno de pruebas.
CORS_ALLOW_ALL_ORIGINS = False

# --- Caché en Memoria ---
# Usa una caché en memoria local para los tests, que es rápida y se limpia al terminar.
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# --- Almacenamiento de Archivos Estáticos ---
# Usa el almacenamiento estándar para evitar la recolección de estáticos durante los tests.
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# --- Corredor de Tests ---
# Define la clase que Django usará para descubrir y ejecutar los tests.
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# --- Deshabilitar Modo Debug ---
# Los tests siempre deben correr con DEBUG=False para simular un entorno de producción.
DEBUG = False

# --- Clave Secreta de Test ---
# Se usa una clave secreta simple y fija, ya que la seguridad no es una preocupación en los tests.
SECRET_KEY = 'test-secret-key-for-testing-only'