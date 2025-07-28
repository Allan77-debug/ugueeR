#!/usr/bin/env python
"""
Script de ejecución de pruebas para la aplicación 'travel'.

Este script configura el entorno de Django, localiza los módulos de prueba
definidos para la aplicación 'travel' y los ejecuta utilizando el corredor de pruebas
de Django. Es una forma centralizada de validar la funcionalidad de la app.
"""
import os
import sys
import django

# Añade el directorio raíz del servidor al path de Python para que
# los módulos del proyecto (como 'config') puedan ser importados.
# os.path.abspath(__file__) -> /ruta/completa/a/server/travel/run_tests.py
# os.path.dirname(...) -> /ruta/completa/a/server/travel
# os.path.dirname(...) -> /ruta/completa/a/server
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_travel_tests():
    """Configura Django y ejecuta todas las pruebas de 'travel'."""
    
    # Establece la variable de entorno para que Django sepa qué archivo de configuración usar.
    # 'config.test_settings' apunta a una configuración específica para pruebas.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')

    # Inicializa la configuración de Django. Esto carga las apps, modelos, etc.
    django.setup()

    from django.test.utils import get_runner
    from django.conf import settings

    # Obtiene la clase del corredor de pruebas definida en la configuración.
    TestRunner = get_runner(settings)
    test_runner = TestRunner()

    # Define la lista de módulos de prueba que se van a ejecutar.
    test_modules = [
        'travel.tests.test_models',
        'travel.tests.test_views'
    ]

    # Ejecuta las pruebas. El método devuelve el número de fallos.
    failures = test_runner.run_tests(test_modules)

    if failures:
        # Si hubo fallos, el script termina con un código de error.
        sys.exit(1)
    else:
        # Si todas las pruebas pasaron, imprime un mensaje de éxito.
        print("✅ ¡Todas las pruebas de 'travel' pasaron exitosamente!")

if __name__ == '__main__':
    # Si el script es ejecutado directamente, llama a la función principal.
    run_travel_tests()