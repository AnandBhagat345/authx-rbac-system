from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import UserSerializer

# Create your views here.

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated] # No access without Login

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

