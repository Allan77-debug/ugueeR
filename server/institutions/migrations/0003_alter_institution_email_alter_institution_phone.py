# Generated by Django 5.2 on 2025-05-27 23:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='institution',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
        migrations.AlterField(
            model_name='institution',
            name='phone',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]
