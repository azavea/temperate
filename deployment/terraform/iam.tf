#
# EC2 IAM
#
resource "aws_iam_role_policy_attachment" "cloudwatch_logs_policy_container_instance_role" {
  role       = "${module.container_service_cluster.container_instance_ecs_for_ec2_service_role}"
  policy_arn = "${var.aws_cloudwatch_logs_policy_arn}"
}
