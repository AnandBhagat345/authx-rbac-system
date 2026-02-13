from django.urls import path
from .views import UserProfileView, RegisterAPIView, LogoutAPIView,UserViewSet, RoleAPIView
from rest_framework.routers import DefaultRouter



router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    # Auth related
    path('auth/register/', RegisterAPIView.as_view(), name='register'),

    # User related
    path('users/me/', UserProfileView.as_view(), name='user-profile'),

    #LogOut related
    path('auth/logout/', LogoutAPIView.as_view(), name='logout'),

    path("roles/", RoleAPIView.as_view(), name="roles"),

    path("roles/<int:pk>/", RoleAPIView.as_view(), name="role-detail"),

    # path("users/<int:pk>/assign-role/", UserProfileView.as_view(), name="assign-role"),



]
urlpatterns += router.urls
