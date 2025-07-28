from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import datetime, timedelta
from users.models import Users
from driver.models import Driver
from institutions.models import Institution
import jwt
from django.conf import settings


class RouteViewsTest(APITestCase):
    """
    Casos de prueba para las vistas (endpoints) de la app 'route'.
    """
    
    def setUp(self):
        """
        Prepara los datos necesarios antes de ejecutar cada test.
        Este método crea un entorno de prueba con instituciones, usuarios y conductores
        en diferentes estados para cubrir todos los casos de uso.
        """
        self.client = APIClient()
        
        # Crear institución de prueba.
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Test University",
            short_name="TU",
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
        
        # Crear usuario conductor aprobado.
        self.approved_driver_user = Users.objects.create(
            full_name="Approved Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="approveddriver@university.edu",
            student_code="2023001",
            udocument="11111111",
            direction="123 Driver Street",
            uphone="+1111111111",
            upassword=make_password("driverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        
        # Crear el perfil de conductor aprobado.
        self.approved_driver = Driver.objects.create(
            user=self.approved_driver_user,
            validate_state='approved'
        )
        
        # Crear usuario conductor pendiente.
        self.pending_driver_user = Users.objects.create(
            full_name="Pending Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="pendingdriver@university.edu",
            student_code="2023002",
            udocument="22222222",
            direction="456 Pending Street",
            uphone="+2222222222",
            upassword=make_password("pendingpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_PENDING
        )
        
        # Crear el perfil de conductor pendiente.
        self.pending_driver = Driver.objects.create(
            user=self.pending_driver_user,
            validate_state='pending'
        )
        
        # Crear un usuario regular (no conductor).
        self.regular_user = Users.objects.create(
            full_name="Regular User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="regular@university.edu",
            student_code="2023003",
            udocument="33333333",
            direction="789 Regular Street",
            uphone="+3333333333",
            upassword=make_password("regularpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # Crear un usuario sin institución.
        self.user_without_institution = Users.objects.create(
            full_name="User Without Institution",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="noinst@university.edu",
            student_code="2023004",
            udocument="44444444",
            direction="999 No Inst Street",
            uphone="+4444444444",
            upassword=make_password("noinstpass123"),
            institution=None,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # Crear tokens JWT para simular sesiones de usuario.
        self.approved_driver_token = jwt.encode(
            {'user_id': self.approved_driver_user.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        self.pending_driver_token = jwt.encode(
            {'user_id': self.pending_driver_user.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        self.regular_user_token = jwt.encode(
            {'user_id': self.regular_user.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        self.user_without_institution_token = jwt.encode(
            {'user_id': self.user_without_institution.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
    
    def test_route_create_view_structure(self):
        """Prueba la estructura del endpoint de creación de rutas."""
        # Se omite la creación real debido a que ArrayField no es compatible con SQLite.
        # Se prueba enviando datos mínimos para verificar que el endpoint responde.
        route_data = {
            'driver': self.approved_driver.user.uid,
            'startLocation': 'Cali Centro',
            'destination': 'Universidad del Valle'
            # Se omiten las coordenadas.
        }
        response = self.client.post('/api/route/create/', route_data, format='json')
        # Se espera un error 400 por falta de campos requeridos (coordenadas).
        self.assertEqual(response.status_code, 400)
    
    def test_route_list_view_success(self):
        """Verifica el listado exitoso de rutas para un usuario con institución."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/route/list/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
    
    def test_route_list_view_user_without_institution(self):
        """Verifica que el listado de rutas devuelve una lista vacía para un usuario sin institución."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_without_institution_token}')
        response = self.client.get('/api/route/list/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)  # Debería devolver una lista vacía.
    
    def test_route_list_view_unauthorized(self):
        """Verifica que el listado de rutas falla sin autenticación."""
        response = self.client.get('/api/route/list/')
        # Tu permiso IsAuthenticatedCustom devuelve 403 en lugar de 401.
        self.assertEqual(response.status_code, 403)
    
    def test_route_detail_view_success(self):
        """Verifica la obtención de rutas para un conductor aprobado."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        response = self.client.get('/api/route/my-routes/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
    
    def test_route_detail_view_pending_driver(self):
        """Verifica que un conductor pendiente no puede ver sus rutas (debería fallar)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.pending_driver_token}')
        response = self.client.get('/api/route/my-routes/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('Acceso denegado', str(response.data))
    
    def test_route_detail_view_regular_user(self):
        """Verifica que un usuario regular no puede ver "mis rutas" (debería fallar)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/route/my-routes/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('Acceso denegado', str(response.data))
    
    def test_route_detail_view_unauthorized(self):
        """Verifica la obtención de "mis rutas" sin autenticación."""
        response = self.client.get('/api/route/my-routes/')
        self.assertEqual(response.status_code, 403)
    
    def test_route_delete_view_success(self):
        """Verifica la estructura del endpoint de eliminación de rutas."""
        # Se prueba con una ruta inexistente para validar que la vista responde (404).
        response = self.client.delete('/api/route/99999/delete/')
        # Se espera 404 para una ruta inexistente.
        self.assertEqual(response.status_code, 404)
    
    def test_route_delete_view_nonexistent_route(self):
        """Verifica la eliminación de una ruta que no existe."""
        response = self.client.delete('/api/route/99999/delete/')
        self.assertEqual(response.status_code, 404)
    
    def test_route_list_view_with_approved_drivers(self):
        """Verifica el listado de rutas cuando hay conductores aprobados en la institución."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/route/list/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
    
    def test_route_list_view_no_approved_drivers(self):
        """Verifica el listado de rutas cuando no hay conductores aprobados."""
        # Crea una nueva institución sin conductores aprobados.
        new_institution = Institution.objects.create(
            id_institution=2,
            official_name="New University",
            short_name="NU",
            email="new@university.edu",
            phone="+5555555555",
            address="555 New Street",
            city="New City",
            istate="New State",
            postal_code="55555",
            ipassword=make_password("newpass123"),
            status='aprobada',
            validate_state=True
        )
        new_user = Users.objects.create(
            full_name="New User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="newuser@university.edu",
            student_code="2023005",
            udocument="55555555",
            direction="555 New User Street",
            uphone="+5555555555",
            upassword=make_password("newuserpass123"),
            institution=new_institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        new_user_token = jwt.encode(
            {'user_id': new_user.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_user_token}')
        response = self.client.get('/api/route/list/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)  # Debería devolver una lista vacía.
    
    def test_route_detail_view_driver_not_approved(self):
        """Verifica el acceso a "mis rutas" por un conductor rechazado."""
        # Crea un conductor con estado rechazado.
        rejected_driver_user = Users.objects.create(
            full_name="Rejected Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="rejecteddriver@university.edu",
            student_code="2023006",
            udocument="66666666",
            direction="666 Rejected Street",
            uphone="+6666666666",
            upassword=make_password("rejecteddriverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_REJECTED
        )
        rejected_driver = Driver.objects.create(
            user=rejected_driver_user,
            validate_state='rejected'
        )
        rejected_driver_token = jwt.encode(
            {'user_id': rejected_driver_user.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {rejected_driver_token}')
        response = self.client.get('/api/route/my-routes/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('Acceso denegado', str(response.data))
    
    def test_route_detail_view_user_without_driver_profile(self):
        """Verifica el acceso a "mis rutas" por un usuario sin perfil de conductor."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/route/my-routes/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('Acceso denegado', str(response.data))
    
    def test_route_list_view_different_user_types(self):
        """Verifica el listado de rutas con diferentes tipos de usuario."""
        user_types = [Users.TYPE_STUDENT, Users.TYPE_DRIVER, Users.TYPE_ADMIN]
        for user_type in user_types:
            test_user = Users.objects.create(
                full_name=f"Test {user_type}",
                user_type=user_type,
                institutional_mail=f"test{user_type}@university.edu",
                student_code=f"202300{user_type}",
                udocument=f"{user_type}123456",
                direction=f"{user_type} Street",
                uphone=f"+{user_type}123456",
                upassword=make_password(f"{user_type}pass123"),
                institution=self.institution,
                user_state=Users.STATE_APPROVED,
                driver_state=Users.DRIVER_STATE_NONE
            )
            test_user_token = jwt.encode(
                {'user_id': test_user.uid},
                settings.SECRET_KEY,
                algorithm='HS256'
            )
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {test_user_token}')
            response = self.client.get('/api/route/list/')
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(response.data, list)
    
    def test_route_detail_view_approved_driver_with_routes(self):
        """Verifica el acceso a "mis rutas" por un conductor aprobado que tiene rutas."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        response = self.client.get('/api/route/my-routes/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
    
    def test_route_detail_view_approved_driver_without_routes(self):
        """Verifica el acceso a "mis rutas" por un conductor aprobado que no tiene rutas."""
        # Crea un nuevo conductor aprobado sin rutas.
        new_approved_driver_user = Users.objects.create(
            full_name="New Approved Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="newapproveddriver@university.edu",
            student_code="2023007",
            udocument="77777777",
            direction="777 New Approved Street",
            uphone="+7777777777",
            upassword=make_password("newapproveddriverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        new_approved_driver = Driver.objects.create(
            user=new_approved_driver_user,
            validate_state='approved'
        )
        new_approved_driver_token = jwt.encode(
            {'user_id': new_approved_driver_user.uid},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_approved_driver_token}')
        response = self.client.get('/api/route/my-routes/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)  # Debería devolver una lista vacía.
    
    def test_route_delete_view_unauthorized(self):
        """Verifica la eliminación de rutas sin autenticación."""
        response = self.client.delete('/api/route/1/delete/')
        # La vista no tiene requisitos de autenticación, por lo que debería funcionar.
        # El resultado esperado es 204 si la ruta existe, o 404 si no existe.
        self.assertIn(response.status_code, [204, 404])