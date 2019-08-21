package io.temperate.datamodel

import cats.data.Validated
import cats.data.Validated.Valid
import cats.implicits._
import io.circe.Encoder

import scala.util.{Success, Try}

sealed trait IndicatorParam[T] {
  def name: String
  def default: T
  def description: String
  def required: Boolean
  def value: Option[T]

  def validate(input: String, scenario: Scenario): Validated[String, IndicatorParam[T]]
}

object IndicatorParam {
  private def formatChoices[T](choices: List[T]) = {
    choices.init.map(opt => s"'$opt'").mkString(", ") + " and " + choices.last
  }

  case class Basetemp(value: Option[Double] = None) extends IndicatorParam[Double] {
    val name = "basetemp"

    val default = 65.0

    val description: String =
      s"The base temperature used to calculate the daily difference for degree days summations. Defaults to $default. " +
        "See the 'basetemp_units' for a discussion of the units this value uses."
    val required = false

    override def validate(input: String, scenario: Scenario): Validated[String, Basetemp] = {
      Try(input.toDouble).toOption.map(v => copy(value=Some(v))).toValid(s"Value for parameter $name is not a valid number")
    }
  }

  case class BasetempUnits(value: Option[String] = None) extends IndicatorParam[String] {
    private val choices = List("C", "F", "K")

    val name = "basetemp_units"

    val default = "F"

    val description: String =
      s"Units for the value of the 'basetemp' parameter. Valid choices are ${formatChoices(choices)}. Defaults to '$default'."
    val required = false

    override def validate(input: String, scenario: Scenario): Validated[String, BasetempUnits] = {
      Some(input).filter(choices.contains).map(v => copy(value = Some(v))).toValid(s"Invalid value for parameter $name")
    }
  }

  case class Datasets(value: Option[Dataset] = None) extends IndicatorParam[Dataset] {
    val name = "dataset"

    val default: Dataset = Dataset.NexGddp

    val description: String =
      s"A single value defining which provider to use for raw climate data. If not provided, defaults to '${default.name}'."
    val required = false

    override def validate(input: String, scenario: Scenario): Validated[String, Datasets] = {
      Some(input).flatMap(Dataset.unapply).map(v => copy(value = Some(v))).toValid(s"Invalid value for parameter $name")
    }
  }

  case class Models(value: Option[Set[ClimateModel]] = None) extends IndicatorParam[Set[ClimateModel]] {
    val name = "models"

    val default: Set[ClimateModel] = ClimateModel.options

    val description: String =
      "A list of comma separated model names to filter the indicator by. The indicator values in the response will " +
        "only use the selected models. If not provided, defaults to all models."
    val required = false

    override def validate(input: String, scenario: Scenario): Validated[String, Models] = {
      val models = input.split(",").map(ClimateModel.unapply)
      if (models.contains(None)) {
        s"Invalid value for parameter $name".invalid
      } else {
        copy(value=Some(models.flatten.toSet)).valid
      }
    }
  }

  case class Percentile(value: Option[Int] = None) extends IndicatorParam[Int] {
    val name = "percentile"

    val default: Int = 50

    val description: String =
      "The percentile threshold used to determine the appropriate comparative level of an event or measurement. " +
        s"Must be an integer in the range [0,100]. Defaults to $default"
    val required = false

    override def validate(input: String, scenario: Scenario): Validated[String, Percentile] = {
      Try(input.toInt) match {
        case Success(num) if num >= 0 && num <= 100 => copy(value=Some(num)).valid
        case _ => s"Value for parameter $name is not an integer in the range 0 to 100".invalid
      }
    }
  }

  case class Threshold(value: Option[Double] = None) extends IndicatorParam[Double] {
    val name = "threshold"

    val default = 0.0

    val description: String =
      "Required. The value against which to compare climate data values in the unit specified by the 'threshold_units' parameter."
    val required = true

    override def validate(input: String, scenario: Scenario): Validated[String, Threshold] = {
      Try(input.toDouble).toOption.map(v => copy(value = Some(v))).toValid(s"Value for parameter $name is not a valid number")
    }
  }

  case class ThresholdUnits(units: List[String], value: Option[String] = None) extends IndicatorParam[String] {
    val name = "threshold_units"

    val default: String = ""

    val description: String =
      "Required. Units for the value of the 'threshold' parameter.  Must be a valid unit recognized by the API. " +
        s"Options: ${formatChoices(units)}"
    val required = true

    override def validate(input: String, scenario: Scenario): Validated[String, ThresholdUnits] = {
      Some(input).filter(units.contains).map(v => copy(value = Some(v))).toValid(s"Invalid value for parameter $name")
    }
  }

  case class ThresholdComparator(value: Option[String] = None) extends IndicatorParam[String] {
    private val choices = List("lt", "gt", "lte", "gte")
    val name            = "threshold_comparator"

    val default: String = ""

    val description: String =
      s"Required. The comparison type against the value of the 'threshold' parameter. Options: ${formatChoices(choices)}. " +
        "Signify: less than, greater than, less than or equals..."
    val required = true

    override def validate(input: String, scenario: Scenario): Validated[String, ThresholdComparator] = {
      Some(input).filter(choices.contains).map(v => copy(value = Some(v))).toValid(s"Invalid value for parameter $name")
    }
  }

  case class TimeAggregation(value: Option[String] = None) extends IndicatorParam[String] {
    private val choices = List("yearly", "monthly")
    val name            = "time_aggregation"

    val default = "yearly"

    val description: String =
      s"Time granularity to group data by for result structure. Options are ${formatChoices(choices)}. Defaults to 'yearly'."
    val required = false

    override def validate(input: String, scenario: Scenario): Validated[String, TimeAggregation] = {
      Some(input).filter(choices.contains).map(v => copy(value = Some(v))).toValid(s"Invalid value for parameter $name")
    }
  }

  case class Units(defaultUnits: String, units: List[String], value: Option[String] = None) extends IndicatorParam[String] {
    val name = "units"

    val default: String = defaultUnits

    val description: String =
      "Units in which to return the data. Defaults to Imperial units (Fahrenheit for temperature indicators and " +
        s"inches for precipitation). Options are ${formatChoices(units)}. Defaults to $default."
    val required = false

    override def validate(input: String, scenario: Scenario): Validated[String, Units] = {
      Some(input).filter(units.contains).map(v => copy(value = Some(v))).toValid(s"Invalid value for parameter $name")
    }
  }

  case class Years(value: Option[Seq[Range]] = None) extends IndicatorParam[Seq[Range]] {
    val name = "years"

    val default: Seq[Range] = List()

    val description: String =
      "A list of comma separated year ranges to filter the response by. Defaults to all years available. A year " +
        "range is of the form 'start[:end]'. Examples: '2010', '2010:2020', '2010:2020,2030', '2010:2020,2030:2040'"
    val required = false

    override def validate(input: String, scenario: Scenario): Validated[String, Years] = {
      val years = input.split(",").map(_.split(":"))
      val ranges = years
        .map {
          case year if year.length == 1 => Try(year.head.toInt to year.head.toInt).toOption
          case year if year.length == 2 => Try(year.head.toInt to year.last.toInt).toOption
          case _                        => None
        }
        .map {
          case Some(year) if scenario.years.containsSlice(year) =>
            Some(year)
          case _ => None
        }
      if (ranges.contains(None)) {
        s"Invalid value for parameter $name".invalid
      } else {
        copy(value=Some(ranges.flatten.toSeq)).valid
      }
    }
  }

  implicit val encodeIndicatorParamInt: Encoder[IndicatorParam[_]] =
    Encoder.forProduct3("name", "description", "required")(p => (p.name, p.description, p.required))
}
