package io.temperate.api

import cats.effect._
import com.typesafe.scalalogging.LazyLogging
import io.circe.syntax._
import io.temperate.datamodel._
import org.http4s._
import org.http4s.circe._
import org.http4s.dsl.Http4sDsl

object DataService extends Http4sDsl[IO] with LazyLogging {

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case GET -> Root / "climate-model" / ClimateModel(model) =>
      Ok(model.asJson)
    case GET -> Root / "climate-model" =>
      Ok(ClimateModel.options.toList.sorted.asJson)
    case GET -> Root / "dataset" / Dataset(dataset) =>
      Ok(dataset.asJson)
    case GET -> Root / "dataset" =>
      Ok(Dataset.options.seq.toList.sorted.asJson)
    case GET -> Root / "scenario" / Scenario(scenario) =>
      Ok(scenario.asJson)
    case GET -> Root / "scenario" =>
      Ok(Scenario.options.seq.toList.sorted.asJson)
  }
}
