from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings
from typing import List

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.ADMIN_EMAIL,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(recipients: List[str], subject: str, body: str):
    """
    Send email asynchronously using FastMail
    """
    try:
        # Check if email is actually configured
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            print(f" [MOCK EMAIL] -------------------------------------------------")
            print(f" To: {recipients}")
            print(f" Subject: {subject}")
            print(f" Body Preview: {body[:100]}...")
            print(f" --------------------------------------------------------------")
            return True

        message = MessageSchema(
            subject=subject,
            recipients=recipients,
            body=body,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"Email sent to {recipients}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
