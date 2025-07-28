# server/travel/tests/test_models.py
from django.test import TestCase
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from travel.models import Travel
from driver.models import Driver
from vehicle.models import Vehicle
from users.models import Users
from institutions.models import Institution
from route.models import Route 
from django.contrib.auth.hashers import make_password

class TravelModelTest(TestCase):
    """
    Casos de prueba para el modelo Travel.

    Esta clase de prueba verifica la estructura, relaciones, restricciones
    y comportamiento general del modelo `Travel`.
    """
    
    def setUp(self):
        """
        Configura los datos iniciales necesarios para cada una de las pruebas.

        Este método se ejecuta antes de cada `test_*` y crea un conjunto consistente
        de objetos en la base de datos de prueba (institución, usuario, conductor, vehículo y ruta).
        Esto asegura que cada prueba parta de un estado conocido y limpio.
        """
        # Crear una institución de prueba.
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Universidad de Prueba",
            email="test@universidad.edu",
            phone="+1234567890",
            address="Calle Falsa 123",
            city="Ciudad Prueba",
            istate="Estado Prueba",
            postal_code="12345",
            ipassword=make_password("testpass123")
        )
        
        # Crear un usuario de prueba con rol de conductor.
        self.user = Users.objects.create(
            full_name="Conductor de Prueba",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="conductor@universidad.edu",
            student_code="2023001",
            udocument="12345678",
            direction="Avenida Siempre Viva 742",
            uphone="+1234567890",
            upassword=make_password("driverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        
        # Crear un perfil de conductor asociado al usuario.
        self.driver = Driver.objects.create(
            user=self.user,
            validate_state='approved'
        )
        
        # Crear un vehículo de prueba asociado al conductor.
        self.vehicle = Vehicle.objects.create(
            driver=self.driver,
            plate="ABC123",
            brand="Toyota",
            model="Corolla",
            vehicle_type="Sedan",
            category="metropolitano",
            soat=(datetime.now().date() + timedelta(days=365)),
            tecnomechanical=(datetime.now().date() + timedelta(days=365)),
            capacity=4
        )
        
        # Crear una instancia de Ruta, que es un requisito para crear un Viaje.
        self.route = Route.objects.create(
            driver=self.driver,
            startLocation="Punto A",
            destination="Punto B",
            startPointCoords=["4.60971", "-74.08175"], # Lat, Lng
            endPointCoords=["4.62889", "-74.06528"], # Lat, Lng
            state=True
        )
        
    def test_travel_creation(self):
        """Prueba que un objeto Travel puede ser creado exitosamente en la BD."""
        travel_time = timezone.now() + timedelta(hours=2)
        travel = Travel.objects.create(
            driver=self.driver,
            vehicle=self.vehicle,
            route=self.route,
            time=travel_time,
            travel_state='scheduled',
            price=20000
        )
        # Verifica que el objeto creado no es nulo y que se le asignó un ID.
        self.assertIsNotNone(travel)
        self.assertIsNotNone(travel.id)
        # Verifica que los datos se guardaron correctamente.
        self.assertEqual(travel.driver.user.full_name, "Conductor de Prueba")
        self.assertEqual(travel.vehicle.plate, "ABC123")
        self.assertEqual(travel.travel_state, "scheduled")
        # Verifica que solo hay un viaje en la base de datos después de la creación.
        self.assertEqual(Travel.objects.count(), 1)

    def test_travel_state_options(self):
        """Prueba que los estados de viaje permitidos están definidos correctamente en el modelo."""
        # Extrae los identificadores de los estados (ej: 'scheduled', 'in_progress').
        defined_states = [option[0] for option in Travel.TRAVEL_STATES]
        self.assertIn('scheduled', defined_states)
        self.assertIn('in_progress', defined_states)
        self.assertIn('completed', defined_states)
        self.assertIn('cancelled', defined_states)

    def test_positive_price_constraint(self):
        """
        Prueba que la restricción de la base de datos `chk_price_positive`
        impide guardar un viaje con un precio negativo.
        """
        # El bloque `with self.assertRaises(IntegrityError)` espera que el código
        # dentro de él lance una `IntegrityError` de la base de datos.
        with self.assertRaises(IntegrityError):
            Travel.objects.create(
                driver=self.driver,
                vehicle=self.vehicle,
                route=self.route,
                time=timezone.now(),
                travel_state='scheduled',
                price=-100 # Precio inválido
            )

    def test_invalid_state_constraint(self):
        """
        Prueba que la restricción de la base de datos `travel_travel_state_check`
        impide guardar un viaje con un estado que no está en la lista de opciones.
        """
        with self.assertRaises(IntegrityError):
            Travel.objects.create(
                driver=self.driver,
                vehicle=self.vehicle,
                route=self.route,
                time=timezone.now(),
                travel_state='estado_inventado', # Estado inválido
                price=5000
            )

    def test_date_handling(self):
        """Prueba que el campo de fecha y hora se maneja correctamente."""
        future_time = timezone.now() + timedelta(days=5)
        travel = Travel.objects.create(
            driver=self.driver,
            vehicle=self.vehicle,
            route=self.route,
            time=future_time,
            travel_state='scheduled',
            price=10000
        )
        # Compara que la fecha guardada sea la misma que se especificó.
        self.assertEqual(travel.time, future_time)

    def test_model_relationships(self):
        """Prueba que las relaciones (ForeignKey) con Driver, Vehicle y Route funcionan."""
        travel = Travel.objects.create(
            driver=self.driver,
            vehicle=self.vehicle,
            route=self.route,
            time=timezone.now(),
            travel_state='scheduled',
            price=10000
        )
        # Verifica que se puede acceder a los objetos relacionados desde la instancia de viaje.
        self.assertEqual(travel.driver, self.driver)
        self.assertEqual(travel.vehicle, self.vehicle)
        self.assertEqual(travel.route, self.route)
        
        # Prueba la relación inversa: desde un conductor se debe poder acceder a sus viajes.
        self.assertIn(travel, self.driver.travel_set.all())

    def test_model_meta_options(self):
        """Prueba las meta opciones del modelo, como el nombre de la tabla."""
        # Verifica que el nombre de la tabla en la BD sea el esperado.
        self.assertEqual(Travel._meta.db_table, 'travel')
        
        # Verifica los nombres que Django usa internamente.
        self.assertEqual(Travel._meta.verbose_name, 'travel')
        self.assertEqual(Travel._meta.verbose_name_plural, 'travels')

    def test_constraint_names(self):
        """Prueba que las restricciones del modelo tienen los nombres correctos."""
        # Obtiene la lista de restricciones definidas en el modelo.
        constraints = Travel._meta.constraints
        constraint_names = [constraint.name for constraint in constraints]
        
        # Verifica que los nombres esperados estén en la lista.
        self.assertIn('chk_price_positive', constraint_names)
        self.assertIn('travel_travel_state_check', constraint_names)

    def test_string_representation(self):
        """
        Prueba la representación en cadena (__str__) del modelo.
        Si no hay un método __str__ definido, Django usa una representación por defecto.
        """
        travel = Travel.objects.create(
            driver=self.driver,
            vehicle=self.vehicle,
            route=self.route,
            time=timezone.now(),
            travel_state='scheduled',
            price=10000
        )
        # Si se definiera un __str__, aquí se comprobaría su formato.
        # Por ejemplo: self.assertEqual(str(viaje), f"Viaje {viaje.id} - {viaje.travel_state}")
        # Como no está definido, solo verificamos que la creación del objeto funciona.
        self.assertTrue(isinstance(str(travel), str))
        self.assertIn('Travel object', str(travel)) # La representación por defecto de Django

    def test_driver_vehicle_consistency(self):
        """
        Prueba que el vehículo pertenece al conductor. 
        Esta lógica se valida en el serializador, pero la prueba del modelo puede
        verificar la consistencia de los datos de prueba.
        """
        # Verifica que los datos creados en setUp() son consistentes.
        self.assertEqual(self.vehicle.driver, self.driver)
        
        # Verifica que desde el conductor se puede acceder a sus vehículos.
        self.assertIn(self.vehicle, self.driver.vehicle_set.all())