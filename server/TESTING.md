# Testing Guide

This document explains how to run tests safely without breaking your database.

## Problem

The project has complex migrations that can cause issues when running tests:

- Driver model changes (removing id field, making user primary key)
- Complex foreign key dependencies
- Migration conflicts during test database setup

## Solution

We've set up a test environment that:

1. Uses SQLite in-memory database for tests
2. Disables migrations during tests
3. Provides isolated test settings
4. Uses absolute imports in all test files for reliability

## Running Tests

### Method 1: Using the shell script (Recommended)

```bash
cd server
./test_runner.sh
```

### Method 2: Using the Python test runner script

```bash
cd server
source env/bin/activate
python run_tests.py
```

### Method 3: Using Django's test command with test settings

```bash
cd server
source env/bin/activate
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test
```

### Method 4: Testing specific apps or files

```bash
cd server
source env/bin/activate
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test travel driver users
# Or a specific test file
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test travel.test_views
```

## Test Database Configuration

The test settings (`config/test_settings.py`) include:

- SQLite in-memory database
- Disabled migrations
- Faster password hashers
- Disabled logging
- In-memory cache

## Writing Tests

When writing tests, remember:

1. Tests run in isolation
2. No migrations are applied
3. Use `setUp()` and `tearDown()` for test data
4. Test database is created fresh for each test
5. **Always use absolute imports** (e.g., `from users.models import Users`)

## Example Test

```python
from django.test import TestCase
from django.contrib.auth.models import User

class MyTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_something(self):
        # Your test code here
        self.assertEqual(User.objects.count(), 1)
```

## Troubleshooting

If you encounter issues:

1. **Migration errors**: Make sure you're using the test settings
2. **Database errors**: Check that the test database is being used
3. **Import errors**: Ensure all test files use absolute imports and required apps are in INSTALLED_APPS
4. **Obsolete test files**: Remove or update any old test files with relative imports

## Development vs Testing

- **Development**: Uses PostgreSQL with migrations
- **Testing**: Uses SQLite in-memory without migrations

This separation ensures your development database remains intact while tests run safely.

## Current Test Suite

- **Total tests:** 299 (as of last run)
- **Skipped tests:** 23 (due to decorators or technical limitations)
- **All tests use absolute imports and are organized by app**
