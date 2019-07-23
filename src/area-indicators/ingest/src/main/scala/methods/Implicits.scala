package io.temperate.ingest.methods

import io.temperate.datamodel.Dataset

object Implicits extends Implicits

trait Implicits {
  implicit class withExtraDatasetMethods(val self: Dataset) extends ExtraDatasetMethods
}
