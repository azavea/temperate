package io.temperate.api.services

import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

import cats.data.Validated.{Invalid, Valid}
import cats.effect._
import com.typesafe.scalalogging.LazyLogging
import geotrellis.vector._
import _root_.io.circe.syntax._
import _root_.io.temperate.api.operations._
import _root_.io.temperate.datamodel.IndicatorParam.{TimeAggregation, Years}
import _root_.io.temperate.datamodel._
import org.http4s._
import org.http4s.circe._
import org.http4s.dsl.Http4sDsl

object IndicatorService extends Http4sDsl[IO] with LazyLogging {

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ GET -> Root / Scenario(scenario) / "indicator" / Indicator(indicator) => {
      indicator.getBox(req.multiParams, scenario) match {
        case Invalid(errors) => BadRequest(errors.toList.asJson)
        case Valid(box) =>
          val formatter            = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
          val (startTime, endTime) = getTimes(indicator.years, scenario)
          val divider              = getDivider(indicator.timeAggregation)
          val dataset              = Dataset.Loca

          val area = Polygon(
            Seq(
              Point(-75.2075958251953, 39.968174500886306),
              Point(-75.22201538085938, 39.87391156801293),
              Point(-75.14030456542969, 39.88919202444146),
              Point(-75.13069152832031, 39.961332959837826),
              Point(-75.2075958251953, 39.968174500886306)
            ))
//          val area = Point(-75.16379, 39.95233).buffer(0.01).getEnvelope.asInstanceOf[Polygon]

          logger.info(s"Querying area: ${area.toGeoJson}")

          Ok(
            Operations
              .ioQuery(startTime, endTime, area, divider, Narrowers.byMean, box, dataset, indicator)
              .map { m =>
                m.map {
                  case (k, v) => {
                    logger.info(s"JSON Formatting: ${k}")
                    k.format(formatter) -> v.toList
                  }
                }.asJson
              })

      }
    }
  }

  private def getDivider(timeAgg: TimeAggregation): Seq[KV] => Map[ZonedDateTime, Seq[KV]] = {
    timeAgg.value match {
      case Some("yearly")  => Dividers.divideByCalendarYear
      case Some("monthly") => Dividers.divideByCalendarMonth
      case _               => Dividers.divideByCalendarYear
    }
  }

  private def getTimes(years: Years, scenario: Scenario): (ZonedDateTime, ZonedDateTime) = {
    val (startYr, endYr) = years.value match {
      case Some(ranges) => (ranges.head.start, ranges.last.end)
      case _            => (scenario.years.start, scenario.years.end)
    }
    (ZonedDateTime.parse(s"$startYr-01-01T00:00:00Z"),
     ZonedDateTime.parse(s"$endYr-01-01T00:00:00Z"))
  }
}