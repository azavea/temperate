import sbt._

// Versions
object Versions {
  val CirceVersion      = "0.11.1"
  val GeotrellisVersion = "1.2.0"
  val Http4sVersion     = "0.20.3"
  val LogbackVersion    = "1.2.3"
  val ScapegoatVersion  = "1.3.8"
  val SparkVersion      = "2.2.0"
  val Specs2Version     = "4.1.0"
}

object Dependencies {
  val circeCore        = "io.circe"                    %% "circe-core"          % Versions.CirceVersion
  val circeGeneric     = "io.circe"                    %% "circe-generic"       % Versions.CirceVersion
  val geotrellisRaster = "org.locationtech.geotrellis" %% "geotrellis-raster"   % Versions.GeotrellisVersion
  val geotrellisS3     = "org.locationtech.geotrellis" %% "geotrellis-s3"       % Versions.GeotrellisVersion
  val geotrellisSpark  = "org.locationtech.geotrellis" %% "geotrellis-spark"    % Versions.GeotrellisVersion
  val geotrellisVector = "org.locationtech.geotrellis" %% "geotrellis-vector"   % Versions.GeotrellisVersion
  val http4s           = "org.http4s"                  %% "http4s-blaze-server" % Versions.Http4sVersion
  val http4sCirce      = "org.http4s"                  %% "http4s-circe"        % Versions.Http4sVersion
  val http4sServer     = "org.http4s"                  %% "http4s-blaze-server" % Versions.Http4sVersion
  val http4sDsl        = "org.http4s"                  %% "http4s-dsl"          % Versions.Http4sVersion
  val logbackClassic   = "ch.qos.logback"              % "logback-classic"      % Versions.LogbackVersion
  val sparkCore        = "org.apache.spark"            %% "spark-core"          % Versions.SparkVersion % "provided"
  val specs2Core       = "org.specs2"                  %% "specs2-core"         % Versions.Specs2Version % "test"
}
