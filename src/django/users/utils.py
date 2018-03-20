from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def send_html_email(template_prefix, from_email, to_emails, context={}, **kwargs):
        """Send an email in both HTML and text format.

        `template_prefix` is the path and start of file name for the three email templates.
        For example, the template_prefix 'greetings/hello_world' would look for an email
        subject template at 'users/templates/greetings/hello_world_subject.txt',
        a text email template at 'users/templates/greetings/hello_world.txt', and
        an HTML email template at 'users/templates/greetings/hello_world_subject.html'.
        """
        subject = render_to_string(template_prefix + "_subject.txt", context)
        # Force subject to a single line to avoid header-injection issues.
        subject = ''.join(subject.splitlines())
        message_text = render_to_string(template_prefix + ".txt", context)
        message_html = render_to_string(template_prefix + ".html", context)
        msg = EmailMultiAlternatives(subject, message_text, from_email, to_emails, **kwargs)
        msg.attach_alternative(message_html, "text/html")
        msg.send()
