"""
Agregador de pruebas para la aplicación 'assessment'.

Este archivo importa las clases de prueba de otros módulos (como test_models.py, 
test_views.py, etc.) para que el descubridor de pruebas de Django
pueda encontrarlas y ejecutarlas fácilmente.
"""
# Importa todas las clases de prueba de los archivos separados.
from .test_models import AssessmentModelTest
from .test_views import AssessmentViewsTest

# Este archivo ahora sirve como un punto central de importación para todas las pruebas de 'assessment'.
# Los archivos de prueba individuales están organizados para mayor claridad.