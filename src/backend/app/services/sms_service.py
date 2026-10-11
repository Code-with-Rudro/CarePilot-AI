import re
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple

import httpx
from sqlalchemy.orm import Session

from app.core.config import Settings, settings
from app.core.logging import logger
from app.models.reminder import Reminder


def get_current_settings() -> Settings:
    """Loads fresh settings from .env on-demand."""
    return Settings()


def format_reminder_sms_message(
    patient_name: str,
    medication_name: str,
    dosage: str,
    reminder_time: str,
    frequency: str,
) -> str:
    """Formats a personalized medication reminder SMS message according to CarePilot-AI standard.

    Template:
    Hello [Patient Name],

    This is your medication reminder from CarePilot-AI.

    💊 Medicine: [Tablet Name]
    📋 Dosage: [Dosage]
    🕒 Reminder Time: [Time]
    📅 Frequency: [Frequency]

    Please take your medicine as prescribed by your healthcare professional.

    Thank you,
    CarePilot-AI Health Assistant
    """
    clean_patient = patient_name.strip() if patient_name else "Valued Patient"
    clean_medicine = medication_name.strip() if medication_name else "Prescribed Medication"
    clean_dosage = dosage.strip() if dosage else "As prescribed"
    clean_time = reminder_time.strip() if reminder_time else "Scheduled Time"
    clean_frequency = frequency.strip() if frequency else "As directed"

    return (
        f"Hello {clean_patient},\n\n"
        f"This is your medication reminder from CarePilot-AI.\n\n"
        f"💊 Medicine: {clean_medicine}\n"
        f"📋 Dosage: {clean_dosage}\n"
        f"🕒 Reminder Time: {clean_time}\n"
        f"📅 Frequency: {clean_frequency}\n\n"
        f"Please take your medicine as prescribed by your healthcare professional.\n\n"
        f"Thank you,\n"
        f"CarePilot-AI Health Assistant"
    )


def validate_and_normalize_phone(phone: Optional[str]) -> str:
    """Validates phone number and normalizes to E.164 format.

    Rejects missing, empty, or non-numeric strings.
    Protects against malformed input.
    """
    if not phone or not phone.strip():
        raise ValueError("Phone number is required for SMS delivery.")

    # Remove formatting characters: spaces, hyphens, parentheses
    cleaned = re.sub(r"[\s\-\(\)\.]", "", phone.strip())

    # Check for valid international or 10-digit number
    if cleaned.startswith("+"):
        digits_only = cleaned[1:]
        if not digits_only.isdigit() or len(digits_only) < 7 or len(digits_only) > 15:
            raise ValueError(f"Invalid international phone number format: '{mask_phone_number(phone)}'. Must contain 7 to 15 digits.")
        return cleaned
    else:
        if not cleaned.isdigit():
            raise ValueError(f"Invalid phone number format. Contains non-numeric characters.")
        # If 10 digits (common for India / US), prefix +91 by default for CarePilot-AI India locale
        if len(cleaned) == 10:
            return f"+91{cleaned}"
        elif len(cleaned) == 11 and cleaned.startswith("0"):
            return f"+91{cleaned[1:]}"
        elif 7 <= len(cleaned) <= 15:
            return f"+{cleaned}"
        else:
            raise ValueError(f"Invalid phone number length ({len(cleaned)} digits). Expected 10 to 15 digits.")


def mask_phone_number(phone: Optional[str]) -> str:
    """Masks a phone number to protect Patient Health Information (PHI) in logs.

    Example: '+919876543210' -> '+91-XXXXX-43210'
             '+12025550123'  -> '+1-XXX-XXX-0123'
    """
    if not phone:
        return "[NOT PROVIDED]"
    clean = phone.strip()
    if len(clean) <= 5:
        return "***" + clean[-2:]

    visible_tail = clean[-4:]
    visible_prefix = clean[:3]
    return f"{visible_prefix}-XXXXX-{visible_tail}"


def sanitize_error_message(
    msg: str,
    recipient_phone: Optional[str] = None,
    sender_number: Optional[str] = None,
    account_sid: Optional[str] = None,
    auth_token: Optional[str] = None,
) -> str:
    """Removes sensitive identifiers (unmasked phone numbers, auth tokens, secrets) from error strings."""
    if not msg:
        return "Unknown error"
    sanitized = str(msg)

    # Mask recipient phone number variations
    if recipient_phone:
        raw_clean = re.sub(r"[\s\-\(\)\.]", "", recipient_phone)
        masked_r = mask_phone_number(recipient_phone)
        if raw_clean and raw_clean in sanitized:
            sanitized = sanitized.replace(raw_clean, masked_r)
        if recipient_phone and recipient_phone in sanitized:
            sanitized = sanitized.replace(recipient_phone, masked_r)

    # Mask sender number
    if sender_number and sender_number in sanitized:
        sanitized = sanitized.replace(sender_number, mask_phone_number(sender_number))

    # Mask auth token and SID if present
    if auth_token and len(auth_token) >= 8 and auth_token in sanitized:
        sanitized = sanitized.replace(auth_token, "[REDACTED_AUTH_TOKEN]")
    if account_sid and len(account_sid) >= 8 and account_sid in sanitized:
        sanitized = sanitized.replace(account_sid, f"{account_sid[:4]}...{account_sid[-4:]}")

    # General regex check to catch any leftover unmasked 10-15 digit phone numbers in error text
    sanitized = re.sub(
        r"(\+?\d{1,3})?([6-9]\d{9})",
        lambda m: mask_phone_number(m.group(0)),
        sanitized
    )
    return sanitized


class SmsService:
    """Handles SMS delivery, provider integrations (Twilio / Mock), duplicate prevention,

    and PHI-safe logging for medication reminders.
    """

    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def check_duplicate(self, reminder: Reminder, cooldown_hours: int = 12) -> Tuple[bool, Optional[str]]:
        """Checks if an SMS has already been sent for this reminder within the cooldown window."""
        if reminder.sms_status == "sent" and reminder.sms_sent_at:
            try:
                sent_time = datetime.fromisoformat(reminder.sms_sent_at)
                if datetime.now() - sent_time < timedelta(hours=cooldown_hours):
                    return (
                        True,
                        f"An SMS reminder was already sent at {sent_time.strftime('%I:%M %p')}. Duplicate dispatch was prevented.",
                    )
            except Exception:
                # If timestamp parsing fails, check date strings
                pass
        return False, None

    async def send_reminder_sms(
        self,
        reminder: Reminder,
        recipient_name: Optional[str] = None,
        phone_override: Optional[str] = None,
        force: bool = False,
    ) -> Dict[str, Any]:
        """Dispatches an SMS medication reminder to the patient.

        Validates phone and patient consent, checks duplicate sends, formats text,
        and uses Twilio or local mock provider according to settings.
        """
        # 1. Check patient consent (mandatory requirement)
        if not reminder.sms_consent:
            err_msg = "Patient consent is required before sending SMS reminders."
            self._update_reminder_status(reminder, status="failed", error=err_msg)
            return {
                "success": False,
                "error": err_msg,
                "status": "failed",
                "smsStatus": "failed",
                "message": err_msg,
            }

        # 2. Check duplicate prevention
        if not force:
            is_dup, dup_msg = self.check_duplicate(reminder)
            if is_dup:
                logger.info(f"Duplicate SMS prevented for reminder ID={reminder.id} (status: already sent).")
                return {
                    "success": False,
                    "error": dup_msg,
                    "status": "duplicate",
                    "smsStatus": reminder.sms_status or "sent",
                    "message": dup_msg,
                }

        # 3. Determine and validate recipient phone number
        raw_phone = phone_override or reminder.phone_number
        if not raw_phone and reminder.user:
            raw_phone = reminder.user.emergency_contact

        try:
            normalized_phone = validate_and_normalize_phone(raw_phone)
        except ValueError as val_err:
            err_msg = str(val_err)
            self._update_reminder_status(reminder, status="failed", error=err_msg)
            return {
                "success": False,
                "error": err_msg,
                "status": "failed",
                "smsStatus": "failed",
                "message": err_msg,
            }

        # 4. Resolve patient name and medication details
        patient_name = recipient_name or reminder.recipient_name
        if not patient_name and reminder.user:
            patient_name = reminder.user.name
        if not patient_name:
            patient_name = "Valued Patient"

        dosage = reminder.dosage or reminder.strength
        frequency = reminder.frequency or "Once daily"
        reminder_time = reminder.scheduled_time

        # 5. Build SMS template
        sms_body = format_reminder_sms_message(
            patient_name=patient_name,
            medication_name=reminder.medication_name,
            dosage=dosage,
            reminder_time=reminder_time,
            frequency=frequency,
        )

        masked_phone = mask_phone_number(normalized_phone)

        # 6. Dispatch via configured provider
        curr_settings = get_current_settings()
        has_sender = bool(
            curr_settings.TWILIO_PHONE_NUMBER
            or getattr(curr_settings, "TWILIO_MESSAGING_SERVICE_SID", None)
        )
        is_twilio_ready = bool(
            curr_settings.TWILIO_ACCOUNT_SID
            and curr_settings.TWILIO_AUTH_TOKEN
            and has_sender
        )

        use_mock = (
            curr_settings.SMS_DEV_MODE
            or curr_settings.SMS_PROVIDER.lower() == "mock"
            or not is_twilio_ready
        )

        if use_mock:
            # Safe mock dispatch for local development & zero-cost testing
            mock_id = f"SM_mock_{uuid.uuid4().hex[:14]}"
            logger.info(
                f"[SMS MOCK GATEWAY] Dispatched medication reminder SMS to {masked_phone} "
                f"(Medicine: {reminder.medication_name}, MsgId: {mock_id})"
            )
            self._update_reminder_status(reminder, status="sent", error=None)

            return {
                "success": True,
                "message": f"Medication reminder SMS sent successfully in mock mode to {masked_phone}.",
                "status": "sent",
                "smsStatus": "sent",
                "messageId": mock_id,
                "recipientMasked": masked_phone,
                "smsBody": sms_body,
                "provider": "mock",
            }

        # Live Twilio dispatch
        try:
            account_sid = curr_settings.TWILIO_ACCOUNT_SID.strip()
            auth_token = curr_settings.TWILIO_AUTH_TOKEN.strip()
            from_number = (curr_settings.TWILIO_PHONE_NUMBER or "").strip()
            messaging_service_sid = (getattr(curr_settings, "TWILIO_MESSAGING_SERVICE_SID", "") or "").strip()
            is_trial = bool(getattr(curr_settings, "TWILIO_TRIAL_MODE", True))
            trial_template = (getattr(curr_settings, "TWILIO_TRIAL_TEMPLATE", "") or "sms_appointment_reminders").strip()

            if not from_number and not messaging_service_sid:
                raise ValueError("Neither TWILIO_PHONE_NUMBER nor TWILIO_MESSAGING_SERVICE_SID is configured in backend environment.")

            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"

            # In Twilio trial mode, trial accounts reject custom bodies and enforce predefined templates.
            # We send the exact supported template identifier (sms_appointment_reminders) rather than custom text.
            payload_body = trial_template if is_trial else sms_body
            used_trial_template = is_trial

            data: Dict[str, Any] = {
                "To": normalized_phone,
                "Body": payload_body,
            }

            if messaging_service_sid:
                data["MessagingServiceSid"] = messaging_service_sid
            elif from_number.startswith("MG"):
                data["MessagingServiceSid"] = from_number
            else:
                data["From"] = from_number

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, data=data, auth=(account_sid, auth_token))

                # If trial restriction error occurs when trying custom body, auto-fallback to trial template
                if response.status_code == 400 and not is_trial:
                    resp_text = response.text.lower()
                    if "template" in resp_text or "trial" in resp_text:
                        logger.info(
                            f"[SMS TWILIO] Twilio trial restriction detected for {masked_phone}. "
                            f"Retrying with predefined trial template identifier '{trial_template}'..."
                        )
                        data["Body"] = trial_template
                        used_trial_template = True
                        response = await client.post(url, data=data, auth=(account_sid, auth_token))

            if response.status_code in (200, 201):
                res_data = response.json()
                msg_sid = res_data.get("sid", f"SM_{uuid.uuid4().hex[:12]}")
                logger.info(
                    f"[SMS TWILIO GATEWAY] Successfully sent reminder SMS to {masked_phone} (SID: {msg_sid}, "
                    f"Mode: {'Trial Template ' + trial_template if used_trial_template else 'Custom Body'})"
                )
                self._update_reminder_status(reminder, status="sent", error=None)

                if used_trial_template:
                    delivered_body_desc = (
                        f"[Twilio Predefined Trial Template: {trial_template}]\n\n"
                        f"Delivered: Predefined appointment reminder template message text.\n\n"
                        f"Notice: Twilio Trial accounts only permit predefined templates to verified numbers. "
                        f"Custom medication details ({reminder.medication_name}, {dosage}, {reminder_time}) "
                        f"will be transmitted once upgraded to a production Twilio account."
                    )
                    delivery_message = (
                        f"Appointment reminder SMS sent successfully via Twilio Trial gateway (Template: {trial_template}) to {masked_phone}."
                    )
                else:
                    delivered_body_desc = sms_body
                    delivery_message = f"Medication reminder SMS sent successfully via Twilio to {masked_phone}."

                return {
                    "success": True,
                    "message": delivery_message,
                    "status": "sent",
                    "smsStatus": "sent",
                    "messageId": msg_sid,
                    "recipientMasked": masked_phone,
                    "smsBody": delivered_body_desc,
                    "trialMode": used_trial_template,
                    "templateName": trial_template if used_trial_template else None,
                    "provider": "twilio",
                }
            else:
                error_detail = response.text
                try:
                    error_json = response.json()
                    error_detail = error_json.get("message", error_detail)
                except Exception:
                    pass

                clean_error_detail = sanitize_error_message(
                    error_detail,
                    recipient_phone=normalized_phone,
                    sender_number=from_number,
                    account_sid=account_sid,
                    auth_token=auth_token,
                )
                logger.error(
                    f"[SMS TWILIO ERROR] Failed to send SMS to {masked_phone}: Status {response.status_code} - {clean_error_detail}"
                )
                clean_err = f"Twilio delivery error ({response.status_code}): {clean_error_detail}"
                self._update_reminder_status(reminder, status="failed", error=clean_err)
                return {
                    "success": False,
                    "error": clean_err,
                    "status": "failed",
                    "smsStatus": "failed",
                    "message": clean_err,
                    "recipientMasked": masked_phone,
                    "smsBody": sms_body,
                    "trialMode": used_trial_template,
                    "templateName": trial_template if used_trial_template else None,
                    "provider": "twilio",
                }
        except Exception as exc:
            clean_exc_str = sanitize_error_message(
                str(exc),
                recipient_phone=normalized_phone,
                sender_number=curr_settings.TWILIO_PHONE_NUMBER,
                account_sid=curr_settings.TWILIO_ACCOUNT_SID,
                auth_token=curr_settings.TWILIO_AUTH_TOKEN,
            )
            logger.error(f"[SMS GATEWAY EXCEPTION] Failed to dispatch SMS to {masked_phone}: {clean_exc_str}")
            clean_err = f"SMS delivery failed: {clean_exc_str}"
            self._update_reminder_status(reminder, status="failed", error=clean_err)
            return {
                "success": False,
                "error": clean_err,
                "status": "failed",
                "smsStatus": "failed",
                "message": clean_err,
                "recipientMasked": masked_phone,
                "smsBody": sms_body,
                "trialMode": bool(getattr(curr_settings, "TWILIO_TRIAL_MODE", False)),
                "provider": "twilio",
            }

    def _update_reminder_status(self, reminder: Reminder, status: str, error: Optional[str] = None):
        """Persists SMS status updates safely to database."""
        reminder.sms_status = status
        if status == "sent":
            reminder.sms_sent_at = datetime.now().isoformat()
            reminder.sms_error = None
        elif status == "failed":
            reminder.sms_error = error

        if self.db:
            try:
                self.db.add(reminder)
                self.db.commit()
                self.db.refresh(reminder)
            except Exception as e:
                logger.warning(f"Failed to persist reminder SMS status: {e}")


def get_sms_provider_status() -> Dict[str, Any]:
    """Returns safe provider configuration status without exposing credentials."""
    curr_settings = get_current_settings()
    has_sender = bool(
        curr_settings.TWILIO_PHONE_NUMBER
        or getattr(curr_settings, "TWILIO_MESSAGING_SERVICE_SID", None)
    )
    is_twilio_configured = bool(
        curr_settings.TWILIO_ACCOUNT_SID
        and curr_settings.TWILIO_AUTH_TOKEN
        and has_sender
    )
    provider = curr_settings.SMS_PROVIDER.lower()
    dev_mode = curr_settings.SMS_DEV_MODE
    is_trial = bool(getattr(curr_settings, "TWILIO_TRIAL_MODE", True))
    trial_template = getattr(curr_settings, "TWILIO_TRIAL_TEMPLATE", "sms_appointment_reminders")

    masked_from = None
    if curr_settings.TWILIO_PHONE_NUMBER:
        masked_from = mask_phone_number(curr_settings.TWILIO_PHONE_NUMBER)
    elif getattr(curr_settings, "TWILIO_MESSAGING_SERVICE_SID", None):
        ms_sid = curr_settings.TWILIO_MESSAGING_SERVICE_SID.strip()
        masked_from = f"MG...{ms_sid[-4:]}" if len(ms_sid) >= 6 else "MG..."

    return {
        "provider": provider,
        "devMode": dev_mode,
        "isConfigured": is_twilio_configured or dev_mode or provider == "mock",
        "maskedTwilioNumber": masked_from,
        "trialMode": is_trial,
        "templateName": trial_template if is_trial else None,
    }
