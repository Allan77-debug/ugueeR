# server/driver/tests/run_tests.py

#!/usr/bin/env python
"""
Script de ejecución de tests para la aplicación 'driver'.

Este script permite ejecutar todos los archivos de test de la aplicación 'driver'
de forma aislada y conveniente desde la línea de comandos, sin tener que
ejecutar los tests de todo el proyecto.
"""

import os
import sys
import django

# Añade el directorio raíz del proyecto ('server') al path de Python.
# Esto es necesario para que se puedan importar módulos como 'config.test_settings'.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_driver_tests():
    """Configura Django y ejecuta los tests de la app 'driver'."""
    # Establece que se deben usar las configuraciones de test.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
    
    # Inicializa Django.
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Obtiene la clase corredora de tests definida en la configuración.
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Define la lista específica de módulos de test que se van a ejecutar.
    test_modules = [
        'driver.tests.test_models',
        'driver.tests.test_views'
    ]
    
    # Ejecuta los tests y captura el número de fallos.
    failures = test_runner.run_tests(test_modules)
    
    # Si hubo fallos, el script termina con un código de error.
    if failures:
        sys.exit(1)
    else:
        print("✅ ¡Todos los tests de 'driver' pasaron exitosamente!")

if __name__ == '__main__':
    run_driver_tests()