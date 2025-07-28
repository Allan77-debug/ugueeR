#!/usr/bin/env python
"""
Script de ejecución de pruebas para la aplicación 'vehicle'.

Este script actúa como un punto de entrada centralizado para ejecutar todas
las pruebas unitarias y de integración definidas para la aplicación 'vehicle'.
"""

import os
import sys
import django

# Añade el directorio raíz del servidor al path de Python para permitir
# la importación de módulos del proyecto, como 'config.test_settings'.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_vehicle_tests():
    """Configura Django y ejecuta todas las pruebas de 'vehicle'."""
    
    # Establece la variable de entorno para que Django utilice la configuración de prueba.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
    
    # Inicializa el entorno de Django (carga de apps, modelos, etc.).
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Obtiene la clase del corredor de pruebas configurada en los settings.
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Define la lista de módulos de prueba que se van a ejecutar.
    test_modules = [
        'vehicle.tests.test_models',
        'vehicle.tests.test_views'
    ]
    
    # Ejecuta las pruebas y captura el número de fallos.
    failures = test_runner.run_tests(test_modules)
    
    # Si hubo fallos, el script termina con un código de error.
    if failures:
        sys.exit(1)
    else:
        # Si todo fue exitoso, imprime un mensaje de confirmación.
        print("✅ ¡Todas las pruebas de 'vehicle' pasaron exitosamente!")

if __name__ == '__main__':
    # Ejecuta la función principal si el script se llama directamente.
    run_vehicle_tests()