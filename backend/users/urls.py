from django.urls import path
from .views import UserProfileView, RegisterAPIView, LogoutAPIView

urlpatterns = [
    # Auth related
    path('auth/register/', RegisterAPIView.as_view(), name='register'),

    # User related
    path('users/me/', UserProfileView.as_view(), name='user-profile'),

    #LogOut related
    path('auth/logout/', LogoutAPIView.as_view(), name='logout'),

]
