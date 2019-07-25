package io.temperate.datamodel

import java.net.URI

import ca.mrvisser.sealerate
import io.circe.Encoder
import io.temperate.datamodel.ClimateModel._

sealed trait Dataset extends Ordered[Dataset] {
  def name: String
  def label: String
  def description: String
  def url: URI

  def resolution: Double

  def models: Set[ClimateModel]

  def netCdfFileFor(model: String, scenario: Scenario, variable: Variable, year: String): URI

  def compare(that: Dataset): Int = { this.name.compare(that.name) }
}

object Dataset {
  case object Loca extends Dataset {
    val name: String  = "LOCA"
    val label: String = "Localized Constructed Analogs Downscaled Projections"

    val description
      : String = "The LOCA (Localized Constructed Analogs) dataset includes downscaled " +
      "projections from 32 global climate models calculated for two Representative Concentration Pathways (RCP 4.5 " +
      "and RCP 8.5). Each of the climate projections includes daily maximum temperature, minimum temperature, and " +
      "precipitation for every 6x6km (1/16th degree resolution) for the conterminous US from 1950 to 2100. LOCA " +
      "attempts to better preserve extreme hot days, heavy rain events and regional patterns of precipitation. The " +
      "total dataset size is approximately 10 TB."
    val url: URI           = URI.create("http://loca.ucsd.edu/")
    val resolution: Double = 0.0625

    val models: Set[ClimateModel] = Set[ClimateModel](
      Access10,
      Access13,
      BccCsm11,
      BccCsm11M,
      CanEsm2,
      Ccsm4,
      Cesm1Bgc,
      Cesm1Cam5,
      CmccCm,
      CmccCms,
      CnrmCm5,
      CsiroMk360,
      EcEarth,
      FGoalsG2,
      GfdlCm3,
      GfdlEsm2G,
      GfdlEsm2M,
      GissE2H,
      GissE2R,
      HadGem2Ao,
      HadGem2Cc,
      HadGem2Es,
      Inmcm4,
      IpslCm5ALr,
      IpslCm5AMr,
      Miroc5,
      MirocEsm,
      MirocEsmChem,
      MpiEsmLr,
      MpiEsmMr,
      MriCgcm3,
      NorEsm1M
    )

    def netCdfFileFor(model: String, scenario: Scenario, variable: Variable, year: String): URI = {
      val scenarioName = scenario.name.toLowerCase
      val variableName = variable.name.toLowerCase
      URI.create(
        s"https://nasanex.s3.amazonaws.com/LOCA/${model}/16th/${scenarioName}/r6i1p1/${variableName}/${variableName}_day_${model}_${scenarioName}_r6i1p1_${year}0101-${year}1231.LOCA_2016-04-02.16th.nc")
    }
  }

  case object NexGddp extends Dataset {
    val name: String  = "NEX-GDDP"
    val label: String = "Nasa Earth Exchange Global Daily Downscaled Projections"

    val description
      : String = "The NASA Earth Exchange (NEX) Global Daily Downscaled Projections (NEX-GDDP) " +
      "dataset is comprised of downscaled climate scenarios that are derived from the General Circulation Model " +
      "(GCM) runs conducted under the Coupled Model Intercomparison Project Phase 5 (CMIP5) [Taylor et al. 2012] and " +
      "across the two of the four greenhouse gas emissions scenarios known as Representative Concentration Pathways " +
      "(RCPs) [Meinshausen et al. 2011] developed for the Fifth Assessment Report of the Intergovernmental Panel on " +
      "Climate Change (IPCC AR5). The dataset is an ensemble of projections from 21 different models and two RCPs " +
      "(RCP 4.5 and RCP 8.5), and provides daily estimates of maximum and minimum temperatures and precipitation " +
      "using a daily Bias-Correction - Spatial Disaggregation (BCSD) method (Thrasher, et al., 2012). The data spans " +
      "the entire globe with a 0.25 degree (~25-kilometer) spatial resolution for the periods from 1950 through 2005 " +
      "(Historical) and from 2006 to 2100 (Climate Projections)."
    val url: URI           = URI.create("https://nex.nasa.gov/nex/projects/1356/")
    val resolution: Double = 0.25

    val models: Set[ClimateModel] = Set[ClimateModel](
      Access10,
      BccCsm11,
      BnuEsm,
      CanEsm2,
      Ccsm4,
      Cesm1Bgc,
      CnrmCm5,
      CsiroMk360,
      GfdlCm3,
      GfdlEsm2G,
      GfdlEsm2M,
      Inmcm4,
      IpslCm5ALr,
      IpslCm5AMr,
      Miroc5,
      MirocEsm,
      MirocEsmChem,
      MpiEsmLr,
      MpiEsmMr,
      MriCgcm3,
      NorEsm1M
    )

    def netCdfFileFor(model: String, scenario: Scenario, variable: Variable, year: String): URI =
      ???
  }

  def unapply(str: String): Option[Dataset] = options.find(_.name == str)

  val options: Set[Dataset] = sealerate.values[Dataset]

  implicit val encodeDataset: Encoder[Dataset] =
    Encoder.forProduct5("name", "label", "description", "url", "models")(d =>
      (d.name, d.label, d.description, d.url.toString, d.models.map(_.name)))
}
