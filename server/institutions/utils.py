# server/institutions/utils.py

import jwt
import datetime
from django.conf import settings
from .models import Institution

def generate_institution_token(institution: Institution) -> str:
    """
    Genera un token JWT para una instancia específica de Institución.
    
    El payload (contenido) del token contendrá el ID de la institución,
    así como una fecha de expiración para mayor seguridad.
    
    :param institution: El objeto de la institución para el cual se genera el token.
    :return: Una cadena que representa el token JWT.
    """
    payload = {
        'institution_id': institution.id_institution,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),  # El token expira en 1 día.
        'iat': datetime.datetime.utcnow(), # Fecha de emisión del token (issued at).
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token