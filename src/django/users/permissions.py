"""Permission classes and helpers for limiting access to resources/actions."""

from rest_framework import permissions


class IsAuthenticatedOrCreate(permissions.BasePermission):
    """Allow anonymous user creation for registration; other user requests must be authenticated."""

    ALLOWED_ANONYMOUS_ACTIONS = ('create')

    def has_permission(self, request, view):
        """Allow access to anonymous create or authenticated other actions."""
        if view.action and view.action in self.ALLOWED_ANONYMOUS_ACTIONS:
            return True

        return request.user and request.user.is_authenticated()
