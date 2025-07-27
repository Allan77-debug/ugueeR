#!/usr/bin/env python
"""
Test runner script for Django project.
This script handles test database setup and migration issues.
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def run_tests():
    """Run the Django test suite."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
    
    # Setup Django
    django.setup()
    
    # Get the test runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Run tests
    failures = test_runner.run_tests([])
    
    if failures:
        sys.exit(1)

if __name__ == '__main__':
    run_tests() 