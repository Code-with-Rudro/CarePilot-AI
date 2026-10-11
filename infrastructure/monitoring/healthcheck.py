#!/usr/bin/env python3
"""CarePilot-AI Comprehensive Healthcheck Script
Validates:
1. Backend root and health endpoint responses
2. Database connectivity
3. API routes responsiveness
"""
import os
import sys
import time
import urllib.request
import json

def check_endpoint(url: str, description: str, timeout: int = 5) -> bool:
    print(f"[*] Checking {description}: {url}...")
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "CarePilot-Healthcheck/1.0", "Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            status = response.getcode()
            body = response.read().decode("utf-8")
            if 200 <= status < 300:
                print(f"    [+] {description} OK (Status {status}): {body[:120]}")
                return True
            else:
                print(f"    [-] {description} returned non-2xx status: {status}")
                return False
    except Exception as exc:
        print(f"    [-] {description} failed: {exc}")
        return False

def main():
    base_url = os.environ.get("BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
    print(f"=== CarePilot-AI Health Verification (Target: {base_url}) ===")

    checks = [
        (f"{base_url}/", "Backend Root Endpoint"),
        (f"{base_url}/health", "Backend Health Endpoint"),
        (f"{base_url}/api/v1/health", "API v1 Health Endpoint"),
        (f"{base_url}/docs", "Swagger API Documentation"),
        (f"{base_url}/api/v1/reminders/sms-config", "SMS Service Status"),
    ]

    success = True
    for url, desc in checks:
        if not check_endpoint(url, desc):
            success = False

    if success:
        print("\n[SUCCESS] All CarePilot-AI health checks passed successfully.")
        sys.exit(0)
    else:
        print("\n[FAILURE] One or more health checks failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
