from django.test import TestCase
from django.contrib.auth.hashers import make_password, check_password
from users.models import Users
from institutions.models import Institution


class UsersModelTest(TestCase):
    """Test cases for the Users model."""
    
    def setUp(self):
        """Set up test data."""
        # Create test institution
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Test University",
            email="test@university.edu"
        )
        
        # Create test user
        self.user = Users.objects.create(
            full_name="John Doe",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="john.doe@university.edu",
            student_code="2023001",
            udocument="12345678",
            direction="123 Test Street",
            uphone="+1234567890",
            upassword=make_password("testpass123"),
            institution=self.institution,
            user_state=Users.STATE_PENDING,
            driver_state=Users.DRIVER_STATE_NONE
        )
    
    def test_user_creation(self):
        """Test that a user can be created successfully."""
        self.assertEqual(self.user.full_name, "John Doe")
        self.assertEqual(self.user.user_type, Users.TYPE_STUDENT)
        self.assertEqual(self.user.user_state, Users.STATE_PENDING)
        self.assertEqual(self.user.driver_state, Users.DRIVER_STATE_NONE)
    
    def test_user_string_representation(self):
        """Test the string representation of the user."""
        self.assertEqual(str(self.user), "John Doe")
    
    def test_user_choices(self):
        """Test that user choices are correctly defined."""
        # Test user type choices
        user_types = [choice[0] for choice in Users.USER_TYPE_CHOICES]
        self.assertIn(Users.TYPE_STUDENT, user_types)
        self.assertIn(Users.TYPE_DRIVER, user_types)
        self.assertIn(Users.TYPE_EMPLOYEE, user_types)
        self.assertIn(Users.TYPE_TEACHER, user_types)
        self.assertIn(Users.TYPE_ADMIN, user_types)
        
        # Test user state choices
        user_states = [choice[0] for choice in Users.USER_STATE_CHOICES]
        self.assertIn(Users.STATE_PENDING, user_states)
        self.assertIn(Users.STATE_APPROVED, user_states)
        self.assertIn(Users.STATE_REJECTED, user_states)
        
        # Test driver state choices
        driver_states = [choice[0] for choice in Users.DRIVER_STATE_CHOICES]
        self.assertIn(Users.DRIVER_STATE_NONE, driver_states)
        self.assertIn(Users.DRIVER_STATE_PENDING, driver_states)
        self.assertIn(Users.DRIVER_STATE_APPROVED, driver_states)
        self.assertIn(Users.DRIVER_STATE_REJECTED, driver_states)
    
    def test_user_institution_relationship(self):
        """Test the relationship between user and institution."""
        self.assertEqual(self.user.institution, self.institution)
        self.assertEqual(self.user.institution.official_name, "Test University")
    
    def test_user_password_hashing(self):
        """Test that passwords are properly hashed."""
        self.assertTrue(check_password("testpass123", self.user.upassword))
        self.assertFalse(check_password("wrongpassword", self.user.upassword))
    
    def test_user_state_transitions(self):
        """Test user state transitions."""
        # Test changing user state
        self.user.user_state = Users.STATE_APPROVED
        self.user.save()
        self.assertEqual(self.user.user_state, Users.STATE_APPROVED)
        
        # Test changing driver state
        self.user.driver_state = Users.DRIVER_STATE_PENDING
        self.user.save()
        self.assertEqual(self.user.driver_state, Users.DRIVER_STATE_PENDING)
    
    def test_user_type_validation(self):
        """Test that user types are valid."""
        valid_types = [choice[0] for choice in Users.USER_TYPE_CHOICES]
        self.assertIn(self.user.user_type, valid_types)
    
    def test_user_email_validation(self):
        """Test that user email is properly stored."""
        self.assertEqual(self.user.institutional_mail, "john.doe@university.edu")
        self.assertTrue('@' in self.user.institutional_mail) 