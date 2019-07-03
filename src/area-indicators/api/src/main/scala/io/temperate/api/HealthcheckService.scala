package io.temperate.api

import cats.effect._
import org.http4s._
import org.http4s.dsl.Http4sDsl

object HealthcheckService extends Http4sDsl[IO] {

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case GET -> Root => Ok()
  }
}
