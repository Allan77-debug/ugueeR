# server/users/tests/test_models.py
from django.test import TestCase
from django.contrib.auth.hashers import make_password, check_password
from users.models import Users
from institutions.models import Institution

class UsersModelTest(TestCase):
    """
    Casos de prueba para el modelo Users.
    
    Esta clase de prueba verifica la correcta creación, estructura, relaciones,
    y comportamiento general del modelo `Users`.
    """
    
    def setUp(self):
        """
        Configura los datos de prueba iniciales que se usarán en cada test.
        Este método se ejecuta antes de cada método `test_*`.
        """
        # Crear una institución de prueba para la asociación.
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Universidad de Prueba",
            email="test@universidad.edu"
        )
        
        # Crear una instancia de usuario de prueba.
        self.user = Users.objects.create(
            full_name="Juan Pérez",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="juan.perez@universidad.edu",
            student_code="2023001",
            udocument="12345678",
            direction="Calle Falsa 123",
            uphone="+1234567890",
            upassword=make_password("testpass123"), # Guarda la contraseña hasheada.
            institution=self.institution,
            user_state=Users.STATE_PENDING, # El estado por defecto.
            driver_state=Users.DRIVER_STATE_NONE # El estado de conductor por defecto.
        )
    
    def test_user_creation(self):
        """Prueba que un usuario se puede crear exitosamente con los valores correctos."""
        self.assertEqual(self.user.full_name, "Juan Pérez")
        self.assertEqual(self.user.user_type, Users.TYPE_STUDENT)
        self.assertEqual(self.user.user_state, Users.STATE_PENDING) # Verifica el estado por defecto.
        self.assertEqual(self.user.driver_state, Users.DRIVER_STATE_NONE) # Verifica el estado de conductor por defecto.
    
    def test_user_string_representation(self):
        """Prueba que el método __str__ del modelo devuelve el nombre completo del usuario."""
        self.assertEqual(str(self.user), "Juan Pérez")
    
    def test_model_choices(self):
        """Prueba que las opciones para los campos de tipo 'choice' están bien definidas."""
        # Prueba las opciones de tipo de usuario.
        user_types = [choice[0] for choice in Users.USER_TYPE_CHOICES]
        self.assertIn(Users.TYPE_STUDENT, user_types)
        self.assertIn(Users.TYPE_DRIVER, user_types)
        self.assertIn(Users.TYPE_ADMIN, user_types)
        
        # Prueba las opciones de estado de usuario.
        user_states = [choice[0] for choice in Users.USER_STATE_CHOICES]
        self.assertIn(Users.STATE_PENDING, user_states)
        self.assertIn(Users.STATE_APPROVED, user_states)
        
        # Prueba las opciones de estado de conductor.
        driver_states = [choice[0] for choice in Users.DRIVER_STATE_CHOICES]
        self.assertIn(Users.DRIVER_STATE_NONE, driver_states)
        self.assertIn(Users.DRIVER_STATE_PENDING, driver_states)
    
    def test_user_institution_relationship(self):
        """Prueba la relación ForeignKey entre el usuario y la institución."""
        self.assertEqual(self.user.institution, self.institution)
        self.assertEqual(self.user.institution.official_name, "Universidad de Prueba")
    
    def test_password_hashing(self):
        """Prueba que las contraseñas se hashean correctamente durante la creación del usuario."""
        # `check_password` compara una contraseña en texto plano con su versión hasheada.
        self.assertTrue(check_password("testpass123", self.user.upassword))
        self.assertFalse(check_password("contraseñaincorrecta", self.user.upassword))
    
    def test_state_transitions(self):
        """Prueba que los campos de estado se pueden modificar y guardar correctamente."""
        # Prueba cambiar el estado del usuario de pendiente a aprobado.
        self.user.user_state = Users.STATE_APPROVED
        self.user.save()
        refreshed_user = Users.objects.get(uid=self.user.uid) # Vuelve a cargar el usuario desde la BD.
        self.assertEqual(refreshed_user.user_state, Users.STATE_APPROVED)
        
        # Prueba cambiar el estado de conductor de ninguno a pendiente.
        self.user.driver_state = Users.DRIVER_STATE_PENDING
        self.user.save()
        refreshed_user.refresh_from_db() # Otra forma de actualizar el objeto en memoria.
        self.assertEqual(refreshed_user.driver_state, Users.DRIVER_STATE_PENDING)
    
    def test_user_type_validation(self):
        """Prueba que el tipo de usuario asignado es uno de los valores válidos definidos."""
        valid_types = [choice[0] for choice in Users.USER_TYPE_CHOICES]
        self.assertIn(self.user.user_type, valid_types)
    
    def test_email_validation(self):
        """Prueba que el correo electrónico del usuario se guarda y recupera correctamente."""
        self.assertEqual(self.user.institutional_mail, "juan.perez@universidad.edu")
        # Una comprobación simple para asegurar que el formato básico de email se mantiene.
        self.assertTrue('@' in self.user.institutional_mail)