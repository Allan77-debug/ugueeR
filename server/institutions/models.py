from django.db import models

# Create your models here.
class Institution(models.Model):
    id_institution = models.AutoField(primary_key=True)

    official_name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    address = models.TextField()
    city = models.CharField(max_length=100)
    istate = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default="#6a5acd")
    secondary_color = models.CharField(max_length=7, default="#ffffff")
    ipassword = models.CharField(max_length=128)

    class Meta:
        db_table = 'institution'

    def __str__(self):
        return self.official_name
