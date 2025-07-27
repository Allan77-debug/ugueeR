from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import datetime, timedelta
from institutions.models import Institution
import jwt
from django.conf import settings
from admins.models import AdminUser


class AdminViewsTest(APITestCase):
    """Test cases for the Admin views (institution approval/rejection only)."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        # Create test institutions
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
        """Test admin login endpoint structure (skipped due to managed=False table)."""
        # Skip admin login tests since AdminUser table is managed=False
        self.skipTest("AdminUser table is managed=False, skipping login tests")
    
    def test_institution_approve_view_success(self):
        """Test successful institution approval."""
        approve_data = {
            'role': 'Universidad'
        }
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido aprobada correctamente', response.data['message'])
        
        # Verify institution was updated
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'aprobada')
        self.assertTrue(self.pending_institution.validate_state)
    
    def test_institution_approve_view_without_role(self):
        """Test institution approval without role (should use default)."""
        approve_data = {}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido aprobada correctamente', response.data['message'])
        
        # Verify institution was updated
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'aprobada')
        self.assertTrue(self.pending_institution.validate_state)
    
    def test_institution_approve_view_nonexistent_institution(self):
        """Test institution approval for non-existent institution."""
        approve_data = {
            'role': 'Universidad'
        }
        
        response = self.client.post('/api/admins/99999/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 404)
    
    def test_institution_approve_view_already_approved(self):
        """Test institution approval for already approved institution."""
        approve_data = {
            'role': 'Universidad'
        }
        
        response = self.client.post(f'/api/admins/{self.approved_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido aprobada correctamente', response.data['message'])
        
        # Verify institution remains approved
        self.approved_institution.refresh_from_db()
        self.assertEqual(self.approved_institution.status, 'aprobada')
        self.assertTrue(self.approved_institution.validate_state)
    
    def test_institution_approve_view_rejected_institution(self):
        """Test institution approval for rejected institution."""
        approve_data = {
            'role': 'Universidad'
        }
        
        response = self.client.post(f'/api/admins/{self.rejected_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido aprobada correctamente', response.data['message'])
        
        # Verify institution was updated to approved
        self.rejected_institution.refresh_from_db()
        self.assertEqual(self.rejected_institution.status, 'aprobada')
        self.assertTrue(self.rejected_institution.validate_state)
    
    def test_institution_reject_view_success(self):
        """Test successful institution rejection."""
        reject_data = {
            'reason': 'Test rejection reason'
        }
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido rechazada', response.data['message'])
        
        # Verify institution was updated
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'rechazada')
        self.assertEqual(self.pending_institution.rejection_reason, 'Test rejection reason')
    
    def test_institution_reject_view_missing_reason(self):
        """Test institution rejection without reason."""
        reject_data = {}
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Debe proporcionar un motivo para el rechazo.')
    
    def test_institution_reject_view_empty_reason(self):
        """Test institution rejection with empty reason."""
        reject_data = {
            'reason': ''
        }
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Debe proporcionar un motivo para el rechazo.')
    
    def test_institution_reject_view_nonexistent_institution(self):
        """Test institution rejection for non-existent institution."""
        reject_data = {
            'reason': 'Test rejection reason'
        }
        
        response = self.client.post('/api/admins/99999/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 404)
    
    def test_institution_reject_view_already_rejected(self):
        """Test institution rejection for already rejected institution."""
        reject_data = {
            'reason': 'Another rejection reason'
        }
        
        response = self.client.post(f'/api/admins/{self.rejected_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido rechazada', response.data['message'])
        
        # Verify institution remains rejected with new reason
        self.rejected_institution.refresh_from_db()
        self.assertEqual(self.rejected_institution.status, 'rechazada')
        self.assertEqual(self.rejected_institution.rejection_reason, 'Another rejection reason')
    
    def test_institution_reject_view_approved_institution(self):
        """Test institution rejection for approved institution."""
        reject_data = {
            'reason': 'Test rejection reason'
        }
        
        response = self.client.post(f'/api/admins/{self.approved_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido rechazada', response.data['message'])
        
        # Verify institution was updated to rejected
        self.approved_institution.refresh_from_db()
        self.assertEqual(self.approved_institution.status, 'rechazada')
        self.assertEqual(self.approved_institution.rejection_reason, 'Test rejection reason')
    
    def test_admin_endpoints_structure(self):
        """Test that all admin endpoints exist and respond appropriately."""
        endpoints = [
            f'/api/admins/{self.pending_institution.id_institution}/approve/',
            f'/api/admins/{self.pending_institution.id_institution}/reject/'
        ]
        
        for endpoint in endpoints:
            response = self.client.post(endpoint, {})
            # Should get 400 (bad request) or 404 (not found), but not 500 (server error)
            self.assertNotEqual(response.status_code, 500, f"Endpoint {endpoint} returned 500")
    
    def test_institution_approve_view_with_custom_role(self):
        """Test institution approval with custom role."""
        approve_data = {
            'role': 'Colegio'
        }
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/approve/', approve_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido aprobada correctamente', response.data['message'])
        
        # Verify institution was updated
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'aprobada')
        self.assertTrue(self.pending_institution.validate_state)
    
    def test_institution_reject_view_long_reason(self):
        """Test institution rejection with long reason."""
        long_reason = "This is a very long rejection reason that contains many words and should be accepted by the system. It includes various details about why the institution was rejected and what improvements are needed."
        
        reject_data = {
            'reason': long_reason
        }
        
        response = self.client.post(f'/api/admins/{self.pending_institution.id_institution}/reject/', reject_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertIn('ha sido rechazada', response.data['message'])
        
        # Verify institution was updated
        self.pending_institution.refresh_from_db()
        self.assertEqual(self.pending_institution.status, 'rechazada')
        self.assertEqual(self.pending_institution.rejection_reason, long_reason) 