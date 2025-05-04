from django.db import models

class AdminUser(models.Model):
    aemail = models.EmailField(unique=True)
    apassword = models.TextField()
    full_name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_user"

    def __str__(self):
        return self.email