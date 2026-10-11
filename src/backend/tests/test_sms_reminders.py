import pytest
from app.models.reminder import Reminder
from app.models.user import User
from app.services.sms_service import (
    format_reminder_sms_message,
    mask_phone_number,
    validate_and_normalize_phone,
    SmsService,
    get_sms_provider_status,
)


def test_sms_template_format():
    """Verify exact SMS message format requested for CarePilot-AI."""
    sms = format_reminder_sms_message(
        patient_name="John Doe",
        medication_name="Metoprolol 25mg",
        dosage="1 Tablet",
        reminder_time="08:00 AM",
        frequency="Once daily",
    )

    expected = (
        "Hello John Doe,\n\n"
        "This is your medication reminder from CarePilot-AI.\n\n"
        "💊 Medicine: Metoprolol 25mg\n"
        "📋 Dosage: 1 Tablet\n"
        "🕒 Reminder Time: 08:00 AM\n"
        "📅 Frequency: Once daily\n\n"
        "Please take your medicine as prescribed by your healthcare professional.\n\n"
        "Thank you,\n"
        "CarePilot-AI Health Assistant"
    )

    assert sms == expected


def test_phone_number_validation_and_normalization():
    """Test valid and invalid phone numbers."""
    # Standard Indian 10 digits
    assert validate_and_normalize_phone("9876543210") == "+919876543210"
    # Formatted Indian phone with spaces & country code
    assert validate_and_normalize_phone("+91 98765 43210") == "+919876543210"
    # US / International E.164
    assert validate_and_normalize_phone("+1-202-555-0123") == "+12025550123"

    # Missing or empty
    with pytest.raises(ValueError, match="required"):
        validate_and_normalize_phone("")

    # Invalid non-numeric
    with pytest.raises(ValueError, match="format|invalid"):
        validate_and_normalize_phone("not-a-phone-number")

    # Too short
    with pytest.raises(ValueError, match="length|digits"):
        validate_and_normalize_phone("12345")


def test_phi_safe_phone_masking():
    """Ensure phone numbers are masked to protect Patient Health Information."""
    masked_in = mask_phone_number("+919876543210")
    assert "XXXXX" in masked_in
    assert "9876" not in masked_in  # Middle digits masked
    assert masked_in.endswith("3210")

    masked_us = mask_phone_number("+12025550123")
    assert "XXXXX" in masked_us
    assert masked_us.endswith("0123")


@pytest.mark.asyncio
async def test_sms_requires_patient_consent():
    """Consent is strictly required before sending any SMS reminders."""
    service = SmsService()
    reminder = Reminder(
        id="rem-test-1",
        medication_name="Metoprolol 25mg",
        strength="25mg",
        dosage="1 Tablet",
        scheduled_time="08:00 AM",
        frequency="Once daily",
        timing_with_food="After breakfast",
        phone_number="+919876543210",
        sms_consent=False,  # NO CONSENT
        sms_enabled=True,
    )

    result = await service.send_reminder_sms(reminder)
    assert result["success"] is False
    assert "consent" in result["error"].lower()
    assert result["status"] == "failed"


@pytest.mark.asyncio
async def test_sms_mock_delivery_success():
    """In development/mock mode, SMS returns success with mock message ID and formatted body."""
    service = SmsService()
    user = User(name="Rudro Sharma", emergency_contact="+919876543210")
    reminder = Reminder(
        id="rem-test-2",
        medication_name="Pantoprazole 40mg",
        strength="40mg",
        dosage="1 Capsule",
        scheduled_time="07:30 AM",
        frequency="Once daily (Empty stomach)",
        timing_with_food="Before food",
        phone_number="+919876543210",
        sms_consent=True,
        sms_enabled=True,
        sms_status="scheduled",
    )
    reminder.user = user

    result = await service.send_reminder_sms(reminder)
    assert result["success"] is True
    assert result["status"] == "sent"
    assert result["provider"] == "mock"
    assert result["messageId"].startswith("SM_mock_")
    assert "Pantoprazole 40mg" in result["smsBody"]
    assert "Rudro Sharma" in result["smsBody"]


@pytest.mark.asyncio
async def test_sms_duplicate_prevention():
    """Duplicate SMS sent within cooldown window should be prevented."""
    service = SmsService()
    reminder = Reminder(
        id="rem-test-3",
        medication_name="Metformin 500mg",
        strength="500mg",
        dosage="1 Tablet",
        scheduled_time="01:00 PM",
        frequency="Twice daily",
        timing_with_food="After lunch",
        phone_number="+919876543210",
        sms_consent=True,
        sms_enabled=True,
        sms_status="sent",
        sms_sent_at="2026-10-11T00:15:00",  # Just sent 15 minutes ago
    )

    result = await service.send_reminder_sms(reminder, force=False)
    assert result["success"] is False
    assert result["status"] == "duplicate"
    assert "already sent" in result["error"].lower()

    # Can be overridden if forced (e.g. user manually clicks test send)
    force_result = await service.send_reminder_sms(reminder, force=True)
    assert force_result["success"] is True


def test_sms_provider_status():
    """Test safe provider configuration status."""
    status_info = get_sms_provider_status()
    assert "provider" in status_info
    assert "devMode" in status_info
    assert "isConfigured" in status_info
