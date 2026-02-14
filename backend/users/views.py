from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken


from .serializers import UserSerializer,  RegisterSerializer, RoleSerializer, AssignRoleSerializer
from .permissions.rbac import HasPermission

from rest_framework.viewsets import ModelViewSet
from users.models import User, Role
from rest_framework.decorators import action

# Create your views here.

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated, HasPermission] # No access without Login
    required_permission = "user.view"

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class RegisterAPIView(generics.CreateAPIView):
    serializer_class  = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": "User registered successfully"
            },
            status=status.HTTP_201_CREATED
        )




class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logged out successfully"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )
            

class UserViewSet(ModelViewSet):
    """
    Full CRUD for Users with RBAC enforcement 
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, HasPermission]

    # Permission Mapping
    permission_map = {
    "list": "user.view",
    "retrieve": "user.view",
    "create": "user.create",
    "update": "user.update",
    "partial_update": "user.update",
    "destroy": "user.delete",
    }

    def get_permissions(self):
        """
        Attach required_permission dynamically based on action
        """
        self.required_permission = self.permission_map.get(self.action)
        return super().get_permissions()
    
    @action(detail=True, methods=["put"], url_path="assign-role")
    def assign_role(self, request, pk=None):

        if not request.user.role or not request.user.role.permissions.filter(
            code="role.assign"
        ).exists():
            return Response(
                {"error": "You do not have permission to assign roles."},
                status=403
            )

        user = self.get_object()
        role_id = request.data.get("role_id")

        try:
            role = Role.objects.get(pk=role_id)
        except Role.DoesNotExist:
            return Response({"error": "Role not found"}, status=404)

        user.role = role
        user.save()

        return Response({"message": "Role assigned successfully"}, status=200)

    
class RoleAPIView(APIView):

    permission_classes = [IsAuthenticated, HasPermission]

    permission_map = {
        "GET": "role.view",
        "POST": "role.create",
        "PUT": "role.update",
        "DELETE": "role.delete",
    }

    def get(self, request):
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, pk=None):
        try:
            role = Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return Response({"error": "Role not found"}, status=404)

        serializer = RoleSerializer(role, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


    def delete(self, request, pk=None):
        try:
            role = Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return Response({"error": "Role not found"}, status=404)

        role.delete()
        return Response({"message": "Role deleted successfully"}, status=204)


    
    

