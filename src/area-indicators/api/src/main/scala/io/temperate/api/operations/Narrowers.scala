package io.temperate.api.operations

import _root_.io.temperate.datamodel._
import geotrellis.raster._

object Narrowers {

  /**
    * An example of the `narrower` lambda from the `query` function.
    * Converts an area (some tiles) into a dictionary of the form
    * Map("tasmin" -> x, "tasmax" -> y, "pr" -> z).
    */
  def byMean(area: Seq[MultibandTile], dataset: Dataset, indicator: Indicator): Dictionary = {
    var results: Dictionary = Map.empty[String, Double]

    indicator.variables.foreach { variable =>
      var count: Int  = 0
      var sum: Double = 0.0
      area.foreach { mbTile =>
        dataset.models.foreach { model =>
          val index = dataset.tileIndex(model, variable)
          val tile  = mbTile.band(index)
          tile.foreachDouble { z: Double =>
            if (!isNoData(z)) {
              count = count + 1
              sum = sum + z
            }
          }
        }
      }
      results += (variable.name -> sum / count)
    }
    results
  }
}
