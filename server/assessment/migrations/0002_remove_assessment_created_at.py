# Generated by Django 5.2 on 2025-07-24 22:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assessment', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='assessment',
            name='created_at',
        ),
    ]
