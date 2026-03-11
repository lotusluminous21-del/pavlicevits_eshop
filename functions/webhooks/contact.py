import os
import resend
from firebase_functions import firestore_fn, options
from core.logger import get_logger

logger = get_logger("webhooks.contact")

# HTML Template for the email
EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<style>
  body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
  .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
  .header {{ border-bottom: 2px solid #165c52; padding-bottom: 10px; margin-bottom: 20px; }}
  .header h2 {{ color: #165c52; margin: 0; }}
  .field {{ margin-bottom: 15px; }}
  .label {{ font-weight: bold; color: #555; text-transform: uppercase; font-size: 12px; }}
  .value {{ margin-top: 5px; font-size: 14px; background: #f9f9f9; padding: 10px; border-radius: 4px; border-left: 3px solid #165c52;}}
  .footer {{ margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h2>Νέο Μήνυμα Επικοινωνίας</h2>
  </div>
  
  <div class="field">
    <div class="label">Ονοματεπώνυμο</div>
    <div class="value">{name}</div>
  </div>
  
  <div class="field">
    <div class="label">Email Επικοινωνίας</div>
    <div class="value"><a href="mailto:{email}">{email}</a></div>
  </div>
  
  <div class="field">
    <div class="label">Τηλέφωνο</div>
    <div class="value">{phone}</div>
  </div>
  
  <div class="field">
    <div class="label">Μήνυμα</div>
    <div class="value" style="white-space: pre-wrap;">{message}</div>
  </div>
  
  <div class="footer">
    Αυτό το μήνυμα στάλθηκε αυτόματα από τη φόρμα επικοινωνίας του e-shop Pavlicevits.
  </div>
</div>
</body>
</html>
"""

def handle_contact_inquiry(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]) -> None:
    """
    Triggered when a new document is added to the contact_inquiries collection.
    Sends an email copy using Resend.
    """
    try:
        if not event.data or not event.data.exists:
            return

        data = event.data.to_dict() or {}
        name = data.get("name", "Άγνωστο")
        email = data.get("email", "Κανένα Email")
        phone = data.get("phone", "Κανένα Τηλέφωνο")
        message = data.get("message", "")

        html_content = EMAIL_TEMPLATE.format(
            name=name,
            email=email,
            phone=phone,
            message=message
        )

        params = {
            "from": "Pavlicevits Website <onboarding@resend.dev>", 
            "to": ["info@pavlicevits.gr"],
            "subject": f"Νέο Μήνυμα Επικοινωνίας από {name}",
            "html": html_content,
            "reply_to": email
        }

        email_response = resend.Emails.send(params)
        logger.info(f"Email sent successfully to info@pavlicevits.gr for inquiry {event.params.get('docId')}. Resend ID: {email_response.get('id')}")

    except Exception as e:
        logger.error(f"Failed to send contact inquiry email: {e}", exc_info=True)
