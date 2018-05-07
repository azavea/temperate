#
# ECS IAM resources
#
data "aws_iam_policy_document" "events_ecs_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "events_ecs" {
  name               = "ecs${var.environment}EventsExecutionRole"
  assume_role_policy = "${data.aws_iam_policy_document.events_ecs_assume_role.json}"
}

resource "aws_iam_role_policy_attachment" "ecs_events_policy" {
  role       = "${aws_iam_role.events_ecs.name}"
  policy_arn = "${var.ecs_cloudwatch_events_role}"
}