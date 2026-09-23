#!/usr/bin/env python3
"""
LexiGuard — Safe AI Provider Diagnostic Script.
Performs a minimal authenticated check to OpenRouter without exposing secrets.
"""
import sys
import os
import asyncio
import httpx

# Add backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings


async def verify_provider():
    provider = settings.LLM_PROVIDER
    api_key = settings.OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY")
    base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
    model = settings.OPENROUTER_MODEL or settings.LLM_MODEL or "meta-llama/llama-3.3-70b-instruct"

    print("========================================")
    print("LexiGuard AI Provider Diagnostic Check")
    print("========================================")
    print(f"Provider: OpenRouter ({provider})")
    print(f"Model: {model}")
    print(f"Base URL: {base_url}")
    print(f"API Key Status: {'Configured' if api_key else 'MISSING'}")

    if not api_key:
        print("Connectivity: FAILED")
        print("Error: OPENROUTER_API_KEY_MISSING")
        print("========================================")
        return False

    url = f"{base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": settings.FRONTEND_URL or "http://localhost:5173",
        "X-Title": "LexiGuard Diagnostic",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Reply with the single word: OK"}
        ],
        "max_tokens": 10,
        "temperature": 0.0,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            status_code = response.status_code

            if status_code == 200:
                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                print("Connectivity: SUCCESS")
                print(f"HTTP Status: {status_code}")
                print(f"Response: {content}")
                print("Status Code: OPENROUTER_API_KEY_VALID_AND_REQUEST_WORKING")
                print("========================================")
                return True
            elif status_code == 401:
                print("Connectivity: FAILED")
                print(f"HTTP Status: {status_code}")
                print("Error: OPENROUTER_API_KEY_INVALID_OR_UNAUTHORIZED")
            elif status_code == 402:
                print("Connectivity: FAILED")
                print(f"HTTP Status: {status_code}")
                print("Error: OPENROUTER_ACCOUNT_OR_CREDITS_ISSUE")
            elif status_code == 403:
                print("Connectivity: FAILED")
                print(f"HTTP Status: {status_code}")
                print("Error: OPENROUTER_ACCESS_FORBIDDEN")
            elif status_code == 404:
                print("Connectivity: FAILED")
                print(f"HTTP Status: {status_code}")
                print("Error: INVALID_ENDPOINT_OR_MODEL")
            elif status_code == 429:
                print("Connectivity: FAILED")
                print(f"HTTP Status: {status_code}")
                print("Error: RATE_LIMITED")
            elif 500 <= status_code < 600:
                print("Connectivity: FAILED")
                print(f"HTTP Status: {status_code}")
                print("Error: PROVIDER_OR_NETWORK_ERROR")
            else:
                print("Connectivity: FAILED")
                print(f"HTTP Status: {status_code}")
                print(f"Error: UNEXPECTED_STATUS_{status_code}")

            print("========================================")
            return False

    except httpx.ConnectError:
        print("Connectivity: FAILED")
        print("Error: NETWORK_CONNECTIVITY_ERROR")
        print("========================================")
        return False
    except httpx.TimeoutException:
        print("Connectivity: FAILED")
        print("Error: REQUEST_TIMEOUT")
        print("========================================")
        return False
    except Exception as e:
        print("Connectivity: FAILED")
        print(f"Error: EXCEPTION_{type(e).__name__}")
        print("========================================")
        return False


if __name__ == "__main__":
    success = asyncio.run(verify_provider())
    sys.exit(0 if success else 1)
