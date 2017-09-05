#
# SNS resources
#
resource "aws_sns_topic" "global" {
  name = "topic${var.environment}GlobalNotifications"
}

#
# CloudWatch resources
#
resource "aws_cloudwatch_metric_alarm" "app_service_high_cpu" {
  alarm_name          = "alarm${var.environment}AppCPUUtilizationHigh"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "${var.app_ecs_high_cpu_evaluation_periods}"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "${var.app_ecs_high_cpu_period_seconds}"
  statistic           = "Average"
  threshold           = "${var.app_ecs_high_cpu_threshold_percent}"

  dimensions {
    ClusterName = "${module.container_service_cluster.name}"
    ServiceName = "${module.app_web_service.name}"
  }

  alarm_actions = ["${module.app_web_service.appautoscaling_policy_scale_up_arn}"]
}

resource "aws_cloudwatch_metric_alarm" "app_service_low_cpu" {
  alarm_name          = "alarm${var.environment}AppCPUUtilizationLow"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "${var.app_ecs_low_cpu_evaluation_periods}"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "${var.app_ecs_low_cpu_period_seconds}"
  statistic           = "Average"
  threshold           = "${var.app_ecs_low_cpu_threshold_percent}"

  dimensions {
    ClusterName = "${module.container_service_cluster.name}"
    ServiceName = "${module.app_web_service.name}"
  }

  alarm_actions = ["${module.app_web_service.appautoscaling_policy_scale_down_arn}"]
}
