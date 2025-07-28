#!/usr/bin/env python
"""
Script de ejecución de tests para la aplicación 'institutions'.

Este script permite ejecutar todos los archivos de test de la aplicación 'institutions'
de forma aislada y conveniente desde la línea de comandos (ej: `python run_tests.py`),
sin tener que ejecutar los tests de todo el proyecto.
"""

import os
import sys
import django

# Añade el directorio raíz del proyecto ('server') al path de Python.
# Esto es necesario para que el script pueda encontrar e importar módulos
# como 'config.test_settings' y las aplicaciones de Django.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_institutions_tests():
    """Configura el entorno de Django y ejecuta los tests de la app 'institutions'."""
    
    # Establece la variable de entorno para que Django use las configuraciones de test.
    # Esto asegura que se use la base de datos de pruebas, se desactiven las migraciones, etc.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
    
    # Inicializa Django. Carga las aplicaciones, modelos y toda la configuración.
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Obtiene la clase corredora de tests definida en la configuración de Django.
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Define la lista específica de módulos de test que se van a ejecutar.
    test_modules = [
        'institutions.tests.test_models',
        'institutions.tests.test_views'
    ]
    
    # Ejecuta los tests definidos en la lista y captura el número de fallos.
    failures = test_runner.run_tests(test_modules)
    
    # Si hubo uno o más fallos, el script termina con un código de error (1),
    # lo cual es útil para la integración continua (CI/CD).
    if failures:
        sys.exit(1)
    else:
        # Si no hubo fallos, imprime un mensaje de éxito.
        print("✅ ¡Todos los tests de 'institutions' pasaron exitosamente!")

# Este bloque asegura que la función 'run_institutions_tests' solo se ejecute
# cuando el script es llamado directamente desde la terminal.
if __name__ == '__main__':
    run_institutions_tests()