package io.temperate.api

import scala.util.Properties

object Config {
  val awsProfile  = Properties.envOrElse("AWS_PROFILE", "")
  val awsRegion   = Properties.envOrElse("AWS_REGION", "us-east-1")
  val environment = Properties.envOrElse("ENVIRONMENT", "staging")

  val gtLayerBucket =
    Properties.envOrElse("AWS_GT_LAYER_BUCKET", "development-us-east-1-climate-data")
  val gtLayerKeyPath = Properties.envOrElse("AWS_GT_LAYER_KEY_PATH", "spacetimekey-2020-test")

  val healthcheckBucket =
    Properties.envOrElse("AWS_HEALTHCHECK_BUCKET", "development-us-east-1-climate-data")

  val healthcheckKeyPath = Properties.envOrElse(
    "AWS_HEALTHCHECK_KEY_PATH",
    "spacetimekey-2020-test/_attributes/metadata__loca-rcp85__0.json")
}
