import os
import pytest

# Ensure tests run with safe local mock provider so tests don't make real outbound calls
os.environ["SMS_DEV_MODE"] = "true"
os.environ["SMS_PROVIDER"] = "mock"
