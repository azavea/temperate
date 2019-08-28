package io.temperate

import java.time.ZonedDateTime

import geotrellis.layer.SpaceTimeKey
import geotrellis.raster.MultibandTile

package object datamodel {
  type KV              = (SpaceTimeKey, MultibandTile)
  type Dictionary      = Map[String, Double]
  type TimedDictionary = (ZonedDateTime, Dictionary)
}
