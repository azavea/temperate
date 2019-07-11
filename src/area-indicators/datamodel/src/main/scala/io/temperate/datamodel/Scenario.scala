package io.temperate.datamodel

sealed abstract class Scenario(name: String, label: String, description: String, alias: String) {}

case object RCP45      extends Scenario("rcp45", "RCP 4.5", "", "Low emissions")
case object RCP85      extends Scenario("rcp85", "RCP 8.5", "", "High emissions")
case object Historical extends Scenario("historical", "Historical", "", "")

object Scenario {

  def unapply(str: String): Option[Scenario] = {
    str.trim.toLowerCase match {
      case "rcp45"      => Some(RCP45)
      case "rcp85"      => Some(RCP85)
      case "historical" => Some(Historical)
      case _            => None
    }
  }
}
