from rest_framework.permissions import BasePermission

class HasPermission(BasePermission):
    """
    Check if user has required permission code 
    
    but, Now Dynamic RBAC permission check based on HTTP method
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Superuser bypass
        if request.user.is_superuser:
            return True

        permission_map = getattr(view, "permission_map", None)

        if not permission_map:
            return True

        required_permission = permission_map.get(request.method)

        if not required_permission:
            return True

        return request.user.has_permission(required_permission)

    
    def has_object_permission(self, request, view, obj):

        # Superuser bypass
        if request.user.is_superuser:
            return True

        permission_map = getattr(view, "permission_map", None)

        if not permission_map:
            return False

        required_permission = permission_map.get(request.method)

        if not required_permission:
            return False

        # If user doesn't have base permission → deny
        if not request.user.has_permission(required_permission):
            return False

        # ADMIN role → full object access
        if request.user.role and request.user.role.name == "ADMIN":
            return True

        # Other roles → only their own object
        return obj == request.user
