package io.temperate.api

import cats.effect._
import com.typesafe.scalalogging.LazyLogging
import io.circe.syntax._
import io.temperate.datamodel._
import geotrellis.vector._
import org.http4s._
import org.http4s.circe._
import org.http4s.dsl.Http4sDsl
import org.http4s.dsl.impl.OptionalQueryParamDecoderMatcher

import scala.util.Try

object MapCellService extends Http4sDsl[IO] with LazyLogging {

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case GET -> Root / DoubleVar(lat) / DoubleVar(lon) =>
      val point = Point(lon, lat)
      // TODO: Replace Set(Dataset.Loca) with Dataset.options to include NEX-GDDP
      val cells = Set(Dataset.Loca)
        .flatMap { ds =>
          if (ds.extent.contains(point)) {
            val snappedPoint = ds.snapToGrid(point)
            val dist         = point.distance(snappedPoint).round
            // TODO: Actually check for ocean proximity
            val oceanProximity = false
            Some(
              PointFeature(snappedPoint,
                           DataCellProperties(Set(ds), dist, DataCellProximity(oceanProximity))))
          } else {
            None
          }
        }
        .toList
        .sortBy(_.data.distance_meters)

      if (cells.isEmpty) {
        NotFound(cells.asJson)
      } else {
        Ok(cells.asJson)
      }
  }
}

object DistanceQueryParamMatcher extends OptionalQueryParamDecoderMatcher[Double]("distance")

object DoubleVar {
  def unapply(str: String): Option[Double] = Try(str.toDouble).toOption
}
