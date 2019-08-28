package io.temperate.api.services

import cats.effect._
import com.typesafe.scalalogging.LazyLogging
import io.circe.Encoder
import io.circe.syntax._
import io.temperate.datamodel._
import org.http4s._
import org.http4s.circe._
import org.http4s.dsl.Http4sDsl

object DataService extends Http4sDsl[IO] with LazyLogging {

  private def asSortedJson[T: Ordering](options: Set[T])(implicit encoder: Encoder[T]) = {
    options.toList.sorted.asJson
  }

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case GET -> Root / "climate-model" / ClimateModel(model) =>
      Ok(model.asJson)
    case GET -> Root / "climate-model" =>
      Ok(asSortedJson(ClimateModel.options))
    case GET -> Root / "dataset" / Dataset(dataset) =>
      Ok(dataset.asJson)
    case GET -> Root / "dataset" =>
      Ok(asSortedJson(Dataset.options))
    case GET -> Root / "indicator" / Indicator(indicator) =>
      Ok(indicator.asJson)
    case GET -> Root / "indicator" =>
      Ok(asSortedJson(Indicator.options))
    case GET -> Root / "scenario" / Scenario(scenario) =>
      Ok(scenario.asJson)
    case GET -> Root / "scenario" =>
      Ok(asSortedJson(Scenario.options))
  }
}
