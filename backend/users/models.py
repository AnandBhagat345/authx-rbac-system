from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", False)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)


class Permission(models.Model):
    code = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.code


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    permissions = models.ManyToManyField(
        Permission,
        related_name="roles",
        blank=True
    )

    def __str__(self):
        return self.name
    

class User(AbstractUser):
    username = None  # we don't want username
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True,  null=True,
    blank=True)
    is_phone_verified = models.BooleanField(default=False)
    
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    
    def has_permission(self, permission_code: str) -> bool:
        """
        Check if user has a specific permission via role
        """

        # superuser bypass
        if self.is_superuser:
            return True
        
        # If no role assigned
        if not self.role:
            return False

        # check role permissions
        return self.role.permissions.filter(code=permission_code).exists()

    def __str__(self):
        return self.email
    
    
class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)
    
    
class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="performed_actions"
    )

    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="targeted_actions"
    )

    action = models.CharField(max_length=255)

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actor} -> {self.action} -> {self.target_user}"
    
    
    
    
