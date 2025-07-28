"""
Define los casos de prueba para las vistas de la aplicación 'admins'.
"""
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import datetime, timedelta
from institutions.models import Institution
import jwt
from django.conf import settings
from admins.models import AdminUser


class AdminViewsTest(APITestCase):
    """Casos de prueba para las vistas de Admin (aprobación/rechazo de instituciones)."""
    
    def setUp(self):
        """
        Prepara los datos y el cliente de API para cada prueba.
        
        Crea tres instituciones con diferentes estados (pendiente, aprobada, rechazada)
        para probar los distintos escenarios de las vistas.
        """
        self.client = APIClient()
        
        # Crea instituciones de prueba
        self.pending_institution = Institution.objects.create(
            official_name="Universidad Test Pending",
            short_name="UTP",
            email="pending@test.edu",
            phone="+573001234567",
            address="123 Test Street",
            city="Test City",
            istate="Test State",
            postal_code="12345",
            ipassword=make_password("institutionpass123"),
            status='pendiente',
            validate_state=False
        )
        
        self.approved_institution = Institution.objects.create(
            official_name="Universidad Test Approved",
            short_name="UTA",
            email="approved@test.edu",
            phone="+573001234568",
            address="456 Approved Street",
            city="Approved City",
            istate="Approved State",
            postal_code="54321",
            ipassword=make_password("institutionpass123"),
            status='aprobada',
            validate_state=True
        )
        
        self.rejected_institution = Institution.objects.create(
            official_name="Universidad Test Rejected",
            short_name="UTR",
            email="rejected@test.edu",
            phone="+573001234569",
            address="789 Rejected Street",
            city="Rejected City",
            istate="Rejected State",
            postal_code="98765",
            ipassword=make_password("institutionpass123"),
            status='rechazada',
            validate_state=False,
            rejection_reason="Test rejection reason"
        )
    
    def test_admin_login_view_skipped(self):
        """Prueba la estructura del endpoint de login (omitido por 'managed=False')."""
        # Se omite la prueba de login ya que la tabla AdminUser no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omiten las pruebas de login.")
    
    def test_institution_approve_view_success(self):
        """Prueba la aprobación exitosa de una institución."""
        approve_data = {'role': 'Universidad'}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido aprobada correctamente', response.data['message'])
        
        # Verifica que la institución fue actualizada en la base de datos.
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'aprobada')
        self.assertTrue(self.pending_institution.validate_state)
    
    def test_institution_approve_view_without_role(self):
        """Prueba la aprobación de una institución sin especificar un rol (debe usar el valor por defecto)."""
        approve_data = {}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verifica que la institución fue actualizada correctamente.
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'aprobada')
    
    def test_institution_approve_view_nonexistent_institution(self):
        """Prueba la aprobación de una institución que no existe."""
        approve_data = {'role': 'Universidad'}
        
        response = self.client.post('/api/admins/99999/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 404)
    
    def test_institution_approve_view_already_approved(self):
        """Prueba la aprobación de una institución que ya estaba aprobada."""
        approve_data = {'role': 'Universidad'}
        
        response = self.client.post(f'/api/admins/{self.approved_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verifica que la institución permanezca aprobada.
        self.approved_institution.refresh_from_db()
        self.assertEqual(self.approved_institution.status, 'aprobada')
    
    def test_institution_approve_view_rejected_institution(self):
        """Prueba la aprobación de una institución previamente rechazada."""
        approve_data = {'role': 'Universidad'}
        
        response = self.client.post(f'/api/admins/{self.rejected_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verifica que la institución fue actualizada a 'aprobada'.
        self.rejected_institution.refresh_from_db()
        self.assertEqual(self.rejected_institution.status, 'aprobada')
    
    def test_institution_reject_view_success(self):
        """Prueba el rechazo exitoso de una institución."""
        reject_data = {'reason': 'Motivo de prueba'}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        
        # Verifica que la institución fue actualizada.
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'rechazada')
        self.assertEqual(self.pending_institution.rejection_reason, 'Motivo de prueba')
    
    def test_institution_reject_view_missing_reason(self):
        """Prueba el rechazo de una institución sin proporcionar un motivo."""
        reject_data = {}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
    
    def test_institution_reject_view_empty_reason(self):
        """Prueba el rechazo de una institución con un motivo vacío."""
        reject_data = {'reason': ''}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
    
    def test_institution_reject_view_nonexistent_institution(self):
        """Prueba el rechazo de una institución que no existe."""
        reject_data = {'reason': 'Motivo de prueba'}
        
        response = self.client.post('/api/admins/99999/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 404)
    
    def test_institution_reject_view_already_rejected(self):
        """Prueba el rechazo de una institución que ya estaba rechazada."""
        reject_data = {'reason': 'Otro motivo de rechazo'}
        
        response = self.client.post(f'/api/admins/{self.rejected_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verifica que la institución permanezca rechazada, pero con el nuevo motivo.
        self.rejected_institution.refresh_from_db()
        self.assertEqual(self.rejected_institution.status, 'rechazada')
        self.assertEqual(self.rejected_institution.rejection_reason, 'Otro motivo de rechazo')
    
    def test_institution_reject_view_approved_institution(self):
        """Prueba el rechazo de una institución previamente aprobada."""
        reject_data = {'reason': 'Motivo de prueba'}
        
        response = self.client.post(f'/api/admins/{self.approved_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verifica que la institución fue actualizada a 'rechazada'.
        self.approved_institution.refresh_from_db()
        self.assertEqual(self.approved_institution.status, 'rechazada')
    
    def test_admin_endpoints_structure(self):
        """Prueba que los endpoints de admin existan y respondan adecuadamente."""
        endpoints = [
            f'/api/admins/{self.pending_institution.id_institution}/approve/',
            f'/api/admins/{self.pending_institution.id_institution}/reject/'
        ]
        
        for endpoint in endpoints:
            response = self.client.post(endpoint, {})
            # La respuesta no debería ser un error 500 (error del servidor).
            # Se espera un 400 (petición incorrecta) si faltan datos.
            self.assertNotEqual(response.status_code, 500, f"El endpoint {endpoint} devolvió un error 500")
    
    def test_institution_approve_view_with_custom_role(self):
        """Prueba la aprobación de una institución con un rol personalizado."""
        approve_data = {'role': 'Colegio'}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verifica que el estado de la institución se haya actualizado.
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'aprobada')
    
    def test_institution_reject_view_long_reason(self):
        """Prueba el rechazo de una institución con un motivo largo."""
        long_reason = "Este es un motivo de rechazo muy largo que contiene muchas palabras y debería ser aceptado por el sistema. Incluye varios detalles sobre por qué la institución fue rechazada y qué mejoras se necesitan."
        
        reject_data = {'reason': long_reason}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verifica que el motivo largo se haya guardado correctamente.
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.rejection_reason, long_reason)