#
# S3 resources
#
data "aws_iam_policy_document" "alb_access_logs" {
  statement {
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["${var.aws_elastic_load_balancing_account_id_arn}"]
    }

    resources = [
      "arn:aws:s3:::planit-${lower(var.environment)}-logs-${var.aws_region}/ALB/*",
    ]

    actions = ["s3:PutObject"]
  }
}

resource "aws_s3_bucket" "logs" {
  bucket = "planit-${lower(var.environment)}-logs-${var.aws_region}"
  policy = "${data.aws_iam_policy_document.alb_access_logs.json}"

  tags {
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}
