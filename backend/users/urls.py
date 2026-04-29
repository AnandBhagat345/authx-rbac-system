from django.urls import path,include
from .views import UserProfileView, RegisterAPIView, LogoutAPIView,UserViewSet,RoleAPIView,AuditLogViewSet, VerifyEmailView,LoginAPIView,PasswordResetRequestAPIView,PasswordResetConfirmAPIView,VerifyOTPAPIView
from rest_framework.routers import DefaultRouter



router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r"audit-logs", AuditLogViewSet)

urlpatterns = [
    # Auth related
    path('register/', RegisterAPIView.as_view(), name='register'),

    # User related
    path('users/me/', UserProfileView.as_view(), name='user-profile'),

    #LogOut related
    path('auth/logout/', LogoutAPIView.as_view(), name='logout'),

    path("roles/", RoleAPIView.as_view(), name="roles"),

    path("roles/<int:pk>/", RoleAPIView.as_view(), name="role-detail"),

    # path("users/<int:pk>/assign-role/", UserProfileView.as_view(), name="assign-role"),

    # path('register/', RegisterView.as_view(), name='register'),
    
    path('verify/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),

    path('auth/login/', LoginAPIView.as_view(), name='login'),

    path("auth/verify-otp/", VerifyOTPAPIView.as_view(), name="verify-otp"),

    path('password-reset/', PasswordResetRequestAPIView.as_view(), name='password-reset'),

    path('password-reset-confirm/<uidb64>/<token>/',PasswordResetConfirmAPIView.as_view(),name='password-reset-confirm'),


]





urlpatterns += router.urls
