#!/usr/bin/env python
"""
Script ejecutor de pruebas para la aplicación 'assessment'.

Este script se encarga de configurar el entorno de Django para pruebas
y ejecutar todos los módulos de test definidos para esta aplicación.
"""

import os
import sys
import django

# Añade el directorio raíz del proyecto al 'sys.path' para permitir
# importaciones relativas, como 'config.test_settings'.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_assessment_tests():
    """Configura el entorno y ejecuta las pruebas de la app 'assessment'."""
    # Establece el archivo de configuración de Django para el entorno de pruebas.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
    
    # Carga la configuración de Django.
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Obtiene la clase del ejecutor de pruebas definida en la configuración.
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Define la lista de módulos de prueba a ejecutar.
    test_modules = [
        'assessment.tests.test_models',
        'assessment.tests.test_views'
    ]
    
    # Ejecuta las pruebas y captura el número de fallos.
    failures = test_runner.run_tests(test_modules)
    
    # Si hubo fallos, el script termina con un código de error.
    if failures:
        sys.exit(1)
    else:
        print("✅ ¡Todas las pruebas de 'assessment' pasaron exitosamente!")

if __name__ == '__main__':
    run_assessment_tests()