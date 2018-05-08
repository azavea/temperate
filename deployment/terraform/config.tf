provider "aws" {
  version = "~> 1.17.0"
  region  = "${var.aws_region}"
}

provider "template" {
  version = "~> 1.0.0"
}

terraform {
  backend "s3" {
    region  = "us-east-1"
    encrypt = "true"
  }
}
