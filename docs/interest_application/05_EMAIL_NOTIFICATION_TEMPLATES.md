# 📧 Email Notification Templates

> **Document:** 05_EMAIL_NOTIFICATION_TEMPLATES.md  
> **Created:** 2026-01-10  
> **Priority:** 🟡 High

---

## 1. Invitation Approval Email

### Template: `invitation_approved.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border: 3px solid #28282B; }
    .header { background: #28282B; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .credentials { background: #f8f9fa; border: 2px solid #28282B; padding: 20px; margin: 20px 0; text-align: center; }
    .code { font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #28282B; }
    .pin { font-family: monospace; font-size: 20px; color: #28282B; margin-top: 10px; }
    .btn { display: inline-block; background: #28282B; color: white; padding: 15px 40px; text-decoration: none; margin: 20px 0; font-weight: bold; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MIS REGISTRATION</h1>
    </div>
    
    <div class="content">
      <h2>Howfa, {{applicant_alias}}!</h2>
      
      <p>Congratulations! Your invitation has been approved. You can now start registration as a member.</p>
      
      <p>Kindly follow the instructions below and use the provided details to complete your registration.</p>
      
      <div class="warning">
        <strong>⚠️ IMPORTANT TIME LIMITS:</strong>
        <ul>
          <li>This invitation is valid for <strong>24 hours</strong> from now.</li>
          <li>Once you click the registration link, you have <strong>5 hours</strong> to complete the form.</li>
          <li>The link can only be used once.</li>
        </ul>
      </div>
      
      <div class="credentials">
        <p style="margin: 0 0 10px 0; color: #666;">YOUR INVITATION CODE</p>
        <div class="code">{{invitation_code}}</div>
        
        <p style="margin: 20px 0 10px 0; color: #666;">YOUR VALIDATION PIN</p>
        <div class="pin">{{validation_pin}}</div>
      </div>
      
      <p style="text-align: center;">
        <a href="{{registration_url}}" class="btn">START REGISTRATION</a>
      </p>
      
      <p style="font-size: 12px; color: #666;">
        If the button doesn't work, copy and paste this link in your browser:<br>
        <code>{{registration_url}}</code>
      </p>
      
      <p>
        <strong>Expires:</strong> {{expiry_date}}<br>
        <strong>Timezone:</strong> {{timezone}}
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated message from MIS. Do not reply to this email.</p>
      <p>If you did not request this invitation, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Request Rejection Email

### Template: `request_rejected.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border: 3px solid #28282B; }
    .header { background: #28282B; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .reason-box { background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MIS REGISTRATION</h1>
    </div>
    
    <div class="content">
      <h2>Hello, {{applicant_name}}</h2>
      
      <p>Thank you for your interest in joining MIS.</p>
      
      <p>After careful review of your application, we regret to inform you that we are unable to approve your registration request at this time.</p>
      
      <div class="reason-box">
        <strong>Reason:</strong><br>
        {{rejection_reason}}
      </div>
      
      <p>If you believe this decision was made in error or would like to provide additional information, please contact our support team.</p>
      
      <p>Thank you for your understanding.</p>
      
      <p>Best regards,<br>The MIS Team</p>
    </div>
    
    <div class="footer">
      <p>This is an automated message from MIS.</p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Request More Information Email

### Template: `request_more_info.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border: 3px solid #28282B; }
    .header { background: #28282B; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .info-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; background: #28282B; color: white; padding: 15px 40px; text-decoration: none; margin: 20px 0; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MIS REGISTRATION</h1>
    </div>
    
    <div class="content">
      <h2>Hello, {{applicant_name}}</h2>
      
      <p>Thank you for your interest in joining MIS. We have reviewed your application and need some additional information before we can proceed.</p>
      
      <div class="info-box">
        <strong>📋 Additional Information Required:</strong><br><br>
        {{info_request_message}}
      </div>
      
      <p>Please respond to this request as soon as possible so we can continue processing your application.</p>
      
      <p style="text-align: center;">
        <a href="{{response_url}}" class="btn">PROVIDE INFORMATION</a>
      </p>
      
      <p>If you have any questions, please contact our support team.</p>
      
      <p>Best regards,<br>The MIS Team</p>
    </div>
    
    <div class="footer">
      <p>This is an automated message from MIS.</p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Admin Notification Email

### Template: `admin_new_request.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h2>New Interest Request Submitted</h2>
  
  <p>A new interest request has been submitted and requires your review.</p>
  
  <h3>Applicant Details:</h3>
  <ul>
    <li><strong>Name:</strong> {{full_name}}</li>
    <li><strong>Alias:</strong> {{alias}}</li>
    <li><strong>Email:</strong> {{primary_email}}</li>
    <li><strong>Phone:</strong> {{primary_phone}}</li>
    <li><strong>Gender:</strong> {{gender}}</li>
    <li><strong>Marital Status:</strong> {{marital_status}}</li>
    <li><strong>Has Referral:</strong> {{has_referral}}</li>
    <li><strong>Referral ID:</strong> {{referral_member_id}}</li>
  </ul>
  
  <p><a href="{{admin_review_url}}">Click here to review this request</a></p>
</body>
</html>
```

---

## 5. Python Email Service Implementation

### File: `backend_api/app/services/email_service.py`

```python
"""
Email Service - Handles all email notifications
"""

import os
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
from typing import Optional

# Initialize Jinja2 template environment
template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates', 'email')
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
    from app.config import settings
    
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
    from app.config import settings
    
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
    from app.config import settings
    
    # Implementation depends on email provider (SMTP, SendGrid, etc.)
    # Example with SMTP:
    
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
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to, msg.as_string())
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise
```

---

## 6. SMS Template (Optional)

```
MIS: Your invitation is approved!
Code: {{code}}
PIN: {{pin}}
Link valid 24hrs. Complete within 5hrs of opening.
{{short_url}}
```
