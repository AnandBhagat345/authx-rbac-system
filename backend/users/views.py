from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken


from .serializers import UserSerializer,  RegisterSerializer, RoleSerializer, AssignRoleSerializer,AuditLogSerializer,LoginSerializer,PasswordResetRequestSerializer,PasswordResetConfirmSerializer
from .permissions.rbac import HasPermission

from rest_framework.viewsets import ModelViewSet,ReadOnlyModelViewSet
from users.models import User, Role, AuditLog
from rest_framework.decorators import action

from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

from .tokens import email_verification_token
from rest_framework_simplejwt.views import TokenObtainPairView

from django.contrib.auth.tokens import PasswordResetTokenGenerator

# Create your views here.

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated, HasPermission] # No access without Login
    required_permission = "user.view"

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()

        # generate uid
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # generate token
        token = email_verification_token.make_token(user)

        # build verification link
        verification_link = f"http://127.0.0.1:8000/api/verify/{uid}/{token}/"

        # send email
        send_mail(
            subject="Verify your email",
            message=f"Click the link to verify your account:\n{verification_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
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
        
        AuditLog.objects.create(
            actor=request.user,
            target_user=user,
            action=f"Assigned role {role.name}"
        )

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


class AuditLogViewSet(ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by("-timestamp")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, HasPermission]

    permission_map = {
        "GET": "audit.view"
    }

    
# User = get_user_model()


# class RegisterView(APIView):

#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)

#         if serializer.is_valid():
#             user = serializer.save()

#             # generate uid
#             uid = urlsafe_base64_encode(force_bytes(user.pk))

#             # generate token
#             token = email_verification_token.make_token(user)

#             # build verification link
#             verification_link = f"http://127.0.0.1:8000/api/auth/verify/{uid}/{token}/"

#             # send email (console backend)
#             send_mail(
#                 subject="Verify your email",
#                 message=f"Click the link to verify your account:\n{verification_link}",
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[user.email],
#             )

#             return Response(
#                 {"message": "User registered successfully. Check your email to verify."},
#                 status=status.HTTP_201_CREATED
#             )

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            # decode user id
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Invalid verification link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # check token
        if email_verification_token.check_token(user, token):
            user.is_active = True
            user.save()

            return Response(
                {"message": "Email verified successfully"},
                status=status.HTTP_200_OK
            )

        return Response(
            {"error": "Token is invalid or expired"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
        
class LoginAPIView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    
password_reset_token = PasswordResetTokenGenerator()


class PasswordResetRequestAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data["email"]
            user = User.objects.get(email=email)

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = password_reset_token.make_token(user)

            reset_link = f"http://127.0.0.1:8000/api/password-reset-confirm/{uid}/{token}/"

            send_mail(
                subject="Reset Your Password",
                message=f"Click the link to reset your password:\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )

            return Response(
                {"message": "Password reset link sent to your email."},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response(
                {"error": "Invalid link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not password_reset_token.check_token(user, token):
            return Response(
                {"error": "Token is invalid or expired"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PasswordResetConfirmSerializer(data=request.data)

        if serializer.is_valid():
            user.set_password(serializer.validated_data["new_password"])
            user.save()

            return Response(
                {"message": "Password reset successful"},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
