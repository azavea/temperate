import sbtlighter._
import com.amazonaws.services.s3.model.ObjectMetadata

cancelable in Global := true

lazy val environment = sys.env.get("ENVIRONMENT").getOrElse("staging")

lazy val commonDependencies = Seq(
  Dependencies.specs2Core,
  Dependencies.logbackClassic
)

lazy val commonSettings = Seq(
  organization := "io.temperate",
  name := "area-indicators",
  version := "0.0.1-SNAPSHOT",
  scalaVersion := "2.11.12",
  scalafmtOnCompile := true,
  scapegoatVersion := Versions.ScapegoatVersion,
  scalacOptions := Seq(
    "-Ypartial-unification",
    // Required by ScalaFix
    "-Yrangepos",
    "-Ywarn-unused",
    "-Ywarn-unused-import",
    "-target:jvm-1.8"
  ),
  autoCompilerPlugins := true,
  addCompilerPlugin("org.spire-math"  %% "kind-projector"     % "0.9.6"),
  addCompilerPlugin("com.olegpy"      %% "better-monadic-for" % "0.2.4"),
  addCompilerPlugin("org.scalamacros" % "paradise"            % "2.1.0" cross CrossVersion.full),
  addCompilerPlugin(scalafixSemanticdb),
  externalResolvers := Seq(
    DefaultMavenRepository,
    Resolver.bintrayRepo("azavea", "geotrellis"),
    "locationtech-releases" at "https://repo.locationtech.org/content/groups/releases",
    "locationtech-snapshots" at "https://repo.locationtech.org/content/groups/snapshots"
  ),

  // SBT Lighter -- Easiest way to configure the plugin is globally for the
  // entire project even though it's just used in `ingest`.
  sparkAwsRegion := "us-east-1",
  sparkClusterName := s"area-indicators-ingest-${environment}",
  sparkCoreEbsSize := None,
  sparkCorePrice := Some(0.5),
  sparkCoreType := "m5d.2xlarge",
  sparkEmrApplications := Seq("Spark", "Zeppelin", "Ganglia"),
  sparkEmrRelease := "emr-5.23.0",
  sparkEmrServiceRole := "EMR_DefaultRole",
  sparkMasterEbsSize := None,
  sparkMasterPrice := Some(0.5),
  sparkMasterType := "m5d.2xlarge",
  sparkInstanceCount := 3,
  sparkInstanceRole := "EMR_EC2_DefaultRole",
  sparkS3JarFolder := s"s3://${environment}-us-east-1-climate-planit-artifacts/area-indicators",
  sparkS3LogUri := Some(s"s3://${environment}-us-east-1-climate-planit-logs/area-indicators"),
  sparkS3PutObjectDecorator := { req =>
    val metadata = new ObjectMetadata()
    metadata.setSSEAlgorithm(ObjectMetadata.AES_256_SERVER_SIDE_ENCRYPTION)
    req.withMetadata(metadata)
  },
  sparkEmrConfigs := List(
    EmrConfig("spark").withProperties(
      "maximizeResourceAllocation" -> "true"
    ),
    EmrConfig("spark-defaults").withProperties(
      "spark.driver.maxResultSize"        -> "8G",
      "spark.dynamicAllocation.enabled"   -> "true",
      "spark.shuffle.service.enabled"     -> "true",
      "spark.shuffle.compress"            -> "true",
      "spark.shuffle.spill.compress"      -> "true",
      "spark.rdd.compress"                -> "true",
      "spark.executor.extraJavaOptions"   -> "-XX:+UseParallelGC -Dgeotrellis.s3.threads.rdd.write=64"
    ),
    EmrConfig("yarn-site").withProperties(
      "yarn.resourcemanager.am.max-attempts" -> "1",
      "yarn.nodemanager.vmem-check-enabled"  -> "false",
      "yarn.nodemanager.pmem-check-enabled"  -> "false"
    )
  ),
  // sparkSubnetId := Some(""),
  // sparkSecurityGroupIds := Seq(""),

  // SBT Assembly
  assemblyMergeStrategy in assembly := {
    case "reference.conf"   => MergeStrategy.concat
    case "application.conf" => MergeStrategy.concat
    case PathList("META-INF", xs @ _*) =>
      xs match {
        case ("MANIFEST.MF" :: Nil) => MergeStrategy.discard
        // Concatenate everything in the services directory to keep GeoTools happy.
        case ("services" :: _ :: Nil) =>
          MergeStrategy.concat
        // Concatenate these to keep JAI happy.
        case ("javax.media.jai.registryFile.jai" :: Nil) | ("registryFile.jai" :: Nil) |
            ("registryFile.jaiext" :: Nil) =>
          MergeStrategy.concat
        case (name :: Nil) => {
          // Must exclude META-INF/*.([RD]SA|SF) to avoid "Invalid signature file digest for Manifest main attributes" exception.
          if (name.endsWith(".RSA") || name.endsWith(".DSA") || name.endsWith(".SF"))
            MergeStrategy.discard
          else
            MergeStrategy.first
        }
        case _ => MergeStrategy.first
      }
    case _ => MergeStrategy.first
  }
)

lazy val root = (project in file("."))
  .settings(commonSettings: _*)
  .aggregate(api, datamodel, ingest)
lazy val rootRef = LocalProject("root")

///////////////
// Datamodel //
///////////////
lazy val datamodelSettings = commonSettings ++ Seq(
  name := "datamodel",
  fork in run := true
)

lazy val datamodelDependencies = commonDependencies ++ Seq(
  Dependencies.circeCore,
  Dependencies.circeGeneric,
  Dependencies.commonsIO,
  Dependencies.http4s,
  Dependencies.http4sCirce,
  Dependencies.geotrellisRaster,
  Dependencies.geotrellisS3,
  Dependencies.geotrellisSpark,
  Dependencies.geotrellisVector,
  Dependencies.sealerate,
  Dependencies.sparkCore
)
lazy val datamodel = (project in file("datamodel"))
  .settings(datamodelSettings: _*)
  .settings({ libraryDependencies ++= datamodelDependencies })

///////////////
//    API    //
///////////////
lazy val apiSettings = commonSettings ++ Seq(
  name := "api",
  fork in run := true,
  assemblyJarName in assembly := "area-indicators-api-assembly.jar"
)

lazy val apiDependencies = commonDependencies ++ Seq(
  Dependencies.http4s,
  Dependencies.http4sCirce,
  Dependencies.http4sDsl,
  Dependencies.http4sServer
)

lazy val api = (project in file("api"))
  .dependsOn(rootRef, datamodel)
  .settings(apiSettings: _*)
  .settings({
    libraryDependencies ++= apiDependencies
  })

///////////////
//  Ingest   //
///////////////
lazy val ingestSettings = commonSettings ++ Seq(
  name := "ingest",
  fork in run := true,
  assemblyJarName in assembly := "area-indicators-ingest-assembly.jar"
)

lazy val ingestDependencies = commonDependencies ++ datamodelDependencies ++ Seq(
  Dependencies.decline,
  Dependencies.geotrellisContribGdal,
  Dependencies.geotrellisContribVlm
)

lazy val ingest = (project in file("ingest"))
  .dependsOn(rootRef, datamodel)
  .settings(ingestSettings: _*)
  .settings({ libraryDependencies ++= ingestDependencies })
