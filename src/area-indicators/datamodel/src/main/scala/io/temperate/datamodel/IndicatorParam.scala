package io.temperate.datamodel

import cats.data.Validated._
import cats.data.ValidatedNel
import cats.implicits._
import io.circe.Encoder

import scala.util.Try

sealed trait IndicatorParam[T] {
  def name: String
  def default: T
  def description: String
  def required: Boolean

  def validate(input: String): Option[T]

  private var _value: Option[T]             = None
  protected var _scenario: Option[Scenario] = None
  def value: Option[T]                      = _value

  def setValue(input: String, scenario: Scenario): ValidatedNel[String, Unit] = {
    _scenario = Some(scenario)
    _value = validate(input)
    _value match {
      case Some(_) => Valid()
      case None    => s"Invalid value for parameter $name".invalidNel
    }
  }
}

object IndicatorParam {
  private def formatChoices[T](choices: List[T]) = {
    choices.init.map(opt => s"'$opt'").mkString(", ") + " and " + choices.last
  }

  case class Basetemp() extends IndicatorParam[Double] {
    val name = "basetemp"

    val default = 65.0

    val description: String =
      s"The base temperature used to calculate the daily difference for degree days summations. Defaults to $default. " +
        "See the 'basetemp_units' for a discussion of the units this value uses."
    val required = false

    override def validate(input: String): Option[Double] = Try(input.toDouble).toOption
  }

  case class BasetempUnits() extends IndicatorParam[String] {
    private val choices = List("C", "F", "K")

    val name = "basetemp_units"

    val default = "F"

    val description: String =
      s"Units for the value of the 'basetemp' parameter. Valid choices are ${formatChoices(choices)}. Defaults to '$default'."
    val required = false

    override def validate(input: String): Option[String] = Some(input).filter(choices.contains)
  }

  case class Datasets() extends IndicatorParam[Dataset] {
    val name = "dataset"

    val default: Dataset = Dataset.NexGddp

    val description: String =
      s"A single value defining which provider to use for raw climate data. If not provided, defaults to '${default.name}'."
    val required = false

    override def validate(input: String): Option[Dataset] = Some(input).flatMap(Dataset.unapply)
  }

  case class Models() extends IndicatorParam[Set[ClimateModel]] {
    val name = "models"

    val default: Set[ClimateModel] = ClimateModel.options

    val description: String =
      "A list of comma separated model names to filter the indicator by. The indicator values in the response will " +
        "only use the selected models. If not provided, defaults to all models."
    val required = false

    override def validate(input: String): Option[Set[ClimateModel]] = {
      val models = input.split(",").map(ClimateModel.unapply)
      if (models.contains(None)) {
        None
      } else {
        Some(models.flatten.toSet)
      }
    }
  }

  case class Percentile(defaultPercentile: Int) extends IndicatorParam[Int] {
    val name = "percentile"

    val default: Int = defaultPercentile

    val description: String =
      "The percentile threshold used to determine the appropriate comparative level of an event or measurement. " +
        s"Must be an integer in the range [0,100]. Defaults to $defaultPercentile"
    val required = false

    override def validate(input: String): Option[Int] = Try(input.toInt).toOption
  }

  case class Threshold() extends IndicatorParam[Double] {
    val name = "threshold"

    val default = 0.0

    val description: String =
      "Required. The value against which to compare climate data values in the unit specified by the 'threshold_units' parameter."
    val required = true

    override def validate(input: String): Option[Double] = Try(input.toDouble).toOption
  }

  case class ThresholdUnits(units: List[String]) extends IndicatorParam[String] {
    val name = "threshold_units"

    val default: String = ""

    val description: String =
      "Required. Units for the value of the 'threshold' parameter.  Must be a valid unit recognized by the API. " +
        s"Options: ${formatChoices(units)}"
    val required = true

    override def validate(input: String): Option[String] = Some(input).filter(units.contains)
  }

  case class ThresholdComparator() extends IndicatorParam[String] {
    private val choices = List("lt", "gt", "lte", "gte")
    val name            = "threshold_comparator"

    val default: String = ""

    val description: String =
      s"Required. The comparison type against the value of the 'threshold' parameter. Options: ${formatChoices(choices)}. " +
        "Signify: less than, greater than, less than or equals..."
    val required = true

    override def validate(input: String): Option[String] = Some(input).filter(choices.contains)
  }

  case class TimeAggregation() extends IndicatorParam[String] {
    private val choices = List("yearly", "monthly")
    val name            = "time_aggregation"

    val default = "yearly"

    val description: String =
      s"Time granularity to group data by for result structure. Options are ${formatChoices(choices)}. Defaults to 'yearly'."
    val required = false

    override def validate(input: String): Option[String] = Some(input).filter(choices.contains)
  }

  case class Units(defaultUnits: String, units: List[String]) extends IndicatorParam[String] {
    val name = "units"

    val default: String = defaultUnits

    val description: String =
      "Units in which to return the data. Defaults to Imperial units (Fahrenheit for temperature indicators and " +
        s"inches for precipitation). Defaults to $default"
    val required = false

    override def validate(input: String): Option[String] = Some(input).filter(units.contains)
  }

  case class Years() extends IndicatorParam[Seq[Range]] {
    val name = "years"

    val default: Seq[Range] = List()

    val description: String =
      "A list of comma separated year ranges to filter the response by. Defaults to all years available. A year " +
        "range is of the form 'start[:end]'. Examples: '2010', '2010:2020', '2010:2020,2030', '2010:2020,2030:2040'"
    val required = false

    override def validate(input: String): Option[Seq[Range]] = {
      val years = input.split(",").map(_.split(":"))
      val ranges = years
        .map {
          case year if year.length == 1 => Try(year.head.toInt to year.head.toInt).toOption
          case year if year.length == 2 => Try(year.head.toInt to year.last.toInt).toOption
          case _                        => None
        }
        .map {
          case Some(year) if _scenario.getOrElse(Scenario.RCP45).years.containsSlice(year) =>
            Some(year)
          case _ => None
        }
      if (ranges.contains(None)) {
        None
      } else {
        Some(ranges.flatten.toSeq)
      }
    }
  }

  implicit val encodeIndicatorParamInt: Encoder[IndicatorParam[_]] =
    Encoder.forProduct3("name", "description", "required")(p => (p.name, p.description, p.required))
}
