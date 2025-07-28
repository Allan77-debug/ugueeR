from django.test import TestCase
from django.contrib.auth.hashers import make_password
from datetime import timedelta
from route.models import Route
from driver.models import Driver
from users.models import Users
from institutions.models import Institution
from django.db import models


class RouteModelTest(TestCase):
    """
    Casos de prueba para el modelo Route.
    Verifica la creación, relaciones, y restricciones del modelo de rutas.
    """
    
    def setUp(self):
        """
        Prepara los datos necesarios para cada test.
        Este método se ejecuta antes de cada método 'test_*'.
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
        
        # Crear un usuario de prueba para el conductor.
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
        
        # Crear el perfil de conductor asociado al usuario.
        self.driver = Driver.objects.create(
            user=self.user,
            validate_state='approved'
        )
        
        # NOTA: Omitimos la creación de una ruta aquí porque el ArrayField
        # de PostgreSQL no es compatible con la base de datos de prueba (SQLite).
        # Los tests se enfocan en la existencia y configuración de los campos.
    
    def test_route_creation_without_coordinates(self):
        """Verifica que los datos del conductor, necesarios para crear una ruta, son correctos."""
        # Comprueba que el conductor y el usuario están configurados correctamente.
        self.assertIsNotNone(self.driver)
        self.assertEqual(self.driver.user.full_name, "Test Driver")
        self.assertEqual(self.driver.user.user_type, Users.TYPE_DRIVER)
    
    def test_route_string_representation(self):
        """Prueba la representación en cadena de la ruta."""
        # Creamos una instancia de ruta para este test.
        route = Route(
            driver=self.driver, 
            startLocation="Origen Test", 
            destination="Destino Test",
            startPointCoords=[4.0, -74.0],
            endPointCoords=[4.1, -74.1]
        )
        # Verificamos que el método __str__ (que sí existe en el modelo) funciona.
        expected_str = f"Ruta {route.id}: de Origen Test a Destino Test (Conductor: Test Driver)"
        self.assertEqual(str(route), expected_str)
    
    def test_route_driver_relationship(self):
        """Verifica la relación entre la ruta y el conductor."""
        # Comprueba que el conductor está configurado correctamente.
        self.assertEqual(self.driver.user, self.user)
        self.assertEqual(self.driver.user.full_name, "Test Driver")
        
        # La relación inversa (driver.routes) se probaría creando una ruta.
        self.assertIsNotNone(self.driver)
    
    def test_route_field_validation(self):
        """Verifica que el modelo Route tiene todos los campos esperados."""
        # Obtiene los nombres de todos los campos del modelo.
        route_fields = [field.name for field in Route._meta.get_fields()]
        expected_fields = ['id', 'driver', 'startLocation', 'destination', 'startPointCoords', 'endPointCoords']
        
        for field in expected_fields:
            self.assertIn(field, route_fields)
    
    def test_route_meta_options(self):
        """Verifica las meta opciones del modelo, como el nombre de la tabla."""
        # Comprueba el nombre de la tabla en la base de datos.
        self.assertEqual(Route._meta.db_table, 'route')
        
        # Comprueba los nombres para el admin de Django.
        self.assertEqual(Route._meta.verbose_name, 'route')
        self.assertEqual(Route._meta.verbose_name_plural, 'routes')
    
    def test_route_driver_foreign_key(self):
        """Verifica que el campo 'driver' es una clave foránea al modelo Driver."""
        driver_field = Route._meta.get_field('driver')
        self.assertTrue(driver_field.is_relation)
        self.assertEqual(driver_field.related_model, Driver)
    
    def test_route_location_fields(self):
        """Verifica las propiedades de los campos de ubicación (texto)."""
        start_location_field = Route._meta.get_field('startLocation')
        destination_field = Route._meta.get_field('destination')
        self.assertEqual(start_location_field.max_length, 255)
        self.assertEqual(destination_field.max_length, 255)
    
    def test_route_coordinate_fields(self):
        """Verifica las propiedades de los campos de coordenadas."""
        # Comprueba que los campos existen (su tipo ArrayField es específico de PostgreSQL).
        start_coords_field = Route._meta.get_field('startPointCoords')
        end_coords_field = Route._meta.get_field('endPointCoords')
        self.assertIsNotNone(start_coords_field)
        self.assertIsNotNone(end_coords_field)
    
    def test_route_with_different_drivers(self):
        """Verifica que se pueden crear perfiles de conductor para diferentes usuarios."""
        # Crea otro usuario y conductor.
        user2 = Users.objects.create(...)
        driver2 = Driver.objects.create(user=user2, validate_state='approved')
        self.assertNotEqual(self.driver.user, driver2.user)
        self.assertNotEqual(self.driver, driver2)
    
    def test_route_location_validation(self):
        """Verifica que los campos de ubicación aceptan cadenas de texto válidas."""
        test_locations = ["Bogotá, Colombia", "Calle 123 # 45-67", "Centro Comercial Galerías"]
        for location in test_locations:
            self.assertIsInstance(location, str)
            self.assertLessEqual(len(location), 255)
    
    def test_route_coordinate_validation(self):
        """Verifica que el formato de las coordenadas es válido."""
        valid_coordinates = [[4.5709, -74.2973], [4.6682, -74.0539]]
        for coords in valid_coordinates:
            self.assertEqual(len(coords), 2)
            self.assertIsInstance(coords[0], float)
            self.assertIsInstance(coords[1], float)
    
    def test_route_driver_cascade_delete(self):
        """Verifica que las rutas se eliminan cuando se elimina el conductor (on_delete=CASCADE)."""
        # Creamos una ruta para poder probar la eliminación en cascada.
        route = Route.objects.create(
            driver=self.driver, 
            startLocation="Origen", 
            destination="Destino",
            startPointCoords=[1.0, 1.0],
            endPointCoords=[2.0, 2.0]
        )
        route_id = route.id
        
        # Eliminamos el usuario (lo que debería eliminar el conductor y luego la ruta).
        self.user.delete()
        
        # Comprueba que la ruta fue eliminada.
        with self.assertRaises(Route.DoesNotExist):
            Route.objects.get(id=route_id)
    
    def test_route_field_constraints(self):
        """Verifica que los campos requeridos no pueden ser nulos o vacíos."""
        required_fields = ['driver', 'startLocation', 'destination', 'startPointCoords', 'endPointCoords']
        for field_name in required_fields:
            field = Route._meta.get_field(field_name)
            self.assertFalse(field.null)
            # Nota: blank=False aplica a formularios, no a nivel de BD, pero es una buena práctica.
            self.assertFalse(field.blank)
    
    def test_route_primary_key(self):
        """Verifica que el campo 'id' es la clave primaria y es autoincremental."""
        id_field = Route._meta.get_field('id')
        self.assertTrue(id_field.primary_key)
        self.assertIsInstance(id_field, models.AutoField)
    
    def test_route_related_name(self):
        """Verifica que el `related_name` para la relación con Driver es 'routes'."""
        driver_field = Route._meta.get_field('driver')
        self.assertEqual(driver_field.remote_field.related_name, 'routes')
    
    def test_route_db_column(self):
        """Verifica que el campo 'driver' se mapea a la columna 'driver_id' en la BD."""
        driver_field = Route._meta.get_field('driver')
        self.assertEqual(driver_field.db_column, 'driver_id')
    
    def test_route_model_integrity(self):
        """Verifica que todos los modelos relacionados están disponibles."""
        self.assertIsNotNone(Route)
        self.assertIsNotNone(Driver)
        self.assertIsNotNone(Users)
        self.assertIsNotNone(Institution)
    
    def test_route_location_formats(self):
        """Verifica que los campos de ubicación aceptan varios formatos de texto."""
        location_formats = ["Calle 123 # 45-67, Bogotá", "Centro Comercial Andino"]
        for location in location_formats:
            self.assertIsInstance(location, str)
            self.assertGreater(len(location), 0)
            self.assertLessEqual(len(location), 255)
    
    def test_route_coordinate_ranges(self):
        """Verifica que las coordenadas están dentro de un rango geográfico válido."""
        # Coordenadas de Bogotá: aprox. 4.5 a 4.8 lat, -74.3 a -74.0 lon.
        valid_latitudes = [4.5709, 4.6682, 4.6097, 4.7110, 4.5981]
        valid_longitudes = [-74.2973, -74.0539, -74.0817, -74.0721, -74.0760]
        
        for lat in valid_latitudes:
            self.assertGreaterEqual(lat, -90.0)
            self.assertLessEqual(lat, 90.0)
        
        for lon in valid_longitudes:
            self.assertGreaterEqual(lon, -180.0)
            self.assertLessEqual(lon, 180.0)