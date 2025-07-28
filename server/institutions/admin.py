# server/institutions/admin.py

from django.contrib import admin
from .models import Institution

# El decorador @admin.register es la forma moderna de registrar un modelo en el admin de Django.
@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    """
    Define la configuración para el modelo Institution en la interfaz de administración de Django.
    Esto personaliza cómo se muestra y se interactúa con las instituciones en el panel de admin.
    """
    # Columnas que se mostrarán en la vista de lista de instituciones.
    list_display = ('official_name', 'email', 'city', 'istate')
    
    # Campos por los que se podrá buscar usando la barra de búsqueda del admin.
    search_fields = ('official_name', 'email', 'city')
    
    # Campos que se usarán para crear filtros en la barra lateral derecha del admin.
    list_filter = ('istate',)