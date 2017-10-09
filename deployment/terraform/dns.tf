#
# Public DNS resources
#
data "aws_route53_zone" "external" {
  zone_id = "${data.terraform_remote_state.core.public_hosted_zone_id}"
}

resource "aws_route53_record" "cdn" {
  zone_id = "${data.aws_route53_zone.external.zone_id}"
  name    = "planit.${data.aws_route53_zone.external.name}"
  type    = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.cdn.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.cdn.hosted_zone_id}"
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "planit_app" {
  zone_id = "${data.aws_route53_zone.external.zone_id}"
  name    = "planit-origin.${data.aws_route53_zone.external.name}"
  type    = "A"

  alias {
    name                   = "${lower(aws_alb.planit_app.dns_name)}"
    zone_id                = "${aws_alb.planit_app.zone_id}"
    evaluate_target_health = true
  }
}
