import sbt._

// Versions
object Versions {
  val CirceVersion             = "0.11.1"
  val CommonsIOVersion         = "2.6"
  val DeclineVersion           = "0.5.0"
  val GeotrellisVersion        = "3.0.0-SNAPSHOT"
  val Http4sVersion            = "0.20.3"
  val JacksonVersion           = "2.6.7"
  val LogbackVersion           = "1.2.3"
  val ScapegoatVersion         = "1.3.8"
  val SealerateVersion         = "0.0.5"
  val SparkVersion             = "2.4.1"
  val Specs2Version            = "4.1.0"
}

object Dependencies {
  val circeCore             = "io.circe"                    %% "circe-core"              % Versions.CirceVersion
  val circeGeneric          = "io.circe"                    %% "circe-generic"           % Versions.CirceVersion
  val commonsIO             = "commons-io"                  % "commons-io"               % Versions.CommonsIOVersion
  val decline               = "com.monovore"                %% "decline"                 % Versions.DeclineVersion
  val geotrellisRaster      = "org.locationtech.geotrellis" %% "geotrellis-raster"       % Versions.GeotrellisVersion
  val geotrellisS3          = "org.locationtech.geotrellis" %% "geotrellis-s3"           % Versions.GeotrellisVersion
  val geotrellisS3Spark     = "org.locationtech.geotrellis" %% "geotrellis-s3-spark"     % Versions.GeotrellisVersion
  val geotrellisSpark       = "org.locationtech.geotrellis" %% "geotrellis-spark"        % Versions.GeotrellisVersion
  val geotrellisVector      = "org.locationtech.geotrellis" %% "geotrellis-vector"       % Versions.GeotrellisVersion
  val http4s                = "org.http4s"                  %% "http4s-blaze-server"     % Versions.Http4sVersion
  val http4sCirce           = "org.http4s"                  %% "http4s-circe"            % Versions.Http4sVersion
  val http4sServer          = "org.http4s"                  %% "http4s-blaze-server"     % Versions.Http4sVersion
  val http4sDsl             = "org.http4s"                  %% "http4s-dsl"              % Versions.Http4sVersion
  val logbackClassic        = "ch.qos.logback"              % "logback-classic"          % Versions.LogbackVersion
  val sealerate             = "ca.mrvisser"                 %% "sealerate"               % Versions.SealerateVersion
  val sparkCore             = "org.apache.spark"            %% "spark-core"              % Versions.SparkVersion % "provided"
  val specs2Core            = "org.specs2"                  %% "specs2-core"             % Versions.Specs2Version % "test"
}

object DependencyOverrides {
  val jacksonCore        = "com.fasterxml.jackson.core"   % "jackson-core"          % Versions.JacksonVersion
  val jacksonDatabind    = "com.fasterxml.jackson.core"   % "jackson-databind"      % Versions.JacksonVersion
  val jacksonAnnotations = "com.fasterxml.jackson.core"   % "jackson-annotations"   % Versions.JacksonVersion
  val jacksonModuleScala = "com.fasterxml.jackson.module" %% "jackson-module-scala" % Versions.JacksonVersion
}
