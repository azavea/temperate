#
# Security group resources
#
resource "aws_security_group" "planit_app_alb" {
  vpc_id = "${data.terraform_remote_state.core.vpc_id}"

  tags {
    Name        = "sgPlanItAppLoadBalancer"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

#
# ALB resources
#
resource "aws_alb" "planit_app" {
  security_groups = ["${aws_security_group.planit_app_alb.id}"]
  subnets         = ["${data.terraform_remote_state.core.public_subnet_ids}"]
  name            = "alb${var.environment}PlanItApp"

  tags {
    Name        = "albPlanItApp"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_alb_target_group" "planit_app_https" {
  name = "tg${var.environment}HTTPSPlanItApp"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    timeout             = "3"
    path                = "/health-check/"
    unhealthy_threshold = "2"
  }

  port     = "443"
  protocol = "HTTP"
  vpc_id   = "${data.terraform_remote_state.core.vpc_id}"

  tags {
    Name        = "tg${var.environment}HTTPSPlanItApp"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_alb_listener" "planit_app_https" {
  load_balancer_arn = "${aws_alb.planit_app.id}"
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = "${var.ssl_certificate_arn}"

  default_action {
    target_group_arn = "${aws_alb_target_group.planit_app_https.id}"
    type             = "forward"
  }
}

resource "aws_alb_target_group" "planit_app_http" {
  name = "tg${var.environment}HTTPPlanItApp"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    timeout             = "3"
    path                = "/"
    unhealthy_threshold = "2"
    matcher             = "301"
  }

  port     = "80"
  protocol = "HTTP"
  vpc_id   = "${data.terraform_remote_state.core.vpc_id}"

  tags {
    Name        = "tg${var.environment}HTTPPlanItApp"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_alb_listener" "planit_app_http" {
  load_balancer_arn = "${aws_alb.planit_app.id}"
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = "${aws_alb_target_group.planit_app_http.id}"
    type             = "forward"
  }
}

#
# ECS resources
#
data "template_file" "planit_app_https_ecs_task" {
  template = "${file("task-definitions/app.json")}"

  vars = {
    app_server_django_url            = "${data.terraform_remote_state.core.aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/planit-app:${var.git_commit}"
    nginx_url                        = "${data.terraform_remote_state.core.aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/planit-nginx:${var.git_commit}"
    django_secret_key                = "${var.django_secret_key}"
    rds_host                         = "${data.terraform_remote_state.core.rds_host}"
    rds_database_name                = "${var.rds_database_name}"
    rds_username                     = "${data.terraform_remote_state.core.rds_username}"
    rds_password                     = "${data.terraform_remote_state.core.rds_password}"
    git_commit                       = "${var.git_commit}"
    rollbar_server_side_access_token = "${var.rollbar_server_side_access_token}"
    environment                      = "${var.environment}"
    planit_app_papertrail_endpoint   = "${var.papertrail_host}:${var.papertrail_port}"
    aws_region                       = "${var.aws_region}"
    ccapi_email                      = "${var.ccapi_email}"
    ccapi_password                   = "${var.ccapi_password}"
  }
}

resource "aws_ecs_task_definition" "planit_app_https" {
  family                = "${var.environment}HTTPSPlanItApp"
  container_definitions = "${data.template_file.planit_app_https_ecs_task.rendered}"
}

resource "aws_ecs_service" "planit_app_https" {
  name                               = "${var.environment}HTTPSPlanItApp"
  cluster                            = "${data.terraform_remote_state.core.container_service_cluster_id}"
  task_definition                    = "${aws_ecs_task_definition.planit_app_https.arn}"
  desired_count                      = "${var.planit_app_https_ecs_desired_count}"
  deployment_minimum_healthy_percent = "${var.planit_app_https_ecs_deployment_min_percent}"
  deployment_maximum_percent         = "${var.planit_app_https_ecs_deployment_max_percent}"
  iam_role                           = "${data.terraform_remote_state.core.container_service_cluster_ecs_service_role_name}"

  placement_strategy {
    type  = "spread"
    field = "attribute:ecs.availability-zone"
  }

  load_balancer {
    target_group_arn = "${aws_alb_target_group.planit_app_https.id}"
    container_name   = "nginx"
    container_port   = "443"
  }
}

data "template_file" "planit_app_http_ecs_task" {
  template = "${file("task-definitions/nginx.json")}"

  vars = {
    nginx_url                      = "${data.terraform_remote_state.core.aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/planit-nginx:${var.git_commit}"
    planit_app_papertrail_endpoint = "${var.papertrail_host}:${var.papertrail_port}"
  }
}

resource "aws_ecs_task_definition" "planit_app_http" {
  family                = "${var.environment}HTTPPlanItApp"
  container_definitions = "${data.template_file.planit_app_http_ecs_task.rendered}"
}

resource "aws_ecs_service" "planit_app_http" {
  name                               = "${var.environment}HTTPPlanItApp"
  cluster                            = "${data.terraform_remote_state.core.container_service_cluster_id}"
  task_definition                    = "${aws_ecs_task_definition.planit_app_http.arn}"
  desired_count                      = "${var.planit_app_http_ecs_desired_count}"
  deployment_minimum_healthy_percent = "${var.planit_app_http_ecs_deployment_min_percent}"
  deployment_maximum_percent         = "${var.planit_app_http_ecs_deployment_max_percent}"
  iam_role                           = "${data.terraform_remote_state.core.container_service_cluster_ecs_service_role_name}"

  placement_strategy {
    type  = "spread"
    field = "attribute:ecs.availability-zone"
  }

  load_balancer {
    target_group_arn = "${aws_alb_target_group.planit_app_http.id}"
    container_name   = "nginx"
    container_port   = "80"
  }
}

data "template_file" "planit_app_management_ecs_task" {
  template = "${file("task-definitions/management.json")}"

  vars {
    management_url                   = "${data.terraform_remote_state.core.aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/planit-app:${var.git_commit}"
    django_secret_key                = "${var.django_secret_key}"
    rds_host                         = "${data.terraform_remote_state.core.rds_host}"
    rds_database_name                = "${var.rds_database_name}"
    rds_username                     = "${data.terraform_remote_state.core.rds_username}"
    rds_password                     = "${data.terraform_remote_state.core.rds_password}"
    git_commit                       = "${var.git_commit}"
    rollbar_server_side_access_token = "${var.rollbar_server_side_access_token}"
    environment                      = "${var.environment}"
    planit_app_papertrail_endpoint   = "${var.papertrail_host}:${var.papertrail_port}"
    aws_region                       = "${var.aws_region}"
    ccapi_email                      = "${var.ccapi_email}"
    ccapi_password                   = "${var.ccapi_password}"
    ccapi_host                       = "${var.ccapi_host}"
  }
}

resource "aws_ecs_task_definition" "planit_app_management" {
  family                = "${var.environment}ManagementPlanItApp"
  container_definitions = "${data.template_file.planit_app_management_ecs_task.rendered}"

  volume {
    name      = "tmp"
    host_path = "/tmp"
  }
}
