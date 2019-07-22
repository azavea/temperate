package io.temperate.datamodel

import java.net.URI

import ca.mrvisser.sealerate
import io.temperate.datamodel.ClimateModel._

sealed trait Dataset {
  def name: String
  def resolution: Double

  def models: Set[ClimateModel]

  def netCdfFileFor(model: String, scenario: Scenario, variable: Variable, year: String): URI
}

object Dataset {
  case object Loca extends Dataset {
    val name: String       = "LOCA"
    val resolution: Double = 0.0625

    val models = Set[ClimateModel](
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
    val name: String       = "nex-gddp"
    val resolution: Double = 0.25

    val models = Set[ClimateModel](
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
}
