package io.temperate.datamodel

import io.circe.Encoder

sealed trait IndicatorParam {
  def name: String
  def description: String
  def required: Boolean
  def default: String

  def validate(input: String): Boolean = ???
}

object IndicatorParam {
  private def formatChoices[T](choices: List[T]) = {
    choices.init.map(opt => s"'$opt'").mkString(", ") + ", and " + choices.last
  }

  case class Agg() extends IndicatorParam {
    private val staticChoices = List("min", "max", "avg", "median", "stddev")

    val name = "agg"

    val description: String =
      "A list of comma separated aggregation types to return. Valid choices are " +
        s"${formatChoices(staticChoices ++ "XXth")}. If using 'XXth', replace the XX with " +
        "a number between 1-99 to return that percentile. For example, '99th' returns the value of the 99th " +
        "percentile. The 'XXth' option can be provided multiple times with different values."
    val required = false
    val default  = "min,max,agg"
  }

  case class Basetemp() extends IndicatorParam {
    val name = "basetemp"

    val description: String =
      "The base temperature used to calculate the daily difference for degree days summations. Defaults to 65. " +
        "See the 'basetemp_units' for a discussion of the units this value uses."
    val required = false
    val default  = "65"
  }

  case class BasetempUnits() extends IndicatorParam {
    private val choices = List("C", "F", "K")

    val name = "basetemp_units"

    val description: String =
      s"Units for the value of the 'basetemp' parameter. Valid choices are ${formatChoices(choices)}. Defaults to 'F'."
    val required = false
    val default  = "F"
  }

  case class Datasets() extends IndicatorParam {
    val name = "dataset"

    val description: String =
      "A single value defining which provider to use for raw climate data. If not provided, defaults to NEX-GDDP."
    val required = false
    val default  = "NEX-GDDP"
  }

  case class HistoricRange() extends IndicatorParam {
    private val choices = List(1951, 1961, 1971)

    val name = "historic_range"

    val description: String =
      "The starting year for the 30 year range of past years used to define the historic norm. Available options are " +
        s"${formatChoices(choices)}. If not provided, defaults to the most recent year."
    val required        = false
    val default: String = choices.last.toString
  }

  case class Models() extends IndicatorParam {
    val name = "models"

    val description: String =
      "A list of comma separated model names to filter the indicator by. The indicator values in the response will " +
        "only use the selected models. If not provided, defaults to all models."
    val required = false
    val default  = "all"
  }

  case class Percentile(defaultPercentile: Int) extends IndicatorParam {
    val name = "percentile"

    val description: String =
      "The percentile threshold used to determine the appropriate comparative level of an event or measurement. " +
        s"Must be an integer in the range [0,100]. Defaults to $defaultPercentile"
    val required        = false
    val default: String = defaultPercentile.toString
  }

  case class Threshold() extends IndicatorParam {
    val name = "threshold"

    val description: String =
      "Required. The value against which to compare climate data values in the unit specified by the 'threshold_units' parameter."
    val required        = true
    val default: String = ""
  }

  case class ThresholdUnits(units: List[String]) extends IndicatorParam {
    val name = "threshold_units"

    val description: String =
      "Required. Units for the value of the 'threshold' parameter.  Must be a valid unit recognized by the API. " +
        s"Options: ${formatChoices(units)}"
    val required        = true
    val default: String = ""
  }

  case class ThresholdComparator() extends IndicatorParam {
    private val choices = List("lt", "gt", "lte", "gte")
    val name            = "threshold_comparator"

    val description: String =
      s"Required. The comparison type against the value of the 'threshold' parameter. Options: ${formatChoices(choices)}. " +
        "Signify: less than, greater than, less than or equals..."
    val required        = true
    val default: String = ""
  }

  case class TimeAggregation() extends IndicatorParam {
    private val choices = List("yearly", "offset_yearly", "quarterly", "monthly")
    val name            = "time_aggregation"

    val description: String =
      s"Time granularity to group data by for result structure. Options are ${formatChoices(choices)}. Defaults to 'yearly'."
    val required = false
    val default  = "yearly"
  }

  case class Units(defaultUnits: String, units: List[String]) extends IndicatorParam {
    val name = "units"

    val description: String =
      "Units in which to return the data. Defaults to Imperial units (Fahrenheit for temperature indicators and inches for precipitation)."
    val required        = false
    val default: String = defaultUnits
  }

  case class Years() extends IndicatorParam {
    val name = "years"

    val description: String =
      "A list of comma separated year ranges to filter the response by. Defaults to all years available. A year " +
        "range is of the form 'start[:end]'. Examples: '2010', '2010:2020', '2010:2020,2030', '2010:2020,2030:2040'"
    val required = false
    val default  = "all"
  }

  implicit val encodeIndicatorParam: Encoder[IndicatorParam] =
    Encoder.forProduct4("name", "description", "required", "default")(p =>
      (p.name, p.description, p.required, p.default))
}
