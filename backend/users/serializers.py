from rest_framework import serializers
from .models import Role,User, Permission, AuditLog
from django.contrib.auth import get_user_model

class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="code"
    )

    class Meta:
        model = Role
        fields = ["id", "name", "permissions"]
        
class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active', 'is_staff']

class  RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email','password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="code"
    )

    class Meta:
        model = Role
        fields = ["id", "name", "permissions"]

        
        
class AssignRoleSerializer(serializers.Serializer):
    role_id = serializers.IntegerField()
    
class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source="actor.email", read_only=True)
    target_email = serializers.CharField(source="target_user.email", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor_email",
            "target_email",
            "action",
            "timestamp",
        ]


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)