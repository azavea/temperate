resource "aws_s3_bucket" "logs" {
  bucket = "${lower(var.environment)}-${var.aws_region}-climate-planit-logs"
  acl    = "private"
}

resource "aws_s3_bucket" "artifacts" {
  bucket = "${lower(var.environment)}-${var.aws_region}-climate-planit-artifacts"
  acl    = "private"
}
