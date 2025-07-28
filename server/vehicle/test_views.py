# server/vehicle/tests/test_views.py
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import datetime, timedelta
from vehicle.models import Vehicle
from users.models import Users
from driver.models import Driver
from institutions.models import Institution
import jwt
from django.conf import settings


class VehicleViewsTest(APITestCase):
    """Casos de prueba para las vistas (endpoints) de la aplicación Vehicle."""
    
    def setUp(self):
        """
        Configura los datos de prueba iniciales para cada test.
        Este método crea un entorno complejo con una institución, varios tipos de
        usuarios (conductor aprobado, conductor pendiente, usuario regular) y vehículos
        para probar a fondo los permisos y la lógica de las vistas.
        """
        self.client = APIClient()
        
        # Crear una institución de prueba.
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
        
        # Crear un usuario que es un conductor aprobado.
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
        
        # Crear el perfil de Conductor para el usuario aprobado.
        self.approved_driver = Driver.objects.create(
            user=self.approved_driver_user,
            validate_state='approved'
        )
        
        # Crear un usuario cuya solicitud de conductor está pendiente.
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
        
        # Crear el perfil de Conductor para el usuario pendiente.
        self.pending_driver = Driver.objects.create(
            user=self.pending_driver_user,
            validate_state='pending'
        )
        
        # Crear un usuario regular que no es conductor.
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
        
        # Crear un vehículo de prueba para el conductor aprobado.
        self.test_vehicle = Vehicle.objects.create(
            driver=self.approved_driver,
            plate="ABC123",
            brand="Toyota",
            model="Corolla",
            vehicle_type="Sedan",
            category="metropolitano",
            soat=timezone.now().date() + timedelta(days=365),
            tecnomechanical=timezone.now().date() + timedelta(days=180),
            capacity=4
        )
        
        # Crear un segundo vehículo de prueba para el mismo conductor aprobado.
        self.test_vehicle2 = Vehicle.objects.create(
            driver=self.approved_driver,
            plate="XYZ789",
            brand="Honda",
            model="Civic",
            vehicle_type="Sedan",
            category="intermunicipal",
            soat=timezone.now().date() + timedelta(days=200),
            tecnomechanical=timezone.now().date() + timedelta(days=100),
            capacity=5
        )
        
        # Crear tokens JWT para cada tipo de usuario para simular la autenticación.
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
    
    def test_vehicle_create_view_success(self):
        """Prueba la creación exitosa de un vehículo por un conductor aprobado."""
        # Autenticar como conductor aprobado.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        
        vehicle_data = {
            'plate': 'DEF456',
            'brand': 'Ford',
            'model': 'Focus',
            'vehicle_type': 'Hatchback',
            'category': 'campus',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(),
            'capacity': 5
        }
        
        # Realizar la petición POST para crear el vehículo.
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        
        # Se espera una respuesta 201 (Creado) y que los datos coincidan.
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['plate'], 'DEF456')
        self.assertEqual(response.data['brand'], 'Ford')
        self.assertEqual(response.data['model'], 'Focus')
        self.assertEqual(response.data['category'], 'campus')
    
    def test_vehicle_create_view_pending_driver(self):
        """Prueba que un conductor pendiente no puede crear un vehículo."""
        # Autenticar como conductor pendiente.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.pending_driver_token}')
        
        vehicle_data = {
            'plate': 'GHI789', 'brand': 'Nissan', 'model': 'Sentra', 'vehicle_type': 'Sedan', 'category': 'metropolitano',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': 4
        }
        
        # Realizar la petición.
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        
        # Se espera un 403 (Prohibido) porque la vista valida el estado del conductor.
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.data)
        self.assertIn('Solo los conductores aprobados', response.data['error'])
    
    def test_vehicle_create_view_regular_user(self):
        """Prueba que un usuario regular no puede crear un vehículo."""
        # Autenticar como usuario regular.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        
        vehicle_data = {
            'plate': 'JKL012', 'brand': 'Chevrolet', 'model': 'Spark', 'vehicle_type': 'Hatchback', 'category': 'campus',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': 4
        }
        
        # Realizar la petición.
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        
        # Se espera un 403 (Prohibido).
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.data)
        self.assertIn('Solo los conductores aprobados', response.data['error'])
    
    def test_vehicle_create_view_unauthorized(self):
        """Prueba la creación de un vehículo sin autenticación."""
        vehicle_data = {
            'plate': 'MNO345', 'brand': 'Volkswagen', 'model': 'Golf', 'vehicle_type': 'Hatchback', 'category': 'metropolitano',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': 5
        }
        
        # Realizar la petición sin cabecera de autenticación.
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        
        # Se espera un 403 (Prohibido) porque el permiso IsAuthenticatedCustom falla.
        self.assertEqual(response.status_code, 403)
    
    def test_vehicle_create_view_duplicate_plate(self):
        """Prueba la creación de un vehículo con una placa duplicada."""
        # Autenticar como conductor aprobado.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        
        vehicle_data = {
            'plate': 'ABC123',  # Placa ya existente.
            'brand': 'Hyundai', 'model': 'Elantra', 'vehicle_type': 'Sedan', 'category': 'intermunicipal',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': 4
        }
        
        # Realizar la petición.
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        
        # El serializador de DRF detecta la violación de unicidad y devuelve un 400.
        self.assertEqual(response.status_code, 400)
        self.assertIn('plate', response.data)
    
    def test_vehicle_create_view_invalid_data(self):
        """Prueba la creación de un vehículo con datos inválidos (categoría)."""
        # Autenticar como conductor aprobado.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        
        invalid_data = {
            'plate': 'PQR678', 'brand': 'Toyota', 'model': 'Corolla', 'vehicle_type': 'Sedan', 'category': 'invalid_category',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': 4
        }
        
        # Realizar la petición.
        response = self.client.post('/api/vehicle/register/', invalid_data, format='json')
        
        # La restricción se aplica a nivel de BD, lo que causa un IntegrityError y un 500 en la vista.
        self.assertEqual(response.status_code, 500)
        self.assertIn('error', response.data)
    
    def test_vehicle_create_view_missing_required_fields(self):
        """Prueba la creación de un vehículo con campos requeridos faltantes."""
        # Autenticar como conductor aprobado.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        
        incomplete_data = {'plate': 'STU901', 'brand': 'Toyota'}
        
        # Realizar la petición con datos incompletos.
        response = self.client.post('/api/vehicle/register/', incomplete_data, format='json')
        
        # El serializador de DRF detecta los campos faltantes y devuelve un 400.
        self.assertEqual(response.status_code, 400)
    
    def test_vehicle_list_by_driver_success(self):
        """Prueba la obtención exitosa de la lista de vehículos por un conductor aprobado."""
        # Autenticar como conductor aprobado.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        
        # Realizar la petición GET.
        response = self.client.get('/api/vehicle/my-vehicles/')
        
        # Se espera un 200 (OK) y una lista con los 2 vehículos creados.
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)
        
        # Verifica que las placas de los vehículos están en la respuesta.
        plates = [vehicle['plate'] for vehicle in response.data]
        self.assertIn('ABC123', plates)
        self.assertIn('XYZ789', plates)
    
    def test_vehicle_list_by_driver_empty(self):
        """Prueba la obtención de la lista para un conductor sin vehículos."""
        # Crear un nuevo conductor aprobado sin vehículos.
        new_driver_user = Users.objects.create(
            full_name="New Driver", user_type=Users.TYPE_DRIVER, institutional_mail="newdriver@university.edu",
            student_code="2023004", udocument="44444444", direction="999 New Driver Street", uphone="+4444444444",
            upassword=make_password("newdriverpass123"), institution=self.institution, user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        Driver.objects.create(user=new_driver_user, validate_state='approved')
        new_driver_token = jwt.encode({'user_id': new_driver_user.uid}, settings.SECRET_KEY, algorithm='HS256')
        
        # Autenticar como el nuevo conductor.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_driver_token}')
        
        # Realizar la petición.
        response = self.client.get('/api/vehicle/my-vehicles/')
        
        # Se espera un 200 (OK) con un mensaje indicando que no hay vehículos.
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'No tienes vehículos registrados.')
    
    def test_vehicle_list_by_driver_pending_driver(self):
        """Prueba que un conductor pendiente no puede listar vehículos."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.pending_driver_token}')
        response = self.client.get('/api/vehicle/my-vehicles/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.data)
    
    def test_vehicle_list_by_driver_regular_user(self):
        """Prueba que un usuario regular no puede listar vehículos."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/vehicle/my-vehicles/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.data)
    
    def test_vehicle_list_by_driver_unauthorized(self):
        """Prueba la obtención de la lista de vehículos sin autenticación."""
        response = self.client.get('/api/vehicle/my-vehicles/')
        self.assertEqual(response.status_code, 403)
    
    def test_vehicle_delete_view_success(self):
        """Prueba la eliminación exitosa de un vehículo por su dueño."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        # Elimina el primer vehículo de prueba.
        response = self.client.delete(f'/api/vehicle/{self.test_vehicle.id}/delete/')
        
        # Se espera un 204 (Sin Contenido), indicando éxito.
        self.assertEqual(response.status_code, 204)
        
        # Verifica que el vehículo fue realmente eliminado de la base de datos.
        self.assertFalse(Vehicle.objects.filter(id=self.test_vehicle.id).exists())
    
    def test_vehicle_delete_view_pending_driver(self):
        """Prueba que un conductor pendiente no puede eliminar un vehículo."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.pending_driver_token}')
        response = self.client.delete(f'/api/vehicle/{self.test_vehicle.id}/delete/')
        self.assertEqual(response.status_code, 403)
    
    def test_vehicle_delete_view_regular_user(self):
        """Prueba que un usuario regular no puede eliminar un vehículo."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.delete(f'/api/vehicle/{self.test_vehicle.id}/delete/')
        self.assertEqual(response.status_code, 403)
    
    def test_vehicle_delete_view_unauthorized(self):
        """Prueba la eliminación de un vehículo sin autenticación."""
        response = self.client.delete(f'/api/vehicle/{self.test_vehicle.id}/delete/')
        self.assertEqual(response.status_code, 403)
    
    def test_vehicle_delete_view_nonexistent_vehicle(self):
        """Prueba la eliminación de un vehículo que no existe."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        # Intenta eliminar un vehículo con un ID inexistente.
        response = self.client.delete('/api/vehicle/99999/delete/')
        self.assertEqual(response.status_code, 404)
    
    def test_vehicle_delete_view_wrong_owner(self):
        """Prueba que un conductor no puede eliminar el vehículo de otro conductor."""
        # Crear otro conductor aprobado.
        other_driver_user = Users.objects.create(
            full_name="Other Driver", user_type=Users.TYPE_DRIVER, institutional_mail="otherdriver@university.edu",
            student_code="2023005", udocument="55555555", direction="888 Other Driver Street", uphone="+5555555555",
            upassword=make_password("otherdriverpass123"), institution=self.institution, user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        Driver.objects.create(user=other_driver_user, validate_state='approved')
        other_driver_token = jwt.encode({'user_id': other_driver_user.uid}, settings.SECRET_KEY, algorithm='HS256')
        
        # Autenticar como el "otro" conductor.
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {other_driver_token}')
        
        # Intentar eliminar el vehículo del conductor original.
        response = self.client.delete(f'/api/vehicle/{self.test_vehicle.id}/delete/')
        
        # Se espera un 404 porque la vista busca un vehículo con ese ID Y que pertenezca al conductor autenticado.
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)
    
    def test_vehicle_detail_view_success(self):
        """Prueba la obtención exitosa de los detalles de un vehículo por su dueño."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        response = self.client.get(f'/api/vehicle/vehicles/{self.test_vehicle.id}/')
        
        # Se espera un 200 (OK) y que los datos del vehículo sean correctos.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], self.test_vehicle.id)
        self.assertEqual(response.data['plate'], 'ABC123')
        self.assertEqual(response.data['brand'], 'Toyota')
        self.assertEqual(response.data['model'], 'Corolla')
        self.assertEqual(response.data['category'], 'metropolitano')
    
    def test_vehicle_detail_view_pending_driver(self):
        """Prueba que un conductor pendiente no puede ver los detalles de un vehículo."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.pending_driver_token}')
        response = self.client.get(f'/api/vehicle/vehicles/{self.test_vehicle.id}/')
        self.assertEqual(response.status_code, 403)
    
    def test_vehicle_detail_view_regular_user(self):
        """Prueba que un usuario regular no puede ver los detalles de un vehículo."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get(f'/api/vehicle/vehicles/{self.test_vehicle.id}/')
        self.assertEqual(response.status_code, 403)
    
    def test_vehicle_detail_view_unauthorized(self):
        """Prueba la obtención de detalles de un vehículo sin autenticación."""
        response = self.client.get(f'/api/vehicle/vehicles/{self.test_vehicle.id}/')
        self.assertEqual(response.status_code, 403)
    
    def test_vehicle_detail_view_nonexistent_vehicle(self):
        """Prueba la obtención de detalles de un vehículo que no existe."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        response = self.client.get('/api/vehicle/vehicles/99999/')
        self.assertEqual(response.status_code, 404)
    
    def test_vehicle_detail_view_wrong_owner(self):
        """Prueba que un conductor no puede ver los detalles del vehículo de otro."""
        # Crear y autenticar como otro conductor.
        other_driver_user = Users.objects.create(
            full_name="Other Driver", user_type=Users.TYPE_DRIVER, institutional_mail="otherdriver@university.edu",
            student_code="2023005", udocument="55555555", direction="888 Other Driver Street", uphone="+5555555555",
            upassword=make_password("otherdriverpass123"), institution=self.institution, user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        Driver.objects.create(user=other_driver_user, validate_state='approved')
        other_driver_token = jwt.encode({'user_id': other_driver_user.uid}, settings.SECRET_KEY, algorithm='HS256')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {other_driver_token}')
        
        # Intentar ver el vehículo del conductor original.
        response = self.client.get(f'/api/vehicle/vehicles/{self.test_vehicle.id}/')
        
        # Se espera un 403 porque la vista valida que el vehículo pertenezca al solicitante.
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.data)
        self.assertIn('Este vehículo no te pertenece', response.data['error'])
    
    def test_vehicle_create_view_different_categories(self):
        """Prueba la creación de vehículos con diferentes categorías válidas."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        categories = ['intermunicipal', 'metropolitano', 'campus']
        
        for i, category in enumerate(categories):
            vehicle_data = {
                'plate': f'CAT{i}00', 'brand': f'Brand{i}', 'model': f'Model{i}', 'vehicle_type': 'Sedan',
                'category': category, 'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
                'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': 4 + i
            }
            response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.data['category'], category)
    
    def test_vehicle_create_view_invalid_category(self):
        """Prueba la creación de un vehículo con una categoría inválida."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        vehicle_data = {
            'plate': 'INV001', 'brand': 'Invalid', 'model': 'Brand', 'vehicle_type': 'Sedan', 'category': 'invalid_category',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': 4
        }
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        # Se espera un 500 porque la restricción de la BD se viola.
        self.assertEqual(response.status_code, 500)
    
    def test_vehicle_create_view_expired_documents(self):
        """Prueba la creación de un vehículo con documentos expirados."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        vehicle_data = {
            'plate': 'EXP001', 'brand': 'Expired', 'model': 'Brand', 'vehicle_type': 'Sedan', 'category': 'metropolitano',
            'soat': (timezone.now().date() - timedelta(days=30)).isoformat(),
            'tecnomechanical': (timezone.now().date() - timedelta(days=15)).isoformat(), 'capacity': 4
        }
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        # La vista actual no valida las fechas, por lo que la creación debería ser exitosa (201).
        self.assertEqual(response.status_code, 201)
    
    def test_vehicle_create_view_invalid_capacity(self):
        """Prueba la creación de un vehículo con capacidad inválida (negativa)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.approved_driver_token}')
        vehicle_data = {
            'plate': 'CAP001', 'brand': 'Capacity', 'model': 'Test', 'vehicle_type': 'Sedan', 'category': 'metropolitano',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': -1
        }
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        # El modelo actual no tiene restricción para capacidad negativa, por lo que la creación es exitosa (201).
        self.assertEqual(response.status_code, 201)
    
    def test_vehicle_create_view_missing_driver(self):
        """Prueba la creación de un vehículo por un usuario que no tiene un perfil de Conductor."""
        # Crear un usuario sin un registro `Driver` asociado.
        user_without_driver = Users.objects.create(
            full_name="User Without Driver", user_type=Users.TYPE_DRIVER, institutional_mail="nodriver@university.edu",
            student_code="2023006", udocument="66666666", direction="777 No Driver Street", uphone="+6666666666",
            upassword=make_password("nodriverpass123"), institution=self.institution, user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        user_without_driver_token = jwt.encode({'user_id': user_without_driver.uid}, settings.SECRET_KEY, algorithm='HS256')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {user_without_driver_token}')
        
        vehicle_data = {
            'plate': 'NOD001', 'brand': 'NoDriver', 'model': 'Brand', 'vehicle_type': 'Sedan', 'category': 'metropolitano',
            'soat': (timezone.now().date() + timedelta(days=365)).isoformat(),
            'tecnomechanical': (timezone.now().date() + timedelta(days=180)).isoformat(), 'capacity': 4
        }
        response = self.client.post('/api/vehicle/register/', vehicle_data, format='json')
        
        # La vista debería devolver un 404 porque no encuentra el perfil de conductor.
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)
        self.assertIn('No se encontró el conductor', response.data['error'])
    
    def test_vehicle_list_by_driver_no_driver_record(self):
        """Prueba listar vehículos para un usuario sin perfil de Conductor."""
        # Crear usuario sin registro Driver.
        user_without_driver = Users.objects.create(
            full_name="User Without Driver", user_type=Users.TYPE_DRIVER, institutional_mail="nodriver@university.edu",
            student_code="2023006", udocument="66666666", direction="777 No Driver Street", uphone="+6666666666",
            upassword=make_password("nodriverpass123"), institution=self.institution, user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        user_without_driver_token = jwt.encode({'user_id': user_without_driver.uid}, settings.SECRET_KEY, algorithm='HS256')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {user_without_driver_token}')
        
        response = self.client.get('/api/vehicle/my-vehicles/')
        # Se espera 404 porque la vista no encuentra el perfil de conductor.
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)
        self.assertIn('No existe un conductor', response.data['error'])
    
    def test_vehicle_delete_view_no_driver_record(self):
        """Prueba eliminar un vehículo por un usuario sin perfil de Conductor."""
        # Crear usuario sin registro Driver.
        user_without_driver = Users.objects.create(
            full_name="User Without Driver", user_type=Users.TYPE_DRIVER, institutional_mail="nodriver@university.edu",
            student_code="2023006", udocument="66666666", direction="777 No Driver Street", uphone="+6666666666",
            upassword=make_password("nodriverpass123"), institution=self.institution, user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
        user_without_driver_token = jwt.encode({'user_id': user_without_driver.uid}, settings.SECRET_KEY, algorithm='HS256')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {user_without_driver_token}')
        
        # Intentar eliminar un vehículo.
        response = self.client.delete(f'/api/vehicle/{self.test_vehicle.id}/delete/')
        # Se espera 404 porque la vista no encuentra el perfil de conductor.
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)
        self.assertIn('No existe un conductor', response.data['error'])