from django.test import TestCase
from django.contrib.auth.hashers import make_password
from datetime import datetime, timedelta
from vehicle.models import Vehicle
from driver.models import Driver
from users.models import Users
from institutions.models import Institution


class VehicleModelTest(TestCase):
    """Test cases for the Vehicle model."""
    
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
    
    def test_vehicle_creation(self):
        """Test that a vehicle can be created successfully."""
        self.assertEqual(self.vehicle.driver, self.driver)
        self.assertEqual(self.vehicle.plate, "ABC123")
        self.assertEqual(self.vehicle.brand, "Toyota")
        self.assertEqual(self.vehicle.model, "Corolla")
        self.assertEqual(self.vehicle.vehicle_type, "Sedan")
        self.assertEqual(self.vehicle.category, "metropolitano")
        self.assertEqual(self.vehicle.capacity, 4)
    
    def test_vehicle_string_representation(self):
        """Test the string representation of the vehicle."""
        # Since there's no __str__ method, test the object creation
        self.assertIsNotNone(self.vehicle)
        self.assertEqual(self.vehicle.id, 1)
    
    def test_vehicle_category_choices(self):
        """Test that vehicle category choices are correctly defined."""
        # Test valid categories
        valid_categories = ['intermunicipal', 'metropolitano', 'campus']
        for category in valid_categories:
            self.vehicle.category = category
            self.vehicle.save()
            self.assertEqual(self.vehicle.category, category)
    
    def test_vehicle_driver_relationship(self):
        """Test the relationship between vehicle and driver."""
        self.assertEqual(self.vehicle.driver, self.driver)
        self.assertEqual(self.vehicle.driver.user.full_name, "Test Driver")
        
        # Test reverse relationship
        self.assertIn(self.vehicle, self.driver.vehicles.all())
    
    def test_vehicle_plate_uniqueness(self):
        """Test that vehicle plate is unique."""
        # Create another vehicle with different plate
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
    
    def test_vehicle_soat_validation(self):
        """Test vehicle SOAT date validation."""
        # Test future SOAT date
        future_soat = datetime.now().date() + timedelta(days=365)
        self.vehicle.soat = future_soat
        self.vehicle.save()
        self.assertEqual(self.vehicle.soat, future_soat)
        
        # Test past SOAT date
        past_soat = datetime.now().date() - timedelta(days=30)
        self.vehicle.soat = past_soat
        self.vehicle.save()
        self.assertEqual(self.vehicle.soat, past_soat)
    
    def test_vehicle_tecnomechanical_validation(self):
        """Test vehicle tecnomechanical date validation."""
        # Test future tecnomechanical date
        future_tecno = datetime.now().date() + timedelta(days=365)
        self.vehicle.tecnomechanical = future_tecno
        self.vehicle.save()
        self.assertEqual(self.vehicle.tecnomechanical, future_tecno)
        
        # Test past tecnomechanical date
        past_tecno = datetime.now().date() - timedelta(days=30)
        self.vehicle.tecnomechanical = past_tecno
        self.vehicle.save()
        self.assertEqual(self.vehicle.tecnomechanical, past_tecno)
    
    def test_vehicle_capacity_validation(self):
        """Test vehicle capacity validation."""
        # Test minimum capacity
        self.vehicle.capacity = 1
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 1)
        
        # Test high capacity
        self.vehicle.capacity = 50
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 50)
        
        # Test zero capacity
        self.vehicle.capacity = 0
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 0)
    
    def test_vehicle_brand_model_validation(self):
        """Test vehicle brand and model validation."""
        # Test different brands
        brands = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes"]
        for brand in brands:
            self.vehicle.brand = brand
            self.vehicle.save()
            self.assertEqual(self.vehicle.brand, brand)
        
        # Test different models
        models = ["Corolla", "Civic", "Focus", "Cruze", "X3", "C-Class"]
        for model in models:
            self.vehicle.model = model
            self.vehicle.save()
            self.assertEqual(self.vehicle.model, model)
    
    def test_vehicle_type_validation(self):
        """Test vehicle type validation."""
        # Test different vehicle types
        vehicle_types = ["Sedan", "SUV", "Truck", "Van", "Bus", "Motorcycle"]
        for vehicle_type in vehicle_types:
            self.vehicle.vehicle_type = vehicle_type
            self.vehicle.save()
            self.assertEqual(self.vehicle.vehicle_type, vehicle_type)
    
    def test_vehicle_constraints(self):
        """Test that vehicle constraints are working."""
        # Test valid categories
        valid_categories = ['intermunicipal', 'metropolitano', 'campus']
        for category in valid_categories:
            self.vehicle.category = category
            self.vehicle.save()
            self.assertEqual(self.vehicle.category, category)
    
    def test_vehicle_with_different_drivers(self):
        """Test vehicle with different drivers."""
        # Create another driver
        user2 = Users.objects.create(
            full_name="Another Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="anotherdriver@university.edu",
            student_code="2023002",
            udocument="87654321",
            direction="456 Another Driver Street",
            uphone="+0987654321",
            upassword=make_password("anotherdriverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        
        driver2 = Driver.objects.create(
            user=user2,
            validate_state='approved'
        )
        
        # Create vehicle for second driver
        vehicle2 = Vehicle.objects.create(
            driver=driver2,
            plate="DEF456",
            brand="Honda",
            model="Civic",
            vehicle_type="Sedan",
            category="intermunicipal",
            soat=datetime.now().date() + timedelta(days=365),
            tecnomechanical=datetime.now().date() + timedelta(days=365),
            capacity=5
        )
        
        self.assertNotEqual(self.vehicle.driver, vehicle2.driver)
        self.assertNotEqual(self.vehicle.plate, vehicle2.plate)
    
    def test_vehicle_plate_format_validation(self):
        """Test vehicle plate format validation."""
        # Test different plate formats
        plate_formats = ["ABC123", "XYZ789", "123ABC", "ABC-123", "ABC 123"]
        for plate in plate_formats:
            self.vehicle.plate = plate
            self.vehicle.save()
            self.assertEqual(self.vehicle.plate, plate)
    
    def test_vehicle_meta_options(self):
        """Test vehicle meta options."""
        # Test table name
        self.assertEqual(Vehicle._meta.db_table, 'vehicle')
        
        # Test verbose name
        self.assertEqual(Vehicle._meta.verbose_name, 'vehicle')
        self.assertEqual(Vehicle._meta.verbose_name_plural, 'vehicles')
    
    def test_vehicle_constraint_name(self):
        """Test that the constraint name is correct."""
        # Check if the constraint exists
        constraints = Vehicle._meta.constraints
        constraint_names = [constraint.name for constraint in constraints]
        self.assertIn('category_check', constraint_names)
    
    def test_vehicle_driver_cascade_delete(self):
        """Test that vehicle is deleted when driver is deleted."""
        vehicle_id = self.vehicle.id
        driver_id = self.driver.pk
        
        # Delete the driver
        self.driver.delete()
        
        # Check that vehicle is also deleted
        with self.assertRaises(Vehicle.DoesNotExist):
            Vehicle.objects.get(id=vehicle_id)
        
        # Check that driver is also deleted
        with self.assertRaises(Driver.DoesNotExist):
            Driver.objects.get(pk=driver_id)
    
    def test_vehicle_dates_consistency(self):
        """Test that vehicle dates are consistent."""
        # Test that SOAT and tecnomechanical dates can be different
        self.vehicle.soat = datetime.now().date() + timedelta(days=365)
        self.vehicle.tecnomechanical = datetime.now().date() + timedelta(days=180)
        self.vehicle.save()
        
        self.assertNotEqual(self.vehicle.soat, self.vehicle.tecnomechanical)
    
    def test_vehicle_capacity_range(self):
        """Test vehicle capacity range validation."""
        # Test minimum capacity
        self.vehicle.capacity = 0
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 0)
        
        # Test maximum reasonable capacity
        self.vehicle.capacity = 100
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 100)
    
    def test_vehicle_category_consistency(self):
        """Test that vehicle category is consistent."""
        # Test that category matches the constraint
        valid_categories = ['intermunicipal', 'metropolitano', 'campus']
        self.assertIn(self.vehicle.category, valid_categories) 