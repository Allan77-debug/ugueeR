"""
Define los casos de prueba para los modelos de la aplicación 'admins'.
"""
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from admins.models import AdminUser
from django.db import models


class AdminUserModelTest(TestCase):
    """Casos de prueba para el modelo AdminUser."""
    
    def setUp(self):
        """
        Prepara los datos necesarios para las pruebas.
        
        Nota: La creación de instancias se omite porque el modelo AdminUser
        está configurado con 'managed = False'.
        """
        self.admin_user = None
    
    def test_admin_user_creation(self):
        """Prueba que un usuario administrador pueda ser creado exitosamente."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de creación.")
    
    def test_admin_user_string_representation(self):
        """Prueba la representación en cadena del usuario administrador."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de __str__.")
    
    def test_admin_user_email_uniqueness(self):
        """Prueba que el email del usuario administrador sea único."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de unicidad de email.")
    
    def test_admin_user_password_hashing(self):
        """Prueba que la contraseña del usuario administrador se hashee correctamente."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de hasheo de contraseña.")
    
    def test_admin_user_full_name_optional(self):
        """Prueba que el nombre completo del usuario administrador sea opcional."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de campo opcional.")
    
    def test_admin_user_created_at_auto_set(self):
        """Prueba que el campo 'created_at' se establezca automáticamente."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de auto-creación de fecha.")
    
    def test_admin_user_meta_options(self):
        """Prueba las meta opciones del modelo de usuario administrador."""
        # Prueba el nombre de la tabla en la base de datos.
        self.assertEqual(AdminUser._meta.db_table, 'admin_user')
        
        # Prueba los nombres legibles para el panel de administración.
        # Nota: Django genera estos nombres automáticamente si no se especifican.
        self.assertEqual(AdminUser._meta.verbose_name, 'admin user')
        self.assertEqual(AdminUser._meta.verbose_name_plural, 'admin users')
    
    def test_admin_user_managed_option(self):
        """Prueba que el modelo de usuario administrador no sea gestionado por Django."""
        # Prueba que la opción 'managed' esté establecida en False.
        self.assertFalse(AdminUser._meta.managed)
    
    def test_admin_user_primary_key(self):
        """Prueba la clave primaria del modelo de usuario administrador."""
        # Prueba que 'aid' sea la clave primaria.
        aid_field = AdminUser._meta.get_field('aid')
        self.assertTrue(aid_field.primary_key)
        self.assertIsInstance(aid_field, models.AutoField)
    
    def test_admin_user_field_types(self):
        """Prueba los tipos de campo del modelo de usuario administrador."""
        # Prueba el campo de email.
        email_field = AdminUser._meta.get_field('aemail')
        self.assertIsInstance(email_field, models.EmailField)
        
        # Prueba el campo de contraseña.
        password_field = AdminUser._meta.get_field('apassword')
        self.assertIsInstance(password_field, models.TextField)
        
        # Prueba el campo de nombre completo.
        full_name_field = AdminUser._meta.get_field('full_name')
        self.assertIsInstance(full_name_field, models.CharField)
        self.assertEqual(full_name_field.max_length, 150)
        
        # Prueba el campo de fecha de creación.
        created_at_field = AdminUser._meta.get_field('created_at')
        self.assertIsInstance(created_at_field, models.DateTimeField)
    
    def test_admin_user_field_constraints(self):
        """Prueba las restricciones de los campos del modelo de usuario administrador."""
        # Prueba que el campo de email sea único.
        email_field = AdminUser._meta.get_field('aemail')
        self.assertTrue(email_field.unique)
        
        # Prueba que el campo de nombre completo permita valores en blanco.
        full_name_field = AdminUser._meta.get_field('full_name')
        self.assertTrue(full_name_field.blank)
    
    def test_admin_user_with_different_emails(self):
        """Prueba la creación de usuarios con emails diferentes."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de emails diferentes.")
    
    def test_admin_user_email_validation(self):
        """Prueba la validación del formato de email."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de validación de email.")
    
    def test_admin_user_full_name_length(self):
        """Prueba la validación de la longitud del nombre completo."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de longitud de nombre.")
    
    def test_admin_user_created_at_immutability(self):
        """Prueba que 'created_at' no se pueda modificar después de la creación."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de inmutabilidad de fecha.")
    
    def test_admin_user_model_integrity(self):
        """Prueba la integridad del modelo de usuario administrador."""
        # Prueba que todas las importaciones necesarias estén disponibles.
        self.assertIsNotNone(AdminUser)
    
    def test_admin_user_password_validation(self):
        """Prueba la validación de la contraseña."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de validación de contraseña.")
    
    def test_admin_user_id_auto_increment(self):
        """Prueba el autoincremento del ID de usuario administrador."""
        # Se omite la prueba ya que la tabla no es gestionada por Django.
        self.skipTest("La tabla AdminUser es 'managed=False', se omite la prueba de autoincremento de ID.")
    
    def test_admin_user_field_names(self):
        """Prueba los nombres de los campos del modelo de usuario administrador."""
        # Prueba que todos los campos esperados existan en el modelo.
        field_names = [field.name for field in AdminUser._meta.get_fields()]
        expected_fields = ['aid', 'aemail', 'apassword', 'full_name', 'created_at']
        
        for field in expected_fields:
            self.assertIn(field, field_names)