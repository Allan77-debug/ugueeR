#!/bin/bash

# Test runner script for Django project
# This script activates the virtual environment and runs tests safely

echo "Activating virtual environment..."
source env/bin/activate

echo "Running tests with test settings..."
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test "$@"

echo "Tests completed!" 