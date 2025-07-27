#!/usr/bin/env python
"""
Test runner script for route app.
This script runs all the separated test files.
"""

import os
import sys
import django

# Add the server directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_route_tests():
    """Run all route tests."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
    
    # Setup Django
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Get the test runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Define test modules
    test_modules = [
        'route.tests.test_models',
        'route.tests.test_views'
    ]
    
    # Run tests
    failures = test_runner.run_tests(test_modules)
    
    if failures:
        sys.exit(1)
    else:
        print("✅ All route tests passed!")

if __name__ == '__main__':
    run_route_tests() 