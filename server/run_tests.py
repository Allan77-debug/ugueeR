#!/usr/bin/env python
"""
Script de ejecución de pruebas para el proyecto Django completo.

Este script actúa como un punto de entrada principal para ejecutar todas las pruebas
descubiertas en el proyecto. Se encarga de configurar el entorno de prueba
de Django, incluyendo la base de datos de prueba y las migraciones,
antes de lanzar el corredor de pruebas.
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def run_tests():
    """
    Configura el entorno de Django y ejecuta la suite de pruebas completa.
    
    Esta función realiza los siguientes pasos:
    1. Establece la variable de entorno para usar la configuración de prueba.
    2. Inicializa Django para cargar todas las aplicaciones y modelos.
    3. Obtiene y crea una instancia del corredor de pruebas de Django.
    4. Ejecuta todas las pruebas que el corredor descubre en el proyecto.
    5. Termina el proceso con un código de estado de error si alguna prueba falla.
    """
    
    # Establece la variable de entorno para que Django utilice la configuración de prueba.
    # 'config.test_settings' suele apuntar a una base de datos en memoria o de prueba.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
    
    # Inicializa el entorno de Django. Este paso es crucial para que las aplicaciones
    # y modelos del proyecto estén disponibles para el corredor de pruebas.
    django.setup()
    
    # Obtiene la clase del corredor de pruebas definida en la configuración (settings).
    TestRunner = get_runner(settings)
    
    # Crea una instancia del corredor de pruebas.
    test_runner = TestRunner()
    
    # Ejecuta las pruebas. Al pasar una lista vacía `[]`, se le indica al corredor
    # que descubra y ejecute todas las pruebas de todas las aplicaciones del proyecto.
    failures = test_runner.run_tests([])
    
    # Si el corredor de pruebas reporta fallos, el script termina con un código de estado 1,
    # lo que indica un error a los sistemas de integración continua (CI/CD) o a la terminal.
    if failures:
        sys.exit(1)

if __name__ == '__main__':
    # Este bloque asegura que la función `run_tests()` se ejecute solo cuando
    # el script es llamado directamente desde la línea de comandos.
    run_tests()