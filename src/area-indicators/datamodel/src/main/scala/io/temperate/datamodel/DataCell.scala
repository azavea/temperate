package io.temperate.datamodel

import io.circe.Encoder
import io.circe.generic.JsonCodec

case class DataCellProperties(datasets: Set[Dataset],
                              distance_meters: Long,
                              proximity: DataCellProximity)

@JsonCodec case class DataCellProximity(ocean: Boolean)

object DataCellProperties {
  implicit val encodeDataCellProperties: Encoder[DataCellProperties] =
    Encoder.forProduct3("datasets", "distance_meters", "proximity")(d =>
      (d.datasets.map(_.name), d.distance_meters, d.proximity))
}
