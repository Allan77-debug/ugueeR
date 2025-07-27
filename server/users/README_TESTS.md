# Quick Test Reference

## 🚀 Quick Start

```bash
# Run all user tests
python users/run_tests.py
```

## 📋 Test Files

| File                     | Purpose               | Tests   |
| ------------------------ | --------------------- | ------- |
| `test_models.py`         | Model functionality   | 8 tests |
| `test_serializers.py`    | Serializer validation | 7 tests |
| `test_permissions.py`    | JWT authentication    | 9 tests |
| `test_business_logic.py` | Business workflows    | 9 tests |

## 🎯 Running Specific Tests

```bash
# Run only model tests
python manage.py test users.tests.test_models

# Run only serializer tests
python manage.py test users.tests.test_serializers

# Run only permission tests
python manage.py test users.tests.test_permissions

# Run only business logic tests
python manage.py test users.tests.test_business_logic
```

## 📊 Test Statistics

- **Total Tests**: 33
- **All Passing**: ✅
- **Coverage**: Models, Serializers, Permissions, Business Logic

## 🔧 Setup

```bash
cd server
source env/bin/activate
DJANGO_SETTINGS_MODULE=config.test_settings
```

## 📝 Adding New Tests

1. Choose the appropriate test file based on what you're testing
2. Add your test class or method
3. Run the specific test file to verify
4. Run all tests to ensure nothing breaks

## 🐛 Debugging

If tests fail:

1. Check the specific test file mentioned in the error
2. Verify test data setup in `setUp()` method
3. Check imports and dependencies
4. Run individual test files to isolate issues
