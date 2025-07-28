"""
Define los casos de prueba para las vistas de la aplicación 'assessment'.
"""
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import datetime, timedelta
from assessment.models import Assessment
from users.models import Users
from driver.models import Driver
from institutions.models import Institution
from travel.models import Travel
from route.models import Route
import jwt
from django.conf import settings


class AssessmentViewsTest(APITestCase):
    """Casos de prueba para las vistas de la API de Assessment."""
    
    def setUp(self):
        """
        Prepara los datos y el cliente de API para cada prueba.
        
        Crea una institución, un usuario conductor, un usuario pasajero y sus
        respectivos perfiles y tokens JWT para probar los endpoints.
        """
        self.client = APIClient()
        
        # Crear una institución de prueba.
        self.institution = Institution.objects.create(
            official_name="Universidad del Valle",
            email="info@univalle.edu.co",
            phone="+573001234567",
            address="Calle 13 # 100-00",
            city="Cali",
            ipassword=make_password("institutionpass123"),
            status='aprobada',
        )
        
        # Crear usuarios de prueba.
        self.driver_user = Users.objects.create(
            full_name="Test Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="driver@univalle.edu.co",
            upassword=make_password("driverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
        )
        
        self.passenger_user = Users.objects.create(
            full_name="Test Passenger",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="passenger@univalle.edu.co",
            upassword=make_password("passengerpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
        )
        
        # Crear perfil de conductor.
        self.driver = Driver.objects.create(
            user=self.driver_user,
            validate_state='approved'
        )
        
        # Nota: La creación de objetos complejos como Viajes se omite para enfocar
        # las pruebas en la lógica de las vistas y la autenticación.
        
        # Crear tokens JWT para la autenticación en las pruebas.
        self.driver_token = self._create_jwt_token(self.driver_user)
        self.passenger_token = self._create_jwt_token(self.passenger_user)
    
    def _create_jwt_token(self, user):
        """Función auxiliar para crear un token JWT para un usuario."""
        payload = {
            'user_id': user.uid,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return token
    
    def test_assessment_create_view_unauthorized(self):
        """Prueba la creación de una calificación sin autenticación."""
        response = self.client.post('/api/assessment/assessment/create/', {}, format='json')
        # Se espera un error 403 Forbidden porque el permiso IsAuthenticatedCustom falla.
        self.assertEqual(response.status_code, 403)
    
    def test_assessment_create_view_missing_fields(self):
        """Prueba la creación de una calificación con campos requeridos faltantes."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.passenger_token}')
        
        # Petición sin el campo 'travel'
        response = self.client.post('/api/assessment/assessment/create/', {'driver': 1, 'score': 5}, format='json')
        self.assertEqual(response.status_code, 400)
    
    def test_assessment_create_view_invalid_score(self):
        """Prueba la creación de una calificación con una puntuación inválida (fuera de rango)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.passenger_token}')
        
        # Puntuación de 6, que es inválida (rango es 1-5).
        assessment_data = {'travel': 1, 'driver': 1, 'score': 6}
        response = self.client.post('/api/assessment/assessment/create/', assessment_data, format='json')
        self.assertEqual(response.status_code, 400)
    
    def test_assessment_list_view_unauthorized(self):
        """Prueba el listado de calificaciones sin autenticación."""
        response = self.client.get('/api/assessment/assessments/')
        self.assertEqual(response.status_code, 403)
    
    def test_assessment_list_view_empty(self):
        """Prueba el listado de calificaciones cuando no existe ninguna."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.passenger_token}')
        
        response = self.client.get('/api/assessment/assessments/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0) # La lista debe estar vacía.
    
    def test_driver_assessments_list_view_unauthorized(self):
        """Prueba el listado de calificaciones de un conductor sin autenticación."""
        response = self.client.get(f'/api/assessment/assessments/driver/{self.driver.user.uid}/')
        self.assertEqual(response.status_code, 403)
    
    def test_driver_assessments_list_view_no_assessments(self):
        """Prueba el listado de calificaciones para un conductor que no tiene ninguna."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.driver_token}')
        
        response = self.client.get(f'/api/assessment/assessments/driver/{self.driver.user.uid}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)
    
    def test_assessment_detail_view_get_nonexistent(self):
        """Prueba la obtención de una calificación que no existe."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.passenger_token}')
        
        response = self.client.get('/api/assessment/assessment/999/')
        
        self.assertEqual(response.status_code, 404)
    
    def test_assessment_authentication_required(self):
        """Verifica que todos los endpoints de 'assessment' requieran autenticación."""
        endpoints = [
            ('/api/assessment/assessment/create/', 'POST'),
            ('/api/assessment/assessments/', 'GET'),
            ('/api/assessment/assessments/driver/1/', 'GET'),
            ('/api/assessment/assessment/1/', 'GET'),
            ('/api/assessment/assessment/1/', 'PATCH'),
            ('/api/assessment/assessment/1/', 'DELETE')
        ]
        
        # Itera sobre cada endpoint sin token y verifica que la respuesta sea 403.
        for endpoint, method in endpoints:
            if method == 'GET':
                response = self.client.get(endpoint)
            elif method == 'POST':
                response = self.client.post(endpoint, {})
            elif method == 'PATCH':
                response = self.client.patch(endpoint, {})
            elif method == 'DELETE':
                response = self.client.delete(endpoint)
            
            self.assertEqual(response.status_code, 403, f"El endpoint {endpoint} ({method}) debería requerir autenticación.")