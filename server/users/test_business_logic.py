# server/users/tests/test_business_logic.py
from django.test import TestCase
from django.contrib.auth.hashers import make_password, check_password
from users.models import Users
from institutions.models import Institution

class UsersBusinessLogicTest(TestCase):
    """
    Casos de prueba para la lógica de negocio y los flujos de trabajo de los usuarios.

    Esta clase de prueba se enfoca en verificar que las reglas de negocio,
    como los flujos de aprobación y las transiciones de estado, funcionen
    como se espera. No prueba endpoints (vistas), sino las interacciones

    directas con el modelo que simulan procesos del sistema.
    """
    
    def setUp(self):
        """Configura los datos de prueba iniciales para cada test."""
        # Crear una institución de prueba.
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Universidad de Prueba",
            email="universidad.edu" # El dominio es lo importante para la validación.
        )
        
        # Crear diferentes tipos de usuarios para probar distintos escenarios.
        self.student = Users.objects.create(
            full_name="Usuario Estudiante",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="estudiante@universidad.edu",
            student_code="2023008",
            udocument="88888888",
            direction="Calle Estudiante 888",
            uphone="+8888888888",
            upassword=make_password("studentpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED, # Este usuario ya está aprobado.
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        self.driver = Users.objects.create(
            full_name="Usuario Conductor",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="conductor@universidad.edu",
            student_code="2023009",
            udocument="99999999",
            direction="Calle Conductor 999",
            uphone="+9999999999",
            upassword=make_password("driverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED # Este usuario ya es un conductor aprobado.
        )
    
    def test_user_approval_workflow(self):
        """Prueba el flujo de trabajo completo de aprobación de un usuario."""
        # 1. Crear un usuario nuevo, que por defecto debería estar pendiente.
        pending_user = Users.objects.create(
            full_name="Usuario Pendiente",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="pendiente@universidad.edu",
            student_code="2023010",
            udocument="10101010",
            direction="Calle Pendiente 101",
            uphone="+1010101010",
            upassword=make_password("pendingpass123"),
            institution=self.institution,
            user_state=Users.STATE_PENDING,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # 2. Verificar el estado inicial.
        self.assertEqual(pending_user.user_state, Users.STATE_PENDING)
        self.assertEqual(pending_user.driver_state, Users.DRIVER_STATE_NONE)
        
        # 3. Simular la aprobación del usuario por un administrador.
        pending_user.user_state = Users.STATE_APPROVED
        pending_user.save()
        
        # 4. Verificar el estado de aprobado.
        pending_user.refresh_from_db() # Recargar el objeto desde la BD.
        self.assertEqual(pending_user.user_state, Users.STATE_APPROVED)
        
        # 5. Simular la solicitud del usuario para ser conductor.
        pending_user.driver_state = Users.DRIVER_STATE_PENDING
        pending_user.save()
        
        # 6. Verificar el estado de la solicitud de conductor.
        pending_user.refresh_from_db()
        self.assertEqual(pending_user.driver_state, Users.DRIVER_STATE_PENDING)
    
    def test_driver_application_requirements(self):
        """Prueba la regla de negocio: solo usuarios aprobados pueden solicitar ser conductores."""
        # 1. Verificar que el estudiante de prueba está aprobado y no es conductor.
        self.assertEqual(self.student.user_state, Users.STATE_APPROVED)
        self.assertEqual(self.student.driver_state, Users.DRIVER_STATE_NONE)
        
        # 2. Simular la solicitud para ser conductor.
        self.student.driver_state = Users.DRIVER_STATE_PENDING
        self.student.save()
        
        # 3. Verificar que el estado cambió a pendiente, confirmando que el flujo es posible para un usuario aprobado.
        self.student.refresh_from_db()
        self.assertEqual(self.student.driver_state, Users.DRIVER_STATE_PENDING)
    
    def test_user_type_validation(self):
        """Prueba que las opciones de tipo de usuario están correctamente definidas."""
        valid_types = [choice[0] for choice in Users.USER_TYPE_CHOICES]
        
        # Verifica que todos los tipos definidos en el modelo están en la lista de opciones.
        self.assertIn(Users.TYPE_STUDENT, valid_types)
        self.assertIn(Users.TYPE_DRIVER, valid_types)
        self.assertIn(Users.TYPE_EMPLOYEE, valid_types)
        self.assertIn(Users.TYPE_TEACHER, valid_types)
        self.assertIn(Users.TYPE_ADMIN, valid_types)
    
    def test_institution_relationship(self):
        """Prueba la relación bidireccional entre usuarios e instituciones."""
        # 1. Probar la relación desde el usuario hacia la institución.
        self.assertEqual(self.student.institution, self.institution)
        self.assertEqual(self.driver.institution, self.institution)
        
        # 2. Probar la relación inversa: desde la institución hacia los usuarios, usando `related_name='members'`.
        institution_users = self.institution.members.all()
        self.assertIn(self.student, institution_users)
        self.assertIn(self.driver, institution_users)
    
    def test_password_security(self):
        """Prueba las características de seguridad de las contraseñas."""
        # 1. Prueba que las contraseñas están hasheadas y se pueden verificar.
        self.assertTrue(check_password("studentpass123", self.student.upassword))
        self.assertFalse(check_password("wrongpassword", self.student.upassword))
        
        # 2. Prueba que las contraseñas en texto plano no se almacenan en la base de datos.
        self.assertNotEqual("studentpass123", self.student.upassword)
    
    def test_user_state_transitions(self):
        """Prueba todas las transiciones posibles del estado de un usuario."""
        # Crear un usuario para la prueba de transiciones.
        user = Users.objects.create(
            full_name="Usuario de Prueba de Estado",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="estado@universidad.edu",
            upassword=make_password("statepass123"),
            institution=self.institution
        )
        self.assertEqual(user.user_state, Users.STATE_PENDING) # Estado inicial
        
        # Transición: Pendiente -> Aprobado
        user.user_state = Users.STATE_APPROVED
        user.save()
        self.assertEqual(user.user_state, Users.STATE_APPROVED)
        
        # Transición: Aprobado -> Rechazado
        user.user_state = Users.STATE_REJECTED
        user.save()
        self.assertEqual(user.user_state, Users.STATE_REJECTED)
        
        # Transición: Rechazado -> Aprobado
        user.user_state = Users.STATE_APPROVED
        user.save()
        self.assertEqual(user.user_state, Users.STATE_APPROVED)
    
    def test_driver_state_transitions(self):
        """Prueba todas las transiciones posibles del estado de conductor de un usuario."""
        # Crear un usuario aprobado para este flujo.
        user = Users.objects.create(
            full_name="Prueba de Estado de Conductor",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="estadoconductor@universidad.edu",
            upassword=make_password("driverstatepass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED
        )
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_NONE) # Estado inicial

        # Transición: Ninguno -> Pendiente
        user.driver_state = Users.DRIVER_STATE_PENDING
        user.save()
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_PENDING)
        
        # Transición: Pendiente -> Aprobado
        user.driver_state = Users.DRIVER_STATE_APPROVED
        user.save()
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_APPROVED)
        
        # Transición: Aprobado -> Rechazado
        user.driver_state = Users.DRIVER_STATE_REJECTED
        user.save()
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_REJECTED)
        
        # Transición: Rechazado -> Pendiente (ej: el usuario apela la decisión)
        user.driver_state = Users.DRIVER_STATE_PENDING
        user.save()
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_PENDING)
    
    def test_user_type_consistency(self):
        """Prueba que los tipos de usuario son consistentes en el sistema."""
        # Verifica que los tipos asignados en la creación son correctos.
        self.assertEqual(self.student.user_type, Users.TYPE_STUDENT)
        self.assertEqual(self.driver.user_type, Users.TYPE_DRIVER)
        
        # Verifica que los tipos se guardan y recuperan correctamente de la BD.
        student_from_db = Users.objects.get(uid=self.student.uid)
        driver_from_db = Users.objects.get(uid=self.driver.uid)
        
        self.assertEqual(student_from_db.user_type, Users.TYPE_STUDENT)
        self.assertEqual(driver_from_db.user_type, Users.TYPE_DRIVER)
    
    def test_institution_user_count(self):
        """Prueba que el conteo de usuarios por institución es preciso."""
        # El setUp ya creó 2 usuarios para `self.institution`.
        
        # Crear usuarios adicionales para la misma institución.
        Users.objects.create(
            full_name="Usuario Extra 1",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="extra1@universidad.edu",
            upassword=make_password("extrapass123"),
            institution=self.institution
        )
        Users.objects.create(
            full_name="Usuario Extra 2",
            user_type=Users.TYPE_EMPLOYEE,
            institutional_mail="extra2@universidad.edu",
            upassword=make_password("extrapass456"),
            institution=self.institution
        )
        
        # Verificar que la institución tiene el número correcto de usuarios asociados.
        # Originales: student, driver. Adicionales: extra1, extra2.
        self.assertEqual(self.institution.members.count(), 4)