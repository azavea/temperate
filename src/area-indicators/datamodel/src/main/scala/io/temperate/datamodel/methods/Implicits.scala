package io.temperate.datamodel.methods

import io.temperate.datamodel.Dataset

object Implicits extends Implicits

trait Implicits {
  implicit class withTileIndexMethods(val self: Dataset) extends TileIndexMethods
}
