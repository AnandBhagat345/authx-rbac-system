from django.urls import path
from .views import UserProfileView, RegisterAPIView

urlpatterns = [
    # Auth related
    path('auth/register/', RegisterAPIView.as_view(), name='register'),

    # User related
    path('users/me/', UserProfileView.as_view(), name='user-profile'),
]
