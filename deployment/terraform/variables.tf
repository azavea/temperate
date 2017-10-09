variable "project" {
  default = "PlanIt"
}

variable "environment" {
  default = "Staging"
}

variable "aws_region" {
  default = "us-east-1"
}

variable "rds_database_name" {
  default = "planit"
}

variable "planit_app_alb_ingress_cidr_block" {
  type = "list"
}

variable "planit_app_http_ecs_desired_count" {
  default = "1"
}

variable "planit_app_http_ecs_deployment_min_percent" {
  default = "0"
}

variable "planit_app_http_ecs_deployment_max_percent" {
  default = "100"
}

variable "planit_app_https_ecs_desired_count" {
  default = "1"
}

variable "planit_app_https_ecs_deployment_min_percent" {
  default = "0"
}

variable "planit_app_https_ecs_deployment_max_percent" {
  default = "100"
}

variable "cdn_price_class" {
  default = "PriceClass_All"
}

variable "git_commit" {}

variable "django_secret_key" {}

variable "rollbar_server_side_access_token" {}

variable "papertrail_host" {}

variable "papertrail_port" {}

variable "ssl_certificate_arn" {}
