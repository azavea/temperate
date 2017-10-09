resource "aws_s3_bucket" "logs" {
  bucket = "${lower(var.environment)}-${var.aws_region}-climate-planit-logs"
  acl    = "private"
}
