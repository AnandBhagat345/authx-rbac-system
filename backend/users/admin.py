from django.contrib import admin
from .models import User, Role, Permission , AuditLog

# Register your models here.

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "description")
    search_fields = ("code",)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    filter_horizontal = ("permissions",)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "role", "is_active")
    search_fields = ("email",)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("actor", "target_user", "action", "timestamp")
    ordering = ("-timestamp",)