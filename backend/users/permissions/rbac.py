from rest_framework.permissions import BasePermission

class HasPermission(BasePermission):
    """
    Check if user has required permission code
    """

    def has_permission(self, request, view):
        required_permission = getattr(view, "required_permission", None)

        if not required_permission:
            return True  # agar view ne kuch nahi bola, allow

        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.has_permission(required_permission)




