from django.contrib import admin

# Register your models here.
from .models import Institution

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('official_name', 'email', 'city', 'istate')
    search_fields = ('official_name', 'email', 'city')
    list_filter = ('istate',)