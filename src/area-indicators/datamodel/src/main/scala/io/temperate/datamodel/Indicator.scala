package io.temperate.datamodel

import ca.mrvisser.sealerate
import io.temperate.datamodel.Operations.TimedDictionary

sealed trait Indicator {
  def name: String

  def box: Seq[TimedDictionary] => Seq[Double]
}

object Indicator {

  case object AverageHighTemperature extends Indicator {
    val name = "average-high-temperature"
    def box  = Boxes.average((_) => true, Variable.TasMax.name)
  }

  case object AverageLowTemperature extends Indicator {
    val name = "average-low-temperature"
    def box  = Boxes.average((_) => true, Variable.TasMin.name)
  }

  def unapply(str: String): Option[Indicator] = Indicator.options.find(_.name == str)

  val options: Set[Indicator] = sealerate.values[Indicator]
}
