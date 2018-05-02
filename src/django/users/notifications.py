from datetime import datetime, timedelta, timezone
import logging

from .models import PlanItOrganization, PlanItUser

logger = logging.getLogger(__name__)


def send_trial_end_notifications(threshold_days):
    expiring_organizations = get_pending_subscription_expirations(
        threshold_days, PlanItOrganization.Subscription.FREE_TRIAL)

    expiring_users = PlanItUser.objects.filter(
        primary_organization__in=expiring_organizations,
        is_active=True
    ).select_related(
        'primary_organization'
    )

    for user in expiring_users:
        logger.info("Sending email to {}", user)
        user.email_user(
            'trial_end_notification_email',
            context={
                'expire_date': user.primary_organization.subscription_end_date
            }
        )


def get_pending_subscription_expirations(threshold_days, plan):
    """Return a QS of organizations which have not been notified about their subscription ending."""
    now = datetime.now(timezone.utc)
    end_time = now + timedelta(days=threshold_days)

    return PlanItOrganization.objects.filter(
        subscription_end_date__lt=end_time,
        subscription_end_date__gt=now,
        subscription=plan
    )
