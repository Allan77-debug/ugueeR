# server/config/management/commands/test_setup.py

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
import os

class Command(BaseCommand):
    """
    Define un comando personalizado para Django (`manage.py test_setup`).
    Su propósito es configurar un entorno de pruebas estandarizado y ejecutar los tests.
    """
    help = 'Configura el entorno de pruebas y ejecuta los tests'

    def add_arguments(self, parser):
        """
        Añade argumentos opcionales que se pueden pasar al comando en la terminal.
        """
        # Argumento para saltarse las migraciones, útil para acelerar los tests.
        parser.add_argument(
            '--no-migrations',
            action='store_true',
            help='Omite las migraciones durante la configuración de los tests.',
        )
        # Argumento para especificar qué apps testear, en lugar de todas.
        parser.add_argument(
            '--apps',
            nargs='+',
            help='Especifica las apps concretas que se van a testear.',
        )

    def handle(self, *args, **options):
        """
        La lógica principal que se ejecuta cuando se llama al comando.
        """
        self.stdout.write(
            self.style.SUCCESS('>>> Configurando el entorno de pruebas...')
        )
        
        # Establece la variable de entorno para que Django use los ajustes de test.
        # Esto es crucial para usar la base de datos de test, etc.
        os.environ['DJANGO_SETTINGS_MODULE'] = 'config.test_settings'
        
        # Llama al comando 'test' de Django.
        if options['apps']:
            # Si el usuario especificó apps, se las pasamos al comando 'test'.
            self.stdout.write(self.style.SUCCESS(f'>>> Ejecutando tests para las apps: {", ".join(options["apps"])}'))
            call_command('test', *options['apps'])
        else:
            # Si no, se ejecutan todos los tests del proyecto.
            self.stdout.write(self.style.SUCCESS('>>> Ejecutando todos los tests...'))
            call_command('test')