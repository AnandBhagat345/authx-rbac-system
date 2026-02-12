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
        "GET": "user.view",
        "POST": "user.create",
        "PUT": "user.update",
        "PATCH": "user.update",
        "DELETE": "user.delete",
    }

    def get_permissions(self):
        """
        Attach required_permission dynamically based on action
        """
        required_permission = self.permission_map.get(self.action)
        if required_permission:
            self.required_permission = required_permission

        return super().get_permissions()
    
    @action(detail=True, methods=["put"], url_path="assign-role")
    def assign_role(self, request, pk=None):

        # Permission check manually
        if not request.user.is_superuser and (
            not request.user.role or request.user.role.name != "ADMIN"
        ):
            return Response(
                {"error": "You do not have permission to assign roles."},
                status=403
            )

        try:
            user = self.get_object()
        except:
            return Response({"error": "User not found"}, status=404)

        role_id = request.data.get("role_id")

        try:
            role = Role.objects.get(pk=role_id)
        except Role.DoesNotExist:
            return Response({"error": "Role not found"}, status=404)

        user.role = role
        user.save()

        return Response({"message": "Role assigned successfully"}, status=200)
    
    
class RoleAPIView(APIView):

    permission_classes = [HasPermission]

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


    
    

