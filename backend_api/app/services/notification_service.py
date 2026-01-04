from app.config import settings
from app.core.email import send_email

async def send_admin_notification(subject: str, message: str) -> bool:
    """
    Send email notification to admin
    Called when new user registers
    """
    return await send_email([settings.ADMIN_EMAIL], subject, message)

async def notify_user_approval(email: str, username: str) -> bool:
    """
    Send email to user when their registration is approved
    """
    subject = "Your Registration Has Been Approved"
    message = f"""
    <h2>Hello {username},</h2>
    <p>Your registration has been approved! You can now use your account to login to our services.</p>
    <p>You can now scan QR codes with your mobile app to authenticate.</p>
    <br>
    <p>Welcome aboard!</p>
    """
    return await send_email([email], subject, message)


async def send_user_notification(email: str, subject: str, message: str) -> bool:
    """
    Send email notification to a specific user
    Generic function for sending any email to users
    """
    return await send_email([email], subject, message)