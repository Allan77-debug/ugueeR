from django.db import models


class Users(models.Model):
    uid = models.AutoField(primary_key=True)

    full_name = models.CharField(max_length=255)
    user_type = models.CharField(max_length=50)
    institutional_mail = models.EmailField()
    student_code = models.CharField(max_length=100)
    udocument = models.TextField()
    institutional_carne = models.TextField()
    direction = models.TextField()
    uphone = models.CharField(max_length=50)
    upassword = models.TextField()
    institution_id = models.IntegerField()
    
    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.full_name
