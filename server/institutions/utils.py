import jwt
import datetime
from django.conf import settings
from .models import Institution

def generate_institution_token(institution: Institution) -> str:
    """
    Genera un token JWT para una instancia de Institución.
    El payload contendrá el ID de la institución.
    """
    payload = {
        'institution_id': institution.id_institution,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),  # Token expira en 1 día
        'iat': datetime.datetime.utcnow(),
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token