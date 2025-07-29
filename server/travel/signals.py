from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Travel

@receiver(post_save, sender=Travel)
def travel_status_changed(sender, instance, created, **kwargs):
    """
    Se dispara CADA VEZ que un objeto Travel se guarda.
    """
    update_fields = kwargs.get('update_fields') or set()
    
    if instance.travel_state == 'in_progress' and 'travel_state' in update_fields:
        channel_layer = get_channel_layer()
        
        if instance.driver.user.institution:
            institution_id = instance.driver.user.institution.id_institution
            institution_group_name = f'institution_events_{institution_id}'

            async_to_sync(channel_layer.group_send)(
                institution_group_name,
                {
                    "type": "new_travel_started", 
                    "travel_id": instance.id
                }
            )
            print(f"SEÑAL: Viaje {instance.id} cambió a 'in_progress'. Notificando a {institution_group_name}")