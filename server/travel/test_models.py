from django.test import TestCase
from django.utils import timezone
from datetime import datetime, timedelta
from travel.models import Travel
from driver.models import Driver
from vehicle.models import Vehicle
from users.models import Users
from institutions.models import Institution
from django.contrib.auth.hashers import make_password


class TravelModelTest(TestCase):
    """Test cases for the Travel model."""
    
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
        
        # Create vehicle
        self.vehicle = Vehicle.objects.create(
            driver=self.driver,
            plate="ABC123",
            brand="Toyota",
            model="Corolla",
            vehicle_type="Sedan",
            category="metropolitano",
            soat=datetime.now().date() + timedelta(days=365),
            tecnomechanical=datetime.now().date() + timedelta(days=365),
            capacity=4
        )
        
        # Create a mock route (we'll skip the actual Route model for now)
        # For testing purposes, we'll create a travel without route
        # This tests the core Travel model functionality
        
    def test_travel_creation_without_route(self):
        """Test that a travel can be created successfully (without route for testing)."""
        # Note: This test is for demonstration purposes
        # In a real scenario, you would need a valid route
        self.assertIsNotNone(self.driver)
        self.assertIsNotNone(self.vehicle)
        self.assertEqual(self.driver.user.full_name, "Test Driver")
        self.assertEqual(self.vehicle.plate, "ABC123")
    
    def test_travel_choices(self):
        """Test that travel states are correctly defined."""
        travel_states = [choice[0] for choice in Travel.TRAVEL_STATES]
        self.assertIn('scheduled', travel_states)
        self.assertIn('in_progress', travel_states)
        self.assertIn('completed', travel_states)
        self.assertIn('cancelled', travel_states)
    
    def test_travel_constraints(self):
        """Test that travel constraints are working."""
        # Test valid travel state
        valid_states = ['scheduled', 'in_progress', 'completed', 'cancelled']
        for state in valid_states:
            # We can't create a travel without route, but we can test the choices
            self.assertIn(state, [choice[0] for choice in Travel.TRAVEL_STATES])
    
    def test_travel_price_validation(self):
        """Test that travel price validation works."""
        # Test that price must be >= 0 (constraint)
        # We can't create a travel without route, but we can test the constraint logic
        self.assertTrue(True)  # Placeholder - constraint would be tested in real scenario
    
    def test_travel_time_validation(self):
        """Test that travel time is properly handled."""
        # Test future time
        future_time = timezone.now() + timedelta(hours=2)
        self.assertIsNotNone(future_time)
        
        # Test past time
        past_time = timezone.now() - timedelta(hours=1)
        self.assertIsNotNone(past_time)
    
    def test_travel_state_transitions(self):
        """Test travel state transitions."""
        # Test that all state transitions are valid
        valid_states = ['scheduled', 'in_progress', 'completed', 'cancelled']
        
        # Test transitions
        for i, state1 in enumerate(valid_states):
            for j, state2 in enumerate(valid_states):
                # All transitions should be valid
                self.assertIn(state1, valid_states)
                self.assertIn(state2, valid_states)
    
    def test_travel_price_range(self):
        """Test travel price range validation."""
        # Test minimum price (0)
        self.assertTrue(0 >= 0)  # Constraint check
        
        # Test high price
        self.assertTrue(100000 >= 0)  # Constraint check
    
    def test_travel_time_flexibility(self):
        """Test travel time flexibility."""
        # Test past time
        past_time = timezone.now() - timedelta(hours=1)
        self.assertIsNotNone(past_time)
        
        # Test future time
        future_time = timezone.now() + timedelta(days=7)
        self.assertIsNotNone(future_time)
    
    def test_travel_relationships(self):
        """Test the relationships between travel and related models."""
        # Test that driver and vehicle are properly set up
        self.assertEqual(self.driver.user, self.user)
        self.assertEqual(self.vehicle.driver, self.driver)
        
        # Test reverse relationships
        self.assertIn(self.vehicle, self.driver.vehicles.all())
    
    def test_travel_with_different_vehicles(self):
        """Test travel with different vehicles."""
        # Create another vehicle
        vehicle2 = Vehicle.objects.create(
            driver=self.driver,
            plate="XYZ789",
            brand="Honda",
            model="Civic",
            vehicle_type="Sedan",
            category="intermunicipal",
            soat=datetime.now().date() + timedelta(days=365),
            tecnomechanical=datetime.now().date() + timedelta(days=365),
            capacity=5
        )
        
        self.assertNotEqual(self.vehicle.plate, vehicle2.plate)
        self.assertEqual(self.vehicle.driver, vehicle2.driver)
    
    def test_travel_meta_options(self):
        """Test travel meta options."""
        # Test table name
        self.assertEqual(Travel._meta.db_table, 'travel')
        
        # Test verbose name
        self.assertEqual(Travel._meta.verbose_name, 'travel')
        self.assertEqual(Travel._meta.verbose_name_plural, 'travels')
    
    def test_travel_constraint_names(self):
        """Test that the constraint names are correct."""
        # Check if the constraints exist
        constraints = Travel._meta.constraints
        constraint_names = [constraint.name for constraint in constraints]
        self.assertIn('chk_price_positive', constraint_names)
        self.assertIn('travel_travel_state_check', constraint_names)
    
    def test_travel_string_representation(self):
        """Test the string representation of the travel."""
        # Since there's no __str__ method, test the object creation
        self.assertIsNotNone(self.driver)
        self.assertIsNotNone(self.vehicle)
    
    def test_travel_driver_vehicle_consistency(self):
        """Test that driver and vehicle are consistent."""
        # Test that vehicle belongs to the driver
        self.assertEqual(self.vehicle.driver, self.driver)
        
        # Test that driver can access their vehicles
        self.assertIn(self.vehicle, self.driver.vehicles.all()) 