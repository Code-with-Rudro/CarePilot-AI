from typing import Any, Optional
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None


class MessageResponse(BaseModel):
    message: str
    success: bool = True
