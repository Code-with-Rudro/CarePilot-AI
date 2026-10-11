"""Lightweight schema migration helper for SQLite.
Ensures new columns are safely added to existing tables without data loss.
"""
from sqlalchemy import inspect, text
from app.core.logging import logger


def migrate_schema(engine):
    """Inspects existing SQLite tables and adds any missing columns."""
    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        if "reminders" not in table_names:
            return

        existing_columns = {col["name"] for col in inspector.get_columns("reminders")}

        columns_to_add = [
            ("dosage", "VARCHAR(100)"),
            ("frequency", "VARCHAR(100) DEFAULT 'Once daily'"),
            ("phone_number", "VARCHAR(50)"),
            ("recipient_name", "VARCHAR(255)"),
            ("sms_enabled", "BOOLEAN DEFAULT 1"),
            ("sms_consent", "BOOLEAN DEFAULT 0"),
            ("sms_status", "VARCHAR(50) DEFAULT 'scheduled'"),
            ("sms_sent_at", "VARCHAR(50)"),
            ("sms_error", "VARCHAR(255)"),
        ]

        with engine.begin() as conn:
            for col_name, col_def in columns_to_add:
                if col_name not in existing_columns:
                    logger.info(f"Adding column '{col_name}' to reminders table...")
                    conn.execute(text(f"ALTER TABLE reminders ADD COLUMN {col_name} {col_def}"))
    except Exception as e:
        logger.warning(f"Schema migration warning: {e}")
