from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import datetime, timedelta
from institutions.models import Institution
from users.models import Users
from driver.models import Driver
import jwt
from django.conf import settings


class InstitutionsViewsTest(APITestCase):
    """
    Casos de prueba para las vistas (endpoints) de la app 'institutions'.
    """
    
    def setUp(self):
        """
        Prepara los datos necesarios antes de ejecutar cada test.
        Este método crea un entorno de prueba con instituciones, usuarios y conductores
        en diferentes estados para cubrir todos los casos de uso.
        """
        self.client = APIClient()
        
        # Crear institución de prueba (aprobada).
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Test University",
            email="test@university.edu",
            phone="+1234567890",
            address="123 Test Street",
            city="Test City",
            istate="Test State",
            postal_code="12345",
            ipassword=make_password("testpass123"),
            status='aprobada',
            validate_state=True
        )
        
        # Crear institución de prueba (pendiente).
        self.pending_institution = Institution.objects.create(
            id_institution=2,
            official_name="Pending University",
            email="pending@university.edu",
            phone="+0987654321",
            address="456 Pending Street",
            city="Pending City",
            istate="Pending State",
            postal_code="54321",
            ipassword=make_password("pendingpass123"),
            status='pendiente',
            validate_state=False
        )
        
        # Crear usuario de prueba (aprobado y miembro de la institución).
        self.user = Users.objects.create(
            full_name="Test User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="test@university.edu",
            student_code="2023001",
            udocument="12345678",
            direction="123 Test Street",
            uphone="+1234567890",
            upassword=make_password("testpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # Crear usuario de prueba (pendiente de aprobación).
        self.pending_user = Users.objects.create(
            full_name="Pending User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="pending@university.edu",
            student_code="2023002",
            udocument="87654321",
            direction="456 Pending Street",
            uphone="+0987654321",
            upassword=make_password("pendingpass123"),
            institution=None,  # Aún sin institución.
            user_state=Users.STATE_PENDING,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # Crear usuario con solicitud de conductor (pendiente).
        self.driver_user = Users.objects.create(
            full_name="Test Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="driver@university.edu",
            student_code="2023003",
            udocument="11111111",
            direction="789 Driver Street",
            uphone="+1111111111",
            upassword=make_password("driverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_PENDING
        )
        
        # Crear usuario y conductor para la prueba de rechazo.
        self.driver_user_for_rejection = Users.objects.create(
            full_name="Test Driver For Rejection",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="driverrejection@university.edu",
            student_code="2023004",
            udocument="22222222",
            direction="888 Driver Rejection Street",
            uphone="+2222222222",
            upassword=make_password("driverrejectionpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_PENDING
        )
        self.driver_for_rejection = Driver.objects.create(
            user=self.driver_user_for_rejection,
            validate_state='pending'
        )
        
        # Crear usuario y conductor ya aprobados.
        self.approved_driver_user = Users.objects.create(
            full_name="Approved Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="approveddriver@university.edu",
            student_code="2023004",
            udocument="22222222",
            direction="999 Approved Street",
            uphone="+2222222222",
            upassword=make_password("approvedpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        self.approved_driver = Driver.objects.create(
            user=self.approved_driver_user,
            validate_state='approved'
        )
        
        # Crear tokens JWT de prueba.
        self.user_token = jwt.encode(
            {'user_id': self.user.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        self.driver_token = jwt.encode(
            {'user_id': self.driver_user.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
    
    def test_institution_create_view_success(self):
        """Verifica el registro exitoso de una nueva institución."""
        institution_data = {
            'official_name': 'New University',
            'short_name': 'NU',
            'email': 'new@university.edu',
            'phone': '+5555555555',
            'address': '789 New Street',
            'city': 'New City',
            'istate': 'New State',
            'postal_code': '67890',
            'ipassword': 'newpass123'
        }
        response = self.client.post('/api/institutions/register/', institution_data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Institución registrada exitosamente. Pendiente de aprobación.')
    
    def test_institution_create_view_invalid_data(self):
        """Verifica que el registro falla con datos inválidos (ej: email con formato incorrecto)."""
        invalid_data = {
            'official_name': 'New University',
            'short_name': 'NU',
            'email': 'invalid-email',  # Email inválido
            'phone': '+5555555555',
            'address': '789 New Street',
            'city': 'New City',
            'istate': 'New State',
            'postal_code': '67890',
            'ipassword': 'newpass123'
        }
        response = self.client.post('/api/institutions/register/', invalid_data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
    
    def test_institution_create_view_missing_required_fields(self):
        """Verifica que el registro falla si faltan campos obligatorios."""
        incomplete_data = {
            'official_name': 'New University',
            'email': 'new@university.edu'
            # Faltan campos requeridos
        }
        response = self.client.post('/api/institutions/register/', incomplete_data, format='json')
        self.assertEqual(response.status_code, 400)
    
    def test_institution_create_view_duplicate_email(self):
        """Verifica que el registro falla si se usa un email ya existente."""
        institution_data = {
            'official_name': 'Duplicate University',
            'short_name': 'DU',
            'email': 'test@university.edu',  # Mismo email que una institución existente
            'phone': '+5555555555',
            'address': '789 Duplicate Street',
            'city': 'Duplicate City',
            'istate': 'Duplicate State',
            'postal_code': '67890',
            'ipassword': 'duplicatepass123'
        }
        response = self.client.post('/api/institutions/register/', institution_data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
    
    def test_institution_list_view_success(self):
        """Verifica que se pueden listar las instituciones exitosamente."""
        response = self.client.get('/api/institutions/list/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertGreater(len(response.data), 0)
    
    def test_institution_list_view_with_status_filter(self):
        """Verifica que el filtrado por estado en la lista funciona correctamente."""
        response = self.client.get('/api/institutions/list/?status=aprobada')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        # Todas las instituciones devueltas deben tener el estado 'aprobada'.
        for institution in response.data:
            self.assertEqual(institution['status'], 'aprobada')
    
    def test_institution_list_view_with_pending_filter(self):
        """Verifica que el filtrado por estado 'pendiente' funciona."""
        response = self.client.get('/api/institutions/list/?status=pendiente')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        # Todas las instituciones devueltas deben tener el estado 'pendiente'.
        for institution in response.data:
            self.assertEqual(institution['status'], 'pendiente')
    
    def test_institution_approve_user_success(self):
        """Verifica que una institución puede aprobar un usuario pendiente."""
        response = self.client.post(f'/api/institutions/approveUser/{self.institution.id_institution}/{self.pending_user.uid}/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido aprobado', response.data['message'])
        # Comprueba que el estado del usuario fue actualizado en la BD.
        self.pending_user.refresh_from_db()
        self.assertEqual(self.pending_user.user_state, Users.STATE_APPROVED)
        self.assertEqual(self.pending_user.institution, self.institution)
    
    def test_institution_approve_user_already_approved(self):
        """Verifica el intento de aprobar un usuario que ya está aprobado."""
        response = self.client.post(f'/api/institutions/approveUser/{self.institution.id_institution}/{self.user.uid}/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('message', response.data)
        self.assertIn('ya está aprobado', response.data['message'])
    
    def test_institution_approve_user_wrong_state(self):
        """Verifica que no se puede aprobar un usuario que no está en estado 'pendiente'."""
        # Crea un usuario en estado rechazado.
        rejected_user = Users.objects.create(
            full_name="Rejected User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="rejected@university.edu",
            student_code="2023005",
            udocument="33333333",
            direction="333 Rejected Street",
            uphone="+3333333333",
            upassword=make_password("rejectedpass123"),
            institution=None,
            user_state=Users.STATE_REJECTED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        response = self.client.post(f'/api/institutions/approveUser/{self.institution.id_institution}/{rejected_user.uid}/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('message', response.data)
        self.assertIn('Solo se pueden aprobar usuarios en estado', response.data['message'])
    
    def test_institution_approve_user_wrong_institution(self):
        """Verifica que una institución no puede aprobar un usuario asignado a otra."""
        # Crea un usuario pendiente para otra institución.
        other_institution = Institution.objects.create(
            id_institution=3,
            official_name="Other University",
            email="other@university.edu",
            phone="+4444444444",
            address="444 Other Street",
            city="Other City",
            istate="Other State",
            postal_code="44444",
            ipassword=make_password("otherpass123"),
            status='aprobada',
            validate_state=True
        )
        other_pending_user = Users.objects.create(
            full_name="Other Pending User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="otherpending@university.edu",
            student_code="2023006",
            udocument="44444444",
            direction="444 Other Pending Street",
            uphone="+4444444444",
            upassword=make_password("otherpendingpass123"),
            institution=other_institution,  # El usuario pertenece a otra institución.
            user_state=Users.STATE_PENDING,
            driver_state=Users.DRIVER_STATE_NONE
        )
        response = self.client.post(f'/api/institutions/approveUser/{self.institution.id_institution}/{other_pending_user.uid}/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('message', response.data)
        self.assertIn('no está permitida', response.data['message'])
    
    def test_institution_reject_user_success(self):
        """Verifica que una institución puede rechazar a un usuario pendiente."""
        response = self.client.post(f'/api/institutions/rejectUser/{self.institution.id_institution}/{self.pending_user.uid}/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido rechazado', response.data['message'])
        # Comprueba que el estado del usuario fue actualizado.
        self.pending_user.refresh_from_db()
        self.assertEqual(self.pending_user.user_state, Users.STATE_REJECTED)
    
    def test_institution_reject_user_already_approved(self):
        """Verifica que no se puede rechazar un usuario que ya está aprobado."""
        response = self.client.post(f'/api/institutions/rejectUser/{self.institution.id_institution}/{self.user.uid}/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('message', response.data)
        self.assertIn('ya está aprobado', response.data['message'])
    
    def test_institution_users_view_success(self):
        """Verifica el listado exitoso de los usuarios de una institución."""
        response = self.client.get(f'/api/institutions/listUser/{self.institution.id_institution}/users/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        # Debería incluir a los usuarios aprobados.
        user_emails = [user['institutional_mail'] for user in response.data]
        self.assertIn(self.user.institutional_mail, user_emails)
    
    def test_institution_users_view_empty(self):
        """Verifica el listado de usuarios para una institución que no tiene ninguno."""
        empty_institution = Institution.objects.create(
            id_institution=4,
            official_name="Empty University",
            email="empty@university.edu",
            phone="+5555555555",
            address="555 Empty Street",
            city="Empty City",
            istate="Empty State",
            postal_code="55555",
            ipassword=make_password("emptypass123"),
            status='aprobada',
            validate_state=True
        )
        response = self.client.get(f'/api/institutions/listUser/{empty_institution.id_institution}/users/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)
    
    def test_institution_login_view_success(self):
        """Verifica el inicio de sesión exitoso de una institución."""
        login_data = {'email': 'test@university.edu', 'ipassword': 'testpass123'}
        response = self.client.post('/api/institutions/login/', login_data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Login Exitoso')
    
    def test_institution_login_view_invalid_credentials(self):
        """Verifica que el login falla con credenciales incorrectas."""
        login_data = {'email': 'test@university.edu', 'ipassword': 'wrongpassword'}
        response = self.client.post('/api/institutions/login/', login_data, format='json')
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Contraseña incorrecta')
    
    def test_institution_login_view_nonexistent_institution(self):
        """Verifica que el login falla si la institución no existe."""
        login_data = {'email': 'nonexistent@university.edu', 'ipassword': 'testpass123'}
        response = self.client.post('/api/institutions/login/', login_data, format='json')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)
    
    def test_institution_login_view_missing_fields(self):
        """Verifica que el login falla si faltan campos en la petición."""
        login_data = {'email': 'test@university.edu'}
        response = self.client.post('/api/institutions/login/', login_data, format='json')
        self.assertEqual(response.status_code, 400)
    
    def test_driver_applications_list_view_success(self):
        """Verifica el listado exitoso de solicitudes de conductor."""
        response = self.client.get(f'/api/institutions/{self.institution.id_institution}/driver-applications/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'No hay solicitudes de conductor pendientes.')
    
    def test_driver_applications_list_view_empty(self):
        """Verifica el listado de solicitudes para una institución sin ninguna."""
        empty_institution = Institution.objects.create(
            id_institution=5,
            official_name="No Drivers University",
            email="nodrivers@university.edu",
            phone="+6666666666",
            address="666 No Drivers Street",
            city="No Drivers City",
            istate="No Drivers State",
            postal_code="66666",
            ipassword=make_password("nodriverspass123"),
            status='aprobada',
            validate_state=True
        )
        response = self.client.get(f'/api/institutions/{empty_institution.id_institution}/driver-applications/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'No hay solicitudes de conductor pendientes.')
    
    def test_approve_driver_view_success(self):
        """Verifica la aprobación exitosa de una solicitud de conductor."""
        response = self.client.post(f'/api/institutions/{self.institution.id_institution}/approve-driver/{self.driver_user.uid}/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido aprobada', response.data['message'])
        self.driver_user.refresh_from_db()
        self.assertEqual(self.driver_user.driver_state, Users.DRIVER_STATE_APPROVED)
        # Verifica que se creó el registro en la tabla Driver.
        driver = Driver.objects.get(user=self.driver_user)
        self.assertEqual(driver.validate_state, 'approved')
    
    def test_approve_driver_view_already_approved(self):
        """Verifica el intento de aprobar un conductor que ya está aprobado."""
        response = self.client.post(f'/api/institutions/{self.institution.id_institution}/approve-driver/{self.approved_driver_user.uid}/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Este usuario no tiene una solicitud de conductor pendiente.')
    
    def test_approve_driver_view_nonexistent_driver(self):
        """Verifica la aprobación de un conductor que no existe."""
        response = self.client.post(f'/api/institutions/{self.institution.id_institution}/approve-driver/99999/')
        self.assertEqual(response.status_code, 404)
    
    def test_reject_driver_view_success(self):
        """Verifica el rechazo exitoso de una solicitud de conductor."""
        response = self.client.post(f'/api/institutions/{self.institution.id_institution}/reject-driver/{self.driver_user_for_rejection.uid}/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido rechazada', response.data['message'])
        self.driver_user_for_rejection.refresh_from_db()
        self.assertEqual(self.driver_user_for_rejection.driver_state, Users.DRIVER_STATE_REJECTED)
    
    def test_reject_driver_view_already_approved(self):
        """Verifica el intento de rechazar un conductor que ya está aprobado."""
        response = self.client.post(f'/api/institutions/{self.institution.id_institution}/reject-driver/{self.approved_driver_user.uid}/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Este usuario no tiene una solicitud de conductor pendiente.')
    
    def test_reject_driver_view_nonexistent_driver(self):
        """Verifica el rechazo de un conductor que no existe."""
        response = self.client.post(f'/api/institutions/{self.institution.id_institution}/reject-driver/99999/')
        self.assertEqual(response.status_code, 404)
    
    def test_institution_create_view_different_statuses(self):
        """Verifica el registro válido de una institución."""
        institution_data = {
            'official_name': 'Status Test University',
            'short_name': 'STU',
            'email': 'statustest@university.edu',
            'phone': '+7777777777',
            'address': '100 Status Street',
            'city': 'Status City',
            'istate': 'Status State',
            'postal_code': '77777',
            'ipassword': 'statustestpass123'
        }
        response = self.client.post('/api/institutions/register/', institution_data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('message', response.data)
    
    def test_institution_login_view_empty_data(self):
        """Verifica que el login falla con datos vacíos."""
        response = self.client.post('/api/institutions/login/', {}, format='json')
        self.assertEqual(response.status_code, 400)
    
    def test_institution_approve_user_nonexistent_institution(self):
        """Verifica que la aprobación de usuario falla si la institución no existe."""
        response = self.client.post(f'/api/institutions/approveUser/99999/{self.pending_user.uid}/')
        self.assertEqual(response.status_code, 404)
    
    def test_institution_approve_user_nonexistent_user(self):
        """Verifica la aprobación de un usuario que no existe."""
        response = self.client.post(f'/api/institutions/approveUser/{self.institution.id_institution}/99999/')
        self.assertEqual(response.status_code, 404)
    
    def test_institution_reject_user_nonexistent_institution(self):
        """Verifica que el rechazo de usuario falla si la institución no existe."""
        response = self.client.post(f'/api/institutions/rejectUser/99999/{self.pending_user.uid}/')
        self.assertEqual(response.status_code, 404)
    
    def test_institution_reject_user_nonexistent_user(self):
        """Verifica el rechazo de un usuario que no existe."""
        response = self.client.post(f'/api/institutions/rejectUser/{self.institution.id_institution}/99999/')
        self.assertEqual(response.status_code, 404)
    
    def test_institution_users_view_nonexistent_institution(self):
        """Verifica que el listado de usuarios falla si la institución no existe."""
        response = self.client.get('/api/institutions/listUser/99999/users/')
        self.assertEqual(response.status_code, 404)
    
    def test_driver_applications_list_view_nonexistent_institution(self):
        """Verifica que el listado de solicitudes falla si la institución no existe."""
        response = self.client.get('/api/institutions/99999/driver-applications/')
        self.assertEqual(response.status_code, 404)
    
    def test_approve_driver_view_nonexistent_institution(self):
        """Verifica que la aprobación de conductor falla si la institución no existe."""
        response = self.client.post(f'/api/institutions/99999/approve-driver/{self.driver_user.uid}/')
        self.assertEqual(response.status_code, 404)
    
    def test_reject_driver_view_nonexistent_institution(self):
        """Verifica que el rechazo de conductor falla si la institución no existe."""
        response = self.client.post(f'/api/institutions/99999/reject-driver/{self.driver_user.uid}/')
        self.assertEqual(response.status_code, 404)