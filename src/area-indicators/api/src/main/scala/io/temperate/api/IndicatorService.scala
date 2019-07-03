package io.temperate.api

import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

import scala.concurrent.ExecutionContext.Implicits.global
import cats.effect._
import com.typesafe.scalalogging.LazyLogging
import geotrellis.vector.{Point, Polygon}
import io.circe.syntax._
import io.temperate.datamodel._
import io.temperate.datamodel.Operations._
import org.http4s._
import org.http4s.circe._
import org.http4s.dsl.Http4sDsl

object IndicatorService extends Http4sDsl[IO] with LazyLogging {

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case GET -> Root / Scenario(scenario) / "indicator" / Indicator(indicator) => {
      val formatter                                       = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
      val startTime                                       = ZonedDateTime.parse("2020-01-01T00:00:00Z")
      val endTime                                         = ZonedDateTime.parse("2030-01-01T00:00:00Z")
      val divider: Seq[KV] => Map[ZonedDateTime, Seq[KV]] = Dividers.divideByCalendarYear

      val area = Polygon(
        Seq(
          Point(-75.2075958251953, 39.968174500886306),
          Point(-75.22201538085938, 39.87391156801293),
          Point(-75.14030456542969, 39.88919202444146),
          Point(-75.13069152832031, 39.961332959837826),
          Point(-75.2075958251953, 39.968174500886306)
        ))

      logger.info(s"Querying area: ${area}")

      Ok(IO {
        Operations
          .query(startTime, endTime, area, divider, Narrowers.byMean, indicator.box)
          .map {
            case (k, v) => {
              logger.info(s"JSON Formatting: ${k}")
              k.format(formatter) -> v.toList
            }
          }
          .asJson
      })
    }
  }
}
