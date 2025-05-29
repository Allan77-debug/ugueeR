from rest_framework import generics
from .models import Route
from .serializers import RouteSerializer

class RouteCreateView(generics.CreateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer