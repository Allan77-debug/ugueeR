# server/route/tests/run_tests.py

#!/usr/bin/env python
"""
Script de ejecución de tests para la aplicación 'route'.
Permite ejecutar todos los tests de esta app de forma aislada.
"""

import os
import sys
import django

# Añade el directorio raíz del proyecto ('server') al path de Python.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_route_tests():
    """Configura Django y ejecuta los tests de la app 'route'."""
    # Establece que se deben usar las configuraciones de test.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
    
    # Inicializa Django.
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Obtiene la clase corredora de tests.
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Define la lista de módulos de test a ejecutar.
    test_modules = [
        'route.tests.test_models',
        'route.tests.test_views'
    ]
    
    # Ejecuta los tests.
    failures = test_runner.run_tests(test_modules)
    
    # Termina con un código de error si algún test falla.
    if failures:
        sys.exit(1)
    else:
        print("✅ ¡Todos los tests de 'route' pasaron exitosamente!")

if __name__ == '__main__':
    run_route_tests()