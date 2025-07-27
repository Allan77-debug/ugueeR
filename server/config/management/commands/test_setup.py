from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Set up test environment and run tests'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-migrations',
            action='store_true',
            help='Skip migrations during test setup',
        )
        parser.add_argument(
            '--apps',
            nargs='+',
            help='Specific apps to test',
        )

    def handle(self, *args, **options):
        """Handle the command."""
        self.stdout.write(
            self.style.SUCCESS('Setting up test environment...')
        )
        
        # Set test environment
        os.environ['DJANGO_SETTINGS_MODULE'] = 'config.test_settings'
        
        # Run tests
        if options['apps']:
            call_command('test', *options['apps'])
        else:
            call_command('test') 