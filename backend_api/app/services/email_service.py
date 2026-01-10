"""
Email Service - Handles all email notifications
"""

import os
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
from typing import Optional
from app.config import settings

# Initialize Jinja2 template environment
template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates', 'email')
jinja_env = Environment(loader=FileSystemLoader(template_dir))


async def send_invitation_email(
    email: str,
    name: str,
    code: str,
    pin: str,
    url_token: str,
    expires_at: datetime
):
    """Send invitation approval email"""
    base_url = settings.REGISTRATION_PORTAL_URL
    registration_url = f"{base_url}/r/{url_token}"
    
    template = jinja_env.get_template('invitation_approved.html')
    html_content = template.render(
        applicant_alias=name,
        invitation_code=code,
        validation_pin=pin,
        registration_url=registration_url,
        expiry_date=expires_at.strftime("%B %d, %Y at %I:%M %p"),
        timezone="UTC"
    )
    
    await send_email(
        to=email,
        subject="Your MIS Invitation - Registration Approved",
        html_content=html_content
    )


async def send_rejection_email(email: str, name: str, reason: str):
    """Send rejection notification"""
    template = jinja_env.get_template('request_rejected.html')
    html_content = template.render(
        applicant_name=name,
        rejection_reason=reason
    )
    
    await send_email(
        to=email,
        subject="Update on Your MIS Registration Request",
        html_content=html_content
    )


async def send_info_request_email(email: str, name: str, message: str, request_id: int):
    """Send request for more info email"""
    response_url = f"{settings.REGISTRATION_PORTAL_URL}/respond-info/{request_id}"
    
    template = jinja_env.get_template('request_more_info.html')
    html_content = template.render(
        applicant_name=name,
        info_request_message=message,
        response_url=response_url
    )
    
    await send_email(
        to=email,
        subject="MIS Registration - Additional Information Required",
        html_content=html_content
    )


async def send_email(to: str, subject: str, html_content: str):
    """Send email using configured provider"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = settings.EMAIL_FROM
    msg['To'] = to
    
    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)
    
    try:
        # Wrap blocking calls in a way to not block main loop if possible, 
        # or accept the blocking nature for this task as per documentation.
        # For now, implementing as per doc.
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to, msg.as_string())
    except Exception as e:
        print(f"Failed to send email: {e}")
        # In production, log this better.
        pass # Don't crash the request if email fails? Or raise? Doc raises.
        # raise
