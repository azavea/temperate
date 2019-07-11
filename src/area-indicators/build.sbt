cancelable in Global := true

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
    "-Ywarn-unused-import"
  ),
  autoCompilerPlugins := true,
  addCompilerPlugin("org.spire-math"  %% "kind-projector"     % "0.9.6"),
  addCompilerPlugin("com.olegpy"      %% "better-monadic-for" % "0.2.4"),
  addCompilerPlugin("org.scalamacros" % "paradise"            % "2.1.0" cross CrossVersion.full),
  addCompilerPlugin(scalafixSemanticdb)
)

lazy val root = (project in file("."))
  .settings(commonSettings: _*)
  .aggregate(api, datamodel)
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
  assemblyJarName in assembly := "area-indicators-api-assembly.jar",
  assemblyMergeStrategy in assembly := {
    case "reference.conf"                       => MergeStrategy.concat
    case "application.conf"                     => MergeStrategy.concat
    case n if n.startsWith("META-INF/services") => MergeStrategy.concat
    case n if n.endsWith(".SF") || n.endsWith(".RSA") || n.endsWith(".DSA") =>
      MergeStrategy.discard
    case "META-INF/MANIFEST.MF" => MergeStrategy.discard
    case _                      => MergeStrategy.first
  }
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
