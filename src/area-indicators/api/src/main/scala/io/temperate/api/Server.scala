package io.temperate.api

import cats.effect._
import cats.implicits._
import org.http4s._
import org.http4s.implicits._
import org.http4s.server.blaze._
import org.http4s.server.middleware._
import org.http4s.server.Router

import scala.concurrent.duration._

object ApiServer extends IOApp {

  // TODO: Expand to a middleware check so that responses aren't served
  //       unless the origin header is properly set.
  val corsConfig = CORSConfig(
    anyOrigin = false,
    allowedOrigins = Set(
      "https://temperate.io",
      "https://staging.temperate.io",
      "http://localhost:8102",
      "http://localhost:8108",
      "http://localhost:4210"
    ),
    anyMethod = true,
    allowCredentials = false,
    maxAge = 1.day.toSeconds
  )

  val httpApp: HttpApp[IO] = CORS(
    Router(
      "/healthcheck"  -> CORS(HealthcheckService.routes, corsConfig),
      "/climate-data" -> CORS(IndicatorService.routes, corsConfig),
      "/map-cell"     -> CORS(MapCellService.routes, corsConfig),
      "/"             -> CORS(MapCellService.routes, corsConfig)
    )).orNotFound

  def run(args: List[String]): IO[ExitCode] =
    BlazeServerBuilder[IO]
      .bindHttp(8108, "0.0.0.0")
      .withHttpApp(httpApp)
      .serve
      .compile
      .drain
      .as(ExitCode.Success)
}
