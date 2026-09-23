from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for health check response."""

    status: str = Field(default="ok", description="Current health status of the API")
    service: str = Field(default="lexiguard-api", description="Service identifier name")
