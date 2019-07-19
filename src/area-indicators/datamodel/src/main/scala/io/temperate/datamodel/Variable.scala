package io.temperate.datamodel

import ca.mrvisser.sealerate

sealed trait Variable {
  def name: String
  def unit: String
  def label: String
}

object Variable {
  case object TasMax extends Variable {
    val name  = "tasmax"
    val unit  = "K"
    val label = "Daily Mean of the Daily Max Near-Surface Air Temperature"
  }

  case object TasMin extends Variable {
    val name  = "tasmin"
    val unit  = "K"
    val label = "Daily Mean of the Daily Min Near-Surface Air Temperature"
  }

  case object Precip extends Variable {
    val name  = "pr"
    val unit  = "kg*m^-2*s^-2"
    val label = "Daily Mean Precipitation at Surface"
  }

  def unapply(str: String): Option[Variable] = options.find(_.name == str)

  val options: Set[Variable] = sealerate.values[Variable]
}
