from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Разрешение доступа только для владельца записи (автора) или администратора
    """

    def has_permission(self, request, view):
        return bool(request.user or request.user.is_staff)

    def has_object_permission(self, request, view, obj):
        return (obj.user == request.user) or bool(request.user and request.user.is_staff)
