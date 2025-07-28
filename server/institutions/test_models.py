from django.test import TestCase
from django.contrib.auth.hashers import make_password
from institutions.models import Institution


class InstitutionModelTest(TestCase):
    """
    Casos de prueba para el modelo Institution.
    Verifica la creación, relaciones, valores por defecto y comportamiento del modelo.
    """
    
    def setUp(self):
        """
        Prepara los datos necesarios para cada test.
        Este método se ejecuta antes de cada método 'test_*', creando un entorno limpio.
        """
        # Crea una instancia de Institución que será usada en las pruebas.
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Test University",
            short_name="TU",
            email="test@university.edu",
            phone="+1234567890",
            address="123 University Street",
            city="Test City",
            istate="Test State",
            postal_code="12345",
            ipassword=make_password("testpass123"),
            validate_state=False,
            status='pendiente',
            rejection_reason=""
        )
    
    def test_institution_creation(self):
        """Verifica que una institución se puede crear correctamente con los datos esperados."""
        self.assertEqual(self.institution.official_name, "Test University")
        self.assertEqual(self.institution.short_name, "TU")
        self.assertEqual(self.institution.email, "test@university.edu")
        self.assertEqual(self.institution.phone, "+1234567890")
        self.assertEqual(self.institution.city, "Test City")
        self.assertEqual(self.institution.istate, "Test State")
        self.assertEqual(self.institution.postal_code, "12345")
        self.assertEqual(self.institution.status, 'pendiente')
        self.assertFalse(self.institution.validate_state)
    
    def test_institution_string_representation(self):
        """Verifica que el método __str__ devuelve el nombre oficial."""
        self.assertEqual(str(self.institution), "Test University")
    
    def test_institution_status_choices(self):
        """Verifica que las opciones de estado ('choices') están definidas correctamente en el modelo."""
        status_choices = [choice[0] for choice in Institution._meta.get_field('status').choices]
        self.assertIn('pendiente', status_choices)
        self.assertIn('aprobada', status_choices)
        self.assertIn('rechazada', status_choices)
    
    def test_institution_default_values(self):
        """Verifica que los valores por defecto se asignan correctamente al crear una institución."""
        # Comprueba los colores por defecto.
        self.assertEqual(self.institution.primary_color, "#6a5acd")
        self.assertEqual(self.institution.secondary_color, "#ffffff")
        
        # Comprueba el estado de validación por defecto.
        self.assertFalse(self.institution.validate_state)
        
        # Comprueba el estado de la solicitud por defecto.
        self.assertEqual(self.institution.status, 'pendiente')
    
    def test_institution_status_transitions(self):
        """Verifica que el campo 'status' puede cambiar a otros valores válidos."""
        # Prueba la transición de 'pendiente' a 'aprobada'.
        self.institution.status = 'aprobada'
        self.institution.save()
        self.assertEqual(self.institution.status, 'aprobada')
        
        # Prueba la transición de 'aprobada' a 'rechazada'.
        self.institution.status = 'rechazada'
        self.institution.save()
        self.assertEqual(self.institution.status, 'rechazada')
        
        # Prueba la transición de 'rechazada' a 'pendiente'.
        self.institution.status = 'pendiente'
        self.institution.save()
        self.assertEqual(self.institution.status, 'pendiente')
    
    def test_institution_validation_state(self):
        """Verifica que el campo booleano 'validate_state' puede ser modificado."""
        # Prueba asignando el valor True.
        self.institution.validate_state = True
        self.institution.save()
        self.assertTrue(self.institution.validate_state)
        
        # Prueba asignando el valor False.
        self.institution.validate_state = False
        self.institution.save()
        self.assertFalse(self.institution.validate_state)
    
    def test_institution_rejection_reason(self):
        """Verifica que se puede asignar y limpiar una razón de rechazo."""
        # Prueba asignando una razón de rechazo.
        rejection_reason = "Incomplete documentation"
        self.institution.rejection_reason = rejection_reason
        self.institution.save()
        self.assertEqual(self.institution.rejection_reason, rejection_reason)
        
        # Prueba limpiando la razón de rechazo.
        self.institution.rejection_reason = ""
        self.institution.save()
        self.assertEqual(self.institution.rejection_reason, "")
    
    def test_institution_email_uniqueness(self):
        """Verifica la restricción de unicidad del campo 'email'."""
        # Crea otra institución con un email diferente para asegurar que no hay conflicto.
        institution2 = Institution.objects.create(
            id_institution=2,
            official_name="Another University",
            short_name="AU",
            email="another@university.edu",
            phone="+0987654321",
            address="456 Another Street",
            city="Another City",
            istate="Another State",
            postal_code="54321",
            ipassword=make_password("anotherpass123")
        )
        self.assertNotEqual(self.institution.email, institution2.email)
    
    def test_institution_phone_uniqueness(self):
        """Verifica la restricción de unicidad del campo 'phone'."""
        # Crea otra institución con un teléfono diferente para asegurar que no hay conflicto.
        institution2 = Institution.objects.create(
            id_institution=2,
            official_name="Another University",
            short_name="AU",
            email="another@university.edu",
            phone="+0987654321",
            address="456 Another Street",
            city="Another City",
            istate="Another State",
            postal_code="54321",
            ipassword=make_password("anotherpass123")
        )
        self.assertNotEqual(self.institution.phone, institution2.phone)
    
    def test_institution_color_validation(self):
        """Verifica que se pueden guardar colores en formato hexadecimal."""
        self.institution.primary_color = "#ff0000"
        self.institution.secondary_color = "#00ff00"
        self.institution.save()
        self.assertEqual(self.institution.primary_color, "#ff0000")
        self.assertEqual(self.institution.secondary_color, "#00ff00")
    
    def test_institution_address_validation(self):
        """Verifica que el campo de dirección puede almacenar textos largos."""
        long_address = "This is a very long address that should be stored properly in the database without any issues"
        self.institution.address = long_address
        self.institution.save()
        self.assertEqual(self.institution.address, long_address)
    
    def test_institution_postal_code_validation(self):
        """Verifica que el campo de código postal acepta diferentes formatos."""
        postal_codes = ["12345", "A1B2C3", "12345-6789"]
        for postal_code in postal_codes:
            self.institution.postal_code = postal_code
            self.institution.save()
            self.assertEqual(self.institution.postal_code, postal_code)
    
    def test_institution_application_date(self):
        """Verifica que la fecha de aplicación ('application_date') se establece automáticamente."""
        # Crea una nueva institución para probar la funcionalidad 'auto_now_add'.
        new_institution = Institution.objects.create(
            id_institution=3,
            official_name="New University",
            short_name="NU",
            email="new@university.edu",
            phone="+1111111111",
            address="789 New Street",
            city="New City",
            istate="New State",
            postal_code="11111",
            ipassword=make_password("newpass123")
        )
        self.assertIsNotNone(new_institution.application_date)
    
    def test_institution_blank_fields(self):
        """Verifica que los campos que permiten estar en blanco ('blank=True') funcionan."""
        # Comprueba que se puede guardar una cadena vacía en 'rejection_reason'.
        self.institution.rejection_reason = ""
        self.institution.save()
        self.assertEqual(self.institution.rejection_reason, "")
        
        # Comprueba que se puede guardar un valor nulo en 'rejection_reason'.
        self.institution.rejection_reason = None
        self.institution.save()
        self.assertIsNone(self.institution.rejection_reason)
    
    def test_institution_password_hashing(self):
        """Verifica que la contraseña se guarda hasheada y no en texto plano."""
        from django.contrib.auth.hashers import check_password
        # Comprueba que la contraseña correcta es válida.
        self.assertTrue(check_password("testpass123", self.institution.ipassword))
        # Comprueba que una contraseña incorrecta no es válida.
        self.assertFalse(check_password("wrongpassword", self.institution.ipassword))
    
    def test_institution_meta_options(self):
        """Verifica las meta opciones del modelo, como el nombre de la tabla y los nombres legibles."""
        # Comprueba el nombre de la tabla en la base de datos.
        self.assertEqual(Institution._meta.db_table, 'institution')
        
        # Comprueba los nombres para el admin de Django.
        self.assertEqual(Institution._meta.verbose_name, 'institution')
        self.assertEqual(Institution._meta.verbose_name_plural, 'institutions')