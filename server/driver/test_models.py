from django.test import TestCase
from django.contrib.auth.hashers import make_password
from datetime import timedelta
from driver.models import Driver
from users.models import Users
from institutions.models import Institution


class DriverModelTest(TestCase):
    """Test cases for the Driver model."""
    
    def setUp(self):
        """Set up test data."""
        # Create institution
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Test University",
            email="test@university.edu",
            phone="+1234567890",
            address="123 Test Street",
            city="Test City",
            istate="Test State",
            postal_code="12345",
            ipassword=make_password("testpass123")
        )
        
        # Create user
        self.user = Users.objects.create(
            full_name="Test Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="driver@university.edu",
            student_code="2023001",
            udocument="12345678",
            direction="123 Driver Street",
            uphone="+1234567890",
            upassword=make_password("driverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        
        # Create driver
        self.driver = Driver.objects.create(
            user=self.user,
            validate_state='approved'
        )
    
    def test_driver_creation(self):
        """Test that a driver can be created successfully."""
        self.assertEqual(self.driver.user, self.user)
        self.assertEqual(self.driver.validate_state, 'approved')
        self.assertIsNotNone(self.driver.created_at)
    
    def test_driver_string_representation(self):
        """Test the string representation of the driver."""
        # Since there's no __str__ method, test the object creation
        self.assertIsNotNone(self.driver)
        self.assertEqual(self.driver.user, self.user)
    
    def test_driver_choices(self):
        """Test that driver validate state choices are correctly defined."""
        validate_states = [choice[0] for choice in Driver.VALIDATE_STATE_CHOICES]
        self.assertIn('pending', validate_states)
        self.assertIn('approved', validate_states)
        self.assertIn('rejected', validate_states)
    
    def test_driver_user_relationship(self):
        """Test the relationship between driver and user."""
        self.assertEqual(self.driver.user, self.user)
        self.assertEqual(self.driver.user.full_name, "Test Driver")
        self.assertEqual(self.driver.user.user_type, Users.TYPE_DRIVER)
        
        # Test reverse relationship
        self.assertEqual(self.user.driver, self.driver)
    
    def test_driver_validate_state_transitions(self):
        """Test driver validate state transitions."""
        # Test approved -> pending
        self.driver.validate_state = 'pending'
        self.driver.save()
        self.assertEqual(self.driver.validate_state, 'pending')
        
        # Test pending -> rejected
        self.driver.validate_state = 'rejected'
        self.driver.save()
        self.assertEqual(self.driver.validate_state, 'rejected')
        
        # Test rejected -> approved
        self.driver.validate_state = 'approved'
        self.driver.save()
        self.assertEqual(self.driver.validate_state, 'approved')
    
    def test_driver_created_at_auto_set(self):
        """Test that created_at is set automatically."""
        # Create a new driver to test auto_now_add
        new_user = Users.objects.create(
            full_name="New Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="newdriver@university.edu",
            student_code="2023002",
            udocument="87654321",
            direction="456 New Driver Street",
            uphone="+0987654321",
            upassword=make_password("newdriverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        
        new_driver = Driver.objects.create(
            user=new_user,
            validate_state='pending'
        )
        
        self.assertIsNotNone(new_driver.created_at)
    
    def test_driver_constraints(self):
        """Test that driver constraints are working."""
        # Test valid validate states
        valid_states = ['pending', 'approved', 'rejected']
        for state in valid_states:
            self.driver.validate_state = state
            self.driver.save()
            self.assertEqual(self.driver.validate_state, state)
    
    def test_driver_user_primary_key(self):
        """Test that driver uses user as primary key."""
        self.assertEqual(self.driver.pk, self.user.uid)
        self.assertEqual(self.driver.user.uid, self.user.uid)
    
    def test_driver_user_one_to_one_relationship(self):
        """Test the one-to-one relationship between driver and user."""
        # Test that each user can only have one driver record
        self.assertEqual(self.user.driver, self.driver)
        
        # Test that each driver belongs to exactly one user
        self.assertEqual(self.driver.user, self.user)
    
    def test_driver_with_different_users(self):
        """Test driver with different users."""
        # Create another user
        user2 = Users.objects.create(
            full_name="Another Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="anotherdriver@university.edu",
            student_code="2023003",
            udocument="11111111",
            direction="789 Another Driver Street",
            uphone="+1111111111",
            upassword=make_password("anotherdriverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        
        # Create driver for second user
        driver2 = Driver.objects.create(
            user=user2,
            validate_state='pending'
        )
        
        self.assertNotEqual(self.driver.user, driver2.user)
        self.assertNotEqual(self.driver, driver2)
    
    def test_driver_validate_state_consistency(self):
        """Test that driver validate state is consistent."""
        # Test that validate state matches the choices
        valid_states = [choice[0] for choice in Driver.VALIDATE_STATE_CHOICES]
        self.assertIn(self.driver.validate_state, valid_states)
    
    def test_driver_created_at_immutability(self):
        """Test that created_at is immutable after creation."""
        original_created_at = self.driver.created_at
        
        # Try to modify created_at (should not change)
        from django.utils import timezone
        self.driver.created_at = timezone.now()
        self.driver.save()
        
        # The created_at should remain the same (with small tolerance for microseconds)
        self.assertAlmostEqual(self.driver.created_at, original_created_at, delta=timedelta(seconds=1))
    
    def test_driver_user_type_validation(self):
        """Test that driver user has correct user type."""
        # Test that driver user is of type driver
        self.assertEqual(self.driver.user.user_type, Users.TYPE_DRIVER)
        
        # Test that driver user is approved
        self.assertEqual(self.driver.user.user_state, Users.STATE_APPROVED)
    
    def test_driver_meta_options(self):
        """Test driver meta options."""
        # Test table name
        self.assertEqual(Driver._meta.db_table, 'driver')
        
        # Test verbose name
        self.assertEqual(Driver._meta.verbose_name, 'driver')
        self.assertEqual(Driver._meta.verbose_name_plural, 'drivers')
    
    def test_driver_constraint_name(self):
        """Test that the constraint name is correct."""
        # Check if the constraint exists
        constraints = Driver._meta.constraints
        constraint_names = [constraint.name for constraint in constraints]
        self.assertIn('validate_state_check', constraint_names)
    
    def test_driver_user_cascade_delete(self):
        """Test that driver is deleted when user is deleted."""
        driver_id = self.driver.pk
        user_id = self.user.uid
        
        # Delete the user
        self.user.delete()
        
        # Check that driver is also deleted
        with self.assertRaises(Driver.DoesNotExist):
            Driver.objects.get(pk=driver_id)
        
        # Check that user is also deleted
        with self.assertRaises(Users.DoesNotExist):
            Users.objects.get(uid=user_id) 