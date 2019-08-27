package io.temperate.datamodel

import java.time.LocalDate

import ca.mrvisser.sealerate
import io.circe.Encoder

sealed trait ClimateModel extends Ordered[ClimateModel] {
  def name: String
  def label: String                = name
  def base_time: Option[LocalDate] = None
  def datasets: Set[Dataset]       = Dataset.options.filter(d => d.models.map(_.name).contains(name))

  def compare(that: ClimateModel): Int = { this.name.toLowerCase.compare(that.name.toLowerCase) }
}

object ClimateModel {
  case object Access10     extends ClimateModel { val name = "ACCESS1-0"      }
  case object Access13     extends ClimateModel { val name = "ACCESS1-3"      }
  case object BccCsm11     extends ClimateModel { val name = "bcc-csm1-1"     }
  case object BccCsm11M    extends ClimateModel { val name = "bcc-csm1-1-m"   }
  case object BnuEsm       extends ClimateModel { val name = "BNU-ESM"        }
  case object CanEsm2      extends ClimateModel { val name = "CanESM2"        }
  case object Ccsm4        extends ClimateModel { val name = "CCSM4"          }
  case object Cesm1Bgc     extends ClimateModel { val name = "CESM1-BGC"      }
  case object Cesm1Cam5    extends ClimateModel { val name = "CESM1-CAM5"     }
  case object CmccCm       extends ClimateModel { val name = "CMCC-CM"        }
  case object CmccCms      extends ClimateModel { val name = "CMCC-CMS"       }
  case object CnrmCm5      extends ClimateModel { val name = "CNRM-CM5"       }
  case object CsiroMk360   extends ClimateModel { val name = "CSIRO-Mk3-6-0"  }
  case object EcEarth      extends ClimateModel { val name = "EC-EARTH"       }
  case object FGoalsG2     extends ClimateModel { val name = "FGOALS-g2"      }
  case object GfdlCm3      extends ClimateModel { val name = "GFDL-CM3"       }
  case object GfdlEsm2G    extends ClimateModel { val name = "GFDL-ESM2G"     }
  case object GfdlEsm2M    extends ClimateModel { val name = "GFDL-ESM2M"     }
  case object GissE2H      extends ClimateModel { val name = "GISS-E2-H"      }
  case object GissE2R      extends ClimateModel { val name = "GISS-E2-R"      }
  case object HadGem2Ao    extends ClimateModel { val name = "HadGEM2-AO"     }
  case object HadGem2Cc    extends ClimateModel { val name = "HadGEM2-CC"     }
  case object HadGem2Es    extends ClimateModel { val name = "HadGEM2-ES"     }
  case object Inmcm4       extends ClimateModel { val name = "inmcm4"         }
  case object IpslCm5ALr   extends ClimateModel { val name = "IPSL-CM5A-LR"   }
  case object IpslCm5AMr   extends ClimateModel { val name = "IPSL-CM5A-MR"   }
  case object Miroc5       extends ClimateModel { val name = "MIROC5"         }
  case object MirocEsm     extends ClimateModel { val name = "MIROC-ESM"      }
  case object MirocEsmChem extends ClimateModel { val name = "MIROC-ESM-CHEM" }
  case object MpiEsmLr     extends ClimateModel { val name = "MPI-ESM-LR"     }
  case object MpiEsmMr     extends ClimateModel { val name = "MPI-ESM-MR"     }
  case object MriCgcm3     extends ClimateModel { val name = "MRI-CGCM3"      }
  case object NorEsm1M     extends ClimateModel { val name = "NorESM1-M"      }

  def unapply(str: String): Option[ClimateModel] = options.find(_.name == str)

  val options: Set[ClimateModel] = sealerate.values[ClimateModel]

  implicit val encodeClimateModel: Encoder[ClimateModel] =
    Encoder.forProduct4("datasets", "name", "label", "base_time")(m =>
      (m.datasets.map(_.name), m.name, m.label, m.base_time.map(_.toString)))
}
