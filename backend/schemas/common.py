from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")

class PaginationResponse(BaseModel):
    page: int
    limit: int
    total: int
    pages: int

class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T]
    pagination: PaginationResponse

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str
    details: Optional[List] = None
