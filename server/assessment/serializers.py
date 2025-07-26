# assessment/serializers.py

from rest_framework import serializers
from .models import Assessment

class AssessmentReadSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    driver = serializers.StringRelatedField()
    travel = serializers.StringRelatedField()

    class Meta:
        model = Assessment
        fields = ['id', 'travel', 'driver', 'user', 'score', 'comment']


class AssessmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ['travel', 'driver', 'score', 'comment']

class AssessmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ['score', 'comment']