"""Custom exception classes for Forge."""


class ForgeException(Exception):
    """Base exception for Forge application."""
    pass


class NotFoundError(ForgeException):
    """Raised when a requested resource is not found."""
    pass


class ValidationError(ForgeException):
    """Raised when business-logic validation fails."""
    pass


class AuthorizationError(ForgeException):
    """Raised when a user is not authorised to access a resource."""
    pass
