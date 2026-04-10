from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import User, Role, Permission



# TEST 1 — Register + Login Flow


class RegisterLoginTest(APITestCase):

    def test_register_creates_inactive_user(self):
        """
        Register karne pe user banta hai lekin is_active=False hota hai
        kyunki email verify nahi hui abhi
        """
        url = reverse("register")
        data = {"email": "test@example.com", "password": "securepass123"}

        response = self.client.post(url, data)

        # 201 Created aana chahiye
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # User DB mein bana
        user = User.objects.get(email="test@example.com")
        self.assertIsNotNone(user)

        # Email verify nahi hui toh is_active False hona chahiye
        self.assertFalse(user.is_active)

    def test_unverified_user_cannot_login(self):
        """
        Jis user ne email verify nahi ki, woh login nahi kar sakta.
        Login attempt pe error aana chahiye.
        """
        # Seedha DB mein inactive user banate hain (email bypass karke)
        User.objects.create_user(
            email="unverified@example.com",
            password="securepass123",
            is_active=False  # email verify nahi hui
        )

        url = reverse("login")
        data = {"email": "unverified@example.com", "password": "securepass123"}

        response = self.client.post(url, data)

        # Login block hona chahiye
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_verified_user_gets_jwt(self):
        """
        Email verify karne ke baad login karne pe JWT tokens milne chahiye
        (access + refresh dono)
        """
        # Active user banate hain, already verified
        User.objects.create_user(
            email="verified@example.com",
            password="securepass123",
            is_active=True  # email already verified
        )

        url = reverse("login")
        data = {"email": "verified@example.com", "password": "securepass123"}

        response = self.client.post(url, data)

        # Login successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # JWT tokens milne chahiye
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)


# TEST 2 — RBAC Permission Check


class RBACPermissionTest(APITestCase):

    def setUp(self):
        """
        setUp mein do users banate hain:
        - admin_user: "user.view" permission ke saath
        - plain_user: koi permission nahi
        """

        # Permission banate hain
        self.view_permission = Permission.objects.create(
            code="user.view",
            description="Can view users"
        )

        # Role banate hain aur permission attach karte hain
        self.admin_role = Role.objects.create(name="ADMIN")
        self.admin_role.permissions.add(self.view_permission)

        # Admin user — role ke saath
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="adminpass123",
            is_active=True
        )
        self.admin_user.role = self.admin_role
        self.admin_user.save()

        # Plain user — koi role nahi
        self.plain_user = User.objects.create_user(
            email="plain@example.com",
            password="plainpass123",
            is_active=True
        )

    def test_user_with_permission_can_access(self):
        """
        Admin user ke paas "user.view" permission hai,
        toh GET /users/ pe 200 milna chahiye
        """
        self.client.force_authenticate(user=self.admin_user)

        url = reverse("users-list")  # GET /api/users/
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_without_permission_gets_403(self):
        """
        Plain user ke paas koi role ya permission nahi,
        toh GET /users/ pe 403 milna chahiye
        """
        self.client.force_authenticate(user=self.plain_user)

        url = reverse("users-list")  # GET /api/users/
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_request_is_blocked(self):
        """
        Bina login ke request karne pe 401 milna chahiye
        
        """
        # force_authenticate nahi kiya — anonymous request
        url = reverse("users-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# TEST 3 — Logout (JWT Token Blacklist)


class LogoutTest(APITestCase):

    def setUp(self):
        """
        Ek verified user banate hain aur usse login karake
        JWT tokens lete hain
        """
        self.user = User.objects.create_user(
            email="logout_user@example.com",
            password="logoutpass123",
            is_active=True
        )

        # Login karke tokens lete hain
        login_url = reverse("login")
        response = self.client.post(login_url, {
            "email": "logout_user@example.com",
            "password": "logoutpass123"
        })

        self.access_token = response.data["access"]
        self.refresh_token = response.data["refresh"]

    def test_logout_blacklists_refresh_token(self):
        """
        Logout karne pe 205 aana chahiye aur success message milna chahiye.
        Internally refresh token blacklist ho jaata hai.
        """
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        url = reverse("logout")
        response = self.client.post(url, {"refresh": self.refresh_token})

        # 205 Reset Content = logout successful
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertIn("message", response.data)

    def test_blacklisted_token_cannot_be_reused(self):
        """
        Logout ke baad wahi refresh token dobara use karne ki koshish karo.
        Token refresh endpoint pe 401 ya 400 aana chahiye —
        blacklisted token se naya access token nahi milna chahiye.
        """
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        # Pehle logout
        logout_url = reverse("logout")
        self.client.post(logout_url, {"refresh": self.refresh_token})

        # Ab blacklisted token se naya access token maango
        # simplejwt ka token refresh endpoint use karo
        refresh_url = reverse("token_refresh")  # /api/token/refresh/
        response = self.client.post(refresh_url, {"refresh": self.refresh_token})

        # Blacklisted token se refresh nahi hona chahiye
        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_401_UNAUTHORIZED
        ])