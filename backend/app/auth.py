"""
Auth — verifies the Supabase-issued JWT sent by the frontend and extracts the
real logged-in user's id. Replaces the old per-router hardcoded user id.

Verifies against Supabase's public JWKS endpoint rather than a shared secret —
this project uses Supabase's new API key format (sb_publishable_/sb_secret_),
which pairs with asymmetric (JWKS-based) JWT signing.
"""

import jwt
from fastapi import Header, HTTPException
from functools import lru_cache
from uuid import UUID

from app.config import settings


@lru_cache()
def _jwks_client() -> jwt.PyJWKClient:
    return jwt.PyJWKClient(f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json")


def get_current_user_id(authorization: str = Header(None)) -> UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
        return UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
