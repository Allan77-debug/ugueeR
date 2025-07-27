# Users App Test Summary

## Overview

Comprehensive test suite for the Users app covering models, serializers, permissions, and business logic. Tests are now organized in separate files for better maintainability.

## Test Structure

### 📁 Test Files Organization

```
users/
├── tests/
│   ├── __init__.py
│   ├── test_models.py          # Model tests
│   ├── test_serializers.py     # Serializer tests
│   ├── test_permissions.py     # Permission tests
│   └── test_business_logic.py  # Business logic tests
├── tests.py                    # Main import file
└── run_tests.py               # Test runner script
```

## Test Coverage

### 1. Model Tests (`test_models.py`)

- ✅ User creation and validation
- ✅ String representation
- ✅ Choice field validation (user types, states, driver states)
- ✅ Institution relationship
- ✅ Password hashing and security
- ✅ User state transitions
- ✅ Email validation

### 2. Serializer Tests (`test_serializers.py`)

- ✅ Data validation
- ✅ Email domain validation
- ✅ User creation with proper password hashing
- ✅ Login serializer validation
- ✅ Profile serializer with institution name
- ✅ User update functionality
- ✅ Invalid data handling

### 3. Permission Tests (`test_permissions.py`)

- ✅ Valid JWT token authentication
- ✅ Invalid token handling
- ✅ Missing token handling
- ✅ Malformed authorization header
- ✅ Expired token handling
- ✅ Wrong algorithm handling
- ✅ Missing user_id in token
- ✅ Empty token handling
- ✅ Missing Bearer prefix

### 4. Business Logic Tests (`test_business_logic.py`)

- ✅ User approval workflow
- ✅ Driver application requirements
- ✅ User type validation
- ✅ Institution relationship testing
- ✅ Password security features
- ✅ User state transitions
- ✅ Driver state transitions
- ✅ User type consistency
- ✅ Institution user count

## Test Statistics

- **Total Tests**: 33 (increased from 23)
- **Test Files**: 4 separate files
- **Test Classes**: 4
- **Coverage Areas**: Models, Serializers, Permissions, Business Logic
- **Status**: ✅ All tests passing

## Running the Tests

### Method 1: Using the users test runner script

```bash
cd server
source env/bin/activate
python users/run_tests.py
```

### Method 2: Using Django's test command

```bash
cd server
source env/bin/activate
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test users.tests.test_models users.tests.test_serializers users.tests.test_permissions users.tests.test_business_logic
```

### Method 3: Running specific test files

```bash
# Run only model tests
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test users.tests.test_models

# Run only serializer tests
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test users.tests.test_serializers

# Run only permission tests
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test users.tests.test_permissions

# Run only business logic tests
DJANGO_SETTINGS_MODULE=config.test_settings python manage.py test users.tests.test_business_logic
```

### Method 4: Using the main test runner

```bash
./test_runner.sh
```

## Key Features Tested

### User Management

- User registration with proper validation
- Password security (hashing, verification)
- Email domain validation against institutions
- User state management (pending → approved → driver application)

### Authentication & Authorization

- Custom JWT token validation
- Permission-based access control
- Token expiration handling
- Malformed token handling
- Comprehensive edge case testing

### Business Rules

- Only approved users can apply to be drivers
- User types are properly validated
- Institution relationships are maintained
- State transitions are properly handled

### Data Integrity

- Password hashing prevents plain text storage
- Email validation ensures institutional domains
- Foreign key relationships are maintained
- Choice fields are properly constrained

## Benefits of Separated Tests

### ✅ **Better Organization**

- Each component has its own test file
- Easier to find and maintain specific tests
- Clear separation of concerns

### ✅ **Improved Maintainability**

- Changes to one component don't affect others
- Easier to add new tests to specific areas
- Better code organization

### ✅ **Selective Testing**

- Can run tests for specific components
- Faster feedback during development
- Easier debugging

### ✅ **Enhanced Coverage**

- More comprehensive edge case testing
- Better permission testing
- Additional business logic scenarios

## Test Data

The tests use realistic test data including:

- Multiple user types (student, driver, employee, teacher, admin)
- Different user states (pending, approved, rejected)
- Driver states (none, pending, approved, rejected)
- Institution relationships
- Proper email domains

## Future Enhancements

- API endpoint tests (when URLs are defined)
- Integration tests with other apps
- Performance tests for large datasets
- Edge case testing for complex workflows
- Database transaction testing
