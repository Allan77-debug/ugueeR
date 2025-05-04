from django.db import models

class AdminUser(models.Model):
    aid = models.AutoField(primary_key=True)

    aemail = models.EmailField(unique=True)
    apassword = models.TextField()
    full_name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_user"
        managed = False 

    def __str__(self):
        return self.email