from django.test import TestCase
from django.contrib.auth.hashers import make_password
from datetime import timedelta
from django.utils import timezone
from driver.models import Driver
from users.models import Users
from institutions.models import Institution


class DriverModelTest(TestCase):
    """
    Casos de prueba para el modelo Driver.
    Verifica la creación, relaciones, restricciones y comportamiento del modelo.
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
    
    def test_driver_creation(self):
        """Prueba que un perfil de conductor se puede crear correctamente."""
        self.assertEqual(self.driver.user, self.user)
        self.assertEqual(self.driver.validate_state, 'approved')
        self.assertIsNotNone(self.driver.created_at)
    
    def test_driver_string_representation(self):
        """Prueba la representación en cadena del conductor."""
        # El método __str__ del modelo Driver debe devolver el nombre completo del usuario.
        self.assertEqual(str(self.driver), "Test Driver")
    
    def test_driver_choices(self):
        """Prueba que las opciones de estado de validación están definidas correctamente."""
        validate_states = [choice[0] for choice in Driver.VALIDATE_STATE_CHOICES]
        self.assertIn('pending', validate_states)
        self.assertIn('approved', validate_states)
        self.assertIn('rejected', validate_states)
    
    def test_driver_user_relationship(self):
        """Prueba la relación uno a uno entre Driver y Users."""
        self.assertEqual(self.driver.user, self.user)
        self.assertEqual(self.driver.user.full_name, "Test Driver")
        self.assertEqual(self.driver.user.user_type, Users.TYPE_DRIVER)
        
        # Prueba la relación inversa (desde el usuario hacia el conductor).
        self.assertEqual(self.user.driver, self.driver)
    
    def test_driver_validate_state_transitions(self):
        """Prueba que el estado de validación del conductor puede cambiar."""
        # Prueba la transición de 'approved' a 'pending'.
        self.driver.validate_state = 'pending'
        self.driver.save()
        self.assertEqual(self.driver.validate_state, 'pending')
        
        # Prueba la transición de 'pending' a 'rejected'.
        self.driver.validate_state = 'rejected'
        self.driver.save()
        self.assertEqual(self.driver.validate_state, 'rejected')
        
        # Prueba la transición de 'rejected' a 'approved'.
        self.driver.validate_state = 'approved'
        self.driver.save()
        self.assertEqual(self.driver.validate_state, 'approved')
    
    def test_driver_created_at_auto_set(self):
        """Prueba que el campo 'created_at' se establece automáticamente al crear."""
        # Crea un nuevo conductor para probar la funcionalidad 'auto_now_add'.
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
        """Prueba que las restricciones del modelo funcionan."""
        # Prueba que se pueden guardar los estados de validación válidos.
        valid_states = ['pending', 'approved', 'rejected']
        for state in valid_states:
            self.driver.validate_state = state
            self.driver.save() # No debería lanzar una excepción.
            self.assertEqual(self.driver.validate_state, state)
    
    def test_driver_user_primary_key(self):
        """Prueba que el Driver usa el ID del Usuario como su clave primaria."""
        self.assertEqual(self.driver.pk, self.user.uid)
        self.assertEqual(self.driver.user.uid, self.user.uid)
    
    def test_driver_user_one_to_one_relationship(self):
        """Prueba la unicidad de la relación uno a uno."""
        # Comprueba que cada usuario solo puede tener un registro de conductor.
        self.assertEqual(self.user.driver, self.driver)
        
        # Comprueba que cada conductor pertenece exactamente a un usuario.
        self.assertEqual(self.driver.user, self.user)
    
    def test_driver_with_different_users(self):
        """Prueba la creación de perfiles de conductor para diferentes usuarios."""
        # Crea otro usuario.
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
        
        # Crea un conductor para el segundo usuario.
        driver2 = Driver.objects.create(
            user=user2,
            validate_state='pending'
        )
        
        self.assertNotEqual(self.driver.user, driver2.user)
        self.assertNotEqual(self.driver, driver2)
    
    def test_driver_validate_state_consistency(self):
        """Prueba que el estado de validación guardado es consistente con las opciones."""
        valid_states = [choice[0] for choice in Driver.VALIDATE_STATE_CHOICES]
        self.assertIn(self.driver.validate_state, valid_states)
    
    def test_driver_created_at_immutability(self):
        """Prueba que 'created_at' no cambia al actualizar el objeto."""
        original_created_at = self.driver.created_at
        
        # Intenta modificar y guardar el objeto.
        self.driver.validate_state = 'pending'
        self.driver.save()
        self.driver.refresh_from_db() # Recarga el objeto desde la BD.
        
        # El valor de 'created_at' debería permanecer igual.
        self.assertAlmostEqual(self.driver.created_at, original_created_at, delta=timedelta(seconds=1))
    
    def test_driver_user_type_validation(self):
        """Prueba que el usuario asociado a un conductor tiene el tipo y estado correctos."""
        # Comprueba que el tipo de usuario es 'driver'.
        self.assertEqual(self.driver.user.user_type, Users.TYPE_DRIVER)
        
        # Comprueba que el estado del usuario es 'aprobado'.
        self.assertEqual(self.driver.user.user_state, Users.STATE_APPROVED)
    
    def test_driver_meta_options(self):
        """Prueba las meta opciones del modelo, como el nombre de la tabla."""
        # Comprueba el nombre de la tabla en la base de datos.
        self.assertEqual(Driver._meta.db_table, 'driver')
        
        # Comprueba los nombres para el admin de Django.
        self.assertEqual(Driver._meta.verbose_name, 'driver')
        self.assertEqual(Driver._meta.verbose_name_plural, 'drivers')
    
    def test_driver_constraint_name(self):
        """Prueba que el nombre de la restricción de la BD es el esperado."""
        # Comprueba si la restricción definida en Meta existe.
        constraints = Driver._meta.constraints
        constraint_names = [constraint.name for constraint in constraints]
        self.assertIn('validate_state_check', constraint_names)
    
    def test_driver_user_cascade_delete(self):
        """Prueba que el Driver se elimina cuando se elimina su User asociado (on_delete=CASCADE)."""
        driver_id = self.driver.pk
        user_id = self.user.uid
        
        # Elimina el usuario.
        self.user.delete()
        
        # Comprueba que el conductor también fue eliminado.
        with self.assertRaises(Driver.DoesNotExist):
            Driver.objects.get(pk=driver_id)
        
        # Comprueba que el usuario también fue eliminado.
        with self.assertRaises(Users.DoesNotExist):
            Users.objects.get(uid=user_id)