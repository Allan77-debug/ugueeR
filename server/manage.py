#!/usr/bin/env python
"""
Utilidad de línea de comandos de Django para tareas administrativas.

Este script es el punto de entrada principal para interactuar con el proyecto
Django desde la terminal. Permite ejecutar comandos de gestión como iniciar
el servidor de desarrollo (`runserver`), crear migraciones (`makemigrations`),
aplicar migraciones (`migrate`), ejecutar pruebas (`test`), entre otros.
"""
import os
import sys


def main():
    """
    Función principal que ejecuta las tareas administrativas.
    
    Esta función se encarga de:
    1. Asegurar que la variable de entorno DJANGO_SETTINGS_MODULE esté configurada,
       apuntando al archivo de configuración del proyecto.
    2. Importar la función principal de gestión de comandos de Django.
    3. Pasar los argumentos de la línea de comandos a Django para su ejecución.
    """
    
    # Establece la variable de entorno 'DJANGO_SETTINGS_MODULE'.
    # Si no está definida, la establece por defecto a 'config.settings'.
    # Esto le dice a Django dónde encontrar el archivo de configuración del proyecto.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    # Imprime el valor de la variable de entorno para depuración,
    # permitiendo verificar qué archivo de settings se está utilizando.
    print("DJANGO_SETTINGS_MODULE:", os.environ.get('DJANGO_SETTINGS_MODULE'))
    
    try:
        # Intenta importar la función que ejecuta los comandos de gestión de Django.
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Si la importación falla, es muy probable que Django no esté instalado o
        # no sea accesible en el entorno de Python actual.
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Pasa los argumentos de la línea de comandos (contenidos en sys.argv)
    # a Django para que ejecute el comando correspondiente.
    # Por ejemplo, si se ejecuta `python manage.py runserver`, sys.argv será
    # ['manage.py', 'runserver'].
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    # Este es el punto de entrada estándar para un script de Python.
    # El bloque de código dentro de este `if` solo se ejecuta cuando el archivo
    # es llamado directamente desde la terminal, no cuando es importado.
    main()