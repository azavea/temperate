resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = "planit-origin.${replace(data.aws_route53_zone.external.name, "/.$/", "")}"
    origin_id   = "originApp"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  enabled             = true
  default_root_object = ""
  http_version        = "http2"
  comment             = "Climate ${var.project} (${var.environment})"
  retain_on_delete    = true

  price_class = "${var.cdn_price_class}"
  aliases     = ["planit.${replace(data.aws_route53_zone.external.name, "/.$/", "")}"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "originApp"

    forwarded_values {
      query_string = true
      headers      = ["*"]

      cookies {
        forward = "all"
      }
    }

    compress               = false
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 300
  }

  cache_behavior {
    path_pattern     = "static/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "originApp"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 300
  }

  logging_config {
    include_cookies = false
    bucket          = "${aws_s3_bucket.logs.id}.s3.amazonaws.com"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "${var.ssl_certificate_arn}"
    minimum_protocol_version = "TLSv1"
    ssl_support_method       = "sni-only"
  }
}
