package io.temperate.datamodel

import ca.mrvisser.sealerate
import io.circe.Encoder
import io.temperate.datamodel.IndicatorParam._
import io.temperate.datamodel.Operations.TimedDictionary

sealed trait Indicator extends Ordered[Indicator] {
  def name: String
  def label: String
  def description: String
  def variables: Set[Variable]
  def available_units: List[String]
  def default_units: String

  def box: Seq[TimedDictionary] => Seq[Double]

  def parameters: List[IndicatorParam] =
    List(Agg(),
         Datasets(),
         Models(),
         TimeAggregation(),
         Units(default_units, available_units),
         Years())
  def valid_aggregations = List("yearly", "quarterly", "monthly", "offset_yearly")

  def compare(that: Indicator): Int = { this.name.compare(that.name) }
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
  override val parameters = List(Agg(),
                                 Datasets(),
                                 Models(),
                                 Basetemp(),
                                 BasetempUnits(),
                                 TimeAggregation(),
                                 Units(default_units, available_units),
                                 Years())
}

sealed trait HistoricParams extends Indicator {
  override val parameters = List(Agg(),
                                 Datasets(),
                                 Models(),
                                 HistoricRange(),
                                 TimeAggregation(),
                                 Units(default_units, available_units),
                                 Years())
}

sealed trait PercentileParams extends Indicator {
  override val parameters = List(Agg(),
                                 Datasets(),
                                 Models(),
                                 Percentile(defaultPercentile = 50),
                                 TimeAggregation(),
                                 Units(default_units, available_units),
                                 Years())
}

sealed trait ThresholdParams extends Indicator {
  override val parameters = List(
    Agg(),
    Datasets(),
    Models(),
    Threshold(),
    ThresholdComparator(),
    ThresholdUnits(available_units),
    TimeAggregation(),
    Units(default_units, available_units),
    Years()
  )
}

object Indicator {
  case object AccumulatedFreezingDegreeDays extends Indicator with TemperatureUnits {
    val name  = "accumulated_freezing_degree_days"
    val label = "Accumulated Freezing Degree Days"

    val description =
      "Maximum cumulative total of differences in average daily temperature and freezing for consecutive days across the aggregation period."
    val variables: Set[Variable] = Set(Variable.TasMax, Variable.TasMin)

    def box = ???
  }

  case object AverageHighTemperature extends Indicator with TemperatureUnits {
    val name  = "average_high_temperature"
    val label = "Average High Temperature"

    val description =
      "Aggregated average high temperature, generated from daily data using all requested models."
    val variables: Set[Variable] = Set(Variable.TasMax)

    def box = Boxes.average(_ => true, Variable.TasMax.name)
  }

  case object AverageLowTemperature extends Indicator with TemperatureUnits {
    val name  = "average_low_temperature"
    val label = "Average Low Temperature"

    val description =
      "Aggregated average low temperature, generated from daily data using all requested models."
    val variables: Set[Variable] = Set(Variable.TasMin)

    def box = Boxes.average(_ => true, Variable.TasMin.name)
  }

  case object CoolingDegreeDays extends Indicator with TemperatureUnits with BasetempParams {
    val name  = "cooling_degree_days"
    val label = "Cooling Degree Days"

    val description =
      "Total difference of daily average temperature to a reference base temperature."
    val variables: Set[Variable] = Set(Variable.TasMax, Variable.TasMin)

    def box = ???
  }

  case object DiurnalTemperatureRange extends Indicator with TemperatureUnits {
    val name                     = "diurnal_temperature_range"
    val label                    = "Diurnal Temperature Range"
    val description              = "Average difference between daily max and daily min temperature."
    val variables: Set[Variable] = Set(Variable.TasMax, Variable.TasMin)

    def box = ???
  }

  case object DrySpells extends Indicator with CountedUnits {
    val name  = "dry_spells"
    val label = "Dry Spells"

    val description =
      "Total number of times per period that there are 5 or more consecutive days without precipitation."
    val variables: Set[Variable] = Set(Variable.Precip)

    def box = ???
  }

  case object ExtremeColdEvents extends Indicator with CountedUnits with HistoricParams {
    val name  = "extreme_cold_events"
    val label = "Extreme Cold Events"

    val description =
      "Total number of times per period daily minimum temperature is below the specified percentile of historic observations."
    val variables: Set[Variable] = Set(Variable.TasMin)

    def box = ???
  }

  case object ExtremeHeatEvents extends Indicator with CountedUnits with HistoricParams {
    val name  = "extreme_heat_events"
    val label = "Extreme Heat Events"

    val description =
      "Total number of times per period daily maximum temperature exceeds the specified percentile of historic observations."
    val variables: Set[Variable] = Set(Variable.TasMax)

    def box = ???
  }

  case object ExtremePrecipitationEvents extends Indicator with CountedUnits with HistoricParams {
    val name  = "extreme_precipitation_events"
    val label = "Extreme Precipitation Events"

    val description =
      "Total number of times per period daily average precipitation exceeds the specified percentile of historic observations."
    val variables: Set[Variable] = Set(Variable.TasMax)

    def box = ???
  }

  case object FrostDays extends Indicator with DaysUnits {
    val name  = "frost_days"
    val label = "Frost Days"

    val description =
      "Number of days per period in which the daily low temperature is below the freezing point of water."
    val variables: Set[Variable] = Set(Variable.TasMin)

    def box = ???
  }

  case object HeatingDegreeDays extends Indicator with TemperatureUnits with BasetempParams {
    val name  = "heating_degree_days"
    val label = "Heating Degree Days"

    val description =
      "Total difference of daily average temperature to a reference base temperature."
    val variables: Set[Variable] = Set(Variable.TasMax, Variable.TasMin)

    def box = ???
  }

  case object MaxConsecutiveDryDays extends Indicator with DaysUnits {
    val name                     = "max_consecutive_dry_days"
    val label                    = "Max Consecutive Dry Days"
    val description              = "Maximum number of consecutive days with no precipitation."
    val variables: Set[Variable] = Set(Variable.Precip)

    def box = ???
  }

  case object MaxHighTemperature extends Indicator with TemperatureUnits {
    val name  = "max_high_temperature"
    val label = "Maximum High Temperature"

    val description =
      "Maximum high temperature, generated from daily data using all requested models"
    val variables: Set[Variable] = Set(Variable.TasMax)

    def box = ???
  }

  case object MaxTemperatureThreshold extends Indicator with DaysUnits with ThresholdParams {
    val name  = "max_temperature_threshold"
    val label = "Max Temperature Threshold"

    val description =
      "Number of days where high temperature, generated from daily data using all requested models, fulfils the comparison"
    val variables: Set[Variable] = Set(Variable.TasMax)

    def box = ???
  }

  case object MinLowTemperature extends Indicator with TemperatureUnits {
    val name  = "min_low_temperature"
    val label = "Minimum Low Temperature"

    val description =
      "Minimum low temperature, generated from daily data using all requested models."
    val variables: Set[Variable] = Set(Variable.TasMin)

    def box = ???
  }

  case object MinTemperatureThreshold extends Indicator with DaysUnits with ThresholdParams {
    val name  = "min_temperature_threshold"
    val label = "Min Temperature Threshold"

    val description =
      "Number of days where low temperature, generated from daily data using all requested models, fulfils the comparison."
    val variables: Set[Variable] = Set(Variable.TasMin)

    def box = ???
  }

  case object PercentileLowTemperature
      extends Indicator
      with TemperatureUnits
      with PercentileParams {
    val name  = "percentile_low_temperature"
    val label = "Percentile Low Temperature"

    val description =
      "The specified percentile of low temperature for each timespan. Defaults to 50th percentile (Median)."
    val variables: Set[Variable] = Set(Variable.TasMin)

    def box = ???
  }

  case object PercentilePrecipitation
      extends Indicator
      with PrecipitationUnits
      with PercentileParams {
    val name  = "percentile_precipitation"
    val label = "Percentile Precipitation"

    val description =
      "The specified percentile of precipitation rate for each timespan. Defaults to 50th percentile (Median)."
    val variables: Set[Variable] = Set(Variable.Precip)

    def box = ???
  }

  case object PrecipitationThreshold extends Indicator with DaysUnits with ThresholdParams {
    val name  = "precipitation_threshold"
    val label = "Precipitation Threshold"

    val description =
      "Number of days where precipitation rate, generated from daily data using all requested models, fulfils the comparison."
    val variables: Set[Variable] = Set(Variable.Precip)

    def box = ???
  }

  case object TotalPrecipitation extends Indicator with PrecipitationUnits {
    val name                     = "total_precipitation"
    val label                    = "Total Precipitation"
    val description              = "Total Precipitation"
    val variables: Set[Variable] = Set(Variable.TasMin)

    def box = ???
  }

  def unapply(str: String): Option[Indicator] = Indicator.options.find(_.name == str)

  val options: Set[Indicator] = sealerate.collect[Indicator]

  implicit val encodeIndicator: Encoder[Indicator] =
    Encoder.forProduct8("name",
                        "label",
                        "description",
                        "valid_aggregations",
                        "variables",
                        "available_units",
                        "default_units",
                        "parameters")(
      i =>
        (i.name,
         i.label,
         i.description,
         i.valid_aggregations,
         i.variables.map(_.name),
         i.available_units,
         i.default_units,
         i.parameters))
}
