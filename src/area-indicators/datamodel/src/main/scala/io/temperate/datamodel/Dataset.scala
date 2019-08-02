package io.temperate.datamodel

import java.net.URI

import ca.mrvisser.sealerate
import io.circe.Encoder
import geotrellis.proj4.{CRS, LatLng}
import geotrellis.raster.RasterExtent
import geotrellis.vector._
import _root_.io.temperate.datamodel.ClimateModel._
import _root_.io.temperate.datamodel.Scenario._

sealed trait Dataset extends Ordered[Dataset] {
  // Unique, computer readable identifier for this Dataset
  def name: String

  // Short human readable description for this Dataset
  def label: String

  // Long human readable description for this Dataset
  def description: String

  // URL to information about this Dataset
  def url: URI

  // The CRS of the data in the NetCDF files
  def crs: CRS

  // The extent of the data in the NetCDF files
  def extent: Extent

  // The size of the x dimension in the NetCDF files
  def xSize: Int

  // The size of the y dimension in the NetCDF files
  def ySize: Int

  def models: Set[ClimateModel]

  def compare(that: Dataset): Int = {
    this.name.compare(that.name)
  }

  def netCdfFileFor(model: ClimateModel, scenario: Scenario, variable: Variable, year: Int): URI

  def projectedExtent = ProjectedExtent(extent, crs)

  def gridPointForLatLng(point: Point): (Int, Int) = gridPointForLatLng(point.getX, point.getY)

  def gridPointForLatLng(lon: Double, lat: Double): (Int, Int)

  def latLngForGridPoint(x: Int, y: Int): (Double, Double)

  // Convert point to raster grid and back to align it to the grid cells
  def snapToGrid(point: Point): Point =
    Point((latLngForGridPoint _).tupled(gridPointForLatLng(point)))

  protected def rasterExtent = RasterExtent(extent, xSize, ySize)

  // The greatest common divisor for xSize and ySize
  // This is used downstream in order to construct TileLayouts that maintain a one-to-one mapping
  // of tile pixel to original NetCDF pixel. If we don't use integer divisions we potentially
  // introduce pixel interpolation of the original data.
  def pixelGcd: Int = {
    def gcd(a: Int, b: Int): Int = {
      if (b == 0) a else gcd(b, a % b)
    }
    gcd(xSize, ySize)
  }
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
    val url: URI = URI.create("http://loca.ucsd.edu/")
    val crs      = LatLng
    val extent   = Extent(-126.0, 23.4, -66.0, 54.0)
    val xSize    = 960
    val ySize    = 490

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

    // LOCA defines origin point at bottom left of two dimensional grid
    // e.g. both lon and lat dimensions increases as index does, rather than lat dimension decreasing
    def gridPointForLatLng(lon: Double, lat: Double): (Int, Int) = {
      val (x, y) = rasterExtent.mapToGrid(lon, lat)
      (x, ySize - y)
    }

    def latLngForGridPoint(x: Int, y: Int): (Double, Double) = {
      rasterExtent.gridToMap(x, ySize - y)
    }

    def netCdfFileFor(model: ClimateModel,
                      scenario: Scenario,
                      variable: Variable,
                      year: Int): URI = {
      val scenarioName = scenario.name.toLowerCase
      val variableName = variable.name.toLowerCase
      val ensembleName = ensemble(model, scenario)
      URI.create(
        s"s3://nasanex/LOCA/${model.name}/16th/${scenarioName}/${ensembleName}/${variableName}/${variableName}_day_${model.name}_${scenarioName}_${ensembleName}_${year.toString}0101-${year.toString}1231.LOCA_2016-04-02.16th.nc")
    }

    private def ensemble(model: ClimateModel, scenario: Scenario): String = {
      (scenario, model) match {
        case (RCP85, Ccsm4)   => "r6i1p1"
        case (RCP85, EcEarth) => "r2i1p1"
        case (RCP85, GissE2H) => "r2i1p1"
        case (RCP85, GissE2R) => "r2i1p1"

        case (RCP45, Ccsm4)   => "r6i1p1"
        case (RCP45, EcEarth) => "r8i1p1"
        case (RCP45, GissE2H) => "r6i1p3"
        case (RCP45, GissE2R) => "r6i1p1"

        case (Historical, Ccsm4)   => "r6i1p1"
        case (Historical, GissE2H) => "r6i1p1"
        case (Historical, GissE2R) => "r6i1p1"

        case _ => "r1i1p1"
      }
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
    val url: URI = URI.create("https://nex.nasa.gov/nex/projects/1356/")
    val crs      = LatLng
    val extent   = Extent(-180, -90, 180, 90)
    val xSize    = 1440
    val ySize    = 720

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

    override def gridPointForLatLng(lon: Double, lat: Double): (Int, Int) = ???

    override def latLngForGridPoint(x: Int, y: Int): (Double, Double) = ???

    def netCdfFileFor(model: ClimateModel,
                      scenario: Scenario,
                      variable: Variable,
                      year: Int): URI = {
      val scenarioName = scenario.name.toLowerCase
      val variableName = variable.name.toLowerCase
      URI.create(
        s"s3://nasanex/NEX-GDDP/BCSD/${scenarioName}/day/atmos/${variableName}/r1i1p1/v1.0/${variableName}_day_BCSD_${scenarioName}_r1i1p1_${model.name}_${year.toString}.nc")
    }
  }

  def unapply(str: String): Option[Dataset] = options.find(_.name == str)

  val options: Set[Dataset] = sealerate.values[Dataset]

  implicit val encodeDataset: Encoder[Dataset] =
    Encoder.forProduct5("name", "label", "description", "url", "models")(d =>
      (d.name, d.label, d.description, d.url.toString, d.models.map(_.name)))
}
