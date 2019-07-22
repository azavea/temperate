package io.temperate.datamodel

import ca.mrvisser.sealerate

sealed trait Scenario {
  def name: String
  def label: String
  def description: String
  def alias: String
}

object Scenario {
  case object RCP45 extends Scenario {
    val name        = "rcp45"
    val label       = "RCP 4.5"
    val description = ""
    val alias       = "Low emissions"
  }

  case object RCP85 extends Scenario {
    val name        = "rcp85"
    val label       = "RCP 8.5"
    val description = ""
    val alias       = "High emissions"
  }

  case object Historical extends Scenario {
    val name        = "historical"
    val label       = "Historical"
    val description = ""
    val alias       = ""
  }

  def unapply(str: String): Option[Scenario] = Scenario.options.find(_.name == str)

  val options: Set[Scenario] = sealerate.values[Scenario]
}
