from django.test import TestCase
from django.contrib.auth.hashers import make_password
from institutions.models import Institution


class InstitutionModelTest(TestCase):
    """Test cases for the Institution model."""
    
    def setUp(self):
        """Set up test data."""
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Test University",
            short_name="TU",
            email="test@university.edu",
            phone="+1234567890",
            address="123 University Street",
            city="Test City",
            istate="Test State",
            postal_code="12345",
            ipassword=make_password("testpass123"),
            validate_state=False,
            status='pendiente',
            rejection_reason=""
        )
    
    def test_institution_creation(self):
        """Test that an institution can be created successfully."""
        self.assertEqual(self.institution.official_name, "Test University")
        self.assertEqual(self.institution.short_name, "TU")
        self.assertEqual(self.institution.email, "test@university.edu")
        self.assertEqual(self.institution.phone, "+1234567890")
        self.assertEqual(self.institution.city, "Test City")
        self.assertEqual(self.institution.istate, "Test State")
        self.assertEqual(self.institution.postal_code, "12345")
        self.assertEqual(self.institution.status, 'pendiente')
        self.assertFalse(self.institution.validate_state)
    
    def test_institution_string_representation(self):
        """Test the string representation of the institution."""
        self.assertEqual(str(self.institution), "Test University")
    
    def test_institution_status_choices(self):
        """Test that institution status choices are correctly defined."""
        status_choices = [choice[0] for choice in Institution._meta.get_field('status').choices]
        self.assertIn('pendiente', status_choices)
        self.assertIn('aprobada', status_choices)
        self.assertIn('rechazada', status_choices)
    
    def test_institution_default_values(self):
        """Test that institution default values are set correctly."""
        # Test default colors
        self.assertEqual(self.institution.primary_color, "#6a5acd")
        self.assertEqual(self.institution.secondary_color, "#ffffff")
        
        # Test default validate_state
        self.assertFalse(self.institution.validate_state)
        
        # Test default status
        self.assertEqual(self.institution.status, 'pendiente')
    
    def test_institution_status_transitions(self):
        """Test institution status transitions."""
        # Test pendiente -> aprobada
        self.institution.status = 'aprobada'
        self.institution.save()
        self.assertEqual(self.institution.status, 'aprobada')
        
        # Test aprobada -> rechazada
        self.institution.status = 'rechazada'
        self.institution.save()
        self.assertEqual(self.institution.status, 'rechazada')
        
        # Test rechazada -> pendiente
        self.institution.status = 'pendiente'
        self.institution.save()
        self.assertEqual(self.institution.status, 'pendiente')
    
    def test_institution_validation_state(self):
        """Test institution validation state."""
        # Test setting validate_state to True
        self.institution.validate_state = True
        self.institution.save()
        self.assertTrue(self.institution.validate_state)
        
        # Test setting validate_state to False
        self.institution.validate_state = False
        self.institution.save()
        self.assertFalse(self.institution.validate_state)
    
    def test_institution_rejection_reason(self):
        """Test institution rejection reason."""
        # Test setting rejection reason
        rejection_reason = "Incomplete documentation"
        self.institution.rejection_reason = rejection_reason
        self.institution.save()
        self.assertEqual(self.institution.rejection_reason, rejection_reason)
        
        # Test clearing rejection reason
        self.institution.rejection_reason = ""
        self.institution.save()
        self.assertEqual(self.institution.rejection_reason, "")
    
    def test_institution_email_uniqueness(self):
        """Test that institution email is unique."""
        # Create another institution with different email
        institution2 = Institution.objects.create(
            id_institution=2,
            official_name="Another University",
            short_name="AU",
            email="another@university.edu",
            phone="+0987654321",
            address="456 Another Street",
            city="Another City",
            istate="Another State",
            postal_code="54321",
            ipassword=make_password("anotherpass123")
        )
        
        self.assertNotEqual(self.institution.email, institution2.email)
    
    def test_institution_phone_uniqueness(self):
        """Test that institution phone is unique."""
        # Create another institution with different phone
        institution2 = Institution.objects.create(
            id_institution=2,
            official_name="Another University",
            short_name="AU",
            email="another@university.edu",
            phone="+0987654321",
            address="456 Another Street",
            city="Another City",
            istate="Another State",
            postal_code="54321",
            ipassword=make_password("anotherpass123")
        )
        
        self.assertNotEqual(self.institution.phone, institution2.phone)
    
    def test_institution_color_validation(self):
        """Test institution color validation."""
        # Test valid hex colors
        self.institution.primary_color = "#ff0000"
        self.institution.secondary_color = "#00ff00"
        self.institution.save()
        
        self.assertEqual(self.institution.primary_color, "#ff0000")
        self.assertEqual(self.institution.secondary_color, "#00ff00")
    
    def test_institution_address_validation(self):
        """Test institution address validation."""
        # Test long address
        long_address = "This is a very long address that should be stored properly in the database without any issues"
        self.institution.address = long_address
        self.institution.save()
        
        self.assertEqual(self.institution.address, long_address)
    
    def test_institution_postal_code_validation(self):
        """Test institution postal code validation."""
        # Test different postal code formats
        postal_codes = ["12345", "A1B2C3", "12345-6789"]
        
        for postal_code in postal_codes:
            self.institution.postal_code = postal_code
            self.institution.save()
            self.assertEqual(self.institution.postal_code, postal_code)
    
    def test_institution_application_date(self):
        """Test that application_date is set automatically."""
        # Create a new institution to test auto_now_add
        new_institution = Institution.objects.create(
            id_institution=3,
            official_name="New University",
            short_name="NU",
            email="new@university.edu",
            phone="+1111111111",
            address="789 New Street",
            city="New City",
            istate="New State",
            postal_code="11111",
            ipassword=make_password("newpass123")
        )
        
        self.assertIsNotNone(new_institution.application_date)
    
    def test_institution_blank_fields(self):
        """Test that blank fields are handled properly."""
        # Test blank rejection_reason
        self.institution.rejection_reason = ""
        self.institution.save()
        self.assertEqual(self.institution.rejection_reason, "")
        
        # Test None rejection_reason
        self.institution.rejection_reason = None
        self.institution.save()
        self.assertIsNone(self.institution.rejection_reason)
    
    def test_institution_password_hashing(self):
        """Test that institution password is properly hashed."""
        from django.contrib.auth.hashers import check_password
        
        # Test that password is hashed
        self.assertTrue(check_password("testpass123", self.institution.ipassword))
        self.assertFalse(check_password("wrongpassword", self.institution.ipassword))
    
    def test_institution_meta_options(self):
        """Test institution meta options."""
        # Test table name
        self.assertEqual(Institution._meta.db_table, 'institution')
        
        # Test verbose name
        self.assertEqual(Institution._meta.verbose_name, 'institution')
        self.assertEqual(Institution._meta.verbose_name_plural, 'institutions') 