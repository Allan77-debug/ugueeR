# server/config/settings.py

"""
Configuración de Django para el proyecto 'config'.

Generado por 'django-admin startproject' usando Django 5.2.

Para más información sobre este archivo, consulta:
https://docs.djangoproject.com/en/5.2/topics/settings/

Para la lista completa de configuraciones y sus valores, consulta:
https://docs.djangoproject.com/en/5.2/ref/settings/
"""

import os
import environ
from pathlib import Path
import sys

# Define el directorio base del proyecto.
BASE_DIR = Path(__file__).resolve().parent.parent

# Inicia la librería 'environ' para gestionar variables de entorno desde un archivo .env.
env = environ.Env()
environ.Env.read_env()

# Lee el archivo .env ubicado en el directorio base.
env.read_env(os.path.join(BASE_DIR, '.env'))

# Configuración de seguridad. El modo DEBUG se lee desde las variables de entorno.
DEBUG = env.bool("DEBUG", default=False)


# Configuraciones de inicio rápido para desarrollo - no son adecuadas para producción.
# Ver: https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# ADVERTENCIA DE SEGURIDAD: ¡mantén la clave secreta usada en producción en secreto!
SECRET_KEY = 'django-insecure-16*s0a%bh==&1h8iw#6^aa+6w__(%5vs#)94hcic*&b78bm@+5'

# Lee la clave de la API de Google Maps desde el archivo .env. Si no existe, es None.
API_KEY_GOOGLE_MAPS = env('API_KEY_GOOGLE_MAPS', default=None)

# ADVERTENCIA DE SEGURIDAD: ¡no ejecutes con debug activado en producción!
DEBUG = True

# Hosts/dominios permitidos para servir la aplicación.
ALLOWED_HOSTS = ['*']


# --- Configuración de DRF (Django REST Framework) ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

# --- Configuración de Simple JWT ---
SIMPLE_JWT = {
    # Le decimos a Simple JWT que el campo identificador en tu modelo Users es 'uid', no el 'id' por defecto.
    'USER_ID_FIELD': 'uid',
}


# --- Configuración de Swagger (drf-yasg) ---
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        # Esto configura el botón "Authorize" en la UI de Swagger para poder
        # probar endpoints protegidos enviando el token JWT.
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'Token JWT. Ejemplo: **Bearer <tu_token>**'
        }
    },
}


# --- Definición de Aplicaciones ---
# Aquí se registran todas las apps que componen el proyecto.
INSTALLED_APPS = [
    'daphne',  # Servidor de producción para aplicaciones ASGI/Channels.
    'channels',  # Framework principal para WebSockets y otras funcionalidades asíncronas.
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework_simplejwt', # Para la gestión de tokens JWT.
    'rest_framework',
    'corsheaders',  # Para gestionar permisos de Cross-Origin (CORS).
    'drf_yasg',  # Para la generación automática de la documentación de la API (Swagger/ReDoc).
    'institutions',
    'admins',
    'users',
    'driver',
    'route',
    'vehicle',
    'travel',
    'assessment',
    'realize',
]

# Permite que cualquier origen (dominio) haga peticiones a tu API.
# Ideal para desarrollo, pero en producción se debería restringir a dominios específicos.
CORS_ALLOW_ALL_ORIGINS = True

# --- Middleware (para peticiones HTTP) ---
# Se procesan en orden para cada petición HTTP.
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
]

# --- Configuración para servir archivos subidos por los usuarios (media) ---
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Archivo principal de URLs del proyecto.
ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --- Puntos de Entrada para Servidores ---
WSGI_APPLICATION = 'config.wsgi.application'  # Para servidores HTTP síncronos (Gunicorn, etc.).
ASGI_APPLICATION = 'config.asgi.application'  # Para servidores asíncronos (Daphne, Uvicorn).


# --- Configuración de Django Channels ---
CHANNEL_LAYERS = {
    "default": {
        # Backend para la comunicación entre diferentes partes de la aplicación (consumers, workers, etc.).
        # 'InMemoryChannelLayer' es ideal para desarrollo y tests, ya que no requiere un servicio externo.
        # Para producción, se suele usar 'channels_redis.core.RedisChannelLayer'.
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

# --- Base de Datos ---
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
DATABASES = {
    'default': {
        #'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env("DB_NAME"),
        'USER': env("DB_USER"),
        'PASSWORD': env("DB_PASSWORD"),
        'HOST': env("DB_HOST"),
        'PORT': env("DB_PORT"),
         'OPTIONS': {
            'sslmode': 'require',
        }
    }
}


# --- Configuración de la Base de Datos para Tests ---
# Si el comando ejecutado es 'test', se sobrescribe la configuración de la base de datos.
if 'test' in sys.argv or 'test' in os.environ.get('DJANGO_SETTINGS_MODULE', ''):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    
    # Deshabilita las migraciones durante los tests para acelerar el proceso.
    # Las tablas se crean directamente desde los modelos.
    class DisableMigrations:
        def __contains__(self, item):
            return True
        
        def __getitem__(self, item):
            return None
    
    MIGRATION_MODULES = DisableMigrations()

# --- Validadores de Contraseña ---
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]


# --- Internacionalización ---
# https://docs.djangoproject.com/en/5.2/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# --- Archivos Estáticos (CSS, JavaScript, Imágenes) ---
# https://docs.djangoproject.com/en/5.2/howto/static-files/
STATIC_URL = 'static/'

# --- Tipo de Campo de Clave Primaria por Defecto ---
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'