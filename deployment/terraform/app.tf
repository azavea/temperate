#
# ECS resources
#
data "template_file" "app_cli" {
  template = "${file("task-definitions/cli.json")}"

  vars {
    image_url           = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/planit-app:${var.version}"
    database_host       = "database.service.${var.r53_private_hosted_zone}"
    database_name       = "${var.rds_database_name}"
    database_username   = "${var.rds_database_username}"
    database_password   = "${var.rds_database_password}"
    django_secret_key   = "${var.django_secret_key}"
    django_from_email   = "${var.django_from_email}"
    google_analytics_id = "${var.google_analytics_id}"
    google_maps_key     = "${var.google_maps_key}"
    environment         = "${var.environment}"
    region              = "${var.aws_region}"
  }
}

resource "aws_ecs_task_definition" "app_cli" {
  family                = "${var.environment}AppCLI"
  container_definitions = "${data.template_file.app_cli.rendered}"
}

data "template_file" "app" {
  template = "${file("task-definitions/app.json")}"

  vars {
    image_url           = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/planit-app:${var.version}"
    database_host       = "database.service.${var.r53_private_hosted_zone}"
    database_name       = "${var.rds_database_name}"
    database_username   = "${var.rds_database_username}"
    database_password   = "${var.rds_database_password}"
    django_secret_key   = "${var.django_secret_key}"
    django_from_email   = "${var.django_from_email}"
    google_analytics_id = "${var.google_analytics_id}"
    google_maps_key     = "${var.google_maps_key}"
    environment         = "${var.environment}"
    region              = "${var.aws_region}"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                = "${var.environment}App"
  container_definitions = "${data.template_file.app.rendered}"
}

module "app_web_service" {
  source = "github.com/azavea/terraform-aws-ecs-web-service?ref=0.1.0"

  name                = "App"
  vpc_id              = "${module.vpc.id}"
  public_subnet_ids   = ["${module.vpc.public_subnet_ids}"]
  access_log_bucket   = "${aws_s3_bucket.logs.id}"
  access_log_prefix   = "ALB"
  health_check_path   = "/health-check/"
  port                = "8080"
  ssl_certificate_arn = "${var.ssl_certificate_arn}"

  cluster_name                   = "${module.container_service_cluster.name}"
  task_definition_id             = "${aws_ecs_task_definition.app.family}:${aws_ecs_task_definition.app.revision}"
  desired_count                  = "${var.app_ecs_desired_count}"
  min_count                      = "${var.app_ecs_min_count}"
  max_count                      = "${var.app_ecs_max_count}"
  scale_up_cooldown_seconds      = "${var.app_ecs_scale_up_cooldown_seconds}"
  scale_down_cooldown_seconds    = "${var.app_ecs_scale_down_cooldown_seconds}"
  deployment_min_healthy_percent = "${var.app_ecs_deployment_min_percent}"
  deployment_max_percent         = "${var.app_ecs_deployment_max_percent}"
  container_name                 = "django"
  container_port                 = "8080"

  project     = "${var.project}"
  environment = "${var.environment}"
}
