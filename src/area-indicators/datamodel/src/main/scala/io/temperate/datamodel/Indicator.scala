package io.temperate.datamodel

import io.temperate.datamodel.Operations.TimedDictionary

trait BoxOperation {
  def box: Seq[TimedDictionary] => Seq[Double]
}

sealed abstract class Indicator(name: String) extends BoxOperation {}

case object AverageHighTemperature extends Indicator("average-high-temperature") {
  def box = Boxes.average((_) => true, Variable.TasMax.toString)
}

case object AverageLowTemperature extends Indicator("average-low-temperature") {
  def box = Boxes.average((_) => true, Variable.TasMin.toString)
}

object Indicator {

  def unapply(str: String): Option[Indicator] = {
    str.trim.toLowerCase match {
      case "average-high-temperature" => Some(AverageHighTemperature)
      case "average-low-temperature"  => Some(AverageLowTemperature)
      case _                          => None
    }
  }
}
