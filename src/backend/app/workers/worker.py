"""CarePilot-AI Background Worker
Periodically checks for pending scheduled reminders and tasks.
"""
import asyncio
import os
import time
from app.core.logging import logger
from app.db.session import SessionLocal
from app.services.sms_service import SmsService
from app.repositories.reminder_repository import ReminderRepository

async def run_worker_loop():
    logger.info("CarePilot-AI Background Worker started.")
    poll_interval = int(os.environ.get("WORKER_POLL_INTERVAL_SECONDS", "60"))
    while True:
        try:
            db = SessionLocal()
            try:
                repo = ReminderRepository(db)
                sms_service = SmsService(db)
                pending = repo.get_due_reminders() if hasattr(repo, "get_due_reminders") else []
                if pending:
                    logger.info(f"Worker found {len(pending)} due reminders to process.")
                    for reminder in pending:
                        if getattr(reminder, "sms_enabled", False) and getattr(reminder, "sms_consent", False):
                            await sms_service.send_reminder_sms(reminder=reminder)
            finally:
                db.close()
        except Exception as exc:
            logger.warning(f"Error in worker cycle: {exc}")
        await asyncio.sleep(poll_interval)

if __name__ == "__main__":
    try:
        asyncio.run(run_worker_loop())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Worker stopped cleanly.")
