variable "project" {
  default = "Azavea Planit"
}

variable "environment" {
  default = "Staging"
}

variable "aws_account_id" {}

variable "aws_elastic_load_balancing_account_id_arn" {
  default = "arn:aws:iam::127311923021:root"
}

variable "aws_region" {
  default = "us-east-1"
}

variable "aws_availability_zones" {
  type = "list"
}

variable "aws_key_name" {}

variable "aws_ecs_ami" {}

variable "external_access_cidr_block" {
  default = "66.212.12.106/32"
}

variable "vpc_cidr_block" {
  default = "10.0.0.0/16"
}

variable "vpc_private_subnet_cidr_blocks" {
  type = "list"
}

variable "vpc_public_subnet_cidr_blocks" {
  type = "list"
}

variable "bastion_ami" {
  default = "ami-f5f41398"
}

variable "bastion_instance_type" {
  default = "t2.nano"
}

variable "r53_private_hosted_zone" {
  default = "planit.internal"
}

variable "r53_public_hosted_zone" {}

variable "rds_allocated_storage" {
  default = "64"
}

variable "rds_engine_version" {
  default = "9.5"
}

variable "rds_auto_minor_version_upgrade" {
  default = true
}

variable "rds_final_snapshot_identifier" {
  default = "planit-rds-snapshot"
}

variable "rds_skip_final_snapshot" {
  default = false
}

variable "rds_copy_tags_to_snapshot" {
  default = true
}

variable "rds_parameter_group_family" {
  default = "postgres9.5"
}

variable "rds_instance_type" {
  default = "db.t2.micro"
}

variable "rds_storage_type" {
  default = "gp2"
}

variable "rds_database_identifier" {}

variable "rds_database_name" {}

variable "rds_database_username" {}

variable "rds_database_password" {}

variable "rds_backup_retention_period" {
  default = "30"
}

variable "rds_backup_window" {
  default = "04:00-04:30"
}

variable "rds_maintenance_window" {
  default = "sun:04:30-sun:05:30"
}

variable "rds_multi_az" {
  default = false
}

variable "rds_storage_encrypted" {
  default = false
}

variable "rds_alarm_cpu_threshold" {}

variable "rds_alarm_disk_queue_threshold" {}

variable "rds_alarm_free_disk_threshold" {}

variable "rds_alarm_free_memory_threshold" {}

variable "ssl_certificate_arn" {}

variable "container_instance_type" {
  default = "t2.small"
}

variable "container_instance_asg_desired_capacity" {
  default = "3"
}

variable "container_instance_asg_max_size" {
  default = "3"
}

variable "container_instance_asg_min_size" {
  default = "3"
}

variable "container_instance_asg_scale_up_cooldown_seconds" {
  default = "90"
}

variable "container_instance_asg_scale_down_cooldown_seconds" {
  default = "900"
}

variable "container_instance_asg_high_cpu_evaluation_periods" {
  default = "1"
}

variable "container_instance_asg_high_cpu_period_seconds" {
  default = "60"
}

variable "container_instance_asg_high_cpu_threshold_percent" {
  default = "75"
}

variable "container_instance_asg_low_cpu_evaluation_periods" {
  default = "5"
}

variable "container_instance_asg_low_cpu_period_seconds" {
  default = "60"
}

variable "container_instance_asg_low_cpu_threshold_percent" {
  default = "50"
}

variable "container_instance_asg_high_memory_evaluation_periods" {
  default = "1"
}

variable "container_instance_asg_high_memory_period_seconds" {
  default = "60"
}

variable "container_instance_asg_high_memory_threshold_percent" {
  default = "75"
}

variable "container_instance_asg_low_memory_evaluation_periods" {
  default = "5"
}

variable "container_instance_asg_low_memory_period_seconds" {
  default = "60"
}

variable "container_instance_asg_low_memory_threshold_percent" {
  default = "50"
}

variable "app_alb_ingress_cidr_block" {
  default = ["0.0.0.0/0"]
}

variable "app_ecs_desired_count" {
  default = "1"
}

variable "app_ecs_min_count" {
  default = "1"
}

variable "app_ecs_max_count" {
  default = "2"
}

variable "app_ecs_deployment_min_percent" {
  default = "0"
}

variable "app_ecs_deployment_max_percent" {
  default = "100"
}

variable "app_ecs_high_cpu_evaluation_periods" {
  default = "1"
}

variable "app_ecs_high_cpu_period_seconds" {
  default = "60"
}

variable "app_ecs_high_cpu_threshold_percent" {
  default = "30"
}

variable "app_ecs_low_cpu_evaluation_periods" {
  default = "1"
}

variable "app_ecs_low_cpu_period_seconds" {
  default = "60"
}

variable "app_ecs_low_cpu_threshold_percent" {
  default = "10"
}

variable "app_ecs_scale_up_cooldown_seconds" {
  default = "90"
}

variable "app_ecs_scale_down_cooldown_seconds" {
  default = "900"
}

variable "version" {}

variable "django_secret_key" {}

variable "django_from_email" {}

variable "google_analytics_id" {}

variable "google_maps_key" {}

variable "cdn_price_class" {
  default = "PriceClass_100"
}

variable "aws_ecs_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole"
}

variable "aws_cloudwatch_logs_policy_arn" {
  default = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}
