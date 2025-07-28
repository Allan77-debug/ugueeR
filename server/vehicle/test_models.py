# server/vehicle/tests/test_models.py
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from datetime import datetime, timedelta
from vehicle.models import Vehicle
from driver.models import Driver
from users.models import Users
from institutions.models import Institution


class VehicleModelTest(TestCase):
    """Casos de prueba para el modelo Vehicle."""
    
    def setUp(self):
        """
        Configura los datos de prueba iniciales para cada test.
        Este método se ejecuta antes de cada método de prueba (`test_*`).
        """
        # Crear una institución de prueba.
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
        
        # Crear un usuario de prueba.
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
        
        # Crear un perfil de conductor.
        self.driver = Driver.objects.create(
            user=self.user,
            validate_state='approved'
        )
        
        # Crear un vehículo de prueba.
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
        """Prueba que un vehículo se puede crear exitosamente."""
        self.assertEqual(self.vehicle.driver, self.driver)
        self.assertEqual(self.vehicle.plate, "ABC123")
        self.assertEqual(self.vehicle.brand, "Toyota")
        self.assertEqual(self.vehicle.model, "Corolla")
        self.assertEqual(self.vehicle.vehicle_type, "Sedan")
        self.assertEqual(self.vehicle.category, "metropolitano")
        self.assertEqual(self.vehicle.capacity, 4)
    
    def test_vehicle_string_representation(self):
        """
        Prueba la representación en cadena del vehículo.
        Como no hay un método __str__ definido, esta prueba solo verifica que el objeto existe.
        """
        self.assertIsNotNone(self.vehicle)
        # Asumiendo que es el primer objeto, su ID será 1.
        self.assertEqual(self.vehicle.id, 1)
    
    def test_vehicle_category_choices(self):
        """Prueba que el campo 'category' del vehículo puede ser actualizado con los valores válidos."""
        valid_categories = ['intermunicipal', 'metropolitano', 'campus']
        for category in valid_categories:
            self.vehicle.category = category
            self.vehicle.save()
            self.assertEqual(self.vehicle.category, category)
    
    def test_vehicle_driver_relationship(self):
        """Prueba la relación entre el vehículo y el conductor."""
        self.assertEqual(self.vehicle.driver, self.driver)
        self.assertEqual(self.vehicle.driver.user.full_name, "Test Driver")
        
        # Prueba la relación inversa para asegurar que el vehículo aparece en la lista del conductor.
        self.assertIn(self.vehicle, self.driver.vehicles.all())
    
    def test_vehicle_plate_uniqueness(self):
        """
        Prueba (de forma incompleta) la unicidad de la placa.
        Esta prueba solo crea un segundo vehículo con una placa diferente y
        confirma que no son iguales. No verifica que una placa duplicada lance un error.
        """
        # Crear otro vehículo con una placa diferente.
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
        """Prueba que el campo de fecha del SOAT se guarda y recupera correctamente."""
        # Prueba con una fecha futura.
        future_soat = datetime.now().date() + timedelta(days=365)
        self.vehicle.soat = future_soat
        self.vehicle.save()
        self.assertEqual(self.vehicle.soat, future_soat)
        
        # Prueba con una fecha pasada.
        past_soat = datetime.now().date() - timedelta(days=30)
        self.vehicle.soat = past_soat
        self.vehicle.save()
        self.assertEqual(self.vehicle.soat, past_soat)
    
    def test_vehicle_tecnomechanical_validation(self):
        """Prueba que el campo de fecha de la tecnomecánica se guarda y recupera correctamente."""
        # Prueba con una fecha futura.
        future_tecno = datetime.now().date() + timedelta(days=365)
        self.vehicle.tecnomechanical = future_tecno
        self.vehicle.save()
        self.assertEqual(self.vehicle.tecnomechanical, future_tecno)
        
        # Prueba con una fecha pasada.
        past_tecno = datetime.now().date() - timedelta(days=30)
        self.vehicle.tecnomechanical = past_tecno
        self.vehicle.save()
        self.assertEqual(self.vehicle.tecnomechanical, past_tecno)
    
    def test_vehicle_capacity_validation(self):
        """Prueba que el campo de capacidad acepta diferentes valores enteros."""
        # Prueba con capacidad mínima.
        self.vehicle.capacity = 1
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 1)
        
        # Prueba con capacidad alta.
        self.vehicle.capacity = 50
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 50)
        
        # Prueba con capacidad cero.
        self.vehicle.capacity = 0
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 0)
    
    def test_vehicle_brand_model_validation(self):
        """Prueba que los campos de marca y modelo aceptan diferentes valores."""
        # Prueba con diferentes marcas.
        brands = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes"]
        for brand in brands:
            self.vehicle.brand = brand
            self.vehicle.save()
            self.assertEqual(self.vehicle.brand, brand)
        
        # Prueba con diferentes modelos.
        models = ["Corolla", "Civic", "Focus", "Cruze", "X3", "C-Class"]
        for model in models:
            self.vehicle.model = model
            self.vehicle.save()
            self.assertEqual(self.vehicle.model, model)
    
    def test_vehicle_type_validation(self):
        """Prueba que el campo de tipo de vehículo acepta diferentes valores."""
        # Prueba con diferentes tipos de vehículo.
        vehicle_types = ["Sedan", "SUV", "Truck", "Van", "Bus", "Motorcycle"]
        for vehicle_type in vehicle_types:
            self.vehicle.vehicle_type = vehicle_type
            self.vehicle.save()
            self.assertEqual(self.vehicle.vehicle_type, vehicle_type)
    
    def test_vehicle_constraints(self):
        """
        Prueba (de forma incompleta) que las restricciones del vehículo funcionan.
        Esta prueba solo verifica que los valores válidos para 'category' se pueden guardar,
        pero no comprueba que un valor inválido lance un error a nivel de base de datos.
        """
        # Prueba que los valores válidos para 'category' se pueden guardar.
        valid_categories = ['intermunicipal', 'metropolitano', 'campus']
        for category in valid_categories:
            self.vehicle.category = category
            self.vehicle.save()
            self.assertEqual(self.vehicle.category, category)
    
    def test_vehicle_with_different_drivers(self):
        """Prueba la creación de un vehículo para un conductor diferente."""
        # Crear otro conductor.
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
        
        # Crear un vehículo para el segundo conductor.
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
        """Prueba que el campo de placa acepta diferentes formatos."""
        # Prueba con diferentes formatos de placa.
        plate_formats = ["ABC123", "XYZ789", "123ABC", "ABC-123", "ABC 123"]
        for plate in plate_formats:
            # Crea un nuevo vehículo para cada formato para evitar violar la unicidad de la placa.
            Vehicle.objects.create(
                driver=self.driver, plate=plate, brand="Test", model="Format", vehicle_type="Test",
                category="campus", soat=datetime.now().date(), tecnomechanical=datetime.now().date(), capacity=1
            )
            # Verifica que el vehículo fue creado con la placa correcta.
            self.assertTrue(Vehicle.objects.filter(plate=plate).exists())
    
    def test_vehicle_meta_options(self):
        """Prueba las meta opciones del modelo, como el nombre de la tabla."""
        # Prueba el nombre de la tabla en la base de datos.
        self.assertEqual(Vehicle._meta.db_table, 'vehicle')
        
        # Prueba los nombres "amigables" de Django.
        self.assertEqual(Vehicle._meta.verbose_name, 'vehicle')
        self.assertEqual(Vehicle._meta.verbose_name_plural, 'vehicles')
    
    def test_vehicle_constraint_name(self):
        """Prueba que la restricción de categoría del modelo tiene el nombre correcto."""
        # Obtiene los nombres de todas las restricciones del modelo.
        constraint_names = [constraint.name for constraint in Vehicle._meta.constraints]
        self.assertIn('category_check', constraint_names)
    
    def test_vehicle_driver_cascade_delete(self):
        """
        Prueba el comportamiento de borrado en cascada (on_delete=models.CASCADE).
        Al eliminar un conductor, sus vehículos asociados también deben ser eliminados.
        """
        vehicle_id = self.vehicle.id
        driver_id = self.driver.pk
        
        # Elimina el objeto Driver.
        self.driver.delete()
        
        # Verifica que el vehículo asociado también fue eliminado.
        with self.assertRaises(Vehicle.DoesNotExist):
            Vehicle.objects.get(id=vehicle_id)
        
        # Verifica que el conductor también fue eliminado.
        with self.assertRaises(Driver.DoesNotExist):
            Driver.objects.get(pk=driver_id)
    
    def test_vehicle_dates_consistency(self):
        """Prueba que los campos de fecha del SOAT y tecnomecánica pueden ser diferentes."""
        self.vehicle.soat = datetime.now().date() + timedelta(days=365)
        self.vehicle.tecnomechanical = datetime.now().date() + timedelta(days=180)
        self.vehicle.save()
        
        self.assertNotEqual(self.vehicle.soat, self.vehicle.tecnomechanical)
    
    def test_vehicle_capacity_range(self):
        """Prueba que el campo de capacidad acepta un rango de valores."""
        # Prueba con capacidad cero.
        self.vehicle.capacity = 0
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 0)
        
        # Prueba con una capacidad máxima razonable.
        self.vehicle.capacity = 100
        self.vehicle.save()
        self.assertEqual(self.vehicle.capacity, 100)
    
    def test_vehicle_category_consistency(self):
        """Prueba que la categoría del vehículo es consistente con los valores permitidos."""
        # Verifica que la categoría del vehículo creado en setUp() es una de las válidas.
        valid_categories = ['intermunicipal', 'metropolitano', 'campus']
        self.assertIn(self.vehicle.category, valid_categories)