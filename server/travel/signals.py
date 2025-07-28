
#travel/signals.py
# server/travel/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Travel

@receiver(post_save, sender=Travel)
def travel_status_changed(sender, instance, created, **kwargs):
    """
    Señal que se dispara CADA VEZ que un objeto Travel se guarda en la BD.

    Su propósito es detectar cuándo un viaje cambia su estado a 'in_progress'
    para notificar al `InstitutionMapConsumer` a través de un canal de WebSocket.
    """
    # 'update_fields' contiene los nombres de los campos que se actualizaron.
    # Si es None, significa que se guardaron todos los campos.
    update_fields = kwargs.get('update_fields') or set()

    # La lógica se ejecuta solo si el estado del viaje es 'in_progress' Y
    # el campo 'travel_state' fue uno de los campos que se actualizaron.
    # Esto evita enviar notificaciones en cada guardado del viaje.
    if instance.travel_state == 'in_progress' and ('travel_state' in update_fields or created):
        
        # Obtiene la capa de canales de Django Channels.
        channel_layer = get_channel_layer()
        
        # Verifica que el conductor del viaje pertenezca a una institución.
        if instance.driver.user.institution:
            institution_id = instance.driver.user.institution.id_institution
            # Construye el nombre del grupo de eventos de la institución.
            institution_group_name = f'institution_events_{institution_id}'

            # Envía un mensaje al grupo del canal de forma síncrona.
            # `async_to_sync` es un adaptador para llamar código asíncrono desde código síncrono.
            async_to_sync(channel_layer.group_send)(
                institution_group_name,
                {
                    "type": "new_travel_started",  # Invoca al método new_travel_started en los consumers
                    "travel_id": instance.id
                }
            )
            print(f"SEÑAL: Viaje {instance.id} cambió a 'in_progress'. Notificando a {institution_group_name}")