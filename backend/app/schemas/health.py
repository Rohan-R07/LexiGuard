from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for health check response."""

    status: str = Field(default="ok", description="Current health status of the API")
    service: str = Field(default="lexiguard-api", description="Service identifier name")


class AIHealthResponse(BaseModel):
    """Schema for AI provider health check response without secret exposure."""

    provider: str = Field(..., description="Active AI provider name (e.g., 'openrouter', 'mock')")
    model: str = Field(..., description="Configured model identifier")
    configured: bool = Field(..., description="Whether API credentials are configured")
    status: str = Field(
        ...,
        description="Health status: 'connected' | 'not_configured' | 'invalid_credentials' | 'rate_limited' | 'provider_error' | 'model_error'"
    )
