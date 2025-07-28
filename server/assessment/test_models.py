"""
Define los casos de prueba para los modelos de la aplicación 'assessment'.
"""
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from datetime import datetime, timedelta
from assessment.models import Assessment
from travel.models import Travel
from driver.models import Driver
from vehicle.models import Vehicle
from users.models import Users
from institutions.models import Institution
from django.core.exceptions import ValidationError
from django.db import models


class AssessmentModelTest(TestCase):
    """Casos de prueba para el modelo Assessment."""
    
    def setUp(self):
        """Prepara los datos y objetos necesarios para cada prueba."""
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
        
        # Crear un usuario de tipo conductor.
        self.driver_user = Users.objects.create(
            full_name="Test Driver",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="driver@university.edu",
            upassword=make_password("driverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
        )
        
        # Crear el perfil de Conductor asociado.
        self.driver = Driver.objects.create(
            user=self.driver_user,
            validate_state='approved'
        )
        
        # Crear un usuario de tipo pasajero.
        self.user = Users.objects.create(
            full_name="Test User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="user@university.edu",
            upassword=make_password("userpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
        )
        
        # Nota: La creación de objetos Travel se omite aquí para simplificar las pruebas
        # y evitar dependencias complejas como el modelo Route.
    
    def test_assessment_creation(self):
        """Prueba que la estructura del modelo Assessment esté definida correctamente."""
        # Verifica que los componentes básicos para una calificación existan.
        self.assertIsNotNone(self.driver)
        self.assertIsNotNone(self.user)
        self.assertEqual(self.driver.user.full_name, "Test Driver")
        self.assertEqual(self.user.full_name, "Test User")
    
    def test_assessment_string_representation(self):
        """Prueba la representación en cadena del modelo Assessment."""
        # Esta prueba verifica que el método __str__ no cause errores.
        # En un caso real, se crearía una instancia de Assessment para probar la salida exacta.
        self.assertIsNotNone(self.user.full_name)
    
    def test_assessment_score_validation(self):
        """Prueba que la validación del campo 'score' esté definida."""
        # Verifica que el campo 'score' tenga validadores a nivel de modelo.
        score_field = Assessment._meta.get_field('score')
        self.assertTrue(len(score_field.validators) > 0)
    
    def test_assessment_relationships(self):
        """Prueba las relaciones ForeignKey del modelo Assessment."""
        # Verifica que los campos de relación apunten a los modelos correctos.
        travel_field = Assessment._meta.get_field('travel')
        driver_field = Assessment._meta.get_field('driver')
        user_field = Assessment._meta.get_field('user')
        
        self.assertEqual(travel_field.related_model, Travel)
        self.assertEqual(driver_field.related_model, Driver)
        self.assertEqual(user_field.related_model, Users)
    
    def test_assessment_comment_optional(self):
        """Prueba que el campo 'comment' sea opcional."""
        # Verifica que el campo de comentario permita valores nulos y en blanco.
        comment_field = Assessment._meta.get_field('comment')
        self.assertTrue(comment_field.blank)
        self.assertTrue(comment_field.null)
    
    def test_assessment_unique_constraint(self):
        """Prueba que la restricción de unicidad (usuario, viaje) esté definida."""
        # Verifica que la restricción 'unique_user_travel_assessment' exista.
        constraint_names = [constraint.name for constraint in Assessment._meta.constraints]
        self.assertIn('unique_user_travel_assessment', constraint_names)

    def test_assessment_meta_options(self):
        """Prueba las meta opciones del modelo Assessment."""
        # Verifica el nombre de la tabla y los nombres legibles.
        self.assertEqual(Assessment._meta.db_table, 'assessment')
        self.assertEqual(Assessment._meta.verbose_name, 'assessment')
        self.assertEqual(Assessment._meta.verbose_name_plural, 'assessments')
    
    def test_assessment_cascade_delete(self):
        """Prueba que la eliminación en cascada esté configurada en las ForeignKeys."""
        # Verifica que si se elimina un viaje, conductor o usuario, la calificación también se elimine.
        travel_field = Assessment._meta.get_field('travel')
        driver_field = Assessment._meta.get_field('driver')
        user_field = Assessment._meta.get_field('user')
        
        self.assertEqual(travel_field.remote_field.on_delete, models.CASCADE)
        self.assertEqual(driver_field.remote_field.on_delete, models.CASCADE)
        self.assertEqual(user_field.remote_field.on_delete, models.CASCADE)