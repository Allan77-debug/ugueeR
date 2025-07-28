# server/config/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.authentication import JWTAuthentication

# --- Configuración de la Vista del Esquema de la API para drf-yasg ---
schema_view = get_schema_view(
   openapi.Info(
      title="Uway API", # Título de tu API en la documentación.
      default_version='v3',
      description="Documentación de la API para el proyecto Uway.",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@uway.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
   authentication_classes=[JWTAuthentication], # Asegura que Swagger reconozca la autenticación JWT.
)

# --- Lista de Patrones de URL del Proyecto ---
urlpatterns = [
    path("admin/", admin.site.urls),
    
    # Incluye las URLs de cada una de tus aplicaciones.
    # Esto mantiene el archivo de URLs principal limpio y organizado.
    path("api/institutions/", include("institutions.urls")),
    path("api/admins/", include("admins.urls")),
    path("api/users/", include("users.urls")),
    path("api/vehicle/", include("vehicle.urls")),
    path("api/driver/", include("driver.urls")), 
    path("api/route/", include("route.urls")),
    path("api/travel/", include("travel.urls")),
    path("api/assessment/", include("assessment.urls")),
    path("api/realize/", include("realize.urls")),
    
    # --- URLs para la Documentación de la API ---
    # Endpoint para descargar el esquema en formato JSON o YAML.
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    # Endpoint para la interfaz de usuario de Swagger.
    re_path(
        r"^swagger/$",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    # Endpoint para la interfaz de usuario alternativa de ReDoc.
    re_path(
        r"^redoc/$",
        schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
# Se añade la configuración para servir archivos de media (imágenes subidas, etc.)
# durante el desarrollo (cuando DEBUG=True).
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)