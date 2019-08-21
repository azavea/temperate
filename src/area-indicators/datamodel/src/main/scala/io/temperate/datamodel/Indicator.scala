package io.temperate.datamodel

import java.time.ZonedDateTime

import ca.mrvisser.sealerate
import cats.Applicative
import cats.data.Validated._
import cats.data.{Validated, ValidatedNel}
import cats.implicits._
import io.circe.Encoder
import io.temperate.datamodel.IndicatorParam._
import io.temperate.datamodel.Operations.{Dictionary, TimedDictionary}

sealed trait Indicator extends Ordered[Indicator] {
  def name: String
  def label: String
  def description: String
  def variables: Set[Variable]
  def available_units: List[String]
  def default_units: String

  def datasets: Datasets
  def models: Models
  def timeAggregation: TimeAggregation
  def units: Units
  def years: Years

  def parameters: Set[IndicatorParam[_]] = Set(
    datasets,
     models,
     timeAggregation,
     units,
     years
  )

  protected def box(predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double]

  def compare(that: Indicator): Int = {
    this.name.compare(that.name)
  }

  def getBox: Seq[TimedDictionary] => Seq[Double] = {
    val predicate = getPredicate()
    box(predicate)
  }

  def validate(reqParams: Map[String, Seq[String]],
               scenario: Scenario): ValidatedNel[String, Indicator] = {
    val validReqParams = validateAllowedParams(reqParams) combine validateExtraValues(reqParams)
    val validIndicatorParams: ValidatedNel[String, List[IndicatorParam[_]]] = parameters.map { param =>
      reqParams.get(param.name) match {
        case Some(seq) => param.validate(seq.head, scenario).toValidatedNel
        case None => param.validNel
      }
    }.toList.sequence
    (validReqParams, validIndicatorParams).mapN((_, indicatorParams) => ???)
  }

  private def validateAllowedParams(reqParams: Map[String, _]) = {
    val unknownParams = reqParams.filterNot({ entry =>
      parameters.map(_.name).contains(entry._1)
    })
    if (unknownParams.isEmpty) {
      Valid()
    } else {
      "Unexpected parameter".invalidNel
    }
  }

  private def validateExtraValues(reqParams: Map[String, Seq[String]]) = {
    val extraVals = reqParams.filter { case (_, vals) => vals.length != 1 }
    if (extraVals.isEmpty) {
      Valid()
    } else {
      "Too many values provided for parameter".invalidNel
    }
  }

  private def getPredicate(): TimedDictionary => Boolean = { _ =>
    true
  }
}

sealed trait CountedUnits extends Indicator {
  val available_units = List("count")
  val default_units   = "count"
}

sealed trait DaysUnits extends Indicator {
  val available_units = List("days")
  val default_units   = "days"
}

sealed trait PrecipitationUnits extends Indicator {
  val available_units = List("kg/m^2/s", "mm/day", "in/day")
  val default_units   = "in/day"
}

sealed trait TemperatureUnits extends Indicator {
  val available_units = List("F", "C", "K")
  val default_units   = "F"
}

sealed trait BasetempParams extends Indicator {
  def basetemp: Basetemp
  def basetempUnits: BasetempUnits

  override val parameters: Set[IndicatorParam[_]] =
    Set(basetemp, basetempUnits, datasets, models, timeAggregation, units, years)
}

sealed trait PercentileParams extends Indicator {
  def percentile: Percentile

  override val parameters: Set[IndicatorParam[_]] =
    Set(datasets, models, percentile, timeAggregation, units, years)
}

sealed trait ThresholdParams extends Indicator {
  def threshold: Threshold
  def thresholdComparator: ThresholdComparator
  def thresholdUnits: ThresholdUnits

  override val parameters: Set[IndicatorParam[_]] =
    Set(datasets,
        models,
        timeAggregation,
        threshold,
        thresholdComparator,
        thresholdUnits,
        units,
        years)
}

object Indicator {

  case class AccumulatedFreezingDegreeDays(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits {
    val name  = "accumulated_freezing_degree_days"
    val label = "Accumulated Freezing Degree Days"

    val description =
      "Maximum cumulative total of differences in average daily temperature and freezing for consecutive days across the aggregation period."
    val variables: Set[Variable] = Set(Variable.TasMax, Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = {
      Boxes.accumulatedFreezingDegreeDays(predicate)
    }
  }

  case class AverageHighTemperature(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits {
    val name  = "average_high_temperature"
    val label = "Average High Temperature"

    val description =
      "Aggregated average high temperature, generated from daily data using all requested models."
    val variables: Set[Variable] = Set(Variable.TasMax)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = {
      Boxes.average(predicate, Variable.TasMax.name)
    }
  }

  case class AverageLowTemperature(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits {
    val name  = "average_low_temperature"
    val label = "Average Low Temperature"

    val description =
      "Aggregated average low temperature, generated from daily data using all requested models."
    val variables: Set[Variable] = Set(Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = {
      Boxes.average(predicate, Variable.TasMin.name)
    }
  }

  case class CoolingDegreeDays(
      basetemp: Basetemp = Basetemp(),
      basetempUnits: BasetempUnits = BasetempUnits(),
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits
      with BasetempParams {
    val name  = "cooling_degree_days"
    val label = "Cooling Degree Days"

    val description =
      "Total difference of daily average temperature to a reference base temperature."
    val variables: Set[Variable] = Set(Variable.TasMax, Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] =
      Boxes.degreeDays(predicate, basetemp.value.getOrElse(basetemp.default))
  }

  case class DiurnalTemperatureRange(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits {
    val name                     = "diurnal_temperature_range"
    val label                    = "Diurnal Temperature Range"
    val description              = "Average difference between daily max and daily min temperature."
    val variables: Set[Variable] = Set(Variable.TasMax, Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class DrySpells(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with CountedUnits {
    val name  = "dry_spells"
    val label = "Dry Spells"

    val description =
      "Total number of times per period that there are 5 or more consecutive days without precipitation."
    val variables: Set[Variable] = Set(Variable.Precip)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class FrostDays(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with DaysUnits {
    val name  = "frost_days"
    val label = "Frost Days"

    val description =
      "Number of days per period in which the daily low temperature is below the freezing point of water."
    val variables: Set[Variable] = Set(Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class HeatingDegreeDays(
      basetemp: Basetemp = Basetemp(),
      basetempUnits: BasetempUnits = BasetempUnits(),
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits
      with BasetempParams {
    val name  = "heating_degree_days"
    val label = "Heating Degree Days"

    val description =
      "Total difference of daily average temperature to a reference base temperature."
    val variables: Set[Variable] = Set(Variable.TasMax, Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class MaxConsecutiveDryDays(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with DaysUnits {
    val name                     = "max_consecutive_dry_days"
    val label                    = "Max Consecutive Dry Days"
    val description              = "Maximum number of consecutive days with no precipitation."
    val variables: Set[Variable] = Set(Variable.Precip)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class MaxHighTemperature(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits {
    val name  = "max_high_temperature"
    val label = "Maximum High Temperature"

    val description =
      "Maximum high temperature, generated from daily data using all requested models"
    val variables: Set[Variable] = Set(Variable.TasMax)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class MaxTemperatureThreshold(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      threshold: Threshold = Threshold(),
      thresholdComparator: ThresholdComparator = ThresholdComparator(),
      thresholdUnits: ThresholdUnits = ThresholdUnits(super.available_units),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with DaysUnits
      with ThresholdParams {
    val name  = "max_temperature_threshold"
    val label = "Max Temperature Threshold"

    val description =
      "Number of days where high temperature, generated from daily data using all requested models, fulfils the comparison"
    val variables: Set[Variable] = Set(Variable.TasMax)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class MinLowTemperature(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits {
    val name  = "min_low_temperature"
    val label = "Minimum Low Temperature"

    val description =
      "Minimum low temperature, generated from daily data using all requested models."
    val variables: Set[Variable] = Set(Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class MinTemperatureThreshold(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      threshold: Threshold = Threshold(),
      thresholdComparator: ThresholdComparator = ThresholdComparator(),
      thresholdUnits: ThresholdUnits = ThresholdUnits(super.available_units),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with DaysUnits
      with ThresholdParams {
    val name  = "min_temperature_threshold"
    val label = "Min Temperature Threshold"

    val description =
      "Number of days where low temperature, generated from daily data using all requested models, fulfils the comparison."
    val variables: Set[Variable] = Set(Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class PercentileLowTemperature(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      percentile: Percentile = Percentile(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with TemperatureUnits
      with PercentileParams {
    val name  = "percentile_low_temperature"
    val label = "Percentile Low Temperature"

    val description =
      "The specified percentile of low temperature for each timespan. Defaults to 50th percentile (Median)."
    val variables: Set[Variable] = Set(Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class PercentilePrecipitation(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      percentile: Percentile = Percentile(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with PrecipitationUnits
      with PercentileParams {
    val name  = "percentile_precipitation"
    val label = "Percentile Precipitation"

    val description =
      "The specified percentile of precipitation rate for each timespan. Defaults to 50th percentile (Median)."
    val variables: Set[Variable] = Set(Variable.Precip)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class PrecipitationThreshold(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      threshold: Threshold = Threshold(),
      thresholdComparator: ThresholdComparator = ThresholdComparator(),
      thresholdUnits: ThresholdUnits = ThresholdUnits(super.available_units),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with DaysUnits
      with ThresholdParams {
    val name  = "precipitation_threshold"
    val label = "Precipitation Threshold"

    val description =
      "Number of days where precipitation rate, generated from daily data using all requested models, fulfils the comparison."
    val variables: Set[Variable] = Set(Variable.Precip)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  case class TotalPrecipitation(
      datasets: Datasets = Datasets(),
      models: Models = Models(),
      timeAggregation: TimeAggregation = TimeAggregation(),
      units: Units = Units(super.default_units, super.available_units),
      years: Years = Years()
  ) extends Indicator
      with PrecipitationUnits {
    val name                     = "total_precipitation"
    val label                    = "Total Precipitation"
    val description              = "Total Precipitation"
    val variables: Set[Variable] = Set(Variable.TasMin)

    override protected def box(
        predicate: TimedDictionary => Boolean): Seq[TimedDictionary] => Seq[Double] = ???
  }

  def unapply(str: String): Option[Indicator] = Indicator.options.find(_.name == str)

  // values() doesn't like the mixin classes being part of the hierarchy, collect() will ignore them
  val options: Set[Indicator] = sealerate.collect[Indicator]

  implicit val encodeIndicator: Encoder[Indicator] =
    Encoder.forProduct7("name",
                        "label",
                        "description",
                        "variables",
                        "available_units",
                        "default_units",
                        "parameters")(
      i =>
        (i.name,
         i.label,
         i.description,
         i.variables.map(_.name),
         i.available_units,
         i.default_units,
         i.parameters.values.toList.sorted))
}
