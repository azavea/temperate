package io.temperate.datamodel

object Variable extends Enumeration {
  val TasMax = Value("tasmax")
  val TasMin = Value("tasmin")
  val Precip = Value("pr")

  def unapply(str: String): Option[Value] = {
    values.find(_.toString == str)
  }
}
