from datetime import datetime, timedelta, timezone
import logging
import rollbar

from django.conf import settings

from .models import PlanItOrganization, PlanItUser

logger = logging.getLogger(__name__)


def send_trial_end_notifications(threshold_days):
    expiring_organizations = get_pending_subscription_expirations(
        threshold_days, PlanItOrganization.Subscription.FREE_TRIAL)

    expiring_users = PlanItUser.objects.filter(
        primary_organization__in=expiring_organizations,
        trial_end_notified=False,
        is_active=True
    ).select_related(
        'primary_organization'
    )

    # Initialize Rollbar in case sending email fails
    rollbar_settings = getattr(settings, 'ROLLBAR', {})
    if rollbar_settings:
        rollbar.init(rollbar_settings.get('access_token'),
                     rollbar_settings.get('environment'))

    for user in expiring_users:
        try:
            user.email_user(
                'trial_end_notification_email',
                context={
                    'user': user,
                    'expire_date': user.primary_organization.subscription_end_date
                }
            )
        except Exception:
            logger.exception("Failed to send trial expiration notice to {}".format(user))
            if rollbar_settings:
                rollbar.report_exc_info(extra_data={
                    'user': user
                })

        else:
            user.trial_end_notified = True
            user.save()


def get_pending_subscription_expirations(threshold_days, plan):
    """Return a QS of organizations which have not been notified about their subscription ending."""
    now = datetime.now(timezone.utc)
    end_time = now + timedelta(days=threshold_days)

    return PlanItOrganization.objects.filter(
        subscription_end_date__lt=end_time,
        subscription_end_date__gt=now,
        subscription=plan
    )
