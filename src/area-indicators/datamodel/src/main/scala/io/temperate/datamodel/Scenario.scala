package io.temperate.datamodel

import ca.mrvisser.sealerate
import io.circe.Encoder

sealed trait Scenario extends Ordered[Scenario] {
  def name: String
  def label: String
  def description: String
  def alias: String

  def compare(that: Scenario): Int = { this.name.compare(that.name) }
}

object Scenario {
  case object RCP45 extends Scenario {
    val name: String  = "rcp45"
    val label: String = "RCP 4.5"

    val description
      : String = "Stabilization without overshoot pathway to 4.5 W/m2 at stabilization after 2100. See " +
      "https://www.skepticalscience.com/rcp.php"
    val alias: String = "Low emissions"
  }

  case object RCP85 extends Scenario {
    val name: String  = "rcp85"
    val label: String = "RCP 8.5"

    val description: String = "Rising radiative forcing pathway leading to 8.5 W/m2 in 2100. See " +
      "https://www.skepticalscience.com/rcp.php"
    val alias: String = "High emissions"
  }

  case object Historical extends Scenario {
    val name  = "historical"
    val label = "Historical"

    val description =
      "A historical dataset from NEX GDDP for 1950 to 2005 that blends reanalysis data with observations"
    val alias = ""
  }

  def unapply(str: String): Option[Scenario] = Scenario.options.find(_.name == str)

  val options: Set[Scenario] = sealerate.values[Scenario]

  implicit val encodeScenario: Encoder[Scenario] =
    Encoder.forProduct4("name", "label", "description", "alias")(d =>
      (d.name, d.label, d.description, d.alias))
}
